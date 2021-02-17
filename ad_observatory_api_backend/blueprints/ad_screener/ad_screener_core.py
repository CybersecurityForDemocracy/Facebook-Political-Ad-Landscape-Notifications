"""Ad Screener routes and methods specific to the app. NOTE: this sets a static path so that the
server serves the FE from that folder.
"""
from collections import defaultdict, namedtuple
import datetime
import io
import logging
from operator import itemgetter
import os
import os.path
import time

#  from authlib.integrations.flask_client import OAuth
import dhash
from flask import Blueprint, request, Response, url_for, redirect, abort
from flask_login import login_required, current_user
import humanize
from memoization import cached
from PIL import Image
import pybktree
import pycountry
import simplejson as json

import db_functions
from common import elastic_search, date_utils

blueprint = Blueprint('ad_screener_core', __name__, static_folder='static')

ArchiveIDAndSimHash = namedtuple('ArchiveIDAndSimHash', ['archive_id', 'sim_hash'])

FILTER_OPTIONS_DATA_DIR = 'data/'
REGION_FILTERS_DATA = json.load(open(os.path.join(FILTER_OPTIONS_DATA_DIR, 'regions.json')))
GENDER_FILTERS_DATA = json.load(open(os.path.join(FILTER_OPTIONS_DATA_DIR, 'genders.json')))
AGE_RANGE_FILTERS_DATA = json.load(open(os.path.join(FILTER_OPTIONS_DATA_DIR, 'ageRanges.json')))
RISK_SCORE_FILTERS_DATA = json.load(open(os.path.join(FILTER_OPTIONS_DATA_DIR, 'riskScores.json')))
ORDER_BY_FILTERS_DATA = json.load(open(os.path.join(FILTER_OPTIONS_DATA_DIR, 'orderBy.json')))
ORDER_DIRECTION_FILTERS_DATA = json.load(open(os.path.join(FILTER_OPTIONS_DATA_DIR,
                                                           'orderDirections.json')))

ALLOWED_ORDER_BY_FIELDS = set(['min_ad_delivery_start_time', 'max_last_active_date',
                               'min_ad_creation_time', 'max_ad_creation_time', 'min_spend_sum',
                               'max_spend_sum', 'min_impressions_sum', 'max_impressions_sum',
                               'cluster_size', 'num_pages'])
# TODO(macpd): Update these order_by values in FE.
ORDER_BY_FIELD_REWRITE_MAP = {
        'min_ad_creation_time': 'min_ad_delivery_start_time',
        'max_ad_creation_time': 'max_last_active_date',
        }
ALLOWD_ORDER_DIRECTIONS = set(['ASC', 'DESC'])

AD_SCREENSHOT_URL_TEMPLATE = (
    'https://storage.googleapis.com/facebook_ad_archive_screenshots/%(archive_id)s.png')

AD_SCREENER_REVERSE_IMAGE_SEARCH_NAME_TO_BIT_THRESHOLD = {
    'very high': 2,
    'high': 8,
    'medium': 16,
    'low': 24,
    'very low': 32}

LANGUAGE_CODE_TO_NAME_OVERRIDE_MAP = {
    'el': 'Modern Greek',
    'ne': 'Nepali',
    'sw': 'Swahili',
    'zh-cn': 'Chinese (Simplified)',
    'zh-tw': 'Chinese (Traditional)'
}

def get_image_dhash_as_int(image_file_stream):
    image_file = io.BytesIO(image_file_stream.read())
    image = Image.open(image_file)
    dhash.force_pil()
    return dhash.dhash_int(image)

@blueprint.route('/cluster')
@blueprint.route('/')
def index():
    if not current_user.is_authenticated:
        return redirect(url_for('ad_screener_authentication.login'))
    return blueprint.send_static_file('index.html')

def humanize_int(i):
    """Format numbers for easier readability. Numbers over 1 million are comma formatted, numbers
    over 1 million will be formatted like "1.2 million"

    Args:
        i: int to format.
    Returns:
        string of formatted number.
    """
    if i < 1000000:
        return humanize.intcomma(i)
    return humanize.intword(i)

def get_ad_cluster_label_name(db_connection, ad_cluster_id):
    db_interface = db_functions.AdScreenerDBInterface(db_connection)
    label_results = db_interface.retrieve_is_this_ad_problematic_label(current_user.get_id(),
                                                                       ad_cluster_id)

    if label_results is not None:
        return label_results['name']

    return None


def get_ad_cluster_record(db_connection, ad_cluster_data_row):
    ad_cluster_data = {}
    ad_cluster_data['ad_cluster_id'] = ad_cluster_data_row['ad_cluster_id']
    ad_cluster_data['canonical_archive_id'] = ad_cluster_data_row['canonical_archive_id']
    # Ad start/end dates are used for display only, never used for computation
    ad_cluster_data['start_date'] = ad_cluster_data_row['min_ad_delivery_start_time'].isoformat()
    ad_cluster_data['end_date'] = ad_cluster_data_row['max_last_active_date'].isoformat()

    # This is the total spend and impression for the ad across all demos/regions
    # Again, used for display and not computation
    # TODO(macpd): use correct currency symbol instead of assuming USD.
    min_spend_sum = ad_cluster_data_row['min_spend_sum']
    max_spend_sum = ad_cluster_data_row['max_spend_sum']
    ad_cluster_data['min_spend_sum'] = min_spend_sum
    ad_cluster_data['max_spend_sum'] = max_spend_sum
    ad_cluster_data['total_spend'] = '$%s - $%s' % (
        humanize_int(int(min_spend_sum)), humanize_int(int(max_spend_sum)))

    min_impressions_sum = ad_cluster_data_row['min_impressions_sum']
    max_impressions_sum = ad_cluster_data_row['max_impressions_sum']
    ad_cluster_data['min_impressions_sum'] = min_impressions_sum
    ad_cluster_data['max_impressions_sum'] = max_impressions_sum
    ad_cluster_data['total_impressions'] = '%s - %s' % (
        humanize_int(int(min_impressions_sum)), humanize_int(int(max_impressions_sum)))

    ad_cluster_data['url'] = (
        AD_SCREENSHOT_URL_TEMPLATE % {'archive_id': ad_cluster_data_row['canonical_archive_id']})
    ad_cluster_data['cluster_size'] = humanize_int(int(ad_cluster_data_row['cluster_size']))
    ad_cluster_data['num_pages'] = humanize_int(int(ad_cluster_data_row['num_pages']))
    ad_cluster_data['user_feedback_label_name'] = get_ad_cluster_label_name(
        db_connection, ad_cluster_data_row['ad_cluster_id'])

    return ad_cluster_data

def get_allowed_order_by_and_direction(order_by, direction):
    """Get |order_by| and |direction| which are valid and safe to send to AdsIfoDBInterface.
    Invalid args return None.
    """
    if not (order_by and direction):
        return None, None

    if order_by in ALLOWED_ORDER_BY_FIELDS and direction in ALLOWD_ORDER_DIRECTIONS:
        if order_by in ORDER_BY_FIELD_REWRITE_MAP:
            return ORDER_BY_FIELD_REWRITE_MAP[order_by], direction
        return order_by, direction

    return None, None

def get_ad_cluster_data_from_full_text_search(query, page_id, min_date, max_date, region, gender,
                                              age_group, language, order_by, order_direction, limit,
                                              offset):
    es_max_results = min(1000 * limit, 10000)
    query_results = elastic_search.query_elastic_search(
        cluster_url=elastic_search.DEFAULT_AD_SCREENER_ES_CLUSTER,
        ad_creative_query=query,
        max_results=es_max_results,
        page_id_query=page_id,
        ad_delivery_start_time=min_date,
        ad_delivery_stop_time=max_date,
        return_archive_ids_only=True)
    logging.debug('Full text search results: %s', query_results)
    archive_ids = query_results['data']
    logging.debug('Full text search returned %d archive_ids: %s', len(archive_ids), archive_ids)
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        # TODO(macpd): use the archive_ids from search results for screenshot cover photo.
        return db_interface.ad_cluster_details_for_archive_ids(archive_ids, min_date, max_date,
                                                               region, gender, age_group, language,
                                                               order_by, order_direction, limit,
                                                               offset)

def get_num_bits_different(archive_id_and_simhash1, archive_id_and_simhash2):
    return dhash.get_num_bits_different(archive_id_and_simhash1.sim_hash,
                                        archive_id_and_simhash2.sim_hash)

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def get_image_simhash_bktree():
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        simhash_to_archive_id_set = db_interface.all_ad_creative_image_simhashes()

    total_sim_hashes = len(simhash_to_archive_id_set)
    logging.info('Got %d image simhashes to process.', total_sim_hashes)

    # Create BKTree with dhash bit difference function as distance_function, used to find similar
    # hashes
    image_simhash_tree = pybktree.BKTree(get_num_bits_different)

    sim_hashes_added_to_tree = 0
    tree_construction_start_time = time.time()
    for sim_hash, archive_id_set in simhash_to_archive_id_set.items():
        # Add single entry in BK tree for simhash with lowest archive_id.
        image_simhash_tree.add(ArchiveIDAndSimHash(sim_hash=sim_hash,
                                                   archive_id=min(archive_id_set)))
        sim_hashes_added_to_tree += 1
        if sim_hashes_added_to_tree % 1000 == 0:
            logging.debug('Added %d/%d simhashes to BKtree.', sim_hashes_added_to_tree,
                          total_sim_hashes)
    logging.info('Constructed BKTree in %s seconds', (time.time() - tree_construction_start_time))
    return image_simhash_tree


@cached(ttl=date_utils.ONE_HOUR_IN_SECONDS)
def reverse_image_search(image_file_stream, bit_difference_threshold):
    image_dhash = get_image_dhash_as_int(image_file_stream)
    logging.info(
        'Got reverse_image_search request: %s bit_difference_threshold, file with dhash %x',
        bit_difference_threshold, image_dhash)
    image_simhash_tree = get_image_simhash_bktree()

    found = image_simhash_tree.find(ArchiveIDAndSimHash(sim_hash=image_dhash, archive_id=-1),
                                    bit_difference_threshold)
    logging.info('%d similar image archive IDs: %s', len(found), found)
    # BKTree.find returns tuples of form (bit difference, value). This extracts a set of all
    # archive IDs found.
    archive_ids = {x[1].archive_id for x in found}
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        return db_interface.ad_cluster_details_for_archive_ids(
                list(archive_ids), min_date=None, max_date=None, region=None, gender=None,
                age_group=None, language=None, order_by=None, order_direction=None)


@cached(ttl=date_utils.ONE_HOUR_IN_SECONDS)
def handle_ad_cluster_search(topic_id, min_date, max_date, gender, age_range, region, language,
                             order_by, order_direction, num_requested, offset,
                             full_text_search_query, page_id):
    if topic_id is not None and full_text_search_query is not None:
        abort(400, description='topic cannot be combined with full_text_search.')

    try:
        num_requested = int(num_requested)
    except ValueError:
        abort(400, description='numResults must be an integer')
    try:
        offset = int(offset)
    except ValueError:
        abort(400, description='offset must be an integer')

    if num_requested > 20 or offset > 1000:
        abort(400,
              description='numResults greater than 20, or offset greater than 1000, not allowed')


    # This date parsing is needed because the FE passes raw UTC formatted dates in Zulu time
    # We can simplify this by not sending the time at all from the FE. Then we strip the time info
    # and just take the date for simplicity.
    if min_date and max_date:
        try:
            min_date = datetime.datetime.strptime(
                min_date, "%Y-%m-%dT%H:%M:%S.%fZ").date()
        except ValueError:
            min_date = date_utils.parse_date_arg(min_date)

        try:
            max_date = datetime.datetime.strptime(
                max_date, "%Y-%m-%dT%H:%M:%S.%fZ").date()
        except ValueError:
            max_date = date_utils.parse_date_arg(max_date)

    if gender:
        if gender.lower() == 'all':
            gender = None
        elif gender.lower() == 'f':
            gender = 'female'
        elif gender.lower() == 'm':
            gender = 'male'
        elif gender.lower() == 'u':
            gender = 'unknown'
    if region and region.lower() == 'all':
        region = None
    if age_range and age_range.lower() == 'all':
        age_range = None
    if language and language.lower() == 'all':
        language = None

    if full_text_search_query:
        return get_ad_cluster_data_from_full_text_search(
            full_text_search_query, page_id=page_id, min_date=min_date, max_date=max_date,
            region=region, gender=gender, age_group=age_range, language=language, order_by=order_by,
            order_direction=order_direction, limit=num_requested, offset=offset)

    if page_id:
        with db_functions.get_ad_info_database_connection() as db_connection:
            db_interface = db_functions.AdsIfoDBInterface(db_connection)
            return db_interface.ad_cluster_details_for_page_id(
                page_id, min_date=min_date, max_date=max_date, region=region, gender=gender,
                age_group=age_range, language=language, order_by=order_by,
                order_direction=order_direction, limit=num_requested, offset=offset)

    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        return db_interface.topic_top_ad_clusters_by_spend(
            topic_id, min_date=min_date, max_date=max_date, region=region, gender=gender,
            age_group=age_range, language=language, order_by=order_by,
            order_direction=order_direction, limit=num_requested, offset=offset,
            min_topic_percentage_threshold=0.25)


@blueprint.route('/getads', methods=['GET', 'POST'])
@blueprint.route('/getands', methods=['GET', 'POST'])
def get_topic_top_ad():
    if request.method == 'POST':
        if 'reverse_image_search' not in request.files:
            abort(400, description='Client must provide a reverse_image_search file')

        requested_similarity = request.form.get('similarity', 'medium').lower()
        logging.debug('Reverse image search similarity: %s', requested_similarity)
        if requested_similarity not in AD_SCREENER_REVERSE_IMAGE_SEARCH_NAME_TO_BIT_THRESHOLD:
            abort(400, description='Invalid similarity value')

        bit_difference_threshold = AD_SCREENER_REVERSE_IMAGE_SEARCH_NAME_TO_BIT_THRESHOLD.get(
            requested_similarity)
        ad_cluster_data = reverse_image_search(request.files['reverse_image_search'],
                                               bit_difference_threshold=bit_difference_threshold)
    else:
        topic_id = request.args.get('topic', None)
        min_date = request.args.get('startDate', None)
        max_date = request.args.get('endDate', None)
        gender = request.args.get('gender', 'ALL')
        age_range = request.args.get('ageRange', 'ALL')
        region = request.args.get('region', 'All')
        order_by, order_direction = get_allowed_order_by_and_direction(
            request.args.get('orderBy', 'max_spend_sum'),
            request.args.get('orderDirection', 'DESC'))
        num_requested = request.args.get('numResults', 20)
        offset = request.args.get('offset', 0)
        full_text_search_query = request.args.get('full_text_search', None)
        page_id = request.args.get('page_id', None)
        language = request.args.get('language', None)

        ad_cluster_data = handle_ad_cluster_search(
            topic_id, min_date, max_date, gender, age_range, region, language, order_by,
            order_direction, num_requested, offset, full_text_search_query, page_id)

    ad_screener_db_connection = db_functions.get_ad_screener_database_connection()

    ret = {}
    for row in ad_cluster_data:
        ret[row['ad_cluster_id']] = get_ad_cluster_record(ad_screener_db_connection, row)

    return Response(json.dumps(list(ret.values())), mimetype='application/json')

def cluster_additional_ads(db_interface, ad_cluster_id):
    return list(db_interface.ad_cluster_archive_ids(ad_cluster_id))

def cluster_advertiser_info(db_interface, ad_cluster_id):
    advertiser_info = db_interface.ad_cluster_advertiser_info(ad_cluster_id)
    ret = []
    for row in advertiser_info:
        ret.append({'advertiser_type': row['page_type'], 'advertiser_party': row['party'],
                    'advertiser_fec_id': row['fec_id'], 'advertiser_webiste': row['page_url'],
                    'advertiser_risk_score': str(row['advertiser_score']),
                    'facebook_page_id': row['page_id'], 'facebook_page_name': row['page_name']})
    return ret

@blueprint.route('/getaddetails/<int:ad_cluster_id>')
@blueprint.route('/getanddetails/<int:ad_cluster_id>')
def get_ad_cluster_details(ad_cluster_id):
    response_data = cached_get_ad_cluster_details(ad_cluster_id)
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_get_ad_cluster_details(ad_cluster_id):
    db_connection = db_functions.get_ad_info_database_connection()
    db_interface = db_functions.AdsIfoDBInterface(db_connection)

    ad_cluster_data = defaultdict(list)
    ad_cluster_data['ad_cluster_id'] = ad_cluster_id
    region_impression_results = db_interface.ad_cluster_region_impression_results(ad_cluster_id)
    for row in region_impression_results:
        ad_cluster_data['region_impression_results'].append(
            {'region': row['region'],
             'min_spend': row['min_spend_sum'],
             'max_spend': row['max_spend_sum'],
             'min_impressions': row['min_impressions_sum'],
             'max_impressions': row['max_impressions_sum']})

    demo_impression_results = db_interface.ad_cluster_demo_impression_results(ad_cluster_id)
    for row in demo_impression_results:
        ad_cluster_data['demo_impression_results'].append({
            'age_group': row['age_group'],
            'gender': row['gender'],
            'min_spend': row['min_spend_sum'],
            'max_spend': row['max_spend_sum'],
            'min_impressions': row['min_impressions_sum'],
            'max_impressions': row['max_impressions_sum']})

    cluster_topics = db_interface.ad_cluster_topics(ad_cluster_id)
    if cluster_topics:
        ad_cluster_data['topics'] = ', '.join(cluster_topics)

    ad_cluster_data['advertiser_info'] = cluster_advertiser_info(db_interface, ad_cluster_id)
    ad_cluster_data['funding_entity'] = list(db_interface.ad_cluster_funder_names(ad_cluster_id))
    ad_cluster_metadata = db_interface.ad_cluster_metadata(ad_cluster_id)
    ad_cluster_data['min_spend_sum'] = ad_cluster_metadata['min_spend_sum']
    ad_cluster_data['max_spend_sum'] = ad_cluster_metadata['max_spend_sum']
    ad_cluster_data['min_impressions_sum'] = ad_cluster_metadata['min_impressions_sum']
    ad_cluster_data['max_impressions_sum'] = ad_cluster_metadata['max_impressions_sum']
    ad_cluster_data['cluster_size'] = ad_cluster_metadata['cluster_size']
    ad_cluster_data['num_pages'] = ad_cluster_metadata['num_pages']
    canonical_archive_id = ad_cluster_metadata['canonical_archive_id']
    ad_cluster_data['canonical_archive_id'] = canonical_archive_id
    ad_cluster_data['min_ad_creation_date'] = (
        ad_cluster_metadata['min_ad_delivery_start_time'].isoformat())
    ad_cluster_data['max_ad_creation_date'] = (
        ad_cluster_metadata['max_last_active_date'].isoformat())
    ad_cluster_data['url'] = (
        AD_SCREENSHOT_URL_TEMPLATE % {'archive_id': canonical_archive_id})
    ad_cluster_data['archive_ids'] = cluster_additional_ads(db_interface, ad_cluster_id)
    # These fields are generated by NYU and show up in the Metadata tab
    ad_cluster_data['type'] = ', '.join(db_interface.ad_cluster_types(ad_cluster_id))
    ad_cluster_data['entities'] = ', '.join(db_interface.ad_cluster_recognized_entities(
        ad_cluster_id))
    language_code_to_name = get_cluster_languages_code_to_name()
    ad_cluster_data['languages'] = [language_code_to_name.get(lang, None) for lang in
                                    db_interface.ad_cluster_languages(ad_cluster_id)]
    return json.dumps(ad_cluster_data)

@blueprint.route(
    '/ad-feedback/<int:ad_cluster_id>/set-label/<string:feedback_label>', methods=['POST'])
@login_required
def set_ad_feedback_label(ad_cluster_id, feedback_label):
    with db_functions.get_ad_info_database_connection() as ad_info_db_connection:
        cluster_archive_ids = cluster_additional_ads(
            db_functions.AdsIfoDBInterface(ad_info_db_connection),
            ad_cluster_id)
        if not cluster_archive_ids:
            abort(422)

    with db_functions.get_ad_screener_database_connection() as db_connection:
        db_interface = db_functions.AdScreenerDBInterface(db_connection)
        label_name_to_id = db_interface.is_this_ad_problematic_label_name_to_id()
        if feedback_label not in label_name_to_id:
            abort(422)

        db_interface.insert_is_this_ad_problematic_label(
            current_user.get_id(), ad_cluster_id, cluster_archive_ids,
            label_name_to_id[feedback_label])

    return {'ad_cluste_id': ad_cluster_id, 'feedback_label': feedback_label}

def get_topic_id_to_name_map():
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        return db_interface.topics()

def get_cluster_languages_code_to_name():
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        language_code_list = db_interface.cluster_languages()
    language_code_to_name = {}
    for language_code in language_code_list:
        if language_code in LANGUAGE_CODE_TO_NAME_OVERRIDE_MAP:
            language_code_to_name[language_code] = LANGUAGE_CODE_TO_NAME_OVERRIDE_MAP[language_code]
        else:
            try:
                language_code_to_name[language_code] = pycountry.languages.get(
                    alpha_2=language_code).name
            except AttributeError as err:
                logging.info('Unable to get langauge name for language code %s. error: %s',
                             language_code, err)
                language_code_to_name[language_code] = language_code
    return language_code_to_name

def get_language_filter_options():
    language_code_to_name = get_cluster_languages_code_to_name()
    language_filter_data = [{'label': 'All', 'value': 'all'}]
    # Add languages sorted by langauge name.
    for key, val in sorted(language_code_to_name.items(), key=itemgetter(1)):
        language_filter_data.append({'label': val, 'value': key})
    return language_filter_data

@blueprint.route('/filter-options')
def get_filter_options():
    return cached_get_filter_options()

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_get_filter_options():
    """Options for filtering. Used by FE to populate filter selectors."""
    topics_filter_data = [{'label': key, 'value': str(val)} for key, val in
                          get_topic_id_to_name_map().items()]
    return {'topics': topics_filter_data,
            'regions': REGION_FILTERS_DATA,
            'genders': GENDER_FILTERS_DATA,
            'ageRanges': AGE_RANGE_FILTERS_DATA,
            'orderByOptions': ORDER_BY_FILTERS_DATA,
            'orderDirections': ORDER_DIRECTION_FILTERS_DATA,
            'riskScores': RISK_SCORE_FILTERS_DATA,
            'languages': get_language_filter_options()}

@blueprint.route('/topics')
def topic_names():
    return cached_topic_names()

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_topic_names():
    return Response(
        json.dumps(list(get_topic_id_to_name_map().keys())), mimetype='application/json')

@blueprint.route('/archive-id/<int:archive_id>/cluster')
def get_cluster_details_from_archive_id(archive_id):
    db_connection = db_functions.get_ad_info_database_connection()
    db_interface = db_functions.AdsIfoDBInterface(db_connection)
    ad_cluster_id = db_interface.get_cluster_id_from_archive_id(archive_id)
    if ad_cluster_id is None:
        abort(404)
    return redirect(url_for('ad_screener_core.get_ad_cluster_details', ad_cluster_id=ad_cluster_id))

@blueprint.route('/insert-user-suggested-topic-name/<string:topic>', methods=['POST'])
def insert_topic_name(topic):
    with db_functions.get_ad_screener_database_connection() as db_connection:
        db_interface = db_functions.AdScreenerDBInterface(db_connection)
        db_interface.insert_topic_name_from_user(current_user.get_id(), topic)
    return {'topic':topic}

@blueprint.route(
    '/ad-topic-suggestion/<int:ad_cluster_id>/set-topic-and-comments', methods=['POST'])
@login_required
def suggest_ad_cluster_topics(ad_cluster_id):
    try:
        topics = request.json['topics']
        comment = request.json['comment']
        with db_functions.get_ad_info_database_connection() as ad_info_db_connection:
            cluster_archive_ids = cluster_additional_ads(
                db_functions.AdsIfoDBInterface(ad_info_db_connection),
                ad_cluster_id)
            if not cluster_archive_ids:
                abort(422)

        with db_functions.get_ad_screener_database_connection() as db_connection:
            db_interface = db_functions.AdScreenerDBInterface(db_connection)
            db_interface.insert_user_suggested_topic_for_ad_cluster(
                current_user.get_id(), ad_cluster_id, cluster_archive_ids,
                topics, comment)

        return {'ad_cluster_id': ad_cluster_id}
    except KeyError:
        return {'Error': 'KeyError for topics/comment'}

"""Ad Observatory API routes and methods specific to the API.
"""
import base64
import binascii
import datetime
import decimal
import itertools
import logging
from operator import itemgetter
import os
import os.path
import time
import requests

from flask import Blueprint, request, Response, url_for, redirect, abort
from flask_login import login_user, login_required, logout_user, current_user

import humanize
from memoization import cached
import numpy as np
import pandas as pd
import simplejson as json

import db_functions
from common import authentication, elastic_search, date_utils

URL_PREFIX = '/api/v1'

blueprint = Blueprint('ad_observatory_api', __name__)

# TODO (macpd): put these in a common module
SPEND_ESTIMATE_OLDEST_DATE = datetime.date(year=2020, month=6, day=22)
TOTAL_SPEND_OLDEST_ALLOWED_DATE = datetime.date(year=2020, month=7, day=1)

OBSCURE_OBSERVATION_COUNT_AT_OR_BELOW = 5
OBSCURE_OBSERVATION_COUNT_MESSAGE = '%s or less' % OBSCURE_OBSERVATION_COUNT_AT_OR_BELOW

def load_user(user_id):
    with db_functions.get_ad_observatory_api_user_database_connection() as db_connection:
        db_interface = db_functions.UserDatabaseInterface(db_connection)
        user = db_interface.get_user(user_id)
    if not user:
        return None
    # TODO (macpd): put user system type in DB or use different DB per system type
    return authentication.User(user_id=user['id'], username=user['username'],
                expires_at=user['session_expires_at'], access_token=user['access_token'],
                refresh_token=None, user_system_type=authentication.UserSystemType.AD_OBSERVATORY)

def get_api_key_from_request(req):
    """Get API key from api_key URL arg, or base64 encoded Authorization request header.

    Args:
        req: Flask.request from which to get the API key.
    Return:
        str API key if found, otherwise None.
    """
    api_key = req.args.get('api_key')
    if api_key:
        logging.debug('Got API key from URL arg: %s', api_key)
        return api_key

    auth_header_value = req.headers.get('Authorization')
    if auth_header_value:
        try:
            api_key = str(base64.b64decode(auth_header_value), encoding='utf-8')
            logging.debug('Got API key from base64 encoded Authorization header: %s', api_key)
        except (ValueError, binascii.Error) as error:
            logging.info('Unable to base64 decode Authorization header. %s', error)
            api_key = None

    return api_key

def load_api_user_from_request(api_request):
    """Get API user from api_key URL or Authorization header (base64 encoded) if present."""
    api_key = get_api_key_from_request(api_request)
    if not api_key:
        return None

    logging.info('Attempting to authenticate and authorize API key: %s', api_key)
    with db_functions.get_ad_observatory_api_user_database_connection() as db_connection:
        db_interface = db_functions.UserDatabaseInterface(db_connection)
        api_user_info = db_interface.get_api_key_user(api_key)
    if not api_user_info:
        logging.info('No user found for API key %s', api_key)

    logging.info('Got API key for API user ID: %s name: %s. is_active: %s',
                 api_user_info['id'],
                 api_user_info['name'],
                 api_user_info['is_active'])
    if api_user_info['is_active']:
        return authentication.User(
            user_id=api_key,
            username=api_user_info['name'],
            expires_at=datetime.datetime.max.timestamp(),
            access_token=None,
            refresh_token=None,
            user_system_type=authentication.UserSystemType.AD_OBSERVATORY)
    return None

@blueprint.route('/login')
@blueprint.route('/accounts/amazon-cognito/login/')
def login():
    aws_cognito_oauth = authentication.oauth.create_client(
        authentication.AD_OBSERVATORY_OAUTH_CLIENT_NAME)
    redirect_uri = url_for('ad_observatory_api.authorize', _external=True)
    logging.info('ad_observatory_api.authorize redirect_uri: %s', redirect_uri)
    return aws_cognito_oauth.authorize_redirect(redirect_uri)

@blueprint.route('/authorize')
def authorize():
    aws_cognito_oauth = authentication.oauth.create_client(
        authentication.AD_OBSERVATORY_OAUTH_CLIENT_NAME)
    token = aws_cognito_oauth.authorize_access_token()
    resp = aws_cognito_oauth.userinfo()

    expires_at = token['expires_at']
    access_token = token['access_token']
    refresh_token = token['refresh_token']
    username = resp['username']
    user_id = resp['sub']
    # TODO(macpd): move this to db_functions or authentication.py
    with db_functions.get_ad_observatory_api_user_database_connection() as db_connection:
        db_interface = db_functions.UserDatabaseInterface(db_connection)
        db_interface.upsert_user(user_id=user_id, username=username, session_expires_at=expires_at,
                                 access_token=access_token)

    user_obj = authentication.User(user_id, username, expires_at, access_token, refresh_token,
                                   user_system_type=authentication.UserSystemType.AD_SCREENER)

    duration = datetime.datetime.fromtimestamp(expires_at) - datetime.datetime.now()
    login_user(user_obj, duration=duration)

    return redirect(authentication.AD_OBSERVATORY_AUTHORIZATION_SUCCESS_REDIRECT_URL)

@blueprint.route("/logout")
@blueprint.route("/users/aws-logout/")
@login_required
def logout():
    logout_user()
    #  return redirect(url_for('.index'))

@blueprint.route('/user/access-token')
@login_required
def get_access_token():
    logging.info('user: %s', current_user)
    if not current_user.is_authenticated:
        abort(401)
    return json.dumps({'access-token': current_user.access_token})
    #  return Response(status=204, mimetype='application/json')
    #  return json.dumps({})

def get_default_end_date():
    # Spend from most recent 7 days is unreliable due to delay in Facebook accounting. So we only
    # report data starting more than 7 days ago.
    return datetime.date.today() - datetime.timedelta(days=7)

def parse_end_date_request_arg(end_date):
    if end_date:
        return date_utils.parse_date_arg(end_date)

    return get_default_end_date()

def parse_time_span_arg(arg_str):
    """Parse request arg as a time span and provide number of days in it.

    Accepts one of: 'week'/'month'/'quarter'.

    Args:
        arg_str: str request arg to parse.
    Returns:
        int number of days in the time period.
    """
    arg_to_days = {'week': 7, 'month': 30, 'quarter': '120'}

    return arg_to_days.get(arg_str, 0)

def get_active_days_in_range(
        range_start, range_end, ad_delivery_start_time_series, last_active_date_series):
    """Calculate the days an ad was active in a given range.

    Args:
        range_start: datetime.date Start of period of interest
        range_end: datetime.date  End of period of interest
        ad_delivery_start_time: pandas.Series[datetime.date] The date an ad started serving
        last_active_date: pandas.Series[datetime.date] The date the ad was last active
    Returns:
        pandas.Series[int] of days ads were active in the range of interest
    """
    def active_days_in_range(row):
        """Get days active in range. If ad_delivery_start_time -> last_active_date range does not
        overlap with range_start -> range_end, return 0.
        """
        ad_delivery_start_time = row['ad_delivery_start_time']
        last_active_date = row['last_active_date']
        if ad_delivery_start_time > range_end and last_active_date > range_end:
            return 0
        if ad_delivery_start_time < range_start and last_active_date < range_start:
            return 0
        min_date_in_range = min(max(ad_delivery_start_time, range_start), range_end)
        max_date_in_range = min(max(last_active_date, range_start), range_end)
        # add 1 to timedelta.days because we include both ad_delivery_start_time and last_active_day
        return (max_date_in_range - min_date_in_range).days + 1

    dates = pd.DataFrame(
            {'ad_delivery_start_time': ad_delivery_start_time_series,
             'last_active_date': last_active_date_series})

    days_in_range = dates.apply(active_days_in_range, axis=1)
    return days_in_range.replace([np.inf, -np.inf], 0).fillna(0)

def get_spend_per_day(ad_spend_records):
    """Calculate average spend per day over the life of an ad in a dataframe."""
    timedeltas = ad_spend_records['last_active_date'].sub(
        ad_spend_records['ad_delivery_start_time'])
    # add 1 to timedelta.days because we include both ad_delivery_start_time and last_active_day
    timedeltas = timedeltas.apply(lambda x: float(max(x.days + 1, 0)))
    # Divide by zero below is treated as +inf which we replace with 0
    spends = ad_spend_records['spend'].astype('float').div(timedeltas)
    return spends.replace([np.inf, -np.inf], 0).fillna(0)

@cached
def generate_time_periods(max_date, min_date, span_in_days=7):
    """Generate list of datetime.date span_in_days apart [max_date, min_date). Starting at max_date
    and working backwards.

    Args:
        max_date: datetime.date latest date from which to work backwards from. Included in list.
        min_date: datetime.date date which list should not pass. Only included in list if it occurs
            exactly N weeks from max_date.
        span_in_days: int number of days each span should be
    Returns:
        list of datetime.dates starting with max_date and all dates 7 days apart after that until
        min_date.
    """
    def date_n_days_ago(days):
        return max_date - datetime.timedelta(days=days)
    return list(
        itertools.takewhile(
            lambda x: x >= min_date, map(date_n_days_ago, range(0, 365, span_in_days))))

@blueprint.route('/total_spend/by_page/of_region/<region_name>')
def get_top_spenders_for_region(region_name):
    start_date = date_utils.parse_date_arg(request.args.get('start_date', '2020-06-02'),
                          oldest_allowed_date=TOTAL_SPEND_OLDEST_ALLOWED_DATE)
    end_date = parse_end_date_request_arg(request.args.get('end_date', None))

    response_data = cached_get_top_spenders_for_region(region_name, start_date, end_date)
    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_get_top_spenders_for_region(region_name, start_date, end_date):
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)

        results = db_interface.get_spender_for_region(region_name, start_date, end_date)
    if results is None:
        return None
    return json.dumps({'spenders': results.results,
                       'region_name': region_name,
                       'start_date': results.start_date.isoformat(),
                       'end_date': results.end_date.isoformat(),
                      })

@blueprint.route('/total_spend/of_page/<int:page_id>/of_region/<region_name>')
def get_total_spending_by_spender_in_region_since_date(page_id, region_name):
    start_date = date_utils.parse_date_arg(request.args.get('start_date', '2020-06-02'),
                                oldest_allowed_date=TOTAL_SPEND_OLDEST_ALLOWED_DATE)
    end_date = parse_end_date_request_arg(request.args.get('end_date', None))
    raw_page_id_query = bool(request.args.get('raw_page_id_query', False))
    if not start_date:
        abort(400)
    response_data = cached_total_spending_by_spender_in_region_since_date(
        page_id, region_name, start_date, end_date, raw_page_id_query)
    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_total_spending_by_spender_in_region_since_date(page_id, region_name, start_date,
                                                          end_date, raw_page_id_query):
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        if raw_page_id_query:
            results = db_interface.page_spend_in_region_since_date_raw_page_id_query(
                page_id, region_name, start_date, end_date)
        else:
            results = db_interface.page_spend_in_region_since_date(
                page_id, region_name, start_date, end_date)

    if not results:
        return None

    page_name = results.results[0]['page_name']

    return json.dumps(
        {'start_date': results.start_date.isoformat(),
         'end_date': results.end_date.isoformat(),
         'page_id': page_id,
         'page_name': page_name,
         'region_name': region_name,
         'spenders': results.results})

@blueprint.route('/spend_by_time_period/of_page/<int:page_owner>/of_region/<region_name>')
def spending_by_week_by_spender_of_region(page_owner, region_name):
    start_date = date_utils.parse_date_arg(request.args.get('start_date', '2020-06-01'),
                                oldest_allowed_date=SPEND_ESTIMATE_OLDEST_DATE)
    if not start_date:
        abort(400)
    end_date = parse_end_date_request_arg(request.args.get('end_date', None))
    response_data = cached_spending_by_week_by_spender_of_region(page_owner, region_name,
                                                                 start_date, end_date)
    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_spending_by_week_by_spender_of_region(page_owner, region_name, start_date, end_date):
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        if not end_date:
            end_date = db_interface.page_and_region_latest_last_7_days_report_date(
                page_owner, region_name)
            if not end_date:
                return None
        weeks = generate_time_periods(
            max_date=end_date, min_date=start_date, span_in_days=7)
        page_spend_by_week = db_interface.page_spend_in_region_by_week(
            page_owner, region_name, weeks=weeks)
        page_name = db_interface.page_owner_page_name(page_owner)

    if not page_spend_by_week:
        return None

    spend_by_week = []
    disclaimers = set()
    for row in page_spend_by_week:
        spend_by_week.append(
            {'week': row['report_date'].isoformat(), 'spend': row['spend']})
        disclaimers.update(set(row['disclaimers']))

    # Fill in missing time periods with spend of 0
    all_weeks_isoformat = {week.isoformat() for week in weeks if week < datetime.date.today()}
    weeks_with_spend = {row['week'] for row in spend_by_week}
    weeks_without_spend = all_weeks_isoformat - weeks_with_spend
    for week in weeks_without_spend:
        spend_by_week.append({'week': week, 'spend': 0.0})
    spend_by_week.sort(key=lambda x: x.get('week'))

    return json.dumps(
        {'time_unit': 'week',
         'date_range': [min(weeks).isoformat(), max(weeks).isoformat()],
         'page_id': page_owner,
         'spend_by_week': spend_by_week,
         'region_name': region_name,
         'page_name': page_name,
         'disclaimers': list(disclaimers)})

def discount_spend_outside_daterange(start_date, end_date, ad_spend_records):
    for ad_spend in ad_spend_records:
        ad_delivery_start_time = ad_spend['ad_delivery_start_time']
        last_active_date = ad_spend['last_active_date']
        if ad_delivery_start_time >= start_date and last_active_date <= end_date:
            # ad active only active within timerange of concern. No discounting required.
            continue

        days_in_range = (
            min(last_active_date, end_date) - max(start_date, ad_delivery_start_time)).days
        days_ad_active = (last_active_date  - ad_delivery_start_time).days

        if days_ad_active == 0:
            days_ad_active = 1

        if ad_spend['spend'] is None:
            ad_spend['spend'] = 0
        else:
            ad_spend['spend'] = ad_spend['spend'] * days_in_range/days_ad_active
    return ad_spend_records

@blueprint.route('/total_spend/by_page/of_topic/<path:topic_name>/of_region/<region_name>')
def get_spenders_for_topic_in_region(topic_name, region_name):
    record_count = int(request.args.get('count', '10'))
    start_date = date_utils.parse_date_arg(request.args.get('start_date', '2020-06-22'),
                                oldest_allowed_date=TOTAL_SPEND_OLDEST_ALLOWED_DATE)
    if not start_date:
        abort(400)
    end_date = parse_end_date_request_arg(request.args.get('end_date', None))
    response_data = spenders_for_topic_in_region(
        topic_name, region_name, start_date, end_date, max_records=record_count)
    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def spenders_for_topic_in_region(topic_name, region_name, start_date, end_date, max_records=None):
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        topics = db_interface.topics()
        topic_id = topics.get(topic_name, -1)
        if topic_id < 0:
            abort(404)
        ad_spend_records = db_interface.total_spend_by_page_of_topic_in_region(
            region_name, start_date, end_date, topic_id)
    if ad_spend_records is None:
        return None
    discounted_spend_records = discount_spend_outside_daterange(start_date, end_date,
                                                                ad_spend_records)
    spend_data = pd.DataFrame.from_records(
        discounted_spend_records, exclude=['last_active_date', 'ad_delivery_start_time'])
    spend_data = spend_data.groupby('page_id', as_index=False).agg(
        {'page_name':'min', 'spend':'sum'})
    sorted_spend_data = spend_data.sort_values(by='spend', ascending=False)

    if max_records:
        sorted_spend_data = sorted_spend_data.head(max_records)
    return json.dumps({
        'spenders': sorted_spend_data.to_dict('records'),
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'topic_name': topic_name,
        'region_name': region_name})

@blueprint.route('/total_spend/by_topic/of_region/<region_name>')
def top_topics_in_region(region_name):
    start_date = date_utils.parse_date_arg(request.args.get('start_date', '2020-06-22'),
                                oldest_allowed_date=TOTAL_SPEND_OLDEST_ALLOWED_DATE)
    if not start_date:
        abort(400)
    end_date = parse_end_date_request_arg(request.args.get('end_date', None))
    response_data = top_topic_in_region(region_name, start_date, end_date)
    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def top_topic_in_region(region_name, start_date, end_date, max_records=None):
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        topic_map = db_interface.topic_id_to_name_map()
        ad_spend_records = db_interface.get_spend_for_topics_in_region(region_name, start_date,
                                                                       end_date)
    if not ad_spend_records:
        return None
    discounted_spend_records = discount_spend_outside_daterange(start_date, end_date,
                                                                ad_spend_records)
    spend_data = pd.DataFrame.from_records(
        discounted_spend_records, exclude=['last_active_date', 'ad_delivery_start_time'])
    spend_data = spend_data.groupby('topic_id', as_index=False).agg({'spend':'sum'})
    spend_data['topic_name'] = spend_data['topic_id'].map(topic_map)
    spend_data = spend_data.drop(columns=['topic_id'])
    sorted_spend_data = spend_data.sort_values(by='spend', ascending=False)

    if max_records:
        sorted_spend_data = sorted_spend_data.head(max_records)
    return json.dumps({
        'spend_by_topic': sorted_spend_data.to_dict('records'),
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'region_name': region_name})

@blueprint.route('/spend_by_time_period/of_topic/<path:topic_name>/of_region/<region_name>')
def spend_by_week_for_topic(topic_name, region_name):
    start_date = date_utils.parse_date_arg(request.args.get('start_date', '2020-06-22'),
                                oldest_allowed_date=SPEND_ESTIMATE_OLDEST_DATE)
    time_period_unit = request.args.get('time_unit', 'week')
    time_period_length = parse_time_span_arg(time_period_unit)
    if not start_date or not time_period_length:
        abort(400)
    end_date = parse_end_date_request_arg(request.args.get('end_date', None))
    response_data = cached_spend_by_week_for_topic(topic_name, region_name, start_date, end_date,
                                                   time_period_unit, time_period_length)
    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_spend_by_week_for_topic(topic_name, region_name, start_date, end_date, time_period_unit,
                                   time_period_length):

    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        topics = db_interface.topics()
        ad_spend_records = db_interface.total_spend_of_topic_in_region(
            region_name, start_date, end_date, topics[topic_name])
    if ad_spend_records is None:
        return None

    periods = generate_time_periods(
        max_date=end_date, min_date=start_date, span_in_days=time_period_length)

    ad_spend_data = pd.DataFrame.from_records(ad_spend_records)

    # Clean up None values
    ad_spend_data['last_active_date'] = ad_spend_data['last_active_date'].apply(
        lambda x: x if x else datetime.date.today()+datetime.timedelta(days=1))

    #  ad_spend_data['spend_per_day'] = get_spend_per_day(ad_spend_data)
    for i in range(len(periods)-1):
        period_end_date = periods[i]
        period_start_date = periods[i+1] + datetime.timedelta(days=1)
        ad_spend_data[period_end_date] = (
            ad_spend_data['spend_per_day'] * get_active_days_in_range(
                period_start_date, period_end_date,
                ad_spend_data['ad_delivery_start_time'],
                ad_spend_data['last_active_date']))
    ad_spend_data = ad_spend_data.drop(columns=[
        'last_active_date',
        'ad_delivery_start_time',
        'spend_per_day',
        'spend'])
    spend_in_timeperiod = {}
    for date, amount in ad_spend_data.sum(axis=0).to_dict().items():
        spend_in_timeperiod[date.isoformat()] = int(amount)
    result = {
        'spend_in_timeperiod': spend_in_timeperiod,
        'time_unit': time_period_unit,
        'start_date': min(periods).isoformat(),
        'end_date': max(periods).isoformat(),
        'topic_name': topic_name,
        'region_name': region_name,}

    return json.dumps(result)

def assign_spend_to_timewindows(weeks_list, grouping_name, spend_query_result):
    result = {}
    #setup week windows
    day_to_week_window = {}
    counter = 0
    for week in weeks_list:
        week_days = pd.date_range(start=week, periods=7)
        for date in week_days:
            day_to_week_window[date.date()] = counter

        counter += 1


    for row in spend_query_result:
        grouping = row[grouping_name]
        spend_start = row['start_day']
        spend_end = row['end_day']
        spend = 0
        if row['spend']:
            spend = row['spend']

        run_days = spend_end - spend_start
        run_days = run_days.days + 1
        if run_days < 1:
            run_days = 1

        spend_per_day = decimal.Decimal(spend / run_days)
        date_list = pd.date_range(start=spend_start, end=spend_end)
        for spend_day in date_list:
            if spend_day.date() in day_to_week_window:
                spend_week = weeks_list[day_to_week_window[spend_day.date()]]
                if grouping in result:
                    week_found = False
                    for tps in result[grouping]:
                        if spend_week.isoformat() == tps['time_period']:
                            tps['spend'] += spend_per_day
                            week_found = True

                    if not week_found:
                        result[grouping].append(
                            {'time_period':spend_week.isoformat(), 'spend':spend_per_day})

                else:
                    time_period_dict = {'time_period':spend_week.isoformat(),
                                        'spend':spend_per_day}
                    result[grouping] = [time_period_dict]

    # Fill in time periods where spend is not present in query results. Exclude today's date since
    # our pipeline does not yet include data collected today.
    week_list_isoformat = {week.isoformat() for week in weeks_list if week < datetime.date.today()}
    for grouping in result:
        missing_weeks = week_list_isoformat - {row['time_period'] for row in result[grouping]}
        result[grouping].extend([{'time_period': week, 'spend': 0} for week in missing_weeks])
        result[grouping].sort(key=lambda x: x.get('time_period'))
    return result

@blueprint.route('/spend_by_time_period/by_topic/of_page/<int:page_owner>')
def spend_by_time_period_by_topic_of_page(page_owner):
    start_date = date_utils.parse_date_arg(request.args.get('start_date', '2020-06-23'),
                                oldest_allowed_date=SPEND_ESTIMATE_OLDEST_DATE)
    if not start_date:
        abort(400)
    end_date = parse_end_date_request_arg(request.args.get('end_date', None))
    response_data = cached_spend_by_time_period_by_topic_of_page(page_owner, start_date, end_date)
    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_spend_by_time_period_by_topic_of_page(page_owner, start_date, end_date):
    #TODO(LAE):read this parameter instead of hardcoding when this can be tested
    #time_unit = request.args.get('time_unit', 'week')
    time_unit = 'week'

    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        page_spend_over_time = db_interface.page_spend_by_topic_since_date(
            page_owner, start_date, end_date)
        page_name = db_interface.page_owner_page_name(page_owner)
    if not page_spend_over_time:
        return None

    weeks = generate_time_periods(max_date=end_date, min_date=start_date, span_in_days=7)

    spend_by_time_period = assign_spend_to_timewindows(weeks, 'topic_name', page_spend_over_time)

    return json.dumps(
        {'time_unit': time_unit,
         'date_range': [min(weeks).isoformat(), max(weeks).isoformat()],
         'page_id': page_owner,
         'page_name': page_name,
         'spend_by_time_period': spend_by_time_period})

@blueprint.route('/spend_by_time_period/by_topic/of_page/<int:page_owner>/of_region/<region_name>')
def spend_by_time_period_by_topic_of_page_in_region(page_owner, region_name):
    start_date = date_utils.parse_date_arg(request.args.get('start_date', '2020-06-23'),
                                oldest_allowed_date=SPEND_ESTIMATE_OLDEST_DATE)
    end_date = parse_end_date_request_arg(request.args.get('end_date', None))

    if not start_date:
        abort(400)
    response_data = cached_spend_by_time_period_by_topic_of_page_in_region(page_owner, region_name,
                                                                           start_date, end_date)
    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_spend_by_time_period_by_topic_of_page_in_region(page_owner, region_name, start_date,
                                                           end_date):
    #TODO(LAE):read this parameter instead of hardcoding when this can be tested
    #time_unit = request.args.get('time_unit', 'week')
    time_unit = 'week'

    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        page_spend_over_time = db_interface.spend_by_topic_of_page_in_region(
            page_owner, region_name, start_date, end_date)
        page_name = db_interface.page_owner_page_name(page_owner)
    if not page_spend_over_time:
        return None

    # Get max end_day from results.
    max_end_day = max(map(itemgetter('end_day'), page_spend_over_time))
    max_end_day = min(max_end_day, end_date)

    weeks = generate_time_periods(max_date=max_end_day, min_date=start_date,
                                  span_in_days=7)

    spend_by_time_period = assign_spend_to_timewindows(weeks, 'topic_name', page_spend_over_time)

    return json.dumps(
        {'time_unit': time_unit,
         'date_range': [min(weeks).isoformat(), max(weeks).isoformat()],
         'page_id': page_owner,
         'page_name': page_name,
         'region_name': region_name,
         'spend_by_time_period': spend_by_time_period})

@blueprint.route('/total_spend/by_purpose/of_page/<int:page_owner>')
def total_spend_by_purpose_of_page(page_owner):
    start_date = date_utils.parse_date_arg(request.args.get('start_date', '2020-06-23'),
                                oldest_allowed_date=TOTAL_SPEND_OLDEST_ALLOWED_DATE)
    end_date = parse_end_date_request_arg(request.args.get('end_date', None))

    if not start_date:
        abort(400)
    response_data = cached_total_spend_by_purpose_of_page(page_owner, start_date, end_date)
    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_total_spend_by_purpose_of_page(page_owner, start_date, end_date):
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        total_page_spend_by_type = db_interface.total_page_spend_by_type(page_owner, start_date,
                                                                         end_date)
        page_name = db_interface.page_owner_page_name(page_owner)

    return json.dumps(
        {'start_date': start_date.isoformat(),
         'end_date': end_date.isoformat(),
         'page_id': page_owner,
         'page_name': page_name,
         'spend_by_purpose': total_page_spend_by_type})

@blueprint.route('/total_spend/by_purpose/of_region/<region_name>')
def total_spend_by_purpose_of_region(region_name):
    start_date = date_utils.parse_date_arg(request.args.get('start_date', '2020-06-23'),
                                oldest_allowed_date=TOTAL_SPEND_OLDEST_ALLOWED_DATE)
    end_date = parse_end_date_request_arg(request.args.get('end_date', None))

    if not start_date:
        abort(400)
    response_data = cached_total_spend_by_purpose_of_region(region_name, start_date, end_date)
    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_total_spend_by_purpose_of_region(region_name, start_date, end_date):
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        total_spend_by_type_in_region = db_interface.total_spend_by_type_in_region(
            region_name, start_date, end_date)

    return json.dumps(
        {'start_date': start_date.isoformat(),
         'end_date': end_date.isoformat(),
         'region_name': region_name,
         'spend_by_purpose': total_spend_by_type_in_region})

@blueprint.route('/total_spend/by_purpose/of_page/<int:page_owner>/of_region/<region_name>')
def total_spend_by_purpose_of_page_of_region(page_owner, region_name):
    start_date = date_utils.parse_date_arg(request.args.get('start_date', '2020-06-23'),
                                oldest_allowed_date=TOTAL_SPEND_OLDEST_ALLOWED_DATE)
    end_date = parse_end_date_request_arg(request.args.get('end_date', None))

    if not start_date:
        abort(400)
    response_data = cached_total_spend_by_purpose_of_page_of_region(
        page_owner, region_name, start_date, end_date)
    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_total_spend_by_purpose_of_page_of_region(page_owner, region_name, start_date, end_date):
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        total_page_spend_by_type = db_interface.total_spend_by_purpose_of_page_of_region(
                page_owner, region_name, start_date, end_date)
        page_name = db_interface.page_owner_page_name(page_owner)

    return json.dumps(
        {'start_date': start_date.isoformat(),
         'end_date': end_date.isoformat(),
         'page_id': page_owner,
         'page_name': page_name,
         'region_name': region_name,
         'spend_by_purpose': total_page_spend_by_type})

@blueprint.route(
    '/spend_by_time_period/by_purpose/of_page/<int:page_owner>/of_region/<region_name>')
def spend_by_time_period_by_purpose_of_page_in_region(page_owner, region_name):
    start_date = date_utils.parse_date_arg(request.args.get('start_date', '2020-06-23'),
                                oldest_allowed_date=SPEND_ESTIMATE_OLDEST_DATE)
    end_date = parse_end_date_request_arg(request.args.get('end_date', None))

    if not start_date:
        abort(400)
    response_data = cached_spend_by_time_period_by_purpose_of_page_in_region(
        page_owner, region_name, start_date, end_date)

    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_spend_by_time_period_by_purpose_of_page_in_region(page_owner, region_name, start_date,
                                                             end_date):
    #TODO(LAE):read this parameter instead of hardcoding when this can be tested
    #time_unit = request.args.get('time_unit', 'week')
    time_unit = 'week'

    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        page_spend_over_time = db_interface.spend_by_purpose_of_page_in_region(
            page_owner, region_name, start_date, end_date)
        page_name = db_interface.page_owner_page_name(page_owner)
    if not page_spend_over_time:
        return None

    weeks = generate_time_periods(max_date=end_date, min_date=start_date, span_in_days=7)

    spend_by_time_period = assign_spend_to_timewindows(weeks, 'purpose', page_spend_over_time)

    return json.dumps(
        {'time_unit': time_unit,
         'date_range': [min(weeks).isoformat(), max(weeks).isoformat()],
         'page_id': page_owner,
         'page_name': page_name,
         'region_name': region_name,
         'spend_by_time_period': spend_by_time_period})

@blueprint.route('/total_spend/of_page/<int:page_owner>/by_region')
def total_spend_of_page_by_region(page_owner):
    start_date = date_utils.parse_date_arg(request.args.get('start_date', '2020-06-23'),
                                oldest_allowed_date=TOTAL_SPEND_OLDEST_ALLOWED_DATE)
    if not start_date:
        abort(400)
    end_date = parse_end_date_request_arg(request.args.get('end_date', None))
    response_data = cached_total_spend_of_page_by_region(page_owner, start_date, end_date)
    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_total_spend_of_page_by_region(page_owner, start_date, end_date):
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        results = db_interface.page_spend_by_region_since_date(
            page_owner, start_date, end_date)
        page_name = db_interface.page_owner_page_name(page_owner)
        if not results:
            return None

    return json.dumps(
        {'start_date': results.start_date.isoformat(),
         'end_date': results.end_date.isoformat(),
         'page_id': page_owner,
         'page_name': page_name,
         'spend_by_region': results.results})

@blueprint.route('/search/pages_type_ahead')
def pages_type_ahead():
    '''
    This endpoint accepts a query parameter (q) and uses that parameter to perform an
    n-gram search for all page names that match the query term. The size parameter can be
    used to limit the size of returned matching page names. An optional (size) parameter
    may also be passed to specify the number of auto-complete results to return.
    '''
    start_time = time.time()
    headers = {"content-type": "application/json"}
    query = {}

    query['query'] = {}

    # Process size parameter if supplied
    size = request.args.get('size', None)
    if size is not None:
        query['size'] = size

    # Process query term
    q_arg = request.args.get('q', None)
    query['query']['bool'] = {
        'must': [{'match': {'page_name.ngram': q_arg}}],
        'should': [{'rank_feature': {'field': 'lifelong_amount_spent',
                                     'log': {'scaling_factor': 1}}}]}

    if q_arg is None:
        abort(400, 'The q_arg parameter is required for this endpoint.')

    url = f"{elastic_search.DEFAULT_AD_SCREENER_ES_CLUSTER}/nyu_page/_search"
    data = json.dumps(query)
    logging.debug('Sending type ahead request to %s query: %s', url, data)

    req = requests.get(url, data=data, headers=headers)
    req.raise_for_status()
    data = {}
    data['data'] = []
    json_response = req.json()
    logging.debug('json_response: %s', json_response)
    hits = json_response.get('hits', {}).get('hits')
    for hit in hits:
        data['data'].append(hit['_source'])
    data['metadata'] = {}
    data['metadata']['total'] = req.json()['hits']['total']
    data['metadata']['execution_time_in_millis'] = round((time.time() - start_time) * 1000, 2)
    return Response(json.dumps(data), mimetype='application/json')

@blueprint.route("/search/archive_ids")
def get_archive_ids_from_full_text_search():
    '''
    This endpoint returns archive ids that match specific page ids or keywords (matched against the
    ad creative body).
    '''
    # Process size parameter if supplied
    size = request.args.get('size', None)
    body = request.args.get('body', None)
    funding_entity = request.args.get('funding_entity', None)
    page_id = request.args.get('page_id', None)
    ad_delivery_start_time = request.args.get('ad_delivery_start_time', None)
    ad_delivery_stop_time = request.args.get('ad_delivery_stop_time', None)
    archive_ids_only = request.args.get('archive_ids_only', True)
    search_results = elastic_search.query_elastic_search(
        cluster_url=elastic_search.DEFAULT_AD_SCREENER_ES_CLUSTER,
        ad_creative_query=body,
        funding_entity_query=funding_entity,
        page_id_query=page_id,
        ad_delivery_start_time=ad_delivery_start_time,
        ad_delivery_stop_time=ad_delivery_stop_time,
        max_results=size,
        return_archive_ids_only=archive_ids_only)
    return Response(json.dumps(search_results), mimetype='application/json')


def obscure_too_low_count_or_convert_count_to_humanized_int(rows):
    """Obscures or converts "count" value in each row.

    Values <= OBSCURE_OBSERVATION_COUNT_AT_OR_BELOW are obscured with 'N or less', and other values
    are converted to humanized int with commas (ie "N,NNN") or int in works (N million)."""
    for row in rows:
        if 'count' in row:
            count = row['count']
            if count <= OBSCURE_OBSERVATION_COUNT_AT_OR_BELOW:
                row['count'] = OBSCURE_OBSERVATION_COUNT_MESSAGE
            else:
                try:
                    row['count'] = humanize.intcomma(count)
                except OverflowError:
                    row['count'] = humanize.intword(count)


@blueprint.route('/targeting/of_page/<int:page_owner>')
def targeting_category_counts_for_page(page_owner):
    start_date =date_utils. parse_date_arg(request.args.get('start_date', '2020-06-22'),
                                oldest_allowed_date=TOTAL_SPEND_OLDEST_ALLOWED_DATE)
    if not start_date:
        abort(400)
    end_date = parse_end_date_request_arg(request.args.get('end_date', None))
    response_data = cached_targeting_category_counts_for_page(page_owner, start_date, end_date)
    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_targeting_category_counts_for_page(page_owner, start_date, end_date):
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        targeting_category_count_records = db_interface.get_targeting_category_counts_for_page(
            page_owner, start_date, end_date)
        page_name = db_interface.page_owner_page_name(page_owner)
    if targeting_category_count_records is None:
        return None
    obscure_too_low_count_or_convert_count_to_humanized_int(targeting_category_count_records)

    return json.dumps({
        'targeting': targeting_category_count_records,
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
         'page_name': page_name,
        'page_id': page_owner})

@blueprint.route('/race_pages')
def race_pages():
    return Response(cached_race_pages(), mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_race_pages():
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        data = {row['race_id']: row['page_ids'] for row in db_interface.race_pages()}
        return json.dumps(data)


@blueprint.route('/race/<race_id>/candidates')
def candidates_in_race(race_id):
    response_data = cached_candidates_in_race(race_id)
    if not response_data:
        return Response(status=204, mimetype='application/json')
    return Response(response_data, mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_candidates_in_race(race_id):
    data = {'race_id': race_id, 'candidates': []}
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        candidates_info = db_interface.candidates_in_race(race_id)
        if not candidates_info:
            return None
        for row in candidates_info:
            pages_info = db_interface.owned_page_info(row['page_owner'])
            if pages_info:
                # TODO(macpd): add open secrets ID
                data['candidates'].append({'pages': pages_info, 'short_name': row['short_name'],
                                           'full_name': row['full_name'], 'party': row['party']})
    return json.dumps(data)

@cached(ttl=date_utils.ONE_HOUR_IN_SECONDS)
def fetch_ad_observatory_congnito_user_info(access_token):
    header = {'Authorization': 'Bearer %s' % access_token}
    resp = requests.get(authentication.AD_OBSERVATORY_COGNITO_USERINFO_URL, headers=header)
    resp.raise_for_status()
    return resp.json()

def validate_ad_observatory_access_token(access_token, expected_email):
    try:
        user_info = fetch_ad_observatory_congnito_user_info(access_token)
    except requests.HTTPError as error:
        logging.info('%s requesting userinfo', error)
        abort(401, 'invalid access_token')
    oauth_validated_email = user_info['email']
    if expected_email != oauth_validated_email:
        logging.info('Request for %s denied. Access token resolved to email %s',
                     request.base_url, oauth_validated_email)
        abort(401, 'User not authorized to view notifications for %s', expected_email)

@blueprint.route('/notifications/of_user/<email>')
@login_required
def get_notifications(email):
    if 'DEBUG_LOG_NOTIFICATIONS_REQUESTS' in os.environ:
        logging.warning('Request to %s:\n%sdata:%s\nform:%s\nis_json:%s', request.url,
                        request.headers, request.data, request.form, request.is_json)
    access_token = request.args.get('access_token', None)
    if not access_token:
        abort(400, description='must provide access_token')
    validate_ad_observatory_access_token(access_token, email)

    data = {'notifications': []}
    with db_functions.get_notification_database_connection() as db_connection:
        db_interface = db_functions.NotificationDBInterface(db_connection)
        notification_info = db_interface.get_notifications(email)

        page_ids = set()
        for row in notification_info:
            notif_dict = {}
            page_ids.add(row['page_id'])
            notif_dict['id'] = row['id']
            notif_dict['page_id'] = row['page_id']
            notif_dict['page_name'] = None
            notif_dict['race'] = row['race']
            notif_dict['topic'] = row['topic']
            notif_dict['region'] = row['region']
            notif_dict['count'] = row['count']
            notif_dict['type_id'] = row['type_id']
            notif_dict['time_window'] = row['time_window']
            notif_dict['fire_frequency'] = row['fire_frequency']
            data['notifications'].append(notif_dict)

    if page_ids:
        with db_functions.get_ad_info_database_connection() as db_connection:
            db_interface = db_functions.AdsIfoDBInterface(db_connection)
            page_data = db_interface.get_page_data(page_ids)
            for notif in data['notifications']:
                if notif['page_id']:
                    page_name = page_data.get(notif['page_id'])
                    if page_name:
                        notif['page_name'] = page_name

    return Response(json.dumps(data), mimetype='application/json')

def get_post_request_data_src(req):
    if req.is_json:
        return req.get_json()
    return req.form


@blueprint.route('/notifications/add', methods=['POST'])
@login_required
def add_notification():
    if 'DEBUG_LOG_NOTIFICATIONS_REQUESTS' in os.environ:
        logging.warning('Request to %s:\n%sdata:%s\nform:%s\nis_json:%s', request.url,
                        request.headers, request.data, request.form, request.is_json)
    form_data_src = get_post_request_data_src(request)

    # TODO(macpd): validate reqeusts args, and reject if required args not present.
    count = form_data_src.get('count', None)
    if count is not None:
        try:
            count = int(count)
        except TypeError:
            abort(400, description='count must be a integer')
    email = form_data_src.get('email', None)
    page_id = form_data_src.get('page_id', None)
    if page_id is not None:
        try:
            page_id = int(page_id)
        except TypeError:
            abort(400, description='page_id must be a integer')
    region = form_data_src.get('region', None)
    time_window = form_data_src.get('time_window', None)
    fire_frequency = form_data_src.get('fire_frequency', None)
    race = form_data_src.get('race', None)
    topic = form_data_src.get('topic', None)
    if topic is not None:
        try:
            topic = int(topic)
        except TypeError:
            abort(400, description='topic must be a integer')
    type_id = int(form_data_src.get('type_id', 0))
    if type_id is not None:
        try:
            type_id = int(type_id)
        except TypeError:
            abort(400, description='type_id must be a integer')

    if not all([email, type_id]):
        abort(400, description='email and type_id fields required')

    access_token = form_data_src.get('access_token', None)
    if not access_token:
        abort(400, description='must provide access_token')
    validate_ad_observatory_access_token(access_token, email)

    notification = {}
    notification['count'] = count
    notification['email'] = email
    notification['page_id'] = page_id
    notification['race'] = race
    notification['topic'] = topic
    notification['region'] = region
    notification['time_window'] = time_window
    notification['fire_frequency'] = fire_frequency
    notification['type_id'] = type_id

    with db_functions.get_notification_database_connection() as db_connection:
        db_interface = db_functions.NotificationDBInterface(db_connection)
        result = db_interface.insert_notification(notification)

    return Response(json.dumps(bool(result == 1)), mimetype='application/json')

@blueprint.route('/notifications/remove/<int:notification_id>', methods=['POST'])
@login_required
def remove_notification(notification_id):
    if 'DEBUG_LOG_NOTIFICATIONS_REQUESTS' in os.environ:
        logging.warning('Request to %s:\n%sdata:%s\nform:%s\nis_json:%s', request.url,
                        request.headers, request.data, request.form, request.is_json)
    form_data_src = get_post_request_data_src(request)
    access_token = form_data_src.get('access_token', None)
    if not access_token:
        abort(400, description='must provide access_token')
    with db_functions.get_notification_database_connection() as db_connection:
        db_interface = db_functions.NotificationDBInterface(db_connection)
        notification_info = db_interface.get_notification_by_id(notification_id)
        if not notification_info:
            abort(404, description='Unknown notification ID %s' % notification_id)
        notification_email = notification_info['email']
        if not notification_email:
            logging.error('Notification has no email: %s', notification_info)
        validate_ad_observatory_access_token(access_token, notification_email)
        result = db_interface.delete_notification(notification_id)

    return Response(json.dumps(bool(result)), mimetype='application/json')

@blueprint.route('/notification_types')
def get_notification_types():
    return Response(cached_get_notification_types(), mimetype='application/json')

@cached(ttl=date_utils.SIX_HOURS_IN_SECONDS)
def cached_get_notification_types():
    notification_result = None
    with db_functions.get_notification_database_connection() as db_connection:
        db_interface = db_functions.NotificationDBInterface(db_connection)
        notification_result = db_interface.get_notification_types()

    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        region_list = db_interface.all_ad_library_report_geographies()
        state_and_race_id_list = db_interface.races_state_and_race_id()
        topic_name_to_topic_id = db_interface.topics()

    result = {'notification_types': [],
              'topics': topic_name_to_topic_id}
    for notification_type in notification_result:
        curr_notification_type = notification_type
        for field in notification_type['fields']:
            if field == 'region':
                curr_notification_type['fields'][field] = region_list
            elif field == 'race':
                curr_notification_type['fields'][field] = state_and_race_id_list
        result['notification_types'].append(curr_notification_type)

    return json.dumps(result)

@blueprint.route('/races')
def get_races():
    return Response(cached_get_races(), mimetype='application/json')

@cached
def cached_get_races():
    with db_functions.get_ad_info_database_connection() as db_connection:
        db_interface = db_functions.AdsIfoDBInterface(db_connection)
        return json.dumps({row['state']: list(filter(None, row['races']))
                           for row in db_interface.state_races()})

"""Encapsulation of database read, write, and update logic."""
from collections import defaultdict, namedtuple
import logging
import os

import psycopg2
import psycopg2.extras
from psycopg2 import sql


_DEFAULT_PAGE_SIZE = 250

AD_START_DATE_CLAUSE = sql.SQL(
    '(ad_delivery_start_time >= %(start_date)s OR last_active_date >= %(start_date)s)')
AD_END_DATE_CLAUSE = sql.SQL(
    '(ad_delivery_start_time <= %(end_date)s OR last_active_date <= %(end_date)s)')
AD_START_AND_END_DATE_CLAUSE = sql.SQL(' AND ').join([AD_START_DATE_CLAUSE, AD_END_DATE_CLAUSE])

DateRangeResults = namedtuple('DateRangeResults', ['start_date', 'end_date', 'results'])
DatabaseConnectionParams = namedtuple('DatabaseConnectionParams',
                                      ['host',
                                       'database_name',
                                       'username',
                                       'password',
                                       'port'])

def get_ad_screener_database_connection():
    """Get connection to ad feedback database.

    Returns:
        psycopg2.connection ready to be used.
    """
    database_connection_params = DatabaseConnectionParams(
        host=os.environ['AD_SCREENER_DATABASE_HOST'],
        database_name=os.environ['AD_SCREENER_DATABASE_DBNAME'],
        username=os.environ['AD_SCREENER_DATABASE_USER'],
        password=os.environ['AD_SCREENER_DATABASE_PASSWORD'],
        port=os.environ['AD_SCREENER_DATABASE_PORT'])
    return get_database_connection(database_connection_params)

def get_ad_observatory_api_user_database_connection():
    """Get connection to ad observatory users database.

    Returns:
        psycopg2.connection ready to be used.
    """
    database_connection_params = DatabaseConnectionParams(
        host=os.environ['AD_OBSERVATORY_API_USER_DATABASE_HOST'],
        database_name=os.environ['AD_OBSERVATORY_API_USER_DATABASE_DBNAME'],
        username=os.environ['AD_OBSERVATORY_API_USER_DATABASE_USER'],
        password=os.environ['AD_OBSERVATORY_API_USER_DATABASE_PASSWORD'],
        port=os.environ['AD_OBSERVATORY_API_USER_DATABASE_PORT'])
    return get_database_connection(database_connection_params)

def get_ad_info_database_connection():
    """Get connection to ad information database.

    Returns:
        psycopg2.connection ready to be used.
    """
    database_connection_params = DatabaseConnectionParams(
        host=os.environ['AD_INFO_DATABASE_HOST'],
        database_name=os.environ['AD_INFO_DATABASE_DBNAME'],
        username=os.environ['AD_INFO_DATABASE_USER'],
        password=os.environ['AD_INFO_DATABASE_PASSWORD'],
        port=os.environ['AD_INFO_DATABASE_PORT'])
    return get_database_connection(database_connection_params)

def get_notification_database_connection():
    """Get connection to notifications database.

    Returns:
        psycopg2.connection ready to be used.
    """
    database_connection_params = DatabaseConnectionParams(
        host=os.environ['NOTIFICATIONS_DATABASE_HOST'],
        database_name=os.environ['NOTIFICATIONS_DATABASE_DBNAME'],
        username=os.environ['NOTIFICATIONS_DATABASE_USER'],
        password=os.environ['NOTIFICATIONS_DATABASE_PASSWORD'],
        port=os.environ['NOTIFICATIONS_DATABASE_PORT'])
    return get_database_connection(database_connection_params)

def get_database_connection(database_connection_params):
    """Get pyscopg2 database connection using the provided params.

    Args:
        database_connection_params: DatabaseConnectionParams object from which to pull connection
        params.
    Returns:
        psycopg2.connection ready to be used.
    """
    db_authorize = ("host=%(host)s dbname=%(database_name)s user=%(username)s "
                    "password=%(password)s port=%(port)s") % database_connection_params._asdict()
    connection = psycopg2.connect(db_authorize)
    logging.info('Established connecton to %s', connection.dsn)
    return connection

class BaseDBInterface():
    """Base Database Interface implementation."""
    def __init__(self, connection):
        self.connection = connection

    def get_cursor(self, real_dict_cursor=False):
        if real_dict_cursor:
            return self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        return self.connection.cursor(cursor_factory=psycopg2.extras.DictCursor)

class UserDatabaseInterface(BaseDBInterface):
    """Interface to user database."""
    def get_user(self, user_id):
        cursor = self.get_cursor()
        query = 'SELECT id, username, session_expires_at, access_token FROM users WHERE id = %s'
        cursor.execute(query, (user_id,))
        return cursor.fetchone()

    def upsert_user(self, user_id, username, session_expires_at, access_token):
        cursor = self.get_cursor()
        query = (
            'INSERT INTO users (id, username, session_expires_at, access_token) VALUES ('
            '%(user_id)s, %(username)s, %(session_expires_at)s, %(access_token)s) '
            'ON CONFLICT (id) DO UPDATE SET session_expires_at = EXCLUDED.session_expires_at,'
            'access_token = EXCLUDED.access_token')
        cursor.execute(query, ({'user_id': user_id, 'username': username, 'session_expires_at':
                                session_expires_at, 'access_token': access_token}))

    def get_api_key_user(self, api_key):
        cursor = self.get_cursor()
        query = ('SELECT id, name, is_active FROM api_keys WHERE api_key = %s')
        cursor.execute(query, (api_key,))
        return cursor.fetchone()

class AdScreenerDBInterface(UserDatabaseInterface):

    def is_this_ad_problematic_label_name_to_id(self):
        cursor = self.get_cursor()
        query = 'SELECT id, name FROM is_this_ad_problematic_label_names'
        cursor.execute(query)
        return {row['name']: row['id'] for row in cursor}


    def insert_is_this_ad_problematic_label(self, user_id, ad_cluster_id, archive_ids, label_id):
        cursor = self.get_cursor()
        # Make new entry for label on cluster, and get feedback ID which will be used to connect the
        # cluster in this label to the contents of the cluster at the time the label was submitted.
        insert_label_query = (
            'INSERT INTO ad_cluster_is_this_ad_problematic_labels (feedback_id, user_id, '
            'ad_cluster_id, label_id) VALUES (DEFAULT, %(user_id)s, %(ad_cluster_id)s, '
            '%(label_id)s) ON CONFLICT (user_id, ad_cluster_id) DO UPDATE SET '
            'label_id = %(label_id)s RETURNING feedback_id')

        cursor.execute(insert_label_query,
                       {'user_id': user_id, 'ad_cluster_id': ad_cluster_id, 'label_id': label_id})
        new_feedback_id = cursor.fetchone()['feedback_id']

        feedback_cluster_insert_query = (
            'INSERT INTO feedback_clusters (feedback_id, archive_id) VALUES %s')
        insert_template = '(%(feedback_id)s, %(archive_id)s)'
        feedback_clusters = [{'feedback_id': new_feedback_id, 'archive_id': archive_id}
                             for archive_id in archive_ids]
        psycopg2.extras.execute_values(cursor,
                                       feedback_cluster_insert_query,
                                       feedback_clusters,
                                       template=insert_template,
                                       page_size=10000)

    def retrieve_is_this_ad_problematic_label(self, user_id, ad_cluster_id):
        cursor = self.get_cursor()
        retrieve_label_query = (
            '''SELECT name FROM ad_cluster_is_this_ad_problematic_labels JOIN
            is_this_ad_problematic_label_names ON (label_id = id) AND user_id = %(user_id)s AND
            ad_cluster_id = %(ad_cluster_id)s'''
            )
        cursor.execute(retrieve_label_query, ({'user_id': user_id, 'ad_cluster_id': ad_cluster_id}))
        return cursor.fetchone()

    def insert_topic_name_from_user(self, user_id, topic_name):
        cursor = self.get_cursor()
        insert_topic_query = (
            'INSERT INTO user_suggested_topics (user_id, topic_name) VALUES (%(user_id)s, '
            '%(topic_name)s)')

        cursor.execute(insert_topic_query,
                       {'user_id': user_id, 'topic_name': topic_name})

    def insert_user_suggested_topic_for_ad_cluster(self, user_id, ad_cluster_id, archive_ids,
                                                   topics, comment):
        """Make new entry for each topic on cluster, and get feedback ID which will be used to
        connect the cluster in this topic to the contents of the cluster at the time the topic was
        submitted.

        Args:
            user_id (big int): User id
            ad_cluster_id (big int): Ad cluster id for which user submitted topics
            archive_ids (big int array): Array of archive ids of ads belonging to cluster
            topics (string array): array of topics suggested by user
            comment (string): Optional comments. "None" if no comments.
        """
        cursor = self.get_cursor()
        insert_topics_query = (
            'INSERT INTO ad_cluster_user_topic_suggestions (feedback_id, user_id, '
            'ad_cluster_id, topic_name, comments) VALUES (DEFAULT, %(user_id)s, %(ad_cluster_id)s, '
            '%(topic_name)s, %(comment)s) ON CONFLICT (user_id, ad_cluster_id, topic_name) '
            'DO UPDATE SET comments = %(comment)s RETURNING feedback_id')

        for topic in topics:
            cursor.execute(insert_topics_query,
                           {'user_id': user_id, 'ad_cluster_id': ad_cluster_id, 'topic_name': topic,
                            'comment': comment})

            new_feedback_id = cursor.fetchone()['feedback_id']

            feedback_cluster_insert_query = (
                'INSERT INTO feedback_clusters_for_ad_cluster_user_topic_suggestions (feedback_id, '
                'archive_id) VALUES %s')
            insert_template = '(%(feedback_id)s, %(archive_id)s)'
            feedback_clusters = [{'feedback_id': new_feedback_id, 'archive_id': archive_id}
                                 for archive_id in archive_ids]
            psycopg2.extras.execute_values(cursor,
                                           feedback_cluster_insert_query,
                                           feedback_clusters,
                                           template=insert_template,
                                           page_size=10000)


class AdsIfoDBInterface(BaseDBInterface):
    """Interface to Ads Info database."""

    def get_page_data(self, page_ids):
        cursor = self.get_cursor()
        query = 'SELECT page_id, page_name from pages where page_id = ANY(%(page_ids)s)'
        cursor.execute(query, {'page_ids':list(page_ids),})
        logging.debug('get_page_data query: %s', cursor.query.decode())
        return{row['page_id']: row['page_name'] for row in cursor.fetchall()}

    def topics(self):
        cursor = self.get_cursor()
        query = 'SELECT topic_name, topic_id FROM topics ORDER BY topic_name'
        cursor.execute(query)
        return {row['topic_name']: row['topic_id'] for row in cursor.fetchall()}

    def topic_id_to_name_map(self):
        cursor = self.get_cursor()
        query = 'SELECT topic_name, topic_id FROM topics ORDER BY topic_name'
        cursor.execute(query)
        return {row['topic_id']: row['topic_name'] for row in cursor.fetchall()}

    def cluster_languages(self):
        cursor = self.get_cursor()
        query = 'SELECT DISTINCT language FROM ad_cluster_languages WHERE language IS NOT NULL'
        cursor.execute(query)
        return [row['language'] for row in cursor]

    def topic_top_ad_clusters_by_spend(self, topic_id, min_date, max_date, region, gender,
                                       age_group, language, order_by=None, order_direction=None,
                                       limit=50, offset=0, min_topic_percentage_threshold=0.25):
        """Get ad cluster data for topic per specified constraints.

        Args:
            topic_id: int ID of topic to get ad clusters for.
            min_date: str/datetime ad clusters containing an ad with creation date before this will
                be excluded.
            max_date: str/datetime ad clusters containing an ad with creation date after this will
                be excluded.
            region: str region in which ad clusters must have impressions.
            gender: str gender for which ad clusters must have impressions.
            age_group: str age group for which ad clusters must have impressions.
            language: str 2 letter lnaguage code for which ad clusters must have an ad with that
                language.
            limit: int, max number of rows to fetch.
            offset: int, number of results to offset returned rows by. used for pagination.
            min_topic_percentage_threshold: minimum percentage of a topic a cluster must have to be
                included in results.
        Returns:
            iterable of dicts of ad_cluster_id, canonical_archive_id, min_ad_delivery_start_time,
            max_last_active_date, min_spend_sum, max_spend_sum, min_impressions_sum,
            min_impressions_sum. Ordered by max_spend_sum
        """
        cursor = self.get_cursor()
        query_args = {'topic_id': topic_id, 'min_date': min_date, 'max_date': max_date,
                      'limit': limit, 'offset': offset,
                      'min_topic_percentage_threshold': min_topic_percentage_threshold}

        region_where_clause = sql.SQL('')
        if region:
            region_where_clause = sql.SQL('AND region = %(region)s')
            query_args['region'] = region

        gender_where_clause = sql.SQL('')
        if gender:
            gender_where_clause = sql.SQL('AND gender = %(gender)s')
            query_args['gender'] = gender

        age_group_where_clause = sql.SQL('')
        if age_group:
            age_group_where_clause = sql.SQL('AND age_group = %(age_group)s')
            query_args['age_group'] = age_group

        language_where_clause = sql.SQL('')
        if language:
            language_where_clause = sql.SQL('AND ad_cluster_languages.language = %(language)s')
            query_args['language'] = language

        if order_by and order_direction:
            if order_direction not in set(['ASC', 'DESC']):
                raise ValueError('Invalid ORDER BY directive: \'%s\'' % order_direction)
            order_by_clause = sql.SQL('ORDER BY {} {}').format(
                sql.Identifier(order_by), sql.SQL(order_direction))
        else:
            order_by_clause = sql.SQL(
                'ORDER BY max_spend_sum DESC, ad_cluster_metadata.min_ad_delivery_start_time DESC')

        topic_and_date_where_clause = sql.SQL(
            'WHERE topic_id = %(topic_id)s AND '
            '(ad_cluster_metadata.min_ad_delivery_start_time <= %(max_date)s AND '
            'ad_cluster_metadata.max_last_active_date >= %(min_date)s) AND '
            'percent_by_max_spend >= %(min_topic_percentage_threshold)s')
        where_clause = sql.SQL(' ').join([topic_and_date_where_clause, region_where_clause,
                                          gender_where_clause, age_group_where_clause,
                                          language_where_clause])
        query = sql.SQL(
            'SELECT ad_cluster_metadata.ad_cluster_id, canonical_archive_id, '
            'min_ad_delivery_start_time, max_last_active_date, ad_cluster_metadata.min_spend_sum, '
            'ad_cluster_metadata.max_spend_sum, ad_cluster_metadata.min_impressions_sum, '
            'ad_cluster_metadata.max_impressions_sum, cluster_size, num_pages, '
            'array_agg(DISTINCT ad_cluster_languages.language) as languages '
            'FROM ad_cluster_metadata JOIN ad_cluster_topics USING(ad_cluster_id) JOIN '
            'ad_cluster_region_impression_results USING (ad_cluster_id) JOIN '
            'ad_cluster_demo_impression_results USING(ad_cluster_id) '
            'LEFT JOIN ad_cluster_languages USING(ad_cluster_id) {where_clause} '
            'GROUP BY ad_cluster_id {order_by_clause} LIMIT %(limit)s OFFSET %(offset)s'
            ).format(where_clause=where_clause, order_by_clause=order_by_clause)
        cursor.execute(query, query_args)
        logging.info('topic_top_ad_clusters_by_spend query: %s', cursor.query.decode())
        return cursor.fetchall()

    def ad_cluster_details_for_archive_ids(self, archive_ids, min_date, max_date, region, gender,
                                           age_group, language, order_by=None, order_direction=None,
                                           limit=50, offset=0):
        """Get ad cluster data for clusters containing specified archive IDs and matching other
        specified constraints.

        Args:
            archive_ids: list of ints of archive_ids that returned clusters must contain.
            min_date: str/datetime ad clusters containing an ad with creation date before this will
                be excluded.
            max_date: str/datetime ad clusters containing an ad with creation date after this will
                be excluded.
            region: str region in which ad clusters must have impressions.
            gender: str gender for which ad clusters must have impressions.
            age_group: str age group for which ad clusters must have impressions.
            language: str 2 letter lnaguage code for which ad clusters must have an ad with that
                language.
            limit: int, max number of rows to fetch.
            offset: int, number of results to offset returned rows by. used for pagination.
        Returns:
            iterable of dicts of ad_cluster_id, canonical_archive_id, min_ad_delivery_start_time,
            max_last_active_date, min_spend_sum, max_spend_sum, min_impressions_sum,
            min_impressions_sum. Ordered by max_spend_sum
        """
        cursor = self.get_cursor()
        query_args = {'archive_ids': archive_ids, 'limit': limit, 'offset': offset}

        min_date_where_clause = sql.SQL('')
        if min_date:
            min_date_where_clause = sql.SQL(
                'AND ad_cluster_metadata.max_last_active_date >= %(min_date)s')
            query_args['min_date'] = min_date

        max_date_where_clause = sql.SQL('')
        if max_date:
            max_date_where_clause = sql.SQL(
                'AND ad_cluster_metadata.min_ad_delivery_start_time <= %(max_date)s')
            query_args['max_date'] = min_date

        region_where_clause = sql.SQL('')
        if region:
            region_where_clause = sql.SQL('AND region = %(region)s')
            query_args['region'] = region

        gender_where_clause = sql.SQL('')
        if gender:
            gender_where_clause = sql.SQL('AND gender = %(gender)s')
            query_args['gender'] = gender

        age_group_where_clause = sql.SQL('')
        if age_group:
            age_group_where_clause = sql.SQL('AND age_group = %(age_group)s')
            query_args['age_group'] = age_group

        language_where_clause = sql.SQL('')
        if language:
            language_where_clause = sql.SQL('AND ad_cluster_languages.language = %(language)s')
            query_args['language'] = language

        if order_by and order_direction:
            if order_direction not in set(['ASC', 'DESC']):
                raise ValueError('Invalid ORDER BY directive: \'%s\'' % order_direction)
            order_by_clause = sql.SQL('ORDER BY {} {}').format(
                sql.Identifier(order_by), sql.SQL(order_direction))
        else:
            order_by_clause = sql.SQL(
                'ORDER BY max_spend_sum DESC, ad_cluster_metadata.min_ad_delivery_start_time DESC')

        archive_ids_where_clause = sql.SQL('WHERE archive_id = ANY(%(archive_ids)s)')
        where_clause = sql.SQL(' ').join([archive_ids_where_clause, min_date_where_clause,
                                          max_date_where_clause, region_where_clause,
                                          gender_where_clause, age_group_where_clause,
                                          language_where_clause])
        query = sql.SQL(
            'SELECT ad_cluster_metadata.ad_cluster_id, ad_cluster_metadata.canonical_archive_id, '
            'min_ad_delivery_start_time, max_last_active_date, ad_cluster_metadata.min_spend_sum, '
            'ad_cluster_metadata.max_spend_sum, ad_cluster_metadata.min_impressions_sum, '
            'ad_cluster_metadata.max_impressions_sum, cluster_size, num_pages, '
            'array_agg(DISTINCT ad_cluster_languages.language) as languages '
            'FROM ad_clusters '
            'JOIN ad_cluster_metadata USING(ad_cluster_id) '
            'JOIN ad_cluster_region_impression_results USING (ad_cluster_id) '
            'JOIN ad_cluster_demo_impression_results USING(ad_cluster_id) '
            'LEFT JOIN ad_cluster_languages USING(ad_cluster_id) {where_clause} '
            'GROUP BY ad_cluster_metadata.ad_cluster_id, ad_cluster_metadata.canonical_archive_id, '
            'min_ad_delivery_start_time, max_last_active_date, ad_cluster_metadata.min_spend_sum, '
            'ad_cluster_metadata.max_spend_sum, ad_cluster_metadata.min_impressions_sum, '
            'ad_cluster_metadata.max_impressions_sum, cluster_size, num_pages {order_by_clause} '
            'LIMIT %(limit)s OFFSET %(offset)s'
            ).format(where_clause=where_clause, order_by_clause=order_by_clause)
        cursor.execute(query, query_args)
        logging.debug('ad_cluster_details_for_archive_ids query: %s', cursor.query.decode())
        return cursor.fetchall()

    def ad_cluster_details_for_page_id(self, page_id, min_date, max_date, region, gender, age_group,
                                       language, order_by=None, order_direction=None, limit=50,
                                       offset=0):
        """Get ad cluster data for clusters with ads from specified page_id and matching other
        specified constraints.

        Args:
            page_id: int of page_id that must be associated with at least one ad in the returned
            clusters.
            min_date: str/datetime ad clusters containing an ad with creation date before this will
                be excluded.
            max_date: str/datetime ad clusters containing an ad with creation date after this will
                be excluded.
            region: str region in which ad clusters must have impressions.
            gender: str gender for which ad clusters must have impressions.
            age_group: str age group for which ad clusters must have impressions.
            language: str 2 letter lnaguage code for which ad clusters must have an ad with that
                language.
            limit: int, max number of rows to fetch.
            offset: int, number of results to offset returned rows by. used for pagination.
        Returns:
            iterable of dicts of ad_cluster_id, canonical_archive_id, min_ad_delivery_start_time,
            max_last_active_date, min_spend_sum, max_spend_sum, min_impressions_sum,
            min_impressions_sum. Ordered by max_spend_sum
        """
        cursor = self.get_cursor()
        query_args = {'page_id': page_id, 'min_date': min_date, 'max_date': max_date,
                      'limit': limit, 'offset': offset}

        region_where_clause = sql.SQL('')
        if region:
            region_where_clause = sql.SQL('AND region = %(region)s')
            query_args['region'] = region

        gender_where_clause = sql.SQL('')
        if gender:
            gender_where_clause = sql.SQL('AND gender = %(gender)s')
            query_args['gender'] = gender

        age_group_where_clause = sql.SQL('')
        if age_group:
            age_group_where_clause = sql.SQL('AND age_group = %(age_group)s')
            query_args['age_group'] = age_group

        language_where_clause = sql.SQL('')
        if language:
            language_where_clause = sql.SQL('AND ad_cluster_languages.language = %(language)s')
            query_args['language'] = language

        if order_by and order_direction:
            if order_direction not in set(['ASC', 'DESC']):
                raise ValueError('Invalid ORDER BY directive: \'%s\'' % order_direction)
            order_by_clause = sql.SQL('ORDER BY {} {}').format(
                sql.Identifier(order_by), sql.SQL(order_direction))
        else:
            order_by_clause = sql.SQL(
                'ORDER BY max_spend_sum DESC, ad_cluster_metadata.min_ad_delivery_start_time DESC')

        archive_ids_and_date_where_clause = sql.SQL(
            'WHERE ad_cluster_pages.page_id = %(page_id)s AND '
            '(ad_cluster_metadata.min_ad_delivery_start_time <= %(max_date)s AND '
            'ad_cluster_metadata.max_last_active_date >= %(min_date)s)')
        where_clause = sql.SQL(' ').join([archive_ids_and_date_where_clause, region_where_clause,
                                          gender_where_clause, age_group_where_clause,
                                          language_where_clause])
        query = sql.SQL(
            'SELECT ad_cluster_metadata.ad_cluster_id, ad_cluster_metadata.canonical_archive_id, '
            'min_ad_delivery_start_time, max_last_active_date, ad_cluster_metadata.min_spend_sum, '
            'ad_cluster_metadata.max_spend_sum, ad_cluster_metadata.min_impressions_sum, '
            'ad_cluster_metadata.max_impressions_sum, cluster_size, num_pages, '
            'array_agg(DISTINCT ad_cluster_languages.language) as languages '
            'FROM ad_cluster_pages '
            'JOIN ad_cluster_metadata USING(ad_cluster_id) '
            'JOIN ad_cluster_region_impression_results USING (ad_cluster_id) '
            'JOIN ad_cluster_demo_impression_results USING(ad_cluster_id) '
            'LEFT JOIN ad_cluster_languages USING(ad_cluster_id) {where_clause} '
            'GROUP BY ad_cluster_metadata.ad_cluster_id, ad_cluster_metadata.canonical_archive_id, '
            'min_ad_delivery_start_time, max_last_active_date, ad_cluster_metadata.min_spend_sum, '
            'ad_cluster_metadata.max_spend_sum, ad_cluster_metadata.min_impressions_sum, '
            'ad_cluster_metadata.max_impressions_sum, cluster_size, num_pages {order_by_clause} '
            'LIMIT %(limit)s OFFSET %(offset)s'
            ).format(where_clause=where_clause, order_by_clause=order_by_clause)
        cursor.execute(query, query_args)
        logging.debug('ad_cluster_details_for_page_id query: %s', cursor.query.decode())
        return cursor.fetchall()

    def ad_cluster_region_impression_results(self, ad_cluster_id):
        cursor = self.get_cursor(real_dict_cursor=True)
        query = (
            'SELECT ad_cluster_id, region, min_spend_sum, max_spend_sum, min_impressions_sum, '
            'max_impressions_sum FROM ad_cluster_region_impression_results WHERE ad_cluster_id = '
            '%(ad_cluster_id)s')
        cursor.execute(query, {'ad_cluster_id': ad_cluster_id})
        return cursor.fetchall()

    def ad_cluster_demo_impression_results(self, ad_cluster_id):
        cursor = self.get_cursor(real_dict_cursor=True)
        query = (
            'SELECT ad_cluster_id, age_group, gender, min_spend_sum, max_spend_sum, '
            'min_impressions_sum, max_impressions_sum FROM ad_cluster_demo_impression_results '
            'WHERE ad_cluster_id = %(ad_cluster_id)s')
        cursor.execute(query, {'ad_cluster_id': ad_cluster_id})
        return cursor.fetchall()

    def ad_cluster_archive_ids(self, ad_cluster_id):
        cursor = self.get_cursor()
        query = 'SELECT archive_id FROM ad_clusters WHERE ad_cluster_id = %s'
        cursor.execute(query, (ad_cluster_id, ))
        return [row['archive_id'] for row in cursor.fetchall()]

    def ad_cluster_metadata(self, ad_cluster_id):
        cursor = self.get_cursor()
        query = 'SELECT * FROM ad_cluster_metadata WHERE ad_cluster_id = %s'
        cursor.execute(query, (ad_cluster_id, ))
        return cursor.fetchone()

    def ad_cluster_types(self, ad_cluster_id):
        cursor = self.get_cursor()
        query = 'SELECT ad_type FROM ad_cluster_types WHERE ad_cluster_id = %s'
        cursor.execute(query, (ad_cluster_id, ))
        return [row['ad_type'] for row in cursor.fetchall()]

    def ad_cluster_recognized_entities(self, ad_cluster_id):
        cursor = self.get_cursor()
        query = (
            'SELECT entity_name FROM ad_cluster_recognized_entities JOIN recognized_entities '
            'USING(entity_id) WHERE ad_cluster_id = %s')
        cursor.execute(query, (ad_cluster_id, ))
        return [row['entity_name'] for row in cursor.fetchall()]

    def ad_cluster_advertiser_info(self, ad_cluster_id):
        cursor = self.get_cursor()
        query = (
            'SELECT DISTINCT advertiser_score, partisan_lean, party, fec_id, page_url, page_type, '
            'page_id, page_name FROM pages JOIN page_metadata USING(page_id) JOIN ad_cluster_pages '
            'USING(page_id) WHERE ad_cluster_id = %s ORDER BY page_url, page_type, fec_id, party, '
            'partisan_lean, advertiser_score DESC')
        cursor.execute(query, (ad_cluster_id, ))
        return cursor.fetchall()

    def ad_cluster_topics(self, ad_cluster_id):
        cursor = self.get_cursor()
        query = (
            'SELECT DISTINCT topic_name FROM topics JOIN ad_cluster_topics USING(topic_id) '
            'WHERE ad_cluster_id = %s')
        cursor.execute(query, (ad_cluster_id, ))
        return [row['topic_name'] for row in cursor.fetchall()]

    def ad_cluster_funder_names(self, ad_cluster_id):
        cursor = self.get_cursor()
        query = (
            'SELECT funding_entity FROM ad_clusters JOIN ads USING(archive_id) '
            'WHERE ad_cluster_id = %(ad_cluster_id)s')
        cursor.execute(query, {'ad_cluster_id': ad_cluster_id})
        return {r['funding_entity'] for r in cursor.fetchall()}

    def ad_cluster_languages(self, ad_cluster_id):
        cursor = self.get_cursor()
        query = ('SELECT DISTINCT language FROM ad_cluster_languages WHERE ad_cluster_id = '
                 '%(ad_cluster_id)s AND language IS NOT NULL')
        cursor.execute(query, {'ad_cluster_id': ad_cluster_id})
        return [r['language'] for r in cursor]

    def get_cluster_id_from_archive_id(self, archive_id):
        cursor = self.get_cursor()
        query = 'SELECT ad_cluster_id FROM ad_clusters WHERE archive_id = %s'
        cursor.execute(query, (archive_id,))
        result = cursor.fetchone()
        if not result:
            return None
        return result['ad_cluster_id']

    def all_ad_creative_image_simhashes(self):
        """Returns Dict image_sim_hash -> set of archive_ids.
        """
        cursor = self.get_cursor()
        simhash_query = (
            'SELECT DISTINCT archive_id, image_sim_hash FROM ad_creatives WHERE image_sim_hash '
            'IS NOT NULL AND image_sim_hash != \'\' '
        )
        cursor.execute(simhash_query)
        logging.debug('all_ad_creative_image_simhashes query: %s', cursor.query.decode())
        # Put all query results in dict of image_sim_hash -> set of archive_ids
        sim_hash_to_archive_id_set = defaultdict(set)
        for row in cursor:
            sim_hash_to_archive_id_set[int(row['image_sim_hash'], 16)].add(row['archive_id'])
        return sim_hash_to_archive_id_set

    def page_spend_by_region_us_ad_library_lifelong_reports_date_range_available(
            self, start_date, end_date, page_id=None, raw_page_id_query=False):
        cursor = self.get_cursor(True)
        page_id_condition = sql.SQL('')
        if raw_page_id_query:
            table_name = sql.Identifier('raw_page_spend_by_region_us_ad_library_lifelong_reports')
            if page_id:
                page_id_condition = sql.SQL('AND page_id = %(page_id)s')
        else:
            table_name = sql.Identifier('page_spend_by_region_us_ad_library_lifelong_reports')
            if page_id:
                page_id_condition = sql.SQL('AND page_owner = %(page_id)s')
        query = sql.SQL('''
            SELECT min(report_date) AS min_report_date,
            max(report_date) AS max_report_date
            FROM {table_name}
            WHERE report_date >= %(start_date)s AND report_date <= %(end_date)s AND
            geography = 'US' {page_id_condition}''').format(
                table_name=table_name, page_id_condition=page_id_condition)
        cursor.execute(query, {'start_date': start_date, 'end_date': end_date, 'page_id': page_id})
        logging.debug('page_spend_by_region_us_ad_library_lifelong_reports_date_range_available '
                     'query: %s', cursor.query.decode())
        return cursor.fetchone()

    def page_spend_by_region_ad_library_yesterday_reports_date_range_available(
            self, start_date, end_date, region_name=None, page_id=None, raw_page_id_query=False):
        cursor = self.get_cursor(True)
        page_id_condition = None
        if raw_page_id_query:
            table_name = sql.Identifier('raw_page_spend_by_region_ad_library_yesterday_reports')
            if page_id:
                page_id_condition = sql.SQL('page_id = %(page_id)s')
        else:
            table_name = sql.Identifier('page_spend_by_region_ad_library_yesterday_reports')
            if page_id:
                page_id_condition = sql.SQL('page_owner = %(page_id)s')
        region_condition = None
        if region_name:
            region_condition = sql.SQL('geography = %(region_name)s')
        region_and_page_id_condition = sql.SQL(' AND ').join(
            filter(None, [region_condition, page_id_condition]))
        query = sql.SQL('''
            SELECT min(report_date) AS min_report_date,
            max(report_date) AS max_report_date
            FROM {table_name}
            WHERE report_date >= %(start_date)s AND report_date <= %(end_date)s AND
            {region_and_page_id_condition}''').format(
                table_name=table_name, region_and_page_id_condition=region_and_page_id_condition)
        cursor.execute(query, {'start_date': start_date, 'end_date': end_date,
                               'region_name': region_name, 'page_id': page_id})
        logging.debug('page_spend_by_region_ad_library_yesterday_reports_date_range_available '
                     'query: %s', cursor.query.decode())
        return cursor.fetchone()

    def get_spender_for_region(self, region, start_date, end_date):
        cursor = self.get_cursor(True)
        if region == 'US':
            min_max_available_report_dates = (
                self.page_spend_by_region_us_ad_library_lifelong_reports_date_range_available(
                    start_date, end_date))
            if not min_max_available_report_dates:
                return None
            start_date = min_max_available_report_dates['min_report_date']
            end_date = min_max_available_report_dates['max_report_date']
            query = (
                '''
                SELECT curr.page_name, curr.page_owner AS page_id,
                array_distinct(curr.page_ids || prev.page_ids) AS page_ids,
                array_distinct(curr.disclaimers || prev.disclaimers) AS disclaimers,
                GREATEST(curr.amount_spent - prev.amount_spent, 0) AS spend
                FROM (
                    SELECT page_name, page_owner, page_ids, disclaimers, amount_spent
                    FROM page_spend_by_region_us_ad_library_lifelong_reports
                    WHERE report_date = %(start_date)s
                    AND geography = %(region)s) AS prev
                JOIN (
                    SELECT page_name, page_owner, page_ids, disclaimers, amount_spent
                    FROM page_spend_by_region_us_ad_library_lifelong_reports
                    WHERE report_date = %(end_date)s
                    AND geography = %(region)s) as curr
                USING(page_owner) ORDER BY spend DESC''')
        else:
            min_max_available_report_dates = (
                self.page_spend_by_region_ad_library_yesterday_reports_date_range_available(
                    start_date, end_date, region_name=region))
            if not min_max_available_report_dates:
                return None
            start_date = min_max_available_report_dates['min_report_date']
            end_date = min_max_available_report_dates['max_report_date']
            query = (
                '''SELECT page_name, page_owner AS page_id,
                array_agg(DISTINCT page_id) AS page_ids,
                array_agg(DISTINCT disclaimer) AS disclaimers, sum(amount_spent) AS spend
                FROM page_spend_by_region_ad_library_yesterday_reports
                WHERE report_date >= %(start_date)s AND report_date <= %(end_date)s
                AND geography = %(region)s
                GROUP BY page_owner, page_name ORDER BY spend DESC''')
        cursor.execute(query, {'region': region, 'start_date': start_date, 'end_date': end_date})
        logging.debug('get_spender_for_region query: %s', cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return DateRangeResults(start_date=start_date, end_date=end_date, results=result)

    def page_spend_in_region_since_date(self, page_owner, region_name, start_date, end_date):
        cursor = self.get_cursor(True)
        if region_name == 'US':
            min_max_available_report_dates = (
                self.page_spend_by_region_us_ad_library_lifelong_reports_date_range_available(
                    start_date, end_date))
            if not min_max_available_report_dates:
                return None
            start_date = min_max_available_report_dates['min_report_date']
            end_date = min_max_available_report_dates['max_report_date']
            query = (
                '''
                SELECT curr.page_name, curr.page_owner AS page_id,
                array_distinct(curr.page_ids || prev.page_ids) AS page_ids,
                array_distinct(curr.disclaimers || prev.disclaimers) AS disclaimers,
                GREATEST(curr.amount_spent - COALESCE(prev.amount_spent, 0), 0) AS spend
                FROM (
                    SELECT page_name, page_owner, page_ids, disclaimers, amount_spent
                    FROM page_spend_by_region_us_ad_library_lifelong_reports
                    WHERE report_date = %(start_date)s
                    AND geography = %(region_name)s AND page_owner = %(page_owner)s
                ) AS prev
                RIGHT JOIN (
                    SELECT page_name, page_owner, page_ids, disclaimers, amount_spent
                    FROM page_spend_by_region_us_ad_library_lifelong_reports
                    WHERE report_date = %(end_date)s
                    AND geography = %(region_name)s AND page_owner = %(page_owner)s) as curr
                USING(page_owner) ORDER BY spend DESC;''')
        else:
            min_max_available_report_dates = (
                self.page_spend_by_region_ad_library_yesterday_reports_date_range_available(
                    start_date, end_date, region_name=region_name))
            if not min_max_available_report_dates:
                return None
            start_date = min_max_available_report_dates['min_report_date']
            end_date = min_max_available_report_dates['max_report_date']
            query = (
                '''SELECT page_name, page_owner AS page_id,
                array_agg(DISTINCT disclaimer) AS disclaimers,
                array_agg(DISTINCT page_id) AS page_ids,
                sum(amount_spent) AS spend FROM page_spend_by_region_ad_library_yesterday_reports
                WHERE report_date >= %(start_date)s AND report_date <= %(end_date)s
                AND geography = %(region_name)s AND page_owner = %(page_owner)s
                GROUP BY page_owner, page_name ORDER BY spend DESC''')
        cursor.execute(
            query, {'page_owner': page_owner, 'region_name': region_name, 'start_date': start_date,
                    'end_date': end_date})
        logging.debug('page_spend_in_region_since_date query: %s', cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return DateRangeResults(start_date=start_date, end_date=end_date, results=result)

    def page_spend_in_region_since_date_raw_page_id_query(self, page_id, region_name, start_date,
                                                          end_date):
        cursor = self.get_cursor(True)
        if region_name == 'US':
            min_max_available_report_dates = (
                self.page_spend_by_region_us_ad_library_lifelong_reports_date_range_available(
                    start_date, end_date, raw_page_id_query=True))
            if not min_max_available_report_dates:
                return None
            start_date = min_max_available_report_dates['min_report_date']
            end_date = min_max_available_report_dates['max_report_date']
            query = (
                '''
                SELECT curr.page_name, curr.page_id AS page_id, ARRAY[curr.page_id] AS page_ids,
                array_distinct(curr.disclaimers || prev.disclaimers) AS disclaimers,
                GREATEST(curr.amount_spent - COALESCE(prev.amount_spent, 0), 0) AS spend
                FROM (
                    SELECT page_name, page_id, disclaimers, amount_spent FROM
                    raw_page_spend_by_region_us_ad_library_lifelong_reports
                    WHERE report_date = %(start_date)s
                    AND geography = %(region_name)s AND page_id = %(page_id)s
                ) AS prev
                RIGHT JOIN (
                    SELECT page_name, page_id, disclaimers, amount_spent FROM
                    raw_page_spend_by_region_us_ad_library_lifelong_reports
                    WHERE report_date = %(end_date)s
                    AND geography = %(region_name)s AND page_id = %(page_id)s) as curr
                USING(page_id) ORDER BY spend DESC;''')
        else:
            min_max_available_report_dates = (
                self.page_spend_by_region_ad_library_yesterday_reports_date_range_available(
                    start_date, end_date, region_name=region_name))
            if not min_max_available_report_dates:
                return None
            start_date = min_max_available_report_dates['min_report_date']
            end_date = min_max_available_report_dates['max_report_date']
            query = (
                '''SELECT page_name, page_id,
                array_agg(DISTINCT disclaimer) AS disclaimers,
                array_agg(DISTINCT page_id) AS page_ids,
                sum(amount_spent) AS spend
                FROM raw_page_spend_by_region_ad_library_yesterday_reports
                WHERE report_date >= %(start_date)s AND report_date <= %(end_date)s
                AND geography = %(region_name)s AND page_id = %(page_id)s
                GROUP BY page_id, page_name ORDER BY spend DESC''')
        cursor.execute(
            query, {'page_id': page_id, 'region_name': region_name, 'start_date': start_date,
                    'end_date': end_date})
        logging.debug('page_spend_in_region_since_date_raw_page_id_query query: %s',
                      cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return DateRangeResults(start_date=start_date, end_date=end_date, results=result)

    def page_spend_by_region_since_date(self, page_owner, start_date, end_date):
        min_max_available_report_dates = (
            self.page_spend_by_region_ad_library_yesterday_reports_date_range_available(
                start_date, end_date, page_id=page_owner))
        if not min_max_available_report_dates:
            return None
        start_date = min_max_available_report_dates['min_report_date']
        end_date = min_max_available_report_dates['max_report_date']
        cursor = self.get_cursor(True)
        query = (
            '''SELECT page_name, page_owner, geography AS region_name,
            array_agg(DISTINCT disclaimer) AS disclaimers,
            array_agg(DISTINCT page_id) AS page_ids,
            sum(amount_spent) AS spend FROM page_spend_by_region_ad_library_yesterday_reports
            WHERE report_date >= %(start_date)s AND report_date <= %(end_date)s
            AND page_owner = %(page_owner)s
            GROUP BY page_owner, page_name, geography ORDER BY spend DESC''')
        cursor.execute(query, {'page_owner': page_owner, 'start_date': start_date, 'end_date':
                               end_date})
        logging.debug('page_spend_by_region_since_date: %s', cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return DateRangeResults(start_date=start_date, end_date=end_date, results=result)

    def page_and_region_latest_last_7_days_report_date(self, page_owner, region):
        cursor = self.get_cursor()
        latest_report_for_page_query = (
            '''SELECT max(report_date) as report_date FROM
            page_spend_by_region_ad_library_last_7_days_reports
            WHERE page_owner = %(page_owner)s AND geography = %(region)s''')
        cursor.execute(latest_report_for_page_query, {'page_owner': page_owner, 'region': region})
        logging.debug('page_and_region_latest_last_7_days_report_date query: %s',
                      cursor.query.decode())
        latest_report_date_result = cursor.fetchone()
        if not latest_report_date_result:
            return None
        return latest_report_date_result['report_date']

    def page_spend_in_region_by_week(self, page_owner, region, weeks):
        """Get page weekly spending sum in specific region from last_7_days reports.

        Args:
            page_owner: int page ID for spend.
            region: str, name of region
            weeks: list of datetime.date or reports to use for sums.
        """
        cursor = self.get_cursor()
        query = (
            '''SELECT page_owner as page_id, report_date,
            array_agg(DISTINCT disclaimer) AS disclaimers,
            array_agg(DISTINCT page_id) AS page_ids,
            sum(amount_spent) AS spend FROM page_spend_by_region_ad_library_last_7_days_reports
            WHERE page_owner = %(page_owner)s AND
            report_date = ANY(%(weeks)s) AND geography = %(region)s
            GROUP BY page_owner, report_date ORDER BY report_date''')
        cursor.execute(query, {'page_owner': page_owner, 'region': region, 'weeks': weeks})
        logging.debug('page_spend_in_region_by_week query: %s', cursor.query.decode())
        return cursor.fetchall()

    def total_spend_of_topic_in_region(self, region_name, start_date, end_date, topic_id):
        cursor = self.get_cursor(True)
        if region_name == 'US':
            query = sql.SQL(
                'select COALESCE(sum(spend_estimate), sum(midpoint_spend)) as spend, '
                'ad_delivery_start_time, last_active_date, spend_per_day '
                'FROM total_spend_of_topic_in_region_us '
                'where topic_id = %(topic_id)s and {ad_start_and_end_date_clause}'
                'group by ad_delivery_start_time,last_active_date, spend_per_day')
            query_args = {'topic_id': topic_id, 'start_date': start_date, 'end_date': end_date}
        else:
            query = sql.SQL(
                'select COALESCE(sum(region_impression_results_spend_estimate), '
                '                sum(region_impression_results_midpoint_spend)) as spend, '
                'ad_delivery_start_time, last_active_date, spend_per_day '
                'FROM total_spend_of_topic_in_region '
                'where region = %(region_name)s and '
                'topic_id = %(topic_id)s and {ad_start_and_end_date_clause} '
                'group by ad_delivery_start_time,last_active_date, spend_per_day')
            query_args = {'region_name': region_name, 'topic_id': topic_id,
                          'start_date': start_date, 'end_date': end_date}
        cursor.execute(query.format(ad_start_and_end_date_clause=AD_START_AND_END_DATE_CLAUSE),
                       query_args)
        logging.debug('total_spend_of_topic_in_region query: %s', cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return result



    def total_spend_by_page_of_topic_in_region(self, region_name, start_date, end_date, topic_id):
        cursor = self.get_cursor(True)
        if region_name == 'US':
            query = sql.SQL(
                'select COALESCE(sum(spend_estimate), sum(midpoint_spend)) as spend, '
                'ad_delivery_start_time, last_active_date, page_owner as page_id, page_name '
                'FROM total_spend_by_page_of_topic_in_region_us '
                'where topic_id = %(topic_id)s and {ad_start_and_end_date_clause}'
                'group by page_owner,page_name,ad_delivery_start_time,last_active_date')
            query_args = {'topic_id': topic_id, 'start_date': start_date, 'end_date': end_date}
        else:
            query = sql.SQL(
                'select COALESCE(sum(region_impression_results_spend_estimate), '
                '                sum(region_impression_results_midpoint_spend)) as spend, '
                'ad_delivery_start_time, last_active_date, page_owner as page_id, page_name '
                'FROM total_spend_by_page_of_topic_in_region '
                'where region = %(region_name)s and {ad_start_and_end_date_clause}'
                'topic_id = %(topic_id)s '
                'group by page_owner,page_name,ad_delivery_start_time,last_active_date')
            query_args = {'region_name': region_name, 'topic_id': topic_id,
                          'start_date': start_date, 'end_date': end_date}
        cursor.execute(query.format(ad_start_and_end_date_clause=AD_START_AND_END_DATE_CLAUSE),
                       query_args)
        logging.debug('total_spend_by_page_of_topic_in_region query: %s', cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return result

    def spend_by_topic_of_page_in_region(self, page_owner, region_name, start_date, end_date):
        cursor = self.get_cursor(True)
        if region_name == 'US':
            query = sql.SQL(
                'select COALESCE(sum(spend_estimate), sum(midpoint_spend)) as spend, '
                'ad_delivery_start_time AS start_day, last_active_date AS end_day, topic_name, '
                'page_owner as page_id, page_name '
                'FROM total_spend_by_page_of_topic_in_region_us '
                'where page_owner = %(page_owner)s and {ad_start_and_end_date_clause}'
                'group by topic_name, page_owner,page_name,ad_delivery_start_time,last_active_date')
            query_args = {'page_owner': page_owner, 'start_date': start_date, 'end_date': end_date}
        else:
            query = (
                'select COALESCE(sum(region_impression_results_spend_estimate), '
                '                sum(region_impression_results_midpoint_spend)) as spend, '
                'ad_delivery_start_time AS start_day, last_active_date AS end_day, topic_name, '
                'page_owner as page_id, page_name '
                'FROM total_spend_by_page_of_topic_in_region '
                'where region = %(region_name)s and page_owner = %(page_owner)s and '
                '{ad_start_and_end_date_clause}'
                'group by topic_name, page_owner,page_name,ad_delivery_start_time,last_active_date')
            query_args = {'region_name': region_name, 'page_owner': page_owner,
                          'start_date': start_date, 'end_date': end_date}
        query = query.format(ad_start_and_end_date_clause=AD_START_AND_END_DATE_CLAUSE)
        cursor.execute(query, query_args)
        logging.debug('spend_by_topic_of_page_in_region query: %s', cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return result

    def get_spend_for_topics_in_region(self, region_name, start_date, end_date):
        cursor = self.get_cursor(True)
        if region_name == 'US':
            query = sql.SQL(
                'select COALESCE(sum(spend_estimate), sum(midpoint_spend)) as spend, '
                'ad_delivery_start_time, last_active_date, topic_id from '
                'spend_for_topics_in_region_us where {ad_start_and_end_date_clause} '
                'group by ad_delivery_start_time,last_active_date,topic_id ORDER BY spend DESC;')
            query_args = {'start_date': start_date, 'end_date': end_date}
        else:
            query = sql.SQL(
                'select COALESCE(sum(region_impression_results_spend_estimate), '
                '                sum(region_impression_results_midpoint_spend)) as spend, '
                'ad_delivery_start_time, last_active_date, topic_id from '
                'spend_for_topics_in_region where region = %(region_name)s and '
                '{ad_start_and_end_date_clause} '
                'group by ad_delivery_start_time,last_active_date,topic_id ORDER BY spend DESC;')
            query_args = {'region_name': region_name, 'start_date': start_date,
                          'end_date': end_date}
        cursor.execute(query.format(ad_start_and_end_date_clause=AD_START_AND_END_DATE_CLAUSE),
                       query_args)
        logging.debug('get_spend_for_topics_in_region query: %s', cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return result

    def page_spend_by_topic_since_date(self, page_owner, start_date, end_date):
        cursor = self.get_cursor(True)
        query = sql.SQL(
            '''SELECT topic_name, DATE(ad_delivery_start_time) AS start_day,
            DATE(last_active_date) AS end_day,
            COALESCE(sum(spend_estimate), sum(midpoint_spend)) AS spend
            FROM total_spend_by_page_of_topic
            WHERE page_owner = %(page_owner)s AND {ad_start_and_end_date_clause}
            GROUP by topic_name, start_day, end_day ORDER BY spend DESC''')
        cursor.execute(query.format(ad_start_and_end_date_clause=AD_START_AND_END_DATE_CLAUSE),
                       {'page_owner': page_owner, 'start_date': start_date, 'end_date': end_date})
        logging.debug('page_spend_by_topic_since_date query: %s', cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return result

    def total_page_spend_by_type(self, page_owner, start_date, end_date):
        cursor = self.get_cursor(True)
        query = sql.SQL(
            '''SELECT ad_type AS purpose,
            COALESCE(sum(spend_estimate), sum(midpoint_spend)) AS spend
            FROM total_page_spend_by_type
            WHERE page_owner = %(page_owner)s AND {ad_start_and_end_date_clause}
            GROUP BY ad_type ORDER BY spend DESC''')
        query = query.format(ad_start_and_end_date_clause=AD_START_AND_END_DATE_CLAUSE)
        cursor.execute(query, {'page_owner': page_owner, 'start_date': start_date,
                               'end_date': end_date})
        logging.debug('total_page_spend_by_type query: %s', cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return result

    def total_spend_by_type_in_region(self, region_name, start_date, end_date):
        cursor = self.get_cursor(True)
        if region_name == 'US':
            query = sql.SQL(
                '''SELECT COALESCE(sum(spend_estimate), sum(midpoint_spend)) AS spend,
                ad_type AS purpose FROM total_spend_by_type_in_region_us
                WHERE {ad_start_and_end_date_clause}
                GROUP BY ad_type ORDER BY spend DESC''')
            query_args = {'start_date': start_date, 'end_date': end_date}
        else:
            query = sql.SQL(
                '''SELECT COALESCE(sum(region_impression_results_spend_estimate),
                                   sum(region_impression_results_midpoint_spend)) AS spend,
                ad_type AS purpose FROM total_spend_by_type_in_region
                WHERE region = %(region_name)s AND {ad_start_and_end_date_clause}
                GROUP BY ad_type ORDER BY spend DESC''')
            query_args = {'region_name': region_name, 'start_date': start_date,
                          'end_date': end_date}
        query = query.format(ad_start_and_end_date_clause=AD_START_AND_END_DATE_CLAUSE)
        cursor.execute(query, query_args)
        logging.debug('total_spend_by_type_in_region query: %s', cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return result

    def total_spend_by_purpose_of_page_of_region(self, page_owner, region_name, start_date,
                                                 end_date):
        cursor = self.get_cursor(True)
        if region_name == 'US':
            query = sql.SQL(
                '''SELECT COALESCE(sum(spend_estimate), sum(midpoint_spend)) AS spend,
                ad_type AS purpose
                FROM total_spend_by_page_of_type_in_region_us
                WHERE page_owner = %(page_owner)s AND {ad_start_and_end_date_clause}
                GROUP BY ad_type ORDER BY spend DESC''')
            query_args = {'page_owner': page_owner, 'start_date': start_date, 'end_date': end_date}
        else:
            query = sql.SQL(
                '''SELECT COALESCE(sum(region_impression_results_spend_estimate),
                                   sum(region_impression_results_midpoint_spend)) AS spend,
                ad_type AS purpose
                FROM total_spend_by_page_of_type_in_region
                WHERE region = %(region_name)s AND page_owner = %(page_owner)s AND
                {ad_start_and_end_date_clause}
                GROUP BY ad_type ORDER BY spend DESC''')
            query_args = {'page_owner': page_owner, 'region_name': region_name,
                          'start_date': start_date, 'end_date': end_date}
        query = query.format(ad_start_and_end_date_clause=AD_START_AND_END_DATE_CLAUSE)
        cursor.execute(query, query_args)
        logging.debug('total_spend_by_purpose_of_page_of_region: %s', cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return result

    def spend_by_purpose_of_page_in_region(self, page_owner, region_name, start_date, end_date):
        cursor = self.get_cursor(True)
        if region_name == 'US':
            query = sql.SQL(
                '''SELECT COALESCE(sum(spend_estimate), sum(midpoint_spend)) AS spend,
                ad_type AS purpose, ad_delivery_start_time AS start_day,
                last_active_date AS end_day
                FROM total_spend_by_page_of_type_in_region_us
                WHERE page_owner = %(page_owner)s AND {ad_start_and_end_date_clause}
                GROUP BY ad_type, ad_delivery_start_time, last_active_date ORDER BY spend DESC''')
            query_args = {'page_owner': page_owner, 'start_date': start_date, 'end_date': end_date}
        else:
            query = sql.SQL(
                '''SELECT COALESCE(sum(region_impression_results_spend_estimate),
                                   sum(region_impression_results_midpoint_spend)) AS spend,
                ad_type AS purpose, ad_delivery_start_time AS start_day,
                last_active_date AS end_day
                FROM total_spend_by_page_of_type_in_region
                WHERE region = %(region_name)s AND page_owner = %(page_owner)s AND
                {ad_start_and_end_date_clause}
                GROUP BY ad_type, ad_delivery_start_time, last_active_date ORDER BY spend DESC''')
            query_args = {'page_owner': page_owner, 'region_name': region_name,
                          'start_date': start_date, 'end_date': end_date}
        cursor.execute(query.format(ad_start_and_end_date_clause=AD_START_AND_END_DATE_CLAUSE),
                       query_args)
        logging.debug('spend_by_purpose_of_page_in_region: %s', cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return result


    #  def get_targetings_for_region(self, region_name, start_date, end_date):
        #  cursor = self.get_cursor(True)
        #  if region_name == 'US':
            #  query = sql.SQL(
                #  '''SELECT COALESCE(sum(spend_estimate), sum(midpoint_spend)) AS spend,
                #  ad_delivery_start_time, last_active_date, category, subcategory,
                #  sum(ad_count) AS count
                #  FROM targetings_for_region_us
                #  WHERE {ad_start_and_end_date_clause}
                #  GROUP BY ad_delivery_start_time, last_active_date, category, subcategory
                #  ORDER BY spend DESC''')
            #  query_args = {'start_date': start_date, 'end_date': end_date}
        #  else:
            #  query = sql.SQL(
                #  '''SELECT COALESCE(sum(region_impression_results_spend_estimate),
                                   #  sum(region_impression_results_midpoint_spend)) AS spend,
                #  ad_delivery_start_time, last_active_date, category, subcategory,
                #  sum(ad_count) AS count
                #  FROM targetings_for_region
                #  WHERE region = %(region_name)s AND {ad_start_and_end_date_clause}
                #  GROUP BY ad_delivery_start_time, last_active_date, category, subcategory
                #  ORDER BY spend DESC''')
            #  query_args = {'region_name': region_name, 'start_date': start_date,
                          #  'end_date': end_date}
        #  cursor.execute(query.format(ad_start_and_end_date_clause=AD_START_AND_END_DATE_CLAUSE),
                                    #  query_args)
        #  logging.debug('get_targetings_for_region query: %s', cursor.query.decode())
        #  result = cursor.fetchall()
        #  if not result:
            #  return None
        #  return result

    #  def get_spend_by_targeting_for_page(self, page_owner, start_date, end_date):
        #  cursor = self.get_cursor(True)
        #  query = sql.SQL(
            #  '''SELECT COALESCE(sum(spend_estimate), sum(midpoint_spend)) AS spend,
            #  ad_delivery_start_time, last_active_date, category, subcategory,
            #  sum(ad_count) AS count
            #  FROM targetings_for_page
            #  WHERE page_owner = %(page_owner)s AND {ad_start_and_end_date_clause}
            #  GROUP BY ad_delivery_start_time, last_active_date, category, subcategory
            #  ORDER BY spend DESC''')
        #  cursor.execute(query.format(ad_start_and_end_date_clause=AD_START_AND_END_DATE_CLAUSE),
                       #  {'page_owner': page_owner, 'start_date': start_date, 'end_date': end_date})
        #  logging.debug('get_spend_by_targeting_for_page query: %s', cursor.query.decode())
        #  result = cursor.fetchall()
        #  if not result:
            #  return None
        #  return result

    def get_targeting_category_counts_for_page(self, page_owner, start_date, end_date):
        cursor = self.get_cursor(True)
        query = (
            '''SELECT category, subcategory, sum(ad_count) AS count
            FROM raw_targetings_for_page
            WHERE page_owner = %(page_owner)s AND observed_at >= %(start_date)s
            AND observed_at <= %(end_date)s
            GROUP BY category, subcategory
            ORDER BY count DESC''')
        cursor.execute(query, {'page_owner': page_owner, 'start_date': start_date,
                               'end_date': end_date})
        logging.debug('get_targeting_category_counts_for_page query: %s', cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return result

    def race_pages(self):
        cursor = self.get_cursor(True)
        query = ('SELECT race_id, array_agg(page_id) AS page_ids FROM race_pages JOIN '
                 'races_total_spend_estimate_more_than_2k_since_2020_07_01 USING(race_id) GROUP BY '
                 'race_id ORDER BY race_id')
        cursor.execute(query)
        logging.debug('race_pages query: %s', cursor.query.decode())
        return cursor.fetchall()

    def state_races(self):
        cursor = self.get_cursor()
        query = ('''
                 SELECT region_populations.region AS state,
                 array_agg(DISTINCT
                           races_total_spend_estimate_more_than_2k_since_2020_07_01.race_id)
                 AS races
                 FROM races LEFT OUTER JOIN races_total_spend_estimate_more_than_2k_since_2020_07_01
                 USING(race_id) RIGHT OUTER JOIN region_populations ON
                 races.state = region_populations.region GROUP BY region_populations.region
                 ORDER BY region_populations.region;''')
        cursor.execute(query)
        logging.debug('state_races query: %s', cursor.query.decode())
        return cursor.fetchall()

    def candidates_in_race(self, race_id):
        cursor = self.get_cursor(True)
        query = ('SELECT DISTINCT ON (page_owner) candidate_full_name AS full_name, '
                 'candidate_last_name AS short_name, party, page_owner FROM pages '
                 'JOIN page_metadata USING(page_id) JOIN race_pages USING(page_id) '
                 'WHERE race_id = %(race_id)s')
        cursor.execute(query, {'race_id': race_id})
        logging.debug('candidates_in_race query: %s', cursor.query.decode())
        result = cursor.fetchall()
        if not result:
            return None
        return result

    def owned_page_info(self, page_owner):
        cursor = self.get_cursor(True)
        query = (
            '''SELECT page_name, page_id, disclaimers FROM owned_page_info
            WHERE page_owner = %(page_owner)s''')
        cursor.execute(query, {'page_owner': page_owner})
        results = cursor.fetchall()
        logging.debug('owned_page_info query: %s', cursor.query.decode())
        return results

    def page_owner_page_name(self, page_id):
        cursor = self.get_cursor(True)
        query = (
            '''SELECT DISTINCT page_name FROM pages
            JOIN page_metadata ON pages.page_id = page_metadata.page_owner
            WHERE page_metadata.page_id = %(page_id)s''')
        cursor.execute(query, {'page_id': page_id})
        results = cursor.fetchone()
        logging.debug('page_owner_page_name query: %s', cursor.query.decode())
        if results:
            return results['page_name']
        return None

    def all_ad_library_report_geographies(self):
        cursor = self.get_cursor(True)
        region_query = ('SELECT DISTINCT(geography) from ad_library_reports ORDER BY geography')
        cursor.execute(region_query)
        return [row['geography'] for row in cursor.fetchall()]

    def races_state_and_race_id(self):
        cursor = self.get_cursor(True)
        race_id_query = ('select state, race_id from races')
        cursor.execute(race_id_query)
        logging.debug('races_state_and_race_id query: %s', cursor.query.decode())
        return cursor.fetchall()


class NotificationDBInterface(BaseDBInterface):
    """Interface to ad_screener database."""

    def get_notifications(self, email):
        cursor = self.get_cursor(True)
        query = ('SELECT * FROM notifications JOIN notification_types USING(type_id)'
                 'WHERE email = %(email)s ORDER BY id DESC')
        cursor.execute(query, {'email':email})
        results = cursor.fetchall()
        logging.debug('get_notification query: %s\nstatusmessage: %s', cursor.query.decode(),
                      cursor.statusmessage)
        return results

    def insert_notification(self, notification):
        cursor = self.get_cursor(True)
        query = (
            '''INSERT INTO notifications(email, page_id, race, topic, region, count, type_id,
            time_window, fire_frequency) VALUES(%(email)s, %(page_id)s, %(race)s, %(topic)s,
            %(region)s, %(count)s, %(type_id)s, %(time_window)s, %(fire_frequency)s)''')
        cursor.execute(query, notification)
        logging.debug('insert_notification query: %s\nstatusmessage: %s', cursor.query.decode(),
                      cursor.statusmessage)
        return cursor.rowcount

    def get_notification_by_id(self, notification_id):
        cursor = self.get_cursor(True)
        query = 'SELECT * FROM notifications WHERE id = %(notification_id)s'
        cursor.execute(query, {'notification_id': notification_id})
        logging.debug('get_notification_by_id query: %s\nstatusmessage: %s', cursor.query.decode(),
                      cursor.statusmessage)
        return cursor.fetchone()

    def delete_notification(self, notification_id):
        cursor = self.get_cursor(True)
        query = 'DELETE FROM notifications WHERE id = %(notification_id)s'
        cursor.execute(query, {'notification_id': notification_id})
        logging.debug('delete_notification query: %s\nstatusmessage: %s', cursor.query.decode(),
                      cursor.statusmessage)
        return cursor.rowcount

    def get_notification_types(self):
        cursor = self.get_cursor(True)
        query = ('SELECT * FROM notification_types')
        cursor.execute(query)
        results = cursor.fetchall()
        logging.debug('get_notification_types query: %s', cursor.query.decode())
        return results

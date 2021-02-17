"""Module to populate elastic search instance with data from ads database."""
import sys
import time
from collections import defaultdict
from datetime import date, datetime
import logging

from psycopg2.extras import RealDictCursor
import ujson as json
import requests

import config_utils

logging.basicConfig(level=logging.INFO)
logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)

PAGES_TABLE_FETCH_BATCH_SIZE = 50000
AD_CREATIVES_TABLE_FETCH_BATCH_SIZE = 50000


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError("Type %s not serializable" % type(obj))

def insert_rows_into_es(es_cluster_name, rows, action, index):
    if not rows:
        return

    records = []
    for record in rows:
        bulk = defaultdict(dict)
        bulk[action]['_index'] = index
        try:
            bulk[action]['_id'] = str(record['id'])
        except KeyError as err:
            logging.error('%s, record: %s', err, record)
            raise

        records.extend(list(map(lambda x: json.dumps(x, ensure_ascii=False), [bulk, record])))

    logging.info("Sending %d records for indexing", len(rows))
    records = '\n'.join(records) + "\n"
    records = records.encode('utf-8')
    headers = {'Accept': 'application/json', 'Content-type': 'application/json'}
    url = "https://%(es_cluster_name)s/_bulk" % {'es_cluster_name': es_cluster_name}
    response = requests.post(url, data=records, headers=headers)
    if response.status_code != requests.codes.ok:
        logging.fatal(
            "Problem encounted while bulk inserting records into ES. status_code: %s\nHeaders:%s "
            "response text: %s",response.status_code, response.headers, response.text)

def fetch_all_tables(conn):
    '''Fetch all table names from DB'''
    cursor = conn.cursor()
    tables = []
    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")

    for table in cursor.fetchall():
        tables.append(table[0])

    return tables

def fetch_ad_topics(conn):
    '''Fetch ad topics'''
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * from ad_topics LIMIT 10")
    rows = cursor.fetchall()
    return rows

def fetch_topics(conn):
    '''Fetch topics'''
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * from topics LIMIT 1000")
    rows = cursor.fetchall()
    return rows

def move_pages_to_es(db_connection_params, es_cluster_name, pages_index_name):
    '''Transfer page data from Postgres to Elasticsearch'''
    db_connection = config_utils.get_database_connection(db_connection_params)
    total_records_inserted = 0
    logging.info("Copying records from pages table to elasticsearch.")
    start_time = time.time()

    with db_connection.cursor(name='populate_es_pages', cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            '''SELECT page_id, page_name, COALESCE(lifelong_amount_spent, 0) AS
            lifelong_amount_spent, extract(epoch from pages.last_modified_time) AS
            last_modified_time FROM pages LEFT JOIN (SELECT page_id, max(amount_spent) AS
            lifelong_amount_spent FROM ad_library_report_pages JOIN ad_library_reports
            USING(ad_library_report_id) WHERE kind = 'lifelong' AND geography = 'US'
            GROUP BY page_id) AS page_id_max_lifelong_spend USING(page_id)''')

        rows = cursor.fetchmany(PAGES_TABLE_FETCH_BATCH_SIZE)
        while rows:
            es_records = []

            for row in rows:
                record = {}
                record['id'] = row['page_id']
                record['page_name'] = row['page_name']
                record['lifelong_amount_spent'] = row['lifelong_amount_spent']
                es_records.append(record)

            insert_rows_into_es(es_cluster_name, es_records, action='index', index=pages_index_name)
            total_records_inserted += len(es_records)
            logging.debug("Inserted %s page records.", total_records_inserted)

            rows = cursor.fetchmany(PAGES_TABLE_FETCH_BATCH_SIZE)

    logging.info("Copied %s page records in %d seconds.", total_records_inserted,
                 int(time.time() - start_time))

def move_ads_to_es(db_connection_params, es_cluster_name, ad_creatives_index_name):
    '''Transfer page data from Postgres to Elasticsearch'''
    total_records_inserted = 0
    logging.info("Copying records from ad creatives table to elasticsearch.")
    start_time = time.time()
    direct_copy_field_names = [
        'text_sim_hash', 'text_sha256_hash', 'image_downloaded_url', 'image_bucket_path',
        'image_sim_hash', 'image_sha256_hash', 'ad_creative_body_language', 'funding_entity',
        'page_id', 'page_name', 'last_modified_time', 'ad_delivery_start_time',
        'ad_delivery_stop_time']

    db_connection = config_utils.get_database_connection(db_connection_params)
    with db_connection.cursor(name='populate_es_ad_creatives',
                              cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """SELECT ad_creatives.*, ads.funding_entity,
               EXTRACT(epoch from ad_creatives.last_modified_time) "last_modified_time",
               EXTRACT(epoch from ads.ad_delivery_start_time) "ad_delivery_start_time",
               EXTRACT(epoch from ads.ad_delivery_stop_time) "ad_delivery_stop_time", ads.page_id,
               pages.page_name FROM ad_creatives JOIN ads USING(archive_id)
               JOIN pages USING(page_id)"""
        )
        rows = cursor.fetchmany(AD_CREATIVES_TABLE_FETCH_BATCH_SIZE)

        while rows:
            es_records = []

            for row in rows:
                record = {}
                record['id'] = row['ad_creative_id']
                record['archive_id'] = row['archive_id']
                record['body'] = row['ad_creative_body']
                record['link_url'] = row['ad_creative_link_url']
                record['link_caption'] = row['ad_creative_link_caption']
                record['link_title'] = row['ad_creative_link_title']
                record['link_description'] = row['ad_creative_link_description']
                record['body_language'] = row['ad_creative_body_language']
                for key in direct_copy_field_names:
                    record[key] = row[key]
                es_records.append(record)

            insert_rows_into_es(es_cluster_name, es_records, action='index',
                                index=ad_creatives_index_name)
            total_records_inserted += len(es_records)
            logging.debug("Inserted %s ad creatives records.", total_records_inserted)

            rows = cursor.fetchmany(AD_CREATIVES_TABLE_FETCH_BATCH_SIZE)

    logging.info("Copied %s ad creatives records in %d seconds.", total_records_inserted,
                 int(time.time() - start_time))

def main(argv):
    config = config_utils.get_config(argv[0])
    db_connection_params = config_utils.get_database_connection_params_from_config(config)
    es_cluster_name = config['ELASTIC_SEARCH']['CLUSTER_NAME']
    pages_index_name = config['ELASTIC_SEARCH']['PAGES_INDEX_NAME']
    ad_creatives_index_name = config['ELASTIC_SEARCH']['AD_CREATIVES_INDEX_NAME']
    move_pages_to_es(db_connection_params, es_cluster_name, pages_index_name)
    move_ads_to_es(db_connection_params, es_cluster_name, ad_creatives_index_name)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('Usage: %s <config file>' % sys.argv[0])
    config_utils.configure_logger("populate_es.log")
    logging.getLogger("requests").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    main(sys.argv[1:])

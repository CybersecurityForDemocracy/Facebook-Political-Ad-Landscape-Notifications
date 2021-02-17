import datetime
import logging
import os
import time

import requests
import simplejson as json

# TODO(macpd): move this to a common os env var module
DEFAULT_AD_SCREENER_ES_CLUSTER = os.environ['AD_SCREENER_ES_CLUSTER']

def get_int_timestamp(date_obj):
    """Get timestamp as int. if datetime.date returns timestamp of first second of that day.

    Args:
        date_obj: datetime.date or datetime.datetime to convert to timestamp.
    Returns:
        int timestamp on correct conversion. None if other type.
    """
    timestamp = None
    if isinstance(date_obj, datetime.datetime):
        timestamp = int(date_obj.timestamp())
    elif isinstance(date_obj, datetime.date):
        timestamp = int(datetime.datetime(year=date_obj.year, month=date_obj.month,
                                          day=date_obj.day, hour=0, minute=0,
                                          second=0).timestamp())
    else:
        logging.info('Unsupported type for timestamp conversion: %s', type(date_obj))

    return timestamp


def query_elastic_search(cluster_url, ad_creative_query=None, funding_entity_query=None,
                         page_id_query=None, ad_delivery_start_time=None,
                         ad_delivery_stop_time=None, max_results=20, return_archive_ids_only=True):
    """Queries elastic search for full text search on specified fields.
    """
    start_time = time.time()
    headers = {"content-type": "application/json"}

    query = {}
    query['query'] = {}
    query['query']['bool'] = {}
    query['query']['bool']['must'] = must = []
    query['query']['bool']['should'] = []
    query['aggs'] = {}

    if max_results is not None:
        query['size'] = max_results

    if ad_creative_query is not None:
        sqs = {}
        sqs['simple_query_string'] = {}
        sqs['simple_query_string']['fields'] = [
            'body', 'link_url', 'link_title', 'link_description', 'link_caption', 'page_name',
            'funding_entity']
        sqs['simple_query_string']['query'] = ad_creative_query
        sqs['simple_query_string']['default_operator'] = "and"
        must.append(sqs)

    if funding_entity_query is not None:
        sqs = {}
        sqs['simple_query_string'] = {}
        sqs['simple_query_string']['fields'] = ['funding_entity']
        sqs['simple_query_string']['query'] = funding_entity_query
        sqs['simple_query_string']['default_operator'] = "and"
        must.append(sqs)

    if page_id_query is not None:
        match = {}
        match['match'] = {'page_id': page_id_query}
        must.append(match)

    if ad_delivery_start_time is not None:
        time_range = {}
        time_range['range'] = {}
        # Subtract 1 day from start time as rudimentary buffer for timezone issues.
        timestamp = get_int_timestamp(ad_delivery_start_time - datetime.timedelta(days=1))
        time_range['range']['ad_delivery_start_time'] = {'gte': timestamp}
        must.append(time_range)

    if ad_delivery_stop_time is not None:
        time_range = {}
        time_range['range'] = {}
        # Add 1 day from start time as rudimentary buffer for timezone issues.
        timestamp = get_int_timestamp(ad_delivery_stop_time + datetime.timedelta(days=1))
        time_range['range']['ad_delivery_stop_time'] = {'lte': timestamp}
        must.append(time_range)

    request_url = "{cluster_url}/nyu_ad_creatives/_search".format(cluster_url=cluster_url)
    logging.debug('Sending query: %s to %s', query, request_url)
    req = requests.get(request_url, data=json.dumps(query), headers=headers)
    if not req.ok:
        logging.info('ES query failed. status_code: %s, message: %s.\nrequest query: %s',
                     req.status_code, req.text, query)
        req.raise_for_status()
    data = {}
    data['data'] = []
    for hit in req.json()['hits']['hits']:
        if return_archive_ids_only is True:
            data['data'].append(hit['_source']['archive_id'])
        else:
            data['data'].append(hit['_source'])
    data['metadata'] = {}
    data['metadata']['total'] = req.json()['hits']['total']
    data['metadata']['execution_time_in_millis'] = round((time.time() - start_time) * 1000, 2)
    return data

"""Module to initialize an elastic search instance with templates for this project."""
import sys
import logging

import requests
import ujson as json

import config_utils


def create_pages_template(es_cluster_name):
    '''Create the nyu_pages template for the nyu_pages index'''
    template = json.load(open("mappings/nyu_pages_template.json", "r"))
    settings = json.load(open("mappings/nyu_settings.json", "r"))
    mappings = json.load(open("mappings/nyu_pages_mapping.json", "r"))
    template['settings'] = settings
    template['mappings'] = mappings
    headers = {'content-type': 'application/json'}
    req = requests.put("https://%(es_cluster_name)s/_template/nyu_page" % {es_cluster_name},
                       headers=headers, data=json.dumps(template))
    logging.info("Successfully created pages template. Status code: %s", req.status_code)
    if not req.ok:
        logging.warning("Encountered an error when creating template: %s", req.content)

def create_ads_template(es_cluster_name):
    '''Create the nyu_ad_creatives template for the nyu_ad_creatives index'''
    template = json.load(open("mappings/nyu_ad_creatives_template.json", "r"))
    settings = json.load(open("mappings/nyu_settings.json", "r"))
    mappings = json.load(open("mappings/nyu_ad_creatives_mapping.json", "r"))
    template['settings'] = settings
    template['mappings'] = mappings
    headers = {'content-type': 'application/json'}
    req = requests.put("https://%(es_cluster_name)s/_template/nyu_ad_creatives" % {es_cluster_name},
                       headers=headers, data=json.dumps(template))
    logging.info("Successfully created ad creatives template. Status code: %s", req.status_code)
    if not req.ok:
        logging.warning("Encountered an error when creating template: %s", req.content)

def main(argv):
    config = config_utils.get_config(argv[0])
    es_cluster_name = config['ELASTIC_SEARCH']['CLUSTER_NAME']
    logging.info("Creating ad screener elasticsearch pages template.")
    create_pages_template(es_cluster_name)
    logging.info("Creating ad screener elasticsearch ad creatives template.")
    create_ads_template(es_cluster_name)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('Usage: %s <config file>' % sys.argv[0])
    config_utils.configure_logger("initalize_es.log")
    logging.getLogger("requests").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    main(sys.argv[1:])

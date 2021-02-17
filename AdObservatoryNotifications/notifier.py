import boto3
from botocore.exceptions import ClientError
import collections
import configparser
import datetime
import genshi
import locale
import pandas as pd
import psycopg2
import psycopg2.extras
import sys
import urllib
locale.setlocale(locale.LC_ALL, '')

if len(sys.argv) < 2:
    exit("Usage:python3 notifier.py notifier.cfg")

config = configparser.ConfigParser()
config.read(sys.argv[1])

HOST = config['NOTIFICATIONS']['HOST']
DBNAME = config['NOTIFICATIONS']['DBNAME']
USER = config['NOTIFICATIONS']['USER']
PASSWORD = config['NOTIFICATIONS']['PASSWORD']
PORT = config['NOTIFICATIONS']['PORT']
DBAuthorize = "host=%s dbname=%s user=%s password=%s port=%s" % (HOST, DBNAME, USER, PASSWORD, PORT)
connection = psycopg2.connect(DBAuthorize)
cursor = connection.cursor(cursor_factory=psycopg2.extras.DictCursor)


#setup our db cursor
ads_HOST = config['ADS']['HOST']
ads_DBNAME = config['ADS']['DBNAME']
ads_USER = config['ADS']['USER']
ads_PASSWORD = config['ADS']['PASSWORD']
ads_PORT = config['ADS']['PORT']
ads_DBAuthorize = "host=%s dbname=%s user=%s password=%s port=%s" % (ads_HOST, ads_DBNAME, ads_USER, ads_PASSWORD, ads_PORT)
ads_connection = psycopg2.connect(ads_DBAuthorize)
ads_cursor = ads_connection.cursor(cursor_factory=psycopg2.extras.DictCursor)

#set up structures & consts
notify_rule = collections.namedtuple('notify_rule',['email', 'page_id','topic','race', 'region', 'count'])
DAILY = 'yesterday'
WEEKLY = 'last_7_days'
MONTHLY = 'last_30_days'

yesterday = datetime.date.today() - datetime.timedelta(days=1)
week_ago = datetime.date.today() - datetime.timedelta(days=8)
month_ago = datetime.date.today() - datetime.timedelta(days=31)

#get time windows
daily_window_start_date = yesterday.strftime('%Y%m%d')
weekly_window_start_date = week_ago.strftime('%Y%m%d')
monthly_window_start_date = month_ago.strftime('%Y%m%d')

#text descriptions
yesterday_txt = yesterday.strftime('%B %d, %Y')
week_ago_txt = week_ago.strftime('%B %d, %Y')
month_ago_txt = month_ago.strftime('%B %d, %Y')

#state codes
state_code = {
    'United States': 'US',
    'Alabama': 'AL',
    'Alaska': 'AK',
    'American Samoa': 'AS',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District of Columbia': 'DC',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Guam': 'GU',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Northern Mariana Islands':'MP',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Puerto Rico': 'PR',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virgin Islands': 'VI',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
}

#define query templates
top_spenders_query_template = ('select max(report_date) as report_date, page_name, sum(amount_spent) as page_spend '
                               'from ad_library_report_pages join ad_library_reports '
                               'on ad_library_report_pages.ad_library_report_id '
                               '= ad_library_reports.ad_library_report_id '
                               'join pages on ad_library_report_pages.page_id = pages.page_id '
                               'where report_date = (select max(report_date) from ad_library_reports where geography = %s and kind = %s) '
                               'and geography = %s '
                               'and kind = %s '
                               'group by page_name '
                               'order by page_spend desc '
                               'limit %s')

#define rule types
#1 - Top Spenders in most recent time period
def TopSpenders(notify_rule_list):
    print('Got Rules of type 1')

    #parse rules
    max_count = 0
    for nr in notify_rule_list:
        #get the max count we need to ask for
        if nr.count > max_count:
            max_count = nr.count


    #query and build email text
    result = {}
    notification_text = 'Sponsors spending the most on US Facebook political ads for the 7 days ending '

    ads_cursor.execute(top_spenders_query_template, ('US', 'last_7_days', 'US', 'last_7_days', max_count))
    results = ads_cursor.fetchall()
    for rule in notify_rule_list:
        curr_notification_text = notification_text
        curr_notification_html = '<h3>' + notification_text
        date_set = False
        row_count = 0
        for row in results:
            if not date_set:
                curr_notification_text += str(row['report_date']) + ':\r\n'
                curr_notification_html += str(row['report_date']) + ':</h3>'
                curr_notification_html += '<table>'
                curr_notification_html += '<tr><th>Facebook Page</th><th>Amount Spent</th></tr>'
                date_set = True
            curr_notification_text += row['page_name'] + ': ' + locale.currency( row['page_spend'], grouping=True ) + '\r\n'
            curr_notification_html += '<tr><td>' + row['page_name'] + '</td><td>'
            curr_notification_html += locale.currency( row['page_spend'], grouping=True ) + '</td></tr>'

            row_count += 1
            if row_count > rule.count:
                break

        curr_notification_html += '</table>'
        curr_notification_html += 'Click <a href="https://www.adobservatory.org/nationalData/overview">here</a> to learn more.<br>'
        if rule.email not in result:
            result[rule.email] = {'text':set(), 'html':set()}

        result[rule.email]['text'].add(curr_notification_text)
        result[rule.email]['html'].add(curr_notification_html)

    return result


#2 - Top Spenders in State in most recent time period
def TopSpendersState(notify_rule_list):
    print('Got Rules of type 2')

    #parse rules
    max_count = {}
    region_to_rules = {}
    for nr in notify_rule_list:
        #get the max count we need to ask for for each region
        if nr.region in max_count:
            if nr.count > max_count[nr.region]:
                max_count[nr.region] = nr.count
        else:
            max_count[nr.region] = nr.count

        #group the rules by region (our query parameter)
        if nr.region not in region_to_rules:
            region_to_rules[nr.region] = set()

        region_to_rules[nr.region].add(nr)

    #query and build email text
    result = {}
    for region, rule_set in region_to_rules.items():
        notification_text = 'Sponsors spending the most on ' + region + ' Facebook political ads for the 7 days ending '
        ads_cursor.execute(top_spenders_query_template, (region, 'last_7_days', region, 'last_7_days', max_count[region]))
        results = ads_cursor.fetchall()
        for rule in rule_set:
            curr_notification_text = notification_text
            curr_notification_html = '<h3>' + notification_text
            date_set = False
            row_count = 0
            for row in results:
                if not date_set:
                    curr_notification_text += str(row['report_date']) + ':\r\n'
                    curr_notification_html += str(row['report_date']) + ':</h3>'
                    curr_notification_html += '<table>'
                    curr_notification_html += '<tr><th>Facebook Page</th><th>Amount Spent</th></tr>'

                    date_set = True

                curr_notification_text += row['page_name'] + ': ' + locale.currency( row['page_spend'], grouping=True ) + '\r\n'
                curr_notification_html += '<tr><td>' + row['page_name'] + '</td><td>'
                curr_notification_html += locale.currency( row['page_spend'], grouping=True ) + '</td></tr>'

                row_count += 1
                if row_count > rule.count:
                    break

            curr_notification_html += '</table>'
            curr_notification_html += 'Click <a href="https://www.adobservatory.org/stateData/' + state_code[region] + '/overview">here</a> to learn more.<br>'
            if rule.email not in result:
                result[rule.email] = {'text':set(), 'html':set()}

            result[rule.email]['text'].add(curr_notification_text)
            result[rule.email]['html'].add(curr_notification_html)

    return result


#3 - Top Topics in State by Spend in most recent time period
def TopTopicsState(notify_rule_list):
    print('Got Rules of type 3')

    #parse rules
    max_count = {}
    region_to_rules = {}
    for nr in notify_rule_list:
        #group the rules by region (our query parameter)
        if nr.region not in region_to_rules:
            region_to_rules[nr.region] = set()
            
        region_to_rules[nr.region].add(nr)

    #queries for this time period
    get_curr_topic_spend = ('select topic_name, ad_delivery_start_time, last_active_date, '
                            'sum(spend_estimate * spend_percentage) as spend '
                            'from impressions join ads on impressions.archive_id = ads.archive_id '
                            'join ad_topics on ads.archive_id = ad_topics.archive_id '
                            'join topics on ad_topics.topic_id = topics.topic_id '
                    'join region_impressions on ads.archive_id = region_impressions.archive_id '
                            'where region = %s and last_active_date >= %s '
                            'group by topic_name, ad_delivery_start_time, last_active_date')
    
    get_curr_us_topic_spend = ('select topic_name, ad_delivery_start_time, last_active_date, '
                               'sum(spend_estimate) as spend '
                               'from impressions join ads on impressions.archive_id = ads.archive_id '
                               'join ad_topics on ads.archive_id = ad_topics.archive_id '
                               'join topics on ad_topics.topic_id = topics.topic_id '
                               'where last_active_date >= %s '
                               'group by topic_name, ad_delivery_start_time, last_active_date')


    #get top topics, build email text
    result = {}
    for region, rule_set in region_to_rules.items():
            notification_text = 'Top ' + region + ' Topics by Spend since '
            window_start_date = weekly_window_start_date
            notif_window_txt = week_ago_txt

            notification_text += notif_window_txt + ':\r\n'

            if region == 'US':
                ads_cursor.execute(get_curr_us_topic_spend, (window_start_date,))
            else:
                ads_cursor.execute(get_curr_topic_spend, (region, window_start_date))

            topic_spend = {}
            for row in ads_cursor:
                topic = row['topic_name']
                spend_start = row['ad_delivery_start_time']
                spend_end = row['last_active_date']
                spend = 0
                if row['spend']:
                    spend = row['spend']

                run_days = spend_end - spend_start
                run_days = run_days.days + 1
                if run_days < 1:
                    run_days = 1

                spend_per_day = spend / run_days
                date_list = pd.date_range(start=spend_start, end=spend_end)
                cutoff = datetime.datetime.strptime(window_start_date, '%Y%m%d')
                for spend_day in date_list:
                    if spend_day >= cutoff and spend > 0:
                        if topic not in topic_spend:
                            topic_spend[topic] = spend_per_day
                        else:
                            topic_spend[topic] += spend_per_day

              
            sorted_topic_spend = sorted(topic_spend.items() ,  key=lambda x: x[1], reverse=True)
            for rule in rule_set:
                curr_notification_text = notification_text
                curr_notification_html = '<h3>' + notification_text + '</h3>'
                curr_notification_html += '<table>'
                curr_notification_html += '<tr><th>Topic</th><th>Amount Spent</th></tr>'
                row_count = 0
                for pair in sorted_topic_spend:
                    curr_notification_text += pair[0] + ': ' + locale.currency(pair[1], grouping=True ) + '\r\n'
                    curr_notification_html += '<tr><td>' + pair[0] + '</td><td>' + locale.currency(pair[1], grouping=True ) + '</td></tr>'

                    row_count += 1
                    if row_count > rule.count:
                        break

                curr_notification_html += '</table>'
                if region == 'US':
                    curr_notification_html += 'Click <a href="https://www.adobservatory.org/nationalData/overview">here</a> to learn more.<br>'
                else:
                    curr_notification_html += 'Click <a href="https://www.adobservatory.org/stateData/' + state_code[region] + '/overview">here</a> to learn more.<br>'

                if rule.email not in result:
                    result[rule.email] = {'text':set(), 'html':set()}

                result[rule.email]['text'].add(curr_notification_text)
                result[rule.email]['html'].add(curr_notification_html)

    return result


#4 - New Topic for Advertiser in most recent time period
def NewTopicForAdvertiser(notify_rule_list):

    print('Got Rules of type 4')
    result = {}
    advertisers_to_emails = {}
    #parse rules
    for nr in notify_rule_list:
        if nr.page_id not in advertisers_to_emails:
            advertisers_to_emails[nr.page_id] = set()

        advertisers_to_emails[nr.page_id].add(nr.email)


    get_prior_ad_topics = ('select topic_name, min(page_name) from ads join ad_topics '
                           'on ads.archive_id = ad_topics.archive_id join topics '
                           'on ad_topics.topic_id = topics.topic_id  join impressions '
                           'on ads.archive_id = impressions.archive_id join pages '
                           'on ads.page_id = pages.page_id '
                           'where ads.page_id = %s and ad_delivery_start_time < %s '
                           'group by topic_name')

    get_curr_ad_topics = ('select topic_name, min(page_name) from ads join ad_topics '
                          'on ads.archive_id = ad_topics.archive_id join topics '
                          'on ad_topics.topic_id = topics.topic_id  join impressions '
                          'on ads.archive_id = impressions.archive_id join pages '
                          'on ads.page_id = pages.page_id '
                          'where ads.page_id = %s and ad_delivery_start_time >= %s '
                          'group by topic_name')


    #get topics
    for page_id, email_set in advertisers_to_emails.items():
        advertiser = None
        window_start_date = weekly_window_start_date
        notif_window_txt = week_ago_txt

        #get prior topics
        prior_topics = set()
        ads_cursor.execute(get_prior_ad_topics, (page_id, window_start_date))
        for row in ads_cursor:
            if not advertiser:
                advertiser = row['min']

            prior_topics.add(row['topic_name'])

        #get current topics
        curr_topics = set()
        ads_cursor.execute(get_curr_ad_topics, (page_id, window_start_date))
        for row in ads_cursor:
                curr_topics.add(row['topic_name'])

        #find current topics not in prior topics
        new_topics = curr_topics - prior_topics

        if new_topics:
            #write notification text
            notification_text = 'New Topics for ' + advertiser + ' since ' + notif_window_txt + ':\r\n'
            notification_html = '<h3>New Topics for ' + advertiser + ' since ' + notif_window_txt + ':</h3>'
            for topic in new_topics:
                notification_text += topic + '\r\n'
                notification_html += topic + '<br>'

            sponsor = advertiser.replace(' ', '__')
            sponsor = sponsor.replace('%', '**')
            notification_html += 'Click <a href="https://www.adobservatory.org/sponsors/'
            notification_html += str(page_id) + '/' + urllib.parse.quote(sponsor) + '">here</a> to learn more.<br>'
            for email in email_set:
                if email not in result:
                    result[email] = {'text':set(), 'html':set()}

                result[email]['text'].add(notification_text)
                result[email]['html'].add(notification_html)

    return result


#5 - New Ad Type for Advertiser in most recent time period
def NewAdTypeForAdvertiser(notify_rule_list):
    result = {}
    advertisers_to_emails = {}
    #parse rules
    for nr in notify_rule_list:
        if nr.page_id not in advertisers_to_emails:
            advertisers_to_emails[nr.page_id] = set()

        advertisers_to_emails[nr.page_id].add(nr.email)


    get_prior_ad_types = ('select ad_type, min(page_name) from ads join ad_metadata '
                           'on ads.archive_id = ad_metadata.archive_id join impressions '
                           'on ads.archive_id = impressions.archive_id join pages '
                           'on ads.page_id = pages.page_id '
                           'where ads.page_id = %s and ad_delivery_start_time < %s '
                           'group by ad_type')

    get_curr_ad_types = ('select ad_type, min(page_name) from ads join ad_metadata '
                          'on ads.archive_id = ad_metadata.archive_id join impressions '
                          'on ads.archive_id = impressions.archive_id join pages '
                          'on ads.page_id = pages.page_id '
                          'where ads.page_id = %s and ad_delivery_start_time >= %s '
                          'group by ad_type')



    #get timewindows
    for page_id, email_set in advertisers_to_emails.items():
        advertiser = None
        window_start_date = weekly_window_start_date
        notif_window_txt = week_ago_txt


        #get prior types 
        prior_ad_types = set()
        ads_cursor.execute(get_prior_ad_types, (page_id, window_start_date))
        for row in ads_cursor:
            if not advertiser:
                advertiser = row['min']

            prior_ad_types.add(row['ad_type'])

        #get current types
        curr_ad_types = set()
        ads_cursor.execute(get_curr_ad_types, (page_id, window_start_date))
        for row in ads_cursor:
                curr_ad_types.add(row['ad_type'])

        #find current ad types not in prior ad_types
        new_ad_types = curr_ad_types - prior_ad_types
        #don't count 'Unknown'
        new_ad_types = new_ad_types - set('Unknown')

        if new_ad_types:
            #write notification text
            notification_text = 'New Ad Types for ' + advertiser + ' since ' + notif_window_txt + ':\r\n'
            notification_html = '<h3>New Ad Types for ' + advertiser + ' since ' + notif_window_txt + ':</h3>'
            for type in new_ad_types:
                notification_text += type + '\r\n'
                notification_html += type + '<br>'

            sponsor = advertiser.replace(' ', '__')
            sponsor = sponsor.replace('%', '**')
            notification_html += 'Click <a href="https://www.adobservatory.org/sponsors/'
            notification_html += str(page_id) + '/' + urllib.parse.quote(sponsor) + '">here</a> to learn more.<br>'
            for email in email_set:
                if email not in result:
                    result[email] = {'text':set(), 'html':set()}

                result[email]['text'].add(notification_text)
                result[email]['html'].add(notification_html)

    return result

#6 - Page spend surge in region in most recent time period
def PageSpendSurge(notify_rule_list):
    #parse rules
    max_count = {}
    page_to_region_to_rules = {}
    for nr in notify_rule_list:
        #group the rules by page, and region (our query parameters)
        if nr.page_id not in page_to_region_to_rules:
            page_to_region_to_rules[nr.page_id] = {nr.region: set()}
        else:
            if nr.region not in page_to_region_to_rules[nr.page_id]:
                page_to_region_to_rules[nr.page_id][nr.region] = set()


        page_to_region_to_rules[nr.page_id][nr.region].add(nr)

    #current and previous period queries
    page_region_spend = ('select max(report_date) as report_date, sum(amount_spent) as page_spend, max(page_name) as page_name '
                         'from ad_library_report_pages join ad_library_reports '
                         'on ad_library_report_pages.ad_library_report_id '
                         '= ad_library_reports.ad_library_report_id '
                         'join pages on ad_library_report_pages.page_id = pages.page_id '
                         'where report_date = (select max(report_date) from ad_library_reports) '
                         'and geography = %s '
                         'and ad_library_report_pages.page_id = %s '
                         'and kind = %s')

    prev_page_region_spend = ('select max(report_date) as report_date, sum(amount_spent) as page_spend, max(page_name) as page_name '
                              'from ad_library_report_pages join ad_library_reports '
                              'on ad_library_report_pages.ad_library_report_id '
                              '= ad_library_reports.ad_library_report_id '
                              'join pages on ad_library_report_pages.page_id = pages.page_id '
                              'where geography = %s '
                              'and ad_library_report_pages.page_id = %s '
                              'and kind = %s '
                              'and report_date = %s')

    #query and build email text
    result = {}
    for page_id, region_to_rules in page_to_region_to_rules.items():
        for region, rule_set in region_to_rules.items():

                prior_spend = 0
                curr_spend = 0
                spend_delta = 0
                curr_page_name = ''
                prev_date = ''
                time_window = 'last_7_days'
                ads_cursor.execute(page_region_spend, (region, page_id, time_window))
                for row in ads_cursor:
                    curr_spend = row['page_spend']
                    curr_page_name = row['page_name']
                    max_date = row['report_date']
                    if max_date:#if this field is null, there was no page spend this week, so we can make no comparison
                        prev_date = max_date - datetime.timedelta(days=7)

                        ads_cursor.execute(prev_page_region_spend, (region, page_id, time_window, prev_date))
                        for row in ads_cursor:
                            prior_spend = row['page_spend']
                            if not prior_spend:
                                prior_spend = 0
                            spend_delta = curr_spend - prior_spend

                        #Check for spend surge; if so add email text
                        if spend_delta >= 100 and spend_delta >= (float(prior_spend) * .2):
                            notification_text = curr_page_name + " spending surged by " + locale.currency(spend_delta, grouping=True ) + "\r\n"
                            notification_html = "<h3>" + curr_page_name + " spending surged by " + locale.currency(spend_delta, grouping=True )
                            notification_html += " in " + region + "</h3>"
                            sponsor = curr_page_name.replace(' ', '__')
                            sponsor = sponsor.replace('%', '**')
                            notification_html += 'Click <a href="https://www.adobservatory.org/sponsors/'
                            notification_html += str(page_id) + '/' + urllib.parse.quote(sponsor) + '">here</a> to learn more.<br>'
                            for rule in rule_set:
                                if rule.email not in result:
                                    result[rule.email] = {'text':set(), 'html':set()}

                                result[rule.email]['text'].add(notification_text)
                                result[rule.email]['html'].add(notification_html)

    return result


#7 - Topic spend surge in region in most recent time period
def TopicSpendSurge(notify_rule_list):
    #parse rules
    max_count = {}
    region_to_rules = {}
    for nr in notify_rule_list:
        #group the rules by region(our query parameter)
        if nr.region not in region_to_rules:
            region_to_rules[nr.region] = set()

        region_to_rules[nr.region].add(nr)

    #queries
    get_curr_topic_spend = ('select topic_name, ad_delivery_start_time, last_active_date, '
                            'sum(spend_estimate * spend_percentage) as spend '
                            'from impressions join ads on impressions.archive_id = ads.archive_id '
                            'join ad_topics on ads.archive_id = ad_topics.archive_id '
                            'join topics on ad_topics.topic_id = topics.topic_id '
                    'join region_impressions on ads.archive_id = region_impressions.archive_id '
                            'where region = %s and last_active_date >= %s '
                            'group by topic_name, ad_delivery_start_time, last_active_date')
    
    get_curr_us_topic_spend = ('select topic_name, ad_delivery_start_time, last_active_date, '
                               'sum(spend_estimate) as spend '
                               'from impressions join ads on impressions.archive_id = ads.archive_id '
                               'join ad_topics on ads.archive_id = ad_topics.archive_id '
                               'join topics on ad_topics.topic_id = topics.topic_id '
                               'where last_active_date >= %s '
                               'group by topic_name, ad_delivery_start_time, last_active_date')

    #query and build email text
    result = {}
    for region, rule_set in region_to_rules.items():
        #find start date for previous and current time windows
        window_start_date = None
        prev_window_start_date = None

        notif_window_txt = ''
        window_start_date = weekly_window_start_date
        prev_window_start_date = week_ago - datetime.timedelta(days=7)
        prev_window_start_date = prev_window_start_date.strftime('%Y%m%d')
        notif_window_txt = week_ago_txt

        #get topic spend per day since start of previous time window
        if region == 'US':
            ads_cursor.execute(get_curr_topic_spend, (prev_window_start_date,))
        else:
            ads_cursor.execute(get_curr_topic_spend, (region, prev_window_start_date))

        prev_topic_spend = {}
        curr_topic_spend = {}
        for row in ads_cursor:
            topic = row['topic_name']
            spend_start = row['ad_delivery_start_time']
            spend_end = row['last_active_date']
            spend = 0
            if row['spend']:
                spend = row['spend']

            run_days = spend_end - spend_start
            run_days = run_days.days + 1
            if run_days < 1:
                run_days = 1

            spend_per_day = spend / run_days
            date_list = pd.date_range(start=spend_start, end=spend_end)
            prev_cutoff = datetime.datetime.strptime(prev_window_start_date, '%Y%m%d')
            cutoff = datetime.datetime.strptime(window_start_date, '%Y%m%d')
            for spend_day in date_list:
                if spend_day >= prev_cutoff and spend_day < cutoff and spend > 0:
                    if topic not in prev_topic_spend:
                        prev_topic_spend[topic] = spend_per_day
                    else:
                        prev_topic_spend[topic] += spend_per_day
                if spend_day >= cutoff and spend > 0:
                    if topic not in curr_topic_spend:
                        curr_topic_spend[topic] = spend_per_day
                    else:
                        curr_topic_spend[topic] += spend_per_day


        notification_text = 'Topic Spend Surge(s) for ' + region + ' since ' + notif_window_txt + '\r\n'
        notification_html = "<h3>Topic Spend Surge(s) for " + region + " since " + notif_window_txt + "</h3>"
        surges = False

        for topic, spend in curr_topic_spend.items():
            prior_spend = 0
            if topic in prev_topic_spend:
                prior_spend = prev_topic_spend[topic]

            spend_delta = spend - prior_spend
            if spend_delta >= 100 and spend_delta >= (float(prior_spend) * .2):
                print('region = ' + region)
                print('topic = ' + topic)
                print('spend_delta = ' + str(spend_delta))
                if not surges:
                    if region == 'US':
                        notification_html += 'Click <a href="https://www.adobservatory.org/nationalData/overview">here</a> to learn more.<br>'
                    else:
                        notification_html += 'Click <a href="https://www.adobservatory.org/stateData/' + state_code[region] + '/overview">here</a> to learn more.<br>'

                notification_text += topic + ':' + locale.currency(spend_delta, grouping=True ) + '\r\n'
                notification_html += topic + ':' + locale.currency(spend_delta, grouping=True ) + '<br>'
                surges = True


        if surges:
            for rule in rule_set:
                if rule.email not in result:
                    result[rule.email] = {'text':set(), 'html':set()}

                result[rule.email]['text'].add(notification_text)
                result[rule.email]['html'].add(notification_html)

    return result

#8 - overview of specified race
def RaceOverview(notify_rule_list):
    print('Got Rules of type 8')
    races_to_emails = {}
    #parse rules
    for nr in notify_rule_list:
        if nr.race not in races_to_emails:
            races_to_emails[nr.race] = set()

        races_to_emails[nr.race].add(nr.email)

    #query and build email text
    result = {}
    for race, email_set in races_to_emails.items():
        #define query templates
        race_spenders_query_template = ('select max(state) as state, max(office) as office, max(report_date) as report_date, page_name, sum(amount_spent) as page_spend '
                                        'from ad_library_report_pages '
                                        'join ad_library_reports using (ad_library_report_id) '
                                        'join pages using(page_id) '
                                        'join race_pages using(page_id) '
                                        'join races using (race_id) '
                                        'where report_date = (select max(report_date) from ad_library_reports) '
                                        'and geography = %s '
                                        'and kind = %s '
                                        'and  race_id = %s '
                                        'group by page_name '
                                        'order by page_spend desc')

        
        ads_cursor.execute(race_spenders_query_template, ('US', 'last_7_days', race))
        results = ads_cursor.fetchall()
        date_set = False
        curr_notification_html = ''
        for row in results:
            if not date_set:
                notification_text = 'Totals for candidate spending on Facebook ads in the ' + race + ' race for the 7 days ending ' 
                curr_notification_text = notification_text + str(row['report_date']) + '\r\n'
                curr_notification_html = '<h3>' + notification_text + str(row['report_date']) + '</h3>'
                curr_notification_html += '<table>'
                curr_notification_html += '<tr><th>Facebook Page</th><th>Amount Spent</th></tr>'
                date_set = True

            curr_notification_text += row['page_name'] + ': ' + locale.currency( row['page_spend'], grouping=True ) + '\r\n'
            curr_notification_html += '<tr><td>' + row['page_name'] + '</td><td>'
            curr_notification_html += locale.currency( row['page_spend'], grouping=True ) + '</td></tr>'

            office = row['office'].replace(' ','')
            office = office.replace('.','')
            statecode = state_code[row['state']]

        if date_set:
            curr_notification_html += '</table>'
            if statecode == 'US':
                curr_notification_html += 'Click <a href="https://www.adobservatory.org/nationalData/presidential">here</a> to learn more.<br>'
            else:
                curr_notification_html += 'Click <a href="https://www.adobservatory.org/stateElectionsData/' + statecode
                curr_notification_html += '/' + office + '/' + race + '">here</a> to learn more.<br>'

            for email in email_set:
                if email not in result:
                    result[email] = {'text':set(), 'html':set()}

                result[email]['text'].add(curr_notification_text)
                result[email]['html'].add(curr_notification_html)

    return result

compute = {
    1: TopSpenders,
    2: TopSpendersState,
    3: TopTopicsState,
    4: NewTopicForAdvertiser,
    5: NewAdTypeForAdvertiser,
    6: PageSpendSurge,
    7: TopicSpendSurge,
    8: RaceOverview
    }

def compute_notifications(rule_type,rules):
    return compute.get(rule_type)(rules)

#get rules
notify_rules = {}
today = datetime.datetime.today().strftime('%A')
if today == 'Monday':#Monday is the day we do weekly fire emails
    notifications_query = 'select type_id, email, page_id, region, topic, race, count, time_window from notifications'
    cursor.execute(notifications_query)
else:
    notifications_query = ('select type_id, email, page_id, region, topic, race, count, time_window from notifications where fire_frequency = \'daily\'')
    cursor.execute(notifications_query)

for row in cursor:
    note_type = int(row['type_id'])
    note_email = row['email']
    note_page = row['page_id']
    note_region = row['region']
    note_topic = row['topic']
    note_race = row['race']
    note_count = row['count']

    new_rule = notify_rule(note_email, note_page, note_topic, note_race, note_region, note_count)
    if note_type not in notify_rules:
         notify_rules[note_type] = set()

    notify_rules[note_type].add(new_rule)


#Compute notifications
notifications = {}
for rule_type, rules in notify_rules.items():
    new_notifications = compute_notifications(rule_type, rules)
    for key, value in new_notifications.items():
        if key in notifications:
            notifications[key]['text'] = notifications[key]['text'] | value['text']
            notifications[key]['html'] = notifications[key]['html'] | value['html']
        else:
            notifications[key] = value


#Email sending time
SENDER = "NYU Ad Observatory Notifications <notifications@adobservatory.org>"
CONFIGURATION_SET = "AdObserverNotifications"
AWS_REGION = "us-east-1"
SUBJECT = "Ad Observer Notifications"


for recipient, body_dict in notifications.items():
    body_html = """<html>
    <head>
    <style>
    h3 {font-family: arial, sans-serif;}

    table {
      font-family: arial, sans-serif;
      border-collapse: collapse;
      width: 100%;
    }

    td, th {text-align: right;}
    </style>
    </head>
    <body>
    <p>"""
    for line in body_dict['html']:
        body_html += line 
        body_html += """<br>"""

    body_html +=  """</p>"""
    body_html += """<p>You are receiving this alert because you signed up at NYU Ad Observatory. """
    body_html += """Click <a href="https://www.adobservatory.org/notifications">here</a> to change, add, or stop notifications. """
    body_html += """These notifications are made possible with support from <a href="https://iddp.gwu.edu/">"""
    body_html += """Institute for Data, Democracy & Politics</a>. """
    body_html += """Questions about what you’re seeing? Contact us at info@adobservatory.org.</p>"""
    body_html += """<img src="https://www.adobservatory.org/static/media/iddp_logo.5e39827c.png" alt="img"/>"""
    body_html += """</body></html>"""

    body_text = '\r\n'.join(body_dict['text'])


    # The character encoding for the email.
    CHARSET = "UTF-8"

    # Create a new SES resource and specify a region.
    client = boto3.client('ses',region_name=AWS_REGION)

    # Try to send the email.
    try:
        #Provide the contents of the email.
        response = client.send_email(
            Destination={
                'ToAddresses': [
                    recipient,
                ],
            },
            Message={
                'Body': {
                    'Html': {
                        'Charset': CHARSET,
                        'Data': body_html,
                    },
                    'Text': {
                        'Charset': CHARSET,
                        'Data': body_text,
                    },
                },
                'Subject': {
                    'Charset': CHARSET,
                    'Data': SUBJECT,
                },
            },
            Source=SENDER,
            ConfigurationSetName=CONFIGURATION_SET,
        )
    # Display an error if something goes wrong.
    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        print("Email sent! Message ID:"),
        print(response['MessageId'])
        print(recipient)

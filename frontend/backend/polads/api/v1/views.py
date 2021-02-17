from collections import OrderedDict
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

import requests
from rest_framework.views import APIView
from rest_framework.response import Response


@method_decorator(csrf_exempt, name='dispatch')
class PoladsBaseMixin(APIView):
    base_api_url = settings.POLADS_BASE_API_URL

    def _get_path(self):
        # Get Polads API path from current path (we exclude /api/v1)
        polads_path = self.request.path[7:]
        return self.base_api_url + polads_path


class BaseProxyPostMixin(PoladsBaseMixin):

    def _request_post(self, data):

        return requests.post(
            self._get_path(),
            data=data,
            headers={
                'Authorization': settings.POLADS_API_TOKEN
            }
        )

    def post(self, request, *args, **kwargs):
        try:
            req_polads = self._request_post(request.data)
            req_polads.raise_for_status()
        except requests.exceptions.HTTPError as e:
            return Response(
                e.response.text,
                status=e.response.status_code
            )

        # Handle 204 no content error on json decode
        if req_polads.status_code == 204:
            return Response(
                req_polads.text,
                status=req_polads.status_code
            )

        return Response(
            req_polads.json(),
            status=req_polads.status_code
        )


class BaseProxyPoladsView(PoladsBaseMixin):

    def _request_get(self, query_parameters):

        return requests.get(
            self._get_path(),
            params=query_parameters,
            headers={
                'Authorization': settings.POLADS_API_TOKEN
            }
        )

    def get(self, request, *args, **kwargs):
        try:
            # Request to Polads API
            req_polads = self._request_get(request.GET)
            req_polads.raise_for_status()
        except requests.exceptions.HTTPError as e:
            return Response(
                e.response.text,
                status=e.response.status_code
            )

        # Handle 204 no content error on json decode
        if req_polads.status_code == 204:
            return Response(
                req_polads.text,
                status=req_polads.status_code
            )

        return Response(
            req_polads.json(),
            status=req_polads.status_code
        )


class TotalSpendByPageOfRegion(BaseProxyPoladsView):
    """
    Total Spend by Page of Region
    URL parameters:
        region name: string type {"US"} or {“New York”, “Georgia”, “Connecticut”, “Colorado”, … }
    parameters:
        start_date: date type (optional)
    output: JSON object in the format:
        {
            "spenders": [
                {
                    "page_name": "SEIU",
                    "page_id": 1234567890,
                    "opensecrets_id": "abcd1234",
                    "disclaimer": "Service Employees International Union",
                    "spend": 123456
                },
                {
                    "page_name": "Unite for Colorado",
                    "page_id": 1234567890,
                    "opensecrets_id": "abcd1234",
                    "disclaimer": "Unite for Colorado, LLC",
                    "spend": 23456
                },
                ...
            ],
            "start_date": "2020-06-01",
            "state": "CO"
        }
    Page used on:
        State spending categorized by organization/sponsor page (no selection)
        National Spending categorized by organization/sponsor (no selection)
    """
    pass


class TotalSpendOfPageOfRegion(BaseProxyPoladsView):
    """
    Total Spend of Page of Region
    URL parameters:
        page_id: int type
        region_name: string type {"US"} or {“New York”, “Georgia”, “Connecticut”, “Colorado”, … }
    page_id: int type
        region_name: string type {"US"} or {“New York”, “Georgia”, “Connecticut”, “Colorado”, … }
    parameters:
        start_date : date type (optional)
    output: JSON object in the format:
        {
            "spenders": [
                {
                    "page_name": "John W. Hickenlooper",
                    "disclaimer": "Hickenlooper for Senate",
                    "spend": 123456,
                    "page_id": 1234567890,
                    "opensecrets_id": "abcd1234",
                },
                ...
            ],
            "start_date": "2020-06-01",
            "state": "CO"
        }
    Pages used on:
        State spending categorized by organization/sponsor page  (individual spender selected)
        National Spending categorized by organization/sponsor (individual spender selected)
    """
    pass

class TotalSpendOfPageByRegion(BaseProxyPoladsView):
    """
    URL parameters:
    * page_id: int type
    parameters:
    * start_date : date type (optional)
    output: JSON object in the format:
    {
        "spend_by_region": [
            {
                "page_name": "John W. Hickenlooper",
                "spend": 123456,
                "page_owner": 1234567890,
                "disclaimers": ["Hickenlooper for Senate"],
                "page_ids": [1234567890,],
                "opensecrets_id": "abcd1234",
                "region_name": "Colorado"
            },
            {
                "page_name": "John W. Hickenlooper",
                "spend": 1234,
                "page_id": 1234567890,
                "disclaimers": ["Hickenlooper for Senate"],
                "page_ids": [1234567890,],
                "opensecrets_id": "abcd1234",
                "region_name": "Nevada"
            }
            ...
        ],
        "start_date": "2020-06-01",
        "page_id": 1234567890,
    }
    Pages used on:
    * State spending categorized by organization/sponsor page  (individual spender selected)
    * National Spending categorized by organization/sponsor (individual spender selected)
    """
    pass


class SpendByTimePeriodOfPageOfRegion(BaseProxyPoladsView):
    """
    Spend by Time Period of Page of Region
    URL parameters:
    * page_id: int type, I think this is just the same as the FB page_id except rolling up Trump’s 10 or so pages and Biden’s eventual 2+ (Biden + VP) into a single spender page.
    * region_name: string type {"US"} or {“New York”, “Georgia”, “Connecticut”, “Colorado”, … }
    Parameters:
    * start_date (optional, default 3mo ago)
    * time_unit (optional, default week)
    output: JSON object in the format:
        {
            "spend_by_week": [
                    {
                        "week": "2020-06-22",
                        "spend": 23456
                    },
                    {
                        "week": "2020-06-15",
                        "spend": 34567
                    }
                    ...
            ]
            "time_unit": "week",
            "date_range": ["2020-06-22", "2020-03-22"]
            "spender_id": 97493741436
        }
    Pages used on:
    * State spending categorized by organization/sponsor page  (individual spender selected)
    * National Spending categorized by organization/sponsor (individual spender selected)
    * State spending categorized by spender  (individual spender selected)
    """
    pass


class TotalSpendByTopicOfRegion(BaseProxyPoladsView):
    """
    Total Spend by Topic of Region
    URL parameters
    * region_name: string type {"US"} or {“New York”, “Georgia”, “Connecticut”, “Colorado”, … }
    parameters
    * start_date: date type (optional)
    output JSON object in the format:
        {
            "spend_by_topic": [
                {
                    "topic_name": "Economy",
                    "spend": 123456
                },
                {
                    "topic_name": "Covid-19",
                    "spend": 23456
                },
                ...
            ],
            "start_date": "2020-06-01",
            "state": "Colorado"
        }
    Page used on
    * State spending categorized by organization/sponsor page (no selection)
    """
    pass


class SpendByTimePeriodByTopicOfPage(BaseProxyPoladsView):
    """
    Spend by Time Period by Topic of Page
        NOTE: The earliest allowable start date is 6/23/2020.
    URL parameters:
        page_id: int type
    parametqers:
        start_date (optional, default 3mo ago). Earliest allowable: 6/23/2020
        time_unit (optional, default week))
    output: JSON object in the format:
        {
            "spend_by_time_period": {
                "Economy": [
                    {
                        "time_period": "2020-06-22",
                        "spend": 23456
                    },
                    {
                        "time_period": "2020-06-15",
                        "spend": 34567
                    }
                ],
                "Covid-19": [
                    {
                        "time_period": "2020-06-22",
                        "spend": 4568
                    },
                    {
                        "time_period": "2020-06-15",
                        "spend": 7897
                    }
                ],
                "Iran": [
                    {
                        "time_period": "2020-06-22",
                        "spend": 4568
                    },
                    {
                        "time_period": "2020-06-15",
                        "spend": 7897
                    }
                ],
            }
            "time_unit": "week",
            "date_range": ["2020-06-22", "2020-03-22"],
            "page_id": 1087654321
        }
    Pages used on:
        State spending categorized by spender  (individual spender selected)
        National Spending categorized by organization/sponsor (individual spender selected)
    """
    pass


class SpendByTimePeriodOfTopicOfRegion(BaseProxyPoladsView):
    """
    Spend by Time Period of Topic of Region
    URL parameters
        topic_name: string type
        region_name: string type {"US"} or {“New York”, “Georgia”, “Connecticut”, “Colorado”, … }
    parameters:
        start_date (optional, default 3mo ago)
        time_unit (optional, default week)
    output: JSON object in the format:
        {
            "spend_by_week": [
                    {
                        "week": "2020-06-22",
                        "spend": 23456
                    },
                    {
                        "week": "2020-06-15",
                        "spend": 34567
                    }
            ]
            "time_unit": "week",
            "date_range": ["2020-06-22", "2020-03-22"]
            "topic_name": "Economy"
        }
    Pages used on:
        National Spending by Topic
        State spending by topic
    """
    pass

class SpendByTimePeriodByTopicOfPageOfRegion(BaseProxyPoladsView):
    """
    Spend by Time Period by Topic of Page of Region
    URL parameters
        page_id: string type
        region_name: string type {"US"} or {“New York”, “Georgia”, “Connecticut”, “Colorado”, … }
    parameters:
        start_date (optional, default 3mo ago)
    """
    pass

class SpendByTimePeriodByPurposeOfPageOfRegion(BaseProxyPoladsView):
    """
    Spend by Time Period by Purpose of Page of Region
    URL parameters
        page_id: string type
        region_name: string type {"US"} or {“New York”, “Georgia”, “Connecticut”, “Colorado”, … }
    parameters:
        start_date (optional, default 3mo ago)
    """
    pass


class TotalSpendByPurposeOfPage(BaseProxyPoladsView):
    """
    Total Spend by Purpose of Page
    URL parameters:
        page_id: int type
    Parameters:
        date_range: date type (optional)
    output: JSON object in the format:
        {
        "spend_by_purpose": [
                    {
                        "purpose": "MOTIVATE",
                        "spend": 23456,
                    },
                    {
                        "purpose": "DONATE",
                        "spend": 34567,
                    },
                    ...
            ]
            "start_date": "2020-06-01",
            "spender_id": 12345678
        }
    Pages used on:
        National Spending categorized by organization/sponsor (individual spender selected)
    """
    pass


class TotalSpendByPurposeOfRegion(BaseProxyPoladsView):
    """
    Total Spend by Purpose of Region
    URL parameters:
        region_name: string
    Parameters:
        start_date: date type (optional)
    output: JSON object in the format:
        {
        "spend_by_purpose": [
                    {
                        "purpose": "MOTIVATE",
                        "spend": 23456,
                    },
                    {
                        "purpose": "DONATE",
                        "spend": 34567,
                    },
                    ...
            ]
            "start_date": "2020-06-01",
            "region_name": Colorado
        }
    Pages used on:
        State spending categorized by spender  (individual spender selected)
    """
    pass

class TotalSpendByPurposeOfPageOfRegion(BaseProxyPoladsView):
    """
    Total Spend by Purpose of Region
    URL parameters:
    * region_name: string
    * page_id: int type
    Parameters:
    * start_date: date type (optional)
    output: JSON object in the format:
	{
		"start_date": "2020-07-01",
		"page_id": 109451340732702,
		"region_name": "US",
		"spend_by_purpose": [
			{
				"spend": 953.1,
				"purpose": "Persuade"
			},
			{
				"spend": 411.11,
				"purpose": "Donate"
			},
			{
				"spend": 391.41,
				"purpose": "Buy"
			},
			{
				"spend": 152.13,
				"purpose": "Connect"
			},
			{
				"spend": 100.25,
				"purpose": "Show Up"
			}
		]
	}
    """
    pass


class SpendByTargetingOfRegion(BaseProxyPoladsView):
    """
    Spend by Targeting of Region
    URL parameters
    * region_name: string type {"US"} or {“New York”, “Georgia”, “Connecticut”, “Colorado”, … }
    Parameters:
    * date_range: date type (optional)
    Output: JSON object in the format:
        {
            "targeting": [
                {
                    "category": "Gender",
                    "subcategory": "men",
                    "spend": 1234
                },
                {
                    "category": "Segment",
                    "subcategory": "US politics (liberal)",
                    "spend": 234
                },
                ...
            ],
            "since": "2020-06-01",
            "state_name": "Colorado"
        }
    Page used on:
    * State spending categorized by organization/sponsor page (no selection)
    * national spending by organization/sponsor page
    """
    pass


class SpendByTargetingOfPage(BaseProxyPoladsView):
    """
    Spend by Targeting of Page
    URL parameters:
    * page_id: int type
    Parameters:
    * date_range: date type (optional)
    Output: JSON object in the format:
        {
            "targeting": [
                {
                    "category": "Gender",
                    "subcategory": "men",
                    "count": 1234
                },
                {
                    "category": "Segment",
                    "subcategory": "US politics (liberal)",
                    "count": 234
                },
                ...
            ],
            "since": "2020-06-01",
            "spender_id": 97493741436
        }
    Pages used on:
        State spending categorized by spender  (individual spender selected)
        National Spending categorized by organization/sponsor (individual spender selected)
    """
    pass


class CountOfTargetingTypesSeenOfPage(BaseProxyPoladsView):
    """
    Percentage of Targeting Seen of Page
    URL parameters:
    * page_id: int type
    Parameters:
    * start_date: date type (optional)
        {
            "page_id": 111428049989,
            "start_date": "2020-07-01",
            "targeting": [
                            {
                                category: "AGE_GENDER",
                                subcategory: "6-53 ANY",
                                count: 23
                            },
                            ...
                         ]
        }
    """
    pass


class GetAds(BaseProxyPoladsView):
    """
    Search
    Parameters:
        * full_text_search: string type
        * race_id: string type, Open Secrets Race ID {“NY08”, “GAS1”, “KS01”} (these are defined by OpenSecrets but are basically state_abbrev, plus {S1, S2} for Senate, {01 … 52} for House seats, and with our homegrown extension G1 for governor. )
        * region: string type {“New York”, “Georgia”, “Connecticut”, “Colorado”, … } for national ALL
        * ~~ spender_id: int type, I think this is just the same as the FB page_id except rolling up Trump’s 10 or so pages and Biden’s eventual 2+ (Biden + VP) into a single spender page. ~~
        * ~~ disclaimer: string type ~~
        * topic: int type topic ID (should not be used with `page_id` or `full_text_search` in same request)
        * ~~ purpose_id: int type ~~
        * startDate: date type earliest date of ad creation to include. accepted formats %Y-%m-%d or %Y-%m-%dT%H:%M:%S.%fZ
        * endDate: date type latest date of ad creation to include. accepted formats %Y-%m-%d or %Y-%m-%dT%H:%M:%S.%fZ
        * page_id: int type (optional, default 1)
        * numResults: int type (optional, default 50)
        * output format: {CSV, JSON} currently only JSON implemented
    Output: JSON object in the format:
        [
          {
            "ad_cluster_id": 466297,
            "canonical_archive_id": 198378324950174,
            "start_date": "2020-01-06",
            "end_date": "2020-07-15",
            "total_spend": "$4.3 million - $5.3 million",
            "total_impressions": "500.8 million - 215.4 million",
            "url": "https://storage.googleapis.com/facebook_ad_archive_screenshots/198378324950174.png",
            "cluster_size": "1,360",
            "num_pages": "53",
            "user_feedback_label_name": null
          },
          {
            "ad_cluster_id": 462494,
            "canonical_archive_id": 207502060462600,
            "start_date": "2020-01-02",
            "end_date": "2020-07-14",
            "total_spend": "$495,100 - $715,155",
            "total_impressions": "68.7 million - 70.7 million",
            "url": "https://storage.googleapis.com/facebook_ad_archive_screenshots/207502060462600.png",
            "cluster_size": "1,245",
            "num_pages": "1",
            "user_feedback_label_name": null
          }
        ]
    Output: CSV format, one row per cluster
        race_name,page_name,funding_entity,min_spend,max_spend,spend_estimate,min_impressions,max_impressions,purposes,topics,ad_creative_body,ad_creative_link_caption,ad_creative_link_title,ad_creative_link_description,region_proportion
        Colorado Senate,John W. Hickenlooper,Friends of Heckenlooper,10000,15000,12345,12345600,13456780,"motivate","economy,Trump","blah blah blah", "blah blah", "blah blah", "blah blah",0.70
        get ad cluster
    """
    pass


class GetAddDetais(BaseProxyPoladsView):
    """
    Get ad cluster
    N.B.: cluster IDs are transient so we can’t really use those as IDs, so /archive-id/:archive_id/cluster redirects to /getaddetails/:ad_cluster_id where ad_cluster_id is the ID of the current cluster which contains archive_id
    Parameters:
    * archive_id: int type
    * page: int type (optional, default 1)
    * page_size: int type (optional, default 50)
    Output: JSON object in the format:
        {
          "ad_cluster_id":464422,
          "advertiser_info":
            [
              {
                "advertiser_fec_id":null,
                "advertiser_party":"Non-affiliated",
                "advertiser_risk_score":"0.734702",
                "advertiser_type":"Government Agency",
                "advertiser_webiste":"https://www.facebook.com/uscensusbureau/"
              },
              {
                "advertiser_fec_id":null,
                "advertiser_party":null,
                "advertiser_risk_score":"0.750000",
                "advertiser_type":null,
                "advertiser_webiste":null
              }
            ],
          "alternative_ads":
            [3102899219754337,229619601597571,249529736356165,282866519500582,532394614108893,326962598332969,640610946490974,2502069606773548,723565558389486,231975831358365,610221009914480,3300290120015667,560763814629684,542799606651894,802531313605047,1055251444874621,265669744581278],
          "canonical_archive_id":326962598332969,
          "cluster_size":17,
          "demo_impression_results":
          [
            {"age_group":"13-17","gender":"unknown","max_impressions":3,"max_spend":"0.16","min_impressions":4,"min_spend":"0.12"},{"age_group":"18-24","gender":"female","max_impressions":459873,"max_spend":"21255.52","min_impressions":1025365,"min_spend":"17950.23"},{"age_group":"18-24","gender":"male","max_impressions":333684,"max_spend":"13536.85","min_impressions":801003,"min_spend":"11325.52"},{"age_group":"18-24","gender":"unknown","max_impressions":2654,"max_spend":"126.60","min_impressions":6169,"min_spend":"107.33"},{"age_group":"25-34","gender":"female","max_impressions":538567,"max_spend":"24501.04","min_impressions":1249422,"min_spend":"20535.38"},{"age_group":"25-34","gender":"male","max_impressions":612481,"max_spend":"23101.12","min_impressions":1453767,"min_spend":"19169.29"},{"age_group":"25-34","gender":"unknown","max_impressions":4947,"max_spend":"208.39","min_impressions":11523,"min_spend":"175.60"},{"age_group":"35-44","gender":"female","max_impressions":360751,"max_spend":"14802.73","min_impressions":839252,"min_spend":"12301.98"},{"age_group":"35-44","gender":"male","max_impressions":438437,"max_spend":"13939.20","min_impressions":966549,"min_spend":"11483.95"},{"age_group":"35-44","gender":"unknown","max_impressions":4488,"max_spend":"155.49","min_impressions":9955,"min_spend":"130.19"},{"age_group":"45-54","gender":"female","max_impressions":226994,"max_spend":"8527.07","min_impressions":482025,"min_spend":"7030.81"},{"age_group":"45-54","gender":"male","max_impressions":286531,"max_spend":"8242.67","min_impressions":545647,"min_spend":"6778.33"},{"age_group":"45-54","gender":"unknown","max_impressions":2542,"max_spend":"81.55","min_impressions":5282,"min_spend":"68.07"},{"age_group":"55-64","gender":"female","max_impressions":161606,"max_spend":"5046.06","min_impressions":306136,"min_spend":"4159.80"},{"age_group":"55-64","gender":"male","max_impressions":165108,"max_spend":"4076.07","min_impressions":269328,"min_spend":"3353.77"},{"age_group":"55-64","gender":"unknown","max_impressions":1748,"max_spend":"48.36","min_impressions":3096,"min_spend":"40.34"},{"age_group":"65+","gender":"female","max_impressions":92974,"max_spend":"2680.20","min_impressions":167082,"min_spend":"2197.48"},{"age_group":"65+","gender":"male","max_impressions":86139,"max_spend":"2018.26","min_impressions":148827,"min_spend":"1662.38"},{"age_group":"65+","gender":"unknown","max_impressions":1456,"max_spend":"35.64","min_impressions":2579,"min_spend":"29.53"}
          ],
          "entities":"2020, 2020, distance, 2020Census, Estamos, el correo, casa pasando la gasolinera, B\u00fascalo y responde hoy mismo, el formulario del Censo del 2020 frente a las casas de las personas que no tienen una direcci\u00f3n com\u00fan, o viven, Box para recibir, Comparte este mensaje con tu comunidad, usan un P.O.",
          "funding_entity": ["COLLINS FOR SENATOR","U.S. Census Bureau"],
          "num_pages":2,
          "region_impression_results":
             [
               {"max_impressions":100761,"max_spend":"2632.17","min_impressions":185838,"min_spend":"2224.90","region":"Alabama"},{"max_impressions":10607,"max_spend":"293.09","min_impressions":21511,"min_spend":"247.21","region":"Alaska"},{"max_impressions":158280,"max_spend":"5712.67","min_impressions":227985,"min_spend":"4437.38","region":"Arizona"},{"max_impressions":34623,"max_spend":"1460.54","min_impressions":89283,"min_spend":"1238.80","region":"Arkansas"},{"max_impressions":246281,"max_spend":"17038.78","min_impressions":888363,"min_spend":"14120.33","region":"California"},{"max_impressions":70562,"max_spend":"2888.83","min_impressions":137726,"min_spend":"2327.14","region":"Colorado"},{"max_impressions":23560,"max_spend":"1353.71","min_impressions":81744,"min_spend":"1152.54","region":"Connecticut"},{"max_impressions":7501,"max_spend":"320.31","min_impressions":20300,"min_spend":"272.18","region":"Delaware"},{"max_impressions":153450,"max_spend":"7169.00","min_impressions":471069,"min_spend":"6072.81","region":"Florida"},{"max_impressions":117486,"max_spend":"4255.63","min_impressions":267438,"min_spend":"3599.47","region":"Georgia"},{"max_impressions":2615,"max_spend":"227.95","min_impressions":9097,"min_spend":"194.10","region":"Hawaii"},{"max_impressions":14937,"max_spend":"538.51","min_impressions":31501,"min_spend":"456.18","region":"Idaho"},{"max_impressions":128682,"max_spend":"5149.72","min_impressions":299969,"min_spend":"4375.51","region":"Illinois"},{"max_impressions":70975,"max_spend":"3059.55","min_impressions":167770,"min_spend":"2602.45","region":"Indiana"},{"max_impressions":38220,"max_spend":"1315.80","min_impressions":77823,"min_spend":"1118.78","region":"Iowa"},{"max_impressions":29747,"max_spend":"1332.80","min_impressions":75189,"min_spend":"1118.77","region":"Kansas"},{"max_impressions":73346,"max_spend":"2322.16","min_impressions":142986,"min_spend":"1971.05","region":"Kentucky"},{"max_impressions":72905,"max_spend":"2074.71","min_impressions":142625,"min_spend":"1756.48","region":"Louisiana"},{"max_impressions":86005,"max_spend":"1187.47","min_impressions":86256,"min_spend":"1042.53","region":"Maine"},{"max_impressions":38090,"max_spend":"1962.06","min_impressions":112274,"min_spend":"1669.95","region":"Maryland"},{"max_impressions":74722,"max_spend":"2167.14","min_impressions":149167,"min_spend":"1835.80","region":"Massachusetts"},{"max_impressions":105629,"max_spend":"3586.19","min_impressions":190169,"min_spend":"3052.25","region":"Michigan"},{"max_impressions":44734,"max_spend":"1603.00","min_impressions":91421,"min_spend":"1365.25","region":"Minnesota"},{"max_impressions":70404,"max_spend":"1856.19","min_impressions":123250,"min_spend":"1570.86","region":"Mississippi"},{"max_impressions":48945,"max_spend":"2258.52","min_impressions":117775,"min_spend":"1919.77","region":"Missouri"},{"max_impressions":7227,"max_spend":"306.29","min_impressions":16027,"min_spend":"260.15","region":"Montana"},{"max_impressions":20361,"max_spend":"772.06","min_impressions":48383,"min_spend":"656.20","region":"Nebraska"},{"max_impressions":15485,"max_spend":"1152.80","min_impressions":58800,"min_spend":"967.42","region":"Nevada"},{"max_impressions":14464,"max_spend":"344.85","min_impressions":23410,"min_spend":"291.89","region":"New Hampshire"},{"max_impressions":43526,"max_spend":"3171.66","min_impressions":180527,"min_spend":"2703.18","region":"New Jersey"},{"max_impressions":81047,"max_spend":"2587.80","min_impressions":108716,"min_spend":"1983.53","region":"New Mexico"},{"max_impressions":126725,"max_spend":"6988.71","min_impressions":450883,"min_spend":"5935.33","region":"New York"},{"max_impressions":159111,"max_spend":"4297.60","min_impressions":319539,"min_spend":"3614.55","region":"North Carolina"},{"max_impressions":7034,"max_spend":"293.99","min_impressions":15362,"min_spend":"250.04","region":"North Dakota"},{"max_impressions":117890,"max_spend":"4650.52","min_impressions":243615,"min_spend":"3957.95","region":"Ohio"},{"max_impressions":60923,"max_spend":"1816.20","min_impressions":120222,"min_spend":"1513.93","region":"Oklahoma"},{"max_impressions":18260,"max_spend":"1156.44","min_impressions":63264,"min_spend":"983.68","region":"Oregon"},{"max_impressions":100161,"max_spend":"4252.96","min_impressions":231491,"min_spend":"3617.17","region":"Pennsylvania"},{"max_impressions":15496,"max_spend":"348.70","min_impressions":29274,"min_spend":"294.45","region":"Rhode Island"},{"max_impressions":122002,"max_spend":"1945.39","min_impressions":184620,"min_spend":"1634.52","region":"South Carolina"},{"max_impressions":11050,"max_spend":"362.33","min_impressions":22048,"min_spend":"307.67","region":"South Dakota"},{"max_impressions":87158,"max_spend":"3152.04","min_impressions":199625,"min_spend":"2674.15","region":"Tennessee"},{"max_impressions":640519,"max_spend":"18895.57","min_impressions":1124823,"min_spend":"15070.94","region":"Texas"},{"max_impressions":12,"max_spend":"1.30","min_impressions":33,"min_spend":"1.12","region":"Unknown"},{"max_impressions":19120,"max_spend":"1021.78","min_impressions":52797,"min_spend":"850.97","region":"Utah"},{"max_impressions":6189,"max_spend":"122.33","min_impressions":10634,"min_spend":"102.99","region":"Vermont"},{"max_impressions":75864,"max_spend":"3411.25","min_impressions":200266,"min_spend":"2902.21","region":"Virginia"},{"max_impressions":111260,"max_spend":"4143.74","min_impressions":178984,"min_spend":"3278.80","region":"Washington"},{"max_impressions":2697,"max_spend":"269.53","min_impressions":14165,"min_spend":"229.65","region":"Washington, District of Columbia"},{"max_impressions":25592,"max_spend":"826.92","min_impressions":52865,"min_spend":"698.90","region":"West Virginia"},{"max_impressions":64677,"max_spend":"2137.29","min_impressions":122663,"min_spend":"1818.33","region":"Wisconsin"},{"max_impressions":4054,"max_spend":"186.19","min_impressions":11450,"min_spend":"157.93","region":"Wyoming"}
             ],
          "topics":"2020 Census, Political persuading / broken system",
          "type":"CONNECT, DONATE, INFORM",
          "url":"https://storage.googleapis.com/facebook_ad_archive_screenshots/326962598332969.png"
        }
    """
    pass


class ArchiveId(BaseProxyPoladsView):
    """
    Get ad cluster (Archive Id)
        N.B.: cluster IDs are transient so we can’t really use those as IDs, so /archive-id/:archive_id/cluster redirects to /getaddetails/:ad_cluster_id where ad_cluster_id is the ID of the current cluster which contains archive_id
    Parameters:
        * archive_id: int type
        * page: int type (optional, default 1)
        * page_size: int type (optional, default 50)
    Output: JSON object in the format:
        {
          "ad_cluster_id":464422,
          "advertiser_info":
            [
              {
                "advertiser_fec_id":null,
                "advertiser_party":"Non-affiliated",
                "advertiser_risk_score":"0.734702",
                "advertiser_type":"Government Agency",
                "advertiser_webiste":"https://www.facebook.com/uscensusbureau/"
              },
              {
                "advertiser_fec_id":null,
                "advertiser_party":null,
                "advertiser_risk_score":"0.750000",
                "advertiser_type":null,
                "advertiser_webiste":null
              }
            ],
          "alternative_ads":
            [3102899219754337,229619601597571,249529736356165,282866519500582,532394614108893,326962598332969,640610946490974,2502069606773548,723565558389486,231975831358365,610221009914480,3300290120015667,560763814629684,542799606651894,802531313605047,1055251444874621,265669744581278],
          "canonical_archive_id":326962598332969,
          "cluster_size":17,
          "demo_impression_results":
          [
            {"age_group":"13-17","gender":"unknown","max_impressions":3,"max_spend":"0.16","min_impressions":4,"min_spend":"0.12"},{"age_group":"18-24","gender":"female","max_impressions":459873,"max_spend":"21255.52","min_impressions":1025365,"min_spend":"17950.23"},{"age_group":"18-24","gender":"male","max_impressions":333684,"max_spend":"13536.85","min_impressions":801003,"min_spend":"11325.52"},{"age_group":"18-24","gender":"unknown","max_impressions":2654,"max_spend":"126.60","min_impressions":6169,"min_spend":"107.33"},{"age_group":"25-34","gender":"female","max_impressions":538567,"max_spend":"24501.04","min_impressions":1249422,"min_spend":"20535.38"},{"age_group":"25-34","gender":"male","max_impressions":612481,"max_spend":"23101.12","min_impressions":1453767,"min_spend":"19169.29"},{"age_group":"25-34","gender":"unknown","max_impressions":4947,"max_spend":"208.39","min_impressions":11523,"min_spend":"175.60"},{"age_group":"35-44","gender":"female","max_impressions":360751,"max_spend":"14802.73","min_impressions":839252,"min_spend":"12301.98"},{"age_group":"35-44","gender":"male","max_impressions":438437,"max_spend":"13939.20","min_impressions":966549,"min_spend":"11483.95"},{"age_group":"35-44","gender":"unknown","max_impressions":4488,"max_spend":"155.49","min_impressions":9955,"min_spend":"130.19"},{"age_group":"45-54","gender":"female","max_impressions":226994,"max_spend":"8527.07","min_impressions":482025,"min_spend":"7030.81"},{"age_group":"45-54","gender":"male","max_impressions":286531,"max_spend":"8242.67","min_impressions":545647,"min_spend":"6778.33"},{"age_group":"45-54","gender":"unknown","max_impressions":2542,"max_spend":"81.55","min_impressions":5282,"min_spend":"68.07"},{"age_group":"55-64","gender":"female","max_impressions":161606,"max_spend":"5046.06","min_impressions":306136,"min_spend":"4159.80"},{"age_group":"55-64","gender":"male","max_impressions":165108,"max_spend":"4076.07","min_impressions":269328,"min_spend":"3353.77"},{"age_group":"55-64","gender":"unknown","max_impressions":1748,"max_spend":"48.36","min_impressions":3096,"min_spend":"40.34"},{"age_group":"65+","gender":"female","max_impressions":92974,"max_spend":"2680.20","min_impressions":167082,"min_spend":"2197.48"},{"age_group":"65+","gender":"male","max_impressions":86139,"max_spend":"2018.26","min_impressions":148827,"min_spend":"1662.38"},{"age_group":"65+","gender":"unknown","max_impressions":1456,"max_spend":"35.64","min_impressions":2579,"min_spend":"29.53"}
          ],
          "entities":"2020, 2020, distance, 2020Census, Estamos, el correo, casa pasando la gasolinera, B\u00fascalo y responde hoy mismo, el formulario del Censo del 2020 frente a las casas de las personas que no tienen una direcci\u00f3n com\u00fan, o viven, Box para recibir, Comparte este mensaje con tu comunidad, usan un P.O.",
          "funding_entity": ["COLLINS FOR SENATOR","U.S. Census Bureau"],
          "num_pages":2,
          "region_impression_results":
             [
               {"max_impressions":100761,"max_spend":"2632.17","min_impressions":185838,"min_spend":"2224.90","region":"Alabama"},{"max_impressions":10607,"max_spend":"293.09","min_impressions":21511,"min_spend":"247.21","region":"Alaska"},{"max_impressions":158280,"max_spend":"5712.67","min_impressions":227985,"min_spend":"4437.38","region":"Arizona"},{"max_impressions":34623,"max_spend":"1460.54","min_impressions":89283,"min_spend":"1238.80","region":"Arkansas"},{"max_impressions":246281,"max_spend":"17038.78","min_impressions":888363,"min_spend":"14120.33","region":"California"},{"max_impressions":70562,"max_spend":"2888.83","min_impressions":137726,"min_spend":"2327.14","region":"Colorado"},{"max_impressions":23560,"max_spend":"1353.71","min_impressions":81744,"min_spend":"1152.54","region":"Connecticut"},{"max_impressions":7501,"max_spend":"320.31","min_impressions":20300,"min_spend":"272.18","region":"Delaware"},{"max_impressions":153450,"max_spend":"7169.00","min_impressions":471069,"min_spend":"6072.81","region":"Florida"},{"max_impressions":117486,"max_spend":"4255.63","min_impressions":267438,"min_spend":"3599.47","region":"Georgia"},{"max_impressions":2615,"max_spend":"227.95","min_impressions":9097,"min_spend":"194.10","region":"Hawaii"},{"max_impressions":14937,"max_spend":"538.51","min_impressions":31501,"min_spend":"456.18","region":"Idaho"},{"max_impressions":128682,"max_spend":"5149.72","min_impressions":299969,"min_spend":"4375.51","region":"Illinois"},{"max_impressions":70975,"max_spend":"3059.55","min_impressions":167770,"min_spend":"2602.45","region":"Indiana"},{"max_impressions":38220,"max_spend":"1315.80","min_impressions":77823,"min_spend":"1118.78","region":"Iowa"},{"max_impressions":29747,"max_spend":"1332.80","min_impressions":75189,"min_spend":"1118.77","region":"Kansas"},{"max_impressions":73346,"max_spend":"2322.16","min_impressions":142986,"min_spend":"1971.05","region":"Kentucky"},{"max_impressions":72905,"max_spend":"2074.71","min_impressions":142625,"min_spend":"1756.48","region":"Louisiana"},{"max_impressions":86005,"max_spend":"1187.47","min_impressions":86256,"min_spend":"1042.53","region":"Maine"},{"max_impressions":38090,"max_spend":"1962.06","min_impressions":112274,"min_spend":"1669.95","region":"Maryland"},{"max_impressions":74722,"max_spend":"2167.14","min_impressions":149167,"min_spend":"1835.80","region":"Massachusetts"},{"max_impressions":105629,"max_spend":"3586.19","min_impressions":190169,"min_spend":"3052.25","region":"Michigan"},{"max_impressions":44734,"max_spend":"1603.00","min_impressions":91421,"min_spend":"1365.25","region":"Minnesota"},{"max_impressions":70404,"max_spend":"1856.19","min_impressions":123250,"min_spend":"1570.86","region":"Mississippi"},{"max_impressions":48945,"max_spend":"2258.52","min_impressions":117775,"min_spend":"1919.77","region":"Missouri"},{"max_impressions":7227,"max_spend":"306.29","min_impressions":16027,"min_spend":"260.15","region":"Montana"},{"max_impressions":20361,"max_spend":"772.06","min_impressions":48383,"min_spend":"656.20","region":"Nebraska"},{"max_impressions":15485,"max_spend":"1152.80","min_impressions":58800,"min_spend":"967.42","region":"Nevada"},{"max_impressions":14464,"max_spend":"344.85","min_impressions":23410,"min_spend":"291.89","region":"New Hampshire"},{"max_impressions":43526,"max_spend":"3171.66","min_impressions":180527,"min_spend":"2703.18","region":"New Jersey"},{"max_impressions":81047,"max_spend":"2587.80","min_impressions":108716,"min_spend":"1983.53","region":"New Mexico"},{"max_impressions":126725,"max_spend":"6988.71","min_impressions":450883,"min_spend":"5935.33","region":"New York"},{"max_impressions":159111,"max_spend":"4297.60","min_impressions":319539,"min_spend":"3614.55","region":"North Carolina"},{"max_impressions":7034,"max_spend":"293.99","min_impressions":15362,"min_spend":"250.04","region":"North Dakota"},{"max_impressions":117890,"max_spend":"4650.52","min_impressions":243615,"min_spend":"3957.95","region":"Ohio"},{"max_impressions":60923,"max_spend":"1816.20","min_impressions":120222,"min_spend":"1513.93","region":"Oklahoma"},{"max_impressions":18260,"max_spend":"1156.44","min_impressions":63264,"min_spend":"983.68","region":"Oregon"},{"max_impressions":100161,"max_spend":"4252.96","min_impressions":231491,"min_spend":"3617.17","region":"Pennsylvania"},{"max_impressions":15496,"max_spend":"348.70","min_impressions":29274,"min_spend":"294.45","region":"Rhode Island"},{"max_impressions":122002,"max_spend":"1945.39","min_impressions":184620,"min_spend":"1634.52","region":"South Carolina"},{"max_impressions":11050,"max_spend":"362.33","min_impressions":22048,"min_spend":"307.67","region":"South Dakota"},{"max_impressions":87158,"max_spend":"3152.04","min_impressions":199625,"min_spend":"2674.15","region":"Tennessee"},{"max_impressions":640519,"max_spend":"18895.57","min_impressions":1124823,"min_spend":"15070.94","region":"Texas"},{"max_impressions":12,"max_spend":"1.30","min_impressions":33,"min_spend":"1.12","region":"Unknown"},{"max_impressions":19120,"max_spend":"1021.78","min_impressions":52797,"min_spend":"850.97","region":"Utah"},{"max_impressions":6189,"max_spend":"122.33","min_impressions":10634,"min_spend":"102.99","region":"Vermont"},{"max_impressions":75864,"max_spend":"3411.25","min_impressions":200266,"min_spend":"2902.21","region":"Virginia"},{"max_impressions":111260,"max_spend":"4143.74","min_impressions":178984,"min_spend":"3278.80","region":"Washington"},{"max_impressions":2697,"max_spend":"269.53","min_impressions":14165,"min_spend":"229.65","region":"Washington, District of Columbia"},{"max_impressions":25592,"max_spend":"826.92","min_impressions":52865,"min_spend":"698.90","region":"West Virginia"},{"max_impressions":64677,"max_spend":"2137.29","min_impressions":122663,"min_spend":"1818.33","region":"Wisconsin"},{"max_impressions":4054,"max_spend":"186.19","min_impressions":11450,"min_spend":"157.93","region":"Wyoming"}
             ],
          "topics":"2020 Census, Political persuading / broken system",
          "type":"CONNECT, DONATE, INFORM",
          "url":"https://storage.googleapis.com/facebook_ad_archive_screenshots/326962598332969.png"
        }
    """
    pass


class Topics(BaseProxyPoladsView):
    """Topics
        Params: none
        {
          "topics": [
            "Economy",
            "Coronavirus",
            "China",
            ...
          ]
        }
    Just list all the topics!
    """

class FilterOptions(BaseProxyPoladsView):
    pass


class Races(BaseProxyPoladsView):
    """Races
        N.B. that these are Open Secrets Race ID {“NY08”, “GAS1”, “KS01”} (these are defined by OpenSecrets but are basically state_abbrev, plus {S1, S2} for Senate, {01 … 52} for House seats, and with our homegrown extension G1 for governor. ). The values should mostly be stable but may change slightly between now and November as candidates withdraw, die or if third-party candidates achieve viability.
    Params:
    * none
    Output
        {
          "Colorado": ["COS1", "COG1", "CO01", "CO02" ... "CO14", "Pres"],
          "Georgia": ["GAS1", "GAS2", "GA01", "GA02" ... "GA14", "Pres"],
          ...
        }
    """
    pass


class RacePages(BaseProxyPoladsView):
    pass


class CandidatesInARace(BaseProxyPoladsView):
    """
    Candidates in a race
        Params:
    * race_id: string type, Open Secrets Race ID {“NY08”, “GAS1”, “KS01”} (these are defined by OpenSecrets but are basically state_abbrev, plus {S1, S2} for Senate, {01 … 52} for House seats, and with our homegrown extension G1 for governor. )
    ```json
        {
            "candidates": [
                {
                    "pages": [
                        {
                            "page_name": "John W. Hickenlooper",
                            "disclaimer": "Hickenlooper for Senate",
                            "page_id": 1234567890,
                            "opensecrets_id": "abcd1234",
                        },
                    ],
                    "short_name": "Smith",
                    "full_name": "John Smith",
                    "party": "Republican",
                },
            ],
            "race_id": "COS1"
        }
    ```
    """
    pass


class SearchPagesTypeAhead(BaseProxyPoladsView):
    """
    Search pages type ahead
    Params:
    * q query for autocomplete
    * size max results to include in response
        Output JSON:
            {
              "data": [
                {
                  "id": 600771607044176,
                  "page_name": "DonaldTrump2020Store"
                },
                {
                  "id": 100172018446047,
                  "page_name": "Donaldtrumphasbabyhands"
                },
                {
                  "id": 153080620724,
                  "page_name": "Donald J. Trump"
                }
              ]
              "metadata": {"total": {"value": 1512, "relation": "eq"},
              "execution_time_in_millis": 44.5}
            }
        For search, we’ll need to autocomplete
        * page names (i.e. spender names)
        * funding_entities (i.e. disclaimers)
        * topics
        * purposes (aka tactics – but there’s only 4 or 5 of them)
        * race IDs / names (“COS1”, “Colorado Senate”)
    """
    pass


class AutocompleteFundingEntities(BaseProxyPoladsView):
    """
    Autocomplete funding entities
    Params:
    * q query for autocomplete
    * size max results to include in response
    Output JSON:
        {
          "data": [
            {
              "id": 600771607044176,
              "page_name": "DonaldTrump2020Store"
            },
            {
              "id": 100172018446047,
              "page_name": "Donaldtrumphasbabyhands"
            },
            {
              "id": 153080620724,
              "page_name": "Donald J. Trump"
            }
          ]
          "metadata": {"total": {"value": 1512, "relation": "eq"},
          "execution_time_in_millis": 44.5}
        }
    For search, we’ll need to autocomplete
        page names (i.e. spender names)
        funding_entities (i.e. disclaimers)
        topics
        purposes (aka tactics – but there’s only 4 or 5 of them)
        race IDs / names (“COS1”, “Colorado Senate”)
    """
    pass


class GetNotifications(BaseProxyPoladsView):
    """
    Get notifications
    URL parameters:
    * email: string type
    Output: JSON object in the format:
        {
            "notifications": [
                {
                    "id": 8739,
                    "page_name": "Donald J. Trump",
                    "topic": "",
                    "region": "Connecticut",
                    "count": 10,
                    "type": "Top Spenders by State",
                    "time_window": "Last 7 Days",
                    "fire_day": "Monday
                },
                {...},
                ...
            ]
        }
    """
    pass


class AddNotification(BaseProxyPostMixin):
    """
    Add notification
    URL parameters:
    * email: string type
    Parameters:
    * notification: tuple containing the following fields: email, page_id, topic, region, count, type, time_window, fire_day
    Output: JSON object in the format:
        {
            "result": True
        }
    """
    pass


class RemoveNotification(BaseProxyPostMixin):
    """
    Remove notification
    URL parameters:
    * notification_id: int type
    Output: JSON object in the format:
        {
            "result": True
        }
        """


class NotificationTypes(BaseProxyPoladsView):
    """
    URL parameters: none
    Output: JSON object in the format:
        {
            "notification_types": [{
                "type_name":"Top Spenders",
                "type_id":1,
                "fields":{
                    "count":[10,20],
                    "fire frequency":["daily", "weekly"]
                }
            },
            {
                "type_name":"Weekly Spend Surge For Page In Region",
                "type_id":6,
                "fields":{
                    "page":<page_id>,
                    "region":["United States","Alabama",...]
                }
            }],
                ...
        }
    """

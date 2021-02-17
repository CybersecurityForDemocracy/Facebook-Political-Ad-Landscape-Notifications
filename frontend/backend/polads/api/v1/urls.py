from django.urls import path, re_path

from . import views


urlpatterns = [
    re_path(  # Total Spend by Page of Region
       r'total_spend/by_page/of_region/(?P<region_name>.+)$',
        views.TotalSpendByPageOfRegion.as_view()
    ),
    re_path(  # Total Spend of Page of Region
        'total_spend/of_page/(?P<page_id>.+)/of_region/(?P<region_name>.+)$',
        views.TotalSpendOfPageOfRegion.as_view()
    ),
    re_path(  # Total Spend of Page by Region
        'total_spend/of_page/(?P<page_id>.+)/by_region',
        views.TotalSpendOfPageByRegion.as_view()
    ),
    re_path(  # Spend by Time Period of Page of Region
        'spend_by_time_period/of_page/(?P<page_id>.+)/of_region/(?P<region_name>.+)$',
        views.SpendByTimePeriodOfPageOfRegion.as_view()
    ),
    re_path(  # Total Spend by Page of Topic of Region
        'total_spend/by_page/of_topic/(?P<topic_name>.+)/of_region/(?P<region_name>.+)$',
        views.TotalSpendByTopicOfRegion.as_view()
    ),
    re_path(  # Total Spend by Topic of Region
        'total_spend/by_topic/of_region/(?P<region_name>.+)$',
        views.TotalSpendByTopicOfRegion.as_view()
    ),
    path(  # Spend by Time Period by Topic of Page
        'spend_by_time_period/by_topic/of_page/<int:page_id>',
        views.SpendByTimePeriodByTopicOfPage.as_view()
    ),
    re_path(  # Spend by Time Period of Topic of Region
        'spend_by_time_period/of_topic/(?P<topic_name>.+)/of_region/(?P<region_name>.+)$',
        views.SpendByTimePeriodOfTopicOfRegion.as_view()
    ),
    re_path(  # Spend by Time Period by Topic of Page of Region
        'spend_by_time_period/by_topic/of_page/(?P<page_owner>.+)/of_region/(?P<region_name>.+)$',
        views.SpendByTimePeriodByTopicOfPageOfRegion.as_view()
    ),
    path(  # Total Spend by Purpose of Page
        'total_spend/by_purpose/of_page/<int:page_id>',
        views.TotalSpendByPurposeOfPage.as_view()
    ),
    re_path(  # Total Spend by Purpose of Region
        'total_spend/by_purpose/of_region/(?P<region_name>.+)$',
        views.TotalSpendByPurposeOfRegion.as_view()
    ),
    re_path(  # Total Spend by Purpose of Page of Region
        'total_spend/by_purpose/of_page/(?P<page_owner>.+)/of_region/(?P<region_name>.+)$',
        views.TotalSpendByPurposeOfPageOfRegion.as_view()
    ),
    re_path(  # Spend by Time Period by Purpose of Page of Region
        'spend_by_time_period/by_purpose/of_page/(?P<page_owner>.+)/of_region/(?P<region_name>.+)$',
        views.SpendByTimePeriodByPurposeOfPageOfRegion.as_view()
    ),
    re_path(  # Spend by Targeting of Region - Dummy data 7/14, live data 7/25
        'total_spend/by_targeting/of_region/(?P<region_name>.+)$',
        views.SpendByTargetingOfPage.as_view()
    ),
    path(  # Spend by Targeting of Page - Dummy data 7/14, live data 7/25
        'total_spend/by_targeting/of_page/<int:page_id>',
        views.SpendByTargetingOfPage.as_view()
    ),
    path(  # Targeting types Seen from Page
        'targeting/of_page/<int:page_id>',
        views.CountOfTargetingTypesSeenOfPage.as_view()
    ),
    path(  # search
        'getads',
        views.GetAds.as_view()
    ),
    path(  # search
        'getands',
        views.GetAds.as_view()
    ),
    path(
        'getaddetails/<int:ad_cluster_id>',
        views.GetAddDetais.as_view()
    ),
    path(
        'getanddetails/<int:ad_cluster_id>',
        views.GetAddDetais.as_view()
    ),
    path(
        'archive-id/<int:archive_id>/cluster',
        views.ArchiveId.as_view()
    ),
    path(  # Topics
        'topics',
        views.Topics.as_view()
    ),
    path(  # filter-options
        'filter-options',
        views.FilterOptions.as_view()
    ),
    path(  # Races
        'races',
        views.Races.as_view()
    ),
    path(  # Race pages
        'race_pages',
        views.RacePages.as_view()
    ),
    re_path(  # Candidates in a race
        'race/(?P<race_id>.+)/candidates',
        views.CandidatesInARace.as_view()
    ),
    path(  # Search Pages by type
        'search/pages_type_ahead',
        views.SearchPagesTypeAhead.as_view()
    ),
    path(  # Autocomplete Funding Entities
        'autocomplete/fun ding_entities',
        views.AutocompleteFundingEntities.as_view()
    ),
    re_path(  # Get Notifications
        'notifications/of_user/(?P<email>.+)$',
        views.GetNotifications.as_view()
    ),
    path(  # Add Notification
        'notifications/add',
        views.AddNotification.as_view()
    ),
    path(  # Remove Notification
        'notifications/remove/<int:notification_id>',
        views.RemoveNotification.as_view()
    ),
    path(
        'notification_types',
        views.NotificationTypes.as_view()
    )
]

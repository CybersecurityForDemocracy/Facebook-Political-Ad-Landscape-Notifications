export const apis = {
  totalSpendByPageOfRegion: 'TOTAL_SPEND_BY_PAGE_OF_REGION',
  totalSpendOfPageOfRegion: 'TOTAL_SPEND_OF_PAGE_OF_REGION',
  totalSpendOfPageByRegion: 'TOTAL_SPEND_OF_PAGE_BY_REGION',
  totalSpendByTopicOfRegion: 'TOTAL_SPEND_BY_TOPIC_OF_REGION',
  totalSpendByPurposeOfRegion: 'TOTAL_SPEND_BY_PURPOSE_OF_REGION',
  totalSpendByPurposeOfPage: 'TOTAL_SPEND_BY_PURPOSE_OF_PAGE',
  totalSpendByPurposeOfPageOfRegion: 'TOTAL_SPEND_BY_PURPOSE_OF_PAGE_OF_REGION',
  spendByTimePeriodOfPageOfRegion: 'SPEND_BY_TIME_PERIOD_OF_PAGE_OF_REGION',
  spendByTimePeriodOfTopicOfRegion: 'SPEND_BY_TIME_PERIOD_OF_TOPIC_OF_REGION',
  spendByTimePeriodByTopicOfPage: 'SPEND_BY_TIME_PERIOD_BY_TOPIC_OF_PAGE',
  spendByTimePeriodByTopicOfPageOfRegion:
    'SPEND_BY_TIME_PERIOD_BY_TOPIC_OF_PAGE_OF_REGION',
  candidatesInRace: 'CANDIDATES_IN_RACE',
  racesAll: 'RACES_ALL',
};

export const actions = {
  INVALIDATE_DATA_FOR_GRAPH: 'INVALIDATE_DATA_FOR_GRAPH',
  REQUEST_DATA: 'REQUEST_DATA',
  RECEIVED_DATA: 'RECEIVED_DATA',
};

export const pageIds = {
  'Donald Trump': 153080620724,
  'Joe Biden': 7860876103,
};

export const generalChartStartDate = '2020-07-01';
export const homepagePresidentialSpentOverTimeStartDate = '2020-06-01';

export const authorization = process.env.REACT_APP_POLADS_API_TOKEN;

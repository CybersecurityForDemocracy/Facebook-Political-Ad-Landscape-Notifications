/* eslint-disable array-callback-return */
import qs from 'query-string';
import moment from 'moment';
import { apis, authorization } from './constants';

const APIS = {
  [apis.totalSpendByPageOfRegion]: ({ region }) =>
    ['/total_spend/by_page/of_region/', region].join(''),
  [apis.totalSpendOfPageOfRegion]: ({ pageID, region }) =>
    ['/total_spend/of_page/', pageID, '/of_region/', region].join(''),
  [apis.totalSpendByTopicOfRegion]: ({ region }) =>
    ['/total_spend/by_topic/of_region/', region].join(''),
  [apis.totalSpendByPurposeOfRegion]: ({ region }) =>
    ['/total_spend/by_purpose/of_region/', region].join(''),
  [apis.totalSpendByPurposeOfPage]: ({ pageID }) =>
    `/total_spend/by_purpose/of_page/${pageID}`,
  [apis.totalSpendByPurposeOfPageOfRegion]: ({ pageID, region }) =>
    `/total_spend/by_purpose/of_page/${pageID}/of_region/${region}`,
  [apis.spendByTimePeriodByTopicOfPage]: ({ pageID }) =>
    `/spend_by_time_period/by_topic/of_page/${pageID}`,
  [apis.spendByTimePeriodOfPageOfRegion]: ({ pageID, region }) =>
    ['/spend_by_time_period/of_page/', pageID, '/of_region/', region].join(''),
  [apis.spendByTimePeriodOfTopicOfRegion]: ({ topicName, region }) =>
    ['/spend_by_time_period/of_topic/', topicName, '/of_region/', region].join(
      '',
    ),
  [apis.candidatesInRace]: ({ raceID }) =>
    ['/race/', raceID, '/candidates'].join(''),
  [apis.totalSpendOfPageByRegion]: ({ pageID }) =>
    `total_spend/of_page/${pageID}/by_region`,
  totalSpentGraphRace: ({ pageID, region }) =>
    `/total_spend/of_page/${pageID}/of_region/${region}`,
  totalSpentByTacticGraphRace: ({ pageID }) =>
    `/total_spend/by_purpose/of_page/${pageID}`,
  spentOverTimeGraphRace: ({ pageID, region }) =>
    `/spend_by_time_period/of_page/${pageID}/of_region/${region}`,
  spentByTopicGraphRace: ({ pageID }) =>
    `/spend_by_time_period/by_topic/of_page/${pageID}`,
  [apis.spendByTimePeriodByTopicOfPageOfRegion]: ({ pageID, region }) =>
    `/spend_by_time_period/by_topic/of_page/${pageID}/of_region/${region}`,
  audienceGraphRace: ({ pageID }) => `/targeting/of_page/${pageID}`,
  [apis.racesAll]: () => `/races`,
};

export function getURL(api, params) {
  const { topicName, region, pageID, raceID, ...rest } = params;

  const apiURL = APIS[api]({
    region,
    pageID,
    topicName,
    raceID,
  });

  const queryString = qs.stringify(rest);

  return encodeURI(`${apiURL}?${queryString}`);
}

/**
 * Sort by time period descending
 */
function sortByTimePeriod(a, b) {
  const dateA = moment(a.week);
  const dateB = moment(b.week);

  if (dateB.isAfter(dateA)) {
    return -1;
  }
  if (dateB.isBefore(dateA)) {
    return 1;
  }
  return 0;
}

/**
 * Transform topics spend in timeperiod data into format usable by graph
 * @param {{spend_in_timeperiod: {}, topic_name: string}[]} data - topic data
 */
export function transformTopicsSpentByTimePeriod(data) {
  const topics = [];
  const spendData = data
    .reduce((acc, cur) => {
      const {
        spend_in_timeperiod: spendInTimePeriod,
        topic_name: topicName,
      } = cur;
      topics.push(topicName);
      const timePeriods = Object.keys(spendInTimePeriod);

      timePeriods.forEach((timePeriod) => {
        const idx = acc.findIndex((o) => o.week === timePeriod);
        if (idx > -1) {
          acc[idx][topicName] = spendInTimePeriod[timePeriod];
        } else {
          acc.push({
            week: timePeriod,
            [topicName]: spendInTimePeriod[timePeriod],
          });
        }
      });
      return acc;
    }, [])
    .sort(sortByTimePeriod);

  return {
    topics,
    data: spendData,
  };
}

/**
 * Transform topics spend in timeperiod data into format usable by graph for Races
 * @param {{spend_by_time_period: {}, page_name: string}[]} data - topic data
 */
export function transformTopicsSpentByTimePeriodRace(data) {
  const finalResponse = [];
  data.map(
    (
      item,
      // eslint-disable-next-line consistent-return
    ) => {
      const response = [];
      const { spend_by_time_period: spendByTimePeriod = '', page_name } = item;
      if (spendByTimePeriod === '' || spendByTimePeriod === null) {
        finalResponse.push({
          data: [],
          page_name: item.page_name,
        });
        return;
      }
      const periods = Object.keys(spendByTimePeriod);
      periods.forEach((periodKey) => {
        const getOne = spendByTimePeriod[`${periodKey}`];
        const sumForOneKey = getOne.reduce((acc, cur) => {
          const formattedWeek = cur.time_period;
          const idx = acc.findIndex((o) => o.week === formattedWeek);
          if (idx > -1) {
            if (acc[idx].category.name === periodKey) {
              acc[idx].category.spend += cur.spend;
            }
          } else {
            acc.push({
              week: formattedWeek,
              category: {
                spend: cur.spend,
                name: periodKey,
              },
            });
          }
          return acc;
        }, []);
        response.push(...sumForOneKey);
      });
      const groupByWeek = response.reduce((accumulator, cur) => {
        const formattedWeek = cur.week;
        const { name } = cur.category;
        if (name === 'Uncategorized') return accumulator;
        const idx = accumulator.findIndex((o) => o.week === formattedWeek);
        if (idx > -1) {
          accumulator[idx][name] = cur.category.spend;
        } else {
          accumulator.push({
            week: formattedWeek,
            [name]: cur.category.spend,
          });
        }
        return accumulator;
      }, []);
      // return { ...groupByWeek };
      finalResponse.push({
        data: groupByWeek,
        page_name,
      });
    },
  );
  const sortFinalResonse = finalResponse.sort((a, b) => {
    const dateA = moment(a.data.week);
    const dateB = moment(b.data.week);

    if (dateB.isAfter(dateA)) {
      return -1;
    }
    if (dateB.isBefore(dateA)) {
      return 1;
    }
    return 0;
  });
  return sortFinalResonse;
}

/**
 * Transform page spend by time period data into format usable by graph
 * @param {
 *   {
 *     spendByWeek: {
 *       week: string,
 *       spend: number
 *     }[],
 *     pageName: string
 *   }[]
 * } spendDataByWeek - page data by week
 */
export function transformPageSpentByTimePeriod(spendDataByWeek) {
  const keys = [];

  if (!spendDataByWeek || spendDataByWeek.length < 1) {
    return {
      spend: [],
      keys,
    };
  }

  const spendData = spendDataByWeek
    .reduce((acc, cur) => {
      const { spendByWeek = [], pageName = '' } = cur;

      keys.push(pageName);

      spendByWeek.forEach(({ week, spend }) => {
        const formattedWeek = moment(new Date(week)).format('MMM DD');
        const idx = acc.findIndex((o) => o.week === formattedWeek);
        if (idx > -1) {
          acc[idx][pageName] = spend;
        } else {
          acc.push({
            week: formattedWeek,
            [pageName]: spend,
          });
        }
      });

      return acc;
    }, [])
    .sort(sortByTimePeriod);

  return {
    spend: spendData,
    keys,
  };
}

export function fetchAll(URLs) {
  return Promise.all(
    URLs.map((url) => fetch(url, { headers: { authorization } })),
  )
    .then((responses) => {
      if (responses.length > 1) {
        return Promise.all(responses.map((response) => response.json()));
      }
      return responses[0].json();
    })
    .catch((error) => {
      console.error(error);
      return [];
    });
}

export function transformDataByTacticsGraphRace(data) {
  const tactic_candidate_pairs = [];
  const entities = []; // e.g. ["Jim Clyburn", "John McCollum for Congress"]
  if (!data.length) {
    return null;
  }
  const getSpendForAllCandidates = data.map((entity) => {
    entities.push(entity.page_name);
    if (entity.spend_by_purpose === null) {
      return {
        page_name: entity.page_name,
        data: null,
      };
    }
    return {
      page_name: entity.page_name,
      data: entity.spend_by_purpose,
    };
  });

  getSpendForAllCandidates.forEach((element) => {
    const { data: dataByentity = [], page_name: pageNameByentity } = element;
    if (dataByentity === null || !dataByentity.length) {
      return;
    }
    dataByentity.forEach((cur) => {
      if (cur === null) {
        return;
      }
      tactic_candidate_pairs.push({
        tactic: cur.purpose,
        candidateName: pageNameByentity,
        sum: cur.spend,
      });
    });
  });

  // tactic_candidate_pairs is like [
  //   {tactic: "Donate", candidateName: "Jim Clyburn", sum: 4206.72},
  //   {tactic: "Connect", candidateName: "Jim Clyburn", sum: 3793.63},
  //   {tactic: "Persuade", candidateName: "John McCollum for Congress", sum: 733.24},
  //   {tactic: "Donate", candidateName: "John McCollum for Congress", sum: 411.51},
  //   {tactic: "Buy", candidateName: "John McCollum for Congress", sum: 391.63},
  //   {tactic: "Connect", candidateName: "John McCollum for Congress", sum: 113.62}
  // ]
  const response = Object.values(
    tactic_candidate_pairs.reduce((acc, item) => {
      acc[item.tactic] = {
        ...{ [item.candidateName]: item.sum, tactic: item.tactic },
        ...(acc[item.tactic] || {}),
      };
      return acc;
    }, {}),
  );
  return response;
}

export default {
  getURL,
  transformTopicsSpentByTimePeriod,
  transformPageSpentByTimePeriod,
  transformDataByTacticsGraphRace,
  transformTopicsSpentByTimePeriodRace,
};

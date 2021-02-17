import isEmpty from 'lodash/isEmpty';
import { Axios } from '../../api/axios';
import {
  getURL,
  transformTopicsSpentByTimePeriodRace,
} from '../../modules/graphs/util';
import statePopulations from '../../constants/statePopulations.json';
import { apis } from '../../modules/graphs/constants';

const PAGES_API = (q) => `/search/pages_type_ahead?q=${q}`;
// const FUNDING_ENTITIES = (q) => `/autocomplete/funding_entities?q=${q}`;

const getTopNKeysForTopics = (topicsByWeek, n = 3) => {
  if (!topicsByWeek.length) {
    return [];
  }
  const topicKeys = [];
  for (let i = 0; i < topicsByWeek.length; i += 1) {
    if (topicKeys.length >= n) break;
    Object.entries(topicsByWeek[topicsByWeek.length - 1 - i])
      .filter(([k, v]) => k !== 'week')
      .sort(([k1, v1], [k2, v2]) => v2 - v1)
      .map(([k, v]) => k)
      .slice(0, n)
      .forEach((key) => {
        if (topicKeys.indexOf(key) === -1) {
          topicKeys.push(key);
        }
      });
  }
  return topicKeys.slice(0, n);
};

export const sponsorsSearch = (inputValue, callback) =>
  Promise.all([
    Axios.get(PAGES_API(inputValue)),
    // Axios.get(FUNDING_ENTITIES(inputValue)),
  ])
    .then((responses) => {
      if (responses && responses.length) {
        const values = responses
          .reduce((acc, response) => {
            if (response && response.data) {
              return acc.concat(response.data);
            }
            return acc;
          }, [])
          .map((o) => ({ label: o.page_name, value: o.id }));
        return callback(values);
      }
      return callback([]);
    })
    .catch((err) => {
      console.error(err);
      return callback([]);
    });

export function getSpendByTimePeriodByTopicOfPage(pageID, label, callback) {
  Axios.get(
    getURL(apis.spendByTimePeriodByTopicOfPage, {
      pageID,
    }),
  )
    .then((res) => {
      const spend =
        (res &&
          res.spend_by_time_period &&
          transformTopicsSpentByTimePeriodRace([
            {
              page_name: label,
              spend_by_time_period: res.spend_by_time_period,
            },
          ]).sort((a, b) => a.week.localeCompare(b.week))) ||
        [];
      const keys = getTopNKeysForTopics(
        (spend && spend[0] && spend[0].data) || [],
        3,
      );
      callback({
        loading: false,
        spend: (!isEmpty(spend[0]) && spend[0].data) || [],
        keys,
        interval: 'week',
      });
    })
    .catch((err) => {
      callback({
        loading: false,
        spend: [],
        keys: [],
        interval: 'week',
      });
      console.error(err);
    });
}

export function getTotalSpendOfPageOfRegion(pageID, callback) {
  Axios.get(
    getURL(apis.totalSpendOfPageOfRegion, {
      pageID,
      region: 'US',
    }),
  )
    .then((res) => {
      callback({
        loading: false,
        data: res,
      });
    })
    .catch((err) => {
      callback({
        loading: false,
        data: [],
      });
      console.error(err);
    });
}

export function getSpendByPurposeOfPage(pageID, label, callback) {
  Axios.get(
    getURL(apis.totalSpendByPurposeOfPage, {
      pageID,
    }),
  )
    .then((res) => {
      callback({
        loading: false,
        data:
          (res &&
            res.spend_by_purpose &&
            res.spend_by_purpose.map(({ purpose, spend }) => ({
              tactic: purpose,
              [label]: spend,
            }))) ||
          [],
        keys: [label],
      });
    })
    .catch((err) => {
      callback({
        loading: false,
        data: [],
      });
      console.error(err);
    });
}

export function getSpendByTimePeriodOfPage(pageID, label, callback) {
  Axios.get(
    getURL(apis.spendByTimePeriodOfPageOfRegion, {
      region: 'US',
      pageID,
    }),
  )
    .then((res) => {
      callback({
        loading: false,
        spend:
          (res &&
            res.spend_by_week &&
            res.spend_by_week.map(({ week, spend }) => ({
              week,
              [label]: spend,
            }))) ||
          [],
        keys: [label],
        interval: 'week',
      });
    })
    .catch((err) => {
      callback({
        loading: false,
        spend: [],
        keys: [],
        interval: 'week',
      });
      console.error(err);
    });
}

function mapSpendByRegionToMap(data) {
  const states = data.spend_by_region
    .filter((item) => item.region_name !== 'US')
    .map((spendByRegion) => {
      const key =
        spendByRegion.region_name === 'Washington, District of Columbia'
          ? 'District of Columbia'
          : spendByRegion.region_name;
      const { population } = statePopulations.find(
        (item) => item.region === key,
      );
      return {
        key,
        value: spendByRegion.spend / (population / 1000000),
      };
    })
    .sort((a, b) => b.value - a.value);
  return {
    states,
    highestSpent: states[0].value,
    lowestSpent: states[states.length - 1].value,
  };
}

export function getSpendOfPageByRegion(pageID, callback) {
  Axios.get(
    getURL(apis.totalSpendOfPageByRegion, {
      pageID,
    }),
  )
    .then((res) => {
      callback({
        loading: false,
        data: res && res.spend_by_region && mapSpendByRegionToMap(res),
      });
    })
    .catch((err) => {
      callback({
        loading: false,
        data: { states: [], highestSpent: 0, lowestSpent: 0 },
      });
      console.error(err);
    });
}

export function getTargetingDataForPage(pageID, callback) {
  Axios.get(
    getURL('audienceGraphRace', {
      pageID,
    }),
  )
    .then((res) => {
      callback({
        loading: false,
        targeting: res && res.targeting,
      });
    })
    .catch((err) => {
      callback({
        loading: false,
        data: { targeting: [], page_id: pageID },
      });
      console.error(err);
    });
}

// allOtherChartsRaces.forEach((graphName) => {
//   dispatch(requestData(`${graphName}_${raceId}`, []));
//   const urls = topTwoCandidates.map((candidate) => (
//     getURL(graphName, { pageID: candidate.page_id, region, ...rest })
//   ));
//   Promise.all(urls.map((url) => Axios.get(url)))
//     .then((res) => {
//       dispatch(receiveData(`${graphName}_${raceId}`, res));
//     });
// });

import orderBy from 'lodash/orderBy';
import { getURL } from './util';
import { actions, apis } from './constants';
import { Axios } from '../../api/axios';

export function requestData(graphName, apis, params) {
  return {
    type: actions.REQUEST_DATA,
    graphName,
    apis,
    params,
  };
}

export function receiveData(graphName, data) {
  return {
    type: actions.RECEIVED_DATA,
    graphName,
    data,
  };
}

export function fetchData(graphName, apis) {
  return (dispatch) => {
    dispatch(requestData(graphName, apis));

    const urls = apis.map(({ api, params }) => getURL(api, params));
    return Promise.all(urls.map((url) => Axios.get(url))).then((res) => {
      if (res.length > 1) {
        return dispatch(receiveData(graphName, res));
      }
      return dispatch(receiveData(graphName, res[0]));
    });
  };
}

/**
 * Action to hit the apis and store the values under provided graphName
 * @param {string} graphName - name of graph to store the response data
 * @param {{api: string, params: any}[]} apis - array of apis with params to hit
 */
export function requestDataForGraph(graphName, apis) {
  return (dispatch) => {
    dispatch(fetchData(graphName, apis));
  };
}

const uniq = (a, param) =>
  a.filter(
    (item, pos, array) =>
      array.map((mapItem) => mapItem[param]).indexOf(item[param]) === pos,
  );

export const getRestOfRacesByTopTwo = (
  topTwoCandidates,
  region,
  rest,
  raceId,
) => (dispatch) => {
  const isStatePresidential = raceId === 'Pres' && region !== 'US';
  const allOtherChartsRaces = [
    isStatePresidential
      ? apis.totalSpendByPurposeOfPageOfRegion
      : 'totalSpentByTacticGraphRace',
    'spentOverTimeGraphRace',
    isStatePresidential
      ? apis.spendByTimePeriodByTopicOfPageOfRegion
      : 'spentByTopicGraphRace',
    'audienceGraphRace',
  ];

  allOtherChartsRaces.forEach((graphName) => {
    dispatch(requestData(`${graphName}_${raceId}`, []));
    const urls = topTwoCandidates.map((candidate) =>
      getURL(graphName, { pageID: candidate.page_id, region, ...rest }),
    );
    Promise.all(urls.map((url) => Axios.get(url))).then((res) => {
      dispatch(receiveData(`${graphName}_${raceId}`, res));
    });
  });
};

export const requestDataForTopRace = (
  canidatatesId,
  region,
  rest,
  graphName = 'totalSpentGraphRace',
  raceId = 'Pres',
) => (dispatch) => {
  dispatch(requestData(graphName, []));
  const urls = canidatatesId.map((pageID) =>
    getURL('totalSpentGraphRace', { pageID, region, ...rest }),
  );
  Promise.all(urls.map((url) => Axios.get(url)))
    .then((res) => {
      if (res && res.length) {
        const readyForOrder = res
          .map((item) => {
            if (item.spenders) {
              return {
                ...item,
                spenders: {
                  ...item.spenders[0],
                },
              };
            }
            return '';
          })
          .filter((withoutBlanc) => withoutBlanc !== '');
        const orderBySpend = orderBy(
          readyForOrder,
          ['spenders.spend'],
          ['desc'],
        );
        const getUniq = uniq([...orderBySpend], ['page_id']);
        if (getUniq.length) {
          dispatch(receiveData(graphName, getUniq.slice(0, 2)));
          dispatch(
            getRestOfRacesByTopTwo(getUniq.slice(0, 2), region, rest, raceId),
          );
        } else {
          dispatch(receiveData(graphName, []));

          let ids = [];
          for (let id of canidatatesId) {
            ids.push({ page_id: id });
          }

          dispatch(getRestOfRacesByTopTwo(ids, region, rest, raceId));
        }
      }
    })
    .catch((err) => dispatch(receiveData(graphName, [])));
};

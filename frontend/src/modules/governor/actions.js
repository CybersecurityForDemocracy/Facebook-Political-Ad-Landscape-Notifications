import moment from 'moment';

import { actions } from './constants';

import { Axios } from '../../api/axios';
import { apis, generalChartStartDate } from '../graphs/constants';
import { getURL } from '../graphs/util';

function getTopTwoInRace(data) {
  let filteredData = data.filter((o) => typeof o === 'object');

  if (filteredData.length >= 0) {
    filteredData = filteredData
      .sort((a, b) => {
        if (a.spenders[0].spend > b.spenders[0].spend) {
          return -1;
        }
        if (a.spenders[0].spend < b.spenders[0].spend) {
          return 1;
        }

        return 0;
      })
      .slice(0, 2)
      .reduce((acc, cur) => {
        acc.push({
          spend: cur.spenders[0].spend,
          pageId: cur.page_id,
        });
        return acc;
      }, []);
  }

  return filteredData;
}

function receiveData(region, race, data) {
  return {
    type: actions.RECEIVE_DATA,
    region,
    race,
    receivedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    data: getTopTwoInRace(data),
  };
}

function requestData(region, race) {
  return {
    type: actions.REQUEST_DATA,
    region,
    race,
  };
}

export function requestGovernorData(region, race, pages) {
  return (dispatch) => {
    dispatch(requestData(region, race));

    const urls = [];
    pages.forEach((pageId) => {
      urls.push(
        Axios.get(
          getURL(apis.totalSpendOfPageOfRegion, {
            pageID: pageId,
            region: 'US',
            start_date: generalChartStartDate,
          }),
        ),
      );
    });
    return Promise.all(urls)
      .then((res) => dispatch(receiveData(region, race, res)))
      .catch((error) => console.error(error));
  };
}

export default requestGovernorData;

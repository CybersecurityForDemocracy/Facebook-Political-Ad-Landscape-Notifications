import moment from 'moment';

import { apis } from '../graphs/constants';
import { getURL } from '../graphs/util';

import { actions } from './constants';
import { Axios } from '../../api/axios';

function receiveData(region, res) {
  const spend_by_topic = res.spend_by_topic.filter(
    (obj) => obj.topic_name !== 'Uncategorized',
  );
  return {
    type: actions.RECEIVE_TOP_FIVE_TOPICS,
    region,
    data: (spend_by_topic.length > 5
      ? spend_by_topic.slice(0, 5)
      : spend_by_topic
    ).map((o) => o.topic_name),
    receivedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
  };
}

function requestData(region) {
  return {
    type: actions.REQUEST_TOP_FIVE_TOPICS,
    region,
  };
}

export function requestTopFiveTopicsForRegion(
  region,
  startDate = moment().add(-1, 'month').format('YYYY-MM-DD'),
) {
  return (dispatch) => {
    dispatch(requestData(region));

    const url = getURL(apis.totalSpendByTopicOfRegion, {
      region,
      start_date: startDate,
    });
    Axios.get(url)
      .then((res) => dispatch(receiveData(region, res)))
      .catch((error) => {
        console.error(error);
      });
  };
}

export default {
  requestTopFiveTopicsForRegion,
};

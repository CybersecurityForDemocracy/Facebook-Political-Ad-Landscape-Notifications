import { actions } from './constants';

function getData(state = {}, action) {
  switch (action.type) {
    case actions.REQUEST_TOP_FIVE_TOPICS:
      return {
        ...state,
        isFetching: true,
        didInvalidate: false,
        topFiveTopics: [],
      };
    case actions.RECEIVE_TOP_FIVE_TOPICS:
      return {
        isFetching: false,
        didInvalidate: false,
        topFiveTopics: action.data,
        lastUpdated: action.receivedAt,
      };
    default:
      return state;
  }
}

function topics(state = {}, action) {
  switch (action.type) {
    case actions.REQUEST_TOP_FIVE_TOPICS:
    case actions.RECEIVE_TOP_FIVE_TOPICS:
      return {
        ...state,
        ...{
          [action.region]: getData(state[action.region], action),
        },
      };
    default:
      return state;
  }
}

export default topics;

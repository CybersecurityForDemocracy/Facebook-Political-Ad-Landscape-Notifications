import { combineReducers } from 'redux';
import { actions, generalChartStartDate } from './constants';

function getData(state = {}, action) {
  switch (action.type) {
    case actions.INVALIDATE_DATA_FOR_GRAPH:
      return {
        ...state,
        didInvalidate: true,
      };
    case actions.REQUEST_DATA:
      return {
        ...state,
        isFetching: true,
        didInvalidate: false,
      };
    case actions.RECEIVED_DATA:
      return {
        isFetching: false,
        didInvalidate: false,
        entities: action.data,
        lastUpdated: action.receivedAt,
      };
    default:
      return state;
  }
}

function dataByGraphName(
  state = {
    state_overview: {
      entities: {
        date: generalChartStartDate,
        region_name: '',
        spenders: [],
      },
    },
  },
  action,
) {
  switch (action.type) {
    case actions.INVALIDATE_DATA_FOR_GRAPH:
    case actions.REQUEST_DATA:
    case actions.RECEIVED_DATA:
      return {
        ...state,
        ...{
          [action.graphName]: getData(state[action.graphName], action),
        },
      };
    default:
      return state;
  }
}

const graphsReducer = combineReducers({
  dataByGraphName,
});

export default graphsReducer;

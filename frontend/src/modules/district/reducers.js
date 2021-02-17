import { actions } from './constants';

function getData(state = {}, action) {
  switch (action.type) {
    case actions.REQUEST_DATA:
      return {
        ...state,
        [action.race]: {
          isFetching: true,
          didInvalidate: false,
          data: [],
          race: action.race,
          district: action.race.slice(-2),
        },
      };
    case actions.RECEIVE_DATA:
      return {
        ...state,
        [action.race]: {
          isFetching: false,
          didInvalidate: false,
          data: action.data,
          lastUpdated: action.receivedAt,
          race: action.race,
          district: action.race.slice(-2),
        },
      };
    default:
      return state;
  }
}

function races(state = {}, action) {
  switch (action.type) {
    case actions.REQUEST_DATA:
    case actions.RECEIVE_DATA:
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

export default races;

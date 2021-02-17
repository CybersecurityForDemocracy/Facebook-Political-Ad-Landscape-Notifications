import { actions } from './constants';

/**
 * Get race type from race. Returns either senate, district or governor
 * @param {string} race
 */
function getRaceType(race) {
  let raceType = 'district';
  const last2 = race.slice(-2);
  if (['G1', 'G2'].includes(last2)) {
    raceType = 'governor';
  } else if (['S1', 'S2'].includes(last2)) {
    raceType = 'senate';
  }
  return raceType;
}

function getData(state = {}, action) {
  switch (action.type) {
    case actions.REQUEST_CANDIDATES_FROM_RACES:
      return {
        ...state,
        [action.race]: {
          isFetching: true,
          didInvalidate: false,
          candidates: [],
          race: action.race,
          type: getRaceType(action.race),
        },
      };
    case actions.RECEIVE_CANDIDATES_FROM_RACES:
      return {
        ...state,
        [action.race]: {
          isFetching: false,
          didInvalidate: false,
          candidates: action.data,
          lastUpdated: action.receivedAt,
          race: action.race,
          type: getRaceType(action.race),
        },
      };
    default:
      return state;
  }
}

function races(state = {}, action) {
  switch (action.type) {
    case actions.REQUEST_CANDIDATES_FROM_RACES:
    case actions.RECEIVE_CANDIDATES_FROM_RACES:
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

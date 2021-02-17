import _get from 'lodash/get';
import { push } from 'connected-react-router';
import { makeRouteOfRaces, makeTitleOfRaces } from './util';
import { Axios } from '../../api/axios';
import allCountryAndRegion from './allCountryAndRegion';
import { stateHash } from '../../constants/states';

export const SELECT_COUNTRY = 'select/SELECT_COUNTRY';
export const SELECT_RACE = 'select/SELECT_RACE';
export const GET_ALL_CANDIDATES = 'select/GET_ALL_CANDIDATES';
export const GET_ALL_RACES = 'select/GET_ALL_RACES';
export const SELECT_CANDIDATE_FOR_RACE = 'select/SELECT_CANDIDATE_FOR_RACE';
export const SELECT_COUNTRY_ON_REFRESH = 'select/SELECT_COUNTRY_ON_REFRESH';

let racesList = {};

const initialState = {
  selectedCountry: {
    names: makeTitleOfRaces(racesList.Wisconsin, 'Wisconsin'),
    races: racesList.Wisconsin,
    country: 'Wisconsin',
    routes: makeRouteOfRaces(racesList.Wisconsin, 'Wisconsin', 'stateData'),
  },
  selectedRace: {
    country: 'Wisconsin',
    key: 'overview',
    name: 'overview',
  },
  allCandidates: {},
  allRaces: {},
  selectedCandidate: [],
  loading: false,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case SELECT_COUNTRY:
      return {
        ...state,
        selectedCountry: payload,
        // return to default when pick new country
        selectedRace: {
          country: payload.country,
          key: 'overview',
          name: 'overview',
        },
      };
    case 'FETCH_CANDIDATES': {
      return {
        ...state,
        loading: true,
      };
    }
    case 'FETCH_RACES': {
      return {
        ...state,
        loading: true,
      };
    }
    case SELECT_RACE: {
      return {
        ...state,
        selectedRace: payload,
      };
    }
    case GET_ALL_CANDIDATES: {
      return {
        ...state,
        allCandidates: payload,
        loading: false,
      };
    }
    case GET_ALL_RACES: {
      return {
        ...state,
        selectedCountry: {
          names: makeTitleOfRaces(payload.Wisconsin, 'Wisconsin'),
          races: payload.Wisconsin,
          country: 'Wisconsin',
          routes: makeRouteOfRaces(payload.Wisconsin, 'Wisconsin', 'stateData'),
        },
        selectedRace: {
          country: 'Wisconsin',
          key: 'overview',
          name: 'overview',
        },
        allRaces: payload,
        loading: false,
      };
    }
    case SELECT_CANDIDATE_FOR_RACE: {
      return {
        ...state,
        selectedCandidate: payload,
      };
    }
    case SELECT_COUNTRY_ON_REFRESH: {
      return {
        ...state,
        selectedCountry: payload.selectedCountry,
        selectedRace: {
          country: payload.selectedRace.country,
          key: payload.selectedRace.key,
          name: payload.selectedRace.key,
        },
        selectedCandidate: payload.selectedCandidate,
      };
    }
    default:
      return state;
  }
};

export const selectRaceFromNav = () => (dispatch, getState) => {
  const {
    selectState: {
      selectedCountry: { country },
    },
  } = getState();
  return dispatch({
    type: SELECT_RACE,
    payload: {
      country,
      key: 'presidential',
      name: 'presidential',
    },
  });
};

export const selectCandidateForRace = (raceId) => (dispatch, getState) => {
  const {
    selectState: { allCandidates },
  } = getState();
  const candidate = _get(allCandidates, raceId);
  dispatch({ type: SELECT_CANDIDATE_FOR_RACE, payload: candidate });
};

export const onRefreshSelectCountryAndRace = (raceId, baseRoute) => (
  dispatch,
) => {
  dispatch({ type: 'FETCH_CANDIDATES' });
  return Axios.get('/race_pages').then((allCandidates) => {
    dispatch({ type: GET_ALL_CANDIDATES, payload: allCandidates });
    if (raceId) {
      const candidate = _get(allCandidates, raceId);
      const [findCountry] = allCountryAndRegion.regions.filter(
        (item) => item.shortCode === raceId.substring(0, 2),
      );
      const getCountryRaces =
        (findCountry && _get(racesList, findCountry.name)) || false;
      if (getCountryRaces) {
        dispatch({
          type: SELECT_COUNTRY_ON_REFRESH,
          payload: {
            selectedCountry: {
              races: getCountryRaces,
              names: makeTitleOfRaces(getCountryRaces, findCountry.name),
              country: findCountry.name,
              routes: makeRouteOfRaces(
                getCountryRaces,
                findCountry.name,
                baseRoute,
              ),
            },
            selectedRace: {
              country: findCountry.name,
              key: raceId,
              name: raceId,
            },
            selectedCandidate: candidate,
          },
        });
      }
    }
  });
};

export const getAllCandidates = () => (dispatch) => {
  dispatch({ type: 'FETCH_CANDIDATES' });
  return Axios.get('/race_pages')
    .then((allCandidates) =>
      dispatch({ type: GET_ALL_CANDIDATES, payload: allCandidates }),
    )
    .catch((err) => console.error('err', err));
};

export const getAllRaces = () => (dispatch) => {
  dispatch({ type: 'FETCH_RACES' });
  return Axios.get('/races')
    .then((allRaces) => {
      dispatch({ type: GET_ALL_RACES, payload: allRaces });
      racesList = allRaces;
    })
    .catch((err) => console.error('err', err));
};

export const selectRace = (race, baseRoute, state = null) => (
  dispatch,
  getState,
) => {
  const {
    selectState: {
      selectedCountry: { names, country, routes },
    },
  } = getState();

  let getRaces;
  if (names) {
    [getRaces] = names.filter((raceName) => raceName.key === race);
  }
  if (getRaces) {
    dispatch(selectCandidateForRace(getRaces.key));
    const [getRoute] = routes.filter((route) => route.key === race);
    dispatch(push(getRoute.path));
    return dispatch({
      type: SELECT_RACE,
      payload: getRaces,
    });
  }

  const stateCode = state ? stateHash[state] : stateHash[country];

  dispatch({
    type: SELECT_RACE,
    payload: {
      country: state ? state : country,
      key: race,
      name: getRaces ? getRaces.name : race,
    },
  });

  if (baseRoute === 'stateElectionsData') {
    return dispatch(push(`/stateElectionsData/${stateCode}`));
  } else {
    return dispatch(push(`/stateData/${stateCode}/${race}`));
  }
};

export const updateSelectCountry = (country, baseRoute) => (
  dispatch,
  getState,
) => {
  const getCountryRaces = _get(racesList, country) || false;
  dispatch({
    type: SELECT_COUNTRY,
    payload: {
      races: getCountryRaces,
      names: makeTitleOfRaces(getCountryRaces, country),
      country,
      routes: makeRouteOfRaces(getCountryRaces, country, baseRoute),
    },
  });
};

export const selectCountry = (country, selectedRace, baseRoute, match) => (
  dispatch,
  getState,
) => {
  const getCountryRaces = _get(racesList, country) || false;
  // let raceOptional = '';
  // if (match) {
  //   raceOptional = match.params && match.params.overview || '';
  // }

  if (getCountryRaces) {
    const stateCode = stateHash[country];
    dispatch({
      type: SELECT_COUNTRY,
      payload: {
        races: getCountryRaces,
        names: makeTitleOfRaces(getCountryRaces, country),
        country,
        routes: makeRouteOfRaces(getCountryRaces, country, baseRoute),
      },
    });
    if (baseRoute !== 'stateElectionsData' && selectedRace) {
      const {
        selectState: { selectedCountry },
      } = getState();
      const { name } = makeTitleOfRaces([selectedRace.key], country)[0];
      const foundRace = selectedCountry.names.find((r) => r.name === name);
      if (foundRace || selectedRace.key === 'presidential') {
        dispatch(
          selectRace(
            selectedRace.key === 'presidential'
              ? selectedRace.key
              : foundRace.key,
            baseRoute,
          ),
        );
        return;
      }
    }
    if (baseRoute === 'stateElectionsData') {
      dispatch(push(`/stateElectionsData/${stateCode}`));
    } else {
      dispatch(push(`/stateData/${stateCode}/overview`));
    }
  }
};

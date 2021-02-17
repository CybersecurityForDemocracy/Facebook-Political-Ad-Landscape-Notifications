import moment from 'moment';

import { apis } from '../graphs/constants';
import { getURL } from '../graphs/util';

import { actions } from './constants';
import { Axios } from '../../api/axios';

let publicCandidate = {};

function receiveData(region, race, res) {
  return {
    type: actions.RECEIVE_CANDIDATES_FROM_RACES,
    region,
    race,
    data:
      res.candidates &&
      res.candidates.map((o) => ({
        name: o.full_name,
        last_name: o.short_name,
        party: o.party,
        pageId: o.pages[0].page_id,
      })),
    receivedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
  };
}

function requestData(region, race) {
  return {
    type: actions.REQUEST_CANDIDATES_FROM_RACES,
    race,
    region,
  };
}

export function requestCandidatesFromRaces(region, races) {
  return (dispatch) => {
    races.forEach((race) => {
      dispatch(requestData(region, race));
      Axios.get(getURL(apis.candidatesInRace, { raceID: race }))
        .then((res) => dispatch(receiveData(region, race, res)))
        .catch((error) => {
          console.error(error);
        });
    });
  };
}

function requestDataTest(res) {
  publicCandidate = res;
}

export function requestSingleCandidateFromRaces(race) {
  Axios.get(getURL(apis.candidatesInRace, { raceID: race }))
    .then((res) => requestDataTest(res))
    .catch((error) => {
      console.error(error);
    });
  return publicCandidate;
}

export default {
  requestCandidatesFromRaces,
};

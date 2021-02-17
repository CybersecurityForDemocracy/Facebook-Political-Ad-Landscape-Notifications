import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import '../../styles/components/Select.css';
import {
  selectCountry,
  selectRace,
  updateSelectCountry,
} from '../../modules/select';
import { makeTitleOfRaces } from '../../modules/select/util';
import { states, stateHash } from '../../constants/states';
import { capitalize } from './shared';
import { requestCandidatesFromRaces } from '../../modules/candidates/actions';

const senateRacesRegExp = new RegExp('S1$|S2$');
const districtRacesRegExp = new RegExp('[0-9]{2}$');
const governorRacesRegExp = new RegExp('G1$');

const isSenateRace = (race) => senateRacesRegExp.test(race);
const isHouseRace = (race) => districtRacesRegExp.test(race);
const isGovernorRace = (race) => governorRacesRegExp.test(race);

function getRaceFromUrl(url, isThirdSelector = false) {
  const splitted = url.split('/');
  const race = splitted[splitted.length - 1];

  if (
    race === 'stateElectionsData' ||
    (url.toLowerCase().indexOf('ussenate') === -1 &&
      url.toLowerCase().indexOf('ushouse') === -1 &&
      race !== 'presidential') ||
    splitted.length === 3
  ) {
    return 'Select race';
  }

  if (isHouseRace(race) && !isThirdSelector) {
    return 'US House';
  }

  if (!isHouseRace(race) && isThirdSelector) {
    return 'Select District';
  }

  return race;
}

function showDistrictSelectorFromUrl(url) {
  const splitted = url.split('/');

  const race = splitted[splitted.length - 1];
  return !!isHouseRace(race);
}

// I have no idea what this does or if this should also be true for governor races.
// - Jeremy 9/4/2020
function showDistrictSenateSelectorFromUrl(url) {
  const splitted = url.split('/');

  const race = splitted[splitted.length - 1];
  return !!isSenateRace(race);
}

const Select = ({
  selectCountryAction,
  selectedCountry,
  selectedRace,
  selectRaceAction,
  allRaces,
  candidates,
  updateSelectCountryAction,
  match: {
    params: { state },
    url,
  },
  baseRoute,
  requestCandidatesForRace,
}) => {
  const [showDistrictSelector, setShowDistrictSelector] = useState(
    showDistrictSelectorFromUrl(url),
  );
  const [showDistrictSenateSelector, setShowDistrictSenateSelector] = useState(
    showDistrictSenateSelectorFromUrl(url),
  );
  const [firstSelectorValue, setFirstSelectorValue] = useState(
    getRaceFromUrl(url),
  );
  const [districtSelectorValue, setDistrictSelectorValue] = useState(
    getRaceFromUrl(url, true),
  );
  const [
    districtSecondSelectorValue,
    setSecondDistrictSelectorValue,
  ] = useState(getRaceFromUrl(url));
  const senateRaces = [];
  const districtRaces = [];
  const governorRaces = [];

  const races = allRaces && allRaces[states[state]];
  const titledRaces =
    allRaces && makeTitleOfRaces(races, selectedCountry.country);
  const isDefaultValue = districtSelectorValue === 'Select District';
  const { country } = selectedRace;
  const racesSelected = selectedCountry.races;

  useEffect(() => {
    updateSelectCountryAction(states[state], baseRoute);
  }, [baseRoute, state, updateSelectCountryAction]);

  useEffect(() => {
    selectedCountry.races && requestCandidatesForRace(country, racesSelected);
  }, [country, racesSelected, requestCandidatesForRace, selectedCountry.races]);

  if (Object.keys(allRaces).length) {
    allRaces &&
      titledRaces &&
      titledRaces
        .sort((a, b) => a && a.key && b && b.key && a.key.localeCompare(b.key))
        .forEach((race) => {
          if (isSenateRace(race.key)) {
            senateRaces.push(race);
          }
          if (isGovernorRace(race.key)) {
            governorRaces.push(race);
          }
          if (isHouseRace(race.key)) {
            districtRaces.push(race);
          }
        });
  }

  const onSelectDistrictAction = (value) => {
    setDistrictSelectorValue(value);
    selectRaceAction(value, baseRoute, states[state]);
  };

  const onSelectSecondDistrictAction = (value) => {
    setSecondDistrictSelectorValue(value);
    selectRaceAction(value, baseRoute, states[state]);
  };

  const onSelectRaceAction = (value) => {
    updateSelectCountryAction(states[state], baseRoute);

    if (value !== 'US House') {
      const customBaseRoute =
        baseRoute === 'presidential' ? 'stateData' : baseRoute;
      setShowDistrictSelector(false);
      setShowDistrictSenateSelector(true);
      selectRaceAction(value, customBaseRoute, states[state]);
      setFirstSelectorValue(value);
    } else {
      setShowDistrictSelector(true);
      setShowDistrictSenateSelector(false);
      setFirstSelectorValue('US House');
      const [firstRace] =
        allRaces && allRaces[states[state]].sort((a, b) => a.localeCompare(b));
      onSelectDistrictAction(firstRace);
    }
  };

  const onSelectCountryAction = (value, race, baseRoute) => {
    if (baseRoute === 'stateElectionsData') {
      setFirstSelectorValue('Select race');
      setDistrictSelectorValue('Select District');
      setShowDistrictSelector(false);
      selectCountryAction(value, race, baseRoute);
      return;
    }
    if (baseRoute === 'stateData') {
      onSelectRaceAction(race.key);
    }
    selectCountryAction(value, race, baseRoute);
    if (race.key === 'presidential' || race.key === 'overview') {
      if (baseRoute !== 'stateData' && baseRoute !== 'presidential') {
        setFirstSelectorValue(race.key);
        setDistrictSelectorValue('Select District');
      }
    } else {
      const raceCode = stateHash[value] + race.key.substr(2);
      if (allRaces && allRaces[value].includes(raceCode)) {
        if (isHouseRace(raceCode)) {
          setFirstSelectorValue('US House');
          setDistrictSelectorValue(raceCode);
        } else {
          setFirstSelectorValue(raceCode);
          setDistrictSelectorValue('Select District');
        }
      }
    }
  };

  const isRaceExist = (state) => {
    let isExist = true;
    const races = allRaces && allRaces[state];
    const titledRaces = allRaces && makeTitleOfRaces(races, state);
    const senateRaces = [];
    const districtRaces = [];

    if (titledRaces) {
      for (const race of titledRaces) {
        if (isSenateRace(race.key)) {
          senateRaces.push(race);
        }

        if (isHouseRace(race.key)) {
          districtRaces.push(race);
        }
      }
    }

    if (senateRaces.length === 0 && districtRaces.length === 0) isExist = false;

    return isExist;
  };
  // uses shadow select hidden in top left
  // to calculate dynamic width
  const firstLevel = useRef({});
  const secondLevel = useRef({});

  if (Object.keys(allRaces).length === 0) {
    return false;
  }

  const fixDistrictName = (name) => {
    const districtNumber = name.replace(/[^0-9]/g, '').replace(/^0+/, '');
    const districtName = name.replace(/[0-9]/g, '');
    let districtPostfix = districtNumber > 3 ? 'th' : 'st';
    if (districtNumber === '2') {
      districtPostfix = 'nd';
    } else if (districtNumber === '3') {
      districtPostfix = 'rd';
    }

    return `${districtNumber + districtPostfix} ${districtName}`;
  };

  return (
    <>
      {baseRoute !== 'stateElectionsData' && (
        <div>
          <select
            className="custom-select"
            onChange={(e) =>
              onSelectCountryAction(e.target.value, selectedRace, baseRoute)
            }
            value={states[state] || ''}
            style={{ width: secondLevel.current.clientWidth ? 'auto' : 200 }}
          >
            <option value="" className="optionClass" disabled>
              Select State
            </option>
            {allRaces &&
              Object.keys(allRaces).map(
                (item, key) =>
                  item !== 'United States' && (
                    <option key={key} value={item} className="optionClass">
                      {item}
                    </option>
                  ),
              )}
          </select>
          {states[state] && (
            <select
              className="custom-select"
              style={{
                width:
                  firstLevel.current.clientWidth < 165
                    ? 240
                    : firstLevel.current.clientWidth,
              }}
              onChange={(e) => onSelectRaceAction(e.target.value)}
              value={firstSelectorValue || ''}
            >
              {baseRoute !== 'stateElectionsData' && (
                <option value="overview" className="optionClass">
                  Overview
                </option>
              )}
              {baseRoute !== 'stateElectionsData' && (
                <option value="presidential" className="optionClass">
                  Presidential
                </option>
              )}
            </select>
          )}
        </div>
      )}

      {baseRoute === 'stateElectionsData' && (
        <div>
          <select
            className="custom-select"
            onChange={(e) =>
              onSelectCountryAction(e.target.value, selectedRace, baseRoute)
            }
            value={states[state] || ''}
            style={{
              width: states[state]
                ? secondLevel.current.clientWidth
                  ? secondLevel.current.clientWidth
                  : 200
                : 200,
            }}
          >
            <option value="" className="optionClass" disabled>
              Select State
            </option>
            {allRaces &&
              Object.keys(allRaces).map((item, key) => {
                const isExist = isRaceExist(item);
                return (
                  item !== 'United States' && (
                    <option
                      key={key}
                      value={item}
                      className="optionClass"
                      disabled={!isExist}
                    >
                      {item}
                    </option>
                  )
                );
              })}
          </select>

          {states[state] && (
            <>
              <select
                className="custom-select"
                style={{
                  width:
                    firstLevel.current.clientWidth < 165
                      ? 240
                      : firstLevel.current.clientWidth,
                }}
                onChange={(e) => onSelectRaceAction(e.target.value)}
                value={firstSelectorValue || 'Select race'}
              >
                <option className="optionClass" value="Select race" disabled>
                  Select race
                </option>
                {senateRaces.map((race, key) => {
                  // let senateKey = firstSelectorValue === 'US House' || firstSelectorValue === 'overview' ? false : firstSelectorValue;
                  //
                  // if ((senateRaces.length > 1) && (key === 1)) {
                  //   return false;
                  // }
                  return (
                    <option className="optionClass" key={key} value={race.key}>
                      {race.name}
                    </option>
                  );
                })}
                {districtRaces &&
                  (districtRaces.length ||
                    firstSelectorValue === 'US House') && (
                    <option className="optionClass" value="US House">
                      US House
                    </option>
                  )}
                {governorRaces.map((race, key) => {
                  return (
                    <option className="optionClass" key={key} value={race.key}>
                      {race.name}
                    </option>
                  );
                })}
              </select>
              {/* { */}
              {/*  (senateRaces.length > 1) && showDistrictSenateSelector && ( */}
              {/*      <select */}
              {/*          className="custom-select" */}
              {/*          onChange={(e) => onSelectSecondDistrictAction(e.target.value)} */}
              {/*          value={districtSecondSelectorValue} */}
              {/*      > */}
              {/*        {senateRaces.map((race, key) => ( */}
              {/*            <option */}
              {/*                className="optionClass" */}
              {/*                key={key} */}
              {/*                value={race.key} */}
              {/*            > */}
              {/*              {race.name} */}
              {/*            </option> */}
              {/*        ))} */}
              {/*      </select> */}
              {/*  ) */}
              {/* } */}

              {showDistrictSelector && (
                <select
                  className="custom-select"
                  style={{ width: isDefaultValue ? 235 : 'auto' }}
                  onChange={(e) => onSelectDistrictAction(e.target.value)}
                  value={districtSelectorValue || 'Select District'}
                >
                  <option
                    className="optionClass"
                    value="Select District"
                    disabled
                  >
                    Select District
                  </option>
                  {districtRaces &&
                    districtRaces.map((race) => (
                      <option className="optionClass" value={race.key}>
                        {`${fixDistrictName(race.name)} ( `}
                        {candidates[country] &&
                          candidates[country][race.key] &&
                          `${candidates[country][race.key].candidates
                            .map((item) => item.name)
                            .join(' vs. ')} ) `}
                      </option>
                    ))}
                </select>
              )}
            </>
          )}
        </div>
      )}

      <div style={{ position: 'absolute', top: -1000, left: -1000 }}>
        <select
          ref={firstLevel}
          className="fake-select"
          value={firstSelectorValue}
          style={{ visibility: 'hidden' }}
        >
          <option value={firstSelectorValue}>
            {capitalize(firstSelectorValue)}
          </option>
        </select>
        <select
          ref={secondLevel}
          className="fake-select"
          value={states[state]}
          style={{ visibility: 'hidden' }}
        >
          <option value={states[state]}>
            {allRaces &&
              Object.keys(allRaces).find((race) => race === states[state])}
          </option>
        </select>
      </div>
    </>
  );
};

Select.propTypes = {
  selectCountryAction: PropTypes.func,
  updateSelectCountryAction: PropTypes.func,
  selectedCountry: PropTypes.shape({
    names: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        key: PropTypes.string,
      }),
    ),
    country: PropTypes.string,
  }),
  selectedRace: PropTypes.any,
  selectRaceAction: PropTypes.func,
  match: PropTypes.shape({
    params: PropTypes.shape({
      state: PropTypes.string,
    }),
    url: PropTypes.string,
  }),
  loading: PropTypes.bool,
  allRaces: PropTypes.object,
};

Select.defaultProps = {
  selectCountryAction: () => null,
  selectedCountry: null,
  selectedRace: null,
  selectRaceAction: () => null,
  updateSelectCountry: () => null,
  match: {
    params: {
      state: '',
    },
    url: '',
  },
  loading: false,
  allRaces: {},
};

const mainAction = {
  selectCountryAction: selectCountry,
  selectRaceAction: selectRace,
  requestCandidatesForRace: requestCandidatesFromRaces,
  updateSelectCountryAction: updateSelectCountry,
};

const mapStateToProps = ({ selectState, candidates }) => ({
  selectedCountry: selectState.selectedCountry,
  selectedRace: selectState.selectedRace,
  loading: selectState.loading,
  allRaces: selectState.allRaces,
  candidates,
});

export default connect(mapStateToProps, (dispatch) =>
  bindActionCreators(mainAction, dispatch),
)(withRouter(Select));

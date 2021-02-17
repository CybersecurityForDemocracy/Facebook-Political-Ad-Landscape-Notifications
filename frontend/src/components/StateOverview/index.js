import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';
import { connect } from 'react-redux';
import snakeCase from 'lodash/snakeCase';

import usePrevious from '../../hooks/usePrevious.hooks';

import State from './StateOverview';
import {
  apis,
  pageIds,
  generalChartStartDate,
} from '../../modules/graphs/constants';
import { states } from '../../constants/states';
import { selectCountry } from '../../modules/select/index';
import { requestDataForGraph } from '../../modules/graphs/actions';
import { requestTopFiveTopicsForRegion } from '../../modules/topics/actions';
import { requestCandidatesFromRaces } from '../../modules/candidates/actions';
import { requestDistrictData } from '../../modules/district/actions';
import { requestSenateData } from '../../modules/senate/actions';
import { requestGovernorData } from '../../modules/governor/actions';
import { transformTopicsSpentByTimePeriod } from '../../modules/graphs/util';

const SPONSORS_GRAPH_NAME = 'stateOverviewSponsors';
const TOPICS_GRAPH_NAME = 'stateOverviewTopics';
const PRESIDENT_SPENT_NAME = 'stateOverviewPresidentSpent';

function sortByRace(a, b) {
  if (a && a.race && b && b.race) {
    return a.race.localeCompare(b.race);
  }

  return 0;
}

function createGraphNameForRegion(graphName, region) {
  return `${graphName}_${snakeCase(region).toUpperCase()}`;
}

/**
 * Add name and party of candidates from race data that only has page name
 * @param {{candidates: {pageId, name}[]}[]} raceAndCandidates - race candidates data
 * @param {{data: {spend, pageId}[]}[]} raceData - data
 * @returns {{data: {spend, pageId, name, party}[]}[]} returns added info to spend data
 */
function mergeSpendAndCandidate(raceData, raceAndCandidates) {
  if (
    raceAndCandidates &&
    raceAndCandidates.length &&
    raceData &&
    raceData.length
  ) {
    const allCandidates = raceAndCandidates.reduce((acc, cur) => {
      if (cur.candidates) {
        return acc.concat(cur.candidates);
      }
      return acc;
    }, []);
    const mergedData = raceData.map((d1) => {
      const candidateRaceData = [];
      d1.data.forEach((d2) => {
        if (d2 && d2.pageId) {
          const candidate =
            allCandidates && allCandidates.length > 0
              ? allCandidates.find((c) => c.pageId === d2.pageId)
              : {};

          candidateRaceData.push({
            ...d2,
            ...candidate,
            page_name: (candidate && candidate.name) || null,
          });
        }
      });
      return candidateRaceData;
    });
    return mergedData;
  }

  return [];
}

const mapStateToProps = (
  { graphs, topics, candidates, district, senate, governor, selectState },
  {
    match: {
      params: { state },
    },
  },
) => {
  const region = states[state];
  const races = selectState.allRaces[region];

  const defaultState = {
    district: [],
    governor: [],
    senate: [],
  };

  const topicsTopFive = topics[region];

  const regionDistrictData = district[region];

  const regionSenatorData = senate[region];

  const regionGovernorData = governor[region];

  const regionCandidatesPageIds =
    (candidates[region] &&
      Object.values(candidates[region]).reduce((acc, cur) => {
        acc[cur.type].push({ race: cur.race, candidates: cur.candidates });
        return acc;
      }, defaultState)) ||
    defaultState;

  return {
    sponsorsTotalSpent: {
      data: (
        _get(graphs, [
          'dataByGraphName',
          createGraphNameForRegion(SPONSORS_GRAPH_NAME, region),
          'entities',
          'spenders',
        ]) || []
      ).slice(0, 11),
      isFetching:
        _get(graphs, [
          'dataByGraphName',
          createGraphNameForRegion(SPONSORS_GRAPH_NAME, region),
          'isFetching',
        ]) || false,
    },
    topicsTopFive,
    topicTotalSpent: {
      isFetching:
        _get(graphs, [
          'dataByGraphName',
          createGraphNameForRegion(TOPICS_GRAPH_NAME, region),
          'isFetching',
        ]) || false,
      data: transformTopicsSpentByTimePeriod(
        _get(graphs, [
          'dataByGraphName',
          createGraphNameForRegion(TOPICS_GRAPH_NAME, region),
          'entities',
        ]) || [],
      ),
    },
    presidentSpent: {
      isFetching:
        _get(graphs, [
          'dataByGraphName',
          createGraphNameForRegion(PRESIDENT_SPENT_NAME, region),
          'isFetching',
        ]) || false,
      data: (
        _get(graphs, [
          'dataByGraphName',
          createGraphNameForRegion(PRESIDENT_SPENT_NAME, region),
          'entities',
        ]) || []
      ).map(({ spenders }) => ({
        page_name: spenders ? spenders[0].page_name : '',
        spend: spenders ? spenders[0].spend : 0,
      })),
    },
    governorSpent: {
      isFetching:
        Object.values(regionGovernorData || {}).reduce(
          (acc, cur) => acc && cur && cur.isFetching,
          true,
        ) || false,
      data: mergeSpendAndCandidate(
        Object.values(regionGovernorData || {}).sort(sortByRace),
        Object.values(candidates[region] || {}).filter(
          (o) => o.type === 'governor',
        ),
      ),
    },
    senateSpent: {
      isFetching:
        Object.values(regionSenatorData || {}).reduce(
          (acc, cur) => acc && cur && cur.isFetching,
          true,
        ) || false,
      data: mergeSpendAndCandidate(
        Object.values(regionSenatorData || {}).sort(sortByRace),
        Object.values(candidates[region] || {}).filter(
          (o) => o.type === 'senate',
        ),
      ),
    },
    districtSpent: {
      data: regionDistrictData,
      candidates: Object.values(candidates[region] || {}).filter(
        (o) => o.type === 'district',
      ),
    },
    region,
    races,
    segmentedCandidatesPageId: regionCandidatesPageIds,
  };
};

const mapDispatchToProps = (dispatch) => ({
  requestDataAction: ({ graphName, APIs }) =>
    dispatch(requestDataForGraph(graphName, APIs)),
  requestTopFiveTopics: (region, startDate) =>
    dispatch(requestTopFiveTopicsForRegion(region, startDate)),
  requestCandidatesForRace: (region, races) =>
    dispatch(requestCandidatesFromRaces(region, races)),
  requestDataForDistrict: (region, race, pages) =>
    dispatch(requestDistrictData(region, race, pages)),
  requestDataForSenate: (region, race, pages) =>
    dispatch(requestSenateData(region, race, pages)),
  requestDataForGovernor: (region, race, pages) =>
    dispatch(requestGovernorData(region, race, pages)),
  setCountry: (country, match) =>
    dispatch(selectCountry(country, null, 'stateData', match)),
});

function StateOverview(props) {
  const {
    requestDataAction,
    region,
    races,
    topicsTopFive,
    sponsorsTotalSpent,
    topicTotalSpent,
    presidentSpent,
    segmentedCandidatesPageId,
    governorSpent,
    senateSpent,
    districtSpent,
    requestTopFiveTopics,
    requestCandidatesForRace,
    requestDataForDistrict,
    requestDataForSenate,
    requestDataForGovernor,
    history: { push: historyPush },
    setCountry,
    baseRoute,
    match,
  } = props;
  useEffect(() => {
    region && setCountry(region, match);
  }, [region, setCountry]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    requestTopFiveTopics(region);
  }, [requestTopFiveTopics, region]);

  const previousGovArray = usePrevious(segmentedCandidatesPageId.governor);
  const previousSenArray = usePrevious(segmentedCandidatesPageId.senate);
  const previousDisArray = usePrevious(segmentedCandidatesPageId.district);
  const previousTopFive = usePrevious(topicsTopFive.topFiveTopics);

  useEffect(() => {
    requestCandidatesForRace(region, races);
  }, [region, races, requestCandidatesForRace]);

  useEffect(() => {
    const fetchGovernorData = () => {
      segmentedCandidatesPageId.governor.forEach((governorRaces) => {
        const { race, candidates } = governorRaces;

        const pages =
          (Array.isArray(candidates) && candidates.map((o) => o.pageId)) || [];

        if (pages && pages.length) {
          requestDataForGovernor(region, race, pages);
        }
      });
    };
    if (
      previousGovArray &&
      !_isEqual(previousGovArray, segmentedCandidatesPageId.governor)
    ) {
      fetchGovernorData();
    }
  }, [
    segmentedCandidatesPageId.governor,
    previousGovArray,
    region,
    requestDataForGovernor,
  ]);

  useEffect(() => {
    const fetchSenateData = () => {
      segmentedCandidatesPageId.senate.forEach((senateRaces) => {
        const { race, candidates } = senateRaces;

        const pages =
          (Array.isArray(candidates) && candidates.map((o) => o.pageId)) || [];

        if (pages && pages.length) {
          requestDataForSenate(region, race, pages);
        }
      });
    };
    if (
      previousSenArray &&
      !_isEqual(previousSenArray, segmentedCandidatesPageId.senate)
    ) {
      fetchSenateData();
    }
  }, [
    segmentedCandidatesPageId.senate,
    previousSenArray,
    region,
    requestDataForSenate,
  ]);

  useEffect(() => {
    const fetchDistrictData = () => {
      segmentedCandidatesPageId.district.forEach((districtRaces) => {
        const { race, candidates } = districtRaces;

        const pages =
          (Array.isArray(candidates) && candidates.map((o) => o.pageId)) || [];

        if (pages && pages.length) {
          requestDataForDistrict(region, race, pages);
        }
      });
    };
    if (
      previousDisArray &&
      !_isEqual(previousDisArray, segmentedCandidatesPageId.district)
    ) {
      fetchDistrictData();
    }
  }, [
    previousDisArray,
    segmentedCandidatesPageId.district,
    region,
    requestDataForDistrict,
  ]);

  useEffect(() => {
    requestDataAction({
      graphName: createGraphNameForRegion(SPONSORS_GRAPH_NAME, region),
      APIs: [
        {
          api: apis.totalSpendByPageOfRegion,
          params: {
            region,
            start_date: generalChartStartDate,
          },
        },
      ],
    });
  }, [region, requestDataAction]);

  useEffect(() => {
    requestDataAction({
      graphName: createGraphNameForRegion(PRESIDENT_SPENT_NAME, region),
      APIs: [
        {
          api: apis.totalSpendOfPageOfRegion,
          params: {
            region,
            start_date: generalChartStartDate,
            pageID: pageIds['Donald Trump'],
          },
        },
        {
          api: apis.totalSpendOfPageOfRegion,
          params: {
            region,
            start_date: generalChartStartDate,
            pageID: pageIds['Joe Biden'],
          },
        },
      ],
    });
  }, [region, requestDataAction]);

  useEffect(() => {
    const pattern = new RegExp('/', 'g');

    if (
      previousTopFive &&
      !_isEqual(previousTopFive, topicsTopFive.topFiveTopics)
    ) {
      const requestApis = topicsTopFive.topFiveTopics.map((topicName) => ({
        api: apis.spendByTimePeriodOfTopicOfRegion,
        params: {
          topicName: topicName.replace(pattern, '%2f'),
          region,
          start_date: generalChartStartDate,
        },
      }));
      if (requestApis.length > 0) {
        requestDataAction({
          graphName: createGraphNameForRegion(TOPICS_GRAPH_NAME, region),
          APIs: requestApis,
        });
      }
    }
  }, [topicsTopFive.topFiveTopics, previousTopFive, region, requestDataAction]);

  return (
    <State
      sponsorsData={sponsorsTotalSpent.data}
      sponsorsDataIsFetching={sponsorsTotalSpent.isFetching}
      topicData={topicTotalSpent.data}
      topicDataIsFetching={topicTotalSpent.isFetching}
      presidentSpent={presidentSpent.data}
      presidentSpentIsFetching={presidentSpent.isFetching}
      senateSpent={senateSpent.data}
      senateSpentIsFetching={senateSpent.isFetching}
      governorSpent={governorSpent.data}
      governorSpentIsFetching={governorSpent.isFetching}
      districtSpent={districtSpent}
      region={region}
      historyPush={historyPush}
      baseRoute={baseRoute}
      match={match}
    />
  ); // eslint-disable-line
}

StateOverview.propTypes = {
  region: PropTypes.string.isRequired,
  races: PropTypes.array,
  requestDataAction: PropTypes.func,
  requestTopFiveTopics: PropTypes.func,
  requestDataForDistrict: PropTypes.func,
  requestDataForGovernor: PropTypes.func,
  requestDataForSenate: PropTypes.func,
  requestCandidatesForRace: PropTypes.func,
  topicsTopFive: PropTypes.shape({
    topFiveTopics: PropTypes.arrayOf(PropTypes.string),
    isFetching: PropTypes.bool,
  }),
  sponsorsTotalSpent: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
  }),
  presidentSpent: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
  }),
  topicTotalSpent: PropTypes.shape({
    data: PropTypes.shape({}),
    topics: PropTypes.arrayOf(PropTypes.string),
    isFetching: PropTypes.bool,
  }),
  segmentedCandidatesPageId: PropTypes.shape({
    governor: PropTypes.array,
    senate: PropTypes.array,
    district: PropTypes.array,
  }),
  governorSpent: PropTypes.shape({
    data: PropTypes.array,
    isFetching: PropTypes.bool,
  }),
  senateSpent: PropTypes.shape({
    data: PropTypes.array,
    isFetching: PropTypes.bool,
  }),
  districtSpent: PropTypes.shape({
    data: PropTypes.object,
    candidates: PropTypes.array,
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  setCountry: PropTypes.func,
};

StateOverview.defaultProps = {
  requestDataAction: () => null,
  requestTopFiveTopics: () => null,
  requestDataForDistrict: () => null,
  requestDataForGovernor: () => null,
  requestDataForSenate: () => null,
  requestCandidatesForRace: () => null,
  races: [],
  topicsTopFive: {
    topFiveTopics: [],
    isFetching: false,
  },
  sponsorsTotalSpent: {
    data: [],
    isFetching: false,
  },
  presidentSpent: {
    data: [],
    isFetching: false,
  },
  topicTotalSpent: {
    data: [],
    topics: [],
    isFetching: false,
  },
  segmentedCandidatesPageId: {
    governor: [],
    senate: [],
    district: [],
  },
  governorSpent: {
    data: [],
    isFetching: false,
  },
  senateSpent: {
    data: [],
    isFetching: false,
  },
  districtSpent: {
    data: {},
    candidates: [],
  },
  history: {
    push: () => null,
  },
  setCountry: () => null,
};

export default connect(mapStateToProps, mapDispatchToProps)(StateOverview);

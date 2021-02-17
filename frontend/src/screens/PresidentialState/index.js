import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _get from 'lodash/get';
import GraphPageHeader from '../../components/GraphPageHeader';
import {
  selectRace,
  selectCandidateForRace,
  selectCountry,
} from '../../modules/select';
import RaceGraphs from '../../components/RaceGraphs';
import { requestDataForTopRace } from '../../modules/graphs/actions';
import {
  transformPageSpentByTimePeriod,
  transformTopicsSpentByTimePeriodRace,
  transformDataByTacticsGraphRace,
} from '../../modules/graphs/util';
import { states } from '../../constants/states';

import { apis, generalChartStartDate } from '../../modules/graphs/constants';

const GRAPH_NAME = 'totalSpentGraphRacePresidential';

function createGraphNameForRegion(region) {
  return `${GRAPH_NAME}_${region}`;
}

function PresidentialState({
  match: {
    params: { state },
  },
  requestDataForTopRaceAction,
  totalSpentData,
  spentOverTime,
  spentByTopics,
  spendByTactics,
  countOfTargetingMethods,
  raceId,
  setCountry,
}) {
  useEffect(() => {
    const region = states[state] || 'US';
    setCountry(
      region,
      {
        key: 'presidential',
        name: 'presidential',
        country: region,
      },
      'stateData',
    );
  }, [state, setCountry]);

  useEffect(() => {
    const region = states[state] || 'US';
    requestDataForTopRaceAction(
      [153080620724, 7860876103],
      region,
      { start_date: generalChartStartDate },
      createGraphNameForRegion(region),
    );
  }, [state, requestDataForTopRaceAction]);
  const region = states[state] || 'US';

  return (
    <main className="senate__graph_views">
      <GraphPageHeader
        baseRoute="presidential"
        baseRouteLabel="State"
        subRoute="President"
      />
      <RaceGraphs
        raceId={raceId && raceId.length > 0 ? raceId : 'USP1'}
        totalSpentData={totalSpentData.data}
        totalSpentFetching={totalSpentData.isFetching}
        totalSpentModuleTitle={`How much have the campaigns spent on ads targeting ${region}?`}
        spentOverTime={spentOverTime.data}
        spentOverTimeFetching={spentOverTime.isFetching}
        spentByTopics={spentByTopics.data}
        spentByTopicsFetching={spentByTopics.isFetching}
        spendByTactics={spendByTactics.data}
        spendByTacticsFetching={spendByTactics.isFetching}
        countOfTargetingMethods={countOfTargetingMethods.data}
        countOfTargetingMethodsFetching={countOfTargetingMethods.isFetching}
        isFromState
      />
    </main>
  );
}

PresidentialState.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      raceId: PropTypes.string,
      state: PropTypes.string,
    }),
  }),
  selectedRace: PropTypes.shape({}),
  requestDataForTopRaceAction: PropTypes.func,
  allCandidates: PropTypes.shape({}),
  totalSpentData: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        graphColor: PropTypes.string,
        page_id: PropTypes.number,
        page_name: PropTypes.string,
        spend: PropTypes.number,
      }),
    ),
    isFetching: PropTypes.bool,
  }),
  spentOverTime: PropTypes.shape({
    data: PropTypes.shape({
      interval: PropTypes.string,
      keys: PropTypes.arrayOf(PropTypes.string),
      spend: PropTypes.number,
    }),
    isFetching: PropTypes.bool,
  }),
  spentByTopics: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.arrayOf(PropTypes.shape({})),
        page_name: PropTypes.string,
      }),
    ),
    isFetching: PropTypes.bool,
  }),
  spendByTactics: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.arrayOf(PropTypes.shape({})),
        page_name: PropTypes.string,
      }),
    ),
    isFetching: PropTypes.bool,
  }),
  countOfTargetingMethods: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        targeting: PropTypes.arrayOf(PropTypes.shape({})),
        page_name: PropTypes.string,
      }),
    ),
    isFetching: PropTypes.bool,
  }),
  setCountry: PropTypes.func,
  raceId: PropTypes.string,
};

PresidentialState.defaultProps = {
  match: {
    params: {
      state: '',
      raceId: '',
    },
  },
  selectedRace: {},
  requestDataForTopRaceAction: () => null,
  allCandidates: {},
  totalSpentData: {
    data: [
      {
        graphColor: '',
        page_name: '',
        spend: 0,
      },
    ],
    isFetching: false,
  },
  spentOverTime: {
    data: {
      interval: '',
      keys: ['', ''],
      spend: 0,
    },
    isFetching: false,
  },
  spentByTopics: {
    data: [
      {
        data: [],
        page_name: '',
      },
    ],
    isFetching: false,
  },
  spendByTactics: {
    data: [
      {
        tactic: '',
        '': 0,
      },
    ],
    isFetching: false,
  },
  countOfTargetingMethods: {
    data: [
      {
        targeting: [{}],
        page_name: '',
      },
    ],
  },
  setCountry: () => null,
  raceId: '',
};

// Add redux needs here
const mapStateToProps = (
  { selectState, graphs },
  {
    match: {
      params: { state },
    },
  },
) => ({
  selectedCandidate: selectState.selectedCandidate,
  selectedRace: selectState.selectedRace,
  allCandidates: selectState.allCandidates,
  totalSpentData: {
    isFetching:
      _get(graphs, [
        'dataByGraphName',
        createGraphNameForRegion(states[state] || 'US'),
        'isFetching',
      ]) || false,
    data: (
      _get(graphs, [
        'dataByGraphName',
        createGraphNameForRegion(states[state] || 'US'),
        'entities',
      ]) || []
    ).map(({ spenders }, key) => ({
      page_id: spenders.page_id,
      page_name: spenders.page_name,
      spend: spenders.spend,
      graphColor: !key ? 'Donald J. Trump' : '',
    })),
  },
  spentOverTime: {
    isFetching:
      _get(graphs, [
        'dataByGraphName',
        'spentOverTimeGraphRace_Pres',
        'isFetching',
      ]) || false,
    data: {
      ...transformPageSpentByTimePeriod(
        (
          _get(graphs, [
            'dataByGraphName',
            'spentOverTimeGraphRace_Pres',
            'entities',
          ]) || []
        ).map(({ spend_by_week: spendByWeek }, key) => ({
          pageName: !key
            ? _get(graphs, [
                'dataByGraphName',
                createGraphNameForRegion(states[state] || 'US'),
                'entities',
                key,
                'spenders',
                'page_name',
              ]) || ''
            : _get(graphs, [
                'dataByGraphName',
                createGraphNameForRegion(states[state] || 'US'),
                'entities',
                key,
                'spenders',
                'page_name',
              ]) || '',
          spendByWeek,
        })),
      ),
      interval: 'week',
    },
  },
  spentByTopics: {
    isFetching:
      _get(graphs, [
        'dataByGraphName',
        `${apis.spendByTimePeriodByTopicOfPageOfRegion}_Pres`,
        'isFetching',
      ]) || false,
    data: transformTopicsSpentByTimePeriodRace(
      (
        _get(graphs, [
          'dataByGraphName',
          `${apis.spendByTimePeriodByTopicOfPageOfRegion}_Pres`,
          'entities',
        ]) || []
      ).map(({ spend_by_time_period }, key) => ({
        page_name: !key
          ? _get(graphs, [
              'dataByGraphName',
              createGraphNameForRegion(states[state] || 'US'),
              'entities',
              key,
              'spenders',
              'page_name',
            ]) || ''
          : _get(graphs, [
              'dataByGraphName',
              createGraphNameForRegion(states[state] || 'US'),
              'entities',
              key,
              'spenders',
              'page_name',
            ]) || '',
        spend_by_time_period:
          typeof spend_by_time_period !== 'undefined'
            ? spend_by_time_period
            : '',
      })),
    ),
  },
  spendByTactics: {
    isFetching:
      _get(graphs, [
        'dataByGraphName',
        `${apis.totalSpendByPurposeOfPageOfRegion}_Pres`,
        'isFetching',
      ]) || false,
    data: transformDataByTacticsGraphRace(
      (
        _get(graphs, [
          'dataByGraphName',
          `${apis.totalSpendByPurposeOfPageOfRegion}_Pres`,
          'entities',
        ]) || []
      ).map((item, key) => ({
        page_name: !key
          ? _get(graphs, [
              'dataByGraphName',
              createGraphNameForRegion(states[state] || 'US'),
              'entities',
              key,
              'spenders',
              'page_name',
            ]) || ''
          : _get(graphs, [
              'dataByGraphName',
              createGraphNameForRegion(states[state] || 'US'),
              'entities',
              key,
              'spenders',
              'page_name',
            ]) || '',
        ...item,
      })),
    ),
  },
  countOfTargetingMethods: {
    isFetching:
      _get(graphs, [
        'dataByGraphName',
        'audienceGraphRace_Pres',
        'isFetching',
      ]) || false,
    data: (
      _get(graphs, ['dataByGraphName', 'audienceGraphRace_Pres', 'entities']) ||
      []
    ).map((item, key) => ({
      page_name: !key
        ? _get(graphs, [
            'dataByGraphName',
            createGraphNameForRegion(states[state] || 'US'),
            'entities',
            key,
            'spenders',
            'page_name',
          ]) || ''
        : _get(graphs, [
            'dataByGraphName',
            createGraphNameForRegion(states[state] || 'US'),
            'entities',
            key,
            'spenders',
            'page_name',
          ]) || '',
      ...item,
    })),
  },
});

const mainActions = {
  selectRaceAction: selectRace,
  requestDataForTopRaceAction: requestDataForTopRace,
  selectCandidateForRaceAction: selectCandidateForRace,
  setCountry: selectCountry,
};

export default connect(mapStateToProps, (dispatch) =>
  bindActionCreators(mainActions, dispatch),
)(PresidentialState);

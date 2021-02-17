/* eslint-disable camelcase */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _get from 'lodash/get';
import GraphPageHeader from '../../components/GraphPageHeader';
import { selectRace, selectCandidateForRace } from '../../modules/select';
import RaceGraphs from '../../components/RaceGraphs';
import { requestDataForTopRace } from '../../modules/graphs/actions';
import {
  transformPageSpentByTimePeriod,
  transformTopicsSpentByTimePeriodRace,
  transformDataByTacticsGraphRace,
  getURL,
} from '../../modules/graphs/util';
import { apis, generalChartStartDate } from '../../modules/graphs/constants';
import { Axios } from '../../api/axios';

function PresidentialNational({
  requestDataForTopRaceAction,
  totalSpentData,
  spentOverTime,
  spentByTopics,
  spendByTactics,
  countOfTargetingMethods,
  raceId,
}) {
  const [candidatesInfo, setCandidatesInfo] = useState({});

  useEffect(() => {
    (async () => {
      const candidates = await Axios.get(
        getURL(apis.candidatesInRace, { raceID: 'USP1' }),
      );
      setCandidatesInfo(candidates);
    })();
  }, []);

  useEffect(() => {
    requestDataForTopRaceAction([153080620724, 7860876103], 'US', {
      start_date: generalChartStartDate,
    });
  }, [requestDataForTopRaceAction]);

  return (
    <main className="senate__graph_views">
      <GraphPageHeader baseRouteLabel="Nation" subRoute="Presidential Race" />
      <RaceGraphs
        raceId={raceId && raceId.length > 0 ? raceId : 'USP1'}
        totalSpentModuleTitle="Trump vs. Biden ad spending nationwide"
        totalSpentData={totalSpentData.data}
        totalSpentFetching={totalSpentData.isFetching}
        spentOverTime={spentOverTime.data}
        spentOverTimeFetching={spentOverTime.isFetching}
        spentByTopics={spentByTopics.data}
        spentByTopicsFetching={spentByTopics.isFetching}
        spendByTactics={spendByTactics.data}
        spendByTacticsFetching={spendByTactics.isFetching}
        countOfTargetingMethods={countOfTargetingMethods.data}
        countOfTargetingMethodsFetching={countOfTargetingMethods.isFetching}
        candidatesInfo={candidatesInfo}
      />
    </main>
  );
}

// Add redux needs here
const mapStateToProps = ({ selectState, graphs }) => ({
  selectedCandidate: selectState.selectedCandidate,
  selectedRace: selectState.selectedRace,
  allCandidates: selectState.allCandidates,
  totalSpentData: {
    isFetching:
      _get(graphs, ['dataByGraphName', 'totalSpentGraphRace', 'isFetching']) ||
      false,
    data: (
      _get(graphs, ['dataByGraphName', 'totalSpentGraphRace', 'entities']) || []
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
                'totalSpentGraphRace',
                'entities',
                key,
                'spenders',
                'page_name',
              ]) || ''
            : _get(graphs, [
                'dataByGraphName',
                'totalSpentGraphRace',
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
        'spentByTopicGraphRace_Pres',
        'isFetching',
      ]) || false,
    data: transformTopicsSpentByTimePeriodRace(
      (
        _get(graphs, [
          'dataByGraphName',
          'spentByTopicGraphRace_Pres',
          'entities',
        ]) || []
      ).map(({ spend_by_time_period }, key) => ({
        page_name: !key
          ? _get(graphs, [
              'dataByGraphName',
              'totalSpentGraphRace',
              'entities',
              key,
              'spenders',
              'page_name',
            ]) || ''
          : _get(graphs, [
              'dataByGraphName',
              'totalSpentGraphRace',
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
        'totalSpentByTacticGraphRace_Pres',
        'isFetching',
      ]) || false,
    data: transformDataByTacticsGraphRace(
      (
        _get(graphs, [
          'dataByGraphName',
          'totalSpentByTacticGraphRace_Pres',
          'entities',
        ]) || []
      ).map((item, key) => ({
        page_name: !key
          ? _get(graphs, [
              'dataByGraphName',
              'totalSpentGraphRace',
              'entities',
              key,
              'spenders',
              'page_name',
            ]) || ''
          : _get(graphs, [
              'dataByGraphName',
              'totalSpentGraphRace',
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
            'totalSpentGraphRace',
            'entities',
            key,
            'spenders',
            'page_name',
          ]) || ''
        : _get(graphs, [
            'dataByGraphName',
            'totalSpentGraphRace',
            'entities',
            key,
            'spenders',
            'page_name',
          ]) || '',
      ...item,
    })),
  },
});

PresidentialNational.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      raceId: PropTypes.string,
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
};

PresidentialNational.defaultProps = {
  match: {
    params: {
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
};

const mainActions = {
  selectRaceAction: selectRace,
  requestDataForTopRaceAction: requestDataForTopRace,
  selectCandidateForRaceAction: selectCandidateForRace,
};

export default connect(mapStateToProps, (dispatch) =>
  bindActionCreators(mainActions, dispatch),
)(PresidentialNational);

/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _get from 'lodash/get';
import GraphPageHeader from '../../components/GraphPageHeader';
import RaceGraphs from '../../components/RaceGraphs';
import { requestDataForTopRace } from '../../modules/graphs/actions';
import {
  transformPageSpentByTimePeriod,
  transformTopicsSpentByTimePeriodRace,
  transformDataByTacticsGraphRace,
  getURL,
} from '../../modules/graphs/util';
import Loader from '../../components/Loader';
import { apis, generalChartStartDate } from '../../modules/graphs/constants';
import { Axios } from '../../api/axios';

const GRAPH_NAME = 'totalSpentGraphRace';

function graphNameByRaceId(graphName, raceId = 'US') {
  return `${graphName}_${raceId}`;
}

function RacePage({
  match: {
    params: { house, raceId },
  },
  requestDataForTopRaceAction,
  totalSpentData,
  spentOverTime,
  spentByTopics,
  spendByTactics,
  countOfTargetingMethods,
  dataFormat,
  loadingRaceCandidates,
  history,
}) {
  const [isFetching, setIsFetching] = useState(true);
  const [currentRace, setCurrentRace] = useState(null);
  const [currentCandidate, setCurrentCandidate] = useState({});
  const { pathname } = history.location;

  useEffect(() => {
    setCurrentRace(null);
    setCurrentCandidate({});
    setIsFetching(false);
  }, [pathname, raceId]);

  useEffect(() => {
    async function fetchData() {
      const pathArray = pathname.split('/');

      try {
        const res = await Axios.get(
          getURL(apis.candidatesInRace, {
            raceID: pathArray[pathArray.length - 1],
          }),
        );
        setCurrentRace(raceId);
        setCurrentCandidate(res);
        const candidates = getCandidatesIds(res);
        requestDataForTopRaceAction(
          candidates,
          'US',
          { start_date: generalChartStartDate },
          graphNameByRaceId(GRAPH_NAME, raceId),
          raceId,
        );
      } catch (error) {
        console.error(error);
      }
    }

    if (raceId && raceId.length > 0) {
      if (
        !currentRace ||
        (currentRace !== raceId && pathname !== '/stateElectionsData' && house)
      ) {
        if (!isFetching && Object.keys(currentCandidate).length === 0) {
          fetchData();
        }
      }
    }
  }, [
    currentRace,
    raceId,
    pathname,
    isFetching,
    requestDataForTopRaceAction,
    house,
    currentCandidate,
  ]);

  useEffect(() => {
    if (pathname !== '/stateElectionsData' && house) {
      setIsFetching(
        totalSpentData.isFetching ||
          spentOverTime.isFetching ||
          spentByTopics.isFetching ||
          spendByTactics.isFetching ||
          countOfTargetingMethods.isFetching ||
          loadingRaceCandidates,
      );
    }
  }, [
    setIsFetching,
    totalSpentData.isFetching,
    spentOverTime.isFetching,
    spentByTopics.isFetching,
    spendByTactics.isFetching,
    countOfTargetingMethods.isFetching,
    loadingRaceCandidates,
    pathname,
    house,
  ]);

  function getCandidatesIds(currentCandidate) {
    const ids = [];
    if (currentCandidate.candidates) {
      for (const candidate of currentCandidate.candidates) {
        ids.push(candidate.pages[0].page_id);
      }
    }

    return ids;
  }

  return (
    <main className="senate__graph_views">
      <GraphPageHeader
        baseRoute="stateElectionsData"
        baseRouteLabel="State Elections"
        subRoute={dataFormat}
      />
      {pathname !== '/stateElectionsData' && house ? (
        isFetching || Object.keys(currentCandidate).length === 0 ? (
          <Loader />
        ) : (
          <RaceGraphs
            raceId={raceId && raceId.length > 0 ? raceId : 'USP1'}
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
            candidatesInfo={currentCandidate}
            totalSpentModuleTitle={`How much have the ${
              raceId.substr(2, 1) === 'G'
                ? 'gubernatorial'
                : house && house === 'usHouse'
                ? 'House'
                : 'Senate'
            } campaigns spent on Facebook ads?`}
          />
        )
      ) : null}
    </main>
  );
}

RacePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      raceId: PropTypes.string,
    }),
  }),
  selectedRace: PropTypes.shape({
    country: PropTypes.string,
  }),
  requestDataForTopRaceAction: PropTypes.func,
  selectedCandidate: PropTypes.arrayOf(PropTypes.shape({})),
  allCandidates: PropTypes.shape({}),
  totalSpentData: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        graphColor: PropTypes.string,
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
  dataFormat: PropTypes.string,
  loadingRaceCandidates: PropTypes.bool,
};

RacePage.defaultProps = {
  match: {
    params: {
      raceId: '',
    },
  },
  selectedRace: {},
  requestDataForTopRaceAction: () => null,
  selectedCandidate: [{}],
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
  dataFormat: 'Overview',
  loadingRaceCandidates: false,
};

// Add redux needs here
const mapStateToProps = (
  { selectState, graphs },
  {
    match: {
      params: { raceId = 'Pres' },
    },
  },
) => ({
  selectedCandidate: selectState.selectedCandidate,
  selectedRace: selectState.selectedRace,
  allCandidates: selectState.allCandidates,
  loadingRaceCandidates: selectState.loading,
  totalSpentData: {
    isFetching:
      _get(graphs, [
        'dataByGraphName',
        graphNameByRaceId(GRAPH_NAME, raceId),
        'isFetching',
      ]) || false,
    data: (
      _get(graphs, [
        'dataByGraphName',
        graphNameByRaceId(GRAPH_NAME, raceId),
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
        graphNameByRaceId('spentOverTimeGraphRace', raceId),
        'isFetching',
      ]) || false,
    data: {
      ...transformPageSpentByTimePeriod(
        (
          _get(graphs, [
            'dataByGraphName',
            graphNameByRaceId('spentOverTimeGraphRace', raceId),
            'entities',
          ]) || []
        ).map(({ spend_by_week: spendByWeek }, key) => ({
          pageName: !key
            ? _get(graphs, [
                'dataByGraphName',
                graphNameByRaceId(GRAPH_NAME, raceId),
                'entities',
                key,
                'spenders',
                'page_name',
              ]) || ''
            : _get(graphs, [
                'dataByGraphName',
                graphNameByRaceId(GRAPH_NAME, raceId),
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
        graphNameByRaceId('spentByTopicGraphRace', raceId),
        'isFetching',
      ]) || false,
    data: transformTopicsSpentByTimePeriodRace(
      (
        _get(graphs, [
          'dataByGraphName',
          graphNameByRaceId('spentByTopicGraphRace', raceId),
          'entities',
        ]) || []
      ).map(({ spend_by_time_period }, key) => ({
        page_name: !key
          ? _get(graphs, [
              'dataByGraphName',
              graphNameByRaceId(GRAPH_NAME, raceId),
              'entities',
              key,
              'spenders',
              'page_name',
            ]) || ''
          : _get(graphs, [
              'dataByGraphName',
              graphNameByRaceId(GRAPH_NAME, raceId),
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
        graphNameByRaceId('totalSpentByTacticGraphRace', raceId),
        'isFetching',
      ]) || false,
    data: transformDataByTacticsGraphRace(
      (
        _get(graphs, [
          'dataByGraphName',
          graphNameByRaceId('totalSpentByTacticGraphRace', raceId),
          'entities',
        ]) || []
      ).map((item, key) => ({
        page_name: !key
          ? _get(graphs, [
              'dataByGraphName',
              graphNameByRaceId(GRAPH_NAME, raceId),
              'entities',
              key,
              'spenders',
              'page_name',
            ]) || ''
          : _get(graphs, [
              'dataByGraphName',
              graphNameByRaceId(GRAPH_NAME, raceId),
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
        graphNameByRaceId('audienceGraphRace', raceId),
        'isFetching',
      ]) || false,
    data: (
      _get(graphs, [
        'dataByGraphName',
        graphNameByRaceId('audienceGraphRace', raceId),
        'entities',
      ]) || []
    ).map((item, key) => ({
      page_name:
        _get(graphs, [
          'dataByGraphName',
          graphNameByRaceId(GRAPH_NAME, raceId),
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
  requestDataForTopRaceAction: requestDataForTopRace,
};

export default connect(mapStateToProps, (dispatch) =>
  bindActionCreators(mainActions, dispatch),
)(RacePage);

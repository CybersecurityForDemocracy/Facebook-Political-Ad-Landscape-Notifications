import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _get from 'lodash/get';
import moment from 'moment';
import { push } from 'connected-react-router';

import SwingStateSummaryInner from './SwingStateSummary';
import { apis } from '../../../modules/graphs/constants';
import { requestDataForGraph } from '../../../modules/graphs/actions';

const states = [
  'Florida',
  'Pennsylvania',
  'North Carolina',
  'Arizona',
  'Michigan',
  'Wisconsin',
  'Georgia',
  'Ohio',
  'Colorado',
  'Iowa',
];

const TABLE_COLUMN2 = 'home_polads_spent';
const TABLE_COLUMN3 = 'home_polads_change';
const TABLE_COLUMN4 = 'home_polads_trending_tactic';
const TABLE_COLUMN5 = 'home_polads_top_tactic';

function sumByRegion(data) {
  if (data && data.length > 0) {
    return data.map((state) => {
      const State = state.region_name;
      const Spent = (state.spenders || []).reduce(
        (sum, spender) => sum + spender.spend,
        0,
      );

      return {
        State,
        Spent,
      };
    });
  }

  return [];
}

function rateOfChangeByRegion(data) {
  const rateOfChangeArray = [];
  if (data && data.length > 0) {
    for (let idx = 0; idx < data.length; idx += 2) {
      const stateSpendingOverThePastWeek = data[idx];
      const stateSpendingOverThePastTwoWeeks = data[idx + 1];

      const State = stateSpendingOverThePastWeek.region_name;

      const spendingLastWeek = stateSpendingOverThePastWeek.spenders
        ? stateSpendingOverThePastWeek.spenders.reduce((acc, cur) => {
            let val = acc;
            val += cur.spend;

            return val;
          }, 0)
        : 0;

      /* we have spending over the past two weeks and also spending over the past one week. we want to calculate spending during the previous week, 
        which is (stateSpendingOverThePastTwoWeeks - stateSpendingOverThePastWeek)
      */
      const lastWeek =
        (stateSpendingOverThePastTwoWeeks.spenders
          ? stateSpendingOverThePastTwoWeeks.spenders.reduce((acc, cur) => {
              let val = acc;
              val += cur.spend;

              return val;
            }, 0)
          : 0) - spendingLastWeek;

      const change = Math.round(
        ((spendingLastWeek - lastWeek) / lastWeek) * 100,
      );

      rateOfChangeArray.push({
        State,
        Change: `${change}%`,
      });
    }
  }
  return rateOfChangeArray;
}

const mapStateToProps = ({ graphs }) => {
  const column2 = sumByRegion(
    _get(graphs, ['dataByGraphName', TABLE_COLUMN2, 'entities']) || [],
  );
  const column3 = rateOfChangeByRegion(
    _get(graphs, ['dataByGraphName', TABLE_COLUMN3, 'entities']) || [],
  );
  const column4 = (
    _get(graphs, ['dataByGraphName', TABLE_COLUMN4, 'entities']) || []
  ).map((entity) => {
    const State = entity.region_name;
    const TrendingTopic = entity.spend_by_topic.filter(
      ({ topic_name }) => topic_name !== 'Uncategorized',
    )[0].topic_name;

    return {
      State,
      TrendingTopic,
    };
  });
  const column5 = (
    _get(graphs, ['dataByGraphName', TABLE_COLUMN5, 'entities']) || []
  ).map((entity) => {
    const State = entity.region_name;
    const TopTactic = entity.spend_by_purpose[0].purpose;

    return {
      State,
      TopTactic,
    };
  });

  const chartData = states
    .map((state) => ({
      State: state,
      Spent: _get(
        column2[column2.findIndex((o) => o.State === state)],
        'Spent',
      ),
      'Change (WoW)': _get(
        column3[column3.findIndex((o) => o.State === state)],
        'Change',
      ),
      'Top Topic': _get(
        column4[column4.findIndex((o) => o.State === state)],
        'TrendingTopic',
      ),
      'Top Tactic': _get(
        column5[column5.findIndex((o) => o.State === state)],
        'TopTactic',
      ),
    }))
    .sort((a, b) => b.Spent - a.Spent);

  return {
    isFetching: _get(graphs, ['dataByGraphName', TABLE_COLUMN2, 'isFetching']),
    chartData,
  };
};

const mapDispatchToProps = (dispatch) => ({
  requestData: ({ graphName, apiArray }) =>
    dispatch(requestDataForGraph(graphName, apiArray)),
  historyPush: (url) => dispatch(push(url)),
});

const adLibraryReportDelayDays = 3;
function SwingStateSummary({
  requestData,
  chartData,
  isFetching,
  historyPush,
}) {
  useEffect(() => {
    // there's a few-day delay in getting the reports from Facebook, so on 9/30, we have data through 9/27 or so.
    // so we bake that delay into the week-over-week change calculation.
    const sevenDaysAgo = moment()
      .add(-7 - adLibraryReportDelayDays, 'days')
      .format('YYYY-MM-DD');
    const twoWeeksAgo = moment()
      .add(-14 - adLibraryReportDelayDays, 'days')
      .format('YYYY-MM-DD');

    const apiArrayByPageOfRegion = states.map((state) => ({
      api: apis.totalSpendByPageOfRegion,
      params: {
        region: state,
        start_date: twoWeeksAgo,
      },
    }));

    const apiArrayTrendByPageOfRegion = [];

    states.forEach((state) => {
      apiArrayTrendByPageOfRegion.push({
        api: apis.totalSpendByPageOfRegion,
        params: {
          region: state,
          start_date: sevenDaysAgo,
        },
      });
      apiArrayTrendByPageOfRegion.push({
        api: apis.totalSpendByPageOfRegion,
        params: {
          region: state,
          start_date: twoWeeksAgo,
        },
      });
    });

    const apiArrayByTopicOfRegion = states.map((state) => ({
      api: apis.totalSpendByTopicOfRegion,
      params: {
        region: state,
        start_date: twoWeeksAgo,
      },
    }));

    const apiArrayByPurposeOfRegion = states.map((state) => ({
      api: apis.totalSpendByPurposeOfRegion,
      params: {
        region: state,
        start_date: twoWeeksAgo,
      },
    }));

    requestData({
      graphName: TABLE_COLUMN2,
      apiArray: apiArrayByPageOfRegion,
    });

    requestData({
      graphName: TABLE_COLUMN3,
      apiArray: apiArrayTrendByPageOfRegion,
    });

    requestData({
      graphName: TABLE_COLUMN4,
      apiArray: apiArrayByTopicOfRegion,
    });

    requestData({
      graphName: TABLE_COLUMN5,
      apiArray: apiArrayByPurposeOfRegion,
    });
  }, [requestData]);

  return (
    <SwingStateSummaryInner
      data={chartData}
      isFetching={isFetching}
      historyPush={historyPush}
    />
  );
}

SwingStateSummary.propTypes = {
  requestData: PropTypes.func,
  chartData: PropTypes.arrayOf(PropTypes.shape({})),
  isFetching: PropTypes.bool,
  historyPush: PropTypes.func,
};

SwingStateSummary.defaultProps = {
  requestData: () => null,
  chartData: [],
  isFetching: true,
  historyPush: () => null,
};

export default connect(mapStateToProps, mapDispatchToProps)(SwingStateSummary);

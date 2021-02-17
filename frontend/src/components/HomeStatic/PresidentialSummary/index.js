import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _get from 'lodash/get';
import _invert from 'lodash/invert';
import { push } from 'connected-react-router';

import PresidentialSummaryInner from './PresidentialSummary';

import {
  apis,
  pageIds,
  homepagePresidentialSpentOverTimeStartDate,
} from '../../../modules/graphs/constants';
import { transformPageSpentByTimePeriod } from '../../../modules/graphs/util';
import { requestDataForGraph } from '../../../modules/graphs/actions';

const PRESIDENT_SPENT_NAME = 'home_president_spent';
const interval = 'week';

const mapStateToProps = ({ graphs }) => ({
  presidentSpent: {
    isFetching:
      _get(graphs, ['dataByGraphName', PRESIDENT_SPENT_NAME, 'isFetching']) ||
      false,
    data: {
      ...transformPageSpentByTimePeriod(
        (
          _get(graphs, ['dataByGraphName', PRESIDENT_SPENT_NAME, 'entities']) ||
          []
        ).map(({ spend_by_week: spendByWeek, page_id: pageID }) => ({
          pageName: _invert(pageIds)[`${pageID}`],
          spendByWeek,
        })),
      ),
      interval,
    },
  },
});

const mapDispatchToProps = (dispatch) => ({
  requestData: ({ graphName, apis: APIs }) =>
    dispatch(requestDataForGraph(graphName, APIs)),
  historyPush: (url) => dispatch(push(url)),
});

function PresidentialSummary(props) {
  const { requestData, presidentSpent, historyPush } = props;

  useEffect(() => {
    requestData({
      graphName: PRESIDENT_SPENT_NAME,
      apis: [
        {
          api: apis.spendByTimePeriodOfPageOfRegion,
          params: {
            region: 'US',
            start_data: homepagePresidentialSpentOverTimeStartDate,
            pageID: pageIds['Donald Trump'],
          },
        },
        {
          api: apis.spendByTimePeriodOfPageOfRegion,
          params: {
            region: 'US',
            start_data: homepagePresidentialSpentOverTimeStartDate,
            pageID: pageIds['Joe Biden'],
          },
        },
      ],
    });
  }, [requestData]);

  return (
    <PresidentialSummaryInner
      interval={interval}
      data={presidentSpent.data.spend}
      keys={presidentSpent.data.keys}
      isFetching={presidentSpent.isFetching}
      historyPush={historyPush}
    />
  );
}

PresidentialSummary.propTypes = {
  requestData: PropTypes.func.isRequired,
  presidentSpent: PropTypes.shape({
    isFetching: PropTypes.bool,
    data: PropTypes.shape({
      spend: PropTypes.arrayOf(PropTypes.shape({})),
      keys: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
  historyPush: PropTypes.func,
};

PresidentialSummary.defaultProps = {
  presidentSpent: {
    isFetching: false,
    data: {
      spend: [],
      keys: [],
    },
  },
  historyPush: () => null,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PresidentialSummary);

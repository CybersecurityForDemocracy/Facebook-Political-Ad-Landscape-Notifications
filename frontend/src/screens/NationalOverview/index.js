import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import _get from 'lodash/get';
import { push } from 'connected-react-router';

import {
  apis,
  pageIds,
  generalChartStartDate,
} from '../../modules/graphs/constants';

import NationalOverview from './NationalOverview';

import { requestDataForGraph } from '../../modules/graphs/actions';

export const SPONSORS_GRAPH_NAME = 'nationOverviewSponsors_US';
export const TOPICS_GRAPH_NAME = 'nationOverviewTopics_US';
export const TOPICS_TOP_FIVE = 'nationOverviewTopics_TopFive_US';
export const PRESIDENT_SPENT_NAME = 'nationOverviewPresidentSpent_US';

// Add redux needs here
const mapStateToProps = ({ graphs }) => ({
  sponsorsTotalSpent: {
    isFetching:
      _get(graphs, ['dataByGraphName', SPONSORS_GRAPH_NAME, 'isFetching']) ||
      false,
    data:
      _get(graphs, [
        'dataByGraphName',
        SPONSORS_GRAPH_NAME,
        'entities',
        'spenders',
      ]) || [],
  },
  topicsTopFive: {
    isFetching:
      _get(graphs, ['dataByGraphName', TOPICS_TOP_FIVE, 'isFetching']) || false,
    data:
      _get(graphs, [
        'dataByGraphName',
        TOPICS_TOP_FIVE,
        'entities',
        'spend_by_topic',
      ]) || [],
  },
  topicsTotalSpent: {
    isFetching:
      _get(graphs, ['dataByGraphName', TOPICS_GRAPH_NAME, 'isFetching']) ||
      false,
    data:
      _get(graphs, ['dataByGraphName', TOPICS_GRAPH_NAME, 'entities']) || [],
  },
  presidentSpent: {
    isFetching:
      _get(graphs, ['dataByGraphName', PRESIDENT_SPENT_NAME, 'isFetching']) ||
      false,
    data: (
      _get(graphs, ['dataByGraphName', PRESIDENT_SPENT_NAME, 'entities']) || []
    ).map(({ spenders }) => ({
      page_name: spenders[0].page_name,
      spend: spenders[0].spend,
    })),
  },
});

const mapDispatchToProps = (dispatch) => ({
  requestData: ({ graphName, apis: APIs }) =>
    dispatch(requestDataForGraph(graphName, APIs)),
  historyPush: (url) => dispatch(push(url)),
});

/**
 * Transform data into format usable by graph
 * @param {{spend_in_timeperiod: {}, topic_name: string}[]} data - topic data
 */
function transformTopicsTotalSpent(data) {
  const topics = [];
  const spendData = data
    .reduce((acc, cur) => {
      const {
        spend_in_timeperiod: spendInTimePeriod,
        topic_name: topicName,
      } = cur;
      topics.push(topicName);
      const timePeriods = Object.keys(spendInTimePeriod);

      timePeriods.forEach((timePeriod) => {
        const idx = acc.findIndex((o) => o.week === timePeriod);
        if (idx > -1) {
          acc[idx][topicName] = spendInTimePeriod[timePeriod];
        } else {
          acc.push({
            week: timePeriod,
            [topicName]: spendInTimePeriod[timePeriod],
          });
        }
      });
      return acc;
    }, [])
    .sort((a, b) => {
      const dateA = moment(a.week);
      const dateB = moment(b.week);

      if (dateB.isAfter(dateA)) {
        return -1;
      }
      if (dateB.isBefore(dateA)) {
        return 1;
      }
      return 0;
    });

  return {
    topics,
    data: spendData,
  };
}

class NationalOverviewPage extends React.Component {
  componentDidMount() {
    const { dataFormat } = this.props;

    if (dataFormat === 'Overview') {
      this.getOverviewData();
    }
  }

  componentDidUpdate({ topicsTopFive: prevTopicsTopFive }) {
    const { topicsTopFive, requestData } = this.props;
    if (
      (!prevTopicsTopFive.data || !prevTopicsTopFive.data.length) &&
      topicsTopFive.data &&
      topicsTopFive.data.length
    ) {
      const apiParams = topicsTopFive.data
        .filter((obj) => obj.topic_name !== 'Uncategorized')
        .slice(0, 5)
        .map((topic) => ({
          api: apis.spendByTimePeriodOfTopicOfRegion,
          params: {
            topicName: topic.topic_name,
            region: 'US',
            start_date: generalChartStartDate,
          },
        }));
      requestData({ graphName: TOPICS_GRAPH_NAME, apis: apiParams });
    }
  }

  getOverviewData = () => {
    const { requestData } = this.props;
    requestData({
      graphName: SPONSORS_GRAPH_NAME,
      apis: [
        {
          api: apis.totalSpendByPageOfRegion,
          params: {
            region: 'US',
            start_date: generalChartStartDate,
          },
        },
      ],
    });
    requestData({
      graphName: TOPICS_TOP_FIVE,
      apis: [
        {
          api: apis.totalSpendByTopicOfRegion,
          params: {
            region: 'US',
            start_date: generalChartStartDate,
          },
        },
      ],
    });
    requestData({
      graphName: PRESIDENT_SPENT_NAME,
      apis: [
        {
          api: apis.totalSpendOfPageOfRegion,
          params: {
            region: 'US',
            start_date: generalChartStartDate,
            pageID: pageIds['Donald Trump'],
          },
        },
        {
          api: apis.totalSpendOfPageOfRegion,
          params: {
            region: 'US',
            start_date: generalChartStartDate,
            pageID: pageIds['Joe Biden'],
          },
        },
      ],
    });
  };

  render() {
    const {
      topicsTotalSpent,
      dataFormat,
      sponsorsTotalSpent,
      presidentSpent,
      topicsTopFive,
      historyPush,
    } = this.props;

    let topicData = {
      data: [],
      topics: [],
      isFetching: topicsTopFive.isFetching || topicsTotalSpent.isFetching,
    };

    if (topicsTotalSpent.data && topicsTotalSpent.data.length > 0) {
      topicData = transformTopicsTotalSpent(topicsTotalSpent.data);
    }

    return (
      <NationalOverview
        dataFormat={dataFormat}
        sponsorsTotalSpent={sponsorsTotalSpent}
        presidentSpent={presidentSpent}
        topicData={topicData}
        historyPush={historyPush}
      />
    );
  }
}

NationalOverviewPage.propTypes = {
  requestData: PropTypes.func,
  historyPush: PropTypes.func,
  dataFormat: PropTypes.oneOf(['Overview', 'Presidential']),
  sponsorsTotalSpent: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
  }),
  topicsTopFive: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
  }),
  topicsTotalSpent: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
  }),
  presidentSpent: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
  }),
};

NationalOverviewPage.defaultProps = {
  requestData: () => null,
  historyPush: () => null,
  dataFormat: 'Overview',
  sponsorsTotalSpent: {
    data: [],
    isFetching: false,
  },
  topicsTopFive: {
    data: [],
    isFetching: false,
  },
  topicsTotalSpent: {
    data: [],
    isFetching: false,
  },
  presidentSpent: {
    data: [],
    isFetching: false,
  },
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NationalOverviewPage);

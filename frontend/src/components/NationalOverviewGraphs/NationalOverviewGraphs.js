/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import SponsorsGraph from '../SponsorsGraph';
import SpentByTopicGraph from '../SpentByTopicGraph';
import TotalSpentGraph from '../TotalSpentGraph';
import { contentTitles } from '../../modules/modal/constants';

function NationalOverviewGraphs({
  sponsorsData,
  sponsorsDataIsFetching,
  topicData,
  topicDataIsFetching,
  presidentData,
  presidentDataIsFetching,
  historyPush,
}) {
  // TODO: get route data from router props
  return (
    <>
      <SponsorsGraph
        data={sponsorsData}
        isFetching={sponsorsDataIsFetching}
        region="the United States"
      />
      <br />
      <br />
      <SpentByTopicGraph
        data={topicData.data}
        topics={topicData.topics}
        isFetching={topicDataIsFetching}
        contentTitle={contentTitles.SPEND_BY_TOPIC_NATIONAL}
      />
      <br />
      <br />
      <TotalSpentGraph
        data={presidentData}
        moduleTitle="Trump vs. Biden ad spending nationwide"
        isFetching={presidentDataIsFetching}
        contentTitle={contentTitles.PRESIDENT}
        onClickSeeMoreData={() => historyPush('/nationalData/presidential')}
      />
    </>
  );
}

NationalOverviewGraphs.propTypes = {
  sponsorsData: PropTypes.array,
  sponsorsDataIsFetching: PropTypes.bool,
  topicData: PropTypes.shape({
    data: PropTypes.array,
    topics: PropTypes.array,
  }),
  topicDataIsFetching: PropTypes.bool,
  presidentData: PropTypes.array,
  presidentDataIsFetching: PropTypes.bool,
  historyPush: PropTypes.func,
};

NationalOverviewGraphs.defaultProps = {
  sponsorsData: [],
  sponsorsDataIsFetching: false,
  topicData: [],
  topicDataIsFetching: false,
  presidentData: [],
  presidentDataIsFetching: false,
  historyPush: () => null,
};

export default NationalOverviewGraphs;

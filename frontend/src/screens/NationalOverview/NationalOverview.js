import React from 'react';
import PropTypes from 'prop-types';

import NationalOverviewGraphs from '../../components/NationalOverviewGraphs';
import GraphPageHeader from '../../components/GraphPageHeader';
import GeneralGraphs from '../../components/GeneralGraphs';

function NationalOverview({
  dataFormat,
  sponsorsTotalSpent,
  presidentSpent,
  topicData,
  historyPush,
}) {
  const getContent = () => {
    if (dataFormat === 'Overview') {
      return (
        <NationalOverviewGraphs
          sponsorsData={sponsorsTotalSpent.data}
          sponsorsDataIsFetching={sponsorsTotalSpent.isFetching}
          topicData={topicData}
          topicDataIsFetching={topicData.isFetching}
          presidentData={presidentSpent.data}
          presidentDataIsFetching={presidentSpent.isFetching}
          historyPush={historyPush}
        />
      );
    }
    return <GeneralGraphs />; // what is this used for?!
  };

  return (
    <main className="polads__graph_views">
      <GraphPageHeader
        baseRouteLabel="Nation"
        baseRoute="nationalData"
        subRoute={dataFormat}
      />
      {getContent()}
    </main>
  );
}

NationalOverview.propTypes = {
  dataFormat: PropTypes.oneOf(['Overview', 'Presidential']),
  sponsorsTotalSpent: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
  }),
  presidentSpent: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
  }),
  topicData: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.shape({})),
    topics: PropTypes.arrayOf(PropTypes.string),
    isFetching: PropTypes.bool,
  }),
  historyPush: PropTypes.func,
};

NationalOverview.defaultProps = {
  dataFormat: 'Overview',
  sponsorsTotalSpent: {
    data: [],
    isFetching: false,
  },
  presidentSpent: {
    data: [],
    isFetching: false,
  },
  topicData: {
    data: [],
    topics: [],
    isFetching: false,
  },
  historyPush: () => null,
};

export default NationalOverview;

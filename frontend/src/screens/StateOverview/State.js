import React from 'react';
import PropTypes from 'prop-types';

import GraphPageHeader from '../../components/GraphPageHeader';
import StateOverview from '../../components/StateOverview';

const State = (props) => {
  const { dataFormat, ...rest } = props;

  return (
    <main className="polads__graph_views">
      <GraphPageHeader
        baseRoute="stateData"
        baseRouteLabel="State"
        subRoute="Overview"
      />
      <StateOverview {...rest} baseRoute="stateData" />
    </main>
  );
};

State.propTypes = {
  dataFormat: PropTypes.string,
};

State.defaultProps = {
  dataFormat: 'Overview',
};

export default State;

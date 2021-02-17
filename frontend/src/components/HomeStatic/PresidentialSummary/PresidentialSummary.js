import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import BaseButton from '../../BaseButton';
import LineGraph from '../../../graphs/LineGraph';
import GraphTable from '../../../graphs/GraphTable';
import colors from '../../../styles/graphs';
import { contentTitles } from '../../../modules/modal/constants';
import Loader from '../../Loader';

function PresidentialSummary({ data, keys, interval, isFetching }) {
  const renderChart = () => {
    if (isFetching) {
      // TODO: create graph placeholder
      return <Loader />;
    }
    if (!data || data.length < 1) {
      return null;
    }

    const color =
      keys[0] === 'Donald Trump'
        ? [colors.red, colors.blue]
        : [colors.blue, colors.red];

    const graphComponent = (
      <LineGraph
        data={data}
        graphDataKey={keys}
        xDataKey={interval}
        colors={color}
        tooltip
        legend
        legendLocation="top"
      />
    );

    return (
      <GraphTable
        title="Trump vs. Biden: Facebook political ad spending by week"
        contentTitle={contentTitles.PRESIDENT_HOME_PAGE}
        graphComponent={graphComponent}
        showToggle={false}
      />
    );
  };

  return (
    <div className="polads__national_overview__component">
      <div className="polads__container">
        <div className="polads__national_overview__container">
          <h3 className="national_overview" style={{ marginBottom: '1rem' }}>
            Who relies on Facebook political ads?
          </h3>
          <p className="national_overview__content">
            Which candidates, super PACS, and dark money groups are spending
            most on Facebook advertising nationwide? What topics do they
            emphasize and what objectives do they seek to achieve with ads?
          </p>
          <BaseButton tag={Link} to="/nationalData/overview">
            Explore National Data
          </BaseButton>
        </div>
      </div>
      <div className="polads__container">{renderChart()}</div>
    </div>
  );
}

PresidentialSummary.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})),
  keys: PropTypes.arrayOf(PropTypes.string),
  interval: PropTypes.oneOf(['week', 'month']).isRequired,
  isFetching: PropTypes.bool,
};

PresidentialSummary.defaultProps = {
  data: [],
  keys: [],
  isFetching: false,
};

export default PresidentialSummary;

import React from 'react';
import PropTypes from 'prop-types';

function CustomLegend({ candidateName, payload }) {
  const getCandidateName = () => {
    if (candidateName) {
      return (
        <span className="polads__custom_legend__candidate">
          {candidateName}
        </span>
      );
    }
    return null;
  };

  const getLegendItems = () => {
    if (Array.isArray(payload) && payload.length > 0) {
      return (
        <ul className="polads__custom_legend__list">
          {payload.map((entry, index) => (
            <li key={`${entry}-${index}`}>{entry.value}</li>
          ))}
        </ul>
      );
    }
    return null;
  };

  return (
    <div className="polads__custom_legend">
      {getCandidateName()}
      {getLegendItems()}
    </div>
  );
}

CustomLegend.propTypes = {
  candidateName: PropTypes.string,
  payload: PropTypes.array,
};

CustomLegend.defaultProps = {
  candidateName: null,
  payload: [],
};

export default CustomLegend;

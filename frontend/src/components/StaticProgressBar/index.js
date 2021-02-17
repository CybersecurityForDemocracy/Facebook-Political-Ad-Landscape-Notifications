import React from 'react';
import PropTypes from 'prop-types';

import colors from '../../styles/graphs';

function StaticProgressBar({ progress, color }) {
  const progressBarStyles = {
    background: colors[color] || color,
    width: `${progress}%`,
  };

  return (
    <div className="static-progress-bar__base">
      <div
        className="static-progress-bar__progress"
        style={progressBarStyles}
      />
    </div>
  );
}

StaticProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
  color: PropTypes.string,
};

StaticProgressBar.defaultProps = {
  color: 'red',
};

export default StaticProgressBar;

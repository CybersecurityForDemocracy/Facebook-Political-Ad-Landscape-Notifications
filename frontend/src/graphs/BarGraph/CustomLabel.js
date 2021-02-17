import React from 'react';
import PropTypes from 'prop-types';

import graphColors from '../../styles/graphs';
import util from '../util';

function CustomLabel({ x, y, width, height, value, isHorizontal }) {
  const formattedValue = util.usdTruncateNumberFormatter(value);
  if (isHorizontal) {
    return (
      <text
        x={x + width / 2}
        y={y}
        fill={graphColors.text}
        textAnchor="middle"
        dy={-6}
      >
        {formattedValue}
      </text>
    );
  }
  return (
    <text
      x={x * 1.35 + width}
      y={y + height / 1.5}
      fill={graphColors.text}
      textAnchor="middle"
      dx={-15}
      fontWeight="bold"
    >
      {formattedValue}
    </text>
  );
}

CustomLabel.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  isHorizontal: PropTypes.bool,
};

CustomLabel.defaultProps = {
  isHorizontal: false,
};

export default CustomLabel;

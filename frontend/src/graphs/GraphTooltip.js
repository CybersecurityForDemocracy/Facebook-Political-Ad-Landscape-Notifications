import React from 'react';
import PropTypes from 'prop-types';

import util from './util';

const { usdTruncateNumberFormatter, nameFormatter } = util;

const CustomTooltip = (props) => {
  const { active, label, payload, tooltipKey, colors = [] } = props;
  let color = '';

  if (active && payload) {
    const labelPayload = payload.filter((p) => p.dataKey === tooltipKey);
    if (labelPayload[0]) {
      if (typeof labelPayload[0].fill === 'object') {
        for (const c of colors) {
          if (c.name === labelPayload[0].payload.page_name) {
            color = c.color;
            break;
          }
        }
      } else {
        color = labelPayload[0].stroke || labelPayload[0].fill;
      }
    }

    if (Array.isArray(labelPayload) && labelPayload.length) {
      return (
        <div className="custom-tooltip">
          <div style={{ display: 'inline-block' }}>
            <p className="title" style={{ textTransform: 'capitalize' }}>
              {nameFormatter(labelPayload[0].dataKey)}
            </p>
            <p className="label">{label}</p>
          </div>
          <span className="value" style={{ color }}>
            <b>{usdTruncateNumberFormatter(labelPayload[0].value)}</b>
          </span>
        </div>
      );
    }
  }

  return null;
};

CustomTooltip.propTypes = {
  /* recharts props */
  active: PropTypes.bool,
  label: PropTypes.string,
  payload: PropTypes.array, // eslint-disable-line
  /* custom props */
  tooltipKey: PropTypes.string,
};

CustomTooltip.defaultProps = {
  active: false,
  label: '',
  payload: [],
  tooltipKey: '',
};

export default CustomTooltip;

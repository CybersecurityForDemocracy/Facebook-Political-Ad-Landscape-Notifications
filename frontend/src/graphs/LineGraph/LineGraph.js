import React from 'react';
import PropTypes from 'prop-types';
import {
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import graphColors from '../../styles/graphs';
import GraphTooltip from '../GraphTooltip';
import util from '../util';

const { usdTruncateNumberFormatter } = util;

function LineGraph({
  data,
  legend,
  legendLocation,
  tooltip,
  graphDataKey,
  xDataKey,
  yDataKey,
  showYAxis,
  colors,
  monotone,
  stacks,
  keyFormatter,
}) {
  const [tooltipKey, setTooltipKey] = React.useState('');
  const renderLines = () =>
    graphDataKey.length &&
    graphDataKey.map((key, idx) => (
      <Area
        isAnimationActive={false}
        connectNulls
        key={key}
        dataKey={key}
        stroke={colors[idx]}
        fill={`url(#color${idx})`}
        fillOpacity={1}
        type={monotone ? 'monotone' : null}
        strokeWidth="3"
        dot={{
          fill: colors[idx],
          strokeWidth: 3,
          stroke: '#FFF',
          r: 6,
        }}
        stackId={stacks[idx]}
        activeDot={{
          onMouseOver: () => setTooltipKey(key),
          onMouseLeave: () => setTooltipKey(''),
        }}
      />
    ));

  const renderGradients = () =>
    colors.map((color, idx) => (
      <linearGradient
        key={`color-${color}`}
        id={`color${idx}`}
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop offset="36%" stopColor={color} stopOpacity={0.2} />
        <stop offset="92%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    ));

  return (
    <div className="polads__graph_container">
      <ResponsiveContainer width="97%">
        <AreaChart data={data}>
          <defs>{renderGradients()}</defs>
          <CartesianGrid stroke={graphColors.grid} strokeDasharray="5 5" />
          <XAxis
            dataKey={xDataKey}
            tickLine={false}
            axisLine={false}
            stroke={graphColors.lightText}
            tickFormatter={keyFormatter}
          />

          <YAxis
            dataKey={null}
            tickLine={false}
            axisLine={false}
            stroke={graphColors.lightText}
            tickFormatter={usdTruncateNumberFormatter}
          />

          {tooltip && (
            <Tooltip
              cursor={false}
              content={<GraphTooltip tooltipKey={tooltipKey} />}
            />
          )}
          {legend && (
            <Legend
              verticalAlign={legendLocation}
              height={48}
              iconType="square"
            />
          )}
          {renderLines()}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

LineGraph.propTypes = {
  graphDataKey: PropTypes.arrayOf(PropTypes.string).isRequired,
  legendLocation: PropTypes.oneOf(['top', 'bottom', 'middle']),
  tooltip: PropTypes.bool,
  legend: PropTypes.bool,
  data: PropTypes.array, // eslint-disable-line
  xDataKey: PropTypes.string,
  yDataKey: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string),
  showYAxis: PropTypes.bool,
  monotone: PropTypes.bool,
  stacks: PropTypes.arrayOf(PropTypes.string),
  keyFormatter: PropTypes.func,
};

LineGraph.defaultProps = {
  tooltip: false,
  legend: false,
  legendLocation: 'top',
  data: [],
  xDataKey: null,
  yDataKey: null,
  colors: [],
  showYAxis: true,
  monotone: true,
  stacks: [],
  keyFormatter: null,
};

export default LineGraph;

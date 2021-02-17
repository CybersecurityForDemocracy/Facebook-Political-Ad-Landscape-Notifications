/* eslint-disable react/forbid-prop-types */
/**
 * @module BarGraph
 * Bar graph component.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import CustomLabel from './CustomLabel';
import GraphTooltip from '../GraphTooltip';

import graphColors from '../../styles/graphs';

import { openSponsorPage } from '../../utils/common';

export const BAR_GRAPH_LAYOUTS = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
};

function BarGraph({
  data,
  legend,
  legendLocation,
  tooltip,
  graphDataKey,
  xDataKey,
  yDataKey,
  showYAxis,
  barSize,
  layout,
  colors,
  showBarLabel,
  stacks,
  tick,
  margin,
  style,
  showXAxisLine,
  showYAxisLine,
  tickFormatter,
  renderCustomBars,
  onClick,
}) {
  const isHorizontal = layout === BAR_GRAPH_LAYOUTS.HORIZONTAL;
  const xAxisType = isHorizontal ? 'category' : 'number';
  const yAxisType = isHorizontal ? 'number' : 'category';
  const xAxisLine = showXAxisLine;
  const yAxisLine = showYAxisLine;
  const [tooltipKey, setTooltipKey] = React.useState('');

  const renderBars = () => {
    if (Array.isArray(graphDataKey) && graphDataKey.length) {
      const getStack = (idx) => {
        if (stacks && Array.isArray(stacks) && stacks.length > idx) {
          return stacks[idx];
        }
        return null;
      };
      const renderLabel = (props) => (
        <CustomLabel {...props} isHorizontal={isHorizontal} />
      ); // eslint-disable-line

      // assuming each key will have a different color
      return graphDataKey.map((key, idx) => (
        <Bar
          isAnimationActive={false}
          key={key}
          dataKey={key}
          fill={colors[idx]}
          maxBarSize={barSize}
          radius={isHorizontal ? [2, 2, 0, 0] : [0, 2, 2, 0]}
          label={showBarLabel && renderLabel}
          stackId={getStack(idx)}
          onMouseOver={() => {
            setTooltipKey(key);
          }}
          onFocus={() => {
            setTooltipKey(key);
          }}
          onClick={onClick}
        />
      ));
    }
    return null;
  };

  return (
    <div className="polads__graph_container" style={style}>
      <ResponsiveContainer width="97%">
        <BarChart data={data} layout={layout} margin={margin}>
          <CartesianGrid stroke={graphColors.grid} strokeDasharray="5 5" />
          <XAxis
            type={xAxisType}
            dataKey={xDataKey}
            tickLine={false}
            axisLine={xAxisLine}
            stroke={graphColors.text}
            tickFormatter={(!isHorizontal && tickFormatter) || null}
          />
          {showYAxis && (
            <YAxis
              type={yAxisType}
              dataKey={yDataKey}
              tickLine={false}
              axisLine={yAxisLine}
              tick={tick}
              tickFormatter={(isHorizontal && tickFormatter) || null}
              onClick={(e) => {
                let page_of_interest = data.filter((o) => {
                  return o.page_name === e.value;
                })[0];
                openSponsorPage(
                  page_of_interest.page_id,
                  page_of_interest.page_name,
                );
              }}
            />
          )}
          {tooltip && (
            <Tooltip
              cursor={false}
              content={<GraphTooltip tooltipKey={tooltipKey} colors={colors} />}
            />
          )}
          {legend && <Legend verticalAlign={legendLocation} height={48} />}
          {renderCustomBars ? renderCustomBars(setTooltipKey) : renderBars()}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

BarGraph.propTypes = {
  graphDataKey: PropTypes.arrayOf(PropTypes.string).isRequired,
  colors: PropTypes.arrayOf(PropTypes.string),
  data: PropTypes.array, // eslint-disable-line
  xDataKey: PropTypes.string,
  yDataKey: PropTypes.string,
  showYAxis: PropTypes.bool,
  tooltip: PropTypes.bool,
  barSize: PropTypes.number,
  legend: PropTypes.bool,
  legendLocation: PropTypes.oneOf(['top', 'middle', 'bottom']),
  layout: PropTypes.oneOf(Object.values(BAR_GRAPH_LAYOUTS)),
  showBarLabel: PropTypes.bool,
  stacks: PropTypes.arrayOf(PropTypes.string),
  tick: PropTypes.shape({}),
  margin: PropTypes.shape({}),
  style: PropTypes.shape({}),
  showXAxisLine: PropTypes.bool,
  showYAxisLine: PropTypes.bool,
  tickFormatter: PropTypes.func,
  renderCustomBars: PropTypes.func,
};

BarGraph.defaultProps = {
  colors: [graphColors.blue],
  data: [],
  xDataKey: null,
  yDataKey: null,
  showYAxis: true,
  tooltip: false,
  barSize: 60,
  legend: false,
  legendLocation: 'bottom',
  layout: BAR_GRAPH_LAYOUTS.HORIZONTAL,
  showBarLabel: false,
  stacks: null,
  tick: null,
  margin: null,
  style: null,
  showXAxisLine: false,
  showYAxisLine: false,
  tickFormatter: null,
  renderCustomBars: null,
};

export default BarGraph;

import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import STATE_DATA from './stateData';
import USAState from './USAState';

const USAMap = ({
  onClick,
  onMouseOver,
  width,
  height,
  title,
  id,
  defaultFill,
  customize,
}) => {
  const clickHandler = (stateAbbr) => {
    onClick(stateAbbr);
  };
  const mouseOverHandler = (stateAbbr) => {
    onMouseOver(stateAbbr);
  };
  const fillStateColor = (state) =>
    get(customize, [state, 'fill'], defaultFill);
  const stateClickHandler = (state) =>
    get(customize, [state, 'clickHandler'], clickHandler);
  const stateMouseOverHandler = (state) =>
    get(customize, [state, 'mouseOverHandler'], mouseOverHandler);
  const getTooltipData = (state) => get(customize, [state, 'tooltip'], null);

  const dcData = {
    [`data-${id}`]: true,
    [`data-${id}-name`]: 'DC',
    [`data-${id}-title`]: 'DC',
    [`data-${id}-state-data`]: JSON.stringify(getTooltipData('DC')),
  };

  return (
    <svg
      className="us-state-map"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 959 593"
    >
      <title>{title}</title>
      <g className="outlines">
        {Object.entries(STATE_DATA).map(([abbr, state]) => (
          <USAState
            key={abbr}
            stateName={state.name}
            dimensions={state.dimensions}
            state={abbr}
            id={id}
            fill={fillStateColor(abbr)}
            onClickState={stateClickHandler(abbr)}
            onMouseOverState={stateMouseOverHandler(abbr)}
            tooltipData={getTooltipData(abbr)}
          />
        ))}
        <g className="DC state">
          <path
            className="DC1"
            fill={fillStateColor('DC1')}
            d="M801.8,253.8 l-1.1-1.6 -1-0.8 1.1-1.6 2.2,1.5z"
          />
          <circle
            className="DC2"
            onClick={clickHandler}
            {...dcData}
            fill={fillStateColor('DC2')}
            stroke="#FFFFFF"
            strokeWidth="1.5"
            cx="801.3"
            cy="251.8"
            r="5"
            opacity="1"
          />
        </g>
      </g>
    </svg>
  );
};

USAMap.propTypes = {
  onClick: PropTypes.func,
  onMouseOver: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number,
  title: PropTypes.string,
  id: PropTypes.string.isRequired,
  defaultFill: PropTypes.string,
  customize: PropTypes.object,
};

USAMap.defaultProps = {
  onClick: () => {},
  onMouseOver: () => {},
  width: 959,
  height: 593,
  defaultFill: '#DDDDDD',
  title: 'US States Map',
  customize: {},
};

export default USAMap;

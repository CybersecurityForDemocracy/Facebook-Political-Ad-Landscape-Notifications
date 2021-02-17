/* eslint-disable */
import React from 'react';

const USAState = ({
  dimensions,
  fill,
  id,
  state,
  onClickState,
  stateName,
  tooltipData,
}) => {
  const data = {
    [`data-${id}`]: true,
    [`data-${id}-name`]: state,
    [`data-${id}-title`]: stateName,
    [`data-${id}-state-data`]: JSON.stringify(tooltipData),
  };
  return (
    <path
      d={dimensions}
      fill={fill}
      className={`${state} state`}
      onClick={onClickState}
      {...data}
    />
  );
};

export default USAState;

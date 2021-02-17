import React from 'react';
import PropTypes from 'prop-types';

function Cell({ children, style, className = '' }) {
  return (
    <td
      className={className === '' ? 'polads__table__cell' : className}
      style={style}
    >
      {children}
    </td>
  );
}

Cell.propTypes = {
  children: PropTypes.any, // eslint-disable-line
  style: PropTypes.any, // eslint-disable-line
};

Cell.defaultProps = {
  children: null,
  style: null,
};

export default Cell;

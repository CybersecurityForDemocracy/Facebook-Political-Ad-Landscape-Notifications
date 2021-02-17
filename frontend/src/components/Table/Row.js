import React from 'react';
import PropTypes from 'prop-types';

function Row({ children, style, onClick, className = '' }) {
  return (
    <tr
      className={className || 'polads__table__row'}
      style={style}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

Row.propTypes = {
  children: PropTypes.any, // eslint-disable-line
  style: PropTypes.any, // eslint-disable-line
  onClick: PropTypes.func,
  className: PropTypes.string,
};

Row.defaultProps = {
  children: null,
  style: {},
  onClick: () => null,
  className: null,
};

export default Row;

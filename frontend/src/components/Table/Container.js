import React from 'react';
import PropTypes from 'prop-types';

function Container({ children, style }) {
  return (
    <table className="polads__table__container" style={style}>
      {children}
    </table>
  );
}

Container.propTypes = {
  children: PropTypes.any, // eslint-disable-line
  style: PropTypes.shape({}),
};

Container.defaultProps = {
  children: null,
  style: null,
};

export default Container;

import React from 'react';
import PropTypes from 'prop-types';

function Body({ children }) {
  return <tbody className="polads__table__body">{children}</tbody>;
}

Body.propTypes = {
  children: PropTypes.any, // eslint-disable-line
};

Body.defaultProps = {
  children: null,
};

export default Body;

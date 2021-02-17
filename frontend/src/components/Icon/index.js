import React from 'react';
import PropTypes from 'prop-types';

import icons from '../../constants/icons';
import colors from '../../styles/graphs';

function Icon({ name, color, style }) {
  const className = `polads__icon ${icons[name]}`;

  const styles = {
    color: colors[color] || color,
    ...style,
  };

  return <span className={className} style={styles} />;
}

Icon.propTypes = {
  name: PropTypes.oneOf(Object.keys(icons)).isRequired,
  color: PropTypes.string,
  style: PropTypes.shape({}),
};

Icon.defaultProps = {
  color: colors.text,
  style: null,
};

export default Icon;

import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../Icon';

const Button = ({
  onPress,
  onKeyDown = () => {},
  className,
  style,
  label,
  icon,
  iconColor,
  iconStyles,
}) => (
  <div
    onClick={onPress}
    onKeyDown={onKeyDown}
    tabIndex="0"
    role="button"
    style={style}
    className={className}
  >
    {icon && <Icon name={icon} color={iconColor} style={iconStyles} />}
    {label}
  </div>
);

Button.propTypes = {
  onPress: PropTypes.func,
  onKeyDown: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  label: PropTypes.string,
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  iconStyles: PropTypes.shape({}),
};

Button.defaultProps = {
  onPress: () => {},
  onKeyDown: () => {},
  className: '',
  style: {},
  label: '',
  icon: null,
  iconColor: null,
  iconStyles: null,
};

export default Button;

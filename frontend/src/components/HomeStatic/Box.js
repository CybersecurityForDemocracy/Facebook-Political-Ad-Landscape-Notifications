import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export const Box = ({ data, route, subLabel, footer }) => (
  <Link className="box" to={route}>
    <div class="box__label">{data}</div>
    <div class="box__sublabel">{subLabel}</div>
    {footer && <div className="box__footer">{footer}</div>}
  </Link>
);

Box.propTypes = {
  data: PropTypes.string,
  route: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  subLabel: PropTypes.node,
  footer: PropTypes.node,
};

Box.defaultProps = {
  data: '',
  route: '/',
  subLabel: '',
  footer: null,
};

export default Box;

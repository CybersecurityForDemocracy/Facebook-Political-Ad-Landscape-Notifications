import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const FooterListItem = ({ to, className, style, label }) => (
  <li className="liFooter">
    {to.indexOf('://') > -1 ? (
      <a href={to} style={style} className={className}>
        {label}
      </a>
    ) : (
      <Link style={style} className={className} to={to}>
        {label}
      </Link>
    )}
  </li>
);

FooterListItem.propTypes = {
  to: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  label: PropTypes.string,
};

FooterListItem.defaultProps = {
  to: '',
  className: '',
  style: {},
  label: '',
};

export default FooterListItem;

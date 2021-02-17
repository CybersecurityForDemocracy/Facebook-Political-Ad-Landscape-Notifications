import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

const NavListItem = ({ route, label, tag, isMobile, onClick }) => {
  const Wrapper = tag ? tag : NavLink;
  const navProps = {};
  if (Wrapper === NavLink) {
    navProps.to = route;
    navProps.activeClassName = 'navigation__link-item--active';
  } else {
    navProps.href = route;
  }
  return (
    <li
      className={`navigation__${isMobile ? 'mobile' : 'desktop'}-link-wrapper`}
      key={label}
    >
      <Wrapper
        className={`navigation__link-item navigation__${
          isMobile ? 'mobile' : 'desktop'
        }-link-item`}
        onClick={onClick}
        {...navProps}
      >
        {label}
      </Wrapper>
    </li>
  );
};

NavListItem.propTypes = {
  route: PropTypes.string,
  label: PropTypes.string.isRequired,
  tag: PropTypes.string,
  isMobile: PropTypes.bool,
  onClick: PropTypes.func,
};

NavListItem.defaultProps = {
  route: null,
  tag: null,
  isMobile: false,
  onClick: () => {},
};

export default NavListItem;

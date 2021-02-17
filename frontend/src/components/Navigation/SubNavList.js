import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import NavListItem from './NavListItem';

const SubNavList = ({ history: { push }, location: { pathname } }) => (
  <div className="subNavWrapper">
    {pathname.includes('/nationData') ? (
      <ul className="navUL">
        <NavListItem
          onPress={() => push('/nationData/overview')}
          label="Overview"
          className={
            pathname === '/nationData/overview'
              ? 'subNavItemActive'
              : 'subNavItem'
          }
        />
        <NavListItem
          onPress={() => push('/nationData/presidential')}
          label="President"
          className={
            pathname === '/nationData/presidential'
              ? 'subNavItemActive'
              : 'subNavItem'
          }
        />
      </ul>
    ) : (
      <ul className="navUL">
        <NavListItem
          onPress={() => push('/stateData/overview')}
          label="Overview"
          className={
            pathname === '/stateData/overview'
              ? 'subNavItemActive'
              : 'subNavItem'
          }
        />
        <NavListItem
          onPress={() => push('/stateData/presidential')}
          label="President"
          className={
            pathname === '/stateData/presidential'
              ? 'subNavItemActive'
              : 'subNavItem'
          }
        />
        <NavListItem
          onPress={() => push('/stateData/governor')}
          label="Governor"
          className={
            pathname === '/stateData/governor'
              ? 'subNavItemActive'
              : 'subNavItem'
          }
        />
        <NavListItem
          onPress={() => push('/stateData/usSenate')}
          label="US Senate"
          className={
            pathname === '/stateData/usSenate'
              ? 'subNavItemActive'
              : 'subNavItem'
          }
        />
        <NavListItem
          onPress={() => push('/stateData/usHouse')}
          label="US House"
          className={
            pathname === '/stateData/usHouse'
              ? 'subNavItemActive'
              : 'subNavItem'
          }
        />
      </ul>
    )}
  </div>
);

SubNavList.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default withRouter(SubNavList);

import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import NavListItem from './NavListItem';
import findPathsForSubNav from '../../utils/findPathForSubNav';

const SubNavigation = ({ pathname, onPress, selectedRoutes }) => {
  const subPaths = findPathsForSubNav(pathname, selectedRoutes);
  if (subPaths.length) {
    return (
      <div className="subNavWrapper">
        <ul className="subNavList navUL">
          {subPaths.map(({ path, key, label }) => (
            <NavListItem
              key={key}
              onPress={() => onPress(path)}
              label={label}
              className={
                pathname.includes(path) ? 'subNavItemActive' : 'subNavItem'
              }
            />
          ))}
        </ul>
      </div>
    );
  }
  return null;
};

SubNavigation.propTypes = {
  pathname: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  selectedRoutes: PropTypes.array.isRequired,
};

const mapStateToProps = ({ selectState }) => ({
  selectedRoutes: selectState.selectedCountry.routes,
});

export default connect(mapStateToProps)(SubNavigation);

import React from 'react';
import PropTypes from 'prop-types';

import '../../styles/components/Breadcrumb.css';
import Select from '../Select';
import SelectNational from '../Select/National';

function BreadCrumb({ baseRoute = '', baseRouteLabel = '', subRoute }) {
  return (
    <div className="polads__breadcrumb">
      <h3 className="polads__breadcrumb__h3">
        <small>
          {baseRouteLabel}
          &nbsp;/&nbsp;
          <b>{subRoute}</b>
        </small>
        <br />
        {baseRoute === 'stateData' ||
        baseRoute === 'presidential' ||
        baseRoute === 'stateElectionsData' ? (
          <Select baseRoute={baseRoute} />
        ) : (
          <SelectNational baseRoute={baseRoute} />
        )}
      </h3>
    </div>
  );
}

BreadCrumb.propTypes = {
  baseRoute: PropTypes.string.isRequired,
  subRoute: PropTypes.string.isRequired,
  baseRouteLabel: PropTypes.string.isRequired,
};

export default BreadCrumb;

import React from 'react';
import PropTypes from 'prop-types';

import BreadCrumb from '../Breadcrumb';
// import Button from '../Button';

function GraphPageHeader({
  baseRoute,
  baseRouteLabel = '',
  subRoute,
  downloadCsv,
}) {
  return (
    <div className="polads__graph_views__header">
      <BreadCrumb
        baseRouteLabel={baseRouteLabel}
        baseRoute={baseRoute}
        subRoute={subRoute}
      />
      {/* <Button
        onPress={downloadCsv}
        className="download-csv download-csv__header"
        label="Download CSV"
        icon="downloadCloud"
        iconColor="white"
        iconStyles={{ marginRight: '0.5rem' }}
      /> */}
    </div>
  );
}

GraphPageHeader.propTypes = {
  subRoute: PropTypes.string.isRequired,
  baseRoute: PropTypes.string.isRequired,
  downloadCsv: PropTypes.func,
};

GraphPageHeader.defaultProps = {
  downloadCsv: () => alert('TODO'),
};

export default GraphPageHeader;

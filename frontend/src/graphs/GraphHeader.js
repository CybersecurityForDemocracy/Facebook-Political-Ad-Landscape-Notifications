import React from 'react';
import PropTypes from 'prop-types';

export default function GraphHeader({ title, subtitle, filters }) {
  return (
    <div className="polads__graph_header">
      <div className="polads__graph_header__title_container">
        <h3 className="polads__graph_title">{title}</h3>
        {subtitle && <div className="polads__graph_subtitle">{subtitle}</div>}
      </div>
      {filters && (
        <div className="polads__graph_header__filters_container">{filters}</div>
      )}
    </div>
  );
}

GraphHeader.propTypes = {
  title: PropTypes.string.isRequired,
  filters: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.string,
};

GraphHeader.defaultProps = {
  filters: null,
  subtitle: null,
};

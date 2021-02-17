import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import dateFormats from '../../constants/dateFormat';

const defaultOptions = [
  {
    value: moment().add(-1, 'month').format(dateFormats.default),
    label: 'Last month',
    defaultValue: true,
  },
  {
    value: moment().add(-3, 'month').format(dateFormats.default),
    label: '3 months ago',
  },
];

function SelectFilter({ options, onChange }) {
  return (
    <div>
      <select className="custom-select" onBlur={onChange}>
        {options.map((o) => (
          <option value={o.value} defaultValue={o.defautlValue}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

SelectFilter.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      lable: PropTypes.string,
    }),
  ),
  onChange: PropTypes.func.isRequired,
};

SelectFilter.defaultProps = {
  options: defaultOptions,
};

export default SelectFilter;

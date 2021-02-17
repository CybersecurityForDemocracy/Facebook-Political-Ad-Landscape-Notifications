import React from 'react';
import PropTypes from 'prop-types';

const DateHeader = ({ startDate, endDate }) => (
  <div className="dateHeaderWrapper">
    <div className="dateHeaderDateBox">{`Start date:  ${startDate}`}</div>
    <div className="dateHeaderSeparator" />
    <div className="dateHeaderDateBox">{`End date:  ${endDate}`}</div>
  </div>
);

DateHeader.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};

DateHeader.defaultProps = {
  startDate: '07/15/2020',
  endDate: '09/15/2020',
};

export default DateHeader;

import React from 'react';
import PropTypes from 'prop-types';
import formatNumber from '../../../utils/formatNumber';

const SpendBox = ({ minSpend, maxSpend }) => (
  <div className="spendBoxWrapper">
    <div className="spendBoxTotalSpendLabel">Total spend</div>
    <div className="spendBoxFromToSpendLabel">{`$${formatNumber(
      minSpend,
    )} - $${formatNumber(maxSpend)}`}</div>
  </div>
);

SpendBox.propTypes = {
  minSpend: PropTypes.number,
  maxSpend: PropTypes.number,
};

SpendBox.defaultProps = {
  minSpend: 10765500,
  maxSpend: 16277280,
};

export default SpendBox;

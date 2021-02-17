import React from 'react';
import PropTypes from 'prop-types';
import formatNumber from '../../../utils/formatNumber';

const ImpressionsBox = ({ minImpressions, maxImpressions, numOfPages }) => (
  <div className="impressionBoxWrapper">
    <div className="impressionBoxLabel">{`${formatNumber(
      maxImpressions,
    )} impressions ${numOfPages} pages`}</div>
  </div>
);

ImpressionsBox.propTypes = {
  minImpressions: PropTypes.number,
  maxImpressions: PropTypes.number,
  numOfPages: PropTypes.number,
};

ImpressionsBox.defaultProps = {
  minImpressions: 19727288,
  maxImpressions: 28828888,
  numOfPages: 25,
};

export default ImpressionsBox;

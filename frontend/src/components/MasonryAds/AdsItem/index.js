import React from 'react';
import PropTypes from 'prop-types';
import DateHeader from './DateHeader';
import SpendBox from './SpendBox';
import ImpressionsBox from './ImpressionsBox';
import AboutCluster from './AboutCluster';

const AdsItem = ({ adImage, includeHeader = true }) => (
  <div className="adsItem">
    <div className="adsItemBorderPurple" />
    {includeHeader && (
      <>
        <div className="adsItemHeaderWrapper">
          <DateHeader startDate="07/15/2020" endDate="09/15/2020" />
          <SpendBox />
          <ImpressionsBox />
        </div>
        <div className="adsItemDivider" />
      </>
    )}
    <AboutCluster
      adImage={adImage}
      buttonVisible
      onPress={() => alert('TO DO READ MORE')}
    />
  </div>
);

AdsItem.propTypes = {
  adImage: PropTypes.string.isRequired,
  includeHeader: PropTypes.bool,
};

AdsItem.defaultProps = {
  includeHeader: true,
};

export default AdsItem;

import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';

const SearchAdsHeader = ({ onSearchPress }) => (
  <div className="searchAdsHeaderWrapper">
    <div className="searchAdsHeaderLabelWrapper">
      <div className="searchAdsHeaderLabel">Search Ads</div>
      <div className="searchAdsHeaderSubtitle">
        Find the Facebook political ads you are interested in
      </div>
    </div>
    <Button
      className="searchAdsHeaderButton"
      label="Search Ads"
      onPress={onSearchPress}
    />
  </div>
);

SearchAdsHeader.propTypes = {
  onSearchPress: PropTypes.func,
};

SearchAdsHeader.defaultProps = {
  onSearchPress: () => alert('TODO GO FOR Search'),
};

export default SearchAdsHeader;

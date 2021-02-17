import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../Button';

const AboutCluster = ({
  adImage,
  bodyText,
  buttonLabel,
  onPress,
  buttonVisible,
}) => (
  <div className="aboutClusterMain">
    <img src={adImage} alt="img" />
    <div className="aboutClusterDivider" />
    <div className="aboutClusterBodyWrapper">
      <div className="aboutClusterBodyText">{bodyText}</div>
      {buttonVisible && (
        <Button
          label={buttonLabel}
          onPress={onPress}
          className="aboutClusterButton"
        />
      )}
    </div>
  </div>
);

AboutCluster.propTypes = {
  adImage: PropTypes.string.isRequired,
  bodyText: PropTypes.string,
  buttonLabel: PropTypes.string,
  onPress: PropTypes.func,
  buttonVisible: PropTypes.bool,
};

AboutCluster.defaultProps = {
  bodyText:
    'With a total population of more than 325 million people, the United States.With a total population',
  buttonLabel: 'Read more',
  onPress: () => {},
  buttonVisible: false,
};

export default AboutCluster;

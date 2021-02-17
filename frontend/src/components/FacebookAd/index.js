import React from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import makeAdHtml from '../../utils/makeAdHtml';
import '../../styles/components/FacebookAd.css';

const FacebookAd = ({ html, images, thumbnail }) => {
  images = images
    .slice(1, -1)
    .split(',')
    .filter((path) => path != thumbnail)
    .map((path) => `https://storage.googleapis.com/facebook_ad_images/${path}`);
  const __html = `<div class="ati-item">${DOMPurify.sanitize(
    makeAdHtml(
      html,
      images,
      thumbnail
        ? `https://storage.googleapis.com/facebook_ad_images/${thumbnail}`
        : null,
    ),
  )}</div>`;

  return <div className="facebook-ad" dangerouslySetInnerHTML={{ __html }} />;
};

FacebookAd.propTypes = {
  html: PropTypes.string.isRequired,
  images: PropTypes.string,
  thumbnail: PropTypes.string,
};

export default FacebookAd;

import React from 'react';
import PropTypes from 'prop-types';
import FacebookAd from '../FacebookAd';
import '../../styles/components/AdGallery.css';

const AdGallery = ({ ads }) => {
  return (
    <div className="ad-gallery">
      {ads.map(({ html, id, images, thumbnail }) => (
        <div className="ad-gallery__item" key={id}>
          <FacebookAd
            html={html}
            images={images}
            thumbnail={
              thumbnail.includes('https://') ? null : thumbnail
            } /* image paths should be relative; absolute URLs should be ignored */
          />
        </div>
      ))}
    </div>
  );
};

AdGallery.propTypes = {
  ads: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      html: PropTypes.string,
      images: PropTypes.string,
      thumbnail: PropTypes.string,
    }),
  ),
};

AdGallery.defaultProps = {
  ads: [],
};

export default AdGallery;

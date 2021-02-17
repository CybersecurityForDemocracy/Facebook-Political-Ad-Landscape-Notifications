import React from 'react';
import '../../styles/components/MasonryAds.scss';
import MasonryAds from './MasonryAds';
import AdsItem from './AdsItem';

// get fake images
let brakePoints = [289, 289, 289];
let images = [];
const imgId = [1011, 883, 1074, 823, 64, 65, 839, 314, 256, 316, 92, 643];
for (let i = 0; i < imgId.length; i++) {
  const ih = 200 + Math.floor(Math.random() * 10) * 15;
  images.push(`https://unsplash.it/250/${ih}?image=${imgId[i]}`);
}

const Main = () => (
  <div className="mainMasonryWrapper">
    <div className="masonry-container">
      <MasonryAds brakePoints={brakePoints}>
        {images.map((image, id) => (
          <AdsItem adImage={image} key={id} />
        ))}
      </MasonryAds>
    </div>
  </div>
);

export default Main;

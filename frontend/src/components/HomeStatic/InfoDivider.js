import React from 'react';
import BaseButton from '../BaseButton';

const InfoDivider = () => (
  <section className="info-divider">
    <h2 className="info-divider__title">We need your help!</h2>
    <div className="info-divider__description">
      Please help increase understanding of how political advertisers target
      audiences and promote messages. When you install the AdObserver browser
      extension, your anonymous data is combined with that of other volunteers —
      thousands and growing — to improve information on this site.
    </div>
    <BaseButton
      tag="a"
      href="https://adobserver.org/"
      target="_blank"
      rel="noopener noreferrer"
    >
      Volunteer data
    </BaseButton>
  </section>
);

export default InfoDivider;

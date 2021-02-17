import React from 'react';
import Modal from '../../components/Modal';

function TargetAudienceModal({ onClose }) {
  return (
    <Modal onClose={onClose}>
      <h3>About ad targeting</h3>
      <p>
        <b>
          Why do I see targeting information for just one of the candidates/none
          of the candidates?
        </b>{' '}
        The information we display is limited to that provided by volunteers.
        Help us spread the word and gather more data by installing the plug-in
        tool and asking friends and family to do it too.
      </p>
      <p>
        <b>What does “ads collected” mean?</b> The number of ads for which we
        have targeting information for this advertiser.
      </p>
    </Modal>
  );
}

export default TargetAudienceModal;

import React from 'react';

const DownloadData = () => (
  <div className="downloadDataContainer">
    <div className="downloadDataTextWrapper">
      <div className="downloadDataLabel">Download data</div>
      <div className="downloadDataText">
        Search our free online database to build custom datasets by ad topic, ad
        objective, state, time period, and more. Sign in to download data, free
        of charge
      </div>
      <div
        onClick={() => {}} // add donwload csv function
        onKeyDown={() => {}}
        tabIndex="0"
        role="button"
        className="downloadDataButton"
      >
        <div className="downloadDataButtonIcon" />
        Download data
      </div>
    </div>
    <div className="downloadDataImageWrapper">
      <div className="downloadDataImageCSV" />
    </div>
  </div>
);

export default DownloadData;

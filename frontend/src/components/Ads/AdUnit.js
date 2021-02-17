import React, { useState, useEffect } from "react";
import { Axios } from '../../api/axios';
import './findAds.css';

const errorImageSrc = 'https://storage.googleapis.com/facebook_ad_archive_screenshots/error.png';
const getAdDetailsURL = '/archive-id';

const AdUnit = (params) => {
  const [adImageSrc, setAdImageSrc] = useState(params.ad.url);
  const handleAdImageError = () => setAdImageSrc(errorImageSrc);
  const [adClusterData, setAdClusterData] = useState([]);

  const getAdClusterData = (archiveId) => {
  Axios
    .get(getAdDetailsURL + '/' + archiveId + '/cluster')
    .then((response) => {
      setAdClusterData(response);
    })
    .catch((error) => {
      console.log(error);
      if (error.response.status === 404) {
        setAdClusterData([]);
      }
    })
    .finally(() => {});
  };

  useEffect(() => {
    getAdClusterData(params.ad.canonical_archive_id);
  }, [params.ad.canonical_archive_id]);

  const handleClick = () => {
    params.setState(adClusterData);
    window.scrollTo(0, 0);
    params.historyPush('/findAds/'+params.ad.canonical_archive_id);
  }

  return (
    <div className="ad-container pointer">
      <p className="dates" >First seen: {params.ad.start_date} &nbsp;|&nbsp; Last seen: {params.ad.end_date} </p>
      <div className="ad-container-details" onClick={handleClick}>
        Total Spend
        <div className="spend">{params.ad.total_spend}</div>
        {params.ad.total_impressions} impressions <br/> {params.ad.num_pages} page{params.ad.num_pages === 1 ? '' : 's'}
        <img alt={adImageSrc} src={adImageSrc} onError={handleAdImageError}/>
      </div>
      <button className="read-more" onClick={handleClick}>See cluster details</button>
    </div>
  );
};

export default AdUnit;

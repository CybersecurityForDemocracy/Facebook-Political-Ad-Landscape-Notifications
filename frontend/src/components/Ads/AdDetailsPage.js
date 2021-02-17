import React, { useState } from "react";
import './findAds.css';
import util from '../../graphs/util';

const errorImageSrc = 'https://storage.googleapis.com/facebook_ad_archive_screenshots/error.png';

const getPageNames = (array) => {
  var page_names = [];
    for(let i=0; i<array.length; i++){
      page_names.push(array[i].facebook_page_name);
    }
  return page_names;
}

const getSortedRegionData = (array) => {
  var region_data = array;
  region_data.sort((a, b) => (parseFloat(a.max_spend) < parseFloat(b.max_spend) ? 1 : -1));
  return region_data.length < 10 ? region_data : region_data.slice(0,10);
}

function AdDetailsPage(params) {
  const adClusterData = params.adClusterData;
  const [adImageSrc, setAdImageSrc] = useState(params.adClusterData.url);
  const handleAdImageError = () => setAdImageSrc(errorImageSrc);
  var alternateAds = adClusterData.archive_ids.length < 100 ? adClusterData.archive_ids : adClusterData.archive_ids.slice(0,100);
  
  if (adClusterData.length === 0) {
    return (<div><br /><br /><br /><h3 align="center">No results found</h3></div>);
  }

  const AdDetailComponent = (params) => {
  	return (
  	  <div className="components ad-container-details">
  	  	<p>{params.name}</p>
  	  	<div className="value-display">
	      {params.values.map((value) => (
           value ? <button className="values" key={value}>{value}</button> : <div key={value}></div>
          ))}
        </div>
      </div>
  	);
  }

  const handleClick = () => {
  	params.setState(null);
    params.historyPush('/findAds'+params.queryString);
  }

  return (
  	<div>
  	  <div className="left-gap"><button className="read-more big" onClick={handleClick}> &#8249; Back</button></div>
      <div className="row-flex">
        <div className="ad-image-container">
          <img alt={adImageSrc} src={adImageSrc} onError={handleAdImageError}/>
        </div>
  	    <div className="ad-container wide">
  	  	  <div className="row-flex">
	        <AdDetailComponent
	      	  name="Sponsors"
	          values={getPageNames(adClusterData.advertiser_info)}
	        />
	        <AdDetailComponent
	      	  name="Payers"
	          values={adClusterData.funding_entity}
	        />
  	        <AdDetailComponent
  	          name="Topics"
  	          values={adClusterData.topics.split(",")}
  	        />
  	        <AdDetailComponent
  	          name="Purpose"
  	          values={adClusterData.type.split(",")}
  	        />
  	      </div>
  	      <div className="row-flex">
  	        <div className="components">
  	          <p className="ad-container-details">Date</p>
  	          <p className="other-values">
  	          {util.dateFormatter(adClusterData.min_ad_creation_date)} &mdash; {util.dateFormatter(adClusterData.max_ad_creation_date)}
  	          </p>
  	        </div>
  	        <div className="components">
  	          <p className="ad-container-details">Total Spend</p>
  	          <p className="other-values">
  	          {util.usdTruncateNumberFormatter(adClusterData.min_spend_sum)} - {util.usdTruncateNumberFormatter(adClusterData.max_spend_sum)}
  	          </p>
  	        </div>
  	        <div className="components">
  	          <p className="ad-container-details">Impressions</p>
  	          <p className="other-values">
  	          {util.truncateNumberFormatter(adClusterData.min_impressions_sum)} - {util.truncateNumberFormatter(adClusterData.max_impressions_sum)}
  	          </p>
  	        </div>
  	      </div>
  	      <hr className="wide"/><br />
  	      <p className="other-values">Top 10 States</p>
	      <table>
	        <tbody>
            {getSortedRegionData(adClusterData.region_impression_results).map((region_result) => (
              <tr key={region_result.region}>
                <td>{region_result.region}</td>
                <td className="orange">{util.usdFormatter(parseFloat(region_result.max_spend))}</td>
              </tr>
            ))}
            </tbody>
	      </table>
  	    </div>
      </div>
      <h5 className="left-gap">Ad Versions</h5>
      <div className="carousel">
      {alternateAds.map((ad_id) => (
          <div className="ad-container" key={ad_id}>
            <img alt={ad_id} src={"https://storage.googleapis.com/facebook_ad_archive_screenshots/" + ad_id + ".png"}/>
          </div>
      ))}
      </div>
    </div>
  );
}

export default AdDetailsPage;

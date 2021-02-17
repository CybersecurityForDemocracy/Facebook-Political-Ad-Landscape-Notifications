import React from 'react';
import HomeStaticSlider from '../../components/HomeStatic';
import SwingStateSummary from '../../components/HomeStatic/SwingStateSummary';
import InfoDivider from '../../components/HomeStatic/InfoDivider';
import PresidentialSummary from '../../components/HomeStatic/PresidentialSummary';
// import DownloadData from '../../components/HomeStatic/DownloadData';
// import Masonery from '../../components/MasonryAds';
import '../../styles/screens/HomeScreen.css';
import '../../styles/components/HomeStatic-PresidentialSummary.css';
import '../../styles/components/HomeStatic-SwingStateSummary.css';
// import SearchAdsHeader from '../../components/MasonryAds/SearchAdsHeader';

const HomeScreen = () => (
  <div className="homeScreenWrapper">
    <HomeStaticSlider />
    <PresidentialSummary />
    <SwingStateSummary />
    <InfoDivider />
    {/* <DownloadData />
    <SearchAdsHeader />
    <Masonery /> */}
  </div>
);

export default HomeScreen;

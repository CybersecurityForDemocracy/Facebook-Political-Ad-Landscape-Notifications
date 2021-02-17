import React, { useEffect, useState } from 'react';
import '../../styles/screens/MissedAds.css';
import AdGallery from '../../components/AdGallery';
import Loader from '../../components/Loader';
import { fetchData } from '../../services/MissedAds';

const MissedAds = () => {
  const [adsData, setAdsData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchData();
        setAdsData(data);
      } catch (err) {
        console.error('ads error', err);
      }
    })();
  }, []);

  return (
    <main className="missed-ads main-layout">
      <h1>The Political Ads Facebook Won't Show You</h1>
      <section className="missed-ads__description">
        <div className="missed-ads__content">
          <p>
            Facebook has made{' '}
            <a
              href="https://about.fb.com/news/2018/06/transparency-for-ads-and-pages/"
              target="_blank"
              rel="noopener noreferrer"
            >
              promises
            </a>{' '}
            to show the public all of the US political ads on its platform and
            to include a label saying who paid for each ad. To do this, Facebook
            uses a combination of of machine-learning models and voluntary
            compliance, and collects these ads in the{' '}
            <a
              href="https://www.facebook.com/ads/library"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook Ad Library
            </a>
            .
          </p>
          <p>The problem is, Facebook routinely misses political ads.</p>
          <p>
            That means those political ads don't include a "Paid for by" label
            and don't appear in Facebook's transparency tools.
          </p>
          <p>
            The{' '}
            <a
              href="https://adobserver.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ad Observer project
            </a>{' '}
            project lets participants share with us the ads they see. We use a
            machine-learning model to mimic Facebook's definition of what is a
            political ad and detect the ads that Facebook missed — and show some
            of those to you here.
          </p>
        </div>
        {/* <div className="missed-ads__graphic"></div> */}
      </section>
      <section className="missed-ads__gallery">
        <h2>Recent ads Facebook missed</h2>
        {adsData.length ? <AdGallery ads={adsData} /> : <Loader />}
      </section>
      <section>
        <p className="missed-ads__blocker-msg">
          <b>Can't see any ads?</b> Your ad blocker may be blocking them. Please
          turn it off for this page to see the political ads Facebook missed.
        </p>
      </section>
    </main>
  );
};

export default MissedAds;

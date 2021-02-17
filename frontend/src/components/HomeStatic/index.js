import React, { useState, useEffect } from 'react';
import '../../styles/components/HomeStatic.css';
import Box from './Box';
import { Axios } from '../../api/axios';
import util from '../../graphs/util';
import { apis, generalChartStartDate } from '../../modules/graphs/constants';
import { getURL } from '../../modules/graphs/util';

const GreeneAPIURL = getURL(apis.totalSpendOfPageOfRegion, {
  pageID: 1809715209318581,
  region: 'US',
  start_date: generalChartStartDate,
});
const GanderNewsroomAPIURL = getURL(apis.totalSpendOfPageOfRegion, {
  pageID: 110746996993983,
  region: 'Michigan',
  start_date: generalChartStartDate,
});
const TrumpOverallAPIURL = getURL(apis.totalSpendOfPageOfRegion, {
  pageID: 153080620724,
  region: 'US',
  start_date: generalChartStartDate,
});
const TrumpSpendByTopicAPIURL = getURL(apis.spendByTimePeriodByTopicOfPage, {
  pageID: 153080620724,
  start_date: generalChartStartDate,
});
const CourtSystemTopicSpendURL = getURL(apis.spendByTimePeriodOfTopicOfRegion, {
  region: 'US',
  topicName: 'Court System',
});

const getTotalMediaSpend = (mediaArray) =>
  mediaArray.reduce((sum, { spend }) => (sum += spend), 0);

const HomeStaticSlider = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [firstFactoidDataOverall, setFirstFactoidDataOverall] = useState();
  const [firstFactoidDataMedia, setFirstFactoidDataMedia] = useState();
  const [secondFactoidData, setSecondFactoidData] = useState('');
  const [thirdFactoidData, setThirdFactoidData] = useState('');

  const getFactoidData = () => {
    return Promise.all([
      Axios.get(CourtSystemTopicSpendURL).then((response) => {
        const weeks = Object.keys(response.spend_in_timeperiod)
          .sort()
          .reverse();
        const increaseWoW =
          response.spend_in_timeperiod[weeks[0]] /
          response.spend_in_timeperiod[weeks[1]];
        setThirdFactoidData(parseInt(increaseWoW * 100));
      }),

      Axios.get(GanderNewsroomAPIURL).then((response) => {
        setSecondFactoidData(
          util.usdTruncateNumberFormatter(response.spenders[0].spend),
        );
      }),

      Axios.get(TrumpOverallAPIURL).then((response) => {
        setFirstFactoidDataOverall(response.spenders[0].spend);
      }),

      Axios.get(TrumpSpendByTopicAPIURL).then((response) => {
        setFirstFactoidDataMedia(
          getTotalMediaSpend(response.spend_by_time_period.Media),
        );
      }),
    ]);
  };

  useEffect(() => {
    (async () => {
      try {
        await getFactoidData();
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  const boxes = [
    {
      data: `${Math.round(
        (firstFactoidDataMedia / firstFactoidDataOverall) * 100,
      )}%`,
      subLabel: `of Trump's ad spending attacks the media`,
      footer: 'since July 1',
      route: '/nationalData/presidential',
    },
    {
      data: secondFactoidData,
      subLabel:
        'spent by Gander Newsroom in MI run by anti-Trump group ACRONYM',
      footer: 'since July 1',
      route: '/sponsors/110746996993983/The__Gander__Newsroom',
    },
    {
      data: `${thirdFactoidData}%`,
      subLabel: `${
        thirdFactoidData > 0 ? 'increase' : 'decrease'
      } in spending on ads about the Supreme Court.`,
      footer: 'in the past week compared to the week before',
      route: '/nationalData/overview',
    },
  ];

  return (
    <div className="hero">
      <div className="hero__label">Explore 2020 Facebook political ads</div>
      <div className="hero__boxes">
        {!isLoading && boxes.map((box) => <Box {...box} key={box.route} />)}
      </div>
    </div>
  );
};

export default HomeStaticSlider;

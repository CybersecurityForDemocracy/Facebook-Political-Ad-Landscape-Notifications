import React, { useState, useEffect } from 'react';
import Async from 'react-select/async';
// import debounce from 'lodash/debounce';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { Link } from 'react-router-dom';

import { encodeQueryParams, ObjectParam } from 'use-query-params';
import { stringify } from 'query-string';
import BaseButton from '../../components/BaseButton';
import SponsorsCharts from './SponsorsCharts';
import Loader from '../../components/Loader';

import { Axios } from '../../api/axios';
import { getURL } from '../../modules/graphs/util';
import { apis } from '../../modules/graphs/constants';
import util from '../../graphs/util';
import { getURISafePageName } from '../../utils/common';

import {
  sponsorsSearch,
  getSpendByTimePeriodByTopicOfPage,
  getTotalSpendOfPageOfRegion,
  getSpendByTimePeriodOfPage,
  getSpendByPurposeOfPage,
  getSpendOfPageByRegion,
  getTargetingDataForPage,
} from './util';

import './sponsors.css';

const asyncStyles = {
  container: (styles) => ({
    ...styles,
    background: '#FFFFFF',
    boxShadow: '0px 5px 25px rgba(23, 44, 99, 0.09)',
    borderRadius: '6px',
    padding: '12px',
  }),
  control: (styles) => ({
    ...styles,
    border: '1px solid #F1F1F1',
    borderRadius: '6px',
  }),
};

// TODO: fix debouncing
// const debouncedSearch = debounce(sponsorsSearch, 500);

const Sponsors = ({
  history: { push },
  match: {
    params: { sponsorId, sponsorName },
  },
}) => {
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [totalSpentOfPage, setTotalSpentOfPage] = useState({
    loading: false,
    data: null,
  });
  const [totalSpentOfOtherPages, setTotalSpentOfOtherPages] = useState({
    loading: false,
    data: null,
  });
  const [spendByPurpose, setSpendByPurpose] = useState({
    loading: false,
    data: [],
    keys: ['tactic'],
  });
  const [spendByTimePeriod, setSpendByTimePeriod] = useState({
    loading: false,
    spend: [],
    keys: [],
    interval: 'week',
  });
  const [spendByTimeByTopicPeriod, setSpendByTimeByTopicPeriod] = useState({
    loading: false,
    spend: [],
    keys: [],
    interval: 'week',
  });
  const [spendOfPageByRegion, setSpendOfPageByRegion] = useState({
    loading: false,
    data: {},
  });
  const [countOfTargetingMethods, setCountOfTargetingMethods] = useState({
    loading: false,
    targeting: {},
  });

  const onChange = (value) => {
    const valueClear = value;
    const label = getURISafePageName(value.label);
    push(`/sponsors/${value.value}/${label}`);
    setSelectedSponsor(valueClear);
  };
  const toTitleCase = (phrase) => {
    return phrase
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    if (sponsorId && sponsorName) {
      const nameUpdated = toTitleCase(
        sponsorName.replace(/__/g, ' ').replace('**', '%'),
      );

      const sponsor = {
        label: nameUpdated,
        value: parseInt(sponsorId),
      };
      setSelectedSponsor(sponsor);
    }
  }, [sponsorId, sponsorName]);

  useEffect(() => {
    if (!isEmpty(selectedSponsor)) {
      setTotalSpentOfPage({
        loading: true,
        data: null,
      });
      setSpendByPurpose({
        loading: true,
        data: [],
      });
      setSpendByTimePeriod({
        loading: true,
        spend: [],
        keys: [],
        interval: 'week',
      });
      setSpendByTimeByTopicPeriod({
        loading: true,
        spend: [],
        keys: [],
        interval: 'week',
      });
      setCountOfTargetingMethods({
        loading: true,
        data: [],
      });
      setSpendOfPageByRegion({
        loading: true,
        data: {},
      });
      const { value: pageID, label } = selectedSponsor;
      // total spend of page of region
      getTotalSpendOfPageOfRegion(pageID, setTotalSpentOfPage);
      // Total Spend by Purpose of Page move to util
      getSpendByPurposeOfPage(pageID, label, setSpendByPurpose);
      // spent by time period of page
      getSpendByTimePeriodOfPage(pageID, label, setSpendByTimePeriod);
      // Spend by Time Period by Topic of Page
      getSpendByTimePeriodByTopicOfPage(
        pageID,
        label,
        setSpendByTimeByTopicPeriod,
      );
      // Total spend of page of region
      getSpendOfPageByRegion(pageID, setSpendOfPageByRegion);
      getTargetingDataForPage(pageID, setCountOfTargetingMethods);
    }
  }, [selectedSponsor]);

  useEffect(() => {
    if (
      !isEmpty(totalSpentOfPage) &&
      !isEmpty(totalSpentOfPage.data) &&
      !isEmpty(totalSpentOfPage.data.spenders)
    ) {
      setTotalSpentOfOtherPages({
        loading: true,
        data: null,
      });
      const urls =
        totalSpentOfPage.data.spenders[0].page_ids.map((pageID) =>
          getURL(apis.totalSpendOfPageOfRegion, {
            pageID,
            region: 'US',
            raw_page_id_query: 1,
          }),
        ) || null;
      if (urls && urls.length) {
        Promise.all(urls.map((url) => Axios.get(url)))
          .then((responses) => {
            if (responses && responses.length) {
              const finalResponses = responses
                // filter out empty responses
                .filter((response) => response !== '')
                // fetch top two ?
                .sort((a, b) => a.spenders[0].spend > b.spenders[0].spend);
              setTotalSpentOfOtherPages({
                loading: false,
                data: finalResponses,
              });
            }
          })
          .catch((errors) => {
            setTotalSpentOfOtherPages({
              loading: false,
              data: null,
            });
            console.error(errors);
          });
      }
    }
  }, [totalSpentOfPage]);

  const isLoading =
    spendByPurpose.loading ||
    spendByTimePeriod.loading ||
    spendByTimeByTopicPeriod.loading ||
    spendOfPageByRegion.loading ||
    totalSpentOfOtherPages.loading ||
    totalSpentOfPage.loading ||
    countOfTargetingMethods.loading;

  const hasData =
    !isEmpty(spendByPurpose.data) ||
    !isEmpty(spendByTimePeriod.spend) ||
    !isEmpty(spendByTimeByTopicPeriod.spend) ||
    !isEmpty(spendOfPageByRegion.data) ||
    !isEmpty(totalSpentOfPage.data) ||
    !isEmpty(countOfTargetingMethods.targeting);

  let totalSpentOfOtherPagesSorted;

  if (totalSpentOfOtherPages.data !== null) {
    totalSpentOfOtherPagesSorted = totalSpentOfOtherPages.data.sort((a, b) => {
      if (a.spenders[0].spend > b.spenders[0].spend) return -1;
      if (a.spenders[0].spend < b.spenders[0].spend) return 1;
      return 0;
    });
  }

  const findAdsUrl = selectedSponsor
    ? `/findAds?${stringify(
        encodeQueryParams(
          { sponsor: ObjectParam },
          { sponsor: selectedSponsor },
        ),
      )}` // `/findAds?sponsor=label-${selectedSponsor.label}_value-${selectedSponsor.value}`
    : '';

  const noSpending = !get(totalSpentOfPage, 'data.spenders[0].spend', 0);

  return (
    <main
      className="senate__graph_views sponsors_view"
      style={{ overflow: 'visible' }}
    >
      {/* <h3 className="page_header">Sponsors</h3> */}
      <div
        className="search-container"
        style={{ maxWidth: '1440px', margin: '0 auto' }}
      >
        <Async
          isMulti={false}
          noOptionsMessage={() => 'No sponsor found'}
          loadOptions={sponsorsSearch}
          styles={asyncStyles}
          onChange={onChange}
          placeholder="Search by Sponsor (e.g. Joe Biden)"
          components={{
            DropdownIndicator: () => (
              <button className="search-button" type="button">
                See Data
              </button>
            ),
          }}
        />
      </div>
      {!isEmpty(selectedSponsor) && (
        <div className="sponsors_view__header">
          <div className="sponsors_view__selected_sponsor">
            <small>Sponsor</small>
            <h3>{selectedSponsor.label}</h3>
          </div>
          <BaseButton
            tag={Link}
            className="sponsors_view__all-ads-button"
            to={findAdsUrl}
          >
            Explore this sponsor’s ads
          </BaseButton>
        </div>
      )}
      {isLoading && <Loader />}
      {!isLoading &&
        hasData &&
        (noSpending ? (
          <h3 style={{ textAlign: 'center' }}>
            This sponsor hasn't spent any money recently. We've got nothing to
            show you here.
          </h3>
        ) : (
          <>
            <div className="selected_sponsor__spendings_wrapper">
              <div className="selected_sponsor__spendings">
                {!isEmpty(totalSpentOfPage.data) && (
                  <div className="spendings">
                    <span className="spendings_header">Total Spent</span>
                    <span className="spendings_value">
                      {util.usdTruncateNumberFormatter(
                        totalSpentOfPage.data.spenders[0].spend,
                      )}
                    </span>
                  </div>
                )}
                {!isEmpty(totalSpentOfOtherPagesSorted) && (
                  <div className="spendings-list">
                    {totalSpentOfOtherPagesSorted.map((spendings) => {
                      return (
                        <div className="spendings" key={spendings.page_id}>
                          <span className="spendings_header">
                            {spendings.spenders[0].page_name}
                          </span>
                          <span className="spendings_value">
                            {util.usdTruncateNumberFormatter(
                              spendings.spenders[0].spend,
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <SponsorsCharts
              spendByTactics={spendByPurpose}
              spentOverTime={spendByTimePeriod}
              spentByTacticOverTime={spendByTimeByTopicPeriod}
              pageName={(selectedSponsor && selectedSponsor.label) || null}
              spendOfPageByRegion={spendOfPageByRegion}
              countOfTargetingMethods={countOfTargetingMethods}
            />
          </>
        ))}
      <br />
      <br />
    </main>
  );
};

export default Sponsors;

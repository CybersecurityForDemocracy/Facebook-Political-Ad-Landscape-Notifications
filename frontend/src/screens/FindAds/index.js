import React, { useState, useEffect, useRef } from 'react';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';
import Async from 'react-select/async';
import DatePicker from 'react-datepicker';
import { addDays } from 'date-fns';
import { push } from 'connected-react-router';
import { sponsorsSearch } from '../Sponsors/util';
import 'react-datepicker/dist/react-datepicker.css';
import '../../components/Ads/findAds.css';
import AdUnit from '../../components/Ads/AdUnit.js';
import AdDetailsPage from '../../components/Ads/AdDetailsPage.js';
import { Axios } from '../../api/axios';
import Loader from '../../components/Loader';
import { connect } from 'react-redux';
import {
  useQueryParam,
  StringParam,
  ObjectParam,
  DateParam,
} from 'use-query-params';

const filtersValuesURL = '/filter-options';
const getAdDetailsURL = '/archive-id';

const mapStateToProps = () => {};

const mapDispatchToProps = (dispatch) => ({
  historyPush: (url) => dispatch(push(url)),
});

function FindAds(props) {
  const [keywordParam, setKeywordParam] = useQueryParam('keyword', StringParam);
  const [topicParam, setTopicParam] = useQueryParam('topic', ObjectParam);
  const [regionParam, setRegionParam] = useQueryParam('region', ObjectParam);
  const [sponsorParam, setSponsorParam] = useQueryParam('sponsor', ObjectParam);
  const [startDateParam, setStartDateParam] = useQueryParam(
    'start_date',
    DateParam,
  );
  const [endDateParam, setEndDateParam] = useQueryParam('end_date', DateParam);

  const { historyPush } = props;
  const { pathname } = window.location;
  const pathArray = pathname.split('/');
  const [allTopics, setAllTopics] = useState([]);
  const [allRegions, setAllRegions] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(topicParam);
  const [selectedRegion, setSelectedRegion] = useState(regionParam);
  const [selectedSponsor, setSelectedSponsor] = useState(sponsorParam);
  const [startDate, setStartDate] = useState(
    startDateParam === undefined
      ? addDays(new Date(), -7)
      : new Date(startDateParam),
  );
  const [endDate, setEndDate] = useState(
    endDateParam === undefined ? new Date() : new Date(endDateParam),
  );
  const [keyword, setKeyword] = useState(keywordParam);
  const [isGetAdsRequestPending, setIsGetAdsRequestPending] = useState(false);
  const [isAdDataEmpty, setIsAdDataEmpty] = useState(false);
  const [isFindAdsClicked, setIsFindAdsClicked] = useState(false);
  const [ads, setAds] = useState([]);
  const numResultsToRequest = 20;
  const resultsOffset = useRef(0);
  const resetOffset = () => {
    resultsOffset.current = 0;
  };
  const incrementOffset = (i) => {
    resultsOffset.current += i;
  };
  const decrementOffset = (i) => {
    if (resultsOffset.current >= i) {
      resultsOffset.current -= i;
    }
  };
  const [disableKeyword, setDisableKeyword] = useState(false);
  const [disableTopic, setDisableTopic] = useState(false);
  const [disableSearch, setDisableSearch] = useState(true);
  const [adClusterData, setAdClusterData] = useState(null);
  const [queryString, setQueryString] = useState('');

  const getFilterValues = () => {
    Axios.get(filtersValuesURL)
      .then((response) => {
        setAllTopics(response.topics)
        // Change label "All" to "US" for "Has impressions in" dropdown.
        const regions = response.regions.map((region) => {
          if (region.label === 'All') {
            region.label = 'US';
          }
          return region;
        });
        setAllRegions(regions);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {});
  }

  const getAds = () => {
    // topic and keyword are mutually exclusive
    setIsGetAdsRequestPending(true);
    setIsAdDataEmpty(true);
    setIsFindAdsClicked(true);
    window.scrollTo(0, 0);

    Axios.get('/getands', {
      params: {
        full_text_search: keyword,
        topic: selectedTopic ? selectedTopic.value : null,
        region: selectedRegion ? (selectedRegion.label === 'US' ? 'All' : selectedRegion.label) : null,
        startDate,
        endDate,
        page_id: selectedSponsor ? selectedSponsor.value : null,
        offset: resultsOffset.current,
      },
    })
      .then((response) => {
        setAds(response);
        setIsAdDataEmpty(response.length === 0);
        setIsGetAdsRequestPending(false);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {});
  };

  const getAdDetails = (archive_id) => {
    setIsGetAdsRequestPending(true);
    if (isNaN(archive_id)) {
      setAdClusterData([]);
    } else {
      Axios.get(`${getAdDetailsURL}/${archive_id}/cluster`)
        .then((response) => {
          setAdClusterData(response);
          setIsGetAdsRequestPending(false);
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === 404) {
            setAdClusterData([]);
          }
        })
        .finally(() => {});
    }
  };

  const getPreviousPageOfAds = () => {
    decrementOffset(numResultsToRequest);
    getAds();
  };

  const getNextPageOfAds = () => {
    incrementOffset(numResultsToRequest);
    getAds();
  };

  const getFirstPageOfAds = () => {
    setAdClusterData(null);
    resetOffset();
    getAds();
  };

  const setDisableValue = (value, type) => {
    if (value === null || value === '') {
      if (type === 1) {
        setDisableTopic(false);
        setKeyword(null);
      } else {
        setDisableKeyword(false);
      }
    } else {
      type === 1 ? setDisableTopic(true) : setDisableKeyword(true);
    }
  };

  useEffect(() => {
    getFilterValues();
    if (pathArray.length === 3) {
      getAdDetails(pathArray[2]);
    } else if (
      startDateParam ||
      endDateParam ||
      topicParam ||
      sponsorParam ||
      keywordParam ||
      regionParam
    ) {
      if (topicParam && keywordParam) {
        alert(
          'Invalid search query. Please select either by keyword or by topic',
        );
        setTopicParam(undefined);
        setKeywordParam(undefined);
        window.location.reload();
      } else {
        getFirstPageOfAds();
        if (topicParam) {
          setDisableKeyword(true);
        }
        if (keywordParam) {
          setDisableTopic(true);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (selectedTopic || keyword || selectedSponsor) {
      setDisableSearch(false);
    } else {
      setDisableSearch(true);
    }
  }, [selectedTopic, keyword, selectedSponsor, selectedRegion]);

  const PageNavigation = (params) => {
    const showNext = params.showNext > 0;
    const showPrevious = showNext && params.showPrevious;
    if (!showNext) {
      return null;
    }
    if (showPrevious) {
      return (
        <div align="center">
          <button
            onClick={params.onClickPrevious}
            className="previous round"
            href="#"
          >
            &#8249;
          </button>
          <button onClick={params.onClickNext} className="next round" href="#">
            &#8250;
          </button>
        </div>
      );
    }
    return (
      <div align="center">
        <button onClick={params.onClickNext} className="next round">
          &#8250;
        </button>
      </div>
    );
  };

  const AdClustersDisplay = (params) => {
    const { ads } = params;

    if (params.isGetAdsRequestPending) {
      return (
        <div align="center">
          <br />
          <br />
          <Loader />
        </div>
      );
    }

    if (params.isAdDataEmpty) {
      return (
        <div align="center" className="empty">
          No results found
        </div>
      );
    }

    return (
      <div>
        {params.isFindAdsClicked ? (
          <h3 align="center"> Search results </h3>
        ) : (
          <div className="empty" align="center">
            Enter a keyword search or select a topic, then click Search Ads
          </div>
        )}
        <div className="App-ad-pane">
          {ads.map((ad) => (
            <AdUnit
              ad={ad}
              key={ad.ad_cluster_id}
              setState={setAdClusterData}
              historyPush={historyPush}
            />
          ))}
        </div>
        <PageNavigation
          showNext={ads.length === 20}
          showPrevious={resultsOffset.current > 0}
          onClickPrevious={getPreviousPageOfAds}
          onClickNext={getNextPageOfAds}
        />
      </div>
    );
  };

  const onSubmit = (event) => {
    event.preventDefault();
    historyPush('/findAds');
    setKeywordParam(keyword || undefined);
    setTopicParam(selectedTopic || undefined);
    setRegionParam(selectedRegion || undefined);
    setStartDateParam(startDate);
    setEndDateParam(endDate);
    setSponsorParam(selectedSponsor || undefined);
    setQueryString(window.location.search);
    getFirstPageOfAds();
  };

  return (
    <div>
      <form className="search_bar">
        <Col className="input_fields">
          <Form.Label>Keyword </Form.Label>
          <Button
            align="right"
            type="reset"
            className="read-more"
            onClick={(event) => {
              setDisableValue(event.target.value, 1);
              setKeyword(null);
            }}
          >
            Clear
          </Button>
          <FormControl
            className="text_field"
            placeholder={keyword || 'Enter any keyword...'}
            onChange={(event) => {
              setKeyword(event.target.value);
              setDisableValue(event.target.value, 1);
            }}
            disabled={disableKeyword}
          />
        </Col>
        <Col className="input_fields">
          <Form.Label>Topics</Form.Label>
          <br />
          <Select
            value={selectedTopic}
            onChange={(selected) => {
              setSelectedTopic(selected);
              setDisableValue(selected, 2);
            }}
            options={allTopics}
            name="topics"
            isSearchable
            isMulti={false}
            isDisabled={disableTopic}
            isClearable
          />
        </Col>
        <Col className="input_fields">
          <Form.Label>Has impressions in</Form.Label>
          <br />
          <Select
            value={selectedRegion}
            onChange={(selected) => {
              setSelectedRegion(selected);
            }}
            options={allRegions}
            name="regions"
            isSearchable
            isMulti={false}
            isClearable
          />
        </Col>
        <Col className="input_fields">
          <Form.Label>Sponsor</Form.Label>
          <br />
          <Async
            isMulti={false}
            noOptionsMessage={() => 'No sponsor found'}
            loadOptions={sponsorsSearch}
            onChange={(value) => setSelectedSponsor(value)}
            className="length"
            isClearable
          />
        </Col>
        <Col className="input_fields">
          <Form.Label>Start Date</Form.Label>
          <br />
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className="text_field"
          />
        </Col>
        <Col className="input_fields">
          <Form.Label>End Date</Form.Label>
          <br />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            className="text_field"
          />
        </Col>
        <Col className="input_fields">
          <br />
          <button
            className="search-button"
            type="submit"
            onClick={onSubmit}
            disabled={disableSearch}
          >
            {' '}
            Search Ads{' '}
          </button>
        </Col>
      </form>
      {!adClusterData ? (
        <AdClustersDisplay
          isGetAdsRequestPending={isGetAdsRequestPending}
          isAdDataEmpty={isAdDataEmpty}
          isFindAdsClicked={isFindAdsClicked}
          ads={ads}
          resultsOffset={resultsOffset}
          getPreviousPageOfAds={getPreviousPageOfAds}
          getNextPageOfAds={getNextPageOfAds}
        />
      ) : (
        <AdDetailsPage
          adClusterData={adClusterData}
          setState={setAdClusterData}
          historyPush={historyPush}
          queryString={queryString}
        />
      )}
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(FindAds);

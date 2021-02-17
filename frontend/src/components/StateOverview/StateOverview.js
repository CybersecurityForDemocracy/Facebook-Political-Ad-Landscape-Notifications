/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';

import SponsorsGraph from '../SponsorsGraph';
import SpentByTopicGraph from '../SpentByTopicGraph';
import TotalSpentGraph from '../TotalSpentGraph';
import DistrictTable from '../DistrictTable';
import { contentTitles } from '../../modules/modal/constants';
import { stateHash } from '../../constants/states';

const raceTypeAbbrevs = {
  governor: 'G',
  presidential: 'P',
  usSenate: 'S',
  house: '',
};
function getRaceLink(type, region, idx) {
  return `/stateElectionsData/${stateHash[region]}/${type}/${
    stateHash[region]
  }${raceTypeAbbrevs[type]}${idx + 1}`;
}

function StateOverview({
  sponsorsData,
  sponsorsDataIsFetching,
  topicData,
  topicDataIsFetching,
  presidentSpent,
  presidentSpentIsFetching,
  senateSpent,
  senateSpentIsFetching,
  governorSpent,
  governorSpentIsFetching,
  districtSpent,
  historyPush,
  region,
  baseRoute,
  match: {
    params: { state, overview },
  },
}) {
  const getSenateCharts = () => {
    if (overview && senateSpent && senateSpent.length > 0) {
      return senateSpent.map((senate, idx) => (
        <div
          key={`senate-spent-${idx}`}
          className="polads__general_graphs__graph"
        >
          <TotalSpentGraph
            data={senate}
            isFetching={senateSpentIsFetching}
            title={idx === 0 ? 'US Senate' : 'US Senate (Special)'}
            downloadCSVInline={false}
            contentTitle={contentTitles.TOTAL_SPENT_HOUSE_SENATE}
            onClickSeeMoreData={() =>
              historyPush(getRaceLink('usSenate', region, idx))
            }
            candidatesInfo={senate}
            isStateOverview
          />
        </div>
      ));
    }
    return null;
  };
  const getGovernorCharts = () => {
    if (overview && governorSpent && governorSpent.length > 0) {
      return governorSpent.map((governor, idx) => (
        <div
          key={`governor-spent-${idx}`}
          className="polads__general_graphs__graph"
        >
          <TotalSpentGraph
            data={governor}
            isFetching={governorSpentIsFetching}
            title={
              governorSpent.length === 1 ? 'Governor' : `Governor ${idx + 1}`
            }
            downloadCSVInline={false}
            contentTitle={contentTitles.TOTAL_SPENT_GOV}
            moduleTitle="How much have the gubernatorial campaigns spent on Facebook ads?"
            onClickSeeMoreData={() =>
              historyPush(getRaceLink('governor', region, idx))
            }
            candidatesInfo={governor}
            isStateOverview
          />
        </div>
      ));
    }
    return null;
  };

  const getDistrictTable = () => {
    if (
      overview &&
      districtSpent &&
      districtSpent.data &&
      Object.keys(districtSpent.data) &&
      Object.keys(districtSpent.data).length &&
      districtSpent.candidates &&
      Object.keys(districtSpent.candidates) &&
      Object.keys(districtSpent.candidates).length &&
      Object.keys(districtSpent.data).length ===
        Object.keys(districtSpent.candidates).length
    ) {
      return (
        <div className="polads__general_graphs__graph">
          <DistrictTable
            data={districtSpent.data}
            candidates={districtSpent.candidates}
            historyPush={historyPush}
            region={region}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {overview && (
        <div>
          <div>
            <SponsorsGraph
              data={sponsorsData}
              isFetching={sponsorsDataIsFetching}
              region={region}
            />
          </div>
          <br />
          <br />
          <div>
            <SpentByTopicGraph
              data={topicData.data}
              topics={topicData.topics}
              isFetching={topicDataIsFetching}
              contentTitle={contentTitles.SPEND_BY_TOPIC_STATE}
            />
          </div>
          <div className="polads__general_graphs__container">
            <div className="polads__general_graphs__graph">
              <TotalSpentGraph
                moduleTitle={`Trump vs. Biden ad spending in ${region}`}
                data={presidentSpent}
                isFetching={presidentSpentIsFetching}
                downloadCSVInline={false}
                contentTitle={contentTitles.PRESIDENT_STATE}
                onClickSeeMoreData={() =>
                  historyPush(`/stateData/${stateHash[region]}/presidential`)
                }
              />
            </div>
            {getGovernorCharts()}
            {getSenateCharts()}
            {getDistrictTable()}
          </div>
        </div>
      )}
    </div>
  );
}

StateOverview.propTypes = {
  sponsorsData: PropTypes.arrayOf(PropTypes.shape({})),
  sponsorsDataIsFetching: PropTypes.bool,
  topicData: PropTypes.shape({
    data: PropTypes.array,
    topics: PropTypes.array,
  }),
  topicDataIsFetching: PropTypes.bool,
  presidentSpent: PropTypes.arrayOf(PropTypes.shape({})),
  presidentSpentIsFetching: PropTypes.bool,
  senateSpent: PropTypes.array,
  senateSpentIsFetching: PropTypes.bool,
  governorSpent: PropTypes.array,
  governorSpentIsFetching: PropTypes.bool,
  districtSpent: PropTypes.object,
  historyPush: PropTypes.func,
  region: PropTypes.string,
};

StateOverview.defaultProps = {
  sponsorsData: [],
  sponsorsDataIsFetching: false,
  topicData: {},
  topicDataIsFetching: false,
  presidentSpent: [],
  presidentSpentIsFetching: false,
  senateSpent: [],
  senateSpentIsFetching: false,
  governorSpent: [],
  governorSpentIsFetching: false,
  districtSpent: {
    data: {},
    candidates: [],
  },
  historyPush: () => null,
  region: null,
};

export default StateOverview;

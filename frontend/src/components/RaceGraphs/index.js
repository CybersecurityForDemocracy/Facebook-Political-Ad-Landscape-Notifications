/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import TotalSpentGraph from '../TotalSpentGraph';
import SpentByTacticGraph from '../SpentByTacticGraph';
import LineGraph from '../../graphs/LineGraph';
import GraphFooter from '../../graphs/GraphFooter';
import GraphTable from '../../graphs/GraphTable';
import SpentByStateMap from '../SpentByStateMap';
import '../../styles/components/RaceGraphs.css';
import Table from '../Table';
import util from '../../graphs/util';
import { contentTitles, content } from '../../modules/modal/constants';
import partyColors from '../../utils/partyColors';
import Loader from '../Loader';
import { addFullNameSenate, getDataKeys, getName } from '../../utils/common';
import TargetAudience from '../../graphs/TargetAudience';
import { getSpendOfPageByRegion } from '../../screens/Sponsors/util';

function getPresidentColor(pageName) {
  if (pageName === 'Donald J. Trump') {
    return 'Republican';
  }
  if (pageName === 'Joe Biden') {
    return 'Democrat';
  }

  return false;
}

function getColor(entry, candidatesInfo) {
  let currentCandidate = '';
  const matchCandidate =
    entry &&
    candidatesInfo &&
    candidatesInfo.candidates &&
    candidatesInfo.candidates.find(
      (candidate) => entry === candidate.pages[0].page_name,
    );
  currentCandidate = matchCandidate && matchCandidate.party;
  currentCandidate = getPresidentColor(entry) || currentCandidate;

  return partyColors(currentCandidate);
}

// topics_by_week: [{"week": "2020-01-01", "BLM Protests": 1234, "Donald Trup": 2345} ... ]
// this returns the top N topic names sorted descending by spend in the most recent week
const getTopNKeysForTopics = (topics_by_week, n = 3) => {
  if (!topics_by_week.length) {
    return [];
  }
  const topic_keys = [];
  for (let i = 0; i < topics_by_week.length; i++) {
    if (topic_keys.length >= n) break;
    Object.entries(topics_by_week[topics_by_week.length - 1 - i])
      .filter(([k, v]) => k !== 'week')
      .sort(([k1, v1], [k2, v2]) => v2 - v1)
      .map(([k, v]) => k)
      .slice(0, n)
      .forEach((key) => {
        if (topic_keys.indexOf(key) === -1) {
          topic_keys.push(key);
        }
      });
  }

  const finalTopics = topic_keys.slice(0, n);
  finalTopics.sort();

  return finalTopics;
};

const getCandidateNamesForTactics = (spendByTacticData) =>
  (spendByTacticData || []).reduce((arr, item) => {
    const newArr = [...arr];
    Object.keys(item).forEach((key) => {
      if (key !== 'tactic' && !newArr.includes(key)) {
        newArr.push(key);
      }
    });
    return newArr;
  }, []);

const renderSpentOverTime = (spentOverTime, raceId, candidatesInfo) => {
  const colorsArr = spentOverTime.keys.map((e) => getColor(e, candidatesInfo));
  const keys = getDataKeys(spentOverTime.keys, candidatesInfo);
  const spend = addFullNameSenate(spentOverTime.spend, candidatesInfo);

  const graphComponent = (
    <LineGraph
      data={spend || []}
      graphDataKey={keys || ''}
      xDataKey={spentOverTime.interval}
      legend
      legendLocation="top"
      colors={colorsArr || ['#FF646A', '#397DFF']}
      tooltip
    />
  );

  const tableComponent = (
    <div className="graph-table-candidates">
      <Table.Container>
        <Table.Body>
          <Table.Row>
            <Table.Cell>{/* Empty Cell */}</Table.Cell>
            {keys.map((key) => (
              <Table.Cell>{key}</Table.Cell>
            ))}
          </Table.Row>
          {spend.map((a, idx) => (
            <Table.Row key={`spend-by-tactic-row-${idx}`}>
              <Table.Cell>{a.week}</Table.Cell>
              {keys.map((dataKey) => (
                <Table.Cell key={`spend-by-tactic-row-${idx}-${dataKey}`}>
                  {util.usdFormatter(a[dataKey])}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Container>
    </div>
  );

  return (
    <GraphTable
      title="As the election approaches, are they spending more?"
      contentTitle={
        raceId.substr(2, 1) === 'P'
          ? contentTitles.SPEND_OVER_TIME_PRES
          : raceId.substr(2, 1) === 'G'
          ? contentTitles.SPEND_OVER_TIME_GOV
          : contentTitles.SPEND_OVER_TIME_HOUSE_SENATE
      }
      graphComponent={graphComponent}
      tableComponent={tableComponent}
    />
  );
};

function getValues(spentByTopics) {
  const amount = [];

  for (const topic of spentByTopics) {
    for (const data of topic.data) {
      for (const k of Object.keys(data)) {
        if (k !== 'week') amount.push(data[k]);
      }
    }
  }

  return amount;
}

let firstGraph = null;

function setFirstGraph(arr) {
  firstGraph = arr;
}

const renderSpentByTopic = (spentByTopics, raceId, candidatesInfo) => {
  const amounts = getValues(spentByTopics);
  const largestAmount = parseInt(Math.max(...amounts).toString()) + 100;

  return (
    <GraphTable
      title="What topics do the ads focus on?"
      contentTitle={
        raceId.substr(2, 1) === 'G' || raceId.substr(2, 1) === 'P'
          ? contentTitles.SPEND_BY_TOPIC_PRES_GOV
          : contentTitles.SPEND_BY_TOPIC_HOUSE_SENATE
      }
      graphComponent={
        <div className="spentByTopicContainer">
          {spentByTopics.length &&
            spentByTopics.map((topic, idx) => {
              const sortedDate = topic.data.sort((a, b) =>
                a.week.localeCompare(b.week),
              );
              let colorsArr = [];
              if (idx === 0) {
                colorsArr = ['#FFC164', '#301BA1', '#3182BD'];
                setFirstGraph(getTopNKeysForTopics(sortedDate, 3));
              }
              if (idx === 1) {
                const secondGraph = getTopNKeysForTopics(sortedDate, 3);
                colorsArr.push(
                  firstGraph[0] === secondGraph[0] ? '#FFC164' : '#57068c',
                );
                colorsArr.push(
                  firstGraph[1] === secondGraph[1] ? '#301BA1' : '#836EFB',
                );
                colorsArr.push(
                  firstGraph[2] === secondGraph[2] ? '#3182BD' : '#282B38',
                );
              }

              if (colorsArr.length < 0) {
                colorsArr = ['#FFC164', '#301BA1', '#3182BD'];
              }

              return (
                <div
                  className="spentByTopicWrapper"
                  key={`spent_by_topic_graph_${idx}`}
                >
                  <div className="pageName">
                    {getName(candidatesInfo, topic)}
                  </div>
                  <LineGraph
                    data={sortedDate}
                    graphDataKey={getTopNKeysForTopics(sortedDate, 3)}
                    topics={getTopNKeysForTopics(sortedDate, 3)}
                    xDataKey="week"
                    legend
                    legendLocation="top"
                    colors={colorsArr}
                    keyFormatter={util.dateFormatter}
                    tooltip
                  />
                </div>
              );
            })}
        </div>
      }
      tableComponent={
        <div className="spentByTopicContainer">
          {spentByTopics.length &&
            spentByTopics.map((topic, idx) => {
              const sortedDate = topic.data.sort((a, b) =>
                a.week.localeCompare(b.week),
              );
              const keys = getTopNKeysForTopics(sortedDate).slice(0, 3);
              return (
                <div
                  className="spentByTopicWrapper"
                  key={`spent_by_topic_table_${idx}`}
                >
                  <h3 className="tableName">
                    {getName(candidatesInfo, topic)}
                  </h3>
                  <div className="graph-table-candidates">
                    <Table.Container>
                      <Table.Body>
                        <Table.Row>
                          <Table.Cell>Date</Table.Cell>
                          {keys.map((key) => (
                            <Table.Cell key={`spent_by_topic_table_key-${key}`}>
                              {key}
                            </Table.Cell>
                          ))}
                        </Table.Row>
                        {sortedDate.map((data, idx2) => (
                          <Table.Row
                            key={`spent_by_topic_table_key__row-${idx2}`}
                          >
                            <Table.Cell>
                              {util.dateFormatter(data.week)}
                            </Table.Cell>
                            {keys.map((key) => (
                              <Table.Cell
                                key={`spent_by_topic_table_key__row-${idx2}-${key}`}
                              >
                                {util.usdFormatter(data[key])}
                              </Table.Cell>
                            ))}
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Container>
                  </div>
                </div>
              );
            })}
        </div>
      }
    />
  );
};

const renderSpendByTactics = (spendByTactics, raceId, candidatesInfo) => {
  const dataKeys = getCandidateNamesForTactics(spendByTactics);
  return (
    <SpentByTacticGraph
      data={spendByTactics || []}
      dataKeys={dataKeys}
      title="What are the ads' objectives?"
      downloadCSVInline={false}
      contentTitle={
        raceId.substr(2, 1) === 'G' || raceId.substr(2, 1) === 'P'
          ? contentTitles.SPEND_BY_TACTIC_PRES_GOV
          : contentTitles.SPEND_BY_TACTIC_HOUSE_SENATE
      }
      style={{
        height: 425,
      }}
      candidatesInfo={candidatesInfo}
    />
  );
};

function RaceGraphs({
  raceId,
  totalSpentData,
  totalSpentFetching,
  totalSpentModuleTitle,
  spentOverTime,
  spentOverTimeFetching,
  spentByTopics,
  spentByTopicsFetching,
  spendByTactics,
  spendByTacticsFetching,
  countOfTargetingMethods,
  candidatesInfo,
  isFromState = false,
}) {
  const [spendOfPageByRegion, setSpendOfPageByRegion] = useState([
    { loading: true },
    { loading: true },
  ]);

  // Fetch spend of page by region once we have other data and know which top
  // candidates we are displaying.
  // TODO(jon.jandoc): This is a little janky and inconsistent with how other
  // data for this page is being fetched. We'll want to refactor this when time
  // allows.
  useEffect(() => {
    if (
      !totalSpentData.length ||
      !(candidatesInfo && candidatesInfo.candidates)
    ) {
      return;
    }
    (async () => {
      const spend = await Promise.all(
        totalSpentData.map(
          ({ page_id, page_name }) =>
            new Promise((resolve) => {
              getSpendOfPageByRegion(page_id, (data) => {
                resolve({
                  ...data,
                  page_id,
                  page_name,
                  candidate: candidatesInfo.candidates.find((candidate) =>
                    candidate.pages.some((page) => page.page_id === page_id),
                  ),
                });
              });
            }),
        ),
      );
      setSpendOfPageByRegion(spend);
    })();
  }, [candidatesInfo, totalSpentData]);

  return (
    <div>
      <TotalSpentGraph
        showTitle={false}
        data={totalSpentData}
        downloadCSV
        isFetching={totalSpentFetching}
        contentTitle={
          raceId.substr(2, 1) === 'P'
            ? contentTitles.PRESIDENT
            : raceId.substr(2, 1) === 'G'
            ? contentTitles.TOTAL_SPENT_GOV
            : contentTitles.TOTAL_SPENT_HOUSE_SENATE
        }
        moduleTitle={totalSpentModuleTitle}
        candidatesInfo={candidatesInfo}
        raceId={raceId}
      />
      <div
        className="polads__general_graphs__container"
        style={{ marginBottom: '2rem' }}
      >
        <div className="polads__general_graphs__graph">
          {!spendByTacticsFetching ? (
            renderSpendByTactics(spendByTactics, raceId, candidatesInfo)
          ) : (
            <Loader />
          )}
        </div>

        <div className="polads__general_graphs__graph">
          {!spentOverTimeFetching ? (
            renderSpentOverTime(spentOverTime, raceId, candidatesInfo)
          ) : (
            <Loader />
          )}
        </div>
      </div>

      <div style={{ display: 'flex', width: '100%', marginBottom: 68 }}>
        <div style={{ width: '100%' }}>
          {!spentByTopicsFetching && spentByTopics.length ? (
            renderSpentByTopic(spentByTopics, raceId, candidatesInfo)
          ) : (
            <Loader />
          )}
        </div>
      </div>

      {!isFromState && (
        <div
          className="polads__general_graphs__container polads__graph_component"
          style={{ marginBottom: '2rem' }}
        >
          <div className="polads__graph_header">
            <h3 className="polads__graph_title">Where are the ads shown?</h3>
          </div>
          <div className="polads__spent_by_state">
            {spendOfPageByRegion.every((item) => !item.loading) ? (
              spendOfPageByRegion.map(
                ({ candidate, page_id, page_name, data }) => (
                  <div key={page_id} className="polads__spent_by_state_wrapper">
                    <SpentByStateMap
                      data={data}
                      candidate={candidate}
                      title={page_name}
                      showFooter={false}
                      id={page_id}
                    />
                  </div>
                ),
              )
            ) : (
              <Loader />
            )}
          </div>
          <GraphFooter>
            <p className="map__source">
              Source: Facebook Ad Library. Total spent on Facebook ads since
              July 1, 2020. State populations via 2019 U.S. Census estimates.
            </p>
          </GraphFooter>
        </div>
      )}
      {!isFromState && (
        <TargetAudience countOfTargetingMethods={countOfTargetingMethods} />
      )}
    </div>
  );
}

RaceGraphs.propTypes = {
  raceId: PropTypes.string,
  totalSpentData: PropTypes.arrayOf({
    graphColor: PropTypes.string,
    page_name: PropTypes.string,
    page_id: PropTypes.number,
    spend: PropTypes.number,
  }),
  totalSpentFetching: PropTypes.bool,
  spentOverTime: PropTypes.shape({
    interval: PropTypes.string,
    keys: PropTypes.arrayOf(PropTypes.string),
    spend: PropTypes.number,
  }),
  spentOverTimeFetching: PropTypes.bool,
  spentByTopics: PropTypes.arrayOf({
    data: PropTypes.arrayOf(),
    page_name: PropTypes.string,
  }),
  spentByTopicsFetching: PropTypes.bool,
  spendByTactics: PropTypes.arrayOf({
    data: PropTypes.arrayOf(),
    page_name: PropTypes.string,
  }),
  spendByTacticsFetching: PropTypes.bool,
  countOfTargetingMethods: PropTypes.arrayOf({
    targeting: PropTypes.array,
    page_name: PropTypes.string,
  }),
  countOfTargetingMethodsFetching: PropTypes.bool,
  isFromState: PropTypes.bool,
  totalSpentModuleTitle: PropTypes.string,
};

RaceGraphs.defaultProps = {
  raceId: '',
  totalSpentData: [
    {
      graphColor: '',
      page_name: '',
      spend: 0,
    },
  ],
  totalSpentFetching: false,
  spentOverTime: {
    interval: '',
    keys: ['', ''],
    spend: 0,
  },
  spentOverTimeFetching: false,
  spentByTopics: [
    {
      data: [],
      page_name: '',
    },
  ],
  spentByTopicsFetching: false,
  spendByTactics: [
    {
      data: [],
      page_name: '',
    },
  ],
  spendByTacticsFetching: false,
  countOfTargetingMethods: [
    {
      targeting: [{}],
      page_name: '',
    },
  ],
  spendOfPageByRegion: [],
  countOfTargetingMethodsFetching: false,
  isFromState: false,
  totalSpentModuleTitle: null,
};

const mapDispatchToProps = (dispatch) => ({});

export default connect(null, mapDispatchToProps)(RaceGraphs);

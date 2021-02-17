import React from 'react';
import PropTypes from 'prop-types';
import { Bar, Cell } from 'recharts';

import Button from '../Button';
import BarGraph from '../../graphs/BarGraph';
import util from '../../graphs/util';
import CustomLabel from '../../graphs/BarGraph/CustomLabel';
import GraphTable from '../../graphs/GraphTable';

import '../../styles/components/presidentSpent.css';
import Table from '../Table';
// import SelectFilter from '../Select/SelectFilter';
import partyColors from '../../utils/partyColors';
import Loader from '../Loader';
import { addFullName } from '../../utils/common';

function getPresidentColor(pageName) {
  if (pageName === 'Donald J. Trump') {
    return 'Republican';
  }
  if (pageName === 'Joe Biden') {
    return 'Democrat';
  }

  return false;
}

function getColor(entry, candidatesInfo, isStateOverview) {
  const entryName = entry.pageName ? entry.pageName : entry.page_name;
  let currentCandidate = '';
  if (isStateOverview) {
    const matchCandidate =
      entryName &&
      candidatesInfo &&
      candidatesInfo.find((e) => entryName.includes(e.page_name));
    currentCandidate = matchCandidate && matchCandidate.party;
    currentCandidate = getPresidentColor(entryName) || currentCandidate;
  } else {
    const matchCandidate =
      entryName &&
      candidatesInfo &&
      candidatesInfo.candidates &&
      candidatesInfo.candidates.find((e) =>
        entryName.includes(e.pages[0].page_name),
      );
    currentCandidate = matchCandidate && matchCandidate.party;
    currentCandidate = getPresidentColor(entryName) || currentCandidate;
  }

  return partyColors(currentCandidate);
}

function TotalSpentGraph({
  data,
  title,
  showTitle,
  isFetching,
  downloadCSVInline,
  contentTitle,
  onClickSeeMoreData,
  moduleTitle,
  candidatesInfo,
  isStateOverview,
  raceId,
}) {
  let content = <p>No data to show</p>;
  if (isFetching) {
    content = <Loader />;
  } else if (data && data.length) {
    const colorsArr = [];
    data = addFullName(data, candidatesInfo);

    /* eslint-disable */
    const renderLabel = (props) => (
      <CustomLabel
        {...props}
        isHorizontal={false}
        dataFormatter={util.usdTruncateNumberFormatter}
      />
    );
    /* eslint-enable */
    const renderBars = (setTooltipKey) => {
      return (
        <Bar
          fill={data}
          isAnimationActive={false}
          dataKey="spend"
          maxBarSize={60}
          label={renderLabel}
          radius={[0, 2, 2, 0]}
          onMouseOver={() => setTooltipKey('spend')}
          onFocus={() => setTooltipKey('spend')}
        >
          {data.map((entry) => {
            const color = getColor(entry, candidatesInfo, isStateOverview);
            colorsArr.push({ name: entry.page_name, color });
            return <Cell key={`cell-${entry.page_name}`} fill={color} />;
          })}
        </Bar>
      );
    };

    const graphComponent = (
      <BarGraph
        data={data}
        layout="vertical"
        graphDataKey={['spend']}
        yDataKey="full_name"
        tick={{ width: 70 }}
        margin={{ left: 70 }}
        tickFormatter={util.usdTruncateNumberFormatter}
        showBarLabel
        showYAxisLine
        style={{ height: '250px' }}
        renderCustomBars={renderBars}
        tooltip
        colors={colorsArr}
      />
    );

    const tableComponent = (
      <Table.Container style={{ width: '100%', fontSize: '18px' }}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Candidates</Table.Cell>
            <Table.Cell>Total Spent</Table.Cell>
          </Table.Row>
          {data.map(
            ({ page_name: pageName, spend, party, graphColor, full_name }) => (
              <Table.Row key={`${title}-${pageName}`}>
                <Table.Cell>{full_name}</Table.Cell>
                <Table.Cell
                  style={{
                    color: getColor(
                      { pageName, party, graphColor },
                      candidatesInfo,
                      isStateOverview,
                    ),
                    fontWeight: 600,
                  }}
                >
                  {util.usdFormatter(spend)}
                </Table.Cell>
              </Table.Row>
            ),
          )}
        </Table.Body>
      </Table.Container>
    );

    // TODO: filters
    // const requestData = (e) => {
    //   console.log({ target: e.target });
    // };

    // const filtersComponent = (
    //   <div>
    //     <SelectFilter onChange={requestData} />
    //   </div>
    // );

    content = (
      <div className="graph-table-candidates">
        <GraphTable
          title={
            moduleTitle ||
            'How much have the Senate campaigns spent on Facebook ads?'
          }
          graphComponent={graphComponent}
          tableComponent={tableComponent}
          downloadCSV={() => alert('TODO')}
          downloadCSVInline={downloadCSVInline}
          contentTitle={contentTitle}
          raceId={raceId}
        />
      </div>
    );
  }

  return (
    <>
      {showTitle && (
        <h3 className="polads__president_spent__header">
          {title}
          &nbsp; &gt;
          <Button
            className="polads__president_spent__button"
            label="See more"
            onPress={onClickSeeMoreData}
          />
        </h3>
      )}
      {content}
    </>
  );
}

TotalSpentGraph.propTypes = {
  data: PropTypes.array.isRequired, // eslint-disable-line
  showTitle: PropTypes.bool,
  downloadCSVInline: PropTypes.bool,
  isFetching: PropTypes.bool,
  title: PropTypes.string,
  contentTitle: PropTypes.string,
  moduleTitle: PropTypes.string,
  onClickSeeMoreData: PropTypes.func,
  raceId: PropTypes.string,
};

TotalSpentGraph.defaultProps = {
  showTitle: true,
  downloadCSVInline: true,
  isFetching: false,
  title: 'President',
  contentTitle: null,
  onClickSeeMoreData: () => null,
  moduleTitle: null,
  raceId: null,
};

export default TotalSpentGraph;

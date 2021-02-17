/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/no-array-index-key */

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import LineGraph from '../../graphs/LineGraph';
import colors from '../../styles/graphs';
import util from '../../graphs/util';
import GraphTable from '../../graphs/GraphTable';
import Table from '../Table';
import { contentTitles } from '../../modules/modal/constants';
import Loader from '../Loader';

const color = [
  colors.navyBlue,
  colors.pink,
  colors.purple,
  colors.ochre,
  colors.mud,
];

function SpentByTopicGraph({
  data,
  topics,
  isFetching,
  downloadCSVInline,
  contentTitle,
}) {
  let content = <p>No data to show</p>;
  if (isFetching) {
    content = <Loader />;
  } else if (data && data.length) {
    const graphComponent = (
      <LineGraph
        data={data}
        graphDataKey={topics}
        xDataKey="week"
        legend
        legendLocation="top"
        colors={color}
        keyFormatter={util.dateFormatter}
        tooltip
      />
    );
    const tableComponent = (
      <div className="graph-table-candidates">
        <Table.Container style={{ width: '100%', fontSize: '18px' }}>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Week</Table.Cell>
              {topics.map((topic) => (
                <Table.Cell key={topic}>{topic}</Table.Cell>
              ))}
            </Table.Row>
            {data.map((row, idx) => (
              <Table.Row key={`spent-by-topic-${idx}`}>
                <Table.Cell>
                  {moment(row.week).format('MMM DD, YYYY')}
                </Table.Cell>
                {topics.map((topic) => (
                  <Table.Cell key={`spent-by-topic-${idx}-${topic}`}>
                    {util.usdFormatter(row[topic])}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Container>
      </div>
    );

    content = (
      <div className="graph-table-candidates">
        <GraphTable
          title="What topics do the ads focus on?"
          contentTitle={contentTitle || contentTitles.SPENT_BY_TOPIC}
          graphComponent={graphComponent}
          tableComponent={tableComponent}
          downloadCSV={() => alert('TODO')}
          downloadCSVInline={downloadCSVInline}
        />
      </div>
    );
  }

  return content;
}

SpentByTopicGraph.propTypes = {
  data: PropTypes.array.isRequired,
  downloadCSVInline: PropTypes.bool,
};

SpentByTopicGraph.defaultProps = {
  downloadCSVInline: true,
};

export default SpentByTopicGraph;

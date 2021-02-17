/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import BarGraph from '../../graphs/BarGraph';
import colors from '../../styles/graphs';
import util from '../../graphs/util';
import GraphTable from '../../graphs/GraphTable';

import '../../styles/components/sponsors.css';
import Table from '../Table';
import { contentTitles } from '../../modules/modal/constants';
import Loader from '../Loader';
import { openSponsorPage } from '../../utils/common';

function onBarClick(e) {
  openSponsorPage(e.page_id, e.page_name);
}

function SponsorsGraph({ data, isFetching, region }) {
  let content = <p>No data to show</p>;
  if (isFetching) {
    content = <Loader />;
  } else if (data && data.length) {
    const graphData = data.length > 11 ? data.slice(0, 11) : data;
    const graphComponent = (
      <BarGraph
        layout="vertical"
        graphDataKey={['spend']}
        yDataKey="page_name"
        data={graphData}
        barSize={36}
        colors={[colors.purple]}
        showBarLabel
        tick={{ width: 190, textDecoration: 'underline' }}
        margin={{ left: 170 }}
        style={{ height: '650px' }}
        showYAxisLine
        tickFormatter={util.usdTruncateNumberFormatter}
        tooltip
        onClick={onBarClick}
      />
    );

    const tableComponent = (
      <div style={{ display: 'block' }}>
        <Table.Container style={{ width: '100%', fontSize: '18px' }}>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Sponsor</Table.Cell>
              <Table.Cell>Total Spent</Table.Cell>
            </Table.Row>
            {graphData.map(({ page_name: pageName, spend }) => (
              <Table.Row key={pageName}>
                <Table.Cell>{pageName}</Table.Cell>
                <Table.Cell>{util.usdFormatter(spend)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Container>
      </div>
    );

    const title = region === 'the United States' ? 'Total spent' : `Total spent to show ads in ${region}`;
    content = (
      <div className="graph-table-candidates">
        <GraphTable
          title={title}
          contentTitle={
            region === 'the United States'
              ? contentTitles.TOP_SPONSORS
              : contentTitles.TOP_SPONSORS_STATE
          }
          tableComponent={tableComponent}
          graphComponent={graphComponent}
          downloadCSV={() => alert('TODO')}
        />
      </div>
    );
  }
  return (
    <div className="polads__sponsors">
      <h3>
        Who’s running political Facebook ads in
        {' '}
        {region}
        ?
      </h3>
      {content}
    </div>
  );
}

SponsorsGraph.propTypes = {
  data: PropTypes.array,
  isFetching: PropTypes.bool,
  region: PropTypes.string,
};

SponsorsGraph.defaultProps = {
  data: [],
  isFetching: false,
};

export default SponsorsGraph;

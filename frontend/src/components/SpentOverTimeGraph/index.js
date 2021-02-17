/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import LineGraph from '../../graphs/LineGraph';
import Table from '../Table';

import GraphTable from '../../graphs/GraphTable';
import color from '../../styles/graphs';
import util from '../../graphs/util';

function SpentOverTimeGraph({
  spentOverTime,
  colors,
  title,
  pageName,
  contentTitle,
}) {
  const { keys, spend, interval } = spentOverTime;
  const graphComponent = (
    <div className="line_graph_wrapper">
      {pageName ? <div className="pageName">{pageName}</div> : null}
      <LineGraph
        data={spend || []}
        graphDataKey={keys || ''}
        xDataKey={interval}
        legend
        legendLocation="top"
        colors={colors}
        tooltip
        keyFormatter={util.dateFormatter}
      />
    </div>
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
      title={title}
      graphComponent={graphComponent}
      tableComponent={tableComponent}
      contentTitle={contentTitle}
    />
  );
}

SpentOverTimeGraph.propTypes = {
  spentOverTime: PropTypes.shape({
    keys: PropTypes.array,
    spend: PropTypes.array,
    interval: PropTypes.string,
  }),
  colors: PropTypes.array,
  title: PropTypes.string,
  pageName: PropTypes.string,
  contentTitle: PropTypes.string,
};

SpentOverTimeGraph.defaultProps = {
  spentOverTime: {
    keys: [],
    spend: [],
    interval: 'week',
  },
  colors: [color.purple],
  title: 'As the election approaches, are they spending more?',
  pageName: null,
  contentTitle: '',
};

export default SpentOverTimeGraph;

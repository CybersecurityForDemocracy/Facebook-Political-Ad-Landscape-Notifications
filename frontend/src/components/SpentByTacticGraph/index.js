/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';

import BarGraph from '../../graphs/BarGraph';
import util from '../../graphs/util';
import GraphTable from '../../graphs/GraphTable';
import colors from '../../styles/graphs';
import partyColors from '../../utils/partyColors';

import '../../styles/components/presidentSpent.css';
import Table from '../Table';
import { addFullNameTactic, getDataKeys } from '../../utils/common';

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
      (candidate) => entry === candidate.full_name,
    );

  currentCandidate = matchCandidate && matchCandidate.party;
  currentCandidate = getPresidentColor(entry) || currentCandidate;

  return partyColors(currentCandidate);
}

function SpentByTacticGraph({
  data,
  downloadCSVInline,
  style,
  title,
  dataKeys,
  contentTitle,
  candidatesInfo,
}) {
  let content = <p>No data to show</p>;
  const colorsArr = dataKeys.map((candidate) =>
    getColor(candidate, candidatesInfo),
  );

  if (data && data.length) {
    data = addFullNameTactic(data, candidatesInfo);
    const dataKeysWithNames = getDataKeys(dataKeys, candidatesInfo);
    const graphComponent = (
      <BarGraph
        data={data}
        graphDataKey={dataKeysWithNames}
        xDataKey={(item) =>
          item === 'CONNECT'
            ? 'Sign up'
            : item.tactic.replace(/\w\S*/g, (txt) => {
                return (
                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
              })
        }
        tick={{ width: 70 }}
        margin={{ left: 70 }}
        tickFormatter={util.usdTruncateNumberFormatter}
        colors={colorsArr || [colors.red, colors.blue]}
        tooltip
        showXAxisLine
        style={{ height: '250px', ...style }}
        legend
        legendLocation="top"
      />
    );

    const tableComponent = (
      <div className="graph-table-candidates">
        <Table.Container>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Tactic</Table.Cell>
              {dataKeysWithNames.map((key) => (
                <Table.Cell key={key}>{key}</Table.Cell>
              ))}
            </Table.Row>
            {data.map((a, idx) => (
              <Table.Row key={`spend-by-tactic-row-${idx}`}>
                <Table.Cell>{a.tactic}</Table.Cell>
                {dataKeys.map((dataKey) => (
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

    content = (
      <GraphTable
        graphComponent={graphComponent}
        tableComponent={tableComponent}
        downloadCSV={() => alert('TODO')}
        downloadCSVInline={downloadCSVInline}
        title={title}
        contentTitle={contentTitle}
      />
    );
  }

  return content;
}

SpentByTacticGraph.propTypes = {
  data: PropTypes.array.isRequired, // eslint-disable-line
  showTitle: PropTypes.bool,
  downloadCSVInline: PropTypes.bool,
  title: PropTypes.string,
  contentTitle: PropTypes.string,
};

SpentByTacticGraph.defaultProps = {
  showTitle: true,
  downloadCSVInline: true,
  title: '',
  contentTitle: '',
};

export default SpentByTacticGraph;

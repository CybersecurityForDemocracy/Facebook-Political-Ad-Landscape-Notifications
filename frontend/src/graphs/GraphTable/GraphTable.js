/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import GraphHeader from '../GraphHeader';
import GraphFooter from '../GraphFooter';
import Button from '../../components/Button';

function GraphTable({
  graphComponent,
  tableComponent,
  filtersComponent,
  customFooter,
  title,
  contentTitle,
  showToggle,
  downloadCSV,
  downloadCSVInline,
  raceId,
}) {
  const [graphState, setGraphState] = useState(true);

  const toggleGraph = () => {
    setGraphState(!graphState);
  };

  const renderGraphTable = () => {
    const component = graphState ? graphComponent : tableComponent;

    return component;
  };

  const filters = (
    <div>
      {showToggle && (
        <>
          <Button
            icon="graph"
            onPress={toggleGraph}
            className={cn('polads__graph_state', { active: graphState })}
          />
          <Button
            icon="list"
            onPress={toggleGraph}
            className={cn('polads__graph_state', { active: !graphState })}
          />
        </>
      )}
      {filtersComponent}
    </div>
  );

  return (
    <div className="polads__graph_component">
      <GraphHeader title={title} filters={filters} />
      {renderGraphTable()}
      {customFooter || (
        <GraphFooter
          downloadCSV={downloadCSV}
          downloadCSVInline={downloadCSVInline}
          title={title}
          contentTitle={contentTitle}
        >
          {raceId && (
            <div>
              <a
                href={`https://www.opensecrets.org/races/summary?cycle=2020&id=${raceId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Where did all this money come from? Explore campaign finance
                data at OpenSecrets.org
              </a>
            </div>
          )}
        </GraphFooter>
      )}
    </div>
  );
}

GraphTable.propTypes = {
  graphTableDataProps: PropTypes.shape({}),
  graphComponent: PropTypes.node,
  tableComponent: PropTypes.node,
  filtersComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  customFooter: PropTypes.node,
  title: PropTypes.string,
  showToggle: PropTypes.bool,
  downloadCSV: PropTypes.func,
  downloadCSVInline: PropTypes.bool,
  contentTitle: PropTypes.string,
  raceId: PropTypes.string,
};

GraphTable.defaultProps = {
  graphTableDataProps: {},
  graphComponent: null,
  tableComponent: null,
  filtersComponent: null,
  customFooter: null,
  title: 'Total Spent',
  showToggle: true,
  downloadCSV: null,
  downloadCSVInline: true,
  contentTitle: '',
  raceId: null,
};

export default GraphTable;

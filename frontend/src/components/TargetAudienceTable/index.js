/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import Table from '../Table';
import TargetAudienceEmpty from '../../graphs/TargetAudience/TargetAudienceEmpty';
import '../../styles/components/TargetAudienceTable.css';
import {
  VERY_SKETCHY,
  MILDLY_SKETCHY,
  // eslint-disable-next-line
  NOT_SKETCHY, // may be used in the future
  transformTargetingLine,
} from '../../utils/transformTargeting';
import util from '../../graphs/util';

function TargetAudienceTable({ data, tableTitle, key }) {
  return (
    <div className="topAudienceTable" key={`top_audience_${key}`}>
      {' '}
      {tableTitle ? (
        <div className="topAudienceTableTitle">{tableTitle}</div>
      ) : null}
      <Table.Container style={{ width: '100%', fontSize: '18px' }}>
        <Table.Body>
          <Table.Row>
            <Table.Cell className="topAudienceRowHeader">
              Targeting Method
            </Table.Cell>
            <Table.Cell className="topAudienceRowHeader">
              Target Audience
            </Table.Cell>
            <Table.Cell className="topAudienceRowHeader">
              Ads Collected
            </Table.Cell>
          </Table.Row>
          {data.targeting &&
            data.targeting
              .reduce(transformTargetingLine, [])
              .map((target, key) => (
                <Table.Row
                  key="1"
                  style={{
                    background:
                      !key || key % 2 === 0
                        ? 'rgba(247, 248, 251, 0.64)'
                        : 'white',
                  }}
                >
                  <Table.Cell className="topAudienceCell">
                    {target.sketchiness === VERY_SKETCHY ? (
                      <span style={{ color: 'red' }}>!!</span>
                    ) : target.sketchiness === MILDLY_SKETCHY ? (
                      <span style={{ color: 'gold' }}>▲</span>
                    ) : (
                      <span style={{ color: 'blue' }}>●</span>
                    )}{' '}
                    {target.category}
                  </Table.Cell>
                  <Table.Cell className="topAudienceCell">
                    {target.subcategory}
                  </Table.Cell>
                  <Table.Cell className="topAudienceCell topAudienceNumberCell">
                    {util.genericNumberFormatter(target.count)}
                  </Table.Cell>
                </Table.Row>
              ))}
        </Table.Body>
      </Table.Container>
      {data.targeting && !!data.targeting.length ? null : (
        <TargetAudienceEmpty isMultiple={false} />
      )}
      {/*          <div className="raceTopAudienceFooterTable">
                  <Button
                    onPress={() => alert('TO do')}
                    className="raceTopAudienceFooterButton"
                    label="Download CSV"
                    icon="downloadCloud"
                    iconColor="white"
                    iconStyles={{ marginRight: '0.5rem' }}
                  />
                </div>
      */}
    </div>
  );
}

TargetAudienceTable.propTypes = {
  data: PropTypes.shape({}).isRequired,
  tableTitle: PropTypes.string,
  key: PropTypes.any,
};

TargetAudienceTable.defaultProps = {
  data: {},
  tableTitle: null,
  key: '1',
};

export default TargetAudienceTable;

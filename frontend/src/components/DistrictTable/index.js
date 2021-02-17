/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Table from '../Table';

import util from '../../graphs/util';
import GraphHeader from '../../graphs/GraphHeader';
import GraphFooter from '../../graphs/GraphFooter';
import getPartyColor from '../../utils/partyColors';

import './districtTable.css';
import { stateHash } from '../../constants/states';
import { contentTitles } from '../../modules/modal/constants';

const INITIAL_DATA_LENGTH = 8;

/**
 * Get candidate or null
 * @param {{}[]} districtCandidates - region candidates
 * @param {{}} districtData - district data
 * @param {number} idx - index
 */
function getCandidate(districtCandidates, districtData, idx) {
  if (
    districtCandidates &&
    districtCandidates.length &&
    districtData.data &&
    districtData.data[idx]
  ) {
    const candidateRace = districtCandidates.find(
      (c) => c.race === districtData.race,
    );

    if (
      candidateRace &&
      candidateRace.candidates &&
      candidateRace.candidates.length
    ) {
      const candidate = candidateRace.candidates.find(
        (c) => c.pageId === districtData.data[idx].pageId,
      );

      if (candidate) {
        return candidate;
      }
    }
  }
  return { name: '-', type: null };
}

function getSpend(districtData, idx) {
  const spendData = districtData.data[idx];
  if (spendData) {
    return util.usdFormatter(spendData.spend);
  }

  return util.usdFormatter(0);
}

function stringSort(a, b) {
  return a.localeCompare(b);
}

function DistrictTable({ data, candidates, historyPush, region }) {
  const [showAllData, setShowAllData] = useState(false);

  const renderTableData = () => {
    if (data && Object.keys(data) && Object.keys(data).length) {
      const districts = showAllData
        ? Object.keys(data).sort(stringSort)
        : Object.keys(data).sort(stringSort).slice(0, INITIAL_DATA_LENGTH);

      return districts.map((district, idx) => {
        const candidate1 = getCandidate(
          candidates.filter((o) => o.race === district),
          data[district],
          0,
        );

        const candidate1Color =
          (candidate1.party && getPartyColor(candidate1.party)) || null;

        const candidate1RightBorderStyle = candidate1Color
          ? { borderRight: `4px solid ${candidate1Color}` }
          : {};

        const candidate1CellStyle = {
          fontWeight: 600,
          borderTop: 'none',
          borderBottom: 'none',
          width: '159px',
          ...candidate1RightBorderStyle,
        };

        const candidate2 = getCandidate(
          candidates.filter((o) => o.race === district),
          data[district],
          1,
        );

        const candidate2Color =
          (candidate2.party && getPartyColor(candidate2.party)) || null;

        const candidate2RightBorderStyle = candidate2Color
          ? { borderRight: `4px solid ${candidate2Color}` }
          : {};

        const candidate2CellStyle = {
          fontWeight: 600,
          borderTop: 'none',
          borderBottom: 'none',
          width: '159px',
          ...candidate2RightBorderStyle,
        };

        return (
          <Table.Row
            key={`district-table-${idx}`}
            onClick={() =>
              historyPush(
                `/stateElectionsData/${stateHash[region]}/usHouse/${district}`,
              )
            }
            style={{ cursor: 'pointer' }}
          >
            <Table.Cell
              style={{
                fontWeight: 600,
                borderTop: 'none',
                borderBottom: 'none',
                borderLeft: 'none',
              }}
            >
              {district.slice(-2)}
            </Table.Cell>
            <Table.Cell style={candidate1CellStyle}>
              {candidate1.name}
            </Table.Cell>
            <Table.Cell
              style={{
                fontWeight: 600,
                borderTop: 'none',
                borderBottom: 'none',
                width: '92px',
              }}
            >
              {getSpend(data[district], 0)}
            </Table.Cell>
            <Table.Cell style={candidate2CellStyle}>
              {candidate2.name}
            </Table.Cell>
            <Table.Cell
              style={{
                fontWeight: 600,
                borderTop: 'none',
                borderBottom: 'none',
                width: '92px',
                borderRight: 'none',
              }}
            >
              {getSpend(data[district], 1)}
            </Table.Cell>
          </Table.Row>
        );
      });
    }
    return null;
  };

  const renderHeaders = () => (
    <Table.Row>
      <Table.Cell
        style={{
          fontWeight: 600,
          borderTop: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
        }}
      >
        District
      </Table.Cell>
      <Table.Cell
        style={{
          fontWeight: 600,
          borderTop: 'none',
          borderBottom: 'none',
        }}
      >
        Candidate 1
      </Table.Cell>
      <Table.Cell
        style={{
          fontWeight: 600,
          borderTop: 'none',
          borderBottom: 'none',
        }}
      >
        Spent
      </Table.Cell>
      <Table.Cell
        style={{
          fontWeight: 600,
          borderTop: 'none',
          borderBottom: 'none',
        }}
      >
        Candidate 2
      </Table.Cell>
      <Table.Cell
        style={{
          fontWeight: 600,
          borderTop: 'none',
          borderBottom: 'none',
          borderRight: 'none',
        }}
      >
        Spent
      </Table.Cell>
    </Table.Row>
  );

  return (
    <div>
      <h3 className="polads__president_spent__header">US House &nbsp; &gt;</h3>
      <div className="spent_by_district">
        <GraphHeader
          title="How much have the House campaigns spent on Facebook ads?"
          filters={null}
        />
        <div className="graph-table-district">
          <Table.Container
            style={{
              marginTop: '-29px',
              width: '100%',
              borderTopStyle: 'none',
              borderBottomStyle: 'solid',
              borderLeft: '0px none',
              borderRight: '0px none',
            }}
          >
            <Table.Body>
              {renderHeaders()}
              {renderTableData()}
            </Table.Body>
          </Table.Container>
        </div>
        <GraphFooter
          downloadCSV={() => alert('TODO')}
          downloadCSVInline={false}
          readMoreContent={null}
          contentTitle={contentTitles.HOUSE_TABLE}
          seeMoreContent={
            (!showAllData &&
              data &&
              Object.keys(data).length > INITIAL_DATA_LENGTH &&
              `${Object.keys(data).length} districts`) ||
            null
          }
          onClickSeeMoreContent={() => setShowAllData(!showAllData)}
        />
      </div>
    </div>
  );
}

DistrictTable.propTypes = {
  data: PropTypes.object,
  candidates: PropTypes.array,
  historyPush: PropTypes.func,
  region: PropTypes.string,
};

DistrictTable.defaultProps = {
  data: {},
  candidates: [],
  historyPush: () => null,
  region: 'WI',
};

export default DistrictTable;

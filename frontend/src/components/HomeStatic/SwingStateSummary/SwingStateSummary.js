import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import Table from '../../Table';
import util from '../../../graphs/util';
import icons from '../../../constants/icons';
import BaseButton from '../../BaseButton';
import GraphFooter from '../../../graphs/GraphFooter';
import { contentTitles } from '../../../modules/modal/constants';
import { stateHash } from '../../../constants/states';

function firstCase(word) {
  if (!word) {
    return '';
  }
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

/**
 * Render table cell content
 * @param {String} header
 * @param {String} data
 */
function renderCellContent(header, data) {
  if (['Trending Topic', 'Top Tactic'].includes(header)) {
    return (
      <div className="polads__political_ads__table_tag">
        {data || 'Loading...'}
      </div>
    );
  }
  if (header.toUpperCase() === 'STATE') {
    return (
      <Link
        to={`/stateData/${stateHash[data]}/overview`}
        className="no-underline"
      >
        {data}
      </Link>
    );
  }

  if (header.toUpperCase().includes('CHANGE')) {
    if (data) {
      const number = Number.parseInt(data.substr(0, data.length - 1), 10);
      const visual = data.substr(1, data.length - 1);
      let icon = null;
      let style = null;
      const iconStyle = {
        marginRight: '4px',
        fontSize: '8px',
      };
      if (number > 0) {
        icon = <span className={icons.arrowUp} style={iconStyle} />;
      } else if (number < 0) {
        icon = <span className={icons.arrowDown} style={iconStyle} />;
        style = { color: '#9A91CD' };
      }
      return (
        <b className="polads__political_ads__table_bold" style={style}>
          {icon}
          {visual}
        </b>
      );
    }
  }

  return (
    <b className="polads__political_ads__table_bold">{data || 'Loading...'}</b>
  );
}

function SwingStateSummary({ data }) {
  const renderTable = () => {
    const headers = Object.keys(data[0]);

    const Headers = () =>
      headers.map((header) => (
        <Table.Cell key={header}>{firstCase(header)}</Table.Cell>
      ));

    /* eslint-disable */
    const Content = () =>
      data.map((data, idx) => (
        <Table.Row key={`row-${idx}`}>
          {headers.map((header, idy) => (
            <Table.Cell key={`header-${idx}-${idy}`}>
              {renderCellContent(header, util.usdFormatter(data[header]))}
            </Table.Cell>
          ))}
        </Table.Row>
      ));
    /* eslint-enable */

    return (
      <div className="polads__political_ads__table_relative_container">
        <div className="polads__political_ads__table_container">
          <div className="polads__graph_header">
            <div className="polads__graph_header__title_container">
              <h3 className="polads__graph_title">
                What&apos;s going on in swing states?
              </h3>
            </div>
            <div className="polads__graph_header__filters_container">
              <div>
                <p>Over the past two weeks</p>
              </div>
            </div>
          </div>
          <Table.Container>
            <Table.Body>
              <Table.Row>
                <Headers />
              </Table.Row>
              <Content />
            </Table.Body>
          </Table.Container>
          <GraphFooter contentTitle={contentTitles.SWING_STATE_TABLE} />
        </div>
      </div>
    );
  };

  return (
    <div className="polads__political_ads__component">
      <div className="polads__container polads__table">{renderTable()}</div>
      <div className="polads__container">
        <div className="polads__political_ads__container">
          <h3 className="political_ads" style={{ marginBottom: '1rem' }}>
            Who&apos;s trying to influence my state?
          </h3>
          <p className="political_ads__content">
            Which PACs, dark money groups and candidates are spending the most
            on Facebook ads in your state?
          </p>
          <p className="political_ads__content">
            Dig in to Facebook ads spending in US Senate, US House,
            gubernatorial and presidential races in your state. Who is spending
            more? What topics are ads focusing on? What objectives do they use
            Facebook ads to achieve?
          </p>
          <BaseButton tag={Link} to="/stateData/GA/overview">
            Explore states
          </BaseButton>
        </div>
      </div>
    </div>
  );
}

SwingStateSummary.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      Spent: PropTypes.number,
      Change: PropTypes.string,
      'Trending Topic': PropTypes.string,
      'Top Tactic': PropTypes.string,
    }),
  ),
  historyPush: PropTypes.func,
};

SwingStateSummary.defaultProps = {
  data: [],
};

export default SwingStateSummary;

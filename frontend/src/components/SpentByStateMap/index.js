import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import ReactHintFactory from 'react-hint';
import 'react-hint/css/index.css';

import GraphHeader from '../../graphs/GraphHeader';
import GraphFooter from '../../graphs/GraphFooter';
import usePrevious from '../../hooks/usePrevious.hooks';
import getPartyColor from '../../utils/partyColors';
import util from '../../graphs/util';
import { stateHash } from '../../constants/states';
import USAMap from './components/USAMap';
import './SpentByStateMap.css';

const ReactHint = ReactHintFactory(React);

const states = Object.values(stateHash);
const getDefaultConfig = (candidate) =>
  states.reduce((acc, cur) => {
    acc[cur] = {
      fill: '#FFFFFF',
      tooltip: {
        spend: 0,
        candidateName: candidate.name || candidate.full_name,
      },
    };
    return acc;
  }, {});

function getPercentFill(highestValue, lowestValue, currentValue, color) {
  if (!highestValue || !currentValue) {
    return '#FFFFFF';
  }
  if (highestValue === currentValue) {
    return color;
  }
  let opacity;
  if (lowestValue === currentValue) {
    opacity = 5;
  } else {
    opacity = Math.round(
      ((Math.log(currentValue) - Math.log(lowestValue)) /
        (Math.log(highestValue) - Math.log(lowestValue))) *
        100,
    );
    opacity = isNaN(opacity) ? 5 : Math.max(opacity, 5); // if non-zero, we want to avoid actually spend showing up as totally white.
  }
  opacity = opacity < 10 ? `0${opacity}` : opacity;
  opacity = opacity === 100 ? '' : opacity;
  return `${color}${opacity}`;
}

function statesCustomConfig(data, color, candidate) {
  const config = getDefaultConfig(candidate);
  if (data && data.states) {
    data.states.forEach((state) => {
      const stateName = stateHash[state.key];
      if (!stateName) return;
      config[stateName].fill = getPercentFill(
        data.highestSpent,
        data.lowestSpent,
        state.value,
        color,
      );
      config[stateHash[state.key]].tooltip = {
        spend: state.value,
        candidateName: candidate.name || candidate.full_name,
      };
    });
  }

  return config;
}

function SpentByStateMap({ candidate, data, id, showFooter, title }) {
  const [color, setColor] = useState(getPartyColor());
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const [maxValue, setMaxValue] = useState(0);
  const [minValue, setMinValue] = useState(0);
  const [statesConfig, setStatesConfig] = useState({});
  const containerEl = useRef(null);

  useEffect(() => {
    if (candidate && candidate.party) {
      setColor(getPartyColor(candidate.party));
    }
  }, [candidate, candidate.party]);

  useEffect(() => {
    setStatesConfig(statesCustomConfig(data, color, candidate));
    setMaxValue(data.highestSpent);
    setMinValue(data.lowestSpent);
  }, [data, candidate, color]);

  useEffect(() => {
    if (!containerEl.current) return;
    const handleResize = () => {
      const width = Math.min(containerEl.current.offsetWidth, 700);
      setMapDimensions({
        width,
        height: width * (593 / 959), // This is the height over width of the USAMap svg
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const renderTooltip = (target) => {
    const title = target.dataset[`${id}Title`];
    const stateData = target.dataset[`${id}StateData`];
    const { candidateName, spend } = JSON.parse(stateData);
    return (
      <div className="custom-hint__content">
        <div className="tooltip-content-wrapper">
          <div className="tooltip-title">
            <b>{candidateName}</b>
            <p>{title}</p>
          </div>
          <div className="tooltip-spend" style={{ color }}>
            {util.usdTruncateNumberFormatter(spend)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="polads__graph_component">
      <GraphHeader title={title} />
      <div className="map-graph__container" ref={containerEl}>
        <USAMap
          customize={statesConfig}
          title="Spendings by state"
          id={id}
          {...mapDimensions}
        />
        <div className="mapLegend">
          <div>0</div>
          <div
            className="gradientColor"
            style={{
              background: `linear-gradient(270deg, ${color} 0%, #FFFFFF 100%)`,
            }}
          />
          <div>{util.usdTruncateNumberFormatter(maxValue)}</div>
        </div>
        <div>Spent per 1M population</div>
        {showFooter && (
          <GraphFooter>
            <p className="map__source">
              Source: Facebook Ad Library. Total spent on Facebook ads since
              July 1, 2020. State populations via 2019 U.S. Census estimates.
            </p>
          </GraphFooter>
        )}
      </div>
      <ReactHint
        autoPosition
        events
        onRenderContent={renderTooltip}
        attribute={`data-${id}`}
      />
    </div>
  );
}

SpentByStateMap.propTypes = {
  candidate: PropTypes.shape({
    party: PropTypes.string,
  }),
  data: PropTypes.shape({
    states: PropTypes.arrayOf({
      key: PropTypes.string,
      value: PropTypes.number,
    }),
    highestSpent: PropTypes.number,
    lowestSpent: PropTypes.number,
  }),
  id: PropTypes.string,
  showFooter: PropTypes.bool,
  title: PropTypes.string,
};

SpentByStateMap.defaultProps = {
  candidate: {},
  data: {
    states: [],
    highestSpent: 0,
    lowestSpent: 0,
  },
  id: 'map',
  showFooter: true,
  title: 'Where are the ads shown?',
};

export default SpentByStateMap;

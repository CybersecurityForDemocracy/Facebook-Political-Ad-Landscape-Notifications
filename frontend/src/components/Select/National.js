import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import { capitalize } from './shared';

const action = {
  select: (route) => (dispatch) => {
    dispatch(push(`/nationalData/${route}`));
  },
};

const matchKey = (path) => {
  // we are keeping desired path in the url already
  // so i did not feel the need to pollute state
  // with dublicate var, since it is only needed when
  // user access specific link deliverately
  // probably should be refactored to extract "nationalData" out
  const match = path.match(/\/nationalData\/(.*)/);
  if (match) return match[1];

  return null;
};

const mapStateToProps = ({
  router: {
    location: { pathname },
  },
}) => ({
  selected: { key: matchKey(pathname) },
});

const Select = ({ selected, select }) => {
  const fakeSelect = useRef({});
  return (
    <>
      <div>
        <select
          className="custom-select"
          style={{ width: fakeSelect.current.clientWidth }}
          value={selected.key}
          onChange={(e) => select(e.target.value)}
        >
          <option value="overview" className="optionClass">
            Overview
          </option>
          <option value="presidential" className="optionClass">
            Presidential
          </option>
        </select>
      </div>
      <div style={{ position: 'absolute', top: -1000, left: -1000 }}>
        <select
          ref={fakeSelect}
          className="fake-select"
          value={selected.key}
          style={{ visibility: 'hidden' }}
        >
          <option value={selected.key}>{capitalize(selected.key)}</option>
        </select>
      </div>
    </>
  );
};

export default connect(mapStateToProps, (dispatch) =>
  bindActionCreators(action, dispatch),
)(Select);

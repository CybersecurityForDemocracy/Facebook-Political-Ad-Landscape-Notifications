import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import graphsReducer from './graphs/reducers';
import selectReducer from './select';
import topics from './topics/reducers';
import candidates from './candidates/reducers';
import district from './district/reducers';
import senate from './senate/reducers';
import governor from './governor/reducers';
import notifications from './notifications/reducer';
// we will connect our reducers here

export default (history) =>
  combineReducers({
    router: connectRouter(history),
    graphs: graphsReducer,
    selectState: selectReducer,
    // overview
    topics,
    candidates,
    district,
    senate,
    governor,
    notifications,
  });

import React from 'react';
import Helmet from 'react-helmet';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import configureStore, { history } from './store';
import App from './main/App';
import favicon from './assets/images/favicon.ico';
import { QueryParamProvider } from 'use-query-params';
import { Route } from 'react-router-dom';

const initialState = {};

const store = configureStore(initialState);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
    <QueryParamProvider ReactRouterRoute={Route}>
      <div>
        <Helmet>
          <link rel="icon" href={favicon} />
        </Helmet>
        <App />
      </div>
    </QueryParamProvider>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
);

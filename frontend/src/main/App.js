import React, { useState, useEffect } from 'react';
import Alert from 'react-bootstrap/Alert'
import { Route, Switch, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';

import '../styles/App.css';
import '../styles/index.css';
import '../styles/graphs.css';
import '../assets/style.css';
import NavigationMenu from '../components/Navigation';
import Footer from '../components/Footer';

import routes from './routes';
import {
  getAllCandidates,
  getAllRaces,
  selectRaceFromNav,
  onRefreshSelectCountryAndRace,
} from '../modules/select';
import ScrollToTop from '../components/ScrollToTop';

import * as NotificationActions from '../modules/notifications/actions';

const renderRoutes = () => {
  const renderRoute = (routerProps, Component, props) => {
    if (Component) {
      const componentProps = {
        ...routerProps,
        ...props,
      };
      return <Component {...componentProps} />; // eslint-disable-line
    }
    return null;
  };

  return routes.map((route) => (
    <Route
      key={route.name}
      exact={route.exact}
      path={route.path}
      render={(routerProps) =>
        renderRoute(routerProps, route.component, route.props)
      }
    />
  ));
};

const Router = () => <Switch>{renderRoutes()}</Switch>;

/**
 * Gets senate/district race
 * @param {string} pathname - path url
 * @returns {string} senate or district race id
 */
function getSenateDistrictRace(pathname) {
  const districtSenateRaceRegex = new RegExp('S1$|S2$|[0-9]{2}$');
  if (districtSenateRaceRegex.test(pathname)) {
    return pathname.substr(pathname.length - 4);
  }
  return null;
}

const App = ({
  getAllCandidatesAction,
  getAllRacesAction,
  selectRaceFromNavAction,
  location: { pathname },
  match: {
    params: { state },
    url,
  },
  onRefreshSelectCountryAndRaceAction,
}) => {
  const dispatch = useDispatch();
  const [navMobile, setNavMobile] = useState(false);
  const [showArchiveSiteAlert, setShowArchiveSiteAlert] = useState(true);

  useEffect(() => {
    dispatch(NotificationActions.getAccessToken());
  }, [dispatch]);

  useEffect(() => {
    async function init() {
      const raceId = getSenateDistrictRace(pathname);
      await getAllRacesAction();
      if (raceId) {
        const isStateElections = pathname.indexOf('stateElectionsData') > -1;
        onRefreshSelectCountryAndRaceAction(
          raceId,
          isStateElections ? 'stateElectionsData' : 'stateData',
        );
      } else {
        getAllCandidatesAction();
      }
    }

    init();
  }, [
    getAllCandidatesAction,
    onRefreshSelectCountryAndRaceAction,
    getAllRacesAction,
    pathname,
  ]);

  return (
    <>
    <Alert variant="primary" show={showArchiveSiteAlert} onClose={() => setShowArchiveSiteAlert(false)} dismissible>
      <p>
        We will soon replace this site with a static archive of Facebook ad data during the 2020 US election. The static archive will not be updated with current data.
      </p>
      <p>
        New signups for notifications are currently paused. We will be updating the site in early 2021 to monitor ongoing Facebook political advertising.
      </p>
      <p>
        Please <Alert.Link href="http://eepurl.com/hih3X5">subscribe to our newsletter</Alert.Link> to stay informed about this site and project.
      </p>
    </Alert>
    <div
      style={{
        overflow: navMobile ? 'hidden' : 'initial',
        height: navMobile ? '500px' : 'auto',
      }}
    >
      <ScrollToTop />
      <NavigationMenu
        selectRaceFromNav={selectRaceFromNavAction}
        navMobile={navMobile}
        setNavMobile={setNavMobile}
      />
      <Router />
      <Footer />
    </div>
    </>
  );
};

const mainAction = {
  getAllCandidatesAction: getAllCandidates,
  getAllRacesAction: getAllRaces,
  selectRaceFromNavAction: selectRaceFromNav,
  onRefreshSelectCountryAndRaceAction: onRefreshSelectCountryAndRace,
};

App.propTypes = {
  getAllCandidatesAction: PropTypes.func.isRequired,
  getAllRacesAction: PropTypes.func.isRequired,
  selectRaceFromNavAction: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  onRefreshSelectCountryAndRaceAction: PropTypes.func.isRequired,
};

export default connect(undefined, (dispatch) =>
  bindActionCreators(mainAction, dispatch),
)(withRouter(App));

import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

class ScrollToTop extends React.Component {
  componentDidUpdate({ location: prevLocation }) {
    const { location } = this.props;
    if (location !== prevLocation) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return null;
  }
}

ScrollToTop.propTypes = {
  location: PropTypes.object,
};

ScrollToTop.defaultProps = {
  location: {},
};

export default withRouter(ScrollToTop);

import React from 'react';
import PropTypes from 'prop-types';
import { content } from '../modules/modal/constants';

function GraphFooter({
  children,
  seeMoreContent,
  onClickSeeMoreContent,
  contentTitle,
}) {
  return (
    <div className="polads__graph_footer">
      {seeMoreContent && (
        <button
          type="button"
          className="read-more"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            margin: '0 auto',
            top: 0,
          }}
          onClick={onClickSeeMoreContent}
        >
          See all&nbsp;
          {seeMoreContent}
        </button>
      )}
      {!seeMoreContent && contentTitle && (
        <p>{content[contentTitle].content}</p>
      )}
      {children}
    </div>
  );
}

GraphFooter.propTypes = {
  children: PropTypes.any, // eslint-disable-line
  seeMoreContent: PropTypes.string,
  onClickSeeMoreContent: PropTypes.func,
  onClickReadMore: PropTypes.func,
  contentTitle: PropTypes.string,
};

GraphFooter.defaultProps = {
  children: null,
  seeMoreContent: null,
  onClickSeeMoreContent: () => null,
  contentTitle: '',
};

export default GraphFooter;

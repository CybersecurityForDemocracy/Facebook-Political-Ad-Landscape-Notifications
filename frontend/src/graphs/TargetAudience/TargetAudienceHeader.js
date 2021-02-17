import React from 'react';
import PropTypes from 'prop-types';

import GraphHeader from '../GraphHeader';
import listToSentence from '../../utils/listToSentence';

function TargetAudienceHeader({ onModalOpen, sponsors }) {
  const title = `Who ${sponsors.length > 1 ? 'do' : 'does'} ${listToSentence(
    sponsors,
  )} target with their ads?`;

  const handleClick = (e) => {
    if (onModalOpen) {
      e.preventDefault();
      onModalOpen();
    }
  };

  return (
    <GraphHeader
      title={title}
      subtitle={
        <>
          <p>
            Campaigns instruct Facebook to show their ads to interest groups
            like people likely to engage with political content (liberal),
            demographic groups like married women in Maine or even to individual
            voters, specified by name.
          </p>
          <p>
            Facebook refuses to publish this targeting information in its
            transparency tools, but discloses it piecemeal to the users who are
            shown ads. The data shown in the tables below has been provided by
            volunteers who install the{' '}
            <a
              href="https://adobserver.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ad Observer plug-in
            </a>{' '}
            tool, so researchers and journalists can do deeper reporting on
            political ads. Please{' '}
            <a
              href="https://adobserver.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              install the tool
            </a>{' '}
            to help us understand microtargeting!
          </p>
          <p>
            <a href="#" onClick={handleClick}>
              Learn more
            </a>
          </p>
        </>
      }
    />
  );
}

TargetAudienceHeader.propTypes = {
  onModalOpen: PropTypes.func,
  sponsors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

TargetAudienceHeader.defaultProps = {
  onModalOpen: null,
};

export default TargetAudienceHeader;

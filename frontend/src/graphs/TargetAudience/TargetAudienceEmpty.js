import React from 'react';
import PropTypes from 'prop-types';

function TargetAudienceEmpty({ isMultiple }) {
  return (
    <div class="target-audience--empty">
      <h3 style={{ fontSize: '24px' }}>
        Uh oh! We don't have <span style={{ fontStyle: 'italic' }}>any</span>{' '}
        data about this {isMultiple ? 'race' : 'sponsor'}.
      </h3>
      <p>
        Can you help us out? If you see ads from{' '}
        {isMultiple ? 'candidates in this race' : 'this sponsor'}, install{' '}
        <a href="https://www.adobserver.org">Ad Observer</a> to share with us
        the ads — and how they were targeted.
      </p>
    </div>
  );
}

TargetAudienceEmpty.propTypes = {
  isMultiple: PropTypes.bool.isRequired,
};

export default TargetAudienceEmpty;

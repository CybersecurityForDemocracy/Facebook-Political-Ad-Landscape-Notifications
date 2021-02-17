import React from 'react';
import { contentTitles, content } from '../../modules/modal/constants';

function TargetAudienceFooter() {
  return (
    <footer className="polads__graph_footer" style={{ padding: '1rem 1.5rem' }}>
      {content[contentTitles.TOP_TARGET_AUDIENCE].content}
    </footer>
  );
}

export default TargetAudienceFooter;

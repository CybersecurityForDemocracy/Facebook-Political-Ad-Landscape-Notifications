import React, { useState } from 'react';
import PropTypes from 'prop-types';

import TargetAudienceEmpty from './TargetAudienceEmpty';
import TargetAudienceFooter from './TargetAudienceFooter';
import TargetAudienceHeader from './TargetAudienceHeader';
import TargetAudienceModal from './TargetAudienceModal';
import TargetAudienceTable from '../../components/TargetAudienceTable';

function TargetAudience({ countOfTargetingMethods }) {
  const [isModalOpen, setModalOpen] = useState(false);

  const sponsors = countOfTargetingMethods.map((item) => item.page_name);
  const isAllDataEmpty = countOfTargetingMethods.every(
    (candidate) => !candidate.targeting || !candidate.targeting.length,
  );
  const isMultiple = countOfTargetingMethods.length > 1;

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <div className="target_audience__wrapper polads__graph_component">
      <TargetAudienceHeader sponsors={sponsors} onModalOpen={handleModalOpen} />
      <div className="target_audience__tables">
        {isAllDataEmpty ? (
          <TargetAudienceEmpty isMultiple={isMultiple} />
        ) : (
          countOfTargetingMethods.map((candidateTargetingMethods) => (
            <TargetAudienceTable
              data={candidateTargetingMethods}
              key={candidateTargetingMethods.page_name}
              tableTitle={
                isMultiple ? candidateTargetingMethods.page_name : null
              }
            />
          ))
        )}
      </div>
      <TargetAudienceFooter isMultiple={isMultiple} />
      {isModalOpen && <TargetAudienceModal onClose={handleModalClose} />}
    </div>
  );
}

TargetAudience.propTypes = {
  countOfTargetingMethods: PropTypes.arrayOf({
    targeting: PropTypes.array,
    page_name: PropTypes.string,
  }),
};

TargetAudience.defaultProps = {
  countOfTargetingMethods: [
    {
      targeting: [{}],
      page_name: '',
    },
  ],
};

export default TargetAudience;

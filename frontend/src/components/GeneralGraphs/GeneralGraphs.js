import React from 'react';
import PropTypes from 'prop-types';

import TotalSpentGraph from '../TotalSpentGraph';
import SpentByTopicGraph from '../SpentByTopicGraph';
import SpentOverTimeGraph from '../SpentOverTimeGraph';
import SpentByTacticGraph from '../SpentByTacticGraph';
import TargetAudienceTable from '../TargetAudienceTable';

function GeneralGraphs({
  presidentData,
  spentByTacticData,
  spentOverTimeData,
  spentByTopicData1,
  topTargetAudienceData,
}) {
  return (
    <>
      <div className="polads__general_graphs__container">
        <div className="polads__general_graphs__graph">
          <TotalSpentGraph
            data={presidentData}
            showTitle={false}
            downloadCSVInline={false}
          />
        </div>
        <div className="polads__general_graphs__graph">
          <SpentByTacticGraph
            data={spentByTacticData}
            downloadCSVInline={false}
          />
        </div>
        <div className="polads__general_graphs__graph">
          <SpentOverTimeGraph
            data={spentOverTimeData}
            downloadCSVInline={false}
          />
        </div>
        <div className="polads__general_graphs__graph">
          <SpentByTopicGraph
            data={spentByTopicData1}
            downloadCSVInline={false}
          />
        </div>
      </div>
      <div>
        <TargetAudienceTable data={topTargetAudienceData} />
      </div>
    </>
  );
}

GeneralGraphs.propTypes = {
  presidentData: PropTypes.arrayOf(PropTypes.shape({})),
  spentByTacticData: PropTypes.arrayOf(PropTypes.shape({})),
  spentOverTimeData: PropTypes.arrayOf(PropTypes.shape({})),
  spentByTopicData1: PropTypes.arrayOf(PropTypes.shape({})),
  topTargetAudienceData: PropTypes.shape({}),
};

GeneralGraphs.defaultProps = {
  presidentData: [],
  spentByTacticData: [],
  spentOverTimeData: [],
  spentByTopicData1: [],
  topTargetAudienceData: [],
};

export default GeneralGraphs;

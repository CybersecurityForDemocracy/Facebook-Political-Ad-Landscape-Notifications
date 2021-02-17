import React from 'react';
import PropTypes from 'prop-types';

import colors from '../../styles/graphs';
import SpentByTacticGraph from '../../components/SpentByTacticGraph';
import SpentOverTimeGraph from '../../components/SpentOverTimeGraph';
import SpentByStateMap from '../../components/SpentByStateMap';
import { contentTitles, content } from '../../modules/modal/constants';
import TargetAudience from '../../graphs/TargetAudience';

function SponsorsCharts({
  spendByTactics,
  spentOverTime,
  spentByTacticOverTime,
  pageName,
  spendOfPageByRegion,
  countOfTargetingMethods,
}) {
  countOfTargetingMethods.page_name = pageName;
  return (
    <div className="polads__general_graphs__container">
      <div className="polads__general_graphs__graph">
        <SpentByTacticGraph
          data={spendByTactics.data || []}
          dataKeys={spendByTactics.keys || []}
          title="What are the ads' objectives?"
          downloadCSVInline={false}
          style={{
            height: 425,
          }}
          candidatesInfo={[]}
          contentTitle={contentTitles.TOP_SPONSORS}
        />
      </div>
      <div className="polads__general_graphs__graph">
        <SpentOverTimeGraph
          spentOverTime={spentOverTime}
          colors={[colors.purple]}
          contentTitle={contentTitles.TOP_SPONSORS}
        />
      </div>
      <div className="polads__general_graphs__graph">
        <SpentOverTimeGraph
          spentOverTime={spentByTacticOverTime}
          colors={[colors.red, colors.pink, colors.purple]}
          title="What topics do the ads focus on?"
          pageName={pageName}
          contentTitle={contentTitles.TOP_SPONSORS}
        />
      </div>

      <div className="polads__general_graphs__graph">
        <SpentByStateMap
          data={spendOfPageByRegion.data}
          candidate={{ name: pageName, party: null }}
        />
      </div>

      <TargetAudience countOfTargetingMethods={[countOfTargetingMethods]} />
    </div>
  );
}

SponsorsCharts.propTypes = {
  spendByTactics: PropTypes.shape({
    data: PropTypes.array,
    keys: PropTypes.array,
  }),
  spentOverTime: PropTypes.shape({
    spend: PropTypes.array,
    keys: PropTypes.array,
    interval: PropTypes.string,
  }),
  spentByTacticOverTime: PropTypes.shape({
    spend: PropTypes.array,
    keys: PropTypes.array,
    interval: PropTypes.string,
  }),
  pageName: PropTypes.string,
  spendOfPageByRegion: PropTypes.shape({
    data: PropTypes.object,
  }),
  countOfTargetingMethods: PropTypes.shape({
    targeting: PropTypes.object,
  }),
};

SponsorsCharts.defaultProps = {
  spendByTactics: {
    data: [],
    keys: [],
  },
  spentOverTime: {
    spend: [],
    keys: [],
    interval: 'week',
  },
  spentByTacticOverTime: {
    spend: [],
    keys: [],
    interval: 'week',
  },
  pageName: null,
  spendOfPageByRegion: {
    data: {},
    highestSpent: 0,
    lowestSpent: 0,
  },
  countOfTargetingMethods: {
    targeting: [],
  },
};

export default SponsorsCharts;

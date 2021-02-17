import { connect } from 'react-redux';

import GeneralGraphs from './GeneralGraphs';

import {
  dummyDataPresident,
  dummyDataTopics,
  dummySpentByTactic,
  dummySpentOverTime,
  dummyDataTargetAudience,
} from '../../constants/dummyData';

const presidentialRaceDummyData = dummyDataPresident;
const spentByTacticDummyData = dummySpentByTactic;
const spentOverTimeDummyData = dummySpentOverTime;
const spentByTopicDummyData1 = dummyDataTopics;
const spentByTopicDummyData2 = [];
const topTargetAudienceDummyData = dummyDataTargetAudience;

const mapStateToProps = (/* state */) => ({
  presidentData: presidentialRaceDummyData,
  spentByTacticData: spentByTacticDummyData,
  spentOverTimeData: spentOverTimeDummyData,
  spentByTopicData1: spentByTopicDummyData1,
  spentByTopicData2: spentByTopicDummyData2,
  topTargetAudienceData: topTargetAudienceDummyData,
});

export default connect(mapStateToProps)(GeneralGraphs);

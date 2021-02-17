import React from 'react';

export const actions = {
  TOGGLE_MODAL: 'TOGGLE_MODAL',
};

export const contentTitles = {
  NATIONAL_OVERVIEW: 'president',
  SPEND_BY_TOPIC_HOUSE_SENATE: 'spendByTopicHouseSenate',
  SPEND_BY_TACTIC_HOUSE_SENATE: 'spendByTacticHouseSenate',
  SPEND_BY_TOPIC_PRES_GOV: 'spendByTopicPresGov',
  SPEND_BY_TOPIC_STATE: 'spendByTopicState',
  SPEND_BY_TOPIC_NATIONAL: 'spendByTopicNational',
  SPEND_BY_TACTIC_PRES_GOV: 'spendByTacticPresGov',
  TOTAL_SPENT_HOUSE_SENATE: 'totalSpentHouseSenate',
  TOTAL_SPENT_GOV: 'totalSpentGov',
  SPEND_OVER_TIME_HOUSE_SENATE: 'spendOverTimeHouseSenate',
  SPEND_OVER_TIME_PRES: 'spendOverTimePres',
  SPEND_OVER_TIME_GOV: 'spendOverTimeGov',
  PRESIDENT: 'president',
  PRESIDENT_STATE: 'presidentState',
  PRESIDENT_HOME_PAGE: 'presidentHomePage',
  TOP_SPONSORS: 'topSponsors',
  TOP_SPONSORS_STATE: 'topSponsorsState',
  TOP_TARGET_AUDIENCE: 'topTargetAudience',
  SWING_STATE_TABLE: 'swingStateTable',
  HOUSE_TABLE: 'houseTable',
};

/*
  Axes of variations:
  House/Senate races need credit for OpenSecrets. Gov/Pres don't.
  State charts need reference to data being only in region; National don't.
*/

export const content = {
  totalSpentHouseSenate: {
    content: (
      <span>
        Source: Facebook Ad Library. Candidate/race information from{' '}
        <a href="https://OpenSecrets.org">OpenSecrets.org</a>
        /Center for Responsive Politics. Total spent on Facebook ads by top two
        candidates since July 1, 2020.
      </span>
    ),
    linkUrl: 'https://www.opensecrets.org/',
  },
  totalSpentGov: {
    content:
      'Source: Facebook Ad Library. Total spent on Facebook ads since July 1, 2020.',
  },
  spendOverTimeHouseSenate: {
    content: (
      <span>
        Source: Facebook Ad Library. Candidate/race information from{' '}
        <a href="https://OpenSecrets.org">OpenSecrets.org</a>
        /Center for Responsive Politics. Spend on political Facebook ads per
        week.
      </span>
    ),
    linkUrl: 'https://www.opensecrets.org/',
  },
  spendOverTimePres: {
    content: (
      <span>
        Source: Facebook Ad Library. Spend on political Facebook ads per week.
        Trump's totals include Donald J. Trump for President, Inc. (campaign)
        and Trump Make America Great Again Committee (joint fundraising
        committee w/ RNC); Biden's totals include Biden for President (campaign)
        and Biden Victory Fund (joint fundraising committee w/ DNC and state
        parties). Learn more about how the campaigns raise and spend money at
        OpenSecrets from the Center for Responsive Politics.
      </span>
    ),
  },
  spendOverTimeGov: {
    content:
      'Source: Facebook Ad Library. Spend on political Facebook ads per week.',
  },
  topSponsors: {
    content:
      'Source: Facebook Ad Library. Total spent on Facebook ads since July 1, 2020.',
  },
  topSponsorsState: {
    content:
      'Source: Facebook Ad Library. Total spent on Facebook ads since July 1, 2020 in state/territory.',
    linkUrl: 'https://www.opensecrets.org/',
  },
  presidentHomePage: {
    content: (
      <span>
        Source: Facebook Ad Library. Total spent on Facebook ads since June 1,
        2020 by presidential candidates' campaigns. Trump's totals include
        Donald J. Trump for President, Inc. (campaign) and Trump Make America
        Great Again Committee (joint fundraising committee w/ RNC); Biden's
        totals include Biden for President (campaign) and Biden Victory Fund
        (joint fundraising committee w/ DNC and state parties). Learn more about
        how the campaigns raise and spend money at{' '}
        <a href="https://OpenSecrets.org">OpenSecrets.org</a> from the Center
        for Responsive Politics.
      </span>
    ),
    linkUrl: 'https://www.opensecrets.org/2020-presidential-race',
  },
  president: {
    content: (
      <span>
        Source: Facebook Ad Library. Total spent on Facebook ads since July 1,
        2020 by presidential candidates' campaigns. Trump's totals include
        Donald J. Trump for President, Inc. (campaign) and Trump Make America
        Great Again Committee (joint fundraising committee w/ RNC); Biden's
        totals include Biden for President (campaign) and Biden Victory Fund
        (joint fundraising committee w/ DNC and state parties). Learn more about
        how the campaigns raise and spend money at{' '}
        <a href="https://OpenSecrets.org">OpenSecrets.org</a> from the Center
        for Responsive Politics.
      </span>
    ),
    linkUrl: 'https://www.opensecrets.org/2020-presidential-race',
  },
  presidentState: {
    content:
      "Source: Facebook Ad Library. Total spent on Facebook ads since July 1, 2020 in state/territory by presidential candidates' campaigns. Trump's totals include Donald J. Trump for President, Inc. (campaign) and Trump Make America Great Again Committee (joint fundraising committee w/ RNC); Biden's totals include Biden for President (campaign) and Biden Victory Fund (joint fundraising committee w/ DNC and state parties).",
    linkUrl: 'https://www.opensecrets.org/2020-presidential-race',
  },
  spendByTopicPresGov: {
    content:
      'Source: Spend estimates by NYU Online Political Transparency Project based on Facebook Ad Library data. Spending for top three recent topics per candidate.  Using machine learning techniques combined with human input, the Ad Observatory classifies ad campaigns by topic. Why don’t numbers add up? A single ad campaign may be classified with multiple topics.',
  },
  spendByTopicState: {
    content:
      'Source: Spend estimates by NYU Online Political Transparency Project based on Facebook Ad Library data. Spending for top five topics in the past month in region.  Using machine learning techniques combined with human input, the Ad Observatory classifies ad campaigns by topic. Why don’t numbers add up? A single ad campaign may be classified with multiple topics.',
  },
  spendByTopicNational: {
    content:
      'Source: Spend estimates by NYU Online Political Transparency Project based on Facebook Ad Library data. Spending for top five topics for all political spenders nationwide in the past month.  Using machine learning techniques combined with human input, the Ad Observatory classifies ad campaigns by topic. Why don’t numbers add up? A single ad campaign may be classified with multiple topics.',
  },
  spendByTopicHouseSenate: {
    content: (
      <span>
        Source: Spend estimates by NYU Online Political Transparency Project
        based on Facebook Ad Library data. Spending for top three recent topics
        per candidate. Candidate/race information from{' '}
        <a href="https://OpenSecrets.org">OpenSecrets.org</a>
        /Center for Responsive Politics. Using machine learning techniques
        combined with human input, ad campaigns are classified by topic. Why
        don’t numbers add up? A single ad campaign may be classified with
        multiple topics.
      </span>
    ),
  },
  spendByTacticPresGov: {
    content:
      'Source: Spend estimates by NYU Online Political Transparency Project based on Facebook Ad Library data. Using machine learning techniques, the Ad Observatory classifies ads by their objective: show up, donate, buy, persuade or connect.  Since July 1, 2020.',
  },
  spendByTacticHouseSenate: {
    content: (
      <span>
        Source: Spend estimates by NYU Online Political Transparency Project
        based on Facebook Ad Library data. Candidate/race information from{' '}
        <a href="https://OpenSecrets.org">OpenSecrets.org</a>
        /Center for Responsive Politics. Using machine learning techniques, the
        Online Ad Observatory classifies ads by their objective: show up,
        donate, buy, persuade or connect. Since July 1, 2020.
      </span>
    ),
  },
  topTargetAudience: {
    content: (
      <>
        Source: targeting data collected from Facebook's "Why am I seeing this?"
        ad transparency feature by volunteer participants in{' '}
        <a href="https://www.adobserver.org">Ad Observer</a> project.{' '}
        <span style={{ fontWeight: 'bold' }}>We need your help!</span> Targeting
        specific audiences is one of the most important tools Facebook provides
        to political advertisers, but Facebook does not disclose this
        information publicly, but only to the specific people shown an ad. The
        Ad Observer plugin automates the process of sharing that data with
        journalists and researchers, including the ones behind this website.
        Please install the <a href="https://www.adobserver.org">Ad Observer</a>{' '}
        plugin for Firefox and Chrome.
      </>
    ),
  },
  swingStateTable: {
    content:
      'Reflects totals over previous two-week period by Facebook ad spenders nationally. Excludes spenders spending <$100. Source: Facebook Ad Library,  NYU Online Political Transparency Project',
  },
  houseTable: {
    content: (
      <span>
        U.S. House races with over $9,000 spent total for all candidates on
        Facebook ads, if the primary is settled, since July 1, 2020. Source:
        Facebook Ad Library, NYU Online Political Transparency Project.
        Candidate/race information from{' '}
        <a href="https://OpenSecrets.org">OpenSecrets.org</a>
        /Center for Responsive Politics.
      </span>
    ),
  },
};

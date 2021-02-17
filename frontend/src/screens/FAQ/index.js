import React, { useState } from 'react';
import '../../styles/screens/FAQScreen.css';

import iconArrowUp from '../../assets/images/faq_icon_arrow_up@2x.png';
import iconArrowDown from '../../assets/images/faq_icon_arrow_down@2x.png';

const listItems = [
  {
    id: '0',
    title: 'The role of Facebook ads in US elections',
    content: () => (
      <p className="faqItemContent">
        Facebook has become one of the major ways that politicians, PACs and
        other political actors attempt to influence US voters. Political
        spending on digital ads is expected to cross the $1 billion threshold in
        the 2020 elections, a new record, and Facebook’s share will be more than
        half,&nbsp;
        <a
          className="faqPurpleContentText"
          href="https://www.emarketer.com/content/digital-political-advertising-to-cross-1-billion-mark-for-2019-2020-cycle"
        >
          according
        </a>
        &nbsp;to one estimate; another&nbsp;
        <a
          className="faqPurpleContentText"
          href="https://www.politico.com/f/?id=00000172-150d-d57a-ad7b-5f2fd9520000"
        >
          estimate
        </a>
        &nbsp;pins the total closer to $2 billion.
      </p>
    ),
    expanded: false,
  },
  {
    id: '1',
    title: 'Why do we need the Facebook Ad Observatory?',
    content: () => (
      <p className="faqItemContent">
        We need better transparency for Facebook political ads. Broadcast
        stations are required by law to disclose political ad buys on TV and
        radio to the public. No similar requirement applies to political ads on
        Facebook, Google, Snapchat, Hulu and other online media. Facebook has
        taken steps by voluntarily disclosing political ad content and data
        through its online&nbsp;
        <a
          className="faqPurpleContentText"
          href="https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&impression_search_field=has_impressions_lifetime"
        >
          Ad Library
        </a>
        . But the library is complicated to use, untold numbers of political ads
        are missing, and a significant element is lacking: how advertisers
        choose which specific demographics and groups of people should see their
        ad — and who shouldn&apos;t.
      </p>
    ),
    expanded: false,
  },
  {
    id: '2',
    title: 'Why the focus on states?',
    content: () => (
      <p className="faqItemContent">
        The Facebook Ad Observatory provides pages to understand races for
        Senate, House and governor and to discover who is targeting ads in your
        state: often special interest groups and industry
        &quot;coalitions&quot;. While the 2020 presidential candidates rely
        heavily on Facebook advertising because it makes it easy to attract
        donations and email-signups, the lower cost of online advertising
        compared to TV is particularly appealing for candidates running
        campaigns in a particular state.
      </p>
    ),
    expanded: false,
  },
  {
    id: '3',
    title: 'How does the Facebook Ad Observatory collect data on Facebook ads?',
    content: () => (
      <p className="faqItemContent">
        The Ad Observatory includes information from the Ad Observer project and
        combines it with information from the Facebook Library API. The Ad
        Observer project is a&nbsp;
        <a className="faqItemContent" href="https://adobserver.org/">
          browser plugin
        </a>
        &nbsp;installed by volunteers that lets them automatically share data
        about the Facebook ads that they&apos;re shown (and how those ads are
        targeted) with us. No personal information from volunteers is collected.
      </p>
    ),
    expanded: false,
  },
  {
    id: '4',
    title:
      'What will I find on the Facebook Ad Observatory that’s different from the Facebook Ad Library?',
    content: () => (
      <p className="faqItemContent">
        Because there are often large numbers of minor variations on a single
        Facebook political ad, NYU researchers group ads into “ad campaigns,” or
        groups of ads that are nearly identical, for ease of analysis by
        journalists and researchers. Using a combination of machine learning
        techniques and human input, the NYU team classifies these ads by topic,
        making it possible to search for ads that cover subjections such as
        “civil rights” or “pandemic.” In addition, the NYU team classifies ads
        by ad objective–is the ad being used to raise money? Motivate? Where
        it’s available from the Ad Observer plugin tool data, the team also
        includes information on how ads are targeted to specific audiences.
      </p>
    ),
    expanded: false,
  },
  {
    id: '5',
    title:
      'Which entities are included in the spending totals for the presidential campaigns?',
    content: () => (
      <>
        <p className="faqItemContent">
          Spending totals for Donald Trump's presidential campaign aggregate
          spending from both Donald J. Trump for President, Inc. (the campaign
          commitee) and Trump Make America Great Again Committee (the joint
          fundraising committee with the RNC); Biden's totals include Biden for
          President (the campaign committee) and Biden Victory Fund (the joint
          fundraising committee with the DNC and state Democratic parties).
        </p>

        <p className="faqItemContent">
          The Trump campaign has numerous separate Facebook pages that it uses
          for ads, including Trump's page, Mike Pence's and ones like Black
          Voices for Trump. Spending from all of these pages is included in the
          Donald Trump total on the Ad Observatory.
        </p>

        <p className="faqItemContent">
          Learn more about how the campaigns raise and spend money at{' '}
          <a href="https://www.opensecrets.org">
            OpenSecrets from the Center for Responsive Politics.
          </a>
        </p>
      </>
    ),
    expanded: false,
  },
  {
    id: '6',
    title: 'How do you estimate spend per day?',
    content: () => (
      <>
        <p>
          Facebook only reports broad ranges for spend of individual ads,
          instead of exact numbers. In order to estimate the spend of particular
          ads, we incorporate multiple sources of data.
        </p>
        <ul>
          <li>
            We collect all ads going as far back in history as possible every
            day from the Facebook Ad Library API. In addition to other details
            about the ad, we record the ad’s start date and if it is currently
            active or not. From this, we are able to determine each ad’s
            effective start and stop date.
          </li>
          <li>
            We also collect Facebook’s Ad Library Report every day, which lists,
            for each page and disclosure string combination, the amount spent by
            that combination over the history of the Ad Library. To get the most
            accurate estimate of how much was spent on a particular day by an
            advertiser, we subtract the amount spent up to the prior day from
            the amount spent up to the day we are estimating spend for.
          </li>
        </ul>
        <p>
          Each day, we distribute the amount spent for the most recent day for
          which we have an Ad Library Report to the ads we know were active on
          that day. We do this by dividing the amount spent by the number of
          active ads proportionally to those ads' reported minimum spends and
          adding that amount to the spend estimate of each of those active ads.
          When we present spend data over time, we estimate the spend per day of
          an ad as the total estimated spend for the ad divided by the number of
          days the ad was active.
        </p>
        <p>
          Sometimes, the lifetime spend reported in the Facebook Ad Library
          Report for an advertiser appears to decrease day over day. We have
          been told by Facebook that this is because spend attributed to ads
          that ran on a given day can take up to five days to settle. Sometimes
          this negative delta is small, but it can be quite large. Also,
          sometimes these negative deltas actually represent an apparent
          correction after an incorrectly reported large increase in spend the
          previous day. To manage these apparently erroneous spikes and dips,
          when we observe a large single-day swing in either direction, and then
          a correction in the other direction on the subsequent day, we smooth
          the spend reported on the day of the correction over the period of the
          spike or dip.
        </p>
      </>
    ),
    expanded: false,
  },
  {
    id: '7',
    title: 'I’m a journalist, and I’d like to download data',
    content: () => (
      <p className="faqItemContent">
        We offer a free data download feature for journalists. The Facebook Ad
        Observatory provides simple downloads of ad data based on search
        criteria, such as all ads in a state on a particular topic. To enable
        this feature, we ask you to register with the site. We will use this
        information primarily to track demand for this information. We will not
        share your name or organizational affiliation. Questions? Contact us.
      </p>
    ),
    expanded: false,
  },
  {
    id: '8',
    title: 'I have questions about using the site and/or what I am seeing',
    content: () => (
      <p className="faqItemContent">
        Please contact the project team at&nbsp;
        <span className="faqPurpleContentText">info@adobservatory.org.</span>
      </p>
    ),
    expanded: false,
  },
];

const toggleExpanded = (itemId, list) =>
  list.map((listItem) => {
    if (listItem.id === itemId) {
      return {
        ...listItem,
        expanded: !listItem.expanded,
      };
    }
    return listItem;
  });

const FAQ = () => {
  const [items, setItems] = useState(listItems);
  return (
    <div className="faqMain">
      <div className="faqConteiner">
        <div className="faqLabel">FAQ</div>
        {items.map(({ id, title, content, expanded }) => (
          <div
            key={id}
            className="faqItemWrapper"
            onClick={() => setItems(toggleExpanded(id, items))}
            onKeyDown={() => {}}
            role="button"
            tabIndex="0"
          >
            <div className="faqItemWrapperTitleAndArrow">
              <div className="faqItemTitle">{title}</div>
              <img
                src={expanded ? iconArrowUp : iconArrowDown}
                alt="expandList"
                className="faqImageArrow"
              />
            </div>
            {expanded ? (
              <div className="faqItemContent">{content()}</div>
            ) : null}
            <div className="faqDivider" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;

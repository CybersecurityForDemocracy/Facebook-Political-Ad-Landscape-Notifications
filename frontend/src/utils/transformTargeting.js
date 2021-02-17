const friendlyAudienceListOwner = (ca_owner_name) => {
  return ca_owner_name ? `on a list uploaded by ${ca_owner_name}` : '';
};

const friendlyCustomAudiencesInfo = (subcategory) => {
  const match_key_friendly_names = {
    email: 'email address',
    phone: 'phone number',
  };
  const subcategory_data = JSON.parse(subcategory);
  let match_keys = null;
  let audience_list_owner = null;
  if (subcategory_data) {
    audience_list_owner = friendlyAudienceListOwner(
      subcategory_data.ca_owner_name,
    );
    if (subcategory_data.match_keys) {
      match_keys = subcategory_data.match_keys
        .filter((match_key) => match_key)
        .map((match_key) => match_key_friendly_names[match_key])
        .join(' and/or ');
    } else {
      match_keys = subcategory_data
        .map((match_key) => match_key_friendly_names[match_key])
        .join(' and/or ');
    }
  }
  return [
    match_keys ? `people specified by ${match_keys}` : '',
    audience_list_owner,
  ]
    .filter((x) => x)
    .join(', ');
};

const friendlyRelationshipStatus = (subcategory) => {
  const relationship_status = {
    4: 'Married',
    0: 'Unspecified',
    5: 'Engaged',
    1: 'Single',
  };
  try {
    const subcategory_data = JSON.parse(subcategory);
    return (
      relationship_status[subcategory_data.relationship_status] || subcategory
    );
  } catch (e) {
    console.log('Unable to parse targeting subcategory');
    return subcategory;
  }
};

/*
    I sing of ads and a person. Who, from Facebook's databases,
    seeking their fate, came to the ad collector's shores.

*/
const friendlifyTargeting = (category, subcategory) => {
  switch (category) {
    case 'CUSTOM_AUDIENCES_DATAFILE':
      return [
        ['List of specific people', friendlyCustomAudiencesInfo(subcategory)],
      ];
    case 'INTERESTS':
      const interests = JSON.parse(subcategory);
      let interests_str = null;
      if (interests.length === 1) {
        interests_str = interests[0].name;
      } else {
        interests_str = `${interests
          .slice(0, interests.length - 1)
          .map((int) => int.name)
          .join(', ')} and/or ${interests[interests.length - 1].name}`;
      }
      return [['Interested in', interests_str]];
    case 'RELATIONSHIP_STATUS':
      return [
        ['Relationship status:', friendlyRelationshipStatus(subcategory)],
      ];
    case 'WORK_EMPLOYERS':
      return [['Employer', subcategory]];
    case 'WORK_JOB_TITLES':
      return [['Job title', subcategory]];
    case 'BCT':
      if (subcategory.match(/Likely engagement with US political content/)) {
        return [
          subcategory
            .match(/(Likely engagement with US political content) \((.*)\)/)
            .slice(1, 3),
        ];
      }
      if (subcategory.match(/Household income/)) {
        return [subcategory.match(/(Household income): (.*) \(/).slice(1, 3)];
      }
      if (
        [
          'African American (US)',
          'Hispanic (US - All)',
          'Asian American (US)',
          'Hispanic (US - Bilingual)',
          'Hispanic (US - English Dominant)',
          'Hispanic (US - Spanish Dominant)',
        ].indexOf(subcategory) > -1
      ) {
        return [['Multicultural affinity', subcategory]];
      }
      return [['Behavior', subcategory]];
    case 'LOCATION':
      let kind;
      try {
        kind = subcategory.match(/\((.*)\)/)[1];
      } catch (TypeError) {
        kind = null;
      }
      const kinds = {
        HOME: 'home is in ',
        CURRENT: 'currently in ',
        null: '',
      };
      return [['Location', kinds[kind] + subcategory.split('(')[0]]];
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_PAGE':
      return [['Online behavior', 'visited a particular Facebook page']];
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_VIDEO':
      return [['Online behavior', 'watched a particular video']];
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_IG':
      return [['Online behavior', 'visited a particular Instagram page']];
    case 'CUSTOM_AUDIENCES_WEBSITE':
      return [['Online behavior', 'visited a particular website']];
    case 'CUSTOM_AUDIENCES_MOBILE_APP':
      return [['Online behavior', 'used a particular app']];
    case 'CUSTOM_AUDIENCES_LOOKALIKE':
      const audience_list_msg = friendlyAudienceListOwner(subcategory);
      return [
        ['Similarity', `resemble people ${audience_list_msg || 'on a list'}`],
      ];
    case 'DYNAMIC_RULE':
      return [['Dynamic rule', subcategory]];
    case 'ED_STATUS':
      const education_statuses = {
        EDU_MASTER_DEGREE: "Master's degree",
        EDU_DOCTORATE_DEGREE: 'Doctorate',
        EDU_COLLEGE_ALUMNUS: 'College degree',
        EDU_PROFESSIONAL_DEGREE: 'Professional degree',
      };
      return [
        ['Education status', education_statuses[subcategory] || subcategory],
      ];
    case 'EDU_SCHOOLS':
      return [['School', subcategory]];
    case 'AGE_GENDER':
      return [
        [
          'Age',
          subcategory
            .split(' ')[0]
            .split('-')
            .map((age) => parseInt(age) + 12)
            .join(' to '),
        ],
        ['Gender', subcategory.split(' ')[1].toLowerCase()],
      ];
    case 'LOCALES':
      return [['Speakers of', subcategory]];
    case 'ACTIONABLE_INSIGHTS':
      return [['Behavior', subcategory]];
    case 'FRIENDS_OF_CONNECTION':
      return [['Your friends like', subcategory]];
    case 'CONNECTION':
      return [['You like', subcategory]];
    default:
      return [];
  }
};

export const VERY_SKETCHY = 1;
export const MILDLY_SKETCHY = 2;
export const NOT_SKETCHY = 3;

const sketchiness = {
  CUSTOM_AUDIENCES_DATAFILE: VERY_SKETCHY,
  INTERESTS: VERY_SKETCHY,
  RELATIONSHIP_STATUS: VERY_SKETCHY,
  WORK_EMPLOYERS: VERY_SKETCHY,
  WORK_JOB_TITLES: VERY_SKETCHY,
  BCT: VERY_SKETCHY,
  LOCATION: MILDLY_SKETCHY,
  CUSTOM_AUDIENCES_ENGAGEMENT_PAGE: MILDLY_SKETCHY,
  CUSTOM_AUDIENCES_ENGAGEMENT_VIDEO: MILDLY_SKETCHY,
  CUSTOM_AUDIENCES_ENGAGEMENT_IG: MILDLY_SKETCHY,
  CUSTOM_AUDIENCES_WEBSITE: MILDLY_SKETCHY,
  CUSTOM_AUDIENCES_MOBILE_APP: MILDLY_SKETCHY,
  CUSTOM_AUDIENCES_LOOKALIKE: MILDLY_SKETCHY,
  DYNAMIC_RULE: MILDLY_SKETCHY,
  ED_STATUS: MILDLY_SKETCHY,
  EDU_SCHOOLS: MILDLY_SKETCHY,
  AGE_GENDER: NOT_SKETCHY,
  LOCALES: NOT_SKETCHY,
  ACTIONABLE_INSIGHTS: NOT_SKETCHY,
  FRIENDS_OF_CONNECTION: NOT_SKETCHY,
  CONNECTION: NOT_SKETCHY,
};

export const transformTargetingLine = (
  acc,
  { category, subcategory, count },
) => {
  return acc.concat(
    friendlifyTargeting(category, subcategory).map(([cat, subcat]) => {
      return {
        category: cat,
        subcategory: subcat,
        count,
        sketchiness: sketchiness[category],
      };
    }),
  );
};

export default transformTargetingLine;

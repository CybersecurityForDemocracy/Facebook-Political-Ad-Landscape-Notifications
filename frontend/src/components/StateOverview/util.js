/* eslint-disable */
/**
 * Segment races in candidates for easier use
 * @param {string[]} races - all races
 * @param {{key: {string}[]}} allCandidates - all candidates
 * @returns {number[][]}
 */
export function segmentCandidatesToRace(races, allCandidates) {
  if (
    races &&
    races.length &&
    allCandidates &&
    Object.keys(allCandidates).length
  ) {
    const segmented = races.reduce(
      (acc, cur) => {
        if (allCandidates[cur] && Array.isArray(allCandidates[cur])) {
          if (cur.includes('G1') || cur.includes('G2')) {
            acc.governor.push(allCandidates[cur].slice(0, 2));
          } else if (cur.includes('S1') || cur.includes('S2')) {
            acc.senate.push(allCandidates[cur].slice(0, 2));
          } else {
            acc.district.push(allCandidates[cur].slice(0, 2));
          }
        }
        return acc;
      },
      {
        governor: [],
        senate: [],
        district: [],
      },
    );
    return segmented;
  }
  return {
    governor: [],
    senate: [],
    district: [],
  };
}
/**
 *
 * @param {{spenders:[], page_id: string}[]} spent
 * @param {number[][]} races
 */
export function matchSpentToRace(spent, races, isDistrict) {
  const raceSpent = [];
  if (Array.isArray(races)) {
    races.forEach((race) => {
      let tempRaceSpent = [];
      race.candidates.forEach((pageID) => {
        const spendings = spent.filter((o) => o.page_id === `${pageID}`);
        if (spendings && spendings.length > 0) {
          tempRaceSpent.push(...spendings[0].spenders);
        } else if (isDistrict) {
          tempRaceSpent.push({});
        }
      });
      if (tempRaceSpent && tempRaceSpent.length) raceSpent.push(tempRaceSpent);
    });
  }

  return raceSpent;
}

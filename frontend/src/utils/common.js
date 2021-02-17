export function getName(candidatesInfo = null, topic) {
  let name = topic.page_name;

  if (candidatesInfo && candidatesInfo.candidates) {
    const info = candidatesInfo.candidates.find((candidate) =>
      candidate && candidate.pages
        ? candidate.pages.find((page) => page.page_name === name)
        : false,
    );

    if (info && info.full_name) name = info.full_name;
  }

  return name;
}

export function addFullName(data, candidatesInfo) {
  for (const key in data) {
    data[key].full_name = getName(candidatesInfo, data[key]);
  }

  return data;
}

export function getNameTactic(candidatesInfo, name) {
  if (candidatesInfo && candidatesInfo.candidates) {
    const info =
      candidatesInfo.candidates &&
      candidatesInfo.candidates.find((candidate) =>
        candidate && candidate.pages
          ? candidate.pages.find((page) => page.page_name === name)
          : false,
      );

    if (info && info.full_name) return info.full_name;
  }

  return name;
}

export function addFullNameTactic(
  list_of_tactic_candidate_spends,
  candidatesInfo,
) {
  // list_of_tactic_candidate_spends e.g. [{"John McCollum for Congress":411.51,"tactic":"Donate","Jim Clyburn":4206.72},{"John McCollum for Congress":113.62,"tactic":"Connect","Jim Clyburn":3793.63},{"John McCollum for Congress":733.24,"tactic":"Persuade"},{"John McCollum for Congress":391.63,"tactic":"Buy"}]
  const updatedData = [];
  return list_of_tactic_candidate_spends.map((tactic_candidates_data) => {
    // updatedData.push(tactic_candidates_data);

    Object.keys(tactic_candidates_data)
      .filter((key) => key !== 'tactic')
      .forEach((candidate_name) => {
        if (candidate_name === 'tactic') return;
        const full_name = getNameTactic(candidatesInfo, candidate_name);
        if (full_name && full_name != candidate_name) {
          tactic_candidates_data[full_name] =
            tactic_candidates_data[candidate_name];
          delete tactic_candidates_data[candidate_name];
        }
      });
    return tactic_candidates_data;
  });
}

export function getDataKeys(keys, candidatesInfo) {
  const updatedKeys = [];

  for (const dataKey of keys) {
    updatedKeys.push(getNameTactic(candidatesInfo, dataKey));
  }

  return updatedKeys;
}

export function addFullNameSenate(
  list_of_candidate_week_spends,
  candidatesInfo,
) {
  const updatedData = [];
  return list_of_candidate_week_spends.map((candidate_week_spend_data) => {
    // updatedData.push(candidate_week_spend_data);

    Object.keys(candidate_week_spend_data)
      .filter((key) => key !== 'week')
      .forEach((candidate_name) => {
        if (candidate_name === 'week') return;
        const full_name = getNameTactic(candidatesInfo, candidate_name);
        if (full_name && full_name != candidate_name) {
          candidate_week_spend_data[full_name] =
            candidate_week_spend_data[candidate_name];
          delete candidate_week_spend_data[candidate_name];
        }
      });
    return candidate_week_spend_data;
  });
}

export function getURISafePageName(page_name) {
  return encodeURI(page_name.replace(/ /g, '__').replace(/%/g, '**'));
}

export function openSponsorPage(page_id, page_name) {
  if (typeof page_id === 'undefined' || typeof page_name === 'undefined') {
    // To debug when pages don't open
    // console.log("Unable to open sponsor page.");
    return;
  }

  window.open(
    `https://www.adobservatory.org/sponsors/${page_id}/${getURISafePageName(
      page_name,
    )}`,
  );
}

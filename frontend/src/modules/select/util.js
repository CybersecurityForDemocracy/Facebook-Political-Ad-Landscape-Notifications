import { stateHash } from '../../constants/states';

const makeTitleOfRaces = (races, country) => {
  const nameWithKey =
    races &&
    races.map((item) => {
      if (item[2] === 'G') {
        return {
          key: item,
          name: 'Governor',
          country,
        };
      }
      if (item[2] === 'S') {
        return {
          key: item,
          name: item === 'GAS2' ? 'US Senate (Special)' : 'US Senate',
          country,
        };
      }
      return {
        key: item,
        name: `District ${item.slice(-2)}`,
        country,
      };
    });
  return nameWithKey;
};

const makeRouteOfRaces = (races, country, baseRoute) => {
  const nameWithKey =
    races &&
    races.map((item) => {
      if (item[2] === 'G') {
        return {
          key: item,
          label: 'Governor',
          country,
          path: `/${baseRoute}/${stateHash[country]}/governor/${item}`,
        };
      }
      if (item[2] === 'S') {
        if (item.slice(-1) === '1') {
          return {
            key: item,
            label: item === 'GAS2' ? 'US Senate (Special)' : 'US Senate',
            country,
            path: `/${baseRoute}/${stateHash[country]}/usSenate/${item}`,
          };
        }
        return {
          key: item,
          label: `US Senate ${item.slice(-1)}`,
          country,
          path: `/${baseRoute}/${stateHash[country]}/usSenate/${item}`,
        };
      }

      if (item.slice(-2) === '01' || item.slice(-2) === '00') {
        return {
          key: item,
          label: 'US House',
          country,
          path: `/${baseRoute}/${stateHash[country]}/usHouse/${item}`,
        };
      }
      return {
        key: item,
        label: `US House ${item.slice(-2)}`,
        country,
        path: `/${baseRoute}/${stateHash[country]}/usHouse/${item}`,
      };
    });
  return nameWithKey;
};

export { makeTitleOfRaces, makeRouteOfRaces };

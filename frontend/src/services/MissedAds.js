import axios from 'axios';
import * as csv from 'csvtojson';

const SOURCE_URL =
  'https://storage.googleapis.com/missed-fbads/missed_ads20201028.csv';

export const fetchData = async () => {
  const { data } = await axios.get(SOURCE_URL);
  const json = await csv().fromString(data);
  return json.sort((a, b) => a.ordering - b.ordering);
};

export default {
  fetchData,
};

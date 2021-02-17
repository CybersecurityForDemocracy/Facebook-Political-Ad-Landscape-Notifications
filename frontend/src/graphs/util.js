import moment from 'moment';
import { formatNumber } from 'accounting';
import { apmonth } from 'journalize';

/**
 * Converts large numeric data to shorthand version
 * @param {String | Number} data - data to format
 */
const truncateNumberFormatter = (data) => {
  if (typeof data === 'number') {
    let value = data.toString();
    if (data >= 1000000000) {
      value = `${formatNumber(data / 1000000000, 1).toString()}B`;
    } else if (data >= 1000000) {
      value = `${formatNumber(data / 1000000, 1).toString()}M`;
    } else if (data >= 1000) {
      value = `${formatNumber(data / 1000, 1).toString()}K`;
    } else {
      value = formatNumber(value);
    }
    return `${value}`;
  }
  return data;
};

const usdTruncateNumberFormatter = (data) => {
  return `$${truncateNumberFormatter(data)}`;
}

const genericNumberFormatter = (data) => {
  if (typeof data === 'number') {
    return formatNumber(data.toString());
  }
  return data;
};

const usdFormatter = (data) => {
  if (typeof data === 'number') {
    return `$${formatNumber(data)}`;
  }
  return data;
};

const nameFormatter = (key) => {
  let value = key;
  if (key === 'Trump') {
    value = 'Donald Trump';
  } else if (key === 'Biden') {
    value = 'Joe Biden';
  }

  return value;
};

const dateFormatter = (dateString) =>
  apmonth(moment(dateString).toDate()) + moment(dateString).format(' DD');

export default {
  truncateNumberFormatter,
  usdTruncateNumberFormatter,
  usdFormatter,
  nameFormatter,
  dateFormatter,
  genericNumberFormatter,
};

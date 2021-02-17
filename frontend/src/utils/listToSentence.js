/**
 * Takes an array of strings and joins them grammatically, respecting the Oxford
 * Comma, i.e. ['A', 'B', 'C'] => 'A, B, and C', while ['A', 'B'] => 'A and B'.
 * @param {Array.<string>} list
 * @return {string}
 */
function listToSentence(list) {
  switch (list.length) {
    case 0:
      return '';
    case 1:
      return list[0];
    case 2:
      return `${list[0]} and ${list[list.length - 1]}`;
    default:
      return [...list.slice(0, -1), `and ${list[list.length - 1]}`].join(', ');
  }
}

export default listToSentence;

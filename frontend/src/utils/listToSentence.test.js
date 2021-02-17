import listToSentence from './listToSentence';

describe('listToSentence', () => {
  test('returns an empty array correctly', () => {
    expect(listToSentence([])).toBe('');
  });
  test('returns a single item correctly', () => {
    expect(listToSentence(['A'])).toBe('A');
  });
  test('returns two items correctly', () => {
    expect(listToSentence(['A', 'B'])).toBe('A and B');
  });
  test('returns more than two items correctly', () => {
    expect(listToSentence(['A', 'B', 'C'])).toBe('A, B, and C');
  });
});

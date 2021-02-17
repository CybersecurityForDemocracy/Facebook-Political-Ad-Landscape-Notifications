const formatNumber = (number) =>
  Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(number);

export default formatNumber;

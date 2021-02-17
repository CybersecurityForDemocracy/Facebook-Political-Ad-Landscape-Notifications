const partyColors = {
  Republican: '#FF646A',
  Democrat: '#397DFF',
  'Green Party': '#91DBA2',
  Libertarian: '#FFC164',
};

function getPartyColor(party) {
  return partyColors[party] || '#836EFB';
}

export default getPartyColor;

const GEOGRAPHY_GLOBE_TROTTER_CASES = Object.freeze([
  {
    id: 'island-lagoon',
    answerCountryId: 'mauritius',
    clues: [
      'Your journey takes you to an island nation in the Indian Ocean, east of Madagascar.',
      'Its capital is Port Louis, a busy harbour city.',
      'Look for the country whose flag has four horizontal stripes: red, blue, yellow, and green.'
    ]
  },
  {
    id: 'mountain-postcard',
    answerCountryId: 'japan',
    clues: [
      'This island country lies in East Asia, across the sea from Korea and China.',
      'Its capital city is Tokyo.',
      'A famous cone-shaped mountain called Mount Fuji is found here.'
    ]
  },
  {
    id: 'river-and-pyramids',
    answerCountryId: 'egypt',
    clues: [
      'This country is in north-east Africa, where Africa meets Asia.',
      'The Nile River flows north through it to the Mediterranean Sea.',
      'Its capital is Cairo, near the ancient pyramids of Giza.'
    ]
  },
  {
    id: 'southern-crossing',
    answerCountryId: 'new-zealand',
    clues: [
      'This country is made up of islands in the south-west Pacific Ocean.',
      'Its capital city is Wellington, on the North Island.',
      'Its flag includes the Southern Cross constellation.'
    ]
  },
  {
    id: 'forest-expedition',
    answerCountryId: 'brazil',
    clues: [
      'This is the largest country in South America.',
      'Portuguese is its official language.',
      'A large part of the Amazon rainforest lies within its borders.'
    ]
  }
]);

function chooseGeographyGlobeTrailCase(random = Math.random, previousCaseId = null) {
  const availableCases = GEOGRAPHY_GLOBE_TROTTER_CASES.filter(item => item.id !== previousCaseId);
  const cases = availableCases.length ? availableCases : GEOGRAPHY_GLOBE_TROTTER_CASES;
  const index = Math.min(cases.length - 1, Math.floor(random() * cases.length));
  return cases[index];
}

function isGeographyGlobeTrailAnswer(trailCase, countryId) {
  return Boolean(trailCase && typeof countryId === 'string' &&
    trailCase.answerCountryId === countryId);
}

window.GeographyGlobeTrail = Object.freeze({
  cases: GEOGRAPHY_GLOBE_TROTTER_CASES,
  chooseCase: chooseGeographyGlobeTrailCase,
  isCorrectAnswer: isGeographyGlobeTrailAnswer
});

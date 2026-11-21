const GEOGRAPHY_GLOBE_TROTTER_CASES = Object.freeze([
  {
    id: 'island-lagoon',
    answerCountryId: 'mauritius',
    sourceName: 'Government of Mauritius',
    sourceUrl: 'https://tourism.govmu.org/Pages/Tourist%20Sector/newoverview.aspx',
    clues: [
      'Your journey takes you to an island nation in the Indian Ocean, east of Madagascar.',
      'Its capital is Port Louis, a busy harbour city.',
      'Look for the country whose flag has four horizontal stripes: red, blue, yellow, and green.'
    ]
  },
  {
    id: 'mountain-postcard',
    answerCountryId: 'japan',
    sourceName: 'Japan National Tourism Organization',
    sourceUrl: 'https://www.japan.travel/en/spot/1308/',
    clues: [
      'This island country lies in East Asia, across the sea from Korea and China.',
      'Its capital city is Tokyo.',
      'A famous cone-shaped mountain called Mount Fuji is found here.'
    ]
  },
  {
    id: 'river-and-pyramids',
    answerCountryId: 'egypt',
    sourceName: 'Experience Egypt',
    sourceUrl: 'https://www.experienceegypt.eg/files/Egypt%20Map-Eng.pdf',
    clues: [
      'This country is in north-east Africa, where Africa meets Asia.',
      'The Nile River flows north through it to the Mediterranean Sea.',
      'Its capital is Cairo, near the ancient pyramids of Giza.'
    ]
  },
  {
    id: 'southern-crossing',
    answerCountryId: 'new-zealand',
    sourceName: 'Encyclopaedia Britannica',
    sourceUrl: 'https://www.britannica.com/place/New-Zealand',
    clues: [
      'This country is made up of islands in the south-west Pacific Ocean.',
      'Its capital city is Wellington, on the North Island.',
      'Its flag includes the Southern Cross constellation.'
    ]
  },
  {
    id: 'forest-expedition',
    answerCountryId: 'brazil',
    sourceName: 'Encyclopaedia Britannica',
    sourceUrl: 'https://www.britannica.com/place/Brazil',
    clues: [
      'This is the largest country in South America.',
      'Portuguese is its official language.',
      'A large part of the Amazon rainforest lies within its borders.'
    ]
  }
  {
    id: 'okavango-waypoint',
    answerCountryId: 'botswana',
    sourceName: 'Government of Botswana',
    sourceUrl: 'https://www.gov.bw/about-our-country?page=1',
    clues: [
      'This landlocked country is in Southern Africa.',
      'Its capital city is Gaborone.',
      'The Okavango Delta spreads across its north-west.'
    ]
  },
  {
    id: 'pacific-island-hopper',
    answerCountryId: 'fiji',
    sourceName: 'Tourism Fiji',
    sourceUrl: 'https://www.fiji.travel/things-to-know/destination-guide/geography',
    clues: [
      'This island country is in the South Pacific Ocean.',
      'Its capital, Suva, sits on the south-east coast of Viti Levu.',
      'Its second-largest island, Vanua Levu, lies north-east of Viti Levu.'
    ]
  },
  {
    id: 'steppe-and-sand',
    answerCountryId: 'mongolia',
    sourceName: 'Australian Government Department of Foreign Affairs and Trade',
    sourceUrl: 'https://www.dfat.gov.au/geo/mongolia/mongolia-country-brief',
    clues: [
      'This large country lies between Russia and China.',
      'Its capital city is Ulaanbaatar.',
      'Its landscapes include grasslands, forests, lakes, and vast sand dunes.'
    ]
  },
  {
    id: 'fjord-postcard',
    answerCountryId: 'norway',
    sourceName: 'Visit Norway',
    sourceUrl: 'https://www.visitnorway.com/things-to-do/nature-attractions/fjords/facts-about-the-fjords/',
    clues: [
      'This country is in northern Europe and is known for its long coastline.',
      'Its capital city is Oslo.',
      'Many of its deep fjords were formed when glaciers retreated.'
    ]
  },
  {
    id: 'desert-to-glacier',
    answerCountryId: 'chile',
    sourceName: 'Chile Travel',
    sourceUrl: 'https://chile.travel/en/good-to-know/about-chile/',
    clues: [
      'This long South American country lies between the Pacific Ocean and the Andes.',
      'Its capital city is Santiago.',
      'Its landscapes stretch from the Atacama Desert in the north to Patagonia in the south.'
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

const SCIENCE_MISSIONS = [
  {
    "id": "orbit-rescue",
    "title": "Orbit Rescue",
    "topic": "Space",
    "icon": "\ud83d\ude80",
    "theme": {
      "border": "hover:border-sky-400",
      "icon": "bg-sky-950 border-sky-700/70",
      "topic": "text-sky-300",
      "title": "group-hover:text-sky-300",
      "arrow": "text-sky-300"
    },
    "description": "Navigate the solar system and help the space crew find their way.",
    "questions": [
      {
        "prompt": "Which object is the star at the centre of our solar system?",
        "choices": [
          "The Moon",
          "The Sun",
          "Earth"
        ],
        "answer": 1,
        "fact": "The Sun is a star. Its gravity keeps the planets in orbit."
      },
      {
        "prompt": "Which planet is our home, third from the Sun?",
        "choices": [
          "Mars",
          "Venus",
          "Earth"
        ],
        "answer": 2,
        "fact": "Earth is the third planet from the Sun and the only world we know has life."
      },
      {
        "prompt": "Which planet is famous for its rusty-red colour?",
        "choices": [
          "Mars",
          "Neptune",
          "Mercury"
        ],
        "answer": 0,
        "fact": "Iron-rich dust gives Mars its red colour, which is why it is called the Red Planet."
      },
      {
        "prompt": "Why does the Moon look bright in our night sky?",
        "choices": [
          "It makes its own light",
          "It reflects sunlight",
          "It is a star"
        ],
        "answer": 1,
        "fact": "The Moon does not make its own light; its surface reflects light from the Sun."
      },
      {
        "prompt": "Which planet is the largest in our solar system?",
        "choices": [
          "Saturn",
          "Jupiter",
          "Earth"
        ],
        "answer": 1,
        "fact": "Jupiter is the largest planet. More than 1,000 Earths could fit inside it."
      },
      {
        "prompt": "Which planet is closest to the Sun?",
        "choices": [
          "Mars",
          "Venus",
          "Mercury"
        ],
        "answer": 2,
        "fact": "Mercury is the closest planet to the Sun and has extreme temperatures."
      },
      {
        "prompt": "Which planet is known for its bright, prominent rings made of ice and rock?",
        "choices": [
          "Saturn",
          "Jupiter",
          "Mars"
        ],
        "answer": 0,
        "fact": "Saturn is famous for its spectacular ring system."
      },
      {
        "prompt": "Which planet is the hottest planet in our solar system?",
        "choices": [
          "Mercury",
          "Venus",
          "Mars"
        ],
        "answer": 1,
        "fact": "Venus has a thick atmosphere of greenhouse gases that trap intense heat."
      },
      {
        "prompt": "Which planet spins on its side almost completely?",
        "choices": [
          "Neptune",
          "Jupiter",
          "Uranus"
        ],
        "answer": 2,
        "fact": "Uranus has an extreme tilt, rotating on its side like a rolling barrel."
      },
      {
        "prompt": "Which planet is known as the windy blue ice giant farthest from the Sun?",
        "choices": [
          "Neptune",
          "Uranus",
          "Saturn"
        ],
        "answer": 0,
        "fact": "Neptune is the eighth and farthest planet, known for vivid blue methane clouds and fast winds."
      },
      {
        "prompt": "What is the name of our home galaxy?",
        "choices": [
          "Andromeda",
          "The Milky Way",
          "The Whirlpool"
        ],
        "answer": 1,
        "fact": "The Milky Way is a spiral galaxy containing billions of stars including our Sun."
      },
      {
        "prompt": "What force keeps the planets orbiting around the Sun?",
        "choices": [
          "Magnetism",
          "Electricity",
          "Gravity"
        ],
        "answer": 2,
        "fact": "Gravity is the invisible pulling force that keeps worlds locked in orbit."
      },
      {
        "prompt": "What do we call a chunk of rock from space that enters Earth's atmosphere and burns up as a streak of light?",
        "choices": [
          "A meteor",
          "A comet",
          "A black hole"
        ],
        "answer": 0,
        "fact": "Meteors, often called shooting stars, are glowing streaks caused by space dust burning in air."
      },
      {
        "prompt": "What do we call a space rock that survives its fiery trip and lands on the ground?",
        "choices": [
          "An asteroid",
          "A meteorite",
          "A planetoid"
        ],
        "answer": 1,
        "fact": "A space rock that reaches Earth's surface without burning away is a meteorite."
      },
      {
        "prompt": "What is a comet mostly made of?",
        "choices": [
          "Solid metal",
          "Pure liquid water",
          "Ice, dust, and rock"
        ],
        "answer": 2,
        "fact": "Comets are often described as dirty snowballs made of ice, dust, and rock."
      },
      {
        "prompt": "What causes the comet's glowing tail to point away from the Sun?",
        "choices": [
          "Solar wind and radiation",
          "Earth's gravity",
          "Lunar tides"
        ],
        "answer": 0,
        "fact": "Sunlight and solar wind blow gas and dust away from the comet, creating its bright tail."
      },
      {
        "prompt": "Where is the main Asteroid Belt located?",
        "choices": [
          "Between Earth and Venus",
          "Between Mars and Jupiter",
          "Beyond Neptune"
        ],
        "answer": 1,
        "fact": "Millions of rocky asteroids orbit in the wide gap between Mars and Jupiter."
      },
      {
        "prompt": "Which dwarf planet was classified as the ninth planet until 2006?",
        "choices": [
          "Ceres",
          "Eris",
          "Pluto"
        ],
        "answer": 2,
        "fact": "Pluto was reclassified as a dwarf planet because it shares its orbit with other Kuiper Belt objects."
      },
      {
        "prompt": "How long does it take Earth to orbit once around the Sun?",
        "choices": [
          "About 365 days (one year)",
          "28 days",
          "24 hours"
        ],
        "answer": 0,
        "fact": "One full revolution around the Sun takes approximately 365.25 days."
      },
      {
        "prompt": "What causes day and night on Earth?",
        "choices": [
          "The Sun turning on and off",
          "Earth spinning on its axis",
          "The Moon blocking sunlight"
        ],
        "answer": 1,
        "fact": "Earth's rotation on its axis every 24 hours creates day for the side facing the Sun and night for the side facing away."
      },
      {
        "prompt": "Why do we experience four different seasons on Earth?",
        "choices": [
          "Ocean currents changing speed",
          "Earth moving closer and farther from the Sun",
          "Earth's tilted axis as it orbits the Sun"
        ],
        "answer": 2,
        "fact": "Earth's 23.5-degree tilt causes sunlight to strike hemispheres at different angles during the year."
      },
      {
        "prompt": "What is the name of Earth's only natural satellite?",
        "choices": [
          "The Moon",
          "Titan",
          "Phobos"
        ],
        "answer": 0,
        "fact": "The Moon is Earth's only natural satellite, orbiting us roughly every 27.3 days."
      },
      {
        "prompt": "What causes high and low ocean tides on Earth?",
        "choices": [
          "Underwater volcanoes",
          "The gravitational pull of the Moon and Sun",
          "Wind blowing across the sea"
        ],
        "answer": 1,
        "fact": "The Moon's gravity pulls on Earth's oceans, creating a tidal bulge."
      },
      {
        "prompt": "What happens during a solar eclipse?",
        "choices": [
          "A comet blocks the Sun",
          "Earth passes between the Sun and Moon",
          "The Moon passes between the Sun and Earth"
        ],
        "answer": 2,
        "fact": "A solar eclipse occurs when the Moon casts its shadow onto Earth by blocking the Sun."
      },
      {
        "prompt": "What happens during a lunar eclipse?",
        "choices": [
          "Earth passes between the Sun and the Moon",
          "The Moon blocks the Sun",
          "The Sun turns red"
        ],
        "answer": 0,
        "fact": "A lunar eclipse happens when Earth blocks sunlight from reaching the Moon."
      },
      {
        "prompt": "Who was the first human to walk on the Moon in 1969?",
        "choices": [
          "Buzz Aldrin",
          "Neil Armstrong",
          "Yuri Gagarin"
        ],
        "answer": 1,
        "fact": "Neil Armstrong took humanity's first steps on the Moon during Apollo 11."
      },
      {
        "prompt": "Who was the first person to travel into space?",
        "choices": [
          "Alan Shepard",
          "John Glenn",
          "Yuri Gagarin"
        ],
        "answer": 2,
        "fact": "Cosmonaut Yuri Gagarin orbited Earth in 1961 aboard Vostok 1."
      },
      {
        "prompt": "What is the name of the orbiting laboratory where astronauts live and work?",
        "choices": [
          "International Space Station (ISS)",
          "Apollo Station",
          "Skynet"
        ],
        "answer": 0,
        "fact": "The International Space Station has hosted continuous human crews since November 2000."
      },
      {
        "prompt": "What famous robotic telescope was launched into space in 1990?",
        "choices": [
          "James Webb",
          "Hubble Space Telescope",
          "Kepler"
        ],
        "answer": 1,
        "fact": "The Hubble Space Telescope has taken hundreds of thousands of breathtaking deep-space pictures."
      },
      {
        "prompt": "Which powerful infrared space telescope was launched on Christmas Day 2021?",
        "choices": [
          "Galileo",
          "Spitzer",
          "James Webb Space Telescope"
        ],
        "answer": 2,
        "fact": "The James Webb Space Telescope uses gold-coated mirrors to observe the earliest stars and distant exoplanets."
      },
      {
        "prompt": "What do astronauts wear to survive outside spacecraft in the vacuum of space?",
        "choices": [
          "A space suit with life support",
          "A scuba suit",
          "Warm winter coats"
        ],
        "answer": 0,
        "fact": "Space suits provide oxygen, pressure, temperature control, and micrometeorite protection."
      },
      {
        "prompt": "Why do astronauts float inside the International Space Station?",
        "choices": [
          "There is zero gravity in space",
          "They are in freefall around Earth (microgravity)",
          "Air vents blow them upward"
        ],
        "answer": 1,
        "fact": "Astronauts float because the station and everything inside it are continuously falling around Earth together."
      },
      {
        "prompt": "What is the Great Red Spot on Jupiter?",
        "choices": [
          "A red desert continent",
          "A massive volcano",
          "A giant swirling storm"
        ],
        "answer": 2,
        "fact": "The Great Red Spot is an enormous anticyclonic storm larger than Earth that has raged for centuries."
      },
      {
        "prompt": "Which planet has the tallest volcano in the solar system, Olympus Mons?",
        "choices": [
          "Mars",
          "Venus",
          "Mercury"
        ],
        "answer": 0,
        "fact": "Olympus Mons on Mars is a shield volcano almost three times the height of Mount Everest."
      },
      {
        "prompt": "What are the two tiny potato-shaped moons of Mars named?",
        "choices": [
          "Io and Europa",
          "Phobos and Deimos",
          "Titan and Enceladus"
        ],
        "answer": 1,
        "fact": "Mars has two small, heavily cratered moons named Phobos and Deimos."
      },
      {
        "prompt": "Which moon of Jupiter is the most volcanically active world in the solar system?",
        "choices": [
          "Callisto",
          "Europa",
          "Io"
        ],
        "answer": 2,
        "fact": "Io has hundreds of active volcanoes powered by intense gravitational tides from Jupiter."
      },
      {
        "prompt": "Which icy moon of Jupiter is believed to hide a deep liquid water ocean beneath its crust?",
        "choices": [
          "Europa",
          "Ganymede",
          "Io"
        ],
        "answer": 0,
        "fact": "Europa's smooth icy shell conceals an ocean with more water than all of Earth's oceans combined."
      },
      {
        "prompt": "Which moon of Saturn is known for having a thick orange nitrogen atmosphere and liquid methane lakes?",
        "choices": [
          "Enceladus",
          "Titan",
          "Mimas"
        ],
        "answer": 1,
        "fact": "Titan is the only moon with a substantial atmosphere and standing lakes on its surface."
      },
      {
        "prompt": "Which small moon of Saturn shoots geysers of water ice into space?",
        "choices": [
          "Rhea",
          "Titan",
          "Enceladus"
        ],
        "answer": 2,
        "fact": "Enceladus vents plumes of water vapor and ice crystals from an underground ocean."
      },
      {
        "prompt": "What is the largest moon in the entire solar system, bigger than the planet Mercury?",
        "choices": [
          "Ganymede",
          "Titan",
          "Earth's Moon"
        ],
        "answer": 0,
        "fact": "Ganymede, a moon of Jupiter, is the largest moon in our solar system."
      },
      {
        "prompt": "What colour does the Sun appear from outer space without our atmosphere?",
        "choices": [
          "Bright Yellow",
          "White",
          "Red"
        ],
        "answer": 1,
        "fact": "The Sun emits all colors of visible light equally, appearing brilliant white from space."
      },
      {
        "prompt": "What layer of the Sun is visible to our eyes as its glowing surface?",
        "choices": [
          "Core",
          "Corona",
          "Photosphere"
        ],
        "answer": 2,
        "fact": "The photosphere is the 5,500\u00b0C outer layer of the Sun that emits sunlight."
      },
      {
        "prompt": "What are the darker, cooler patches on the Sun called?",
        "choices": [
          "Sunspots",
          "Solar flares",
          "Black holes"
        ],
        "answer": 0,
        "fact": "Sunspots are temporary areas with intense magnetic fields that make them cooler than the surrounding surface."
      },
      {
        "prompt": "What do we call a sudden explosion of magnetic energy from the Sun?",
        "choices": [
          "A lunar eclipse",
          "A solar flare",
          "A supernova"
        ],
        "answer": 1,
        "fact": "Solar flares release radiation that can disrupt satellite communications on Earth."
      },
      {
        "prompt": "What causes the colorful Northern and Southern Lights (auroras)?",
        "choices": [
          "Sunlight bouncing off ice clouds",
          "Reflected city lights",
          "Solar particles colliding with Earth's atmosphere"
        ],
        "answer": 2,
        "fact": "Charged particles from solar wind collide with oxygen and nitrogen in the upper atmosphere, glowing bright green and violet."
      },
      {
        "prompt": "What is a group of stars forming a recognizable pattern named after animals or myths?",
        "choices": [
          "A constellation",
          "A solar system",
          "A nebula"
        ],
        "answer": 0,
        "fact": "Constellations like Orion and Ursa Major help astronomers map the night sky."
      },
      {
        "prompt": "Which star is also known as the North Star because it sits directly above Earth's North Pole?",
        "choices": [
          "Sirius",
          "Polaris",
          "Betelgeuse"
        ],
        "answer": 1,
        "fact": "Polaris stays nearly fixed in the northern sky, acting as a navigational compass."
      },
      {
        "prompt": "What is the brightest star in the night sky as seen from Earth?",
        "choices": [
          "Polaris",
          "Vega",
          "Sirius (the Dog Star)"
        ],
        "answer": 2,
        "fact": "Sirius shines brilliantly in the constellation Canis Major."
      },
      {
        "prompt": "What is a cloud of gas and dust in space where new stars are born?",
        "choices": [
          "A nebula",
          "An asteroid",
          "A pulsar"
        ],
        "answer": 0,
        "fact": "Nebulae like the Orion Nebula are stellar nurseries where hydrogen collapses to form stars."
      },
      {
        "prompt": "What is the explosive death of a massive star called?",
        "choices": [
          "A solar flare",
          "A supernova",
          "A black hole"
        ],
        "answer": 1,
        "fact": "A supernova blasts heavy elements into space, outshining an entire galaxy for weeks."
      },
      {
        "prompt": "What is an object with gravity so strong that even light cannot escape it?",
        "choices": [
          "A white dwarf",
          "A neutron star",
          "A black hole"
        ],
        "answer": 2,
        "fact": "Black holes have immense density and gravity that traps all matter and light inside their event horizon."
      },
      {
        "prompt": "What do astronomers call a planet that orbits a star outside our solar system?",
        "choices": [
          "An exoplanet",
          "A rogue asteroid",
          "A dwarf moon"
        ],
        "answer": 0,
        "fact": "Scientists have discovered thousands of exoplanets orbiting distant stars."
      },
      {
        "prompt": "What unit of distance measures how far light travels in one Earth year?",
        "choices": [
          "An astronomical unit",
          "A light-year",
          "A kilometer"
        ],
        "answer": 1,
        "fact": "A light-year equals roughly 9.46 trillion kilometers."
      },
      {
        "prompt": "Approximately how long does sunlight take to travel to Earth?",
        "choices": [
          "Instantaneous",
          "About 8 seconds",
          "About 8 minutes"
        ],
        "answer": 2,
        "fact": "Light travels at 300,000 km per second, reaching Earth in roughly 8 minutes and 20 seconds."
      },
      {
        "prompt": "Which unmanned spacecraft was launched in 1977 and is now the most distant human-made object?",
        "choices": [
          "Voyager 1",
          "Apollo 11",
          "Curiosity"
        ],
        "answer": 0,
        "fact": "Voyager 1 has crossed into interstellar space beyond our Sun's protective bubble."
      },
      {
        "prompt": "What is the name of the golden record carried by the Voyager probes?",
        "choices": [
          "The Earth Disk",
          "The Golden Record",
          "Cosmic Greetings"
        ],
        "answer": 1,
        "fact": "The Golden Record carries sounds, greetings, and music from Earth for any extraterrestrial civilization."
      },
      {
        "prompt": "Which robot rover safely landed on Mars in 2021 carrying the Ingenuity helicopter?",
        "choices": [
          "Spirit",
          "Opportunity",
          "Perseverance"
        ],
        "answer": 2,
        "fact": "NASA's Perseverance rover is collecting rock samples to search for ancient microbial life."
      },
      {
        "prompt": "What was special about the helicopter Ingenuity on Mars?",
        "choices": [
          "First powered controlled flight on another world",
          "First robot to dig for ice",
          "First rover to drive on Mars"
        ],
        "answer": 0,
        "fact": "Ingenuity completed dozens of successful flights in the thin Martian atmosphere."
      },
      {
        "prompt": "Why can sound NOT travel through the vacuum of space?",
        "choices": [
          "Space is too cold for sound waves",
          "There are no air molecules to vibrate",
          "Gravity swallows the sound"
        ],
        "answer": 1,
        "fact": "Sound waves require a physical medium like gas, liquid, or solid to vibrate through."
      },
      {
        "prompt": "What keeps our atmosphere from escaping into space?",
        "choices": [
          "The ozone layer traps it",
          "Clouds act as a lid",
          "Earth's gravity"
        ],
        "answer": 2,
        "fact": "Earth's gravitational pull holds our blanket of air securely around the planet."
      },
      {
        "prompt": "What color are the hottest stars in the universe?",
        "choices": [
          "Blue or white",
          "Red",
          "Yellow"
        ],
        "answer": 0,
        "fact": "Blue stars have surface temperatures over 20,000\u00b0C, while red stars are much cooler."
      },
      {
        "prompt": "What kind of star is our Sun classified as?",
        "choices": [
          "Red supergiant",
          "Yellow dwarf",
          "Blue giant"
        ],
        "answer": 1,
        "fact": "Our Sun is an ordinary main-sequence yellow dwarf star."
      },
      {
        "prompt": "What is the boundary around a black hole beyond which nothing can escape?",
        "choices": [
          "Accretion disk",
          "Corona",
          "Event horizon"
        ],
        "answer": 2,
        "fact": "The event horizon marks the point of no return around a black hole."
      },
      {
        "prompt": "Which planet has the shortest year in the solar system, orbiting the Sun in just 88 days?",
        "choices": [
          "Mercury",
          "Earth",
          "Mars"
        ],
        "answer": 0,
        "fact": "Because it is closest to the Sun, Mercury travels fastest and has the shortest year."
      },
      {
        "prompt": "Which planet takes about 165 Earth years to complete just one orbit around the Sun?",
        "choices": [
          "Saturn",
          "Neptune",
          "Jupiter"
        ],
        "answer": 1,
        "fact": "Neptune travels a huge, distant orbit, completing one revolution every 165 years."
      },
      {
        "prompt": "What is the name of the nearest major spiral galaxy to our Milky Way?",
        "choices": [
          "Sombrero",
          "Triangulum",
          "Andromeda"
        ],
        "answer": 2,
        "fact": "The Andromeda Galaxy is our galactic neighbor, about 2.5 million light-years away."
      },
      {
        "prompt": "What is a pulsar?",
        "choices": [
          "A rapidly spinning neutron star that emits radio pulses",
          "An exploding comet",
          "A glowing ring around Saturn"
        ],
        "answer": 0,
        "fact": "Pulsars spin hundreds of times per second, flashing beams of radiation like cosmic lighthouses."
      },
      {
        "prompt": "Why is Venus hotter than Mercury, even though Mercury is closer to the Sun?",
        "choices": [
          "Venus has more active volcanoes",
          "Venus has a runaway greenhouse effect",
          "Mercury is made of ice"
        ],
        "answer": 1,
        "fact": "Venus's dense carbon dioxide atmosphere traps so much heat that surface temperatures reach 465\u00b0C."
      },
      {
        "prompt": "What gives Neptune and Uranus their lovely cyan and blue colors?",
        "choices": [
          "Blue sunlight",
          "Vast oceans of liquid water",
          "Methane gas in their atmospheres"
        ],
        "answer": 2,
        "fact": "Methane gas absorbs red light from the Sun and reflects back blue light."
      },
      {
        "prompt": "What is the imaginary line around the middle of Earth called?",
        "choices": [
          "The Equator",
          "The Prime Meridian",
          "The Tropic of Cancer"
        ],
        "answer": 0,
        "fact": "The Equator divides Earth into Northern and Southern Hemispheres."
      },
      {
        "prompt": "What shape are planetary orbits around the Sun?",
        "choices": [
          "Perfect squares",
          "Ellipses (slightly stretched circles)",
          "Exact perfect circles"
        ],
        "answer": 1,
        "fact": "Johannes Kepler discovered that planetary orbits are ellipses with the Sun at one focus."
      },
      {
        "prompt": "What is the zone around a star where temperatures allow liquid water on a planet's surface?",
        "choices": [
          "The solar wind zone",
          "The asteroid belt",
          "The habitable zone (Goldilocks zone)"
        ],
        "answer": 2,
        "fact": "The Goldilocks zone is neither too hot nor too cold for liquid water to exist."
      },
      {
        "prompt": "What protects Earth from dangerous solar radiation and cosmic rays?",
        "choices": [
          "Earth's magnetic field and atmosphere",
          "The Moon",
          "Saturn's rings"
        ],
        "answer": 0,
        "fact": "Earth's molten iron core generates a magnetic shield called the magnetosphere."
      },
      {
        "prompt": "What causes the Moon to have phases such as crescent, quarter, and full?",
        "choices": [
          "Clouds passing across the Moon",
          "Changing angles of sunlight reflected as the Moon orbits Earth",
          "Earth casting a shadow on the Moon every night"
        ],
        "answer": 1,
        "fact": "As the Moon orbits Earth, we see differing amounts of its sunlit side."
      },
      {
        "prompt": "How many humans have walked on the Moon in total?",
        "choices": [
          "24 astronauts",
          "2 astronauts",
          "12 astronauts"
        ],
        "answer": 2,
        "fact": "Between 1969 and 1972, twelve Apollo astronauts walked on the Moon's surface."
      },
      {
        "prompt": "What are Saturn's rings primarily made of?",
        "choices": [
          "Chunks of water ice and rock",
          "Solid sheets of steel",
          "Glowing cosmic gas"
        ],
        "answer": 0,
        "fact": "Saturn's rings are composed of billions of pieces of water ice ranging from dust specks to house-sized boulders."
      },
      {
        "prompt": "What is the name of the cloud of icy bodies at the outermost edge of our solar system?",
        "choices": [
          "The Asteroid Belt",
          "The Oort Cloud",
          "The Kuiper Ring"
        ],
        "answer": 1,
        "fact": "The spherical Oort Cloud is believed to be the reservoir for long-period comets."
      },
      {
        "prompt": "What was the name of the first artificial satellite launched into space in 1957?",
        "choices": [
          "Telstar",
          "Explorer 1",
          "Sputnik 1"
        ],
        "answer": 2,
        "fact": "The Soviet Union launched Sputnik 1, beginning the Space Age."
      },
      {
        "prompt": "Which planet has the fastest winds recorded in the solar system, reaching over 2,000 km/h?",
        "choices": [
          "Neptune",
          "Jupiter",
          "Venus"
        ],
        "answer": 0,
        "fact": "Neptune experiences supersonic winds that whip storms across the planet."
      },
      {
        "prompt": "What do we call a small solar system body that orbits the Sun and is not a planet or comet?",
        "choices": [
          "A pulsar",
          "An asteroid",
          "A black hole"
        ],
        "answer": 1,
        "fact": "Asteroids are rocky remnants left over from the formation of our solar system."
      },
      {
        "prompt": "Why is the night sky dark even though there are billions of stars?",
        "choices": [
          "Space dust blocks 99% of all starlight",
          "Stars only shine during daytime",
          "The universe has a finite age and light from distant stars hasn't reached us (Olbers' paradox)"
        ],
        "answer": 2,
        "fact": "Because the universe is about 13.8 billion years old, light from the most distant stars has not had enough time to reach us."
      },
      {
        "prompt": "What is the nearest star system to our Sun?",
        "choices": [
          "Alpha Centauri (including Proxima Centauri)",
          "Sirius",
          "Betelgeuse"
        ],
        "answer": 0,
        "fact": "Proxima Centauri is about 4.24 light-years away from Earth."
      },
      {
        "prompt": "What kind of instrument uses lenses or curved mirrors to make distant space objects appear larger?",
        "choices": [
          "A microscope",
          "A telescope",
          "A periscope"
        ],
        "answer": 1,
        "fact": "Telescopes collect light to allow us to observe distant worlds, nebulae, and galaxies."
      },
      {
        "prompt": "What is the name of the space probe that flew past Pluto in 2015, showing high-resolution heart-shaped glaciers?",
        "choices": [
          "Voyager 2",
          "Cassini",
          "New Horizons"
        ],
        "answer": 2,
        "fact": "NASA's New Horizons gave humanity its first close-up look at Pluto and its moon Charon."
      },
      {
        "prompt": "What famous spacecraft orbited Saturn for 13 years before plunging into its atmosphere in 2017?",
        "choices": [
          "Cassini",
          "Galileo",
          "Juno"
        ],
        "answer": 0,
        "fact": "Cassini made revolutionary discoveries about Saturn, its rings, and its moons."
      },
      {
        "prompt": "What spacecraft is currently orbiting Jupiter studying its atmosphere and magnetic fields?",
        "choices": [
          "Cassini",
          "Juno",
          "New Horizons"
        ],
        "answer": 1,
        "fact": "NASA's Juno probe has been sending back stunning photos of Jupiter's cloud belts and polar cyclones."
      },
      {
        "prompt": "What is the temperature in the core of our Sun where nuclear fusion takes place?",
        "choices": [
          "About 50,000 degrees Celsius",
          "About 1,000 degrees Celsius",
          "About 15 million degrees Celsius"
        ],
        "answer": 2,
        "fact": "Nuclear fusion fuses hydrogen into helium in the Sun's blistering 15,000,000\u00b0C core."
      },
      {
        "prompt": "What element makes up most of the mass of Jupiter and Saturn?",
        "choices": [
          "Hydrogen",
          "Iron",
          "Oxygen"
        ],
        "answer": 0,
        "fact": "Gas giants are composed predominantly of hydrogen and helium."
      },
      {
        "prompt": "What do we call the path a celestial object takes around another object in space?",
        "choices": [
          "A trajectory",
          "An orbit",
          "A parallax"
        ],
        "answer": 1,
        "fact": "An orbit is a regular, repeating path that one body takes around another."
      },
      {
        "prompt": "What is the speed of light in a vacuum?",
        "choices": [
          "About 10,000 km per second",
          "About 1,000 km per hour",
          "About 300,000 km per second"
        ],
        "answer": 2,
        "fact": "Light travels at roughly 299,792 kilometers per second in a vacuum."
      },
      {
        "prompt": "Which planet has the most known moons in our solar system?",
        "choices": [
          "Saturn",
          "Mercury",
          "Venus"
        ],
        "answer": 0,
        "fact": "Saturn has over 140 recognized moons, surpassing Jupiter."
      },
      {
        "prompt": "Which two planets in our solar system have zero moons?",
        "choices": [
          "Mars and Venus",
          "Mercury and Venus",
          "Mercury and Mars"
        ],
        "answer": 1,
        "fact": "Mercury and Venus are the only planets in our solar system with no natural moons."
      },
      {
        "prompt": "What is a light curve when astronomers study distant exoplanets?",
        "choices": [
          "The beam of light from a comet",
          "The shape of a rainbow in space",
          "The dip in a star's brightness as a planet passes in front of it"
        ],
        "answer": 2,
        "fact": "The transit method detects exoplanets by measuring the tiny dip in starlight when a planet crosses its star."
      },
      {
        "prompt": "What is the term for a meteor that produces an exceptionally bright fireball in the sky?",
        "choices": [
          "A bolide",
          "A supernova",
          "A pulsar"
        ],
        "answer": 0,
        "fact": "A bolide is an extremely bright meteor that often explodes in the atmosphere."
      },
      {
        "prompt": "What is the name of the belt of icy worlds located just beyond Neptune's orbit?",
        "choices": [
          "The Asteroid Belt",
          "The Kuiper Belt",
          "The Van Allen Belt"
        ],
        "answer": 1,
        "fact": "The Kuiper Belt contains millions of icy remnants including dwarf planets like Pluto and Makemake."
      },
      {
        "prompt": "What protects astronauts from harmful solar ultraviolet and cosmic rays on the ISS?",
        "choices": [
          "Lead foil hats",
          "Tinted sunglasses",
          "Special shielding materials and Earth's magnetosphere"
        ],
        "answer": 2,
        "fact": "The ISS flies within Earth's protective magnetic field and has multi-layered hull shields."
      },
      {
        "prompt": "How many days does the Moon take to rotate once on its axis?",
        "choices": [
          "About 27 days (the same time it takes to orbit Earth)",
          "24 hours",
          "365 days"
        ],
        "answer": 0,
        "fact": "Tidal locking means the Moon rotates at the same rate it orbits, keeping the same face pointing toward Earth."
      },
      {
        "prompt": "What is the dark side of the Moon properly called?",
        "choices": [
          "The black side",
          "The far side of the Moon",
          "The cold side"
        ],
        "answer": 1,
        "fact": "The far side receives just as much sunlight as the near side; it is simply turned away from Earth."
      },
      {
        "prompt": "What is space weather?",
        "choices": [
          "Clouds floating between planets",
          "Rain and snow on Mars",
          "Conditions in space caused by solar wind and solar storms"
        ],
        "answer": 2,
        "fact": "Space weather refers to dynamic conditions created by solar activity that can affect technology on Earth."
      },
      {
        "prompt": "What is the name of the boundary where the Sun's solar wind meets interstellar space?",
        "choices": [
          "The Heliopause",
          "The Event Horizon",
          "The Stratosphere"
        ],
        "answer": 0,
        "fact": "The heliopause marks the outermost edge of our Sun's domain."
      }
    ]
  },
  {
    "id": "habitat-match",
    "title": "Habitat Match",
    "topic": "Animals & habitats",
    "icon": "\ud83e\udd8b",
    "theme": {
      "border": "hover:border-emerald-400",
      "icon": "bg-emerald-950 border-emerald-700/70",
      "topic": "text-emerald-300",
      "title": "group-hover:text-emerald-300",
      "arrow": "text-emerald-300"
    },
    "description": "Meet remarkable animals and discover the places they call home.",
    "questions": [
      {
        "prompt": "Which animal uses gills to take oxygen from water?",
        "choices": [
          "A fish",
          "A rabbit",
          "A butterfly"
        ],
        "answer": 0,
        "fact": "Fish use gills to take oxygen from water as it flows over them."
      },
      {
        "prompt": "Where is a cactus best adapted to grow?",
        "choices": [
          "A rainforest",
          "A desert",
          "The Arctic"
        ],
        "answer": 1,
        "fact": "Cacti store water and have spines instead of leaves, helping them survive in dry deserts."
      },
      {
        "prompt": "A frog begins life as a tadpole. Which animal group does it belong to?",
        "choices": [
          "Reptiles",
          "Amphibians",
          "Birds"
        ],
        "answer": 1,
        "fact": "Frogs are amphibians. They can live in water and on land during different parts of their life."
      },
      {
        "prompt": "Which group does a bat belong to?",
        "choices": [
          "Mammals",
          "Birds",
          "Insects"
        ],
        "answer": 0,
        "fact": "Bats are mammals: they have fur and mothers feed their babies milk."
      },
      {
        "prompt": "Which part of a plant takes in water from the soil?",
        "choices": [
          "Flowers",
          "Roots",
          "Petals"
        ],
        "answer": 1,
        "fact": "Roots anchor a plant and absorb water and minerals from the soil."
      },
      {
        "prompt": "What thick layer of fat keeps whales and seals warm in freezing polar oceans?",
        "choices": [
          "Down feathers",
          "Scales",
          "Blubber"
        ],
        "answer": 2,
        "fact": "Blubber insulates marine mammals against freezing ocean temperatures."
      },
      {
        "prompt": "How do camels store energy to survive long journeys across the desert?",
        "choices": [
          "Storing fat in their humps",
          "Storing water in their ears",
          "Carrying ice under their fur"
        ],
        "answer": 0,
        "fact": "Camel humps store fat, which can be broken down for nutrition when food is scarce."
      },
      {
        "prompt": "Which animal is a marsupial that carries its joey in a pouch?",
        "choices": [
          "A cheetah",
          "A kangaroo",
          "A badger"
        ],
        "answer": 1,
        "fact": "Kangaroos are marsupials; newborn joeys crawl into their mother's pouch to develop."
      },
      {
        "prompt": "What do we call animals that are active mostly during the night?",
        "choices": [
          "Aquatic",
          "Diurnal",
          "Nocturnal"
        ],
        "answer": 2,
        "fact": "Nocturnal animals like owls and bats sleep during the day and hunt at night."
      },
      {
        "prompt": "Why do many Arctic animals like the Arctic fox have white fur in winter?",
        "choices": [
          "Camouflage against snow and ice",
          "To attract prey from far away",
          "To absorb extra sunlight"
        ],
        "answer": 0,
        "fact": "White fur provides camouflage in snowy landscapes and changes to brown in summer."
      },
      {
        "prompt": "Which creature builds complex underwater structures called coral reefs?",
        "choices": [
          "Giant sea turtles",
          "Tiny coral polyps",
          "Dolphin pods"
        ],
        "answer": 1,
        "fact": "Coral polyps secrete calcium carbonate to build rocky reef structures."
      },
      {
        "prompt": "Which bird cannot fly in the air but is an expert swimmer in cold southern oceans?",
        "choices": [
          "An eagle",
          "A seagull",
          "A penguin"
        ],
        "answer": 2,
        "fact": "Penguins use paddle-like flippers to 'fly' gracefully through ocean waters."
      },
      {
        "prompt": "What is the process where some animals enter a deep winter sleep to save energy?",
        "choices": [
          "Hibernation",
          "Migration",
          "Camouflage"
        ],
        "answer": 0,
        "fact": "Hibernation slows down heart rate and body temperature during cold food-scarce months."
      },
      {
        "prompt": "What seasonal journey do birds undertake when flying south for the winter?",
        "choices": [
          "Hibernation",
          "Migration",
          "Metamorphosis"
        ],
        "answer": 1,
        "fact": "Migration is the regular movement of animals between breeding and wintering grounds."
      },
      {
        "prompt": "Which animal group has scales, lays eggs on land, and is cold-blooded?",
        "choices": [
          "Amphibians",
          "Mammals",
          "Reptiles"
        ],
        "answer": 2,
        "fact": "Reptiles such as lizards, snakes, and crocodiles have scaly, waterproof skin."
      },
      {
        "prompt": "What do we call an animal that eats only plants?",
        "choices": [
          "A herbivore",
          "A carnivore",
          "An omnivore"
        ],
        "answer": 0,
        "fact": "Herbivores like cows, deer, and rabbits eat leaves, fruits, and grass."
      },
      {
        "prompt": "What do we call an animal that eats only meat from other animals?",
        "choices": [
          "A herbivore",
          "A carnivore",
          "A producer"
        ],
        "answer": 1,
        "fact": "Carnivores like lions, sharks, and hawks hunt and eat other animals."
      },
      {
        "prompt": "What do we call an animal that eats both plants and meat?",
        "choices": [
          "A decomposer",
          "A herbivore",
          "An omnivore"
        ],
        "answer": 2,
        "fact": "Omnivores like humans, bears, and raccoons eat both plant matter and meat."
      },
      {
        "prompt": "Which animal is the largest living mammal on Earth?",
        "choices": [
          "The blue whale",
          "The African elephant",
          "The colossal squid"
        ],
        "answer": 0,
        "fact": "The blue whale can grow up to 30 meters long and weigh over 150 tonnes."
      },
      {
        "prompt": "Which land animal is the tallest living animal, with a very long neck to reach tree leaves?",
        "choices": [
          "The ostrich",
          "The giraffe",
          "The moose"
        ],
        "answer": 1,
        "fact": "Giraffes use their long necks and prehensile tongues to browse high acacia branches."
      },
      {
        "prompt": "What adaptation allows chameleons to blend into their surroundings or communicate?",
        "choices": [
          "Losing their legs",
          "Growing feathers",
          "Changing skin colour"
        ],
        "answer": 2,
        "fact": "Chameleons adjust special pigment cells in their skin to camouflage and display moods."
      },
      {
        "prompt": "Which organ do land mammals use to breathe oxygen from the air?",
        "choices": [
          "Lungs",
          "Gills",
          "Fins"
        ],
        "answer": 0,
        "fact": "Lungs take in oxygen from the air and expel carbon dioxide."
      },
      {
        "prompt": "How many legs does an insect have?",
        "choices": [
          "8 legs",
          "6 legs",
          "10 legs"
        ],
        "answer": 1,
        "fact": "All adult insects have six jointed legs and three main body parts."
      },
      {
        "prompt": "How many legs does an arachnid, such as a spider, have?",
        "choices": [
          "12 legs",
          "6 legs",
          "8 legs"
        ],
        "answer": 2,
        "fact": "Spiders and other arachnids have eight walking legs and no wings."
      },
      {
        "prompt": "Where do clownfish make their protected homes in tropical coral reefs?",
        "choices": [
          "Inside sea anemone tentacles",
          "Inside giant clam shells",
          "Under floating kelp"
        ],
        "answer": 0,
        "fact": "Clownfish have a special mucus coating that protects them from stinging anemone tentacles."
      },
      {
        "prompt": "What is the natural home or environment of a plant or animal called?",
        "choices": [
          "A solar system",
          "A habitat",
          "A climate zone"
        ],
        "answer": 1,
        "fact": "A habitat provides food, water, shelter, and space for organisms to thrive."
      },
      {
        "prompt": "Which biome receives the most rainfall and has the greatest biodiversity on land?",
        "choices": [
          "Desert",
          "Tundra",
          "Tropical rainforest"
        ],
        "answer": 2,
        "fact": "Rainforests cover just 6% of Earth's land but house over half of all plant and animal species."
      },
      {
        "prompt": "Which treeless, freezing biome is found around the Arctic circle?",
        "choices": [
          "Tundra",
          "Savanna",
          "Temperate forest"
        ],
        "answer": 0,
        "fact": "The tundra has permanently frozen subsoil called permafrost where trees cannot grow."
      },
      {
        "prompt": "What special feature helps ducks stay dry and float easily on ponds?",
        "choices": [
          "Hollow wooden bones",
          "Waterproof feathers coated in natural oil",
          "Suction cup feet"
        ],
        "answer": 1,
        "fact": "Ducks use oil from a gland near their tail to waterproof their feathers."
      },
      {
        "prompt": "Why do owls have such large forward-facing eyes and silent flight?",
        "choices": [
          "To see behind their backs",
          "To scare away wolves",
          "To hunt small prey in the dark without being heard"
        ],
        "answer": 2,
        "fact": "Owls have soft fringed feathers for silent flight and exceptional night vision for hunting."
      },
      {
        "prompt": "Which sea creature has three hearts and blue blood?",
        "choices": [
          "An octopus",
          "A dolphin",
          "A starfish"
        ],
        "answer": 0,
        "fact": "Octopuses have three hearts and copper-based hemocyanin that turns their blood blue."
      },
      {
        "prompt": "What do beavers build across streams using logs, mud, and stones?",
        "choices": [
          "Hives",
          "Dams and lodges",
          "Burrows in sand"
        ],
        "answer": 1,
        "fact": "Beaver dams create deep ponds that protect their family lodges from predators."
      },
      {
        "prompt": "What do giant pandas eat almost exclusively in the bamboo forests of China?",
        "choices": [
          "Eucalyptus leaves",
          "Fish and crabs",
          "Bamboo shoots and leaves"
        ],
        "answer": 2,
        "fact": "Pandas spend up to 12 hours a day munching on tough bamboo stems."
      },
      {
        "prompt": "What tree leaves do Australian koalas eat almost exclusively?",
        "choices": [
          "Eucalyptus leaves",
          "Pine needles",
          "Oak leaves"
        ],
        "answer": 0,
        "fact": "Koalas feed on fibrous eucalyptus leaves, which provide almost all their water and food."
      },
      {
        "prompt": "Which big cat is the fastest land animal, capable of sprinting up to 100 km/h?",
        "choices": [
          "The lion",
          "The cheetah",
          "The leopard"
        ],
        "answer": 1,
        "fact": "Cheetahs have flexible spines, large nostrils, and non-retractable claws for explosive acceleration."
      },
      {
        "prompt": "What allows geckos to run upside down across smooth ceilings?",
        "choices": [
          "Tiny magnetic claws",
          "Sticky glue from their toes",
          "Millions of microscopic hairs on their toe pads (setae)"
        ],
        "answer": 2,
        "fact": "Microscopic hairs use intermolecular van der Waals forces to adhere to smooth surfaces."
      },
      {
        "prompt": "How do bats navigate and locate insects in total pitch darkness?",
        "choices": [
          "Echolocation (bouncing high-pitched sounds)",
          "Super smell",
          "Heat rays from their eyes"
        ],
        "answer": 0,
        "fact": "Bats emit ultrasonic chirps and listen to returning echoes to map their surroundings."
      },
      {
        "prompt": "Which marine mammal communicates using complex underwater clicks and whistles called songs?",
        "choices": [
          "Sea otters",
          "Humpback whales",
          "Manatees"
        ],
        "answer": 1,
        "fact": "Humpback whale songs can travel hundreds of miles through ocean water."
      },
      {
        "prompt": "What hard outer skeleton protects crabs, beetles, and lobsters?",
        "choices": [
          "A shell mantle",
          "An endoskeleton",
          "An exoskeleton"
        ],
        "answer": 2,
        "fact": "Arthropods wear a tough, waterproof exoskeleton made of chitin."
      },
      {
        "prompt": "What must an arthropod do when it outgrows its rigid exoskeleton?",
        "choices": [
          "Molt (shed its old shell)",
          "Change colour",
          "Hibernate"
        ],
        "answer": 0,
        "fact": "Molting allows the animal to grow a new, larger exoskeleton."
      },
      {
        "prompt": "Which mammal lays leathery eggs instead of giving birth to live young?",
        "choices": [
          "The kangaroo",
          "The platypus (and echidna)",
          "The hedgehog"
        ],
        "answer": 1,
        "fact": "Monotremes like the platypus are rare mammals that lay eggs."
      },
      {
        "prompt": "What is the main purpose of a flower's brightly coloured petals and sweet nectar?",
        "choices": [
          "To store extra water",
          "To scare herbivores",
          "To attract pollinating insects and birds"
        ],
        "answer": 2,
        "fact": "Bright petals and fragrant nectar lure bees and butterflies to spread pollen."
      },
      {
        "prompt": "What do worker honeybees collect from flowers to make honey in the hive?",
        "choices": [
          "Nectar",
          "Soil",
          "Sap"
        ],
        "answer": 0,
        "fact": "Honeybees turn flower nectar into rich honey to store food for their colony."
      },
      {
        "prompt": "Which insect undergoes metamorphosis from an egg to a caterpillar, chrysalis, and adult?",
        "choices": [
          "A grasshopper",
          "A butterfly",
          "A dragonfly"
        ],
        "answer": 1,
        "fact": "Butterflies undergo complete four-stage metamorphosis."
      },
      {
        "prompt": "What is the protective casing called that a moth caterpillar spins around itself before turning into an adult?",
        "choices": [
          "A shell",
          "A nest",
          "A cocoon"
        ],
        "answer": 2,
        "fact": "Moth caterpillars spin silk cocoons, while butterflies usually form a hard chrysalis."
      },
      {
        "prompt": "What helps polar bears walk across thin Arctic ice without slipping or breaking through?",
        "choices": [
          "Wide furry paws that distribute their weight",
          "Sharp iron shoes",
          "Webbed front flippers"
        ],
        "answer": 0,
        "fact": "Large paws act like snowshoes and have bumpy pads for traction on slick ice."
      },
      {
        "prompt": "Why do flamingos have pink feathers?",
        "choices": [
          "Their parents paint them",
          "Carotenoid pigments in the algae and brine shrimp they eat",
          "Sunlight bleaching their gray down"
        ],
        "answer": 1,
        "fact": "Dietary pigments from tiny shrimp and algae turn flamingo feathers vibrant pink."
      },
      {
        "prompt": "Which animal uses a long, sticky tongue to catch hundreds of ants inside anthills?",
        "choices": [
          "A meerkat",
          "An armadillo",
          "An anteater"
        ],
        "answer": 2,
        "fact": "Giant anteaters can flick their 60 cm sticky tongues up to 150 times per minute."
      },
      {
        "prompt": "What unique feature allows snakes to swallow prey much larger than their own head?",
        "choices": [
          "Flexible jaw ligaments that unhinge",
          "Sharp teeth that dissolve bones",
          "Hollow expandable throats"
        ],
        "answer": 0,
        "fact": "Snakes have highly flexible skull bones and elastic jaw ligaments."
      },
      {
        "prompt": "What organ allows sharks to detect tiny electrical signals produced by living prey?",
        "choices": [
          "Nasal vents",
          "Ampullae of Lorenzini (electroreceptors)",
          "Lateral barbels"
        ],
        "answer": 1,
        "fact": "Pores filled with conductive gel around a shark's snout sense the weak electric fields of hidden fish."
      },
      {
        "prompt": "Why do zebras live in herds and have dazzling black-and-white stripes?",
        "choices": [
          "To look like cheetahs",
          "To stay warm in the snow",
          "Stripes confuse predators and deter biting flies"
        ],
        "answer": 2,
        "fact": "A herd of moving stripes creates 'motion dazzle' that confuses lions and deters tsetse flies."
      },
      {
        "prompt": "What is the primary food of blue whales?",
        "choices": [
          "Tiny shrimp-like krill",
          "Seals and sea lions",
          "Underwater sea kelp"
        ],
        "answer": 0,
        "fact": "Blue whales filter millions of tiny krill through baleen plates in their mouths every day."
      },
      {
        "prompt": "Which desert animal has large bat-like ears that radiate away body heat?",
        "choices": [
          "The dromedary camel",
          "The fennec fox",
          "The sidewinder snake"
        ],
        "answer": 1,
        "fact": "Fennec foxes have huge ears filled with blood vessels that dissipate excess body heat."
      },
      {
        "prompt": "What do sea turtles return to do on the sandy beaches where they were born?",
        "choices": [
          "Shed their shells",
          "Bask during winter",
          "Lay their eggs in nests"
        ],
        "answer": 2,
        "fact": "Female sea turtles navigate back across oceans to lay eggs on their natal beaches."
      },
      {
        "prompt": "Which African animal lives in underground burrows and has lookouts standing on their hind legs?",
        "choices": [
          "Meerkats",
          "Hyenas",
          "Warthogs"
        ],
        "answer": 0,
        "fact": "Meerkats work as a cooperative mob with sentries guarding against birds of prey."
      },
      {
        "prompt": "How do electric eels defend themselves and stun prey in muddy rivers?",
        "choices": [
          "Shooting venomous darts",
          "Generating electric shocks up to 600 volts",
          "Releasing stinging ink"
        ],
        "answer": 1,
        "fact": "Specialised electric organs generate high-voltage discharges to stun fish and deter caimans."
      },
      {
        "prompt": "What allows poison dart frogs to warn predators that they are extremely toxic?",
        "choices": [
          "Spitting noxious fumes",
          "Loud warning roars",
          "Bright, vivid warning coloration (aposematism)"
        ],
        "answer": 2,
        "fact": "Vibrant skin colours warn predators that eating the frog would be fatal."
      },
      {
        "prompt": "Which animal spends most of its life hanging upside down in the rainforest canopy, moving very slowly?",
        "choices": [
          "The three-toed sloth",
          "The tree squirrel",
          "The howler monkey"
        ],
        "answer": 0,
        "fact": "Sloths have an extremely slow metabolism and algae growing on their fur for canopy camouflage."
      },
      {
        "prompt": "What do fireflies produce light with in their glowing abdomens?",
        "choices": [
          "Tiny mirrors reflecting the Moon",
          "Bioluminescence (a chemical reaction)",
          "Stored electricity"
        ],
        "answer": 1,
        "fact": "Luciferin reacts with oxygen and ATP to produce cold light without wasting heat."
      },
      {
        "prompt": "Which fish can inflate its body into a spiky ball to avoid being swallowed?",
        "choices": [
          "Barracuda",
          "Goldfish",
          "Pufferfish"
        ],
        "answer": 2,
        "fact": "Pufferfish pump water into their stomachs to puff into an intimidating spiky ball."
      },
      {
        "prompt": "Why do earthworms come to the surface of the soil during heavy rain?",
        "choices": [
          "To avoid suffocating in flooded soil burrows",
          "To drink rain droplets",
          "To wash their skin"
        ],
        "answer": 0,
        "fact": "Earthworms breathe through moist skin; flooded soil lacks enough oxygen."
      },
      {
        "prompt": "What adaptation helps wolves communicate across many miles in dense forests?",
        "choices": [
          "Beating their tails on tree trunks",
          "Howling together in choruses",
          "Flashing their eyes"
        ],
        "answer": 1,
        "fact": "Pack howls can be heard miles away, rallying the pack and defining territory boundaries."
      },
      {
        "prompt": "What do sea otters use to crack open tough sea urchin and clam shells?",
        "choices": [
          "Their tail fins",
          "Their sharp tusks",
          "A flat rock balanced on their bellies"
        ],
        "answer": 2,
        "fact": "Sea otters are one of the few mammals that use tools to feed while floating on their backs."
      },
      {
        "prompt": "Which tiny bird can hover in mid-air and fly backwards?",
        "choices": [
          "The hummingbird",
          "The sparrow",
          "The robin"
        ],
        "answer": 0,
        "fact": "Hummingbirds flap their wings up to 80 times per second in a figure-eight motion."
      },
      {
        "prompt": "What is the main role of a queen bee in a honeybee colony?",
        "choices": [
          "To guard the hive entrance",
          "To lay thousands of eggs every day",
          "To gather flower nectar"
        ],
        "answer": 1,
        "fact": "The queen is the only fertile female in the hive and can lay over 1,500 eggs daily."
      },
      {
        "prompt": "How do porcupines protect themselves against predators like leopards and wolves?",
        "choices": [
          "Running up tall trees at high speed",
          "Spitting corrosive acid",
          "Sharp, barbed quills that detach on contact"
        ],
        "answer": 2,
        "fact": "Porcupine quills have microscopic barbs that make them painful and difficult to remove."
      },
      {
        "prompt": "Which animal group has moist skin without scales, lay jelly-like eggs in water, and metamorphoses?",
        "choices": [
          "Amphibians",
          "Reptiles",
          "Fish"
        ],
        "answer": 0,
        "fact": "Frogs, toads, newts, and salamanders are amphibians."
      },
      {
        "prompt": "What enables mountain goats to climb steep, almost vertical cliff faces?",
        "choices": [
          "Suction pads on their knees",
          "Rubbery hoof pads with sharp outer edges",
          "Sticky glue on their legs"
        ],
        "answer": 1,
        "fact": "Cloven hooves with rubbery traction pads grip tiny rock ledges securely."
      },
      {
        "prompt": "What do male peafowl (peacocks) display to attract female peahens?",
        "choices": [
          "A collection of shiny blue stones",
          "A loud drum sound",
          "A magnificent, colourful fan of iridescent tail feathers"
        ],
        "answer": 2,
        "fact": "The peacock's eye-spotted train displays health and genetic fitness to potential mates."
      },
      {
        "prompt": "What is a group of lions called?",
        "choices": [
          "A pride",
          "A pack",
          "A herd"
        ],
        "answer": 0,
        "fact": "Lions live in family groups called prides, typically made of related lionesses and their cubs."
      },
      {
        "prompt": "What is a group of wolves called?",
        "choices": [
          "A swarm",
          "A pack",
          "A school"
        ],
        "answer": 1,
        "fact": "Wolves live and hunt together in tightly bonded family packs."
      },
      {
        "prompt": "What do we call a large group of swimming fish?",
        "choices": [
          "A pod",
          "A flock",
          "A school (or shoal)"
        ],
        "answer": 2,
        "fact": "Schooling synchronises fish movement to confuse predators and reduce swimming drag."
      },
      {
        "prompt": "What do we call a family group of dolphins or whales?",
        "choices": [
          "A pod",
          "A herd",
          "A litter"
        ],
        "answer": 0,
        "fact": "Dolphins and orcas travel in social family groups known as pods."
      },
      {
        "prompt": "Which bird builds huge nests out of sticks on sea cliffs and has white head feathers?",
        "choices": [
          "The barn owl",
          "The bald eagle",
          "The swift"
        ],
        "answer": 1,
        "fact": "Bald eagles build giant eyries (stick nests) high in trees or on cliffs near water."
      },
      {
        "prompt": "Why do some desert rodents, like the kangaroo rat, never need to drink water?",
        "choices": [
          "They hibernate in damp caves",
          "They absorb dew through their tail",
          "They get all moisture from metabolic breakdown of dry seeds"
        ],
        "answer": 2,
        "fact": "Kangaroo rats extract metabolic water from dry seeds and have efficient kidneys."
      },
      {
        "prompt": "How do honeybees inform other hive members about the direction and distance to flower patches?",
        "choices": [
          "The waggle dance",
          "Buzzing Morse code",
          "Dropping flower petals"
        ],
        "answer": 0,
        "fact": "Forager bees perform a figure-eight waggle dance that communicates angle relative to the Sun and distance."
      },
      {
        "prompt": "Which animal is capable of regenerating entire lost limbs, heart tissue, and parts of its brain?",
        "choices": [
          "The leopard gecko",
          "The axolotl (Mexican salamander)",
          "The red fox"
        ],
        "answer": 1,
        "fact": "Axolotls have incredible regenerative abilities throughout their entire lives."
      },
      {
        "prompt": "What do cleaner wrasse fish do for large predatory reef fish?",
        "choices": [
          "Help them catch smaller fish",
          "Guide them through dark caves",
          "Pick off parasites and dead skin in mutual cooperation"
        ],
        "answer": 2,
        "fact": "Cleaner fish run cleaning stations where client fish wait patiently to have parasites removed."
      },
      {
        "prompt": "What is an ecosystem?",
        "choices": [
          "A community of living organisms interacting with their non-living environment",
          "A single species of animal",
          "A map of the stars"
        ],
        "answer": 0,
        "fact": "An ecosystem includes living organisms (plants, animals, fungi) and physical elements (soil, water, climate)."
      },
      {
        "prompt": "What is an animal that hunts other animals called?",
        "choices": [
          "Prey",
          "A predator",
          "A scavenger"
        ],
        "answer": 1,
        "fact": "Predators hunt, capture, and feed on other organisms (prey)."
      },
      {
        "prompt": "What is an animal that is hunted and eaten by other animals called?",
        "choices": [
          "A producer",
          "A predator",
          "Prey"
        ],
        "answer": 2,
        "fact": "Prey species develop defenses like speed, camouflage, and grouping to avoid predators."
      },
      {
        "prompt": "What do we call animals like vultures that feed on bodies of dead animals they did not kill?",
        "choices": [
          "Scavengers",
          "Apex predators",
          "Herbivores"
        ],
        "answer": 0,
        "fact": "Scavengers clean up ecosystems by consuming carcasses, preventing the spread of diseases."
      },
      {
        "prompt": "Why do hippos spend most hot African days submerged in rivers and mud?",
        "choices": [
          "They cannot walk on dry land",
          "To protect their sensitive skin from drying out and sunburn",
          "To hide from crocodile predators"
        ],
        "answer": 1,
        "fact": "Hippos secrete a red oily liquid that acts as natural sunscreen and moisturizer."
      },
      {
        "prompt": "What do deep-sea anglerfish use to lure prey towards their mouth in the pitch-black abyss?",
        "choices": [
          "Flashing rainbow scales",
          "A loud whistle sound",
          "A glowing bioluminescent lure (esca) dangling from their forehead"
        ],
        "answer": 2,
        "fact": "The anglerfish's glowing rod is packed with symbiotic bioluminescent bacteria."
      },
      {
        "prompt": "How do desert meerkats stay safe when scorpions sting them?",
        "choices": [
          "They have natural immunity to venom of local scorpions",
          "They wear thick mud boots",
          "They only hunt dead scorpions"
        ],
        "answer": 0,
        "fact": "Meerkats have evolved partial resistance to scorpion venom and bite off the venomous stinger first."
      },
      {
        "prompt": "Which creature holds hands with its partner while sleeping in kelp beds so they do not drift away?",
        "choices": [
          "Harbor seals",
          "Sea otters",
          "Green sea turtles"
        ],
        "answer": 1,
        "fact": "Sea otters often hold paws and wrap themselves in kelp strands while resting in floating rafts."
      },
      {
        "prompt": "What is the protective outer shell of a snail or turtle made of?",
        "choices": [
          "Compressed wood",
          "Hardened sand and salt",
          "Calcium carbonate or bone and keratin"
        ],
        "answer": 2,
        "fact": "Snail shells are calcium carbonate, while turtle shells are made of modified ribs and keratin scutes."
      },
      {
        "prompt": "Which mammal spends almost its entire life underground digging complex tunnel systems?",
        "choices": [
          "The mole",
          "The badger",
          "The red squirrel"
        ],
        "answer": 0,
        "fact": "Moles have shovel-like paws, sensitive snout whiskers, and velvety fur that brushes easily in both directions."
      },
      {
        "prompt": "Why do ducks and swans have webbed feet?",
        "choices": [
          "To grip slippery tree branches",
          "To push efficiently against water like swimming paddles",
          "To dig deep underground burrows"
        ],
        "answer": 1,
        "fact": "Skin stretched between toes creates paddles that propel water birds swiftly across lakes."
      },
      {
        "prompt": "What is the primary food of adult monarch butterflies?",
        "choices": [
          "Ants and beetles",
          "Tree bark",
          "Flower nectar"
        ],
        "answer": 2,
        "fact": "Monarch butterflies drink nectar from flowers, while their caterpillars eat milkweed leaves exclusively."
      },
      {
        "prompt": "What gives the green sea turtle its name?",
        "choices": [
          "The green colour of its internal fat from eating seagrasses",
          "Bright green neon shell scutes",
          "Green eyes"
        ],
        "answer": 0,
        "fact": "Their herbivorous diet of seagrass and algae turns their body fat green."
      },
      {
        "prompt": "Which bird is famous for mimicking human speech and intricate mechanical sounds?",
        "choices": [
          "The barn owl",
          "The parrot (and lyrebird)",
          "The flamingo"
        ],
        "answer": 1,
        "fact": "Parrots and lyrebirds have highly developed vocal organs that can reproduce complex environmental sounds."
      },
      {
        "prompt": "What helps walruses haul their heavy bodies onto sea ice and dig into the seabed?",
        "choices": [
          "Spiky whale tails",
          "Giant clawed hands",
          "Long ivory tusks"
        ],
        "answer": 2,
        "fact": "Walrus tusks are enlarged canine teeth used to climb onto ice, establish dominance, and forage."
      },
      {
        "prompt": "Why do green sea anemones look like underwater flowers even though they are animals?",
        "choices": [
          "Their waving tentacles capture passing prey like miniature arms",
          "They produce fragrant perfume",
          "They grow roots into the sand"
        ],
        "answer": 0,
        "fact": "Sea anemones are predatory animals armed with stinging nematocysts on their tentacles."
      },
      {
        "prompt": "Which animal produces the finest, strongest silk thread weight-for-weight?",
        "choices": [
          "Silkworms",
          "Spiders",
          "Ants"
        ],
        "answer": 1,
        "fact": "Spider dragline silk is stronger than high-grade steel of equal thickness and exceptionally elastic."
      },
      {
        "prompt": "What adaptation allows owls to turn their heads up to 270 degrees?",
        "choices": [
          "A neck with zero bones",
          "An eyeball that spins completely around",
          "Extra neck vertebrae with flexible blood vessels"
        ],
        "answer": 2,
        "fact": "Owls have 14 neck vertebrae (humans have only 7), allowing them to look almost behind them."
      },
      {
        "prompt": "Which ocean zone receives no sunlight at all and is in perpetual darkness?",
        "choices": [
          "The midnight zone (aphotic zone)",
          "The sunlit zone",
          "The coral reef zone"
        ],
        "answer": 0,
        "fact": "Below 1,000 meters depth, no sunlight penetrates, creating the deep midnight zone."
      },
      {
        "prompt": "How do salmon navigate thousands of miles back to the exact freshwater stream where they hatched?",
        "choices": [
          "Following older parent salmon",
          "Using Earth's magnetic field and their keen sense of smell",
          "Listening to waterfalls from the ocean"
        ],
        "answer": 1,
        "fact": "Salmon use geomagnetic cues in the ocean and chemical smells in river waters to find their natal streams."
      },
      {
        "prompt": "What is the sticky web built by an orb-weaver spider designed to catch?",
        "choices": [
          "Water droplets for drinking",
          "Falling tree seeds",
          "Flying insects"
        ],
        "answer": 2,
        "fact": "Spiders spin geometric webs lined with sticky droplets that ensnare flying bugs."
      },
      {
        "prompt": "Which marine mammal is closely related to elephants despite living entirely in water?",
        "choices": [
          "The manatee (sea cow)",
          "The harbor seal",
          "The humpback whale"
        ],
        "answer": 0,
        "fact": "Manatees share a common ancestor with elephants and have toenails on their front flippers."
      }
    ]
  },
  {
    "id": "matter-lab",
    "title": "Matter Lab",
    "topic": "Chemistry",
    "icon": "\ud83e\uddea",
    "theme": {
      "border": "hover:border-violet-400",
      "icon": "bg-violet-950 border-violet-700/70",
      "topic": "text-violet-300",
      "title": "group-hover:text-violet-300",
      "arrow": "text-violet-300"
    },
    "description": "Investigate solids, liquids, and gases in the junior science lab.",
    "questions": [
      {
        "prompt": "A cold ice cube keeps its own shape. What state of matter is it?",
        "choices": [
          "Solid",
          "Liquid",
          "Gas"
        ],
        "answer": 0,
        "fact": "A solid keeps its own shape. Ice is water in its solid state."
      },
      {
        "prompt": "Which state of matter spreads out to fill its container?",
        "choices": [
          "Solid",
          "Liquid",
          "Gas"
        ],
        "answer": 2,
        "fact": "A gas spreads out to fill the space available, unlike a solid or a liquid."
      },
      {
        "prompt": "Water takes the shape of its cup but keeps the same amount. What state is it?",
        "choices": [
          "Solid",
          "Liquid",
          "Gas"
        ],
        "answer": 1,
        "fact": "A liquid flows and takes the shape of its container, but it keeps a fixed volume."
      },
      {
        "prompt": "What happens when a solid ice cube warms and turns into liquid water?",
        "choices": [
          "It melts",
          "It freezes",
          "It condenses"
        ],
        "answer": 0,
        "fact": "Melting happens when a solid gains heat and changes into a liquid."
      },
      {
        "prompt": "What is it called when water vapour cools and becomes liquid droplets?",
        "choices": [
          "Evaporation",
          "Condensation",
          "Melting"
        ],
        "answer": 1,
        "fact": "Condensation changes a gas into a liquid, like droplets forming on a cold window."
      },
      {
        "prompt": "What is it called when liquid water is cooled below 0\u00b0C and turns to solid ice?",
        "choices": [
          "Boiling",
          "Melting",
          "Freezing"
        ],
        "answer": 2,
        "fact": "Freezing occurs when liquid loses heat and becomes solid at its freezing point."
      },
      {
        "prompt": "What temperature does pure water boil at under normal atmospheric pressure?",
        "choices": [
          "100\u00b0C",
          "50\u00b0C",
          "0\u00b0C"
        ],
        "answer": 0,
        "fact": "Water boils at 100\u00b0C (212\u00b0F), turning vigorously into steam."
      },
      {
        "prompt": "What temperature does pure water freeze at?",
        "choices": [
          "32\u00b0C",
          "0\u00b0C",
          "-100\u00b0C"
        ],
        "answer": 1,
        "fact": "Water turns to ice at 0\u00b0C (32\u00b0F)."
      },
      {
        "prompt": "What is a material that lets all light pass through clearly, such as clear window glass?",
        "choices": [
          "Translucent",
          "Opaque",
          "Transparent"
        ],
        "answer": 2,
        "fact": "Transparent materials allow light rays to pass directly through without scattering."
      },
      {
        "prompt": "What is a material that blocks all light, casting a distinct shadow, like wood or metal?",
        "choices": [
          "Opaque",
          "Transparent",
          "Translucent"
        ],
        "answer": 0,
        "fact": "Opaque objects absorb or reflect all light so you cannot see through them."
      },
      {
        "prompt": "What is a material that lets some light pass through but scatters it, like frosted glass?",
        "choices": [
          "Transparent",
          "Translucent",
          "Reflective"
        ],
        "answer": 1,
        "fact": "Translucent objects scatter light rays so images behind them appear blurry."
      },
      {
        "prompt": "What property describes a material that does not allow water or liquid to soak through?",
        "choices": [
          "Soluble",
          "Absorbent",
          "Waterproof"
        ],
        "answer": 2,
        "fact": "Waterproof materials like rubber and wax repel water and keep things dry."
      },
      {
        "prompt": "What property describes a material that easily soaks up liquids, like a kitchen sponge?",
        "choices": [
          "Absorbent",
          "Waterproof",
          "Rigid"
        ],
        "answer": 0,
        "fact": "Absorbent materials have porous structures that soak up and hold liquids."
      },
      {
        "prompt": "Which metal is attracted to a magnet?",
        "choices": [
          "Gold",
          "Iron",
          "Aluminium"
        ],
        "answer": 1,
        "fact": "Iron, nickel, and cobalt are ferromagnetic materials strongly attracted to magnets."
      },
      {
        "prompt": "What do we call materials that easily allow electricity and heat to flow through them?",
        "choices": [
          "Absorbents",
          "Insulators",
          "Conductors"
        ],
        "answer": 2,
        "fact": "Metals like copper and silver are excellent conductors of electricity and heat."
      },
      {
        "prompt": "What do we call materials that do NOT easily allow electricity or heat to pass through?",
        "choices": [
          "Insulators",
          "Conductors",
          "Magnets"
        ],
        "answer": 0,
        "fact": "Insulators like rubber, plastic, and glass protect us from electric shocks."
      },
      {
        "prompt": "Why are electrical wires usually wrapped in flexible plastic or rubber?",
        "choices": [
          "Plastic makes electricity travel faster",
          "Plastic is a safe electrical insulator",
          "Plastic conducts magnetic force"
        ],
        "answer": 1,
        "fact": "Rubber and plastic insulation prevent electrical currents from leaking or shocking users."
      },
      {
        "prompt": "What happens when table salt is stirred thoroughly into warm water?",
        "choices": [
          "It explodes into smoke",
          "It freezes into ice",
          "It dissolves into a clear solution"
        ],
        "answer": 2,
        "fact": "Salt is soluble in water, breaking down into sodium and chloride ions."
      },
      {
        "prompt": "What do we call a substance that dissolves in a liquid, like sugar in tea?",
        "choices": [
          "A solute",
          "A solvent",
          "A precipitate"
        ],
        "answer": 0,
        "fact": "The solute is the dissolved substance, while the liquid doing the dissolving is the solvent."
      },
      {
        "prompt": "What is the liquid called that dissolves a solute to form a solution?",
        "choices": [
          "A solute",
          "A solvent",
          "A crystal"
        ],
        "answer": 1,
        "fact": "Water is often called the universal solvent because it dissolves many substances."
      },
      {
        "prompt": "What happens when you mix oil and water together in a jar?",
        "choices": [
          "They dissolve into a purple syrup",
          "They turn into a solid brick",
          "They separate into two layers because oil does not dissolve in water"
        ],
        "answer": 2,
        "fact": "Oil and water are immiscible; oil is less dense and floats on top of water."
      },
      {
        "prompt": "What simple method can separate insoluble sand particles from water?",
        "choices": [
          "Filtration through filter paper",
          "Boiling all the sand",
          "Using a magnet"
        ],
        "answer": 0,
        "fact": "Filtration traps large solid sand grains while allowing liquid water to pass through."
      },
      {
        "prompt": "How can you separate iron paperclips mixed with plastic beads?",
        "choices": [
          "Pour water over them",
          "Use a magnet to attract the iron paperclips",
          "Heat them until they melt"
        ],
        "answer": 1,
        "fact": "Magnets attract iron paperclips while leaving plastic beads behind."
      },
      {
        "prompt": "What happens when liquid water is heated and turns into invisible water vapour below boiling point?",
        "choices": [
          "Freezing",
          "Condensation",
          "Evaporation"
        ],
        "answer": 2,
        "fact": "Evaporation happens at the surface of liquids at any temperature."
      },
      {
        "prompt": "What is the fourth state of matter, found in lightning, neon signs, and stars?",
        "choices": [
          "Plasma",
          "Crystal",
          "Vapour"
        ],
        "answer": 0,
        "fact": "Plasma is an ionized gas of free electrons and positive ions that conducts electricity."
      },
      {
        "prompt": "Is baking a cake a reversible change or an irreversible chemical reaction?",
        "choices": [
          "Reversible physical change",
          "Irreversible chemical change",
          "Freezing change"
        ],
        "answer": 1,
        "fact": "Heat causes chemical reactions between flour, eggs, and sugar that cannot be undone."
      },
      {
        "prompt": "What reddish-brown substance forms when iron is exposed to oxygen and water over time?",
        "choices": [
          "Gold foil",
          "Copper patina",
          "Rust (iron oxide)"
        ],
        "answer": 2,
        "fact": "Rusting is a chemical reaction between iron, oxygen, and water forming iron oxide."
      },
      {
        "prompt": "What gas is produced when you mix baking soda (sodium bicarbonate) with vinegar (acetic acid)?",
        "choices": [
          "Carbon dioxide",
          "Oxygen",
          "Helium"
        ],
        "answer": 0,
        "fact": "The acid-base reaction releases carbon dioxide gas, creating bubbling fizz."
      },
      {
        "prompt": "Is melting an ice cube a reversible physical change or an irreversible reaction?",
        "choices": [
          "Irreversible chemical reaction",
          "Reversible physical change",
          "Burning reaction"
        ],
        "answer": 1,
        "fact": "Water can be frozen back into ice simply by cooling it down again."
      },
      {
        "prompt": "What happens to the molecules of a substance when it is heated?",
        "choices": [
          "They shrink and disappear",
          "They stop moving completely",
          "They gain kinetic energy and move faster"
        ],
        "answer": 2,
        "fact": "Adding thermal energy makes particles vibrate and move with greater speed."
      },
      {
        "prompt": "What happens to most solids, liquids, and gases when they are heated?",
        "choices": [
          "They expand (take up slightly more volume)",
          "They contract into a pinpoint",
          "They lose all mass"
        ],
        "answer": 0,
        "fact": "Thermal expansion occurs because vibrating particles push slightly farther apart."
      },
      {
        "prompt": "What happens to an object when its density is less than the density of water?",
        "choices": [
          "It sinks to the bottom",
          "It floats",
          "It turns to steam"
        ],
        "answer": 1,
        "fact": "Objects less dense than water float on the surface."
      },
      {
        "prompt": "Why does a giant steel ship float on ocean water even though a steel coin sinks?",
        "choices": [
          "Steel floats when painted blue",
          "Ocean water has no gravity",
          "The ship's hollow hull contains lots of air, lowering its overall average density"
        ],
        "answer": 2,
        "fact": "Archimedes' principle: the buoyant force equals the weight of displaced water."
      },
      {
        "prompt": "What tiny building blocks make up all matter in the universe?",
        "choices": [
          "Atoms",
          "Dust bunnies",
          "Microscopic sponges"
        ],
        "answer": 0,
        "fact": "Atoms are the basic units of matter made of protons, neutrons, and electrons."
      },
      {
        "prompt": "What is the chemical formula for a molecule of water?",
        "choices": [
          "CO2",
          "H2O (two hydrogen, one oxygen)",
          "NaCl"
        ],
        "answer": 1,
        "fact": "Each water molecule is composed of two hydrogen atoms bonded to one oxygen atom."
      },
      {
        "prompt": "What chemical element do humans need to breathe in to survive?",
        "choices": [
          "Neon",
          "Helium",
          "Oxygen"
        ],
        "answer": 2,
        "fact": "Our cells use oxygen to release energy from food through cellular respiration."
      },
      {
        "prompt": "What is the name for a change directly from a solid to a gas without becoming a liquid first?",
        "choices": [
          "Sublimation",
          "Condensation",
          "Dissolving"
        ],
        "answer": 0,
        "fact": "Dry ice (solid carbon dioxide) sublimates directly into gas at room temperature."
      },
      {
        "prompt": "What is dry ice made of?",
        "choices": [
          "Frozen tap water",
          "Solid frozen carbon dioxide",
          "Compressed liquid nitrogen"
        ],
        "answer": 1,
        "fact": "Dry ice is solid carbon dioxide at -78.5\u00b0C."
      },
      {
        "prompt": "What property describes a metal's ability to be hammered or rolled into thin sheets without shattering?",
        "choices": [
          "Porosity",
          "Brittleness",
          "Malleability"
        ],
        "answer": 2,
        "fact": "Gold and aluminium are malleable metals that can be beaten into thin foils."
      },
      {
        "prompt": "What property describes a material's ability to be stretched into long thin wires, like copper?",
        "choices": [
          "Ductility",
          "Brittleness",
          "Solubility"
        ],
        "answer": 0,
        "fact": "Ductile metals can be drawn out into thin electrical wiring."
      },
      {
        "prompt": "Which common material is hard, transparent, but brittle and can shatter if dropped?",
        "choices": [
          "Rubber",
          "Glass",
          "Clay"
        ],
        "answer": 1,
        "fact": "Glass has great compressive strength but is brittle and shatters under tension."
      },
      {
        "prompt": "Which natural material made from tree latex is elastic, waterproof, and flexible?",
        "choices": [
          "Iron",
          "Concrete",
          "Rubber"
        ],
        "answer": 2,
        "fact": "Natural rubber has long polymer chains that can stretch and snap back into shape."
      },
      {
        "prompt": "What pH value represents a pure neutral liquid, such as pure water at room temperature?",
        "choices": [
          "pH 7",
          "pH 1",
          "pH 14"
        ],
        "answer": 0,
        "fact": "On the pH scale from 0 to 14, pH 7 is exactly neutral."
      },
      {
        "prompt": "Are lemon juice and vinegar acidic or alkaline?",
        "choices": [
          "Alkaline (pH greater than 7)",
          "Acidic (pH less than 7)",
          "Pure neutral"
        ],
        "answer": 1,
        "fact": "Citric acid and acetic acid give lemons and vinegar their sour taste and low pH."
      },
      {
        "prompt": "What common kitchen powder is a mild alkaline base that neutralizes acids?",
        "choices": [
          "White sugar",
          "Table salt",
          "Baking soda"
        ],
        "answer": 2,
        "fact": "Baking soda is sodium bicarbonate, a mild base with a pH around 8.5."
      },
      {
        "prompt": "What paper turns red in acid and blue in alkali, testing acidity?",
        "choices": [
          "Litmus paper",
          "Parchment paper",
          "Sandpaper"
        ],
        "answer": 0,
        "fact": "Litmus paper is a chemical indicator derived from lichens."
      },
      {
        "prompt": "What do we call a mixture where two or more metals are melted together, like bronze or steel?",
        "choices": [
          "An element",
          "An alloy",
          "A polymer"
        ],
        "answer": 1,
        "fact": "Bronze is an alloy of copper and tin; brass is copper and zinc."
      },
      {
        "prompt": "Which alloy is made primarily of iron and carbon, famous for its strength in buildings and bridges?",
        "choices": [
          "Solder",
          "Pewter",
          "Steel"
        ],
        "answer": 2,
        "fact": "Adding a small amount of carbon to iron creates tough, strong steel."
      },
      {
        "prompt": "What happens when you burn a piece of wood in a campfire?",
        "choices": [
          "An irreversible chemical change releases heat, light, ash, and gases",
          "A reversible physical change",
          "Water evaporates and leaves wood intact"
        ],
        "answer": 0,
        "fact": "Combustion breaks chemical bonds in cellulose, producing carbon dioxide, water, and ash."
      },
      {
        "prompt": "What three things are needed for a fire to burn (the fire triangle)?",
        "choices": [
          "Water, air, and wood",
          "Heat, fuel, and oxygen",
          "Electricity, stone, and gas"
        ],
        "answer": 1,
        "fact": "Removing heat, fuel, or oxygen extinguishes a fire."
      },
      {
        "prompt": "Why does a metal spoon placed in hot soup get hot much faster than a wooden spoon?",
        "choices": [
          "Metal creates its own heat",
          "Wood attracts cold air",
          "Metal is a much better thermal conductor than wood"
        ],
        "answer": 2,
        "fact": "Metals have free electrons that transfer thermal energy rapidly."
      },
      {
        "prompt": "What do we call the point where a liquid holds the maximum amount of dissolved solute possible?",
        "choices": [
          "A saturated solution",
          "A diluted mixture",
          "An empty solution"
        ],
        "answer": 0,
        "fact": "A saturated solution cannot dissolve any additional solute at that temperature."
      },
      {
        "prompt": "What happens when a saturated sugar-water solution is allowed to cool slowly?",
        "choices": [
          "The water boils away instantly",
          "Sugar crystals grow as solubility decreases",
          "The sugar turns to salt"
        ],
        "answer": 1,
        "fact": "Crystallization happens because cooler water cannot hold as much dissolved solute."
      },
      {
        "prompt": "What is the term for a material that breaks easily with a clean snap, like dry ceramic?",
        "choices": [
          "Ductile",
          "Elastic",
          "Brittle"
        ],
        "answer": 2,
        "fact": "Brittle materials fracture with little or no plastic deformation."
      },
      {
        "prompt": "What property allows a rubber band to return to its original shape after being pulled?",
        "choices": [
          "Elasticity",
          "Hardness",
          "Transparency"
        ],
        "answer": 0,
        "fact": "Elastic materials deform under tension and return to their original shape when released."
      },
      {
        "prompt": "Which mineral is the hardest natural substance known on Earth?",
        "choices": [
          "Talc",
          "Diamond",
          "Quartz"
        ],
        "answer": 1,
        "fact": "Diamond rates 10 on the Mohs hardness scale due to its tetrahedral carbon lattice."
      },
      {
        "prompt": "Which soft mineral rates number 1 (softest) on Mohs hardness scale and feels greasy?",
        "choices": [
          "Topaz",
          "Diamond",
          "Talc"
        ],
        "answer": 2,
        "fact": "Talc is the softest known mineral and can be easily scratched by a fingernail."
      },
      {
        "prompt": "What gas do green plants absorb from the air during photosynthesis?",
        "choices": [
          "Carbon dioxide",
          "Argon",
          "Helium"
        ],
        "answer": 0,
        "fact": "Plants take in carbon dioxide through microscopic leaf pores called stomata."
      },
      {
        "prompt": "What gas do green plants release into the air as a byproduct of photosynthesis?",
        "choices": [
          "Carbon monoxide",
          "Oxygen",
          "Methane"
        ],
        "answer": 1,
        "fact": "Photosynthesis splits water molecules and releases vital oxygen gas."
      },
      {
        "prompt": "Which gas makes up the largest percentage (about 78%) of Earth's atmosphere?",
        "choices": [
          "Carbon dioxide",
          "Oxygen",
          "Nitrogen"
        ],
        "answer": 2,
        "fact": "Nitrogen gas makes up about 78% of the air we breathe, while oxygen is about 21%."
      },
      {
        "prompt": "Why are balloons filled with helium able to float up into the sky?",
        "choices": [
          "Helium is less dense than the surrounding air",
          "Helium is warmer than air",
          "Helium has zero mass"
        ],
        "answer": 0,
        "fact": "Helium gas has a lower density than nitrogen and oxygen, causing it to rise buoyantly."
      },
      {
        "prompt": "What happens to the volume of liquid water when it freezes into ice?",
        "choices": [
          "It shrinks into a smaller cube",
          "It expands and becomes less dense",
          "It stays exactly identical in size"
        ],
        "answer": 1,
        "fact": "Water expands when freezing because molecules form an open crystalline hexagon structure, which is why ice floats."
      },
      {
        "prompt": "What do we call a mixture where particles are dispersed throughout a liquid without dissolving, like muddy river water?",
        "choices": [
          "An alloy",
          "A solution",
          "A suspension"
        ],
        "answer": 2,
        "fact": "In a suspension, solid particles eventually settle out to the bottom if left undisturbed."
      },
      {
        "prompt": "What happens when you tear a piece of paper in half?",
        "choices": [
          "A physical change (it is still paper)",
          "A chemical reaction",
          "An explosion"
        ],
        "answer": 0,
        "fact": "Tearing paper changes only its size and shape, not its chemical composition."
      },
      {
        "prompt": "What happens when you dissolve copper sulfate in water and evaporate the water?",
        "choices": [
          "The copper disappears forever",
          "Blue crystals of copper sulfate reform",
          "It turns into gold"
        ],
        "answer": 1,
        "fact": "Evaporating the liquid solvent leaves pure crystals behind."
      },
      {
        "prompt": "What instrument is used in science labs to measure mass accurately?",
        "choices": [
          "A thermometer",
          "A ruler",
          "A balance scale"
        ],
        "answer": 2,
        "fact": "Balance scales compare an object's mass against known calibrated standards."
      },
      {
        "prompt": "What instrument measures temperature in degrees Celsius or Fahrenheit?",
        "choices": [
          "A thermometer",
          "A barometer",
          "A stopwatch"
        ],
        "answer": 0,
        "fact": "Thermometers measure thermal energy using liquid expansion or electronic thermistors."
      },
      {
        "prompt": "What do we call the amount of matter in an object?",
        "choices": [
          "Volume",
          "Mass",
          "Area"
        ],
        "answer": 1,
        "fact": "Mass measures the quantity of matter inside an object and does not change with gravity."
      },
      {
        "prompt": "What do we call the amount of three-dimensional space an object takes up?",
        "choices": [
          "Length",
          "Mass",
          "Volume"
        ],
        "answer": 2,
        "fact": "Volume can be measured in cubic centimeters, milliliters, or liters."
      },
      {
        "prompt": "How do you calculate density?",
        "choices": [
          "Mass divided by volume",
          "Mass multiplied by volume",
          "Length plus width"
        ],
        "answer": 0,
        "fact": "Density equals mass divided by volume (D = m/V)."
      },
      {
        "prompt": "What is the green pigment in plant leaves that absorbs sunlight?",
        "choices": [
          "Carotene",
          "Chlorophyll",
          "Melanin"
        ],
        "answer": 1,
        "fact": "Chlorophyll traps red and blue light energy while reflecting green light."
      },
      {
        "prompt": "What is a chemical reaction that absorbs heat from its surroundings, feeling cold to touch?",
        "choices": [
          "Combustion",
          "Exothermic reaction",
          "Endothermic reaction"
        ],
        "answer": 2,
        "fact": "Instant cold ice packs use endothermic reactions that absorb thermal energy."
      },
      {
        "prompt": "What is a chemical reaction that releases heat energy to its surroundings, feeling hot?",
        "choices": [
          "Exothermic reaction",
          "Endothermic reaction",
          "Filtration"
        ],
        "answer": 0,
        "fact": "Campfires, fireworks, and hand warmers are exothermic reactions that release heat."
      },
      {
        "prompt": "What happens when you mix iron filings and powdered sulfur without heating them?",
        "choices": [
          "A permanent compound",
          "A physical mixture where iron can be removed with a magnet",
          "They turn into liquid acid"
        ],
        "answer": 1,
        "fact": "Without heat to trigger a chemical reaction, they remain a simple physical mixture."
      },
      {
        "prompt": "What forms when iron and sulfur are heated strongly in a test tube?",
        "choices": [
          "Pure oxygen gas",
          "They melt and stay separate",
          "A new chemical compound (iron sulfide)"
        ],
        "answer": 2,
        "fact": "Heating initiates a chemical reaction forming iron sulfide, which is no longer magnetic."
      },
      {
        "prompt": "Which state of matter has a fixed volume but changes shape to match its container?",
        "choices": [
          "Liquid",
          "Solid",
          "Gas"
        ],
        "answer": 0,
        "fact": "Liquids flow and take container shapes while maintaining a constant volume."
      },
      {
        "prompt": "Which state of matter has neither fixed shape nor fixed volume?",
        "choices": [
          "Solid",
          "Gas",
          "Liquid"
        ],
        "answer": 1,
        "fact": "Gas particles move freely and spread to completely fill any sealed space."
      },
      {
        "prompt": "What happens to the pressure of a gas inside a sealed balloon when it is heated?",
        "choices": [
          "The particles turn into liquid",
          "The pressure drops to zero",
          "The pressure increases as particles hit walls harder and faster"
        ],
        "answer": 2,
        "fact": "Gay-Lussac's Law: heating gas particles makes them collide with container walls more forcefully."
      },
      {
        "prompt": "Why do copper pipes turn green when exposed to moist air for many years?",
        "choices": [
          "Chemical weathering forms a protective patina of copper carbonate",
          "Green moss grows inside the copper",
          "The copper dissolves into green paint"
        ],
        "answer": 0,
        "fact": "The Statue of Liberty's famous green patina is a layer of copper carbonate formed by chemical oxidation."
      },
      {
        "prompt": "What gas causes bread dough to rise when yeast ferments sugars?",
        "choices": [
          "Oxygen",
          "Carbon dioxide",
          "Nitrogen"
        ],
        "answer": 1,
        "fact": "Yeast produces bubbles of carbon dioxide that expand when baked in the oven."
      },
      {
        "prompt": "Which precious metal never tarnishes or rusts, even after thousands of years buried underground?",
        "choices": [
          "Silver",
          "Iron",
          "Gold"
        ],
        "answer": 2,
        "fact": "Gold is a noble metal that does not react with oxygen or water."
      },
      {
        "prompt": "What property of clay allows it to be shaped easily when wet and stay rigid when baked?",
        "choices": [
          "Plasticity",
          "Elasticity",
          "Transparency"
        ],
        "answer": 0,
        "fact": "Wet clay is plastic; firing it in a kiln permanently hardens it into ceramic."
      },
      {
        "prompt": "What is chromatography used for in science?",
        "choices": [
          "Measuring earthquakes",
          "Separating dissolved mixtures like ink pigments",
          "Weighing planets"
        ],
        "answer": 1,
        "fact": "Paper chromatography separates pigments as water carries them across absorbent paper at different rates."
      },
      {
        "prompt": "What happens to a marshmallow roasted over an open campfire flame if left too long?",
        "choices": [
          "It freezes into ice",
          "It turns into clear water",
          "It burns and chars into black carbon"
        ],
        "answer": 2,
        "fact": "Burning sugar causes thermal decomposition, leaving behind elemental carbon charcoal."
      },
      {
        "prompt": "What is the liquid metal that remains liquid at normal room temperature?",
        "choices": [
          "Mercury",
          "Iron",
          "Aluminium"
        ],
        "answer": 0,
        "fact": "Mercury has a melting point of -38.8\u00b0C, making it liquid at room temperature."
      },
      {
        "prompt": "Why does a metal bicycle chain need oil or grease?",
        "choices": [
          "To make it heavier",
          "To reduce friction and prevent rust",
          "To attract sand"
        ],
        "answer": 1,
        "fact": "Lubricants smooth metal contact, reducing wear and sealing out moisture."
      },
      {
        "prompt": "What does friction produce between two moving surfaces rubbed together?",
        "choices": [
          "Magnetic waves",
          "Cold ice crystals",
          "Heat and wear"
        ],
        "answer": 2,
        "fact": "Friction opposes relative motion and converts mechanical energy into thermal energy."
      },
      {
        "prompt": "What type of change is dissolving powdered juice drink into a pitcher of cold water?",
        "choices": [
          "Physical change",
          "Chemical change",
          "Nuclear change"
        ],
        "answer": 0,
        "fact": "Dissolving juice powder changes taste and appearance without altering the fundamental molecules."
      },
      {
        "prompt": "What do we call the process of heating a liquid to create vapour and condensing that vapour to collect pure liquid?",
        "choices": [
          "Filtration",
          "Distillation",
          "Magnetism"
        ],
        "answer": 1,
        "fact": "Distillation separates liquids by their differing boiling points."
      },
      {
        "prompt": "Can pure drinking water be made from seawater using distillation?",
        "choices": [
          "No, water is destroyed by boiling",
          "No, salt evaporates with water",
          "Yes, because salt is left behind when water evaporates"
        ],
        "answer": 2,
        "fact": "Thermal desalination boils seawater, collecting pure condensed freshwater steam."
      },
      {
        "prompt": "What is the name of the process that plants use to make glucose using light energy?",
        "choices": [
          "Photosynthesis",
          "Respiration",
          "Evaporation"
        ],
        "answer": 0,
        "fact": "Photosynthesis converts solar photons into stored chemical energy."
      },
      {
        "prompt": "What is the term for a material that allows magnets to pass their force through without sticking?",
        "choices": [
          "Ferromagnetic",
          "Non-magnetic",
          "Conductor"
        ],
        "answer": 1,
        "fact": "Plastic, wood, and paper are non-magnetic materials."
      },
      {
        "prompt": "What protective transparent coating is often added to metals to stop them from rusting?",
        "choices": [
          "Water",
          "Table salt",
          "Paint or varnish"
        ],
        "answer": 2,
        "fact": "Painting seals iron and steel away from air and moisture."
      },
      {
        "prompt": "Why does hot air rise above cold air?",
        "choices": [
          "Hot air expands, becoming less dense than cooler surrounding air",
          "Hot air has negative mass",
          "Gravity only pulls cold things"
        ],
        "answer": 0,
        "fact": "Warm air molecules spread apart, reducing density and producing upward convection currents."
      },
      {
        "prompt": "What forms on the outside of a cold glass of lemonade on a warm summer day?",
        "choices": [
          "Water leaking through the glass",
          "Condensation droplets from water vapour in the air",
          "Melted sugar"
        ],
        "answer": 1,
        "fact": "Air touching the cold glass chills below its dew point, condensing into water droplets."
      },
      {
        "prompt": "What happens to the boiling point of water when you climb high up a mountain?",
        "choices": [
          "Water cannot boil on mountains",
          "Water boils at a higher temperature",
          "Water boils at a lower temperature because air pressure is lower"
        ],
        "answer": 2,
        "fact": "Lower atmospheric pressure at high altitude allows steam bubbles to form at lower temperatures."
      },
      {
        "prompt": "Which gas is used in carbonated fizzy sodas to create bubbles?",
        "choices": [
          "Carbon dioxide",
          "Oxygen",
          "Helium"
        ],
        "answer": 0,
        "fact": "Dissolved carbon dioxide under pressure releases effervescent bubbles when the cap is opened."
      },
      {
        "prompt": "What is the common name for sodium chloride?",
        "choices": [
          "Baking soda",
          "Table salt",
          "Sugar"
        ],
        "answer": 1,
        "fact": "Sodium chloride (NaCl) is common table salt."
      },
      {
        "prompt": "What property of diamond makes it useful for industrial cutting and drilling tools?",
        "choices": [
          "High solubility",
          "Shiny sparkle",
          "Extreme hardness"
        ],
        "answer": 2,
        "fact": "Diamond's unmatched hardness allows it to cut through hardened steel and stone."
      },
      {
        "prompt": "What type of material can be broken down naturally by bacteria and fungi into harmless soil nutrients?",
        "choices": [
          "Biodegradable",
          "Synthetic plastic",
          "Radioactive"
        ],
        "answer": 0,
        "fact": "Biodegradable substances like apple cores and paper decompose naturally over time."
      }
    ]
  },
  {
    "id": "nature-detectives",
    "title": "Nature Detectives",
    "topic": "Nature",
    "icon": "\ud83c\udf3f",
    "theme": {
      "border": "hover:border-amber-400",
      "icon": "bg-amber-950 border-amber-700/70",
      "topic": "text-amber-300",
      "title": "group-hover:text-amber-300",
      "arrow": "text-amber-300"
    },
    "description": "Follow clues from gardens, forests, and the water cycle.",
    "questions": [
      {
        "prompt": "What do bees help flowers do when they carry pollen between them?",
        "choices": [
          "Make seeds",
          "Make rain",
          "Grow roots"
        ],
        "answer": 0,
        "fact": "Moving pollen between flowers helps plants make seeds. This process is called pollination."
      },
      {
        "prompt": "Which tiny living things help break down dead leaves in a forest?",
        "choices": [
          "Fungi",
          "Clouds",
          "Rocks"
        ],
        "answer": 0,
        "fact": "Fungi are decomposers. They break down dead material and return nutrients to the soil."
      },
      {
        "prompt": "What do green leaves take in from sunlight to help a plant make food?",
        "choices": [
          "Energy",
          "Sand",
          "Moonlight"
        ],
        "answer": 0,
        "fact": "Leaves capture energy from sunlight to help plants make their own food."
      },
      {
        "prompt": "What does a caterpillar usually change into?",
        "choices": [
          "A butterfly or moth",
          "A beetle",
          "A spider"
        ],
        "answer": 0,
        "fact": "Caterpillars change into adult butterflies or moths in a process called metamorphosis."
      },
      {
        "prompt": "What is the name for liquid water changing into water vapour?",
        "choices": [
          "Evaporation",
          "Freezing",
          "Condensation"
        ],
        "answer": 0,
        "fact": "The Sun warms water and turns some of it into vapour. This step is called evaporation."
      },
      {
        "prompt": "What is the process where a seed starts to sprout into a young seedling?",
        "choices": [
          "Transpiration",
          "Pollination",
          "Germination"
        ],
        "answer": 2,
        "fact": "Germination begins when a seed absorbs moisture, swelling and sending out a tiny root."
      },
      {
        "prompt": "What three key things does a seed need to germinate?",
        "choices": [
          "Water, warmth, and oxygen",
          "Darkness, wind, and rock",
          "Honey, salt, and sand"
        ],
        "answer": 0,
        "fact": "Most seeds need water to soften their coat, oxygen for energy, and warmth to trigger enzymes."
      },
      {
        "prompt": "What part of a plant carries water and nutrients upward from roots to the leaves?",
        "choices": [
          "The flower petal",
          "The stem (or trunk)",
          "The seed coat"
        ],
        "answer": 1,
        "fact": "The stem contains xylem vessels that transport water and minerals to all parts of the plant."
      },
      {
        "prompt": "What is the name of the process where water evaporates from tiny pores in plant leaves into the air?",
        "choices": [
          "Pollination",
          "Precipitation",
          "Transpiration"
        ],
        "answer": 2,
        "fact": "Transpiration pulls water up through the plant like a straw, cooling the plant."
      },
      {
        "prompt": "What microscopic pores on the underside of leaves open and close to allow gases in and out?",
        "choices": [
          "Stomata",
          "Chloroplasts",
          "Petals"
        ],
        "answer": 0,
        "fact": "Stomata are regulated by guard cells to balance gas intake with water loss."
      },
      {
        "prompt": "How does a dandelion plant disperse its seeds over long distances?",
        "choices": [
          "Exploding pods fling them",
          "Wind catches their fluffy parachute tufts",
          "Floating down rivers in shells"
        ],
        "answer": 1,
        "fact": "Dandelion seeds have feathery pappus parachutes that ride gentle wind breezes."
      },
      {
        "prompt": "How do burrs and sticky seeds spread to new growing grounds?",
        "choices": [
          "Swimming down ocean currents",
          "Flying with feathered wings",
          "Hooking onto animal fur and hikers' clothes"
        ],
        "answer": 2,
        "fact": "Seeds like burdock have tiny hooks that cling to animals as they brush past."
      },
      {
        "prompt": "Why do many fruit trees produce sweet, colourful berries and apples?",
        "choices": [
          "Animals eat them and disperse the seeds in their droppings",
          "To feed the tree roots",
          "To attract pollinators to old fruit"
        ],
        "answer": 0,
        "fact": "Animals consume nutritious fleshy fruit and excrete undamaged seeds elsewhere."
      },
      {
        "prompt": "What tree produces acorns that squirrels bury and forget, growing into new trees?",
        "choices": [
          "The pine tree",
          "The oak tree",
          "The birch tree"
        ],
        "answer": 1,
        "fact": "Oak trees rely on blue jays and squirrels caching acorns in soil."
      },
      {
        "prompt": "What do we call trees that lose their leaves every autumn and grow new ones in spring?",
        "choices": [
          "Conifers",
          "Evergreen trees",
          "Deciduous trees"
        ],
        "answer": 2,
        "fact": "Deciduous trees like maples and oaks shed leaves to conserve water during cold winters."
      },
      {
        "prompt": "What do we call trees that keep green needle-like leaves all year round, like pines and spruces?",
        "choices": [
          "Evergreen trees (conifers)",
          "Deciduous trees",
          "Annual plants"
        ],
        "answer": 0,
        "fact": "Evergreens have waxy, slender needles that resist freezing and water loss in winter."
      },
      {
        "prompt": "How can you tell the age of a felled tree trunk?",
        "choices": [
          "Measuring the depth of its roots",
          "Counting the growth rings in the wood",
          "Weighing its bark"
        ],
        "answer": 1,
        "fact": "Trees add one light ring (spring growth) and one dark ring (summer growth) each year."
      },
      {
        "prompt": "What is the outer protective layer of a tree trunk called, acting like a tree coat?",
        "choices": [
          "Sapwood",
          "Cambium",
          "Bark"
        ],
        "answer": 2,
        "fact": "Bark protects trees from insects, fungi, fires, and harsh weather."
      },
      {
        "prompt": "What do we call the dark, rich organic soil layer formed from decomposed leaves and dead plants?",
        "choices": [
          "Humus",
          "Gravel",
          "Bedrock"
        ],
        "answer": 0,
        "fact": "Humus is nutrient-rich soil matter that helps soil retain moisture."
      },
      {
        "prompt": "Which creature is known as 'nature's plough' because it tunnels through and enriches garden soil?",
        "choices": [
          "The snail",
          "The earthworm",
          "The caterpillar"
        ],
        "answer": 1,
        "fact": "Earthworms aerate soil and break down organic matter into fertile vermicompost."
      },
      {
        "prompt": "What is the continuous movement of water between Earth's surface and the sky called?",
        "choices": [
          "The wind spiral",
          "The rock cycle",
          "The water cycle"
        ],
        "answer": 2,
        "fact": "The water cycle moves water through evaporation, condensation, precipitation, and collection."
      },
      {
        "prompt": "What do we call rain, snow, sleet, or hail that falls from clouds to the ground?",
        "choices": [
          "Precipitation",
          "Evaporation",
          "Transpiration"
        ],
        "answer": 0,
        "fact": "Precipitation occurs when water droplets in clouds become too heavy to remain suspended."
      },
      {
        "prompt": "What are clouds made of in the sky?",
        "choices": [
          "Spun cotton wool",
          "Billions of tiny liquid water droplets or ice crystals floating together",
          "White smoke from volcanoes"
        ],
        "answer": 1,
        "fact": "Clouds form when rising invisible water vapour cools and condenses around dust specks."
      },
      {
        "prompt": "What optical phenomenon appears in the sky when sunlight shines through falling rain droplets?",
        "choices": [
          "A halo",
          "An aurora",
          "A rainbow"
        ],
        "answer": 2,
        "fact": "Raindrops act as tiny prisms that refract, reflect, and disperse sunlight into rainbow colors."
      },
      {
        "prompt": "What are the seven colours of the visible rainbow spectrum in order?",
        "choices": [
          "Red, orange, yellow, green, blue, indigo, violet",
          "Red, black, white, green, blue, pink, gray",
          "Yellow, green, cyan, magenta, black, white, gold"
        ],
        "answer": 0,
        "fact": "Roy G. Biv represents the order of rainbow wavelengths from longest to shortest."
      },
      {
        "prompt": "What causes the sound of thunder during a storm?",
        "choices": [
          "Clouds bumping into each other",
          "Super-heated air rapidly expanding and contracting around a lightning bolt",
          "Rain hitting the ground"
        ],
        "answer": 1,
        "fact": "Lightning heats air to 30,000\u00b0C in microseconds, producing an explosive shockwave."
      },
      {
        "prompt": "Why do we always see the lightning flash before we hear the thunder boom?",
        "choices": [
          "Sound gets absorbed by rain clouds",
          "Thunder is produced minutes after lightning",
          "Light travels vastly faster than sound"
        ],
        "answer": 2,
        "fact": "Light travels at 300,000 km/s, while sound travels at about 340 meters per second in air."
      },
      {
        "prompt": "What instrument measures wind speed in the outdoors?",
        "choices": [
          "An anemometer",
          "A barometer",
          "A rain gauge"
        ],
        "answer": 0,
        "fact": "An anemometer uses spinning cups to measure wind speed."
      },
      {
        "prompt": "What instrument measures atmospheric air pressure to help forecast the weather?",
        "choices": [
          "A thermometer",
          "A barometer",
          "A compass"
        ],
        "answer": 1,
        "fact": "Rising air pressure usually brings clear skies; falling pressure often brings rain."
      },
      {
        "prompt": "What scale measures the force and wind speed of storms and breezes from 0 to 12?",
        "choices": [
          "The Mohs scale",
          "The Richter scale",
          "The Beaufort scale"
        ],
        "answer": 2,
        "fact": "The Beaufort wind scale classifies winds from calm (0) to hurricane (12)."
      },
      {
        "prompt": "What do we call the preserved remains or traces of ancient animals and plants in rock?",
        "choices": [
          "Fossils",
          "Crystals",
          "Minerals"
        ],
        "answer": 0,
        "fact": "Fossils form when shells, bones, or plant imprints are mineralised over millions of years."
      },
      {
        "prompt": "In what type of rock are most fossils found?",
        "choices": [
          "Igneous rock (like basalt)",
          "Sedimentary rock (like limestone, shale, and sandstone)",
          "Metamorphic rock (like marble)"
        ],
        "answer": 1,
        "fact": "Sedimentary rocks form from layers of mud and sand that bury and preserve ancient remains."
      },
      {
        "prompt": "What rock forms when molten lava from a volcano cools and solidifies?",
        "choices": [
          "Fossil rock",
          "Sedimentary rock",
          "Igneous rock"
        ],
        "answer": 2,
        "fact": "Igneous rocks like basalt, pumice, and granite freeze from molten magma or lava."
      },
      {
        "prompt": "What type of rock is formed when existing rocks are altered by intense heat and pressure underground?",
        "choices": [
          "Metamorphic rock (like marble or slate)",
          "Sedimentary rock",
          "Igneous rock"
        ],
        "answer": 0,
        "fact": "Limestone transforms into metamorphic marble under deep Earth heat and pressure."
      },
      {
        "prompt": "What natural process breaks down rocks on Earth's surface into sand and pebbles over time?",
        "choices": [
          "Photosynthesis",
          "Weathering and erosion",
          "Metamorphosis"
        ],
        "answer": 1,
        "fact": "Wind, water, ice, and plant roots break down rock in physical and chemical weathering."
      },
      {
        "prompt": "What starts almost every food chain on Earth by producing its own food from sunlight?",
        "choices": [
          "An herbivore",
          "A carnivore",
          "A green plant (a producer)"
        ],
        "answer": 2,
        "fact": "Producers like plants and algae harness solar energy to synthesize food via photosynthesis."
      },
      {
        "prompt": "What do we call the position of an animal at the very top of its food chain with no natural predators?",
        "choices": [
          "An apex predator",
          "A primary producer",
          "A primary consumer"
        ],
        "answer": 0,
        "fact": "Apex predators like lions, killer whales, and polar bears sit at the top of their food webs."
      },
      {
        "prompt": "What is an interconnected network of multiple overlapping food chains in a habitat called?",
        "choices": [
          "A carbon cycle",
          "A food web",
          "A solar map"
        ],
        "answer": 1,
        "fact": "A food web shows all feeding relationships between producers and consumers in an ecosystem."
      },
      {
        "prompt": "What role do mushrooms, molds, and bacteria play in forest ecosystems?",
        "choices": [
          "Primary photosynthetic producers",
          "Apex predators",
          "Decomposers that recycle organic nutrients back into the soil"
        ],
        "answer": 2,
        "fact": "Decomposers break down dead organisms and plant litter into fertile soil nutrients."
      },
      {
        "prompt": "What underground network of fungal threads connects trees in a forest and shares nutrients?",
        "choices": [
          "Mycelium (the mycorrhizal network)",
          "Root lichen",
          "Forest bark"
        ],
        "answer": 0,
        "fact": "Mycorrhizal fungal networks help trees exchange sugars, water, and warning signals underground."
      },
      {
        "prompt": "What do pine cones do in wet, damp weather?",
        "choices": [
          "Open wide to release pollen",
          "Close their scales tightly to protect seeds from rotting",
          "Fall off the tree instantly"
        ],
        "answer": 1,
        "fact": "Pine cones close in humid weather to protect seeds, opening on dry sunny days for wind dispersal."
      },
      {
        "prompt": "Why do some trees produce sticky amber sap or resin when their bark is scratched?",
        "choices": [
          "To make maple syrup",
          "To attract birds",
          "To seal wounds and deter insects and fungi"
        ],
        "answer": 2,
        "fact": "Tree resin acts like an antiseptic band-aid, plugging physical bark injuries."
      },
      {
        "prompt": "What is the name of the sweet syrup tapped from sugar maple trees in early spring?",
        "choices": [
          "Maple syrup",
          "Olive oil",
          "Apple nectar"
        ],
        "answer": 0,
        "fact": "Boiling sap gathered from sugar maple trees produces rich maple syrup."
      },
      {
        "prompt": "What is a carnivorous plant that traps and digests flies in marshy, nitrogen-poor bogs?",
        "choices": [
          "The dandelion",
          "The Venus flytrap",
          "The stinging nettle"
        ],
        "answer": 1,
        "fact": "Venus flytraps snap shut in a tenth of a second when an insect triggers sensitive hairs on their lobes."
      },
      {
        "prompt": "Why do pitcher plants and sundews catch and digest insects?",
        "choices": [
          "To feed their roots with water",
          "Because they cannot photosynthesize",
          "To obtain essential nitrogen and minerals missing in boggy soil"
        ],
        "answer": 2,
        "fact": "Carnivorous plants still use photosynthesis for energy, but need insects for mineral nutrients."
      },
      {
        "prompt": "What causes the green leaves of deciduous trees to turn brilliant red, orange, and yellow in autumn?",
        "choices": [
          "Green chlorophyll breaks down, revealing carotenoid and anthocyanin pigments",
          "Trees absorb orange paint from soil",
          "Cold weather paints the leaf tips"
        ],
        "answer": 0,
        "fact": "As days shorten, trees reabsorb chlorophyll nutrients, unmasking yellow and red pigments."
      },
      {
        "prompt": "What common garden flower turns its bright yellow blossom throughout the day to track the Sun across the sky?",
        "choices": [
          "The rose",
          "The sunflower",
          "The tulip"
        ],
        "answer": 1,
        "fact": "Young sunflowers exhibit heliotropism, turning from east to west with the Sun."
      },
      {
        "prompt": "What do we call the fine yellow powder produced by the male part of a flower?",
        "choices": [
          "Sap",
          "Nectar",
          "Pollen"
        ],
        "answer": 2,
        "fact": "Pollen grains carry the male genetic cells to the stigma of flowers for seed development."
      },
      {
        "prompt": "What insect is famous for making long multi-generational migrations from Canada to Mexico every autumn?",
        "choices": [
          "The monarch butterfly",
          "The honeybee",
          "The ladybug"
        ],
        "answer": 0,
        "fact": "Monarchs fly up to 4,000 km to spend winter in the oyamel fir forests of central Mexico."
      },
      {
        "prompt": "What small round insect is a helpful garden predator that eats garden pests like aphids?",
        "choices": [
          "The garden slug",
          "The ladybird (ladybug)",
          "The flea"
        ],
        "answer": 1,
        "fact": "A single ladybird can consume up to 5,000 plant-damaging aphids during its lifetime."
      },
      {
        "prompt": "What do we call plants that complete their entire life cycle from seed to flower to death in just one year?",
        "choices": [
          "Biennials",
          "Perennials",
          "Annuals"
        ],
        "answer": 2,
        "fact": "Annual plants grow, flower, set seed, and die within a single growing season."
      },
      {
        "prompt": "What do we call plants that live and bloom for many years, like lavender and roses?",
        "choices": [
          "Perennials",
          "Annuals",
          "Biennials"
        ],
        "answer": 0,
        "fact": "Perennials regrow season after season from persistent root systems."
      },
      {
        "prompt": "What non-flowering green plants reproduce using spores instead of seeds and have feathery fronds?",
        "choices": [
          "Roses",
          "Ferns",
          "Daisies"
        ],
        "answer": 1,
        "fact": "Ancient plants like ferns and mosses reproduce via tiny dust-like spores under their fronds."
      },
      {
        "prompt": "What spongy, rootless green plant grows in damp, shaded woods and absorbs water directly through its leaves?",
        "choices": [
          "Oak tree",
          "Sunflower",
          "Moss"
        ],
        "answer": 2,
        "fact": "Mosses are non-vascular plants that carpet damp stones and forest floors."
      },
      {
        "prompt": "What dual organism is formed by a mutual partnership between a fungus and an alga?",
        "choices": [
          "Lichen",
          "Fern",
          "Mistletoe"
        ],
        "answer": 0,
        "fact": "In a lichen, the alga provides sugars via photosynthesis while the fungus provides structure and moisture."
      },
      {
        "prompt": "Why is topsoil so important for all terrestrial life on Earth?",
        "choices": [
          "It reflects cosmic radiation",
          "It contains the water, minerals, and organic nutrients needed for plants to grow",
          "It keeps the Earth from spinning too fast"
        ],
        "answer": 1,
        "fact": "Healthy topsoil produces roughly 95% of the food consumed by humanity."
      },
      {
        "prompt": "How do tree roots protect riverbanks and steep hillsides during heavy rainstorms?",
        "choices": [
          "They turn soil into hard stone",
          "They drink 100% of the river water",
          "Their dense root networks bind and hold soil particles in place, preventing mudslides"
        ],
        "answer": 2,
        "fact": "Plant root systems anchor soil, preventing erosion from wind and rain runoff."
      },
      {
        "prompt": "What is an underground layer of permeable rock or gravel holding fresh groundwater called?",
        "choices": [
          "An aquifer",
          "A volcano",
          "A crater"
        ],
        "answer": 0,
        "fact": "Wells pump drinking and irrigation water from subterranean aquifers."
      },
      {
        "prompt": "What natural wetland acts as a giant sponge that filters and cleanses water before it reaches rivers and lakes?",
        "choices": [
          "Deserts",
          "Marshes and bogs",
          "High mountain peaks"
        ],
        "answer": 1,
        "fact": "Wetlands filter pollutants, trap excess sediments, and buffer against river flooding."
      },
      {
        "prompt": "What is compost made from in a garden?",
        "choices": [
          "Sand and sea salt",
          "Crushed plastic bottles",
          "Decomposed organic plant scraps, fruit peelings, and leaves"
        ],
        "answer": 2,
        "fact": "Composting transforms organic waste into fertile fertilizer rich in plant nutrients."
      },
      {
        "prompt": "What do we call animals like frogs and salamanders whose body temperature matches their surroundings?",
        "choices": [
          "Cold-blooded (ectotherms)",
          "Warm-blooded (endotherms)",
          "Constant-temp organisms"
        ],
        "answer": 0,
        "fact": "Ectotherms regulate body heat by basking on warm rocks or seeking shade."
      },
      {
        "prompt": "What do we call animals like birds and mammals that generate their own internal body heat?",
        "choices": [
          "Cold-blooded (ectotherms)",
          "Warm-blooded (endotherms)",
          "Solar animals"
        ],
        "answer": 1,
        "fact": "Endotherms maintain a steady internal body temperature regardless of cold weather."
      },
      {
        "prompt": "What do honeybees build inside their hives using wax secreted from their own bodies?",
        "choices": [
          "Square wooden boxes",
          "Circular clay tubes",
          "Hexagonal honeycomb cells"
        ],
        "answer": 2,
        "fact": "Hexagons provide the most storage space while using the minimum amount of wax boundary."
      },
      {
        "prompt": "What is the name of the sweet liquid that flowers produce at the base of their petals to reward pollinators?",
        "choices": [
          "Nectar",
          "Honey",
          "Sap"
        ],
        "answer": 0,
        "fact": "Nectar is a sugar-rich liquid that fuels bees, butterflies, bats, and hummingbirds."
      },
      {
        "prompt": "What do beavers eat primarily in the forest?",
        "choices": [
          "Trout and salmon fish",
          "The inner bark and tender twigs of trees like willow, birch, and aspen",
          "Berries and honey"
        ],
        "answer": 1,
        "fact": "Beavers are strict herbivores that eat wood bark, water lilies, and aquatic plants."
      },
      {
        "prompt": "How do fireflies produce their glowing flashes during warm summer evenings?",
        "choices": [
          "Reflecting car headlights",
          "Stored static electricity from flying",
          "A chemical reaction between luciferin, oxygen, and ATP in their lantern organ"
        ],
        "answer": 2,
        "fact": "Bioluminescence allows fireflies to communicate and identify species-specific flash patterns to find mates."
      },
      {
        "prompt": "What do we call small pieces of ice that bounce off the ground during severe summer thunderstorms?",
        "choices": [
          "Hailstones",
          "Snowflakes",
          "Sleet"
        ],
        "answer": 0,
        "fact": "Strong storm updrafts carry raindrops into subzero freezing altitudes repeatedly, growing layers of ice into hailstones."
      },
      {
        "prompt": "Why are snowflakes famous for having unique shapes, yet almost all have six sides or points?",
        "choices": [
          "Wind cuts them into hexagons",
          "Water molecules naturally arrange in six-sided hexagonal lattices as they freeze",
          "Each cloud has six corners"
        ],
        "answer": 1,
        "fact": "Hydrogen bonds between water molecules lock into hexagonal symmetry at low temperatures."
      },
      {
        "prompt": "What is dew on grass in the early morning?",
        "choices": [
          "Sap pushed out by plant roots",
          "Light morning rain that fell silently",
          "Water vapour from air that condensed onto cool blades of grass overnight"
        ],
        "answer": 2,
        "fact": "Surfaces cool at night; when surface temperature drops below the air's dew point, moisture condenses."
      },
      {
        "prompt": "What is fog?",
        "choices": [
          "A low-lying cloud resting near the ground",
          "Toxic industrial smoke",
          "Ocean water evaporated by volcanoes"
        ],
        "answer": 0,
        "fact": "Fog is simply a low cloud formed when humid air near the ground cools to condensation."
      },
      {
        "prompt": "What causes ocean waves to break and roll onto sandy beaches?",
        "choices": [
          "Underwater earthquakes only",
          "Wind blowing across the ocean's surface",
          "Fish swimming together"
        ],
        "answer": 1,
        "fact": "Friction between blowing wind and surface water transfers energy into traveling swells."
      },
      {
        "prompt": "What is a massive, slow-moving river of compacted ice and snow called?",
        "choices": [
          "An iceberg",
          "An avalanche",
          "A glacier"
        ],
        "answer": 2,
        "fact": "Glaciers carve U-shaped valleys and transport boulders over thousands of years."
      },
      {
        "prompt": "What is a chunk of glacial ice that breaks off into the ocean and floats away called?",
        "choices": [
          "An iceberg",
          "A sea stack",
          "A coral atoll"
        ],
        "answer": 0,
        "fact": "Calving occurs when glacier edges collapse into water; roughly 90% of an iceberg sits submerged."
      },
      {
        "prompt": "What percentage of planet Earth's surface is covered by oceans and seas?",
        "choices": [
          "About 25%",
          "About 71%",
          "About 50%"
        ],
        "answer": 1,
        "fact": "Oceans cover roughly 71% of Earth's surface, holding 97% of all our water."
      },
      {
        "prompt": "Where is the majority of Earth's freshwater located?",
        "choices": [
          "In rain clouds",
          "In rivers and streams",
          "Locked in ice caps and glaciers (like Antarctica and Greenland)"
        ],
        "answer": 2,
        "fact": "Around 68% of fresh water is frozen in ice sheets, with another 30% stored as groundwater."
      },
      {
        "prompt": "What does deciduous tree leaf litter decompose into on the woodland floor?",
        "choices": [
          "Leaf mold (rich compost)",
          "Sand",
          "Lava rock"
        ],
        "answer": 0,
        "fact": "Decaying fallen leaves form rich woodland compost that nourishes future seedlings."
      },
      {
        "prompt": "Why do nettles cause a stinging, itching rash when brushed with bare skin?",
        "choices": [
          "They give an electric shock",
          "Tiny hollow silica needles inject formic acid and histamine",
          "They carry poisonous thorns"
        ],
        "answer": 1,
        "fact": "Nettle hairs snap like brittle glass needles, injecting stinging chemicals to deter herbivores."
      },
      {
        "prompt": "Which common garden plant has soothing cooling gel inside its thick fleshy leaves?",
        "choices": [
          "Thistle",
          "Stinging nettle",
          "Aloe vera"
        ],
        "answer": 2,
        "fact": "Aloe vera gel contains polysaccharides that soothe burns and hydrate skin."
      },
      {
        "prompt": "What do seeds use for nutrition before they grow green leaves and can photosynthesize?",
        "choices": [
          "Food stored in their cotyledons (seed leaves)",
          "Nutrients drawn from the air",
          "Rainwater minerals only"
        ],
        "answer": 0,
        "fact": "Seeds store starch and oils inside cotyledons to power early root and shoot growth."
      },
      {
        "prompt": "What is the male part of a flower that produces pollen grains called?",
        "choices": [
          "The pistil (carpel)",
          "The stamen",
          "The petal"
        ],
        "answer": 1,
        "fact": "The stamen consists of the filament and the pollen-bearing anther."
      },
      {
        "prompt": "What is the female part of a flower that receives pollen and contains the ovule called?",
        "choices": [
          "The sepals",
          "The stamen",
          "The pistil (carpel)"
        ],
        "answer": 2,
        "fact": "The pistil includes the sticky stigma, the style, and the ovary where seeds develop."
      },
      {
        "prompt": "How does pollination happen in grasses, cereal crops, and oak trees?",
        "choices": [
          "Wind blows billions of tiny lightweight pollen grains through the air",
          "Bees carry heavy sticky pollen",
          "Birds eat the flower tips"
        ],
        "answer": 0,
        "fact": "Wind-pollinated plants have inconspicuous flowers and dangling stamens that shed pollen to the breeze."
      },
      {
        "prompt": "What do we call an insect in the resting stage inside a chrysalis or cocoon?",
        "choices": [
          "A larva",
          "A pupa",
          "A nymph"
        ],
        "answer": 1,
        "fact": "Inside the pupa, larval tissues break down and reassemble into adult butterfly organs."
      },
      {
        "prompt": "What do we call the newly hatched worm-like stage of an insect, like a maggot or caterpillar?",
        "choices": [
          "An imago",
          "A pupa",
          "A larva"
        ],
        "answer": 2,
        "fact": "The larval stage focuses almost entirely on eating and storing energy for metamorphosis."
      },
      {
        "prompt": "What is an adult, fully formed insect called?",
        "choices": [
          "An adult (or imago)",
          "A pupa",
          "A nymph"
        ],
        "answer": 0,
        "fact": "The adult imago stage focuses on flight, dispersal, and reproduction."
      },
      {
        "prompt": "Why do some insects, like stick insects and katydids, look exactly like twigs or green leaves?",
        "choices": [
          "To attract bees",
          "Camouflage against hungry predators like birds",
          "To absorb extra sunlight"
        ],
        "answer": 1,
        "fact": "Leaf and stick mimicry prevents visually hunting birds from spotting the insects."
      },
      {
        "prompt": "What do ants leave on the ground so nest mates can follow the trail to food sources?",
        "choices": [
          "Tiny stone markers",
          "Colored dots of spit",
          "Chemical scent trails (pheromones)"
        ],
        "answer": 2,
        "fact": "Ants lay pheromone lines that reinforce as more workers successfully transport food."
      },
      {
        "prompt": "What is the main role of the Queen ant in an underground colony?",
        "choices": [
          "Laying eggs to populate the entire colony",
          "Gathering seeds from fields",
          "Digging new tunnels"
        ],
        "answer": 0,
        "fact": "Queen ants can live for decades, laying millions of eggs over their lifespans."
      },
      {
        "prompt": "What do aphids do to garden plants that makes them a pest?",
        "choices": [
          "Chew up the roots into dust",
          "Suck sap from plant stems and transmit plant viruses",
          "Block sunlight from the leaves"
        ],
        "answer": 1,
        "fact": "Aphids pierce plant stems with needle mouthparts, stealing sugar-rich sap."
      },
      {
        "prompt": "Why do ants often 'farm' and protect herds of aphids on plant stems?",
        "choices": [
          "Aphids build shelters for the ants",
          "Aphids teach young ants to hunt",
          "Aphids secrete sweet honeydew that ants love to drink"
        ],
        "answer": 2,
        "fact": "Ants gently stroke aphids to collect honeydew, defending them aggressively against ladybirds."
      },
      {
        "prompt": "What fungal growth produces a circle of mushrooms on a lawn called a 'fairy ring'?",
        "choices": [
          "An underground mycelium expanding outward in a growing circle",
          "Mushrooms planted by fairies",
          "Raindrops falling in circles"
        ],
        "answer": 0,
        "fact": "The fungal mycelium spreads outward underground as it exhausts nutrients in the center."
      },
      {
        "prompt": "What do trees produce in spring that open into leaves and flowers?",
        "choices": [
          "Bark",
          "Buds",
          "Acorns"
        ],
        "answer": 1,
        "fact": "Buds formed in late summer lie dormant under protective scales through winter until spring."
      },
      {
        "prompt": "What is the sweet liquid produced inside hives by honeybees called?",
        "choices": [
          "Pollen bread",
          "Sap",
          "Honey"
        ],
        "answer": 2,
        "fact": "Honey is dehydrated, enzyme-ripened nectar stored in wax honeycomb cells."
      },
      {
        "prompt": "Which animal group has cold-blooded scaly bodies, clawed toes, and lays eggs on land?",
        "choices": [
          "Reptiles",
          "Amphibians",
          "Mammals"
        ],
        "answer": 0,
        "fact": "Snakes, turtles, tortoises, and lizards are reptiles."
      },
      {
        "prompt": "What is the name of the white substance that forms when water vapor freezes directly onto cold objects without raining?",
        "choices": [
          "Hail",
          "Frost (hoarfrost)",
          "Dew"
        ],
        "answer": 1,
        "fact": "Frost forms when surfaces drop below freezing and water vapor deposits directly as ice crystals."
      },
      {
        "prompt": "What natural hazard is caused by rapid vibrations of Earth's crust along fault lines?",
        "choices": [
          "A rainbow",
          "A tornado",
          "An earthquake"
        ],
        "answer": 2,
        "fact": "Earthquakes occur when tectonic plates slip suddenly, releasing stored elastic energy."
      },
      {
        "prompt": "What mountain feature has a vent that allows magma, volcanic ash, and gas to erupt from deep within Earth?",
        "choices": [
          "A volcano",
          "A glacier",
          "A sand dune"
        ],
        "answer": 0,
        "fact": "Volcanoes form where molten rock breaches Earth's crust at plate boundaries or mantle hotspots."
      },
      {
        "prompt": "What is molten rock called while it is still beneath Earth's surface?",
        "choices": [
          "Lava",
          "Magma",
          "Basalt"
        ],
        "answer": 1,
        "fact": "Underground molten rock is called magma; once it breaks through the surface, it is called lava."
      },
      {
        "prompt": "What is molten rock called once it flows out onto Earth's surface?",
        "choices": [
          "Granite",
          "Magma",
          "Lava"
        ],
        "answer": 2,
        "fact": "Lava flows and cools into volcanic igneous rocks like pumice and basalt."
      },
      {
        "prompt": "What famous circle of active volcanoes and tectonic faults surrounds the Pacific Ocean?",
        "choices": [
          "The Ring of Fire",
          "The Great Rift Valley",
          "The Bermuda Triangle"
        ],
        "answer": 0,
        "fact": "The Pacific Ring of Fire hosts about 75% of the world's volcanoes and 90% of its earthquakes."
      }
    ]
  }
];

window.SCIENCE_MISSIONS = SCIENCE_MISSIONS;

const SCIENCE_DIFFICULTY_CHOICE_COUNTS = { easy: 2, medium: 3, hard: 4 };

Object.assign(App.prototype, {
  showScienceExplorers() {
    this.currentView = 'science';
    this.scienceGame = null;
    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'science';
    this.updateHeader();

    main.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div class="flex items-center justify-between mb-6">
          <button data-action="learning" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition font-bold group">
            <span class="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Raven &amp; Llama Learning</span>
          </button>
          <button data-action="home" class="text-xs text-slate-400 hover:text-white">🏠 Home</button>
        </div>

        <div class="relative bg-gradient-to-r from-sky-950 via-slate-900 to-emerald-950 border-2 border-sky-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 overflow-hidden">
          <div class="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="text-center md:text-left">
              <div class="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 text-xs font-bold px-3 py-1 rounded-full border border-sky-500/30 mb-2">
                <span>🔬</span><span>Raven &amp; Llama Discovery Lab</span>
              </div>
              <h1 class="font-ninja text-3xl sm:text-4xl text-white font-bold tracking-wide">Science Explorers</h1>
              <p class="text-slate-300 text-sm sm:text-base mt-2 max-w-xl">Ask questions, follow the clues, and earn a star for every correct discovery.</p>
            </div>
            <div class="text-center bg-slate-950/60 border border-sky-800/70 rounded-2xl px-5 py-3">
              <div class="text-3xl">🪶 🦙</div>
              <p class="text-xs text-sky-200 mt-1">Curiosity is your superpower!</p>
            </div>
          </div>
        </div>

        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-ninja text-2xl text-white font-bold">Choose a Mission</h2>
          <span class="text-xs text-slate-400">5 clues in every mission</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          ${SCIENCE_MISSIONS.map(mission => `
            <div class="science-mission-card group w-full text-left relative bg-slate-900 border-2 border-slate-700 ${mission.theme.border} rounded-3xl p-5 sm:p-6 shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div class="flex items-start gap-4">
                <div class="w-14 h-14 rounded-2xl ${mission.theme.icon} border flex items-center justify-center text-3xl">${mission.icon}</div>
                <div class="flex-1">
                  <span class="science-mission-topic text-[10px] uppercase tracking-wider ${mission.theme.topic} font-bold">${mission.topic}</span>
                  <h3 class="font-ninja text-xl font-bold text-white ${mission.theme.title}">${mission.title}</h3>
                </div>
                <span class="${mission.theme.arrow} text-xl" aria-hidden="true">→</span>
              </div>
              <p class="text-slate-300 text-sm mt-4">${mission.description}</p>
              <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span class="text-slate-400">5 questions · Learn as you play</span>
                <span class="science-mission-reward text-amber-300 font-bold">⭐ 5 stars to find</span>
              </div>
              <p class="mt-4 text-xs font-bold text-sky-300">Choose your difficulty</p>
              <div class="grid grid-cols-3 gap-2 mt-2">
                ${Object.keys(SCIENCE_DIFFICULTY_CHOICE_COUNTS).map(difficulty => `
                  <button type="button" data-action="science-start" data-mission-id="${mission.id}" data-difficulty="${difficulty}"
                          aria-label="${mission.title}, ${difficulty} difficulty"
                          class="rounded-xl bg-sky-900 hover:bg-sky-800 px-2 py-2 text-sm font-bold text-white capitalize">${difficulty}</button>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  startScienceMission(missionId, difficulty = 'medium') {
    const mission = SCIENCE_MISSIONS.find(item => item.id === missionId);
    if (!mission) return this.showScienceExplorers();
    if (!Object.hasOwn(SCIENCE_DIFFICULTY_CHOICE_COUNTS, difficulty)) difficulty = 'medium';
    const pool = [...mission.questions];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const selectedQuestions = pool.slice(0, 5).map(question => {
      const correctChoice = question.choices[question.answer];
      const choices = question.choices.filter((_, index) => index !== question.answer);
      if (difficulty === 'hard') {
        const otherChoices = [...new Set(mission.questions.flatMap(item => item.choices))]
          .filter(choice => choice !== correctChoice && !question.choices.includes(choice));
        for (let i = otherChoices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [otherChoices[i], otherChoices[j]] = [otherChoices[j], otherChoices[i]];
        }
        choices.push(...otherChoices.slice(0, 1));
      }
      const selectedChoices = [correctChoice, ...choices.slice(0, SCIENCE_DIFFICULTY_CHOICE_COUNTS[difficulty] - 1)];
      for (let i = selectedChoices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selectedChoices[i], selectedChoices[j]] = [selectedChoices[j], selectedChoices[i]];
      }
      return { ...question, choices: selectedChoices, answer: selectedChoices.indexOf(correctChoice) };
    });
    this.scienceGame = {
      mission: { ...mission, questions: selectedQuestions },
      difficulty,
      index: 0,
      correct: 0,
      answered: false,
      lastAnswerCorrect: false,
      selectedIndex: null,
      awarded: false
    };
    this.renderScienceQuestion();
  },

  renderScienceQuestion() {
    const main = document.getElementById('app-main');
    const game = this.scienceGame;
    if (!main || !game) return;
    if (game.index >= game.mission.questions.length) return this.finishScienceMission();

    const question = game.mission.questions[game.index];
    main.innerHTML = `
      <div class="play-shell play-shell--science max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <div class="play-hud flex items-center justify-between mb-6">
          <button data-action="science-home" class="play-hud__exit text-sm text-sky-300 hover:text-white font-bold">← Back to missions</button>
          <span class="play-hud__title text-xs text-slate-400">${game.mission.icon} ${game.mission.title} · ${game.difficulty} difficulty</span>
        </div>
        <div class="play-question-card science-question-card bg-slate-900 border-2 border-sky-800/70 rounded-3xl p-5 sm:p-8 shadow-2xl">
          <div class="flex items-center justify-between gap-4 mb-3">
            <span class="text-xs uppercase tracking-wider text-sky-300 font-bold">${game.mission.topic}</span>
            <span class="text-sm text-slate-300 font-bold">Clue ${game.index + 1} of ${game.mission.questions.length} <span class="text-amber-300 ml-2">⭐ ${game.correct}</span></span>
          </div>
          <progress class="play-progress science-progress w-full mb-6" aria-label="Mission progress" max="${game.mission.questions.length}" value="${game.index + 1}"></progress>
          <div class="text-center mb-6">
            <div class="text-5xl mb-3">${game.mission.icon}</div>
            <h2 class="play-prompt font-ninja text-2xl sm:text-3xl text-white font-bold">${question.prompt}</h2>
          </div>
          <div class="grid grid-cols-1 gap-3">
            ${question.choices.map((choice, index) => {
              let choiceClass = 'border-slate-700 bg-slate-950/70 hover:border-sky-400 text-white';
              if (game.answered) {
                if (game.lastAnswerCorrect && index === question.answer) {
                  choiceClass = 'is-correct border-emerald-400 bg-emerald-950/50 text-emerald-100';
                } else if (!game.lastAnswerCorrect && index === game.selectedIndex) {
                  choiceClass = 'is-incorrect border-rose-500 bg-rose-950/50 text-rose-200';
                }
              }
              return `
                <button type="button" data-action="science-answer" data-index="${index}" data-science-choice="${index}" ${game.answered ? 'disabled' : ''}
                        class="science-choice w-full text-left px-4 py-3 rounded-xl border-2 ${choiceClass} disabled:cursor-default font-semibold transition">
                  <span class="inline-flex w-7 h-7 rounded-lg bg-slate-800 items-center justify-center text-xs text-sky-300 mr-2">${String.fromCharCode(65 + index)}</span>${choice}
                </button>
              `;
            }).join('')}
          </div>
          ${game.answered ? `
            <div class="play-feedback science-feedback mt-5 p-4 rounded-2xl ${game.lastAnswerCorrect ? 'is-correct bg-emerald-950/60 border border-emerald-700' : 'is-incorrect bg-amber-950/50 border border-amber-800'}" role="status" aria-live="polite">
              <p class="font-bold">${game.lastAnswerCorrect ? 'Great discovery! +1 star ⭐' : 'Not quite! Keep exploring!'}</p>
              ${game.lastAnswerCorrect && question.fact ? `<p class="text-sm text-slate-200 mt-1">${question.fact}</p>` : ''}
            </div>
            <button type="button" data-action="science-continue" class="btn-ninja w-full mt-4 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-ninja font-bold">
              ${game.index + 1 === game.mission.questions.length ? 'Finish Mission 🏁' : 'Next Clue →'}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  },

  answerScienceQuestion(choiceIndex) {
    const game = this.scienceGame;
    if (!game || game.answered) return;
    const question = game.mission.questions[game.index];
    if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex >= question.choices.length) return;
    game.answered = true;
    game.selectedIndex = choiceIndex;
    game.lastAnswerCorrect = choiceIndex === question.answer;
    if (game.lastAnswerCorrect) game.correct++;
    window.soundFX?.[game.lastAnswerCorrect ? 'playCorrect' : 'playWrong']();
    this.renderScienceQuestion();
  },

  continueScienceMission() {
    const game = this.scienceGame;
    if (!game?.answered) return;
    game.index++;
    game.answered = false;
    game.selectedIndex = null;
    this.renderScienceQuestion();
  },

  finishScienceMission() {
    const game = this.scienceGame;
    const main = document.getElementById('app-main');
    if (!game || !main) return;
    if (!game.awarded) {
      game.awarded = true;
      if (game.correct > 0) {
        const profile = ProfileManager.getActiveProfile();
        profile.stars += game.correct;
        ProfileManager.updateProfile(profile);
      }
    }

    main.innerHTML = `
      <div class="play-shell play-shell--science max-w-xl mx-auto px-4 py-10 text-center">
        <div class="play-question-card science-result-card bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-7 sm:p-10 shadow-2xl">
          <div class="text-6xl mb-4">${game.correct === game.mission.questions.length ? '🏆' : '🔬'}</div>
          <p class="text-xs uppercase tracking-widest text-emerald-300 font-bold">${game.mission.title}</p>
          <h1 class="font-ninja text-3xl text-white font-bold mt-1">Mission Complete!</h1>
          <p class="text-slate-300 mt-3">You solved <strong class="text-white">${game.correct} of ${game.mission.questions.length}</strong> clues and earned <strong class="text-amber-300">⭐ ${game.correct} ${game.correct === 1 ? 'star' : 'stars'}</strong>.</p>
          <p class="text-sm text-slate-400 mt-2">${game.correct === game.mission.questions.length ? 'Fantastic science detective work!' : 'Every clue is a chance to discover something new!'}</p>
          <div class="flex flex-col sm:flex-row gap-3 mt-7">
            <button type="button" data-action="science-start" data-mission-id="${game.mission.id}" class="btn-ninja flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Play Again 🔁</button>
            <button type="button" data-action="science-home" class="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold">Choose Another Mission</button>
          </div>
        </div>
      </div>
    `;
  }
});

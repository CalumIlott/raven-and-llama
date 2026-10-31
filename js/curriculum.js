// Curriculum definition for Raven & Llama Learning Maths Masters
const BELTS_DATA = [
  {
    id: 'white',
    name: 'White Belt',
    level: 1,
    color: '#ffffff',
    textColor: 'text-slate-900',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    ribbonClass: 'belt-ribbon-white',
    glowClass: 'belt-white-glow',
    description: 'The foundation of the Ninja Dojo! Counting, dot patterns, and splitting numbers.',
    arcadeGame: {
      id: 'balloon_pop',
      title: 'Ninja Balloon Pop 🎈',
      icon: 'sparkles',
      description: 'Pop floating balloons matching target subitising dot counts before they float away!'
    },
    skills: [
      {
        id: 'white_subitising',
        name: 'Subitising Master',
        icon: 'dice-5',
        timeLimitSeconds: 16,
        description: 'Instantly recognise patterns of dots without counting them one-by-one (1 to 10).'
      },
      {
        id: 'white_counting_10',
        name: 'Counting Master 0-10',
        icon: 'hash',
        timeLimitSeconds: 28,
        description: 'Count groups of objects up to 10 accurately.'
      },
      {
        id: 'white_recognition',
        name: 'Recognition Master',
        icon: 'eye',
        timeLimitSeconds: 24,
        description: 'Match number words with numerals (e.g. "seven" = 7).'
      },
      {
        id: 'white_writing_10',
        name: 'Writing Master 0-10',
        icon: 'pen-tool',
        timeLimitSeconds: 28,
        description: 'Identify and complete sequences for numbers 0 to 10.'
      },
      {
        id: 'white_partitioning',
        name: 'Partitioning Master 3-9',
        icon: 'split',
        timeLimitSeconds: 28,
        description: 'Break numbers 3 to 9 into two parts (e.g. 5 is 2 and 3).'
      }
    ]
  },
  {
    id: 'yellow',
    name: 'Yellow Belt',
    level: 2,
    color: '#facc15',
    textColor: 'text-yellow-950',
    bgColor: 'bg-yellow-400',
    borderColor: 'border-yellow-400',
    ribbonClass: 'belt-ribbon-yellow',
    glowClass: 'belt-yellow-glow',
    description: 'Double power, tens frames, and friends of 10!',
    arcadeGame: {
      id: 'potion_match',
      title: 'Tens Mate Alchemy Potion Match 🧪',
      icon: 'flask-conical',
      description: 'Catch falling numbered potions and combine pairs that sum to 10 or make doubles!'
    },
    skills: [
      {
        id: 'yellow_subitising',
        name: 'Subitising Master',
        icon: 'layout-grid',
        timeLimitSeconds: 16,
        description: 'Quickly recognise numbers shown in tens frames.'
      },
      {
        id: 'yellow_doubles',
        name: 'Doubles Master',
        icon: 'copy',
        timeLimitSeconds: 22,
        description: 'Master doubles up to 10 + 10 (e.g. 6 + 6 = 12).'
      },
      {
        id: 'yellow_counting_20',
        name: 'Counting 0-20 Master',
        icon: 'list-ordered',
        timeLimitSeconds: 28,
        description: 'Count objects and sequences from 0 to 20.'
      },
      {
        id: 'yellow_writing_20',
        name: 'Writing Master 0-20',
        icon: 'pen-tool',
        timeLimitSeconds: 28,
        description: 'Read and identify numerals and words from 0 to 20.'
      },
      {
        id: 'yellow_tens_mate',
        name: 'Tens Mate Master',
        icon: 'heart-handshake',
        timeLimitSeconds: 22,
        description: 'Find the friends of 10 that add up to 10 (e.g. 7 + ? = 10).'
      },
      {
        id: 'yellow_more_less',
        name: 'More or Less Master',
        icon: 'arrow-up-down',
        timeLimitSeconds: 24,
        description: 'Find 1 more, 1 less, or compare quantities up to 20.'
      }
    ]
  },
  {
    id: 'green',
    name: 'Green Belt',
    level: 3,
    color: '#22c55e',
    textColor: 'text-white',
    bgColor: 'bg-emerald-600',
    borderColor: 'border-emerald-500',
    ribbonClass: 'belt-ribbon-green',
    glowClass: 'belt-green-glow',
    description: 'Addition, halving, skip counting, and place value!',
    arcadeGame: {
      id: 'platform_runner',
      title: 'Ninja Platform Runner 🏃‍♂️',
      icon: 'footprints',
      description: 'Jump across stepping stone platforms matching skip counts and even halves!'
    },
    skills: [
      {
        id: 'green_halving',
        name: 'Halving Master',
        icon: 'scissors',
        timeLimitSeconds: 22,
        description: 'Halve even numbers up to 20 (e.g. Half of 14 is 7).'
      },
      {
        id: 'green_addition',
        name: 'Addition Master',
        icon: 'plus',
        timeLimitSeconds: 24,
        description: 'Fluent addition facts within 20.'
      },
      {
        id: 'green_counting',
        name: 'Counting Master',
        icon: 'fast-forward',
        timeLimitSeconds: 28,
        description: 'Skip count fluently by 2s, 5s, and 10s.'
      },
      {
        id: 'green_reading_writing',
        name: 'Reading & Writing Master',
        icon: 'book-open',
        timeLimitSeconds: 30,
        description: 'Read, write and identify numbers up to 100.'
      },
      {
        id: 'green_renaming',
        name: 'Renaming Master',
        icon: 'layers',
        timeLimitSeconds: 30,
        description: 'Rename numbers into Tens and Ones (e.g. 43 = 4 tens and 3 ones).'
      },
      {
        id: 'green_order',
        name: 'Order Master',
        icon: 'arrow-down-narrow-wide',
        timeLimitSeconds: 36,
        description: 'Order 2-digit numbers from smallest to largest.'
      },
      {
        id: 'green_1_10',
        name: '1-10 Master',
        icon: 'zap',
        timeLimitSeconds: 18,
        description: 'Fast, automatic basic addition and subtraction with numbers 1-10.'
      }
    ]
  },
  {
    id: 'blue',
    name: 'Blue Belt',
    level: 4,
    color: '#3b82f6',
    textColor: 'text-white',
    bgColor: 'bg-blue-600',
    borderColor: 'border-blue-500',
    ribbonClass: 'belt-ribbon-blue',
    glowClass: 'belt-blue-glow',
    description: 'Flexible strategies, factors, expanded forms, and balanced equations!',
    arcadeGame: {
      id: 'shuriken_gallery',
      title: 'Shuriken Target Gallery 🎯',
      icon: 'target',
      description: 'Aim and slice moving wooden target boards to balance equations and hit factors!'
    },
    skills: [
      {
        id: 'blue_doubling_halving',
        name: 'Doubling & halving Master',
        icon: 'scale',
        timeLimitSeconds: 28,
        description: 'Double and halve 2-digit numbers using mental strategies.'
      },
      {
        id: 'blue_flexible_thinking',
        name: 'Flexible Thinking + Master',
        icon: 'brain',
        timeLimitSeconds: 30,
        description: 'Use bridge-to-10 and split strategies for mental addition.'
      },
      {
        id: 'blue_factor',
        name: 'Factor Master',
        icon: 'key',
        timeLimitSeconds: 28,
        description: 'Identify factors and multiples of numbers up to 50.'
      },
      {
        id: 'blue_partitioning',
        name: 'Partitioning Master',
        icon: 'boxes',
        timeLimitSeconds: 30,
        description: 'Partition numbers into Hundreds, Tens, and Ones.'
      },
      {
        id: 'blue_subtraction',
        name: 'Subtraction Master',
        icon: 'minus',
        timeLimitSeconds: 28,
        description: 'Mental subtraction strategies for numbers within 100.'
      },
      {
        id: 'blue_balanced_equation',
        name: 'Balanced Equation Master',
        icon: 'equal',
        timeLimitSeconds: 32,
        description: 'Balance both sides of equations (e.g. 7 + 8 = ? + 5).'
      }
    ]
  },
  {
    id: 'brown',
    name: 'Brown Belt',
    level: 5,
    color: '#b45309',
    textColor: 'text-white',
    bgColor: 'bg-amber-800',
    borderColor: 'border-amber-700',
    ribbonClass: 'belt-ribbon-brown',
    glowClass: 'belt-brown-glow',
    description: 'Multiplication times tables, arrays, fractions, and thousand place values!',
    arcadeGame: {
      id: 'asteroid_blaster',
      title: 'Space Ninja Asteroid Blaster 🚀',
      icon: 'rocket',
      description: 'Pilot your spaceship and laser-blast incoming asteroids displaying multiples of your times tables!'
    },
    skills: [
      {
        id: 'brown_order',
        name: 'Order Master',
        icon: 'sort-asc',
        timeLimitSeconds: 36,
        description: 'Order 4-digit numbers and simple decimals.'
      },
      {
        id: 'brown_multiplication',
        name: 'Multiplication Master',
        icon: 'x',
        timeLimitSeconds: 22,
        description: 'Master times tables: 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 11x, 12x.'
      },
      {
        id: 'brown_arrays',
        name: 'Arrays Master',
        icon: 'grid',
        timeLimitSeconds: 28,
        description: 'Understand multiplication as rows and columns of arrays.'
      },
      {
        id: 'brown_counting',
        name: 'Counting Master',
        icon: 'step-forward',
        timeLimitSeconds: 28,
        description: 'Skip count by 3s, 4s, 6s, 7s, 8s, 9s, and fraction counts.'
      },
      {
        id: 'brown_multiplicative',
        name: 'Multiplicative Master',
        icon: 'sparkles',
        timeLimitSeconds: 32,
        description: 'Solve "times as many" comparison and word problems.'
      },
      {
        id: 'brown_fraction',
        name: 'Fraction Master',
        icon: 'pie-chart',
        timeLimitSeconds: 30,
        description: 'Identify, model, and compare halves, thirds, quarters, and eighths.'
      },
      {
        id: 'brown_read_write',
        name: 'Read and Write Master',
        icon: 'file-text',
        timeLimitSeconds: 32,
        description: 'Read, write, and expand numbers up to 10,000.'
      },
      {
        id: 'brown_renaming',
        name: 'Renaming Master',
        icon: 'repeat',
        timeLimitSeconds: 32,
        description: 'Rename thousands, hundreds, tens, and ones in different ways.'
      }
    ]
  },
  {
    id: 'black',
    name: 'Black Belt',
    level: 6,
    color: '#0f172a',
    textColor: 'text-yellow-400',
    bgColor: 'bg-slate-900',
    borderColor: 'border-purple-500',
    ribbonClass: 'belt-ribbon-black',
    glowClass: 'belt-black-glow',
    description: 'High level mental agility, decimal ordering, fractions and percentages!',
    arcadeGame: {
      id: 'gem_sorter',
      title: 'Fraction & Decimal Gem Sorter 💎',
      icon: 'gem',
      description: 'Catch and sort falling equivalent fraction, decimal, and percentage gems into matching bins!'
    },
    skills: [
      {
        id: 'black_counting',
        name: 'Counting Master',
        icon: 'milestone',
        timeLimitSeconds: 30,
        description: 'Count with decimals, mixed fractions, and into negative numbers.'
      },
      {
        id: 'black_multiplication',
        name: 'Multiplication Master',
        icon: 'zap',
        timeLimitSeconds: 24,
        description: 'Speed and fluency with multi-digit and mental multiplication.'
      },
      {
        id: 'black_mental',
        name: 'Mental Master',
        icon: 'cpu',
        timeLimitSeconds: 28,
        description: 'Rapid multi-step mental calculations (e.g. 15 x 4 - 18).'
      },
      {
        id: 'black_decimal_order',
        name: 'Decimal Order Master',
        icon: 'arrow-down-0-1',
        timeLimitSeconds: 36,
        description: 'Order decimals with tenths, hundredths, and thousandths.'
      },
      {
        id: 'black_renaming',
        name: 'Renaming Master',
        icon: 'percent',
        timeLimitSeconds: 28,
        description: 'Convert between fractions, decimals, and percentages.'
      },
      {
        id: 'black_fraction_order',
        name: 'Fraction Order Master',
        icon: 'bar-chart-2',
        timeLimitSeconds: 36,
        description: 'Compare and order fractions with unlike denominators.'
      },
      {
        id: 'black_multiplicative',
        name: 'Multiplicative Master',
        icon: 'trending-up',
        timeLimitSeconds: 32,
        description: 'Solve rates, ratios, scale factors, and proportions.'
      }
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum Belt',
    level: 7,
    color: '#38bdf8',
    textColor: 'text-sky-950',
    bgColor: 'bg-sky-400',
    borderColor: 'border-sky-300',
    ribbonClass: 'belt-ribbon-platinum',
    glowClass: 'belt-platinum-glow',
    description: 'The Ultimate Grand Master Belt! BODMAS, division, problem solving, and conversions.',
    arcadeGame: {
      id: 'cyber_defense',
      title: 'BODMAS Cyber Boss Defense 🛡️',
      icon: 'shield',
      description: 'Arcade turret defense! Calculate correct BODMAS operations to fire missile defense lasers at boss invaders!'
    },
    skills: [
      {
        id: 'platinum_division',
        name: 'Division Master',
        icon: 'divide',
        timeLimitSeconds: 32,
        description: 'Division with remainders, decimal answers, and long division.'
      },
      {
        id: 'platinum_bodmas',
        name: 'BODMAS Master',
        icon: 'calculator',
        timeLimitSeconds: 36,
        description: 'Order of operations: Brackets, Orders, Division/Multiplication, Addition/Subtraction.'
      },
      {
        id: 'platinum_problem_solving',
        name: 'Problem Solving Master',
        icon: 'compass',
        timeLimitSeconds: 56,
        description: 'Multi-step real-world word problems and mathematical reasoning.'
      },
      {
        id: 'platinum_conversion',
        name: 'Conversion Master',
        icon: 'ruler',
        timeLimitSeconds: 32,
        description: 'Convert metric units (length, mass, capacity) and time.'
      },
      {
        id: 'platinum_fraction',
        name: 'Fraction Master',
        icon: 'pie-chart',
        timeLimitSeconds: 36,
        description: 'Add, subtract, and multiply proper and mixed fractions.'
      },
      {
        id: 'platinum_decimal',
        name: 'Decimal Master',
        icon: 'dollar-sign',
        timeLimitSeconds: 32,
        description: 'Multiplication and division with decimal numbers.'
      },
      {
        id: 'platinum_challenge',
        name: 'Challenge Master',
        icon: 'trophy',
        timeLimitSeconds: 30,
        description: 'Fast-paced Ninja Grand Master endurance challenge covering all mathematics!'
      }
    ]
  }
];

window.BELTS_DATA = BELTS_DATA;
# Subjects & Activities Guide: Content Banks, Pools & Status

This document catalogues every subject hub, learning activity, question bank size, and content generation model in **Raven & Llama Learning**. Use this reference to verify pool sufficiency (targeting at least 100 questions per quiz/activity) without repeating a codebase-wide audit.

---

## Subject Overview Matrix

| Subject | Hub Route | Key Activities | Pool Size | Target (100+) Status |
| :--- | :--- | :--- | :---: | :--- |
| **Maths Masters** | `/mathmasters` | 9 Belts, 46 Skills, 13 Arcades | $\infty$ (Procedural) | ✅ Compliant (Except Brown Belt Fractions: 18) |
| **Maths World** | `/maths-world` | Number Builder, Fraction Pizza, Shopkeeper | $\infty$ (Procedural) | ✅ Compliant |
| **Spelling & Words** | `/learning-centre/spelling` | Sprint, Phonics Trail, Word Explorer, Jungle Jumble | **423** questions | ✅ Compliant |
| **Science Lab** | `/learning-centre/science` | 4 Explorer Missions, Solar System, Life Cycle, Food Chains, Virtual Lab | **400** questions + finite activities | ⚠️ Missions compliant; Food Chains & Virtual Lab need expansion |
| **Geography & World** | `/learning-centre/geography` | Flag Detective, Capital Cities, World Map | **110** countries | ✅ Compliant |
| **History Hub** | `/learning-centre/history` | Timeline Builder | **104** events | ⚠️ Pool size compliant; 90 broken `??` icons need fix |
| **Brain Power** | `/learning-centre/brain-power` | Pattern Recognition, Memory Match, Code Breaker | 100+ per tier | ✅ Compliant |
| **Life Skills** | `/learning-centre/life-skills` | Plan a Party | 1 scenario (6 items) | ❌ **Non-compliant** (Needs expansion to 4+ scenarios, 20+ items) |
| **Times Tables** | `/timetables` | Times Tables Arenas & Drills | $\infty$ (Procedural) | ✅ Compliant |

---

## 1. Maths Masters & Maths World

* **Curriculum & Belts** (`public/js/mathmasters/curriculum.js`):
  - 9 Belt Ranks: White (Prep/Kindergarten), Yellow (Year 1), Orange (Year 2), Green (Year 3), Blue (Year 4), Purple (Year 5), Red (Year 6), Brown (Year 7), Black / Platinum (Advanced).
  - 46 distinct mathematical skills mapped to the Australian Curriculum.
* **Question Generation** (`public/js/mathmasters/generators.js`):
  - Algorithmic generation providing thousands of distinct permutations for arithmetic, partitioning, skip counting, number lines, factors, decimals, and algebra.
  - **Identified Finite-Set Exceptions**:
    * `white_subitising` (1–6/10 dots/dice patterns) — pedagogical canonical finite set for early perception.
    * `yellow_tens_mate` (Friends of 10 pairs: $a + b = 10$) — canonical finite set (9 combinations).
    * `green_halving` (Halving numbers up to 24) — foundational fact set.
  - **Identified Pool Deficit**:
    * `genBrownFractions` only uses denominators `[2, 3, 4, 6, 8]` yielding only 18 proper fractions. Needs expansion to fifths, tenths, twelfths, and mixed/improper numbers to reach 100+.
* **Maths World Games**:
  - `fraction-pizza.js`: Interactive order fulfilment slicing pizzas into halves, thirds, quarters, and eighths.
  - `money.js`: Shopkeeper practice calculating change using Australian currency (notes & coins).
  - `telling-time.js`: Reading analogue clocks and matching digital times.

---

## 2. Spelling & Words Safari

* **Activities** (`public/js/spelling/safari.js`):
  1. **Spelling Sprint**: 115 multiple-choice questions identifying correctly spelled words.
  2. **Phonics Trail**: 108 fill-in-the-blank phoneme questions with contextual sentence clues.
  3. **Word Explorer**: 100 vocabulary, synonym, antonym, and definition questions.
  4. **Jungle Jumble**: 100 anagram scramble puzzles dynamically scrambled per round.
  5. **Spell It**: Custom spelling quiz powered by parent/teacher lists managed in the Progress modal.
* **Speech Synthesis Engine**:
  - Uses browser Web Speech API (`window.speechSynthesis`).
  - Automatically queries available system voices, prioritizing Australian English (`en-AU`, e.g. "Karen", "Lee", "Russell") or English regional fallbacks at child-friendly cadence ($0.85\times$ rate).
  - Respects platform audio mute setting and cancels speech gracefully on navigation.

---

## 3. Science Lab

* **Explorer Missions** (`public/js/science/explorers.js`):
  - **Orbit Rescue** (Space & Astronomy): 100 curated multiple-choice questions.
  - **Habitat Match** (Biomes & Living Things): 100 curated multiple-choice questions.
  - **Matter Lab** (States of Matter & Physical Science): 100 curated multiple-choice questions.
  - **Nature Detectives** (Ecosystems & Biology): 100 curated multiple-choice questions.
* **Interactive Scientific Sequence Activities**:
  - **Solar System** (`public/js/science/solar-system.js`):
    * 8 canonical planets in solar order (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune).
    * Legitimate finite canonical set; includes comprehensive fact cards and astronomical data.
  - **Plant Life Cycle** (`public/js/science/plant-life-cycle.js`):
    * 6 biological stages (Seed, Germination, Seedling, Adult Plant, Flowering, Seed Dispersal).
    * Legitimate finite canonical biological cycle with relationship validation.
  - **Food Chains** (`public/js/science/food-chains.js`):
    * Currently only 3 habitats: Grassland, Kelp Forest, Desert (11 total organisms).
    * Needs expansion to 10+ habitats (Rainforest, Coral Reef, Arctic Tundra, Pond, Deep Sea, Savanna).
  - **Virtual Laboratory** (`public/js/science/virtual-lab.js`):
    * Currently only 4 simulations: Ice melts, water freezes, sugar dissolves, sand forms mixture.
    * Needs expansion to 15+ physical science simulations (density towers, vinegar/baking soda reaction, magnetic separation, filtration).

---

## 4. Geography Hub & Interactive World Map

* **Dataset** (`public/js/geography/country-data.js` vs `world-map-context.js`):
  - `world-map-context.js`: Contains SVG vector boundary paths for **177 countries** for the interactive map.
  - `country-data.js`: Contains **110 sovereign countries** with flags, capitals, continents, facts, and linked references. New records reuse the existing map paths instead of copying the SVG data.
* **Activities** (`public/js/geography/country-activities.js`):
  - **Flag Detective**: Randomly samples 5 countries per round and presents 4 distinct country choices per question.
  - **Capital Cities**: Randomly samples 5 countries per round and presents 4 distinct capital choices per question.
* **Pool status**:
  - Both activities draw from the same 110-country dataset; IDs, names, flags, and capitals are unique so answers remain unambiguous.

---

## 5. History Hub & Timeline Builder

* **Event Pool** (`public/js/history/events.js`):
  - Contains **104 sourced historical events** spanning Prehistory (~65,000 BCE) to the 21st Century (2019 CE).
  - All events include title, sortYear, era, clue, explanation, and verified educational source URL.
* **Identified Defect**:
  - **90 events have broken `icon: '??'`** due to character encoding corruption in PR #149.
  - **Priority action**: Restore authentic thematic emojis for each event.
* **Timeline Builder** (`public/js/history/timeline-builder.js`):
  - Randomly samples 5 events per round across eras.
  - Keyboard and drag-and-drop reordering with accessible feedback.

---

## 6. Brain Power Logic Hub

* **Pattern Recognition**: Algorithmic sequence generator producing 100+ distinct geometric and numeric pattern puzzles per difficulty level.
* **Memory Match**: Dynamic card-matching grid randomly sampling pairs from categorized emoji themes (4 pairs Easy, 6 pairs Medium, 8 pairs Hard).
* **Code Breaker**: Mastermind-style deduction puzzle generating unique color combinations with exact and partial feedback pegs.

---

## 7. Life Skills Hub

* **Plan a Party** (`public/js/life-skills/party-planner.js`):
  - Budgeting activity where students allocate funds to meet required and optional party needs without overspending.
* **Deficit**:
  - Currently contains only **1 scenario** (Birthday Party with fixed $100 budget and 6 items).
  - **Priority action**: Expand to 4+ diverse event scenarios (Camping Trip, Pizza Night, Science Fair, School Picnic) with dynamic budgets ($25 to $250) and a catalog of 20+ items.

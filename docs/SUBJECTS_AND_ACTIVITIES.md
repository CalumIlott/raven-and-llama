# Subjects & Activities Guide: Content Banks, Pools & Status

This document catalogues every subject hub, learning activity, question bank size, and content generation model in **Raven & Llama Learning**. Use this reference to verify pool sufficiency (targeting at least 100 questions per quiz/activity) without repeating a codebase-wide audit.

---

## Subject Overview Matrix

| Subject | Hub Route | Key Activities | Pool Size | Target (100+) Status |
| :--- | :--- | :--- | :---: | :--- |
| **Maths Masters** | `/mathmasters` | 9 Belts, 46 Skills, 13 Arcades | $\infty$ (Procedural) | ✅ Compliant (Except Brown Belt Fractions: 18) |
| **Maths World** | `/maths-world` | Number Builder, Fraction Pizza, Shopkeeper | $\infty$ (Procedural) | ✅ Compliant |
| **Spelling & Words** | `/learning-centre/spelling` | Sprint, Phonics Trail, Word Explorer, Jungle Jumble, Rhyme Ranger | **847** questions | ✅ Compliant |
| **Science Lab** | `/learning-centre/science` | 4 Explorer Missions, Solar System, Life Cycle, Food Chains, Virtual Lab | **400** questions + finite activities | ✅ Food Chains has 10 sourced habitats (5 sampled per round); Virtual Lab has 17 sourced outcomes and filtered material categories |
| **Geography & World** | `/learning-centre/geography` | Flag Detective, Capital Cities, World Map | **193** countries | ✅ Compliant |
| **History Hub** | `/learning-centre/history` | Timeline Builder, Artifact Detective | **104** sourced events; 4 finite artifact cases | Event icons repaired and tested; artifact set is intentionally finite |
| **Brain Power** | `/learning-centre/brain-power` | Pattern Recognition, Memory Match, Code Breaker | 100+ per tier | ✅ Compliant |
| **Life Skills** | `/learning-centre/life-skills` | Plan a Party | 4 scenarios; 24-item catalog | ✅ Compliant |
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
  - `money.js`: Shopkeeper practice calculating change using an interactive cash drawer with separate Australian coin and note slots, drag/tap/keyboard selection, and a live running total.
  - `telling-time.js`: Reading analogue clocks and matching digital times.

---

## 2. Spelling & Words Safari

* **Activities** (`public/js/spelling/safari.js`):
  1. **Spelling Sprint**: 115 multiple-choice questions identifying correctly spelled words.
  2. **Phonics Trail**: 108 fill-in-the-blank phoneme questions with contextual clues and an interactive grapheme soundboard. Tap tiles or swipe across the blending bar to hear an attempted word; keyboard users can select the missing sound, hear individual tiles, blend, and check it.
  3. **Word Explorer**: 100 vocabulary, synonym, antonym, and definition questions.
  4. **Jungle Jumble**: 100 anagram scramble puzzles dynamically scrambled per round.
  5. **Rhyme Ranger**: 424 distinct ordered prompt/answer pairs built from 30 curated rhyme families; difficulty changes how many answer choices appear.
  6. **Spell It**: Custom spelling quiz powered by parent/teacher lists managed in the Progress modal.
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
    * 10 sourced habitats, each with four organisms; five distinct habitats are sampled per run.
    * Deep-sea hydrothermal vents use chemical energy rather than sunlight.
  - **Virtual Laboratory** (`public/js/science/virtual-lab.js`):
    * 17 sourced outcomes cover state changes, dissolving, mixtures, reactions, filtration, magnetism, evaporation, and freezing point.
    * Material filters group materials, prepared mixtures, conditions, and tools; each result links to its science source.
  - **Pond Ecosystem Sandbox** (`public/js/science/ecosystem-sandbox.js`):
    * Learners adjust algae, tadpole, fish, and kingfisher populations, then advance a deterministic five-day food-web model.
    * The first model caps each population at 12 and explains its simplified feeding and growth rules; it is an exploration without score or progress rewards.

---

## 4. Geography Hub & Interactive World Map

* **Dataset** (`public/js/geography/country-data.js` vs `world-map-context.js`):
  - `world-map-context.js`: Contains 205 background features, including simplified outlines and enlarged schematic markers.
  - `country-data.js`: Contains all 193 UN member countries with flags, capitals, facts, and sources. Small countries use schematic markers and are not to scale. The background also includes 12 dependent territories, Antarctica, or disputed/special-status features outside the quiz pool.
* **Activities** (`public/js/geography/country-activities.js`):
  - **Flag Detective**: Randomly samples 5 countries per round and presents 4 distinct country choices per question.
  - **Capital Cities**: Randomly samples 5 countries per round and presents 4 distinct capital choices per question.
* **Pool status**:
  - Both activities draw from the same 193-country dataset; IDs, names, flags, and capitals are unique so answers remain unambiguous.
  - Coverage audit: the pool covers 193 UN member countries, including small states represented by selectable schematic markers.
  - Map-page facts follow-up: implemented in the selected-country panel, with at least five sourced options per country and a different fact on a return visit.
  - Map flags: self-hosted SVGs are used so desktop Chrome shows flags consistently with mobile.

---

## 5. History Hub & Timeline Builder

* **Event Pool** (`public/js/history/events.js`):
  - Contains **104 sourced historical events** spanning Prehistory (~65,000 BCE) to the 21st Century (2019 CE).
  - All events include title, sortYear, era, clue, explanation, and verified educational source URL.
* **Icon repair — implemented**:
  - Event icons are restored as thematic emoji; the unit test checks pictographic icons and rejects placeholder `?` strings.

* **Timeline Builder** (`public/js/history/timeline-builder.js`):
  - Randomly samples 6 events per round across eras.
  - Keyboard and drag-and-drop reordering with accessible feedback.
* **Artifact Detective** (`public/js/history/artifact-detective.js`):
  - Four finite, museum-sourced cases: Rosetta Stone, Mature Harappan seal, Sutton Hoo helmet, and Late Babylonian tablet.
  - Each case has three evidence clues; civilization/period choices remain disabled until all clues are inspected. Cases are shuffled between runs.
  - Explanations reveal the artifact identity, material/period context, and a museum source link. This first slice is deliberately finite rather than padded with paraphrases.

---

## 6. Brain Power Logic Hub

* **Pattern Recognition**: Algorithmic sequence generator producing 100+ distinct geometric and numeric pattern puzzles per difficulty level.
* **Memory Match**: Dynamic card-matching grid randomly sampling pairs from categorized emoji themes (4 pairs Easy, 6 pairs Medium, 8 pairs Hard).
* **Code Breaker**: Mastermind-style deduction puzzle generating unique color combinations with exact and partial feedback pegs.

---

## 7. Life Skills Hub

* **Plan a Party** (`public/js/life-skills/party-planner.js`):
  - Budgeting activity where students allocate funds to meet required and optional event needs without overspending.
  - Four randomized scenarios use $50, $75, $100, or $150 budgets. Each round samples 10 items from a 24-item catalog grouped into Venue, Food & Drink, Entertainment, Gear, and Decorations.
  - Two or three item targets are marked required per round; remaining choices are optional, and each scenario keeps one event-specific item in the round.

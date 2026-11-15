# Multi-Stage Strategic Plan: Replacing Quizzes, Quality Refinement & Innovation Roadmap

This document serves as the master blueprint for transitioning **Raven & Llama Learning** from a quiz-centric platform into a deeply interactive, inquiry-based educational experience. It covers immediate bug resolutions, content pool expansions (to meet the 100+ items goal), core architectural additions, tactile manipulatives replacing quizzes, and longer-term research into future learning mechanics.

---

## Executive Summary: The 6-Stage Roadmap

```mermaid
flowchart TD
    S1["Stage 1: Content Pools & Bug Fixes<br/>(Issue #138, 100+ items goal, emoji repairs)"] --> S2["Stage 2: Parent Dashboard & Security Gate<br/>(Issue #128 / LC-701)"]
    S2 --> S3["Stage 3: Personalised Recommendations<br/>(Issue #130 / LC-703)"]
    S3 --> S4["Stage 4: Beyond Quizzes - Tactile Manipulatives<br/>(Balance Scale, Cash Register, Interactive Clock)"]
    S4 --> S5["Stage 5: Beyond Quizzes - Discovery Sandboxes<br/>(Ecosystem Sim, Thermal Chamber, Artifact Detective)"]
    S5 --> S6["Stage 6: Long-Term Horizon & Advanced Research<br/>(Voice recognition, Branching Expeditions, Multiplayer)"]
```

---

## Stage 1: Content Pools, Question Breadth & Bug Resolutions (Issue #138)

**Primary Objective**: Eliminate known defects, repair corrupted icons, and bring all eligible activities to the platform standard of **at least 100 distinct items per activity**.

### 1.1 Fix History Event Icons (Encoding Repair)
* **Problem**: 90 of 104 events in `public/js/history/events.js` currently render broken literal `'??'` strings instead of authentic emojis due to an encoding defect in PR #149.
* **Resolution**: Replace each `'??'` with an historically accurate thematic emoji (e.g. 🏛️ Parthenon, 🚢 Lapita voyages, 📜 Magna Carta, 🔭 Galileo, ⚔️ Battle of Hastings).
* **Test**: Add automated unit test verifying that every event has a valid emoji icon string of length $\ge 1$ and matching unicode emoji patterns.

### 1.2 Expand Geography Hub Dataset to 100+ Countries
* **Problem (resolved)**: The quiz dataset started with 18 countries, even though `world-map-context.js` contains SVG paths for 177 countries. Flag Detective and Capital Cities therefore covered too few countries.
* **Resolution — implemented**: The shared `country-data.js` pool now includes 165 sovereign countries spanning Africa, Asia, Europe, North America, South America, and Oceania, with local flags, capitals, continents, facts, and linked sources.
* **Test**: Add unit test in `tests/unit/geography-country-activities.test.js` asserting `countries.length >= 160` and zero duplicate country/flag/capital combinations.
* **Follow-up note — implemented**: Expanded the shared country pool from 110 to 165 sovereign countries, reusing map paths for 55 additional eligible countries. Audited all 177 outlines; dependent territories, Antarctica, and disputed or special-status features remain in the map context but outside the quiz pool, as documented in `docs/SUBJECTS_AND_ACTIVITIES.md`.
* **Map-page facts follow-up — implemented**: Each country now has at least five sourced facts, combining the existing country highlight with capital, continent, official languages, currency, area, coastline status, and land-border details where available. A different fact is selected when the learner changes away from and returns to a country. Reference data is bundled locally with ODbL attribution and licensing; no live API is required.
* **Map flag display follow-up — implemented**: Show self-hosted SVG flags in the selected-country panel and country list, and in Flag Detective and Capital Cities. This avoids the platform-dependent Unicode flag fallback that can display country initials in desktop Chrome. The map caption now uses the actual number of highlighted countries instead of a stale hard-coded count.
* **Small-island map follow-up — implemented**: Added twelve small island countries, including Mauritius, using enlarged schematic markers where Natural Earth 1:110m does not preserve visible geometry. Markers are explicitly not to scale and have large screen-constant selection targets. Map controls and pinch zoom now reach 16×.

### 1.3 Expand Life Skills "Plan a Party"
* **Status: Complete**: The activity has four budgeted scenarios: Birthday Party ($100), Camping Trip ($150), School Science Fair ($75), and Pizza Movie Night ($50).
* The 24-item catalog is grouped into Venue, Food & Drink, Entertainment, Gear, and Decorations. Each round samples ten items (two per category), includes the scenario's featured item, and assigns two or three required targets; the remaining items are optional.
* Unit coverage in `tests/unit/party-planner.test.js` checks the scenarios, item catalog, sampling, required targets, and budget evaluation. Browser coverage in `tests/e2e/plan-party.spec.js` checks the route, controls, budget feedback, and successful plan completion.

### 1.4 Expand Science Lab Food Chains & Virtual Lab
* **Food Chains**: Expanded `public/js/science/food-chains.js` to 10 sourced habitats. Five distinct chains are randomly selected per run; the deep-sea vent model correctly starts with chemical energy rather than sunlight.
* **Virtual Lab**: Expanded `public/js/science/virtual-lab.js` to 17 carefully sourced outcomes. Item filters group materials, prepared mixtures, conditions, and tools; supported outcomes link to their source.

### 1.5 Expand MathMasters Brown Belt Fractions
* **Problem**: `genBrownFractions` generates only 18 proper fractions across limited denominators `[2, 3, 4, 6, 8]`.
* **Resolution**: Expand to denominators up to 12, improper fractions, mixed numbers, and visual geometric models (circles, fraction bars, grid matrices) to exceed 100 distinct visual problems.
* **Fraction Pizza UI follow-up — implemented**: Replaced the square grid and pizza icons with wedge-shaped pizza slices, a visible crust, cheese, and toppings. Slices remain selectable by touch and keyboard and draggable on desktop. Their geometry lives in the stylesheet because the app's Content Security Policy blocks inline style attributes; browser coverage checks that each supported slice is rendered as a distinct clipped wedge.

---

## Stage 2: Parent Dashboard & Settings Controls (Issue #128 / LC-701)

**Primary Objective**: Deliver a secure, dedicated parent portal enabling personalized difficulty configurations, learning pace controls, and safe progress management.

### 2.1 Backend & Authentication Layer
* **Parent Access Gate**:
  - Implement optional 4-to-6 digit Parent PIN for signed-in accounts.
  - Store PIN as a PBKDF2 hash with unique salt in the account profile; never store plaintext PINs.
  - Rate-limit PIN verification (5 attempts per minute) on `/api/auth/parent-verify`.
* **Reauthentication**: Require session re-entry or PIN verification before destructive operations.
* **Progress Reset Endpoint**:
  - Add scoped endpoint `/api/progress/reset` allowing parents to selectively reset activity scores and history while preserving account credentials and earned cosmetics.

### 2.2 Parent Dashboard UI & Controls
* **Navigation Entry**: Accessible lock icon in the top header and inside account settings.
* **Global & Subject Difficulty Matrix**:
  - Unified grid allowing parents to set school-year overrides individually for Mathematics, Science, and English/Spelling.
  - Visual guidance showing current year level (Foundation to Year 12) and recommended activity tiers (Easy, Medium, Hard).
* **Audio & Sensory Preferences**:
  - Global speech synthesis speed slider ($0.75\times$ to $1.25\times$).
  - Sound effects toggle and Dyslexia-friendly typography toggle.
* **Dyslexia-friendly typography — implemented**: Add a profile-synced toggle for a sans serif typeface with increased letter spacing and line height; guest selection stays in memory.
* **Guest Safety**: In guest mode, display a clear advisory that settings and progress remain memory-only.
* **Audio preference control — implemented**: Add a parent-managed spoken-audio speed slider from 0.75× to 1.25× and apply it to hints and spelling pronunciations; keep guest changes in memory.

---

## Stage 3: Personalised Learning Recommendations (Issue #130 / LC-703)

**Primary Objective**: Turn student activity history into deterministic, explainable next-step recommendations that adapt to mastery and practice recency.

### 3.1 Deterministic Recommendation Engine (`lib/recommendations.mjs` & client)
* **Algorithm Inputs**:
  - Current school year and subject difficulty overrides.
  - Recent accuracy per skill in `activityProgress` (identifying skills with $< 70\%$ accuracy).
  - Recency gap (identifying core curriculum areas not practiced in $> 7$ days).
  - Daily challenge completion state.
* **Ranking & Selection**:
  - Priority 1: Remediation (low accuracy in recent attempts).
  - Priority 2: Incomplete Quests / Unearned Badges.
  - Priority 3: Breadth & Discovery (unpracticed subjects).
  - Fallback: Year-appropriate core activities when history is sparse.
* **Data Privacy**: All computations occur locally in-browser or strictly within the authenticated account session; zero external analytics tracking.
* **Recommendation rules**: Use up to 30 days of valid quiz attempts for accuracy; require at least three answers before treating a score under 70% as a support signal. Recommend practice gaps after more than seven days, cap results at three with deterministic ordering, skip completed daily activities for the current UTC day, and launch only catalogued activities available in the app. Apply current subject-year difficulty when the chosen activity supports it; otherwise use a neutral empty state when nothing eligible remains.

### 3.2 Learning Centre Recommendation Cards
* Surface top 3 recommended activities prominently on the Home dashboard and Learning Centre header.
* Include plain-language explanations:
  - *"Let's practice: You scored 60% on fractions last week. Try Fraction Pizza to level up!"*
  - *"New discovery: You haven't explored the History Timeline yet. Step back in time!"*
* Provide one-click direct launch buttons into the recommended activity.

---

## Stage 4: Replacing Quizzes — Tactile Manipulatives (Beyond Quizzes Phase 1)

**Primary Objective**: Move primary mathematics and language learning from multiple-choice testing into direct physical manipulation.

```text
Quiz Mindset:        "What is 3/4 + 1/4? [A] 1  [B] 2/4  [C] 4/8  [D] 1/2"
Manipulative Mindset: "Drag pizza slices into the box until you have exactly one whole pizza."
```

### 4.1 Digital Balance Scale (Maths Masters Algebra & Equations)
* **Status: First tactile version implemented** in the Blue Belt `balance-scales` arcade.
* Learners add, remove, or clear 1, 2, 5, 10, and 20-unit weights on the right pan until it matches the fixed left pan. The beam tilts toward the heavier side and settles level when balanced; a live status reports each pan's total and which side is heavier.
* Weight controls are keyboard and touch accessible. The first version keeps the existing `blue_balanced_equation` skill quiz and its question pool; replacing that training flow, plus unknown-value blocks and negative weights, remains future work.

### 4.2 Cash Register & Change Counter (Maths World Shopkeeper)
* **Status: First tactile version implemented** in the existing Shopkeeper mode.
* The customer's basket and payment are shown on a counter, with distinct cash drawer slots grouped into Australian coins and notes. Learners drag money to the change tray or select denominations by touch and keyboard; a screen-reader live total updates as they build the change.
* The receipt shows only the basket total and the amount paid before the learner answers, so it does not reveal the change. The prompt teaches counting up from the basket total to the payment.
* This enhances the Shopkeeper mode in `public/js/mathmasters/money.js`; the other Money Masters activities remain available.

### 4.3 Interactive Clockwork Hands (Maths World Telling Time)
* **Concept**: Replace multiple-choice digital clock matching with interactive draggable clock hands.
* **Mechanics**:
  - Smooth 360-degree touch and mouse dragging on the minute hand.
  - Realistic $12:1$ gear ratio linkage: rotating the minute hand smoothly turns the hour hand proportionally.
  - Target challenges: "Set the clock to quarter past 3" or "Show 25 minutes after 7:15".
  - An animated day/night window behind the clock shifts from dawn to midday to sunset, reinforcing AM/PM.
* **Target Activity**: Enhances `public/js/mathmasters/telling-time.js`.

### 4.4 Kinetic Phonics Soundboard & Blending Bar (Spelling Safari)
* **Status: First tactile version implemented** in Phonics Trail. The existing phonics gap choices now fill an interactive grapheme row; tapping a tile plays its pronunciation, and a selected attempt can be blended with a button or a horizontal swipe across the tiles. Learners can still submit the word to the existing scoring and feedback flow.
* **Mechanics**:
  - Students see interactive letter/digraph tiles (`sh`, `i`, `p`).
  - Tapping each tile triggers the browser's built-in, English-Australian-prioritized speech synthesis; if unavailable, the learner can still read and check their word.
  - Swiping a finger across the "Blending Bar" or activating its accessible button plays the attempted word, showing phonological assembly.
* **Target Activity**: Enhances `public/js/spelling/safari.js` Phonics Trail.

---

## Stage 5: Replacing Quizzes — Discovery Sandboxes & Deductive Mysteries (Beyond Quizzes Phase 2)

**Primary Objective**: Transition Science, History, and Geography into exploratory sandboxes and mystery-solving investigations.

### 5.1 Trophic Ecosystem & Population Sandbox (Science Lab)
* **Concept**: An open ecosystem simulator demonstrating trophic cascades and ecological balance.
* **Mechanics**:
  - Canvas environment representing a living pond or savanna.
  - Students drag organisms (algae, tadpoles, fish, kingfishers) into the pond.
  - A simple time-step population graph shows live counts. If students introduce too many predators without sufficient producers, the prey population crashes, followed by predator starvation.
  - Challenges provide open goals: *"Establish a stable pond ecosystem with at least 3 species that survives for 30 simulated days."*

### 5.2 States of Matter Thermal Chamber (Science Lab)
* **Concept**: An interactive particle chamber demonstrating molecular behavior across temperatures.
* **Mechanics**:
  - A temperature slider spanning $-100^\circ\text{C}$ to $200^\circ\text{C}$ with burner and chiller controls.
  - Molecular viewport: Water molecules shown as animated balls.
  - At low temperatures, molecules vibrate within fixed crystalline lattices (solid ice). As heat rises, bonds loosen into flowing fluid (liquid water), and eventually break into high-velocity gas (steam).
  - Includes pressure gauges and condensation lid interactions.

### 5.3 Historical Artifact Detective (History Hub)
* **Concept**: A forensic archaeological investigation tool replacing rote historical date memorization.
* **Mechanics**:
  - The student is presented with an unidentified artifact unearthed at a dig site (e.g. an inscribed clay fragment, a bronze coin, a navigational astrolabe).
  - Tools provided:
    * **Magnifying Glass**: Inspect symbols, script, and imagery.
    * **Material Analyzer**: Test composition (papyrus, terracotta, iron, silk).
    * **Stratum Depth / Carbon Gauge**: Approximate the chronological epoch.
  - Students collect 3 observational clues and select the civilization or historical period that produced it, unlocking the artifact for the museum collection.

### 5.4 Globe Trotter Clue Trail (Geography Hub)
* **Concept**: A Carmen Sandiego-inspired mystery flight adventure across the interactive SVG world map.
* **Mechanics**:
  - A missing artifact or animal mystery unfolds across countries.
  - Witnesses give cultural and geographical clues:
    - *"The suspect exchanged money for Yen and mentioned visiting Mount Fuji."*
    - *"The traveler was heading to a southern hemisphere country known for the Southern Cross on its flag."*
  - The student navigates the interactive map, zooming and panning to fly to the correct country, unlocking passport stamps and facts along the way.

---

## Stage 6: Long-Term Horizon & Advanced Research

**Primary Objective**: Investigate cutting-edge educational mechanics, voice interaction, and cooperative features for future platform iterations.

### 6.1 Voice Recognition & Verbal Spelling (Web Speech Recognition)
* **Research Focus**: Can speech recognition reliably assess oral reading and verbal spelling for primary students without external cloud services?
* **Feasibility**:
  - Evaluate the browser's native `webkitSpeechRecognition` / `SpeechRecognition` API.
  - Challenges: Background noise, child accents, and speech recognition latency.
  - Opportunity: "Spell-by-voice" where a student speaks individual letters aloud: *"T - I - G - E - R"*, with on-screen visual confirmation.

### 6.2 Branching Historical Expeditions (Choose-Your-Own-Adventure)
* **Research Focus**: Interactive branching narratives exploring major human migrations and historical journeys.
* **Prototypes**:
  - *The Silk Road Caravan*: Manage supplies (water, silk, camels) while deciding trade routes between Chang'an and Constantinople.
  - *Pacific Wayfinding*: Use star navigation and wave patterns to guide a voyaging canoe between Polynesian islands.

### 6.3 Real-Time Cooperative Challenges via Cloudflare Durable Objects
* **Research Focus**: Low-latency, privacy-preserving multiplayer cooperation without user chat or external accounts.
* **Prototypes**:
  - *Maths Relay*: Two students in a classroom work together to solve parts of a puzzle concurrently.
  - *Ecosystem Co-op*: One student manages plant nutrition while the other balances herbivores in a shared simulation.
  - Architecture: Lightweight Cloudflare Workers WebSocket connections backed by ephemeral Durable Objects.

* **Small-island map follow-up — implemented**: Added twelve small island countries, including Mauritius, using enlarged schematic markers where Natural Earth 1:110m does not preserve visible geometry. Markers are explicitly not to scale and have large screen-constant selection targets. Map controls and pinch zoom now reach 16×.

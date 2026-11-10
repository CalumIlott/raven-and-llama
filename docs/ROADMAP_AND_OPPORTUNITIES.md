# Roadmap, Pedagogical Opportunities & UX Review

This document outlines the strategic improvement opportunities, competitive benchmarking analysis, open issue roadmap, and user experience enhancements for **Raven & Llama Learning**. For the comprehensive step-by-step implementation blueprint across all 6 stages, see [`docs/MULTI_STAGE_ROADMAP_AND_PROPOSALS.md`](MULTI_STAGE_ROADMAP_AND_PROPOSALS.md).

---

## 1. Competitive Benchmarking: Moving Beyond Quizzes

Most online learning tools for primary students fall into the trap of "drill-and-kill" multiple-choice questions. Comparing Raven & Llama against key market benchmarks reveals clear opportunities to elevate engagement:

### Market Benchmark Analysis

| Platform | Core Strengths | Weaknesses | Takeaway for Raven & Llama |
| :--- | :--- | :--- | :--- |
| **IXL Learning** | Rigorous curriculum standard mapping; comprehensive diagnostic arena. | Severe quiz fatigue; high anxiety; questions feel punitive when points drop on errors. | Keep our forgiving, mastery-based star rewards and structured worked examples; avoid rote question repetition. |
| **Prodigy Math** | High intrinsic motivation via Pokemon-style wizard battles, pet collection, and equipment unlocks. | Math questions are disconnected from the battle action (math is an arbitrary "toll" to cast a spell). | Integrate math directly into game mechanics (e.g. cutting pizzas, counting shopkeeper change, balancing scales). |
| **Khan Academy Kids** | Wonderfully tactile; character-led storytelling; playful exploratory sandboxes and creative play. | Primarily aimed at early childhood (ages 2–7); lacks depth for upper primary years (Years 4–7). | Expand our mascot companion (Raven & Llama) with emotional responses and voice encouragement across all ages. |
| **Brilliant.org** | Intuitive visual models; sliders and interactive physics cause-and-effect; zero rote multiple choice. | Geared towards high school, university, and adult professionals. | **Primary inspiration**: Bring Brilliant-style interactive manipulatives to primary school concepts! |

---

## 2. Key Interactive Concepts to Replace Traditional Quizzes

### 2.1 Interactive Visual Manipulatives (Maths & Life Skills)
* **Digital Balance Scales**:
  - Instead of answering multiple-choice equations like $x + 5 = 12$, learners physically drag weight blocks onto two pans of a balance scale.
  - The scale physically tilts in real time according to weights. When balanced, the lock clicks open.
* **Shopkeeper Cash Drawer**:
  - Render a realistic Australian currency cash register drawer with compartments for $\$50, \$20, \$10, \$5$ polymer notes and $\$2, \$1, 50\text{c}, 20\text{c}, 10\text{c}, 5\text{c}$ coins.
  - A customer buys groceries; the learner must pick and count out the correct change into the customer's hand.
* **Interactive Clockwork Hands**:
  - Allow touch/mouse rotation of clock hands with physical gear ratios ($12:1$). Moving the minute hand smoothly turns the hour hand and updates an animated day/night background window.

### 2.2 Open Discovery Sandboxes (Science Lab)
* **Living Ecosystem / Trophic Cascade Sandbox**:
  - A pond or meadow habitat where students place producers (plants), primary consumers (grasshoppers, fish), and predators (frogs, hawks).
  - Rather than answering static questions, students run the simulation to see if their ecosystem sustains itself or collapses due to overpredation.
* **States of Matter Thermal Chamber**:
  - A simulated cylinder with a heat/cool slider ($-50^\circ\text{C}$ to $150^\circ\text{C}$). Water particles vibrate, break free into liquid, or boil into gas with visible molecular spacing changes.

### 2.3 Deductive Mysteries & Case Files (History & Geography)
* **Historical Artifact Detective**:
  - Present an unidentified historical object (e.g., clay tablet, bronze astrolabe, silk scroll).
  - Learners use a magnifying glass and carbon dating tool to collect 3 clues and deduce which era or civilization made it.
* **Passport Mystery Trail**:
  - An interactive globe mystery where students travel from country to country following geographic clues ("Fly to the capital of the country whose flag has a maple leaf").

---

## 3. UX & Accessibility Opportunities

1. **Touch Drag & Drop**: Ensure `touch-action: none` is consistently applied to all interactive drag handles to prevent accidental viewport scrolling on mobile Safari and Android Chrome.
2. **Audio Gesture Unlock**: Mobile browsers restrict Web Audio and SpeechSynthesis until an explicit user tap occurs. Ensure audio contexts are unlocked on the initial "Start Activity" button tap to prevent silent audio failures.
3. **Keyboard Map Accessibility**: Ensure the interactive SVG World Map supports `+`/`-` keys for zoom and arrow keys for panning, with accessible ARIA focus indicators for each country path.
4. **Mascot Integration**: Deepen Raven and Llama's in-game presence. Have them celebrate streak milestones, offer contextual hints during struggle, and wear cosmetics equipped from the shop directly inside activities.

---

## 4. Priority Roadmap & Sub-Sessions

### Sub-Session 1: Content Expansion & Bug Repair (Issue #138)
* [ ] Fix 90 broken `??` emoji icons in `public/js/history/events.js`.
* [ ] Expand `public/js/geography/country-data.js` to 100+ countries with flags, capitals, and facts.
* [ ] Expand Plan a Party (`public/js/life-skills/party-planner.js`) with 4+ scenarios, dynamic budgets, and a 20+ item catalog.
* [ ] Expand Food Chains (7 new habitats) and Virtual Lab (10 new reaction simulations).
* [ ] Expand Brown Belt visual fractions generator in `generators.js` to 100+ distinct representations.

### Sub-Session 2: Parent Dashboard & Settings Controls (Issue #128 / LC-701)
* [ ] Server-side parent PIN hashing, rate-limiting, and reauthentication endpoints.
* [ ] Dedicated Parent Dashboard UI for school-year preferences, subject difficulties, and audio controls.
* [ ] Safe progress-reset flow with confirmation modal and session isolation.

### Sub-Session 3: Personalised Learning Recommendations (Issue #130 / LC-703)
* [ ] Recommendation engine calculating weak skills (< 70% accuracy) and unpracticed topics.
* [ ] Prominent recommendation cards on Home / Learning Centre with direct activity links and rationales.

### Sub-Session 4: Interactive Manipulatives ("Beyond Quizzes")
* [ ] Build Digital Balance Scale manipulative for algebraic equations.
* [ ] Build interactive Cash Register for Shopkeeper Money activity.

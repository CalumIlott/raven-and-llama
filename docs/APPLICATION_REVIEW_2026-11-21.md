# Application review and activity coverage — 21 November 2026

Reviewed baseline: `b4eddd9` (`origin/main`, including PRs #215 and #216). The inventory and browser suite ran on `eba59b6` (PR #214); the two PRs merged during the review. Their timing fix and roadmap status were inspected afterward, and the updated timing-engine unit tests passed. The complete browser suite was not rerun on the two-commit delta. Severity: P1 blocks a significant workflow; P2 materially impairs it; P3 is limited or a quality opportunity. Effort: S = focused change, M = several days, L = larger staged work. Estimates are proposals, not commitments.

## Evidence and limits

Read `AGENTS.md`, `ARCHITECTURE.md`, `SUBJECTS_AND_ACTIVITIES.md`, and `MULTI_STAGE_ROADMAP_AND_PROPOSALS.md`, then the listed implementation and test files. The indexed subject guide is useful but not a substitute for the current catalog: for example `curriculum.js` defines **seven** belts (white, yellow, green, blue, brown, black, platinum), not the nine named in the guide. It contains 46 skills. The four Explorer question banks, sourced country and history records, and finite canonical sets should retain their citations and distinctions; no content accuracy audit of every record was performed.

Targeted Playwright Chromium probes reproduced F1–F5 below. The existing E2E suite on `eba59b6` passed 247 tests with 7 intentional skips across desktop Chromium and an emulated Pixel 7. The unit suite passed 240 tests, integration passed 2, the Worker dry run passed, and `npm run audit` found no vulnerabilities. The initial `npm test` could not launch Chromium until the required browser was installed; the E2E suite was then run separately. Passing automation is not equivalent to a human walkthrough, a real touchscreen, screen-reader testing, or coverage of every question, difficulty and failure state. The in-app browser was unavailable and the existing Chrome window reported active user input; no manual page or activity walkthrough was completed. Thus every unchecked manual item below remains an explicit blocker to a complete experiential review. The suite uses a local isolated server and test data.

### Reproduced defects

**F1 — Virtual Lab loses keyboard focus when selecting an item (P2, S).** In Chromium, open Science Lab → Virtual Laboratory; focus Water and press Enter. The selected material is replaced by `main.innerHTML` and the replacement is not focused. The targeted assertion that the Water control remains focused failed: expected focused, received inactive. A keyboard learner must find their place again before navigating to a workspace slot. `public/js/science/virtual-lab.js` calls `renderVirtualLabActivity()` on selection and replaces the page in that renderer. Existing `tests/e2e/virtual-lab.spec.js` helper uses `.focus()` on each next element, masking this loss. Preserve focus on the selected item or move it intentionally to the first available slot, announce the action, and test the subsequent Tab/Enter journey without programmatic refocusing. Also check filters, placement, run and reset. The temporary failing probe was removed; include a permanent passing regression with the fix.

**F2 — Plan a Party loses focus on quantity changes (P2, S).** Open Life Skills → Plan a Party; focus the add button for an item that permits more than one (for example pizzas when offered), then press Enter. A targeted Chromium probe confirmed the replacement add button remained enabled but was inactive after the increment. `renderPartyPlanner()` rebuilds the main view. Restore focus to the same quantity control, or to a meaningful adjacent control if it becomes disabled at a limit; test repeated keyboard increments, limits, decrement, reset and feedback without forcing focus.

**F3 — Artifact Detective loses focus while inspecting clues (P2, S).** Open History → Artifact Detective; focus Inspect clue 1 and press Enter. A targeted Chromium probe found that the replacement Inspect clue 2 control was inactive after the redraw. Keep focus on the next clue control and announce the revealed evidence; when the final clue disables the button, move focus appropriately to the choices or the revealed clue. Test the full three-clue and answer flow using only the keyboard.

**F4 — Pattern Recognition loses focus after an incorrect answer (P2, S).** Open Brain Power → Pattern Recognition (easy), focus an incorrect option and press Enter. The retry message appears, but a targeted Chromium probe observed `document.activeElement === document.body`. The existing keyboard test directly focuses Retry and every subsequent choice, concealing this interruption. Move focus to the retry control or retain a useful position and announce feedback. Test the entire incorrect → retry → answer sequence without programmatic refocusing.

**F5 — Memory Match and Code Breaker lose focus on each selection (P2, M).** In Brain Power, start Memory Match and press Enter on a face-down card: the revealed replacement is inactive. In Code Breaker, focus the first colour selector and press Arrow Down: the updated replacement selector is inactive. Both failed targeted Chromium focus assertions after their changes took effect. Preserve focus at the current card or selector and announce state; verify second-card matching, selecting each code position, checking and retries with uninterrupted keyboard input. These can be separate small fixes sharing the same regression-test principle.

### Code-inspection risks and product findings (not reproduced bugs)

- **R1 — Other redraw paths (P2 candidate, M):** F1–F5 show a recurring focus risk; audit further transitions and activities using only Tab, Enter and Space, including results and completion. Ecosystem Sandbox explicitly passes a focus selector and is a useful comparison. Do not classify untested paths as confirmed defects.
- **R2 — Exploration presented as mastery (P2 candidate, M):** Virtual Lab submits a single synthetic `true` answer and completes after any one supported combination; the existing desktop Chromium browser test passed while checking `1 / 1 (100%)` and `Mastered` in the parent report. One observed combination does not establish scientific mastery. Validate the meaning of this reporting flow with a learner and parent; distinguish exploration/participation from assessed understanding, preserving existing data migration and reward semantics. Include a regression that exploration never appears as evidence of mastery unless an actual assessment supports it.
- **R3 — Lab interaction and discoverability (P2 opportunity, M/L):** 18 catalog items and two abstract slots expose only 17 authored pairs; unsupported pairs are honestly labelled, but selecting two cards then Run hides apparatus, sequence, and cause. The result illustrations and source links are valuable, but are shown only after the selection. Offer guided investigations and a visible bench, not an unrestricted chemistry simulator. Start with a single sourced vinegar/baking-soda investigation: select a beaker, pour a measured virtual material, add the second, observe bubbles and compare before/after; add predict → observe → explain and reset. Tap/keyboard alternatives must operate the same state. Clearly identify unsupported operations and simplified models; don't imply the result predicts every quantity or condition. Under reduced motion use static before/after frames and textual observations. Add filtration and magnet separation in separate PRs after the first interaction is tested.
- **R4 — Evidence quality in tests (P2, M):** existing tests have many good targeted checks but direct `.focus()`, direct method calls, forced data, and synthetic inputs can bypass discoverability, focus order, actual navigation, or real-device behavior. Add journeys starting at Home using only ordinary keyboard input, one complete incorrect→hint→retry→exit path per interaction family, a narrow viewport and zoom, reduced motion, and manual screen-reader/touch sessions. Separate synthetic model-unit tests from user-journey claims. Test outcome and focus, not only element existence or CSS animation name.
- **R5 — Documentation drift (P3, S):** `docs/SUBJECTS_AND_ACTIVITIES.md` says nine belts and lists orange/purple/red while `public/js/mathmasters/curriculum.js` defines seven. It also describes flag reports differently from the newer roadmap's clean-profile result. Correct after verifying current names and retain the unresolved affected-profile report; don't claim the original user's issue is fixed merely because a clean profile passed.

## Coverage checklist and next interaction

Key: **S** = source/catalog inspected; **A** = an existing browser test targets the named journey (see referenced specs; not a claim that every variant ran successfully); **M** = manual browser walkthrough outstanding. All rows need real-device touch, keyboard-only navigation from the hub, screen-reader feedback, 200% zoom, and reduced-motion checks unless separately recorded. Proposals are P3/M unless stated otherwise. Browser automation may exercise representative examples; it does not certify every question or visual state.

### Shared pages and cross-cutting flows

| Page / workflow | Coverage | Finding / next interaction and test |
|---|---|---|
| Home, navigation, Learning Centre, hub cards | S, A (`navigation.spec.js`), M outstanding | Test focus and history after each route; offer an explicit resume/next-step card with a short reason and clear exit. Check small screens, theme, browser back and restored route. |
| Account, guest, profile, settings, Parent Dashboard and report | S (architecture), A (`accounts`, `parent-dashboard`, `accessibility`), M outstanding | Verify guest-only data and parent gate, meaningful report labels, validation, reset confirmation, keyboard focus and announcements; avoid treating exploration as mastery (R2). Never use real learner data for testing. |
| Recommendations, daily challenges, quests, badges, cosmetics, leaderboards | S (architecture), A (matching specs), M outstanding | Make recommendation reasons actionable; show quest steps and progress without surprise resets. The two current quests are Solar System Explorer (planet order, plant life cycle) and Brain Power Trail (pattern, memory, code). Test no-history, missing activity, interrupted/resumed, and guest/signed-in boundaries. |
| Games Hub / Critter Catch | S (`games/hub.js`), A (`navigation.spec.js`), M outstanding | Make this clearly recreational; offer predictable pause and keyboard controls with equivalent feedback. Test timeout, small touch targets and reduced motion. |
| Maths Masters Dojo, belt training, exams, endless, certificates | S (`curriculum.js`), A (`workflows`, `navigation`), M outstanding | Make readiness, exam stakes and retry clear; link each response to a model and show where an error occurred. Test all 46 skills, all seven belt gates, timers and relaxed-practice transitions; PR #215 has since fixed the relaxed-to-standard resume countdown; its focused unit tests pass on the latest baseline. |

### Maths Masters skills and games

Each named skill family needs representative correct, wrong, hint, retry, timed and relaxed paths; the list is a coverage inventory, not a claim each was manually tested. White: subitising, counting 0–10, recognition, writing 0–10, partitioning. Yellow: subitising, doubles, counting and writing 0–20, tens mates, more/less. Green: halving, addition, counting, reading/writing, renaming, ordering, 1–10. Blue: doubling/halving, flexible addition, factors, partitioning, subtraction, balanced equations. Brown: ordering, multiplication, arrays, counting, multiplicative thinking, fractions, reading/writing, renaming. Black: counting, multiplication, mental maths, decimal order, renaming, fraction order, multiplicative thinking. Platinum: division, BODMAS, problem solving, conversion, fractions, decimals, challenge. S (`curriculum.js`); A only for selected workflows and Brown fractions; M all outstanding. Next: connect each family to a manipulable representation—counters/frames for counting and operations, place-value blocks for renaming, arrays for multiplication/division, strips and number lines for fractions/decimals, and stepwise expression tiles for BODMAS. Allow learners to explain or compare two strategies; never replace finite canonical facts with superficial variants. Preserve the documented finite sets for early subitising, friends of ten and halving within 24; the eight planets and six simplified plant stages are also finite teaching sets.

| Shelf activity / arcade | Coverage | Concrete next interaction |
|---|---|---|
| Subitising Snap; Number Models; Partitioning Playground | S, A selected (`workflows`), M | Reveal grouped dots briefly, then let learners reconstruct groups; move objects into two parts and show conservation of total. Offer untimed observation. |
| Tens Frame Fill; Tens Mate Match; Quick-Fire / Near Doubles Dash | S, A selected (`workflows`), M | Fill and regroup frames; slide complementary cards together and explain the missing part. Give an untimed strategy mode alongside speed. |
| Partitioning Puzzles; Renaming Riddles | S, M | Exchange ten ones for one ten or split a hundred block; preserve value visibly, then record the equation. |
| Balance the Scales | S, A (`balance-scales`), M | Deepen existing weights and mystery x with an operation history and reversible equal actions on both pans; textual balance state and static reduced-motion beam. |
| Array Architect; Fraction Fold & Colour | S, M | Resize rows/columns and shade equal partitions; link the model to multiplication and equivalent fractions, allowing correction before checking. |
| Multiplicative Word Problems / Problem-Solving Steps | S, A selected (`workflows`), M | Let learners build a bar model and label units before entering the answer; reveal one worked step only on request. |
| Decimal Number Line; Conversion Match | S, A selected (`workflows`), M | Place values on a zoomable labelled line; transform a shared 100-grid between fraction, decimal and percentage with accessible numeric controls. |
| BODMAS Builder | S, M | Arrange expression tiles and explicitly group operations; step through evaluation and allow undo while retaining a typed alternative. |
| Ninja Balloon Pop; Tens Mate Alchemy Potion Match; Ninja Platform Runner; Shuriken Target Gallery; Space Ninja Asteroid Blaster; Fraction & Decimal Gem Sorter; BODMAS Cyber Boss Defense | S (`curriculum.js`), A (`workflows` launch all seven), M | For each, connect the action to its actual mathematical decision, pause or slow movement, and explain an incorrect choice; offer keyboard and non-motion equivalent. Launch coverage alone does not establish playability or learning. |

### Maths World, Money, Time and Times Tables

| Activity | Coverage | Concrete next interaction |
|---|---|---|
| Number Builder; Missing Number | S (`world.js`), A (`navigation`, `missing-number`), M | Move base-ten blocks and show value changes; construct the missing step on a number line and explain the rule before checking. |
| Fraction Pizza | S, A (`fraction-pizza`), M | Compare equivalent orders on two pizzas; allow tap/keyboard slice placement and explain equal-sized parts. |
| Money: Coin & Note Match; Build the Amount; Change Challenge; Shopkeeper | S (`money.js`), A (`money`, `shopkeeper`), M | Match physical denominations; build equivalent payments and count up on a receipt. Deepen Shopkeeper with customer dialogue and a reversible till; check AU currency, keyboard focus and total announcement. |
| Time: O'Clock & Half Past; Quarter Past & To; Five-Minute Clock Match; Digital to Analogue; Set the Clock | S (`telling-time.js`), A (`telling-time`, `navigation`), M | Link a movable clock to a timeline and day/night label; explain hour-hand movement and elapsed time. Preserve keyboard arrows and touch alternatives. |
| Times Tables: individual 2–12, mixed quiz, mastery, endless, Product Pair Match | S (`timetables.js`), A (`workflows` for quiz/endless), M | Build arrays and groups before speed work; show inverse relationships and an untimed option. Exercise Product Pair Match separately and test focus, timeout and replay. |

### Spelling & Words

S (`safari.js`), A (`spelling-safari.spec.js` covers five adventures, phonics and Spell It); M all outstanding. Across all modes test unavailable speech, mute, accent, replay, retries, mobile zoom and keyboard focus; do not expose the answer prematurely.

| Activity | Concrete next interaction |
|---|---|
| Spelling Sprint | Build and revise the word with grapheme tiles; explain the spelling pattern after a try. |
| Phonics Trail | Deepen the existing soundboard with movable phoneme/digraph tiles and a visible blending sweep; text and independent audio controls when speech fails. |
| Word Explorer | Sort words by meaning in a sentence, compare near synonyms, and explain why a word fits the context. |
| Jungle Jumble | Move letter tiles, including repeated letters, into slots with undo and a clue that does not reveal the word. |
| Rhyme Ranger | Group spoken and written word endings; let learners hear each option and compare spelling versus sound. |
| Spell It | Keep teacher lists private; use an editable typed/tile attempt, replay and a post-attempt comparison with the intended spelling. |

### Science

| Activity | Coverage | Concrete next interaction |
|---|---|---|
| Orbit Rescue; Habitat Match; Matter Lab; Nature Detectives | S (`explorers.js`), A (`workflows` representative missions), M | Replace isolated recall with respectively orbit model manipulation, habitat evidence sorting, material-property experiments, and ecological observations. Keep explanations and sources attached to the relevant claims. |
| Solar System | S, A (`solar-system`), M | Deepen the finite eight-planet ordering with a scale toggle and comparisons; explicitly mark schematic orbits/distances and avoid implying visual size is to scale. |
| Plant Life Cycle | S, A (`plant-life-cycle`), M | Move through growth conditions and show the cycle looping to seed dispersal; distinguish simplified stages from all plant life cycles. |
| Food Chains | S, A (`food-chains`), M | Build arrows showing energy direction, then remove one organism and predict consequences. Preserve the sourced ten habitats and the chemical-energy exception for deep-sea vents. |
| Virtual Laboratory | S, A (`virtual-lab`), targeted keyboard probe F1; M outstanding | See F1, R2 and R3. Retain all 17 sourced outcomes and honest unsupported-pair handling in any redesign. |
| Pond Ecosystem Sandbox | S, A (`ecosystem-sandbox`), M | Deepen its four adjustable populations and five-day chart with prediction, comparison of two runs and a clear model-rules panel; keep the simplified, bounded model explicit and accessible without animation. |
| Thermal Chamber | S (roadmap), A (`thermal-chamber`), M | Let learners compare a temperature and lid state before/after; label phase boundaries and explain the simplified particle model with a still-frame equivalent. |

### Geography, History, Brain Power, Life Skills

| Activity / page | Coverage | Concrete next interaction |
|---|---|---|
| World Map and country list | S (`country-data`, `world-map` documented), A (`geography-world`), M | Add an accessible place-search and compare panel; retain list, pan/zoom, schematic-island disclosure and citations. Recheck the reported flag problem in the affected Chrome profile; clean-profile success does not resolve that report. |
| Flag Detective | S, A (`geography-country-activities`), M | Compare flag features and locate the selected country on the map after answering; avoid treating flag colours as universally meaningful. |
| Capital Cities | S, A (`geography-country-activities`), M | Match a capital to a map location, then reveal country context and source; retain an accessible list alternative. |
| Globe Trotter Clue Trail | S, A (`geography-world`), M | Deepen existing sourced mysteries with a notebook of evidence, explicit confidence and a map/list decision; give progressive clues without penalising exploration. |
| Timeline Builder | S, A (`history-timeline`), M | Add relative date bands and explain why neighbouring events precede/follow each other; maintain keyboard reorder and linked sources. |
| Artifact Detective | S, A (`history-artifact-detective`), M | Let learners annotate inspected evidence and distinguish observation from inference before choosing; preserve seven museum-sourced cases and the Maya stela's documented stewardship context. Check focus after each clue (F3). |
| Pattern Recognition | S, A (`brain-power`), targeted keyboard probe F4; M | Let learners create the next item and explain or compare plausible rules before revealing the authored rule. |
| Memory Match | S, A (`brain-power`), targeted probe F5; M | Provide optional grouping/strategy prompts and accessible card identity, without revealing face-down cards; test memory and reduced motion. |
| Code Breaker | S, A (`brain-power`), targeted probe F5; M | Show an accessible history of guesses with exact/misplaced clues and let learners mark eliminated possibilities; do not rely on colour alone. |
| Plan a Party | S, A (`plan-party`), M | Add a visual basket and running budget, compare trade-offs and optional substitutions, then explain unmet requirements or overspend. Check focus on each quantity change (F2). Four scenarios and 24 catalog items are finite contextual content, not 100 distinct questions. |

## Prioritized small PRs and acceptance checks

1. **Lab keyboard focus (P2/S):** restore meaningful focus after selection, placement, filtering, run and reset; add an uninterrupted keyboard journey with assertions for focus and announcements. Include mobile tap and reduced-motion regression.
2. **Exploration reporting semantics (P2/M):** separate participation from assessed mastery for Virtual Lab; audit other sandbox metrics, parent report and migrations; test old and new records, guest and signed-in accounts.
3. **Focus audit fixes by activity (P2/M split into separate PRs):** fix confirmed Party Planner and Artifact Detective focus loss separately; fix Pattern Recognition (F4), Memory Match and Code Breaker (F5); audit other transitions under R1. Test Tab/Enter/Space through retry and result, without `.focus()` between steps.
4. **Test journey coverage (P2/M):** add representative end-to-end journeys for each activity family, a coverage matrix by actual interaction and input mode, and manual assistive-technology/device protocol; run desktop and mobile with reduced motion and 200% zoom. Keep model and UI tests distinct.
5. **Lab bench first experiment (P2/M):** one sourced reaction, reversible steps, prediction/observation and accessible equal operations; retain current result catalogue until equivalent validated journeys exist. Follow with separate filtration and magnet PRs.
6. **One focused PR each for maths manipulatives, phonics/word tiles, science investigation, geography evidence notebook, history evidence annotation, and party trade-offs (P3/M each):** prototype one activity, observe with learners and measure task completion, error recovery and explanation quality before scaling. No cosmetic animation without a causal teaching role; static/text alternative required.
7. **Inventory/documentation correction (P3/S):** reconcile belt count, flag status, current modes, finite sets and current sources with code and tests.

Before calling this review complete, manually exercise every unchecked page/activity and all modes listed above, verify each identified risk, record browser/device/input, steps and observed result, and add any new issue with a minimal reproducible test. Source inspection and automated coverage alone do not satisfy that acceptance criterion.

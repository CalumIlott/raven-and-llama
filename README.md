# Raven & Llama Learning

A family-friendly learning platform with Maths World activities including Number Builder and Fraction Pizza, a Science Lab with planet ordering, plant life-cycle sequencing, safe Virtual Laboratory simulations, and Science Explorers missions, Maths Masters including Australian-currency shopkeeper practice, Times Tables practice, Spell It with parent-managed weekly spelling lists, arcade activities, printable certificates, and optional username/password accounts. Guests can play without registering; guest progress is temporary and is discarded when the visit ends. Signed-in progress is private to that account and syncs across devices through Cloudflare D1.

## Run Locally

Requires Node.js 22.5 or newer.

```powershell
npm start
```

`npm start` builds the self-hosted Tailwind stylesheet and browser assets before launching the server. Run `npm run build` after changing Tailwind classes or client assets. Commit the generated `public/css/tailwind.css` and `public/js/vendor/confetti.js` so Worker deployments do not depend on runtime asset CDNs. Static responses revalidate on use, so asset URLs do not need manual cache-version query parameters.

Open http://localhost:8080. Local accounts and progress are stored transactionally in the gitignored `data/accounts.sqlite`. Existing `data/accounts.json` files are imported once on startup and retained unchanged as a backup. Use Node.js 22.5 or newer for the built-in SQLite driver. To use a different port, set `PORT` before starting the server.

Alternatively, run `docker compose up -d --build` and open http://localhost:8080, or use `start-server.bat` on Windows.

## Tests

Install dependencies, install the Playwright Chromium browser once, then run generated-asset verification, unit, HTTP integration, Worker-bundle, browser, and dependency checks:

```bash
npm ci
npx playwright install chromium
npm run test:css
npm test
npm run audit
```

The tests cover password/session handling, account isolation, cross-context progress sync, curriculum logic, server/API behavior, module navigation including Maths World, Number Builder, Fraction Pizza, and the refresh-safe Science Lab route, training and exam flows, all seven Maths Masters arcades, Times Tables quizzes, Solar System ordering, plant life-cycle sequencing, and safe Virtual Laboratory simulations by keyboard, touch, and drag-and-drop, progress/trophy views, and keyboard/mobile accessibility. Browser tests use an isolated account store. Run `npm run test:css`, `npm run test:unit`, `npm run test:integration`, `npm run test:worker`, `npm run test:e2e`, or `npm run audit` to run one check. GitHub Actions verifies committed assets, runs unit/integration checks on Node.js 22, 24, and 26, validates the Worker bundle, runs desktop and mobile Chromium E2E, and audits dependencies for pull requests targeting `main`. See [tests/README.md](tests/README.md) for coverage details.

## Project Layout

```text
public/index.html          App shell and static site root
public/js/shared/          App shell, accounts, audio, and shared renderers
public/js/home/            Home page view
public/js/learning/        Learning Centre view
public/js/games/           Games Hub and Critter Catch routes
public/js/mathmasters/     Curriculum, question generators, Maths World, dojo views, and arcade/game engines
public/js/science/         Science Lab and Science Explorers activities
public/js/timetables/      Times Tables practice and arcade views
public/css/                Application styles
public/js/vendor/          Self-hosted browser libraries
public/assets/             Brand assets
tailwind.config.js         Static Tailwind source scanning and theme
tailwind.input.css         Tailwind build entry point
scripts/                   Asset copying and generated-file verification
server.js                  Static server and account API
worker.js                  Cloudflare Worker API/static-assets entry point
wrangler.jsonc              Worker build and static-assets configuration
lib/                        Shared auth handler, stores, and D1 adapter
migrations/                 Cloudflare D1 schema migrations
tests/unit/                Curriculum, generator, account, and storage tests
tests/integration/         Isolated server and API tests
tests/e2e/                 Playwright browser workflow tests
playwright.config.js        Chromium runner and local server configuration
.github/workflows/ci.yml   Pull request checks
data/                      Local SQLite account storage and legacy JSON backup (gitignored)
```

## Cloudflare Workers Setup

The repository is configured for Cloudflare Workers Builds with static assets in `public/`. Production uses the `raven-llama-accounts` D1 database; public Worker Previews use the separate `raven-llama-accounts-preview` database so preview accounts and progress cannot access production data. Guests can still play without either binding, but registration and cross-device saving are unavailable.

1. Create both D1 databases with `npx wrangler d1 create raven-llama-accounts` and `npx wrangler d1 create raven-llama-accounts-preview`.
2. Set the corresponding database IDs in `wrangler.jsonc` and `wrangler.preview-migrations.jsonc`. The production binding is top-level; the Preview binding belongs under `previews.d1_databases` and must never point to the production database.
3. Apply the schema to both databases with `npx wrangler d1 migrations apply raven-llama-accounts --remote` and `npx wrangler d1 migrations apply raven-llama-accounts-preview --remote --config wrangler.preview-migrations.jsonc`.
4. Keep the Workers Builds Preview deploy command as `npx wrangler preview`; it requires the Preview-safe D1 binding above.

Accounts are stored in D1 in production. Passwords are PBKDF2-hashed; browser sessions use HttpOnly, SameSite cookies; progress endpoints resolve the account from the session and never expose an account list. Signed-in users can choose a global school year and optional Maths, Science, and English year overrides in account settings; these profile preferences sync across browsers. Parent-managed spelling lists sync as part of the authenticated learner profile and are never saved for guests; each account can keep up to ten lists, with up to 50 words per list and 100 characters per word. Profiles store the numeric `schoolYear` (Foundation is `0`, through Year 12) and a `subjectYears` object keyed by `maths`, `science`, and `english`; subjects without an override inherit the global year. Tiered activities use the effective subject year to recommend Easy for Foundation–Year 2, Medium for Years 3–6, and Hard for Years 7–12. Learners can choose another tier before starting; activities with their own modes or progression are unchanged. Recommendations are currently shown in Money Masters, Science Explorers, and Spelling Safari. The legacy shared `profiles.json` data is not imported because it has no account ownership. Password recovery by email is not available because accounts do not collect email addresses; users can change their password while signed in.

The Mastery & Progress Report stores curriculum skill scores separately from named Learning Centre activity scores in `activityProgress`. Its Learning Centre table shows each activity's play count, best result, completion status, and quiz accuracy; arcade games report accuracy as “Not measured.” Quiz accuracy uses finalized correct and total question outcomes across plays, not weighted points, and older quiz records without answer counts show “Not recorded.” Stable activity IDs identify progress records, while optional `skillId` values link an activity to curriculum mastery without conflating the two reports. A separate bounded `activityHistory` records up to 365 completions without prompts or answers; the report aggregates subject summaries and daily trends for 7-, 30-, or 90-day ranges. Learning Centre skill links are resolved from configured curriculum data, while Australian Curriculum codes are shown only when verified mappings exist. Activity definitions use the versioned standard JSON Schema at [public/schemas/activity-v1.schema.json](public/schemas/activity-v1.schema.json); quizzes and arcade-style games share the same activity lifecycle and scoring interface. Configured activity star awards are applied by the shared progress recorder once at completion. Quiz feedback can include an explanation, an audio hint, and a structured worked example; the shared Educational Feedback component renders these safely and offers retry actions where supported. Daily Challenges choose one eligible activity from Maths, Spelling, Science, and Brain Power using a deterministic UTC date key, and award ten bonus stars once when the set is complete. Signed-in daily state is stored in the account-scoped `dailyChallenges` profile field for the current and previous 30 UTC days; no database migration is needed because profiles are stored as JSON. Learning Quests sequence supported activities; signed-in ordered progress is stored in `questProgress`, and completing every step grants a quest-specific Achievement Badge. Achievement badges are derived from recorded activity, skill, belt, and quest progress; the validated `earnedBadges` profile field contains catalog IDs only, and the server does not accept client-selected awards. The Cosmetic Shop offers avatar frames purchasable with earned stars; `ownedCosmetics` is granted only by the server-side purchase route, and `equippedCosmetic` must reference an owned catalog item. Guest activity, challenge, quest, badge, and cosmetic progress remains in memory only for the current visit.

The Spelling & Words hub is available at `/learning-centre/spelling` and reuses the four Spelling Safari adventures. Parents and teachers can create, edit, activate, and delete weekly spelling lists from the Progress report. Spell It draws only from the selected list, accepts case-insensitive answers after trimming surrounding whitespace, and does not reveal a word until a submitted spelling. Learners can replay pronunciations with the browser's built-in speech synthesis; no words are sent to an external speech service, and playback follows the app sound setting. Guest lists are held in memory only for the current visit.

Leaderboards are public and show only the top ten usernames and scores for the Learning Centre, Maths Masters, Times Tables, and each Maths Masters belt. Guest progress is not included.

Registration is limited to 30 attempts per source per minute. Login is limited to 60 attempts per source per minute and 10 attempts per source/username pair per minute. Worker Rate Limiting bindings are approximate and local to each Cloudflare location; the local Node server enforces the same limits per process and socket peer. If the Node server is behind a reverse proxy, configure rate limiting at that proxy as well because local requests share the proxy's socket address. Wrangler rate-limit namespace IDs must remain unique within the Cloudflare account; production and Preview use separate IDs and counters.

Responses set baseline framing, MIME-sniffing, referrer, and permissions policies. The content security policy restricts scripts to same-origin assets; styles allow Google Fonts, with no inline style exception. Tailwind and confetti are built/self-hosted.

## Account API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/leaderboards?scope=...` | Return the top ten usernames and scores for a supported public leaderboard |
| POST | `/api/auth/register` | Create an account and sign in |
| POST | `/api/auth/login` | Sign in with username and password |
| GET | `/api/auth/session` | Return the current account and its progress |
| POST | `/api/auth/logout` | Revoke the current session |
| POST | `/api/auth/password` | Change the signed-in account password |
| DELETE | `/api/auth/account` | Delete the signed-in account and progress |
| POST | `/api/cosmetics/purchase` | Purchase one available catalog cosmetic using the signed-in learner's star balance |
| GET/PUT | `/api/progress` | Read or update only the signed-in account's progress |

`PUT /api/progress` validates and normalizes the profile's `activityProgress` records, including activity IDs, optional curriculum `skillId` mappings, score units, best results, play counts, and quiz `correctAnswers`/`totalAnswers`. It also validates `dailyChallenges` UTC day keys, selected activity IDs, unique completion IDs, and the one-time bonus state, plus `questProgress` against known quest and step IDs in order while preventing completed-step regressions. The API derives `earnedBadges` from validated progress, preserves prior valid awards, and ignores client-supplied badge IDs. Cosmetic purchases use the server catalog's fixed price, deduct from the authenticated learner's stored star balance, and grant each item once; profile updates cannot add cosmetic ownership, and equipping requires existing ownership. The local server and Worker use the same account-profile contract; records are only returned or updated through the authenticated account session.

## Contributing

Follow the repository rules in [agents.md](agents.md). Each unit of work should be a separate, focused commit on a feature branch and merged into `main` through a pull request.

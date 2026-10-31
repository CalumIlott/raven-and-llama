# Test Suite

Run all checks with `npm test` (Node.js 22.5 or newer). After `npm ci`, install Chromium once with `npx playwright install chromium`. Run `npm run test:css` to verify committed generated assets; unit and integration suites use Node's built-in test runner, Wrangler dry-runs the Worker bundle, Playwright covers desktop and mobile Chromium, and `npm run audit` checks dependencies.

## Coverage

- `unit/curriculum.test.js` checks belt ordering, unique identifiers, skill metadata, and arcade definitions.
- `unit/generators.test.js` exercises standard and hard question generation for every curriculum skill, answer options, choice generation, shuffling, and belt exams.
- `unit/spelling-safari.test.js` checks activity definitions, unique answerable rounds, scrambled letters, and invalid activity handling.
- `unit/accounts.test.js` checks temporary guest state, session restoration, account-scoped progress sync, training aggregation, final-exam prerequisites, and graduation/certificate recording.
- `unit/account-api.test.mjs` checks input validation, password hashing, secure sessions, owner-scoped progress, password changes, account deletion, same-origin protections, and auth throttling behavior.
- `unit/worker-auth-rate-limit.test.mjs` checks Worker rate-limit keys and denied decisions without remote bindings.
- `unit/local-account-store.test.js` checks SQLite persistence, legacy JSON import, session expiry, account deletion, and concurrent writes from separate Node processes.
- `integration/server.test.js` starts the HTTP server with a temporary data directory and verifies registration, login, owner-only progress, logout, malformed input, legacy endpoint rejection, and private-file protection.
- `integration/worker.test.js` runs the Worker locally with Wrangler and temporary D1 persistence, then checks headers, registration, session restore, progress, origin protection, and rate limiting without remote resources.
- `e2e/navigation.spec.js` checks home/module navigation, curriculum counts, locked exam prerequisites, a failed exam, retry, the 80% pass threshold, and the Stage 2 unlock.
- `e2e/spelling-safari.spec.js` completes spelling, phonics, vocabulary, and word-scramble rounds through the learning hub.
- `e2e/accounts.spec.js` checks guest notice, registration, session restore, password change, login, logout, account deletion, and progress sync across separate browser contexts with account isolation.
- `e2e/workflows.spec.js` checks full skill training and progress, all three Times Tables quiz modes, Product Pair Match scoring, all seven belt arcade launch/exit paths, progress reporting, and the trophy room.
- `e2e/accessibility.spec.js` checks semantic keyboard navigation, dialog focus trapping/restoration, Escape-to-close, and horizontal overflow at a narrow viewport. The same test runs in desktop Chromium and Pixel 7 emulation.

E2E tests use temporary account data and Playwright output directories, so they never modify local learner data or place Windows trace files under a synced workspace. GitHub Actions verifies generated assets are committed, runs unit/integration tests on Node.js 22, 24, and 26, validates the Worker bundle with Wrangler, runs desktop/mobile browser tests, and audits dependencies. `npm test` runs the four test suites; `npm run test:css` and `npm run audit` are separate gates.
# Test Suite

Run all tests with `npm test` (Node.js 20 or newer). After `npm ci`, install Chromium once with `npx playwright install chromium`. The unit and integration suites use Node's built-in test runner, Wrangler dry-runs the Worker bundle, and browser coverage uses Playwright Test.

## Coverage

- `unit/curriculum.test.js` checks belt ordering, unique identifiers, skill metadata, and arcade definitions.
- `unit/generators.test.js` exercises standard and hard question generation for every curriculum skill, answer options, choice generation, shuffling, and belt exams.
- `unit/accounts.test.js` checks temporary guest state, session restoration, account-scoped progress sync, training aggregation, final-exam prerequisites, and graduation/certificate recording.
- `unit/account-api.test.mjs` checks input validation, password hashing, secure sessions, owner-scoped progress, password changes, account deletion, and same-origin protections.
- `unit/local-account-store.test.js` checks local persistence, session expiry, and account data removal.
- `integration/server.test.js` starts the HTTP server with a temporary data directory and verifies registration, login, owner-only progress, logout, malformed input, legacy endpoint rejection, and private-file protection.
- `e2e/navigation.spec.js` checks home/module navigation, curriculum counts, locked exam prerequisites, a failed exam, retry, the 80% pass threshold, and the Stage 2 unlock.
- `e2e/accounts.spec.js` checks guest notice, registration, session restore, password change, login, logout, account deletion, and progress sync across separate browser contexts with account isolation.
- `e2e/workflows.spec.js` checks full skill training and progress, all three Times Tables quiz modes, Product Pair Match scoring, all seven belt arcade launch/exit paths, progress reporting, and the trophy room.

E2E tests use a temporary account data directory and the real account API, so they never modify local learner data. GitHub Actions runs unit/integration tests on Node.js 20, 22, and 24, validates the Worker bundle with Wrangler, then runs the Chromium suite on pull requests and pushes. The `npm test` command runs all three checks locally.
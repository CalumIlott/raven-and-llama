# Test Suite

Run all tests with `npm test` (Node.js 20 or newer). After `npm ci`, install Chromium once with `npx playwright install chromium`. The unit and integration suites use Node's built-in test runner; browser coverage uses Playwright Test.

## Coverage

- `unit/curriculum.test.js` checks belt ordering, unique identifiers, skill metadata, and arcade definitions.
- `unit/generators.test.js` exercises standard and hard question generation for every curriculum skill, answer options, choice generation, shuffling, and belt exams.
- `unit/profiles.test.js` checks profile normalization, avatar fallback, training-score aggregation, active-profile deletion, final-exam prerequisites, and graduation/certificate recording.
- `integration/server.test.js` starts the HTTP server against a temporary copy of the app, then checks static assets, API reads/writes/deletes, malformed JSON handling, and CORS preflight behavior. The test never reads or writes the repo's `data/` directory.
- `e2e/navigation.spec.js` checks home/module navigation, curriculum counts, locked exam prerequisites, a failed exam, retry, the 80% pass threshold, and the Stage 2 unlock.
- `e2e/workflows.spec.js` checks full skill training and progress, profile creation/switch/deletion, all three Times Tables quiz modes, Product Pair Match scoring, all seven belt arcade launch/exit paths, progress reporting, and the trophy room.

E2E tests mock `/api/profiles`, so they never modify local or CI learner data. GitHub Actions runs unit/integration tests on Node.js 20, 22, and 24, then runs the Chromium suite on pull requests and pushes. The `npm test` command runs both groups locally.
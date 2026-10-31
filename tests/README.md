# Test Suite

Run all tests with `npm test` (Node.js 20 or newer). The suite uses Node's built-in test runner and does not require third-party packages or access to the network.

## Coverage

- `unit/curriculum.test.js` checks belt ordering, unique identifiers, skill metadata, and arcade definitions.
- `unit/generators.test.js` exercises standard and hard question generation for every curriculum skill, answer options, choice generation, shuffling, and belt exams.
- `unit/profiles.test.js` checks profile normalization, avatar fallback, training-score aggregation, and active-profile deletion.
- `integration/server.test.js` starts the HTTP server against a temporary copy of the app, then checks static assets, API reads/writes/deletes, malformed JSON handling, and CORS preflight behavior. The test never reads or writes the repo's `data/` directory.

GitHub Actions runs the suite on Node.js 20, 22, and 24 for each push and pull request.
# Raven & Llama Learning

A family-friendly learning platform with the Maths Masters belt curriculum, Times Tables practice, arcade activities, printable certificates, and synchronised learner profiles. The frontend is vanilla JavaScript with no build step; a small Node.js server serves the app and persists profiles.

## Run Locally

Requires Node.js 20 or newer.

```powershell
npm start
```

Open http://localhost:8080. To use a different port, set `PORT` before starting the server.

Alternatively, run `docker compose up -d --build` and open http://localhost:8080, or use `start-server.bat` on Windows.

## Tests

Install dependencies, install the Playwright Chromium browser once, then run all unit, HTTP integration, and browser tests:

```bash
npm ci
npx playwright install chromium
npm test
```

The tests cover all curriculum skills, profile and graduation rules, server/API behavior, module navigation, training and exam flows, all seven Maths Masters arcades, profile management, Times Tables quizzes, Product Pair Match, and progress/trophy views. E2E tests use a mocked profile API and do not write local learner data. Run `npm run test:unit` or `npm run test:e2e` to run a single suite. GitHub Actions reports `Node.js 20`, `Node.js 22`, `Node.js 24`, and `Playwright E2E` checks on pushes and pull requests. Configure `main` branch protection to require all four checks so a failing test blocks merging. See [tests/README.md](tests/README.md) for the coverage map.

## Project Layout

```text
index.html                 App shell
js/                        Browser application, curriculum, games, and profile logic
css/styles.css             Application styles
assets/                    Brand assets
server.js                  Static server and profile API
tests/unit/                Curriculum, generator, and profile tests
tests/integration/         Isolated server and API tests
tests/e2e/                 Playwright browser workflow tests
playwright.config.js        Chromium runner and local server configuration
.github/workflows/ci.yml   Push and pull request checks
data/                      Runtime profile storage (gitignored)
```

## Profiles API

Profiles are stored in `data/profiles.json`, which is local runtime data and must not be committed.

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| GET | `/api/profiles` | — | Return `{ "profiles": [...] }` |
| POST | `/api/profiles` | `{ "profile": { ... } }` | Upsert one profile by `id` |
| POST | `/api/profiles` | `{ "deleteProfileId": "..." }` | Delete a profile by `id` |
| POST | `/api/profiles` | `{ "profiles": [...] }` | Replace the profiles state |

## Contributing

Follow the repository rules in [agents.md](agents.md). Each unit of work should be a separate, focused commit on a feature branch and merged into `main` through a pull request.

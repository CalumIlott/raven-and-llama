# Raven & Llama Learning

A family-friendly learning platform with Maths Masters, Times Tables practice, arcade activities, printable certificates, and optional username/password accounts. Guests can play without registering; guest progress is temporary and is discarded when the visit ends. Signed-in progress is private to that account and syncs across devices through Cloudflare D1.

## Run Locally

Requires Node.js 20 or newer.

```powershell
npm start
```

Open http://localhost:8080. Local accounts and progress are stored in the gitignored `data/accounts.json`. To use a different port, set `PORT` before starting the server.

Alternatively, run `docker compose up -d --build` and open http://localhost:8080, or use `start-server.bat` on Windows.

## Tests

Install dependencies, install the Playwright Chromium browser once, then run unit, HTTP integration, Worker-bundle, and browser tests:

```bash
npm ci
npx playwright install chromium
npm test
```

The tests cover password/session handling, account isolation, cross-context progress sync, curriculum logic, server/API behavior, module navigation, training and exam flows, all seven Maths Masters arcades, Times Tables quizzes, and progress/trophy views. Browser tests use an isolated temporary account store. Run `npm run test:unit`, `npm run test:worker`, or `npm run test:e2e` to run one suite. GitHub Actions runs unit/integration checks on Node.js 20, 22, and 24, validates the Worker bundle, and runs Chromium E2E on pushes and pull requests. See [tests/README.md](tests/README.md) for coverage details.

## Project Layout

```text
public/index.html          App shell and static site root
public/js/shared/          App shell, accounts, audio, and shared renderers
public/js/home/            Home page view
public/js/learning/        Learning hub view
public/js/mathmasters/     Curriculum, question generators, dojo views, and arcade/game engines
public/js/timetables/      Times Tables practice and arcade views
public/css/                Application styles
public/assets/             Brand assets
server.js                  Static server and account API
worker.js                  Cloudflare Worker API/static-assets entry point
wrangler.jsonc              Worker build and static-assets configuration
lib/                        Shared auth handler, stores, and D1 adapter
migrations/                 Cloudflare D1 schema migrations
tests/unit/                Curriculum, generator, account, and storage tests
tests/integration/         Isolated server and API tests
tests/e2e/                 Playwright browser workflow tests
playwright.config.js        Chromium runner and local server configuration
.github/workflows/ci.yml   Push and pull request checks
data/                      Runtime profile storage (gitignored)
```

## Cloudflare Workers Setup

The repository is configured for Cloudflare Workers Builds with static assets in `public/`. Production uses the `raven-llama-accounts` D1 database; public Worker Previews use the separate `raven-llama-accounts-preview` database so preview accounts and progress cannot access production data. Guests can still play without either binding, but registration and cross-device saving are unavailable.

1. Create both D1 databases with `npx wrangler d1 create raven-llama-accounts` and `npx wrangler d1 create raven-llama-accounts-preview`.
2. Set the corresponding database IDs in `wrangler.jsonc` and `wrangler.preview-migrations.jsonc`. The production binding is top-level; the Preview binding belongs under `previews.d1_databases` and must never point to the production database.
3. Apply the schema to both databases with `npx wrangler d1 migrations apply raven-llama-accounts --remote` and `npx wrangler d1 migrations apply raven-llama-accounts-preview --remote --config wrangler.preview-migrations.jsonc`.
4. Keep the Workers Builds Preview deploy command as `npx wrangler preview`; it requires the Preview-safe D1 binding above.

Accounts are stored in D1 in production. Passwords are PBKDF2-hashed; browser sessions use HttpOnly, SameSite cookies; progress endpoints resolve the account from the session and never expose an account list. Signed-in users can choose a dark or light theme in account settings; this preference is stored with that account's progress and syncs across browsers. Guest sessions use the default dark theme without saving it. The legacy shared `profiles.json` data is not imported because it has no account ownership. Password recovery by email is not available because accounts do not collect email addresses; users can change their password while signed in.

Leaderboards are public and show only the top ten usernames and scores for the overall learning hub, Maths Masters, Times Tables, and each Maths Masters belt. Guest progress is not included.

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
| GET/PUT | `/api/progress` | Read or update only the signed-in account's progress |

## Contributing

Follow the repository rules in [agents.md](agents.md). Each unit of work should be a separate, focused commit on a feature branch and merged into `main` through a pull request.

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

Install dependencies, install the Playwright Chromium browser once, then run all unit, HTTP integration, and browser tests:

```bash
npm ci
npx playwright install chromium
npm test
```

The tests cover password/session handling, account isolation, cross-context progress sync, curriculum logic, server/API behavior, module navigation, training and exam flows, all seven Maths Masters arcades, Times Tables quizzes, and progress/trophy views. Browser tests use an isolated temporary account store. Run `npm run test:unit` or `npm run test:e2e` to run one suite. GitHub Actions runs unit/integration checks on Node.js 20, 22, and 24, plus Chromium E2E on pushes and pull requests. See [tests/README.md](tests/README.md) for coverage details.

## Project Layout

```text
index.html                 App shell
js/                        Browser application, curriculum, games, and profile logic
css/styles.css             Application styles
assets/                    Brand assets
server.js                  Static server and account API
functions/api/             Cloudflare Pages account API
functions/_shared/          Shared auth handler and D1 adapter
migrations/                 Cloudflare D1 schema migrations
tests/unit/                Curriculum, generator, and account tests
tests/integration/         Isolated server and API tests
tests/e2e/                 Playwright browser workflow tests
playwright.config.js        Chromium runner and local server configuration
.github/workflows/ci.yml   Push and pull request checks
data/                      Runtime profile storage (gitignored)
```

## Cloudflare Pages Setup

Cloudflare Pages must deploy the root `functions/` directory and bind a D1 database named `DB`. Without this binding, guests can still play, but registration and cross-device saving are unavailable.

1. Create a D1 database named `raven-llama-accounts` in Cloudflare.
2. Apply the schema with `npx wrangler d1 execute raven-llama-accounts --remote --file migrations/0001_accounts.sql`.
3. In the Pages project, open **Settings → Functions → D1 database bindings** and add a binding named `DB` pointing to that database.
4. Redeploy the Pages project so the Functions runtime receives the binding.

Accounts are stored in D1 in production. Passwords are PBKDF2-hashed; browser sessions use HttpOnly, SameSite cookies; progress endpoints resolve the account from the session and never expose an account list. The legacy shared `profiles.json` data is not imported because it has no account ownership. Password recovery by email is not available because accounts do not collect email addresses; users can change their password while signed in.

## Account API

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account and sign in |
| POST | `/api/auth/login` | Sign in with username and password |
| GET | `/api/auth/session` | Return the current account and its progress |
| POST | `/api/auth/logout` | Revoke the current session |
| POST | `/api/auth/password` | Change the signed-in account password |
| DELETE | `/api/auth/account` | Delete the signed-in account and progress |
| GET/PUT | `/api/progress` | Read or update only the signed-in account's progress |

## Contributing

Follow the repository rules in [agents.md](agents.md). Each unit of work should be a separate, focused commit on a feature branch and merged into `main` through a pull request.

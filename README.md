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

Install dependencies and run the complete unit and HTTP integration test suite:

```bash
npm ci
npm test
```

The tests cover curriculum consistency, generated question invariants, profile behavior, static asset serving, and the profiles API. GitHub Actions runs the suite on pushes and pull requests. See [tests/README.md](tests/README.md) for coverage details.

## Project Layout

```text
index.html                 App shell
js/                        Browser application, curriculum, games, and profile logic
css/styles.css             Application styles
assets/                    Brand assets
server.js                  Static server and profile API
tests/unit/                Curriculum, generator, and profile tests
tests/integration/         Isolated server and API tests
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

Follow the repository rules in [agents.md](agents.md). Each unit of work should be a separate, focused commit.

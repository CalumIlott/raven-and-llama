# Agent Contribution Guidelines

Welcome to the **Raven & Llama** repository. This document defines the conventions all contributors (human and AI) must follow when working in this codebase.

---

## Core Rule: One Commit Per Unit of Work

> **Each logical unit of work must be a separate, focused commit.**

A "unit of work" is one cohesive change: a bug fix, a new feature, a refactor, a test addition, or a configuration update. Never bundle unrelated changes into a single commit.

**Commit as you go:** Once a logical unit is implemented and its focused checks pass, stage only that unit's files and commit it before starting the next unit. Do not defer all commits until the end of a multi-part task.

**Good commit examples:**
```
fix: prevent duplicate questions within a single quiz session
feat: add hippo and owl avatar options to profile manager
chore: enforce static asset revalidation headers
test: add unit tests for QuestionGenerator dedup logic
```

**Bad commit examples:**
```
misc changes
fix stuff + add feature + update readme
WIP
```

---

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short description>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Code restructure with no behaviour change |
| `test` | Adding or updating tests |
| `chore` | Tooling, CI, config, deps (no production code change) |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `perf` | Performance improvement |

---

## Branching

- `main` — stable, deployable at all times
- Feature / fix branches: `feat/<short-slug>` or `fix/<short-slug>`
- All new functionality must be developed on a feature branch and merged into `main` via a pull request.
- All changes arrive via pull request; do not push directly to `main`.
- Pull requests must pass every required CI check before they can be merged.
- GitHub branch protection for `main` must require `Node.js 22`, `Node.js 24`, `Node.js 26`, `Playwright E2E`, and `Dependency audit` status checks.

---

## Testing Requirements

- All new logic (generators, game engine, profile management) must have accompanying unit tests in `tests/unit/`.
- Server, persistence, and API behavior changes must include integration coverage in `tests/integration/`.
- UI/navigation changes must include an automated browser test in `tests/e2e/`.
- All new functionality requires complete unit and automated test coverage for its behavior and relevant user workflows.
- Tests must pass in CI before merging; run `npm test` and `npm run audit` locally before pushing.

---

## File & Code Conventions

- Vanilla JavaScript only; no JavaScript transpiler or bundler. Build Tailwind and browser assets with `npm run build`; commit the generated `public/css/tailwind.css` and `public/js/vendor/confetti.js` with source changes.
- Tailwind utility classes must be complete strings (no dynamic concatenation) so the static scanner can detect them.
- Account progress must always be scoped to the authenticated session; never add an API that lists accounts or accepts a client-supplied account ID as authority.
- Store only password hashes and hashed session tokens. Keep account storage changes aligned between local `server.js`, the Cloudflare Worker, D1 migrations, and the API docs in `README.md`.
- Guest progress is memory-only and must never be written to local storage or sent to account endpoints.
- Static responses must revalidate using `Cache-Control`; do not add manual `?v=` tokens to asset URLs.
- The `data/` folder is gitignored — never commit user profile data

---

## AI Agent Guidelines

When working as an AI agent in this repository:

1. **Scope**: Only modify files relevant to the current task. Do not "clean up" unrelated code.
2. **Commit granularity**: Each distinct change (e.g. bug fix, feature, test) = separate commit.
3. **Commit as you go**: After a unit passes its focused checks, commit that unit before beginning another; do not accumulate unrelated finished work.
4. **Verify before committing**: Check for syntax errors (especially in `app.js` template literals) before staging.
5. **Cache headers**: Preserve static response revalidation; do not add manual `?v=` tokens.
6. **Tests first**: For any logic change, write or update the relevant unit test.
7. **No secrets**: Never commit `.env` files, API keys, or profile data.
8. **Describe intent**: Write a commit body explaining *why* the change was made when it isn't obvious from the title.

---

## Pull Request Checklist

- [ ] Each commit represents exactly one unit of work
- [ ] All unit, integration, and Playwright E2E tests pass (`npm test`)
- [ ] Dependency audit passes (`npm run audit`)
- [ ] New tests added for new logic
- [ ] Static assets revalidate without manual query tokens
- [ ] `README.md` updated if API or structure changed
- [ ] No `data/` files staged

# Agent Contribution Guidelines

Welcome to the **Raven & Llama** repository. This document defines the conventions all contributors (human and AI) must follow when working in this codebase.

---

## Fast-Track Starting Point for New Agents

If you are an AI agent beginning a new session in this repository:

1. **Do not re-scan the entire codebase**: Complete, pre-indexed documentation is maintained in `docs/`:
   - **System Architecture & Data Contracts**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (single-page structure, ActivityEngine lifecycle, SQLite/D1 storage, PBKDF2 auth, security headers)
   - **Subject Pools & Question Banks**: [`docs/SUBJECTS_AND_ACTIVITIES.md`](docs/SUBJECTS_AND_ACTIVITIES.md) (inventory of all 8 subject hubs, 100+ question target status, procedural generators, and finite-set exceptions)
   - **Multi-Stage Roadmap & Proposals**: [`docs/MULTI_STAGE_ROADMAP_AND_PROPOSALS.md`](docs/MULTI_STAGE_ROADMAP_AND_PROPOSALS.md) (master 6-stage blueprint: Stage 1 Bug Fixes & Content Pools, Stage 2 Parent Dashboard, Stage 3 Recommendations, Stage 4 Tactile Manipulatives replacing quizzes, Stage 5 Discovery Sandboxes, Stage 6 Advanced Research)
2. **Current Priority Queue**:
   - Check open issues with `gh issue list`.
   - **Immediate Next Task**: **Stage 1 (Issue #138)** — Fix 90 broken `??` history icons in `public/js/history/events.js`, expand `public/js/geography/country-data.js` to 100+ countries, expand Plan a Party scenarios/items, and expand Food Chains/Virtual Lab.
   - **Subsequent Task**: **Stage 2 (Issue #128 / LC-701)** — Parent Dashboard and settings controls.
   - **Subsequent Task**: **Stage 3 (Issue #130 / LC-703)** — Personalised learning recommendations.
   - **Subsequent Task**: **Stage 4 & 5** — Interactive Manipulatives and Discovery Sandboxes replacing traditional quizzes.
3. **Execution Workflow**:
   - Always work in an isolated worktree outside synced folders: `git worktree add -b <branch> C:/GitHub/Calum/raven-and-llama-worktrees/<slug> main`.
   - Implement single logical units of work; run focused tests (`npm test` and `npm run audit`).
   - Commit as you go using Conventional Commits. Push to origin at sensible intervals.
   - Open small, focused PRs using `gh pr create`.
   - Clean up worktrees when done (`git worktree remove <path>` and `git worktree prune`).

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
- Feature / fix branches: `feat/<short-slug>`, `fix/<short-slug>`, or `docs/<short-slug>`
- All new functionality must be developed on a feature branch and merged into `main` via a pull request.
- Break logical sets of work into separate, focused PRs. Never bundle unrelated features, fixes, or large multi-part enhancements into a single monolithic pull request.
- All changes arrive via pull request; do not push directly to `main`.
- Pull requests must pass every required CI check before they can be merged.
- GitHub branch protection for `main` must require `Node.js 22`, `Node.js 24`, `Node.js 26`, `Playwright E2E`, and `Dependency audit` status checks.

---

## Testing Requirements

- All new logic (generators, game engine, profile management) must have accompanying unit tests in `tests/unit/`.
- Server, persistence, and API behavior changes must include integration coverage in `tests/integration/`.
- UI/navigation changes must include an automated browser test in `tests/e2e/`.
- All new functionality requires complete unit and automated test coverage for its behavior and relevant user workflows.
- MathMasters should target at least 100 genuinely distinct questions per skill or activity where the mathematical domain permits; add tests for the target and document finite fact sets instead of manufacturing variety through shuffled choices or superficial paraphrases.
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

## Fast-Track Project Knowledge Base

Before performing broad exploratory scans of the codebase, consult the documentation in `docs/`:
- **Architecture & System Contracts**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (single-page structure, ActivityEngine lifecycle, SQLite/D1 storage, PBKDF2 auth, security headers)
- **Subject Pools & Question Banks**: [`docs/SUBJECTS_AND_ACTIVITIES.md`](docs/SUBJECTS_AND_ACTIVITIES.md) (inventory of all 8 subject hubs, 100+ question target status, procedural generators, and finite-set exceptions)
- **Roadmap & Pedagogical Concepts**: [`docs/ROADMAP_AND_OPPORTUNITIES.md`](docs/ROADMAP_AND_OPPORTUNITIES.md) (open issue breakdown, competitive benchmarks against IXL/Prodigy/Khan, interactive manipulatives beyond quizzes, UX guidelines)

---

## AI Agent Guidelines

When working as an AI agent in this repository:

1. **Scope**: Only modify files relevant to the current task. Do not "clean up" unrelated code.
2. **Commit granularity**: Each distinct change (e.g. bug fix, feature, test) = separate commit.
3. **Commit and push as you go**: After a unit passes its focused checks, commit that unit before beginning another; do not accumulate unrelated finished work. Push to the remote branch at sensible intervals so incremental progress is preserved.
4. **Verify before committing**: Check for syntax errors (especially in `app.js` template literals) before staging.
5. **Cache headers**: Preserve static response revalidation; do not add manual `?v=` tokens.
6. **Tests first**: For any logic change, write or update the relevant unit test.
7. **No secrets**: Never commit `.env` files, API keys, or profile data.
8. **Describe intent**: Write a commit body explaining *why* the change was made when it isn't obvious from the title.
9. **Worktree isolation and cleanup**: Make task changes in a dedicated Git worktree rather than the primary checkout (avoid placing worktrees in synced locations such as OneDrive). Use separate worktrees for independent parallel tasks to keep branches and uncommitted changes isolated. **Clean up worktrees as you go**: Once a task or pull request is completed or merged, remove the worktree with `git worktree remove <path>` and prune dead references (`git worktree prune`) to keep the repo clean.
10. **Separate pull requests for logical units**: Keep PRs small and focused on a single logical theme (e.g. one activity, one bug fix, or one subsystem refactor). Avoid monolithic PRs that span multiple unrelated features.
11. **Consult documentation first**: Refer to `docs/` before exploring or implementing to understand existing data contracts, question pool requirements, and module lifecycles.

---

## Pull Request Checklist

- [ ] Each commit represents exactly one unit of work
- [ ] All unit, integration, and Playwright E2E tests pass (`npm test`)
- [ ] Dependency audit passes (`npm run audit`)
- [ ] New tests added for new logic
- [ ] Static assets revalidate without manual query tokens
- [ ] `README.md` updated if API or structure changed
- [ ] No `data/` files staged

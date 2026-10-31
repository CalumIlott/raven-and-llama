# Agent Contribution Guidelines

Welcome to the **Raven & Llama** repository. This document defines the conventions all contributors (human and AI) must follow when working in this codebase.

---

## Core Rule: One Commit Per Unit of Work

> **Each logical unit of work must be a separate, focused commit.**

A "unit of work" is one cohesive change: a bug fix, a new feature, a refactor, a test addition, or a configuration update. Never bundle unrelated changes into a single commit.

**Good commit examples:**
```
fix: prevent duplicate questions within a single quiz session
feat: add hippo and owl avatar options to profile manager
chore: bump cache version string to invalidate stale CDN assets
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
- All changes arrive via pull request; do not push directly to `main`

---

## Testing Requirements

- All new logic (generators, game engine, profile management) must have accompanying unit tests in `tests/unit/`.
- Server, persistence, and API behavior changes must include integration coverage in `tests/integration/`.
- UI/navigation changes must include an automated browser test in `tests/e2e/`.
- Tests must pass in CI before merging; run `npm test` locally before pushing.

---

## File & Code Conventions

- **No build step** — vanilla JS only; no transpilers, no bundlers
- Tailwind utility classes must be complete strings (no dynamic concatenation) so CDN scanning works
- Profile API shape: `{ profiles: Array<Profile> }` — never change this without updating `server.js`, `profiles.js`, and the API docs in `README.md`
- Cache version string in `index.html` (`?v=YYYYMMDD[letter]`) must be bumped whenever a JS or CSS file changes
- The `data/` folder is gitignored — never commit user profile data

---

## AI Agent Guidelines

When working as an AI agent in this repository:

1. **Scope**: Only modify files relevant to the current task. Do not "clean up" unrelated code.
2. **Commit granularity**: Each distinct change (e.g. bug fix, feature, test) = separate commit.
3. **Verify before committing**: Check for syntax errors (especially in `app.js` template literals) before staging.
4. **Cache version**: Bump `?v=` in `index.html` whenever any JS/CSS file is modified.
5. **Tests first**: For any logic change, write or update the relevant unit test.
6. **No secrets**: Never commit `.env` files, API keys, or profile data.
7. **Describe intent**: Write a commit body explaining *why* the change was made when it isn't obvious from the title.

8. **Separate units of work**: Each logical unit of work must be committed separately. Do not combine unrelated fixes, features, tests, or maintenance into one commit.

---

## Pull Request Checklist

- [ ] Each commit represents exactly one unit of work
- [ ] All existing tests pass (`npm test`)
- [ ] New tests added for new logic
- [ ] Cache version bumped if JS/CSS changed
- [ ] `README.md` updated if API or structure changed
- [ ] No `data/` files staged

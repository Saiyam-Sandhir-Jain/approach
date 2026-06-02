# Contributing to Approach CRM

Thank you for your interest in contributing! This document covers how to get
set up locally, our coding conventions, and the pull-request process.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Coding Conventions](#coding-conventions)
5. [Submitting a Pull Request](#submitting-a-pull-request)
6. [Reporting Bugs](#reporting-bugs)
7. [Requesting Features](#requesting-features)

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| Python | ≥ 3.11 |
| npm | ≥ 9 |
| Git | any recent |

### Local Setup

```bash
# 1. Fork & clone
git clone https://github.com/Saiyam-Sandhir-Jain/approach.git
cd approach

# 2. Frontend
npm install
cp .env.local.example .env.local   # fill in your values

# 3. Backend
cd backend
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # fill in your values (or set DATABASE_URL)
```

### Running Locally

```bash
# Terminal 1 — backend (from /backend)
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend (from root)
npm run dev
```

Open http://localhost:3000.

---

## Project Structure

```
approach/
├── app/              # Next.js App Router pages & API routes
├── backend/          # FastAPI + Strawberry GraphQL
│   ├── main.py
│   ├── schema.py
│   ├── models.py
│   └── database.py
├── components/       # Shared React components
├── lib/              # GraphQL client helpers
├── types/            # TypeScript type definitions
└── .github/          # CI workflows & templates
```

---

## Development Workflow

1. Create a branch off `main`:
   ```bash
   git checkout -b feat/my-feature
   # or: fix/some-bug
   ```
2. Make your changes; keep commits small and focused.
3. Test locally (both frontend and backend).
4. Push and open a PR against `main`.

### Branch naming

| Prefix | Purpose |
|--------|---------|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `docs/` | Documentation only |
| `refactor/` | Code restructure, no behaviour change |
| `chore/` | Tooling, deps, CI |

---

## Coding Conventions

### TypeScript / React
- Functional components with hooks only.
- Props typed with `interface` (not `type` aliases for object shapes).
- Imports ordered: external → internal → relative.
- Run `npm run lint` before committing.

### Python
- Follow PEP 8. Line length ≤ 100.
- Type-annotate all function signatures.
- Keep business logic in `schema.py`; keep `main.py` thin.
- Run `ruff check backend/` if you have ruff installed.

### Commits
We loosely follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add CSV export for applications
fix: prevent duplicate contacts on re-render
docs: update deployment guide
```

---

## Submitting a Pull Request

1. Fill in the PR template (auto-populated when you open a PR).
2. Link any related issues with `Closes #<issue-number>`.
3. Make sure CI passes.
4. Request a review — maintainers aim to respond within 48 hours.

---

## Reporting Bugs

Open a [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) issue and fill in:
- Steps to reproduce
- Expected vs. actual behaviour
- Browser / OS / Node version

---

## Requesting Features

Open a [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) issue.
Describe the problem you're solving, not just the solution.

---

## Code of Conduct

Be respectful and constructive. We follow the
[Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

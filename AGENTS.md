# AGENTS.md

Context, workflow guidelines, architectural standards, and available agent skills for **ndmfb-tool**.

---

## Project Overview & Architecture

This repository is a TypeScript monorepo managed with **Bun** and **Turborepo**.

```
ndmfb-tool/
├── apps/
│   ├── web/           # Frontend (Vite + TanStack Router/Start + Tailwind CSS v4 + @workspace/ui)
│   │   └── src/
│   │       ├── api/       # API clients & query definitions
│   │       ├── logic/     # Business logic, state machines & domain rules
│   │       ├── lib/       # Library configs, SDK wrappers & providers
│   │       ├── utils/     # Pure utility functions & formatters
│   │       ├── routes/    # File-based TanStack routes
│   │       └── features/  # Modular feature components & slices
│   └── api/           # Backend (Hono.js + Bun runtime + Zod validation + RFC error handling)
├── packages/
│   └── ui/            # Shared UI component library (Base UI + Tailwind v4 + Lucide/Hugeicons)
├── package.json       # Monorepo root scripts and workspaces
├── turbo.json         # Turbo pipeline configuration (build, dev, lint, typecheck, format)
└── tsconfig.json      # Base TypeScript configuration
```

### Key Commands

```bash
bun run dev          # Start all applications in dev mode (web: 3000, api: 4000)
bun run build        # Build all apps and packages via Turbo
bun run lint         # Run ESLint across all workspaces
bun run typecheck    # Run TypeScript checks across all workspaces
bun run format       # Format codebase with Prettier
```

---

## 🚨 Strict Code Size & Modularity Enforcement

All agents working on this codebase **MUST STRICTLY ENFORCE** the following architecture and file-size constraints:

### 1. File Length Limit: 200 – 300 Lines Max
- **Hard Rule**: No code file (component, hook, service, route, or utility) should exceed **200 to 300 lines**.
- **Refactoring Strategy**: When a file approaches 200 lines, immediately decompose it:
  - Extract sub-components into dedicated files.
  - Move stateful operations and side-effects into custom hooks.
  - Move calculation and transformation logic into `src/logic/` or `src/utils/`.
  - Extract Zod schemas and TypeScript interfaces into dedicated `types.ts` or `schema.ts`.

### 2. Frontend Shared Logic Architecture (`apps/web/src/`)
Shared logic must never be dumped into giant component files or route files. Maintain strict separation across:

- **`src/logic/`**: Domain-specific business logic, complex state calculations, financial/metric formulas, validation flows, and decision-making logic.
- **`src/lib/`**: External library configurations, API client setups (`apiClient`), third-party SDK wrappers, and provider wrappers.
- **`src/utils/`**: Generic, pure utility functions (date formatting, currency formatting, string manipulation, array operations) with zero business side-effects.

---

# Engineering Workflow Skills

A set of [Agent Skills](https://agentskills.io) that take a change from a vague idea to shipped, verified, documented code, for any AI coding agent. One skill per phase. Run only the ones a change needs, in any order.

The state lives in files (a scope, specs, AGENTS.md, tests), not in a chat session. So work survives across sessions, picks up where it left off, and works for a whole team.

```
idea → /scope → /audit → /architect → /develop → /check verify → /test → /check review → /document → /sync
```

Run `/debug` anytime something breaks. Run a bare `/scope` anytime to see where things stand.

> 📖 **Want the full picture?** Read the **[Workflow Guide](docs/workflow-guide.md)** — a plain-language walkthrough of every skill, the files that carry the work, who owns what, and one idea followed all the way from scope to shipped.

## The Skills

| Skill | What it does |
|---|---|
| `scope` | Turns a product idea into a living, coarse scope and keeps it current as you ship. |
| `audit` | Writes the AGENTS.md context files every other skill reads. |
| `architect` | Makes a load bearing decision and writes it as a build spec in `docs/specs/`. |
| `develop` | Builds a feature, UI or backend, from its spec. Gates to `/architect` if a decision is owed. |
| `check` | Confirms a change before merge. `/check verify` runs the real app; `/check review` reads the code on a second model. |
| `test` | Writes a test suite for the code you just changed. |
| `document` | Writes the PR text, changelog, release note, or postmortem from the real diff. |
| `sync` | Keeps AGENTS.md, the scope, and spec statuses current after a change. |
| `debug` | Finds and fixes the root cause of a bug, then hands a regression test to `/test`. |

## Where to Start

- **New product (greenfield):** `/scope` the idea, then `/architect` the stack, then scaffold the project, then `/audit` to seed AGENTS.md from the real project, then the feature loop.
- **Existing codebase (brownfield):** `/audit` first so every skill understands your project, then `/scope` the next slice on top of what exists, then the feature loop.
- **Any single change:** run only what it needs. A bug goes straight to `/debug`. A small change can be `/develop` then `/check verify`.
- **Monorepo:** everything scopes to the target workspace (`apps/web`, `apps/api`, `packages/ui`), which has its own stack and commands.

### The Feature Loop

```
/architect → /develop → /check verify → /test → /check review → /document → /sync
```

Workflow Depths:
- **Prototype**: just `/develop`, self-checked, for throwaway work.
- **Alpha**: adds `/check verify`.
- **Beta**: adds `/test`.
- **GA**: adds fresh-model `/check review` and `/document`.

## What Gets Written, and Where

| Artifact | Path | Owner |
|---|---|---|
| Scope | `docs/scope/` | `scope` |
| Specs | `docs/specs/` | `architect` |
| Context files | `AGENTS.md` (plus a thin `CLAUDE.md` pointer) | `audit`, kept current by `sync` |
| Design system | `design.md` (art direction; token values live in CSS) | `develop` |
| Review findings | `docs/reviews/` | `check` |
| Tests | workspace test dirs | `test` |
| App code | workspace source trees (`apps/`, `packages/`) | `develop` |
| Human docs | PR body, `CHANGELOG.md`, `docs/releases/`, `docs/postmortems/` | `document` |

---

## Complete Skills Catalog on this Machine

In addition to the core **Engineering Workflow Skills** above, this environment is equipped with specialized design and agent development skills:

### 1. UI & Visual Design Skills
- **`design-taste-frontend`**: Expert frontend aesthetic guidelines and clean composition rules.
- **`high-end-visual-design`**: Premium typography, spatial balancing, contrast ratios, and luxury UI polish.
- **`minimalist-ui`**: Restraint-focused UI design, eliminating visual noise and focusing on functional clarity.
- **`stitch-design-taste`**: Clean component assembly and visual hierarchy.
- **`gpt-taste`**: Refined stylistic patterns and aesthetic sensibility for generated interfaces.
- **`imagegen-frontend-web`**: Web-oriented design and asset generation.
- **`imagegen-frontend-mobile`**: Mobile-oriented asset generation.
- **`find-skills`**: Skill discovery and registry locator.

### 2. Antigravity & Google Agent Skills
- **`agy-customizations`**: Guide and reference for Antigravity rules, plugins, hooks, MCP servers, and skills.
- **`antigravity-guide`**: Comprehensive reference and sitemap for Google Antigravity CLI and Antigravity IDE.
- **`google-antigravity-sdk`**: Autonomous multi-agent design, implementation, and orchestration.

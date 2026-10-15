# NDMFB Tool

## Stack

- TypeScript and Bun for workspace tooling
- React, Vite, and TanStack Start for the web app
- Go 1.25 with pgx for the API
- PostgreSQL managed by the Go API with pgx migrations
- Bun workspaces

## Build approach

Tracer Bullet, keep a thin working path through the web app, API, and checks before adding deeper domain behavior.

## Commands

```bash
bun install
bun run dev
bun run api:dev
bun run web:build
bun run check
```

## Repository rules

- Web code lives in `apps/web`.
- Go API code lives in `apps/api`.
- Keep shared contracts versioned and explicit before wiring new web features to the API.
- Do not commit environment files or generated build output.
- Git hooks are tracked in `.githooks` and enabled with `bun run prepare`.

## Context files

- [apps/web/AGENTS.md](apps/web/AGENTS.md): web application conventions and commands.
- [apps/api/AGENTS.md](apps/api/AGENTS.md): Go API conventions and commands.

## Specs

Architecture notes are stored in `docs/specs/`.

<!-- Drafted by audit skill. -->

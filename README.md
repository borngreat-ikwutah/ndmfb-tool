# NDMFB Tool

This repository is a Bun and Go monorepo.

## Workspaces

- `apps/web` contains the existing React and TanStack Start application.
- `apps/api` contains the Go HTTP API.

The Go API is the only workspace allowed to connect to PostgreSQL or run migrations. It uses MVC structure under `apps/api/internal`.

## Getting started

```bash
bun install
bun run prepare
bun run dev       # web app on http://localhost:3000
bun run api:dev   # API on http://localhost:8080
```

Run `bun run check` before opening a pull request. The hooks run the same checks automatically for commits and production web builds before pushes.

# Web application

## Stack

React 19, Vite, TanStack Start and Router, Tailwind CSS, and Bun. All persistence is owned by the Go API.

## Commands

```bash
cd apps/web && bun run dev
cd apps/web && bun run check
cd apps/web && bun run build
cd apps/api && go run ./cmd/api
```

## Conventions

- Route files live in `src/app` and generated route output is `src/routeTree.gen.ts`.
- Reusable UI lives in `src/components`.
- Server calls use the Go API. The web workspace must not add database drivers, ORMs, migrations, or direct database connections.
- Use the `~/*` TypeScript path alias for `src` imports.

<!-- Drafted by audit skill. -->

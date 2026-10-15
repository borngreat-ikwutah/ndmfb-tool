# Monorepo foundation

**Status:** Accepted

## Proposed stack

The repository uses Bun workspaces with a React and Vite web application in `apps/web`, and a Go HTTP API in `apps/api`. The API follows MVC boundaries and is the only application that connects to PostgreSQL. Git hooks are tracked in `.githooks` and enabled with `core.hooksPath`.

## Requirements

- Preserve the existing web application while removing its direct database access.
- Manage PostgreSQL connections and migrations only from the Go API.
- Implement only the required Better Auth compatible endpoints first: Google OAuth, session lookup, sign out, and user profile updates.
- Provide a runnable Go API with health and version endpoints.
- Run web type checks and Go tests before commits.
- Run production web builds and Go tests before pushes.

## Build plan

Tracer Bullet: establish the workspace, API process, and repository checks first, then migrate domain behavior from the web server incrementally.

## Consequences

The web workspace is HTTP only. Authentication and persistence endpoints must be implemented in the Go API before the web client depends on them.

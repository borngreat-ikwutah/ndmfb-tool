# Go API

## Stack

Go 1.25 with pgx and the standard library. The application entry point is `cmd/api`.

## Commands

```bash
go run ./apps/api/cmd/api
go test ./apps/api/...
```

## Conventions

- Keep HTTP handlers small and explicit.
- Return JSON from API endpoints.
- Follow MVC boundaries: models define transport data, controllers handle requests, routes compose endpoints, and database code owns persistence.
- Add endpoint tests beside the handler package.
- Keep persistence behind the API boundary; the web app never connects to PostgreSQL.
- Database connections and SQL migrations belong only in `internal/database`.
- The initial auth surface is intentionally limited to Google OAuth, session lookup, sign out, and profile updates.

<!-- Drafted by audit skill. -->

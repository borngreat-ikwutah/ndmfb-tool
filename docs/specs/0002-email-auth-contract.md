# 0002 · email authentication and shared contract

**Status**: Assumed
**Date**: 2026-10-17
**Authorized by**: engineer, during /develop

## Owed decision

Choose and ratify the long term source and generation strategy for contracts shared by the Go API and TypeScript web app.

## Assumption built on

This build uses JSON Schema as the language neutral contract under `packages/contract`, with TypeScript types and runtime schemas for the web app. The Go API keeps transport structs aligned with the same field names and response shapes. Email passwords use bcrypt hashes, sessions use the existing database session table, and successful email authentication returns the existing session cookie.

## Code area

`packages/contract`, `apps/api/internal/auth`, `apps/api/internal/database`, `apps/api/internal/models`, `apps/api/internal/routes`, `apps/web/src/lib/auth-client.ts`, and API configuration.

## Requirements

- Add email sign up and sign in endpoints.
- Create and authenticate password based users without exposing password hashes.
- Share request and response shapes between the web app and API.
- Preserve the existing Google authentication flow.

## Ratify

This decision was recorded by /develop, not deliberated. Run `/architect email authentication and shared contract` to deliberate and ratify it. Until then it stays flagged as an owed decision; it does not block implementation.

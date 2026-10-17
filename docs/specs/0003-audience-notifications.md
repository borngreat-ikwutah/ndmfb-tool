# 0003 · audience notifications

**Status**: Assumed
**Date**: 2026-10-17
**Authorized by**: engineer, during /develop

## Owed decision

Ratify the first production email workflow, including recipient permissions, import replacement rules, and the SMTP delivery model.

## Assumption built on

The first vertical slice treats staff and users as contact audience types. Contacts are stored in one master directory, can belong to named lists, and can be imported from CSV. Notification drafts target one audience type or a saved list. The Go API owns PostgreSQL persistence and the web app uses the shared TypeScript contract. SMTP delivery, approvals, and delivery reporting remain follow up slices.

## Code area

`packages/contract`, `apps/api/internal/contacts`, `apps/api/internal/notifications`, `apps/api/internal/database`, `apps/api/internal/routes`, and `apps/web/src/features/notifications`.

## Requirements

- Import staff and user contacts from CSV.
- Validate email addresses and report row errors.
- Keep one contact directory with `staff` and `user` audience types.
- Create and view named recipient lists.
- Create notification drafts targeted at staff, users, or a saved list.
- Preserve imported data and drafts in PostgreSQL.

## Ratify

This decision was recorded by /develop, not deliberated. Run `/architect audience notifications` to deliberate and ratify it. Until then it stays flagged as an owed decision; it does not block implementation.

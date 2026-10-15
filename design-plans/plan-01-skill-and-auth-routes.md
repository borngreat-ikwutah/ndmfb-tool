# Plan 01 — Install improve-ui skill + shared auth route structure

Base commit: `ed8437d` (working tree had uncommitted auth edits at audit time; re-verify with `git status --short` before executing).
No existing `design-plans/` plans to reconcile (directory did not exist at audit time).
Plan-template reference `references/plan-template.md` cited by the skill was not present in the repo; this plan is self-contained instead.

## Goal

Persist the pasted `improve-ui` skill as a versioned `SKILL.md` in the repo, and give auth a shared file-route structure so `sign-in` and `sign-up` folder routes reuse one layout instead of duplicating the current one-off `/login` page.

## Why (governing sources, re-opened 2026-10-15)

- `AGENTS.md` (root): web code lives in `apps/web`; route files live in `src/app`; generated output is `src/routeTree.gen.ts`; use `~/*` alias.
- `apps/web/AGENTS.md`: routes in `src/app`, reusable UI in `src/components`, server calls use Go API only, `~/*` alias.
- `apps/web/src/app/login.tsx`: `createFileRoute("/login")` with `beforeLoad` redirect to `/` + `createPageMeta({title:"Sign In"})`, `component: AuthPage`.
- `apps/web/src/app/index.tsx`: `beforeLoad` redirects to `/login` when no user.
- `apps/web/src/routeTree.gen.ts`: generated; only `/` and `/login` exist — do not hand-edit.
- `design.md` (Cenpact, binding via `PRD.md §Design Standard`): semantic tokens only, no hardcoded hex; `rounded-xl` cards, `rounded-full` pills.
- `docs/specs/0001-monorepo-foundation.md` (Accepted): web is HTTP-only; auth endpoints live in Go API.

## Scope

In scope:

1. Create `skills/improve-ui/SKILL.md` with the exact skill content in the Appendix.
2. Create shared auth composition: `apps/web/src/features/auth/auth-layout.tsx` + `apps/web/src/features/auth/auth-page.tsx` (mode prop `"sign-in" | "sign-up"`).
3. Create `apps/web/src/app/sign-in.tsx` (`/sign-in`) and `apps/web/src/app/sign-up.tsx` (`/sign-up`) using the shared composition.
4. Keep `apps/web/src/app/login.tsx` as a legacy redirect to `/sign-in` (preserves `index.tsx` redirect path until callers migrate).

Out of scope: visual redesign details (see Plan 02), Go API changes, `routeTree.gen.ts` hand-edits, deleting `/login` outright.

## Exact reusable owners (do not invent new ones)

- `apps/web/src/app/__root.tsx` `RootDocument` — body shell (`bg-background text-foreground font-sans`).
- `apps/web/src/components/ui/button.tsx` `buttonVariants` — use existing `variant`/`size`, no arbitrary `h-[52px]`.
- `apps/web/src/components/ui/card.tsx` `Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter` (`rounded-xl border py-6 shadow-sm`).
- `apps/web/src/components/ui/badge.tsx` `Badge`, `apps/web/src/components/ui/separator.tsx` `Separator` for pills/dividers.
- `apps/web/src/styles.css` theme tokens (`--background`, `--foreground`, `--card`, `--border`, `--muted`, `--primary`, `--radius: 0.5rem`, `font-sans` Onest Variable).
- `apps/web/src/seo.ts` `createPageMeta`.
- `apps/web/src/lib/auth-client.ts` `authClient.signIn.social({provider, callbackURL})`.
- `apps/web/src/server/user.ts` `getCurrentUser()`.

## Steps for executor

1. `git status --short` to confirm clean starting point; note base `ed8437d`.
2. Write `skills/improve-ui/SKILL.md` with Appendix content verbatim (including frontmatter `name: improve-ui`, `description:` line).
3. Create `apps/web/src/features/auth/auth-layout.tsx`: centered narrow column (`mx-auto w-full max-w-[360px]`), `bg-background`, no gradients/blobs, single `motion.div` fade-up ≤200ms (Cenpact §1.2). Accept `children`.
4. Create `apps/web/src/features/auth/auth-page.tsx`: `export function AuthPage({ mode }: { mode: "sign-in" | "sign-up" })`; imports `Button`, `authClient`, `toast`, `auth-layout`; one Google button only; `callbackURL: "/"`; copy is delegated to Plan 02 strings — do not invent stats/tickers/avatars.
5. Create `apps/web/src/app/sign-in.tsx` and `apps/web/src/app/sign-up.tsx`:
   ```tsx
   import { createFileRoute, redirect } from "@tanstack/react-router";
   import { AuthPage } from "~/features/auth/auth-page";
   import { createPageMeta } from "~/seo";
   import { getCurrentUser } from "~/server/user";
   export const Route = createFileRoute("/sign-in")({
     beforeLoad: async () => { const user = await getCurrentUser(); if (user) throw redirect({ to: "/" }); },
     head: () => createPageMeta({ title: "Sign In", description: "Sign in to NDMFB Tool" }),
     component: () => <AuthPage mode="sign-in" />,
   });
   ```
   Mirror for `/sign-up` with title `"Sign Up"`, description `"Create your NDMFB Tool account"`, `mode="sign-up"`.
6. Rewrite `apps/web/src/app/login.tsx` as legacy redirect only:
   ```tsx
   import { createFileRoute, redirect } from "@tanstack/react-router";
   export const Route = createFileRoute("/login")({ beforeLoad: () => { throw redirect({ to: "/sign-in" }); } });
   ```
7. Leave `apps/web/src/app/index.tsx` redirect (`to: "/login"` → still resolves via legacy redirect; optionally update to `/sign-in` in same change).
8. Run `cd apps/web && bun run check` (must pass) and `bun run build` (must pass; `routeTree.gen.ts` regenerates automatically — verify `/sign-in` and `/sign-up` appear, do not hand-edit it).

## Acceptance criteria

- `skills/improve-ui/SKILL.md` exists with exact Appendix content.
- `/sign-in` and `/sign-up` render via shared `AuthLayout` + `AuthPage`; `/login` redirects to `/sign-in`; logged-in users hitting any auth route land on `/`.
- No hardcoded hex, no `rounded-3xl`/`h-[52px]`, no infinite blob/ping/shine animations; `tsc --noEmit` and `vite build` pass.
- No product files outside the listed auth/skill paths are touched.

## Appendix — exact SKILL.md content to write

```markdown
---
name: improve-ui
description: Audit an existing product surface against its own design evidence, identify verified UI problems, and write self-contained implementation plans for another agent. Strictly read-only on product source. Use when asked to review, refine, improve, or clean up an interface without replacing its identity; investigate design-system drift; or prepare a design handoff.
---

# Improve UI

Audit one coherent product surface against the system that actually governs it. Preserve the product's identity, reuse existing owners, and prefer no finding to an unsupported one. Write plans only for changes the user selects; another agent executes them.

## Boundaries

- Never modify product source. Create or edit files only under `design-plans/`.
- Do not install dependencies, run formatters, commit, push, or otherwise mutate the working tree.
- Do not update design documentation. Record accepted documentation changes in the plan for its executor.
- Use rendered evidence only when the user provides it or explicitly requests visual inspection.
- Make every plan self-contained; its executor has no context from the audit or conversation.

## 1. Select the surface

Honor the user's scope. If the request is broad, select one deployable application and one coherent surface family representing a primary product task. State the selection; do not synthesize the whole repository into one product.

Start from the surface's routes and layouts. Trace the rendered path through compositions, shared components, variants, resolved tokens, and styles. Do not begin with a repository-wide search for inconsistencies.

A connection exists only when it is proven through rendering, imports, props, resolved configuration, CSS inheritance, or a generated artifact loaded by the surface. Shared names, similar tokens, repository proximity, and conceptual relationships do not establish a connection. Exclude other applications, previews, configurators, generated registries, legacy systems, and enterprise variants unless they participate in the traced path.

## 2. Reconstruct the local system

Check for `DESIGN.md`, repository guidance, and surface-local design documentation. Use a source only after proving it is current and governs the selected surface; drafts, proposals, migrations, and task lists describe future intent unless explicitly accepted and current. Absence of design documentation is not a finding.

Inspect only the tokens, variables, themes, primitives, variants, and compositions relevant to the traced path. Resolve aliases and variants to their definitions. Classify an implementation as local or legacy only when the repository says so.

Record:

```markdown
## Design language
- Audited surface:
- Design sources:
- Documented decisions:
- Governing owners and consumers:
- Explicit exceptions:
```

Write `None documented` under `Explicit exceptions` unless a cited source explicitly identifies the exception.

## 3. Prove findings

Before applying the proof gate, inspect every traced surface's user-facing labels, active-state presentation, responsive branches, and sibling variants for internal contradictions. Treat the results only as candidates.

A finding is in scope only when its correction primarily changes visual presentation, interface copy, layout, component styling, or conformance to a documented design rule. If the correction primarily changes whether product behavior works, reject it.

Search results, repetition, and implementation differences produce candidates, not findings. Keep a candidate only when all three proofs exist:

1. **Contract** — Cite a binding design decision for this property and scope, or a direct contradiction in user-facing presentation or content within the same task. “Prefer,” “generally,” names, omissions, repetition, and absence of an exception do not establish a contract.
2. **Runtime** — Prove that the cited owner, value, or behavior reaches the affected surface through the traced runtime path. Do not compare separate ownership layers or lifecycle states.
3. **Correction** — State one change required by the evidence. If it depends on an existing token, variant, primitive, or exemplar, name it exactly. If the evidence cannot determine the correct choice, the intended condition is ambiguous, the proposal contains alternatives, or the correction requires inventing product intent, reject the candidate.

Source can prove token, typography, color, spacing, layout, copy, component-variant, responsive-presentation, and explicit design-contract violations. It cannot turn functional behavior, state management, or interaction correctness into design findings. Hierarchy, prominence, density, clarity, discoverability, usability, and perceived coherence require rendered or user evidence.

Discard accessibility and HTML/ARIA semantic findings unless the user explicitly requests them. Discard broken routes, redirects, data wiring, action failures, metadata, package API, performance, architecture, and code-quality findings unless the user requested them or a product-specific design contract governs them.

Assign confidence only after all proofs pass. Reuse an existing owner when the evidence supports it; do not create a shared primitive from repetition alone.

## 4. Vet findings

Before reporting, re-open every cited source and try to falsify each candidate. Delete it when:

- The problem does not exactly match the cited implementation.
- The rule does not govern that property and surface.
- Counterevidence shows the difference is valid or deliberate.
- The evidence supports multiple corrections.
- The correction invents product intent.
- Another finding describes the same root problem.

Only findings that survive this pass may enter the table.

## 5. Report

Order surviving findings by confidence, user impact, reach, and correction cost. Stop at three.

Use this structure:

```markdown
## Design language
- Audited surface:
- Design sources:
- Documented decisions:
- Governing owners and consumers:
- Explicit exceptions:

## Findings
| # | Problem | Evidence | Proposed change | Scope | Confidence |
| --- | --- | --- | --- | --- | --- |

## Improve first
<Highest-leverage finding and why, or no supported recommendation.>
```

Evidence must establish the contract, runtime relationship, and deterministic interface consequence. Proposed change must contain one correction. Delete unsupported or overlapping rows before returning.

Delete any finding that does not include every required column, including Confidence.

Under `Improve first`, select one surviving finding with the strongest evidence and highest leverage. Never combine findings.

If no candidate survives, write `No supported findings were found.` under `## Findings` and `No supported recommendation.` under `## Improve first`.

If findings survive, stop and ask which to turn into plans. If the user already selected a finding or explicitly requested a plan for a described improvement, continue with that scope. If asked to fix or improve directly, offer a plan; never implement it.

## 6. Specify selected changes

Read [references/plan-template.md](references/plan-template.md). Write one plan per selected change, never one per symptom.

Before writing, re-open every cited source, record the current commit when available, identify exact reusable primitives and exemplars, and trace affected surfaces. Reconcile an existing plan instead of duplicating it.

Do not invent values when the repository provides a token or component contract. Introduce a primitive only after proving why the existing system cannot express the decision and which consumers should share it.

If asked to reconcile, recheck existing plans against current source and documented decisions; update stale evidence, affected surfaces, and status.
```

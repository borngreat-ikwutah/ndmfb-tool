# Plan 02 — Vercel-style minimal auth UI conforming to Cenpact

Base commit: `ed8437d` (working tree had uncommitted auth edits at audit time; re-verify with `git status --short` before executing).
Depends on Plan 01 (`plan-01-skill-and-auth-routes.md`) for `AuthLayout` + `AuthPage({mode})` + `/sign-in` + `/sign-up` routes. If Plan 01 is not yet applied, apply it first; do not duplicate its files.
Plan-template `references/plan-template.md` was absent; this plan is self-contained.

## Goal

Replace the current AI-slop auth composition (aurora blobs, `bg-[#080c2b]`, neon gradients, fake stats/ticker/avatars, infinite animations) with a Vercel-style minimal centered sign-in/sign-up that strictly conforms to the binding Cenpact system in `design.md`.

## Why (binding contracts, re-opened 2026-10-15)

- `design.md` Cenpact §1.2: quiet chrome, hair-thin borders, no loud gradients, no decorative animations longer than 150–200ms.
- `design.md` §1.4 + §2: semantic tokens only (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-card`, `bg-muted`); never hardcode hex. Current `login.tsx` uses `bg-[#080c2b]`, `ring-[#0a1038]`, `from-cyan-300/via-sky-400/to-fuchsia-400`, `bg-blue-600/40`, `bg-fuchsia-500/30` — direct violation reaching the surface via the left panel and ticker card.
- `design.md` §3: H1 `text-2xl md:text-3xl font-bold tracking-tight text-foreground`; Body Muted `text-xs md:text-sm text-muted-foreground`. Current H1 `text-4xl xl:text-[3.4rem]` + `text-[15px]/text-[13px]` arbitrary sizes violate it.
- `design.md` §4.1–4.3: primary CTA `h-9 px-4 text-sm rounded-full bg-primary`; cards `rounded-xl border border-border/40 bg-card p-5`. Current CTA `h-[52px] text-[15px]` + card `rounded-3xl shadow-[0_20px_60px...]` violate it.
- `PRD.md` §§1–5: internal staff tool; login → compose → preview → send; single/shared Better Auth login acceptable for v1. No marketing stats, no BTC ticker, no "2,400+ traders" in scope. Current copy invents product intent.
- `apps/web/src/app/login.tsx` route contract: `createPageMeta({title:"Sign In", description:"Sign in to NDMFB Tool"})`. Current H2 "Welcome back / pick up where you left off" contradicts it within the same task.
- `apps/web/src/lib/auth-client.ts`: only `signIn.social({provider:"google"})` + `signOut`. Claims "E2E encrypted / SOC2-ready / 99.9% uptime / Session stays on this device" have no traced owner — remove.

## Scope

In scope: `apps/web/src/features/auth/auth-layout.tsx`, `apps/web/src/features/auth/auth-page.tsx` (shared by `/sign-in` + `/sign-up`), plus route `head` copy in `apps/web/src/app/sign-in.tsx` + `sign-up.tsx`.

Out of scope: Go API, session logic, deleting `/login` (Plan 01 keeps it as redirect), dark/light tuning beyond semantic tokens.

## Exact owners to reuse (no new primitives)

- `Button` from `apps/web/src/components/ui/button.tsx` — `variant: "outline"` for Google CTA per Vercel style? No: Cenpact §4.1 primary CTA is `bg-primary`; Vercel-style Google button here = `variant="outline" className="h-10 w-full rounded-full text-sm"` with white Google mark in `size-5` circle. Pick exactly one: `variant="outline"`, `size="lg"` (maps to `h-10 rounded-md px-6`) + override `rounded-full` per Cenpact pill pattern.
- `Card, CardHeader, CardTitle, CardDescription, CardContent` from `apps/web/src/components/ui/card.tsx` — or plain `rounded-xl border border-border/40 bg-card p-5 md:p-6` div per Cenpact §4.3. Use the Card subcomponents (Title/Description for heading).
- `Separator` from `apps/web/src/components/ui/separator.tsx` for the divider.
- Tokens from `apps/web/src/styles.css`: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, `bg-muted`.
- `createPageMeta` from `apps/web/src/seo.ts`; `authClient.signIn.social` + `toast` error path unchanged.

## Vercel-style copy spec (exact strings, no alternatives)

- Layout: centered `min-h-svh bg-background`, content `mx-auto w-full max-w-[360px] px-6`, single column, no side panel, no grid/dot overlays, no blobs.
- Top: product mark — reuse existing `BarChart3` in `size-8 rounded-lg bg-primary text-primary-foreground` grid + wordmark `NDMFB Tool` (`text-sm font-semibold tracking-tight`). No "Live" pill, no avatars.
- Sign-in (`mode="sign-in"`):
  - Title: `Sign in to NDMFB Tool` (`text-2xl font-bold tracking-tight text-foreground`, centered).
  - Sub: `Continue with your staff Google account.` (`text-sm text-muted-foreground`, centered).
  - Button: `Continue with Google` with Google "G" SVG left; loading state `Connecting to Google…` with `Loader2 animate-spin`.
  - Divider: `Separator` + caption `or` — omit if only one provider (prefer omit; Vercel shows single SSO list without divider).
  - Footer: `By continuing, you agree to the Terms of Service and acknowledge the Privacy Policy.` (`text-xs text-muted-foreground`, centered, plain text — no fake badges).
- Sign-up (`mode="sign-up"`): same layout; Title `Create your account`; Sub `Sign up with your staff Google account to get started.`; Button `Sign up with Google`; footer identical.
- Cross-links: under card, `New to NDMFB? Create an account` on sign-in → `/sign-up`; `Already have an account? Sign in` on sign-up → `/sign-in` (`text-sm`, `text-muted-foreground` + link `text-foreground underline-offset-4 hover:underline`).
- Delete entirely: "See the market move…", "Secure prediction-market analytics", 3 feature cards, "Trusted by market pros / 2,400+ traders", BTC ticker + bar spans, "SOC2-ready / 99.9% uptime / E2E encrypted", "No password…/Session stays…/Cancel anytime…" checklist, shine sweep, progress shimmer.
- Motion: one entrance `initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{duration:0.18}}` on the card only. No `repeat: Infinity`, no `animate-ping`, no staggered loops. Respects Cenpact 150–200ms rule.

## Steps for executor

1. Confirm Plan 01 files exist (`auth-layout.tsx`, `auth-page.tsx`, `sign-in.tsx`, `sign-up.tsx`); confirm `git status --short` baseline.
2. Rewrite `auth-layout.tsx` to the centered `max-w-[360px]` shell above using only semantic tokens.
3. Rewrite `auth-page.tsx` to the copy spec above, branching only title/sub/button-label/cross-link on `mode`. Keep `handleGoogleSignIn` logic byte-identical (`provider:"google"`, `callbackURL:"/"`, `toast.error("Failed to sign in with Google")`).
4. Set route heads: sign-in → `createPageMeta({title:"Sign In", description:"Sign in to NDMFB Tool"})`; sign-up → `createPageMeta({title:"Sign Up", description:"Create your NDMFB Tool account"})`.
5. Delete `apps/web/src/features/auth/login.tsx` legacy component only after sign-in/sign-up render (keep `apps/web/src/app/login.tsx` redirect from Plan 01).
6. Run `cd apps/web && bun run check` (must pass) and `bun run build` (must pass); visually verify at `375px` and `1280px`: single centered column both widths, no horizontal scroll, no gradients, button full-width pill.

## Acceptance criteria

- Both routes render the Vercel-style minimal card with exact copy above; mode is the only copy branch.
- Zero hardcoded hex/gradient classes (`bg-[#`, `from-`, `via-`, `to-`, `blur-[`), zero `rounded-3xl`/`rounded-2xl`/`h-[52px]`, zero infinite animations, zero invented stats/tickers/claims.
- Typography/buttons/cards match Cenpact §3–§4 (`text-2xl` H1, `text-sm` body, `h-10 rounded-full` CTA, `rounded-xl border-border/40 bg-card` card).
- `bun run check` + `bun run build` pass; `routeTree.gen.ts` shows `/sign-in`, `/sign-up` (generated, unedited).

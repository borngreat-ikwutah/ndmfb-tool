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

## Code outline & folder layout

**Organize by feature folder.** Feature code lives in `src/features/<feature>/` — a multi-file feature gets its own folder, while a tiny single-component feature may stay as one file. Routes live in `src/app`, shared UI primitives in `src/components/ui`, cross-cutting helpers in `src/lib`, and server functions in `src/server`.

**Outline before you build.** When planning or explaining a change, agents must present the code as a **folder tree** — every file to add or edit, shown in the directory it lives in — before writing it. A flat prose list of filenames is not enough, and the outline must match the layout that will actually land. If the structure changes while building, update the outline.

```text
src/features/payroll/
├── payroll-page.tsx     # route-level view
├── payroll-table.tsx    # feature UI
└── payroll-api.ts       # server calls
```

## Dashboard navigation & naming

The authenticated shell uses the shadcn sidebar in `src/features/dashboard/app-sidebar.tsx`.
Groups and items follow one naming scheme so the sidebar stays legible as features grow.

**The scheme — domain → destination:**

- **Group label = the domain.** A singular noun for the area the user is in, e.g. `Workspace`, `Payroll`, `Marketing`, `WhatsApp bot`, `Systems`.
- **Item label = a destination inside that domain.** A noun for a specific page/view, e.g. `Dashboard`, `Overview`, `Send history`. It must **never repeat the group label**.
- **Items are nouns, not verbs.** Actions ("Manage …", "Run …") belong inside the feature, never in the nav.
- **A single-page feature's entry is its landing view, named `Overview`** — not the feature name, which is already the group label.
- **One group per feature only while it needs siblings.** With a single page and no siblings, drop the group label and show the feature as a standalone top-level item; add the group back as soon as it has a second item.

**Implementation rules (`app-sidebar.tsx`):**

- Declare nav per group as `NavItem[]` (`workspaceNav`, `payrollNav`, `marketingNav`, `whatsappNav`, `systemsNav`) and render each group with the `NavGroup` + `NavList` helpers.
- **Only link to routes that exist.** Use TanStack `Link` `to` for real routes; for a surface without a route, set `soon: true`, which renders a disabled button with a "Soon" badge — never a link to a non-existent path.
- Routes are typed. Add the route under `src/app` first, then flip the item from `soon` to `to`.

<!-- Drafted by audit skill. -->

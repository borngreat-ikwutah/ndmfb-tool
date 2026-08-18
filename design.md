# Design System Specification (`design.md`)

This document specifies the visual design principles, semantic token mappings, typography rules, and component guidelines for the **ndmfb-tool** monorepo.

Token implementations and CSS variables are located in [`packages/ui/src/styles/globals.css`](file:///home/borngreat/Desktop/projects/ndmfb-tool/packages/ui/src/styles/globals.css).

---

## 1. Core Visual Principles

- **Function-Driven Minimalism**: Restraint over decorative clutter. Every pixel and component serves a clear functional purpose.
- **Perceptually Uniform Color (OKLCH)**: High contrast, accessible color ramps calculated in OKLCH for consistent perceptual lightness across light and dark modes.
- **Mathematical Radius Hierarchy**: Proportional rounding derived from a single `--radius` token, avoiding mismatched corners.
- **Harmonious Typography**: Clear typographic hierarchy using Google variable fonts (*DM Sans* and *Noto Sans*).

---

## 2. Design Tokens & Color Palettes

All colors are defined as OKLCH CSS variables in `:root` (Light Mode) and `.dark` (Dark Mode).

### 2.1 Surfaces & Canvas

| Token | CSS Variable | Light Mode (OKLCH) | Dark Mode (OKLCH) | Semantic Usage |
|---|---|---|---|---|
| Background | `--background` | `oklch(1 0 0)` (#FFF) | `oklch(0.145 0 0)` | Primary application background |
| Foreground | `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Primary body text and icons |
| Card | `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Elevated surfaces and containers |
| Card Foreground | `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Text and content inside cards |
| Popover | `--popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Dropdowns, menus, tooltips |
| Popover Foreground | `--popover-foreground`| `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Text inside popovers |

### 2.2 Interactive & Brand Colors

| Token | CSS Variable | Light Mode (OKLCH) | Dark Mode (OKLCH) | Semantic Usage |
|---|---|---|---|---|
| Primary | `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Key call-to-action buttons & highlights |
| Primary Foreground | `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Text on primary elements |
| Secondary | `--secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Secondary buttons and subtle badges |
| Secondary Foreground | `--secondary-foreground`| `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on secondary elements |
| Accent | `--accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Hover highlights and interactive accents |
| Accent Foreground | `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on accent elements |
| Destructive | `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Error states, dangerous actions |

### 2.3 Form & Utility Tokens

| Token | CSS Variable | Light Mode | Dark Mode | Semantic Usage |
|---|---|---|---|---|
| Border | `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Subtle borders on cards and dividers |
| Input | `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Input and control element borders |
| Ring | `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Focus visible rings |
| Muted | `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Muted background fills |
| Muted Foreground | `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Secondary/supporting text |

### 2.4 Sidebar Tokens

| Token | CSS Variable | Light Mode | Dark Mode | Semantic Usage |
|---|---|---|---|---|
| Sidebar Surface | `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Sidebar background |
| Sidebar Text | `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Sidebar navigation text |
| Sidebar Active | `--sidebar-primary` | `oklch(0.205 0 0)` | `oklch(0.488 0.243 264.376)` | Active item highlight |
| Sidebar Border | `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Sidebar divider line |

---

## 3. Typography Hierarchy

Fonts are loaded from `@fontsource-variable` packages and assigned via `@theme inline`:

- **Sans / Body Font (`--font-sans`)**: `'DM Sans Variable', sans-serif`
- **Heading / Display Font (`--font-heading`)**: `'Noto Sans Variable', sans-serif`

| Level | Font Weight | Line Height | Tracking | Semantic Usage |
|---|---|---|---|---|
| Display / H1 | 600–700 | 1.15 | `-0.025em` | Hero headlines and primary page headers |
| H2 | 600 | 1.25 | `-0.02em` | Section headers |
| H3 | 600 | 1.35 | `-0.015em` | Card and modal titles |
| Body (Default) | 400 | 1.5–1.6 | `0` | Standard paragraph text (`text-sm` / `text-base`) |
| Caption / Small | 400–500 | 1.4 | `+0.01em` | Form labels, helper text, badges |
| Code / Mono | 400 | 1.4 | `0` | Code blocks, API values, IDs |

---

## 4. Proportional Border Radius Scale

All radius tokens scale proportionally from the base token `--radius: 0.5rem` (8px):

| Token | Tailwind Class | Formula | Resolved Value (`--radius: 0.5rem`) | Intended Component Usage |
|---|---|---|---|---|
| `--radius-sm` | `rounded-sm` | `calc(var(--radius) - 4px)` | **4px** | Badges, tags, small inner controls |
| `--radius-md` | `rounded-md` | `calc(var(--radius) - 2px)` | **6px** | Standard buttons, inputs, selects, dropdown items |
| `--radius-lg` | `rounded-lg` | `var(--radius)` | **8px** | Medium cards, dialogs, popovers |
| `--radius-xl` | `rounded-xl` | `calc(var(--radius) + 4px)` | **12px** | Outer card containers, modals |
| `--radius-2xl` | `rounded-2xl` | `calc(var(--radius) + 8px)` | **16px** | Large dashboards / Bento containers |
| `--radius-3xl` | `rounded-3xl` | `calc(var(--radius) + 12px)`| **20px** | Hero sections, highlighted cards |
| `--radius-4xl` | `rounded-4xl` | `calc(var(--radius) + 16px)`| **24px** | Outer app wrappers |
| `rounded-full` | `rounded-full`| `9999px` | **Full Pill** | Avatars, pills, status dots |

---

## 5. Component Construction Guidelines

### 5.1 Buttons (`Button`)
- **Default Radius**: `rounded-md` (6px) for balanced, modern corners.
- **Heights & Sizing**:
  - `xs`: `h-6`, `px-2.5`, `text-xs`
  - `sm`: `h-8`, `px-3`, `text-sm`
  - `default`: `h-9`, `px-3`, `text-sm`
  - `lg`: `h-10`, `px-4`, `text-base`
- **States**: Hover, Active (`translate-y-px`), Disabled (`opacity-50`, `pointer-events-none`), Focus (`ring-3`, `focus-visible:ring-ring/30`).

### 5.2 Form Inputs
- Standard height: `h-9`, `rounded-md`, border `border-input`, background `bg-background` or transparent in dark mode.
- Focus: `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30`.

### 5.3 Cards & Surfaces
- Base class: `bg-card text-card-foreground rounded-lg border border-border`.
- Nested elements should use smaller radii (e.g. Card `rounded-lg` containing inputs with `rounded-md`).

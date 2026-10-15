# Cenpact Design System Specification

> **Cenpact** (Cencori + Compact) — A developer-first, high-density design system prioritizing information density, subtle sophistication, and dark-mode native elegance.

---

## 1. Core Principles

### 1.1 Dense but Breathable
- **Rule**: Pack information tightly inside components while keeping clean macro-margins between page sections.
- **Do**:
  - Tight internal padding (`p-4`, `p-5`) and small gaps (`gap-2.5`, `gap-3`).
  - Rely on visual weight, typography, and hair-thin borders for hierarchy rather than excessive blank space.
  - Maintain generous margins between major page sections (`space-y-8`, `space-y-12`).
- **Don't**:
  - Cram items without rhythm or uniform hierarchy.
  - Sacrifice typography legibility or touch target ergonomics for artificial density.

### 1.2 Subtle Sophistication
- **Rule**: Content takes center stage; UI chrome remains understated, quiet, and refined.
- **Do**:
  - Soft borders using semantic tokens (`border border-border/40` or `border-border/50`).
  - Muted surfaces (`bg-card/50`, `bg-muted/30`, `backdrop-blur`).
  - Subtle hover feedback that confirms intent without bright, distracting flashes.
- **Don't**:
  - High-contrast neon borders or loud background gradients.
  - Unnecessary decorative animations or transitions longer than `150ms-200ms`.

### 1.3 Developer-First & Power-User Centric
- **Rule**: Prioritize speed, density, and discoverability for power users.
- **Do**:
  - Always expose technical identifiers (IDs, hashes, ISO timestamps, statuses) in monospace (`font-mono text-xs text-muted-foreground`).
  - Inline one-click copy buttons for keys, IDs, and endpoints.
  - Keyboard shortcuts (`<kbd>` hints) and fast-action command menus.
  - Prefer responsive single-screen tables/dashboards over multi-step wizards.
- **Don't**:
  - Hide critical data behind multi-layer drill-downs or modal labyrinths.
  - Force sequential wizard steps when a structured form row layout suffices.

### 1.4 Dark Mode Native
- **Rule**: Built and tuned dark-first, then adapted cleanly for light themes.
- **Do**:
  - Use semantic HSL/OKLCH color variables exclusively (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`).
  - Keep low-saturation card fills with crisp 1px borders in dark mode.
- **Don't**:
  - Hardcode raw hex codes (`#000000`, `#ffffff`).
  - Treat dark mode as an inverted afterthought.

---

## 2. Color System & Semantic Tokens

| Token | Light Theme | Dark Theme | Purpose |
| :--- | :--- | :--- | :--- |
| `background` | `hsl(0 0% 100%)` | `hsl(240 10% 3.9%)` | Root page background |
| `foreground` | `hsl(240 10% 3.9%)` | `hsl(0 0% 98%)` | Primary text |
| `card` | `hsl(0 0% 100%)` | `hsl(240 10% 5%)` | Containers, card surfaces |
| `border` | `hsl(240 5.9% 90%)` | `hsl(240 3.7% 15.9%)` | Dividers & outlines (`border-border/40`) |
| `muted` | `hsl(240 4.8% 95.9%)` | `hsl(240 3.7% 12%)` | Subtle pill fills, code blocks |
| `muted-foreground`| `hsl(240 3.8% 46.1%)` | `hsl(240 5% 64.9%)` | Secondary text, hints, captions |
| `primary` | `hsl(240 5.9% 10%)` | `hsl(0 0% 98%)` | Primary CTAs |
| `destructive` | `hsl(0 84.2% 60.2%)` | `hsl(0 62.8% 30.6%)` | Errors, warnings, destructive triggers |

### Status Accents (10% Alpha Backgrounds)
- **Success / Connected**: `bg-emerald-500/10 text-emerald-500`
- **Warning / Pending**: `bg-amber-500/10 text-amber-500`
- **Error / Danger**: `bg-red-500/10 text-red-500`
- **Info / Blue**: `bg-blue-500/10 text-blue-500`

---

## 3. Typography Scale

- **Heading 1**: `text-2xl md:text-3xl font-bold tracking-tight text-foreground`
- **Heading 2**: `text-base md:text-lg font-semibold text-foreground`
- **Section Label**: `text-xs font-medium uppercase tracking-wider text-muted-foreground`
- **Body Regular**: `text-sm text-foreground leading-normal`
- **Body Muted**: `text-xs md:text-sm text-muted-foreground`
- **Caption / Meta**: `text-[10px] md:text-xs text-muted-foreground`
- **Code / Monospace**: `font-mono text-xs text-muted-foreground`

---

## 4. Component Patterns

### 4.1 Buttons
```tsx
// Primary CTA (Full Pill)
<Button className="h-9 px-4 text-sm rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
  Get Started
  <ArrowRight className="h-3 w-3 ml-1.5" />
</Button>

// Secondary Outline (Full Pill)
<Button variant="outline" className="h-8 px-3 text-xs rounded-full border-border/60 hover:bg-accent">
  View Docs
</Button>

// Compact Ghost
<Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs">
  Cancel
</Button>

// Action / Copy Icon Button
<Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
  <Copy className="h-3 w-3" />
</Button>
```

### 4.2 Status & Outline Badges
```tsx
// Status Badge
<Badge className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border-0">
  Connected
</Badge>

// Outline Meta Badge
<Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px] border-border/60">
  v1.0.0
</Badge>
```

### 4.3 Metric & Analytics Cards
```tsx
<div className="rounded-xl border border-border/40 bg-card p-5">
  <div className="flex items-center gap-2.5 mb-2">
    <div className="text-muted-foreground"><Activity className="h-5 w-5" /></div>
    <span className="text-sm font-medium">Metric Title</span>
  </div>
  <p className="text-xs text-muted-foreground mb-1">Subcategory</p>
  <p className="text-3xl font-semibold mb-1 tracking-tight">1,234</p>
  <p className="text-xs text-muted-foreground mb-3">+12% from last week</p>
  <div className="h-28 mt-4">
    {/* Micro Recharts / Sparkline */}
  </div>
</div>
```

### 4.4 Settings & Form Rows (Responsive)
```tsx
<div className="rounded-xl border border-border/50 bg-card overflow-hidden">
  {/* Row Item */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3 border-b border-border/40 gap-2 md:gap-0">
    <div className="space-y-0.5">
      <p className="text-sm md:text-xs font-medium">Setting Label</p>
      <p className="text-xs md:text-[10px] text-muted-foreground">Detailed description of this configuration.</p>
    </div>
    <Input className="w-full md:w-64 h-9 md:h-8 text-sm md:text-xs" />
  </div>

  {/* Footer Bar */}
  <div className="flex justify-end px-4 py-2.5 md:py-2 bg-muted/20">
    <Button size="sm" className="h-8 md:h-7 px-4 md:px-3 text-xs">
      Save changes
    </Button>
  </div>
</div>
```

### 4.5 Horizontal Tabs (Mobile Anti-Wrap)
```tsx
<TabsList className="flex w-full flex-nowrap overflow-x-auto no-scrollbar border-b border-border">
  <TabsTrigger 
    value="general" 
    className="px-3 md:px-4 py-3 text-xs md:text-sm font-medium whitespace-nowrap shrink-0 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-foreground"
  >
    General
  </TabsTrigger>
</TabsList>
```

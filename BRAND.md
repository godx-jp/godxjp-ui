# GoDX brand bible

**Locked 2026-05-13.** Source: Claude Design handoff bundle —
`design/source-2026-05-13/` (also kept verbatim as
`design/godx-admin-2026-05-13.tar.gz`).

> ⚠️ **Never lose the brand.** Every frontend in the GoDX ecosystem
> (admin / forge / console / me / work / knowledge / agent / media /
> chat / reporting / schema-studio / marketing) must:
>
> 1. import `@godxjp/ui/tokens` as the FIRST stylesheet
> 2. consume the variables below as-is — never redefine `--primary`,
>    `--foreground`, `--background`, spacing, type, density tokens
> 3. live by the design philosophy (next section)
>
> A PR that hard-codes a color, custom font scale, or off-grid spacing
> gets rejected at review.

## Design philosophy (immutable)

Three principles from the dxs-kintai brand foundation (Japanese
enterprise aesthetics):

| Term | Meaning | What it enforces |
|---|---|---|
| **渋み** (shibumi) | restrained elegance | Primary chroma ≤ 0.18 in OKLCH. No neon. No gradients on functional UI. |
| **間** (ma) | vertical breathing room | Body `line-height: 1.7`. Generous spacing. Density toggle for compact data tables. |
| **簡素** (kanso) | simplicity | Three font weights total: **400** (body), **500** (heading + emphasis default), **700** (loud emphasis only). No 600 in new code (kept as legacy alias). |

These are NOT taste choices — they're brand contracts. Any visual
direction that breaks them needs operator sign-off in advance.

## Token surface (read from `src/tokens/`)

### Type

```
--font-sans-jp        "M PLUS 2" + JP fallback chain + system-ui
--font-weight-normal  400 (body)
--font-weight-medium  500 (headings, buttons, labels)
--font-weight-bold    700 (loud emphasis only)

--text-2xs            11px    fine print
--text-xs             12px    caption / label
--text-sm             13px    dense table rows
--text-base           14px    DEFAULT body (JP density override)
--text-md             16px    content-heavy body
--text-lg             18px    subheading
--text-xl             20px    h3 / page title
--text-2xl            24px    h2
--text-3xl            30px
--text-4xl            32px    h1 cap

--leading-tight       1.25    headings
--leading-normal      1.5     dense / single-line UI
--leading-body        1.7     JP body default (ma principle)
```

Semantic heading sizes are deliberately small — info-dense JP
enterprise vibe: `--heading-h1 = 20px`, `--heading-h2 = 18px`,
`--heading-h3 = 14px`, `--heading-h4 = 13px`.

### Color — OKLCH only

Primary palette mastered in OKLCH so dark mode + tenant overrides are
mechanical. Never override `--primary` / `--foreground` /
`--background` / `--card` / `--muted` in app code; switch via
`[data-tenant]` or `[data-theme="dark"]` attributes.

```
--background     warm off-white  oklch(99% 0.002 60)
--foreground     warm off-black  oklch(20% 0.006 60)   (SmartHR #23221e)
--primary        SmartHR blue    oklch(56% 0.15 240)   (#0077c7)
--destructive    茜 madder       oklch(52% 0.18 25)    (#b7282e, chroma capped)
--success        若竹 bamboo     oklch(72% 0.13 155)   (#68be8d)
--warning        山吹 mountain   oklch(80% 0.17 85)    (#f8b500)
--info           群青 ultramarine oklch(55% 0.12 265)  (#4c6cb3)
--attention      朱 vermilion    oklch(66% 0.19 45)    (#eb6101)
```

**和色 (wa-iro) decorative palette** is for charts, accent tags,
illustrations — **never** for role-mapped UI (don't use `--wa-akane`
as a button color; use `--destructive`). The palette:

`--wa-ai` `--wa-gunjo` `--wa-ruri` `--wa-kon` `--wa-wakatake`
`--wa-moegi` `--wa-yamabuki` `--wa-shu` `--wa-akane` `--wa-enji`
`--wa-sakura` `--wa-sumi` `--wa-nezu`.

### Tenant overrides

Brand palette swaps via `[data-tenant="<slug>"]` at `<html>` or any
ancestor. Defined slugs:

- `godx` (default) — Famgia emerald accent + SmartHR blue primary
- `kintai` — SmartHR blue primary
- `tempo` — deeper indigo
- `betoya` — Vietnamese green (Betoya restaurant brand)

### Dark mode

`[data-theme="dark"]` flips every surface + tenant. Already wired in
`tokens-ext.css`.

### Density

`[data-density="compact|default|comfortable"]` rescales every UI
element (button height, padding, row height). Default fits SmartHR /
freee density (32px element). Compact for kintone-style dense tables
(28px). Comfortable for public surfaces (44px — WCAG touch target).

### Spacing — 4px grid

```
--spacing-0  0      --spacing-1 4px   --spacing-2 8px
--spacing-3 12px    --spacing-4 16px  --spacing-5 20px
--spacing-6 24px    --spacing-8 32px  --spacing-10 40px
--spacing-12 48px   --spacing-16 64px --spacing-20 80px  --spacing-24 96px
```

Never invent off-grid values (`13px`, `7px`, etc).

### Layout invariants

```
--header-height            48px
--sidebar-width            256px
--sidebar-collapsed-width  64px
--container-max-width      1280px
--touch-target-min         44px  (Digital Agency hard rule, never go below)
```

### Radius / motion

```
--radius      6px (base)
--radius-md   4px, --radius-lg 6px, --radius-xl 10px, --radius-full ∞

--transition-fast   150ms
--transition-base   200ms
--transition-slow   300ms
--ease-in-out       cubic-bezier(0.4, 0, 0.2, 1)
```

`@media (prefers-reduced-motion: reduce)` honours user preference; the
`.pulse` keyframe self-disables.

## Component primitives (read from `src/tokens/tokens-ext.css`)

Application-shell primitives are mastered as CSS classes (not React
components — those layer on top per portal). Each frontend imports the
tokens and gets these for free:

| Class | Use |
|---|---|
| `.app-root / .app-sidebar / .app-topbar / .app-main` | three-pane app shell with collapse animation |
| `.sb-product / .sb-section / .sb-nav-item` | sidebar primary nav |
| `.tb-breadcrumb / .tb-chip / .tb-search / .tb-icon-btn` | topbar |
| `.sw-pop` family | command-palette / switcher dropdown |
| `.page / .page-header / .page-title / .page-actions` | page chrome |
| `.card / .card-header / .card-title` | card surface |
| `.btn / .btn-primary / .btn-secondary / .btn-ghost / .btn-danger / .btn-sm / .btn-lg` | buttons |
| `.input / .label / .help` | form primitives |
| `.badge / .badge-success / -warning / -info / -error / -attention / -neutral / -outline` | status badges |
| `.chip` | tag |
| `.table / .num / .mono` | tabular data |
| `.tabs / .tab` | tab strip |
| `.kpi / .kpi-label / .kpi-value / .kpi-delta` | dashboard metric |
| `.log-line` | terminal-style activity feed |
| `.diff / .diff-row.add / .diff-row.del / .diff-row.ctx` | code diff |
| `.kanban / .kanban-col / .issue-card` | kanban board |
| `.wiki-layout / .wiki-toc / .prose` | wiki / doc render |
| `.auth-shell / .auth-card / .auth-art` | login screen |
| `.avatar / .kbd / .dot / .pulse` | utilities |

Use them directly when building plain HTML. When using React, wrap
each in a small primitive component in your portal's `components/`
directory; do NOT re-create the class names — import the existing CSS.

## Reference HTML prototypes

The bundle ships pixel-canonical HTML prototypes in
`design/source-2026-05-13/project/`:

| File | What it shows |
|---|---|
| `godx-unified.html` | full admin shell (sidebar + topbar + page) |
| `signin.html` | sign-in flow (email → password → 2FA → done) |
| `device.html` | device-code authorize flow |
| `login.html` | 15-artboard canvas reviewing every login state |
| `design-canvas.jsx` | React canvas showcasing every primitive |
| `shell.jsx`, `ui-kit.jsx`, `tweaks-panel.jsx` | JSX primitives mirroring the CSS classes |
| `screens-*.jsx` | per-screen reference layouts (product / project / detail) |

When implementing a new screen, **open the closest reference** first
and match its visual rhythm. Don't redesign solo without a precedent.

## Forbidden patterns

- ❌ Hard-coded hex colors in component code (use `var(--primary)` etc).
- ❌ Custom font sizes outside the `--text-*` scale.
- ❌ Spacing values off the 4px grid (`5px`, `7px`, `13px`…).
- ❌ Font weight 300 / 600 / 800 / 900 in new code (only 400 / 500 / 700).
- ❌ Tailwind utility classes that re-encode tokens (e.g. `text-blue-500`
  instead of `text-[var(--primary)]`).
- ❌ A new shadow / radius / motion curve "just for this card".
- ❌ Logos, marketing copy, or product-specific imagery in the
  `@godxjp/ui` package — those live in the consumer portal.

## Updating the brand

When the operator approves a brand change:

1. Update `src/tokens/tokens.css` and/or `tokens-ext.css` here in
   `packages/godxjp-ui`.
2. Bump the package version.
3. Bump the submodule pointer in `godx-admin` umbrella.
4. Each portal pulls the new submodule SHA in a follow-up PR.
5. **Refresh `BRAND.md` if the change moves a foundational rule.**

Document the change in `design/CHANGELOG.md` (create on first change).

The current locked snapshot is preserved at
`design/source-2026-05-13/` + the original archive at
`design/godx-admin-2026-05-13.tar.gz`.

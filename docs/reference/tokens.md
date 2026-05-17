---
title: "Design tokens"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer, agent]
lang: en
status: published
---

# Design tokens

Every CSS custom property exposed by `@godxjp/ui`. Source of truth: `src/tokens/tokens.css` and `src/tokens/tokens-ext.css`.

Import the base set:

```tsx
import "@godxjp/ui/tailwind.css"   // tokens + Tailwind v4 layer
// or
import "@godxjp/ui/tokens.css"     // raw CSS custom properties only
```

For dark mode + tenant overrides + shell classes:

```tsx
import "@godxjp/ui/tokens-ext.css"   // included automatically in tailwind.css
```

---

## Typography

| Token | Value | Use |
|---|---|---|
| `--font-sans-jp` | `"M PLUS 2", JP fallback chain, system-ui` | Primary font family |
| `--font-weight-normal` | `400` | Body text |
| `--font-weight-medium` | `500` | Headings, buttons, labels |
| `--font-weight-bold` | `700` | Loud emphasis only |
| `--text-2xs` | `11px` | Fine print |
| `--text-xs` | `12px` | Caption, label |
| `--text-sm` | `13px` | Dense table rows |
| `--text-base` | `14px` | Default body (JP density) |
| `--text-md` | `16px` | Content-heavy body |
| `--text-lg` | `18px` | Subheading |
| `--text-xl` | `20px` | h3 / page title |
| `--text-2xl` | `24px` | h2 |
| `--text-3xl` | `30px` | — |
| `--text-4xl` | `32px` | h1 cap |
| `--heading-h1` | `20px` | Semantic h1 size |
| `--heading-h2` | `18px` | Semantic h2 size |
| `--heading-h3` | `14px` | Semantic h3 size |
| `--heading-h4` | `13px` | Semantic h4 size |
| `--leading-tight` | `1.25` | Headings |
| `--leading-normal` | `1.5` | Dense UI |
| `--leading-body` | `1.7` | JP body (間 principle) |

---

## Color — OKLCH

All colors are in OKLCH. Never hard-code hex in application code.

### Semantic roles

| Token | Light value | Purpose |
|---|---|---|
| `--background` | `oklch(99% 0.002 60)` | Page background |
| `--foreground` | `oklch(20% 0.006 60)` | Primary text |
| `--card` | surface | Card + popover background |
| `--card-foreground` | — | Text on card |
| `--popover` | — | Popover background |
| `--popover-foreground` | — | Text in popovers |
| `--primary` | `oklch(56% 0.15 240)` | Brand action color (SmartHR blue) |
| `--primary-foreground` | white | Text on primary |
| `--secondary` | muted surface | Secondary button background |
| `--secondary-foreground` | — | Text on secondary |
| `--muted` | subtle surface | Muted backgrounds (skeleton, disabled) |
| `--muted-foreground` | — | Secondary text |
| `--accent` | — | Hover surface |
| `--accent-foreground` | — | Text on accent |
| `--destructive` | `oklch(52% 0.18 25)` | Error / danger (茜 madder) |
| `--destructive-foreground` | white | Text on destructive |
| `--success` | `oklch(72% 0.13 155)` | Success state (若竹 bamboo) |
| `--warning` | `oklch(80% 0.17 85)` | Warning state (山吹 mountain) |
| `--info` | `oklch(55% 0.12 265)` | Info state (群青 ultramarine) |
| `--attention` | `oklch(66% 0.19 45)` | Attention / pending (朱 vermilion) |
| `--border` | — | Default border |
| `--input` | — | Input field background |
| `--ring` | `--primary` | Focus ring |

### Wa-iro decorative palette

For charts, accent tags, and illustrations only — never for role-mapped UI.

`--wa-ai` `--wa-gunjo` `--wa-ruri` `--wa-kon` `--wa-wakatake` `--wa-moegi` `--wa-yamabuki` `--wa-shu` `--wa-akane` `--wa-enji` `--wa-sakura` `--wa-sumi` `--wa-nezu`

---

## Spacing — 4 px grid

| Token | Value |
|---|---|
| `--spacing-0` | `0` |
| `--spacing-1` | `4px` |
| `--spacing-2` | `8px` |
| `--spacing-3` | `12px` |
| `--spacing-4` | `16px` |
| `--spacing-5` | `20px` |
| `--spacing-6` | `24px` |
| `--spacing-8` | `32px` |
| `--spacing-10` | `40px` |
| `--spacing-12` | `48px` |
| `--spacing-16` | `64px` |
| `--spacing-20` | `80px` |
| `--spacing-24` | `96px` |

Never use off-grid values (13 px, 7 px, etc.).

---

## Layout invariants

| Token | Value |
|---|---|
| `--header-height` | `48px` |
| `--sidebar-width` | `256px` |
| `--sidebar-collapsed-width` | `64px` |
| `--container-max-width` | `1280px` |
| `--touch-target-min` | `44px` |

---

## Radius

| Token | Value |
|---|---|
| `--radius` | `6px` (base) |
| `--radius-md` | `4px` |
| `--radius-lg` | `6px` |
| `--radius-xl` | `10px` |
| `--radius-full` | `9999px` (pill) |

---

## Motion

| Token | Value |
|---|---|
| `--transition-fast` | `150ms` |
| `--transition-base` | `200ms` |
| `--transition-slow` | `300ms` |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` |

All animations respect `@media (prefers-reduced-motion: reduce)`.

---

## Density (tokens-ext.css)

`[data-density="compact"]`, `[data-density="default"]`, `[data-density="comfortable"]` selectors rescale:

- Button height: 28 px / 32 px / 44 px
- Input height: 28 px / 32 px / 44 px
- Table row height: 28 px / 32 px / 40 px

---

## See also

- [BRAND.md](../../BRAND.md) — brand philosophy and forbidden patterns.
- [ADR 0003: Tokens not utilities](../adr/0003-tokens-not-utilities.md).
- [How-to: Override tokens](../how-to/override-tokens.md).

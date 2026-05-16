# dxs-kintai · Design System

A design system for **dxs-kintai** (godx-kintai-001) — a multi-tenant 勤怠 (kintai · attendance) management platform built by **famgia.com**. The system encodes the visual + interaction language used across three role-aware shells: HR/admin, shop manager, and the employee-facing personal page.

> 「丁寧でストイックな信頼感を、業務の道具として残す。」
> *Restrained, stoic trustworthiness — left as a tool for daily work.*

---

## At a glance

| Surface | Path | Audience | Density |
|---|---|---|---|
| **HR / Admin** | `/admin/[brandSlug]/...` | HR, ops, owners | default (32px) |
| **Shop Manager** | `/admin/[brandSlug]/...` (scoped) | 店長 | default |
| **Employee** | `/me/...` | 従業員 (Vietnamese & Japanese staff) | default · comfortable for punch |
| **Login / public** | `/auth/...` | Anonymous | comfortable (44px touch floor) |

**Stack** Laravel 13 (API) · Next.js 16 + Tailwind v4 · `@godxjp/ui` (shadcn-style primitives) · TanStack Query · OpenAPI-generated services.

---

## Design philosophy — three Japanese principles

The token system is built around three principles drawn from traditional Japanese aesthetics, each with a hard, measurable rule:

| Principle | Meaning | Rule in tokens |
|---|---|---|
| **渋み** *shibumi* | restrained elegance | All `--primary` chroma ≤ 0.18 in OKLCH — never neon, never saturated |
| **間** *ma* | breathing room | Body `line-height: 1.7` (vs Western 1.5) so kanji descenders never collide |
| **簡素** *kanso* | simplicity | Three font weights only: 400 / 500 / 700 |

These are not slogans. If a design breaks a rule, the design changes — not the rule.

---

## Content fundamentals

**Tone** Quiet, precise, neutral. Avoid praise (「素晴らしい」), avoid alarm (「重大」). Status messages state facts: 「承認しました」, not 「承認に成功しました🎉」.

**Mixed-script typography** Japanese (漢字 / ひらがな / カタカナ) is the primary script; English UI strings carry equal weight; Vietnamese appears throughout the Betoya tenant (see `/me/my-shifts/page.tsx` — labels are mixed JP/VI). The font stack must serve all three.

**Locale** `ja` is default. `en` and `vi` are first-class. All copy lives in `src/i18n/{ja,en,vi}.json` keyed by `nav.*`, `absence.*`, etc. Never hardcode strings.

**Empty states** Always one calm sentence — never illustrations, never emoji. Example: 「ご指定の月にシフトはありません」.

**Color signaling rules**
- 🔴 **danger (茜 #b7282e)** — destructive only (delete, reject, fire)
- 🟠 **attention (朱 #eb6101)** — non-critical alerts (lateness, attention required) ← **prefer this over red**
- 🟡 **warning (山吹 #f8b500)** — drafts, pending, transient state
- 🟢 **success (若竹 #68be8d)** — approved, completed, healthy
- 🔵 **info (群青 #4c6cb3)** — informational, neutral context

---

## Visual foundations

### Color (OKLCH, warm hue 60)

The neutral spine sits on a warm hue (60°) — off-white (99% L) → warm-black (20% L) — convergent with SmartHR's `TEXT_BLACK #23221e` and `BORDER #d6d3d0`. Primary is calibrated to SmartHR `MAIN #0077c7` (`oklch(56% 0.15 240)`) — a calm, trustworthy blue that reads as 'enterprise software' without feeling cold.

Decorative accents come from the **和色 (wa-iro)** palette — 13 traditional Japanese hues (藍, 群青, 瑠璃, 紺, 若竹, 萌葱, 山吹, 朱, 茜, 臙脂, 桜, 墨, 鼠) used for charts, tags, and tenant theming. Wa-iro hues are **never** assigned to semantic roles other than the five canonical mappings above.

**Multi-tenant theming** Tenants override only `--primary`, `--ring`, `--foreground`. Semantic colors stay shared across tenants so a 'rejected' badge means the same thing in every brand. The Betoya tenant ships with `data-tenant="betoya"` → Vietnam green (#009444).

### Type — M PLUS 2

Selected for its near-perfect coverage of JIS Level 1 + 2 kanji, balanced kana metrics, and 5 weights from a single foundry. Loaded from Google Fonts; weights 300 / 400 / 500 / 600 / 700.

**Headings are intentionally compact** — h1 is 20px, not 32px. JP enterprise UIs are information-dense; oversized headings waste 間 (ma) that should belong to the data.

**Body is 14px / 1.7** — tighter font-size than Western SaaS (16px), wider leading (1.7 vs 1.5). Net result: same vertical rhythm, but kanji ascenders/descenders never clip.

### Spacing — three densities

| Mode | Element height | Use |
|---|---|---|
| `[data-density="compact"]` | 28px | Heavy data tables (kintone-style) |
| default | **32px** | App default — everything else |
| `[data-density="comfortable"]` | 44px | Login, mobile-leaning surfaces, public — meets 44px touch floor |

All spacing on a 4px grid. Cards prefer **1px border** over shadow at rest; shadows only on popovers (md), dialogs (xl). Radius base is 6px — sharper than the soft-rounded SaaS norm, gentler than kintone's flat right-angles.

---

## Iconography

**Library** [`lucide-react`](https://lucide.dev) — already a peer dep of `@godxjp/ui`. **Stroke 1.5px**, fixed.

**Sizes**
- 14px in dense table cells
- 16px in nav items, default toolbar
- 18px in primary buttons
- 20px in page headers, KPI cards

**Color** Always `currentColor` — icons inherit from their text. Never colored decoratively, never filled.

**No emoji** in production UI. Emoji are tolerable in this design system's preview cards as visual shorthand, but in the product they are forbidden — they break across CJK fonts and signal informality.

---

## Files

| Path | Purpose |
|---|---|
| `colors_and_type.css` | Source of truth — all design tokens (OKLCH colors, type scale, spacing, density modes, tenant overrides) as CSS custom properties. Mirrors `admin-web/src/app/globals.css`. |
| `preview/` | Design-system cards (one HTML per token group) — rendered in the project's Design System tab. |
| `ui_kits/admin-web/UI Kit.html` | Four assembled product surfaces in one document: HR dashboard, employee `/me`, approval workflow (Betoya tenant), login. |
| `SKILL.md` | Instructions for designers/agents using this system. |

## Usage

Link the tokens into any HTML mockup with one import:

```html
<link rel="stylesheet" href="colors_and_type.css">
```

Then write your design with `var(--primary)`, `var(--foreground)`, `var(--density-element)`, etc. To switch tenant or density at any subtree:

```html
<div data-tenant="betoya" data-density="comfortable">
  <!-- everything inside picks up overrides -->
</div>
```

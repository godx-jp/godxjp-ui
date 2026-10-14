---
version: alpha
name: godxjp-ui
description: "Restrained Japanese-enterprise admin UI. Warm off-white canvas, near-black ink, one neutral accent, hairline borders, 14px/1.7 type, dense tables. Hierarchy comes from spacing steps and type, not from boxes, colour or shadow."

colors:
  canvas: "#fdfdfc" # --background (= --card, --popover)
  ink: "#24231e" # --foreground
  ink-muted: "#68665e" # --muted-foreground
  ink-tertiary: "#928f87" # --text-tertiary (captions, meta)
  primary: "#18181b" # --primary. Neutral placeholder: set your brand here
  on-primary: "#fdfdfc" # --primary-foreground
  ring: "{colors.primary}" # --ring follows --primary; no separate focus hue
  muted: "#f4f3f0" # --muted / --secondary (quiet fills, zebra, hover)
  accent: "#ebe9e5" # --accent (hover/selected background, NOT a brand colour)
  hairline: "#eeedec" # --border (dividers, card edges, table rules)
  control-edge: "#90877f" # --input (the edge of an input; 3:1 against canvas)
  success: "#68be8d" # --success  若竹
  warning: "#f8b500" # --warning  山吹
  info: "#4c6cb3" # --info     群青
  attention: "#eb6101" # --attention 朱 (non-destructive urgency: late, overdue)
  destructive: "#b7282e" # --destructive 茜 (delete, failed, irreversible)
  text-success: "#09673b" # --text-success (status as text, AA on canvas)
  text-warning: "#8f5600" # --text-warning
  text-info: "#1d48a5" # --text-info
  text-error: "#aa181f" # --text-error

typography:
  family: "system stack (--font-sans-base); Noto Sans JP via opt-in @godxjp/ui/styles/fonts"
  base: 14px # --font-size-base; every step derives from it (ratio --font-size-ratio 1.1227)
  page-title: { size: "~20px (--heading-h1)", weight: 500, lineHeight: 1.25 }
  section-title: { size: "~17.6px (--heading-h2)", weight: 500, lineHeight: 1.25 }
  card-title: { size: "14px (--card-title-font-size)", weight: 500, lineHeight: 1.25 }
  body: { size: 14px, weight: 400, lineHeight: 1.7 } # --line-height-body
  caption: { size: "~12.5px (--font-size-xs)", weight: 400, lineHeight: 1.5 }
  weights: [400, 500, 700] # --font-weight-semibold is 500; there is no 600
  numerals: tabular # Text tabular / Badge tabular on every number column

rounded:
  base: 6px # --radius (rides --scaling)
  steps: "--radius-sm/md/lg/xl = radius / φ², / φ, ×1, × φ"
  card: "~9.7px (--card-radius = radius × φ)"
  pill: 9999px # --radius-pill: switch, radio, pill badge only

spacing:
  scale: "--space-1..24 = 4px steps (4, 8, 12, 16, 20, 24, 32, 40, 48, 80, 96)"
  stack: { xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 40px } # Flex direction="col" gap
  inline: { xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px } # Flex direction="row" gap
  page: { x: 24px, y: 24px } # --space-page-x / -y
  section: 16px # --space-section

density:
  axis: "AppProvider density / PageContainer density / data-density"
  compact: "--scaling 0.92 (data-heavy tables)"
  default: "--scaling 1 (control and row height 32px, --band-height-md)"
  comfortable: "--scaling 1.08 (login, public, touch)"
  touch-floor: 44px # --band-height-xl

components:
  button-primary:
    {
      background: "{colors.primary}",
      text: "{colors.on-primary}",
      height: "--control-height",
      radius: "{rounded.base}",
    }
  button-secondary: { variant: outline, edge: "{colors.control-edge}" }
  input:
    {
      background: "{colors.canvas}",
      edge: "{colors.control-edge}",
      focus: "edge recolours to {colors.ring}",
    }
  card:
    {
      background: "{colors.canvas}",
      border: "1px {colors.hairline}",
      shadow: "--shadow-sm",
      radius: "{rounded.card}",
      padding: "--card-space-inset",
    }
  table:
    { rule: "1px {colors.hairline}", rowHeight: "--table-row-height", header: "{colors.ink-muted}" }
  badge: { variant: outline, tone: "status role only" }
---

## Overview

A calm, dense tool for people who use it all day. The look is restrained Japanese enterprise: 渋み (low chroma), 間 (even breathing room), 簡素 (nothing that does not carry information). Distinctiveness comes from exact spacing, alignment and type, never from decoration.

The default `--primary` is a neutral ink (`240 6% 10%`). It is a placeholder, not a brand. Set the brand once with `--primary` in your theme, `tenantTheme('#RRGGBB')` from `@godxjp/ui/app`, a `data-brand` preset (`brand`, `crm`, `logistics`, `partner`, `slate`) or `@godxjp/ui/themes/godx.css`. `--ring` follows `--primary`.

## Colors

Colour is scarce. Most of the screen is canvas, ink and hairline.

- **Accent (`--primary`)**: the one primary action per view, focus ring, links, the selected nav item. Nothing else: no tinted headers, avatars, icons or section backgrounds.
- **Status (若竹 success, 山吹 warning, 群青 info, 朱 attention, 茜 destructive)**: only to state a status. Use `Badge status=…` (maps lifecycle keys to a fixed tone and icon) or `tone`. For status as text use the `--text-*` roles. Status colours are never re-themed per tenant.
- 朱 attention for urgency that is not destructive (late, overdue); 茜 only for loss (delete, failed, irreversible).
- `--accent` is the hover/selected surface, not a brand colour. `--muted` is for quiet fills.
- No gradients, glows or tinted page sections on app surfaces.

## Typography

- One family. Hierarchy from size steps, weight 400/500/700 and `ink` vs `ink-muted`. Page title ~20px; anything larger belongs on a marketing page. One exception: a long-form document title (Reader) is ~22px, two steps above its ~17.6px section headings, because one step reads flat there.
- Body 14px / 1.7. Captions and meta 12.5px muted. `Text tabular` on every number, time and money column.
- Japanese prose: `Text break="phrase"` so lines break between phrases.
- Copy is quiet and factual: no praise, no alarm, no emoji, no em dash in UI strings. A success message states the fact (「承認しました」).

## Layout & Density

- Hierarchy is spacing first: related items `gap="xs"`/`"sm"`, groups `"md"`, sections `"lg"`/`"xl"`. If every gap is the same, nothing is grouped.
- A section is a `Heading` plus spacing. Add a `Separator` when two sections must not read as one. Use a surface only when it is a real boundary (see Components).
- Pick one density per page up front: `compact` for review grids, `default` everywhere else, `comfortable` for login and touch.
- Content measure: forms and settings in `PageContainer measure="narrow"` or `"medium"`; tables use the full width.
- Spacing comes from component props (`gap`, `pad`) and tokens, never `p-4`/`mt-6` literals.

## Elevation

- Flat. A card is canvas with a 1px `--border` hairline and a near-invisible `--shadow-sm`; nothing heavier at rest.
- `--shadow-md`/`--shadow-lg` belong to things that float: popover, dropdown, dialog, sheet, toast.
- No hover lift on data cards. Depth never signals importance.

## Components

- **PageContainer** is the page shell: `title`, optional `subtitle`, `breadcrumb`, `extra` (page actions, primary last), `toolbar`, `footer`. Omit `title` only when the content draws the page's one `<h1>` (a document reader); PageContainer then renders no heading.
- **Card** only for a real boundary: a table with its own toolbar and pagination, a list of setting rows, a dashboard panel, a danger zone (`accent="destructive"`), a selectable item. Not around every section, never nested. `CardContent flush` for tables and row lists.
- **Toolbar** (+ `ToolbarGroup`) is the filter strip: search, labelled filters, clear-all, result count. It sits above the table, never in the page header.
- **DataTable** for lists: sort, selection with `DataTable.BulkActions`, density, empty/loading/error states. Row actions in one kebab `DropdownMenu`.
- **Descriptions** for record metadata. **ListRow** for setting rows (`trailing` holds the control).
- **Form + FormField** for every input; actions at the end of the form or in a sticky `PageContainer footer`. Create/edit is a page, not a dialog.
- **StatCard** only on a dashboard, always with `delta` that compares (vs last week, vs target). **EmptyState**: one sentence and at most one action.
- **Alert** only for something the user must act on now. **Badge** only for status; one per row at most.

## Admin Screen Anatomy

### List

Header: title, then `extra` with the primary create action last. Below it a `Toolbar` with search and filters. Then one Card holding the `DataTable` (`CardContent flush`) and `Pagination`. No KPI row, no subtitle that restates the title, no filter Card separate from the table.

### Detail

Header: record name as title, status `Badge` beside it, actions in `extra` (one primary). Body: `Descriptions` for metadata, then sections (Heading + content) for related records and history (`Timeline`). Use `Tabs` only when sections are independent and long. No Card per section; no icon beside every heading.

### Form

`Form` in a narrow measure; fields grouped by Heading sections, not Cards. Labels via `FormField`; helper text only when it adds information. One primary submit and a secondary cancel at the end, or in a sticky footer for long forms. Errors inline on the field plus `FormErrors` summary on submit.

### Editor

Edit (or create) one document or record. Header: record name as title, status `Badge` beside it, a subtitle only for a fact such as when it was last saved, and ONE primary Save in `extra` (`Button type="submit" form=<form id>`), Cancel `outline` before it. Body: one `Form` in a `SplitPane`: the main column holds the title field and a large body editor (`BlockEditor`, or `Textarea autoSize`); the aside holds metadata fields, read-only facts in `Descriptions`, and the change note last. No Card per field group, no second Save at the bottom.

### Reader

A long-form document to read. The document owns the page's one `<h1>`: `PageContainer` gets `breadcrumb` and `extra` (Edit) and no `title`. `LegalDocumentShell` draws the reading column: title two steps above the section headings, one metadata line (version, date with `dateKind="updated"` for a revision), the contents rail, and prose at a reading measure with `Text break="phrase"` for Japanese. No Card around the article, no subtitle, no icon per heading.

### Settings

Each section is a Heading (plus one muted line if it adds a fact) over its content: `Descriptions` for read-only values, `ListRow` rows in one `Card` with `CardContent flush` for controls (`trailing` holds the control). Separate sections with spacing or a `Separator`. Changes that apply instantly need no Save button; a page with a Save button applies nothing until saved. Destructive actions last, in one `Card accent="destructive"`, each behind `AlertDialog`.

### Dashboard

The only archetype with KPI tiles: at most four `StatCard`s, each with a comparison `delta` (use `inverse` when up is bad). Below, panels in `ResponsiveGrid`, each a Card with a title and one "view all" link: a work queue, a short table, a chart. Every number answers "compared to what".

### Approval queue

A list whose rows are decisions. Show requester, target, reason, submitted time; approve and reject reachable from the row (kebab or row buttons); with `DataTable`, also in `BulkActions`. Escalated or overdue rows get one status Badge, not a coloured row.

## Do's and Don'ts

### Do

- Lead with the data. The first thing below the header is the table, form or record.
- Use one `Button` default variant per view; the rest `outline` or `ghost`.
- Group by spacing, then by heading, then by Separator, and only then by Card.
- Write the subtitle only when it adds a fact the title does not (date, scope, count).
- Right-align numbers, `tabular` digits, ISO/`Intl` dates.

### Don't

- A subtitle that restates or translates the title.
- A StatCard row above a list or form.
- A Card around every section, each with Header + Title + Description.
- An EmptyState with a large icon inside a Card; an icon in every card header.
- Alert banners as page decoration; several Alerts stacked.
- Badge walls: a badge per cell, rainbow tones, badges for non-status labels.
- Uniform `gap` everywhere; arbitrary px spacing.
- Coloured avatars, tinted section backgrounds, gradients, hover lift.

## Responsive

- Check 390, 768 and 1280 wide. Nothing scrolls horizontally except a wide table inside its own container.
- `DataTable` hides `hiddenOnMobile` columns and can stack rows (`collapseBelow`); `Table preset="action-collection"` keeps the actions column visible at 390.
- `ResponsiveGrid` columns follow its container. `AppShell` turns the sidebar into a drawer on narrow screens.
- Header `extra` wraps under the title; a toolbar wraps its filters. Touch targets 44px at `comfortable`.

## Iteration Guide

1. Pick the archetype, call `get_exemplar` and build from that screen, not from memory.
2. Run `node node_modules/@godxjp/ui/scripts/ui-audit.mjs` until it is clean.
3. Screenshot at 390, 768 and 1280 next to the exemplar's live preview.
4. List the differences, fix the top 3 (structure before styling). Stop after 3 rounds.

## Known Gaps

- The default primary is neutral by design; a product without a brand colour looks monochrome until one is set.
- `ui-audit` checks primitives and tokens, not structure: a page can pass it and still show every Don't above.
- `card-per-section` counts Cards per file, so a screen split across components can pass with a Card around every section.
- Exemplar previews deploy on release tags, so they can lag `main`. On GitHub Pages a showcase URL answers HTTP 404 and renders through `404.html`, so open it in a browser; a plain fetch sees the 404.
- Dark theme (`data-theme="dark"`) is supported; the exemplars are reviewed in light.

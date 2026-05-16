# SKILL — Designing for dxs-kintai

When you build new HTML for this project, follow this checklist.

## Always

1. **Import the tokens.** Link `colors_and_type.css` (or `../colors_and_type.css`) at the top of every new HTML file. Never redeclare colors, type scale, spacing, radii, or shadows — use the CSS custom properties.
2. **Write with `var(--token)`** — never raw hex, never raw px for spacing. Element heights come from `--density-element*`; type from `--text-*`; colors from semantic roles (`--primary`, `--success`, …) **before** wa-iro decoratives.
3. **Pick density up front.** Default 32px for app surfaces; `data-density="compact"` for heavy tables; `data-density="comfortable"` for login / mobile-leaning surfaces. Don't mix mid-page.
4. **Set `lang="ja"` on the root** — it changes line-breaking and font hinting in the browser.

## Type rules

- **Body 14px / 1.7 leading** for content; 13px / 1.5 for dense tables. **Never 16/1.5.**
- **Headings 20 / 18 / 14 / 13** at weight 500 (h1–h4). Don't go bigger; this is JP enterprise, not a marketing landing page.
- **Three weights only**: 400, 500, 700. No 300 (kana strokes vanish), no 600 (ambiguous between 500 and 700).
- Use `font-variant-numeric: tabular-nums` for any numeric column or large stat (so digits align under 1.7 leading).

## Color rules

- **Primary** = trust + brand. Use for the single most important action per view, plus brand surfaces (active nav, focus ring, key chart line). Never for status.
- **Semantic** (success/warning/info/attention/danger) is fixed-mapping. Never substitute. **Prefer 朱 attention over 茜 danger** for non-destructive alerts (e.g., 遅刻 lateness) — the older "everything's red" pattern is dated.
- **Wa-iro** (藍, 群青, 若竹, 山吹, 朱…) is decorative — charts, tags, tenant theming. **Never** map a wa-iro hue to a semantic role outside the five canonical ones.
- **Backgrounds**: `--background` for the page, `--card` for raised surfaces, `--secondary` for muted fills (table heads, switch tracks), `--accent` for hover. Don't invent new neutrals.
- **Soft tints**: use `color-mix(in oklch, var(--primary) 15%, transparent)` for soft chip backgrounds — keeps chroma trail consistent.

## Spacing rules

- 4px grid. `gap`, `padding`, `margin` all use `--spacing-*` or 4-multiple px.
- Page header sticky at 48px (`--header-height`). Sidebar 256px (`--sidebar-width`).
- Cards: 1px border, no shadow at rest. Shadows climb only at popover (`--shadow-md`) and dialog (`--shadow-xl`).
- Tables: 32px header row, 36px body row at default density; 28/32 at compact.

## Component selection

When recreating a screen from `admin-web/`:

- Page chrome → mirror `<PageShell>` + `<PageHeader>` + `<PageContent>`. Check `app-sidebar.tsx` for the active nav-group structure.
- Filters → 4-column grid of label + Select/Input. See `/admin/[brand]/absences` for the canonical layout.
- Bulk actions → translucent toolbar above the table, `background: color-mix(in oklch, var(--primary) 5%, var(--card))`. Action buttons sit right-aligned.
- Empty states → `<Alert>` with a single calm sentence. No illustrations.
- Status badges → `chip-soft` (translucent tint) for transient state; solid `chip primary/success/...` for terminal state.

## Iconography

- `lucide-react` only, 1.5px stroke. 14/16/18/20px sizing tied to context (table/nav/button/header).
- Always `color: currentColor`. Never decorative fills.
- Inline SVG with `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-linecap="round"`, `stroke-linejoin="round"` — exactly how lucide ships them.

## Multi-tenant

- Default tenant uses the SmartHR-blue `--primary`. The Betoya tenant overrides via `[data-tenant="betoya"]` (Vietnam green #009444).
- Tenants override **only** `--primary`, `--ring`, `--foreground`. **Never** override semantic colors — a rejected badge must look the same across every brand.
- For employee surfaces, lift `data-tenant` to the body so the punch card / shift list pick up the brand color.

## Locale & copy

- Default `lang="ja"`. Surfaces with mostly Vietnamese staff (Betoya `/me/*`) use `lang="vi"`.
- Mixed-script labels are normal — `出勤 · Check In` and `早番 8:00–17:00` both appear in real screens.
- Never invent strings; pull from the i18n keys already present in `src/i18n/{ja,en,vi}.json`.

## Forbidden

- Aggressive gradients, rounded-pill cards, decorative emoji.
- Drop shadows under cards at rest.
- 16px / 1.5 body type (Western default — wrong for kanji density).
- Saturated brand colors (chroma > 0.18 in OKLCH).
- Inventing a new red — use 茜 destructive or 朱 attention.
- "Success" in green plus a confetti emoji. Quietly state the fact.
- Self-closing non-void elements; whitespace-separated UI siblings (use `display:flex; gap:`).

## Reference surfaces

When you need an example, look in this order:

1. `ui_kits/admin-web/UI Kit.html` — four assembled surfaces (HR dashboard, /me dashboard, approval workflow, login).
2. `preview/comp-*.html` — atomic component cards.
3. The actual source under `admin-web/src/app/` — read it before mocking.

If a screen you need isn't covered, mock it from the closest sibling and ask the user before inventing patterns.

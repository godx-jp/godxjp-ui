# @godxjp/ui — the consumer rules

Read this once; the audit enforces it. What the audit cannot see (how a screen is composed, what it
should look like) is in the package's `DESIGN.md`. Everything else in `docs/` is for contributors.

1. Load styles with `import "@godxjp/ui/styles.css"` (precompiled, no Tailwind needed) or `@import "@godxjp/ui/styles"` (Tailwind v4). Neither ships font files: fonts are opt-in since v32 (`pnpm add @fontsource/noto-sans-jp @fontsource/m-plus-2`, then `@import "@godxjp/ui/styles/fonts.css"` after the styles import; the GoDX preset does this for you). Never cherry-pick `*-layout.css`.
2. **Mount `<AppProvider defaultLocale="…">` once, at the root.** Without it the kit's OWN strings (dialog close/cancel/delete, counters, picker labels) fall to the resting locale (`<html lang>` when it names a registered locale, else `en`) and pickers to UTC (gh#1005). A development build now warns once when a kit component renders outside it; `syncI18nLocale(locale, fallback)` is the escape for an app that truly cannot mount the provider. Every page is `<PageContainer title extra footer>` (a `subtitle` only when it adds a fact the title does not); its sections are spaced by the page. Group items inside a section with `<Flex direction="col" gap>` or `<ResponsiveGrid>`.
3. No Tailwind layout on your own elements: no `flex`, `grid`, `gap-*`, `p-*`, `m-*`, `space-*`. Rows are `<Flex>` (default row), stacks are `<Flex direction="col">`, grids are `<ResponsiveGrid>`. A list's filters are ONE `<FilterBar>` that wraps at every width — never a sideways-scrolling strip of filters or filter chips; past 2–4 filters the rest go behind one "More filters" `Sheet` (cardinal rule #51, pattern `list-filters`, audit rules `filter-bar-no-overflow`, `filter-strip-no-scroll` and `hand-rolled-filter-bar`). Filters are packed at the start: never a hand-built `<Flex justify="between">` of FormFields above a table. Many conditions or an explicit 検索 button → `SearchForm` (pattern `search-form`); field × operator rows saved as views → pattern `condition-builder`.
4. No hand-rolled surfaces: no `rounded-* border bg-*` divs. A box is `Card`, a pill is `Badge`, a person is `Avatar`, a row is `ListRow`, a label/value pair is `Descriptions`, an empty area is `EmptyState`, a read-only sample of a colour the USER chose is `Swatch`. A LIST of those rows is `<Flex as="ul" marker="none" direction="col" gap="none">` with `<ListRow as="li">` children — `marker="none"` keeps the `<ul>`, the `<li>` semantics and the gap token while dropping the bullet and the indent. Never a raw `<ul>`/`<ol>` (it carries no gap token), never `<div role="list">` + `<div role="listitem">`, and never a wrapper around each row: the divider is `:not(:last-child)` among siblings, so a row alone in its own wrapper is always the last one and EVERY divider disappears silently. A bulleted prose list is the same `<Flex as="ul">` without `marker`.
5. Real controls only: `Button`, `Input`, `Select`, `Textarea`, `Checkbox`… never raw `<button>`/`<input>`; a labelled control lives in `<FormField label>`. A Select outside a form takes `width="auto"`. **A disabled control's reason is visible text, never a tooltip** — see below. **Fields live in a `<Form>`** — never a group of `FormField`s without one, never a hand-rolled `<Flex>` row of fields (a row that belongs together is `<Flex attached>` or `<Form columns>`). `layout="horizontal"` with `labelWidth`/`controlWidth` is the desktop default; `layout="vertical"` (labels above the inputs, as GOV.UK and the W3C WAI forms tutorial show) is equally valid when labels are long, the container is narrow, or the page asks one short question per row (gh#1496). Size each control for its content with `controlWidth` (GOV.UK text-input width: a port ~7rem, a short enum ~10rem). **GoDX house rule:** a form with three or more fields is its own page, not a Dialog (audit `dialog-form-too-big`) — a product decision for task focus and recovery, not a WCAG requirement. The audit rules are `formfield-needs-form`, `dialog-form-too-big` and `select-width-hint`. **A case the kit cannot express is an issue, not a hand-roll:** open it on godx-jp/godxjp-ui, use the nearest valid composition, and mark it `// TODO(godxjp-ui#<n>)` (gh#998). **One action row, one Button size:** every `Button` under one parent takes the same `size` — a missing size is `default`, and `icon-sm` pairs with `sm`, `icon-xs` with `xs`, `icon` with default. Never `size="sm"` beside a default Button. The audit rules are `mixed-button-size` (static) and `mixed-button-height` (visual-audit, within 0.5px) (gh#1084).
6. Text is `<Text>` / `<Heading>` with `tone`, `size`, `weight`, `truncate`, `mono` — not `className="text-muted-foreground font-semibold"`. A STANDALONE glyph is `<Icon as={Lock} size="sm" tone="muted" />` from `@godxjp/ui/general`: a bare lucide icon carries its own `width="24" height="24"` and only four places re-size it for you (`Button`, a `DropdownMenuItem`, a `TopbarItem`, a `ListRow` leading slot), so everywhere else — in a `Text`, a table cell, an `<a>` — it draws at 24px beside 14px type. `size-4` and `w-[16px]` are closed to you by rules 3 and 8, and `size={16}` hard-codes a number the theme owns; `Icon` puts the glyph on the `--icon-size-*` scale (`2xs…4xl`) instead, and is `aria-hidden` unless you give it a `label` (then it is `role="img"` with that name). The audit rule is `lucide-icon-needs-size`.
7. Colours are semantic tokens (`tone="destructive"`, `bg-primary`), never palette names, hex, or `bg-black` / `text-white`.
8. Sizes come from props (`size`, `width`, `columns`), never `w-[240px]` / `max-h-[420px]`.
9. Logical directions (`ms-`, `me-`, `start-`, `end-`) when a utility is unavoidable; never `ml-` / `left-`.
10. A `Card` whose whole body is a table gets `<CardContent flush>` — the table must touch the
    card's inner edge. A default `CardContent` pads 16px while the table draws its own border, so
    the table reads as a second box inside the card, and a wide one runs past the card entirely.
    (`flush` alone is enough: it drops the border, the radius and the inline padding. `tight` is a
    different knob — it governs the header band, not the body's edges.)
11. Run `npx @godxjp/ui audit --changed` before every review (the package bin, so it works from a workspace package whose `node_modules` is hoisted to the repo root); a browser sweep with `npx @godxjp/ui visual-audit <url>` on the running app is a separate, heavier run — do it when the work is a visual review, not on every change. Zero errors is the bar.

**Opting a deliberate exception out.** Name the rule; the block form also has to say why.

```tsx
// ui-audit-disable-line no-physical-direction
// ui-audit-disable-next-line no-physical-direction

// ui-audit-disable-begin no-utility-spacing — vendor widget ships its own grid, gh#123
const legacyClasses = ["gap-3", "p-2"];
// ui-audit-disable-end no-utility-spacing
```

A block with no reason (or under 12 characters of it) is ignored and the finding stands; an unclosed block runs to the end of the file. The class-shaped rules (`gap-*`, `bg-red-500`, `w-[37px]`, `pr-*`, `dark:*`) only read class expressions — a `className`/`class` attribute, a class-named binding (`baseClass`, `statusStyles`, `badgeVariants`) or a `cn()`/`clsx()`/`cva()` call — so product copy or an i18n value that happens to spell a utility is never a finding.

---

## Why a disabled control's reason cannot be a tooltip

A disabled `<button>` receives no pointer events and is not in the tab order, so an explanation
attached to it never reaches anyone. Measured in Chromium on this package's own tooltip page: the
same trigger produced **1** tooltip on hover while enabled and **0** while disabled, and calling
`focus()` on it left `document.activeElement` as `BODY` — so keyboard and touch get nothing either.
Hover-only would fail a touch user in any case.

This is not a gap waiting for a DS prop. The reason is required information, and required
information belongs on the screen:

- Render it as a `<Text size="xs" tone="muted">` line **before** the control, so a screen-reader or
  keyboard user meets the explanation ahead of the thing they cannot use (WCAG 2.2 · 1.3.2,
  meaningful sequence).
- `ServiceLauncherCard` already has this shape as a prop — `disabledReason`, rendered above the
  action — and it is the pattern to copy anywhere else.

If the control is disabled _pending something the user can fix_, prefer leaving it enabled and
explaining on submit: an inert control with a paragraph beside it is often a validation message
wearing a disguise.

## Floating content and toast imports

Use `DropdownMenuContent` only for menu collection nodes (`DropdownMenuItem`, checkbox/radio items, groups, labels and separators). Arbitrary notification headers, lists and links use `Popover` + `ListRow`. Development diagnostics and `dropdown-menu-non-menu-children` identify unsupported DOM children. Opaque components returning menu items remain supported.

`PopoverContent` scrolls automatically when the available viewport height caps it; focus rings stay inside the scroll boundary, including `flush` content.

Always use `import { toast } from "@godxjp/ui"` (or `@godxjp/ui/feedback`) with the kit's `Toaster`. Do not import toast directly from `sonner`: an app-installed version can create a separate toast store and calls never reach the kit's Toaster. The `no-direct-sonner-import` audit rule flags runtime imports. Sonner remains a dependency; no peer dependency migration is required.

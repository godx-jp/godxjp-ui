# @godxjp/ui — the ten consumer rules

Read this once; the audit enforces it. Everything else in `docs/` is for contributors.

1. Load styles with `@import "@godxjp/ui/styles"` (fonts bundled) or `@import "@godxjp/ui/styles/core"` (no fonts). Never cherry-pick `*-layout.css`.
2. Every page is `<PageContainer title subtitle extra footer>`; its sections are spaced by the page. Group items inside a section with `<Flex direction="col" gap>` or `<ResponsiveGrid>`.
3. No Tailwind layout on your own elements: no `flex`, `grid`, `gap-*`, `p-*`, `m-*`, `space-*`. Rows are `<Flex>` (default row), stacks are `<Flex direction="col">`, grids are `<ResponsiveGrid>`.
4. No hand-rolled surfaces: no `rounded-* border bg-*` divs. A box is `Card`, a pill is `Badge`, a person is `Avatar`, a row is `ListRow`, a label/value pair is `Descriptions`, an empty area is `EmptyState`.
5. Real controls only: `Button`, `Input`, `Select`, `Textarea`, `Checkbox`… never raw `<button>`/`<input>`; a labelled control lives in `<FormField label>`. A Select outside a form takes `width="auto"`. **A disabled control's reason is visible text, never a tooltip** — see below.
6. Text is `<Text>` / `<Heading>` with `tone`, `size`, `weight`, `truncate`, `mono` — not `className="text-muted-foreground font-semibold"`.
7. Colours are semantic tokens (`tone="destructive"`, `bg-primary`), never palette names, hex, or `bg-black` / `text-white`.
8. Sizes come from props (`size`, `width`, `columns`), never `w-[240px]` / `max-h-[420px]`.
9. Logical directions (`ms-`, `me-`, `start-`, `end-`) when a utility is unavoidable; never `ml-` / `left-`.
10. A `Card` whose whole body is a table gets `<CardContent flush>` — the table must touch the
    card's inner edge. A default `CardContent` pads 16px while the table draws its own border, so
    the table reads as a second box inside the card, and a wide one runs past the card entirely.
    (`flush` alone is enough: it drops the border, the radius and the inline padding. `tight` is a
    different knob — it governs the header band, not the body's edges.)
11. Run `node node_modules/@godxjp/ui/scripts/ui-audit.mjs --changed` before every review; a browser sweep with `visual-audit.mjs` is a separate, heavier run — do it when the work is a visual review, not on every change; `visual-audit.mjs <url>` on the running app. Zero errors is the bar.

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

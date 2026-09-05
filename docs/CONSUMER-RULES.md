# @godxjp/ui — the ten consumer rules

Read this once; the audit enforces it. Everything else in `docs/` is for contributors.

1. Load styles with `@import "@godxjp/ui/styles"` (fonts bundled) or `@import "@godxjp/ui/styles/core"` (no fonts). Never cherry-pick `*-layout.css`.
2. Every page is `<PageContainer title subtitle extra footer>`; its sections are spaced by the page. Group items inside a section with `<Flex direction="col" gap>` or `<ResponsiveGrid>`.
3. No Tailwind layout on your own elements: no `flex`, `grid`, `gap-*`, `p-*`, `m-*`, `space-*`. Rows are `<Flex>` (default row), stacks are `<Flex direction="col">`, grids are `<ResponsiveGrid>`.
4. No hand-rolled surfaces: no `rounded-* border bg-*` divs. A box is `Card`, a pill is `Badge`, a person is `Avatar`, a row is `ListRow`, a label/value pair is `Descriptions`, an empty area is `EmptyState`.
5. Real controls only: `Button`, `Input`, `Select`, `Textarea`, `Checkbox`… never raw `<button>`/`<input>`; a labelled control lives in `<FormField label>`. A Select outside a form takes `width="auto"`.
6. Text is `<Text>` / `<Heading>` with `tone`, `size`, `weight`, `truncate`, `mono` — not `className="text-muted-foreground font-semibold"`.
7. Colours are semantic tokens (`tone="destructive"`, `bg-primary`), never palette names, hex, or `bg-black` / `text-white`.
8. Sizes come from props (`size`, `width`, `columns`), never `w-[240px]` / `max-h-[420px]`.
9. Logical directions (`ms-`, `me-`, `start-`, `end-`) when a utility is unavoidable; never `ml-` / `left-`.
10. Run `node node_modules/@godxjp/ui/scripts/ui-audit.mjs <dir>` before every review; then `visual-audit.mjs <url>` on the running app. Zero errors is the bar.

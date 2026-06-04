# ADV-SYSTEMATIZE Research Notes

## Where raw spacing currently lives (preview-only)

- `preview/src/preview.css:331-342` sets `.doc-page` and `.preview-example-page` base paddings, so overview/examples spacing is currently chrome-level CSS, not `Stack`/`Inline` primitives.
- `preview/src/preview.css:344-405` and `364-466` set heading/body/list/table spacing with fixed `margin` blocks.
- `preview/src/preview.css:492-507`, `517-563`, `606-614`, and `657-686` hard-code canvas/toolbar margins/gaps for demo presentation.
- `preview/src/preview.css:948-965` and `996-1005` define stage/frame spacing.
- `preview/src/App.tsx:256-343` and `314-319` render story content into `.doc-page` / `.preview-example-page` wrappers, confirming the CSS spacing layer is part of the active layout path.

## Exact scenario screens to build (existing components only)

1. **CRM Customer Hub**
   - Components: `PageContainer`, `PageInset`, `Stack`, `Inline`, `Button`, `FilterBar`, `FilterGroup`, `SearchInput`, `Select`, `Input`, `DataTable`, `DataTable.Toolbar`, `DataTable.Content`, `DataTable.Pagination`, `Pagination`, `Badge`, `Descriptions`, `Breadcrumb`.
2. **Agent Operations Dashboard**
   - Components: `AppShell`, `Sidebar`, `Topbar`, `SplitPane`, `PageContainer`, `Stack`, `ResponsiveGrid`, `StatCard`, `Card`, `CardContent`, `Timeline`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Progress`, `TreeList`.
3. **Shipment/Order Tracking Board**
   - Components: `PageContainer`, `Breadcrumb`, `Stack`, `Inline`, `ResponsiveGrid`, `Card`, `CardContent`, `DataTable`, `FilterBar`, `FilterGroup`, `SearchInput`, `Select`, `Checkbox`, `Slider`, `Timeline`, `Accordion`.
4. **Profile & Settings Workbench**
   - Components: `PageContainer`, `Stack`, `Inline`, `FormField`, `Input`, `Textarea`, `Select`, `Switch`, `DatePicker`, `PasswordInput`, `Rating`, `Button`, `Drawer`, `Toaster`.

## Shared spacing shell recipe (single source)

- `ScenarioScreenShell` (shared wrapper) => `<PageContainer variant="flush" density="default">`
- Section rhythm => `<Stack gap="xl">` at page level, `<Stack gap="lg">` for major sections.
- Horizontal row rhythm => `<Inline gap="md">` for actions and controls; `<Inline gap="sm">` for metadata/compact groups.
- Dense card/group rhythm => `<ResponsiveGrid columns={...}>` + `<Card><CardContent>` + inner `<Stack gap="sm">`.
- Detail blocks => `<CardContent solo>` + nested `<Stack gap="sm">` for dense content.
- Ban all ad-hoc spacing tokens in examples (`p-*`, `gap-*`, `m-*`, `space-*`, `<br>` in layout flow) and use only these primitives for example-page composition.

## Real-image source

- Use neutral, license-safe image endpoint for all generated story imagery:
  - `https://picsum.photos/seed/<slug>/640/360` for hero/banner cards.
  - `https://picsum.photos/seed/<slug>/96/96` for avatar-like and thumbnail visuals.
- Keep image URLs in `examples/fixtures/demo-content.ts` so all stories share stable assets and avoid repeating local image wrappers.

## Guard (if relevant)

- Add a CI guard that parses every `examples/**/*.preview.tsx` and fails on forbidden imports:
  - **forbidden**: `../../src/...`, `./...` / `../...` imports that resolve to `components`, `layout`, `data-display`, `data-entry`, `feedback`, `navigation`, `general`, or `form`.
  - **allowed**: `@godxjp/ui/*`, fixture/shared helper files under `examples/fixtures`, and Markdown/docs data imports used as static config.
- Hook guard into `verify` or `preview:build` pipeline:
  - e.g., add `pnpm check:preview-imports` and run it before `pnpm preview:build`.
- This is the anti-rot mechanism; it is what prevents local components/wrappers (“chế cháo”) from returning after the one-time cleanup.

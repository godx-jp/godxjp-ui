# ADV-POLISH Research Notes

## Where raw spacing lives (preview/)

- `preview/src/preview.css:331-342` defines `.doc-page` and `.preview-example-page` with hardcoded paddings for the entire overview canvas.
- `preview/src/preview.css:344-365` and `369-399` apply fixed `margin` ladders on headers/paragraphs instead of component-driven rhythm.
- `preview/src/preview.css:398-425` and `404-423` keep list/code/hierarchy spacing in CSS margins.
- `preview/src/frame.css:27-33` and `preview/src/frame.css:38-42` hardcode demo-frame margin/box layout offsets.
- `preview/src/App.tsx:256-343` wraps every doc/example in static `<article className="doc-page">` / `<div className="preview-example-page">` and fixed header sections instead of a shared primitive shell.
- `preview/src/demo-block.tsx:27-37` and `39-58` show fixed footer/canvas wrapping, confirming spacing is controlled in shell, not just story content.

## Exact realistic scenario screens to enrich (existing components only)

1. `Dashboard · ops overview` — enrich existing `examples/screens/AgentPortal.preview.tsx:922-924`
   - Components: `AppShell`, `Sidebar`, `Topbar`, `PageContainer`, `PageInset`, `SplitPane`, `ResponsiveGrid`, `StatCard`, `Card`, `CardHeader`, `CardDescription`, `CardContent`, `Timeline`, `FilterBar`, `FilterGroup`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Progress`, `Badge`, `Button`, `Inline`, `Stack`.
   - Build path: keep current `PortalShell` + `DashboardLayout`, replace only inner section composition with stricter `Stack`/`Inline` rhythm and seeded mock rows.

2. `CustomerList` (enrich existing) — `examples/layout/PageContainer.preview.tsx:184-187`
   - Components: `PageContainer`, `PageInset`, `FilterBar`, `FilterGroup`, `SearchInput`, `Select`, `Input`, `DataTable`, `DataTable.Toolbar`, `DataTable.BulkActions`, `Badge`, `Button`, `Pagination`.
   - Build path: convert current compact list into realistic CRM list with sortable columns and realistic footer summary using existing `customers` fixture data.

3. `Customer detail form shell` — `examples/layout/PageContainer.preview.tsx:189-231`
   - Components: `PageContainer`, `Inline`, `Badge`, `Breadcrumb`, `Descriptions`, `Button`, `Card`, `Stack`.
   - Build path: expand to complete profile detail page with invoice/contact metadata + action panel and status chips.

4. `Edit form with footer` — `examples/layout/PageContainer.preview.tsx:233-252`
   - Components: `PageContainer`, `Input`, `Button`, `Inline`, `Stack`, `Card`.
   - Build path: flesh into end-to-end order-edit workflow with 3 logical sections, validation text blocks, and action state.

5. `Receive + Pack / Package Detail / Track timeline` — `examples/screens/AgentPortal.preview.tsx:927-944`
   - Components: same as Screen 1 plus `TreeList`, `Descriptions`, `SearchInput`, `Select`, `Input`, `Breadcrumb`.
   - Build path: turn each into distinct realistic “journey screens” with realistic record references, attachments, and status transitions.

## Spacing recipe for POLISH pass (single shared pattern)

- Replace prose-wrapper spacing with a shared page pattern in existing examples:
  - `PageContainer` as shell (`variant="flush"` for full-width canvas, or default for standard list pages).
  - Top-level rhythm: `<Stack gap="xl">`.
  - Section rhythm: `<Stack gap="lg">`.
  - Action rows and metadata lines: `<Inline gap="sm">` / `<Inline gap="md">`.
  - Multi-card dashboards/cards: `<ResponsiveGrid columns={2|3|4}>`.
  - Dense list/detail shells: `<Card><CardContent><Stack gap="sm"> ...</Stack></CardContent></Card>`.
- Keep only one shared in-app example skeleton and reuse across existing files; do not add a new framework or file-level abstraction.
- `Flex`-based foundation supports this without custom spacing classes (`src/components/layout/flex.tsx:13-30`, `src/components/layout/stack.tsx:7-8`, `src/components/layout/inline.tsx:7-8`).

## Real-image source (neutral)

- Avatar / person card: `https://picsum.photos/seed/godxjp-user-01/96/96`
- Shipment thumbnails: `https://picsum.photos/seed/godxjp-shipment/320/180`
- Dashboard hero card: `https://picsum.photos/seed/godxjp-dashboard/1200/420`
- Use with existing `Avatar` / `AvatarImage` + `CardCover` composition in enriched scenario blocks.

## Guard (if relevant)

- Keep a lightweight import check focused on spacing/architecture regression:
  - fail when `examples/**/*.preview.tsx` contains raw layout spacing utilities (e.g., class names matching `m-`, `mt-`, `mb-`, `gap-`, `space-`, inline `style` objects with margin/padding) in root-level shell composition.
  - enforce that scenario screens continue to use `PageContainer`, `Card`, `Stack`, `Inline`, `ResponsiveGrid`, `SplitPane`, `AppShell` and existing child components from `snapshot.md` only.

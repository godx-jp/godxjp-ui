# ADV-RECIPES Research (r0)

## Raw spacing location in preview/
- `preview/src/preview.css:331-346` uses fixed shell padding on `.doc-page` and `.preview-example-page` (`padding: 24px 32px 32px`) instead of layout primitives.
- `preview/src/preview.css:344-375`, `364-369`, `398-417`, `404-423` sets many `margin` values manually for headings, paragraphs, lists, and code blocks in overview prose.
- `preview/src/preview.css:492-514` and `606-655` hardcode demo and frame spacing via padding/gaps for overview canvas and frame chrome.
- `preview/src/App.tsx:231-334` renders overview/story structure with static `<article>`/`<header>` wrappers and utility classes, not a shared `PageContainer` + `Card` wrapper with stack spacing.
- 00-Topic.md:7-10 explicitly names this as the issue and calls out raw `margins`/line-break spacing as the first defect.

## Exact realistic scenario screens to add (existing components only)
All screens must be composed from components listed in `context/snapshot.md:2-3`.

1) `SignIn` screen
- Components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `Input`, `PasswordInput`, `Checkbox`, `Button`, `Separator`, `Inline`, `Stack`, `Alert` (optional), `Link` via `button` fallback.
- Structure: `PageContainer`-level shell for login title/meta, center card with stacked fields, inline remember/forgot actions, and full-width primary action button.
- Data/labels: use fake account + route strings only (no PII).

2) `SettingsProfile` screen
- Components: `PageContainer`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `FormField`, `Input`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `Switch`, `ToggleGroup`, `Button`, `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Divider`/`Separator`, `Stack`, `Inline`.
- Structure: settings grouped by tabs (`Account`, `Preferences`, `Security`, `Billing`), with compact setting cards and per-section save actions.
- Data: static toggles/select options + mock plan/billing labels.

3) `InvoiceOrdersTable` screen
- Components: `PageContainer`, `PageHeader` (optional), `FilterBar`, `FilterGroup`, `SearchInput`, `Select`, `Input`, `DataTable`, `DataTable.Toolbar`, `DataTable.DensityToggle`, `DataTable.Content`, `Badge`, `Button`, `Table`, `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Timeline`, `Descriptions`, `Stack`, `Inline`, `Pagination`.
- Structure: filters on top, bulk action toolbar, table body with statuses and actions, plus right-side summary card.
- This is the same component class as users expect from real ERP/order UIs and directly matches the “invoice/orders table” ask.

4) `Dashboard` screen
- Components: `AppShell`, `Sidebar`, `Topbar`, `PageContainer`, `SplitPane`, `ResponsiveGrid`, `StatCard`, `Timeline`, `DataTable`, `Card`, `CardHeader`, `CardContent`, `Progress`, `Badge`, `Tab` system, `Button`, `Stack`, `Inline`.
- Structure: existing `AppShell` composition pattern from `examples/screens/AgentPortal.preview.tsx:359-475` and `39-119` proves this full page assembly works entirely with shipped primitives.
- Keep one canonical shell and 2–3 core KPI cards + timeline + table.

5) `Profile` screen
- Components: `PageContainer`, `Card`, `CardHeader`, `CardContent`, `Descriptions`, `Avatar`, `AvatarImage`, `AvatarFallback`, `Tabs`, `Timeline`, `TagInput`/`Input`, `Button`, `Stack`, `Inline`, `Collapsible` (optional), `Switch`, `Badge`.
- Structure: header with avatar + identity block, profile metadata list, activity/timeline, security block, and quick action buttons.

## Spacing recipe (what to use in overview + screens)
- Use `PageContainer` as the canonical page shell for full-page examples.
- Use `Card`/`CardHeader`/`CardContent` around dense blocks.
- Use `Stack`/`Inline` for vertical/horizontal rhythm (`gap` tokens: `xs`, `sm`, `md`, `lg`).
- Use `ResponsiveGrid` for KPI/summary blocks.
- Use `SplitPane` for two-column story layouts that already appear in existing screen samples.
- In preview wrappers, replace hardcoded margin-based spacing from prose classes with primitive wrappers around content sections.
- Source APIs: `Stack` is a `Flex` wrapper (`src/components/layout/stack.tsx:7-8`), `Inline` is `Flex` (`src/components/layout/inline.tsx:7-8`), `Flex` uses tokenized `gap` classes (`src/components/layout/flex.tsx:13-30`), `PageContainer` provides canonical header/body regions (`src/components/layout/page-container.tsx:25-91`).

## Real-image source
- Use a neutral, license-safe source (external, not brand/product imagery):
  - Avatar: `https://picsum.photos/seed/godxjp-profile/320/320`
  - Profile banner/background: `https://picsum.photos/seed/godxjp-banner/1200/420`
  - Invoice screenshot placeholder: `https://picsum.photos/seed/godxjp-invoice/960/420`
- If remote source policy becomes strict, replace with committed neutral fixtures under `examples/fixtures` (new assets only if permitted).

## Guard (if relevant)
- Add/keep a non-breaking lint check in CI-like preview flow: every `*.preview.tsx` in `examples/` must import only `@godxjp/ui` primitives from `src/components` and render layout through `Stack`/`Inline`/`ResponsiveGrid`/`Flex`/`PageContainer`/`Card` rather than hand-rolled `className` spacing utilities.
- Existing hard rule already requires this (`context/snapshot.md:2-3`, 00-Topic.md:14-15), so this guard is directly enforceable without broad architecture changes.

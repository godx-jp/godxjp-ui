/**
 * Component catalog — the REAL published `@godxjp/ui` v6 primitive surface.
 * The MCP bundles this so an agent can author pages with the actual API
 * (PageContainer, Flex, ResponsiveGrid, DataTable + ColumnDef, Badge,
 * FormField, Select, Dialog, Toolbar, …) instead of guessing.
 *
 * Each entry maps to a real export. Import via the subpath in every example,
 * e.g. `import { DataTable } from "@godxjp/ui/data-display"`.
 *
 * Each entry carries:
 *   - `name`        — canonical export name
 *   - `group`       — entry-point group
 *   - `tagline`     — one-line elevator pitch
 *   - `props`       — most-used real props with type + description
 *   - `example`     — copy-paste-ready JSX using the real API
 *   - `storyPath`   — relative path under `src/stories/`
 *   - `rules`       — cardinal rules relevant to this primitive
 */

export type ComponentGroup =
  | "general"
  | "layout"
  | "data-display"
  | "data-entry"
  | "feedback"
  | "navigation"
  | "composites"
  | "shell"
  | "providers";

export interface ComponentProp {
  name: string;
  type: string;
  required?: boolean;
  description: string;
  defaultValue?: string;
}

export interface ComponentEntry {
  name: string;
  group: ComponentGroup;
  /** Import subpath when it differs from the group convention (e.g. query helpers → "@godxjp/ui/query"). */
  importPath?: string;
  tagline: string;
  props: ComponentProp[];
  /** Detailed how-to-use guidance — DO/DON'T bullets (composition, controlled state, form name, a11y). */
  usage?: string[];
  /** Concrete scenarios this component is the right choice for. */
  useCases?: string[];
  /** Sibling/replacement components it is confused with, and when to pick each. */
  related?: string[];
  /** Deprecated components stay catalogued (so agents are steered to the replacement) but are flagged. */
  deprecated?: boolean;
  example: string;
  docPath?: string;
  storyPath: string;
  rules: number[];
}

export const COMPONENTS: ComponentEntry[] = [
  // ─── layout ─────────────────────────────────────────────────────────────
  {
    name: "PageContainer",
    group: "layout",
    tagline:
      "Mandatory page shell — EVERY page wraps its content in PageContainer (title/subtitle/extra/footer/breadcrumb).",
    props: [
      {
        name: "title",
        type: "string",
        required: true,
        description: "Page heading rendered as <h1>.",
      },
      { name: "subtitle", type: "string", description: "Secondary line beneath the title." },
      {
        name: "status",
        type: "ReactNode",
        description:
          'Status/meta band beside the title (StatusBadge, environment tag, "updated …" meta). Sits on the title line at the token-owned --page-header-status-gap and wraps UNDER the title on compact viewports. Part of the canonical page-header contract (gh#255) — never hand-lay a badge next to the <h1>.',
      },
      {
        name: "extra",
        type: "ReactNode",
        description: "Action buttons / controls rendered right of the title row.",
      },
      {
        name: "footer",
        type: "ReactNode",
        description: "Content area pinned below the page body.",
      },
      {
        name: "breadcrumb",
        type: "BreadcrumbItemProp[]",
        description: "Ordered trail of { label, to? } segments above the title.",
      },
      {
        name: "breadcrumbAriaLabel",
        type: "string",
        description:
          'Override the breadcrumb nav landmark\'s accessible name (defaults to a localized "Breadcrumb"). Required when more than one PageContainer (each with its own breadcrumb) renders on the same page/view — two nav landmarks sharing one name/role fail landmark-unique.',
      },
      {
        name: "variant",
        type: '"default" | "narrow" | "flush" | "ghost"',
        defaultValue: '"default"',
        description: "Page shell layout; flush removes padding for full-bleed content.",
      },
      {
        name: "density",
        type: '"compact" | "default" | "comfortable"',
        defaultValue: '"default"',
        description: "Spacing density across the page subtree.",
      },
      {
        name: "preset",
        type: '"default" | "admin-collection"',
        defaultValue: '"default"',
        description:
          'Whole-page semantic composition. "admin-collection" owns header-to-toolbar rhythm, collection search measure, control height and table density for the subtree through themeable tokens.',
      },
      {
        name: "headerLayout",
        type: '"stack" | "responsive-inline"',
        defaultValue: '"stack"',
        description:
          'How the title band and `extra` share the header row BELOW the 640px step. "stack" (default) drops `extra` onto its own full-width line under the subtitle. "responsive-inline" keeps it beside the title at the token-owned --page-header-extra-measure (11rem) and lets the title/subtitle wrap — use it for ONE compact control (a search field, a single primary action) that must stay on the title row at 390px. At >=640px the two arrangements are identical.',
      },
      {
        name: "measure",
        type: '"default" | "narrow" | "medium"',
        defaultValue: '"default"',
        description:
          'Bounded page MEASURE shared by the header AND the body — a third axis, ORTHOGONAL to `variant` (chrome) and `headerLayout` (arrangement). "default" applies no cap (the historical fluid page). "narrow" (--page-measure-narrow, 42rem outer → 624px visible surface) and "medium" (--page-measure-medium, 48rem outer → 720px visible surface) cap BOTH bands, so a header `extra` action ends flush with the body surface instead of stranded at the page edge — unlike variant="narrow", which caps only the body. The package-owned page gutters sit INSIDE the cap, and it is a max, so a 390px viewport stays fluid (358px surface at the 16px compact gutter). The footer is intentionally not capped (its border/background is page chrome when `stickyFooter` pins it).',
      },
      {
        name: "stickyFooter",
        type: "boolean",
        defaultValue: "false",
        description: 'Pin footer to viewport bottom on scroll — pairs with variant="narrow".',
      },
      {
        name: "footerReveal",
        type: '"always" | "onScroll"',
        defaultValue: '"always"',
        description:
          'When the footer is sticky, control WHEN it shows. "always" keeps it pinned the whole time; "onScroll" hides it until the header scrolls out of view then slides it up — the standard edit/create save bar. Stays mounted (no reflow → no jitter).',
      },
      {
        name: "fill",
        type: "boolean",
        defaultValue: "false",
        description:
          "Grow the body to fill the remaining shell height. Default false = top-packed, content-height (short pages leave no stretched void). Enable for a full-height DataTable, SplitPane, or a chat surface.",
      },
      {
        name: "headerLoading",
        type: "boolean",
        defaultValue: "false",
        description:
          "Skeletonise the TITLE BAND only while the page's record resolves (title/subtitle placeholders + aria-busy; the <h1> stays in the outline with an sr-only accessible name). Breadcrumbs and `extra` stay live — they come from the route, not the record. This is not a page-wide loading flag; use DataState for the body.",
      },
      {
        name: "linkComponent",
        type: "React.ElementType",
        description:
          "Link component used for breadcrumb / header links (e.g. an Inertia or React Router `Link`). Defaults to a native `<a>`.",
      },
    ],
    usage: [
      "DO: Always wrap every page's content in PageContainer — it is the mandatory page shell. Pass `title` (required, rendered as `<h1>`) for every page; omitting it leaves the page without an accessible heading.",
      "CANONICAL PAGE-HEADER CONTRACT (gh#255): PageContainer's embedded header IS the DXS `PageHeader` — there is deliberately NO separate PageHeader export, so the page header cannot be re-created or nested. It owns breadcrumbs (`breadcrumb`), title (`title`), subtitle/description (`subtitle`), status/meta (`status`), actions (`extra`) and responsive overflow (`headerLayout` + `measure`). Loading/error/denied are compositions of siblings, never hand-rolls: skeleton `title`/`subtitle` content or `SkeletonDetail` body while a detail loads; `ErrorSurface` (from @godxjp/ui/layout) REPLACES the page for denied (403) / not-found (404) / failed (5xx) whole-page states; `Alert.QueryError` / `DataState` own an in-body query failure.",
      "DO: Use the `extra` prop (not a sibling div, not a wrapper) for action buttons or controls that sit right of the title row — e.g. `extra={<Button>新規作成</Button>}`. Use the `footer` prop for a pinned action bar below the body (e.g. Save/Cancel on a form page); combine with `stickyFooter` to pin it to the viewport bottom on scroll.",
      "DO: Use `variant='flush'` when the page body contains a full-bleed component like DataTable. Inside a flush container, wrap any padded strips (Toolbar, intro text) in `<PageContainer.Inset>` to align them with the header. Never add manual `px-*` or `p-*` padding to compensate — use PageContainer.Inset.",
      "DO: Pass `breadcrumb` as an ordered array of `{ label, to? }` objects from root to current page. The last item is automatically rendered without a link and receives `aria-current='page'`; earlier items with `to` become router `<Link>` elements. Never hand-roll a breadcrumb nav inside a PageContainer.",
      "DON'T: Use `density` to change individual control sizes — it cascades spacing across the entire page subtree. Set it once per page (e.g. `density='compact'` for data-dense list pages) and let all child components inherit it. Do not apply density classes manually.",
      "DO: Use `preset='admin-collection'` for canonical Admin list pages. It owns the toolbar/search/control/table composition once at PageContainer level; do not repeat widths, heights, cell padding or media queries on child fields and rows.",
      "DO: Use `subtitle` (not `description`) and `extra` (not `actions`) — those are the canonical page-header names. If you see `description` / `actions` in old code, migrate them.",
      "DO: Leave `fill` off (the default) for ordinary pages — the body is content-height and top-packed, so a short page on a tall viewport leaves no stretched empty void below the content (the page background simply spans the shell). Only set `fill` when the body itself should occupy the full remaining height: a full-height DataTable, a SplitPane, or a chat surface whose message list scrolls and whose composer is pinned to the bottom via `footer` + `stickyFooter`. DON'T add a manual `min-h-screen` / `flex-1` wrapper or a spacer div to fight or fake this.",
      'DO: Reach for `headerLayout="responsive-inline"` when a SINGLE compact header control (a member search, one primary action) must stay beside the title at 390px instead of wrapping under the subtitle. Its measure is the token `--page-header-extra-measure` (11rem) — never a consumer `w-[176px]` or a media query in app CSS. Keep the default `stack` when `extra` holds a toolbar of several buttons; squeezing those into the compact measure only makes them wrap in a narrower box.',
      "DO: Know the header draws NO bottom divider by default — it is governed by the semantic token `--page-header-divider` (default `none`). A service theme opts in once, globally, with `--page-header-divider: 1px solid hsl(var(--border));` in its theme CSS. Never re-create the divider with a `border-b` utility on the header or a `<Separator>` under the title; `variant='ghost'` stays divider-less regardless of the token.",
      'DO: Bound a readable/feed page with `measure="medium"` (720px visible surface) or `measure="narrow"` (624px) — NEVER a page-local `max-w-[720px]`, a wrapper div, or a consumer CSS variable override. `measure` caps the HEADER and the BODY together, which is the whole point: with `variant="narrow"` the header action stays out at the page edge while the body is 624px, so the action and the card do not share an end edge. Retune the presets once in a service theme via `--page-measure-narrow` / `--page-measure-medium`.',
      'DO: Compose the axes — `variant="ghost" measure="medium" headerLayout="responsive-inline"` is the canonical quiet notification/inbox feed: ghost owns the quiet header rhythm (no divider, no header bottom pad, tighter title→body gap), `measure` owns the shared 720px measure, `headerLayout` keeps one compact control on the title row at 390px. They are independent props precisely so chrome and measure are no longer one variant axis. DON\'T stack `variant="narrow"` on top of `measure` — the measure rule simply wins on the body (verified in Chromium: variant="narrow" + measure="medium" resolves the body to 768px, not the intersection), so the `variant="narrow"` is dead weight that only misleads the next reader. `variant="narrow"` is the legacy body-only cap; `measure="narrow"` is the same 624px surface with the header included.',
    ],
    useCases: [
      "A master list page (e.g. invoices, journal entries, customers) where the header holds the page title, a 'New Invoice' button in `extra`, a breadcrumb trail, and a full-bleed DataTable as the body — use `variant='flush'` + `<PageContainer.Inset>` for the Toolbar above the table.",
      "A detail / edit form page where the footer holds Save and Cancel buttons — use `footer={<Flex direction='row' justify='between' className='w-full'><Button variant='outline'>削除</Button><Button>保存</Button></Flex>}` with `stickyFooter` + `footerReveal='onScroll'` so the save bar slides up only once the header (and its actions) scroll out of view — the canonical edit/create pattern.",
      "A settings or narrow-form page (e.g. account profile, entity configuration) where `variant='narrow'` constrains content to a readable column width and `stickyFooter` pins the submit bar.",
      "A dashboard page with KPI cards and chart sections — use `variant='default'` with `children={<Flex direction='col' gap='lg'>…</Flex>}` to vertically stack multiple Card/StatCard sections beneath the page title.",
      "Any deep-nav page in a multi-level admin (e.g. Accounting > Ledger > Journal Entry #42) where a 3-segment breadcrumb trail provides back-navigation without browser history dependence.",
      "A high-density data reconciliation page where an analyst needs to see maximum rows — use `density='compact'` to tighten all spacing across the DataTable, Toolbar, and controls in a single prop.",
      "A chat / messaging detail page where the message list should scroll inside the page and the composer stays pinned at the bottom — use `fill` so the body occupies the full shell height, with `footer={<Composer/>}` + `stickyFooter`. Without `fill` the page would top-pack and the composer would float mid-screen on a tall viewport.",
    ],
    related: [
      "PageContainer.Inset — use INSIDE a `variant='flush'` PageContainer to re-introduce horizontal padding for strips like Toolbar or intro text that should align with the page header, while the surrounding DataTable stays full-bleed. Not a standalone page shell.",
      "PageContainer — always use PageContainer for new pages; it supports `children`, `footer`, `variant`, `density`, `stickyFooter`, and `fill`. Legacy code using the old prop names (`description` → `subtitle`, `actions` → `extra`) should be migrated to PageContainer.",
      "AppShell — the outer shell that owns the sidebar/topbar layout grid; PageContainer lives inside AppShell's `children` slot. Do not put AppShell inside PageContainer — the nesting order is AppShell → PageContainer.",
      "SplitPane — use instead of PageContainer when the page body needs a fixed-width aside panel alongside main content (e.g. a detail drawer next to a list). PageContainer has no aside slot; SplitPane fills that gap and can itself be placed inside PageContainer's children.",
    ],
    example: `import { PageContainer, Flex } from "@godxjp/ui/layout";
import { Button } from "@godxjp/ui/general";

export default function OrdersPage() {
  return (
    <PageContainer
      title="注文一覧"
      subtitle="直近30日間の受注データ"
      breadcrumb={[{ label: "ホーム", to: "/" }, { label: "注文一覧" }]}
      extra={<Button>新規注文</Button>}
    >
      <Flex direction="col" gap="lg">{/* page content */}</Flex>
    </PageContainer>
  );
}`,
    storyPath: "layout/PageContainer.stories.tsx",
    rules: [23],
  },
  {
    name: "Flex",
    group: "layout",
    tagline:
      "Token-spaced flex primitive with explicit direction, alignment, justification, and wrapping controls.",
    props: [
      {
        name: "direction",
        type: '"row" | "col"',
        defaultValue: '"row"',
        description:
          "Main axis direction. Defaults to the CSS platform initial value, row; use col explicitly for vertical stacks.",
      },
      {
        name: "gap",
        type: '"xs" | "sm" | "md" | "lg" | "xl"',
        defaultValue: '"md"',
        description: "Token gap between children, shared with other layout primitives.",
      },
      {
        name: "align",
        type: '"start" | "center" | "end" | "stretch" | "baseline"',
        description: "Cross-axis alignment, emitted as a data attribute for the layout CSS.",
      },
      {
        name: "justify",
        type: '"start" | "center" | "end" | "between" | "around" | "evenly"',
        description: "Main-axis distribution, emitted as a data attribute for the layout CSS.",
      },
      {
        name: "wrap",
        type: "boolean",
        defaultValue: "false",
        description: "Allows children to wrap onto additional flex lines.",
      },
      {
        name: "hideBelow",
        type: '"sm" | "md" | "lg" | "xl"',
        description:
          'Drop this region below a canonical breakpoint step (sm 40rem, md 48rem, lg 64rem, xl 80rem). THE public way to make a region responsive without a page-local media query — a public header hides its anchor navigation with hideBelow="md" (gh#252). Omitted by default, so no attribute is emitted and no rule matches. display:none also removes it from the a11y tree, so keep its destinations reachable elsewhere (a footer nav) at that width.',
      },
      {
        name: "hideFrom",
        type: '"sm" | "md" | "lg" | "xl"',
        description:
          "Inverse of hideBelow — drop the region FROM that step upwards, i.e. keep it only on the narrow side (a compact-only affordance).",
      },
    ],
    usage: [
      'DO import from `@godxjp/ui/layout` and reach for Flex when the axis, alignment, justification, or wrap behavior is part of the component contract: `import { Flex } from "@godxjp/ui/layout"`.',
      "DO keep spacing on the `gap` prop instead of raw `gap-*`, `space-*`, or padding utilities. Flex uses the same token scale as other layout primitives, so spacing remains tied to the design system.",
      'DO use `direction="row"` with `wrap` for responsive control rows, chip clusters, and action groups that need more control than simple row composition.',
      'DO use `direction="col"` for vertical groupings that need explicit `align` or `justify` behavior. For pure vertical stacking without alignment control, `direction="col"` is sufficient.',
      "DON'T override the axis with `className` after choosing a direction prop. Keep the layout intent in props so catalog guidance and data attributes stay accurate.",
      "Flex is a plain div with React.HTMLAttributes<HTMLDivElement>; pass `id`, `role`, `aria-*`, `data-*`, and structural className values as needed, but do not use it as a semantic form or button wrapper.",
      "NAMED FLEX = GROUP (gh#303): a role-less div may not carry a naming attribute (axe aria-allowed-attr), so a Flex given `aria-label`/`aria-labelledby` — e.g. by FormField wrapping a composite range/年月 field — automatically renders `role='group'`, folds `aria-errormessage` into `aria-describedby`, and drops the widget-only `aria-required`/`aria-invalid`. Passing an explicit `role` opts out of all of this and the caller owns the attribute set.",
    ],
    useCases: [
      "Toolbar internals where controls should sit in a row, wrap on narrow widths, and stay vertically centered.",
      "Card headers that need title content on the left and actions on the right via `justify='between'` without hand-rolling flex utility classes.",
      "Empty-state or loading blocks that center content on both axes using `align='center'` and `justify='center'`.",
      "Form sub-sections where a vertical group needs stretched children or centered helper content beyond what a plain column Flex provides.",
      "Badge, chip, or tag clusters where wrapping is required but the caller also needs explicit gap control.",
      "Low-level layout composition inside custom components where raw flex classes would duplicate the primitive.",
    ],
    related: [
      "Flex `direction='col'` — the standard pattern for ordinary vertical block spacing; use explicit `align`, `justify`, or `wrap` props when you need more control.",
      "Flex `direction='row'` — the standard pattern for simple horizontal groups; add `wrap` and `align='center'` for the typical row with wrapped centered items.",
      "ResponsiveGrid — use for equal-width, multi-column tile layouts. Flex arranges children on one flex axis and does not provide column-count behavior.",
      "PageContainer — page scaffold and padding context. Flex is an inner layout primitive used inside page sections, cards, dialogs, and toolbars.",
    ],
    example: `import { Flex } from "@godxjp/ui/layout";
import { Button } from "@godxjp/ui/general";

<Flex direction="row" gap="sm" align="center" justify="between" wrap>
  <SearchSummary />
  <Flex direction="row" gap="xs" align="center" wrap>
    <Button variant="outline">リセット</Button>
    <Button>適用</Button>
  </Flex>
</Flex>`,
    storyPath: "layout/Flex.stories.tsx",
    rules: [2, 40],
  },
  {
    name: "ResponsiveGrid",
    group: "layout",
    tagline:
      "Auto-responsive card grid — columns collapse to 1 on mobile, scale up on wider breakpoints.",
    props: [
      {
        name: "columns",
        type: "2 | 3 | 4",
        defaultValue: "3",
        description: "Target column count at desktop; collapses to 1 on mobile.",
      },
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Grid items — typically Card or StatCard.",
      },
    ],
    usage: [
      "DO place StatCard tiles directly as immediate children — StatCard IS already a bordered card; never wrap it in an extra <Card><CardContent>. The canonical pattern is <ResponsiveGrid columns={4}><StatCard .../><StatCard .../></ResponsiveGrid>.",
      "DO use columns={2|3|4} to declare the target desktop column count — the grid collapses automatically to 1 column on narrow containers (mobile-first via CSS container queries), via 2-column intermediate at ≥640px, then full target count at ≥1024px. There is no 'columns={1}' — omit the grid for single-column flows.",
      "DO NOT place a DataTable inside a ResponsiveGrid column beside a card or chart. DataTable must occupy its own full-width row in a Card with CardContent flush. Nesting a multi-column table in a grid column squeezes CJK text to one character per line (see rule 37).",
      "DO use ResponsiveGrid for page-level spacing — it applies the correct gap token (--space-stack-md) automatically. Never add raw gap-* / p-* / space-* utilities to the page layout around tiles; compose spacing through this component instead (rule 40).",
      "DO render SkeletonStat children in place of StatCard tiles while KPIs are loading — same columns prop, same count as the real tiles. Switch to real StatCard once data resolves.",
      "The grid uses CSS container queries, not viewport media queries — it responds to its containing block width, not the window. Ensure the container is not artificially constrained (e.g. inside a narrow SplitPane column) or column expansion will never trigger.",
    ],
    useCases: [
      "Dashboard KPI row: rendering 3–4 StatCard tiles (revenue, member count, active invoices, overdue amount) that reflow to a 2-column stacked grid on tablet and a single column on mobile.",
      "Summary header above a list page: a 2-column grid of two StatCard totals (e.g. total payable vs total paid) sitting above a Toolbar and DataTable.",
      "Accounting period overview: 4 StatCard tiles (opening balance, total debits, total credits, closing balance) that collapse gracefully on narrow viewports without any custom CSS.",
      "Loading state for a KPI row: identical <ResponsiveGrid columns={4}> wrapping four <SkeletonStat /> placeholders rendered while async data is in flight, swapped for real StatCard tiles once resolved.",
      "Settings or profile summary cards: 2- or 3-column grid of Card+CardContent blocks (not StatCard) showing categorized read-only data groups before a detail form below.",
      "Entity comparison panel: a columns={3} grid comparing three legal entities side-by-side with a Card+CardContent per entity, which collapses to 2-up on tablet and stacks on mobile.",
    ],
    related: [
      "Flex — use Flex (direction col or row) for sequential blocks of mixed-width content (forms, description lists, button rows). Use ResponsiveGrid only when you want equal-width, auto-reflowing tile columns.",
      "SplitPane — use SplitPane for a fixed two-panel side-by-side layout with a defined primary/secondary ratio that does NOT collapse to stacked tiles. Use ResponsiveGrid when you want automatic column count collapse on narrow screens.",
      "StatCard — the canonical direct child of ResponsiveGrid for KPI tiles. StatCard is self-contained (draws its own bordered card); never wrap it in Card/CardContent when placing it inside ResponsiveGrid.",
      "SkeletonStat — the loading-state sibling of StatCard, used as a drop-in placeholder child of ResponsiveGrid with the same columns count while KPI data is in flight.",
    ],
    example: `import { ResponsiveGrid } from "@godxjp/ui/layout";
import { StatCard } from "@godxjp/ui/data-display";

<ResponsiveGrid columns={4}>
  <StatCard label="総会員数" value="12,400" />
  <StatCard label="公開中クーポン" value="8" />
  <StatCard label="月間利用数" value="3,210" />
  <StatCard label="割引総額" value="¥480,000" />
</ResponsiveGrid>`,
    storyPath: "layout/ResponsiveGrid.stories.tsx",
    rules: [24, 40],
  },
  {
    name: "AppShell",
    group: "layout",
    tagline:
      "Root application shell — composes sidebar, topbar rail, main content area, and optional footer.",
    props: [
      {
        name: "sidebar",
        type: "ReactNode",
        required: true,
        description: "Sidebar node — typically a <Sidebar>.",
      },
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Main page content rendered in <main>.",
      },
      {
        name: "topbar",
        type: "ReactNode",
        description: "Full topbar override; else a rail is built from topbarLeft/topbarRight/logo.",
      },
      {
        name: "topbarRight",
        type: "ReactNode",
        description: "Right slot of the auto-built topbar rail (user menu, switcher).",
      },
      {
        name: "topbarLeft",
        type: "ReactNode",
        description: "Left slot of the auto-built topbar rail.",
      },
      {
        name: "logo",
        type: "ReactNode",
        description: "Brand mark at the far-left of the auto-built topbar rail (e.g. an Avatar).",
      },
      {
        name: "sidebarCollapsed",
        type: "boolean",
        defaultValue: "false",
        description: "Collapse the sidebar to icon-only mode.",
      },
      {
        name: "responsiveNavigation",
        type: '"drawer" | "docked"',
        defaultValue: '"drawer"',
        description:
          "Navigation strategy below the canonical 900px breakpoint. drawer exposes the accessible mobile Sheet; docked retains the token-sized sidebar grid track and suppresses the redundant drawer trigger.",
      },
      {
        name: "topbarSpan",
        type: '"content" | "full"',
        defaultValue: '"content"',
        description:
          "Which columns the topbar spans. content starts it beside the sidebar, so the rail runs the full window height and the bar sits over the content only. full runs the bar edge to edge with the rail beneath it, for a bar carrying space-level chrome (global search, account, notifications) that outranks the current section. full also renders the header before the aside so keyboard order follows the visual order.",
      },
      {
        name: "footer",
        type: "ReactNode",
        description: "App-level footer outside the main content area.",
      },
      {
        name: "breadcrumb",
        type: "BreadcrumbProp",
        description: "Breadcrumb trail rendered in the topbar header for back-navigation.",
      },
      {
        name: "mobileNav",
        type: "ReactNode",
        description:
          "Navigation shown in the AppShell-owned mobile drawer at or below 900px (where the docked sidebar is hidden). Defaults to the `sidebar` node; pass a tailored menu, or null to opt out.",
      },
      {
        name: "mobileNavLabel",
        type: "string",
        description:
          "Accessible title for the mobile navigation drawer. Defaults to localized 'Menu'.",
      },
      {
        name: "mobileNavOpen",
        type: "boolean",
        description: "Controlled open state of the mobile drawer. Omit for AppShell-owned state.",
      },
      {
        name: "onMobileNavOpenChange",
        type: "(open: boolean) => void",
        description: "Change handler for the mobile drawer open state.",
      },
    ],
    usage: [
      "DO pass a <Sidebar> node to `sidebar` (required) and page content to `children` (required) — these are the only two required props. Everything else is optional and omitting optional slots simply removes that zone from the rendered DOM.",
      "DO rely on AppShell's OWNED mobile drawer at or below 900px (NOT the Tailwind `lg` 1024px step — the shipped media query is `width <= 56.25rem`): it renders a hamburger trigger in the topbar and a focus-trapped Sheet (Esc + overlay close, focus returns to the trigger). `mobileNav` defaults to the `sidebar` node, so the same nav is reachable on mobile with no wiring — never hide the sidebar without providing this. Pass a tailored `mobileNav`, or `mobileNav={null}` only when navigation lives elsewhere (e.g. a bottom bar).",
      'DO set `responsiveNavigation="docked"` only when the approved product contract retains its sidebar below 900px. AppShell keeps the same sidebar/footer/active navigation in a token-sized grid track and removes the redundant drawer trigger; never reproduce this with consumer media queries.',
      "DO let the drawer nav own its own inset: AppShell renders `mobileNav` in a Sheet body whose inline padding is the `--app-shell-mobile-nav-inset` token (near-zero by default) instead of the generic 24px sheet chrome inset, so a <Sidebar> in the drawer is not double-padded (its own --sidebar-nav-scroll-padding already insets each row). If a custom `mobileNav` node needs the full chrome inset, set `--app-shell-mobile-nav-inset: var(--space-6)` in the service theme — never patch the drawer with a `[data-slot='sheet-body']` selector in app CSS.",
      "DO use the auto-built topbar rail (logo / topbarLeft / topbarRight) for simple shells. Pass a fully configured <Topbar> to the `topbar` prop only when you need live handlers (entity switcher via productMenu, search, notifications, user avatar) — when `topbar` is provided, logo/topbarLeft/topbarRight are ignored entirely.",
      "DO wire a single `sidebarCollapsed` boolean between AppShell's `sidebarCollapsed` prop and Sidebar's `collapsed` prop — AppShell sets `data-collapsed='true'` on the root div (which CSS reads for width transitions) but does NOT own the collapsed state itself; lift the state and pass it down to both.",
      "DO place breadcrumb content in AppShell's `breadcrumb` prop (renders in the `app-breadcrumb` div inside `<main>` ABOVE children) — do NOT hand-roll a breadcrumb bar as the first child of children, and do NOT put breadcrumbs inside <Sidebar>.",
      "DO NOT nest a second AppShell or AppShell inside AppShell's children — AppShell renders the root `app-root` div; nesting shells breaks the CSS grid layout.",
      "DO NOT add padding directly to children expecting it to reach the viewport edge — AppShell's `<main>` is a scroll container; use <PageContainer> (or <PageContainer.Inset> inside a flush PageContainer) inside children to get standard page padding.",
    ],
    useCases: [
      "Full admin SPA shell: AppShell wraps a <Sidebar> nav rail and a <Topbar> (with productMenu entity-switcher, onSearchOpen, onNotificationsOpen, user avatar) and every Inertia page renders as children inside a <PageContainer>.",
      "Collapsible-sidebar layout: maintain a `collapsed` boolean in a persistent Inertia layout component, pass it to both AppShell's `sidebarCollapsed` and Sidebar's `collapsed`, wire Topbar's `onToggleCollapsed` to flip it — AppShell handles the CSS transition automatically.",
      "Multi-tenant accounting app: pass a <Topbar productMenu={<DropdownMenuContent>…</DropdownMenuContent>}> to AppShell's `topbar` slot so the legal-entity chip opens an inline switcher without a modal.",
      "App-level footer (e.g. version/build info, compliance notice): pass a <footer> node to AppShell's `footer` prop — it renders outside `<main>` so it stays pinned below the scroll area.",
      "Rapid prototype or internal tool where you want a branded shell with minimal topbar: skip the `topbar` prop entirely and use `logo`, `topbarLeft`, `topbarRight` to build the rail declaratively without instantiating <Topbar>.",
      "Breadcrumb-aware shell: pass a <Breadcrumb items={…}> node to AppShell's `breadcrumb` prop so the breadcrumb strip appears above all page content without each page having to render it separately.",
    ],
    related: [
      "AppShell — opinionated wrapper that composes AppShell + a frozen default Topbar in three props (menu, children, breadcrumb). Use AppShell for quick scaffolding when the default GodX product chip and no-op search/notification handlers are acceptable; switch to AppShell directly the moment you need a custom entity switcher, real onSearchOpen, user slot, or any topbar configuration.",
      "Sidebar — the canonical node to pass as AppShell's `sidebar` prop; owns activeId, collapsible submenu groups, collapsed icon-only mode, and section labels. Never hand-roll a nav list inside the sidebar slot.",
      "Topbar — the structured topbar component to pass to AppShell's `topbar` prop when you need live product/project chip switchers, search, notifications, sidebar toggle, user avatar, or rightSlot extras. When `topbar` is provided, AppShell's logo/topbarLeft/topbarRight props are ignored.",
      "PageContainer — the mandatory direct child inside AppShell's `children` for every page; provides title, subtitle, extra actions, breadcrumb, footer, variant (flush/narrow/ghost), and density. Never render raw content directly as AppShell's child without a PageContainer wrapper.",
    ],
    example: `import { AppShell, Sidebar } from "@godxjp/ui/layout";
import { LayoutDashboard, Users } from "lucide-react";
import { router } from "@inertiajs/react";

const sidebar = (
  <Sidebar
    activeId="/dashboard"
    onSelect={(id) => router.visit(id)}
    sections={[{ items: [
      { id: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { id: "/users", label: "ユーザー", icon: Users },
    ] }]}
    product={{ name: "JOVY CRM", role: "本部", color: "var(--color-primary)" }}
  />
);

export function CrmLayout({ children }: { content: React.ReactNode }) {
  return <AppShell sidebar={sidebar}>{children}</AppShell>;
}`,
    storyPath: "layout/AppShell.stories.tsx",
    rules: [23],
  },
  {
    name: "AuthShell",
    group: "layout",
    tagline:
      "Centred auth/login page shell — brand bar (top) + centred card (main) + footer, over min-h-dvh, at comfortable control density.",
    props: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Centred content — typically a single auth <Card> holding the form.",
      },
      {
        name: "brand",
        type: "ReactNode",
        description: "Brand bar slot pinned to the top (e.g. a <Logo> / product mark).",
      },
      {
        name: "footer",
        type: "ReactNode",
        description: "Footer slot pinned to the bottom (legal links, locale switch, support).",
      },
      {
        name: "variant",
        type: '"default" | "canonical"',
        defaultValue: '"default"',
        description:
          'Visual contract for the auth surface. "canonical" applies the shared DXS compact geometry (36px controls, 22.5rem/360px card measure, responsive page insets, tighter field labels) through component tokens. "default" keeps the comfortable 44px shell with the 24rem card.',
      },
      {
        name: "preset",
        type: '"default" | "login" | "registration" | "device-authorization" | "context-selection" | "account-recovery"',
        defaultValue: '"default"',
        description:
          'Named flow GEOMETRY — the package-owned layout contract for a canonical hosted-identity flow. "login" (gh#237) anchors the 360px SCR-001 card at x=540/332/15 and y=363/363/353 for 1440x900, 1024x900 and 390x844; its fixed identity slot absorbs standalone, one-line requester and wrapped two-line requester states without truncating data. "device-authorization" (gh#220, gh#12) = a 380px card at 1440/1024 with a 5px inline page gutter at 390, AND the code field itself: the preset hands --otp-slot-{inline,block}-size the canonical 27.5x52 device-grant slot, so two 4-slot grouped boxes measure 112x54 instead of the 146x38 the square --control-height tier produced. "registration" (gh#256) = the 360px sign-up measure with a 15px inline gutter at 390 (the same page rhythm as "login", so sign-in to sign-up never jumps on a phone). START-aligned like login: a sign-up card is the tallest surface in the set (name/email/password/confirm/strength/consent/submit/providers) and a vertically centred tall card overflows ABOVE the scroll origin on a short viewport, putting its first field out of reach. It is also the only preset with its own footer-clearance knob, so the legal/consent footer never sits flush against the submit button; it carries the full password form AND the pending-email confirmation state with no consumer geometry CSS. "context-selection" (gh#217) = a 25rem card on desktop/tablet, edge-to-edge on mobile, plus tokenized section rhythm. "account-recovery" (gh#233) = the 27rem/432px SCR-008 recovery/MFA panel with a 15px mobile gutter. ORTHOGONAL to `variant`, so `variant="canonical" preset="login"` keeps canonical control chrome while the preset owns layout. Selecting a preset REPLACES consumer-side geometry overrides.',
      },
      {
        name: "density",
        type: '"comfortable" | "compact"',
        description:
          'Vertical density scoped to auth-card descendants. Defaults to "compact" under variant="canonical" and "comfortable" otherwise.',
      },
      {
        name: "className",
        type: "string",
        description: "Extra CSS classes merged onto the shell root.",
      },
    ],
    usage: [
      "DO pass a single <Card> (with the form inside <CardContent>) as `children` — AuthShell centres it and constrains its width via `--auth-shell-card-max-width`; do NOT hand-roll a `.auth-shell-main` / `.ui-auth-scope` wrapper.",
      'DO use `variant="canonical" preset="login"` for SCR-001 and pass <AuthIdentity>, <Card>, <AuthFooter> as direct children in that order (an anchor may wrap AuthIdentity). The preset owns the identity slot, card anchor, 20px section rhythm and compact card block inset for standalone and real requester states. Do not wrap the three sections in a consumer Flex/Stack or the semantic grid cannot anchor them.',
      'DO select a `preset` instead of overriding geometry: `preset="login"` for the stable SCR-001 identity/card/footer anchor, `preset="registration"` for the sign-up form and its pending-email state, `preset="device-authorization"` for the 380px OAuth device-grant measure, `preset="context-selection"` for the 25rem organisation/context picker, `preset="account-recovery"` for the 432px SCR-008 recovery/MFA panel. Page-local width/inset/vertical-offset variables are the exact anti-pattern these presets replace (gh#217/gh#220/gh#233/gh#237/gh#256).',
      'DO build the SOCIAL / PROVIDER ACTION row as a COMPOSITION — there is NO SocialLinks component (gh#256 Gate 0): `<AuthDivider label="or" />` followed by a `Flex direction="col" gap="sm"` of real `Button variant="outline"` with the provider glyph as an aria-hidden icon. The package deliberately does not own it: which providers a product offers, in what order, and what consent they imply are product decisions, and a component would have to invent them. `disabled` / `loading` are the Button\'s own props — do not add a provider-specific API.',
      'DO build the ORGANIZATION CHOICE LIST as a COMPOSITION — there is NO OrganizationChoiceList component (gh#256 Gate 0): `Card` > `CardContent flush` > a `<ul>` of `ListRow as="li"` (leading Avatar, title, description, trailing Button). `CardContent flush` is what gives shared row dividers instead of a card outline per row. Its states are existing exports, never bespoke markup: Skeleton rows for loading, `EmptyState` for no invitations, `Alert tone="destructive"` for a failed fetch and `Alert tone="warning"` for permission-denied. See the auth-shell-context and auth-shell-registration frames.',
      'DO build the password-recovery and sign-in MFA CHALLENGE panels as a COMPOSITION inside `preset="account-recovery"` — there is NO PasswordRecoveryPanel and NO MfaChallengePanel component (gh#233 Gate 0): Card > CardHeader(CardTitle + CardDescription, INSIDE the bordered surface) > CardContent > AuthStack[ Alert notice · FormField fields · Button fullWidth · Flex justify="between" wrap fallback row ]. Do NOT put AuthIdentity above the panel there (it always renders the hosted mark), and NEVER reuse TwoFactorSetup — that is the ENROLLMENT dialog, not a sign-in challenge. See the `auth-recovery-panels` pattern.',
      'DO combine `variant` and `preset` — they are orthogonal: `variant` owns control density + heading size, `preset` owns the page measure. `variant="canonical" preset="device-authorization"` is the canonical device screen.',
      'DO let `preset="context-selection"` space the auth column: it turns the card slot into a flex column with a tokenized `--auth-shell-card-stack-gap`, so an intro (<AuthIdentity>), the choice <Card> and a trailing "remember" row pass as three siblings with NO page-local spacing.',
      "DO NOT add a page-local width, inset or colour to hit an artboard — if a measure is missing, it is a library gap: a new preset or token, never consumer CSS (rules #44/#45).",
      "DO put the product/brand mark in `brand` (a <Logo> or an <Avatar>) — it renders as the top banner landmark; omit it and the banner is not rendered.",
      "DO use `footer` for compliance/legal/support links or a locale switch — it renders as the contentinfo landmark below the card.",
      "DO wrap the card in <Reveal> for the entrance animation (`<AuthShell><Reveal><Card/></Reveal></AuthShell>`) — Reveal honours prefers-reduced-motion; AuthShell itself stays layout-only.",
      "DO NOT re-scope control height or heading size in the app — AuthShell already sets the comfortable control tier (44px, WCAG touch floor) and the larger auth heading via `--auth-shell-control-height` / `--auth-shell-heading-size`; a service retunes those tokens, not a bespoke class.",
      "DO tune the COMPACT auth card through its three independent knobs, never a consumer selector on `[data-slot=\"card-content\"]` (gh#232): `--auth-shell-compact-card-inset` = the inline column, `--auth-shell-card-padding-block-compact` = the card's block (top/bottom) padding — it is wired to the card's `--card-space-shell-y` and really moves CardContent's block edges — and `--auth-shell-card-body-gap-compact` = the header↔body gap. Each defaults to today's canonical rhythm, so overriding one moves ONLY that axis.",
      "DO NOT nest AuthShell inside AppShell (or vice-versa) — AuthShell is the ROOT shell for unauthenticated pages (login/mfa/passkey/device/reset); AppShell is for the authenticated app.",
    ],
    useCases: [
      'Canonical Login (SCR-001): <AuthShell variant="canonical" preset="login"> with direct AuthIdentity · Card · AuthFooter children; the card remains anchored when requester is absent, one line or wraps to two lines (gh#237).',
      "Login page: <AuthShell brand={<Logo/>} footer={<AuthFooter/>}> wrapping a <Card> with the email/password form and a primary <Button fullWidth>.",
      "MFA / passkey / device-authorisation step: same shell, a <Card> with the one-time-code <InputOTP> or a passkey prompt.",
      'OAuth device-grant screen (SCR-004): <AuthShell variant="canonical" preset="device-authorization"> — a 380px card at 1440/1024 and a 5px inline gutter at 390, with zero page-local CSS (gh#220).',
      'Organisation / context selection (/select-context): <AuthShell variant="canonical" preset="context-selection" brand={<Logo mark="godx" />}> with an <AuthIdentity> intro, a <Card><CardContent flush> list of <ListRow as="li"> organisations, and a trailing "remember this choice" <Checkbox> — the preset spaces the three sections (gh#217).',
      "Password reset / forgot-password / accept-invite: the centred single-card flow with a brand bar and a legal footer.",
      'SSO landing / success confirmation: pair with an <EmptyState tone="success"> inside the card for an approved-device confirmation.',
    ],
    related: [
      "AppShell — the shell for AUTHENTICATED app pages (sidebar + topbar + main). AuthShell is its unauthenticated counterpart (brand bar + centred card + footer). Never nest the two.",
      "Reveal — wrap the auth <Card> in <Reveal> for the entrance animation; AuthShell delegates motion (and prefers-reduced-motion handling) to it rather than baking an animation in.",
      "Card — the canonical container for the auth form; place the form inside <CardContent>. AuthShell centres and width-constrains it.",
      'EmptyState — with `tone="success"` for a confirmation card inside the shell (e.g. device approved).',
      'AuthIdentity / AuthFooter / AuthStack / AuthDivider — the auth composites that fill the shell: the GoDX identity mark + heading + requesting-client line, the mono legal footer (its `locale` slot takes an <AppSettingPicker kind="locale" appearance="labeled" compact />), the 12px section rhythm, and the labelled "or" rule.',
      'ListRow — compose the organisation choice list for `preset="context-selection"` as <Card><CardContent flush><ul> of <ListRow as="li">: shared row dividers, no per-row card outline. There is no separate OrganizationChoiceList component — that is a composition pattern (rule #46), not a framework component.',
    ],
    example: `import { AuthShell, AuthIdentity, AuthFooter } from "@godxjp/ui/layout";
import { Reveal, Logo, Button } from "@godxjp/ui/general";
import { Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { AppSettingPicker } from "@godxjp/ui/navigation";

export function DeviceAuthorizationPage() {
  return (
    // 380px card at 1440/1024 · 5px inline gutter at 390 — all token-owned, no page CSS.
    <AuthShell
      variant="canonical"
      preset="device-authorization"
      brand={<Logo mark="godx" tone="success" />}
      footer={
        <AuthFooter
          product="GoDX ID"
          terms="Terms"
          privacy="Privacy"
          locale={<AppSettingPicker kind="locale" appearance="labeled" compact />}
        />
      }
    >
      <Reveal>
        <Card>
          <CardHeader>
            <AuthIdentity title="デバイスを認証" requester="勤怠管理が認証を要求しています" />
            <CardTitle level={2}>確認コードを入力</CardTitle>
          </CardHeader>
          <CardContent>
            {/* InputOTP + actions */}
            <Button fullWidth>デバイスを承認</Button>
          </CardContent>
        </Card>
      </Reveal>
    </AuthShell>
  );
}`,
    storyPath: "layout/AuthShell.stories.tsx",
    rules: [23],
  },
  {
    name: "CenteredShell",
    group: "layout",
    tagline:
      "Authenticated, no-sidebar, centred-column page shell (hosted-ID My Page / account / standalone settings) — padded topbar with real actions + a width-tiered centred column, zero custom CSS.",
    props: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description:
          "Centred column content — page sections (identity hero, org picker, service grid, team list). Top-aligned and scrolls; NOT vertically centred like AuthShell's card.",
      },
      {
        name: "topbar",
        type: "ReactNode",
        description:
          "Top bar slot (banner) — a <Topbar> with brand + real actions (AppSettingPicker, user menu, sign-out). Wrapped in the SAME padded chrome as AppShell's topbar (inline padding, border, backdrop) WITHOUT a sidebar; omit → no banner. Never hand-roll a bar (the bare Topbar ships no padding — the .ui-topbar zero-inset footgun).",
      },
      {
        name: "footer",
        type: "ReactNode",
        description:
          "Footer slot (contentinfo) pinned to the bottom (legal links, locale switch, support). Omit → no footer.",
      },
      {
        name: "width",
        type: '"sm" | "md" | "lg"',
        description:
          "Max-width of the centred column: sm ~32rem, md (default) ~46rem, lg ~64rem — all wider than AuthShell's 24rem auth card. A service retunes each tier via --centered-shell-width-*.",
      },
      {
        name: "align",
        type: '"start" | "center"',
        description:
          'Block alignment of the centred column inside the 100dvh shell. "start" (default) keeps the top-aligned flowing/scrolling page shape. "center" centres the column in the viewport — the SYSTEM-level standalone surface (a 500/503 error page, a maintenance notice); the full-page geometry stays package-owned (--centered-shell-column-offset-block: auto) instead of a consumer writing min-h-dvh + flex centring or a className. Overflowing content still scrolls from the top, so a long localized message is never clipped.',
      },
      {
        name: "preset",
        type: '"default" | "public-landing"',
        defaultValue: '"default"',
        description:
          'Whole-page shell contract. "default" emits no attribute and keeps the exact box. "public-landing" owns the PUBLIC landing geometry (gh#252): ONE content measure shared by the header bar, the centred column and the footer (--centered-shell-landing-max-width, 67.5rem), the section rhythm between page sections, the flat elevation-free card chrome (--centered-shell-landing-card-shadow: none) and the hero h1 tier — plus the compact step at 40rem. A landing composition therefore needs no page-local CSS, no max-width wrapper and no descendant selector against shell internals.',
      },
    ],
    usage: [
      "DO use CenteredShell for an AUTHENTICATED page that has a topbar with actions but NO sidebar — the hosted-ID 'My Page', an account / self-service surface, a standalone settings page. It is the third shell: AppShell (needs a sidebar) · AuthShell (unauthenticated narrow card) · CenteredShell (authenticated centred column).",
      "DO put a <Topbar start={<brand/>} end={<actions/>}/> in `topbar` — CenteredShell wraps it in the padded `.app-topbar` chrome, so you get inline padding + border + backdrop with zero custom CSS. Do NOT hand-roll a bar with raw `padding-inline` — the bare Topbar primitive ships no inset (the .ui-topbar zero-padding footgun) and content sits flush to the edge.",
      "DO pick `width` by content: `sm` (~32rem) for a single settings form, `md` (default, ~46rem) for a My Page of stacked sections, `lg` (~64rem) for a service-launcher grid. All are wider than AuthShell's 24rem card.",
      "DO wrap an individual section in <Reveal> for entrance motion — CenteredShell stays layout-only and delegates prefers-reduced-motion handling to Reveal (same as AuthShell).",
      "DO NOT use AuthShell for an authenticated page (it centres a narrow card VERTICALLY and has no actions slot), and DO NOT force AppShell with an empty sidebar — use CenteredShell. Never nest it inside AppShell/AuthShell (or vice-versa); it is a ROOT shell.",
      'DO use `align="center"` (+ `width="sm"`) for a SYSTEM-level standalone page — a 500/503 error surface, a maintenance notice. It centres the column in the 100dvh shell at 1440/1024/390 with no consumer `min-h-dvh` / flex CSS and no className; the knob is --centered-shell-column-offset-block. For an actual 403/404/500/503 page do NOT wire this by hand — use `ErrorSurface`, which renders this shell itself in `mode="system"`.',
    ],
    useCases: [
      'Hosted GoDX ID \'My Page\': <CenteredShell topbar={<Topbar start={<Brand/>} end={<><AppSettingPicker kind="locale"/><UserMenu/></>}/>} footer={<Footer/>} width="md"> with an identity hero, an org picker, a service-launcher grid and a team list.',
      "Account / self-service settings surface (no admin sidebar): stacked <Card> sections (profile, security, sessions) in a centred `md` column under a topbar with a user menu.",
      'Standalone single settings page: `width="sm"` with one <Card> of <Field>s and a save action.',
      'System error / maintenance page (500 · 503): `<CenteredShell align="center" width="sm">` around the canonical error body (status code <Text mono tabular> + <EmptyState icon tone title description action> + optional request-ID / maintenance line). See the `error-pages` pattern.',
      'Service launcher / app picker after sign-in: `width="lg"` with a <ResponsiveGrid> of app cards under the brand topbar.',
    ],
    related: [
      "AppShell — the shell for authenticated app pages WITH a sidebar nav rail. CenteredShell is its no-sidebar sibling (same padded topbar chrome, a centred column instead of a full-bleed main).",
      "AuthShell — the UNAUTHENTICATED root shell (login/mfa/reset): a narrow ~24rem card centred vertically, no actions slot. CenteredShell is the AUTHENTICATED centred-page counterpart. Never nest the two.",
      "Topbar — compose it into `topbar`; CenteredShell supplies the padded chrome the bare Topbar lacks.",
      "PageContainer — for a titled section INSIDE the column; or compose <Card>/<ResponsiveGrid> sections directly.",
    ],
    example: `import { CenteredShell, Topbar, Flex } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";
import { Avatar, AvatarFallback, Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";

export function MyPage() {
  return (
    <CenteredShell
      width="md"
      topbar={
        <Topbar
          start={
            <Avatar className="rounded-md">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">G</AvatarFallback>
            </Avatar>
          }
          end={
            <>
              <AppSettingPicker kind="locale" />
              <Button variant="ghost" size="sm">田中 太郎</Button>
            </>
          }
        />
      }
      footer={<Text size="xs" tone="muted">© 2026 GodX</Text>}
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader><CardTitle level={1}>マイページ</CardTitle></CardHeader>
          <CardContent>アカウントの概要。</CardContent>
        </Card>
      </Flex>
    </CenteredShell>
  );
}`,
    storyPath: "layout/CenteredShell.stories.tsx",
    rules: [23],
  },
  {
    name: "Sidebar",
    group: "layout",
    tagline:
      "Data-driven vertical nav rail with collapsible submenu groups and a collapsed icon-only mode — never build nav manually with raw buttons.",
    props: [
      {
        name: "activeId",
        type: "string",
        required: true,
        description:
          "The id of the currently active nav item. For group items, the parent is automatically highlighted when any descendant id matches.",
      },
      {
        name: "sections",
        type: "SidebarSectionProp[]",
        required: true,
        description:
          "Ordered list of nav sections. Each section has an optional string label and a required items array of SidebarItemProp.",
      },
      {
        name: "onSelect",
        type: "(id: string) => void",
        description:
          "Called with the item id when a leaf nav item is clicked. Not called for group triggers or disabled items.",
      },
      {
        name: "collapsed",
        type: "boolean",
        defaultValue: "false",
        description:
          "When true, renders the icon-only collapsed rail. Labels become Tooltips on hover; group items open a portaled flyout popover on click. Section labels are hidden.",
      },
      {
        name: "product",
        type: "SidebarProductProp",
        description:
          "Renders a product/app chip at the top of the sidebar (name, optional role subtitle, optional color swatch). Mutually exclusive with brand — brand takes precedence.",
      },
      {
        name: "onProductClick",
        type: "() => void",
        description:
          "Click handler for the product chip button. Use to open an entity/workspace switcher sheet or dropdown.",
      },
      {
        name: "brand",
        type: "ReactNode",
        description:
          "Custom brand slot rendered above the nav scroll area. When provided, the product chip is not rendered.",
      },
      {
        name: "footer",
        type: "ReactNode",
        description:
          "Slot pinned to the bottom of the sidebar below the scrollable nav area. Commonly used for user identity, online status, or version info.",
      },
      {
        name: "linkComponent",
        type: "SidebarLinkComponentProp",
        description:
          "THE framework-router contract (gh#213). Supply only the link ELEMENT TYPE; the library keeps composing every row — icon slot, label, badge, data-active/aria-current, the icon-only collapsed rail and its tooltip name — and passes it to the link as SidebarLinkProp children. Applied to every row that carries an href: top-level leaves, submenu children, collapsed-rail leaves and collapsed flyout entries. Build it with createSidebarLink(Link, 'to') for React Router / TanStack, createSidebarLink(Link) or inertiaSidebarLink(Link) from @godxjp/ui/inertia for Inertia / Next.js. Rows without an href keep the button + onSelect shape; a group TRIGGER stays a button because it owns aria-expanded disclosure semantics.",
      },
      {
        name: "renderItem",
        type: "(item: SidebarItemData, rowProps: SidebarRenderItemProp) => ReactNode",
        description:
          "DEPRECATED (gh#213) — use linkComponent, or asChild on SidebarItem. Legacy escape hatch that left row CONTENT to the caller, which is how a <Link>{item.label}</Link> silently dropped every icon and badge in production. Still supported and still wins over linkComponent; rowProps now also carries the library-composed children, so spreading rowProps (or rendering rowProps.children) restores the canonical row.",
      },
      {
        name: "aria-label",
        type: "string",
        description:
          'Override the nav landmark\'s accessible name (defaults to a localized "Main navigation"). Required when more than one Sidebar renders at once (e.g. a docked sidebar + its mobile-drawer twin) — two nav landmarks sharing one name/role fail landmark-unique.',
      },
    ],
    usage: [
      "DO: Define all nav items as a SidebarSectionProp[] data structure and pass it to sections — never hand-roll nav buttons alongside or instead of the Sidebar.",
      "DO: Add children: SidebarItemProp[] to any SidebarItemProp to create a collapsible submenu group. The parent item's icon is required even for groups. The group auto-opens and highlights when activeId matches any descendant.",
      "DO: Mirror the collapsed boolean between AppShell's sidebarCollapsed prop and Sidebar's collapsed prop — they must stay in sync so the shell layout grid adjusts correctly.",
      "DO: Use the footer prop for user info or status — it is pinned below the scroll area and does not scroll away.",
      "DO: Give every navigable item an `item.href` and let the library render it. A plain `href` becomes a real <a> (context-menu open-in-new-tab, middle-click); with `linkComponent` that same href drives your framework router's <Link>. Either way the link IS the row and the ONLY interactive element (no nested <button>). Never put a <button>/<a> inside a default row.",
      "DO: Wire a framework router with `linkComponent` — `createSidebarLink(Link, 'to')` (React Router / TanStack), `createSidebarLink(Link)` (Next.js), or `inertiaSidebarLink(Link)` from `@godxjp/ui/inertia`. That is the WHOLE integration: you pass the element type, the library composes the row. It threads through leaves, submenu children, the collapsed rail and the collapsed flyout. When you compose rows by hand, the same contract is `<SidebarItem item={item} asChild><Link to=… /></SidebarItem>` — write NO children; the library injects the icon, label and badge.",
      "DON'T: Use `renderItem` in new code — it is DEPRECATED (gh#213). It hands you a className + active state and leaves the row CONTENT to you, so `renderItem={(item) => <Link href={…}>{item.label}</Link>}` renders a row with NO icon and NO badge. That is the exact production regression that motivated `linkComponent`. If you must keep it, render `rowProps.children` (the library-composed row) instead of hand-writing `.sb-icon` / `.sb-label` spans, which are internal class names and not a public contract.",
      "DO: Rely on route-synchronized group expansion — a group OPENS automatically whenever `activeId` moves to one of its children (e.g. after a deep-link navigation), revealing the newly-active child; users can still collapse/expand manually.",
      "DO: Theme the nav ICON and the row/label SEPARATELY with tokens (gh#228) — the icon reads `--sidebar-nav-icon-foreground` (+ `-hover-`/`-active-`/`-disabled-` variants) and the row/label reads `--sidebar-nav-item-foreground` (+ `-hover-`/`-disabled-`). Defaults are unchanged (both = `hsl(var(--muted-foreground))`, hover/active = `hsl(var(--foreground))`), so setting `--sidebar-nav-icon-foreground: hsl(var(--foreground))` in your theme is all it takes to get canonical darker 16px icons beside muted labels. NEVER write a page-local `.sb-nav-item svg { color: … }` rule and never re-tint `--muted-foreground` globally to fix sidebar icons.",
      "DO: Give every item an `icon` — it is required by SidebarItemProp and by the canonical rail (the collapsed mode is icon-only). An item whose data arrives without one no longer crashes the shell; it renders an EMPTY 16px icon slot so the row keeps its geometry and label column, but it reads as a hole in the rail.",
      "DON'T: Change icon SIZE or row geometry through these colour knobs — icon size stays `--sidebar-nav-icon-size` (16px) and row geometry stays `--sidebar-nav-item-height` / `--sidebar-nav-item-gap` / `--sidebar-nav-item-padding-x`. The active row's fill/label keep `--sidebar-item-active-background` / `--sidebar-item-active-foreground`.",
      "DON'T: Manage collapse state inside the Sidebar — it is stateless. Hoist the boolean to your shell/page state and pass it down via both AppShell.sidebarCollapsed and Sidebar.collapsed.",
      "DON'T: Nest children more than one level deep — only top-level items can have children; grandchild items are not rendered.",
    ],
    useCases: [
      "Admin application shell nav with grouped sections (e.g. Operations / Fulfillment / Administration) where the sidebar can be collapsed to an icon rail for more content space.",
      "Accounting app with a collapsible 'Ledger' group containing Journal, Chart of Accounts, and Period Close sub-pages — activeId reflects the current sub-page and the group stays open automatically.",
      "Multi-tenant SaaS where onProductClick opens an entity/legal-entity switcher sheet and product.role shows the active tenant name beneath the product logo.",
      "Any app using AppShell where navigation must degrade gracefully to an icon-only rail on narrow viewports or via a user toggle in the Topbar.",
      "Apps with infrequent-access admin pages (Users, Roles, Password) grouped in a dedicated section that appears below primary operations sections.",
    ],
    related: [
      "AppShell — the shell that hosts Sidebar in its sidebar slot and owns the sidebarCollapsed layout grid; always compose Sidebar inside AppShell, not standalone in a page.",
      "Topbar — the horizontal bar that renders the collapse toggle (onToggleCollapsed) and its collapsed prop must mirror the sidebar's collapsed state.",
      "PageContainer — used for page-level title/subtitle/extra/breadcrumb inside AppShell's children slot, not inside Sidebar.",
    ],
    example: `
{\`import { useState } from "react";
import { LayoutDashboard, FileText, Users, Shield, CreditCard, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell, createSidebarLink } from "@godxjp/ui/layout";
import { Sidebar, type SidebarSection } from "@godxjp/ui/layout";
import { Topbar } from "@godxjp/ui/layout";

// The WHOLE router integration (gh#213): pass the element type, the library composes every row
// (icon · label · badge · active · collapsed rail). Inertia: inertiaSidebarLink(Link) from
// "@godxjp/ui/inertia". Next.js: createSidebarLink(Link).
const NavLink = createSidebarLink(Link, "to");

const sections: SidebarSection[] = [
  {
    label: "Accounting",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      {
        id: "ledger",
        label: "Ledger",
        icon: BookOpen,
        children: [
          { id: "journal", label: "Journal", icon: FileText, href: "/ledger/journal" },
          { id: "chart-of-accounts", label: "Chart of Accounts", icon: CreditCard, href: "/ledger/coa" },
        ],
      },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "users", label: "Users", icon: Users, href: "/users" },
      { id: "roles", label: "Roles", icon: Shield, href: "/roles", disabled: true },
    ],
  },
];

export default function Shell() {
  const [activeId, setActiveId] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AppShell
      sidebarCollapsed={collapsed}
      sidebar={
        <Sidebar
          activeId={activeId}
          collapsed={collapsed}
          onSelect={setActiveId}
          sections={sections}
          linkComponent={NavLink}
          product={{ name: "CoreBooks", role: "Admin Console", color: "hsl(var(--primary))" }}
          onProductClick={() => {/* open entity switcher */}}
          footer={
            <div className="text-muted-foreground text-xs">
              <div className="text-foreground font-medium">Satoshi Yamamoto</div>
              <div>Online · Tokyo branch</div>
            </div>
          }
        />
      }
      topbar={
        <Topbar
          product={{ name: "CoreBooks", color: "hsl(var(--primary))" }}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          onSearchOpen={() => {}}
        />
      }
    >
      {/* page content */}
    </AppShell>
  );
}\`}
`,
    storyPath: "layout/Sidebar.preview.tsx",
    rules: [3, 6, 23, 31],
  },
  {
    name: "Topbar",
    group: "layout",
    tagline:
      "A PURE SLOT bar for the app shell — positions three clusters (start / center / end) and owns ONLY the bar layout. It bakes NO chrome: no product switcher, no search box, no notification bell, no language picker. The CONSUMER composes those from real primitives and drops them into a slot; whether a control is icon-only / labelled / bordered is that control's own config, never the shell's.",
    props: [
      {
        name: "start",
        type: "ReactNode",
        defaultValue: "undefined",
        description:
          "Inline-start cluster — typically the sidebar toggle (a `Button` with a `PanelLeftClose` icon), the brand mark (an `Avatar`), and primary nav.",
      },
      {
        name: "center",
        type: "ReactNode",
        defaultValue: "undefined",
        description:
          "Center cluster (grows + centers) — optional. e.g. a search trigger (`Button` + `Search` icon opening your command palette) or a page/entity switcher (`DropdownMenu`). ⚠ HIDDEN AT 1100px AND BELOW by default: the slot follows `--topbar-center-compact-display` (default `none`) so it cannot cover the start breadcrumb/title or the end utilities when a 16rem sidebar is docked (gh#244). A global search placed here is therefore invisible on tablets and every phone until you set `--topbar-center-compact-display: flex`.",
      },
      {
        name: "end",
        type: "ReactNode",
        defaultValue: "undefined",
        description:
          'Inline-end cluster — settings pickers (`AppSettingPicker kind="locale"|"theme"`), a notifications `Button`, the user-menu `DropdownMenu`.',
      },
      {
        name: "children",
        type: "ReactNode",
        defaultValue: "undefined",
        description:
          "Escape hatch — render fully custom bar content instead of the three slots. When set, `start`/`center`/`end` are ignored.",
      },
      {
        name: "className",
        type: "string",
        description: "Merged onto the bar element; arbitrary props (aria-*, etc.) are forwarded.",
      },
    ],
    usage: [
      "DO compose the bar yourself: a brand mark (an `Avatar`) + sidebar toggle in `start`, a search trigger in `center`, settings pickers + notifications + user menu in `end`. The shell only positions; it never decides WHICH controls exist.",
      'DO build the sidebar toggle as a `Button variant="ghost" size="icon-sm"` with a `PanelLeftClose`/`PanelLeftOpen` icon and your own `t()` aria-label, wired to AppShell\'s `sidebarCollapsed`. There is no baked toggle.',
      "DO put a locale/theme switcher in `end` using `AppSettingPicker` (or your own control) — icon-only vs labelled, bordered vs not, is THAT component's prop, not Topbar's. Topbar does not ship or force a language picker.",
      "DON'T look for `product`/`project`/`onSearchOpen`/`onNotificationsOpen`/`collapsed` props — they were removed. A chrome control only exists if YOU put it in a slot, so there is never a dead dropdown / empty search with nothing behind it.",
      "DO render Topbar inside `AppShell`'s `topbar` slot (or any `<header>`). For a non-three-cluster layout, pass `children` and lay it out yourself.",
      "DO decide, explicitly, what happens to the `center` slot at 1100px and below. It is REMOVED there by default (`--topbar-center-compact-display: none`, gh#244) so it cannot cover the start or end clusters when a 16rem sidebar is docked — which also means a global search trigger in `center` is gone on tablets AND phones. This default arrived in 18.6.0 and changed behaviour for consumers who touched nothing but their lockfile. If your center content already has a compact presentation (an icon-only search trigger), opt back in globally with `:root { --topbar-center-compact-display: flex; }`; if it does not, move the trigger into `end` for compact widths. Never re-create either behaviour with a page-local media query.",
      "DO rely on the built-in shrink contract instead of hand-tuning widths: the bar never exceeds its shell allocation, `start` shrinks first and `center` yields its whole box, each cluster CLIPS its own overflow (so a long tenant/brand string can never spill over a sibling or leak a horizontal document scroll), and `end` keeps its natural width anchored inline-end — the locale picker and user menu stay visible at 1024px with a 16rem sidebar. If a label must degrade gracefully rather than be cut, give THAT element `truncate`/`text-overflow` yourself; don't add `overflow`/`flex` overrides to the slots.",
      'KNOW the shrink contract reaches only the LAST child of `start` — and `Button` ships `shrink-0`, so any Button you put mid-slot (the classic entity switcher, with a brand mark before it and a screen title after) keeps its full width while the cluster clips it. Clipped, but still focusable: a keyboard user tabs to a control they cannot see (SC 2.4.7). Give such a control `min-w-11 flex-1` at compact widths so it takes the leftover room without dropping under the 44px touch floor, and wrap its label in `<span className="truncate">`. Budget the `end` cluster too — it is `flex: 0 0 auto`, so an ambient status chip there is subtracted from `start` before `start` gets a say (a 93px environment Badge left `start` 25px of a 198px bar at 320). Hide ambient chips below `sm`.',
    ],
    useCases: [
      "Admin shell: `start` = sidebar toggle + brand mark (`Avatar`) + an entity switcher (`DropdownMenu` around a `Button`); `center` = a `Button` search trigger; `end` = `AppSettingPicker` (locale) + a notifications `Button` + a user `DropdownMenu`.",
      "Minimal shell (no search, no notifications): pass only `start` (brand mark) and `end` (user menu). Nothing else renders — no empty chrome.",
      "Marketing / docs header: pass `children` with a fully custom flex layout when the three-cluster model doesn't fit.",
    ],
    related: [
      "AppShell — place Topbar in its `topbar` slot. AppShell also exposes its own `logo`/`topbarLeft`/`topbarRight` slots if you don't want a separate Topbar at all.",
      'Avatar — the brand mark for the `start` slot (use `className="rounded-md"` for a square-ish product glyph).',
      "AppSettingPicker — locale/theme/timezone/currency picker; the consumer drops it into `end`. Its appearance (icon-only, labelled, bordered) is configured on IT, not on Topbar.",
      "DropdownMenu — wrap a `Button` to build an entity switcher or user menu yourself, then place it in a slot.",
    ],
    example: `import { Topbar, AppShell } from "@godxjp/ui/layout";
import { Button } from "@godxjp/ui/general";
import { Avatar, AvatarFallback } from "@godxjp/ui/data-display";
import { AppSettingPicker } from "@godxjp/ui/navigation";
import { PanelLeftClose, Search } from "lucide-react";

// The shell gives you slots; YOU decide what goes in them.
<AppShell
  sidebar={<MySidebar />}
  topbar={
    <Topbar
      start={
        <>
          <Button variant="ghost" size="icon-sm" aria-label={t("toggleSidebar")} onClick={toggle}>
            <PanelLeftClose />
          </Button>
          <Avatar className="rounded-md">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">C</AvatarFallback>
          </Avatar>
        </>
      }
      center={
        <Button variant="outline" size="sm" onClick={openSearch}>
          <Search />
          {t("search")}
        </Button>
      }
      end={
        <>
          <AppSettingPicker kind="locale" />
          <UserMenu />
        </>
      }
    />
  }
>
  {children}
</AppShell>`,
    storyPath: "layout/Topbar.stories.tsx",
    rules: [2, 3, 5, 6],
  },
  {
    name: "MasterDetail",
    group: "layout",
    tagline:
      "Responsive master-detail composition: a fluid list beside a token-owned 300px/320px fixed rail, with a themeable collapse threshold. `rail` picks which region is fixed — default `detail` (the canonical 1fr/320px list + detail rail); `master` for a leading navigator rail.",
    props: [
      {
        name: "master",
        type: "ReactNode",
        required: true,
        description:
          "Selectable collection. Always FIRST in DOM order, so the stacked (mobile) order is list-then-detail whichever region owns the rail.",
      },
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Detail surface for the current master selection.",
      },
      {
        name: "rail",
        type: '"master" | "detail"',
        defaultValue: '"detail"',
        description:
          "Which region keeps the fixed track; the other one is fluid. `detail` = the canonical fluid-list + fixed detail rail. `master` = leading category/navigator rail beside a fluid detail surface.",
      },
      {
        name: "railWidth",
        type: '"compact" | "standard"',
        defaultValue: '"standard"',
        description:
          "Token-owned rail preset: compact=300px (--master-detail-rail-compact), standard=320px (--master-detail-rail-standard).",
      },
      {
        name: "masterViewport",
        type: '"auto" | "compact" | "standard"',
        defaultValue: '"auto"',
        description:
          "Bound the master collection to a scrollable viewport. `auto` (default) never bounds it — the region grows with its content. `compact` (--master-detail-master-viewport-compact, 20rem) / `standard` (28rem) cap its block size and scroll the collection INSIDE the region, and make that region a keyboard-reachable scroll container (tabIndex 0, --master-detail-master-viewport-inset reserves focus-ring room). No raw pixel prop exists — retune the tokens in a service theme.",
      },
      {
        name: "collapseBelow",
        type: '"sm" | "md" | "lg" | "xl" | false',
        description:
          "Per-instance stacking threshold (sm=40rem, md=48rem, lg=64rem, xl=80rem; false never stacks). OMIT it to inherit the themeable --master-detail-collapse-below token (default 40rem) — that is the global knob a service theme retunes once.",
      },
      {
        name: "masterLabel",
        type: "string",
        description: "Accessible name for the master region landmark.",
      },
      {
        name: "detailLabel",
        type: "string",
        description: "Accessible name for the detail region landmark.",
      },
      {
        name: "detailId",
        type: "string",
        description:
          "Id of the detail region so the selection controls inside `master` can point at it with aria-controls, and the app can move focus to it after a selection (the region carries tabIndex={-1} for exactly this).",
      },
    ],
    usage: [
      'DO use MasterDetail for team, member, service or settings screens where a selectable collection drives a detail surface. Default `rail="detail"` gives the canonical fluid list + 320px detail rail; pass `rail="master"` for a leading navigator rail.',
      "DO keep selection and keyboard semantics on the controls inside `master` (`aria-pressed`, roving focus, or listbox semantics as appropriate) — only the caller knows which APG pattern applies; MasterDetail preserves whatever you render.",
      "DO wire the two together: give the master controls `aria-controls={detailId}`, and move focus to `document.getElementById(detailId)` when a selection replaces the detail (the region is `tabIndex={-1}` so that focus call works).",
      "DO choose `compact` for the 300px rail and `standard` for 320px. Never reproduce these tracks with consumer CSS.",
      "DO provide `masterLabel` and `detailLabel` when the surrounding headings do not already identify both regions.",
      "DON'T use ResponsiveGrid for master-detail hierarchy; its equal tracks cannot represent this composition.",
      'DO set `masterViewport="compact"` (or `"standard"`) whenever the collection is a REAL, unbounded list. Left at `auto` a 200-row list renders ~3,700px tall, and once the layout stacks the detail lands thousands of pixels below the fold; bounded, the collection scrolls inside the rail and the detail stays near the top of the screen. Pass `masterLabel` too, so the scroll region is announced.',
      "DON'T reproduce that bound with a consumer `max-height`/`overflow` rule or a pixel prop — there is none by design. Retune `--master-detail-master-viewport-compact` / `-standard` in the service theme, and `--master-detail-master-viewport-inset` if the collection's focus ring needs more room.",
      "The collapse threshold is a real token: below `--master-detail-collapse-below` (default 40rem, measured against the COMPOSITION's own inline size, never the viewport) master stacks above detail. A theme retunes it globally, `collapseBelow` overrides it per instance. It is implemented as a flex-basis threshold rather than a media query precisely because a query CONDITION cannot read a var().",
      "Measured geometry with the defaults: 1440 → fluid master + 320px rail; 1024 → fluid master + 320px rail; 390 → stacked full-width master then detail. Same JSX at every width — no consumer-local CSS, grid tracks or per-screen spacing.",
    ],
    useCases: [
      "Teams screen: the team DataTable stays fluid while the selected team's detail keeps the 320px rail.",
      'Organization service access: services in the compact leading rail (`rail="master"`) and selected service roles in the fluid detail surface.',
      "Settings navigator: categories in the leading rail and the selected configuration form in the detail surface.",
    ],
    related: [
      "SplitPane — a main surface plus a COMPLEMENTARY aside (its own content), not a selection-driven detail; use MasterDetail when the trailing pane is the detail OF the selection.",
      "ResponsiveGrid — use for equal-width independent cards, never for a master-detail relationship.",
      "PageContainer — outer page scaffold that supplies page insets and title hierarchy around MasterDetail.",
    ],
    example: `import { MasterDetail } from "@godxjp/ui/layout";

// Canonical: fluid list + fixed 320px detail rail (stacks below 40rem).
<MasterDetail
  masterLabel="Teams"
  detailLabel="Selected team"
  detailId="team-detail"
  master={<TeamTable onRowClick={select} detailId="team-detail" />}
>
  <TeamDetail team={selected} />
</MasterDetail>

// Leading navigator rail instead.
<MasterDetail rail="master" railWidth="compact" masterLabel="Categories">
  <SettingsForm />
</MasterDetail>

// A long real collection: bound the master so it scrolls in place and the detail
// stays near the top of a stacked mobile page.
<MasterDetail masterViewport="compact" masterLabel="Members" detailLabel="Selected member">
  <MemberDetail member={selected} />
</MasterDetail>`,
    storyPath: "layout/MasterDetail.stories.tsx",
    rules: [24, 40],
  },
  {
    name: "SplitPane",
    group: "layout",
    tagline: "Two-column layout with a main content area and a fixed-width aside panel.",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Main (left) content." },
      {
        name: "aside",
        type: "ReactNode",
        required: true,
        description: "Aside (right) panel content.",
      },
      {
        name: "asideWidth",
        type: '"sm" | "md"',
        defaultValue: '"md"',
        description: "Width preset for the aside column.",
      },
    ],
    usage: [
      "DO: pass all right-panel content via the `aside` prop — it renders inside a semantic `<aside>` element at a fixed rem width (sm=20rem, md=22rem). The `children` prop fills the main `1fr` column. Both accept any ReactNode.",
      'DO: choose `asideWidth="sm"` for compact detail panels (filters, quick stats, key-value summaries) and the default `asideWidth="md"` for richer panels (forms, timelines, long metadata lists).',
      "DO: wrap SplitPane inside `PageContainer` or `PageContainer.Inset` — SplitPane provides no page padding of its own. It is a grid primitive, not a page scaffold.",
      "DON'T: expect two columns below 1080px. Below that breakpoint SplitPane stacks to a single column (main on top, aside below). Never use it for layouts that must remain side-by-side on tablet or mobile — use CSS Grid or `ResponsiveGrid` instead.",
      "DON'T: add a CSS `overflow: hidden` or fixed height on the SplitPane wrapper; both columns carry `min-width: 0` to handle overflow correctly, and the grid uses `minmax(0, 1fr)` — adding external constraints will break the overflow contract.",
      "DON'T: hand-roll a two-column div layout with flexbox or CSS Grid when SplitPane already ships — that duplicates the responsive breakpoint logic and the semantic `<aside>` element.",
    ],
    useCases: [
      "Invoice / transaction detail page: list of records in `children` (DataTable), selected-record detail panel in `aside` (Descriptions + Timeline).",
      'Accounting ledger drill-down: account list on the left, chart-of-accounts metadata or running balance breakdown on the right using `asideWidth="sm"`.',
      "Document review workflow: PDF or rich-text viewer in `children`, approval form or annotation panel in `aside`.",
      "Settings page with a category list or Steps navigator in `children` and a live preview or summary card in `aside`.",
      "Kanban or task board where the main area holds the board columns and the aside shows the focused task detail without navigating away.",
    ],
    related: [
      "ResponsiveGrid — use when you need more than two columns, or when both columns must have equal or percentage-based widths rather than a fixed-rem aside. SplitPane always gives main a `1fr` and aside a fixed rem width.",
      "PageContainer — use as the outer scaffold that provides page padding and vertical rhythm; nest SplitPane inside PageContainer, not the other way around.",
      "Sheet — use when the detail/context panel should slide in as an overlay (drawer) rather than sitting permanently beside the main content. Prefer Sheet on mobile or when the aside content is secondary and on-demand.",
      "Flex direction='col' — use when content is purely vertical (single column, sequential sections). SplitPane is the right pick only when a persistent side panel is needed at the same hierarchy level as the main content.",
    ],
    example: `import { SplitPane } from "@godxjp/ui/layout";

<SplitPane aside={<DetailPanel />} asideWidth="sm">
  <MainContent />
</SplitPane>`,
    storyPath: "layout/SplitPane.stories.tsx",
    rules: [24],
  },
  {
    name: "ErrorSurface",
    group: "layout",
    tagline:
      'Package-owned semantic exception surface for 400 / 403 / 404 / 500 / 503. `mode` is the SHELL CONTRACT: "application" renders the body you put inside the AppShell the route already provides (chrome PRESERVED, never reconstructed); "system" owns the whole page via CenteredShell align="center" (package-owned 1440/1024/390 geometry). Exactly one recovery action, plus semantic request-id / permission / organization / maintenance metadata slots.',
    props: [
      {
        name: "mode",
        type: '"application" | "system"',
        required: true,
        description:
          'The shell contract, not a skin. "application" (400/403/404) renders ONLY the surface block — put it in AppShell\'s children (usually inside a PageContainer) so the sidebar/topbar/breadcrumb stay mounted; it cannot build chrome, because nav data and the user menu are consumer-owned. "system" (500/503) renders the whole page: CenteredShell align="center", so no consumer min-h-dvh / flex class / media query.',
      },
      {
        name: "status",
        type: "400 | 403 | 404 | 500 | 503",
        required: true,
        description:
          "The HTTP status (a NUMBER, not a string). It is the input that drives the default icon (TriangleAlert 400 · ShieldAlert 403 · SearchX 404 · ServerCrash 500 · Wrench 503) and tone (warning 400/403/503 · muted 404 · destructive 500). Also rendered as the compact tabular status code, announced as 'HTTP status 403' rather than the cardinal number. 400 (gh#301) is the malformed-request page — a route reached with parameters the server refuses to interpret (a bad id, a missing launch parameter) — and belongs in mode=\"application\" like 403/404.",
      },
      {
        name: "title",
        type: "ReactNode",
        required: true,
        description:
          "Headline. Consumer-owned copy from the APP's own t() — @godxjp/ui ships no product text.",
      },
      {
        name: "action",
        type: "ReactNode",
        required: true,
        description:
          "The ONE recovery action (a Button, or Button asChild wrapping a router Link). A single slot IS the enforcement: pass a fragment with two buttons and only the first renders, with a development-time console error. Support contact goes in `description`, never in a second CTA.",
      },
      {
        name: "description",
        type: "ReactNode",
        description:
          "Supporting sentence under the title. Put support-contact guidance here. Its measure is owned by --empty-state-description-max-width.",
      },
      {
        name: "requestId",
        type: "string",
        description:
          "Support correlation id, rendered as a <dt>/<dd> metadata row with a localized 'Request ID' label and a mono/tabular value so it can be read out or copied accurately. Pass the bare id — never write it into `description` as prose.",
      },
      {
        name: "permission",
        type: "ReactNode",
        description:
          "The permission/role the viewer is missing (403). Pass the bare permission name ('reports.view'); the localized 'Required permission' label is the surface's.",
      },
      {
        name: "organization",
        type: "ReactNode",
        description:
          "The organization/tenant the failed request was scoped to. Together with `permission` this is what distinguishes a wrong-workspace 403 from a missing-role 403.",
      },
      {
        name: "maintenance",
        type: "{ start: string; end?: string; timeZone?: string; progress?: number }",
        description:
          "Planned-outage timing (503). `start`/`end` are ISO-8601 INSTANTS and `timeZone` an IANA id: the surface formats them with Intl.DateTimeFormat(locale).formatRange() and keeps the ISO value in <time dateTime>. NEVER pass a pre-formatted '18:00 - 20:00 JST' string. `progress` (0-100) adds a labelled Progress meter named via Intl.NumberFormat percent style; it is SERVER-SENT on purpose — deriving it from the client clock breaks SSR hydration.",
      },
      {
        name: "icon",
        type: "ComponentType<{ className?: string }>",
        description:
          "Override the status-derived icon. Use only when the product has a truer glyph for the failure, never to change perceived severity.",
      },
      {
        name: "tone",
        type: '"muted" | "info" | "success" | "warning" | "destructive"',
        description:
          "Override the status-derived tone (same union as EmptyState.tone). Defaults: 400/403/503 warning · 404 muted · 500 destructive.",
      },
      {
        name: "titleLevel",
        type: "1 | 2 | 3 | 4",
        description:
          "Semantic heading level of `title`. Defaults to 2 in application mode (a PageContainer h1 sits above) and 1 in system mode (the surface IS the page). Choose it to keep the outline valid, never for size.",
      },
      {
        name: "brand",
        type: "ReactNode",
        description:
          "system mode ONLY — brand slot above the status code (a Logo). Ignored in application mode, where the shell already shows the brand.",
      },
      {
        name: "footer",
        type: "ReactNode",
        description:
          "system mode ONLY — the page footer (contentinfo): copyright, status page link, locale switch.",
      },
      {
        name: "width",
        type: '"sm" | "md" | "lg"',
        defaultValue: '"sm"',
        description:
          "system mode ONLY — measure of the centred column (the CenteredShell width tier).",
      },
      { name: "id", type: "string", description: "Root element id." },
      { name: "className", type: "string", description: "Root class override (rarely needed)." },
    ],
    usage: [
      "DO use ErrorSurface for ANY 400 / 403 / 404 / 500 / 503 page. It is a real import from @godxjp/ui/layout — never hand-compose an error page from AuthShell + a generic Card, and never add a consumer-local `.canonical-auth-card`-style class (that workaround IS the gh#251 regression).",
      'DO put mode="application" INSIDE the shell the route already renders: <AppShell …><PageContainer …><ErrorSurface mode="application" …/></PageContainer></AppShell>. The surface returns only its own block on purpose, so the sidebar/topbar/breadcrumb survive and the user can navigate away.',
      'DO use mode="system" for 500/503 and pass NOTHING for geometry — the surface renders CenteredShell align="center" itself. A className="min-h-dvh flex items-center" is always wrong.',
      "DO pass ONE action. A second CTA is dropped with a development error; put 'contact support' in `description`.",
      "DO pass `maintenance` as ISO-8601 instants + an IANA timeZone and let Intl format it. A hand-built window string cannot localize, and a client-derived `progress` breaks SSR hydration.",
      "DO let `status` pick the icon and tone. Override them only for a truer product glyph — never to recolour a status into a different severity.",
      "DO NOT retune the geometry with a className: --error-surface-max-width, --error-surface-gap, --error-surface-padding-block(-compact), --error-surface-meta-* and --error-surface-progress-max-width are the knobs. The metadata divider defaults to `none` (rule #44); opt in with --error-surface-meta-border.",
      "DO NOT write the request id, the missing permission or the maintenance window into `description` as prose — each is a semantic <dt>/<dd> slot, and prose loses the label↔value relationship for a screen reader.",
      "DO NOT use AuthShell for an error page: it is the UNAUTHENTICATED root and imposes auth-card geometry.",
    ],
    useCases: [
      'Inertia/Laravel exception page (SCR-006): one Error.tsx receives `status` from Handler::render() and renders <ErrorSurface mode={status >= 500 ? "system" : "application"} status={status} … />, with Error.layout keeping the authenticated shell for 403/404 only.',
      'Forbidden report inside the console: <ErrorSurface mode="application" status={403} permission="reports.view" organization="Acme KK" action={<Button asChild><Link href="/">Back</Link></Button>} /> inside the existing AppShell + PageContainer.',
      'Planned maintenance page: <ErrorSurface mode="system" status={503} maintenance={{ start, end, timeZone: "Asia/Tokyo", progress: 40 }} brand={<Logo glyph="G" />} footer={…} />.',
      'Unexpected failure with a support correlation id: <ErrorSurface mode="system" status={500} requestId="01J9Z0…" action={<Button onClick={reload}>Reload</Button>} />.',
    ],
    related: [
      'CenteredShell — the viewport-centred page shell that ErrorSurface renders internally for mode="system". Use it directly only for a standalone surface that is NOT one of the four HTTP statuses.',
      'AppShell + PageContainer — what you wrap around a mode="application" surface. ErrorSurface never builds them: nav sections and the user menu are consumer-owned data.',
      "EmptyState — the zero-state primitive ErrorSurface composes for its icon/title/description/action body. Use it directly for an empty LIST or an empty section, not for an HTTP exception page.",
      "AlertQueryError / humanError — inline, in-page query failure feedback. ErrorSurface is the whole PAGE; an inline alert is the right pick when the surrounding page still works.",
      "Progress — the meter ErrorSurface renders for maintenance.progress.",
    ],
    example: `import { Button, Logo, Text } from "@godxjp/ui/general";
import { AppShell, ErrorSurface, PageContainer, Sidebar } from "@godxjp/ui/layout";

// 403 — APPLICATION mode: the body inside the shell the route ALREADY renders.
// The sidebar/topbar/breadcrumb are preserved; the surface builds no chrome.
export function ForbiddenPage() {
  return (
    <AppShell sidebar={<Sidebar activeId="reports" sections={sections} />}>
      <PageContainer title="レポート" breadcrumb={[{ label: "ホーム", to: "/" }, { label: "レポート" }]}>
        <ErrorSurface
          mode="application"
          status={403}
          title={t("errors.403.title")}
          description={t("errors.403.description")}
          permission="reports.view"
          organization="株式会社ゴッドエックス"
          action={<Button onClick={goHome}>{t("errors.backHome")}</Button>}
        />
      </PageContainer>
    </AppShell>
  );
}

// 503 — SYSTEM mode: the surface owns the page. No className, no min-h-dvh, no media query.
export function MaintenancePage() {
  return (
    <ErrorSurface
      mode="system"
      status={503}
      brand={<Logo glyph="G" />}
      title={t("errors.503.title")}
      description={t("errors.503.description")}
      maintenance={{
        start: "2026-08-02T18:00:00Z",   // ISO-8601 instant, server-sent
        end: "2026-08-02T20:00:00Z",
        timeZone: "Asia/Tokyo",           // IANA — explicit, so SSR and client agree
        progress: 40,                     // 0-100, server-sent (never from the client clock)
      }}
      footer={<Text size="xs" tone="muted">2026 GodX</Text>}
      action={<Button onClick={reload}>{t("errors.reload")}</Button>}
    />
  );
}`,
    storyPath: "layout/ErrorSurface.stories.tsx",
    rules: [23, 24],
  },
  {
    name: "LegalDocumentShell",
    group: "layout",
    tagline:
      "Long-form legal/policy document surface (terms, privacy, DPA, cookie policy, SLA) — semantic article/nav/section landmarks, real anchors, a sticky table-of-contents rail, scroll-spy aria-current, hash deep links with a token-driven scroll offset and focus handoff. All legal text stays consumer-owned.",
    props: [
      {
        name: "title",
        type: "ReactNode",
        required: true,
        description:
          "Document title — the <h1> that names the <article> (e.g. 'Terms of Service').",
      },
      {
        name: "sections",
        type: "{ id: string; title: string; content: ReactNode }[]",
        required: true,
        description:
          "The document's sections in reading order. Drives BOTH the contents list and the body: `id` is the REAL anchor target (<section id> + href='#id'), `title` becomes the <h2> AND the contents label, `content` is the consumer-owned legal copy.",
      },
      {
        name: "version",
        type: "string",
        description:
          "Bare version identifier (e.g. '2.4'). Rendered as a localized 'Version {version}' — never pass a pre-localized sentence.",
      },
      {
        name: "effectiveDate",
        type: "string",
        description:
          "ISO 8601 calendar date (yyyy-MM-dd) or a full ISO instant. Formatted with Intl.DateTimeFormat in the active locale and emitted inside <time dateTime={effectiveDate}>, so the machine-readable value is always the ISO input. NEVER pass a pre-formatted date string.",
      },
      {
        name: "summary",
        type: "ReactNode",
        description:
          "Short plain-language summary rendered under the metadata, above the contents.",
      },
      {
        name: "contentsLabel",
        type: "string",
        description:
          "Accessible name + visible caption of the contents <nav>. Defaults to a localized 'Contents'. Override it when two documents share a view, so the two nav landmarks stay distinguishable (axe landmark-unique, WCAG 2.4.1).",
      },
      {
        name: "activeSection",
        type: "string",
        description:
          "Controlled active section id (the entry marked aria-current='location'). Pair with onActiveSectionChange; omit both for the uncontrolled form.",
      },
      {
        name: "defaultActiveSection",
        type: "string",
        description: "Uncontrolled initial active section id. Defaults to the first section.",
      },
      {
        name: "onActiveSectionChange",
        type: "(sectionId: string) => void",
        description:
          "Fires on contents-anchor activation, on an initial hash deep link, and continuously from the scroll spy as the reader moves through the document.",
      },
      {
        name: "documentNavigation",
        type: "ReactNode",
        description:
          "Rail slot above the contents list — a switcher across the legal set (Terms · Privacy · Cookies). Rendered as a plain wrapper, so the consumer owns its semantics.",
      },
      {
        name: "footerAction",
        type: "ReactNode",
        description: "Slot below the last section — accept / download / print / contact actions.",
      },
      { name: "id", type: "string", description: "Root element id; also seeds the internal ids." },
      { name: "className", type: "string", description: "Root class override (rarely needed)." },
    ],
    usage: [
      "DO use LegalDocumentShell for ANY long-form legal/policy document — terms of service, privacy policy, DPA, cookie policy, SLA, EULA, security policy. It is the only primitive that owns the document behaviour: scroll-spy active section, hash deep links, scroll offset, focus handoff and reduced-motion scrolling.",
      "DO pass `effectiveDate` as an ISO 8601 string ('2026-04-01'). The shell formats it with Intl.DateTimeFormat in the active locale and keeps the ISO value in <time dateTime>. A pre-formatted string ('April 1, 2026') is a bug — it will not localize.",
      "DO keep ALL legal text in the consumer: the shell only receives `sections` (+ the `summary` / `documentNavigation` / `footerAction` slots). It never ships legal copy.",
      "DO give every section a URL-safe, page-unique `id` — it is simultaneously the <section id>, the contents href, the deep-link target and the aria-current key.",
      "DO NOT hand-roll this from CenteredShell + SplitPane + `.legal-*` CSS. The geometry is the easy half; the scroll spy, hash offset, focus handoff and aria-current wiring are what the shell exists to own, and no token can express them.",
      "DO NOT add a consumer `className` for the measure, the rail width, the section rhythm or the dividers — every one of those is a --legal-document-* token. Dividers default to `none` (rule #44): opt in with `--legal-document-toc-border: 1px solid hsl(var(--border))`.",
      "DO NOT expect a viewport media query: the shell owns its query container, so the one-column ⇄ two-column split (56rem) is decided by the SHELL's own width. Below it the contents are a STATIC compact block (never pinned on a phone); above it they are a sticky rail.",
    ],
    useCases: [
      'Hosted legal terms/privacy screen (SCR-005): <CenteredShell width="lg" topbar={<Topbar …/>}><LegalDocumentShell title="利用規約" version="2.4" effectiveDate="2026-04-01" contentsLabel="目次" sections={sections} activeSection={active} onActiveSectionChange={setActive} documentNavigation={<DocumentSwitcher/>} footerAction={<Button>同意する</Button>} /></CenteredShell>',
      "In-app policy viewer inside a Dialog/Sheet during onboarding: the same `sections` with `footerAction` carrying the accept button; the shell stays single-column because its container is narrow.",
      "Deep-linkable DPA / sub-processor document: link to /legal/dpa#data-retention — the shell selects, scrolls to (with the scroll offset) and focuses that section on arrival.",
      "Multi-document legal set (Terms · Privacy · Cookies): render the switcher in `documentNavigation` so it sits above the contents in the sticky rail.",
    ],
    related: [
      "CenteredShell — the page shell to put a LegalDocumentShell inside (brand bar + centred column + footer). LegalDocumentShell is the document, not the page chrome; never nest two shells of the same kind.",
      "SplitPane — a generic main + fixed aside. It gives similar GEOMETRY but owns no scroll-spy / hash / focus behaviour, so it is the wrong pick for a document with a table of contents.",
      "PageContainer — for a titled section inside an app page; LegalDocumentShell already renders its own document header (h1 + version + effective date + summary).",
      "Text / Heading — compose the section `content` from these; the shell only supplies the section heading (h2) and the body wrapper.",
    ],
    example: `import { LegalDocumentShell, CenteredShell, Flex, Topbar } from "@godxjp/ui/layout";
import { Button, Text } from "@godxjp/ui/general";
import { useState } from "react";

export function TermsPage() {
  const [activeSection, setActiveSection] = useState("acceptance");

  return (
    <CenteredShell width="lg" topbar={<Topbar start={<Brand />} />}>
      <LegalDocumentShell
        title="利用規約"
        version="2.4"
        effectiveDate="2026-04-01"
        summary="本規約は、当社が提供するサービスの利用条件を定めるものです。"
        contentsLabel="目次"
        activeSection={activeSection}
        onActiveSectionChange={setActiveSection}
        sections={[
          { id: "acceptance", title: "第1条(本規約への同意)", content: <Text as="p">…</Text> },
          { id: "accounts", title: "第2条(アカウントの管理)", content: <Text as="p">…</Text> },
        ]}
        documentNavigation={
          <Flex direction="col" gap="xs" role="group" aria-label="法的文書">
            <Button variant="secondary" size="sm" fullWidth aria-current="page">利用規約</Button>
            <Button variant="ghost" size="sm" fullWidth>プライバシーポリシー</Button>
          </Flex>
        }
        footerAction={<Button size="sm">同意する</Button>}
      />
    </CenteredShell>
  );
}`,
    storyPath: "layout/LegalDocumentShell.stories.tsx",
    rules: [23, 24],
  },
  {
    name: "Breadcrumb",
    group: "layout",
    tagline: "Standalone breadcrumb nav rendering an ordered trail of page segments.",
    props: [
      {
        name: "items",
        type: "BreadcrumbItemProp[]",
        required: true,
        description: "Array of { label, to? } — omit `to` on the last (current) segment.",
      },
      {
        name: "aria-label",
        type: "string",
        description:
          'Override the nav landmark\'s accessible name (defaults to a localized "Breadcrumb"). Required when more than one Breadcrumb renders on the same page/view — two nav landmarks sharing one name/role fail landmark-unique.',
      },
    ],
    usage: [
      "DO import from `@godxjp/ui/layout` (not from a navigation or general sub-path) and pass a single `items` prop — an ordered array of `{ label, to? }` objects. No children, no sub-components, no render-prop API.",
      'DO omit `to` on the last (current-page) segment — the component automatically renders it as a `<span aria-current="page">` instead of a router `<Link>`. Passing `to` on the last item does NOT make it a link; drop it intentionally.',
      "DO pass the Breadcrumb node as a ReactNode to the `breadcrumb` prop of `AppShell` (or `AppShell`) for shell-level breadcrumbs, or to `PageContainer`'s `breadcrumb` prop (which accepts `BreadcrumbItemProp[]` directly — not a ReactNode). When passing to `PageContainer`, pass the raw array; when passing to `AppShell`, wrap it: `breadcrumb={<Breadcrumb items={…} />}`.",
      'DON\'T hand-roll a breadcrumb strip (divs with chevrons, anchors, separators) — Breadcrumb ships the `<nav aria-label="Breadcrumb">` + `<ol>` + `aria-hidden` chevrons. Any custom trail is a violation of the no-hand-roll rule and will fail `npm run ui:audit`.',
      "DON'T use Breadcrumb for tab-style or step-style navigation (multi-step forms, wizard progress). Those flows belong to `Steps`. Breadcrumb is strictly a spatial location trail, not a process indicator.",
      "The component is fully uncontrolled and stateless — it renders whatever `items` you pass. Dynamic breadcrumbs (route-derived, breadcrumb context, etc.) must be assembled in the parent and passed down as a plain array; there is no internal routing awareness.",
    ],
    useCases: [
      "Per-page location trail on any admin page deeper than two levels — e.g. Home → Accounting → Invoices → Invoice #1042 — passed to `PageContainer`'s `breadcrumb` prop so it appears above the page `<h1>`.",
      "Persistent shell-level breadcrumb in a `AppShell` or `AppShell` layout that updates as the user navigates between Inertia/React Router pages; constructed from route params and passed as a ReactNode to `AppShell`'s `breadcrumb` prop.",
      "Master-detail drill-down in an accounting app: the detail page (journal entry, partner, bank account) shows a breadcrumb back to the list and to the domain root, giving the user a one-click escape without using the browser back button.",
      "Embedded sub-panel breadcrumb inside a `SplitPane` or `Sheet` where a secondary content area has its own navigable hierarchy and needs a compact location indicator.",
      "Audit log or document history page where the entity being reviewed (invoice, payment) is the current segment and the parent module (Accounting, Receivables) is a clickable ancestor.",
      "Prefetch pairing: wrap ancestor segments' `to` values with `PrefetchLink` semantics by putting them in `items` — each non-last item with `to` is already rendered as a router `<Link>`, so hovering naturally prefetches if `PrefetchLink` is used elsewhere on the same route.",
    ],
    related: [
      "PageContainer — accepts `breadcrumb` as `BreadcrumbItemProp[]` (raw array, not a ReactNode); use this when each page owns its own breadcrumb and you want it co-located with the page title, actions, and body.",
      "AppShell — accepts `breadcrumb` as `ReactNode`; pass `<Breadcrumb items={…} />` here when the breadcrumb is a persistent shell-level strip that sits above all page content rather than being owned by individual pages.",
      "Steps — use instead of Breadcrumb when showing progress through an ordered multi-step flow (wizard, checkout, onboarding); Steps conveys sequence and completion state, not spatial location.",
      "PrefetchLink — if ancestor breadcrumb segments should prefetch their destination query on hover/focus, consider pairing the `to` values with `PrefetchLink` in a custom breadcrumb or pre-warming the cache on mount; Breadcrumb's internal links are plain react-router-dom `<Link>` with no prefetch behaviour.",
    ],
    example: `import { Breadcrumb } from "@godxjp/ui/layout";

<Breadcrumb items={[
  { label: "ホーム", to: "/" },
  { label: "会員管理", to: "/members" },
  { label: "田中 太郎" },
]} />`,
    storyPath: "layout/Breadcrumb.stories.tsx",
    rules: [],
  },

  // ─── general ────────────────────────────────────────────────────────────
  {
    name: "Button",
    group: "general",
    tagline: "Core button with variant + size presets, built on cva and Radix Slot (asChild).",
    props: [
      {
        name: "variant",
        type: '"default" | "destructive" | "outline" | "dashed" | "secondary" | "ghost" | "link"',
        defaultValue: '"default"',
        description:
          "Visual style. `dashed` = outline with a dashed border (Ant-style add-row / placeholder action).",
      },
      {
        name: "size",
        type: '"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"',
        defaultValue: '"default"',
        description: "Size preset (height, padding, icon dims).",
      },
      {
        name: "shape",
        type: '"default" | "pill" | "sharp"',
        defaultValue: '"default"',
        description:
          "Corner radius from the tokens — `default` (control radius), `pill` (fully rounded, --radius-pill), `sharp` (square, --radius-sharp). Use the prop instead of a `rounded-*` className.",
      },
      {
        name: "fullWidth",
        type: "boolean",
        defaultValue: "false",
        description:
          'Span the full container width (`width:100%`) instead of sizing to content. Use the prop instead of `className="w-full"` for stacked / auth-form / dialog-footer actions (rule #42).',
      },
      {
        name: "asChild",
        type: "boolean",
        defaultValue: "false",
        description: "Render as Radix Slot — merge props onto the child (<a>/<Link>).",
      },
      { name: "disabled", type: "boolean", description: "Disable the button." },
      {
        name: "loading",
        type: "boolean",
        defaultValue: "false",
        description:
          'In-flight state — shows a leading `Loader2` spinner (replaces a leading icon if present), sets `aria-busy="true"`, and blocks activation (non-interactive, pointer-events disabled) while keeping the label visible so the width doesn\'t jump. Prefer this over a hand-rolled `<Loader2 className="animate-spin">` inside the button. Ignored when `asChild` (Slot requires a single child).',
      },
      {
        name: "loadingText",
        type: "string",
        description:
          "Optional label to swap in while `loading` (pass the `t()`-translated string, e.g. `loadingText={t('saving')}`). When omitted the original children stay beside the spinner.",
      },
      {
        name: "onClick",
        type: "React.MouseEventHandler<HTMLButtonElement>",
        description: "Click handler. Does not fire while `loading` or `disabled`.",
      },
      {
        name: "count",
        type: "number",
        description:
          'Trailing borderless counter pill after the label (filter tabs / segmented toggles, e.g. "Chờ bay 18"). Localized via `Intl.NumberFormat`; styled per variant — never nest a `Badge` in a Button for this. Ignored when `asChild`.',
      },
      {
        name: "overflowCount",
        type: "number",
        defaultValue: "99",
        description:
          "Cap for `count` (Ant Badge parity) — when `count` exceeds it the pill renders `{overflowCount}+` (e.g. `99+`).",
      },
      {
        name: "showZero",
        type: "boolean",
        defaultValue: "true",
        description:
          "Whether the pill renders when `count` is 0 (Ant Badge parity). Pass `false` to hide the pill at zero.",
      },
    ],
    usage: [
      "DO pick the right variant for intent: `default` (primary CTA, one per section), `destructive` (irreversible actions like delete/revoke), `outline` (secondary actions alongside a primary), `secondary` (less prominent actions), `ghost` (toolbar icon-only actions), `link` (inline text-style navigation without an underline by default).",
      "DO use icon-only sizes (`icon`, `icon-xs`, `icon-sm`, `icon-lg`) exclusively for buttons that contain only an SVG — these sizes set equal width/height. For text+icon buttons use `default|sm|lg|xs` sizes; icons inside are auto-sized to 1rem via `[&_svg:not([class*='size-'])]:size-4`.",
      "DO use `asChild` to render the button as a React Router/Inertia `<Link>` or native `<a>` while keeping all button styling and a11y: `<Button asChild variant=\"outline\"><Link href={route('invoices.show', id)}>詳細</Link></Button>`. Never wrap a `<button>` around an `<a>` — that is invalid HTML.",
      "DON'T use raw `<button>` elements anywhere in the UI — always use this `Button`. The only exception is an `aria-hidden` native control used as an e2e/a11y hook paired with a visible godx-ui control.",
      'DO set `type="submit"` explicitly on form submit buttons (the default HTML button type inside `<form>` is already `submit`, but being explicit prevents accidental double-submissions when a `type="button"` sibling exists). For cancel/reset actions set `type="button"` to avoid accidental form submission.',
      "DON'T apply raw padding, height, or `rounded-*` overrides to `Button` via `className` — the size variants encode the full box model. If a custom size is truly needed, use `buttonVariants` from `@godxjp/ui/general` to compose a new cva class rather than fighting the existing ones.",
      "DO use the `loading` prop for async/pending actions instead of hand-rolling `<Loader2 className=\"animate-spin\">` inside the button — `loading` renders the spinner, sets `aria-busy`, and blocks activation for you; pair with `loadingText={t('saving')}` to swap the label. For a TanStack Query refetch use `ButtonRefetch` (it owns its own loading lifecycle) rather than wiring `loading` manually.",
    ],
    useCases: [
      'Primary form submission in a Dialog or Sheet (e.g. `<Button type="submit" disabled={form.processing}>保存</Button>`) — the `disabled` prop greys it out and blocks pointer events, preventing double-submit during async operations.',
      'Destructive confirmation inside a Dialog — pair `tone="destructive"` Button as the confirm action and `variant="outline"` as Cancel; never use `variant="default"` for a delete action.',
      'Icon-only toolbar actions in a DataTable column (edit, delete, copy) using `size="icon-sm"` + `variant="ghost"` + a Lucide icon child — gives equal-width square targets that don\'t distort the row.',
      "Navigation links styled as buttons (e.g. 'New Invoice', 'Back to list') using `asChild` + Inertia `<Link>` — preserves SPA navigation while using the button's visual treatment.",
      "Async mutation trigger in an accounting workflow (e.g. 'Sync from MF', 'Export CSV') — disable on processing state; pair with `AlertMutationFeedback` for error/retry UI rather than inline `try/catch` alerts.",
      "Refetch / retry trigger when NOT using TanStack Query — for manual cache refresh inside a TanStack Query context use `ButtonRefetch` instead, which owns its own `disabled`/`onClick` lifecycle.",
    ],
    related: [
      "DropdownMenu — when a button needs to reveal a list of actions (e.g. 'Actions ▾' in a DataTable row), wrap the Button as a `DropdownMenuTrigger` inside a `DropdownMenu` compound; don't open a Sheet/Dialog just to show a list of options.",
      "ButtonRefetch — a pre-wired Button variant from `@godxjp/ui/query` that binds directly to a TanStack Query result (shows spinner, auto-disables while fetching, retries on click). Use it instead of a raw Button whenever the action is a query refetch — do not pass `onClick`/`disabled` to it manually.",
      "AlertMutationFeedback — for surfacing mutation errors and a retry action; it renders its own retry Button internally. Do not add a separate Button alongside AlertMutationFeedback for the same mutation.",
      "PrefetchLink — use when the goal is purely navigation with hover-prefetch (Inertia v3 prefetch); it renders as an `<a>` not a button. Only reach for `Button asChild + Link` when the navigation control must look like a button (primary CTA style).",
    ],
    example: `import { Button } from "@godxjp/ui/general";
import { Trash2 } from "lucide-react";

<>
  <Button>保存</Button>
  <Button variant="outline" size="sm">編集</Button>
  <Button variant="ghost" size="icon-sm"><Trash2 className="size-4" /></Button>
</>`,
    storyPath: "general/Button.stories.tsx",
    rules: [23],
  },
  {
    name: "Text",
    group: "general",
    tagline:
      'Typographic primitive — use INSTEAD of a hand-rolled `<span className="text-[13px] font-medium text-muted-foreground">`. Size is a type-scale step (never px); tone/weight are tokens.',
    props: [
      {
        name: "size",
        type: '"2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl"',
        defaultValue: '"sm"',
        description:
          "Golden-ratio type-scale step (2xs…2xl). NEVER an arbitrary px (`text-[13px]` is banned) — pick the nearest step.",
      },
      {
        name: "tone",
        type: '"default" | "muted" | "primary" | "success" | "warning" | "destructive" | "info"',
        defaultValue: '"default"',
        description:
          "Semantic foreground colour. Replaces `text-muted-foreground` etc. on a raw span.",
      },
      {
        name: "weight",
        type: '"regular" | "medium" | "bold"',
        defaultValue: '"regular"',
        description:
          "Font weight — the 3-weight canon: regular 400 (body), medium 500 (label), bold 700 (emphasis). 600/semibold is forbidden.",
      },
      { name: "align", type: '"start" | "center" | "end"', description: "Logical text alignment." },
      {
        name: "truncate",
        type: "boolean",
        description: "Single-line ellipsis. Mutually exclusive with `clamp` (`clamp` wins).",
      },
      {
        name: "clamp",
        type: "number",
        description:
          "Multi-line clamp — max rendered lines (integer ≥ 1); overflow ends in an ellipsis. The token-owned line-clamp: NEVER write a page-local `line-clamp-N` utility (rule #2). Visual-only — the full text stays in the DOM / accessible name. Mutually exclusive with `truncate` (`clamp` wins; dev builds warn).",
      },
      { name: "tabular", type: "boolean", description: "Tabular figures for aligned numbers." },
      { name: "mono", type: "boolean", description: "Monospace family for codes / ids." },
      {
        name: "as",
        type: '"span" | "p" | "div" | "label" | "strong" | "em" | "small" | "code" | "kbd" | "dt" | "dd" | "caption" | "abbr"',
        defaultValue: '"span"',
        description: "Rendered element. `code`/`kbd` are monospace by default.",
      },
      {
        name: "htmlFor",
        type: "string",
        description:
          "When set, Text renders as a `<label>` bound to this control id (polymorphic label use).",
      },
    ],
    usage: [
      "DO use `<Text>` for ALL body / inline / caption text instead of a styled `<span>`/`<p>`. Pick `size` from the scale; never write `text-[13px]`/`text-[11px]` or `font-semibold` by hand.",
      'DO use `tone` for colour (`muted`/`primary`/semantic), `tabular` for numbers, `mono` for codes — not `className="text-muted-foreground font-mono tabular-nums"`.',
      'DO use `clamp={n}` for a description limited to n lines (card grids) and `truncate` for a one-line ellipsis — never `className="line-clamp-2"` (banned utility). They are mutually exclusive; `clamp` wins.',
      "For a heading, use `<Heading level>` instead of a large-size `<Text>`.",
    ],
    useCases: [
      'A muted caption under a value: `<Text size="xs" tone="muted">2026年5月度</Text>`.',
      'A monospace id in a list row: `<Text size="xs" mono tone="muted">RC-204881</Text>`.',
      'An emphasized inline figure: `<Text weight="medium" tabular>¥1,240,000</Text>`.',
      'A service-card description clamped to 2 lines on a narrow (390px) index: `<Text as="p" size="sm" tone="muted" clamp={2}>{description}</Text>`.',
    ],
    storyPath: "general/typography.tsx",
    rules: [2, 23],
    example: `import { Text } from "@godxjp/ui/general";

<Text size="xs" tone="muted">補助テキスト</Text>
<Text weight="medium" tabular>¥1,240,000</Text>
<Text size="xs" mono tone="muted">RC-204881</Text>`,
  },
  {
    name: "Heading",
    group: "general",
    tagline:
      "Section heading sized from the --heading-h* tokens. `level` sets the size AND the semantic <h1..h4>.",
    props: [
      {
        name: "level",
        type: "1 | 2 | 3 | 4",
        defaultValue: "2",
        description: "Heading level — sizes from --heading-h{1..4} and renders the matching <h*>.",
      },
      {
        name: "as",
        type: '"h1" | "h2" | "h3" | "h4" | "div"',
        description: "Override the rendered element (e.g. a visual h2 that is a real <h1>).",
      },
      {
        name: "tone",
        type: '"default" | "muted" | "primary" | "success" | "warning" | "destructive" | "info"',
        defaultValue: '"default"',
        description: "Semantic foreground colour.",
      },
      { name: "align", type: '"start" | "center" | "end"', description: "Logical text alignment." },
      { name: "truncate", type: "boolean", description: "Single-line ellipsis." },
    ],
    usage: [
      'DO use `<Heading level>` for section titles instead of a raw `<h2 className="text-lg font-semibold">`. The level drives both the token size and the semantic element.',
      "Inside a Card use `<CardTitle>`; use `<Heading>` for free-standing page/section headings not covered by a component slot.",
    ],
    useCases: [
      "A section heading on a dashboard: `<Heading level={3}>今月のKPI</Heading>`.",
      'A visually-smaller heading that must stay an <h1> for a11y: `<Heading level={1} as="h1">…</Heading>`.',
    ],
    storyPath: "general/typography.tsx",
    rules: [6, 23],
    example: `import { Heading } from "@godxjp/ui/general";

<Heading level={2}>請求書一覧</Heading>
<Heading level={3} tone="muted">補足セクション</Heading>`,
  },
  {
    name: "Logo",
    group: "general",
    tagline:
      "The product brand mark — a glyph/identity box, or (with `wordmark`) the full mark + wordmark LOCKUP. Tokenised size/radius/type/gap, and `size` scales every branch (boxed glyph, identity mark, lockup); the boxed fill reads --primary, while the GoDX identity mark and wordmark read the --brand IDENTITY role instead, so an action-colour re-theme never recolours the brand.",
    props: [
      {
        name: "glyph",
        type: "React.ReactNode",
        defaultValue: '"g"',
        description:
          'The brand glyph — a short mark (letter/initials) or a custom inline <svg>. Only read when mark="glyph".',
      },
      {
        name: "mark",
        type: '"glyph" | "godx"',
        defaultValue: '"glyph"',
        description:
          'Semantic mark artwork. "godx" renders THE CANONICAL GoDX IDENTITY MARK as an inline vector owned by the package — use it for hosted-identity surfaces (AuthShell brand bar, AuthIdentity, CenteredShell topbar); do NOT re-draw or import a brand SVG in the app. Its box + colour are tokenized (--logo-godx-size-{xs,sm,md,lg} driven by the `size` prop, pinnable at every tier via --logo-godx-size; --logo-godx-color, defaulting to the --brand IDENTITY role = canonical emerald #009766, never --primary and never the --success status green) and it drops the boxed fill/radius. "glyph" keeps the configurable boxed-glyph treatment.',
      },
      {
        name: "size",
        type: '"xs" | "sm" | "md" | "lg"',
        defaultValue: '"md"',
        description:
          'Box size tier (tokenised) — it applies to EVERY mark, including mark="godx". The boxed glyph reads --logo-size-* (md = 1.75rem); the identity mark reads its own --logo-godx-size-* scale (xs 1.5 / sm 1.75 / md 2 / lg 2.5rem — the artwork is a capsule inside a square viewBox, so it needs slightly more box to read at the same optical weight). On a `wordmark` lockup the tier scales the mark and the wordmark together. To freeze the identity box at ONE size across every tier, a service theme sets --logo-godx-size (unset by default).',
      },
      {
        name: "tone",
        type: '"primary" | "success"',
        defaultValue: '"primary"',
        description:
          'Semantic fill role. "success" names the IDENTITY slot, not the status role: it gives the canonical GoDX emerald mark without re-tinting the application\'s primary action colour (it reads --logo-success-background / --logo-success-foreground; the FILL defaults to the --brand role — independent of BOTH --primary and the --success status green, gh#250). The boxed glyph\'s INK defaults to --logo-identity-foreground (near-black), NOT --brand-foreground: --brand-foreground is the artwork KNOCKOUT colour and clears only 3.67:1 on the emerald, while a boxed glyph renders real TEXT and owes WCAG 2.2 SC 1.4.3\'s 4.5:1 (14px bold is not "large text"). Re-theming --brand to a DARK fill? Override --logo-success-foreground to re-invert the ink.',
      },
      {
        name: "wordmark",
        type: "React.ReactNode",
        description:
          'Readable product name rendered BESIDE the mark as ONE lockup — pass the localized product name (or an inline <svg> logotype when a real asset exists). Set it INSTEAD of hand-rolling `inline-flex items-center gap-2` around a Logo and a Text. The lockup root takes ref/className/…props; the mark becomes decorative and the wordmark text carries the accessible name, so the pair is announced once. Colour/face/weight/tracking/size and the mark↔wordmark gap are tokens (--logo-wordmark-*); on mark="godx" / tone="success" the wordmark is canonical emerald from the --brand identity role and NEVER reads --primary or --success. The wordmark span carries `data-logotype`: WCAG 2.2 SC 1.4.3 exempts brand-name artwork from the text-contrast minimum, so a consumer contrast audit must skip it rather than darken the brand colour. Omit for the bare mark (unchanged behaviour).',
      },
      {
        name: "label",
        type: "string",
        description:
          "Accessible name. Set → exposed as a named image (role img); omitted → decorative (aria-hidden), the correct default when a readable wordmark sits beside it. With `wordmark` set, `label` overrides the lockup's name (the wordmark text is otherwise the name).",
      },
    ],
    usage: [
      'DO import from `@godxjp/ui/general`: `import { Logo } from "@godxjp/ui/general";`',
      'DO use Logo INSTEAD of hand-rolling `<span aria-hidden className="grid size-7 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">g</span>` — that repeats literal size/radius and puts type utilities on a bare span (rules #45/#46).',
      "DO leave `label` unset when a readable wordmark sits beside the mark (shell header, topbar) — the mark stays decorative and the wordmark carries the accessible name. Set `label` only when the mark stands alone.",
      "DON'T pass more than 1–2 glyphs — the box is square and centres its content; a long string overflows. The product NAME goes in `wordmark`, never in `glyph`.",
      'DO use `wordmark` for the full lockup: `<Logo mark="godx" tone="success" wordmark="GoDX" />`. It replaces the hand-rolled `<span className="inline-flex items-center gap-2"><Logo/><Text/></span>` — the gap, face, weight, tracking, per-tier size and the brand colour are all tokens, so a shell header / auth brand bar needs no page CSS (gh#214).',
      "NOTE: the package ships NO wordmark ARTWORK — `wordmark` typesets the name in the design-system display face (`--logo-wordmark-font-family`). When design supplies a real logotype, pass it as an inline `<svg>` node to `wordmark`; do not approximate letterforms in CSS.",
      'DON\'T re-tint via `className="bg-*"` — the fill reads the `--primary` role token; retune it through a service theme (`--primary`, `--logo-radius`, `--logo-size-*`), not utilities.',
      "DO use `mark=\"godx\"` for the canonical GoDX identity mark on hosted-identity screens — it is ALREADY in the package as real inline vector artwork. DON'T pass a hand-drawn brand SVG as `glyph`, and don't ship a brand asset in the app, to reproduce it.",
    ],
    useCases: [
      'App-shell header brand lockup — `<Logo glyph="c" wordmark="CoreBooks" />` in the sidebar/topbar: mark decorative, wordmark readable, spacing tokenized.',
      'Auth screen — a standalone labelled mark above the sign-in form: `<Logo label="CoreBooks" size="lg" />`.',
      'Tenant/workspace switcher row — a small `size="sm"` mark as the leading slot of a ListRow or menu item.',
      "Custom SVG brand — pass an inline `<svg>` as `glyph` to render a real logomark on the primary fill instead of a letter.",
      'Hosted GoDX identity surface — `<Logo mark="godx" tone="success" />` in an AuthShell `brand` bar or inside <AuthIdentity>: the canonical GoDX mark the package already owns. There is no separate identity-mark component and no asset to import.',
      'Brand lockup in a shell header / auth brand bar — `<Logo mark="godx" tone="success" wordmark="GoDX" />`: one element, brand-green, no wrapper div and no page CSS.',
    ],
    related: [
      "AuthIdentity (@godxjp/ui/layout) — the canonical auth heading block; it already renders the GoDX mark, so don't add a second Logo above it.",
      "Text / Heading — only for a bespoke lockup the `wordmark` prop cannot express; for the ordinary mark + product name, use `wordmark` (it owns the gap, face and brand colour as tokens).",
      "Avatar — use Avatar for a PERSON/entity image or initials; use Logo for the PRODUCT brand mark. They look similar (square/rounded glyph) but carry different meaning.",
    ],
    storyPath: "general/Logo.stories.tsx",
    rules: [45, 46],
    example: `import { Logo } from "@godxjp/ui/general";

// Full lockup — mark + wordmark as ONE element (no wrapper, no page CSS).
<Logo glyph="c" wordmark="CoreBooks" />

// Canonical brand-green GoDX lockup — identity role, independent of --primary.
<Logo mark="godx" tone="success" wordmark="GoDX" />

// Bare mark standing alone → give it an accessible name.
<Logo label="CoreBooks" size="lg" />`,
  },
  {
    name: "Reveal",
    group: "general",
    tagline:
      "The official entrance-motion primitive (staggered fade-up) — reads DS motion tokens and honours prefers-reduced-motion, replacing hand-rolled @keyframes + .app-reveal/.d1..d6 classes.",
    props: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Content to reveal on enter.",
      },
      {
        name: "delay",
        type: "0 | 1 | 2 | 3 | 4 | 5 | 6",
        defaultValue: "0",
        description:
          "Stagger ordinal — an INDEX into the motion ladder, never a raw ms. Each step adds one `--reveal-stagger-step` of delay so a column of reveals cascades. 0 = enter immediately.",
      },
      {
        name: "asChild",
        type: "boolean",
        defaultValue: "false",
        description:
          "Merge the reveal onto the single child element (no wrapper <div>) — use when an extra box would break a grid/flex layout.",
      },
    ],
    usage: [
      "DO use <Reveal> INSTEAD of hand-rolling `@keyframes auth-fade-up` + `.app-reveal` + `.d1..d6` in a consumer global.css — that repeats literal durations/delays and violates the tokens-only rule. Reveal reads `--duration-slow` / `--ease-emphasized` / `--reveal-distance` / `--reveal-stagger-step`.",
      "DO stagger a list/column by passing an increasing `delay` (1, 2, 3…) to successive siblings — the ordinal maps to `--reveal-stagger-step`, so a service retunes the cascade rhythm from one token.",
      "DO pass `asChild` when wrapping an element that must keep its own box in a grid/flex row (the reveal merges onto that element instead of adding a <div>).",
      "DO rely on the built-in reduced-motion behaviour — under `prefers-reduced-motion: reduce` the animation is dropped and content renders in its final, fully-visible position with no layout shift. Never gate visibility on the animation.",
      "DO NOT set a raw ms delay or a literal translate distance — the whole point is that `delay` is a controlled ordinal and the distance/duration come from tokens.",
    ],
    useCases: [
      "Auth card entrance: `<AuthShell><Reveal><Card/></Reveal></AuthShell>` — the sign-in card fades up on load, respecting reduced-motion.",
      "Staggered dashboard: map stat cards with `<Reveal delay={i + 1}>` so the row cascades in.",
      "Section reveal on a settings/detail page — wrap each Card in <Reveal> for a calm entrance without hand-written CSS.",
      "asChild on a grid item: `<Reveal asChild delay={2}><ResponsiveGrid.Item/></Reveal>` keeps the grid cell intact while animating it in.",
    ],
    related: [
      "AuthShell — pairs with Reveal for the auth card entrance; AuthShell delegates all motion to Reveal.",
      "Card — the most common thing to wrap in <Reveal> (dashboard cards, auth card, settings sections).",
      "ResponsiveGrid — combine with `<Reveal delay={n}>` (or `asChild`) per grid item for a staggered grid reveal.",
    ],
    example: `import { Reveal } from "@godxjp/ui/general";
import { Card, CardContent } from "@godxjp/ui/data-display";

// single entrance
<Reveal>
  <Card><CardContent>…</CardContent></Card>
</Reveal>

// staggered column
{items.map((item, i) => (
  <Reveal key={item.id} delay={Math.min(i + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6}>
    <Card><CardContent>{item.label}</CardContent></Card>
  </Reveal>
))}`,
    storyPath: "general/Reveal.stories.tsx",
    rules: [],
  },
  // ─── data-display ───────────────────────────────────────────────────────
  {
    name: "DataTable",
    group: "data-display",
    tagline:
      "The one TanStack-powered compound admin list — sticky header, sorting, global search, column visibility ('set view'), bulk selection, BOTH cursor and numbered pagination, density, and built-in empty/loading states. Keep the SIMPLE `data` + lean `columns` (ColumnDef) API for the common case; opt into the full grid chrome via the compound parts. Internally driven by @tanstack/react-table (a real dependency). Lives on @godxjp/ui/data-display only (it is NOT on the runtime-neutral root/admin barrel because it pulls TanStack). This is the single table component — the former DataGrid has been merged in and removed. Never hand-roll a data.length===0 guard around it.",
    props: [
      {
        name: "data",
        type: "T[]",
        required: true,
        description:
          "Array of row data. When empty and loading is false, a built-in EmptyState renders automatically inside the table body — no external guard needed.",
      },
      {
        name: "columns",
        type: "ColumnDef<T>[]",
        required: true,
        description:
          "Lean column definitions (adapted to TanStack internally — `meta.lean` is the declared home for every custom column option, so `priority` needs no second TanStack channel). Each column: { key: string; header: ReactNode; ariaLabel?: string; render?: (row: T) => ReactNode; sortable?: boolean; width?: string; align?: 'left'|'center'|'right'; hiddenOnMobile?: boolean; enableHiding?: boolean; pin?: 'end'; priority?: 'primary'|'secondary'|'meta'|'actions' }. priority is the column-priority contract read by preset=\"action-collection\" (gh#253) — DataTable stamps it as data-priority on the <th> AND every <td> of the column, so the preset can allocate the narrow-frame measure; leave the free-text column unmarked (it takes the remaining space), and prefer priority over width under the preset because an explicit width utility wins the cascade and defeats the measure. If render is omitted, the raw value at row[key] is rendered as a string. sortable opts the column into the sort cycle (client-side by default, or server-side via sort+onSortChange). enableHiding (default true) lists the column in DataTable.ViewOptions; set false to keep a key/actions column always visible. pin:'end' sticks the column (typically row actions) to the inline-end edge on horizontal scroll with a separating shadow — pin at most one column. ariaLabel gives a VISUALLY-EMPTY header (header='' — an action or selection column) a screen-reader name (e.g. 'Actions'/'Select'): it renders as an sr-only label inside the <th> so the column is never nameless (axe: empty-table-header). DataTable dev-warns when a column has an empty header and no ariaLabel.",
      },
      {
        name: "getRowId",
        type: "(row: T) => string",
        defaultValue: "(row) => String(row.id)",
        description:
          "Extracts a stable unique string key per row. Required when selectable is true or rows lack an 'id' field. Falls back to row.id cast to string.",
      },
      {
        name: "selectable",
        type: "boolean",
        defaultValue: "false",
        description:
          "Adds a checkbox column and a SelectAll header checkbox. Use with selected + onSelectChange for controlled selection, or omit both for uncontrolled.",
      },
      {
        name: "selected",
        type: "Set<string>",
        description:
          "Controlled set of selected row IDs. Pair with onSelectChange. Omit for uncontrolled.",
      },
      {
        name: "onSelectChange",
        type: "(next: Set<string>) => void",
        description: "Called with the full new selection set after any checkbox interaction.",
      },
      {
        name: "onRowClick",
        type: "(row: T) => void",
        description:
          "Makes rows clickable for navigation. Row click is suppressed when the user clicks an interactive descendant (button, a, input, select, textarea, [role=menuitem]).",
      },
      {
        name: "density",
        type: "'compact' | 'default' | 'comfortable'",
        defaultValue: "'compact'",
        description:
          "Controlled row density across all three tiers (compact 28 / default 36 / comfortable 48) — drive it from a 表示密度 radio. Omit to let DataTable manage it internally (DataTable.DensityToggle flips compact↔comfortable).",
      },
      {
        name: "onDensityChange",
        type: "(density: 'compact' | 'default' | 'comfortable') => void",
        description:
          "Called when the user toggles density. Only needed when density is controlled.",
      },
      {
        name: "striped",
        type: "boolean",
        defaultValue: "false",
        description: "Zebra-stripe the body rows (even rows get a subtle muted fill).",
      },
      {
        name: "hoverable",
        type: "boolean",
        defaultValue: "false",
        description:
          "Highlight a row on hover even when it is not clickable. onRowClick already implies hover; use this for read-only tables that still want the hover affordance.",
      },
      {
        name: "stickyHeader",
        type: "boolean",
        defaultValue: "true",
        description:
          "Pin the header to the top while the body scrolls (ヘッダ追従). Set false to let it scroll away with the rows.",
      },
      {
        name: "preset",
        type: "'default' | 'action-collection'",
        defaultValue: "'default'",
        description:
          "Named collection contract (gh#253) — the SAME preset the Table primitive owns, forwarded to the table DataTable renders. 'default' emits NO attribute and matches no selector, so an existing DataTable is byte-identical. 'action-collection' is the canonical dense approval/action queue: below collapseBelow the desktop INTRINSIC column widths give way to the token-owned column-PRIORITY measures (--table-action-collection-*) under table-layout: fixed, cells wrap, and the bordered surface drops its --table-surface-min-inline-size floor — so requester · target · reason · requested date · row actions all stay inside a 390px frame with no horizontal scroll. Mark each column with `priority` on its ColumnDef. Semantics are untouched (no display change, no role rewriting, no card swap), so header association, aria-sort and screen-reader table navigation are identical at 390 and 1440. Measured: table 1182 / 766 / 388px at 1440 / 1024 / 390, document scrollWidth === clientWidth at every width, LTR and RTL.",
      },
      {
        name: "collapseBelow",
        type: "'sm' | 'md' | 'lg' | 'xl'",
        defaultValue: "'sm'",
        description:
          "Step at which preset=\"action-collection\" switches to the compact priority measures, measured against the TABLE'S OWN container (a container query on sm 40rem · md 48rem · lg 64rem · xl 80rem), not the viewport — a table inside a master rail collapses before the page does. Ignored while preset is 'default'.",
      },
      {
        name: "sort",
        type: "{ key: string; direction: 'asc' | 'desc' }",
        description:
          "Active sort state (controlled/server surface). When provided alongside onSortChange, sortable columns show directional arrow icons and clicking the active column twice clears sort (calls onSortChange(undefined)). Omit both sort and onSortChange to sort client-side via TanStack.",
      },
      {
        name: "onSortChange",
        type: "(sort: { key: string; direction: 'asc' | 'desc' } | undefined) => void",
        description:
          "Called when a sortable column header is clicked. Receives undefined when sort is cleared (third click on same column). Providing sort or onSortChange opts into the controlled (server) sort surface; omit both and the table sorts client-side via TanStack.",
      },
      {
        name: "globalFilter / onGlobalFilterChange",
        type: "string / (next: string) => void",
        description:
          "Global search term surfaced by DataTable.Search. Omit both for client-side filtering; pass them to drive a server query (with manualFiltering).",
      },
      {
        name: "pagination / onPaginationChange / rowCount",
        type: "{ pageIndex: number; pageSize: number } / OnChangeFn / number",
        description:
          "Numbered-pagination state surfaced by DataTable.Pagination (page-size form). For server pagination pass all three (rowCount = total) with manualPagination; omit for client pagination.",
      },
      {
        name: "columnVisibility / onColumnVisibilityChange",
        type: "VisibilityState / OnChangeFn<VisibilityState>",
        description:
          "Column show/hide state surfaced by DataTable.ViewOptions ('set view'). Internal if omitted.",
      },
      {
        name: "manualSorting / manualFiltering / manualPagination",
        type: "boolean",
        defaultValue: "false",
        description:
          "Default false so the simple data+columns case sorts/filters/paginates in-browser. Set the relevant flag true and drive the matching state from your query for server-side behaviour.",
      },
      {
        name: "loading",
        type: "boolean",
        defaultValue: "false",
        description:
          "When true, swaps the body for SHAPED skeleton rows rendered inside the table's own grid (one border, aligned columns) — never a separate <SkeletonTable> in a Card (that double-borders). With React Query keepPreviousData, drive this off isPlaceholderData (pagination/search) || isLoading (first load), NOT isLoading alone. Suppresses the empty state while true.",
      },
      {
        name: "empty",
        type: "ReactNode",
        description:
          "Custom content rendered inside the table body when data is empty and loading is false. Defaults to a built-in EmptyState with a localised 'No data' message. Pass a custom <EmptyState title='...' description='...' action={...}/> to tailor the message.",
      },
      {
        name: "error",
        type: "ReactNode",
        description:
          "FAILURE state (gh#216). Pass error={isError} — `true` renders the built-in localized destructive EmptyState ('Couldn't load this list') announced with role='alert'; any other node REPLACES that copy (e.g. an <Alert> carrying an error code + request id). `false`/`undefined` means the read succeeded. NEVER pass a raw Error object (it is not renderable). Suppresses the empty state.",
      },
      {
        name: "denied",
        type: "ReactNode",
        description:
          "PERMISSION-DENIED state (gh#216) — the read was REFUSED (403), not failed. `true` renders the built-in localized warning EmptyState ('You don't have access to this list') with NO retry, announced politely (aria-live) because a permission boundary is expected information, not a fault. Takes precedence over `error`. Any other node replaces the copy.",
      },
      {
        name: "onRetry",
        type: "() => void",
        description:
          "Retry handler surfaced as a Retry button inside the BUILT-IN error state only. Omit it to render the error without a retry affordance; it is intentionally never offered for `denied` (repeating a 403 cannot succeed).",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes applied to the root wrapper div (ui-data-table-root).",
      },
      {
        name: "children",
        type: "ReactNode",
        description:
          "Compound sub-parts: DataTable.Toolbar, DataTable.Search (global filter), DataTable.ViewOptions (column show/hide), DataTable.SelectAll, DataTable.BulkActions (ReactNode children OR a (count)=>node render-prop), DataTable.DensityToggle, DataTable.Pagination (cursor first/next when given cursor+hasMore+onChange, else numbered page-size form), DataTable.RowActions (kebab trigger), DataTable.Content. If no DataTable.Content is present in children, one is auto-rendered.",
      },
    ],
    usage: [
      "DO pass loading={isFetching} during data fetches — it renders a loading row in the table body and suppresses the empty state. Never show a spinner outside DataTable while the table is visible.",
      "DO NOT add a data.length===0 conditional around DataTable. When data is empty and loading is false, the built-in EmptyState renders automatically. Pass empty={<EmptyState title='...'/>} only when you need a custom message.",
      "SIX STATES, ZERO HAND-ROLLING (gh#216): loading (`loading`), empty (automatic / `empty`), error (`error` + optional `onRetry`), denied (`denied`), pagination (`DataTable.Pagination`), row actions (`DataTable.RowActions`). Wire them straight off the query — `<DataTable loading={isPending} error={isError} denied={status === 403} onRetry={refetch} …/>` — and never branch the page around the table to render your own alert/empty/forbidden block. Precedence is loading > denied > error > empty > rows, so exactly one state ever shows.",
      "DO provide getRowId when selectable is true or when rows do not have a string/number 'id' field — the default falls back to row.id and silently returns '' for missing IDs, which breaks selection.",
      "DO use DataTable.Toolbar as the immediate child that wraps search/filter controls on the left and DataTable.DensityToggle/action buttons on the right. DataTable.BulkActions inside the toolbar auto-hides when selection count is 0; it accepts either plain ReactNode children (built-in 'N selected' status bar) or a (count)=>node render-prop (you own the whole bar).",
      "DO reach for the grid chrome (DataTable.Search, DataTable.ViewOptions, DataTable.Pagination pageSizeOptions) when you need global search, a column 'set view' picker, or numbered pagination — these are the merged former-DataGrid features, now on the one DataTable. Drive them client-side by default; pass the matching state + manual* flag for a server query.",
      "DataTable.Pagination OWNS ITS OWN INSET (gh#236, fixed in 18.6.0). The footer is a self-contained slot: it declares `padding-block` + `padding-inline` from `--table-pagination-padding-{y,x}` (block default = `--space-stack-sm`, inline default = `--table-cell-space-x`, so the 'rows per page' label lands on the same optical axis as the first column's text). Before the fix it declared `padding-top` only, so inside the documented flush container (`<Card><CardContent flush><DataTable/>`) the label and page-size Select sat flush against the container edge and border. DON'T ship a local `.ui-data-table-pagination { padding: … }` override in an app — retune the two tokens in your theme instead.",
      'RESPONSIVE APPROVAL / ACTION QUEUE (gh#253): reach for `preset="action-collection"` when a dense five-column queue (requester · target · reason · requested date · row actions) must stay readable at 390px, and give every column a `priority` on its ColumnDef — `primary` (the row subject), `secondary` (its target), `meta` (a timestamp/id), `actions` (the row-action affordance, whose measure is reserved FIRST so it can never be pushed off-screen). Leave the free-text column unmarked; it takes the remaining space. This is the SAME contract, the SAME `--table-action-collection-*` tokens and the SAME container query as `Table preset="action-collection"` — there is no separate DataTable family. Never add a consumer width, a hidden column, `hiddenOnMobile` or a page-local breakpoint to make a table fit: retune the tokens instead.',
      "DON'T set `width` on a column that also has a `priority` — an explicit width utility wins the cascade over the priority measure and re-opens the horizontal scroll. Under the preset, `pin: 'end'` is also redundant: nothing scrolls sideways, so the actions column is already in frame.",
      'The DataTable surface\'s narrow-viewport width floor is `--table-surface-min-inline-size` (default 640px, released at the `sm` viewport step). It used to be a hard-coded `min-w-[640px] sm:min-w-0` utility pair on the surface — the literal that forced the horizontal scroll at 390. Retune (or zero) the token in your theme; `preset="action-collection"` already opts out of it.',
      "DO use ColumnDef.render for custom cell content (Badge, Link, RowActions). For plain string/number fields render can be omitted — DataTable falls back to String(row[key]).",
      "DO give every visually-empty column an accessible header via `ariaLabel` — a row-actions column (`header: ''`, `pin: 'end'`) sets `ariaLabel: t('actions')`, so screen readers announce the column and axe reports no `empty-table-header`. DataTable dev-warns any column that renders a `<th>` with neither visible text nor an `ariaLabel`. The selection column added by `selectable` is already named by its SelectAll checkbox — no `ariaLabel` needed there.",
      "COLUMN SEMANTICS + KEYBOARD: a `sortable` header renders as a real <button> inside the <th> with `aria-sort` (ascending/descending/none) on the <th>; it is Tab-reachable and toggles asc → desc → cleared on Enter/Space/click. A selection column exposes a header 'select all' Checkbox (indeterminate when a subset is selected) and a per-row Checkbox, each keyboard-operable with Space. An action column is visually empty but carries an `ariaLabel`; its per-row controls (kebab menu / buttons) own their own accessible names and keyboard behavior. Row click (`onRowClick`) is suppressed when the user activates an interactive descendant.",
      "DO NOT nest DataTable.Content in a conditional — it is already guarded internally. If you need to override the table body slot, drop exactly one <DataTable.Content /> in children; DataTable auto-detects it by displayName and skips the default.",
    ],
    useCases: [
      "Admin list pages (invoices, customers, orders, accounts) where rows are clickable for detail navigation via onRowClick.",
      "Bulk-action workflows (e.g. mark invoices paid, export selected rows) — use selectable + DataTable.BulkActions to show contextual action buttons only when something is selected.",
      "Server-side sorted tables: pass sort + onSortChange and update the data prop after the API call; DataTable renders asc/desc/neutral icons on the header automatically.",
      "Cursor-paginated lists: add DataTable.Pagination with cursor + hasMore + onChange inside children to get First/Next navigation without offset arithmetic. For page-size + numbered prev/next instead, use DataTable.Pagination with pageSizeOptions (no cursor/onChange) driven by the internal TanStack pagination.",
      "Full grid screens (global search + column 'set view' + numbered pagination): compose DataTable.Search, DataTable.ViewOptions, DataTable.DensityToggle in the toolbar and DataTable.Pagination pageSizeOptions={[…]} — client-side by default, or server-side by passing globalFilter/pagination/sort state with the matching manual* flag.",
      'Responsive admin tables where lower-priority columns (e.g. internal IDs, dates) should collapse below mobile breakpoints — set hiddenOnMobile: true on those ColumnDef entries. When the columns must all stay DISCOVERABLE at 390 instead (an approval/action queue), use preset="action-collection" + ColumnDef.priority rather than hiding anything.',
      "Access-approval / action queues at 390px (SCR-105, gh#253): preset=\"action-collection\" + a priority on each ColumnDef keeps requester · target · reason · requested date · row actions inside the initial narrow frame with no page-local CSS, no consumer width, no hidden column and no horizontal scroll — see the DataTable 'Approval queue' example page.",
      "Loading skeletons during initial page load or filter change: set loading={true} alongside an empty data={[]} to show the loading row without flashing an empty state.",
    ],
    related: [
      "Table — raw primitive (TableHeader/TableBody/TableRow/TableCell). Use DataTable instead; only reach for Table directly when you need a non-standard layout that DataTable cannot express.",
      "SkeletonTable — standalone skeleton placeholder rendered before any DataTable mounts (e.g. in a Suspense fallback or deferred-prop skeleton slot). DataTable.loading covers in-table loading; SkeletonTable covers pre-mount skeletons.",
      "EmptyState — standalone empty state for non-table lists. DataTable already embeds EmptyState in its body; only use bare EmptyState for card content, non-tabular lists, or zero-state pages outside a DataTable.",
      "LineChart / BarChart / AreaChart / PieChart (@godxjp/ui/charts) — when the SHAPE or trend of aggregated data matters more than exact per-row figures, visualize it with a chart instead of (or alongside) the table; keep DataTable when users need to read, sort, or act on individual rows.",
      "DataState / InfiniteQueryState — TanStack Query lifecycle widgets from @godxjp/ui/query. Prefer these over DataTable when your list is driven by useQuery/useInfiniteQuery and you want automatic skeleton/empty/error handling at the query level rather than at the table level.",
    ],
    example: `import { useState } from "react";
import { Badge, DataTable, type ColumnDef } from "@godxjp/ui/data-display";
import { EmptyState } from "@godxjp/ui/data-display";

type Invoice = {
  id: string;
  customer: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
};

const columns: ColumnDef<Invoice>[] = [
  { key: "id", header: "Invoice #", width: "w-32" },
  { key: "customer", header: "Customer" },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <Badge
        variant={
          row.status === "paid" ? "success" : row.status === "overdue" ? "destructive" : "secondary"
        }
      >
        {row.status}
      </Badge>
    ),
  },
  { key: "amount", header: "Amount", align: "right", sortable: true },
];

export default function InvoiceList({
  invoices,
  loading,
}: {
  invoices: Invoice[];
  loading: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | undefined>();

  return (
    <DataTable
      data={invoices}
      columns={columns}
      getRowId={(row) => row.id}
      selectable
      selected={selected}
      onSelectChange={setSelected}
      sort={sort}
      onSortChange={setSort}
      loading={loading}
      empty={
        <EmptyState
          title="No invoices found"
          description="Adjust your filters or create a new invoice."
        />
      }
    >
      <DataTable.Toolbar>
        <DataTable.BulkActions>
          <button type="button" onClick={() => setSelected(new Set())}>
            Mark paid
          </button>
        </DataTable.BulkActions>
        <DataTable.DensityToggle />
      </DataTable.Toolbar>
    </DataTable>
  );
}`,
    storyPath: "data-display/DataTable.stories.tsx",
    rules: [24, 31, 35, 37],
  },
  {
    name: "Card",
    group: "data-display",
    tagline:
      'Surface container with optional accent stripe, variant fill, size, and density. ⚠️ The bare <Card> has NO inner padding — body content MUST be wrapped in <CardContent> (titles in <CardHeader>), or it sits FLUSH against the card edges. Never hand-roll padding with className="p-4"; use <CardContent>. Compose with CardHeader/CardTitle/CardContent/CardFooter. For a tab/toolbar/filter strip (view tabs, list controls) use <CardBar extra={…}> — a positionable bar that auto-draws its separator from its position (top→bottom border, bottom→top border, middle→both) and pins `extra` content to the inline-end edge; place it as first/last child of the Card. Never hand-roll a bordered div for this.',
    props: [
      {
        name: "accent",
        type: '"primary" | "success" | "warning" | "info" | "attention" | "destructive"',
        description:
          "Semantic accent TONE. Where it is drawn is `accentPlacement`'s job — by default a leading-edge stripe on `border-inline-start` at the `--card-accent-rail-width` measure (6px).",
      },
      {
        name: "accentPlacement",
        type: '"edge" | "perimeter"',
        defaultValue: '"edge"',
        description:
          'Where `accent` is drawn. "edge" is the classic leading rail. "perimeter" is the FULL attention border — the whole edge in the accent tone, at the same optical weight as `variant="featured"` but tone-owned, so a card can read as "action required" (accent="attention") or "failed" (accent="destructive") without borrowing the brand colour. Inert without `accent`. Switching placement never shifts the body text: the rail\'s slot-padding compensation is undone with it.',
      },
      {
        name: "variant",
        type: '"default" | "muted" | "outline" | "featured"',
        defaultValue: '"default"',
        description:
          'Surface fill style. `featured` is the BRAND perimeter; its colour is now the `--card-featured-border-color` knob rather than a hard-coded `--primary`. For a perimeter in a semantic tone use `accent` + `accentPlacement="perimeter"` instead.',
      },
      {
        name: "size",
        type: '"md" | "compact"',
        defaultValue: '"md"',
        description: "Card size preset.",
      },
      {
        name: "density",
        type: '"tight" | "cozy"',
        description: "Internal padding density (base 16 / tight 12 / cozy 20).",
      },
    ],
    usage: [
      'DO always wrap body content in <CardContent> — the bare <Card> div has zero inner padding; content renders flush against card edges without it. Never add className="p-4" directly on <Card> as a substitute.',
      "DO put titles/descriptions in <CardHeader>/<CardTitle>/<CardDescription>. Use <CardHeader banded> for a visually separated muted-background header band (mirrors <CardFooter separated>). Pair with <CardAction> inside a flex-row CardHeader for header-level action buttons.",
      'DO set <CardTitle level={n}> to keep a valid document outline (h1 → h2 → h3, no skipped levels): CardTitle renders <h3> by default, so a section card directly under a page <h1> needs level={2}. Pick the level by OUTLINE position, NEVER for visual size — the title size is fixed by tokens and does not change with level. When the card title is a styled label rather than a section heading, use <CardTitle as="p"> so it is not announced as a heading.',
      "DO use <CardContent flush> for edge-to-edge children such as DataTable, Table, or a Tabs list — this removes horizontal padding. Combine with <CardContent tight> when there is no visual gap needed after the header, and <CardContent solo> when there is no CardHeader above (top padding matches the card shell).",
      "DO use <CardFooter separated> to render a top-bordered action band (Save/Cancel buttons, table summary row). Use <CardFooter flush> for a full-bleed footer bar.",
      "DO use <CardCover> as the first child for full-bleed cover media — the header below it uses card-section top spacing, not the card shell.",
      'DO reach for `accentPlacement="perimeter"` when the whole card needs attention, not one edge: `<Card accent="attention" accentPlacement="perimeter">` is the semantic-tone equivalent of `variant="featured"` (which is brand-toned by definition). Never hand-roll it with `className="border-2 border-[--attention]"` or a page-local `.card--attention` rule — the placement owns the border weight, the outer ring AND the slot-padding compensation, so text stays on the same column as an unaccented sibling.',
      "DON'T hand-roll a stat/KPI tile with <Card> + raw divs — use <StatCard> (label, value, hint, delta, layout, inverse props) which is already a Card internally with correct token-driven layout.",
      "SPACING IS BORDER-AWARE & token-driven (theme via src/tokens/components/card.css, never hard-code padding on slots): `--card-space-inset` is the shared horizontal column every slot (header/content/footer) aligns to. A DIVIDED section — a `banded` header or a `separated` footer, i.e. one carrying a divider border — pads SYMMETRICALLY top+bottom from `--card-space-divided-y` (a band reads as its own region). A PLAIN header flows into the body instead: top `--card-space-shell-y`, no bottom, and the body supplies the gap via `--card-space-body-y`. THE TWO AXES ARE INDEPENDENT (gh#232): `--card-space-inset` is inline-only, while `--card-space-shell-y` owns the BLOCK shell edges (plain-header top, `solo` body top, terminal slot bottom) and defaults to the inset — so a shell/theme can make a card SHORTER without narrowing its column by overriding `--card-space-shell-y` alone (this is how AuthShell's `--auth-shell-card-padding-block-compact` reaches CardContent). Never bridge it with a consumer selector on the card-content slot. Special case: a header above `<CardContent flush>` with a <Table> gets its own `--card-space-body-y` bottom gap (the flush table zeroes its top), so the title never butts the table. `--card-space-gap` is the in-slot stack gap (title↕description). Tune the band rhythm once at `--card-space-divided-y`; tune the accent stripe width at `--card-accent-rail-width` (default 6px).",
    ],
    useCases: [
      'Dashboard KPI summary row: wrap each metric in <StatCard> (or a plain <Card size="compact"> with <CardContent>) to render a uniform grid of labeled value tiles with optional trend deltas.',
      'Invoice or order detail panel: <Card accent="primary"> with <CardHeader banded><CardTitle>, <CardContent> body rows (use <Descriptions> inside), and <CardFooter separated> holding approve/reject buttons.',
      "Section container on a settings or form page: a single <Card> wrapping a <CardHeader><CardTitle> plus <CardContent> containing <FormField> groups, with <CardFooter separated> for Save/Cancel.",
      "Data table with toolbar: <Card> + <CardHeader> (title + filter controls in <CardAction>) + <CardContent flush> containing <DataTable> — <CardContent flush> removes horizontal padding so the table header spans full width.",
      'Featured announcement or alert card: <Card variant="featured"> with an accent stripe (<accent="warning">) to visually elevate a card above sibling cards on the page.',
      "Media/cover card (e.g. entity profile): <CardCover> first (full-bleed image), then <CardHeader> + <CardContent> below it for structured metadata.",
    ],
    related: [
      "StatCard — use instead of a plain Card when rendering a KPI/metric tile (label + value + optional delta/hint). StatCard is a Card internally; do not re-wrap it in another Card.",
      "CardContent — mandatory inner wrapper for all body content inside Card. Provides the correct padding and supports flush/tight/solo variants. The only correct way to put padded content inside Card.",
      "Descriptions — use inside <CardContent> when body content is a label-value metadata list (e.g. entity details, invoice fields); do not hand-roll a dl/dt/dd grid.",
      "DataState / InfiniteQueryState — use instead of Card when the content is a TanStack Query-driven list that needs automatic skeleton, empty, and error states; Card does not manage loading lifecycle.",
    ],
    example: `import { Card, CardHeader, CardTitle, CardContent } from "@godxjp/ui/data-display";

<Card accent="success">
  <CardHeader><CardTitle>注文サマリー</CardTitle></CardHeader>
  <CardContent>総売上: ¥1,234,567</CardContent>
</Card>`,
    storyPath: "data-display/Card.stories.tsx",
    rules: [],
  },
  {
    name: "CardContent",
    group: "data-display",
    tagline:
      "Card body. flush = edge-to-edge (for DataTable/tabs); tight = no top gap; solo = no header above. NEVER put a Toolbar inside flush (it loses padding).",
    props: [
      {
        name: "flush",
        type: "boolean",
        description: "Remove horizontal padding for edge-to-edge tables / tabs lists.",
      },
      {
        name: "tight",
        type: "boolean",
        description: "No top gap after header — pair with flush toolbars/tabs.",
      },
      {
        name: "solo",
        type: "boolean",
        description: "No header above: top padding matches the card shell.",
      },
    ],
    usage: [
      "DO: Always wrap body content in <CardContent> — a bare <Card> has no internal padding, so any child placed directly inside it renders flush against the card edges.",
      "DO: Use <CardContent flush> for DataTable, Table, or Tabs — the flush prop removes horizontal padding so the content spans edge-to-edge inside the card border. Never add manual p-0 on the Card itself instead.",
      "DO: Use <CardContent tight> when placing a flush toolbar or a Tabs list directly below a CardHeader — tight removes the top gap so the header and the body connect without an awkward spacing gap.",
      "DO: Use <CardContent solo> when the card has no CardHeader above it — solo gives the top padding that matches the card shell, ensuring visual balance.",
      "DON'T: Nest a Toolbar inside <CardContent flush> — flush strips horizontal padding and Toolbar will lose its own padding. Put Toolbar outside the flush CardContent or in a separate non-flush CardContent above it.",
      "DON'T: Wrap a StatCard inside <Card><CardContent> — StatCard already renders its own Card border; double-wrapping produces a double border. Render StatCard directly in a ResponsiveGrid.",
    ],
    useCases: [
      "Wrapping a form body (Input, Select, Textarea fields) inside a Card that has a CardHeader title — ensures the form fields have correct internal padding.",
      "Hosting a DataTable inside a Card edge-to-edge: <CardContent flush><DataTable .../></CardContent> — the table occupies the full card width with the card's border acting as the table container.",
      "Dashboard detail panels where the card has no title — <CardContent solo> gives top padding equivalent to the card shell so the content doesn't sit too close to the top border.",
      "Placing a Descriptions or Timeline inside a card to display invoice/accounting details — <CardContent> provides the standard 16px (or density-adjusted) padding without needing manual className.",
      "Pairing with <CardHeader banded> and <CardFooter separated> in a multi-section layout such as a payment summary card — each section slot (header, content, footer) carries its own semantic spacing tokens.",
      "Putting a ScrollArea inside <CardContent> (not flush) to create a scrollable card body with consistent padding, e.g. a chat or log viewer panel.",
    ],
    related: [
      "Card — the parent container; CardContent is always a direct child of Card. Card itself has zero internal padding; every visible body padding comes from CardContent (or CardHeader/CardFooter). Never put content directly inside Card.",
      "StatCard — a self-contained KPI tile that IS already a Card; do not wrap it in <Card><CardContent>. Use StatCard directly inside a ResponsiveGrid.",
      "ScrollArea — place ScrollArea inside CardContent (non-flush) when the card body needs to scroll; do not put ScrollArea outside CardContent or you lose the card's internal padding.",
      "SkeletonStat — the loading placeholder for a StatCard tile; swap in SkeletonStat while KPI data is loading. For general Card loading shapes, use SkeletonTable or Skeleton primitives.",
    ],
    example: `import { Card, CardContent, DataTable } from "@godxjp/ui/data-display";

<Card>
  <CardContent flush>
    <DataTable data={rows} columns={columns} />
  </CardContent>
</Card>`,
    storyPath: "data-display/Card.stories.tsx",
    rules: [37, 38],
  },
  {
    name: "StatCard",
    group: "data-display",
    tagline:
      "KPI tile. ⚠️ StatCard IS ALREADY a bordered Card — render it DIRECTLY in ResponsiveGrid. NEVER wrap it in <Card>/<CardContent> (that double-borders it → looks too thick). Use `accent` for a semantic leading-edge rail on a KPI needing attention.",
    props: [
      { name: "label", type: "ReactNode", required: true, description: "Metric name." },
      {
        name: "value",
        type: "ReactNode",
        required: true,
        description: "Metric value (string/number/ReactNode).",
      },
      { name: "hint", type: "ReactNode", description: "Secondary context below the value." },
      {
        name: "icon",
        type: "LucideIcon",
        description:
          "Optional leading icon rendered as a tinted medallion above the metric. Decorative (aria-hidden) — the label carries the meaning. Tint via the --stat-card-icon-{background,foreground} tokens (default a soft brand-primary wash).",
      },
      {
        name: "delta",
        type: "ReactNode",
        description: "Compact trend text beside the value. Sign-aware tone (+ green / - red).",
      },
      {
        name: "layout",
        type: '"stacked" | "inline"',
        defaultValue: '"stacked"',
        description: "stacked = label over value; inline = label left / value right.",
      },
      { name: "align", type: '"start" | "end"', description: "Align the metric group." },
      {
        name: "inverse",
        type: "boolean",
        defaultValue: "false",
        description:
          "Flip delta tone semantics for metrics where lower is better (cost, error rate): '-' renders green, '+' renders red.",
      },
      {
        name: "accent",
        type: '"primary" | "success" | "warning" | "info" | "attention" | "destructive"',
        description:
          "Semantic 3px leading-edge rail (forwarded to the underlying Card) — flags a KPI that needs attention (e.g. attention = backlog with a deadline, destructive = overdue).",
      },
    ],
    usage: [
      "DO place StatCard directly as a child of ResponsiveGrid — it renders its own bordered Card shell internally, so no wrapping <Card> or <CardContent> is needed or allowed. Wrapping creates a double border.",
      "DO pass `delta` as a sign-prefixed string (e.g. '+12%' or '-3%') to get automatic color tone: '+' renders text-success, '-' renders text-destructive. For metrics where a negative delta is good (e.g. cost reduction, error rate), pass `inverse` so the tone is flipped correctly.",
      "DO use `hint` for secondary context (e.g. '先月比 +3%', 'last 30 days'). In the default `stacked` layout hint renders below the value; in `inline` layout it renders beside the label.",
      "DO use `accent` (not a className border) for the semantic leading-edge rail — `attention` for a non-destructive backlog needing action, `destructive` only for overdue/exceeded states. Most tiles in a grid stay rail-less; an all-accented grid says nothing.",
      "DO NOT hand-roll a KPI tile using a plain <Card><CardContent>. StatCard is the correct primitive and token-aligns the label/value/hint/delta slots automatically.",
      "WHILE data is loading, replace each StatCard with a <SkeletonStat /> at the same grid position — never render an empty value string or a spinner inside StatCard itself.",
    ],
    useCases: [
      "Dashboard KPI row: monthly revenue, invoice count, overdue balance, and collection rate displayed side-by-side in a ResponsiveGrid with delta trend vs previous period.",
      "Accounting summary header: total debits, total credits, and net balance for a journal entry list page, each with a hint showing the date range in scope.",
      "Coupon/membership admin overview: active members, live coupons, monthly redemptions, and total discount amount — the canonical example in the catalog.",
      "Inline variant for a narrow sidebar or detail panel where space is constrained: label on the left, large value on the right (layout='inline'), e.g. contract value next to a deal record.",
      "Cost or error-rate metrics where a falling number is positive: pass `inverse` so a '-15%' delta shows green, preventing misleading red-for-good UI.",
      "Loading state for any KPI grid: render the same ResponsiveGrid columns filled with <SkeletonStat /> components while the query is in-flight, then replace with StatCard tiles once data resolves.",
    ],
    related: [
      "ResponsiveGrid — required layout wrapper for StatCard grids; controls column count and responsive breakpoints. Always pair them together.",
      "SkeletonStat — exact loading placeholder shaped like a StatCard tile; swap in while KPI data is fetching, then replace with the real StatCard.",
      "Descriptions — use instead when displaying multiple label/value metadata pairs on a detail page (not headline KPIs); Descriptions is not card-bordered and does not show delta/hint slots.",
      "Card + CardContent — use when you need a general-purpose content container with a header, footer, or arbitrary body; do NOT wrap StatCard inside these.",
      "LineChart / BarChart / PieChart (@godxjp/ui/charts) — when the trend or composition BEHIND a KPI matters, pair the StatCard headline number with a chart in the same dashboard grid: StatCard states the figure, the chart shows its shape over time or its breakdown.",
    ],
    example: `import { StatCard } from "@godxjp/ui/data-display";
import { ResponsiveGrid } from "@godxjp/ui/layout";

// ✅ StatCard sits directly in the grid — it draws its own card + border.
<ResponsiveGrid columns={3}>
  <StatCard label="総会員数" value="12,450" hint="先月比 +3%" />
  <StatCard label="月次売上" value="¥8,200,000" delta="+12%" />
  <StatCard label="利用率" value="68.4%" />
</ResponsiveGrid>

// ❌ Double border — do NOT wrap StatCard in a Card:
// <Card><CardContent><StatCard label="x" value="1" /></CardContent></Card>`,
    storyPath: "data-display/StatCard.stories.tsx",
    rules: [],
  },
  {
    name: "ServiceLauncherCard",
    group: "data-display",
    tagline:
      "Token-owned downstream-service launcher tile with semantic icon, status, metadata, action, disabled reason, matching skeleton, and companion catalog CTA.",
    props: [
      {
        name: "icon",
        type: "LucideIcon",
        required: true,
        description: "Decorative service glyph rendered in the canonical semantic icon surface.",
      },
      {
        name: "title",
        type: "ReactNode",
        required: true,
        description: "Real downstream service display name.",
      },
      {
        name: "titleLevel",
        type: "1 | 2 | 3 | 4",
        defaultValue: "2",
        description: "Semantic heading level; visual styling remains token-owned.",
      },
      {
        name: "statusLabel",
        type: "ReactNode",
        description: "Consumer-provided access/readiness label. The component never infers status.",
      },
      {
        name: "statusTone",
        type: '"success" | "warning" | "destructive" | "info" | "neutral" | "muted"',
        defaultValue: '"neutral"',
        description: "Semantic tone corresponding to the real statusLabel.",
      },
      {
        name: "description",
        type: "ReactNode",
        description: "Localized service summary.",
      },
      {
        name: "metadata",
        type: "ReactNode",
        description: "Compact mono metadata such as real hostname and subscribed plan.",
      },
      {
        name: "action",
        type: "ReactNode",
        required: true,
        description: "Real launch/detail action, normally a Button or Button asChild link.",
      },
      {
        name: "disabledReason",
        type: "ReactNode",
        description:
          "Localized prose reason accompanying a disabled/unavailable action. Rendered ABOVE the action (so assistive tech meets the explanation before the disabled control) and marks the tile data-unavailable, which mutes the medallion via --card-service-launcher-unavailable-icon-*. It never disables the action itself — that stays the consumer's Button prop.",
      },
    ],
    usage: [
      "DO provide status, hostname, plan, access state and action from the product's real API contract. ServiceLauncherCard deliberately performs no entitlement or URL inference — it has no href/entitlement/available prop at all.",
      "DO own the layout with ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }} — the canonical 3→2→1 launcher grid. ResponsiveGrid queries its OWN container (40/48/64rem), so never hand-write grid-template-columns or a media query in the page. The shorthand columns={3} also works but widens to 2 columns earlier (40rem).",
      "DO render ServiceLauncherCard directly as a grid child; it already owns its Card shell, its 36px medallion (--control-height-lg tier) and the canonical internal rhythm.",
      "DO replace it with ServiceLauncherCardSkeleton while loading (it carries a required `label` and aria-busy, and deliberately opens no live region). Use ServiceCatalogCta as the peer tile only when a real catalog/add route exists.",
      "DO keep `metadata` to machine identifiers (hostname · plan) — it is the only mono line. Sentences belong in `description` / `disabledReason`.",
      "DON'T recreate launcher geometry with page-local CSS, utility padding, grid tracks, or a hand-built Card hierarchy. Retune it with the --card-service-launcher-* tokens instead.",
      "DON'T show LIVE, a hostname, subscribed plan, or launch action merely because a service is active in the global catalog.",
    ],
    useCases: [
      "Organization console launcher showing subscribed downstream applications with a real SSO launch action.",
      "Service picker where unavailable apps remain visible with a disabled action and permission/subscription reason.",
      "Responsive 3→2→1 launcher grid with a final ServiceCatalogCta tile linked to an existing catalog route.",
    ],
    related: [
      "ServiceLauncherCardSkeleton — shape-matched initial loading placeholder (required `label`, aria-busy, no live region).",
      "ServiceCatalogCta — dashed companion tile for an existing catalog/add route.",
      "ResponsiveGrid — OWNS the 3→2→1 layout around launcher tiles; the launcher never ships grid tracks of its own.",
      "Card — general-purpose surface; use ServiceLauncherCard instead for this established composite.",
    ],
    example: `import { Clock } from "lucide-react";
import {
  ServiceCatalogCta,
  ServiceLauncherCard,
  ServiceLauncherCardSkeleton,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { ResponsiveGrid } from "@godxjp/ui/layout";

// ResponsiveGrid owns the canonical 3 → 2 → 1 ladder; the page writes no tracks.
<ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
  {loading
    ? services.map((s) => <ServiceLauncherCardSkeleton key={s.id} label={t("loadingService")} />)
    : services.map((s) => (
        <ServiceLauncherCard
          key={s.id}
          icon={Clock}
          title={s.name}
          statusLabel={s.accessLabel}
          statusTone={s.accessTone}
          description={s.description}
          metadata={s.hostnameAndPlan}
          disabledReason={s.blockedReason}
          action={
            <Button asChild={s.canLaunch} disabled={!s.canLaunch}>
              {s.canLaunch ? <a href={s.launchUrl}>{t("launch")}</a> : t("launch")}
            </Button>
          }
        />
      ))}
  <ServiceCatalogCta
    title={t("addFromCatalog")}
    action={<Button variant="outline">{t("viewCatalog")}</Button>}
  />
</ResponsiveGrid>`,
    storyPath: "data-display/ServiceLauncherCard.stories.tsx",
    rules: [40],
  },
  {
    name: "Badge",
    group: "data-display",
    tagline:
      "Plain or lifecycle badge. Use `variant` for static chips, or `status` to auto-map lifecycle keys to semantic tone + icon. Labels never wrap.",
    props: [
      {
        name: "variant",
        type: '"default" | "secondary" | "outline" | "dashed"',
        defaultValue: '"default"',
        description:
          "STRUCTURAL emphasis only (fill/border style) — NOT colour. Use `tone` for semantic colour. `dashed` = dashed border.",
      },
      {
        name: "tone",
        type: '"default" | "primary" | "success" | "warning" | "destructive" | "info" | "muted" | "neutral"',
        description:
          'SEMANTIC colour intent (BadgeTone = ToneProp + `primary`). This is the colour knob — success/warning/destructive/info/etc. `primary` is a SOFT brand pill (tinted brand fill + brand text) for the dashboard role-pill pattern; for a SOLID brand fill use `variant="default"`. Keep variant for structure, tone for meaning.',
      },
      {
        name: "shape",
        type: '"default" | "pill" | "sharp"',
        defaultValue: '"default"',
        description:
          "Corner radius from the tokens — `default` (badge radius), `pill` (fully rounded), `sharp` (square). Use the prop instead of a `rounded-*` className.",
      },
      {
        name: "status",
        type: "string",
        description:
          "Lifecycle key. Known keys auto-map to tone + icon + i18n label; unknown keys fall back to neutral.",
      },
      {
        name: "icon",
        type: "React.ComponentType<{ className?: string }> | null",
        description: "Leading icon override. Pass null to suppress the auto status icon.",
      },
      {
        name: "children",
        type: "ReactNode",
        description:
          "Badge label. When omitted with status, Badge renders the translated lifecycle label or raw status.",
      },
    ],
    usage: [
      "DO pick the correct variant semantically: `success` (approved/paid), `warning` (pending/overdue), `destructive` (rejected/error), `secondary` (neutral category), `outline` (subtle label), `default` (primary accent). Never force a colour just for aesthetics — agents and screen readers read the variant as intent.",
      "DO use `status` for entity lifecycle statuses (active, draft, pending, cancelled, failed, scheduled, etc.) so the component resolves the correct tone, icon, and i18n label.",
      "DO pass `variant` explicitly for localized labels or categorical tiers, and pass `icon={null}` when a lifecycle glyph would be misleading.",
      "Badge renders as a `<div>` (HTMLAttributes<HTMLDivElement>). It carries no interactive semantics. If you need a clickable chip, wrap it in a `<button>` or use a Button with a matching variant — never add an `onClick` directly to Badge without an accessible role.",
      "Badge is a leaf — pass plain text or a short ReactNode as children. Do NOT nest another Badge, a Button, or interactive controls inside it; that breaks focus order and creates invalid HTML (div-in-inline-context).",
      "Use semantic tokens for any className overrides (`text-muted-foreground`, `bg-destructive`) — never raw Tailwind palette classes like `bg-green-500`.",
    ],
    useCases: [
      'Category or tier labels on table rows — e.g. plan tier (`<Badge variant="secondary">Pro</Badge>`), document type (`<Badge variant="outline">Invoice</Badge>`), or locale tag (`<Badge variant="secondary">EN</Badge>`).',
      'Approval or review state in an accounting list where the value is not a lifecycle key in Badge\'s STATUS_MAP — e.g. a custom approval tier like `<Badge tone="success">承認済</Badge>` or `<Badge tone="warning">要確認</Badge>`.',
      "Inline count or highlight next to a heading or nav item — e.g. `<Badge variant=\"destructive\">3</Badge>` beside 'Overdue invoices' to draw attention to a non-zero count.",
      'Feature flags or experiment variant labels on admin records — e.g. `<Badge variant="outline">A/B</Badge>` alongside a campaign row to indicate it is in a split test.',
      "Read-only metadata chips inside a Descriptions.Item or Card header where a lifecycle icon would be visually heavy — e.g. currency code, payment method, or region tag.",
    ],
    related: [
      "Button — use instead of Badge when the chip must be interactive (clickable, toggleable). Badge carries no button role or keyboard handler; a naked `onClick` on Badge is inaccessible.",
    ],
    example: `import { Badge } from "@godxjp/ui/data-display";

<Badge variant="secondary">A/B</Badge>
<Badge status="active">公開中</Badge>
<Badge status="プレミアム" tone="success" icon={null}>プレミアム</Badge>`,
    storyPath: "data-display/Badge.stories.tsx",
    rules: [35],
  },
  {
    name: "ListRow",
    group: "data-display",
    tagline:
      "Single-line entity row (leading · title/description · trailing action) for SHORT lists inside a Card — sessions, API tokens, linked accounts, passkeys, MFA factors, invitations.",
    props: [
      {
        name: "title",
        type: "ReactNode",
        required: true,
        description: "Primary line — rendered in medium weight; truncates to one line.",
      },
      {
        name: "description",
        type: "ReactNode",
        description: "Secondary line under the title (muted, xs); truncates to one line.",
      },
      {
        name: "leading",
        type: "ReactNode",
        description:
          "Leading slot — a decorative icon or an Avatar. Mark a purely decorative icon `aria-hidden`.",
      },
      {
        name: "trailing",
        type: "ReactNode",
        description:
          "Trailing slot — the row action(s): a Button / DropdownMenu trigger, a Badge, or a Switch.",
      },
      {
        name: "align",
        type: '"center" | "start"',
        defaultValue: '"center"',
        description: "Cross-axis alignment of the columns; `start` for multi-line content.",
      },
      {
        name: "as",
        type: '"div" | "li"',
        defaultValue: '"div"',
        description: "Render element — `li` when the parent is a semantic `<ul>`/`<ol>`.",
      },
      {
        name: "overflow",
        type: '"truncate" | "wrap"',
        defaultValue: '"truncate"',
        description:
          "How title/description resolve content longer than the row — `truncate` (one line + ellipsis) or `wrap` (multi-line; long unbroken tokens break via `overflow-wrap: anywhere`). Either way the content column may shrink below its intrinsic width, so the row never widens the page root.",
      },
      {
        name: "density",
        type: '"default" | "compact"',
        defaultValue: '"default"',
        description:
          "Row geometry. `compact` is the inline-actions preset (gh#246): tighter block padding and column gap plus a LOWER body threshold (`--list-row-compact-*`), so a leading Avatar, the title/description and one or two small trailing Buttons stay INLINE inside a narrow card (≈326px content) at 390px, and a history Badge + ISO-8601 date stays on the title's line. It only lowers thresholds — the row and its trailing cluster still wrap, so a cluster that cannot fit drops to its own line rather than widening the page root.",
      },
      {
        name: "unread",
        type: "boolean",
        description:
          "Read/unread state for notification rows — renders the indicator dot (with localized `sr-only` text, never colour alone) plus the tokenized `--list-row-unread-background`. OMIT the prop for rows with no read state; pass `false` for a read row so its title keeps the same optical axis as the unread ones.",
      },
    ],
    usage: [
      "DO use ListRow for a SHORT (≈2–8 item) list of entities inside a Card where each row is one line with an action — account sessions, API keys, linked identities, passkeys. Stack rows in a `<Card><CardContent flush>` so the rows draw their own quiet dividers edge-to-edge.",
      "DON'T reach for DataTable here — it carries sorting/selection/pagination chrome that a 3-item list doesn't need. DON'T nest a Card per row either (card-in-card). ListRow is the in-between surface.",
      'DON\'T hand-roll `<div className="flex items-center justify-between border-b py-3">` — that is exactly the repeated pattern ListRow replaces (border/radius/padding are tokenized via `--list-row-*`).',
      'DO put the row\'s action in `trailing` (a `ghost`/`outline` Button, a DropdownMenu trigger, a Switch, or a status Badge). DO pass `as="li"` when the rows live inside a semantic `<ul>`.',
      'DO use `unread` for a notification list — the dot is a SHAPE with localized `sr-only` text ("Unread"/"Read"), so it never reads as colour alone, and the row surface reads `--list-row-unread-background` (default `hsl(var(--muted))` — chosen so the xs muted description line stays WCAG AA on the emphasized surface; `--accent` would drop it to 4.23:1). DON\'T substitute a `Badge` — that renders a labelled pill, not a compact status dot.',
      'DO pass `density="compact"` for the canonical invitation / history row — an Avatar, a title (+ description) and one or two small trailing Buttons that must read as ONE line inside a narrow card (≈326px content at 390px), or a history row whose status Badge + ISO-8601 date belongs beside the title. Measured at 390px: 62px tall vs 126px at the default density (where the actions wrapped), history row 41px vs 114px. DON\'T reach for it just to "make things tighter" on a roomy page — the default density is the entity-row measure.',
      'DON\'T add one-off `min-width`/wrapping CSS in the consumer app for a long title + two trailing Buttons. The row already shrinks and WRAPS: the content column keeps only `min(var(--list-row-body-min-width), 100%)` and the trailing actions drop onto their own line below the threshold. Retune the threshold with `--list-row-body-min-width` (default 12rem) and the action gap with `--list-row-trailing-gap`; pass `overflow="wrap"` (usually with `align="start"`) when the title must stay fully readable at 390px instead of truncating.',
    ],
    useCases: [
      "Account security page — a list of active sessions (device + last-seen as title/description, a destructive 'Revoke' Button in trailing).",
      "Developer settings — API tokens or passkeys, each row showing the name + created date and a DropdownMenu of actions.",
      "Linked accounts / SSO — an IdP icon in leading, the provider name + connected email, and a Switch or 'Disconnect' Button trailing.",
      'Notifications inbox — `unread` rows carry the dot + emphasized surface, `overflow="wrap"` keeps a long JA/EN/VI title and its ISO-8601 timestamp readable, and two inline trailing Buttons (Mark as read / Open) wrap under the text at 390px.',
      "Pending invitations — Avatar in leading, the organization/invitation name as title, and Accept + Decline Buttons in trailing that stack at narrow widths without a horizontal page scrollbar.",
    ],
    related: [
      "DataTable — use instead when the list is long or needs sorting/selection/pagination; ListRow is for short, chrome-light lists.",
      "Card — ListRow is designed to live inside `<CardContent flush>`; the Card supplies the outer surface and the closing border.",
      "Descriptions — for a key/value metadata grid on a detail page (no per-row action); ListRow is for actionable entity rows.",
    ],
    example: `import { Card, CardContent, CardHeader, CardTitle, ListRow, Badge } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Smartphone } from "lucide-react";

<Card>
  <CardHeader>
    <CardTitle>アクティブなセッション</CardTitle>
  </CardHeader>
  <CardContent flush>
    <ListRow
      leading={<Smartphone aria-hidden="true" className="size-4" />}
      title="iPhone 15 · Tokyo"
      description="最終アクセス 2分前"
      trailing={<Badge status="active" />}
    />
    <ListRow
      leading={<Smartphone aria-hidden="true" className="size-4" />}
      title="MacBook Pro · Osaka"
      description="最終アクセス 3日前"
      trailing={<Button size="xs" variant="outline">ログアウト</Button>}
    />
  </CardContent>
</Card>

// Notifications — unread dot + emphasized surface, wrapping title, two inline actions
<Card>
  <CardContent flush>
    <ListRow
      unread
      align="start"
      overflow="wrap"
      title="組織「グローバル・トランスフォーメーション推進本部」への招待が届いています"
      description="2026-07-30 09:12 JST"
      trailing={
        <>
          <Button size="xs" variant="ghost">既読にする</Button>
          <Button size="xs" variant="outline">開く</Button>
        </>
      }
    />
    <ListRow unread={false} align="start" overflow="wrap" title="請求書が発行されました" description="2026-07-28 18:40 JST" />
  </CardContent>
</Card>`,
    storyPath: "data-display/ListRow.stories.tsx",
    rules: [42, 44],
  },
  {
    name: "CredentialReveal",
    group: "data-display",
    tagline:
      "One-time secret surface — masked-by-default value with a show/hide toggle, a copy button that confirms the copy, optional download, and an optional acknowledge action to pair with Dialog. The GitHub/Stripe token-reveal pattern as a real primitive so consumers stop hand-rolling it.",
    props: [
      { name: "secret", type: "string", required: true, description: "The one-time secret value." },
      {
        name: "label",
        type: "string",
        description: "Accessible name / caption for the secret (e.g. 'API key').",
      },
      {
        name: "warning",
        type: "React.ReactNode | null",
        description:
          "Caution banner copy; defaults to a localized 'shown only once' warning. Pass null to suppress the banner.",
      },
      {
        name: "revealed",
        type: "boolean",
        description: "Controlled reveal state (with defaultRevealed / onRevealedChange).",
      },
      {
        name: "defaultRevealed",
        type: "boolean",
        defaultValue: "false",
        description: "Uncontrolled initial reveal state.",
      },
      {
        name: "onRevealedChange",
        type: "(revealed: boolean) => void",
        description: "Reveal toggle handler.",
      },
      {
        name: "onCopy",
        type: "(secret: string) => void",
        description: "Called after the secret is written to the clipboard.",
      },
      {
        name: "onAcknowledge",
        type: "() => void",
        description: "Renders a confirm button; wire it to the Dialog's onOpenChange(false).",
      },
      {
        name: "downloadable",
        type: "boolean",
        defaultValue: "false",
        description: "Offer a download-as-file button.",
      },
      {
        name: "size",
        type: '"xs" | "sm" | "md" | "lg"',
        defaultValue: '"md"',
        description: "Action button size tier.",
      },
      {
        name: "tone",
        type: '"warning" | "destructive" | "info"',
        defaultValue: '"warning"',
        description: "Caution banner severity.",
      },
    ],
    usage: [
      "DO use for a secret shown exactly once after creation (device credential, API key, service-account secret) — it masks by default and confirms the copy.",
      "DO pair it inside a Dialog and reset via controlled `revealed`/`onRevealedChange` (or let it re-blur automatically when the `secret` prop changes) so a reopened dialog starts masked.",
      "DO pass `onAcknowledge` to gate the dialog close behind an explicit 'I've saved it' confirmation.",
      "DON'T use it for an editable password field — that's PasswordInput. CredentialReveal is read-only display of an issued secret.",
      "DON'T hand-roll the copy button + copied-state + aria-live announcement; it's built in.",
    ],
    useCases: [
      "Device credential issued after enrollment",
      "API key / personal access token shown once on creation",
      "Service-account secret / client secret reveal",
      "Recovery code or one-time bootstrap password",
    ],
    related: [
      "PasswordInput — editable password/secret ENTRY with a show/hide toggle (data-entry); CredentialReveal is read-only DISPLAY of an issued secret.",
      "Dialog — the modal CredentialReveal is designed to live inside.",
      "Alert — the caution banner CredentialReveal composes internally.",
    ],
    example: `import { CredentialReveal } from "@godxjp/ui/data-display";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@godxjp/ui/feedback";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>APIキーを発行しました</DialogTitle>
    </DialogHeader>
    <CredentialReveal
      label="APIキー"
      secret="gxp_live_8Fh2kQ9wR7nZ1xV4bT6mL0cD"
      downloadable
      onAcknowledge={() => setOpen(false)}
    />
  </DialogContent>
</Dialog>`,
    storyPath: "data-display/CredentialReveal.stories.tsx",
    rules: [3, 6, 23],
  },
  {
    name: "QrCode",
    group: "data-display",
    tagline:
      "Local-only SVG QR renderer for enrollment links, device pairing and other values that must never be sent to a third-party image service.",
    props: [
      {
        name: "value",
        type: "string",
        required: true,
        description: "Value encoded in-process. It is never used as accessible text or a URL.",
      },
      {
        name: "label",
        type: "string",
        required: true,
        description: "Localized, purpose-specific accessible name for the QR image.",
      },
      {
        name: "size",
        type: '"xs" | "sm" | "md" | "lg"',
        defaultValue: '"md"',
        description: "Natural display-size tier; remains bounded by the available inline space.",
      },
      { name: "className", type: "string", description: "Root SVG class override." },
      { name: "id", type: "string", description: "Root SVG element id." },
    ],
    usage: [
      "DO use QrCode when the encoded payload must remain inside the browser, especially an otpauth enrollment URI containing a TOTP secret.",
      "DO provide a localized label that describes the job, such as 'Two-factor authentication setup code'; the encoded value is intentionally excluded from the accessibility tree.",
      "DO compose an adjacent CredentialReveal with the manual key when users need a non-camera fallback. Keep both inside one parent Card rather than adding a bordered QR card.",
      "DON'T create an image URL with the payload, call a remote QR service, add a logo/image overlay, or expose raw colour/size props. The local encoder, four-module quiet zone and scanner-safe colours are security and reliability invariants.",
      "DON'T encode the manual secret alone for TOTP. Encode the canonical otpauth URI returned by the backend so issuer, account, algorithm, digits and period stay intact.",
    ],
    useCases: [
      "TOTP authenticator enrollment",
      "Device pairing or application handoff",
      "Locally rendered invitation or deep link",
      "Payment or ticket payload that must not reach a third-party renderer",
    ],
    related: [
      "CredentialReveal — pair it with QrCode for the manual setup-key fallback without exposing the full encoded URI.",
      "Card — supplies the one outer enrollment surface; QrCode intentionally adds no nested border or card chrome.",
      "Text — provides concise localized scan/manual guidance around the non-text QR image.",
    ],
    example: `import { CredentialReveal, QrCode } from "@godxjp/ui/data-display";
import { Flex } from "@godxjp/ui/layout";

<Flex direction="col" gap="md">
  <QrCode
    value={security.qr_code_url}
    label="二要素認証の登録用QRコード"
    size="lg"
  />
  <CredentialReveal
    secret={security.secret}
    label="手動設定キー"
    warning={null}
    defaultRevealed
  />
</Flex>`,
    storyPath: "data-display/QrCode.stories.tsx",
    rules: [6, 7, 23, 24],
  },
  {
    name: "Descriptions",
    group: "data-display",
    tagline:
      "Responsive definition grid for detail-page metadata. COMPOUND — value goes in Descriptions.Item children.",
    props: [
      {
        name: "columns",
        type: "1 | 2 | 3",
        defaultValue: "2",
        description: "Column count; collapses to 1 on mobile.",
      },
      {
        name: "layout",
        type: '"vertical" | "horizontal"',
        defaultValue: '"vertical"',
        description:
          "Label placement within each item — `vertical` stacks the label over the value (default); `horizontal` puts the label BESIDE the value in a token-aligned column (mirrors `<Form layout>`). Tune the horizontal label-column width via `--descriptions-label-width`.",
      },
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Descriptions.Item elements.",
      },
      {
        name: "items",
        type: "DescriptionsItemProp[]",
        description:
          "Data-driven rows `{ label, value, span? }` (label/value are ReactNode) — the alternative to composing `Descriptions.Item` children.",
      },
    ],
    usage: [
      'DO use Descriptions.Item as the ONLY direct child — never raw <div>, <dt>/<dd>, or plain text nodes. Every label/value pair must be wrapped in <Descriptions.Item label="…">value</Descriptions.Item>.',
      "DO pass span={2} or span={3} on an Item when its value is long (e.g. a full address, a memo field, a JSON blob) — span={2} applies sm:col-span-2 and span={3} applies lg:col-span-3, keeping the grid aligned across breakpoints.",
      "DO pass mono on Item for machine-readable values: IDs, UUIDs, file paths, currency codes, JSON snippets. This sets font-mono + break-all so long strings wrap rather than overflow.",
      "DO embed any ReactNode as the Item child — Badge, Badge, formatDate output, a Tooltip-wrapped value, or a plain string all work. The value slot is not text-only.",
      "DON'T use Descriptions as a hand-rolled <dl>/<dt>/<dd> replacement for prose or running text — it is for structured metadata on detail/show pages only. For flowing key→value prose, use a plain <dl>.",
      "DON'T add className padding or margin to the root Descriptions to simulate a Card — wrap it in CardContent instead. Descriptions provides only grid layout (gap-x-6 gap-y-3); outer spacing is the Card/CardContent concern.",
    ],
    useCases: [
      "Detail/show page header block — displaying entity metadata such as invoice number, status, due date, vendor name, and payment method in a 2- or 3-column grid before the line-item DataTable.",
      "Account or member profile panel — showing user ID (mono), plan, registered date, email, and a status Badge in one scannable block instead of a vertical stack of FormField-looking rows.",
      "Accounting journal entry detail — date, reference code (mono), debit account, credit account, amount, and memo (span={2}) grouped in a compact grid alongside a Timeline of audit events.",
      "Read-only summary step in a multi-step form or wizard — displaying the values the user entered before final submission (Steps + Descriptions), without any input controls.",
      "Sidebar or Sheet detail pane — a narrow 1-column Descriptions inside a Sheet presenting the selected row's metadata while the main DataTable stays visible.",
      "API / webhook event inspector — showing event ID (mono, span={2}), event type, timestamp, HTTP status, and payload size in a grid, with a Badge for the status code.",
    ],
    related: [
      "Card / CardContent — Descriptions provides the internal grid layout; Card/CardContent provides the outer container, padding, and border. Always wrap Descriptions in CardContent (never add p-4 directly on Descriptions). Use Card when you need the visual surface; use Descriptions inside it for the label/value structure.",
      "DataTable — use DataTable when you have multiple rows of the same entity type that need sorting, filtering, or pagination. Use Descriptions when you have a single entity's fields laid out as labelled metadata (one row per field, not one row per record).",
      "Table — use Table (the lower-level primitive) for tabular data with explicit column headers and multiple data rows. Use Descriptions when the data is inherently label→value (no column headers needed, each field is its own row/cell).",
      "Flex — use Flex for arbitrary vertical/horizontal layout of heterogeneous UI elements. Use Descriptions when every item follows the label-on-top / value-below pattern and you want responsive multi-column alignment for free.",
    ],
    example: `import { Descriptions } from "@godxjp/ui/data-display";

<Descriptions columns={2}>
  <Descriptions.Item label="会員ID" mono>{member.id}</Descriptions.Item>
  <Descriptions.Item label="プラン">{member.plan}</Descriptions.Item>
  <Descriptions.Item label="メモ" span={2}>{member.note}</Descriptions.Item>
</Descriptions>`,
    storyPath: "data-display/Descriptions.stories.tsx",
    rules: [],
  },
  {
    name: "EmptyState",
    group: "data-display",
    tagline: "Centred empty placeholder with icon, title, description, and optional CTA.",
    props: [
      { name: "title", type: "string", required: true, description: "Primary empty message." },
      { name: "description", type: "string", description: "Secondary helper text." },
      { name: "icon", type: "LucideIcon", description: "Icon above the title." },
      { name: "action", type: "ReactNode", description: "CTA element (e.g. a Button)." },
      {
        name: "variant",
        type: '"page" | "section" | "compact"',
        defaultValue: '"page"',
        description: "Contextual visual weight. Compact omits the icon medallion.",
      },
      {
        name: "tone",
        type: '"muted" | "success" | "warning" | "destructive" | "info"',
        defaultValue: '"muted"',
        description:
          "Medallion colour intent (a subset of the shared tone vocabulary; `destructive` is the DS name for a danger state). Recolours BOTH the icon GLYPH and the medallion fill from the matching role token — set `success` for a confirmation zero-state (e.g. device approved) instead of hand-rolling a `.ui-success-state` class. The glyph inherits `--empty-state-icon-foreground`; never pass a `text-*` colour utility on your icon, it would out-specify the token and pin every tone to muted.",
      },
      {
        name: "titleLevel",
        type: "1 | 2 | 3 | 4",
        defaultValue: "3",
        description:
          "Semantic heading level of the title. Pick it to keep the page outline valid (h1 → h2 → h3, no skipped levels), NEVER for visual size — the title size is fixed regardless of level. A page/onboarding empty state directly under the page h1 uses titleLevel={2}; one nested in an already-h2 section keeps the default 3.",
      },
      {
        name: "titleAs",
        type: '"h1" | "h2" | "h3" | "h4" | "p" | "div"',
        description:
          "Render the title as a non-heading element (p/div) instead of a heading — for a compact/section empty state inside a section that already owns its heading, so the message is not announced as a heading and cannot skip an outline level. Overrides titleLevel.",
      },
    ],
    usage: [
      "DO always pass `title` — it is the only required prop and renders a heading (`<h3>` by default); omitting it causes a blank silent render with no visible error.",
      'DO set `titleLevel` to match the page outline (page h1 → section h2 → nested h3) so the empty state does not trigger a heading-order violation. Choose the level for OUTLINE position, never for visual size — the size never changes with the level. When the empty state sits in a section that already has its own heading, use `titleAs="p"` so the message is not a heading at all.',
      'DO use `tone="success"` (or warning/destructive/info) for a semantic confirmation/alert zero-state — it recolours the icon medallion from the role token; do NOT hand-roll a `.ui-success-state` class that scopes `--empty-state-icon-*`.',
      "DO use the `icon` prop (a Lucide icon component, not a JSX element) to give visual context — e.g. `icon={InboxIcon}` for empty inboxes, `icon={SearchIcon}` after a failed search. Pass the component reference, not `<InboxIcon />`.",
      "DO use `action` (a `ReactNode`, typically a `<Button>`) for actionable zero-states — e.g. 'Create first invoice' — so users have a clear next step instead of a dead end.",
      "DO NOT hand-roll a `data.length === 0 ? <EmptyState /> : <DataTable />` conditional — `DataTable` already embeds an `EmptyState` in its body when `data` is empty. Use the `empty=` prop on `DataTable` to customise it, not a wrapper conditional.",
      "DO NOT use EmptyState inside a `DataState` or `InfiniteQueryState` for the loading or error states — those widgets handle skeleton/error themselves; pass `EmptyState` only to their `empty=` prop for the zero-items case.",
      "DO NOT add padding directly on `EmptyState` via `className` when placing it inside a `Card` — wrap it in `<CardContent>` first; EmptyState is a self-contained block with its own internal spacing via `ui-empty-state` styles.",
      "DO omit optional secondary sections when absence has no user value. Otherwise use variant='compact' or 'section'; reserve page for the primary page job.",
      "DO match empty-state visual weight to the section's importance and expected content density — a low-priority 'no received invitations' block uses variant='compact' (no medallion, minimal padding), not the full page treatment that would outweigh real content.",
      "DO NOT wrap every empty condition in its own bordered Card. A compact/section empty state sits directly in the existing CardContent / section it belongs to; a dedicated bordered Card is only for a page-level or standalone zero-state.",
    ],
    useCases: [
      "Zero-row admin list pages (invoices, accounts, transactions) that are NOT backed by a `DataTable` — e.g. a card-grid or custom list layout where DataTable's built-in empty state doesn't apply.",
      "Post-filter / post-search zero results — show `icon={SearchIcon}` + a `description` explaining what was searched and an `action` to clear filters.",
      "First-run onboarding screens where no data has been created yet — e.g. 'No entities added yet' with an action button to create the first legal entity.",
      "Passed as the `empty=` prop inside `DataState` or `InfiniteQueryState` to satisfy the TanStack Query lifecycle widget's zero-items slot without hand-rolling markup.",
      "Standalone section within a `CardContent` to indicate a sub-section (e.g. attachments, comments, related records) has no entries yet, separate from the page-level list.",
      "Error-adjacent zero states where the page loaded successfully but the filtered result set is empty — distinct from an error state handled by `DataState`/`AlertMutationFeedback`.",
    ],
    related: [
      "DataTable — already embeds an EmptyState automatically when `data` is empty; customise via the `empty=` prop. Do NOT wrap DataTable in a `data.length === 0` guard that renders EmptyState separately.",
      "DataState — TanStack Query lifecycle widget (`@godxjp/ui/query`). Pass `<EmptyState />` to its `empty=` prop for zero-items; DataState itself covers loading/error — do not use EmptyState for those states.",
      "InfiniteQueryState — same pattern as DataState but for `useInfiniteQuery`; pass EmptyState to `empty=` when the flattened list is empty.",
      "SkeletonTable — use for the loading skeleton before data arrives (pass to DataState's `skeleton=` or DataTable's `loading=`). EmptyState is for after data arrives and is empty, not while loading.",
    ],
    example: `import { EmptyState } from "@godxjp/ui/data-display";

<EmptyState title="該当データがありません" description="検索条件を変更してください。" />`,
    storyPath: "data-display/EmptyState.stories.tsx",
    rules: [],
  },
  {
    name: "Progress",
    group: "data-display",
    tagline:
      "Horizontal progress bar 0–100 with optional label, semantic tone, and an over-capacity (striped) state for over-limit meters.",
    props: [
      {
        name: "value",
        type: "number",
        required: true,
        description: "Progress percentage 0–100 (clamped unless `over`).",
      },
      { name: "label", type: "string", description: "Text label beside/below the bar." },
      {
        name: "tone",
        type: '"success" | "warning" | "destructive"',
        defaultValue: '"success"',
        description: "Bar colour tone. Over-capacity defaults to destructive.",
      },
      {
        name: "over",
        type: "boolean",
        defaultValue: "false",
        description:
          "Allow value > 100 to render an over-capacity fill: bar caps at 100% width but gets a diagonal hatch + destructive tone (e.g. 252%). aria-valuetext reports the real ratio. Off by default (clamps to 100).",
      },
    ],
    usage: [
      'DO import from `@godxjp/ui/data-display`, not from a generic UI path: `import { Progress } from "@godxjp/ui/data-display";`',
      "DO pass `value` as a 0–100 number — the component clamps it internally via `Math.max(0, Math.min(100, value))`, so out-of-range values are safe but misleading; compute the real percentage before passing it.",
      'DO drive `tone` dynamically from business logic — e.g. `variant={pct >= 80 ? "warning" : "success"}` — to communicate threshold status semantically rather than with raw colour classes.',
      "DON'T use a `disabled` Slider as a read-only progress bar — Slider is semantically an interactive control even when disabled, which pollutes the a11y tree and exposes the wrong ARIA role (`slider` vs `progressbar`). Progress renders the correct read-only indicator.",
      "DON'T pass children or sub-components — Progress is a single self-contained element (track + bar + label). The `label` prop is the only text injection point; don't wrap it in a custom parent div to add a label alongside it.",
      "DON'T use Progress for editable numeric input or range selection — it has no callbacks, no interactivity, and no form `name` prop. Use Slider (bounded range input) or Input (free-form number) for data-entry scenarios.",
    ],
    useCases: [
      'Budget utilisation in an accounting dashboard — show how much of a monthly budget has been consumed, switching to `tone="warning"` when the figure crosses 80%.',
      'Invoice payment progress — display the proportion of an invoice total that has been settled (e.g. partial payments), with a label like `"¥45,000 / ¥60,000 支払済"` computed before passing `value`.',
      "Storage or quota indicator in an admin panel — visualise disk usage, API quota, or seat licence consumption against a fixed limit.",
      "Sync / import job completion feedback — surface the completion percentage of a long-running background job (polling the server) without giving the user an interactive control.",
      "StatCard companion — pair with a `StatCard` metric to add a visual fill below the KPI number, reinforcing how close a target is to being met.",
      "Multi-step onboarding or setup checklist — render one Progress per section (e.g. 3/5 steps complete = 60%) to give users a quick scan of overall progress across areas.",
      "Over-capacity meter — an air-cargo weight/volume load or an over-booked resource pushed past its limit (e.g. 252%): pass `over` with the real ratio to get a red diagonal-hatched bar that reads unmistakably as over-limit, not merely full.",
    ],
    related: [
      "Slider — use Slider when the user must drag or set a bounded numeric value (volume, priority, price range); use Progress when the value is read-only and must not be interacted with.",
      "Steps — use Steps for a discrete, named sequence of phases (onboarding wizard, checkout flow) where each step has a label and a clear current/done/pending state; use Progress for a continuous 0–100 fill.",
      'Badge / Badge — use Badge or Badge to communicate a categorical status label (e.g. "Paid", "Overdue") without a fill metaphor; use Progress when the numeric proportion itself is the information.',
      "StatCard — use StatCard to headline a single KPI metric with a title; compose Progress inside or alongside StatCard when a visual fill adds meaning to the number.",
      "BarChart / PieChart / LineChart (@godxjp/ui/charts) — Progress shows ONE ratio against a target; the moment you have several series, categories, or a part-to-whole split (or a value changing over time), move up to a chart instead of stacking many Progress bars.",
    ],
    example: `import { Progress } from "@godxjp/ui/data-display";

<Progress value={pct} label={pct + "% 使用中"} tone={pct >= 80 ? "warning" : "success"} />
<Progress value={252} over label="252% 積載" />`,
    storyPath: "data-display/Progress.stories.tsx",
    rules: [],
  },
  {
    name: "Timeline",
    group: "data-display",
    tagline:
      "Vertical event list with an icon rail. Current item gets a highlighted glyph. `variant` switches the rail to numbered (ordinal) or status-driven glyphs, and each item carries a 3-state `status` (done/current/pending) plus an optional per-item `icon`.",
    props: [
      {
        name: "items",
        type: "TimelineItem[]",
        required: true,
        description:
          "Array of `{ title, location?, time?, note?, current?, status?, icon? }`. `status` is the explicit 3-state ('done' | 'current' | 'pending'); `current: true` is shorthand for `status: 'current'`. `icon` (a LucideIcon) overrides the auto-glyph for that item.",
      },
      {
        name: "variant",
        type: '"icon" | "ordinal" | "status"',
        description:
          "Rail glyph strategy (default 'icon'). 'icon' = legacy look (Plane for current, CheckCircle2 otherwise). 'ordinal' = every glyph is its 1-based step number; status sets colour only. 'status' = glyph by status (done → check, current → filled dot, pending → step number).",
      },
    ],
    usage: [
      "DO pass an array of `TimelineItem` objects to `items`. Each item is `{ title, location?, time?, note?, current?, status?, icon? }`. All fields except `title` are optional. The only other prop is `variant`.",
      "DO mark the in-progress event with `current: true` (or `status: 'current'`). In the default `variant='icon'`, the current item renders a `Plane` icon and every other item a `CheckCircle2`. Use `variant='ordinal'` for a numbered route stepper (1,2,3…) or `variant='status'` for a done→check / current→dot / pending→number tracker. Pass `status: 'done' | 'current' | 'pending'` per item to drive colour and (in the status variant) the glyph; pass `icon` (a LucideIcon) to override the glyph for a single item.",
      "DO pass `ReactNode` to `title`, `location`, `time`, and `note` — you can embed formatted text, `<Badge>`, `<Badge>`, or `<span>` inside those fields. Use `formatDate` to pre-format timestamps before passing them as `time`.",
      "DO NOT hand-roll a vertical event list with divs, icons, and connector lines — that is exactly what Timeline ships. Do not apply extra padding or wrapping outside the component; it manages its own rail and spacing internally.",
      "DO NOT use Timeline for user-facing wizard progress (steps the user must complete in order) — use `Steps` for that. Timeline is read-only historical/status display; it has no interactive state, no `onClick`, and no concept of 'go to step'.",
      "DO wrap Timeline in `<CardContent>` when placing it inside a `Card` — bare `Card` has no inner padding, so the rail will render flush against the card edge without `CardContent`.",
    ],
    useCases: [
      "Shipment / delivery tracking — showing a parcel's journey through 'Order placed → Packed → In transit → Delivered' with timestamps and a current-stop indicator.",
      "Accounting document audit trail — rendering the lifecycle of an invoice or payment (Draft → Submitted → Approved → Paid) with the current approval stage highlighted.",
      "Support ticket / task history — displaying a chronological log of status transitions (Open → Assigned → In Review → Closed) with agent names in the `note` field and timestamps in `time`.",
      "MF sync log viewer — listing each sync run event (OAuth refresh, fetch, upsert) with timestamps and record counts so an operator can see what the last sync did.",
      "Approval workflow status panel — showing a multi-stage approval chain where completed stages have CheckCircle2 icons and the pending stage has the Plane (in-flight) icon.",
      "Order / purchase-order lifecycle in an admin detail page — placed alongside a `Descriptions` summary at the top of a `Card` to give a compact at-a-glance history.",
    ],
    related: [
      "Steps — use Steps (navigation group) when the user must actively progress through a wizard (interactive, shows step numbers/status, horizontal layout by default); use Timeline for read-only historical event sequences that have already happened.",
      "Descriptions — use Descriptions to display a flat set of label/value metadata fields (e.g., invoice header); use Timeline when events are ordered chronologically and a connector rail communicates sequence and progress.",
      "DataTable — use DataTable for multi-row, multi-column tabular event logs where sorting, filtering, and pagination are needed; use Timeline when the sequence/rail visual is the primary communication and there are fewer than ~10 events.",
      "Badge — Badge is a single-item inline indicator; Timeline sequences multiple statuses with connectors. Compose Badge inside a Timeline `title` or `note` field for richer per-event context, but do not replace Timeline with a stack of Badges.",
    ],
    example: `import { Timeline } from "@godxjp/ui/data-display";

// Default icon variant
<Timeline items={[
  { title: "注文受付", time: "2024-06-01 10:00" },
  { title: "発送準備中", time: "2024-06-01 14:00" },
  { title: "配送中", current: true },
]} />

// Numbered route stepper (Pattern A)
<Timeline variant="ordinal" items={[
  { title: "集荷", location: "東京 → 名古屋", status: "pending" },
  { title: "幹線輸送", location: "名古屋 → 大阪", status: "pending" },
]} />

// Status tracker (Pattern B): done → check, current → dot, pending → number
<Timeline variant="status" items={[
  { title: "請求書を発行", status: "done" },
  { title: "承認待ち", status: "current" },
  { title: "消費税を計上", status: "pending" },
]} />`,
    storyPath: "data-display/Timeline.stories.tsx",
    rules: [],
  },
  {
    name: "Table",
    group: "data-display",
    tagline:
      "Primitive table shell (Table/TableHeader/TableBody/TableRow/TableHead/TableCell). Prefer DataTable for admin lists; use these for custom one-off tables.",
    props: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "TableHeader / TableBody composition.",
      },
      { name: "className", type: "string", description: "Extra classes on the table element." },
      {
        name: "scrollable",
        type: "boolean",
        description:
          "Whether Table owns its own horizontal-scroll region (default true). Leave true for a standalone table so a table wider than its container scrolls in a keyboard-reachable wrapper. Set false only when an ancestor already provides the scroll region (DataTable does) to avoid a redundant nested scroller + duplicate keyboard tab stop.",
      },
      {
        name: "preset",
        type: '"default" | "action-collection"',
        defaultValue: '"default"',
        description:
          'Named collection contract. "default" emits no attribute and keeps the plain table. "action-collection" is the canonical dense approval/action queue (gh#253): the desktop INTRINSIC column widths (which make a five-column queue wider than its card and force a horizontal scroll at 390) are replaced by table-layout: fixed plus the token-owned column PRIORITY measures (--table-action-collection-*), and cells wrap. Mark each column with `priority` on its TableHead AND its TableCell. Semantics are untouched — no display change, no role rewriting, no card transformation — so header association, aria-sort and screen-reader table navigation are identical at 390 and 1440.',
      },
      {
        name: "collapseBelow",
        type: '"sm" | "md" | "lg" | "xl"',
        defaultValue: '"sm"',
        description:
          'Step at which preset="action-collection" switches to the compact priority measures, measured against the TABLE\'S OWN container (a container query), not the viewport — a table inside a master rail collapses before the page does. Ignored while preset is "default".',
      },
    ],
    usage: [
      "DO compose all six sub-parts in order: wrap with `<Table>`, then `<TableHeader>` containing `<TableRow><TableHead>…</TableRow>`, then `<TableBody>` containing one or more `<TableRow><TableCell>…` rows. Skipping any layer (e.g. bare `<th>` inside `<Table>`) bypasses the design tokens and hover/border styles.",
      'DO use `TableHead` (not `TableCell`) for header cells — it renders `<th>` with `data-slot="table-head"` and the `--table-row-height` CSS variable for consistent header sizing across the design system. `TableCell` renders `<td>` with `data-slot="table-cell"` and is for body rows only.',
      'DO apply numeric alignment via `className` on individual `TableHead`/`TableCell` elements (e.g. `className="text-right"`). There are no built-in alignment props — all styling goes through Tailwind class overrides.',
      "DO NOT hand-roll empty-state handling inside a Table composition. When data can be empty, switch to `DataTable` (which has a built-in empty state) or wrap the `<Table>` with a conditional that renders `<EmptyState>` — never leave a table with only a header and zero rows.",
      "DO NOT use Table for lists that need sorting, filtering, pagination, or row selection — those features are only in `DataTable`. Table is intentionally stateless: it owns no TanStack Table instance, no column definitions, and no toolbar.",
      'DO reach for `preset="action-collection"` for a dense approval / action queue (requester · target · reason · requested date · row actions) that must stay readable at 390px, and mark every column with `priority` on BOTH its `TableHead` and its `TableCell`: `primary` (the row subject), `secondary` (its target), `meta` (a timestamp/id), `actions` (the row-action affordance, whose measure is reserved first so it can never be pushed off-screen). Leave the free-text column unmarked — it takes the remaining space. Never add a consumer width, a hidden column or a page-local breakpoint to make a table fit; retune `--table-action-collection-*` instead. The IDENTICAL preset exists on `DataTable` (`preset` + `collapseBelow` on the table, `priority` on the `ColumnDef`) sharing these same tokens — use DataTable when the queue is data-driven and needs sorting/selection/pagination, and reach for the raw `Table` only for a hand-authored queue.',
      "DO place `<Table>` inside a `<CardContent flush>` (or `p-0` card) when embedding in a Card, so the built-in `overflow-auto` wrapper sits flush to the card edges. Wrapping with plain `<CardContent>` adds padding that clips the horizontal scroll shadow.",
    ],
    useCases: [
      "Invoice line-item breakdowns — a fixed, read-only list of product/quantity/unit-price/total rows where columns are predefined and will never need sort or filter controls.",
      "Summary/comparison tables inside a detail panel or Dialog, such as showing two payment plans side-by-side, where the structure is hand-authored and not driven by a data array.",
      "Print or PDF-export views where a minimal, stateless `<table>` element with predictable markup is required and DataTable's JS-driven features would interfere with server-side rendering or CSS print rules.",
      "Embedded sub-tables inside a DataTable expanded row (the inner table uses Table primitives because nesting a full DataTable instance inside another is unsupported).",
      "Static reference tables in documentation, onboarding, or settings pages — e.g. a permission matrix or feature comparison — where every cell is literal JSX content, not from a data array.",
    ],
    related: [
      "DataTable — choose DataTable for any data array that needs sorting, filtering, pagination, row selection, bulk actions, or density toggle. DataTable internally renders Table primitives, so switching up is non-breaking. Default to DataTable for all admin list pages.",
      "SkeletonTable — use as a loading placeholder before a Table or DataTable mounts. Drop it in the `skeleton` slot of DataState, or render it directly while data is fetching. Do not show a Table with empty rows as a loading state.",
      "Descriptions — choose Descriptions when content is label→value pairs (two columns, no repeated rows of the same type). Table is better when every row shares the same typed columns.",
      "DataState — when your Table's data comes from `useQuery`, wrap it in DataState to handle loading/error/empty states declaratively instead of writing conditional logic around the Table yourself.",
    ],
    example: `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@godxjp/ui/data-display";

<Table>
  <TableHeader><TableRow><TableHead>項目</TableHead><TableHead className="text-right">金額</TableHead></TableRow></TableHeader>
  <TableBody><TableRow><TableCell>送料</TableCell><TableCell className="text-right">¥500</TableCell></TableRow></TableBody>
</Table>`,
    storyPath: "data-display/Table.stories.tsx",
    rules: [],
  },
  {
    name: "DataState",
    group: "data-display",
    tagline:
      "TanStack Query lifecycle widget — skeleton / error / empty / success for one useQuery block. Import from @godxjp/ui/query.",
    props: [
      {
        name: "query",
        type: "UseQueryResult<T>",
        required: true,
        description: "The useQuery result.",
      },
      { name: "skeleton", type: "ReactNode", required: true, description: "Shown while loading." },
      {
        name: "prerequisite",
        type: "ReactNode",
        description: "Shown when the query is disabled/unstarted (pending + fetchStatus idle).",
      },
      {
        name: "showRetry",
        type: "boolean",
        defaultValue: "false",
        description:
          "Force Retry even for non-transient causes. Retry is offered automatically for transient/network/5xx errors regardless of this flag.",
      },
      {
        name: "onAuthError",
        type: "() => void",
        description:
          "Recovery for 401 / expired-token errors: renew the session or sign in again. A 401 renders this action instead of Retry.",
      },
      {
        name: "children",
        type: "(data) => ReactNode",
        required: true,
        description: "Render function with resolved data.",
      },
      { name: "empty", type: "ReactNode", description: "Shown when isEmpty(data) is true." },
      { name: "isEmpty", type: "(data) => boolean", description: "Custom empty check." },
    ],
    usage: [
      "DO: pass a `UseQueryResult<T>` directly from `useQuery` — DataState reads `isPending`, `isError`, `isFetching`, `data`, and `error` off it; never destructure those fields manually and branch yourself.",
      "DO: always provide a `skeleton` — it renders during both the initial pending phase and during a re-fetch after an error; pass `<SkeletonTable />` for tabular data or `<SkeletonStat />` for stat card lists — never `null` or a spinner div.",
      'DO: provide `empty` + `isEmpty` together when the data can legitimately return 0 items — e.g. `isEmpty={(d) => d.items.length === 0}` paired with `empty={<EmptyState title="…" />}`. Omitting `empty` means an empty array still falls through to `children`, silently rendering a blank table.',
      "DON'T: wrap DataState in your own conditional — e.g. `{query.isSuccess && <DataState …>}`. DataState IS the conditional; the outer guard is redundant and breaks the retry/refetch skeleton.",
      "DON'T: use DataState for `useInfiniteQuery` results. The `query` prop type is `UseQueryResult<T>`, not `UseInfiniteQueryResult`. Use `InfiniteQueryState` (from `@godxjp/ui/query`) instead, which accepts `flatten` and renders a load-more footer.",
      "DO: classify errors by cause. Use session renewal/sign-in for 401, access guidance for 403, contextual correction for domain errors, and opt into showRetry only for transient network/5xx errors.",
      "DO: pass prerequisite for enabled:false queries. Pending + fetchStatus idle is unstarted, not loading, and never renders a skeleton.",
      "DO: rely on the localized, cause-specific error message — the raw backend/token/stack text is never shown. For a domain-specific message (e.g. a 422 field error) pass a custom errorRenderer.",
      "DO: expect a background refetch over existing data to keep the content on screen with a polite sr-only busy status — it does not flash the skeleton. Only the initial fetch (isPending) shows the skeleton.",
    ],
    useCases: [
      "A detail page that loads a single invoice/journal entry via `useQuery` — DataState renders the skeleton row while fetching, an error alert with retry if the API fails, and the `<InvoiceCard>` only when data is confirmed non-null.",
      "A list page that shows a `DataTable` of members/partners — wrap the table in DataState so the skeleton matches the column count while loading and `EmptyState` appears when the filtered result set is empty.",
      "A sidebar panel that lazily loads related transactions for the selected entity — DataState keeps the panel in skeleton state during the background fetch without any manual `isPending` branching in the parent.",
      "A dashboard stat card that calls a summary API — DataState handles the loading/error/empty lifecycle so `<StatCard>` is only rendered with fully resolved numbers, preventing NaN or undefined rendering.",
      "Any page using `useQuery` where the empty state and loading state are visually different — DataState enforces the correct visual for each phase without scattered `if` statements across the component tree.",
    ],
    related: [
      "InfiniteQueryState — use instead of DataState when the query is `useInfiniteQuery`; it accepts a `flatten` function to reduce pages and adds a load-more footer. DataState cannot accept `UseInfiniteQueryResult`.",
      "SkeletonTable / SkeletonStat — pass as the `skeleton` prop of DataState; they are not standalone replacements for DataState, only the loading slot inside it.",
      "EmptyState — pass as the `empty` prop of DataState alongside a matching `isEmpty` predicate; do not hand-roll an empty-check outside DataState by inspecting `query.data` yourself.",
      "AlertMutationFeedback — sibling widget for mutation (not query) lifecycle; use it below a form submit button to surface `useMutation` errors, not DataState which only handles `useQuery`.",
    ],
    example: `import { DataState } from "@godxjp/ui/query";

<DataState query={membersQuery} skeleton={<SkeletonTable />} isEmpty={(d) => d.items.length === 0} empty={<EmptyState title="会員なし" />}>
  {(d) => <MemberTable items={d.items} />}
</DataState>`,
    storyPath: "query/DataState.stories.tsx",
    rules: [],
  },
  {
    name: "InfiniteQueryState",
    group: "data-display",
    tagline:
      "useInfiniteQuery widget — flatten pages, skeleton/empty/error, load-more footer. Import from @godxjp/ui/query.",
    props: [
      {
        name: "query",
        type: "UseInfiniteQueryResult",
        required: true,
        description: "The useInfiniteQuery result.",
      },
      {
        name: "skeleton",
        type: "ReactNode",
        required: true,
        description: "Shown while initial load pends.",
      },
      {
        name: "flatten",
        type: "(data) => TFlat",
        required: true,
        description: "Reduce pages to a flat list (use flattenItemPages helper).",
      },
      {
        name: "children",
        type: "(flat, helpers) => ReactNode",
        required: true,
        description: "Render with flat data + { fetchNextPage, hasNextPage, isFetchingNextPage }.",
      },
    ],
    usage: [
      "DO: Import from `@godxjp/ui/query` (not `@godxjp/ui`). Use the bundled `flattenItemPages` helper for any API that returns `{ items: T[] }` pages — it handles `undefined` data safely. Custom page shapes require a custom `flatten` function.",
      "DO: Always pass `skeleton` (e.g. `<SkeletonTable />` or `<SkeletonStat />`). It shows on initial `isPending`, on refetch-after-error, and whenever `data` is absent. Never show a blank area while loading.",
      "DO: Pass `empty` (an `<EmptyState>` node) to handle the zero-results case — without it the children render-prop is called with an empty array and you get a silent blank screen. Provide a custom `isEmpty` only when `TFlat` is not an array.",
      "DO: Let errors remain cause-aware. Retry is automatic only for classified transient/network/5xx failures. Unknown errors do not get a blind retry unless `showRetry` or `onRetry` is explicitly supplied; 401 routes to `onAuthError`, and raw backend/token text is never rendered.",
      "DON'T: Hand-roll a load-more button. The component renders a default centered outline Button when `hasNextPage` is true. Override only via `loadMore` (custom node) or `showLoadMore={false}` (hide entirely). Never call `query.fetchNextPage()` outside the component for pagination.",
      "DON'T: Use `InfiniteQueryState` for a `useQuery` result — it expects `UseInfiniteQueryResult` shape (`pages`, `hasNextPage`, `fetchNextPage`, `isFetchingNextPage`). For regular `useQuery` use `DataState` instead.",
      "DON'T: Confuse the two generics: `TPage` is the raw page shape from the API, `TFlat` is what `flatten` returns (usually `TItem[]`). The `children` render-prop receives `TFlat`, not `TPage`. Pass `isEmpty` if `TFlat` is not a plain array so empty detection works correctly.",
    ],
    useCases: [
      "Activity / audit-log feed that accumulates pages as the user scrolls down or clicks 'Load more' — the default footer button handles `fetchNextPage` automatically.",
      "Invoice or transaction list with cursor-based pagination where total count is unknown and pages are appended rather than replaced (replacing pages is DataTable's job).",
      "Notification inbox, comment thread, or journal entry list where new items are appended at the bottom and the user never pages backwards.",
      "Search results with a 'Show more' button rather than numbered pages — pass `showLoadMore={true}` (default) and hide the button once `hasNextPage` is false without any extra state.",
      "Admin dashboard 'recent events' widget backed by `useInfiniteQuery` — use `SkeletonTable` as `skeleton` and `<EmptyState title='No events yet' />` as `empty` so every state is handled.",
      "Infinite-scroll implementation: receive the `helpers` argument in `children` (`{ fetchNextPage, hasNextPage, isFetchingNextPage }`) to wire a scroll sentinel (Intersection Observer) instead of the built-in button, while still benefiting from error/skeleton/empty lifecycle handling.",
    ],
    related: [
      "DataState — use instead when the query is a plain `useQuery` (not infinite). Identical lifecycle surface (skeleton/empty/error/children) but expects a single page of data, not accumulated pages. Pick DataState for any paginated table where only one page is visible at a time.",
      "DataTable — use for tabular data with server-side pagination where pages are swapped, not appended. DataTable manages its own pagination UI (cursor buttons); InfiniteQueryState is for append-only / infinite-scroll patterns.",
      "SkeletonTable / SkeletonStat — pass as the `skeleton` prop to InfiniteQueryState; do not render them manually alongside InfiniteQueryState since the component controls when skeleton is visible.",
      "ButtonRefetch — companion component for the page header refresh action wired to `query.refetch()`. Use alongside InfiniteQueryState when you want an explicit refresh control in addition to the built-in load-more footer.",
    ],
    example: `import { InfiniteQueryState, flattenItemPages } from "@godxjp/ui/query";

<InfiniteQueryState query={q} skeleton={<SkeletonRows />} flatten={flattenItemPages} isEmpty={(it) => it.length === 0}>
  {(items) => items.map((a) => <ActivityRow key={a.id} activity={a} />)}
</InfiniteQueryState>`,
    storyPath: "query/InfiniteQueryState.stories.tsx",
    rules: [],
  },

  // ─── data-entry ─────────────────────────────────────────────────────────
  {
    name: "Form",
    group: "data-entry",
    tagline:
      "Ant-style layout container — renders <form> and pushes layout (vertical/horizontal), labelWidth/controlWidth, label alignment, responsive collapse, and multi-column grid down to every FormField (overridable per field).",
    props: [
      {
        name: "layout",
        type: '"vertical" | "horizontal" | "inline"',
        defaultValue: '"vertical"',
        description: "Label position relative to control; applied to all FormFields.",
      },
      {
        name: "labelWidth",
        type: "number | string",
        description: "Label column width in horizontal layout (number→px). e.g. 120 or '8rem'.",
      },
      {
        name: "controlWidth",
        type: "number | string",
        description: "Cap the control width (number→px). Omit to fill the column.",
      },
      {
        name: "labelAlign",
        type: '"start" | "end"',
        defaultValue: '"end"',
        description: "Horizontal alignment of the label within its column.",
      },
      {
        name: "collapseBelow",
        type: '"sm" | "md" | "lg" | "xl" | false',
        defaultValue: '"md"',
        description:
          "Breakpoint below which horizontal collapses to vertical (mobile-first). false = always horizontal.",
      },
      {
        name: "columns",
        type: "number | { sm?: number; md?: number; lg?: number }",
        description: "Lay fields out in a responsive grid (reuses ResponsiveGrid; 1 col on small).",
      },
      {
        name: "errors",
        type: "Partial<Record<string, string | string[]>>",
        description:
          "Server validation error bag (e.g. Inertia's form.errors). Each FormField name='…' inside resolves its own message from the bag and CLAIMS its key; <FormErrors /> renders the unclaimed remainder (errors on hidden/derived fields). Works in both <form> and asChild modes. A Form WITHOUT this prop joins a surrounding FormErrorsProvider (sibling Card+Form sections sharing one bag); a Form WITH it starts its own shadowing registry.",
      },
      {
        name: "density",
        type: '"compact" | "default" | "comfortable"',
        description: "Apply a density to controls inside the form.",
      },
    ],
    usage: [
      "DO set `layout`, `labelWidth`, `controlWidth` ONCE on `<Form>` — every `<FormField>` inside inherits them. Override a single field by passing the same prop on that `<FormField>` (Form → FormField priority).",
      "DO rely on mobile-first collapse: `layout='horizontal'` automatically stacks to vertical below `collapseBelow` (default `md`). Pass `collapseBelow={false}` only when a field MUST stay label-beside-control even on phones.",
      "DO use `columns` for multi-field forms (e.g. `columns={2}`) — it reuses ResponsiveGrid (1 column on small screens, more on md/lg). Span a wide field across columns with `<FormField colSpan={2}>`.",
      "DON'T hand-roll a `<form>` + Flex stack for spacing — `<Form>` provides the vertical rhythm and the layout context FormField reads. Wire react-hook-form by spreading `onSubmit={handleSubmit(...)}` onto `<Form>`.",
      "SERVER ERROR BAG: pass `errors={form.errors}` (Inertia) ONCE on `<Form>`, give each field a `name`, and put `<FormErrors />` at the top of the form. A named field resolves its message from the bag automatically (no per-field `error={errors.x}`), and FormErrors catches validation errors on hidden/derived keys (`action_mode`, `page`, a source-record id) that no visible field could display — without it those submits fail SILENTLY.",
      "SIBLING FORMS: an edit screen split into several Card+Form sections shares ONE bag by wrapping the region in `<FormErrorsProvider errors={form.errors}>` instead of passing `errors` to each Form — the section Forms (without their own `errors`) join the shared registry, and one `<FormErrors />` anywhere in the region renders the unclaimed remainder.",
    ],
    useCases: [
      "A settings page form where every label sits in a fixed 120px column to the left of its control (horizontal), collapsing to stacked labels on mobile.",
      "A two-column entity-edit form (`columns={2}`) where the address field spans both columns (`colSpan={2}`).",
      "A compact filter form (`layout='horizontal' density='compact'`) above a DataTable.",
      "An Inertia edit screen passing `errors={form.errors}` so every `FormField name='…'` self-binds its server validation message and `<FormErrors />` surfaces the hidden-field remainder.",
    ],
    related: [
      "FormField — the per-field wrapper (label + control + helper/error) that reads Form's layout context; use one per control inside a Form.",
      "FormErrors — renders the error-bag entries no mounted FormField claims (validation errors on hidden/derived fields); place inside a `Form errors={…}`.",
      "ResponsiveGrid — Form `columns` reuses it; use ResponsiveGrid directly for non-form card grids.",
    ],
    example: `import { Form, FormField, Input } from "@godxjp/ui/data-entry";

<Form layout="horizontal" labelWidth={120} columns={2} onSubmit={onSubmit}>
  <FormField id="first" label="姓"><Input id="first" /></FormField>
  <FormField id="last" label="名"><Input id="last" /></FormField>
  <FormField id="address" label="住所" colSpan={2}><Input id="address" /></FormField>
</Form>`,
    storyPath: "data-entry/Form.stories.tsx",
    rules: [23, 24],
  },
  {
    name: "FormField",
    group: "data-entry",
    tagline:
      "Wraps a control with label, helper, and error; injects the accessible name (aria-labelledby), description (aria-describedby) and validation (aria-errormessage/aria-invalid/aria-required) contract onto the child, which forwards it to its real semantic focus target. Reads the parent Form's layout (vertical/horizontal) — overridable per field.",
    props: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "Forwarded to Label htmlFor + builds helper/error ids.",
      },
      {
        name: "name",
        type: "string",
        description:
          "Error-bag key of this field. When the surrounding Form carries `errors`, the field resolves its message from `errors[name]` automatically (an explicit `error` prop wins) and CLAIMS the key so <FormErrors /> does not repeat it. NOT injected into the child — pass `name` on the control itself for native form submission.",
      },
      {
        name: "label",
        type: "ReactNode",
        required: true,
        description: "Field label above the control.",
      },
      {
        name: "required",
        type: "boolean",
        defaultValue: "false",
        description: "Red asterisk + aria-required on the child.",
      },
      { name: "helper", type: "string", description: "Muted hint shown when there is no error." },
      {
        name: "error",
        type: "string",
        description: "Destructive error message (role=alert); overrides helper.",
      },
      {
        name: "layout",
        type: '"vertical" | "horizontal" | "inline"',
        description: "Override the parent Form's layout for this field only.",
      },
      {
        name: "labelWidth",
        type: "number | string",
        description: "Override the Form's label width for this field.",
      },
      {
        name: "controlWidth",
        type: "number | string",
        description: "Override the Form's control width for this field.",
      },
      {
        name: "colSpan",
        type: "number",
        description: "Span N columns when inside a `columns` Form grid.",
      },
      {
        name: "children",
        type: "ReactNode",
        description:
          "The single interactive control to render. Mutually exclusive with `staticText` — pass exactly one of the two.",
      },
      {
        name: "staticText",
        type: "ReactNode",
        description:
          "Read-only VALUE instead of an interactive control (gh#294) — renders as plain text styled to match `Descriptions.Item`'s value typography byte-for-byte (`text-sm break-all`), skipping all of FormField's id/aria-* control wiring (there is nothing to label). Mutually exclusive with `children`. Use this to put a read-only field (name, email — anything immutable) on the SAME `<Form>` as editable fields, so it inherits the exact same layout/labelAlign/row-gap automatically instead of reaching for a separate `Descriptions` block that needs its own props reconciled to match.",
      },
    ],
    usage: [
      "DO pass the same string to both `id` on `<FormField>` and `id` on the child control — the component wires `<Label htmlFor={id}>`, and builds `{id}-helper` / `{id}-error` ids for `aria-describedby`. If the ids diverge the label click and screen-reader announcements break.",
      "DO pass a SINGLE React element as `children`. FormField calls `React.cloneElement` on it to inject `aria-describedby`, `aria-required`, and `aria-invalid` — if you pass a fragment or multiple nodes, cloneElement silently skips the injection and a11y attributes are lost.",
      "COMPOSITE CHILD (gh#303): when the single child is a layout wrapper — a `Flex` holding a range from/to pair or a 年/月 input+select combo — the label still reaches every control inside. FormField publishes its label through FieldNameContext and each control's semantic focus target (Input's `<input>`, Select/SearchSelect's `role=combobox` trigger, and everything composed on them) adopts it as a LAST-RESORT accessible name; a control's own `aria-label`/`aria-labelledby` always wins, so set a per-control `aria-label` (e.g. 開始日/終了日) when the two halves should announce distinct names. The wrapper itself renders as a named `role='group'` (see Flex).",
      "DO reach for `staticText` (not `children` with a bare string/span) for a read-only field mixed into an otherwise-editable Form — e.g. an immutable name/email row above an editable role Select on the same Members-edit card. It renders with the exact typography `Descriptions.Item`'s value uses, and — because it IS a FormField reading the same Form context — it lines up with every other field's label column, `labelAlign`, and row-to-row gap automatically. A bare string as `children` instead triggers the dev-mode 'expected a single React element child' warning and has no typography contract at all.",
      "WIDTH: a FormField FILLS its container in vertical/horizontal layout — exactly like Ant Design's Form.Item (vertical → width:100%). It works full-width inside `<Form>`, a `ResponsiveGrid` cell, a bare `<Flex direction='col'>`, or a plain block; you do NOT need to wrap it in a grid to get full width. `layout='inline'` is the only content-width exception (compact, side-by-side). To narrow just the control (keeping the label row full-width), set `controlWidth` — never constrain the FormField itself.",
      "DO use the `error` prop (not a hand-rolled `<p>`) for validation messages — it renders with `role='alert'` and `text-destructive` styling and overrides `helper` automatically. Never render an error paragraph alongside FormField.",
      "DO use `labelAddon` (a ReactNode rendered inline after the label text) for supplementary controls such as a tooltip trigger or a 'copy' icon button — never insert such controls as siblings outside FormField, which breaks layout.",
      "DON'T wrap `Switch` in FormField — use `Field` instead, which already handles the label, hidden `<input name>` for HTML form submission, error, and helper internally.",
      "DON'T use FormField for checkbox-beside-label or radio-beside-label patterns — use `Field` (single checkbox/radio with description) or `CheckboxGroup` / `RadioGroup` (multiple options), which have their own integrated labelling.",
      "CONTRACT (which element owns each ARIA relationship): every data-entry control accepts and FORWARDS the injected props to its real semantic focus target, not a wrapper div — Input/Textarea/NumberInput → the `<input>/<textarea>`; Select/SearchSelect/Cascader/TreeSelect → the `role=combobox` trigger (with aria-expanded + aria-haspopup + aria-controls per the WAI-ARIA APG combobox pattern); DatePicker/MonthPicker/TimePicker → the typeable `role=combobox` input (aria-haspopup=dialog); ColorPicker → the `<input type=color>` swatch; SearchInput → the `role=searchbox` input. GROUP controls own the relationship on their container: RadioGroup → `role=radiogroup` (full validation incl. aria-invalid/-errormessage/-required); CheckboxGroup, DateRangePicker/MonthRangePicker (two inputs), and Transfer → `role=group` — per ARIA 1.2 a group is not a widget, so the error id is folded into aria-describedby instead of aria-invalid/-errormessage. Upload forwards the label/description onto its native `<input type=file>`; its visible dropzone/button keeps its own action label. This forwarding is implemented once in `src/lib/field-a11y.ts` (`pickFieldA11y` / `pickGroupFieldA11y` / `resolveFieldA11y`) — do not reinvent it per control.",
      "NATIVE FORM PARTICIPATION: pass `name` to a control for HTML form submission — Input/Textarea/NumberInput/Select submit natively; SearchSelect submits via a hidden input; DatePicker/TimePicker emit ISO strings (`yyyy-MM-dd` / 24h `HH:mm`); the range pickers emit `${name}_from` / `${name}_to`. `required`/`readOnly`/`disabled` map to the underlying control. Cascader/TreeSelect/Transfer/Upload are NOT native-form-submittable — read their value via `onValueChange` and submit programmatically.",
      "ERROR TIMING & RECOVERY: pass `error` only after a field is dirty or the form is submitted (don't show errors on pristine mount). The error node renders with `role='alert'` so it is announced live the moment it appears; clearing `error` (e.g. after the user corrects the value or a server round-trip succeeds) removes aria-invalid and restores the helper. On submit, focus the first invalid control and/or render an error summary that links to each field by `id`.",
    ],
    useCases: [
      "Labelling a text `Input` or `Textarea` in an invoice-entry form, showing a red asterisk for required fields and surfacing server validation errors returned from a Laravel FormRequest.",
      "Wrapping a `Select` or `DatePicker` inside a multi-field filter panel where each control needs a visible label, helper hint (e.g. 'YYYY/MM/DD'), and inline error state.",
      "Adding a `labelAddon` tooltip button next to a 'Tax rate' label in an accounting form to explain when different rates apply, without breaking the label–control association.",
      "Enclosing a `DateRangePicker` or `TimePicker` in an admin settings page where the field needs a label, a muted hint ('Inclusive of start and end date'), and conditional error display.",
      "Wrapping a `SearchSelect` or `Select` (with `showSearch`) control for vendor/account lookup in a journal-entry form where the `id` must be kept consistent for programmatic focus management.",
      "Providing structured error feedback for a `Cascader` or `TreeSelect` in a multi-level category assignment screen, replacing ad-hoc error rendering with the standardised `role='alert'` pattern.",
    ],
    related: [
      "Label — the bare Radix label component. Use directly only when you are building a fully custom layout that cannot accept FormField's stack wrapper, and you will manage aria-describedby/aria-invalid yourself. FormField is always preferred for standard form controls.",
      "Field — a self-contained field for boolean toggles: it already includes its own label, hidden `<input name>` for HTML form submission, helper, and error. Never wrap a bare `Switch` in FormField.",
      "Field — pairs a single checkbox or radio with a label and optional description in a horizontal layout (control beside text). Use Field instead of FormField when the control and its label sit side-by-side rather than stacked.",
      "CheckboxGroup / RadioGroup — for groups of options where FormField is not needed per-item; the group component handles its own legend/label and option layout.",
    ],
    example: `import { FormField, Input } from "@godxjp/ui/data-entry";

<FormField id="coupon-name" label="クーポン名" required error={errors.name} helper="最大50文字">
  <Input id="coupon-name" placeholder="春の花粉症対策15%OFF" value={name} onValueChange={(e) => setName(e.target.value)} />
</FormField>`,
    storyPath: "data-entry/FormField.stories.tsx",
    rules: [23],
  },
  {
    name: "FormErrors",
    group: "data-entry",
    tagline:
      "The 'no field to stand on' error summary — renders the entries of the surrounding Form's server error bag that no mounted FormField name='…' claims: validation errors on hidden/derived fields (action_mode, page, a source-record id) that would otherwise fail silently. Composed on Alert tone='destructive' (role='alert'); renders nothing while every entry is claimed or the bag is empty.",
    props: [
      {
        name: "errors",
        type: "Partial<Record<string, string | string[]>>",
        description:
          "Explicit error bag — overrides the surrounding Form's `errors`. Use when the component sits outside a Form (e.g. inside FormRoot); field claiming still applies when a Form provides the registry.",
      },
      {
        name: "title",
        type: "ReactNode",
        description:
          "Heading above the messages. Defaults to the localized 'please review your input' title (dataEntry.formErrors.title).",
      },
      { name: "className", type: "string", description: "Root class override." },
    ],
    usage: [
      "DO pass the WHOLE bag to `<Form errors={form.errors}>` and place `<FormErrors />` at the top of the form — never hand-filter the bag per page. Fields with `name` claim their keys automatically; FormErrors shows only the remainder, so the consumer never maintains an except-list.",
      "DO give every visible field its `name` when adopting `Form errors` on a screen. A field that keeps a manual `error={errors.x}` WITHOUT `name` does not claim its key, and FormErrors will show that message twice.",
      "DON'T hand-roll a destructive Alert bound to `errors.hidden_key` per page — that is exactly the per-page listing this component exists to remove, and it goes stale the moment the server adds a new derived-field rule.",
      "DON'T use FormErrors as a generic mutation-failure banner — that is `Alert.QueryError` / toast territory. FormErrors is scoped to the VALIDATION bag of the surrounding form.",
      "ARRAY ENTRIES: a `string[]` bag value lists every message in the banner; a claimed field shows only the FIRST message of its array (Laravel `$errors->first()` semantics).",
      "SIBLING FORMS: when the screen is split into several Card+Form sections, wrap the REGION in `<FormErrorsProvider errors={form.errors}>` and give NO `errors` to the section Forms — they join the shared registry and one `<FormErrors />` covers the whole screen. A nested Form WITH its own `errors` deliberately starts a separate (shadowed) registry.",
    ],
    useCases: [
      "An Inertia edit screen whose Laravel FormRequest validates hidden/derived inputs (`action_mode`, `page`, `source_slip_cd`) — the user pressed save and previously saw NOTHING because those keys have no visible field.",
      "A ported legacy screen where the server rejects a stale edit-lock or a missing source record under a key that only exists server-side.",
      "A create form where a Laravel `RuleObject` attaches a cross-field error to a synthetic key (e.g. `combination`) rather than to one input.",
    ],
    related: [
      "Form — provides the error bag (`errors`) and the claim registry FormErrors reads; FormErrors must sit inside it (or receive `errors` explicitly).",
      "FormErrorsProvider — the shared registry for a REGION of sibling Forms (multi-Card edit screens): wrap the region with it, leave `errors` off the section Forms, and one FormErrors covers the whole screen.",
      "FormField — `name` claims a bag key and self-binds its message; the claimed key never re-appears in FormErrors.",
      "Alert — the underlying destructive banner; use Alert directly for non-validation notices.",
    ],
    example: `import { Form, FormErrors, FormField, Input } from "@godxjp/ui/data-entry";
import { useForm } from "@inertiajs/react";

const form = useForm({ customer_nm: "", action_mode: "regist" });

<Form asChild layout="horizontal" labelWidth={140} errors={form.errors}>
  <form onSubmit={submit}>
    <FormErrors />
    <FormField name="customer_nm" label="顧客名" required>
      <Input value={form.data.customer_nm} onChange={(e) => form.setData("customer_nm", e.target.value)} />
    </FormField>
  </form>
</Form>`,
    storyPath: "data-entry/FormErrors.stories.tsx",
    rules: [23],
  },
  {
    name: "Input",
    group: "data-entry",
    tagline:
      "Styled wrapper around native <input>; accepts all HTML input attributes. Pair with FormField for labelled fields.",
    props: [
      { name: "id", type: "string", description: "Associates with a <label htmlFor>." },
      { name: "type", type: "string", defaultValue: '"text"', description: "Native input type." },
      { name: "placeholder", type: "string", description: "Placeholder." },
      { name: "value", type: "string | number", description: "Controlled value." },
      {
        name: "onValueChange",
        type: "React.ChangeEventHandler<HTMLInputElement>",
        description: "Native change handler.",
      },
      {
        name: "allowClear",
        type: "boolean",
        defaultValue: "false",
        description:
          "Opt-in inline ✕ that clears the field while it holds text (works controlled + uncontrolled). Off by default, so existing inputs are unchanged.",
      },
      {
        name: "onClear",
        type: "() => void",
        description: "Called after the field is cleared via the inline ✕ (requires `allowClear`).",
      },
      {
        name: "leadingIcon",
        type: "React.ReactNode",
        description:
          "A leading affordance pinned inside the start of the field (e.g. a Mail / Lock / Search glyph) — purely decorative, rendered before the text. Sized to the control via tokens and offset with `ps-9` automatically; never hand-roll an absolutely-positioned icon over a plain Input.",
      },
      {
        name: "trailingIcon",
        type: "React.ReactNode",
        description:
          "A trailing affordance pinned inside the field (e.g. a calendar / clock popover trigger). ONE trailing icon shows at a time: when `allowClear` and the field holds a value the clear ✕ REPLACES this icon; otherwise this icon shows. Never both — this is how DatePicker/TimePicker render their open trigger.",
      },
    ],
    usage: [
      "DO always wrap Input in FormField when the field needs a label, helper text, or validation error — FormField injects aria-describedby and aria-invalid onto Input automatically; never wire these attributes by hand.",
      "DO match the `id` prop on Input to the `id` prop on its parent FormField so that `htmlFor` linkage and the generated helper/error ids are consistent.",
      "DO use Input in controlled mode (`value` + `onChange`) for forms driven by Inertia's `useForm` or React state; uncontrolled usage (no `value`) is only acceptable for fire-and-forget inline edits where form state is not needed.",
      "DON'T use a raw `<input>` element — Input adds the full token-based styling (border-input, focus ring, disabled/invalid states, file-slot styling) and the `data-slot='input'` marker that FormField relies on to inject aria attributes.",
      "DON'T hand-roll an error border or red ring with className — Input reads `aria-invalid` (set by FormField) and applies `border-destructive` + `ring-destructive/20` automatically; adding manual destructive classes will conflict.",
      "DON'T use Input for multi-line text — use Textarea; DON'T use it for filtered/debounced search — use SearchInput which fires `onSearch` after a debounce and includes a clear button.",
    ],
    useCases: [
      "Single-line text fields in create/edit forms — invoice reference numbers, company names, contact emails, coupon codes, amounts typed as text (pair with `type='number'` for numeric entry).",
      "Inline editable cells or quick-edit dialogs where a single short value needs to be changed (e.g. editing a journal entry memo or an account code) and full Select/DatePicker overhead is unnecessary.",
      "File upload trigger when wrapped with `type='file'` — the file-slot classes style the native file button consistently without any extra wrapper.",
      "Password entry fields (`type='password'`) in auth or settings screens, where the styled focus ring and disabled-state opacity are needed without building a custom control.",
      "Numeric/currency input in accounting forms (`type='number'`, `inputMode='decimal'`) for quantities, exchange rates, or tax amounts where a free-form numeric entry is required rather than a slider or stepper.",
    ],
    related: [
      "SearchInput — use instead of Input when the value drives a live filter or search query; SearchInput debounces internally, fires `onSearch` (not `onChange`), and provides a built-in clear button. Never put debounce logic on top of a plain Input.",
      "Textarea — use instead of Input for multi-line text (notes, descriptions, memo fields). Input is strictly single-line.",
      "FormField — always compose Input inside FormField when the field needs a visible label, helper hint, or validation error message; FormField handles all a11y wiring so Input stays a pure unstyled-but-styled primitive.",
      "Select — use instead of Input when the value must come from a fixed or async option list; never render a plain Input and parse free text when the set of valid values is enumerable.",
    ],
    example: `import { Input } from "@godxjp/ui/data-entry";

<Input id="qty" type="number" placeholder="例: 500" value={value} onValueChange={(e) => setValue(e.target.value)} />`,
    storyPath: "data-entry/Input.stories.tsx",
    rules: [],
  },
  {
    name: "NumberInput",
    group: "data-entry",
    tagline:
      "WAI-ARIA spinbutton for localized numeric entry — composes the real Input (role=spinbutton, inputMode=decimal) with stacked increment/decrement step Buttons. Type freely, Arrow/Shift-Arrow step, value commits clamped to min/max + rounded to precision.",
    props: [
      {
        name: "value",
        type: "number | null",
        description: "Controlled value. `null` = empty field. Pair with `onValueChange`.",
      },
      {
        name: "defaultValue",
        type: "number | null",
        defaultValue: "null",
        description: "Uncontrolled initial value.",
      },
      {
        name: "onValueChange",
        type: "(value: number | null) => void",
        description:
          "Value change callback (vocabulary triad — NOT onChange). Receives `null` when the field is empty.",
      },
      {
        name: "min",
        type: "number",
        description:
          "Lower bound — clamps on commit and disables the decrement stepper at the floor.",
      },
      {
        name: "max",
        type: "number",
        description:
          "Upper bound — clamps on commit and disables the increment stepper at the ceiling.",
      },
      {
        name: "step",
        type: "number",
        defaultValue: "1",
        description: "Increment for the steppers + ArrowUp/ArrowDown (Shift = ×10).",
      },
      {
        name: "precision",
        type: "number",
        description: "Committed decimal places. Inferred from `step` when omitted.",
      },
      { name: "disabled", type: "boolean", description: "Disables typing and stepping." },
      {
        name: "readOnly",
        type: "boolean",
        description: "Value is shown and selectable but not typeable or steppable.",
      },
      {
        name: "size",
        type: '"xs" | "sm" | "md" | "lg"',
        defaultValue: '"md"',
        description:
          "Control height tier (--control-height). Aligns with sibling controls on a row.",
      },
      { name: "placeholder", type: "string", description: "Placeholder shown when empty." },
      {
        name: "prefix",
        type: "React.ReactNode",
        description: "Leading decorative affix inside the field (e.g. `¥`). aria-hidden.",
      },
      {
        name: "suffix",
        type: "React.ReactNode",
        description: "Trailing decorative affix inside the field (e.g. `%`). aria-hidden.",
      },
      {
        name: "name",
        type: "string",
        description: "Form field name — submits its value natively.",
      },
      { name: "id", type: "string", description: "Associates with a <label htmlFor> / FormField." },
      {
        name: "aria-label",
        type: "string",
        description:
          "Accessible name for the spinbutton when no visible FormField label is present.",
      },
    ],
    usage: [
      "DO use NumberInput (not `<Input type='number'>`) whenever numeric entry wants steppers, min/max clamping, precision rounding, or a ¥/% affix — it is the canonical numeric primitive. Plain Input has no stepper and no clamp.",
      "DO drive it controlled with `value` + `onValueChange` carrying `number | null` (the vocabulary triad — NOT `onChange`). `null` means the field is empty; never substitute 0 for empty.",
      "DON'T pass `value` without `onValueChange` — like every controlled @godxjp/ui input it would freeze. Omit both for uncontrolled (use `defaultValue`).",
      "DO set `step` to your increment and let `precision` (or the decimals of `step`) round the committed value: `step={0.25} precision={2}` gives quarter-step entry rounded to 2 places on blur/Enter.",
      "DO set `min`/`max` for bounded quantities — the value clamps on commit and the matching stepper Button auto-disables at the bound. The steppers are tabIndex=-1 so they never pollute the keyboard tab order (Arrow keys cover keyboard stepping).",
      "DON'T wrap it in a hand-rolled label/error markup — compose it inside FormField (matching `id`) for the aria wiring, exactly like Input.",
      "DON'T format the value yourself for display — NumberInput formats at rest via Intl.NumberFormat in the active locale while keeping the raw value typeable on focus.",
    ],
    useCases: [
      "Quantity / line-item steppers in order, invoice, or cart forms (min={1}, step={1}) where ± buttons and a floor are expected.",
      "Price / amount fields with a currency affix (prefix='¥', step={10}) — the affix is decorative and the committed value stays a plain number.",
      "Percentage / rate inputs bounded 0–100 (suffix='%', min={0} max={100}).",
      "Decimal measurements — weight, dimensions, exchange rates (step={0.25}, precision={2}) needing rounded commit.",
      "Any bounded numeric setting (timeouts, retry counts, page sizes) where a slider is too coarse and a free Input lacks clamping.",
    ],
    related: [
      "Input — the plain single-line field NumberInput composes; use Input directly only for free numeric text with no stepper/clamp need.",
      "Slider — use instead when the user picks an approximate value within a range by dragging; NumberInput is for exact keyed entry.",
      "FormField — compose NumberInput inside FormField (matching id) for label/helper/error a11y wiring.",
      "TimePicker — the HH:mm time sibling; NumberInput is for plain numbers, TimePicker for clock times.",
    ],
    storyPath: "data-entry/NumberInput.stories.tsx",
    rules: [3, 6],
    example: `import { NumberInput } from "@godxjp/ui/data-entry";

<NumberInput
  value={qty}
  onValueChange={setQty}
  min={1}
  max={99}
  step={1}
  prefix="¥"
  aria-label="数量"
/>`,
  },
  {
    name: "SearchInput",
    group: "data-entry",
    tagline:
      "Debounced search box with a clear button. Fires onSearch (NOT onChange) after the debounce. Controlled (value) or uncontrolled (defaultValue).",
    props: [
      {
        name: "onSearch",
        type: "(q: string) => void",
        required: true,
        description:
          "Called with the query after the debounce. Use this to drive filtering — NOT onChange.",
      },
      { name: "value", type: "string", description: "Controlled value." },
      {
        name: "defaultValue",
        type: "string",
        defaultValue: '""',
        description: "Initial uncontrolled value.",
      },
      { name: "placeholder", type: "string", description: "Input placeholder." },
      {
        name: "debounce",
        type: "number",
        defaultValue: "250",
        description: "Debounce delay (ms).",
      },
      {
        name: "id",
        type: "string",
        description: "Input id; pair with `label` or an external `<label htmlFor>`.",
      },
      {
        name: "label",
        type: "React.ReactNode",
        description:
          "Optional visible label rendered above the search box (falls back to an sr-only label).",
      },
      {
        name: "onChange",
        type: "(value: string) => void",
        description:
          "Fires on EVERY keystroke (immediate) — required to keep a controlled `value` responsive.",
      },
      {
        name: "onSearchChange",
        type: "(value: string) => void",
        description:
          "Fires the DEBOUNCED search term after `debounceMs` — wire your query/filter here, not onChange.",
      },
      {
        name: "debounceMs",
        type: "number",
        defaultValue: "250",
        description: "Debounce delay (ms) before `onSearchChange` / `onSearch` fires.",
      },
    ],
    usage: [
      "DO: listen to `onSearch`, not `onChange`. The component debounces internally (default 250 ms) and fires `onSearch(q)` after the delay — never wire your filter logic to `onChange` on SearchInput because it does not expose one.",
      "DO: choose controlled vs uncontrolled deliberately. Pass `value` + `onSearch` together for controlled mode (e.g. when search state lives in a URL param or shared parent). For local-only ephemeral search pass only `defaultValue` + `onSearch` — omitting `value` puts the component in uncontrolled mode.",
      "DO: supply an `ariaLabel` (or visible `label`) when no adjacent label exists. Without either prop, SearchInput falls back to the i18n key `common.search` rendered as a visually-hidden `<Label>` — still accessible, but providing a context-specific string (e.g. `ariaLabel='請求書を検索'`) is more descriptive for screen readers.",
      "DON'T: use SearchInput inside a `<form>` expecting native form submission. The component has no `name` prop and does not emit a form field value — it is a filter-trigger widget. For a form search field, use a plain `Input` inside `FormField`.",
      "DON'T: hand-roll a debounced input when you need a search box. SearchInput ships the debounce, clear button (×), search icon, and accessible label — recreating these with a raw `<Input>` adds code and misses the UX contract.",
      "DON'T: place SearchInput inside a `ToolbarGroup` wrapper — `ToolbarGroup` is for Select/DatePicker controls with a label chip. SearchInput goes directly as a child of `Toolbar` (or standalone above a table), not wrapped in `ToolbarGroup`.",
    ],
    useCases: [
      "List-page filter bar: placed as the first child of `Toolbar` (before any `ToolbarGroup` children) to drive text-based filtering of a `DataTable`. The `onSearch` callback updates a query param or state variable that the table's data fetch reads.",
      "Inline client-side search over a small in-memory list (e.g. a sidebar nav list, a transfer panel, a settings category list) where results narrow immediately as the user types without a server round-trip — use uncontrolled mode (`defaultValue`) so no state is needed in the parent.",
      "URL-synced search: controlled mode where `value` comes from `useSearchParams()` and `onSearch` pushes to the URL, enabling deep-linkable, bookmarkable filtered views on invoice/transaction/customer index pages.",
      "Panel or dialog search: filtering a long dropdown list, a tree, or a multi-item selection panel that does not use the built-in `Command` palette — SearchInput provides the search box while the parent renders the filtered result set.",
      "Toolbar search on a data-heavy accounting page (e.g. journal-entry search, partner lookup in a subledger view) where the 250 ms debounce prevents a flood of API calls on every keystroke without requiring the developer to implement debounce logic.",
    ],
    related: [
      "Input — use `Input` (inside `FormField`) when the search field is part of a submitted form and needs a `name` attribute, or when you need full `onChange` control without any debounce or clear button. SearchInput is the right pick when the field only triggers filtering, not form submission.",
      "Toolbar — SearchInput is almost always placed as a direct child of `Toolbar`, which provides the surrounding strip, clear-all button, and active-filter state. Do not use SearchInput as a standalone header widget when a full filter strip (with selects etc.) already exists — compose them together.",
      "Command — use `Command` + `CommandInput` when you need a keyboard-navigable command palette or combobox list with grouped items and keyboard selection. `Command` is only meaningful when paired with `CommandList`; SearchInput is the right pick for a plain filter box with no item-selection behavior.",
      "Select (with showSearch) — when users must pick a value from a list AND search to narrow it, use `<Select options={...} showSearch>` (which has its own built-in search input). SearchInput is for filtering an external data set, not for value selection from an option list.",
    ],
    example: `import { SearchInput } from "@godxjp/ui/data-entry";

<SearchInput placeholder="クーポン名・IDで検索" value={search} onSearch={setSearch} />`,
    storyPath: "data-entry/SearchInput.stories.tsx",
    rules: [23],
  },
  {
    name: "Select",
    group: "data-entry",
    tagline:
      "Polymorphic single-select: pass options/loadOptions for the data-driven (Ant-style) API, or compose sub-parts manually — never use a raw <select>.",
    props: [
      {
        name: "options",
        type: "SearchSelectOptionProp[]",
        description:
          "Static option list. Passing this (or loadOptions) switches Select from the compound API to the data-driven API. Each option has { value, label, sublabel?, icon?, group?, disabled? }. `icon` (avatar / flag / lucide node) renders before the label in the rows AND on the trigger once selected. group buckets the option under an optgroup-style heading.",
      },
      {
        name: "loadOptions",
        type: "(params: SearchSelectLoadParamsProp) => Promise<SearchSelectLoadResultProp>",
        description:
          "Async remote fetcher. Receives { query, page } (1-based). Must return { options, hasMore? }. Implies showSearch=true automatically. Drives debounced search + infinite-scroll pagination.",
      },
      {
        name: "showSearch",
        type: "boolean",
        defaultValue: "true when loadOptions is set, false otherwise",
        description:
          "Toggle the searchable combobox mode (SearchSelect engine) vs a plain Radix listbox. Set to true on a static options list to enable client-side filtering.",
      },
      {
        name: "value",
        type: "string",
        defaultValue: '""',
        description:
          "Controlled selected value (data-driven API). Pass an empty string to represent no selection.",
      },
      {
        name: "defaultValue",
        type: "string",
        description:
          "Uncontrolled initial value (data-driven API). The trigger shows the matching option's label at rest — including in searchable (showSearch) mode — so an edit form pre-filled from server data renders the label, not the placeholder. Selected option is marked by a background tint (no check icon).",
      },
      {
        name: "onChange",
        type: "(value: string, option?: SearchSelectOptionProp) => void",
        description:
          "Change handler for the data-driven API. Receives the new value string and the matching option object.",
      },
      {
        name: "renderOption",
        type: "(option: SearchSelectOptionProp) => React.ReactNode",
        description:
          "Custom per-option renderer for the dropdown ROWS (Ant-Design style). Defaults to label + optional sublabel. Does not change the trigger — use `labelRender` for that.",
      },
      {
        name: "labelRender",
        type: "(selected: { value: string; label: React.ReactNode; option?: SearchSelectOptionProp }) => React.ReactNode",
        description:
          "Custom renderer for the SELECTED value shown on the TRIGGER (Ant Design `labelRender`) — avatar + name + role badge, etc. `option` is undefined for an async preset whose page hasn't loaded. Only used while a value is selected; the placeholder still shows when empty.",
      },
      {
        name: "selectedLabel",
        type: "string",
        description:
          "Display label for the current value when its option is not in the loaded page (async). Prevents a flash of the raw id.",
      },
      {
        name: "selectedIcon",
        type: "React.ReactNode",
        description:
          "Leading icon shown on the trigger for the current value when its option isn't loaded yet (async preset) — the trigger counterpart of `selectedLabel`, so an edit form pre-filled from the server shows the avatar/flag at rest.",
      },
      {
        name: "placeholder",
        type: "string",
        description: "Placeholder shown in the trigger when no value is selected.",
      },
      {
        name: "searchPlaceholder",
        type: "string",
        description: "Placeholder inside the search input (combobox mode only).",
      },
      {
        name: "emptyMessage",
        type: "string",
        description: "Message rendered when the filtered list is empty.",
      },
      {
        name: "loadingMessage",
        type: "string",
        description: "Message rendered while loadOptions is resolving.",
      },
      {
        name: "errorMessage",
        type: "string",
        description:
          "Message rendered when an async loadOptions REJECTS — a distinct state from empty/loading. Defaults to a localized 'Couldn’t load options'. The panel shows this instead of a blank surface or a misleading 'no results'.",
      },
      {
        name: "clearable",
        type: "boolean",
        defaultValue: "true",
        description:
          "Show a clear row when a value is selected (data-driven API). Set to false for required fields.",
      },
      {
        name: "clearLabel",
        type: "string",
        description: "Label for the clear row (data-driven combobox mode).",
      },
      { name: "disabled", type: "boolean", description: "Disables the entire select." },
      {
        name: "readOnly",
        type: "boolean",
        defaultValue: "false",
        description:
          "Searchable mode only (showSearch/loadOptions). Value is shown (and the clear affordance hidden) but the popover cannot be opened — no new pick, no search. Mirrors the Input/NumberInput readOnly contract: stays focusable and still submits its value, unlike disabled.",
      },
      {
        name: "size",
        type: '"xs" | "sm" | "md" | "lg"',
        description:
          "Searchable mode only. Height tier forwarded to the SearchSelect trigger Button. For the compound API use SelectTrigger's own size prop instead (below).",
      },
      {
        name: "open",
        type: "boolean",
        description:
          "Searchable mode only. Controlled popover open state (uncontrolled by default). Pair with onOpenChange.",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description:
          "Searchable mode only. Fires on every open/close attempt — including ones ignored because open is externally pinned — so a controlled consumer stays in sync.",
      },
      {
        name: "search",
        type: "string",
        description:
          "Searchable mode only. Controlled search-box query (uncontrolled by default). Pair with onSearchChange.",
      },
      {
        name: "onSearchChange",
        type: "(query: string) => void",
        description: "Searchable mode only. Fires on every keystroke in the search box.",
      },
      {
        name: "filterOption",
        type: "(option: SearchSelectOptionProp, query: string) => boolean",
        description:
          "Searchable mode only, static options (ignored with loadOptions, which owns its own server-side filtering). Overrides the default label/value substring filter. Only consulted while the query is non-empty.",
      },
      {
        name: "renderError",
        type: "(params: { message: string; retry: () => void }) => React.ReactNode",
        description:
          "Searchable mode only. Custom error slot, overriding the default errorMessage row. retry() reloads from the first page.",
      },
      {
        name: "renderLoadMore",
        type: "(params: { hasMore: boolean; loading: boolean; loadMore: () => void }) => React.ReactNode",
        description:
          "Searchable mode only. Custom 'load more' affordance appended below the list while another page is available — pairs with (does not replace) the built-in scroll-triggered pagination.",
      },
      {
        name: "name",
        type: "string",
        description:
          "Form field name. Submits the selected value via a hidden input (data-driven API). Required for uncontrolled form submission.",
      },
      {
        name: "id",
        type: "string",
        description: "HTML id for the trigger element. Wire to a <label htmlFor> for a11y.",
      },
      {
        name: "className",
        type: "string",
        description: "Additional CSS classes applied to the trigger.",
      },
      {
        name: "data-testid",
        type: "string",
        description:
          "Test id on the trigger. Option items get ${data-testid}-option-${value} automatically.",
      },
      {
        name: "SelectTrigger size",
        type: '"sm" | "md"',
        defaultValue: '"md"',
        description: "Compound API only. Size variant on the SelectTrigger sub-component.",
      },
      {
        name: "SelectTrigger showIndicator",
        type: "boolean",
        defaultValue: "true",
        description:
          "Compound API only. Set false to omit the built-in chevron disclosure indicator from the DOM entirely (not a CSS hide) — for specialized triggers (icon-only, etc.) that render their own affordance, so no consumer descendant CSS is needed.",
      },
    ],
    usage: [
      "DO use the data-driven API (options/loadOptions) for straightforward selects — it handles grouping, search, async, and custom rendering automatically. Only reach for the compound API when you need to inject arbitrary content into the trigger or listbox.",
      "DO pass name= on the data-driven Select so the value is submitted with a native form or Inertia useForm. Without name= the value is React-only and will not appear in form data.",
      "DO use loadOptions + selectedLabel together for async selects: selectedLabel prevents a flash of the raw id string while the first page loads.",
      "DO name the control with FormField (or aria-label) — NOT with a <label htmlFor>. The trigger is a button with role=combobox, and neither a wrapping <label> nor htmlFor names it: role=combobox takes no accessible name from its content either, so the visible value is the VALUE, not the name. Wrapping the Select in <FormField label=…> is the supported route; for a Select with no visible label pass aria-label. This holds for BOTH APIs — the compound trigger inherits the FormField contract (label, helper, error, required) through Select, and a bare <Select aria-label=…> forwards it too. Anything you set directly on SelectTrigger wins.",
      "DO treat loading / no-options / error / disabled as DISTINCT states. A data-driven Select never opens a blank popover: a static options=[] list auto-disables the trigger (opening it would show nothing), while an async loadOptions shows a loading row, then either the options, a localized empty affordance (override with emptyMessage), or an error affordance if the fetch rejects (override with errorMessage). Disable the Select when there is nothing to pick AND no async loader; keep it enabled (it opens to load/search) whenever loadOptions is set.",
      "DON'T mix the two APIs: once you pass options or loadOptions, Select is data-driven — all compound sub-parts (SelectTrigger, SelectContent, SelectItem) are rendered internally. Do not wrap them manually.",
      "DON'T use a raw <select> element. Select is the one control for all single-select use cases. The only allowed raw <select> is a hidden aria-hidden sr-only element kept as an e2e hook paired with a visible Select.",
      "COMPOUND API sub-parts (when NOT using options/loadOptions): Select → SelectTrigger (contains SelectValue) → SelectContent → SelectItem. Optionally wrap items in SelectGroup + SelectLabel for headings, or add SelectSeparator between sections.",
      "DO reach for open/onOpenChange (searchable mode) to drive the popover from outside — e.g. opening it programmatically after a validation error — and search/onSearchChange to seed or read the query text. Both fall back to internal state when omitted; onOpenChange/onSearchChange still fire either way so a controlled consumer stays in sync.",
      "DO use readOnly (searchable mode) for a value that must stay visible and submittable but not editable in this view — it differs from disabled: the control stays focusable and its value still submits. clearable is ignored while readOnly.",
      "DO use filterOption (searchable mode, static options) when the default label/value substring match isn't right — e.g. filtering by a hidden code field. It is NOT consulted when loadOptions is set (that fetcher owns its own filtering).",
      "DO use renderError + renderLoadMore (searchable mode) to replace the default error row with a branded retry affordance, or to pair a manual 'load more' button with (not instead of) the built-in scroll-triggered pagination.",
      "DO set SelectTrigger showIndicator={false} (compound API) on a specialized trigger — icon-only, or one with its own affordance — instead of hiding [data-slot=select-chevron] with consumer CSS.",
    ],
    useCases: [
      "Status filter on an invoice list — pass options=[{value:'draft',label:'Draft'},{value:'paid',label:'Paid'}] with onChange to drive a query param; no search needed so omit showSearch.",
      "Legal-entity switcher — static options list with showSearch=true for client-side filtering when there are many entities; use selectedLabel to show the entity name before the full list loads.",
      "Account category picker backed by an API — pass loadOptions to stream pages of accounts as the user types; use renderOption to show account code + name side by side; pass selectedLabel so the trigger shows the name on first render.",
      "Grouped currency picker — set option.group='Asia' / 'Europe' on each option; the plain (non-search) data-driven mode renders SelectGroup headings automatically.",
      "Form field in an accounting entry — use the compound API when the trigger must show a currency flag icon alongside the SelectValue; wire SelectTrigger size='sm' for dense table rows.",
      "Required department select in a HR form — pass clearable=false so the user cannot clear the field once set; pair with name='department_id' for Inertia useForm submission.",
      "Async account picker whose API can fail — pass loadOptions plus errorMessage so a rejected fetch shows a clear error affordance in the panel (not a blank surface or a false 'no results'); the loading and empty states are handled automatically.",
    ],
    related: [
      "SearchSelect — the combobox engine Select delegates to when showSearch=true or loadOptions is set. Prefer Select with showSearch instead of reaching for SearchSelect directly (SearchSelect is now deprecated as a public API).",
      "TreeSelect — use when options are hierarchical (parent/child tree). Not a drop-in for Select; has expand/collapse and a separate treeData prop.",
      "Select with showSearch — use Select (with the `showSearch` prop) for typeahead/autocomplete lookup patterns instead of the removed Autocomplete component.",
      "RadioGroup — use instead of Select when there are 2-4 mutually exclusive choices that must all be visible at once without opening a popover.",
      "Combobox (if present) — compound cmdk-powered combobox for free-text + suggestion; Select is for strict value lists only.",
    ],
    example: `import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";

// ── 1. Data-driven (Ant-style) — static list, no search ──────────────────────
export function StatusSelect({ value, onChange }) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      options={[
        { value: "draft",    label: "Draft" },
        { value: "sent",     label: "Sent" },
        { value: "paid",     label: "Paid" },
        { value: "overdue",  label: "Overdue" },
      ]}
      placeholder="Select status"
      name="status"
      id="status"
    />
  );
}

// ── 2. Data-driven, searchable static list with groups ────────────────────────
export function CurrencySelect({ value, onChange }) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      showSearch
      options={[
        { value: "JPY", label: "Japanese Yen",  group: "Asia" },
        { value: "VND", label: "Vietnamese Dong", group: "Asia" },
        { value: "EUR", label: "Euro",           group: "Europe" },
        { value: "GBP", label: "Pound Sterling", group: "Europe" },
      ]}
      placeholder="Select currency"
      searchPlaceholder="Search currencies…"
      clearable={false}
      name="currency"
    />
  );
}

// ── 3. Data-driven, async (loadOptions) ──────────────────────────────────────
export function AccountSelect({ value, onChange, selectedLabel }) {
  async function loadOptions({ query, page }) {
    const res = await fetch(\`/api/accounts?q=\${query}&page=\${page}\`);
    const json = await res.json();
    return { options: json.data, hasMore: json.hasMore };
  }
  return (
    <Select
      value={value}
      onValueChange={onChange}
      loadOptions={loadOptions}
      selectedLabel={selectedLabel}
      placeholder="Search accounts…"
      renderOption={(opt) => (
        <span className="flex gap-2">
          <span className="text-muted-foreground font-mono">{opt.value}</span>
          {opt.label}
        </span>
      )}
      name="account_id"
    />
  );
}

// ── 4. Compound API — custom trigger content ──────────────────────────────────
export function PrioritySelect({ value, onValueChange }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger size="sm" id="priority">
        <SelectValue placeholder="Priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Urgency</SelectLabel>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value="low">Low</SelectItem>
      </SelectContent>
    </Select>
  );
}`,
    storyPath: "data-entry/Select.stories.tsx",
    rules: [3, 6, 23],
  },
  {
    name: "Switch",
    group: "data-entry",
    tagline: "Radix toggle switch (bare). For a labelled row with a hidden form input use Field.",
    props: [
      { name: "checked", type: "boolean", description: "Controlled checked state." },
      {
        name: "onCheckedChange",
        type: "(checked: boolean) => void",
        description: "Fires when toggled.",
      },
      {
        name: "size",
        type: '"sm" | "md"',
        defaultValue: '"md"',
        description: "Thumb size — 'sm' for dense rows.",
      },
      { name: "id", type: "string", description: "Links to a <Label htmlFor>." },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disable the toggle.",
      },
    ],
    usage: [
      "DO use Switch (bare) only when you are building a custom inline toggle without a visible label — e.g., a DataTable row action column. Always pair it with a <Label htmlFor={id}> placed adjacent in the DOM; never leave it label-less for screen readers.",
      "DO NOT pass a `name` prop to bare Switch expecting HTML form submission — Radix Switch renders no hidden input, so the value is silently dropped on submit. Use Field (which mirrors a hidden `0`/`1` input) for any field that must submit inside an HTML <form>.",
      "DO use the `size` prop ('sm' | 'md') to control thumb size. 'sm' is appropriate in dense DataTable rows or filter bars; omit it (defaults to 'md') everywhere else.",
      "DO wire controlled state: pass both `checked` (boolean) and `onCheckedChange` together. Passing only one causes a React controlled/uncontrolled warning. For uncontrolled use, pass neither — but bare Switch has no `defaultChecked` state management built in (Field handles that internally).",
      "DON'T hand-roll a <div> + <label> wrapper with bare Switch to get a labelled field — that is exactly what Field provides, including aria-describedby, aria-invalid, error/helper text, and the hidden input. Reach for Field instead.",
      "DO link the switch to its label via matching `id` on Switch and `htmlFor` on Label. Without this pairing, clicking the label text does not toggle the switch and the a11y association is broken.",
    ],
    useCases: [
      "Inline toggle in a DataTable action cell (e.g., 'Active' column) where the label is already provided by the column header and no form submission is involved.",
      "Settings panel where a React state boolean is toggled immediately via an optimistic API call — no <form> submit, so Field's hidden input is unnecessary.",
      "Custom compound component where you compose Switch + Label yourself and need direct access to the Radix Root props (e.g., adding aria-controls or data-attributes not supported by Field).",
      "Filter toolbar toggle (e.g., 'Show archived') rendered inline next to other filter controls, using size='sm' for density parity with adjacent inputs.",
      "Preview/demo UI where the switch controls a local display state (dark-mode preview, feature flag preview) with no server persistence.",
    ],
    related: [
      "Field — use this instead of bare Switch whenever the toggle needs a visible label, helper text, error message, or must submit its value inside an HTML <form>. Field composes Label + Switch + hidden input automatically.",
      "Checkbox — use Checkbox (or CheckboxGroup) when the user is selecting one or more items from a set, or when the binary choice semantically means 'agree/select' rather than 'enable/disable'. Switch implies an immediate, persistent state change; Checkbox implies a form choice.",
      "Field — use for a binary or small-set choice rendered as radio-style cards with rich descriptions, when the visual weight of a toggle is insufficient for the decision importance.",
      "RadioGroup — use when the user must choose exactly one option from 2–4 mutually exclusive values; Switch is only appropriate for a single on/off boolean.",
    ],
    example: `import { Switch, Label } from "@godxjp/ui/data-entry";

<div className="flex items-center gap-2">
  <Switch id="stackable" checked={stackable} onCheckedChange={setStackable} />
  <Label htmlFor="stackable">他クーポンとの併用を許可</Label>
</div>`,
    storyPath: "data-entry/Switch.stories.tsx",
    rules: [],
  },
  {
    name: "Textarea",
    group: "data-entry",
    tagline: "Styled wrapper around native <textarea>. Pair with FormField for labelled fields.",
    props: [
      { name: "id", type: "string", description: "Associates with a <Label htmlFor>." },
      { name: "rows", type: "number", description: "Visible text rows." },
      { name: "value", type: "string", description: "Controlled value." },
      {
        name: "onChange",
        type: "React.ChangeEventHandler<HTMLTextAreaElement>",
        description: "Change handler.",
      },
      {
        name: "allowClear",
        type: "boolean",
        defaultValue: "false",
        description:
          "Opt-in inline ✕ at the top-end that clears the field while it holds text (controlled + uncontrolled). Off by default.",
      },
      {
        name: "onClear",
        type: "() => void",
        description: "Called after the field is cleared via the inline ✕ (requires `allowClear`).",
      },
    ],
    usage: [
      "DO always wrap Textarea in FormField when it appears in a form — FormField clones aria-describedby, aria-required, and aria-invalid onto the child, giving error/helper announcements and screen-reader labelling for free. Pass matching id props to both.",
      "DO use the godx-ui Textarea (`import { Textarea } from '@godxjp/ui/data-entry'`) — never a raw `<textarea>`. The component applies the `ui-control-multiline` token class that picks up density, focus-ring, and border tokens from the design system.",
      "DO control the value with `value` + `onChange` in React-managed forms (e.g. Inertia `useForm`). Textarea is a plain `forwardRef` over the native element so it accepts all standard `HTMLTextAreaElement` attributes — `rows`, `maxLength`, `disabled`, `name`, `placeholder`, `readOnly` all pass through directly.",
      "DO pass `name` when the textarea sits inside an HTML `<form>` for native form submission or when Inertia's `useForm` destructures field values by key — the `name` attribute maps the value into the form data bag.",
      "DON'T apply manual height or padding classes directly on Textarea to simulate a taller field — use the `rows` prop instead. The component does not auto-resize; if you need auto-grow behaviour you must wire a custom `onInput` handler that adjusts `style.height` explicitly.",
      "DON'T hand-roll label + error markup next to a bare Textarea. Always use FormField: it injects aria-invalid (red ring on the control), renders a `role='alert'` error paragraph, and links them via aria-describedby automatically.",
    ],
    useCases: [
      "Free-text memo or note fields on an invoice or transaction detail form — e.g. '備考 / Notes' that can hold multi-line internal comments alongside structured Invoice fields.",
      "Rejection reason or approval comment in an admin workflow dialog — a short-to-medium text block a reviewer types before confirming an action in a Dialog or Sheet.",
      "Address or multi-line description input on a vendor / partner entity form where a single-line Input would be too restrictive.",
      "Email body composer or message template editor in a lightweight CRM or notification settings screen where rich text is not required.",
      "Audit log annotation — allowing an accountant to attach a plain-text explanation to a manual journal entry or adjustment record.",
    ],
    related: [
      "Input — use Input for single-line values (names, amounts, codes). Use Textarea only when the expected value spans multiple lines or could be longer than ~80 characters.",
      "FormField — always the parent wrapper for Textarea in forms; provides label, helper text, error message, and injects all required aria attributes onto the Textarea child automatically.",
      "Select — when the user must pick from a finite set of multi-line-looking options (e.g. template choices) use Select, not a Textarea presenting options as free text.",
      "Select with showSearch or SearchSelect — if the multi-line field is actually a tag/token input or a constrained lookup, prefer Select (showSearch) or SearchSelect over a Textarea that the user types into freely.",
    ],
    example: `import { Textarea } from "@godxjp/ui/data-entry";

<Textarea id="notes" rows={4} placeholder="自由記述" value={notes} onValueChange={(e) => setNotes(e.target.value)} />`,
    storyPath: "data-entry/Textarea.stories.tsx",
    rules: [],
  },
  {
    name: "Label",
    group: "data-entry",
    tagline: "Styled Radix Label; use htmlFor to associate with a control.",
    props: [
      { name: "htmlFor", type: "string", description: "Id of the associated control." },
      { name: "children", type: "ReactNode", description: "Label content." },
    ],
    usage: [
      "DO: always pass `htmlFor` matching the `id` of the associated control — this is the entire purpose of the component. Without it, clicking the label text does NOT focus or toggle the control, breaking a11y and UX.",
      'DO: import from `@godxjp/ui/data-entry` (not shadcn or Radix directly). The godx-ui Label extends Radix\'s LabelPrimitive with `data-slot="label"`, `select-none`, and `group-data-[disabled]` opacity-50 — hand-rolling a `<label>` loses all of these.',
      "DON'T: use Label as a standalone visible heading or section title. It is a form-control association primitive. For page/section headings use semantic HTML (`<h2>`, etc.) or a typography class instead.",
      "DON'T: wrap Label around a control that is already labelled internally. FormField, Field, and CheckboxGroup all render Label internally — adding a second Label creates a duplicate association and redundant screen-reader announcement.",
      "DO: pair Label with Checkbox or Switch when NOT using the compound wrapper (Field). In that case generate the shared id with `React.useId()` and pass it to both `id` on the control and `htmlFor` on Label.",
      "PREFER FormField over a bare Label + control pair whenever you also need helper text, error messages, or `required` asterisk. FormField injects `aria-describedby` and `aria-invalid` automatically; a bare Label does not.",
    ],
    useCases: [
      "Pairing with a standalone Checkbox when Field's two-line layout is unnecessary — e.g. a single 'Remember me' option in a login form.",
      "Labelling a bare Switch (not Field) in a settings row where the switch is controlled by parent state and no HTML form name attribute is needed.",
      "Adding a visible label to a custom or third-party control that accepts an `id` prop but isn't wrapped by FormField or Field.",
      "Labelling a Textarea in a free-text form field when FormField's helper/error slots aren't needed, keeping the markup minimal.",
      "Rendering an accessible label inside a table row where a FormField's block layout would break the inline/grid structure.",
      "Adding a label to a DatePicker, TimePicker, or ColorPicker inside a simple layout that doesn't need the full FormField wrapper.",
    ],
    related: [
      "FormField — prefer this over a bare Label whenever the field needs helper text, an error message, or a required marker; FormField renders Label internally and wires aria-describedby/aria-invalid automatically.",
      "Field — use for a Checkbox or Radio.Item that needs a visible label and optional description line; it renders Label internally — do NOT add a second Label around it.",
      "Field — use instead of a bare Switch + Label pair when the control must submit a value via an HTML form name; Field owns the Label + hidden input composition.",
      "Checkbox — the most common bare-Label partner; pair with Label via shared useId() id/htmlFor when Field's layout is too heavy.",
    ],
    example: `import { Label } from "@godxjp/ui/data-entry";

<Label htmlFor="stackable">併用を許可</Label>`,
    storyPath: "data-entry/Label.stories.tsx",
    rules: [],
  },
  {
    name: "Checkbox",
    group: "data-entry",
    tagline: "Radix checkbox; standalone or via CheckboxGroup with an options array.",
    props: [
      {
        name: "checked",
        type: "boolean | 'indeterminate'",
        description: "Controlled checked state.",
      },
      {
        name: "onCheckedChange",
        type: "(checked) => void",
        description: "Fires when checked state changes.",
      },
      { name: "id", type: "string", description: "Links to a <Label htmlFor>." },
    ],
    usage: [
      "DO pair every standalone Checkbox with a `<Label htmlFor={id}>` — the id prop on Checkbox must match the htmlFor on Label so screen readers announce the label on focus. Without this pairing the control is inaccessible.",
      "DO use the controlled pattern (`checked` + `onCheckedChange`) for any form-bound checkbox. `onCheckedChange` receives `boolean | 'indeterminate'` — always coerce with `!!v` or an explicit guard before storing in state.",
      "DO use `Checkbox.Group` (alias for CheckboxGroup) with the `options` prop when you have ≥2 choices from an array — it renders each item inside a `Field` (label + optional description), generates stable ids automatically, and manages the `string[]` value array. NEVER hand-roll a loop of bare `<Checkbox>` elements for a multi-select list.",
      "DO pass `name` on `Checkbox.Group` (not on individual checkboxes) when the group must submit as form fields — the group propagates the name to each internal checkbox so the browser serialises all checked values under that key.",
      "DON'T use `checked='indeterminate'` on `Checkbox.Group` children — indeterminate is only meaningful on a parent 'select-all' control you wire manually; the group itself does not auto-compute it.",
      "DON'T wrap a standalone Checkbox in `Field` manually — `Field` is the internal composition primitive that `Checkbox.Group` uses. For a single boolean with a label, use `<div className='flex items-center gap-2'><Checkbox id='x' .../><Label htmlFor='x'>...</Label></div>` as shown in the catalog example; for a full labelled-checkbox with description, use `Field` directly only if you need a one-off item outside a group.",
    ],
    useCases: [
      "A 'Select all' / bulk-action row above a DataTable — standalone Checkbox with `checked='indeterminate'` when some (not all) rows are selected, toggling between all-selected and none-selected.",
      "A multi-step filter panel (e.g. filter invoices by payment status: Paid, Unpaid, Overdue) — `Checkbox.Group` with `options` prop and `orientation='vertical'`, controlled value wired to Toolbar state.",
      "Confirmation or consent acknowledgement before a destructive action in a Dialog — standalone Checkbox with controlled state used to enable/disable the confirm Button.",
      "Settings panel where each feature flag is a boolean toggle with a description line — `Checkbox.Group` with options carrying a `description` field so each row renders label + subtext via Field.",
      "Bulk-edit form row in an accounting ledger (e.g. 'Apply to all selected entries') — standalone Checkbox with name + value inside a `<form>` for native HTML form submission.",
      "Onboarding checklist (e.g. 'I have read the terms', 'I consent to data processing') with multiple distinct items whose values are independent — two separate standalone Checkboxes, each with their own id/state, not a Checkbox.Group (since each item maps to a different boolean field).",
    ],
    related: [
      "CheckboxGroup — use instead of bare Checkbox when you have a list of 2+ options from an array; it handles id generation, Field wrapping, value array management, and the `name` prop for form submission. Checkbox is for a single boolean; CheckboxGroup is for multi-select.",
      "Switch / Field — use Switch when the action takes immediate effect (enable/disable a feature in settings) rather than selecting an option to be submitted later. Checkbox implies 'will be submitted as part of a form'; Switch implies 'applies now'. Field adds a hidden input for HTML form compatibility.",
      "RadioGroup — use when only one option in a group may be selected at a time (mutually exclusive). CheckboxGroup = multiple selections allowed; RadioGroup = single selection only.",
      "Field — the internal layout primitive (control slot + Label + description) that Checkbox.Group renders per item. Use it directly only when you need a one-off labelled checkbox or radio item outside of a group, and you want the consistent indent/description layout without the group's value-management overhead.",
    ],
    example: `import { Checkbox, Label } from "@godxjp/ui/data-entry";

<div className="flex items-center gap-2">
  <Checkbox id="agree" checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} />
  <Label htmlFor="agree">利用規約に同意する</Label>
</div>`,
    storyPath: "data-entry/Checkbox.stories.tsx",
    rules: [],
  },
  {
    name: "RadioGroup",
    group: "data-entry",
    tagline: "Radio group accepting an options array or RadioItem children.",
    props: [
      { name: "value", type: "string", description: "Controlled selected value." },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Fires on selection change.",
      },
      {
        name: "options",
        type: "ChoiceOptionProp[]",
        description: "Declarative list: { label, value, disabled?, description? }.",
      },
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        defaultValue: '"vertical"',
        description: "Layout direction.",
      },
      {
        name: "defaultValue",
        type: "string",
        description: "Uncontrolled initial selected value.",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Disable the whole group.",
      },
      {
        name: "name",
        type: "string",
        description: "Form field name for native submission.",
      },
    ],
    usage: [
      "DO use the `options` prop for the data-driven path: pass `{ label, value, disabled?, description? }[]` and RadioGroup renders every option as a correctly labelled Field automatically — never hand-roll Radio.Item + Label pairs in a loop yourself.",
      "DO provide `name` whenever the group lives inside an HTML form: Radix renders a hidden `<input name={name}>` carrying the selected string value, making the field natively form-submittable without a separate hidden input.",
      "DO use controlled mode (`value` + `onValueChange`) for any form managed by useForm or a state manager. Use `defaultValue` only for truly uncontrolled UI where you never need to read the value in code.",
      "DO NOT reach for children / manual composition unless the options list is dynamic-JSX (e.g. each item needs a custom rendered label with an icon). When you do compose children manually, wrap each Radio.Item in a Field — rendering a bare Radio.Item without Field skips the label and breaks a11y.",
      "DO NOT use RadioGroup when the user may select zero or multiple items — that is CheckboxGroup. RadioGroup enforces exactly one selection at all times (or none before first interaction when uncontrolled).",
      "A11y: the Radix root emits `role=radiogroup`; each item gets `role=radio` and is keyboard-navigable with arrow keys. Never suppress `name` on the Root when inside a form — without it the hidden input is unnamed and won't submit.",
    ],
    useCases: [
      "Selecting a single billing cycle (monthly / quarterly / annual) in an invoice or subscription settings form where all 2-4 options must be visible at once.",
      "Choosing a report output format (PDF / CSV / Excel) before triggering an async export job — keeps all options scannable without opening a dropdown.",
      "Picking a transaction type (income / expense / transfer) on an accounting entry form where the choice changes which subsequent fields are shown.",
      "Selecting a sync trigger mode (first purchase / birthday / manual) in a campaign or automation settings panel — matches the catalog example exactly.",
      "Filtering a compact inline control (horizontal orientation) such as date granularity (day / week / month) inside a dashboard filter bar where a full Select dropdown would be over-engineered.",
      "Choosing an approval status (pending / approved / rejected) on an admin detail sheet where all states must be visible so reviewers can compare them without interaction.",
    ],
    related: [
      "CheckboxGroup — use when the user may select zero or more values simultaneously (multi-select); RadioGroup enforces exactly one selection. Both share the same options array shape and orientation prop.",
      "Select — use when there are 5 or more options or the option list is dynamic/searchable; RadioGroup is preferred for 2-4 fixed visible choices where scanning all options at once matters.",
      "Field — use when there are exactly two states that map to on/off (boolean); RadioGroup is the right pick when the two-or-more options are semantically distinct named values, not a toggle.",
      "Field — the low-level label+description wrapper that RadioGroup uses internally for each item. Use it directly only when manually composing Radio.Item children inside Radio.Group; never hand-roll a label alongside a bare Radio.Item without it.",
    ],
    example: `import { RadioGroup } from "@godxjp/ui/data-entry";

<RadioGroup value={trigger} onValueChange={setTrigger} orientation="horizontal" options={[
  { label: "初回購入", value: "first_purchase" },
  { label: "誕生日", value: "birthday" },
]} />`,
    storyPath: "data-entry/RadioGroup.stories.tsx",
    rules: [23],
  },
  {
    name: "MonthPicker",
    group: "data-entry",
    tagline:
      "Year/month (yyyy/MM) input with an Ant-Design-style month-grid popover — a year chevron header over a 3x4 grid of the twelve months. The input stays typeable; the grid is the visual affordance.",
    props: [
      {
        name: "value",
        type: "Date | undefined",
        description: "Controlled value — first day of the selected month. Pass undefined to clear.",
      },
      {
        name: "defaultValue",
        type: "Date | undefined",
        description: "Uncontrolled initial value.",
      },
      {
        name: "onValueChange",
        type: "(value: Date | undefined) => void",
        description: "Fires on a grid pick, on a complete typed yyyy/MM, and on clear.",
      },
      {
        name: "placeholder",
        type: "string",
        defaultValue: '"yyyy/mm"',
        description: "Placeholder shown while empty.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables the input, the clear button and the grid trigger.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes on the control shell (width/margin overrides).",
      },
      {
        name: "id",
        type: "string",
        description:
          "Wired to the inner input; auto-generated when omitted so the field always has an id.",
      },
      {
        name: "name",
        type: "string",
        description: "Form field name — submits the display text (yyyy/MM).",
      },
      {
        name: "fromYear",
        type: "number",
        description: "Inclusive lower bound for the year navigation.",
      },
      {
        name: "toYear",
        type: "number",
        description: "Inclusive upper bound for the year navigation.",
      },
      {
        name: "allowClear",
        type: "boolean",
        defaultValue: "true",
        description: "Inline clear button while a value is set.",
      },
    ],
    usage: [
      "DO use MonthPicker for every yyyy/MM (year-month) field — never a bare Input with a YYYY/MM helper text.",
      "DO wrap it in FormField like every other labelled control; FormField injects id/aria wiring.",
      "DO NOT compose two MonthPickers to fake a from~to range — that is MonthRangePicker (one control shell, like DateRangePicker).",
    ],
    related: [
      "DatePicker — full date (yyyy-MM-dd); MonthPicker when the day is meaningless (締め年月, 集計年月, 商談発生年月).",
      "MonthRangePicker — use for a yyyy/MM from~to pair; one input-styled control, never two MonthPickers side-by-side.",
    ],
    example: `import { useState } from "react";
import { MonthPicker, FormField } from "@godxjp/ui/data-entry";

export function OrderMonthField() {
  const [ym, setYm] = useState<Date | undefined>(undefined);

  return (
    <FormField label="受注日年月">
      <MonthPicker name="search_order_date_ym" value={ym} onValueChange={setYm} />
    </FormField>
  );
}`,
    storyPath: "data-entry/MonthPicker.stories.tsx",
    rules: [3, 6, 13, 31, 43],
  },
  {
    name: "MonthRangePicker",
    group: "data-entry",
    tagline:
      "Year/month (yyyy/MM) RANGE rendered as ONE input-styled control `[ from → to  ✕ 📅 ]` (Ant RangePicker convention, same shell as DateRangePicker) with an Ant-style month-grid popover. Both inputs stay typeable; picks are two-step with from ≤ to always enforced.",
    props: [
      {
        name: "value",
        type: "DateRange | undefined",
        description:
          "Controlled range — both edges normalized to the first day of their month. Pass undefined to clear.",
      },
      {
        name: "defaultValue",
        type: "DateRange | undefined",
        description: "Uncontrolled initial range.",
      },
      {
        name: "onValueChange",
        type: "(value: DateRange | undefined) => void",
        description:
          "Fires on each grid step ({from, to: undefined} then the complete pair), on a complete typed yyyy/MM at either edge, and on clear. Never emits an inverted range — a backwards pick/typing is swapped so from ≤ to.",
      },
      {
        name: "placeholder",
        type: "string",
        defaultValue: '"yyyy/mm"',
        description: "Placeholder shown in both inputs while empty.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables both inputs, the clear button and the grid trigger.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes on the control shell (width/margin overrides).",
      },
      {
        name: "id",
        type: "string",
        description:
          "Wired to the from input; the to input gets `${id}-to`. Auto-generated when omitted.",
      },
      {
        name: "name",
        type: "string",
        description:
          "Form field name — emits the range as `${name}_from` / `${name}_to` yyyy/MM fields.",
      },
      {
        name: "fromYear",
        type: "number",
        description: "Inclusive lower bound for the year navigation.",
      },
      {
        name: "toYear",
        type: "number",
        description: "Inclusive upper bound for the year navigation.",
      },
      {
        name: "allowClear",
        type: "boolean",
        defaultValue: "true",
        description: "Inline clear button (clears the WHOLE range) while a value is set.",
      },
    ],
    usage: [
      "DO use MonthRangePicker for every yyyy/MM from~to pair — never two MonthPickers (or bare Inputs) separated by ~; a range is ONE control, exactly like DateRangePicker.",
      "DO rely on its built-in range validation: a backwards grid pick or typed pair is swap-normalized so the emitted range always satisfies from ≤ to — do not re-validate order in the app.",
      "DO wrap it in FormField like every other labelled control; FormField injects id/aria wiring.",
      "Grid picks are two-step (from, then to) and reset-on-complete: picking while a complete range is held STARTS a new range, so the start month is never stuck.",
    ],
    related: [
      "MonthPicker — single yyyy/MM value; MonthRangePicker when the field is a from~to pair (商談発生年月の範囲検索, 集計期間).",
      "DateRangePicker — full-date (yyyy-MM-dd) range with the same one-control shell; MonthRangePicker when the day is meaningless.",
    ],
    example: `import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { MonthRangePicker, FormField } from "@godxjp/ui/data-entry";

export function NegotiationYmField() {
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  return (
    <FormField label="商談発生年月">
      <MonthRangePicker name="search_negotiation_ym" value={range} onValueChange={setRange} />
    </FormField>
  );
}`,
    storyPath: "data-entry/MonthRangePicker.stories.tsx",
    rules: [3, 6, 13, 31, 43],
  },
  {
    name: "DatePicker",
    group: "data-entry",
    tagline:
      "WAI-ARIA date combobox with a real typeable ISO-8601 input — give it a `name` for form submission and fill the input in e2e tests; the calendar is the visual-only affordance.",
    props: [
      {
        name: "value",
        type: "Date | undefined",
        description:
          "Controlled selected date. When provided the input text and the calendar selection stay in sync with this value.",
      },
      {
        name: "onChange",
        type: "(date: Date | undefined) => void",
        description:
          "Called when the user commits a date — either by typing a valid ISO string into the input or clicking a day in the calendar popover. Called with `undefined` when the input is cleared.",
      },
      {
        name: "name",
        type: "string",
        description:
          "HTML `name` attribute placed on the underlying `<input>`. The input emits the value as an ISO-8601 `yyyy-MM-dd` string so the field is natively form-submittable without a hidden input.",
      },
      {
        name: "id",
        type: "string",
        description: "HTML `id` placed on the underlying `<input>`, used to associate a `<label>`.",
      },
      {
        name: "placeholder",
        type: "string",
        defaultValue: '"yyyy-mm-dd" (or locale-translated equivalent)',
        description:
          "Placeholder text shown in the input when no date is selected. Defaults to the i18n key `dataEntry.datePicker.placeholder` then falls back to the literal hint `yyyy-mm-dd`.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables both the text input and the calendar icon button.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Extra CSS classes applied to the outermost wrapper `<div>`. Use for width/margin overrides.",
      },
      {
        name: "locale",
        type: 'DayPickerProps["locale"]',
        description:
          "Locale object (from `date-fns/locale`) forwarded to the calendar popover. Controls month/day names shown in the grid. The input always accepts `yyyy-MM-dd` regardless of locale.",
      },
      {
        name: "fromDate",
        type: "Date",
        description:
          "Earliest selectable date in the calendar. Days before this date are disabled in the grid, and the calendar navigation starts at this month.",
      },
      {
        name: "toDate",
        type: "Date",
        description:
          "Latest selectable date in the calendar. Days after this date are disabled in the grid, and the calendar navigation ends at this month.",
      },
      {
        name: "allowClear",
        type: "boolean",
        defaultValue: "true",
        description:
          "Inline ✕ on the trigger that resets the value when one is set (Ant-style). Pass `false` to hide it (e.g. a required field).",
      },
      {
        name: "defaultValue",
        type: "Date",
        description: "Uncontrolled initial date.",
      },
      {
        name: "onValueChange",
        type: "(value: Date | undefined) => void",
        description: "Fires with the selected date (undefined when cleared).",
      },
    ],
    usage: [
      "DO use `name` to make the field form-submittable — the underlying `<input>` emits the value as an ISO-8601 `yyyy-MM-dd` string. No hidden input is needed.",
      "DO test by filling the input directly: `await user.type(screen.getByRole('combobox'), '2024-04-15')` or with Playwright `page.fill('[role=combobox]', '2024-04-15')`. The calendar popover is secondary and not required for testing.",
      "DO use `fromDate` / `toDate` to restrict selectable dates (e.g. ETD must be after today, period end must be after period start).",
      "DON'T wrap DatePicker in an extra `<div>` for a form field — use `name` directly and pair it with a `<label htmlFor={id}>` for a11y.",
      "DON'T hand-roll a date text input + calendar popover — this component IS that pattern at WAI-ARIA combobox spec level.",
      "DON'T use DatePicker for a date range — use `DateRangePicker` instead (it exposes two ISO inputs named `${name}_from` and `${name}_to`).",
    ],
    useCases: [
      "Invoice due-date field in an accounting form — attach `name='due_date'` and submit natively.",
      "ETD / ETA date entry on a shipment create/edit form where the field must be form-submittable and e2e-fillable.",
      "Filter bar date input (e.g. 'From date' in a report filter) where the user typically types the date rather than clicking through a calendar.",
      "Restricting a 'closing date' to only future dates by passing `fromDate={new Date()}` to block past selection.",
      "Locale-aware date picker in a multi-language admin panel — pass a `date-fns` locale object to show the calendar grid in the user's language while keeping the ISO input format consistent.",
    ],
    related: [
      "DateRangePicker — use instead of DatePicker when you need a from/to date pair; exposes two ISO inputs named `${name}_from` / `${name}_to`.",
      "TimePicker — companion for HH:mm time selection; same form-submittable-input pattern with a `name` prop.",
      "Calendar — the bare calendar grid used inside DatePicker; use it only when you need a always-visible month grid with no input.",
    ],
    example: `import { useState } from "react";
import { DatePicker } from "@godxjp/ui/data-entry";

// Controlled — single date field with form name
export function InvoiceDueDateField() {
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="due-date" className="text-sm font-medium">
        Due Date
      </label>
      <DatePicker
        id="due-date"
        name="due_date"
        value={dueDate}
        onValueChange={setDueDate}
        fromDate={new Date()}
        placeholder="yyyy-mm-dd"
      />
    </div>
  );
}`,
    storyPath: "data-entry/DatePicker.stories.tsx",
    rules: [3, 6, 13, 31],
  },

  // ─── feedback ───────────────────────────────────────────────────────────
  {
    name: "Dialog",
    group: "feedback",
    tagline:
      "Compound modal. Controlled via open + onOpenChange. Parts available flat (DialogTrigger/DialogContent/…) or as Dialog.Trigger/Dialog.Content. Rendered with role=dialog.",
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open-state change handler.",
      },
    ],
    usage: [
      "Use `Dialog` for form-style or wizard-style modal flows that need freeform content and a close action.",
      "DO always control open state via `open` + `onOpenChange`. Dialog has no uncontrolled shortcut — omitting `open` means the trigger alone drives state, which is fine for simple trigger-only cases, but any async submission flow must use controlled state so you can hold the dialog open while `pending=true` and close it only on success.",
      "DO include `DialogHeader` with `DialogTitle` (and optionally `DialogDescription`) inside every `DialogContent`. Radix requires an accessible title for screen readers; omitting it triggers a console warning and breaks a11y.",
      "DO wrap tall/scrolling content in `DialogBody` (the ring-safe scroll slot, max-height ~60vh). It insets the content to match the dialog padding so a full-width control's focus ring never clips against the scroll container — mirror of SheetBody.",
    ],
    useCases: [
      "Inline form dialog — create or edit a record (invoice line, supplier, coupon) without navigating away. Place `FormField`/`Input`/`Select` inside `DialogContent`, wire the submit button to your mutation, and hold `open` while `pending` to prevent double-submit.",
      "Read-only detail popup — show a full transaction audit trail, attachment preview, or approval history in a modal without leaving the list page. Use `Dialog` with no `DialogFooter` action buttons, just a close trigger.",
      "Wizard / multi-step flow — step through entity setup (legal entity → fiscal year → opening balances) using a single Dialog whose `DialogContent` conditionally renders different step panels. Control which step is shown in local state.",
    ],
    related: [
      "Sheet — use Sheet instead of Dialog when the content is a slide-in panel (filters, detail sidebar, settings drawer). Sheet uses `side` prop and is better suited for wide filter forms or contextual detail panels that don't demand full focus interruption.",
      "Alert — use Alert for inline, non-modal status messages (validation errors, success banners on the page). Dialog is modal and focus-trapping; Alert is inline and never blocks interaction.",
      "Popover — use Popover for lightweight non-modal overlays anchored to a trigger (quick-edit a single field, tooltip-style confirmation for low-stakes actions). Dialog is full-modal; Popover stays near its trigger and doesn't dim the page.",
      "AlertMutationFeedback — use AlertMutationFeedback for toast/inline feedback after the Dialog closes, not inside it. Putting a success toast inside a Dialog that is about to unmount causes it to disappear immediately; emit the feedback after `onOpenChange(false)` resolves.",
    ],
    example: `import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";

function CreateDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">新規作成</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>新規クーポン作成</DialogTitle>
          <DialogDescription>クーポン情報を入力してください。</DialogDescription>
        </DialogHeader>
        {/* fields */}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
          <Button onClick={() => setOpen(false)}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}`,
    storyPath: "feedback/Dialog.stories.tsx",
    rules: [23, 3],
  },
  {
    name: "AlertDialog",
    group: "feedback",
    tagline:
      'Canonical modal confirmation flow (destructive / high-stakes decisions). Preserves confirm semantics with `role="alertdialog"` and built-in cancel/confirm handling.',
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open-state change handler.",
      },
      {
        name: "title",
        type: "string",
        required: true,
        description: "Accessible title/announcement for the alertdialog.",
      },
      { name: "description", type: "string", description: "Optional supporting explanatory text." },
      {
        name: "confirmLabel",
        type: "string",
        description: "Primary action label (defaults to translated continue).",
      },
      {
        name: "cancelLabel",
        type: "string",
        description: "Dismiss action label (defaults to translated cancel).",
      },
      {
        name: "variant",
        type: '"default" | "destructive"',
        defaultValue: '"default"',
        description: "Variant passed through to the confirm button.",
      },
      {
        name: "confirmPhrase",
        type: "string",
        description: "Optional type-to-confirm phrase to prevent accidental confirm.",
      },
      {
        name: "challenge",
        type: "string",
        description:
          "Semantic alias of `confirmPhrase` — the exact token to type (e.g. an org slug) before confirm arms.",
      },
      {
        name: "onConfirm",
        type: "() => Promise<void> | void",
        description: "Primary action handler.",
      },
      {
        name: "stepUp",
        type: "() => Promise<boolean> | boolean",
        description:
          "Optional step-up re-auth (passkey/2FA) gate; must resolve truthy before `onConfirm` fires. Returning false keeps the dialog open and announces failure.",
      },
      {
        name: "keepOpenOnConfirm",
        type: "boolean",
        description: "Keep modal open after confirm when true.",
      },
      {
        name: "pending",
        type: "boolean",
        description: "Disable actions while async work is running.",
      },
    ],
    usage: [
      "Use `AlertDialog` for destructive/irreversible actions (delete, void, unpublish, archive, etc.).",
      "Use `confirmPhrase`/`challenge` for high-friction operations (e.g. typing an org slug) to reduce accidental confirmation — both force the destructive tone.",
      "Pass `stepUp` for a passkey/2FA re-auth gate that must resolve truthy before `onConfirm` runs (refunds, org deletion).",
      "Pass `keepOpenOnConfirm` when the confirm handler advances a multi-step flow and should not close immediately.",
    ],
    useCases: [
      "Dangerous delete or irreversible workflow confirmation that should block the background UI.",
      "Organization/resource deletion gated behind typing the exact slug (`challenge`).",
      "Refunds or privileged actions requiring step-up re-authentication before they run.",
      "Destructive batch operations that should remain modal and explicit until action is intentionally confirmed.",
    ],
    related: [
      "Dialog — use for form-style and non-destructive modal flows, no confirm preset behavior.",
      "AlertDialogRoot — the compound counterpart. Reach for it only when the confirmation body needs content this flat preset does not cover (a summary table, a diff, a nested list); the preset already covers title/description/challenge/step-up.",
    ],
    example: `import { AlertDialog } from "@godxjp/ui/feedback";

<AlertDialog
  open={open}
  onOpenChange={setOpen}
  title="Delete project"
  description="This action cannot be undone."
  confirmLabel="Delete"
  cancelLabel="Cancel"
  onConfirm={async () => {
    await deleteProject();
    setOpen(false);
  }}
  variant="destructive"
/>`,
    storyPath: "feedback/AlertDialog.stories.tsx",
    rules: [23, 3],
  },
  {
    name: "AlertDialogRoot",
    group: "feedback",
    tagline:
      'Compound alertdialog Root — the role="alertdialog" mirror of Dialog\'s root. Wraps Radix AlertDialog.Root and supplies the context AlertDialogTitle/AlertDialogDescription/AlertDialogAction/AlertDialogCancel read. Parts: AlertDialogTrigger/AlertDialogPortal/AlertDialogOverlay/AlertDialogContent/AlertDialogHeader/AlertDialogFooter/AlertDialogTitle/AlertDialogDescription/AlertDialogAction/AlertDialogCancel.',
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "Uncontrolled initial open state (use with AlertDialogTrigger).",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open-state change handler.",
      },
      {
        name: "children",
        type: "React.ReactNode",
        description: "The trigger and the portalled alertdialog parts.",
      },
    ],
    usage: [
      "Reach for the flat `AlertDialog` preset FIRST — it already covers title/description/confirm/cancel, the typed `challenge`, `stepUp` re-auth and `pending`. Use `AlertDialogRoot` only when the confirm body needs content the preset does not model (an impact summary, a diff, a nested list).",
      "DO name it `AlertDialogRoot`, not `AlertDialog` — the `AlertDialog` export is the flat preset and takes a completely different (non-compound) prop API.",
      "DO include `AlertDialogHeader` with `AlertDialogTitle` inside every `AlertDialogContent` — Radix requires an accessible title for `role=alertdialog`; omitting it warns in the console and breaks screen-reader announcement. `AlertDialogHeader` also takes the prop-driven `title`/`subtitle`/`extra`/`tone` form, where `subtitle` renders the `AlertDialogDescription`.",
      "DO portal explicitly: `AlertDialogContent` does NOT self-portal (unlike `DialogContent`). Wrap it in `AlertDialogPortal` with a sibling `AlertDialogOverlay`, or the scrim and stacking context are wrong.",
      "DO use `AlertDialogAction` / `AlertDialogCancel` for the footer buttons — they carry the button styling AND the Radix close semantics. Do not wrap them in `asChild` `<Button variant=…>`: the Root's button classes and the child's would both land on the element and the variant would not win.",
      "DO NOT import `@radix-ui/react-alert-dialog` directly in a consumer app. Everything the compound needs is exported from `@godxjp/ui/feedback`.",
    ],
    useCases: [
      "Confirm-with-impact-summary — a destructive confirmation that must show what will be affected (a list of 3 downstream jobs, a table of invoices) before the user commits. The flat preset only takes a string `description`.",
      "Batch-close confirmation whose body renders a rich breakdown (counts, totals, per-tenant rows) alongside the standard confirm/cancel pair.",
      "Any confirmation that must keep `role=alertdialog` semantics (focus trap, no dismiss-on-outside-click) but needs freeform children — use Dialog only when the flow is non-destructive.",
    ],
    related: [
      "AlertDialog — the flat preset. Prefer it; it is the canonical destructive-confirm recipe and needs no compound markup.",
      "Dialog — compound modal for form-style, non-destructive flows. `role=dialog`, dismissible on outside click.",
      "AlertDialogHeader — the header band; `tone` tints only the background (default | success | warning | destructive | info | muted | neutral).",
    ],
    example: `import {
  AlertDialogRoot, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay,
  AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";

function ConfirmSettlement() {
  return (
    <AlertDialogRoot>
      <AlertDialogTrigger asChild><Button variant="outline" size="sm">支払を確定</Button></AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>2026年7月分の支払を確定しますか？</AlertDialogTitle>
            <AlertDialogDescription>確定すると振込データが生成されます。</AlertDialogDescription>
          </AlertDialogHeader>
          {/* freeform impact summary goes here */}
          <AlertDialogFooter>
            <AlertDialogCancel>戻る</AlertDialogCancel>
            <AlertDialogAction>確定する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  );
}`,
    storyPath: "feedback/AlertDialog.stories.tsx",
    rules: [23, 3],
  },
  {
    name: "Sheet",
    group: "feedback",
    tagline:
      "Side-panel drawer / responsive detail panel (Radix Dialog). Parts: Sheet/SheetTrigger/SheetContent(side=right|left|top|bottom, responsive=auto|side|bottom)/SheetHeader/SheetBody/SheetTitle/SheetFooter.",
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open-state change handler.",
      },
      {
        name: "width",
        type: "number | string",
        description:
          "On SheetContent (side left/right): desired panel width (number→px). Caps at the viewport — full-width on a small screen (min(width,100%)), NOT a hard fixed width. Default w-3/4 sm:max-w-md.",
      },
      {
        name: "responsive",
        type: '"auto" | "side" | "bottom"',
        defaultValue: '"side"',
        description:
          'On SheetContent: the responsive drawer / detail-panel contract. "side" (default) always renders the physical `side` you named. "auto" renders the desktop side panel above --sheet-responsive-breakpoint-width (48rem/768px) and the mobile BOTTOM sheet at/below it, capped by --sheet-bottom-max-height (85dvh). "bottom" pins the bottom-sheet presentation. The resolved presentation is exposed as data-side on the panel. Never hand-roll useMediaQuery in app code — import useSheetResponsiveMode() if a composite must make the same decision.',
      },
      {
        name: "title / subtitle / extra / tone",
        type: "ReactNode / ReactNode / ReactNode / ToneProp",
        description:
          "On SheetHeader (Ant-style): title (→ SheetTitle, accessible name), subtitle (→ SheetDescription), right-aligned extra actions, and a soft semantic `tone` background band. Children still supported.",
      },
    ],
    usage: [
      "DO build the panel with SheetHeader (pass `title`/`subtitle`/`extra`/`tone` OR children) > SheetBody (scrollable, ring-safe) > SheetFooter (pinned). SheetTitle is required for a11y — the `title` prop renders it for you. Never skip the title.",
      "DO set `width` on SheetContent for a wider/narrower panel (e.g. width={480}); it caps at the viewport so small screens still get a full-width panel.",
      'DO use responsive="auto" for a record detail panel / drawer that must be a desktop side panel and a mobile bottom sheet — ONE <Sheet>, no page-local media query. The breakpoint is the --sheet-responsive-breakpoint-width token, so a service moves the line once for every overlay. `width` is ignored while the bottom presentation is active (a bottom sheet is full-bleed).',
      'DON\'T hardcode an overlay breakpoint in app code (useMediaQuery("(max-width: 390px)")). If a composite must swap a desktop surface for a mobile sheet (a Popover→Sheet switcher, for example), call the exported useSheetResponsiveMode("auto") hook so it reads the same themeable token.',
      "DO use all named sub-parts in order: Sheet (root) > SheetTrigger (opener) > SheetContent (panel) > SheetHeader > SheetTitle (required for a11y — maps to Radix DialogPrimitive.Title, announced as the accessible name) > optional SheetDescription > body content > SheetFooter. Never skip SheetTitle inside an open SheetContent.",
      "DO control state explicitly with open + onOpenChange on Sheet root when you need to close programmatically (e.g. after form submit). Uncontrolled (no props) works for simple trigger-only cases but gives you no hook to reset form state on close.",
      "DO use SheetTrigger asChild to wrap a Button or other interactive element — this avoids a nested <button> in the DOM. Never render a raw <button> as a direct child of SheetTrigger.",
      "DO wrap a long/scrolling body in SheetBody (between SheetHeader and a pinned SheetFooter). It is the ring-safe scroll slot: a hand-rolled <div className='overflow-y-auto'> clips the 3px focus ring of a full-width Input/Select at the scroll edges — SheetBody insets the content so the ring never clips.",
      "DO use SheetFooter (renders at the bottom via mt-auto, symmetric 16/24 padding, full-bleed top border) for primary/cancel action Buttons. Never float action Buttons inside the body — they will not stick to the panel bottom.",
      "DON'T set showCloseButton={false} on SheetContent unless you provide your own SheetClose element; omitting both leaves users with no keyboard-accessible close path and breaks a11y.",
      "DON'T put a Sheet inside a Dialog (nested Radix portals conflict). If you need a slide-over triggered from within a modal, close the Dialog first, then open the Sheet.",
    ],
    useCases: [
      "Filter/search panel: slide in from the right with filter FormFields (Select, DateRangePicker, CheckboxGroup) that affect a DataTable — preferred over a Dialog because filters do not require confirmation and benefit from seeing the table behind the overlay.",
      "Quick-edit drawer: open an entity's editable fields (e.g. invoice line items, account settings) without navigating away, with Save/Cancel in SheetFooter — use side='right' and keep the main page visible as context.",
      "Detail peek panel: show read-only Descriptions / Timeline of a selected record (e.g. a journal entry or invoice) from a DataTable row click, using side='right' with showCloseButton={true}. Add responsive='auto' so the same panel becomes a bottom sheet on a phone instead of a 100%-wide slab.",
      "Mobile-first navigation drawer: side='left' sheet acting as a slide-in nav menu on small viewports when the AppShell Sidebar is hidden — triggered by a hamburger Button.",
      "Step-by-step wizard side panel: multi-step form (Steps component inside SheetContent) for onboarding or import flows where full-page navigation would lose list context.",
    ],
    related: [
      "Dialog — use Dialog (centered modal) when the action is destructive, requires full user focus, or needs a confirm/alertdialog (mode='confirm'). Use Sheet when the user benefits from seeing the page content behind the slide-over (filters, detail peek, quick-edit).",
      "Toolbar/ToolbarGroup — use Toolbar for inline persistent filter controls above a DataTable (no overlay). Use Sheet when the filter set is large (>4 controls) or on mobile where inline controls collapse poorly.",
      "Popover — use Popover for lightweight, anchor-positioned context menus or single-control overlays (date picker, color picker). Use Sheet when the panel has a header, multiple fields, or footer actions that need a dedicated panel.",
      "SplitPane — use SplitPane for a persistent side-by-side layout where both panes are always visible. Use Sheet when the secondary panel is transient and should overlay the primary content.",
    ],
    example: `import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";

<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger asChild><Button variant="outline" size="sm">絞り込み</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader><SheetTitle>フィルター設定</SheetTitle></SheetHeader>
    {/* filter fields */}
  </SheetContent>
</Sheet>`,
    storyPath: "feedback/Sheet.stories.tsx",
    rules: [3],
  },
  {
    name: "Alert",
    group: "feedback",
    tagline:
      "Inline alert banner with variant-aware icon + optional dismiss. Parts: Alert/AlertTitle/AlertDescription/AlertActions/AlertQueryError.",
    props: [
      {
        name: "variant",
        type: '"default" | "banner"',
        defaultValue: '"default"',
        description:
          'STRUCTURAL axis, orthogonal to `tone` (which owns colour + icon): "default" is the inline rounded card; "banner" is the full-bleed attention strip — prefer the `Banner` export, which fixes this axis.',
      },
      {
        name: "onDismiss",
        type: "() => void",
        description: "Renders an × dismiss button when provided.",
      },
      {
        name: "icon",
        type: "LucideIcon | false",
        description: "Override or hide (false) the icon.",
      },
      {
        name: "tone",
        type: '"success" | "warning" | "destructive" | "info" | "neutral"',
        description: "Semantic tone driving the colour + leading icon.",
      },
    ],
    usage: [
      "ANATOMY (positions are fixed — never re-lay-them-out): Alert is ONE horizontal row — a SINGLE leading tone icon at the inline-start (top-aligned to the first text line, auto-selected by `tone`, never two icons), then the text body (Title/Description), then `<Alert.Actions>` in a trailing-RIGHT column (≥sm), and the dismiss × pinned to the TOP-RIGHT corner (rendered by `onDismiss`). DON'T stack these vertically, DON'T make the action a full-width bar under the text, DON'T center the × at the bottom, DON'T add a second icon — that hand-rolled vertical banner is the #1 Alert mistake.",
      'DO compose text as `<Alert.Title>` + `<Alert.Description>` — they stack vertically inside the body (the Example below is canonical). When you add `<Alert.Actions>`, the body becomes a two-column grid (text | actions) at ≥sm; group multi-part text in `<Alert.Content>` so it occupies the text column as one block: `<Alert tone="destructive"><Alert.Content><Alert.Title>Error</Alert.Title><Alert.Description>{msg}</Alert.Description></Alert.Content><Alert.Actions><Button …/></Alert.Actions></Alert>`.',
      "DO use `Alert.QueryError` (alias `AlertQueryError`) for TanStack Query / API failure surfaces — it already renders humanError(error), an i18n title, and an optional Retry button. Never hand-roll that pattern.",
      'DON\'T pass raw action elements directly as top-level children of `<Alert>` without wrapping them in `<Alert.Actions>` — the layout slot only activates correctly via the `data-slot="alert-actions"` wrapper.',
      'DON\'T hand-roll a dismiss ✕ button — pass `onDismiss` to `<Alert>` and the component renders its own accessible dismiss button with `aria-label="Dismiss"`. The `onDismiss` handler may return a Promise.',
      'DON\'T suppress the icon with `icon={false}` unless there is a deliberate design reason; the icon is the primary a11y cue for sighted users since the root already carries `role="alert"` for screen readers.',
      "DO NOT use `Alert` for transient ephemeral feedback (e.g. 'saved successfully'). Use `toast()` from sonner + `<Toaster>` for that. `Alert` is for persistent, page-scoped banners that stay visible until the user acts or dismisses.",
    ],
    useCases: [
      'Page-level error banner after a form submission fails server-side validation — `tone="destructive"` with `Alert.Title` summarising the error and `Alert.Description` listing field issues, paired with `onDismiss` so the user can clear it.',
      "Inline warning at the top of an accounting invoice list when the OAuth token for the MF sync is about to expire — `tone=\"warning\"` with an `Alert.Actions` containing a 'Reconnect' Button.",
      'Success confirmation banner rendered after a bulk-import job completes and the user returns to the list page — `tone="success"` with `Alert.Description` showing the record count imported.',
      "TanStack Query data-fetch failure inside a Card body — use `<Alert.QueryError error={error} onRetry={refetch} />` instead of writing a custom error state.",
      "Informational notice at the top of a settings page when a feature is in beta or requires a plan upgrade — `tone=\"info\"` with a short description and an `Alert.Actions` 'Learn more' link.",
      'Dismissible billing-overdue notice at the top of the dashboard — `tone="destructive"` with `onDismiss` that sets a session flag so it does not reappear until the next login.',
    ],
    related: [
      "Toaster — use for transient, auto-dismissing feedback ('Record saved', 'Deleted'). Alert is for persistent page-scoped banners; Toaster is for fire-and-forget notifications triggered by toast() from sonner.",
      "AlertMutationFeedback — use when you want inline success/error feedback tightly coupled to a form mutation's state (renders inline below the submit button). Alert requires you to manage show/hide state yourself.",
      "DataState — use for full query lifecycle (loading skeleton + empty state + error) inside a data-fetching section. Alert.QueryError is the error sub-component DataState uses internally; prefer DataState when you also need the loading/empty states.",
      "EmptyState — use for the zero-data case inside a list or table section, not for errors or warnings. Alert is for status messages; EmptyState is for the absence of data.",
    ],
    example: `import { Alert, AlertTitle, AlertDescription } from "@godxjp/ui/feedback";

<Alert tone="warning">
  <AlertTitle>3 件の打刻漏れがあります</AlertTitle>
  <AlertDescription>本日中に確認してください。</AlertDescription>
</Alert>`,
    storyPath: "feedback/Alert.stories.tsx",
    rules: [],
  },
  {
    name: "Banner",
    group: "feedback",
    tagline:
      "Full-bleed page/shell attention strip (past-due subscription, support session, maintenance). The Alert primitive with variant fixed to banner. Parts: Banner.Title/Description/Content/Actions.",
    props: [
      {
        name: "tone",
        type: '"default" | "success" | "warning" | "destructive" | "info" | "muted" | "neutral"',
        defaultValue: '"default"',
        description:
          'Semantic tone driving the surface colour, the default leading icon AND live-region politeness ("destructive"/"warning" announce assertively via role="alert"; every other tone politely via role="status").',
      },
      {
        name: "onDismiss",
        type: "() => void | Promise<void>",
        description:
          "Renders the built-in localized dismiss button (top/inline-end). It sits LAST in DOM and focus order: content → actions → dismiss.",
      },
      {
        name: "icon",
        type: "LucideIcon | false",
        description: "Override or hide (false) the tone's default leading icon.",
      },
    ],
    usage: [
      'CANONICAL BANNER CONTRACT (gh#255): `Banner` is `Alert` with the structural axis fixed to `variant="banner"` — same tone system, same slots, same dismiss/a11y behaviour, but STRIP geometry owned by the `--banner-*` tokens (square corners, hairline block-end rule, page-gutter inline inset). Never fake a banner by putting `className` overrides on an `Alert`, and never hand-roll a coloured div strip.',
      "DO: Place a Banner FULL-BLEED at the top of the surface it warns about — directly under the Topbar inside AppShell's children for shell-wide attention (past-due subscription, active support session), or as the first child of a page for page-scoped notices. Its inline inset defaults to the page gutter (--space-page-active-x) so the text column aligns with page content.",
      "DO: Compose text as `Banner.Title` + `Banner.Description` (group multi-part copy in `Banner.Content` when you add `Banner.Actions`). At >=640px actions sit in a trailing column; below the step they drop onto their own full-width WRAPPING line, so a 390px viewport wraps instead of clipping.",
      "DO: Pass `onDismiss` for dismissible notices — the component renders its own accessible, localized dismiss button. DON'T hand-roll an × Button in `Banner.Actions`.",
      "DON'T: Use Banner for transient feedback ('saved successfully') — that is `toast()` + `<Toaster>`. Banner is persistent and page/shell-scoped, and there should be at most ONE per surface; stack further messages inside the page as inline `Alert`s.",
      "DON'T: Encode DXS business rules here (when past_due shows, who sees a support-session strip) — the app decides WHEN to render; Banner owns only presentation and behaviour.",
    ],
    useCases: [
      'Past-due subscription strip across the console shell — `tone="warning"` with a `Banner.Actions` "お支払い方法を更新" Button, rendered above the page slot until billing recovers.',
      'Active support-session indicator — `tone="info"` with the operator name in `Banner.Description` and a "セッションを終了" action; not dismissible while the session runs.',
      'Scheduled maintenance notice — `tone="neutral"` with `onDismiss` so the user can clear it for the session.',
      'Read-only / archived-organization mode — `tone="muted"` explaining why every mutation control on the page is disabled.',
      'Degraded-service warning after a partial outage — `tone="destructive"` with a status-page link in `Banner.Actions`.',
    ],
    related: [
      "Alert — the SAME primitive in its inline-card presentation; use inside a page section or Card for persistent local feedback. Banner is the full-bleed strip presentation for shell/page-level attention.",
      "Toaster — transient auto-dismissing feedback (toast()). Banner is persistent until acted on or dismissed.",
      "ErrorSurface — a whole-page semantic exception state (403/404/5xx) that REPLACES the page. Banner annotates a page that still works.",
      "PageContainer — Banner sits ABOVE or as the first child of PageContainer, never inside the header slots; the page header's own status/meta belongs in PageContainer's `status` prop.",
    ],
    example: `import { Banner } from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";

<Banner tone="warning">
  <Banner.Content>
    <Banner.Title>お支払いが確認できていません</Banner.Title>
    <Banner.Description>サービスの停止を避けるため、お支払い方法を更新してください。</Banner.Description>
  </Banner.Content>
  <Banner.Actions>
    <Button size="sm" variant="outline">お支払い方法を更新</Button>
  </Banner.Actions>
</Banner>`,
    storyPath: "feedback/Banner.stories.tsx",
    rules: [],
  },
  {
    name: "SkeletonTable",
    group: "feedback",
    tagline:
      "Loading placeholder matching the DataTable layout (header + N rows). Drop-in while data loads (deferred props).",
    props: [
      { name: "rows", type: "number", defaultValue: "8", description: "Body skeleton rows." },
      {
        name: "columns",
        type: "number",
        defaultValue: "5",
        description: "Columns in header + body.",
      },
    ],
    usage: [
      "DO use SkeletonTable as the pre-mount placeholder — either as a ternary fallback (`{!data ? <SkeletonTable rows={10} columns={6} /> : <DataTable … />}`) for Inertia deferred props, or as the `skeleton` prop of `DataState` (`<DataState query={q} skeleton={<SkeletonTable />} …>`). It is NOT for in-table loading; once DataTable has mounted use its own `loading` prop instead.",
      "DO match rows/columns to the final DataTable layout: pass `rows` equal to your expected page size and `columns` equal to your column count so the skeleton doesn't visually jump on hydration. Defaults are rows=8, columns=5.",
      "DO NOT use SkeletonTable when data is already present but refetching — use `DataTable loading={isFetching}` for in-table refetch states. SkeletonTable is only for the initial pre-mount gap before DataTable is rendered.",
      "DO NOT wrap SkeletonTable in a Card — it renders its own header + body structure matching DataTable's DOM. Placing it inside CardContent adds unwanted padding around the skeleton rail.",
      'The root element carries `aria-busy="true"` automatically — do not add a second aria-busy on a wrapper. Screen readers announce the loading state correctly without extra markup.',
      "Import from `@godxjp/ui/feedback` (not `@godxjp/ui/admin`). Both paths resolve but the canonical export is `feedback`.",
    ],
    useCases: [
      "Inertia deferred props: the server streams the page shell immediately and defers the table data; render SkeletonTable until the prop arrives (`{!invoices ? <SkeletonTable rows={20} columns={7} /> : <DataTable data={invoices} columns={columns} />}`).",
      "TanStack Query initial load via DataState: pass SkeletonTable as the `skeleton` prop so DataState shows the correct table shape during the query's loading state before switching to the populated DataTable.",
      "Filter / search reset that unmounts and remounts DataTable: briefly show SkeletonTable while the new dataset fetches, preventing a flash of the empty state before results arrive.",
      "Admin list pages (invoices, journal entries, partners) where the table has a known column count — tune `columns` to match so column widths feel stable and don't reflow on hydration.",
      "Page-level Suspense boundaries: use SkeletonTable as the `fallback` of a React Suspense wrapping a lazy-loaded data table component.",
      "Route prefetch / navigation transitions: render SkeletonTable in the destination slot while Inertia visits are in-flight, keeping perceived layout stable.",
    ],
    related: [
      "DataTable — sibling component that SkeletonTable precedes. Once DataTable mounts, use its `loading` prop (renders an in-table loading row) for subsequent refetches rather than swapping back to SkeletonTable. Pick SkeletonTable only for the pre-mount gap.",
      "DataState — query lifecycle widget from `@godxjp/ui/query`; accepts SkeletonTable as its `skeleton` prop and handles loading/empty/error transitions automatically. Prefer DataState + SkeletonTable over a hand-rolled ternary when the data comes from a useQuery hook.",
      "SkeletonStat — sibling skeleton shaped like a StatCard tile; use inside a ResponsiveGrid to placeholder KPI dashboard cards, not tabular data.",
      "DataTable — when data is already mounted but re-fetching (e.g. pagination, filter change), set `loading={true}` on DataTable directly instead of unmounting it and swapping in SkeletonTable; avoids layout shift and preserves scroll position.",
    ],
    example: `import { SkeletonTable } from "@godxjp/ui/feedback";

{!coupons ? <SkeletonTable rows={10} columns={6} /> : <DataTable data={coupons} columns={columns} />}`,
    storyPath: "feedback/Skeleton.stories.tsx",
    rules: [],
  },
  {
    name: "Toaster",
    group: "feedback",
    tagline:
      'Mount once at app root to enable toasts. IMPORTANT: trigger toasts via `import { toast } from "sonner"` — NOT from @godxjp/ui.',
    props: [
      {
        name: "position",
        type: '"top-right" | "top-center" | "bottom-right" | "…"',
        defaultValue: '"bottom-right"',
        description: "Toast stack anchor.",
      },
      { name: "richColors", type: "boolean", description: "Enable Sonner rich variant colours." },
    ],
    usage: [
      "DO: Mount exactly ONE `<Toaster richColors />` at the app root (e.g. inside your layout or AppShell children). Multiple mounts create duplicate toast stacks — there is no provider context, only DOM portals.",
      'DO: Import `toast` from `"sonner"` directly (not from `@godxjp/ui`) to fire toasts anywhere: `toast.success(…)`, `toast.error(…)`, `toast.warning(…)`, `toast.info(…)`, `toast.loading(…)`, `toast.promise(…)`.',
      "DON'T: Try to import a `toast` helper from `@godxjp/ui/feedback` — it does not exist. The component re-exports only the `Toaster` mount; the imperative API lives in the `sonner` package.",
      "DO: Let the wrapper handle theming — it uses `useDocumentTheme()` to sync with the document `dark` class and `prefers-color-scheme` automatically. Never pass a hardcoded `theme` prop unless you are deliberately overriding.",
      "DON'T: Use `Toaster` for persistent errors or blocking confirmations. Toasts auto-dismiss; they are not a substitute for `Alert` (inline persistent warnings) or `Dialog` (decisions requiring user input).",
      "DO: Pass `position` to relocate the stack if a persistent sidebar/footer would obscure the default `bottom-right`. The wrapper already sets a safe `mobileOffset`; don't add redundant mobile offsets unless your layout differs.",
    ],
    useCases: [
      'After a successful form save (invoice, journal entry, vendor record) — show `toast.success("保存しました")` to confirm without blocking navigation.',
      'After a background job is enqueued (e.g. bulk sync or export) — show `toast.info("エクスポートを開始しました")` then later update with `toast.promise()` to track completion.',
      "Mutation error fallback when the error is transient and retrying is the right UX — show `toast.error(message)` instead of replacing page content; reserve `AlertMutationFeedback` for inline, persistent error display inside a form.",
      'Soft destructive action confirmation outcome — e.g. "削除しました" after an item is removed, paired with an undo action via `toast("…", { action: { label: \'元に戻す\', onClick: undo } })`.',
      'OAuth / session expiry warnings — surface a brief `toast.warning("セッションの有効期限が近づいています")` without interrupting the user\'s current form state.',
    ],
    related: [
      "Alert — use for persistent, inline feedback that must stay visible (validation summaries, page-level warnings, destructive notices). Unlike Toaster, Alert does not auto-dismiss and lives in the document flow.",
      "AlertMutationFeedback — use when you have a TanStack `useMutation` result and want an inline error + retry UI inside a form or card. Renders nothing on success/idle; pairs naturally with a `toast.success` in `onSuccess`.",
      "Dialog — use when the user must make a conscious decision (confirm delete, resolve conflict) before proceeding. Toaster toasts are fire-and-forget; Dialog blocks until the user responds.",
    ],
    example: `// app root — mount once
import { Toaster } from "@godxjp/ui/feedback";
<>{children}<Toaster richColors /></>

// anywhere — import toast from "sonner"
import { toast } from "sonner";
toast.success("クーポンを公開しました");
toast.error("保存に失敗しました");`,
    storyPath: "feedback/Toaster.stories.tsx",
    rules: [],
  },

  // ─── navigation ─────────────────────────────────────────────────────────
  {
    name: "Tabs",
    group: "navigation",
    tagline:
      "Radix tab container with optional Ant-style `items` API. Pass items for the common full TabsList/TabsContent set, or compose TabsList/TabsTrigger/TabsContent manually when you need per-panel control.",
    props: [
      {
        name: "items",
        type: "{ value: string; label: React.ReactNode; content: React.ReactNode; disabled?: boolean }[]",
        description:
          "Optional data-driven tab list. When provided, Tabs renders all triggers and content panels. When Tabs owns the initial selection (no `value`, and no `defaultValue` naming an existing ENABLED item), it falls back to the first item that is NOT `disabled` — never a disabled one — and selects nothing if every item is disabled (gh#175).",
      },
      { name: "value", type: "string", description: "Controlled active tab key." },
      {
        name: "defaultValue",
        type: "string",
        description:
          "Uncontrolled initial tab key. Ignored (falls back to the first enabled item) when it names a disabled item or an unknown key.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Active-tab change handler.",
      },
      {
        name: "variant",
        type: '"default" | "line" | "card"',
        defaultValue: '"default"',
        description:
          'Trigger-strip appearance. `default`/`card` keep the pill/card chrome (a selected trigger gets a soft `ring-primary/25` ring). `line` is UNDERLINE-ONLY (gh#248): the selected trigger gets no ring or card border at all — only the token-owned 2px primary bar (--tabs-indicator-{background,size,offset}) — so the `:focus-visible` keyboard ring stays visible and clearly distinct from selection. With `items`, the variant is forwarded to the list; when composing manually, pass the same value to `<TabsList variant="line">`.',
      },
    ],
    usage: [
      "DO pass `items` when all tab content is known up front — each item needs a unique `value`, trigger `label`, and panel `content`.",
      'When not using `items`, compose the full four-part tree — `<Tabs>` root, `<TabsList>` trigger bar, one `<TabsTrigger value="…">` per tab, one `<TabsContent value="…">` per matching trigger.',
      "DO: use `defaultValue` (uncontrolled) for simple local state; use `value` + `onValueChange` together (controlled) when the active tab is driven by URL query params, router state, or parent state. NEVER set both simultaneously.",
      "DO use `variant` on Tabs when using `items`; when composing manually, set `variant` on `TabsList`.",
      'DO: pass `orientation="vertical"` to `<Tabs>` (not to `TabsList`) for a side-rail layout — the CSS group classes on root and triggers respond automatically, so no extra className gymnastics are needed.',
      "DON'T: hand-roll the active-indicator underline or selected-state ring — `TabsTrigger` already applies `data-[state=active]` styles, including the token-owned indicator bar for the `line` variant. Adding your own `border-b-2 border-primary` (or a page-local `ring-0` override to remove one) breaks the design; retune --tabs-indicator-{background,size,offset} in the service theme instead.",
      "DO trust the horizontal `TabsList` to scroll its own overflow (hidden scrollbar, swipeable) instead of clipping when tab labels — especially long localized ones (Japanese, German) — don't fit a narrow container. Don't wrap it in your own `overflow-x-auto` div or truncate labels to work around clipping; that was gh#175 and is now the framework's job (#175).",
      "DON'T assume the first item is ever auto-selected when it is `disabled` — Tabs always resolves the fallback to the first ENABLED item (or none, if all are disabled). A `disabled: true` first item is safe to author without also setting `defaultValue`.",
      'DON\'T write your own resize/scroll-into-view effect to keep the selected tab on screen — `TabsList` observes its own size and its triggers\' `data-state` and re-pins the active (or focused, under `activationMode="manual"`) trigger with `scrollIntoView({ block: "nearest", inline: "nearest" })`, honoring `prefers-reduced-motion` and leaving a deliberate manual scroll alone. Before gh#204 a 1440 → 1024 → 390 resize could strand the ACTIVE FIRST tab entirely outside the strip while it still reported `aria-selected="true"`.',
      "DON'T re-centre the strip with a `justify-center` utility. `TabsList` aligns with `safe center` on purpose: plain centring splits the overflow across BOTH edges while `scrollLeft` only ever covers the trailing one, so the leading tab ends up permanently outside the scrollport and no gesture reaches it. `safe` keeps the centred look while the tabs fit and falls back to start alignment the moment they don't.",
    ],
    useCases: [
      "Detail drawers or pages that need full per-panel control — e.g. an accounting journal-entry sheet where one panel has `forceMount` to keep a live chart mounted, requiring custom `TabsContent` props that `Tabs` cannot pass.",
      "Controlled tabs driven by URL search params (e.g. `?tab=history`) where the parent reads/writes the active key and passes it to `value` / `onValueChange`.",
      'Vertical side-rail navigation inside a `SplitPane` or settings layout where `orientation="vertical"` on the root and `variant="line"` on `TabsList` combine to produce a sidebar-style tab strip.',
      "Lightweight widget tabs on a dashboard card — e.g. switching a `DataTable` between 'Pending' and 'Paid' invoice views — where an uncontrolled `defaultValue` is sufficient and no URL state is needed.",
      "Admin entity profile pages (company, partner, employee) where each `TabsContent` wraps an Inertia deferred prop panel, lazy-loading expensive data only when the tab is first activated.",
    ],
    related: [
      "Steps (@godxjp/ui/navigation) — sequential wizard/progress indicator. Use Steps when order and completion state matter (multi-step forms, onboarding flows); use Tabs when panels are non-sequential and any tab can be visited freely.",
      "Toolbar / ToolbarGroup (@godxjp/ui/navigation) — horizontal filter chip row. Visually resembles `line`-variant tabs but is semantically different: Toolbar filters a dataset, it does not switch content panels. Never use Tabs as a filter control.",
      "DropdownMenu (@godxjp/ui/navigation) — use for space-constrained contexts where showing all tab triggers at once is impractical (e.g. mobile overflow menu). If only 2-3 options exist and screen space is tight, a DropdownSidebar is a lighter alternative to a full tab strip.",
    ],
    example: `import { Tabs } from "@godxjp/ui/navigation";

<Tabs
  defaultValue="overview"
  items={[
    { value: "overview", label: "概要", content: "概要コンテンツ" },
    { value: "history", label: "履歴", content: "履歴コンテンツ" },
  ]}
/>`,
    storyPath: "navigation/Tabs.stories.tsx",
    rules: [],
  },
  {
    name: "Pagination",
    group: "navigation",
    tagline: "Offset/page-based pagination bar. Sits below a table card.",
    props: [
      {
        name: "value",
        type: "number",
        defaultValue: "1",
        description: "Current page (1-indexed).",
      },
      { name: "total", type: "number", description: "Total number of items." },
      { name: "pageSize", type: "number", defaultValue: "10", description: "Items per page." },
      {
        name: "showTotal",
        type: "boolean | (total, range) => ReactNode",
        description: "Show total count, or a custom label fn.",
      },
      {
        name: "onValueChange",
        type: "(page: number, pageSize: number) => void",
        description: "Page / page-size change handler.",
      },
      {
        name: "pageSizeOptions",
        type: "number[]",
        description: "Selectable page sizes shown in the size changer.",
      },
      {
        name: "showSizeChanger",
        type: "boolean",
        description: "Show the page-size selector beside the pager.",
      },
      {
        name: "hideOnSinglePage",
        type: "boolean",
        defaultValue: "true",
        description:
          "Hide the control when there is nothing to page through — zero items OR exactly one page. Set false to opt in to the bar on a single page (e.g. to keep showTotal visible); total=0 is always hidden.",
      },
      {
        name: "simple",
        type: "boolean",
        description:
          "Compact form for narrow contexts — Prev / n·N / Next, no page-number buttons. The intentional mobile transformation (desktop never wraps).",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Disable all navigation controls.",
      },
      {
        name: "aria-label",
        type: "string",
        description:
          'Override the nav landmark\'s accessible name (defaults to a localized "Pagination"). Required when more than one Pagination renders on the same page/view — two nav landmarks sharing one name/role fail landmark-unique.',
      },
    ],
    usage: [
      "DO always control Pagination externally: store `value` (page) and `pageSize` in React state (or URL params), and update both in the `onValueChange(page, pageSize)` callback. Pagination is fully controlled — it has no internal state and will not move unless `value` changes.",
      "DO let Pagination hide itself for zero items and single pages (`hideOnSinglePage`, default true) — it is navigation between multiple result pages. Render it inside a table footer only in the DATA state: never during loading, empty, error, or an unmet prerequisite. Pass `hideOnSinglePage={false}` only when you still want the bar on one page to keep `showTotal` visible.",
      "DO trust Pagination to stay ONE horizontal row on desktop (it never wraps). For genuinely narrow viewports use `simple` for the intentional compact transformation rather than letting controls wrap.",
      "DO pass `total` as the raw item count (not page count). The component computes `Math.ceil(total / pageSize)` internally; passing a pre-computed page count as `total` will over-paginate.",
      "DO use `showSizeChanger` together with `pageSizeOptions` when the user needs density control (default options are [10, 20, 50, 100]). When `showSizeChanger` is omitted the page-size Select is not rendered at all — do NOT hand-roll your own Select beside Pagination.",
      "DO use `simple` mode for compact contexts (mobile, sidebars, sheet footers) — it renders Prev / `n / total` / Next with no page-number buttons. Use the full form for primary admin list pages.",
      "DO use `showTotal` to surface item counts: pass `true` for the built-in i18n label, or a function `(total, [from, to]) => ReactNode` for a custom range label like '1–10 of 342 invoices'. Never hard-code a total string beside the component.",
      "DON'T use Pagination for cursor- or infinite-scroll-based lists. Pagination is strictly offset/page-based (`value` is a page number). For cursor pagination inside a DataTable use `DataTable.Pagination`; for infinite scroll use `InfiniteQueryState`.",
      "NOTE the page strip scrolls horizontally rather than wrapping, and its page buttons are normally the keyboard route to that overflow. Disable the whole bar (`disabled`) and there is no such route, so the strip takes `tabindex=0` itself to stay keyboard-scrollable (WCAG 2.1.1). Nothing to configure — just don't strip the attribute in consumer CSS/JS.",
    ],
    useCases: [
      "Standalone offset-paginated admin list pages (e.g. invoice list, customer list, transaction history) rendered outside DataTable — place Pagination below the table card, outside the card border, with `showTotal` and optionally `showSizeChanger`.",
      "Search results pages where the backend accepts `page` + `per_page` query parameters and returns a total count — wire `value` and `pageSize` to URL search params so the URL is shareable and browser-back works.",
      "Reports and filtered data grids where the user needs to export 'all selected pages': `showTotal` with a custom function lets you show '1–50 of 1 200 rows' so the user understands the scope before exporting.",
      "Compact modal or sheet footers with a long list (e.g. selecting from a product catalog inside a dialog) — use `simple` mode to save horizontal space while keeping navigation accessible.",
      "DataTable instances where the server returns an offset-based total and `DataTable.Pagination` is not being used: attach a standalone Pagination below the card and pass the same `page` / `pageSize` state to both the DataTable `data` prop and the API fetch.",
    ],
    related: [
      "DataTable.Pagination — use instead of standalone Pagination when the list is rendered inside a DataTable compound and uses cursor-based navigation (cursor + hasMore + onChange). DataTable.Pagination handles First/Next without page arithmetic; standalone Pagination requires a known total.",
      "InfiniteQueryState — use for infinite-scroll / load-more lists driven by useInfiniteQuery. It auto-manages skeleton, empty, and error states; Pagination is inappropriate here because there is no discrete page number.",
      "DataTable — when offset pagination is needed inside DataTable, prefer composing DataTable with a standalone Pagination below the card rather than DataTable.Pagination if the API is offset-based and returns a total count. DataTable itself does not paginate; you supply `data` for the current page.",
      "SearchInput — often placed in the same toolbar as Pagination. Resetting `value` to page 1 inside the search `onSearchChange` handler is mandatory; forgetting this is the most common bug when combining search and Pagination.",
    ],
    example: `import { Pagination } from "@godxjp/ui/navigation";

<Pagination value={page} total={filtered.length} pageSize={10} showTotal onValueChange={(p) => setPage(p)} />`,
    storyPath: "navigation/Pagination.stories.tsx",
    rules: [40],
  },
  {
    name: "DropdownMenu",
    group: "navigation",
    tagline:
      "Radix dropdown menu. Compose DropdownMenu/DropdownMenuTrigger/DropdownMenuContent/DropdownMenuItem/DropdownMenuSeparator.",
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open-state change handler.",
      },
    ],
    usage: [
      "DO compose the full sub-part tree: DropdownMenu (root) → DropdownMenuTrigger (with asChild to delegate to your Button/icon) → DropdownMenuContent → DropdownMenuItem / DropdownMenuSeparator / DropdownMenuLabel / DropdownMenuGroup. Omitting any level (e.g. rendering DropdownMenuContent without DropdownMenu as ancestor) breaks Radix context and the menu will not open.",
      "DO use DropdownMenuTrigger with asChild and pass a godx-ui Button or icon Button as the child — never render a raw <button> or <div> as the trigger, and never omit asChild when the child is already a button-like element (double-button nesting breaks a11y).",
      "DO use variant='destructive' on DropdownMenuItem for irreversible actions (delete, revoke, void) — this applies the semantic destructive colour token automatically without any className override.",
      "DO use DropdownMenuSub + DropdownMenuSubTrigger + DropdownMenuSubContent for nested sub-menus (e.g. 'Export' → 'CSV', 'PDF'). The ChevronRight icon is rendered automatically by DropdownMenuSubTrigger — do not add your own.",
      "DO use DropdownMenuCheckboxItem (with checked + onCheckedChange) or DropdownMenuRadioGroup + DropdownMenuRadioItem for toggle/selection menus such as column visibility or active view. These items manage their own checked indicator — do not layer a Checkbox or RadioGroup inside a plain DropdownMenuItem.",
      "DON'T use DropdownMenu for form submission — items fire onSelect callbacks, not form field values. There is no name prop for native form submission. If a menu selection must feed a form field, lift state into a controlled value and wire a hidden Input or use Select instead.",
    ],
    useCases: [
      "Row action menu in a DataTable: a '...' icon Button opens a DropdownMenu with Edit, Duplicate, DropdownMenuSeparator, then Delete (variant='destructive') — keeps the row compact and avoids inline button clutter.",
      "Topbar / avatar chip: a user-avatar Button triggers a DropdownMenu with Profile, Settings, DropdownMenuSeparator, Sign out — standard app-shell pattern for account actions.",
      "Bulk-action toolbar: after selecting rows, an 'Actions' Button opens a DropdownMenu with Approve, Reject, Export — prevents the toolbar from overflowing with individual buttons.",
      "Column visibility toggle in a report table: a 'Columns' Button opens a DropdownMenu whose items are DropdownMenuCheckboxItem entries, letting users show/hide columns without a Dialog.",
      "Quick status change on an accounting entry: a Badge-like trigger opens a DropdownMenu with DropdownMenuRadioGroup items (Draft, Posted, Voided) so the user can transition status without navigating away.",
      "Context menu for a sidebar nav item: right-click or kebab on a project entry opens a DropdownMenu with Rename, Duplicate, Archive actions scoped to that item.",
    ],
    related: [
      "Popover — use Popover when the floating panel needs arbitrary layout (filter forms, date pickers, rich content grids). Use DropdownMenu only for a list of discrete clickable actions or toggle items; DropdownMenu has no layout flexibility beyond label/separator/group.",
      "Command — use Command (cmdk) when the list is large, needs fuzzy-search filtering, or acts as a keyboard-driven command palette. DropdownMenu has no built-in search input; once the list exceeds ~8 items or needs filtering, switch to Command (often inside a Popover).",
      "Select — use Select when the purpose is choosing a value to submit in a form field (has a name prop for native form submission, renders a hidden select for a11y). Use DropdownMenu when the purpose is triggering actions, not picking a form value.",
      "Sidebar — use Sidebar for persistent left-rail navigation. DropdownMenu is transient (opens on click, dismisses on select); Sidebar is always-visible structural navigation.",
    ],
    example: `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@godxjp/ui/navigation";
import { Button } from "@godxjp/ui/general";

<DropdownMenu>
  <DropdownMenuTrigger asChild><Button variant="outline" size="sm">操作</Button></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>編集</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem tone="destructive">削除</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
    storyPath: "navigation/DropdownMenu.stories.tsx",
    rules: [],
  },
  {
    name: "Steps",
    group: "navigation",
    tagline: "Multi-step progress indicator — horizontal or vertical, default or dot style.",
    props: [
      {
        name: "items",
        type: "StepItemProp[]",
        description: "Array of { title, subtitle?, description?, icon?, status? }.",
      },
      {
        name: "value",
        type: "number",
        defaultValue: "0",
        description: "Active step index (0-based).",
      },
      {
        name: "defaultValue",
        type: "number",
        defaultValue: "0",
        description: "Base offset for the first rendered step index.",
      },
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        defaultValue: '"horizontal"',
        description: "Layout direction.",
      },
      {
        name: "status",
        type: '"wait" | "process" | "finish" | "error"',
        description: "Status of the CURRENT step (drives the active step colour).",
      },
      {
        name: "type",
        type: '"default" | "dot" | "inline"',
        description: "Render full markers, compact dots, or a numbered inline auth progress row.",
      },
      {
        name: "size",
        type: '"md" | "sm"',
        description: "Step size.",
      },
      {
        name: "titlePlacement",
        type: '"horizontal" | "vertical"',
        description: "Lay step titles beside or below the step icons.",
      },
      {
        name: "separator",
        type: '"chevron" | "arrow"',
        defaultValue: '"chevron"',
        description:
          'The glyph between INLINE steps (`type="inline"` only; gh#12). `chevron` (›) is the breadcrumb-flavoured original; `arrow` (→) is the canonical hosted-identity progression marker — a chevron reads "drill into", an arrow reads "then", which is what a step row means. Both flip under dir="rtl". Ignored by every other `type`.',
      },
      {
        name: "onValueChange",
        type: "(value: number) => void",
        description: "Fires with the clicked step index (0-based).",
      },
    ],
    usage: [
      "DO: Pass all steps via the `items` array (each `{ title, subtitle?, description?, icon?, status?, disabled? }`) — Steps is a single-component API with no child sub-components to compose manually.",
      "DO: Control the active step with `value` (0-based index). For async operations, set the top-level `status` prop (`'process'|'error'|'finish'`) to override the current step's icon — e.g. `status='error'` turns the active step red without touching `items`.",
      "DO: Use per-item `status` to pin individual steps independently of `value` (e.g. a skipped or already-errored step). Per-item `status` takes precedence over the derived status from `value`.",
      "DO: Use type='inline' for compact hosted-auth/device progress. It retains process/finish/error/wait and aria-current semantics without the tall icon rail; never rebuild the row from Text and arrows in a consumer.",
      'DO: Pick the inline progression marker with `separator` (`"arrow"` for the canonical hosted-identity row, `"chevron"` for the default), and express the step-number emphasis through `--steps-inline-index-{color,font-weight}` + `--steps-inline-separator-color` in the service theme. The canonical treatment is an accent TINT at normal weight; the library default is bold at the inherited colour. Both are one token away — never fork `.ui-steps-inline-index` in app CSS.',
      "DON'T: Use Steps for navigation that needs URL routing or tab-switching — it has no built-in panel rendering. Pair it with your own conditional panel or a `Tabs`/`Tabs` body; Steps only renders the indicator bar.",
      "DON'T: Wire `onValueChange` unless you actually support non-linear navigation. `onValueChange` makes every non-disabled step clickable (rendered as `<button>`); omitting it makes all steps non-interactive (`cursor-default`). Never set `disabled` on an item without also providing `onValueChange`, or the prop is meaningless.",
      "A11y: The `<ol>` is given `aria-label='Progress'` automatically. Individual steps render as `<button type='button'>` when `onValueChange` is present — ensure each `item.title` is descriptive enough to serve as the button label; avoid icon-only steps without a visible title.",
    ],
    useCases: [
      "Multi-step form wizard (entity onboarding, invoice creation): render Steps above a form, drive `current` from local state, advance on validated submit — use `status='error'` on the current step when server validation fails.",
      "Async background job tracker: display steps for a long-running import/export pipeline; poll job status and map job phases to `StepStatusProp` values (`'process'` with spinner for in-flight, `'finish'` for done, `'error'` for failed).",
      "Document approval workflow (accounting, contracts): map approval stages (Draft → Review → Approved → Archived) to `items` with per-item `status` reflecting the real state from the server — use `orientation='vertical'` for a sidebar timeline feel.",
      "Onboarding checklist sidebar: `orientation='vertical'` + `type='dot'` + `size='sm'` for a compact sidebar progress guide alongside a multi-section settings page.",
      "Non-linear step navigation (e.g. revisit a previous step to correct data): provide `onValueChange` and leave only future steps `disabled`; past and current steps become clickable buttons.",
    ],
    related: [
      "Timeline — use Timeline (from @godxjp/ui) when you need a chronological event log with timestamps and variable content per entry; use Steps when the number of stages is fixed and forward-progress is the semantic.",
      "Tabs / Tabs — use Tabs when each section has its own rendered panel and users switch freely between them; use Steps when stages are ordered and the indicator communicates completion state rather than just selection.",
      "Progress — use Progress for a single continuous percentage (file upload, quota fill); use Steps for discrete named stages with individual pass/fail status.",
      "Breadcrumb — use Breadcrumb for hierarchical location within a page tree; use Steps for sequential workflow progress where order and completion matter.",
    ],
    example: `import { Steps } from "@godxjp/ui/navigation";

<Steps value={1} items={[{ title: "申請" }, { title: "審査中" }, { title: "完了" }]} />`,
    storyPath: "navigation/Steps.stories.tsx",
    rules: [],
  },
  {
    name: "Toolbar",
    group: "navigation",
    tagline:
      "List-page filter strip (the framework FilterBar) — SearchInput + labelled ToolbarGroup filter slots + a clear-all affordance, optionally sticky.",
    props: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description:
          "Filter controls. Place SearchInput directly; wrap each labelled Select/DatePicker in a ToolbarGroup.",
      },
      {
        name: "onClear",
        type: "() => void",
        description:
          "Clear-all handler. When provided AND hasActiveFilters is true, Toolbar renders the trailing 'Clear filters' button.",
      },
      {
        name: "hasActiveFilters",
        type: "boolean",
        defaultValue: "true",
        description: "Whether any filter is applied — gates the clear-all button visibility.",
      },
      {
        name: "sticky",
        type: "boolean",
        defaultValue: "false",
        description:
          "Pin the strip to the top of its scroll container while the list scrolls beneath it (#197). Opt-in; tune offset/fill via the --filter-bar-sticky-offset / --filter-bar-sticky-background theme knobs.",
      },
      {
        name: "overflow",
        type: "'wrap' | 'scroll'",
        defaultValue: "'wrap'",
        description:
          "Responsive overflow strategy (gh#216). 'wrap' stacks the groups into one column below 640px, then wraps onto extra rows. 'scroll' keeps ONE bounded row at >=640px that scrolls inline (groups never shrink; the clear-all button stays sticky at the inline end) — use it when many filters with long JA/EN/VI labels would otherwise push the table below the fold. Below 640px 'scroll' still stacks, so a 390px viewport never hides a filter behind an invisible horizontal scroll. Gutter knob: --filter-bar-scroll-padding-y.",
      },
      {
        name: "search",
        type: "FilterBarSearchProp",
        description:
          "Typed model (gh#258) — canonical search slot rendered FIRST in the strip with the token-owned consistent width (--filter-bar-search-width, full-width below 640px). Controlled triad value/defaultValue/onValueChange plus SearchInput's debounced onSearch. ANY model prop (search/filters/chips/onChipRemove/actions/resultCount/loading/disabled/error) switches the bar to the canonical model layout; with none of them the bar stays the plain children-composition toolbar unchanged.",
      },
      {
        name: "filters",
        type: "FilterBarFilterProp[]",
        description:
          "Typed model — labelled domain-neutral Select filters rendered after the search slot in array order. Each: { value (stable identity), label (rendered as the control's REAL <label htmlFor> — WCAG 2.5.3), options, selected/defaultSelected/onSelectedChange, placeholder, disabled }. Width is token-owned (--filter-bar-filter-width).",
      },
      {
        name: "chips",
        type: "FilterBarChipProp[]",
        description:
          "Typed model — applied-filter chips as pure consumer data ({ value, label, disabled }), rendered in a labelled row under the strip. Lifecycle: ADD = include the chip, REMOVE = onChipRemove(value) via each chip's × button, CLEAR-ALL = onClear. Keep label a string so the remove button's accessible name can quote it.",
      },
      {
        name: "onChipRemove",
        type: "(value: string) => void",
        description:
          "Remove ONE chip by its value. Required for chips to render their × remove button (each gets a localized 'Remove filter: {label}' accessible name).",
      },
      {
        name: "actions",
        type: "ReactNode",
        description:
          "Typed model — trailing action slot (e.g. the primary 'Add' Button) parked at the inline end of the strip, after the reset button in DOM/keyboard order.",
      },
      {
        name: "resultCount",
        type: "number",
        description:
          "Typed model — localized, CLDR-pluralized result count ('{count} results' / '{count} 件の結果' / '{count} kết quả') announced politely via a role='status' line under the strip. 0 renders '0 results' as the visible empty state.",
      },
      {
        name: "loading",
        type: "boolean",
        description:
          "Typed model — marks the strip aria-busy (and sets data-loading on the root) while results are being (re)fetched.",
      },
      {
        name: "disabled",
        type: "boolean",
        description:
          "Typed model — disables every model-rendered control: search, filter Selects, the reset button and the chip remove buttons. Custom children stay consumer-owned.",
      },
      {
        name: "error",
        type: "ReactNode",
        description:
          "Typed model — consumer error content announced via role='alert' in the meta line, replacing the result count while present.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes on the root element.",
      },
    ],
    usage: [
      "DO prefer the typed model (gh#258) on a canonical list page — `search`/`filters`/`chips`/`onChipRemove`/`actions`/`resultCount` (+ `loading`/`disabled`/`error`) make the bar own layout, widths, chip lifecycle and keyboard order through --filter-bar-* tokens while ALL state stays consumer data. Children composition remains fully supported and unchanged when no model prop is passed.",
      "DO place Toolbar ABOVE the table Card, never inside a `CardContent flush`. Put SearchInput as a direct child (it self-labels) and wrap every other control in a ToolbarGroup with a `label`.",
      "DO drive the clear-all button with `hasActiveFilters` + `onClear` — it only renders when both are truthy. The strip collapses to a single stacked column below 640px automatically.",
      "DO set `sticky` for long list pages so the filters stay reachable while scrolling; if a topbar sits above the list, raise `--filter-bar-sticky-offset` so the strip parks below it.",
      "DO pass `controlId` on a ToolbarGroup that wraps ONE control (gh#216) and give that control the same `id` — the visible caption then becomes the control's real `<label htmlFor>` (WCAG 2.5.3 label-in-name). Without it the caption only names the group wrapper and the control itself is NAMELESS (axe: select-name / button-name), so you must fall back to an `aria-label` that repeats the caption.",
      "DO switch to `overflow='scroll'` when a list page carries more filters than fit one row (gh#216) — one bounded row that scrolls inline keeps the table above the fold, where the default `wrap` would grow a 3-row strip with long JA/EN/VI labels. Never re-implement the geometry in the page: no page-local flex/grid/width rules on a filter strip.",
      "DON'T build active-filter chips by nesting a Button inside a Badge (invalid markup + broken focus). Render each chip as a Badge label with a SIBLING icon Button (`aria-label` = 'clear <filter>'); a ghost `size='sm'` Button clears all.",
      "DON'T hand-roll a debounced search box or a raw `<select>` — compose SearchInput and Select. Toolbar is layout + clear-all only; the controls own their own state and a11y.",
    ],
    useCases: [
      "Master list screens (members, organizations, subscriptions, invoices) that need free-text search plus a few dropdown filters above a DataTable.",
      "Sticky filter strip over a tall list where the filters must remain visible as the user scrolls the results.",
      "Filtered views that surface applied conditions as removable chips (clear-one via each chip's × Button, clear-all via `onClear`).",
    ],
    related: [
      "ToolbarGroup — the labelled wrapper for each individual filter control inside a Toolbar (SearchInput is placed directly, without a group).",
      "DataTable.Toolbar — the in-table strip for column/density/bulk-action controls; Toolbar (this) is the page-level filter strip that sits ABOVE the table.",
      "SearchInput — the debounced free-text control placed as the first child of Toolbar.",
      "Badge — compose Badge + a sibling icon Button to render each active-filter chip; Badge itself is a non-interactive leaf.",
    ],
    example: `import { Toolbar, ToolbarGroup } from "@godxjp/ui/navigation";
import { SearchInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@godxjp/ui/data-entry";

<Toolbar sticky hasActiveFilters={hasFilters} onClear={clearAll}>
  <SearchInput placeholder="氏名・メールで検索" value={q} onSearch={setQ} />
  <ToolbarGroup label="ステータス">
    <Select value={status} onValueChange={setStatus}>
      <SelectTrigger aria-label="ステータス"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">すべて</SelectItem>
        <SelectItem value="active">有効</SelectItem>
      </SelectContent>
    </Select>
  </ToolbarGroup>
</Toolbar>`,
    docPath: "navigation/toolbar",
    storyPath: "navigation/toolbar.tsx",
    rules: [23, 44, 45, 46],
  },

  // ─── providers / datetime ───────────────────────────────────────────────
  {
    name: "AppProvider",
    group: "providers",
    tagline:
      "Root locale/timezone/date-time context — wrap the app ONCE. All pickers + formatDate read from it. Import from @godxjp/ui/app.",
    props: [
      {
        name: "defaultLocale",
        type: '"ja" | "en" | "vi"',
        defaultValue: '"vi"',
        description: "Initial locale.",
      },
      {
        name: "defaultTimezone",
        type: 'string | "browser" | "system"',
        defaultValue: '"browser"',
        description: "Initial IANA timezone.",
      },
      {
        name: "defaultDateFormat",
        type: '"iso" | "dmy" | "mdy" | "locale"',
        defaultValue: '"locale"',
        description: "Initial date display format.",
      },
      {
        name: "defaultTimeFormat",
        type: '"24h" | "12h" | "locale"',
        defaultValue: '"locale"',
        description: "Initial clock format.",
      },
      {
        name: "theme",
        type: '"light" | "dark"',
        defaultValue: '"light"',
        description:
          'Theme axis → <html data-theme>. Equal alias of the legacy .dark class. Persisted; change via setTheme / <AppSettingPicker kind="theme">.',
      },
      {
        name: "brand",
        type: '"brand" | "crm" | "logistics" | "partner" | "slate" | "dxs" | null',
        defaultValue: "null",
        description:
          'Brand-palette axis → <html data-brand> (sets --primary/--ring/--accent). OPT-IN: null keeps the --primary your own theme.css defines. "dxs" is THE CANONICAL DXS PRESET and is more than a tint: it also binds the canonical hosted-identity surface contract (36px auth controls, 22.5rem auth card measure, 16px page inset / 15px below 30rem), so a DXS surface needs ZERO page CSS for auth geometry, density, insets, logo colour, divider or footer. Stylesheet-only apps (no provider) import "@godxjp/ui/theme/dxs.canonical.css" instead — same contract, guarded against drift by a test.',
      },
      {
        name: "density",
        type: '"compact" | "default" | "comfortable"',
        defaultValue: '"default"',
        description:
          "Density axis → <html data-density>. A named preset of the global --scaling factor (compact .92 / default 1 / comfortable 1.08): every size token rescales in proportion app-wide. PageContainer density= overrides locally.",
      },
      {
        name: "scaling",
        type: "number | null",
        defaultValue: "null",
        description:
          "Continuous global size multiplier → inline --scaling on <html> (Radix model). Scales spacing, control/table/checkbox/switch heights, radius in proportion. null defers to the density preset; a number (e.g. 0.95) overrides it. Type is NOT scaled (separate fontSize axis).",
      },
      {
        name: "fontSize",
        type: '"sm" | "default" | "lg"',
        defaultValue: '"default"',
        description:
          "Base type-size axis → <html data-font-size>. A preset sets --font-size-base and the whole golden scale rescales. Orthogonal to --scaling.",
      },
    ],
    usage: [
      'DO drive the four theme axes (theme / brand / density / fontSize) from AppProvider props ONLY — they are written to <html data-*> and read by every component via tokens. Never hand-set --font-size-base or .ui-density-* in app CSS; that bypasses persistence + the runtime switchers. For runtime switching mount `<AppSettingPicker kind="density" | "fontSize" | "theme" | "brand" >` or call setDensity/setFontSize/setTheme/setBrand from useAppContext().',
      "DO mount AppProvider ONCE at the application root (e.g. in app.tsx or the Inertia layout), wrapping ALL children — every godx-ui picker (LocalePicker, TimezonePicker, DateFormatPicker, TimeFormatPicker), every formatDate call, and the Toaster all rely on the single context it provides. Nesting two AppProviders creates split contexts; inner pickers silently read the wrong one.",
      "DO NOT omit AppProvider and then try to use LocalePicker, TimezonePicker, or formatDate standalone — useAppContext() throws 'useAppContext must be used within <AppProvider>' at runtime. The only exception is using those pickers in fully controlled mode (value + onChange) which reads useOptionalAppContext() and returns null safely.",
      "DO use the `persist={false}` prop on AppProvider when writing isolated tests or standalone settings forms where localStorage should not be read or written. With the default `persist={true}` the provider reads from localStorage key `godxjp.app` on mount (after first render), so initial state may differ between SSR and client.",
      "DO set `defaultTimezone='system'` together with `systemTimezone={serverTimezone}` when your backend knows the legal entity's canonical timezone (e.g. 'Asia/Ho_Chi_Minh'). Use `defaultTimezone='browser'` (the default) only when you want the user's browser clock. Do NOT pass a raw IANA string to `defaultTimezone` if the user may be in a different zone — use the named aliases.",
      "DO wire `onLocaleChange`, `onTimezoneChange`, `onTimeFormatChange`, `onDateFormatChange` to persist changes server-side (e.g. patch user profile via Inertia router) in addition to the automatic localStorage write. These callbacks fire after state is set, so the new value is already reflected in context.",
      "DO restrict the timezone dropdown by passing `timezoneOptions={APP_TIMEZONE_PRESET}` (an exported constant) to AppProvider — all TimezonePicker instances that omit their own `options` prop will inherit this restricted list automatically from context. Without it, TimezonePicker renders the full IANA list (~600 entries).",
    ],
    useCases: [
      "App bootstrap in a multi-locale SaaS admin (ja/en/vi) — mount AppProvider at the root with the tenant's preferred locale and IANA timezone so every DataTable date column, every formatDate call, and every picker renders consistently in the user's locale without any per-component configuration.",
      "User settings page — render LocalePicker, TimezonePicker, DateFormatPicker, and TimeFormatPicker as zero-prop children inside the existing AppProvider; each picker reads and writes context automatically. Wire `onLocaleChange` to an Inertia form submit to persist the change to the server profile.",
      "Server-rendered Inertia app with SSR hydration — pass `defaultTimezone='system'` and `systemTimezone={sharedProps.timezone}` (injected via HandleInertiaRequests) so the initial render is timezone-deterministic and avoids hydration mismatches caused by browser-timezone detection.",
      "Multi-entity accounting dashboard — use `timezoneOptions` to restrict the picker to the legal entity's permissible zones (e.g. Southeast Asian IANA ids only), preventing users from accidentally switching to an out-of-scope timezone that would misrepresent transaction timestamps.",
      "Isolated preview / Storybook story — wrap a single component in `<AppProvider persist={false} defaultLocale='en'>` to give it a stable context without polluting localStorage between stories.",
      "Test harness — wrap the component under test in `<AppProvider persist={false} defaultLocale='ja' defaultDateFormat='iso'>` to assert locale-sensitive formatting output deterministically, independent of whatever the browser or stored preferences report.",
    ],
    related: [
      "LocalePicker — the language-selector control that reads/writes AppProvider locale context automatically when used as a zero-prop child. Prefer LocalePicker over calling setLocale from useAppContext() directly in UI.",
      "TimezonePicker — the timezone-selector control; inherits `timezoneOptions` from AppProvider context when its own `options` prop is omitted. Both pickers require AppProvider to be in the tree unless controlled props are passed.",
      "formatDate — the MANDATORY date/time formatter that reads locale, timezone, timeFormat, and dateFormat from AppProvider context. Do NOT call date-fns or Intl.DateTimeFormat directly; formatDate is the single source of truth for display.",
      "AppShell — the top-level application shell that composes AppProvider, AppShell, Sidebar, and Topbar into a single ready-to-use layout. If your project uses AppShell, AppProvider is already mounted inside it — do not add a second one.",
    ],
    example: `import { AppProvider } from "@godxjp/ui/app";

<AppProvider defaultLocale="ja" defaultTimezone="Asia/Tokyo" defaultDateFormat="iso" defaultTimeFormat="24h">
  {children}
</AppProvider>`,
    storyPath: "app/AppProvider.stories.tsx",
    rules: [5],
  },
  {
    name: "formatDate",
    group: "providers",
    tagline:
      "MANDATORY for all date/time display. Auto-detects ISO date / HH:mm / instant; reads AppProvider context. Import from @godxjp/ui/datetime.",
    props: [
      {
        name: "value",
        type: "string | Date | null | undefined",
        required: true,
        description: "ISO date, ISO datetime, HH:mm, or Date.",
      },
      {
        name: "options.kind",
        type: '"auto" | "date" | "datetime" | "time" | "long" | "relative"',
        defaultValue: '"auto"',
        description: "Output preset; auto infers from the value.",
      },
    ],
    usage: [
      "DO import from `@godxjp/ui/datetime` — NOT from `date-fns` or any other datetime utility. `formatDate` is the single mandatory display entry point; calling `date-fns/format` directly bypasses AppProvider locale/timezone/dateFormat/timeFormat context and produces inconsistent output across the app.",
      "DO ensure `AppProvider` is mounted at the app root before the first `formatDate` call. The function reads a module-level context synced by `AppProvider` via `syncDatetimeContext`. Without it the fallback locale is `'vi'` / timezone `'Asia/Ho_Chi_Minh'` / `'24h'`, which will silently produce wrong output in Japanese or English apps.",
      "DO pass `null` or `undefined` safely — `formatDate` returns an em-dash `'—'` for null/undefined/empty string values. Never guard with a ternary before calling it.",
      "DO use `options.kind` when auto-detection is wrong: pass `kind: 'date'` for an ISO datetime string you want displayed as date-only, `kind: 'relative'` for age display (e.g. `'3日前'`), `kind: 'long'` for full PPP format in modals/detail panels. Auto-detection maps plain `yyyy-MM-dd` → `'date'`, `HH:mm` → `'time'`, everything else → `'datetime'`.",
      "DO pass `{ calendar: true }` when the `Date` object came from a react-day-picker calendar pick — this prevents timezone shift that would occur if the Date were treated as a UTC instant.",
      "DON'T hand-roll per-call locale/timezone resolution with `Intl.DateTimeFormat` or raw `date-fns/format`. The `options.locale` / `options.timezone` overrides exist for one-off per-cell display differences (e.g. showing a partner's local time), not as a substitute for AppProvider context.",
    ],
    useCases: [
      "Rendering all date/time columns in a DataTable — invoice due dates (`kind: 'date'`), transaction timestamps (`kind: 'datetime'`), and elapsed time since last sync (`kind: 'relative'`) all go through `formatDate` so the locale/timezone/12h-24h setting from AppProvider is respected everywhere.",
      "Displaying a single date/time field in a Descriptions or Card detail panel, e.g. `formatDate(invoice.issuedAt)` for the issued-at row — no extra formatting logic needed, null is handled as `'—'` automatically.",
      "Formatting a stored `HH:mm` string (24h canonical storage) for display according to the user's timeFormat preference — pass the raw `'14:30'` string and auto-detection routes it through `formatTimeOfDay`, outputting `'2:30 PM'` or `'14:30'` based on context.",
      "Rendering a 'last modified' timestamp with relative wording in an activity feed or audit log row — `formatDate(entry.updatedAt, { kind: 'relative' })` produces locale-correct relative strings like `'3日前'` / `'3 days ago'`.",
      "Converting a `Date` selected from `DatePicker` (react-day-picker) back to a display string — pass `{ calendar: true }` to avoid the UTC midnight shift that the default instant path would apply.",
    ],
    related: [
      "AppProvider — required peer that seeds locale, timezone, dateFormat, and timeFormat into the module-level context that `formatDate` reads. Must be mounted once at app root; omitting it means `formatDate` silently falls back to Vietnamese/Ho Chi Minh City defaults.",
      "DatePicker — the corresponding input control for calendar dates. Use `DatePicker` to capture a date from the user; use `formatDate(value, { calendar: true })` to display the picked `Date` object back as a string.",
      "DateFormatPicker / TimeFormatPicker / TimezonePicker — preference pickers that update AppProvider context; their selections are automatically picked up by subsequent `formatDate` calls with no extra wiring needed.",
      "TimePicker — the corresponding input control for HH:mm time values. Use `TimePicker` to capture time; use `formatDate(hhmm)` (auto-detects `'time'` kind) to display the stored `HH:mm` string respecting the user's 12h/24h preference.",
    ],
    example: `import { formatDate } from "@godxjp/ui/datetime";

formatDate(coupon.validFrom);                       // "2026-05-01"
formatDate(order.createdAt, { kind: "relative" });  // "3日前"`,
    storyPath: "app/formatDate.stories.tsx",
    rules: [5],
  },
  // ─── backfill 2026-06 (Tooltip, pickers, advanced data-entry, query helpers) ───
  {
    name: "TimePicker",
    group: "data-entry",
    tagline:
      "24h HH:mm time combobox with a scrollable hour/minute popover — the visible input IS the form field; give it a `name` prop and it submits directly, no hidden mirror needed.",
    props: [
      {
        name: "value",
        type: "string",
        description:
          "Controlled value in HH:mm (24h) format. When provided the component is fully controlled — you must update it via `onChange`.",
      },
      {
        name: "defaultValue",
        type: "string",
        description:
          "Uncontrolled initial value in HH:mm format. Used only when `value` is not provided.",
      },
      {
        name: "onChange",
        type: "(value: string) => void",
        description:
          "Called with the canonical HH:mm string whenever the user commits a time (picks from columns or types and blurs/presses Enter). Not called for every keystroke.",
      },
      {
        name: "name",
        type: "string",
        description:
          "HTML form field name. The visible `<input>` carries this name and emits the canonical HH:mm value on native form submission — no hidden element needed.",
      },
      {
        name: "id",
        type: "string",
        description:
          "HTML id for the visible input — use with a `<label htmlFor>` for accessibility.",
      },
      {
        name: "placeholder",
        type: "string",
        defaultValue: "hh:mm (i18n fallback)",
        description:
          "Placeholder text shown when the input is empty. Falls back to the i18n key `dataEntry.timePicker.placeholder`.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables both the visible input and the clock-icon popover trigger.",
      },
      {
        name: "minuteStep",
        type: "number",
        defaultValue: "5",
        description:
          "Step for the minute column (1–60). Only multiples of this step appear in the picker; typed values are still free-form and normalized on blur.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Extra Tailwind classes applied to the outer wrapper `<div>`. Use for width overrides (e.g. `w-32`).",
      },
      {
        name: "allowClear",
        type: "boolean",
        defaultValue: "true",
        description:
          "Inline ✕ on the trigger that resets the value when one is set (Ant-style). Pass `false` to hide it (e.g. a required field).",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Fires with the canonical 24h `HH:mm` string (empty when cleared).",
      },
    ],
    usage: [
      "DO give it a `name` prop whenever it lives inside a `<form>` — the visible input carries the name and emits `HH:mm` on native submission. You do NOT need a hidden element.",
      "DO use the controlled pattern (`value` + `onChange`) in React-managed forms (e.g. useForm). For simple HTML forms without React state, omit `value` and use `defaultValue` for the uncontrolled pattern.",
      "DON'T pass a raw `<input type='time'>` alongside or instead — this component IS the input, fully accessible (role='combobox', aria-expanded, aria-haspopup) and e2e-testable by filling the text input directly.",
      "DO pair with a `<label htmlFor={id}>` for screen-reader accessibility — the component renders a plain `<input>` internally that `id` connects to.",
      "DON'T expect `onChange` on every keystroke — it fires only when a valid HH:mm is committed (column pick closes popover; typed value normalised on blur or Enter). Guard downstream logic accordingly.",
      "DO adjust `minuteStep` for domain needs (e.g. `minuteStep={15}` for scheduling, `minuteStep={1}` for precise entry) — the minute column only shows multiples, but the type-in field accepts any valid HH:mm.",
    ],
    useCases: [
      "Shift/schedule entry forms where workers select start and end times from a scrollable hour/minute grid (use `minuteStep={15}` or `minuteStep={30}`).",
      "Invoice or transaction timestamp fields that require a 24h HH:mm time alongside a DatePicker — pair the two in a flex row.",
      "Logistics cut-off time configuration (e.g. 'last order by') where the default `minuteStep={5}` aligns with typical operational granularity.",
      "Admin settings panels that persist a canonical HH:mm string to the database — the `name` prop makes native form submission trivial.",
      "Time-range pickers (from/to) — render two TimePicker instances side-by-side with separate controlled values and validate that `to > from` in `onChange`.",
      "E2E-tested forms — test helpers can fill the text input directly (it accepts typed HH:mm) without needing to interact with the popover columns.",
    ],
    related: [
      "DatePicker — use for calendar date selection; combine with TimePicker in a flex row when you need a full datetime. DatePicker emits an ISO date string; TimePicker emits HH:mm.",
      "Input — the raw primitive TimePicker wraps internally. Use Input directly only when you need a plain text field with no time semantics or popover.",
      "ColorPicker — another popover-backed input primitive in the same group; structurally similar pattern but for hex colour values.",
    ],
    example: `import { TimePicker } from "@godxjp/ui/data-entry";
import { useState } from "react";

// Controlled usage inside a React form
export function ShiftStartField() {
  const [startTime, setStartTime] = useState("09:00");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="shift-start" className="text-sm font-medium">
        Shift start
      </label>
      <TimePicker
        id="shift-start"
        name="shift_start"
        value={startTime}
        onValueChange={setStartTime}
        minuteStep={15}
        className="w-36"
      />
    </div>
  );
}

// Uncontrolled usage inside a native form
export function CutoffTimeForm() {
  return (
    <form method="post" action="/settings/cutoff">
      <TimePicker
        id="cutoff"
        name="cutoff_time"
        defaultValue="17:00"
        minuteStep={30}
        placeholder="hh:mm"
      />
      <button type="submit">Save</button>
    </form>
  );
}`,
    storyPath: "data-entry/TimePicker.stories.tsx",
    rules: [3, 6, 13, 23],
  },
  {
    name: "DateRangePicker",
    group: "data-entry",
    tagline:
      "WAI-ARIA date-range control with two typeable ISO inputs + popover calendar — form-submits as `${name}_from` / `${name}_to`, never hand-roll two DatePickers side-by-side.",
    props: [
      {
        name: "value",
        type: "DateRange | undefined",
        description:
          "Controlled value — object with optional `from: Date` and `to: Date` from react-day-picker. Pass undefined to clear.",
      },
      {
        name: "onChange",
        type: "(range: DateRange | undefined) => void",
        description:
          "Called whenever either text input commits or the calendar selects a range. Receives undefined when both edges are cleared.",
      },
      {
        name: "name",
        type: "string",
        description:
          "HTML form field name prefix. Emits two native hidden-compatible inputs: `${name}_from` and `${name}_to`, each as an ISO yyyy-MM-dd string. Required for native form submission.",
      },
      {
        name: "id",
        type: "string",
        description:
          "DOM id wired to the FROM input. Used by FormField's htmlFor to attach the label to the first focusable control.",
      },
      {
        name: "placeholder",
        type: "string",
        defaultValue: "i18n key dataEntry.dateRangePicker.placeholder or 'yyyy-mm-dd'",
        description:
          "Placeholder shown in both inputs when empty. Defaults to the project i18n translation or the literal ISO hint 'yyyy-mm-dd'.",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Disables both text inputs and the calendar trigger button.",
      },
      {
        name: "locale",
        type: 'DayPickerProps["locale"]',
        description:
          "react-day-picker locale object forwarded to the Calendar popover. Overrides the project-level locale resolved from usePickerLocales.",
      },
      {
        name: "fromDate",
        type: "Date",
        description:
          "Earliest selectable date. Disables calendar days before this date and pins the calendar's startMonth.",
      },
      {
        name: "toDate",
        type: "Date",
        description:
          "Latest selectable date. Disables calendar days after this date and pins the calendar's endMonth.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Extra CSS classes applied to the root flex container (flex items-center gap-1). Use to constrain width or adjust layout; avoid overriding token colors.",
      },
      {
        name: "allowClear",
        type: "boolean",
        defaultValue: "true",
        description:
          "Inline ✕ on the trigger that resets the range when one is set (Ant-style). Pass `false` to hide it.",
      },
      {
        name: "defaultValue",
        type: "DateRange",
        description: "Uncontrolled initial range.",
      },
      {
        name: "onValueChange",
        type: "(value: DateRange | undefined) => void",
        description: "Fires with the selected range (undefined when cleared).",
      },
    ],
    usage: [
      "DO use controlled mode (`value` + `onChange`) in all form contexts — this component has no `defaultValue` prop; initialize state with `useState<DateRange | undefined>()`.",
      "DO set `name` when the form is submitted natively or via Inertia useForm: the component emits `${name}_from` and `${name}_to` as ISO yyyy-MM-dd strings — read them as separate fields on the server.",
      'DO wrap in `<FormField id="..." label="...">` to attach the label; pass the same string to both `FormField`\'s `id` and `DateRangePicker`\'s `id` so the label targets the FROM input.',
      "DON'T compose two `<DatePicker>` components side-by-side to achieve a range — `DateRangePicker` handles range state, calendar highlight, and dual form submission in one atomic control.",
      "DON'T rely on the calendar popover alone for e2e testing — both inputs are real typeable `<input>` elements; fill them directly with ISO strings (e.g. `fill('#from-id', '2026-01-01')`) in Playwright/Pest browser tests.",
      "Use `fromDate` / `toDate` to constrain the selectable window (e.g. fiscal year bounds, invoice cutoff), not just visual decoration — they also disable out-of-range keyboard navigation in the calendar.",
    ],
    useCases: [
      "Invoice period filter on an accounting list page: let the user pick a start/end date; submit as `period_from` + `period_to` query params.",
      "Manifest / shipment date range in a logistics form: wrap in FormField with label 'Kỳ lô hàng', constrain with `fromDate`/`toDate` to the valid manifest window.",
      "Report generation wizard where users define a custom reporting period (e.g. fiscal quarter start to end).",
      "Dashboard date-range filter in a toolbar: controlled state drives a TanStack Query `queryKey` to refetch charts when the range changes.",
      "Booking or reservation form that requires both an arrival and departure date in a single field, with `fromDate={today}` to block past dates.",
      "Admin audit log search where start and end timestamps are captured as ISO date strings for a backend query.",
    ],
    related: [
      "DatePicker — single-date variant; use DateRangePicker when TWO boundary dates are required. Never place two DatePickers side-by-side to fake a range.",
      "Calendar — the headless month grid used internally by DateRangePicker; use directly only for custom embedded calendar UI, not as a form control.",
      "TimePicker — companion for HH:mm selection; combine with DateRangePicker when datetime ranges are needed (store separately).",
    ],
    example: `import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { DateRangePicker, FormField } from "@godxjp/ui/data-entry";

export function InvoicePeriodFilter() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 0, 1),
    to: new Date(2026, 11, 31),
  });

  return (
    <FormField id="invoice-period" label="Invoice period" className="max-w-sm">
      <DateRangePicker
        id="invoice-period"
        name="period"
        value={range}
        onValueChange={setRange}
        fromDate={new Date(2020, 0, 1)}
        toDate={new Date(2030, 11, 31)}
      />
    </FormField>
    // Submits: period_from=2026-01-01, period_to=2026-12-31
  );
}`,
    storyPath: "data-entry/DateRangePicker.stories.tsx",
    rules: [3, 6, 23, 31],
  },
  {
    name: "Cascader",
    group: "data-entry",
    tagline:
      "Multi-level hierarchical path picker (Popover + cascading columns); value is always a string[] path, never a flat ID — passing a bare string breaks it.",
    props: [
      {
        name: "options",
        type: "TreeOptionProp[]",
        required: true,
        description:
          "The hierarchical option tree. Each node has { value: string; label: ReactNode; disabled?: boolean; isLeaf?: boolean; children?: TreeOptionProp[] }. Normalised internally via fieldNames.",
      },
      {
        name: "value",
        type: "string[] | string[][]",
        description:
          "Controlled value. Single mode: string[] path (e.g. ['vn','hcm','q1']). Multiple mode: string[][] array of paths. Omit for uncontrolled.",
      },
      {
        name: "defaultValue",
        type: "string[] | string[][]",
        description: "Initial value for uncontrolled mode. Same shape as value.",
      },
      {
        name: "onValueChange",
        type: "(value: string[] | string[][], selectedOptions?: TreeOptionProp[] | TreeOptionProp[][]) => void",
        description:
          "Fires when selection changes. First arg is the selected path(s); second is the matching node objects. On clear, called with [].",
      },
      {
        name: "multiple",
        type: "boolean",
        defaultValue: "false",
        description:
          "Enable multi-path selection. Renders checkboxes in columns and search results. Panel stays open on each pick. value/defaultValue become string[][].",
      },
      {
        name: "changeOnSelect",
        type: "boolean",
        defaultValue: "false",
        description:
          "When true, clicking any node (including branch nodes with children) commits that path immediately instead of waiting for a leaf selection.",
      },
      {
        name: "showSearch",
        type: "boolean",
        defaultValue: "false",
        description:
          "Renders a CommandInput at the top of the popover. Filters to matching leaf paths across the whole tree when a query is typed; reverts to cascade columns when the query is cleared.",
      },
      {
        name: "placeholder",
        type: "string",
        description:
          "Trigger button placeholder text when no value is selected. Defaults to the i18n key dataEntry.cascader.placeholder.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables the trigger button and prevents the popover from opening.",
      },
      {
        name: "expandTrigger",
        type: '"click" | "hover"',
        defaultValue: '"click"',
        description:
          "How child columns are expanded. 'hover' expands on mouseenter and collapses back on mouseleave.",
      },
      {
        name: "fieldNames",
        type: "TreeFieldNamesProp",
        description:
          "Remap custom data keys: { label?: string; value?: string; children?: string }. Use when your data uses e.g. 'name' and 'id' instead of 'label' and 'value'.",
      },
      {
        name: "allowClear",
        type: "boolean",
        defaultValue: "true",
        description:
          "Shows an X icon on the trigger when a value is selected. Clicking it calls onChange([]) and resets to placeholder.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra Tailwind classes applied to the trigger button.",
      },
      {
        name: "id",
        type: "string",
        description: "HTML id forwarded to the trigger button. Use to associate a <label htmlFor>.",
      },
    ],
    usage: [
      "DO pass a string[] path as value in single mode (e.g. ['country','region','city']). DON'T pass a flat string ID — the component treats value as an ordered path array and will render nothing if you pass a bare string.",
      "DO use value + onChange together for controlled mode, or defaultValue alone for uncontrolled. DON'T mix both — providing value without onChange makes the field read-only (the internal state won't update).",
      "DO set multiple={true} and pass value as string[][] (array of paths) for multi-selection. onChange receives string[][] in that mode. Mixing single-mode shape with multiple={true} silently produces no selection.",
      "DON'T hand-roll a search input next to Cascader. Use showSearch={true} — it adds a built-in CommandInput that filters leaf paths across the full tree and reverts to cascade columns when cleared.",
      "DO use fieldNames to remap data keys ({label:'name', value:'id', children:'nodes'}) rather than pre-transforming your API data. This keeps options in their original shape.",
      "For form submission, Cascader has no 'name' prop. Wrap in a controlled pattern and store the path array in your form state (useForm/useState). For Inertia useForm, keep the field as an array (e.g. data.categoryPath = ['a','b','c']).",
    ],
    useCases: [
      "Geographic drilldown (Country → Prefecture → City) for address or branch-office pickers in accounting or logistics forms.",
      "Expense category selection (e.g. Operating Expenses → Marketing → Digital Ads) where the full classification path is required for the general ledger.",
      "Product taxonomy navigation (Department → Category → Sub-category) in inventory or invoice line-item entry.",
      "Organisational unit picker (Company → Division → Department) in budget allocation or approval-routing configurations.",
      "Multi-region filter in a report or dashboard filter bar, using multiple={true} to allow selecting several leaf locations at once.",
      "Any deeply nested classification where the relationship between levels is meaningful and must be captured — not just the leaf value.",
    ],
    related: [
      "TreeSelect — use when the hierarchy is a collapsible tree (expand/collapse nodes) rather than side-by-side columns, and when a single flat value string (node key) is sufficient instead of a full ancestor path. TreeSelect also supports treeCheckable for multi-select.",
      "Select — use for a flat (non-hierarchical) list of options. Cascader is only needed when items have meaningful parent–child levels.",
      "Transfer — use when the user needs to shuttle multiple items between two panels; not for hierarchical path selection.",
    ],
    example: `{\`import { Cascader } from "@godxjp/ui/data-entry";

const REGIONS = [
  {
    value: "jp",
    label: "日本",
    content: [
      {
        value: "tokyo",
        label: "東京都",
        content: [
          { value: "shinjuku", label: "新宿区" },
          { value: "shibuya", label: "渋谷区" },
        ],
      },
    ],
  },
  {
    value: "vn",
    label: "Việt Nam",
    content: [
      {
        value: "hcm",
        label: "TP. Hồ Chí Minh",
        content: [
          { value: "q1", label: "Quận 1" },
          { value: "q3", label: "Quận 3" },
        ],
      },
    ],
  },
];

// Controlled single-path
function RegionPicker() {
  const [path, setPath] = React.useState<string[]>([]);

  return (
    <Cascader
      options={REGIONS}
      value={path}
      onValueChange={(v) => setPath(v as string[])}
      showSearch
      placeholder="Select region…"
    />
  );
}

// Multi-path (multiple selection)
function MultiRegionPicker() {
  const [paths, setPaths] = React.useState<string[][]>([]);

  return (
    <Cascader
      options={REGIONS}
      multiple
      value={paths}
      onValueChange={(v) => setPaths(v as string[][])}
      showSearch
    />
  );
}

// With custom field names (data uses 'name'/'id'/'nodes')
<Cascader
  options={rawApiData}
  fieldNames={{ label: "name", value: "id", content: "nodes" }}
  defaultValue={["dept-1", "team-3"]}
/>

// changeOnSelect: lets user pick a branch node (not only leaves)
<Cascader
  options={REGIONS}
  changeOnSelect
  onValueChange={(v) => console.log("path", v)}
/>
\`}`,
    storyPath: "data-entry/Cascader.stories.tsx",
    rules: [3, 6, 23, 31],
  },
  {
    name: "TreeSelect",
    group: "data-entry",
    tagline:
      "Hierarchical tree picker in a Popover (single or multi-select with checkboxes) — `onChange` receives `string` in single mode and `string[]` in multi/checkable mode; never use a raw `<select>` for tree-structured data.",
    props: [
      {
        name: "treeData",
        type: "TreeOptionProp[]",
        required: true,
        description:
          "The tree data. Each node: `{ value: string; label: ReactNode; disabled?: boolean; disableCheckbox?: boolean; isLeaf?: boolean; children?: TreeOptionProp[] }`. Use `fieldNames` to remap custom keys.",
      },
      {
        name: "value",
        type: "string | string[]",
        description:
          "Controlled selected value(s). Pass `string` in single mode, `string[]` in multi/checkable mode. When undefined the component is uncontrolled.",
      },
      {
        name: "defaultValue",
        type: "string | string[]",
        description: "Initial value for uncontrolled usage. Ignored once `value` is provided.",
      },
      {
        name: "onValueChange",
        type: "(value: string | string[] | undefined) => void",
        description:
          "Called on selection change. Returns `string` in single mode, `string[]` in multi/checkable mode, or `undefined` when cleared.",
      },
      {
        name: "multiple",
        type: "boolean",
        defaultValue: "false",
        description:
          "Enable multi-select without checkboxes. When true, `onChange` always fires with `string[]`.",
      },
      {
        name: "treeCheckable",
        type: "boolean",
        defaultValue: "false",
        description:
          "Render Checkbox controls beside each node. Implies multi-select; cascade-selects all descendants by default unless `treeCheckStrictly` is set.",
      },
      {
        name: "treeCheckStrictly",
        type: "boolean",
        defaultValue: "false",
        description:
          "When true (only with `treeCheckable`), parent and child selections are independent — checking a parent does NOT auto-check its children.",
      },
      {
        name: "showCheckedStrategy",
        type: '"SHOW_CHILD" | "SHOW_PARENT" | "SHOW_ALL"',
        defaultValue: '"SHOW_CHILD"',
        description:
          "Controls which values appear in the trigger label when checkboxes are used. `SHOW_CHILD` (default) — show only leaf nodes selected; `SHOW_PARENT` — show nearest ancestor when all children selected; `SHOW_ALL` — show every checked node. Use the exported constants `TreeSelect.SHOW_CHILD`, `TreeSelect.SHOW_PARENT`, `TreeSelect.SHOW_ALL` instead of raw strings.",
      },
      {
        name: "showSearch",
        type: "boolean",
        defaultValue: "false",
        description:
          "Show a CommandInput search box at the top of the dropdown. Filters visible tree nodes by label text.",
      },
      {
        name: "treeDefaultExpandAll",
        type: "boolean",
        defaultValue: "false",
        description:
          "Expand all nodes when the dropdown first opens. Initialised once; does not re-expand on re-render.",
      },
      {
        name: "placeholder",
        type: "string",
        description:
          "Trigger button placeholder text when nothing is selected. Defaults to the i18n key `dataEntry.treeSelect.placeholder`.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables the trigger button and all interactions.",
      },
      {
        name: "allowClear",
        type: "boolean",
        defaultValue: "true",
        description:
          "Show an `X` icon in the trigger to clear the selection. Set to `false` to make selection mandatory.",
      },
      {
        name: "className",
        type: "string",
        description: "Additional Tailwind classes applied to the trigger Button.",
      },
      {
        name: "id",
        type: "string",
        description:
          "HTML `id` placed on the trigger Button — use this to associate a `<label htmlFor>` for accessibility.",
      },
      {
        name: "aria-label",
        type: "string",
        description: "Accessible name for the combobox trigger when no visible label is available.",
      },
      {
        name: "aria-errormessage",
        type: "string",
        description: "ID of the element containing the current validation error message.",
      },
      {
        name: "aria-invalid",
        type: "boolean | 'true' | 'false'",
        description: "Marks the semantic combobox trigger invalid for assistive technology.",
      },
      {
        name: "aria-required",
        type: "boolean | 'true' | 'false'",
        description: "Marks the semantic combobox trigger required for assistive technology.",
      },
      {
        name: "fieldNames",
        type: "{ label?: string; value?: string; children?: string }",
        description:
          "Remap data object keys. Example: `{ label: 'name', value: 'id', content: 'items' }` so you don't have to transform your API response before passing it to `treeData`.",
      },
    ],
    usage: [
      "DO pair with a `<label htmlFor={id}>` and pass the matching `id` prop so screen readers announce the control correctly. The underlying trigger is a `<Button role='combobox'>` — not a native `<select>` — so an explicit label is required.",
      "DO use `treeCheckable` (+ optionally `showCheckedStrategy`) for selecting multiple nodes with parent–child cascade; use `multiple` only when you want multi-select WITHOUT the checkbox cascade behaviour.",
      "DO use the static constants `TreeSelect.SHOW_CHILD`, `TreeSelect.SHOW_PARENT`, `TreeSelect.SHOW_ALL` (or the named exports `SHOW_CHILD`/`SHOW_PARENT`/`SHOW_ALL` from the same import path) instead of raw string literals for `showCheckedStrategy`.",
      "DON'T pass `value` and `defaultValue` simultaneously — pick controlled (`value` + `onChange`) OR uncontrolled (`defaultValue` only). Mixing them causes the component to silently prefer the controlled path.",
      "DON'T hand-roll `onChange` type narrowing: in single mode the callback receives `string | undefined`; in multi/checkable mode it receives `string[]`. Branch on `multiple || treeCheckable` if you need to handle both shapes in the same handler.",
      "DON'T use a raw `<select>` or a flat `Select` component for hierarchical/nested data — TreeSelect is the correct primitive. If hierarchy is irrelevant and data is flat, use `Select` instead.",
    ],
    useCases: [
      "Chart-of-accounts picker in an accounting app where accounts belong to groups (Assets > Current Assets > Cash) and the user must select one leaf account.",
      "Multi-select department or cost-centre filter where selecting a parent division should auto-select all child departments (treeCheckable + SHOW_PARENT).",
      "Category assignment on invoice line items where categories have up to 3 levels of nesting and users can assign a parent or a leaf.",
      "Permission scope selector where roles are structured in a tree and selecting a parent role should cascade to all child scopes (treeCheckable + treeCheckStrictly=false).",
      "Location picker (Country > Prefecture > City) in a form where only leaf-level cities are valid selections (single mode, no checkboxes).",
      "Large GL hierarchy browser with showSearch enabled so users can type to filter thousands of account codes instead of manually expanding nodes.",
    ],
    related: [
      "Select — flat single/multi picker; use when data has no parent-child hierarchy. Pick TreeSelect as soon as items have `children`.",
      "Cascader — also renders tree data but in a multi-column panel where the user drills down column by column; pick Cascader for strict path selection (select a full path Country→Region→City). Pick TreeSelect when the user may select any node at any level or needs checkboxes.",
      "Checkbox / CheckboxGroup — use for a small, always-visible flat list of options. Use TreeSelect when options are hierarchical or the list is long enough to warrant a dropdown.",
      "Command / CommandInput — low-level search primitive; TreeSelect already embeds this internally. Do NOT compose your own tree dropdown out of Command — use TreeSelect.",
    ],
    example: `import { useState } from "react";
import { TreeSelect } from "@godxjp/ui/data-entry";

const accountTree = [
  {
    value: "assets",
    label: "Assets",
    content: [
      { value: "current-assets", label: "Current Assets", content: [
          { value: "cash", label: "Cash" },
          { value: "ar", label: "Accounts Receivable" },
        ],
      },
      { value: "fixed-assets", label: "Fixed Assets", content: [
          { value: "equipment", label: "Equipment" },
        ],
      },
    ],
  },
  {
    value: "liabilities",
    label: "Liabilities",
    content: [
      { value: "ap", label: "Accounts Payable" },
    ],
  },
];

// Single-select (returns string | undefined)
export function AccountPicker() {
  const [account, setAccount] = useState<string | undefined>();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="account-picker" className="text-sm font-medium">
        GL Account
      </label>
      <TreeSelect
        id="account-picker"
        treeData={accountTree}
        value={account}
        onValueChange={(v) => setAccount(v as string | undefined)}
        showSearch
        treeDefaultExpandAll
        placeholder="Select account…"
        allowClear
      />
    </div>
  );
}

// Multi-select with checkboxes + cascade + SHOW_PARENT display
export function DepartmentFilter() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <TreeSelect
      id="dept-filter"
      treeData={accountTree}
      value={selected}
      onValueChange={(v) => setSelected(v as string[])}
      treeCheckable
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      showSearch
      placeholder="Filter by department…"
    />
  );
}`,
    storyPath: "data-entry/TreeSelect.stories.tsx",
    rules: [3, 6, 13, 23],
  },
  {
    name: "Transfer",
    group: "data-entry",
    tagline:
      "Dual-list shuttle that moves items between source and target via Checkbox selection — you own targetKeys state; never hand-roll a two-panel picker.",
    props: [
      {
        name: "dataSource",
        type: "TransferItemProp[]",
        required: true,
        description:
          "Full flat list of all items (both source and target). Each item needs a unique `key` string, a `title` (ReactNode rendered in the list row), an optional `description` (shown as a secondary line), and an optional `disabled` boolean to lock individual items.",
      },
      {
        name: "targetKeys",
        type: "string[]",
        required: true,
        description:
          "Keys of items currently in the right (target) panel. Items whose key is NOT in this array appear in the left (source) panel. This is the primary controlled state — you must update it inside `onChange`.",
      },
      {
        name: "onChange",
        type: "(targetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void",
        description:
          "Called after the user clicks a move button. Receives the new full targetKeys array, the direction of movement ('right' = source→target, 'left' = target→source), and the keys that were actually moved. Update your targetKeys state here.",
      },
      {
        name: "titles",
        type: "[React.ReactNode, React.ReactNode]",
        description:
          "Panel header labels. Index 0 = left/source panel, index 1 = right/target panel. Defaults to i18n strings (dataEntry.transfer.source / dataEntry.transfer.target).",
      },
      {
        name: "showSearch",
        type: "boolean",
        defaultValue: "false",
        description:
          "When true, renders a SearchInput inside each panel that filters items by title and description text (debounce=0). Does not affect the underlying data; purely a client-side filter.",
      },
      {
        name: "oneWay",
        type: "boolean",
        defaultValue: "false",
        description:
          "When true, hides the left-pointing move button so items can only flow source → target. Useful for append-only assignment flows.",
      },
      {
        name: "disabled",
        type: "DisabledProp (boolean)",
        defaultValue: "false",
        description:
          "Disables the entire component: all checkboxes, the search input (pointer-events-none), and both move buttons.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Extra Tailwind classes applied to the outer flex wrapper. Use to constrain width or add margin.",
      },
      {
        name: "selectedKeys",
        type: "[string[], string[]]",
        description:
          "Controlled selection state as a tuple: index 0 = keys checked in the source panel, index 1 = keys checked in the target panel. Omit to use internal (uncontrolled) selection state. Must be paired with `onSelectChange` when provided.",
      },
      {
        name: "onSelectChange",
        type: "(sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void",
        description:
          "Called whenever the checked selection in either panel changes. Provides updated arrays for source and target selections. Required when `selectedKeys` is controlled.",
      },
      {
        name: "onValueChange",
        type: '(targetKeys: string[], direction: "left" | "right", moveKeys: string[]) => void',
        description: "Fires when items move between panels; you own `targetKeys` state.",
      },
    ],
    usage: [
      "DO own `targetKeys` in state and update it inside `onChange`: `const [targetKeys, setTargetKeys] = useState<string[]>([]); onValueChange={(next) => setTargetKeys(next)}`.",
      "DO NOT hand-roll a two-panel checkbox picker — Transfer ships the full shuttle UX (select-all header, indeterminate state, search, move buttons, empty state) out of the box.",
      "DO enable `showSearch` for lists longer than ~10 items; the built-in SearchInput filters by both `title` and `description` text content, including ReactNode content via `reactNodeText`.",
      "DO use `oneWay={true}` for append-only flows (e.g. adding permissions to a role) where items must never be moved back.",
      "DO control `selectedKeys` / `onSelectChange` only when you need to read which items are currently checked (e.g. for a bulk-action toolbar outside the component). For most cases, leave both props out and let Transfer manage selection internally.",
      "AVOID using Transfer for simple single-select or toggle scenarios — use a Checkbox list, Select, or MultiSelect instead. Transfer is specifically for shuttle/dual-panel assignment flows.",
    ],
    useCases: [
      "Assigning roles or permissions to a user: source panel shows available roles, target panel shows assigned roles; `oneWay={false}` allows removal.",
      "Building a report column picker: source = all available columns, target = columns included in the report, user orders and moves them across.",
      "Account mapping in an accounting app: map external chart-of-accounts entries (source) to canonical internal accounts (target) in a bulk import wizard.",
      "Tag / label assignment in a CMS: move content tags from an available pool into a 'selected' set for a document.",
      "Feature-flag targeting: move user segments from an 'all segments' list into the 'targeted segments' panel for a flag.",
      "Permission set builder in an admin UI: shuttle individual API scopes from 'available' to 'granted' for an API key or OAuth client.",
    ],
    related: [
      "MultiSelect — picks multiple values from a dropdown; prefer when the option set is large and a panel layout is not needed.",
      "Checkbox (list) — use for a simple flat multi-select without a shuttle/move metaphor.",
      "Select (compound) — single or multi-value dropdown; not a dual-panel component.",
      "Tree — hierarchical item display; combine with Transfer's dataSource if items have a tree structure but the shuttle UX is still needed.",
    ],
    example: `import { useState } from "react";
import { Transfer } from "@godxjp/ui/data-entry";

const ALL_ACCOUNTS = [
  { value: "1010", title: "Cash", description: "Asset" },
  { value: "1020", title: "Accounts Receivable", description: "Asset" },
  { value: "2010", title: "Accounts Payable", description: "Liability" },
  { value: "3010", title: "Revenue", description: "Income" },
  { value: "4010", title: "Cost of Goods Sold", description: "Expense", disabled: true },
];

export function AccountMapping() {
  const [targetKeys, setTargetKeys] = useState<string[]>(["1010"]);

  return (
    <Transfer
      dataSource={ALL_ACCOUNTS}
      targetKeys={targetKeys}
      onValueChange={(nextKeys) => setTargetKeys(nextKeys)}
      titles={["Available Accounts", "Mapped Accounts"]}
      showSearch
    />
  );
}`,
    storyPath: "data-entry/Transfer.stories.tsx",
    rules: [23, 31],
  },
  {
    name: "Upload",
    group: "data-entry",
    tagline:
      "Drag-and-drop / button / avatar / picture file uploader in six variants — wire onUpload to your media-service and call collectUploadCommitActions on form submit; never submit raw File objects from form state.",
    props: [
      {
        name: "variant",
        type: '"dropzone" | "button" | "picture-card" | "picture" | "avatar" | "avatar-crop"',
        defaultValue: '"dropzone"',
        description:
          "Controls the visual rendering mode. dropzone = large dashed drop area + file list; button = compact outline button + file list; picture-card = grid of 96×96 image thumbnails; picture = single image preview with change/remove actions; avatar = circular single-image picker; avatar-crop = avatar with an in-dialog crop step before the item is staged.",
      },
      {
        name: "value",
        type: "UploadFileItem[]",
        description:
          "Controlled list of file items. When provided the component is controlled — you own the state. Omit to run uncontrolled.",
      },
      {
        name: "defaultValue",
        type: "UploadFileItem[]",
        description:
          "Initial list of file items for uncontrolled usage. Ignored once value is provided.",
      },
      {
        name: "onChange",
        type: "(items: UploadFileItem[]) => void",
        description:
          "Fires every time the item list changes (add, remove, status transitions). In controlled mode this is your state setter.",
      },
      {
        name: "accept",
        type: "string",
        description:
          'MIME / extension accept string passed to the hidden <input type="file">. avatar/avatar-crop/picture/picture-card default to "image/*"; dropzone and button default to unrestricted.',
      },
      {
        name: "multiple",
        type: "boolean",
        description:
          "Allow multi-file selection. Auto-derived: false when maxCount is 1 (or when variant is avatar/avatar-crop/picture); otherwise true.",
      },
      {
        name: "maxCount",
        type: "number",
        description:
          "Hard upper bound on the number of items. avatar/avatar-crop/picture auto-default to 1. Once the limit is reached the add button is hidden (picture-card) or new picks replace the existing item.",
      },
      {
        name: "maxSizeBytes",
        type: "number",
        description:
          "Files larger than this byte limit are silently discarded before being added to the list. No built-in error message — show your own validation feedback if needed.",
      },
      {
        name: "disabled",
        type: "boolean",
        description:
          "Disables all interactive surfaces (drop zone, buttons). Visual opacity + pointer-events-none applied.",
      },
      {
        name: "removable",
        type: "boolean",
        defaultValue: "true",
        description:
          "Show the remove/delete control on each item. Set false to make uploads permanent within the session.",
      },
      {
        name: "onUpload",
        type: "(file: File, item: UploadFileItem) => Promise<{ mediaId: string; previewUrl?: string }>",
        description:
          "Called immediately after a file is picked (before form submit). Transitions the item to status='uploading', then 'done' on resolve or 'error' on reject. Wire this to your media-service issue/PUT/complete cycle. If omitted files stay in status='idle' and the raw File object remains in item.file.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra CSS class applied to the outer wrapper div.",
      },
      {
        name: "children",
        type: "React.ReactNode",
        description:
          "Custom button label for variant='button'. Falls back to the i18n 'Upload file' string.",
      },
      {
        name: "onValueChange",
        type: "(items: UploadFileItemProp[]) => void",
        description: "Fires with the current file list.",
      },
    ],
    usage: [
      "DO provide onUpload to auto-upload on pick. The callback must return { mediaId, previewUrl? } — the component transitions item.status through uploading → done/error automatically. Without onUpload the File object sits in item.file until you manually process it.",
      "DO call collectUploadCommitActions(items) on form submit to get { deleteMediaIds, promoteMediaIds } for your media-service. Never send raw File objects or blob URLs to the server — those are local-only.",
      "DO use createUploadItem(file) to build UploadFileItem objects when pre-populating value from server data (e.g. edit forms). Set status='done' and mediaId on existing server media so the draft/undo machinery tracks them correctly.",
      "DON'T put an Upload inside a form expecting it to serialize files via a native form submission — the hidden input is sr-only and not named. Upload is a controlled/uncontrolled React state component. Submit by reading items state and calling collectUploadCommitActions.",
      "Avatar/picture variants (maxCount=1) use internal soft-delete draft logic: removing an item marks it pendingDelete so the user can undo before committing. On form submit, collectUploadCommitActions converts pendingDelete → deleteMediaIds and done mediaIds → promoteMediaIds.",
      "For avatar-crop: a crop dialog opens after pick. The cropped Blob is staged as a new UploadFileItem. The original file never enters the list — only the cropped version is passed to onUpload.",
    ],
    useCases: [
      "Profile / user avatar editor: use variant='avatar-crop' so users can crop the image before upload; wire onUpload to your media-service; call collectUploadCommitActions on profile form submit to promote or delete.",
      "Invoice / document attachment list: use variant='dropzone' with accept='.pdf,.xlsx' and maxSizeBytes to let accountants drag-drop supporting documents; show the file list with status indicators below the drop zone.",
      "Product gallery (multiple images): use variant='picture-card' with maxCount to display a grid of thumbnails; each item gets an individual remove ✕ button; collectUploadCommitActions on product save.",
      "Single cover-image picker on a content form: use variant='picture' with maxCount=1 to show a preview rectangle with change/remove controls and undo-delete support.",
      "CSV / bulk-import button in an admin table header: use variant='button' with accept='.csv' and custom children label ('Import CSV') to keep the UI compact; process item.file in the onChange handler.",
      "Inline document replacement on an accounting record (replace, not append): use variant='avatar' (single-slot logic) or picture; onUpload returns the new mediaId; collectUploadCommitActions delivers replacesMediaId → deleteMediaIds.",
    ],
    related: [
      "Input (type='file') — never hand-roll a raw file input; use Upload instead. Upload provides drag-drop, preview, upload lifecycle, and soft-delete draft.",
      "Avatar (display-only) — the godx-ui Avatar component renders a user's existing image; use Upload variant='avatar' or 'avatar-crop' when you need the user to change it.",
      "DataTable — unrelated to Upload but both appear together in bulk-import flows: Upload (button variant) triggers the import, DataTable shows the result.",
    ],
    example: `import { useState } from "react";
import { Upload, type UploadFileItem, collectUploadCommitActions } from "@godxjp/ui/data-entry";

// Example: avatar picker with server upload
export function AvatarUploadForm() {
  const [items, setItems] = useState<UploadFileItem[]>([]);

  async function handleUpload(file: File, _item: UploadFileItem) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/media/upload", { method: "POST", body: fd });
    const { mediaId, previewUrl } = await res.json();
    return { mediaId, previewUrl };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { deleteMediaIds, promoteMediaIds } = collectUploadCommitActions(items);
    // Send to your API — never send raw File objects
    console.log({ deleteMediaIds, promoteMediaIds });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Upload
        variant="avatar-crop"
        value={items}
        onValueChange={setItems}
        onUpload={handleUpload}
        maxSizeBytes={5 * 1024 * 1024}
      />
      <button type="submit">Save Profile</button>
    </form>
  );
}

// Example: multi-file dropzone
export function DocumentUploadDropzone() {
  const [items, setItems] = useState<UploadFileItem[]>([]);

  return (
    <Upload
      variant="dropzone"
      value={items}
      onValueChange={setItems}
      accept=".pdf,.xlsx"
      maxCount={10}
      maxSizeBytes={20 * 1024 * 1024}
      onUpload={async (file) => {
        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: Object.assign(new FormData(), { file }),
        });
        return res.json();
      }}
    />
  );
}`,
    storyPath: "data-entry/Upload.stories.tsx",
    rules: [3, 23],
  },
  {
    name: "UploadCropDialog",
    group: "data-entry",
    tagline:
      'Modal crop dialog for a single image file — always controlled (open + file + onConfirm required); do NOT use standalone when Upload variant="avatar-crop" already embeds it.',
    props: [
      {
        name: "open",
        type: "boolean",
        required: true,
        description:
          "Controls dialog visibility. Drive this with useState; the component never auto-opens.",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        required: true,
        description:
          "Called when the dialog requests close (Cancel button or overlay click). Set your open state to false here.",
      },
      {
        name: "file",
        type: "File | null",
        required: true,
        description:
          "The raw File object to crop. An object URL is created internally and revoked on cleanup. Pass null when no file is selected (dialog renders empty).",
      },
      {
        name: "onConfirm",
        type: "(cropped: File) => void",
        required: true,
        description:
          "Called with the cropped result — always a JPEG File (256x256, quality 0.92) regardless of the original format. The dialog closes itself after calling this.",
      },
    ],
    usage: [
      "DO pass a File object selected by the user (e.g. from an <input type='file'> or drag-drop handler) to `file`; the dialog creates and revokes its own object URL — never create one yourself before passing.",
      "DO close the dialog in onOpenChange: `onOpenChange={(open) => !open && setCropFile(null)}` — always clear cropFile state on close to avoid a stale image on the next open.",
      "DO handle the cropped File in onConfirm and then upload or store it; the output is always image/jpeg 256×256 named `<originalName>.jpg`.",
      "DON'T use UploadCropDialog directly if you are already using `<Upload variant='avatar-crop'>` — that variant already embeds UploadCropDialog internally. Using both will double-mount the dialog.",
      "DON'T try to control the zoom slider from outside — scale state is fully internal; the user controls zoom in-dialog via a Slider (1–2.5×, step 0.05).",
      "DON'T submit the dialog's output File as a form field directly; pass it to your upload handler (e.g. onUpload prop on Upload, or a manual FormData POST), since File objects cannot survive a standard HTML form serialisation.",
    ],
    useCases: [
      "Avatar / profile photo upload flow: show a file picker, pass the chosen File to UploadCropDialog, upload the cropped 256×256 JPEG to the server on confirm.",
      "Admin user management: let admins set or replace a team member's avatar with consistent square crop instead of accepting arbitrary-shaped originals.",
      "Legal-entity logo upload in an accounting app: enforce a square, web-ready JPEG from any source image before storing it as the entity's icon.",
      "Any single-image form field that needs browser-side crop before upload — avoids a round-trip to a server-side image processor.",
      "Building a custom avatar picker UI on top of the godx-ui Upload primitives when the built-in variant='avatar-crop' does not fit your layout.",
    ],
    related: [
      "Upload (variant='avatar-crop') — the preferred way to get crop-on-upload for avatars; it wraps UploadCropDialog automatically. Use UploadCropDialog directly only when you need a custom file-picking trigger or a non-avatar crop flow.",
      "Upload (variant='avatar') — same circular avatar UI without the crop step; the file is used as-is.",
      "Upload (variant='picture') — rectangular single-image upload without crop; no dialog.",
      "Upload (variant='picture-card') — multi-image grid upload without crop.",
    ],
    example: `{\`import { useState } from "react";
import { UploadCropDialog } from "@godxjp/ui/upload"; // internal — prefer Upload variant="avatar-crop" instead

export function AvatarField() {
  const [cropFile, setCropFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCropFile(file);
    e.target.value = ""; // reset so re-selecting same file fires onChange
  };

  const handleConfirm = (cropped: File) => {
    // cropped is always image/jpeg 256×256
    const form = new FormData();
    form.append("avatar", cropped);
    fetch("/api/avatar", { method: "POST", body: form });
  };

  return (
    <>
      <input type="file" accept="image/*" onValueChange={handleFileChange} />
      <UploadCropDialog
        open={cropFile !== null}
        onOpenChange={(open) => { if (!open) setCropFile(null); }}
        file={cropFile}
        onConfirm={handleConfirm}
      />
    </>
  );
}\`}`,
    storyPath: "data-entry/UploadCropDialog.stories.tsx",
    rules: [3, 13, 23],
  },
  {
    name: "ColorPicker",
    group: "data-entry",
    tagline:
      "Native color-swatch picker with an optional editable hex input — always pass a valid 3- or 6-digit hex `value`; invalid hex is silently ignored and the previous value is restored.",
    props: [
      {
        name: "value",
        type: "string",
        defaultValue: '"#2563eb"',
        description:
          "The current hex color string (3- or 6-digit, with leading #). Component auto-prepends # if missing. Invalid hex values are discarded and the previous valid value is kept.",
      },
      {
        name: "onChange",
        type: "(hex: string) => void",
        defaultValue: "undefined",
        description:
          "Called with the normalized, validated hex string whenever the user commits a new color — via the native swatch picker or by pressing Enter / blurring the hex input. Not called for invalid hex drafts.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "undefined",
        description:
          "Disables both the swatch input and the hex text input, preventing all user interaction.",
      },
      {
        name: "showHexInput",
        type: "boolean",
        defaultValue: "true",
        description:
          "When true (default), renders an editable godx-ui Input alongside the swatch that shows the current hex value and lets the user type a hex string. Set to false for a compact swatch-only control.",
      },
      {
        name: "className",
        type: "string",
        defaultValue: "undefined",
        description:
          "Extra CSS class(es) applied to the root wrapper div. Use for layout sizing; avoid overriding design-token colours.",
      },
      {
        name: "id",
        type: "string",
        defaultValue: "undefined",
        description:
          "DOM id applied to the hidden native <input type='color'>. Pass the FormField id here so the label's htmlFor targets this control correctly.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Fires with the committed hex string.",
      },
    ],
    usage: [
      "DO wrap in FormField when a label or validation message is needed — pass the same id to both FormField and ColorPicker so htmlFor wires up correctly: `<FormField id='brand' label='Brand color'><ColorPicker id='brand' value={v} onValueChange={setV} /></FormField>`.",
      "DO use controlled mode (value + onChange) — there is no defaultValue/uncontrolled path; always supply value.",
      "DON'T pass an invalid or empty string to value — the component will flash the invalid color on the preview swatch. Always initialize state to a valid 3- or 6-digit hex (e.g. '#2563eb').",
      "The hex Input is a live draft field — onChange is NOT called until the user presses Enter or blurs; only then is the value validated and the parent notified. Do not rely on onChange firing on every keystroke.",
      "Set showHexInput={false} only for compact/inline contexts (icon pickers, table cells) where space is tight and keyboard hex entry is not needed.",
      "NEVER hand-roll a color picker with raw <input type='color'> — always use this component; it normalizes hex, debounces draft state, and respects the design-token control styles.",
    ],
    useCases: [
      "Brand / campaign color selection in settings or campaign creation forms where users need to pick or type an exact hex value.",
      "Invoice or document theme customization — letting users pick accent colors that are stored and applied to PDF output.",
      "Accounting dashboard category tagging — assigning a color code to GL account categories or chart-of-accounts nodes for visual grouping.",
      "Product or inventory label colors in admin panels where a compact swatch (showHexInput={false}) fits inside a table cell or sidebar.",
      "Design-token or CSS variable editor pages where the user needs precise hex entry alongside a visual swatch preview.",
      "User-profile or team avatar color personalization forms.",
    ],
    related: [
      "Input — use for plain text/number entry; use ColorPicker when the value is specifically a color hex code and you want a visual swatch.",
      "Select / SearchSelect — use for choosing from a fixed palette of named colors (e.g. 'Red', 'Blue'); use ColorPicker for freeform hex color entry.",
    ],
    example: `import { useState } from "react";
import { ColorPicker, FormField } from "@godxjp/ui/data-entry";

export function BrandColorField() {
  const [color, setColor] = useState("#2563eb");

  return (
    <FormField id="brand-color" label="Brand color" className="max-w-xs">
      <ColorPicker
        id="brand-color"
        value={color}
        onValueChange={setColor}
      />
    </FormField>
  );
}

// Compact swatch-only variant (no hex input)
export function SwatchOnly() {
  const [color, setColor] = useState("#16a34a");
  return <ColorPicker value={color} onValueChange={setColor} showHexInput={false} />;
}

// Disabled state
export function DisabledColor() {
  return <ColorPicker value="#6b7280" disabled />;
}`,
    storyPath: "data-entry/ColorPicker.stories.tsx",
    rules: [2, 3, 6, 13],
  },
  {
    name: "Slider",
    group: "data-entry",
    tagline:
      "Numeric range slider (Radix Slider) — value/defaultValue must be number[], not a plain number.",
    props: [
      {
        name: "value",
        type: "number[]",
        description:
          "Controlled value. Must be an array — single-thumb: [50], dual-thumb (range): [20,80]. Drives thumb count.",
      },
      {
        name: "defaultValue",
        type: "number[]",
        description:
          "Uncontrolled initial value. Must be an array. Defaults to [min, max] (dual-thumb) when neither value nor defaultValue is provided.",
      },
      {
        name: "min",
        type: "number",
        defaultValue: "0",
        description: "Minimum value of the range.",
      },
      {
        name: "max",
        type: "number",
        defaultValue: "100",
        description: "Maximum value of the range.",
      },
      {
        name: "step",
        type: "number",
        defaultValue: "1",
        description: "Step increment between values.",
      },
      {
        name: "minStepsBetweenThumbs",
        type: "number",
        defaultValue: "0",
        description: "Minimum number of steps between two thumbs when using a range slider.",
      },
      {
        name: "onValueChange",
        type: "(value: number[]) => void",
        description:
          "Fires on every drag move. Receives the full number[] of current thumb values.",
      },
      {
        name: "onValueCommit",
        type: "(value: number[]) => void",
        description:
          "Fires only when the user releases the thumb (pointer-up or key-up). Prefer for expensive operations.",
      },
      {
        name: "orientation",
        type: "'horizontal' | 'vertical'",
        defaultValue: "'horizontal'",
        description: "Layout direction of the slider track.",
      },
      {
        name: "dir",
        type: "'ltr' | 'rtr'",
        description: "Text direction. Affects which end is the minimum.",
      },
      {
        name: "inverted",
        type: "boolean",
        defaultValue: "false",
        description: "Invert the track so the filled range is on the opposite side.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables all thumb interaction.",
      },
      {
        name: "name",
        type: "string",
        description:
          "HTML form field name. Radix submits one hidden input per thumb when this is set — use for native form submission.",
      },
      {
        name: "form",
        type: "string",
        description: "Associates the slider with a form by id, same as the HTML form attribute.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes applied to the root element.",
      },
    ],
    usage: [
      "DO: Pass value/defaultValue as a number array — single thumb: `value={[50]}`, range: `value={[20, 80]}`. Passing a plain number will break rendering.",
      "DO: Use `onValueChange` for live UI feedback and `onValueCommit` for expensive side-effects (API calls, heavy computations) — commit fires only on pointer/key release.",
      "DO: Set `name` when inside a native `<form>` — Radix emits one hidden `<input>` per thumb automatically, no extra wiring needed.",
      "DON'T: Omit both value and defaultValue if you want a single-thumb slider — the component defaults to dual-thumb (renders [min, max]) when neither is provided. Always pass `defaultValue={[0]}` or `value={[val]}` for single-thumb.",
      "DON'T: Hand-roll Track/Range/Thumb sub-parts — the godxjp-ui Slider composes them internally. Just use `<Slider />` as a single leaf element.",
      "DO: For a11y supply `aria-label` or `aria-labelledby` on the Slider root when there is no visible `<label>` — Radix forwards it to each thumb span.",
    ],
    useCases: [
      "Budget / price-range filter: dual-thumb range slider (`value={[minPrice, maxPrice]}`) for accounting invoice list filtering by amount.",
      "Single numeric setting: audio volume, zoom level, or confidence threshold — single-thumb (`defaultValue={[50]}`) with a live readout next to it.",
      "Percentage allocation: splitting a budget across categories with `step={5}` and `min={0}` `max={100}`.",
      "Date-range scrubber over a fixed window (e.g. fiscal quarters) — map quarter index to thumb values, display labels above the track.",
      "Risk / priority dial in a form (`name='priority'`) submitted natively without JavaScript form libraries.",
      "Read-only visual indicator — pass `disabled` with a controlled `value` to show a progress-style bar that cannot be interacted with.",
    ],
    related: [
      "Progress — use Progress (not a disabled Slider) to show read-only progress; Slider with disabled is semantically a control, not a status indicator.",
      "Input (type number) — use Input for free-form numeric entry; use Slider when the range is bounded and dragging is the expected UX.",
      "Switch — for boolean on/off; Slider is for continuous or stepped numeric ranges.",
      "RangeField (if present) — check the MCP first; if a composed range-input field exists, prefer it over wiring two Slider thumbs manually.",
    ],
    example: `{\`import { Slider } from "@godxjp/ui/data-entry";
import { useState } from "react";

// Single-thumb controlled slider
function VolumeSlider() {
  const [volume, setVolume] = useState([70]);
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Volume: {volume[0]}%
      </label>
      <Slider
        value={volume}
        onValueChange={setVolume}
        min={0}
        max={100}
        step={1}
        aria-label="Volume"
      />
    </div>
  );
}

// Dual-thumb range slider (e.g. price filter)
function PriceRangeSlider() {
  const [range, setRange] = useState([2000, 8000]);
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Price: ¥{range[0].toLocaleString()} – ¥{range[1].toLocaleString()}
      </label>
      <Slider
        value={range}
        onValueChange={setRange}
        onValueCommit={(v) => console.log("committed", v)}
        min={0}
        max={10000}
        step={500}
        minStepsBetweenThumbs={1}
        aria-label="Price range"
      />
    </div>
  );
}

// Native form submission (no JS form library needed)
function FormSlider() {
  return (
    <form method="post" action="/settings">
      <Slider name="priority" defaultValue={[50]} min={0} max={100} step={10} />
      <button type="submit">Save</button>
    </form>
  );
}\`}`,
    storyPath: "data-entry/Slider.stories.tsx",
    rules: [3, 6, 31],
  },
  {
    name: "Calendar",
    group: "data-entry",
    tagline:
      "A styled react-day-picker grid for picking single dates, multiple dates, or date ranges — always embed it inside a Popover for full date-picker UX; use DatePicker or DateRangePicker instead when you need a form-submittable input.",
    props: [
      {
        name: "mode",
        type: "'single' | 'multiple' | 'range' | undefined",
        description:
          "Selection mode. 'single' picks one day, 'multiple' picks several, 'range' picks a from/to span. Omit or set undefined for a display-only calendar with no selection.",
      },
      {
        name: "selected",
        type: "Date | Date[] | DateRange | undefined",
        description:
          "Controlled selected value. Shape depends on mode: Date for 'single', Date[] for 'multiple', { from?: Date; to?: Date } for 'range'.",
      },
      {
        name: "onSelect",
        type: "(date: Date | Date[] | DateRange | undefined, triggerDate: Date, modifiers: Modifiers, e: MouseEvent) => void",
        description:
          "Callback fired when the user clicks a day. Receives the new selection, the clicked date, active modifiers, and the event.",
      },
      {
        name: "defaultMonth",
        type: "Date",
        description:
          "Uncontrolled initial month shown. For controlled month navigation use month + onMonthChange.",
      },
      {
        name: "month",
        type: "Date",
        description:
          "Controlled currently-displayed month. Pair with onMonthChange to drive navigation programmatically.",
      },
      {
        name: "onMonthChange",
        type: "(month: Date) => void",
        description: "Fired when the user navigates to a different month.",
      },
      {
        name: "numberOfMonths",
        type: "number",
        defaultValue: "1",
        description: "Number of month grids to show side-by-side.",
      },
      {
        name: "startMonth",
        type: "Date | undefined",
        description:
          "Earliest month reachable via navigation. Also constrains the dropdown range when captionLayout includes 'dropdown'.",
      },
      {
        name: "endMonth",
        type: "Date | undefined",
        description: "Latest month reachable via navigation.",
      },
      {
        name: "disabled",
        type: "Matcher | Matcher[] | undefined",
        description:
          "Days to disable. Accepts a Date, Date[], { before: Date }, { after: Date }, { from: Date; to: Date }, { dayOfWeek: number[] }, or an array of any of these.",
      },
      {
        name: "hidden",
        type: "Matcher | Matcher[] | undefined",
        description: "Days to hide entirely from the grid.",
      },
      {
        name: "showOutsideDays",
        type: "boolean",
        defaultValue: "true",
        description:
          "Show greyed-out days from adjacent months. godx-ui defaults this to true (overrides react-day-picker's false default).",
      },
      {
        name: "showWeekNumber",
        type: "boolean",
        defaultValue: "false",
        description: "Show ISO/locale week-number column on the left.",
      },
      {
        name: "fixedWeeks",
        type: "boolean",
        description: "Always render 6 weeks per month, padding with days from the next month.",
      },
      {
        name: "captionLayout",
        type: "'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years'",
        defaultValue: "'label'",
        description:
          "Caption area layout. 'dropdown' shows month/year select dropdowns for faster large-range navigation.",
      },
      {
        name: "locale",
        type: "Partial<DayPickerLocale> | undefined",
        description:
          "date-fns locale object imported from 'react-day-picker/locale'. Defaults to enUS. Pass ja, vi, etc. for i18n.",
      },
      {
        name: "weekStartsOn",
        type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined",
        description:
          "Day index (0=Sun) for the first column of the week grid. Overrides locale default.",
      },
      {
        name: "modifiers",
        type: "Record<string, Matcher | Matcher[] | undefined>",
        description:
          "Custom named modifiers applied to matched days. Pair with modifiersClassNames or modifiersStyles to style them.",
      },
      {
        name: "modifiersClassNames",
        type: "ModifiersClassNames",
        description: "CSS class names keyed by modifier name.",
      },
      {
        name: "footer",
        type: "React.ReactNode | string",
        description:
          "Content rendered below the grid as a live ARIA region. Use a string to communicate selection status to screen readers.",
      },
      {
        name: "autoFocus",
        type: "boolean",
        description:
          "Focus the first selected day (or today) when the calendar mounts — recommended when opening inside a Popover.",
      },
      {
        name: "today",
        type: "Date",
        description:
          "Override the 'today' date used for the today modifier and default navigation. Defaults to new Date().",
      },
      {
        name: "className",
        type: "string",
        description:
          "Extra class added to the root wrapper element (adds to the built-in p-3 padding).",
      },
      {
        name: "classNames",
        type: "Partial<ClassNames>",
        description:
          "Override individual part class names (months, weekday, day, selected, today, range_start, range_end, range_middle, disabled, outside, etc.). Merged with godx-ui defaults.",
      },
      {
        name: "components",
        type: "Partial<CustomComponents>",
        description:
          "Swap out internal sub-components (Chevron is already replaced by lucide icons). Use for advanced custom rendering.",
      },
      {
        name: "animate",
        type: "boolean",
        description: "Animate month-to-month navigation transitions (react-day-picker >=9.6).",
      },
      {
        name: "dir",
        type: "string",
        description: "'ltr' (default) or 'rtl' for right-to-left layouts.",
      },
      {
        name: "aria-label",
        type: "string",
        description:
          "aria-label on the container. Provide a meaningful label when the calendar is not described by a visible heading.",
      },
      {
        name: "role",
        type: "'application' | 'dialog' | undefined",
        description:
          "ARIA role for the container element. Use 'dialog' when rendering inside a modal Popover.",
      },
      {
        name: "required",
        type: "boolean | undefined",
        description:
          "When true the user cannot deselect the currently selected day (mode must also be set).",
      },
      {
        name: "pagedNavigation",
        type: "boolean",
        description:
          "When numberOfMonths > 1, advance all visible months at once instead of one at a time.",
      },
      {
        name: "reverseMonths",
        type: "boolean",
        description:
          "Render months newest-first (right-to-left reading order) when numberOfMonths > 1.",
      },
      {
        name: "hideNavigation",
        type: "boolean",
        description: "Hide the prev/next navigation buttons without disabling keyboard navigation.",
      },
      {
        name: "disableNavigation",
        type: "boolean",
        description:
          "Disable month navigation entirely (buttons hidden and keyboard navigation locked).",
      },
      {
        name: "hideWeekdays",
        type: "boolean",
        description: "Hide the row of weekday abbreviation headers (Mon, Tue, ...).",
      },
      {
        name: "ISOWeek",
        type: "boolean",
        description:
          "Use ISO week numbering (Monday first week, ignores weekStartsOn and firstWeekContainsDate).",
      },
    ],
    usage: [
      "DO set mode explicitly ('single', 'multiple', 'range') — omitting it renders a display-only grid with no selection. The value passed to selected and the argument shape of onSelect both depend on mode.",
      "DO embed Calendar inside a Popover + PopoverContent when building a date-picker UI (set PopoverContent className='w-auto p-0'). For form-submittable single-date or range inputs prefer the higher-level DatePicker / DateRangePicker components — they own the input, icon, locale wiring, and ISO form submission natively.",
      "DO pass a locale object imported from 'react-day-picker/locale' (e.g. import { ja } from 'react-day-picker/locale') for i18n — weekday names, month names, and first-day-of-week all come from the locale.",
      "DO use the disabled prop with Matcher objects ({ before: minDate }, { after: maxDate }, { dayOfWeek: [0, 6] }) to restrict selectable days — never render your own disabled overlay on top.",
      "DON'T add inner padding on the wrapping PopoverContent — Calendar already has p-3 via its className. Use PopoverContent className='w-auto p-0' to avoid double padding.",
      "DON'T hand-roll a calendar grid — Calendar wraps react-day-picker which is keyboard-navigable, ARIA-annotated, and screen-reader friendly out of the box. Provide a footer string for screen-reader status announcements when the selection changes.",
    ],
    useCases: [
      "Inline date picker within a form section where the calendar grid must always be visible (e.g., a booking page or a date-of-issue field on an invoice creation form).",
      "Date range selection inside a Popover triggered by a filter button on an accounting report page (use mode='range', pass selected={dateRange}, onSelect updates the filter state).",
      "Multi-date selection for picking recurring reminder dates or batch-action target dates (mode='multiple').",
      "Custom calendar with highlighted days (e.g., marking invoice due dates or shipment ETDs with a custom modifier + modifiersClassNames) overlaid on a standard single-select grid.",
      "Month navigator with year/month dropdowns for jumping to a historical accounting period quickly (captionLayout='dropdown', startMonth set to earliest fiscal year).",
      "Display-only calendar (no mode set) showing booked or blocked dates using the modifiers prop with read-only styling, embedded in a dashboard card.",
    ],
    related: [
      "DatePicker — the complete single-date form control (typeable ISO input + calendar icon + Popover). Use DatePicker instead of Calendar when you need a form-submittable field with an input box.",
      "DateRangePicker — the complete date-range form control (two ISO inputs + calendar icon + Popover). Use DateRangePicker instead of Calendar when you need from/to form fields.",
      "Popover / PopoverContent — the shell you must provide when you want Calendar inside a trigger. Set PopoverContent className='w-auto p-0' to avoid double padding.",
    ],
    example: `import { useState } from "react";
import { Calendar } from "@godxjp/ui/data-entry";
import { ja } from "react-day-picker/locale";

// --- Single-date example (controlled) ---
export function InvoiceDateCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      locale={ja}
      disabled={{ before: new Date(2024, 0, 1) }}
      footer={date ? \`選択日: \${date.toLocaleDateString("ja-JP")}\` : "日付を選択してください"}
      aria-label="発行日カレンダー"
    />
  );
}

// --- Range example inside a Popover (mirrors DateRangePicker internals) ---
import { Popover, PopoverContent, PopoverTrigger } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import type { DateRange } from "react-day-picker";

export function ReportRangeFilter() {
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">期間を選択</Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          locale={ja}
          numberOfMonths={2}
          disabled={{ after: new Date() }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}`,
    storyPath: "data-entry/Calendar.stories.tsx",
    rules: [3, 5, 6, 23],
  },
  {
    name: "Command",
    group: "data-entry",
    tagline:
      "Accessible, keyboard-navigable command palette / combobox list built on cmdk — always pair CommandInput inside its own wrapper div, never render items outside CommandList.",
    props: [
      {
        name: "label",
        type: "string",
        description:
          "Accessible label for the command menu. Not shown visually — used by screen readers.",
      },
      {
        name: "shouldFilter",
        type: "boolean",
        defaultValue: "true",
        description:
          "Set to false to disable automatic filtering and sorting. When false, you must conditionally render matching items yourself based on the search query.",
      },
      {
        name: "filter",
        type: "(value: string, search: string, keywords?: string[]) => number",
        description:
          "Custom filter function. Returns a score between 0 (hidden) and 1 (best match). Defaults to command-score library scoring.",
      },
      {
        name: "defaultValue",
        type: "string",
        description: "Default selected item value on initial render (uncontrolled).",
      },
      {
        name: "value",
        type: "string",
        description: "Controlled state of the currently selected item value.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Called when the selected item changes.",
      },
      {
        name: "loop",
        type: "boolean",
        defaultValue: "false",
        description:
          "When true, keyboard arrow-key navigation wraps from last item back to first and vice versa.",
      },
      {
        name: "disablePointerSelection",
        type: "boolean",
        defaultValue: "false",
        description: "When true, pointer events cannot select items — keyboard only.",
      },
      {
        name: "vimBindings",
        type: "boolean",
        defaultValue: "true",
        description: "Set to false to disable ctrl+n/j/p/k vim-style navigation shortcuts.",
      },
      {
        name: "className",
        type: "string",
        description: "Additional CSS classes merged onto the root div via cn().",
      },
      {
        name: "CommandInput.value",
        type: "string",
        description: "Controlled search string for the input.",
      },
      {
        name: "CommandInput.onValueChange",
        type: "(search: string) => void",
        description: "Called when the search input text changes.",
      },
      {
        name: "CommandList.label",
        type: "string",
        description: "Accessible label for the list of suggestions. Not shown visually.",
      },
      {
        name: "CommandItem.value",
        type: "string",
        description:
          "Unique value for this item. If omitted, inferred from children textContent — must be stable; provide explicitly when text changes between renders.",
      },
      {
        name: "CommandItem.onSelect",
        type: "(value: string) => void",
        description: "Called when this item is selected via click or keyboard.",
      },
      {
        name: "CommandItem.disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Prevents this item from being selected.",
      },
      {
        name: "CommandItem.keywords",
        type: "string[]",
        description:
          "Additional keywords matched during filtering that are not part of the visible label.",
      },
      {
        name: "CommandItem.forceMount",
        type: "boolean",
        defaultValue: "false",
        description: "When true, renders this item regardless of filtering results.",
      },
      {
        name: "CommandGroup.heading",
        type: "React.ReactNode",
        description: "Visible heading rendered above items in this group.",
      },
      {
        name: "CommandGroup.value",
        type: "string",
        description: "Required unique identifier for the group when no heading is provided.",
      },
      {
        name: "CommandGroup.forceMount",
        type: "boolean",
        defaultValue: "false",
        description: "When true, renders this group regardless of filtering.",
      },
      {
        name: "CommandEmpty",
        type: "React.ReactNode (children)",
        description:
          "Renders automatically only when there are no matching results. Place inside CommandList.",
      },
    ],
    usage: [
      "DO compose the full tree: Command > CommandInput + CommandList > (CommandEmpty | CommandGroup > CommandItem | CommandItem). Every interactive element must live inside CommandList; items outside it are invisible to the keyboard engine.",
      "DO set shouldFilter={false} and manage filtering yourself when the options list comes from a server/async source (e.g. SearchSelect pattern). With shouldFilter=true the default client-side scoring runs over all rendered items automatically.",
      "DO always provide a stable explicit value prop on CommandItem when the item's text content can change between renders — relying on inferred textContent with dynamic labels causes selection bugs.",
      "DO include CommandEmpty inside CommandList to show a no-results message. It renders automatically only when the filtered count is zero; do not conditionally render it yourself.",
      "DON'T use CommandInput as a standalone search input — it is only meaningful inside a Command root (the root manages shared filter state). For a standalone search field use SearchInput instead.",
      "DON'T hand-roll keyboard navigation on a list of items; Command handles arrow keys, Enter, Escape, Home/End, and vim bindings. Adding your own keyDown handlers on top creates conflicts — use onSelect on CommandItem for selection logic.",
    ],
    useCases: [
      "Command palette / global action launcher (Cmd+K menu): wraps Command + CommandInput + grouped CommandItems for quick navigation across pages or actions.",
      "Popover-based combobox with server-side search: Command with shouldFilter={false} inside a Popover, managing the query state externally and filtering options before rendering — this is exactly how SearchSelect is built internally.",
      "Tree/cascader search panel: inject Command + CommandInput as a search header above a custom scroll area (no CommandList needed for the tree body) to get a styled, accessible search input — as used by CascaderSelect and TreeSelect.",
      "Multi-group option picker: use CommandGroup with heading to visually separate option categories (e.g. 'Accounts', 'Contacts', 'Documents') inside one dropdown with a single search box.",
      "Keyboard-first admin shortcut bar: embed Command with loop={true} and vimBindings={true} in a persistent sidebar for power-user keyboard navigation without page reloads.",
    ],
    related: [
      "SearchSelect — higher-level compound component that composes Command + Popover + server search; use SearchSelect for a fully managed async combobox instead of building your own with Command.",
      "Select — simple dropdown for static option lists without type-to-filter; use Select when there are fewer than ~10 options and no search is needed.",
      "SearchInput — standalone text input with a search icon; use SearchInput for filtering visible page content (tables, lists) not for selecting from a command menu.",
      "CommandInput (sub-part) — the styled search input that only works inside a Command root; never use it alone as a general search field.",
    ],
    example: `{\`import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@godxjp/ui/data-entry";

function AccountQuickPick({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <Command label="Quick pick account" loop>
      <CommandInput placeholder="Search accounts…" />
      <CommandList>
        <CommandEmpty>No accounts found.</CommandEmpty>
        <CommandGroup heading="Revenue">
          <CommandItem value="4001" onSelect={onSelect}>
            Sales Revenue
          </CommandItem>
          <CommandItem value="4002" onSelect={onSelect}>
            Service Revenue
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Expenses">
          <CommandItem value="6001" onSelect={onSelect}>
            Rent Expense
          </CommandItem>
          <CommandItem value="6002" disabled onSelect={onSelect}>
            Deprecated Account
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}\`}`,
    storyPath: "data-entry/Command.stories.tsx",
    rules: [2, 3, 6, 23],
  },
  {
    name: "CheckboxGroup",
    group: "data-entry",
    tagline:
      "Multi-select checkbox list from an options array or manual children — use `options` prop for the data-driven path, never hand-roll individual Checkbox items in a group.",
    props: [
      {
        name: "options",
        type: "ChoiceOptionProp[]",
        description:
          "Data-driven mode: array of { label, value, disabled?, description? }. When provided and non-empty, renders all checkboxes automatically. When omitted, renders `children` instead.",
      },
      {
        name: "value",
        type: "string[]",
        description:
          "Controlled selected values. When provided, the component is controlled and won't manage state internally — you must handle onChange to update it.",
      },
      {
        name: "defaultValue",
        type: "string[]",
        defaultValue: "[]",
        description:
          "Uncontrolled initial selection. Use this instead of `value` when you don't need to control state externally.",
      },
      {
        name: "onChange",
        type: "(value: string[]) => void",
        description:
          "Called with the full updated selection array whenever any checkbox is toggled. Works in both controlled and uncontrolled modes.",
      },
      {
        name: "orientation",
        type: '"vertical" | "horizontal"',
        defaultValue: '"vertical"',
        description:
          "Layout direction of the checkbox items. Vertical stacks items; horizontal places them in a row.",
      },
      {
        name: "disabled",
        type: "boolean",
        description:
          "Disables the entire group. Individual options can also set their own disabled flag via ChoiceOptionProp.disabled.",
      },
      {
        name: "name",
        type: "string",
        description:
          "HTML form name applied to each underlying checkbox input. Required for native form submission — all checkboxes share the same name so the form collects multiple values.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra CSS class on the group container div.",
      },
      {
        name: "children",
        type: "React.ReactNode",
        description:
          "Manual children mode: used when `options` is omitted or empty. Render Checkbox items directly as children. You are responsible for composing each Checkbox with a Field for correct label/description layout.",
      },
      {
        name: "onValueChange",
        type: "(value: string[]) => void",
        description: "Fires with the checked values array.",
      },
    ],
    usage: [
      "DO use the `options` prop for any data-driven list — it auto-generates IDs, handles checked state, and wires up Field (label + description) for each item. NEVER hand-roll individual `<Checkbox>` elements inside a loop when you have an options array.",
      "DO pass `name` when inside an HTML form so each checkbox submits its value under the same field name, giving the server a multi-value array. Without `name`, native form submission silently drops all values.",
      "Controlled vs uncontrolled: pass `value` + `onChange` together for controlled usage (e.g. react-hook-form). Pass `defaultValue` alone for uncontrolled usage. Do NOT mix both — if `value` is provided, `defaultValue` is ignored and onChange must update value externally or the UI freezes.",
      "Each option's `description` renders as a secondary line below its label via Field — use it for help text or sub-copy; keep `label` short.",
      "Group-level `disabled` disables all checkboxes. Individual `options[n].disabled` disables only that item. Both can coexist.",
      'DO NOT wrap this inside another ARIA group or fieldset without removing the built-in `role="group"` — it already provides the correct grouping semantics. Pair the group with a `<legend>` or visible heading for a11y.',
    ],
    useCases: [
      "Permission / role selectors in admin forms — e.g. 'Select applicable roles: Admin, Editor, Viewer' where users can pick multiple.",
      "Filter panels — e.g. 'Filter by status: Active, Pending, Archived' with horizontal orientation for compact toolbar layout.",
      "Feature flag or settings toggles where multiple independent boolean flags share a label/description pair, loaded from a config array.",
      "Multi-category tagging forms — e.g. 'Tag this invoice: Recurring, Billable, Internal' driven by an options array fetched from an API.",
      "Onboarding checklists or multi-step preference screens where selections persist across steps via controlled `value`.",
      "Accounting module: select which cost centres or account codes apply to a transaction, driven by a normalized options list.",
    ],
    related: [
      "RadioGroup — use when only ONE selection is allowed at a time (mutually exclusive). CheckboxGroup = multiple, RadioGroup = single.",
      "Checkbox (standalone) — use a bare `Checkbox` for a single boolean toggle (e.g. 'I agree to terms'). Use CheckboxGroup when you have 2+ related choices.",
      "Checkbox.Group — alias; the same component is also accessible as `Checkbox.Group` (the Checkbox export attaches CheckboxGroup as `.Group`). Both are equivalent — prefer the named `CheckboxGroup` import for clarity in larger files.",
      "Switch / Field — for a single binary on/off toggle with immediate effect (not a form submission value). Do not use CheckboxGroup to fake toggle rows.",
      "Select (multi) — for a long list (10+ items) where space is limited; CheckboxGroup is better for ≤10 visible options that benefit from scanning all at once.",
    ],
    example: `import { CheckboxGroup } from "@godxjp/ui/data-entry";
import { useState } from "react";

const PERMISSIONS = [
  { label: "View invoices", value: "invoices:read" },
  { label: "Create invoices", value: "invoices:write", description: "Includes editing and deleting" },
  { label: "Manage users", value: "users:manage", disabled: true },
];

// Uncontrolled — use defaultValue
export function PermissionsForm() {
  return (
    <form method="post">
      <CheckboxGroup
        name="permissions"
        options={PERMISSIONS}
        defaultValue={["invoices:read"]}
        orientation="vertical"
      />
    </form>
  );
}

// Controlled — use value + onChange
export function ControlledExample() {
  const [selected, setSelected] = useState<string[]>(["invoices:read"]);
  return (
    <CheckboxGroup
      name="permissions"
      options={PERMISSIONS}
      value={selected}
      onValueChange={setSelected}
    />
  );
}`,
    storyPath: "data-entry/CheckboxGroup.stories.tsx",
    rules: [3, 6, 23, 31],
  },
  {
    name: "Radio",
    group: "data-entry",
    tagline:
      "Radix-backed radio group with an options-array shorthand — always use Radio.Group, never a bare radio input.",
    props: [
      {
        name: "value",
        type: "string",
        description:
          "Controlled selected value. Must be paired with onValueChange to update state.",
      },
      {
        name: "defaultValue",
        type: "string",
        description:
          "Uncontrolled initial value. Use when you do not need to track selection in state.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description:
          "Callback fired when the user selects a different option. Required when value is controlled.",
      },
      {
        name: "options",
        type: "ChoiceOptionProp[]",
        description:
          "Declarative option list: { label: ReactNode; value: string; disabled?: boolean; description?: ReactNode }[]. When provided, Radio.Group renders each option as a labelled Field automatically. Omit to compose children manually.",
      },
      {
        name: "orientation",
        type: '"vertical" | "horizontal"',
        defaultValue: '"vertical"',
        description:
          "Layout direction for the option list. Vertical stacks options; horizontal lays them side by side.",
      },
      {
        name: "disabled",
        type: "boolean",
        description:
          "Disables the entire group when true. Individual options can also be disabled via options[].disabled.",
      },
      {
        name: "name",
        type: "string",
        description:
          "HTML form field name. Required for native form submission — Radix renders a hidden <input> with this name carrying the selected value.",
      },
      {
        name: "className",
        type: "string",
        description: "Additional CSS class applied to the group root.",
      },
      {
        name: "children",
        type: "React.ReactNode",
        description:
          "Manual composition fallback — used only when options is not provided. Render Radio.Item (+ Field wrapper) children directly inside Radio.Group.",
      },
    ],
    usage: [
      "DO use Radio.Group (not the bare Radio export) as the root — it wires up Radix context, keyboard navigation, and the hidden form input. A lone Radio.Item outside a Radio.Group has no context and will not function.",
      "DO prefer the options array API for static/data-driven option lists: pass options={[{ label, value, description?, disabled? }]} and Radio.Group renders each as a correctly-labelled Field automatically — no manual id/label wiring needed.",
      "DO pass name to Radio.Group when the selection must be submitted via a native HTML form. Radix injects a hidden <input name={name} value={selected}> so the value is picked up by FormData/fetch without extra wiring.",
      "DO use controlled mode (value + onValueChange) when the selection drives other UI (conditional fields, preview panels). Use defaultValue for fire-and-forget uncontrolled forms.",
      "DON'T hand-roll a label-plus-radio row with raw <input type='radio'> — use Radio.Group with options or compose Radio.Item inside Field for custom markup. Every option must be wrapped in Field (or equivalent) for the label htmlFor/id linkage.",
      "DON'T disable individual options inside the options array and ALSO set disabled on the group — group-level disabled wins and overrides all per-item disabled states.",
    ],
    useCases: [
      "Payment method selection (Credit Card / Bank Transfer / Invoice) on a checkout or invoice-creation form — mutually exclusive, 2-4 options, use options array + name for form submission.",
      "Account type picker (Asset / Liability / Equity / Revenue / Expense) on a chart-of-accounts create/edit page — use options with descriptions to explain each type.",
      "Report frequency chooser (Daily / Weekly / Monthly / Quarterly) in a scheduled-report settings panel — horizontal orientation when options are short labels.",
      "Tax regime selector on an entity or vendor profile form where exactly one option must always be active — controlled mode so adjacent fields can react to the selection.",
      "Approval workflow step type (Automatic / Manual / Conditional) in a workflow builder — use descriptions inside options to explain each mode without extra tooltip markup.",
      "Filter scope toggle (All entities / Current entity only) in an admin dashboard filter bar — horizontal orientation, no name needed (state managed in React, not submitted).",
    ],
    related: [
      "Checkbox.Group — use when users may select multiple options simultaneously; Radio.Group enforces single-selection only.",
      "Switch / Field — use for a single boolean on/off toggle (e.g. enable notifications); Radio.Group is for choosing one among three or more named options.",
      "Select — use when there are many options (5+) and vertical screen space is limited; Radio.Group is preferable for 2-4 short options where all choices should be visible at a glance.",
    ],
    example: `{\`import { Radio } from "@godxjp/ui/data-entry";

// --- Options-array API (recommended for most cases) ---
const PAYMENT_METHODS = [
  { label: "Credit Card", value: "card", description: "Charged immediately on save." },
  { label: "Bank Transfer", value: "bank" },
  { label: "Invoice", value: "invoice", disabled: true },
];

function PaymentMethodPicker() {
  const [method, setMethod] = React.useState("card");

  return (
    <Radio.Group
      name="payment_method"
      value={method}
      onValueChange={setMethod}
      options={PAYMENT_METHODS}
      orientation="vertical"
    />
  );
}

// --- Manual composition (when you need custom layout) ---
function CustomRadioGroup() {
  return (
    <Radio.Group name="account_type" defaultValue="asset">
      <Radio.Item id="opt-asset" value="asset" />
      {/* wrap each item in Field for label + description */}
    </Radio.Group>
  );
}\`}`,
    storyPath: "data-entry/Radio.stories.tsx",
    rules: [3, 6, 13, 23],
  },
  {
    name: "Popover",
    group: "data-display",
    tagline:
      "Radix-backed floating panel anchored to a trigger — always compose with PopoverTrigger + PopoverContent; never use a raw div overlay.",
    props: [
      {
        name: "open",
        type: "boolean",
        description: "Controls open state in controlled mode. Pair with onOpenChange.",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        defaultValue: "false",
        description: "Initial open state for uncontrolled usage.",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description:
          "Callback fired when the popover open state changes. Required when using controlled mode (open prop).",
      },
      {
        name: "modal",
        type: "boolean",
        defaultValue: "false",
        description:
          "When true, interaction outside the popover is blocked and focus is trapped inside (Radix Root prop).",
      },
      {
        name: "align",
        type: "'start' | 'center' | 'end'",
        defaultValue: '"center"',
        description:
          "PopoverContent prop. Horizontal alignment of the popover relative to the trigger.",
      },
      {
        name: "sideOffset",
        type: "number",
        defaultValue: "4",
        description:
          "PopoverContent prop. Distance in pixels between the popover panel and its anchor.",
      },
      {
        name: "side",
        type: "'top' | 'right' | 'bottom' | 'left'",
        defaultValue: '"bottom"',
        description:
          "PopoverContent prop. Which side of the trigger the panel prefers to open on (auto-flips on overflow).",
      },
      {
        name: "asChild",
        type: "boolean",
        defaultValue: "false",
        description:
          "PopoverTrigger prop. Merges trigger props onto the immediate child element (e.g. a Button) instead of rendering an extra DOM node. Strongly recommended to avoid a wrapping <button>.",
      },
      {
        name: "className",
        type: "string",
        description:
          "PopoverContent prop. Extra Tailwind classes merged onto the panel (default: w-72 p-4 rounded-md border shadow-md z-50).",
      },
    ],
    usage: [
      "DO compose: <Popover> → <PopoverTrigger asChild> → <Button/> and <PopoverContent>. All four parts are required for any popover to function; omitting PopoverTrigger or PopoverContent produces nothing.",
      "DO use asChild on PopoverTrigger when the trigger is already a Button or link — this avoids a nested <button><button> violation and extra DOM nesting.",
      "DO use controlled mode (open + onOpenChange) when external code must open/close the popover programmatically (e.g., form validation reveal, keyboard shortcut). For toggle-only interactions, uncontrolled (defaultOpen) is simpler.",
      "DO structure panel content with PopoverHeader > PopoverTitle + PopoverDescription for labelled panels. This is purely presentational but establishes the correct font-weight and muted-foreground on the description.",
      "DON'T hand-roll a floating div or use a CSS show/hide toggle — Popover provides portal rendering, focus trap, Escape-to-close, and ARIA automatically.",
      "DON'T place a Popover inside a Dialog without setting modal={false} on the Popover — nested modals conflict with Radix's focus management and produce stuck focus.",
    ],
    useCases: [
      "Advanced filter panel: a 'Filters' Button triggers a Popover containing filter inputs (date range, status selects); panel width overridden via className='w-96'.",
      "Row action menu overflow: when a DataTable row has too many actions for inline display, a Popover holds the secondary actions (Edit, Archive, Delete) without navigating away.",
      "Contextual help / tooltip-rich: a small '?' icon button opens a Popover with PopoverTitle + PopoverDescription explaining a form field — richer than a Tooltip but less intrusive than a Dialog.",
      "Inline record preview: clicking a reference number in an invoice list opens a Popover showing a summary card of the linked document before the user decides to navigate.",
      "Column visibility picker: a 'Columns' button above a DataTable opens a Popover containing checkboxes to show/hide columns, with controlled state managed in parent.",
      "Quick-edit cell: for an admin table, clicking a status badge opens a Popover with a RadioGroup to change status in-place without a full Dialog.",
    ],
    related: [
      "Tooltip — use Tooltip for brief, non-interactive label-like hints (hover-only, no inputs). Use Popover when the floating content is interactive (buttons, inputs, forms).",
      "Dialog/Sheet — use Dialog or Sheet for full modal actions that require user confirmation or significant input. Use Popover for lightweight, anchor-relative panels that dismiss on outside click.",
      "DropdownMenu — use DropdownMenu for a flat list of clickable actions or links. Use Popover when the floating panel needs arbitrary layout (forms, grids, rich content) rather than a menu list.",
    ],
    example: `import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";

// Uncontrolled — basic usage
export function InvoiceFilterPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Advanced filters</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96">
        <PopoverHeader>
          <PopoverTitle>Filter invoices</PopoverTitle>
          <PopoverDescription>Narrow results by date range and status.</PopoverDescription>
        </PopoverHeader>
        {/* place form controls here */}
      </PopoverContent>
    </Popover>
  );
}

// Controlled — programmatic open/close
import * as React from "react";

export function ControlledPopover() {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Show details">
          ?
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" sideOffset={8}>
        <PopoverHeader>
          <PopoverTitle>About this field</PopoverTitle>
          <PopoverDescription>
            The MF ID is the unique identifier assigned by Money Forward.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}`,
    storyPath: "data-display/Popover.stories.tsx",
    rules: [3, 23, 31, 35],
  },
  {
    name: "ScrollArea",
    group: "data-display",
    tagline:
      "Radix-backed custom scrollbar container — always set an explicit height/max-height on the wrapper or the scrollbar never appears.",
    props: [
      {
        name: "className",
        type: "string",
        description:
          "Extra classes applied to the root element. Must include a height constraint (h-*, max-h-*) — without one, the viewport expands to fit its content and no scrollbar is rendered.",
      },
      {
        name: "children",
        type: "React.ReactNode",
        required: true,
        description:
          "The content to make scrollable. Wrap it in a single element so the Viewport can measure its full size correctly.",
      },
      {
        name: "dir",
        type: '"ltr" | "rtl"',
        description:
          "Text direction forwarded to the Radix Root. Defaults to the document direction.",
      },
      {
        name: "scrollHideDelay",
        type: "number",
        defaultValue: "600",
        description:
          "Milliseconds before the scrollbar auto-hides after the pointer leaves. Applies to both axes.",
      },
      {
        name: "type",
        type: '"auto" | "always" | "scroll" | "hover"',
        defaultValue: '"hover"',
        description:
          "Scrollbar visibility strategy. 'auto' mirrors browser overflow; 'always' keeps it visible; 'scroll' shows while scrolling; 'hover' shows while hovering the scroll area.",
      },
    ],
    usage: [
      'DO set an explicit height or max-height on ScrollArea via className (e.g. `className="h-64"` or `className="max-h-[min(300px,50vh)]"`). Without a height constraint the viewport grows to fit content and the scrollbar is never rendered.',
      "DO wrap content in a single child element inside ScrollArea — the Viewport observes its single child's size to decide whether overflow exists.",
      'DO add `<ScrollBar orientation="horizontal" />` explicitly (after the children, before closing ScrollArea) when you need horizontal scrolling. The default ScrollBar rendered by ScrollArea is vertical-only.',
      "DON'T use a native browser `overflow-auto` div as an alternative — ScrollArea provides the design-system-styled thumb/track and respects the semantic token palette.",
      "DON'T put ScrollArea inside a flex parent without giving it a `flex-1` or fixed size — it will collapse to zero height and appear broken.",
      'For horizontal-only scrolling, still wrap in ScrollArea with `className="w-full"`, put the wide content inside, and place `<ScrollBar orientation="horizontal" />` explicitly after the content.',
    ],
    useCases: [
      "Long dropdown lists inside Popovers or Selects where the list height must be capped (e.g. TreeSelect, Cascader columns, Combobox options).",
      "Sidebar navigation panels or filter drawers whose content can exceed viewport height.",
      "Transfer-list panels with a fixed height that must scroll through a large item list.",
      "Cascader multi-column layouts where the horizontal axis may overflow (use ScrollBar orientation=horizontal).",
      "Detail panels or audit-log timelines inside a fixed-height Card that should not stretch the page.",
      "Code or JSON viewers with a fixed max-height needing both axes scrollable.",
    ],
    related: [
      "DataTable — use DataTable (not ScrollArea) when data is tabular and needs sorting/selection; DataTable manages its own overflow internally.",
      "Collapsible — use Collapsible to show/hide a section; pair with ScrollArea when the revealed content can itself overflow.",
      "Card/CardContent — when the card body should scroll, put ScrollArea inside CardContent rather than applying overflow directly to CardContent.",
    ],
    example: `import { ScrollArea, ScrollBar } from "@godxjp/ui/data-display";

// Vertical-only (default)
<ScrollArea className="h-64 w-full rounded-md border">
  <div className="p-4 space-y-2">
    {entries.map((entry) => (
      <div key={entry.id} className="text-sm">{entry.label}</div>
    ))}
  </div>
</ScrollArea>

// Horizontal + vertical (e.g. wide Cascader columns)
<ScrollArea className="w-full">
  <div className="flex max-h-[min(280px,50vh)]">
    {columns.map((col, i) => (
      <ul key={i} className="min-w-36 border-r last:border-r-0">
        {col.map((item) => <li key={item.value}>{item.label}</li>)}
      </ul>
    ))}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>`,
    storyPath: "data-display/ScrollArea.stories.tsx",
    rules: [2, 3, 24, 31],
  },
  {
    name: "Collapsible",
    group: "data-display",
    tagline:
      "Three-part compound (Collapsible + CollapsibleTrigger + CollapsibleContent) that toggles a region open/closed — never use just one part alone.",
    props: [
      {
        name: "open",
        type: "boolean",
        description:
          "Controlled open state. When provided, pair with onOpenChange to keep in sync. Omit for uncontrolled behaviour.",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        defaultValue: "false",
        description:
          "Initial open state when used uncontrolled. Useful for auto-expanding when a child is active (e.g. sidebar nav group).",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Callback fired when the open state changes. Required in controlled mode.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description:
          "Prevents the trigger from toggling the content. The trigger is still rendered but inert.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Applied to the root Collapsible element. Use for layout (e.g. sb-nav-group) — the root renders a div.",
      },
      {
        name: "asChild (CollapsibleTrigger)",
        type: "boolean",
        defaultValue: "false",
        description:
          "On CollapsibleTrigger only — merges Radix trigger behaviour onto the single child element (e.g. a godx-ui Button) instead of rendering a default button. The child must accept onClick and aria-* props.",
      },
    ],
    usage: [
      "DO compose all three parts together: <Collapsible> wraps both <CollapsibleTrigger> and <CollapsibleContent>. Never render CollapsibleContent without a parent Collapsible — the open state lives on the root.",
      "DO use asChild on CollapsibleTrigger when you want a godx-ui Button (or any styled element) to act as the trigger: <CollapsibleTrigger asChild><Button>Toggle</Button></CollapsibleTrigger>. Without asChild the trigger renders its own plain button.",
      "DO pass defaultOpen={true} (uncontrolled) when the section should auto-expand on mount — for example, a sidebar nav group whose active child matches the current route.",
      "DO use controlled mode (open + onOpenChange) when external UI — a separate button, route change, or search filter — needs to drive the open state independently of the trigger.",
      "DON'T add hidden native <details>/<summary> as a fallback — the Radix primitive is already accessible (aria-expanded, aria-controls) out of the box.",
      "DON'T put interactive controls (Buttons, links, inputs) inside CollapsibleTrigger itself unless using asChild — nested focusable elements break keyboard navigation. Put them inside CollapsibleContent instead.",
    ],
    useCases: [
      "Sidebar navigation group: a top-level nav item with children collapses/expands its sub-items in the rail (used directly in the godx-ui Sidebar component with defaultOpen={active}).",
      "Invoice line-item detail: an invoice row that expands inline to show tax breakdown, allocation notes, or audit trail without navigating away.",
      "Filter panel section: a labelled group of filter controls (date range, entity, status) that can be collapsed to save vertical space in a dense accounting dashboard.",
      "Read-more / long description: a truncated journal entry or payment memo that expands to full text on demand.",
      "Settings sub-section: an optional advanced settings block that is hidden by default and revealed only when the user opts in.",
      "Audit log detail: a compact log entry row that expands to show full diff, user, timestamp, and before/after values.",
    ],
    related: [
      "Accordion (from @godxjp/ui/data-entry or Radix) — use Accordion when only ONE section can be open at a time across a group; use Collapsible when each section is independent and can be open simultaneously.",
      "Popover — use Popover when the revealed content should float above the layout in a portal overlay; use Collapsible when the content should push surrounding content down inline.",
      "Dialog/Sheet — use Dialog or Sheet for modal or slide-over panels that demand full user attention; Collapsible stays in-flow and non-modal.",
      "TreeList (@godxjp/ui/data-display) — use TreeList for hierarchical data that needs recursive nesting with built-in indentation and expand/collapse; use Collapsible for ad-hoc single-level toggle regions.",
    ],
    example: `{\`import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui";

// --- Uncontrolled (simplest) ---
export function InvoiceLineDetail() {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm">
          <ChevronDown className="mr-1 h-4 w-4" aria-hidden="true" />
          Show tax breakdown
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 rounded-md border p-3 text-sm">
          <p>Consumption tax (10%): ¥1,234</p>
          <p>Withholding tax: ¥0</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// --- Controlled (open driven externally) ---
export function FilterSection() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm">
          Advanced filters
          <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {/* place filter controls here */}
        <p className="mt-2 text-sm text-muted-foreground">Date range, entity, status…</p>
      </CollapsibleContent>
    </Collapsible>
  );
}\`}`,
    storyPath: "data-display/Collapsible.stories.tsx",
    rules: [3, 6, 23],
  },
  {
    name: "TreeList",
    group: "data-display",
    tagline:
      "Renders a flat array of items as an indented tree-style list with chevron + package icon; depth indentation is data-driven — never nest DOM manually.",
    props: [
      {
        name: "items",
        type: "TreeListItem[]",
        required: true,
        description:
          "Ordered flat array of items to render. Each item carries its own depth so the tree structure is expressed in data, not DOM nesting.",
      },
    ],
    usage: [
      "DO pass a flat array ordered top-to-bottom with each item's `depth` set to the correct nesting level (0 = root, 1 = first child, etc.). TreeList does NOT accept nested children — the tree shape is encoded in data.",
      "DO set `item.active = true` on the currently selected row; the component applies `data-active` for styling — never manually add an active class.",
      "DO use `item.badge` (ReactNode) to surface a secondary label (count, status chip) — it is rendered as a `Badge variant='secondary'` automatically; do NOT wrap the value in a Badge yourself.",
      "DON'T hand-roll padding or indentation — depth-based indentation is applied via `data-depth` CSS; adding manual padding breaks the visual rhythm.",
      "DON'T use TreeList for interactive selection (click handlers, routing) — it has no `onItemClick` prop. Wrap items in a navigation list or add a Link inside `item.title` when interactivity is needed.",
      "DO provide a unique string `item.id` for every item; it is used as the React key and must be stable across renders.",
    ],
    useCases: [
      "Displaying a chart-of-accounts hierarchy (root accounts at depth 0, sub-accounts at depth 1+) in an accounting admin panel.",
      "Showing a package/module dependency tree where each node has a name, optional description, and an item-count badge.",
      "Rendering a category tree (e.g., product categories, tax codes) in a read-only reference list alongside a detail panel.",
      "Listing a filtered/searched subset of a hierarchy — because the flat-array model lets you pre-filter server-side and still show correct depth context.",
      "Sidebar or drawer content showing a tree of navigation nodes where the active branch item is highlighted via `active: true`.",
    ],
    related: [
      "Timeline — use Timeline for chronological event sequences with timestamps; use TreeList for hierarchical parent-child structures.",
      "Descriptions — use Descriptions for label/value pairs; use TreeList when items have a parent-child depth relationship.",
      "DataTable — use DataTable for tabular data with columns, sorting, and selection; use TreeList for a single-column hierarchical list without those features.",
      "EmptyState — pair with EmptyState when the items array may be empty; TreeList renders nothing (no empty row) when given an empty array.",
    ],
    example: `import { TreeList } from "@godxjp/ui/data-display";

const accounts = [
  { id: "1000", title: "Assets", depth: 0 },
  { id: "1100", title: "Current Assets", depth: 1, active: true },
  { id: "1110", title: "Cash & Equivalents", description: "Bank + petty cash", depth: 2, badge: "3 accounts" },
  { id: "1120", title: "Accounts Receivable", depth: 2 },
  { id: "2000", title: "Liabilities", depth: 0 },
];

export function ChartOfAccounts() {
  return <TreeList items={accounts} />;
}`,
    storyPath: "data-display/TreeList.stories.tsx",
    rules: [3, 6, 23, 31],
  },
  {
    name: "Tooltip",
    group: "feedback",
    tagline:
      "Radix-based hover/focus tooltip — self-providing, no app-level TooltipProvider required; compose Tooltip > TooltipTrigger > TooltipContent every time.",
    props: [
      {
        name: "delayDuration",
        type: "number",
        defaultValue: "200",
        description:
          "Milliseconds of hover before the tooltip opens. Accepted on both Tooltip (per-instance) and TooltipProvider (subtree-wide override).",
      },
      {
        name: "open",
        type: "boolean",
        description:
          "Controlled open state. Pair with onOpenChange to drive the tooltip programmatically.",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description:
          "Callback fired when the open state changes. Required when using controlled 'open'.",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        defaultValue: "false",
        description: "Uncontrolled initial open state.",
      },
      {
        name: "disableHoverableContent",
        type: "boolean",
        defaultValue: "false",
        description:
          "When true, the tooltip closes as soon as the pointer leaves the trigger (content is not hoverable). Passed through to Radix Root.",
      },
      {
        name: "side",
        type: "'top' | 'right' | 'bottom' | 'left'",
        defaultValue: '"top"',
        description:
          "On TooltipContent — preferred side for the tooltip panel. Radix flips automatically when there is not enough space.",
      },
      {
        name: "sideOffset",
        type: "number",
        defaultValue: "6",
        description:
          "On TooltipContent — pixel gap between the trigger edge and the tooltip panel.",
      },
      {
        name: "align",
        type: "'start' | 'center' | 'end'",
        defaultValue: '"center"',
        description: "On TooltipContent — alignment relative to the trigger along the cross-axis.",
      },
      {
        name: "alignOffset",
        type: "number",
        defaultValue: "0",
        description: "On TooltipContent — pixel offset applied to the align position.",
      },
      {
        name: "className",
        type: "string",
        description:
          "On TooltipContent — extra Tailwind classes merged with the built-in panel styles (z-50, max-w-xs, rounded-md, shadow-md, text-xs).",
      },
      {
        name: "children",
        type: "React.ReactNode",
        required: true,
        description: "On TooltipContent — the text or JSX rendered inside the floating panel.",
      },
      {
        name: "asChild",
        type: "boolean",
        defaultValue: "false",
        description:
          "On TooltipTrigger — merges props onto the immediate child instead of wrapping with a <button>. Use when the trigger is already an interactive element.",
      },
    ],
    usage: [
      "DO compose the full three-part structure every time: <Tooltip> wraps <TooltipTrigger> (the element that triggers the tip) and <TooltipContent> (the floating panel). Omitting any part silently produces nothing.",
      "DO NOT add an app-level <TooltipProvider> — every <Tooltip> self-provides its own Radix Provider. Only add <TooltipProvider> at a subtree root when you need a shared delayDuration different from the default 200ms across many tooltips.",
      "DO use asChild on TooltipTrigger when the trigger is already a Button, IconButton, or other interactive element — this avoids nesting a <button> inside a <button>, which is invalid HTML and breaks keyboard focus.",
      "DON'T put non-interactive elements (plain <div>, <span>) as the direct TooltipTrigger child without asChild — Radix needs a focusable element for keyboard accessibility. Wrap the target in a <span tabIndex={0}> or use a Button.",
      "For controlled usage (e.g. programmatic show/hide or testing), pass open + onOpenChange to <Tooltip>. For typical hover/focus behaviour, leave both unset (uncontrolled).",
      "TooltipContent renders inside a Radix Portal appended to document.body — z-index and overflow:hidden on ancestors do NOT clip it. Use className to extend max width beyond the built-in max-w-xs if long text is expected.",
    ],
    useCases: [
      "Explaining an icon-only Button action (e.g. a trash icon, a copy-to-clipboard icon) in a DataTable action column — show the label on hover without cluttering the row.",
      "Annotating a truncated cell value in a DataTable (e.g. a long account name clipped with text-ellipsis) — reveal the full text on hover without a modal.",
      "Providing contextual help for a form field label or an info icon next to an accounting term (e.g. 'AR Balance' with a short definition).",
      "Surfacing keyboard shortcut hints next to toolbar buttons (e.g. '⌘K — open search') without adding visible text to the UI.",
      "Displaying a disabled Button's reason — wrap the disabled Button in a TooltipTrigger with asChild and explain why the action is unavailable.",
    ],
    related: [
      "Popover — use Popover (also @godxjp/ui/feedback) when the floating panel needs interactive content (forms, links, action menus) rather than read-only text. Tooltip is read-only; Popover is interactive.",
      "HoverCard — for rich preview cards (user profiles, link previews) that appear on hover with more complex layout. Tooltip is for short text hints only.",
      "Badge / StatusChip — for persistent, always-visible short labels inline with text; not hover-triggered. Use Tooltip when the hint should be hidden until hovered.",
    ],
    example: `import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";
import { Trash2Icon } from "lucide-react";

// Icon-only button with tooltip label
export function DeleteAction() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Delete invoice">
          <Trash2Icon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">Delete invoice</TooltipContent>
    </Tooltip>
  );
}

// Controlled tooltip (e.g. force-open for a tutorial)
export function ControlledExample() {
  const [open, setOpen] = React.useState(false);
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <Button variant="outline" onMouseEnter={() => setOpen(true)}>
          Hover me
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        This is a controlled tooltip
      </TooltipContent>
    </Tooltip>
  );
}`,
    storyPath: "feedback/Tooltip.stories.tsx",
    rules: [3, 6, 23, 39],
  },
  {
    name: "PrefetchLink",
    group: "data-display",
    importPath: "@godxjp/ui/query",
    tagline:
      "React Router Link that fires prefetchQuery on hover/focus so detail pages feel instant — requires a TanStack Query QueryClient in context.",
    props: [
      {
        name: "queryKey",
        type: "QueryKey",
        required: true,
        description:
          "TanStack Query cache key for the data to prefetch. Must match the key used by the destination page's useQuery call.",
      },
      {
        name: "queryFn",
        type: "() => Promise<unknown>",
        required: true,
        description:
          "Fetch function passed to queryClient.prefetchQuery. Same function (or equivalent) as the one used in the destination page's useQuery.",
      },
      {
        name: "prefetchOn",
        type: '"hover" | "focus" | "both" | "none"',
        defaultValue: '"both"',
        description:
          "Which interaction triggers prefetching. 'both' fires on either mouseenter or focus. 'none' disables prefetching entirely (useful for conditional opt-out without unmounting the component).",
      },
      {
        name: "staleTime",
        type: "number",
        defaultValue: "30000",
        description:
          "Milliseconds before the prefetched cache entry is considered stale. Matches queryClient.prefetchQuery staleTime. Defaults to 30 s — set higher for rarely-changing data (e.g. reference tables), lower for live feeds.",
      },
      {
        name: "...linkProps",
        type: "LinkProps (react-router-dom)",
        description:
          "All standard React Router v6 Link props are spread through: to, replace, state, relative, reloadDocument, preventScrollReset, viewTransition, className, children, etc. onMouseEnter and onFocus are merged (your handler still fires).",
      },
    ],
    usage: [
      "DO: provide a queryKey that exactly matches the destination page's useQuery key — a mismatch means the prefetch populates a different cache slot and the page still loads cold.",
      "DO: keep queryFn lightweight and side-effect-free; it runs speculatively on hover. Avoid mutations or write operations inside queryFn.",
      "DO: tune staleTime to your data's freshness requirement. The default 30 s is fine for most detail views; set it lower (e.g. 5000) for real-time data or higher (e.g. 300_000) for static reference data.",
      "DON'T: use PrefetchLink when the destination page's data is user-specific per request (e.g. contains a nonce or CSRF token embedded in the payload) — the prefetched response may be stale or unusable.",
      "DON'T: hand-roll a Link + useQueryClient prefetch pattern when PrefetchLink already ships it. Using raw Link loses the hover/focus prefetch behaviour and duplicates logic.",
      "REQUIRES: a TanStack Query QueryClient provider (QueryClientProvider) above this component in the tree. It calls useQueryClient internally — rendering without a provider throws.",
    ],
    useCases: [
      "List-to-detail navigation in an accounting app: hovering an invoice row in a DataTable triggers prefetch of that invoice's detail data so the detail page renders immediately on click.",
      "Sidebar navigation links where the destination is a dashboard or summary page — prefetch on focus covers keyboard-only users tabbing through the nav.",
      "Paginated table rows where each row links to a resource detail page (partner, journal entry, account). prefetchOn='hover' avoids wasted prefetches from keyboard navigation.",
      "Admin list pages with 'Edit' action links: the edit form data is prefetched on hover so the form appears populated without a loading spinner.",
      "Breadcrumb links on deep-nested pages where clicking 'back' should feel instant — prefetch the parent page's query on mount/focus of the breadcrumb link.",
    ],
    related: [
      "Link (react-router-dom) — use bare Link when no prefetching is needed or when the destination has no TanStack Query data (e.g. a static page or a form page that fetches nothing on load).",
      "DataState — the companion lifecycle widget for the destination page; ensures PrefetchLink's prefetch is consumed correctly via useQuery.",
      "InfiniteQueryState — use instead of PrefetchLink when the list itself is infinitely paginated and items are loaded lazily rather than navigated to.",
      "ButtonRefetch — for triggering a manual cache refresh on an already-loaded page, not for navigation prefetching.",
    ],
    example: `import { PrefetchLink } from "@godxjp/ui/query";
import { fetchInvoice } from "@/api/invoices";

// Inside a table row or list item:
<PrefetchLink
  to={\`/invoices/\${invoice.id}\`}
  queryKey={["invoice", invoice.id]}
  queryFn={() => fetchInvoice(invoice.id)}
  staleTime={60_000}
  className="font-medium hover:underline"
>
  {invoice.number}
</PrefetchLink>

// Disable prefetch for rows where data is not yet stable:
<PrefetchLink
  to={\`/invoices/\${invoice.id}\`}
  queryKey={["invoice", invoice.id]}
  queryFn={() => fetchInvoice(invoice.id)}
  prefetchOn="none"
>
  {invoice.number}
</PrefetchLink>`,
    storyPath: "data-display/PrefetchLink.stories.tsx",
    rules: [2, 3, 31],
  },
  {
    name: "Avatar",
    group: "data-display",
    tagline: "Radix Avatar wrapper with image and fallback slots for users, teams, and entities.",
    props: [
      {
        name: "shape",
        type: '"circle" | "square"',
        defaultValue: '"circle"',
        description:
          'Identity geometry. `circle` (default, inert) is the PERSON avatar — the round --radius-pill mark on the muted surface. `square` is the ENTITY-HEADER organization/service mark (gh#249): a compact rounded square on the brand surface, whose radius, box size, fill and glyph colour are all --avatar-square-{radius,size,background,foreground} tokens. Pick the shape by WHAT the mark represents; never hand-roll it with className="rounded-md bg-primary".',
      },
      {
        name: "appearance",
        type: '"default" | "tinted"',
        defaultValue: '"default"',
        description:
          'Fill treatment, ORTHOGONAL to `shape`. `default` (inert) is the identity fill — --muted for a person, the solid brand mark for `shape="square"`. `tinted` is the CAPABILITY MEDALLION (gh#12): a soft role wash behind a role-coloured glyph, with the glyph sized by the component. `shape="square" appearance="tinted"` is the canonical rounded-square medallion a feature/capability icon sits on. Retune with --avatar-tinted-{background,foreground,glyph-size}.',
      },
      {
        name: "children",
        type: "ReactNode",
        description: "Compose AvatarImage and AvatarFallback.",
      },
      { name: "className", type: "string", description: "Extra classes on the avatar root." },
    ],
    usage: [
      "DO compose Avatar > AvatarImage + AvatarFallback so broken or missing images still show a readable fallback.",
      'DO render a capability / feature icon as `<Avatar shape="square" appearance="tinted"><AvatarFallback><Sparkles aria-hidden /></AvatarFallback></Avatar>` — the medallion is a COMPOSITION (Avatar + a Lucide glyph, per docs/COMPOSITION-VS-COMPONENT.md), and `appearance="tinted"` is the token-owned tint that composition needs. A BARE glyph beside a card title, or a hand-derived `hsl(var(--primary) / 0.1)` plate in page CSS, are both the anti-pattern this replaces. Left-aligned capability card: `<Card><CardHeader className="flex flex-row items-center gap-3"><Avatar shape="square" appearance="tinted">…</Avatar><CardTitle>…</CardTitle></CardHeader>…`.',
      'DO use `shape="square"` for an organization / service / tenant mark in an entity header, and keep the default `shape="circle"` for people. The square appearance already carries the brand surface and an AA-contrast glyph colour — a className/colour override on the call site is never needed (and is forbidden by the API-first redesign policy).',
      "DON'T retune the entity mark per call site: set --avatar-square-{radius,size,background,foreground} ONCE in the service theme (e.g. --avatar-square-background: hsl(var(--muted)) for a neutral mark).",
      "DON'T use Avatar for decorative thumbnails; use CardCover or an img when the image is content rather than identity.",
    ],
    useCases: [
      "User profile chips",
      "Team member lists",
      "Account owner cells in a DataTable",
      'Organization / service entity headers (shape="square" beside the entity name and code)',
    ],
    related: ["Badge — use beside Avatar for role/status metadata."],
    example: `import { Avatar, AvatarFallback, AvatarImage } from "@godxjp/ui/data-display";

<Avatar>
  <AvatarImage src="/user.png" alt="User" />
  <AvatarFallback>UI</AvatarFallback>
</Avatar>

// Organization entity header mark
<Avatar shape="square">
  <AvatarFallback>山</AvatarFallback>
</Avatar>`,
    storyPath: "data-display/Avatar.stories.tsx",
    rules: [3, 35],
  },
  {
    name: "Separator",
    group: "layout",
    tagline: "Radix Separator wrapper for tokenized horizontal or vertical dividers.",
    props: [
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        defaultValue: '"horizontal"',
        description: "Divider direction.",
      },
      {
        name: "decorative",
        type: "boolean",
        defaultValue: "true",
        description: "Whether the separator is decorative for assistive tech.",
      },
    ],
    usage: [
      "DO use Separator for section dividers instead of raw border divs.",
      "DO set orientation='vertical' only when the parent gives it a stable height.",
    ],
    useCases: [
      "Separating toolbar groups",
      "Dividing stacked page sections",
      "Vertical split between metadata groups",
    ],
    related: ["Flex direction='col' — use for vertical spacing without a visible rule."],
    example: `import { Separator } from "@godxjp/ui/layout";

<Separator />`,
    storyPath: "layout/Separator.stories.tsx",
    rules: [2, 3],
  },
  {
    name: "Skeleton",
    group: "feedback",
    tagline: "Base pulsing skeleton block for custom loading placeholders.",
    props: [
      { name: "className", type: "string", description: "Size and layout classes for the block." },
    ],
    usage: [
      "DO use Skeleton for a custom block when SkeletonRows/Table/Card do not match the final layout.",
      "DON'T use a spinner overlay for skeletonable page content.",
    ],
    useCases: [
      "Single loading line",
      "Custom card media placeholder",
      "Inline metadata placeholder",
    ],
    related: ["SkeletonRows", "SkeletonTable", "SkeletonStat"],
    example: `import { Skeleton } from "@godxjp/ui/feedback";

<Skeleton className="h-6 w-48" />`,
    storyPath: "feedback/Skeleton.stories.tsx",
    rules: [3, 31],
  },
  {
    name: "Toggle",
    group: "data-entry",
    tagline: "Radix Toggle wrapper with default/outline variants and tokenized sizes.",
    props: [
      { name: "pressed", type: "boolean", description: "Controlled pressed state." },
      {
        name: "onPressedChange",
        type: "(pressed: boolean) => void",
        description: "Pressed-state callback.",
      },
      {
        name: "variant",
        type: '"default" | "outline"',
        defaultValue: '"default"',
        description: "Visual style.",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        defaultValue: '"md"',
        description: "Control size.",
      },
    ],
    usage: [
      "DO provide an accessible label when the toggle only contains an icon.",
      "DON'T use Toggle for multi-option selection; use ToggleGroup.",
    ],
    useCases: ["Bold/italic toolbar buttons", "Pinned filter toggles", "Compact view mode buttons"],
    related: ["ToggleGroup", "Button"],
    example: `import { Toggle } from "@godxjp/ui/data-entry";

<Toggle aria-label="Bold">B</Toggle>`,
    storyPath: "data-entry/Toggle.stories.tsx",
    rules: [3, 13],
  },
  {
    name: "ToggleGroup",
    group: "data-entry",
    tagline: "Radix ToggleGroup wrapper for single or multiple toggle selection.",
    props: [
      {
        name: "type",
        type: '"single" | "multiple"',
        required: true,
        description: "Selection mode.",
      },
      { name: "value", type: "string | string[]", description: "Controlled selected value(s)." },
      {
        name: "defaultValue",
        type: "string | string[]",
        description: "Uncontrolled initial value(s).",
      },
      {
        name: "onValueChange",
        type: "(value: string | string[]) => void",
        description: "Selection callback.",
      },
      {
        name: "variant",
        type: '"default" | "outline"',
        defaultValue: '"default"',
        description:
          "Visual style, PROVIDED TO EVERY ITEM via context — set it once on the group, not on each ToggleGroupItem. An explicit `variant` on an item still wins. The default is applied per item by toggleVariants, so an unset group emits no `data-variant` at all.",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        defaultValue: '"md"',
        description:
          "Control size, PROVIDED TO EVERY ITEM via context — set it once on the group. An explicit `size` on an item still wins. Heights come from the --control-height tier (sm 28px · md 32px · lg 36px).",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Disables the whole group; individual items also accept `disabled`.",
      },
    ],
    usage: [
      "DO choose type='single' for mutually exclusive toolbar modes.",
      "DO choose type='multiple' for independent formatting toggles.",
      "DO set `variant`/`size` ONCE on the ToggleGroup — they propagate to every ToggleGroupItem through context. Repeating them on each item is redundant (it still works, and an explicit item prop overrides the group).",
      "DO set `size`/`variant` on an individual ToggleGroupItem only when that ONE item must differ from the group.",
      "DON'T pass size='default' — it is not a member of the `sm | md | lg` union. Omit `size` for the md default.",
      "DO give the group an accessible name (`aria-label`) — it renders a radiogroup (single) or a group of toggle buttons (multiple).",
    ],
    useCases: ["Text alignment selector", "Formatting toolbar", "View density switcher"],
    related: ["Toggle", "RadioGroup"],
    example: `import { ToggleGroup, ToggleGroupItem } from "@godxjp/ui/data-entry";

// size/variant are set ONCE on the group and reach every item.
<ToggleGroup type="single" size="lg" variant="outline" defaultValue="left" aria-label="Alignment">
  <ToggleGroupItem value="left">Left</ToggleGroupItem>
  <ToggleGroupItem value="center">Center</ToggleGroupItem>
</ToggleGroup>`,
    storyPath: "data-entry/ToggleGroup.stories.tsx",
    rules: [3, 13],
  },
  {
    name: "AspectRatio",
    group: "layout",
    tagline: "Radix AspectRatio wrapper for stable media and preview frames.",
    props: [
      {
        name: "ratio",
        type: "number",
        defaultValue: "16 / 9",
        description: "Width divided by height.",
      },
      { name: "children", type: "ReactNode", description: "Content constrained to the ratio." },
    ],
    usage: [
      "DO use AspectRatio for media, maps, charts, or previews that must not jump during load.",
      "DON'T use it for unconstrained text content.",
    ],
    useCases: ["Video embed frame", "Image preview slot", "Dashboard chart placeholder"],
    related: ["CardCover", "Skeleton"],
    example: `import { AspectRatio } from "@godxjp/ui/layout";

<AspectRatio ratio={16 / 9}>...</AspectRatio>`,
    storyPath: "layout/AspectRatio.stories.tsx",
    rules: [2, 3],
  },
  {
    name: "Accordion",
    group: "data-display",
    tagline:
      "Radix accordion — vertically stacked, collapsible sections. Compose Accordion > AccordionItem > AccordionTrigger + AccordionContent.",
    props: [
      {
        name: "type",
        type: '"single" | "multiple"',
        required: true,
        description: "single = one open at a time; multiple = independent.",
      },
      {
        name: "collapsible",
        type: "boolean",
        description: "When type=single, allow closing the open item.",
      },
      { name: "value", type: "string | string[]", description: "Controlled open item(s)." },
      {
        name: "defaultValue",
        type: "string | string[]",
        description: "Uncontrolled initial open item(s).",
      },
      {
        name: "onValueChange",
        type: "(value: string | string[]) => void",
        description: "Open-state callback.",
      },
    ],
    usage: [
      'DO compose the full set: <Accordion type="single" collapsible><AccordionItem value="a"><AccordionTrigger/><AccordionContent/></AccordionItem></Accordion>.',
      "DO give each AccordionItem a unique `value`.",
      "DON'T use it for primary navigation — that's Sidebar/Tabs. Accordion is for collapsible content/FAQ.",
    ],
    useCases: [
      "FAQ lists",
      "Grouped settings sections",
      "Collapsible detail panels on a record page",
      "Filter facet groups in a sidebar",
    ],
    related: [
      "Collapsible (single open/close region, no item set)",
      "Tabs (mutually-exclusive views, always one visible)",
    ],
    example: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@godxjp/ui/data-display";

<Accordion type="single" collapsible>
  <AccordionItem value="ship">
    <AccordionTrigger>配送について</AccordionTrigger>
    <AccordionContent>3〜5営業日でお届けします。</AccordionContent>
  </AccordionItem>
</Accordion>`,
    storyPath: "data-display/Accordion.stories.tsx",
    rules: [3, 6],
  },
  {
    name: "HoverCard",
    group: "data-display",
    tagline:
      "Radix hover card — a rich popover shown on hover/focus of a trigger (for sighted-pointer affordances; not a replacement for Tooltip's short text).",
    props: [
      {
        name: "openDelay",
        type: "number",
        defaultValue: "700",
        description: "ms before opening on hover.",
      },
      {
        name: "closeDelay",
        type: "number",
        defaultValue: "300",
        description: "ms before closing.",
      },
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open-state callback.",
      },
    ],
    usage: [
      "DO compose HoverCard > HoverCardTrigger > HoverCardContent.",
      "DO use for RICH preview content (a card, avatar + bio); for short plain-text hints use Tooltip.",
      "DON'T rely on it for essential info — hover isn't available on touch; provide the same content on click/tap elsewhere.",
    ],
    useCases: [
      "User/profile preview on @mention hover",
      "Entity preview (customer/account) on a table cell",
      "Glossary term definitions",
      "Commit/PR preview links",
    ],
    related: [
      "Tooltip (short text label, not rich content)",
      "Popover (click-triggered, interactive content)",
    ],
    example: `import { HoverCard, HoverCardTrigger, HoverCardContent } from "@godxjp/ui/data-display";

<HoverCard>
  <HoverCardTrigger>@yamada</HoverCardTrigger>
  <HoverCardContent>山田太郎 — 経理部</HoverCardContent>
</HoverCard>`,
    storyPath: "data-display/HoverCard.stories.tsx",
    rules: [3, 6],
  },
  {
    name: "PasswordInput",
    group: "data-entry",
    tagline:
      "Input for passwords with a built-in show/hide eye toggle. Accepts all Input props except `type`.",
    props: [
      {
        name: "value",
        type: "string",
        description: "Controlled value (or use defaultValue/uncontrolled).",
      },
      { name: "name", type: "string", description: "Form field name for native submission." },
      { name: "placeholder", type: "string", description: "Placeholder text." },
      { name: "disabled", type: "boolean", description: "Disables the field + toggle." },
      {
        name: "leadingIcon",
        type: "React.ReactNode",
        description:
          "Inherited from Input — a leading glyph (e.g. a Lock icon) pinned inside the start of the field. The built-in show/hide eye stays on the trailing edge, so leading + trailing coexist here.",
      },
    ],
    usage: [
      'DO use for any password / secret field instead of `<Input type="password">` so users get the show/hide affordance.',
      'DO pass `name` + `autoComplete="current-password"|"new-password"` for correct form/password-manager behavior.',
      "DON'T add your own eye button — it's built in (and excluded from the tab order).",
    ],
    useCases: [
      "Login password field",
      "Sign-up / change-password forms (new-password)",
      "API key / secret entry in settings",
    ],
    related: [
      "Input (the base text field this wraps)",
      "FormField (label + error wrapper around it)",
    ],
    example: `import { PasswordInput } from "@godxjp/ui/data-entry";

<PasswordInput name="password" autoComplete="current-password" placeholder="パスワード" />`,
    storyPath: "data-entry/PasswordInput.stories.tsx",
    rules: [3, 6],
  },
  {
    name: "PasswordStrength",
    group: "data-entry",
    tagline:
      "Evaluates password quality with a 0-4 score and optional rule checklist. Use with PasswordInput in secure forms.",
    props: [
      {
        name: "value",
        type: "string",
        required: true,
        description: "The current password value to evaluate.",
      },
      {
        name: "rules",
        type: "PasswordRule[]",
        description: "`length` | `upper` | `lower` | `number` | `symbol`. Omit to use defaults.",
      },
      {
        name: "showChecklist",
        type: "boolean",
        defaultValue: "true",
        description: "Render an optional checklist of rule checks below the bar.",
      },
      {
        name: "labels",
        type: "{ weak: string; fair: string; strong: string }",
        description: "Text labels for the three score buckets.",
      },
    ],
    usage: [
      "DO show PasswordStrength immediately below PasswordInput so users understand password quality before submitting.",
      "DO keep `rules` stable (default list is recommended for broad UI compatibility).",
      "DON'T treat the score as cryptographic strength; use it as a UI hint only.",
    ],
    useCases: [
      "Account signup password field",
      "Password reset workflow",
      "Admin user invite form",
    ],
    related: ["PasswordInput", "FormField", "Input"],
    example: `import { PasswordInput, PasswordStrength } from "@godxjp/ui/data-entry";

const rules = ["length", "upper", "lower", "number", "symbol"] as const;

export default function PasswordBlock() {
  const [value, setValue] = useState("");
  return (
    <div className="ui-stack">
      <PasswordInput value={value} onChange={(event) => setValue(event.target.value)} />
      <PasswordStrength value={value} rules={rules} />
    </div>
  );
}`,
    storyPath: "data-entry/PasswordStrength.stories.tsx",
    rules: [3, 6],
  },
  {
    name: "InputOTP",
    group: "data-entry",
    tagline:
      "One-time-code / 2FA input (input-otp) — N single-character slots that behave as one field. Compose InputOTP > InputOTPGroup > InputOTPSlot.",
    props: [
      {
        name: "maxLength",
        type: "number",
        required: true,
        description: "Number of slots (e.g. 6).",
      },
      { name: "value", type: "string", description: "Controlled value." },
      {
        name: "onChange",
        type: "(value: string) => void",
        description:
          "Value callback (this is a true text input — onChange is the DOM-style value handler here).",
      },
      { name: "pattern", type: "string", description: "Allowed-char regex (e.g. digits only)." },
      {
        name: "align",
        type: '"start" | "center" | "end"',
        defaultValue: '"start"',
        description:
          "Main-axis alignment of the whole code row (groups + separators) inside the field (gh#12). `center` is the canonical auth challenge. Before this existed, every consumer wrapped the OTP in their own flex-centring div — do not. A service that wants all code fields centred sets `--otp-container-align` once instead.",
      },
    ],
    usage: [
      "DO set `maxLength` to the code length and render that many InputOTPSlot with sequential `index`.",
      'DO centre a challenge with `align="center"` on InputOTP — never with a wrapper `<div className="flex justify-center">`. The container is owned by input-otp, so a wrapper is the only thing a consumer CAN reach, which is exactly why the prop exists.',
      "DO wrap slots in InputOTPGroup; use InputOTPSeparator between groups (e.g. 3 + 3).",
      "For device codes, set `appearance='grouped'` on each InputOTPGroup to render one outline per group while preserving the single hidden input, paste, caret, keyboard and screen-reader behavior.",
      "DON'T build N separate Inputs — this is ONE field with paste, arrow-key, and caret handling built in.",
      "DO widen the slots with `--otp-slot-size` (gh#233) when a challenge row must fill a wide auth panel — it defaults to the live `--control-height` tier, so re-scoping `--control-height` on the card instead would also resize the submit button and every other input in it. Set a NAMED tier (`var(--control-height-lg)`), never an ad-hoc calc offset.",
      'DO use `--otp-slot-inline-size` / `--otp-slot-block-size` (gh#12) when the code field is NOT square — a device-grant slot is taller than it is wide. They win over the `--otp-slot-size` shorthand and fall back to it, so setting neither keeps the square control tier. You rarely set them by hand inside `AuthShell preset="device-authorization"`: that preset already owns its code-field measure.',
      "DO drive the sign-in MFA challenge from FormField: `error` wires aria-invalid + aria-errormessage + a role=alert message onto the single field, and the slot borders turn destructive. State is never colour-only.",
    ],
    useCases: [
      "2FA / OTP verification code",
      "Email / SMS confirmation code",
      "PIN entry",
      "Invite / redemption code",
    ],
    related: ["Input (a normal single text field)", "PasswordInput (masked secret field)"],
    example: `import { InputOTP, InputOTPGroup, InputOTPSlot } from "@godxjp/ui/data-entry";

<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
    <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>`,
    storyPath: "data-entry/InputOTP.stories.tsx",
    rules: [3, 6],
  },
  {
    name: "Rating",
    group: "data-entry",
    tagline:
      "Star-rating input (radiogroup) — controlled via value/onValueChange, form-submittable via name, supports readOnly display.",
    props: [
      { name: "value", type: "number", description: "Controlled rating (1..max)." },
      {
        name: "defaultValue",
        type: "number",
        defaultValue: "0",
        description: "Uncontrolled initial rating.",
      },
      { name: "onValueChange", type: "(value: number) => void", description: "Rating callback." },
      { name: "max", type: "number", defaultValue: "5", description: "Number of stars." },
      { name: "readOnly", type: "boolean", description: "Display-only (e.g. an average score)." },
      {
        name: "name",
        type: "string",
        description: "Hidden input name for native form submission.",
      },
    ],
    usage: [
      "DO use readOnly to DISPLAY a score (e.g. product average); interactive (default) for collecting a rating.",
      "DO pass `name` to submit the value in a plain form.",
      "DON'T render raw star icons for input — this handles keyboard (radiogroup), hover preview, and a11y.",
      "NOTE a long scale WRAPS rather than overflowing. At `max={10}` the row needs ~276px of hit area and a 320px viewport offers ~212 inside a card, so the stars fall onto a second line instead of being painted where no one can reach them. Don't add `flex-nowrap` or a fixed width to force one line; use a smaller `max` if a single row matters.",
    ],
    useCases: [
      "Product / vendor review input",
      "Display an average score (readOnly)",
      "Feedback / CSAT survey",
      "Priority or quality scoring in admin",
    ],
    related: ["RadioGroup (non-star single choice)", "Slider (continuous 0-100 value)"],
    example: `import { Rating } from "@godxjp/ui/data-entry";

<Rating name="score" defaultValue={4} onValueChange={(v) => console.log(v)} />`,
    storyPath: "data-entry/Rating.stories.tsx",
    rules: [3, 6, 23],
  },
  {
    name: "TagInput",
    group: "data-entry",
    tagline:
      "Chips/tags input — type + Enter (or comma) to add a tag, Backspace to remove the last; controlled via value/onValueChange (string[]).",
    props: [
      { name: "value", type: "string[]", description: "Controlled tag list." },
      { name: "defaultValue", type: "string[]", description: "Uncontrolled initial tags." },
      {
        name: "onValueChange",
        type: "(tags: string[]) => void",
        description: "Tag-list callback.",
      },
      { name: "placeholder", type: "string", description: "Shown when empty." },
      {
        name: "name",
        type: "string",
        description: "Hidden input (comma-joined) for native form submission.",
      },
    ],
    usage: [
      "DO use for free-form multi-value entry (labels, emails, keywords) where options aren't a fixed list.",
      "DO note dedupe is built in; Enter/comma commits, Backspace on empty removes the last chip.",
      "DON'T use for choosing from a KNOWN set — use Select (multiple) or a multi-Combobox instead.",
    ],
    useCases: [
      "Labels / tags on a record",
      "Recipient email entry",
      "Keyword / skill lists",
      "Ad-hoc filter terms",
    ],
    related: [
      "Select (multiple) — when the values come from a fixed option set",
      "Combobox (multi) — searchable known set",
    ],
    example: `import { TagInput } from "@godxjp/ui/data-entry";

<TagInput name="labels" placeholder="ラベルを追加…" onValueChange={(tags) => setTags(tags)} />`,
    storyPath: "data-entry/TagInput.stories.tsx",
    rules: [3, 6, 23],
  },
  {
    name: "ContextMenu",
    group: "navigation",
    tagline:
      "Context menu primitives with keyboard support and compound parts for command-style action surfaces.",
    props: [
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open-state callback.",
      },
      {
        name: "modal",
        type: "boolean",
        defaultValue: "true",
        description:
          "Modal mode — locks scroll + outside interaction while open. Set false to keep the rest of the page interactive.",
      },
      {
        name: "dir",
        type: '"ltr" | "rtl"',
        description:
          "Reading direction for arrow-key navigation (inherits from the document if omitted).",
      },
    ],
    usage: [
      "DO trigger this on `onContextMenu` (right-click / long-press), NOT on left-click — for a button that opens a list of actions on left-click use `DropdownMenu` instead. The two are not interchangeable.",
      "DO wrap exactly the right-clickable surface in `<ContextMenuTrigger>` (a table row, a card, a file tile) — the menu anchors to the pointer position, so the trigger should be the whole interactive region the menu acts on.",
      "DON'T put primary, always-visible actions only behind a context menu — right-click is a discoverability dead-end on touch and for new users. Mirror critical actions in a visible `Button`/`DropdownMenu` and use ContextMenu as an accelerator.",
      'DO mark irreversible items with `variant="destructive"` (削除 / 取り消し) and group them under a `<ContextMenuSeparator>`; use `<ContextMenuShortcut>` to show the keyboard accelerator, `<ContextMenuSub>`/`<ContextMenuSubTrigger>` for nested submenus, and `<ContextMenuCheckboxItem>`/`<ContextMenuRadioItem>` for stateful toggles.',
      "DON'T hand-roll a positioned `<div>` + `onContextMenu={e => e.preventDefault()}` — the primitive already gives you keyboard navigation, focus trapping, typeahead, and WAI-ARIA menu semantics for free.",
    ],
    useCases: [
      "Right-click actions on a DataTable row (詳細 / 複製 / 削除) as a power-user accelerator alongside the visible row action button.",
      "Contextual menu on a file or document tile in an upload/asset manager (ダウンロード / 名前変更 / 削除).",
      "Nested action menu with submenus and shortcuts (e.g. 'エクスポート ▸ CSV / PDF') on a report card.",
      "Stateful toggles on a board/kanban card via ContextMenuCheckboxItem (e.g. ピン留め, 完了としてマーク).",
    ],
    storyPath: "navigation/ContextMenu.stories.tsx",
    rules: [3, 6],
    example: `import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@godxjp/ui/navigation";

<ContextMenu>
  <ContextMenuTrigger>open</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Edit</ContextMenuItem>
    <ContextMenuItem>Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
  },
  {
    name: "Menubar",
    group: "navigation",
    tagline: "Application menubar primitives (menus, sub-menus, and check/radio items).",
    props: [
      {
        name: "value",
        type: "string",
        description: "Controlled value of the currently-open menu (pair with onValueChange).",
      },
      {
        name: "defaultValue",
        type: "string",
        description: "Uncontrolled initial open menu.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Fires with the id of the menu that opened (or '' when all close).",
      },
    ],
    usage: [
      "DO reserve Menubar for a persistent, desktop-app-style command bar (ファイル / 編集 / 表示 …) where multiple top-level menus sit side by side — moving the pointer across triggers opens the adjacent menu without an extra click.",
      "DON'T use Menubar for primary site/page navigation (links between pages) — that is `NavigationMenu`. Menubar items run *commands*; NavigationMenu items *navigate*.",
      "DON'T use Menubar when there is only one menu button — a single trigger that drops a list of actions is a `DropdownMenu`. Menubar earns its weight only with several coordinated menus.",
      "DO compose the full structure: `<Menubar>` › `<MenubarMenu>` › `<MenubarTrigger>` + `<MenubarContent>` with `<MenubarItem>`; use `<MenubarSeparator>` to group, `<MenubarShortcut>` for accelerators, `<MenubarSub>` for nested menus, and `<MenubarCheckboxItem>`/`<MenubarRadioItem>` for view toggles.",
      'DO mark destructive commands with `variant="destructive"` and give every item an `onSelect` handler — items are commands, so they should *do* something, not just close.',
    ],
    useCases: [
      "Top-bar command menu for a back-office editor (ファイル / 編集 / 表示 / ヘルプ) with shortcuts and submenus.",
      "Workspace tool menus in an admin console where each menu groups a category of actions (データ / レポート / 設定).",
      "Desktop-like application shell (e.g. an internal POS or accounting workstation) that mirrors native menubar conventions.",
      "View-state toggles via MenubarCheckboxItem/MenubarRadioItem (e.g. 表示 › グリッド線を表示, 通貨表示 ▸ ¥ / $).",
    ],
    storyPath: "navigation/Menubar.stories.tsx",
    rules: [3, 6],
    example: `import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@godxjp/ui/navigation";

<Menubar>
  <MenubarMenu>
    <MenubarTrigger>ファイル</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>新規作成</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
  },
  {
    name: "NavigationMenu",
    group: "navigation",
    tagline:
      "Horizontal navigation menu with trigger/content/link primitives and viewport support.",
    props: [
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        defaultValue: '"horizontal"',
        description: "Main-axis arrangement for the nav menu.",
      },
      {
        name: "value",
        type: "string",
        description: "Controlled value of the currently-open item (pair with onValueChange).",
      },
      {
        name: "defaultValue",
        type: "string",
        description: "Uncontrolled initial open item.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Fires with the id of the item whose dropdown opened (or '' when all close).",
      },
      {
        name: "delayDuration",
        type: "number",
        defaultValue: "200",
        description: "Hover delay (ms) before a trigger's content opens.",
      },
    ],
    usage: [
      "DO use NavigationMenu for primary *navigation* between pages/sections — items wrap `<NavigationMenuLink>` (an `<a>`), not command buttons. For command bars (ファイル/編集 …) use `Menubar`; for a single action drop-down use `DropdownMenu`.",
      "DO render real links inside `<NavigationMenuLink asChild>` so SPA routers work: `<NavigationMenuLink asChild><Link href={route('reports.index')}>レポート</Link></NavigationMenuLink>` — never nest a raw `<a>` directly with its own onClick navigation.",
      "DO use `<NavigationMenuTrigger>` + `<NavigationMenuContent>` only when an item needs a rich dropdown panel (link groups, featured cards). Top-level items that go straight to a page should be a bare `<NavigationMenuLink>` with NO trigger.",
      "DON'T use it as the app's left sidebar — for a persistent vertical app sidebar use `Sidebar`/`AppShell`. Set `orientation=\"vertical\"` only for an in-content vertical link menu, not the global shell.",
      "DON'T hand-roll the hover/focus dropdown timing — the primitive manages open-on-hover with `delayDuration`, keyboard navigation, and the animated viewport for you.",
    ],
    useCases: [
      "Primary top navigation for an admin/portal app with dropdown panels grouping related pages (e.g. レポート ▾ → 売上 / 経費 / 入金).",
      "Sectioned marketing or docs navigation with featured link cards inside NavigationMenuContent.",
      "Nested link groups where one trigger reveals a multi-column panel of related destinations.",
      "Vertical in-content navigation (orientation='vertical') for a settings or documentation area — distinct from the global Sidebar shell.",
    ],
    storyPath: "navigation/NavigationMenu.stories.tsx",
    rules: [3, 6],
    example: `import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger } from "@godxjp/ui/navigation";

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>ページ</NavigationMenuTrigger>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`,
  },
  {
    name: "ResizablePanel",
    group: "layout",
    tagline: "Resizable panel group/child/handle primitives from react-resizable-panels.",
    props: [
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        defaultValue: '"horizontal"',
        description:
          "ResizablePanelGroup prop — axis the panels are laid out / resized along (horizontal = side-by-side).",
      },
      {
        name: "id",
        type: "string",
        description:
          "ResizablePanel identifier — required for collapse/expand control and for layout persistence.",
      },
      {
        name: "defaultSize",
        type: "string | number",
        description:
          'ResizablePanel initial size. react-resizable-panels v4: a STRING is a unit ("35%", "20rem", "240px"); a bare NUMBER is PIXELS. For a percentage of the group pass a string like "35%" — `defaultSize={35}` means 35px (a sliver), not 35%.',
      },
      {
        name: "minSize",
        type: "string | number",
        description:
          'ResizablePanel minimum size — drag can\'t shrink below this. Same unit rule: "20%" for percent, bare number = px.',
      },
      {
        name: "maxSize",
        type: "string | number",
        description: 'ResizablePanel maximum size. "60%" for percent, bare number = px.',
      },
      {
        name: "collapsible",
        type: "boolean",
        defaultValue: "false",
        description:
          "ResizablePanel — allow the panel to collapse to collapsedSize when dragged below minSize. Pair with onResize to react to collapse.",
      },
      {
        name: "onResize",
        type: "(size: PanelSize, id, prevSize) => void",
        description:
          "ResizablePanel — fires while/after the panel is resized (e.g. to persist layout).",
      },
    ],
    usage: [
      'DO put the layout on `<ResizablePanelGroup orientation="horizontal|vertical">`, the resizable regions in `<ResizablePanel>`, and a `<ResizableHandle>` BETWEEN every adjacent pair — a group of N panels needs N-1 handles or there is nothing to drag.',
      'DO express `defaultSize`/`minSize`/`maxSize` as PERCENTAGE STRINGS like `defaultSize="35%"` (react-resizable-panels v4: a bare number is PIXELS, so `defaultSize={35}` renders a 35px sliver, NOT 35% — pass the string). Don\'t fight sizing with a fixed `w-[280px]` className on the panel.',
      "DON'T reach for ResizablePanel when the split is fixed and never user-adjustable — use a plain `Flex`/`ResponsiveGrid`, or `SplitPane` for a simple two-pane layout. Resizable is for *user-draggable* boundaries only.",
      "DO give each panel a stable `id` and use `collapsible` + `collapsedSize` for a side panel the user can fully tuck away (e.g. a filters rail), reacting via `onResize`.",
      "DON'T hand-roll a draggable divider with mouse-move listeners — the primitive handles pointer + keyboard resizing, ARIA separator semantics, and min/max clamping. Always render `<ResizableHandle>`, never a bare styled `<div>`.",
      "DON'T add your own `overflow: auto` wrapper inside a panel: the panel IS the scroll container. Let it own the scrolling and it also manages keyboard reachability — when a panel scrolls but holds nothing focusable, ResizablePanel gives it `tabindex=0` so keyboard users can still reach the clipped content (WCAG 2.1.1); a panel whose content is focusable is left alone, so no redundant tab stop appears. Your own nested scroller gets neither.",
    ],
    useCases: [
      "Master–detail admin layout: a draggable list pane on the left and a detail/preview pane on the right (e.g. 仕訳一覧 | 仕訳詳細).",
      "Collapsible filters or navigation rail beside a data table that operators can widen for long labels or tuck away to maximize the table.",
      "Stacked vertical split (orientation='vertical') such as a results table over a live JSON/log preview in a data-import tool.",
      "Three-pane workbench (nav | content | inspector) where each boundary is independently draggable and layout is persisted via id + onResize.",
    ],
    storyPath: "layout/ResizablePanel.stories.tsx",
    rules: [3, 6],
    example: `import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@godxjp/ui/layout";

<ResizablePanelGroup orientation="horizontal">
  <ResizablePanel id="list" defaultSize="35%" minSize="20%">Panel A</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel id="detail" defaultSize="65%" minSize="40%">Panel B</ResizablePanel>
</ResizablePanelGroup>`,
  },
  {
    name: "Carousel",
    group: "data-display",
    tagline:
      "Embla-backed carousel primitives: previous/next controls, CarouselDots indicators, and a context API.",
    props: [
      {
        name: "opts",
        type: "Parameters<typeof useEmblaCarousel>[0]",
        description: "Embla options.",
      },
      {
        name: "plugins",
        type: "Parameters<typeof useEmblaCarousel>[1]",
        description: "Embla plugins.",
      },
      {
        name: "setApi",
        type: "(api: CarouselApi) => void",
        description:
          "Receive the Embla api for custom logic (autoplay, external prev/next). NOT needed for dots — CarouselDots reads the api from context itself.",
      },
    ],
    usage: [
      "DO compose the full set: `<Carousel>` › `<CarouselContent>` › many `<CarouselItem>`, with `<CarouselPrevious>`/`<CarouselNext>` for arrows and `<CarouselDots>` for the indicator row. Don't render items outside `<CarouselContent>` — the track is the scroll container.",
      "DO use `<CarouselDots>` for the active-slide indicator instead of wiring `setApi` by hand — it reads `selectedIndex`/`scrollSnaps` from the Carousel context, renders one `aria-current` dot per snap, and auto-hides when there is ≤1 slide.",
      "DON'T use a Carousel where ALL items must be seen/compared at once or be keyboard-reachable in reading order (e.g. a list of selectable options, a data table, primary navigation) — hiding content behind a swipe is an anti-pattern there; use a Grid/`ResponsiveGrid`, `ScrollArea`, or `Tabs`.",
      "DON'T autoplay without a pause-on-hover/focus control and reduced-motion respect — pass the Embla autoplay plugin via `plugins` only for non-essential decorative content, never for content the user must read.",
      "DO set `opts={{ loop: true }}` for galleries that wrap, and rely on the built-in disabling: `CarouselPrevious`/`CarouselNext` auto-disable at the ends (via `canScrollPrev`/`canScrollNext`) — don't hide them, let them grey out.",
      "DO give each `<CarouselItem>` real, meaningful content; the component already injects an 'N of M' slide label for screen readers, so don't add a redundant one (a consumer `aria-label` on the item overrides the default).",
    ],
    useCases: [
      "Feature / onboarding highlight cards on a dashboard or landing surface, with CarouselDots showing position.",
      "Image or document thumbnail gallery (e.g. uploaded receipts / 物件写真) with looping and prev/next arrows.",
      "Horizontal stepping list of compact KPI or announcement cards that overflow the viewport width.",
      "Product/plan comparison cards on a marketing page where swiping between a few options is acceptable (not the primary action).",
    ],
    storyPath: "data-display/Carousel.stories.tsx",
    rules: [3, 6],
    example: `import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots } from "@godxjp/ui/data-display";

// CarouselDots reads the Embla api from context — no setApi wiring needed.
<Carousel opts={{ loop: true }}>
  <CarouselContent>
    <CarouselItem>1</CarouselItem>
    <CarouselItem>2</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
  <CarouselDots />
</Carousel>`,
  },
  {
    name: "AppSettingPicker",
    group: "navigation",
    tagline:
      "One provider-bound Select for a single AppProvider setting, chosen by `kind` (locale | timezone | dateFormat | timeFormat | theme | brand | density | fontSize) — covers locale/format AND the four theme axes. Throws if used without AppProvider AND without controlled value+onValueChange.",
    props: [
      {
        name: "kind",
        type: '"locale" | "timezone" | "dateFormat" | "timeFormat" | "theme" | "brand" | "density" | "fontSize"',
        description:
          "Which AppProvider setting this picker reads and writes. Determines the option list, icon, trigger width, and the context value/setter used. The theme-axis kinds (theme/brand/density/fontSize) write <html data-*>; brand's first option opts out (null → app token).",
      },
      {
        name: "value",
        type: "string",
        description:
          "Controlled value for the chosen kind. When omitted, reads the current value from AppProvider context for that kind.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description:
          "Controlled change handler. When omitted, calls the matching AppProvider setter (setLocale/setTimezone/setDateFormat/setTimeFormat). Required together with value when no AppProvider is present.",
      },
      {
        name: "appearance",
        type: '"labeled" | "icon" | "inline"',
        description:
          'Trigger presentation. "labeled" shows the leading icon + selected value: it hugs its content below `sm` (`w-auto max-w-full`) and takes a per-kind fixed width from `sm` up — it no longer stretches to `w-full` on narrow screens, so it fits a topbar (pass className="w-full" for a full-width form field). "icon" is the supported icon-only topbar trigger (e.g. a globe locale switcher): it structurally drops the value text and the picker\'s owned width and hides the chevron, squares the box to the density-aware --control-height tap target (≥44px on touch), and always keeps the localized aria-label so it can never ship nameless. "inline" renders the selected value as a chrome-less text trigger for a legal/auth footer (no border, no box). DEFAULT IS KIND-DEPENDENT: kind="locale" defaults to "icon" (its product contract is the compact language switcher); every other kind defaults to "labeled". Use these instead of overriding internal descendants / width classes with CSS.',
      },
      {
        name: "compact",
        type: "boolean",
        defaultValue: "false",
        description:
          'Compact trigger density (gh#217): re-tiers the box to the official --control-height-sm tier and DROPS the picker\'s owned per-kind width, so a labelled trigger hugs its value. This is the supported auth/legal-footer locale switch — `<AppSettingPicker kind="locale" appearance="labeled" compact />` — when the square icon-only default reads as a stray button but the full labelled trigger is too tall. All geometry is tokenized (--app-setting-picker-compact-{control-height,padding-x,gap,font-size}); the accessible name and the visible value are both preserved. No effect on appearance="inline", which is already chrome-less.',
      },
      {
        name: "className",
        type: "string",
        description: "Extra CSS classes merged onto the SelectTrigger.",
      },
      { name: "disabled", type: "boolean", description: "Disables the Select control." },
      {
        name: "id",
        type: "string",
        description: "HTML id forwarded to the SelectTrigger for label association.",
      },
    ],
    usage: [
      "DO: Mount inside <AppProvider> for zero-config use — the picker reads and writes the context value named by kind, no value/onValueChange needed.",
      "DO: Use controlled mode (value + onValueChange) when managing state outside AppProvider, e.g. a standalone settings form or a Storybook story. Both are required together in this mode.",
      "DO NOT: Render without AppProvider and without both controlled props — it throws 'AppSettingPicker requires <AppProvider> or controlled value + onValueChange'.",
      "DO: Render four instances with different kind values to build a full preferences panel; they all share the same AppProvider context and stay in sync.",
      'DO: For an icon-only topbar utility (a globe language switcher), pass appearance="icon" — the supported compact trigger. NEVER hand-roll it by hiding the value/width with descendant-selector CSS.',
      'DO: For an AUTH/LEGAL FOOTER locale switch, pass appearance="labeled" compact — a small, content-hugging labelled trigger (readable language name, --control-height-sm box). Use appearance="inline" instead when the footer wants no control chrome at all. NEVER re-size the trigger with a page-local height/width class.',
      "DON'T hand-roll a locale/timezone/format Select — AppSettingPicker already composes Select + the right icon + translated, context-wired options. There is no separate LocalePicker/TimezonePicker/DateFormatPicker/TimeFormatPicker anymore; use kind.",
    ],
    useCases: [
      'App-shell top-nav language switcher: <AppSettingPicker kind="locale" /> under AppProvider, persisting to localStorage with no extra state.',
      'Icon-only topbar locale switcher (globe): <AppSettingPicker kind="locale" appearance="icon" /> in a Topbar `end` slot — square, value-less, keyboard + aria-label preserved.',
      'Auth-footer locale switch: <AppSettingPicker kind="locale" appearance="labeled" compact /> inside an <AuthFooter locale={…}> slot — the readable language name at the small control tier, hugging its value.',
      "User settings page with all four preferences — render kind=locale, kind=timezone, kind=dateFormat, kind=timeFormat together under one AppProvider.",
      "Onboarding step that picks language/timezone before the rest of the app is configured — AppProvider persist={false} + controlled values to keep state local.",
      'Storybook/test harness without AppProvider — fully controlled: <AppSettingPicker kind="timeFormat" value="24h" onValueChange={fn} />.',
    ],
    related: [
      "AppProvider — required peer unless fully controlled. Supplies locale/timezone/dateFormat/timeFormat plus their setters and the i18n context.",
      "Select — the data-entry primitive AppSettingPicker is built on; reach for Select directly for any non-AppProvider dropdown.",
      "formatDate — reads the same AppProvider date/time context that kind='dateFormat'/'timeFormat' write to.",
    ],
    example: `{\`// Uncontrolled — AppProvider manages and persists every setting
import { AppProvider } from "@godxjp/ui/app";
import { AppSettingPicker } from "@godxjp/ui/navigation";

export function SettingsPanel() {
  return (
    <AppProvider defaultLocale="ja" defaultTimezone="Asia/Tokyo">
      <AppSettingPicker kind="locale" />
      <AppSettingPicker kind="timezone" />
      <AppSettingPicker kind="dateFormat" />
      <AppSettingPicker kind="timeFormat" />
    </AppProvider>
  );
}

// Controlled — no AppProvider required
import { useState } from "react";
import { AppSettingPicker } from "@godxjp/ui/navigation";

export function LocaleField() {
  const [locale, setLocale] = useState("en");
  return <AppSettingPicker kind="locale" value={locale} onValueChange={setLocale} />;
}

// Icon-only topbar locale switcher (globe) — supported compact trigger, no CSS overrides
import { Topbar } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

export function TopbarLocale() {
  return <Topbar end={<AppSettingPicker kind="locale" appearance="icon" />} />;
}\`}`,
    storyPath: "navigation/AppSettingPicker.stories.tsx",
    rules: [3, 5, 6, 23],
  },
  {
    name: "Field",
    group: "data-entry",
    tagline:
      "Label + optional description laid out beside a single checkbox/radio/switch control — the inline alternative to FormField's full block layout.",
    props: [
      {
        name: "id",
        type: "string",
        description: "id wired to the control via htmlFor; pass the same id to the child control.",
      },
      { name: "label", type: "ReactNode", description: "The field label, rendered as a <Label>." },
      {
        name: "description",
        type: "ReactNode",
        description: "Optional helper text rendered under the label.",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "The control (Checkbox/Radio/Switch) placed beside the label.",
      },
      { name: "className", type: "string", description: "Extra CSS classes on the wrapper." },
    ],
    usage: [
      "DO: Use Field to label a single boolean/choice control (Switch, Checkbox, Radio) in a compact two-column row — control beside label + description.",
      "DO: Match the child control's id to Field's id so the label is correctly associated.",
      "DON'T: Use Field for text inputs needing helper/error/required slots — use FormField (block layout) instead. There is no ChoiceField anymore; Field is the canonical name.",
    ],
    useCases: [
      "A settings list of toggle rows (notifications, auto-save) where each Switch has a label + description.",
      "A consent checkbox with an explanatory description beside it.",
      "A radio option row in a preferences form.",
    ],
    related: [
      "FormField — block label/helper/error/required layout for text inputs; use it instead when those slots are needed.",
      "Switch / Checkbox / Radio — the controls Field typically wraps.",
    ],
    example: `{\`import { Field, Switch } from "@godxjp/ui/data-entry";

export function NotifyRow() {
  return (
    <Field id="notify" label="メール通知" description="重要な更新をメールで受け取る">
      <Switch id="notify" defaultChecked />
    </Field>
  );
}\`}`,
    storyPath: "data-entry/Field.stories.tsx",
    rules: [23],
  },
  // ─── charts (tree-shaken `@godxjp/ui/charts`; needs the `recharts` optional peer) ───
  {
    name: "LineChart",
    group: "data-display",
    importPath: "@godxjp/ui/charts",
    tagline:
      "Trends over an ordered category axis — one or more series, locale-formatted ticks/tooltips, screen-reader text alternative built in. Data-visualization graph / plot.",
    props: [
      {
        name: "data",
        type: "ChartDatum[]",
        required: true,
        description: "Row data: one category per row with a numeric value per series.",
      },
      {
        name: "series",
        type: "ChartSeriesProp[]",
        required: true,
        description:
          "Plotted series: { dataKey, label?, color? }. Colour defaults to the --chart-1..6 palette.",
      },
      {
        name: "categoryKey",
        type: "string",
        required: true,
        description: "Key into each datum holding the x-axis category label.",
      },
      {
        name: "label",
        type: "string",
        required: true,
        description: "Accessible name + visible caption (role=img needs a name).",
      },
      {
        name: "description",
        type: "string",
        description: "Extra context appended to the screen-reader description.",
      },
      {
        name: "size",
        type: '"xs" | "sm" | "md" | "lg"',
        defaultValue: '"md"',
        description: "Canvas height preset. Ignored when `height` is set.",
      },
      {
        name: "height",
        type: "number",
        description: "Explicit canvas height in px (overrides `size`).",
      },
      {
        name: "showLegend",
        type: "boolean",
        defaultValue: "true",
        description: "Show the series legend.",
      },
      {
        name: "showGrid",
        type: "boolean",
        defaultValue: "true",
        description: "Show the cartesian background grid.",
      },
      {
        name: "numberFormat",
        type: "Intl.NumberFormatOptions",
        description: "Locale-aware formatting for axis ticks + tooltip values.",
      },
      {
        name: "curved",
        type: "boolean",
        defaultValue: "false",
        description: "Render smooth (monotone) lines instead of straight segments.",
      },
      {
        name: "emptyMessage",
        type: "string",
        description: "Message shown when `data` is empty (defaults to a localized 'no data').",
      },
    ],
    usage: [
      'DO import from the tree-shaken charts entry: `import { LineChart } from "@godxjp/ui/charts";`. Importing any other subpath never pulls in recharts.',
      "DO install the `recharts` optional peer dependency in the consuming app — charts are the only part of @godxjp/ui that needs it, so apps without charts never pay for it.",
      "DO pass an i18n'd `label` — it is both the visible caption and the accessible name; the component also emits a screen-reader list of the plotted values (WCAG 1.1.1).",
      "DO pre-translate each series' `label`; pass `numberFormat` (e.g. { style: 'currency', currency: 'JPY' }) and the axis/tooltip numbers localize automatically via Intl.",
      "DON'T hand-roll an SVG/canvas chart or drop raw recharts into a page — LineChart owns the colour tokens, locale formatting, empty state, and accessibility wiring.",
    ],
    useCases: [
      "Revenue / KPI trend over months in a dashboard.",
      "Multi-series comparison (e.g. plan vs actual) across a time axis.",
      "Any continuous metric where the shape of the trend is the message.",
    ],
    related: [
      "AreaChart — use when the filled magnitude under the line matters (cumulative/stacked volume).",
      "BarChart — use for discrete category comparison rather than a continuous trend.",
      "DataTable — use when exact per-row figures matter more than the trend shape.",
    ],
    example: `import { LineChart } from "@godxjp/ui/charts";

<LineChart
  label={t("dashboard.revenueTrend")}
  data={data}
  categoryKey="month"
  series={[
    { dataKey: "plan", label: t("metric.plan") },
    { dataKey: "actual", label: t("metric.actual") },
  ]}
  numberFormat={{ style: "currency", currency: "JPY" }}
/>`,
    storyPath: "charts/LineChart.stories.tsx",
    rules: [],
  },
  {
    name: "BarChart",
    group: "data-display",
    importPath: "@godxjp/ui/charts",
    tagline:
      "Compare a value across categories — grouped or `stacked`, vertical or `horizontal`, with localized ticks/tooltips and a built-in text alternative. Data-visualization graph / plot / diagram.",
    props: [
      {
        name: "data",
        type: "ChartDatum[]",
        required: true,
        description: "Row data: one category per row with a numeric value per series.",
      },
      {
        name: "series",
        type: "ChartSeriesProp[]",
        required: true,
        description: "Plotted series: { dataKey, label?, color? }.",
      },
      {
        name: "categoryKey",
        type: "string",
        required: true,
        description: "Key into each datum holding the category label.",
      },
      {
        name: "label",
        type: "string",
        required: true,
        description: "Accessible name + visible caption.",
      },
      {
        name: "description",
        type: "string",
        description: "Extra context appended to the screen-reader description.",
      },
      {
        name: "size",
        type: '"xs" | "sm" | "md" | "lg"',
        defaultValue: '"md"',
        description: "Canvas height preset. Ignored when `height` is set.",
      },
      {
        name: "height",
        type: "number",
        description: "Explicit canvas height in px (overrides `size`).",
      },
      {
        name: "showLegend",
        type: "boolean",
        defaultValue: "true",
        description: "Show the series legend.",
      },
      {
        name: "showGrid",
        type: "boolean",
        defaultValue: "true",
        description: "Show the cartesian background grid.",
      },
      {
        name: "numberFormat",
        type: "Intl.NumberFormatOptions",
        description: "Locale-aware formatting for ticks + tooltip values.",
      },
      {
        name: "stacked",
        type: "boolean",
        defaultValue: "false",
        description: "Stack series into one bar instead of grouping side by side.",
      },
      {
        name: "horizontal",
        type: "boolean",
        defaultValue: "false",
        description: "Lay bars out horizontally (category on the y-axis).",
      },
      { name: "emptyMessage", type: "string", description: "Message shown when `data` is empty." },
    ],
    usage: [
      'DO import from the charts entry: `import { BarChart } from "@godxjp/ui/charts";` (recharts optional peer required).',
      "DO use `horizontal` when category labels are long (they read better on the y-axis).",
      "DO use `stacked` for part-to-whole-per-category; keep grouped (default) for direct side-by-side comparison.",
      "DON'T use BarChart for a single part-to-whole total — that is PieChart. DON'T fake bars with styled divs.",
    ],
    useCases: [
      "Sales by region / category comparison.",
      "Stacked composition per period (e.g. expense breakdown by month).",
      "Ranking with long labels (horizontal).",
    ],
    related: [
      "LineChart — continuous trend rather than discrete comparison.",
      "PieChart — single part-to-whole composition.",
      "DataTable — exact tabular figures.",
    ],
    example: `import { BarChart } from "@godxjp/ui/charts";

<BarChart
  label={t("report.salesByRegion")}
  data={data}
  categoryKey="region"
  series={[{ dataKey: "sales", label: t("metric.sales") }]}
  numberFormat={{ notation: "compact" }}
/>`,
    storyPath: "charts/BarChart.stories.tsx",
    rules: [],
  },
  {
    name: "CompactBarTrend",
    group: "data-display",
    importPath: "@godxjp/ui/charts/compact-bar-trend",
    tagline:
      "DEPENDENCY-FREE compact vertical bar trend for dashboard summary cards — N category/value pairs, muted marks plus ONE emphasized 'current' bar, all geometry from --chart-trend-* tokens. Needs NO recharts. Sparkline / micro-chart / activity pulse / KPI trend strip.",
    props: [
      {
        name: "data",
        type: "ChartDatum[]",
        required: true,
        description: "Row data — one bar per row. Any point count (7 is not hard-coded).",
      },
      {
        name: "categoryKey",
        type: "string",
        required: true,
        description: "Key into each datum holding the category (tick) label.",
      },
      {
        name: "valueKey",
        type: "string",
        required: true,
        description: "Key into each datum holding the plotted numeric value.",
      },
      {
        name: "label",
        type: "string",
        required: true,
        description: "Accessible name + visible caption.",
      },
      {
        name: "description",
        type: "string",
        description: "Extra context appended to the screen-reader description.",
      },
      {
        name: "size",
        type: '"xs" | "sm" | "md" | "lg"',
        defaultValue: '"xs"',
        description:
          "Plot-height tier (--chart-trend-plot-height-*). xs is the dashboard summary-card density.",
      },
      {
        name: "emphasizedIndex",
        type: "number",
        description:
          "Index of the emphasized 'current' bar. Negative counts from the end (-1 = latest); out of range = no emphasis. Also annotated in the text alternative, so it is never colour-only.",
      },
      {
        name: "showCategoryLabels",
        type: "boolean",
        defaultValue: "true",
        description: "Render the category tick labels under the plot.",
      },
      {
        name: "numberFormat",
        type: "Intl.NumberFormatOptions",
        description: "Locale-aware formatting for the values in the text alternative.",
      },
      {
        name: "footer",
        type: "ReactNode",
        description:
          "Activity footer slot below the plot, rendered OUTSIDE the role=img graphic so links/buttons in it stay reachable.",
      },
      { name: "emptyMessage", type: "string", description: "Message shown when `data` is empty." },
      {
        name: "ref",
        type: "React.Ref<HTMLElement>",
        description: "Forwarded to the <figure> element.",
      },
    ],
    usage: [
      'DO import from the isolated entry: `import { CompactBarTrend } from "@godxjp/ui/charts/compact-bar-trend";` — unlike the charts barrel, this path never links modules that require the optional `recharts` peer.',
      'DO reach for it INSIDE a dashboard summary card (a 7-day signup/organization/activity strip under a StatCard headline) — that is the density `size="xs"` is tuned for.',
      "DO mark the current period with `emphasizedIndex={-1}` (or an explicit index); the highlight is duplicated in the screen-reader text alternative, so it never depends on colour alone.",
      "DO retheme through the `--chart-trend-*` tokens (bar gap/radius/width, plot heights, muted + emphasis fills, opt-in baseline). NEVER add page-local CSS, an inline height calculation, or a hardcoded colour.",
      "DON'T use it when you need axes, a grid, tooltips, multiple series, or a continuous trend — that is BarChart / LineChart / AreaChart (recharts peer). DON'T fake bars with styled divs in the app.",
      'DON\'T put interactive content in the plot: anything clickable goes in `footer`, which renders outside the `role="img"` graphic.',
    ],
    useCases: [
      "Seven-day new-organizations / new-users trend inside an admin dashboard summary card (SCR-201).",
      "Weekly activity pulse beside a KPI headline, where the SHAPE matters more than exact figures.",
      "A dependency-constrained app (no recharts) that still needs a token-driven chart.",
    ],
    related: [
      "BarChart — full cartesian bar chart with axes/grid/tooltip/legend (requires the recharts optional peer).",
      "StatCard — the KPI headline this trend usually sits under.",
      "Progress — one ratio against a target, not a series over time.",
    ],
    example: `import { CompactBarTrend } from "@godxjp/ui/charts/compact-bar-trend";

<CompactBarTrend
  label={t("dashboard.newOrganizations7d")}
  description={t("dashboard.newOrganizationsHint")}
  data={trend}
  categoryKey="date"
  valueKey="count"
  emphasizedIndex={-1}
  size="xs"
  footer={<Text size="xs" tone="muted">{t("dashboard.lastUpdated", { at })}</Text>}
/>`,
    storyPath: "charts/CompactBarTrend.stories.tsx",
    rules: [],
  },
  {
    name: "AreaChart",
    group: "data-display",
    importPath: "@godxjp/ui/charts",
    tagline:
      "Magnitude over an ordered category axis — overlay or `stacked` areas, optional `curved` smoothing, localized formatting + text alternative. Data-visualization graph / plot.",
    props: [
      {
        name: "data",
        type: "ChartDatum[]",
        required: true,
        description: "Row data: one category per row with a numeric value per series.",
      },
      {
        name: "series",
        type: "ChartSeriesProp[]",
        required: true,
        description: "Plotted series: { dataKey, label?, color? }.",
      },
      {
        name: "categoryKey",
        type: "string",
        required: true,
        description: "Key into each datum holding the x-axis category label.",
      },
      {
        name: "label",
        type: "string",
        required: true,
        description: "Accessible name + visible caption.",
      },
      {
        name: "description",
        type: "string",
        description: "Extra context appended to the screen-reader description.",
      },
      {
        name: "size",
        type: '"xs" | "sm" | "md" | "lg"',
        defaultValue: '"md"',
        description: "Canvas height preset. Ignored when `height` is set.",
      },
      {
        name: "height",
        type: "number",
        description: "Explicit canvas height in px (overrides `size`).",
      },
      {
        name: "showLegend",
        type: "boolean",
        defaultValue: "true",
        description: "Show the series legend.",
      },
      {
        name: "showGrid",
        type: "boolean",
        defaultValue: "true",
        description: "Show the cartesian background grid.",
      },
      {
        name: "numberFormat",
        type: "Intl.NumberFormatOptions",
        description: "Locale-aware formatting for ticks + tooltip values.",
      },
      {
        name: "stacked",
        type: "boolean",
        defaultValue: "false",
        description: "Stack series areas instead of overlaying them.",
      },
      {
        name: "curved",
        type: "boolean",
        defaultValue: "false",
        description: "Render smooth (monotone) areas instead of straight segments.",
      },
      { name: "emptyMessage", type: "string", description: "Message shown when `data` is empty." },
    ],
    usage: [
      'DO import from the charts entry: `import { AreaChart } from "@godxjp/ui/charts";` (recharts optional peer required).',
      "DO use `stacked` to show how parts accumulate into a total over time.",
      "DON'T overlay more than 2-3 unstacked areas — fill opacity makes dense overlays unreadable; switch to LineChart.",
    ],
    useCases: [
      "Cumulative volume over time (e.g. total transactions per day).",
      "Stacked composition trend (traffic sources, revenue streams).",
    ],
    related: [
      "LineChart — when only the trend line matters, not the filled magnitude.",
      "BarChart — discrete category comparison.",
    ],
    example: `import { AreaChart } from "@godxjp/ui/charts";

<AreaChart
  label={t("dashboard.trafficByChannel")}
  data={data}
  categoryKey="day"
  series={[
    { dataKey: "organic", label: t("channel.organic") },
    { dataKey: "paid", label: t("channel.paid") },
  ]}
  stacked
/>`,
    storyPath: "charts/AreaChart.stories.tsx",
    rules: [],
  },
  {
    name: "PieChart",
    group: "data-display",
    importPath: "@godxjp/ui/charts",
    tagline:
      "Part-to-whole composition across a small set of slices — `donut` option, localized tooltips, and a screen-reader breakdown of every slice. Data-visualization graph / diagram.",
    props: [
      {
        name: "data",
        type: "ChartDatum[]",
        required: true,
        description: "Row data: one slice per row.",
      },
      {
        name: "dataKey",
        type: "string",
        required: true,
        description: "Key into each datum holding the slice's numeric value.",
      },
      {
        name: "nameKey",
        type: "string",
        required: true,
        description: "Key into each datum holding the slice's category label.",
      },
      {
        name: "label",
        type: "string",
        required: true,
        description: "Accessible name + visible caption.",
      },
      {
        name: "colors",
        type: "string[]",
        description: "Per-slice colours by index (defaults to the --chart-1..6 palette).",
      },
      {
        name: "description",
        type: "string",
        description: "Extra context appended to the screen-reader description.",
      },
      {
        name: "size",
        type: '"xs" | "sm" | "md" | "lg"',
        defaultValue: '"md"',
        description: "Canvas height preset. Ignored when `height` is set.",
      },
      {
        name: "height",
        type: "number",
        description: "Explicit canvas height in px (overrides `size`).",
      },
      {
        name: "showLegend",
        type: "boolean",
        defaultValue: "true",
        description: "Show the slice legend.",
      },
      {
        name: "numberFormat",
        type: "Intl.NumberFormatOptions",
        description: "Locale-aware formatting for tooltip values.",
      },
      {
        name: "donut",
        type: "boolean",
        defaultValue: "false",
        description: "Render a donut (hollow centre) instead of a full pie.",
      },
      { name: "emptyMessage", type: "string", description: "Message shown when `data` is empty." },
    ],
    usage: [
      'DO import from the charts entry: `import { PieChart } from "@godxjp/ui/charts";` (recharts optional peer required).',
      "DO keep slices few (≈2–6) — pies are unreadable past a handful; use BarChart for many categories.",
      "DO pass `numberFormat` (e.g. percent or currency) so tooltip values localize.",
      "DON'T use a pie for trends over time (LineChart/AreaChart) or precise comparison (BarChart).",
    ],
    useCases: [
      "Budget / expense split across a few categories.",
      "Market or status share (e.g. paid vs overdue vs draft).",
    ],
    related: [
      "BarChart — when there are many categories or precise comparison matters.",
      "Progress — single ratio against a target rather than a multi-slice split.",
    ],
    example: `import { PieChart } from "@godxjp/ui/charts";

<PieChart
  label={t("dashboard.expenseSplit")}
  data={data}
  dataKey="amount"
  nameKey="category"
  numberFormat={{ style: "currency", currency: "JPY" }}
  donut
/>`,
    storyPath: "charts/PieChart.stories.tsx",
    rules: [],
  },
  {
    name: "CommandPalette",
    group: "data-entry",
    tagline:
      "Searchable command dialog with controlled or uncontrolled open state and consumer-owned selection.",
    props: [
      {
        name: "groups",
        type: "CommandPaletteGroup[]",
        required: true,
        description: "Grouped command items.",
      },
      {
        name: "labels",
        type: "CommandPaletteLabels",
        required: true,
        description: "Localized dialog and search copy.",
      },
      {
        name: "onSelect",
        type: "(item: CommandPaletteItem) => void",
        required: true,
        description: "Consumer-owned selection handler.",
      },
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "defaultOpen",
        type: "boolean",
        defaultValue: "false",
        description: "Initial uncontrolled open state.",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open-state callback.",
      },
      {
        name: "search",
        type: "string",
        description: "Controlled search-box query. Pairs with `onSearchChange`.",
      },
      {
        name: "defaultSearch",
        type: "string",
        defaultValue: '""',
        description:
          "Initial uncontrolled query, and the value the palette resets to when it closes.",
      },
      {
        name: "onSearchChange",
        type: "(query: string) => void",
        description:
          "Fires on every keystroke with the current query — the seam for search-as-you-type. Also fires with `defaultSearch` when the palette closes.",
      },
      {
        name: "shouldFilter",
        type: "boolean",
        defaultValue: "true",
        description:
          "Whether the palette filters `groups` itself. Set false for server-side search, which also hands the empty node to the palette (derived from `groups`).",
      },
      {
        name: "loading",
        type: "boolean",
        defaultValue: "false",
        description: "Shows the supplied loading content.",
      },
      { name: "error", type: "ReactNode", description: "Consumer-supplied error content." },
    ],
    usage: [
      "Provide localized labels and real command groups; the component does not fetch commands.",
      "Use either `open` plus `onOpenChange` or `defaultOpen`; do not mirror both state models.",
      "Search-as-you-type against an API: read the query from `onSearchChange`, pass the results back as `groups`, and set `shouldFilter={false}` so the rows are not scored a second time against the same string.",
      "The empty-state contract: with `shouldFilter` (default) cmdk decides — items exist, the query matches none. With `shouldFilter={false}` the PALETTE decides from props — `labels.empty` renders when `groups` carries no items, and never while `loading` or `error` is set. Hold `loading` for the whole in-flight window: a request that has not answered yet is not an empty result, and asserting over cmdk's own empty node races an async group that populates a frame late.",
    ],
    example: `import { CommandPalette } from "@godxjp/ui/data-entry";

<CommandPalette
  groups={[{ id: "pages", label: "Pages", items: [{ id: "home", label: "Home" }] }]}
  labels={{ open: "Open commands", title: "Commands", description: "Choose a command", placeholder: "Search", empty: "No results" }}
  onSelect={(item) => navigate(item.id)}
/>`,
    storyPath: "data-entry/CommandPalette.stories.tsx",
    rules: [],
  },
  {
    name: "TwoFactorSetup",
    group: "feedback",
    tagline:
      "Canonical two-factor enrollment dialog for QR/manual-key verification and recovery-code acknowledgement.",
    props: [
      { name: "open", type: "boolean", required: true, description: "Controlled dialog state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        required: true,
        description: "Dialog state callback.",
      },
      {
        name: "manualKey",
        type: "string",
        required: true,
        description: "Consumer-provided enrollment secret.",
      },
      {
        name: "qrValue",
        type: "string",
        description: "Optional QR payload for the same enrollment secret.",
      },
      { name: "code", type: "string", required: true, description: "Current verification code." },
      {
        name: "onCodeChange",
        type: "(code: string) => void",
        required: true,
        description: "Verification-code callback.",
      },
      {
        name: "onConfirm",
        type: "() => void",
        required: true,
        description: "Consumer-owned verification action.",
      },
      {
        name: "recoveryCodes",
        type: "string[]",
        description: "Codes shown only after successful enrollment.",
      },
      {
        name: "onAcknowledge",
        type: "() => void",
        required: true,
        description: "Recovery-code acknowledgement action.",
      },
      {
        name: "labels",
        type: "TwoFactorSetupLabels",
        required: true,
        description: "All localized copy.",
      },
      {
        name: "pending",
        type: "boolean",
        defaultValue: "false",
        description: "Disables actions while the consumer request runs.",
      },
    ],
    usage: [
      "Keep enrollment, verification, persistence, and secret lifecycle in the consumer; this component is presentational.",
      "Only pass recovery codes after verification succeeds, and clear them when the dialog lifecycle ends.",
    ],
    example: `import { TwoFactorSetup } from "@godxjp/ui/feedback";

<TwoFactorSetup
  open={open}
  onOpenChange={setOpen}
  qrValue={enrollment.qr}
  manualKey={enrollment.secret}
  code={code}
  onCodeChange={setCode}
  onConfirm={verify}
  recoveryCodes={recoveryCodes}
  onAcknowledge={finish}
  labels={labels}
/>`,
    storyPath: "feedback/TwoFactorSetup.stories.tsx",
    rules: [],
  },
  {
    name: "AuthDivider",
    group: "layout",
    tagline: "Localized auth-form divider with equal rules and an accessible separator label.",
    props: [
      {
        name: "label",
        type: "string",
        required: true,
        description: "Localized conjunction such as “or”.",
      },
      { name: "className", type: "string", description: "Optional structural class override." },
    ],
    example: `import { AuthDivider } from "@godxjp/ui/layout";

<AuthDivider label="or" />`,
    storyPath: "layout/AuthDivider.stories.tsx",
    rules: [],
  },
  {
    name: "AuthFooter",
    group: "layout",
    tagline:
      "Compact hosted-auth footer for consumer-owned product, legal, privacy, and locale content.",
    props: [
      {
        name: "product",
        type: "ReactNode",
        required: true,
        description: "Product identity content.",
      },
      {
        name: "terms",
        type: "ReactNode",
        required: true,
        description: "Terms link or localized text.",
      },
      {
        name: "privacy",
        type: "ReactNode",
        required: true,
        description: "Privacy link or localized text.",
      },
      { name: "locale", type: "ReactNode", description: "Optional consumer-owned locale control." },
      {
        name: "className",
        type: "string",
        description: "Optional structural class override merged onto the footer root.",
      },
    ],
    usage: [
      "Pass real links and locale controls from the consumer; AuthFooter never invents navigation.",
      "DO drop it into AuthShell's `footer` slot — that slot supplies the contentinfo landmark, so AuthFooter itself renders a plain div and can also sit inside an existing footer without nesting landmarks.",
      "AuthFooter owns ONLY the geometry: mono ramp, wrap, and a `·` separator between the slots that are actually PRESENT (omit `locale` and its separator disappears). Don't hand-write separators into the slot content.",
      "Public type: `AuthFooterProp` (alias `AuthFooterProps`) from `@godxjp/ui/layout` — registered in the prop registry, not a local interface.",
      "Retune the line through `--auth-footer-content-gap` / `--auth-footer-text-font-size`, never page CSS (rule #45).",
    ],
    example: `import { AuthFooter } from "@godxjp/ui/layout";

<AuthFooter product="Acme ID" terms={<a href="/terms">Terms</a>} privacy={<a href="/privacy">Privacy</a>} locale="English" />`,
    storyPath: "layout/AuthFooter.stories.tsx",
    rules: [45],
  },
  {
    name: "AuthIdentity",
    group: "layout",
    tagline:
      "Hosted-auth identity heading with the shared mark and optional requesting-client context.",
    props: [
      { name: "title", type: "ReactNode", required: true, description: "Primary auth heading." },
      {
        name: "requester",
        type: "ReactNode",
        description: "Optional real requesting-client context.",
      },
      {
        name: "className",
        type: "string",
        description: "Optional structural class override merged onto the identity root.",
      },
    ],
    usage: [
      "Only show `requester` when the consumer has authoritative client context.",
      'It ALREADY renders the canonical brand-green GoDX mark (`Logo mark="godx" tone="success"`, independent of --primary) plus the page h1 — don\'t add a second Logo or heading above it.',
      "Centring and rhythm are token-owned (`--auth-identity-gap` / `--auth-requester-*`); no page CSS (rule #45).",
      "Public type: `AuthIdentityProp` (alias `AuthIdentityProps`) from `@godxjp/ui/layout` — registered in the prop registry, not a local interface.",
    ],
    example: `import { AuthIdentity } from "@godxjp/ui/layout";

<AuthIdentity title="Sign in" requester="Acme Portal is requesting access" />`,
    storyPath: "layout/AuthIdentity.stories.tsx",
    rules: [45],
  },
  {
    name: "AuthAccountSummary",
    group: "layout",
    tagline:
      "Compact signed-in account row for hosted auth: avatar fallback, authoritative email and switch action.",
    props: [
      {
        name: "email",
        type: "string",
        required: true,
        description: "Authoritative signed-in email.",
      },
      { name: "avatarSrc", type: "string", description: "Optional real avatar URL." },
      {
        name: "avatarFallback",
        type: "ReactNode",
        description: "Optional localized/text fallback; defaults to a user glyph.",
      },
      {
        name: "actionLabel",
        type: "ReactNode",
        required: true,
        description: "Localized visible switch-account action label.",
      },
      {
        name: "onAction",
        type: "() => void",
        required: true,
        description: "Consumer-owned account-switch navigation/action.",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Disable the action while the consumer cannot switch.",
      },
      { name: "className", type: "string", description: "Optional structural class override." },
    ],
    usage: [
      "Pass only the authoritative signed-in email; AuthAccountSummary never fetches or invents identity data.",
      "Pass localized actionLabel and the existing account-switch handler. The component owns no route, mutation or permission behavior.",
      "The package owns avatar fallback, long-email truncation, responsive action wrapping and keyboard focus. Retune only through --auth-account-summary-* tokens.",
    ],
    useCases: [
      "OAuth device consent and authorization cards where the user must confirm or switch the signed-in account.",
      "Hosted consent screens that need a compact identity confirmation row without a second profile card.",
    ],
    related: [
      "AuthIdentity — page identity heading and requesting-client context; use AuthAccountSummary inside the card for the signed-in user.",
      "Avatar — use Avatar directly for general profile surfaces; AuthAccountSummary owns only the compact hosted-auth row.",
    ],
    example: `import { AuthAccountSummary } from "@godxjp/ui/layout";

<AuthAccountSummary email={user.email} actionLabel={t("auth.switchAccount")} onAction={switchAccount} />`,
    storyPath: "layout/AuthAccountSummary.stories.tsx",
    rules: [45],
  },
  {
    name: "AuthStack",
    group: "layout",
    tagline: "Token-spaced vertical stack for direct sections inside a canonical auth card.",
    props: [
      { name: "children", type: "ReactNode", description: "Auth sections in visual order." },
      { name: "className", type: "string", description: "Optional structural class override." },
    ],
    example: `import { AuthStack } from "@godxjp/ui/layout";

<AuthStack><PasskeyAction /><CredentialsForm /></AuthStack>`,
    storyPath: "layout/AuthStack.stories.tsx",
    rules: [],
  },
  {
    name: "OrgSwitcher",
    group: "layout",
    tagline:
      "Searchable organization switcher with canonical trigger geometry, desktop popover, and mobile sheet.",
    props: [
      {
        name: "organizations",
        type: "readonly OrgSwitcherOrganization[]",
        required: true,
        description: "Consumer-provided organization choices.",
      },
      { name: "value", type: "string", description: "Selected organization id." },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Selection callback; persistence remains consumer-owned.",
      },
      {
        name: "labels",
        type: "OrgSwitcherLabels",
        required: true,
        description: "Localized trigger, search, state, and retry copy.",
      },
      {
        name: "collapsed",
        type: "boolean",
        defaultValue: "false",
        description: "Compact trigger presentation.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables the trigger.",
      },
      {
        name: "loading",
        type: "boolean",
        defaultValue: "false",
        description: "Shows the loading state.",
      },
      { name: "error", type: "ReactNode", description: "Consumer-supplied error state." },
      { name: "onRetry", type: "() => void", description: "Consumer-owned retry callback." },
      {
        name: "responsive",
        type: '"auto" | "popover" | "sheet"',
        defaultValue: '"auto"',
        description:
          'Responsive presentation contract. "auto" resolves through the SHARED Sheet hook useSheetResponsiveMode(): desktop popover above --sheet-responsive-breakpoint-width (48rem/768px), focus-trapped bottom Sheet at/below it. Move that one token to move the line for every overlay.',
      },
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open-state callback.",
      },
    ],
    usage: [
      "Provide only organizations the current user may select; the component does not authorize or fetch tenants.",
      "Keep persistence and navigation in `onValueChange`; use loading/error props for the real query state.",
      "DO put a plan/status affordance in `organization.badge` (a <Badge>) instead of stuffing it into `meta` — the badge is end-aligned in the expanded trigger and in the menu row, and hidden in the collapsed rail. ALWAYS pair it with a localized `organization.badgeLabel`: the trigger's accessible name comes from `labels.trigger`, so the badge is announced as an aria-describedby DESCRIPTION and the raw node is marked presentational (WCAG 1.1.1). `badgeLabel` also becomes a search keyword.",
      'DON\'T wrap OrgSwitcher in your own media query to pick popover vs sheet — `responsive="auto"` already reads the shared --sheet-responsive-breakpoint-width token.',
    ],
    example: `import { OrgSwitcher } from "@godxjp/ui/layout";
import { Badge } from "@godxjp/ui/data-display";

<OrgSwitcher
  organizations={[
    {
      id: "dxs",
      name: "DXS Holdings",
      meta: t("org.role.owner"),
      badge: <Badge variant="secondary">{t("org.plan.trial")}</Badge>,
      badgeLabel: t("org.plan.trial.sr"),
    },
  ]}
  value={organizationId}
  onValueChange={setOrganizationId}
  labels={labels}
/>`,
    storyPath: "layout/OrgSwitcher.stories.tsx",
    rules: [],
  },
  {
    name: "FilterBar",
    group: "navigation",
    tagline:
      "Domain-neutral list-page filter toolbar with optional clear action and labelled groups.",
    props: [
      {
        name: "children",
        type: "ReactNode",
        description:
          "Filter controls and groups (composition form). In the typed-model form children remain valid as CUSTOM filters, rendered after the typed `filters`.",
      },
      {
        name: "onClear",
        type: "() => void",
        description: "Consumer-owned clear/reset action — also the chips' clear-all.",
      },
      {
        name: "hasActiveFilters",
        type: "boolean",
        defaultValue: "true",
        description: "Shows clear only when filters are active.",
      },
      {
        name: "sticky",
        type: "boolean",
        defaultValue: "false",
        description: "Uses the token-owned sticky presentation.",
      },
      {
        name: "overflow",
        type: "'wrap' | 'scroll'",
        defaultValue: "'wrap'",
        description:
          "Responsive overflow strategy (gh#216). 'wrap': stacked column below 640px, wrapping rows above. 'scroll': one bounded inline-scrolling row above 640px (still stacked below) with the clear-all action pinned at the inline end. The geometry is entirely token/CSS owned — never re-implement it in the page.",
      },
      {
        name: "search",
        type: "FilterBarSearchProp",
        description:
          "Typed model (gh#258): search slot, first in the strip, token-owned width (--filter-bar-search-width). Presence of ANY model prop (search/filters/chips/onChipRemove/actions/resultCount/loading/disabled/error) activates the model layout; without them the composition form renders unchanged.",
      },
      {
        name: "filters",
        type: "FilterBarFilterProp[]",
        description:
          "Typed model: labelled Select filters ({ value, label, options, selected/defaultSelected/onSelectedChange, placeholder, disabled }) — label becomes the control's real <label>. Width knob: --filter-bar-filter-width.",
      },
      {
        name: "chips",
        type: "FilterBarChipProp[]",
        description:
          "Typed model: applied-filter chips ({ value, label, disabled }) in a labelled row. Add = include in the array; remove = onChipRemove(value); clear-all = onClear.",
      },
      {
        name: "onChipRemove",
        type: "(value: string) => void",
        description: "Per-chip remove handler; required for the × remove buttons to render.",
      },
      {
        name: "actions",
        type: "ReactNode",
        description:
          "Typed model: trailing action slot at the inline end, after reset in DOM/keyboard order.",
      },
      {
        name: "resultCount",
        type: "number",
        description:
          "Typed model: localized CLDR-pluralized count in a polite role='status' line; 0 is the rendered empty state.",
      },
      {
        name: "loading",
        type: "boolean",
        description: "Typed model: aria-busy strip + data-loading root while results (re)load.",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Typed model: disables all model-rendered controls.",
      },
      {
        name: "error",
        type: "ReactNode",
        description: "Typed model: role='alert' error line replacing the result count.",
      },
      { name: "className", type: "string", description: "Optional structural class override." },
    ],
    usage: [
      "Prefer the typed model for a canonical list page (gh#258): pass `search` + `filters` + `chips` + `resultCount` and the bar owns the layout, widths, chip lifecycle, keyboard order (search → filters → children → reset → actions → chip removes) and responsive stacking through --filter-bar-* tokens. Everything stays consumer data — the bar renders state, never owns it.",
      "Compose real controls as children when the model doesn't fit; filter state and URL synchronization remain consumer-owned. Children also render INSIDE the model layout (after the typed filters) for one-off custom controls like a date-range picker.",
      "Give each FilterBarGroup a `controlId` matching its single control's `id` (gh#216) so the visible caption is that control's real <label>; otherwise the control is nameless to a screen reader. Typed `filters` wire this automatically.",
      "Reach for `overflow='scroll'` on filter-heavy list pages so a long JA/EN/VI label set never grows the strip into multiple rows and pushes the table below the fold.",
      "A mobile sheet presentation is a COMPOSITION, not a prop: put the same typed FilterBar inside a Sheet triggered from a compact toolbar when a screen wants drawer-style filters. The bar's own responsive behavior is stack (below 640px) + wrap/scroll (above), token-owned.",
    ],
    example: `import { FilterBar } from "@godxjp/ui/navigation";

<FilterBar
  search={{ value: query, onValueChange: setQuery, placeholder: "Search records" }}
  filters={[
    {
      value: "status",
      label: "Status",
      options: STATUS_OPTIONS,
      selected: status,
      onSelectedChange: setStatus,
    },
  ]}
  chips={appliedChips}
  onChipRemove={removeFilter}
  onClear={clearFilters}
  hasActiveFilters={hasFilters}
  resultCount={rows.length}
  actions={<Button onClick={openCreate}>Add member</Button>}
/>`,
    storyPath: "navigation/FilterBar.stories.tsx",
    rules: [],
  },
  // ─── RBAC composites (gh#257 / DXS platform#311) ────────────────────────
  {
    name: "PermissionMatrix",
    group: "data-display",
    tagline:
      "Canonical role × permission grid — sticky permission column, shape-encoded ✓/— cells (never colour-only), optional editable checkbox mode, two-role compare with a 差分のみ filter, and the DataTable #216 lifecycle states (loading → denied → error → empty). Domain data is 100% consumer-supplied.",
    props: [
      {
        name: "roles",
        type: "{ id: string; name: string; description?: string; locked?: boolean }[]",
        required: true,
        description:
          "Role COLUMNS in render order. `locked` keeps that role's cells read-only (with a localized lock badge) even in an editable matrix.",
      },
      {
        name: "permissions",
        type: "{ id: string; name: string; description?: string; group?: string }[]",
        required: true,
        description: "Permission ROWS in render order, with an optional category caption.",
      },
      {
        name: "grants",
        type: "ReadonlySet<string> | { roleId: string; permissionId: string }[]",
        required: true,
        description:
          "The grant relation: the grantKey(roleId, permissionId) Set from @godxjp/ui/lib/permission-grid (canonical, O(1)), or a plain pair array normalized through the same encoding.",
      },
      {
        name: "onGrantChange",
        type: "(roleId: string, permissionId: string, granted: boolean) => void",
        description:
          "Its PRESENCE makes the matrix editable (real Checkbox cells, Space toggles). Omitted, the matrix is the canonical read-only ✓/— grid.",
      },
      {
        name: "readOnly",
        type: "boolean",
        defaultValue: "false",
        description:
          "Force the read-only grid even when onGrantChange is present (viewer permission).",
      },
      {
        name: "compare",
        type: "[string, string] | null",
        description:
          "Two role ids compared side by side: their columns tint, and rows where they disagree carry a localized difference badge.",
      },
      {
        name: "diffOnly",
        type: "boolean",
        defaultValue: "false",
        description: "With `compare`, keep only the rows the two roles disagree on (差分のみ).",
      },
      {
        name: "loading / denied / error / empty / onRetry",
        type: "boolean | ReactNode / handler",
        description:
          "The DataTable #216 lifecycle vocabulary with the same precedence (loading → denied → error → empty). `true` renders the built-in localized surface; a node replaces it; onRetry adds Retry to the built-in error only.",
      },
      { name: "label", type: "string", description: "Accessible table name (localized default)." },
    ],
    usage: [
      "DO import it — it is a real export from @godxjp/ui/data-display (the gh#251 lesson: a docs page is not importable). Never hand-compose the sticky-column grid per app.",
      "DO keep grants in the lib/permission-grid grantKey Set form when you already hold role:permission tuples — the pair-array form exists for convenience and is normalized through the same encoding.",
      "DO put it in a Card with CardContent flush: <Card><CardContent flush><PermissionMatrix …/></CardContent></Card>. Below its natural measure the grid scrolls horizontally INSIDE its own container (390px keeps the sticky permission column).",
      "DO NOT encode platform roles/permissions in the library — roles, permissions and grants are consumer data by contract.",
      "DO NOT pass compare pickers/toggles into the matrix — compose Select + Switch beside it and drive `compare`/`diffOnly` (see the showcase).",
    ],
    useCases: [
      "RBAC role tab on a service detail screen: read-only matrix + role compare.",
      "Org role editor: editable matrix (onGrantChange) with the system role locked.",
      "Permission-denied / failed read states without hand-rolling: denied / error / onRetry.",
    ],
    related: [
      "lib/permission-grid — the pure grant/diff data helpers the matrix (and any custom RBAC UI) shares.",
      "DataTable — general tabular data with sorting/selection/pagination; PermissionMatrix is the fixed role-grid specialization with a sticky FIRST column (which DataTable cannot pin).",
      "ServiceRolePanel — the master-detail roles surface a matrix typically renders inside.",
    ],
    example: `import { Card, CardContent, PermissionMatrix } from "@godxjp/ui/data-display";
import { grantKey } from "@godxjp/ui/lib/permission-grid";

const grants = new Set(rolePermissions.map((rp) => grantKey(rp.roleId, rp.permissionId)));

<Card>
  <CardContent flush>
    <PermissionMatrix
      roles={roles}
      permissions={permissions}
      grants={grants}
      onGrantChange={(roleId, permissionId, granted) => mutate({ roleId, permissionId, granted })}
    />
  </CardContent>
</Card>`,
    docPath: "data-display/permission-matrix.tsx",
    storyPath: "data-display/PermissionMatrix.stories.tsx",
    rules: [24],
  },
  {
    name: "BranchScopePicker",
    group: "data-entry",
    tagline:
      "Canonical scope control: all branches vs an explicit subset. One controlled value ({ mode, branchIds }), real RadioGroup + CheckboxGroup + SearchInput underneath (keyboard + field-a11y from the primitives), validation via aria-errormessage, and the #216 collection lifecycle (loading → denied → listError → empty).",
    props: [
      {
        name: "branches",
        type: "{ id: string; name: string; description?: string; disabled?: boolean }[]",
        required: true,
        description: "The selectable branches — consumer domain data.",
      },
      {
        name: "value / defaultValue / onValueChange",
        type: '{ mode: "all" | "selected"; branchIds?: string[] }',
        description:
          'The controlled triad; default { mode: "all" }. Mode flips PRESERVE branchIds so switching back to all never destroys a curated subset.',
      },
      {
        name: "error",
        type: "ReactNode",
        description:
          "Field VALIDATION message — rendered under the control and wired via aria-invalid/aria-errormessage on the radiogroup. Collection read failures are `listError`, not this.",
      },
      {
        name: "listError / denied / loading / empty",
        type: "boolean | ReactNode",
        description:
          "The #216 collection lifecycle (precedence loading → denied → listError → empty). `true` renders the built-in localized message.",
      },
      {
        name: "readOnly",
        type: "boolean",
        defaultValue: "false",
        description: "Locked view: the current scope as a static summary (mode + branch badges).",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Controls visible but inert.",
      },
      {
        name: "searchable",
        type: "boolean",
        defaultValue: "true",
        description: "Built-in branch search above the checkbox list.",
      },
      {
        name: "allLabel / selectedLabel",
        type: "ReactNode",
        description: "Override the localized radio labels (e.g. domain wording like 全店舗).",
      },
    ],
    usage: [
      "DO treat scope as ONE form field: the single { mode, branchIds } value goes through FormField like any other control.",
      "DO import it from @godxjp/ui/data-entry — never compose an ad-hoc radio+checkbox scope block per screen.",
      "DO use `error` ONLY for validation (e.g. mode=selected with zero branches checked); a failed branch fetch is `listError`, a 403 is `denied`.",
      'DO NOT preselect branches for the user — default is { mode: "all" }; an explicit subset is a user decision.',
    ],
    useCases: [
      "Role/permission assignment scoped to branches (service role forms).",
      "Report or notification audience: whole org vs selected branches.",
      "Read-only scope display on a detail screen (readOnly).",
    ],
    related: [
      "CheckboxGroup / RadioGroup — the primitives underneath; use them directly for non-scope choices.",
      "Transfer — large two-list assignment; BranchScopePicker is the compact all-vs-subset scope idiom.",
      "TreeSelect — hierarchical selection when branches nest.",
    ],
    example: `import { BranchScopePicker, FormField } from "@godxjp/ui/data-entry";

<FormField label="適用範囲" required error={errors.scope}>
  <BranchScopePicker
    branches={branches}
    value={scope}
    onValueChange={setScope}
    error={scope.mode === "selected" && !scope.branchIds?.length ? "1件以上選択してください" : undefined}
  />
</FormField>`,
    docPath: "data-entry/branch-scope-picker.tsx",
    storyPath: "data-entry/BranchScopePicker.stories.tsx",
    rules: [24],
  },
  {
    name: "ServiceRolePanel",
    group: "layout",
    tagline:
      "Canonical role-collection ⇄ role-detail surface over MasterDetail (rail=master): controlled selection with aria-current role rows, locked system roles, a built-in destructive AlertDialog for deletion (fires onDeleteRole only AFTER confirm), and the #216 lifecycle states. Geometry (1440/1024 two-track, 390 stacked) is MasterDetail's tokens.",
    props: [
      {
        name: "roles",
        type: "{ id: string; name: string; description?: string; memberCount?: number; locked?: boolean }[]",
        required: true,
        description:
          "The role collection — consumer domain data. `locked` = system role: lock badge, never deletable. memberCount is CLDR-pluralized.",
      },
      {
        name: "value / defaultValue / onValueChange",
        type: "string / (roleId: string) => void",
        description: "Controlled selection triad; defaults to the first role.",
      },
      {
        name: "children",
        type: "ReactNode | (role) => ReactNode",
        description:
          "The detail surface. A render function receives the selected role — typically renders a PermissionMatrix + role metadata.",
      },
      {
        name: "onDeleteRole",
        type: "(roleId: string) => void",
        description:
          "Its PRESENCE arms a per-role delete affordance behind the built-in destructive AlertDialog; it fires only after the user confirms. Locked roles never offer it.",
      },
      {
        name: "readOnly",
        type: "boolean",
        defaultValue: "false",
        description: "Hide every mutating affordance.",
      },
      {
        name: "loading / denied / error / empty / onRetry",
        type: "boolean | ReactNode / handler",
        description:
          "The #216 lifecycle vocabulary (precedence loading → denied → error → empty), same semantics as DataTable/PermissionMatrix.",
      },
      {
        name: "railWidth / masterViewport / collapseBelow / masterLabel / detailLabel",
        type: "MasterDetail geometry + region labels",
        description:
          "Forwarded to MasterDetail (localized region labels by default). Never re-derive tracks or breakpoints in the app.",
      },
    ],
    usage: [
      "DO compose the detail from real primitives — the panel deliberately owns NO detail layout; PermissionMatrix + Descriptions is the typical body.",
      "DO rely on the built-in AlertDialog for deletion — never wire a bare onClick delete; the confirm gate is the contract.",
      'DO pass masterViewport="compact" for long role collections so the rail scrolls inside its region after stacking (gh#231).',
      "DO NOT nest interactive controls in a role row — the select button and the delete button are SIBLINGS by design; keep any custom row content non-interactive.",
    ],
    useCases: [
      "Service detail → roles tab: role list rail + permission matrix detail.",
      "Org role management screen with locked system roles and confirmed deletion.",
      "Read-only role browser for auditors (readOnly).",
    ],
    related: [
      "MasterDetail — the geometry underneath; use it directly for non-role collections.",
      "PermissionMatrix — the canonical detail body for a selected role.",
      "AlertDialog — the confirm primitive the panel embeds; use directly for other destructive flows.",
    ],
    example: `import { PermissionMatrix } from "@godxjp/ui/data-display";
import { ServiceRolePanel } from "@godxjp/ui/layout";

<ServiceRolePanel
  roles={roles}
  value={selectedRoleId}
  onValueChange={setSelectedRoleId}
  onDeleteRole={(roleId) => deleteRole.mutate(roleId)}
>
  {(role) =>
    role && <PermissionMatrix roles={[role]} permissions={permissions} grants={grants} readOnly={role.locked} />
  }
</ServiceRolePanel>`,
    docPath: "layout/service-role-panel.tsx",
    storyPath: "layout/ServiceRolePanel.stories.tsx",
    rules: [24, 40],
  },
];

export function findComponent(name: string): ComponentEntry | undefined {
  const normalized = name.trim().toLowerCase();
  return COMPONENTS.find((c) => c.name.toLowerCase() === normalized);
}

export function componentsByGroup(group: ComponentGroup): ComponentEntry[] {
  return COMPONENTS.filter((c) => c.group === group);
}

export function searchComponents(query: string): ComponentEntry[] {
  const q = query.trim().toLowerCase();
  if (q === "") {
    return COMPONENTS;
  }
  return COMPONENTS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.group.includes(q) ||
      c.tagline.toLowerCase().includes(q) ||
      c.props.some((p) => p.name.toLowerCase().includes(q)),
  );
}

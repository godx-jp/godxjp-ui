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
        name: "stickyFooter",
        type: "boolean",
        defaultValue: "false",
        description: 'Pin footer to viewport bottom on scroll — pairs with variant="narrow".',
      },
    ],
    usage: [
      "DO: Always wrap every page's content in PageContainer — it is the mandatory page shell. Pass `title` (required, rendered as `<h1>`) for every page; omitting it leaves the page without an accessible heading.",
      "DO: Use the `extra` prop (not a sibling div, not a wrapper) for action buttons or controls that sit right of the title row — e.g. `extra={<Button>新規作成</Button>}`. Use the `footer` prop for a pinned action bar below the body (e.g. Save/Cancel on a form page); combine with `stickyFooter` to pin it to the viewport bottom on scroll.",
      "DO: Use `variant='flush'` when the page body contains a full-bleed component like DataTable. Inside a flush container, wrap any padded strips (Toolbar, intro text) in `<PageContainer.Inset>` to align them with the header. Never add manual `px-*` or `p-*` padding to compensate — use PageContainer.Inset.",
      "DO: Pass `breadcrumb` as an ordered array of `{ label, to? }` objects from root to current page. The last item is automatically rendered without a link and receives `aria-current='page'`; earlier items with `to` become router `<Link>` elements. Never hand-roll a breadcrumb nav inside a PageContainer.",
      "DON'T: Use `density` to change individual control sizes — it cascades spacing across the entire page subtree. Set it once per page (e.g. `density='compact'` for data-dense list pages) and let all child components inherit it. Do not apply density classes manually.",
      "DON'T: Confuse PageContainer's prop names with the old PageHeader's prop names — PageContainer uses `subtitle` (not `description`) and `extra` (not `actions`). If you see those legacy names in old code, migrate them to PageContainer.",
    ],
    useCases: [
      "A master list page (e.g. invoices, journal entries, customers) where the header holds the page title, a 'New Invoice' button in `extra`, a breadcrumb trail, and a full-bleed DataTable as the body — use `variant='flush'` + `<PageContainer.Inset>` for the Toolbar above the table.",
      "A detail / edit form page where the footer holds Save and Cancel buttons — use `footer={<Flex direction='row'><Button>保存</Button><Button variant='outline'>キャンセル</Button></Flex>}` with `stickyFooter` so the actions remain reachable as the form scrolls.",
      "A settings or narrow-form page (e.g. account profile, entity configuration) where `variant='narrow'` constrains content to a readable column width and `stickyFooter` pins the submit bar.",
      "A dashboard page with KPI cards and chart sections — use `variant='default'` with `children={<Flex direction='col' gap='lg'>…</Flex>}` to vertically stack multiple Card/StatCard sections beneath the page title.",
      "Any deep-nav page in a multi-level admin (e.g. Accounting > Ledger > Journal Entry #42) where a 3-segment breadcrumb trail provides back-navigation without browser history dependence.",
      "A high-density data reconciliation page where an analyst needs to see maximum rows — use `density='compact'` to tighten all spacing across the DataTable, Toolbar, and controls in a single prop.",
    ],
    related: [
      "PageContainer.Inset — use INSIDE a `variant='flush'` PageContainer to re-introduce horizontal padding for strips like Toolbar or intro text that should align with the page header, while the surrounding DataTable stays full-bleed. Not a standalone page shell.",
      "PageContainer — always use PageContainer for new pages; it supports `children`, `footer`, `variant`, `density`, and `stickyFooter`. Legacy code using the old prop names (`description` → `subtitle`, `actions` → `extra`) should be migrated to PageContainer.",
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
        defaultValue: '"col"',
        description: "Main axis direction. Use row for horizontal runs, col for vertical stacks.",
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
    ],
    usage: [
      'DO import from `@godxjp/ui/layout` and reach for Flex when the axis, alignment, justification, or wrap behavior is part of the component contract: `import { Flex } from "@godxjp/ui/layout"`.',
      "DO keep spacing on the `gap` prop instead of raw `gap-*`, `space-*`, or padding utilities. Flex uses the same token scale as other layout primitives, so spacing remains tied to the design system.",
      'DO use `direction="row"` with `wrap` for responsive control rows, chip clusters, and action groups that need more control than simple row composition.',
      'DO use `direction="col"` for vertical groupings that need explicit `align` or `justify` behavior. For pure vertical stacking without alignment control, `direction="col"` is sufficient.',
      "DON'T override the axis with `className` after choosing a direction prop. Keep the layout intent in props so catalog guidance and data attributes stay accurate.",
      "Flex is a plain div with React.HTMLAttributes<HTMLDivElement>; pass `id`, `role`, `aria-*`, `data-*`, and structural className values as needed, but do not use it as a semantic form or button wrapper.",
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
        description: "Logo at the far-left of the auto-built topbar rail.",
      },
      {
        name: "sidebarCollapsed",
        type: "boolean",
        defaultValue: "false",
        description: "Collapse the sidebar to icon-only mode.",
      },
      {
        name: "footer",
        type: "ReactNode",
        description: "App-level footer outside the main content area.",
      },
    ],
    usage: [
      "DO pass a <Sidebar> node to `sidebar` (required) and page content to `children` (required) — these are the only two required props. Everything else is optional and omitting optional slots simply removes that zone from the rendered DOM.",
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
    ],
    usage: [
      "DO: Define all nav items as a SidebarSectionProp[] data structure and pass it to sections — never hand-roll nav buttons alongside or instead of the Sidebar.",
      "DO: Add content: SidebarItemProp[] to any SidebarItemProp to create a collapsible submenu group. The parent item's icon is required even for groups. The group auto-opens and highlights when activeId matches any descendant.",
      "DO: Mirror the collapsed boolean between AppShell's sidebarCollapsed prop and Sidebar's collapsed prop — they must stay in sync so the shell layout grid adjusts correctly.",
      "DO: Use the footer prop for user info or status — it is pinned below the scroll area and does not scroll away.",
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
import { AppShell } from "@godxjp/ui/layout";
import { Sidebar, type SidebarSection } from "@godxjp/ui/layout";
import { Topbar } from "@godxjp/ui/layout";

const sections: SidebarSection[] = [
  {
    label: "Accounting",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      {
        id: "ledger",
        label: "Ledger",
        icon: BookOpen,
        content: [
          { id: "journal", label: "Journal", icon: FileText },
          { id: "chart-of-accounts", label: "Chart of Accounts", icon: CreditCard },
        ],
      },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "users", label: "Users", icon: Users },
      { id: "roles", label: "Roles", icon: Shield, disabled: true },
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
      "App-shell top bar with product/project chip switchers, search, notifications, and sidebar toggle — pass DropdownMenuContent to productMenu/projectMenu to turn any chip into a real dropdown switcher; the project chip is hidden entirely when neither project nor projectSidebar is set.",
    props: [
      {
        name: "product",
        type: "TopbarProductProp",
        required: true,
        description:
          "The active product identity shown in the left chip. Shape: `{ name: string; color?: string }`. `color` sets the chip icon background (defaults to `hsl(var(--attention))`); the first letter of `name` is used as the icon glyph.",
      },
      {
        name: "project",
        type: "TopbarProjectProp | null",
        defaultValue: "undefined",
        description:
          "Optional active project shown after the product chip as `/ ProjectName`. Shape: `{ name: string }`. When both `project` and `projectMenu` are omitted the project chip is not rendered at all.",
      },
      {
        name: "productMenu",
        type: "ReactNode",
        defaultValue: "undefined",
        description:
          "A `DropdownMenuContent` node. When provided, wraps the product chip in a `DropdownMenu` and renders this content as the dropdown body — turning the chip into an interactive switcher (e.g. an active-entity picker). When omitted, clicking the chip fires `onProductOpen` instead.",
      },
      {
        name: "projectMenu",
        type: "ReactNode",
        defaultValue: "undefined",
        description:
          "A `DropdownMenuContent` node. When provided, wraps the project chip in a `DropdownMenu`. Also causes the project chip to be rendered even when `project` is null — useful for a 'Pick project' state with a real dropdown. When omitted, clicking the chip fires `onProjectOpen`.",
      },
      {
        name: "onProductOpen",
        type: "() => void",
        defaultValue: "undefined",
        description:
          "Called when the product chip is clicked and `productMenu` is NOT set. Use for custom modals / sheet-based switchers.",
      },
      {
        name: "onProjectOpen",
        type: "() => void",
        defaultValue: "undefined",
        description: "Called when the project chip is clicked and `projectMenu` is NOT set.",
      },
      {
        name: "onSearchOpen",
        type: "() => void",
        defaultValue: "undefined",
        description:
          "Called when the search bar button (⌘K) is clicked. Wire this to your command-palette or search dialog.",
      },
      {
        name: "onTweaksOpen",
        type: "() => void",
        defaultValue: "undefined",
        description:
          "Called when the tweaks/settings icon button is clicked. The button is not rendered when this prop is omitted.",
      },
      {
        name: "collapsed",
        type: "boolean",
        defaultValue: "false",
        description:
          "Whether the sidebar is currently collapsed. Controls which icon (`PanelLeftOpen` vs `PanelLeftClose`) is shown on the toggle button and sets its `aria-pressed` state.",
      },
      {
        name: "onToggleCollapsed",
        type: "() => void",
        defaultValue: "undefined",
        description:
          "Called when the sidebar-toggle icon button is clicked. The button is not rendered when this prop is omitted.",
      },
      {
        name: "rightSlot",
        type: "ReactNode",
        defaultValue: "undefined",
        description:
          "Arbitrary content injected between the search bar and the notifications bell. Use for custom action buttons, locale switchers, or env badges.",
      },
      {
        name: "unread",
        type: "boolean",
        defaultValue: "false",
        description:
          "When `true`, renders a red dot badge on the notifications bell to indicate unread notifications.",
      },
      {
        name: "onNotificationsOpen",
        type: "() => void",
        defaultValue: "undefined",
        description:
          "Called when the notifications bell button is clicked. The bell button is not rendered when this prop is omitted.",
      },
      {
        name: "user",
        type: "ReactNode",
        defaultValue: "undefined",
        description:
          "User avatar / profile menu node rendered at the far right of the topbar, after the notifications bell and before the tweaks button.",
      },
    ],
    usage: [
      "DO pass a `DropdownMenuContent` to `productMenu` or `projectMenu` to make a chip a real inline dropdown switcher (e.g. an entity/tenant picker). DO NOT combine both `productMenu` and `onProductOpen` — when `productMenu` is present, `onProductOpen` is ignored.",
      "DO omit both `project` and `projectMenu` when the app has no project concept — the project chip is hidden entirely. If you want a 'Pick project' placeholder with a real dropdown, pass only `projectMenu` (leave `project` null/undefined) so the chip renders in its empty state with the dropdown attached.",
      "DO render `Topbar` inside `AppShell`'s `topbar` prop — Topbar renders as a fragment of buttons/slots and relies on `AppShell`'s `app-topbar` CSS grid for layout. NEVER render it standalone outside of an `AppShell` or equivalent `<header>` container.",
      "DO wire `onSearchOpen` to your command-palette/dialog — the search bar button always renders (it is not conditional on this prop), so omitting the handler leaves users with a non-functional control.",
      "DO use `rightSlot` for extra topbar actions (e.g. locale switcher, environment badge, custom toolbar buttons) rather than adding children or extending the component.",
      "DON'T hand-roll a topbar from scratch — Topbar ships the sidebar toggle, product/project switcher, search, notifications bell, user slot, and tweaks button with correct `aria-label`/`aria-pressed` attributes already.",
    ],
    useCases: [
      "Admin / SaaS shell where the header shows the active legal entity (product chip) and users switch between entities via a `DropdownMenuContent` passed to `productMenu`.",
      "Multi-project app where the project chip shows the current project and `projectMenu` provides a `DropdownMenuContent` to switch projects inline without opening a modal.",
      "App-shell with a collapsible sidebar: pass `collapsed` + `onToggleCollapsed` to let users toggle the sidebar from the topbar without building a custom toggle button.",
      "Notification-aware shell: pass `onNotificationsOpen` + `unread={hasUnread}` to render a bell icon with a red-dot badge that opens a notifications panel.",
      "Apps needing a locale switcher or environment badge in the header: put it in `rightSlot` to slot it between the search bar and the notifications bell without modifying the component.",
      "Read-only / minimal shell where sidebar toggling, tweaks, and notifications are not needed — simply omit `onToggleCollapsed`, `onTweaksOpen`, and `onNotificationsOpen`; their buttons are not rendered.",
    ],
    related: [
      "AppShell — the parent shell component that places Topbar inside its `app-topbar` header region via the `topbar` prop. Always use Topbar inside AppShell, not standalone.",
      "Sidebar — the companion left-rail nav; pair with Topbar's `collapsed`/`onToggleCollapsed` to keep sidebar and topbar toggle state in sync.",
      "DropdownMenu / DropdownMenuContent — pass a `DropdownMenuContent` as `productMenu` or `projectMenu` to turn a chip into an inline switcher. Topbar handles the `DropdownMenuTrigger` wrapping internally; only the Content node is needed.",
      "AppShell — a higher-level opinionated shell that already composes AppShell + Topbar with hardcoded product/project chips; use it for prototypes but use AppShell + Topbar directly for production apps that need real switcher props.",
    ],
    example: `import { Topbar } from "@godxjp/ui/layout";
import { AppShell } from "@godxjp/ui/layout";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@godxjp/ui/navigation";

// Entity-switcher example: product chip opens an entity dropdown,
// project chip is hidden (no project concept in this app).
function MyShell({ children }: { content: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [unread, setUnread] = React.useState(true);

  return (
    <AppShell
      sidebar={<MySidebar />}
      sidebarCollapsed={collapsed}
      topbar={
        <Topbar
          product={{ name: "CoreBooks", color: "hsl(220 70% 50%)" }}
          productMenu={
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => switchEntity("acme")}>
                Acme Corp
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => switchEntity("globex")}>
                Globex Ltd
              </DropdownMenuItem>
            </DropdownMenuContent>
          }
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          onSearchOpen={() => openCommandPalette()}
          unread={unread}
          onNotificationsOpen={() => openNotificationsPanel()}
          user={<UserAvatar />}
        />
      }
    >
      {children}
    </AppShell>
  );
}`,
    storyPath: "layout/Topbar.stories.tsx",
    rules: [2, 3, 5, 6],
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
      { name: "truncate", type: "boolean", description: "Single-line ellipsis." },
      { name: "tabular", type: "boolean", description: "Tabular figures for aligned numbers." },
      { name: "mono", type: "boolean", description: "Monospace family for codes / ids." },
      {
        name: "as",
        type: '"span" | "p" | "div" | "label" | "strong" | "em" | "small" | "code" | "kbd" | "dt" | "dd" | "caption" | "abbr"',
        defaultValue: '"span"',
        description: "Rendered element. `code`/`kbd` are monospace by default.",
      },
    ],
    usage: [
      "DO use `<Text>` for ALL body / inline / caption text instead of a styled `<span>`/`<p>`. Pick `size` from the scale; never write `text-[13px]`/`text-[11px]` or `font-semibold` by hand.",
      'DO use `tone` for colour (`muted`/`primary`/semantic), `tabular` for numbers, `mono` for codes — not `className="text-muted-foreground font-mono tabular-nums"`.',
      "For a heading, use `<Heading level>` instead of a large-size `<Text>`.",
    ],
    useCases: [
      'A muted caption under a value: `<Text size="xs" tone="muted">2026年5月度</Text>`.',
      'A monospace id in a list row: `<Text size="xs" mono tone="muted">RC-204881</Text>`.',
      'An emphasized inline figure: `<Text weight="medium" tabular>¥1,240,000</Text>`.',
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

  // ─── data-display ───────────────────────────────────────────────────────
  {
    name: "DataTable",
    group: "data-display",
    tagline:
      "Compound admin list component with sticky header, sorting, bulk selection, cursor pagination, and built-in empty/loading states — never hand-roll a data.length===0 guard around it.",
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
          "Column definitions. Each column: { value: string; header: ReactNode; render?: (row: T) => ReactNode; sortable?: boolean; width?: string; align?: 'left'|'center'|'right'; hiddenOnMobile?: boolean }. If render is omitted, the raw value at row[key] is rendered as a string.",
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
        type: "'compact' | 'comfortable'",
        defaultValue: "'compact'",
        description:
          "Controlled row density. Omit to let DataTable manage density internally (user can toggle via DataTable.DensityToggle).",
      },
      {
        name: "onDensityChange",
        type: "(density: 'compact' | 'comfortable') => void",
        description:
          "Called when the user toggles density. Only needed when density is controlled.",
      },
      {
        name: "sort",
        type: "{ value: string; direction: 'asc' | 'desc' }",
        description:
          "Active sort state. When provided alongside onSortChange, sortable columns show directional arrow icons and are clickable. Clicking the active column twice clears sort (calls onSortChange(undefined)).",
      },
      {
        name: "onSortChange",
        type: "(sort: { value: string; direction: 'asc' | 'desc' } | undefined) => void",
        description:
          "Called when a sortable column header is clicked. Receives undefined when sort is cleared (third click on same column).",
      },
      {
        name: "loading",
        type: "boolean",
        defaultValue: "false",
        description:
          "When true, renders a full-width loading row instead of data rows or the empty state. Use during initial fetch or pagination transitions.",
      },
      {
        name: "empty",
        type: "ReactNode",
        description:
          "Custom content rendered inside the table body when data is empty and loading is false. Defaults to a built-in EmptyState with a localised 'No data' message. Pass a custom <EmptyState title='...' description='...' action={...}/> to tailor the message.",
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
          "Compound sub-parts: DataTable.Toolbar, DataTable.BulkActions, DataTable.DensityToggle, DataTable.Pagination, DataTable.Content. If no DataTable.Content is present in children, one is auto-rendered.",
      },
    ],
    usage: [
      "DO pass loading={isFetching} during data fetches — it renders a loading row in the table body and suppresses the empty state. Never show a spinner outside DataTable while the table is visible.",
      "DO NOT add a data.length===0 conditional around DataTable. When data is empty and loading is false, the built-in EmptyState renders automatically. Pass empty={<EmptyState title='...'/>} only when you need a custom message.",
      "DO provide getRowId when selectable is true or when rows do not have a string/number 'id' field — the default falls back to row.id and silently returns '' for missing IDs, which breaks selection.",
      "DO use DataTable.Toolbar as the immediate child that wraps search/filter controls on the left and DataTable.DensityToggle/action buttons on the right. DataTable.BulkActions inside the toolbar auto-hides when selection count is 0.",
      "DO use ColumnDef.render for custom cell content (Badge, Link, RowActions). For plain string/number fields render can be omitted — DataTable falls back to String(row[key]).",
      "DO NOT nest DataTable.Content in a conditional — it is already guarded internally. If you need to override the table body slot, drop exactly one <DataTable.Content /> in children; DataTable auto-detects it by displayName and skips the default.",
    ],
    useCases: [
      "Admin list pages (invoices, customers, orders, accounts) where rows are clickable for detail navigation via onRowClick.",
      "Bulk-action workflows (e.g. mark invoices paid, export selected rows) — use selectable + DataTable.BulkActions to show contextual action buttons only when something is selected.",
      "Server-side sorted tables: pass sort + onSortChange and update the data prop after the API call; DataTable renders asc/desc/neutral icons on the header automatically.",
      "Cursor-paginated lists: add DataTable.Pagination with cursor + hasMore + onChange inside children to get First/Next navigation without offset arithmetic.",
      "Responsive admin tables where lower-priority columns (e.g. internal IDs, dates) should collapse below mobile breakpoints — set hiddenOnMobile: true on those ColumnDef entries.",
      "Loading skeletons during initial page load or filter change: set loading={true} alongside an empty data={[]} to show the loading row without flashing an empty state.",
    ],
    related: [
      "Table — raw primitive (TableHeader/TableBody/TableRow/TableCell). Use DataTable instead; only reach for Table directly when you need a non-standard layout that DataTable cannot express.",
      "SkeletonTable — standalone skeleton placeholder rendered before any DataTable mounts (e.g. in a Suspense fallback or deferred-prop skeleton slot). DataTable.loading covers in-table loading; SkeletonTable covers pre-mount skeletons.",
      "EmptyState — standalone empty state for non-table lists. DataTable already embeds EmptyState in its body; only use bare EmptyState for card content, non-tabular lists, or zero-state pages outside a DataTable.",
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
  { value: "id", header: "Invoice #", width: "w-32" },
  { value: "customer", header: "Customer" },
  {
    value: "status",
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
  { value: "amount", header: "Amount", align: "right", sortable: true },
];

export default function InvoiceList({
  invoices,
  loading,
}: {
  invoices: Invoice[];
  loading: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<{ value: string; direction: "asc" | "desc" } | undefined>();

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
    name: "DataGrid",
    group: "data-display",
    tagline:
      "Full-feature data grid — the TanStack Table adapter on `@godxjp/ui/data-grid` (NOT the data-display barrel). Adds column sort, global search, column visibility ('set view'), per-page + numbered pagination, row selection + bulk actions, and density over the styled Table* primitives. Defaults to SERVER/manual mode: wire sorting/columnFilters/globalFilter/pagination to your AJAX query (pass rowCount). Use DataTable instead for a lean server-driven list that must NOT pull TanStack. Requires the `@tanstack/react-table` peer dependency.",
    props: [
      {
        name: "columns",
        type: "ColumnDef<T, unknown>[]",
        required: true,
        description:
          "TanStack column definitions ({ accessorKey, header, cell, enableSorting, enableHiding, meta:{label} }). Set enableHiding:false to keep a column out of the ViewOptions menu; meta.label gives a human label there when header is JSX.",
      },
      {
        name: "data",
        type: "T[]",
        required: true,
        description: "Row data. Empty + loading=false renders a built-in EmptyState in the body.",
      },
      {
        name: "getRowId",
        type: "(row: T) => string",
        description: "Stable row id (defaults to row[rowIdKey], rowIdKey defaults to 'id').",
      },
      {
        name: "enableRowSelection",
        type: "boolean",
        defaultValue: "false",
        description: "Adds a checkbox column + header select-all; pair with DataGrid.BulkActions.",
      },
      {
        name: "sorting / onSortingChange",
        type: "SortingState / OnChangeFn<SortingState>",
        description:
          "Server sort: pass both and sort in your query (manualSorting defaults true). Omit both for client sort.",
      },
      {
        name: "globalFilter / onGlobalFilterChange",
        type: "string / OnChangeFn<string>",
        description:
          "Global search term, surfaced by DataGrid.Search. Server or client like sorting.",
      },
      {
        name: "pagination / onPaginationChange / rowCount",
        type: "PaginationState / OnChangeFn / number",
        description:
          "Server pagination: pass pagination + onPaginationChange + rowCount (total). Omit for client pagination.",
      },
      {
        name: "columnVisibility / onColumnVisibilityChange",
        type: "VisibilityState / OnChangeFn<VisibilityState>",
        description:
          "Column show/hide state surfaced by DataGrid.ViewOptions ('set view'). Internal if omitted.",
      },
      {
        name: "manualSorting / manualFiltering / manualPagination",
        type: "boolean",
        defaultValue: "true",
        description:
          "Default true (server/AJAX). Set false to let TanStack sort/filter/paginate in-browser.",
      },
      {
        name: "loading / density / onRowClick / empty",
        type: "boolean / 'compact'|'comfortable' / (row:T)=>void / ReactNode",
        description: "Loading row, controlled density, clickable rows, custom empty content.",
      },
    ],
    usage: [
      "Import from `@godxjp/ui/data-grid` — it lives on its own subpath because it pulls @tanstack/react-table; it is NOT in the runtime-neutral root or the data-display barrel.",
      "Compose the compound parts as children: <DataGrid.Toolbar> (holds <DataGrid.BulkActions>, <DataGrid.Search>, <DataGrid.ViewOptions>, <DataGrid.DensityToggle>), then <DataGrid.Content> (auto-included if omitted) and <DataGrid.Pagination pageSizeOptions=[...]>.",
      "Server mode (default): drive sorting/globalFilter/pagination from useQuery and pass rowCount. Client mode: set manualSorting/manualFiltering/manualPagination={false} and the grid handles it on the data array.",
    ],
    useCases: [
      "Server-paginated 仕訳 (journal entry) or 請求 (invoice) admin list backed by an AJAX/useQuery endpoint: drive sorting + globalFilter + pagination from the query and pass rowCount — the grid never loads the whole table into the browser. (Prefer DataTable here if the screen must NOT pull @tanstack/react-table.)",
      "Member / employee directory with a user-toggled 'set view' column picker (DataGrid.ViewOptions) — let admins hide columns like 入社日 or 部署 they don't need, persisting the columnVisibility state per user.",
      "Bulk-operation worklist (e.g. approve/export selected 経費精算 rows): enableRowSelection + DataGrid.BulkActions to show a 'N件選択中' action bar with 一括承認 / CSV出力 buttons only when rows are checked.",
      "Dense reconciliation or ledger table where operators flip between compact and comfortable row height via DataGrid.DensityToggle to fit more rows on screen during data-entry-heavy sessions.",
      "Client-side grid for a fully-loaded small dataset (e.g. a fixed master list of 勘定科目): set manualSorting/manualFiltering/manualPagination={false} so TanStack sorts, searches, and paginates in-browser without any server round-trip.",
    ],
    related: ["DataTable", "Table", "DataState", "Select", "DropdownMenu"],
    example: `import { DataGrid, type ColumnDef } from "@godxjp/ui/data-grid";
import { Flex } from "@godxjp/ui/layout";

type Row = { id: string; name: string; amount: number };
const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "name", header: "Name", meta: { label: "Name" } },
  { accessorKey: "amount", header: "Amount", meta: { label: "Amount" } },
];

export function Grid({ rows }: { rows: Row[] }) {
  return (
    <DataGrid columns={columns} data={rows} getRowId={(r) => r.id} enableRowSelection manualSorting={false} manualFiltering={false} manualPagination={false}>
      <DataGrid.Toolbar>
        <Flex direction="row" align="center" gap="sm" className="ms-auto">
          <DataGrid.Search />
          <DataGrid.ViewOptions />
          <DataGrid.DensityToggle />
        </Flex>
      </DataGrid.Toolbar>
      <DataGrid.Content />
      <DataGrid.Pagination pageSizeOptions={[10, 20, 50]} />
    </DataGrid>
  );
}`,
    storyPath: "data-display/DataGrid.stories.tsx",
    rules: [24, 31, 35, 37],
  },
  {
    name: "Card",
    group: "data-display",
    tagline:
      'Surface container with optional accent stripe, variant fill, size, and density. ⚠️ The bare <Card> has NO inner padding — body content MUST be wrapped in <CardContent> (titles in <CardHeader>), or it sits FLUSH against the card edges. Never hand-roll padding with className="p-4"; use <CardContent>. Compose with CardHeader/CardTitle/CardContent/CardFooter.',
    props: [
      {
        name: "accent",
        type: '"primary" | "success" | "warning" | "info" | "attention" | "destructive"',
        description: "3px left-edge semantic accent stripe.",
      },
      {
        name: "variant",
        type: '"default" | "muted" | "outline" | "featured"',
        defaultValue: '"default"',
        description: "Surface fill style.",
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
      "DO use <CardContent flush> for edge-to-edge children such as DataTable, Table, or a Tabs list — this removes horizontal padding. Combine with <CardContent tight> when there is no visual gap needed after the header, and <CardContent solo> when there is no CardHeader above (top padding matches the card shell).",
      "DO use <CardFooter separated> to render a top-bordered action band (Save/Cancel buttons, table summary row). Use <CardFooter flush> for a full-bleed footer bar.",
      "DO use <CardCover> as the first child for full-bleed cover media — the header below it uses card-section top spacing, not the card shell.",
      "DON'T hand-roll a stat/KPI tile with <Card> + raw divs — use <StatCard> (label, value, hint, delta, layout, inverse props) which is already a Card internally with correct token-driven layout.",
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
      "KPI tile. ⚠️ StatCard IS ALREADY a bordered Card — render it DIRECTLY in ResponsiveGrid. NEVER wrap it in <Card>/<CardContent> (that double-borders it → looks too thick). NO accent prop (accent is a Card prop).",
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
    ],
    usage: [
      "DO place StatCard directly as a child of ResponsiveGrid — it renders its own bordered Card shell internally, so no wrapping <Card> or <CardContent> is needed or allowed. Wrapping creates a double border.",
      "DO pass `delta` as a sign-prefixed string (e.g. '+12%' or '-3%') to get automatic color tone: '+' renders text-success, '-' renders text-destructive. For metrics where a negative delta is good (e.g. cost reduction, error rate), pass `inverse` so the tone is flipped correctly.",
      "DO use `hint` for secondary context (e.g. '先月比 +3%', 'last 30 days'). In the default `stacked` layout hint renders below the value; in `inline` layout it renders beside the label.",
      "DO NOT add an `accent` prop — accent is a Card prop and StatCard does not expose it. Passing accent has no effect and creates a false expectation.",
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
        type: '"default" | "success" | "warning" | "destructive" | "info" | "muted" | "neutral"',
        description:
          "SEMANTIC colour intent (ToneProp). This is the colour knob — success/warning/destructive/info/etc. Keep variant for structure, tone for meaning.",
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
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Descriptions.Item elements.",
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
    ],
    usage: [
      "DO always pass `title` — it is the only required prop and renders an `<h3>`; omitting it causes a blank silent render with no visible error.",
      "DO use the `icon` prop (a Lucide icon component, not a JSX element) to give visual context — e.g. `icon={InboxIcon}` for empty inboxes, `icon={SearchIcon}` after a failed search. Pass the component reference, not `<InboxIcon />`.",
      "DO use `action` (a `ReactNode`, typically a `<Button>`) for actionable zero-states — e.g. 'Create first invoice' — so users have a clear next step instead of a dead end.",
      "DO NOT hand-roll a `data.length === 0 ? <EmptyState /> : <DataTable />` conditional — `DataTable` already embeds an `EmptyState` in its body when `data` is empty. Use the `empty=` prop on `DataTable` to customise it, not a wrapper conditional.",
      "DO NOT use EmptyState inside a `DataState` or `InfiniteQueryState` for the loading or error states — those widgets handle skeleton/error themselves; pass `EmptyState` only to their `empty=` prop for the zero-items case.",
      "DO NOT add padding directly on `EmptyState` via `className` when placing it inside a `Card` — wrap it in `<CardContent>` first; EmptyState is a self-contained block with its own internal spacing via `ui-empty-state` styles.",
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
    tagline: "Horizontal progress bar 0–100 with optional label and semantic tone.",
    props: [
      {
        name: "value",
        type: "number",
        required: true,
        description: "Progress percentage 0–100 (clamped).",
      },
      { name: "label", type: "string", description: "Text label beside/below the bar." },
      {
        name: "tone",
        type: '"success" | "warning"',
        defaultValue: '"success"',
        description: "Bar colour tone.",
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
    ],
    related: [
      "Slider — use Slider when the user must drag or set a bounded numeric value (volume, priority, price range); use Progress when the value is read-only and must not be interacted with.",
      "Steps — use Steps for a discrete, named sequence of phases (onboarding wizard, checkout flow) where each step has a label and a clear current/done/pending state; use Progress for a continuous 0–100 fill.",
      'Badge / Badge — use Badge or Badge to communicate a categorical status label (e.g. "Paid", "Overdue") without a fill metaphor; use Progress when the numeric proportion itself is the information.',
      "StatCard — use StatCard to headline a single KPI metric with a title; compose Progress inside or alongside StatCard when a visual fill adds meaning to the number.",
    ],
    example: `import { Progress } from "@godxjp/ui/data-display";

<Progress value={pct} label={pct + "% 使用中"} variant={pct >= 80 ? "warning" : "success"} />`,
    storyPath: "data-display/Progress.stories.tsx",
    rules: [],
  },
  {
    name: "Timeline",
    group: "data-display",
    tagline: "Vertical event list with an icon rail. Current item gets a highlighted glyph.",
    props: [
      {
        name: "items",
        type: "TimelineItem[]",
        required: true,
        description: "Array of { title, location?, time?, note?, current? }.",
      },
    ],
    usage: [
      "DO pass an array of `TimelineItem` objects to `items` — this is the ONLY prop; there are no sub-components to compose. Each item is `{ title, location?, time?, note?, current? }`. All fields except `title` are optional.",
      "DO mark exactly one item with `current: true` to highlight the in-progress event. The component renders a `Plane` icon for the current item and a `CheckCircle2` icon for all past items — do NOT try to pass a custom icon; the icon is determined entirely by the `current` flag.",
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

<Timeline items={[
  { title: "注文受付", time: "2024-06-01 10:00" },
  { title: "発送準備中", time: "2024-06-01 14:00" },
  { title: "配送中", current: true },
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
    ],
    usage: [
      "DO compose all six sub-parts in order: wrap with `<Table>`, then `<TableHeader>` containing `<TableRow><TableHead>…</TableRow>`, then `<TableBody>` containing one or more `<TableRow><TableCell>…` rows. Skipping any layer (e.g. bare `<th>` inside `<Table>`) bypasses the design tokens and hover/border styles.",
      'DO use `TableHead` (not `TableCell`) for header cells — it renders `<th>` with `data-slot="table-head"` and the `--table-row-height` CSS variable for consistent header sizing across the design system. `TableCell` renders `<td>` with `data-slot="table-cell"` and is for body rows only.',
      'DO apply numeric alignment via `className` on individual `TableHead`/`TableCell` elements (e.g. `className="text-right"`). There are no built-in alignment props — all styling goes through Tailwind class overrides.',
      "DO NOT hand-roll empty-state handling inside a Table composition. When data can be empty, switch to `DataTable` (which has a built-in empty state) or wrap the `<Table>` with a conditional that renders `<EmptyState>` — never leave a table with only a header and zero rows.",
      "DO NOT use Table for lists that need sorting, filtering, pagination, or row selection — those features are only in `DataTable`. Table is intentionally stateless: it owns no TanStack Table instance, no column definitions, and no toolbar.",
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
      "DO: supply `errorRenderer` only when the default `AlertQueryError` + retry button is not enough — e.g. a full-page error boundary with navigation. Otherwise rely on `showRetry` (default `true`) and the built-in `AlertQueryError`, and override `onRetry` only if `query.refetch()` is not the right action.",
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
    ],
    useCases: [
      "A settings page form where every label sits in a fixed 120px column to the left of its control (horizontal), collapsing to stacked labels on mobile.",
      "A two-column entity-edit form (`columns={2}`) where the address field spans both columns (`colSpan={2}`).",
      "A compact filter form (`layout='horizontal' density='compact'`) above a DataTable.",
    ],
    related: [
      "FormField — the per-field wrapper (label + control + helper/error) that reads Form's layout context; use one per control inside a Form.",
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
      "Wraps a control with label, helper, and error; injects aria-describedby/aria-invalid onto the child. Reads the parent Form's layout (vertical/horizontal) — overridable per field.",
    props: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "Forwarded to Label htmlFor + builds helper/error ids.",
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
        required: true,
        description: "The single control to render.",
      },
    ],
    usage: [
      "DO pass the same string to both `id` on `<FormField>` and `id` on the child control — the component wires `<Label htmlFor={id}>`, and builds `{id}-helper` / `{id}-error` ids for `aria-describedby`. If the ids diverge the label click and screen-reader announcements break.",
      "DO pass a SINGLE React element as `children`. FormField calls `React.cloneElement` on it to inject `aria-describedby`, `aria-required`, and `aria-invalid` — if you pass a fragment or multiple nodes, cloneElement silently skips the injection and a11y attributes are lost.",
      "DO use the `error` prop (not a hand-rolled `<p>`) for validation messages — it renders with `role='alert'` and `text-destructive` styling and overrides `helper` automatically. Never render an error paragraph alongside FormField.",
      "DO use `labelAddon` (a ReactNode rendered inline after the label text) for supplementary controls such as a tooltip trigger or a 'copy' icon button — never insert such controls as siblings outside FormField, which breaks layout.",
      "DON'T wrap `Switch` in FormField — use `Field` instead, which already handles the label, hidden `<input name>` for HTML form submission, error, and helper internally.",
      "DON'T use FormField for checkbox-beside-label or radio-beside-label patterns — use `Field` (single checkbox/radio with description) or `CheckboxGroup` / `RadioGroup` (multiple options), which have their own integrated labelling.",
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
        name: "onChange",
        type: "React.ChangeEventHandler<HTMLInputElement>",
        description: "Native change handler.",
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
      "TimeInput — the HH:mm sibling spinbutton; NumberInput is for plain numbers, TimeInput for clock times.",
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
          "Static option list. Passing this (or loadOptions) switches Select from the compound API to the data-driven API. Each option has { value, label, sublabel?, group?, disabled? }. group buckets the option under an optgroup-style heading.",
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
          "Custom per-option renderer (Ant-Design style). Defaults to label + optional sublabel.",
      },
      {
        name: "selectedLabel",
        type: "string",
        description:
          "Display label for the current value when its option is not in the loaded page (async). Prevents a flash of the raw id.",
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
    ],
    usage: [
      "DO use the data-driven API (options/loadOptions) for straightforward selects — it handles grouping, search, async, and custom rendering automatically. Only reach for the compound API when you need to inject arbitrary content into the trigger or listbox.",
      "DO pass name= on the data-driven Select so the value is submitted with a native form or Inertia useForm. Without name= the value is React-only and will not appear in form data.",
      "DO use loadOptions + selectedLabel together for async selects: selectedLabel prevents a flash of the raw id string while the first page loads.",
      "DO pair id= with a <label htmlFor={id}> for a11y. The trigger renders as a button; screen readers announce the label.",
      "DON'T mix the two APIs: once you pass options or loadOptions, Select is data-driven — all compound sub-parts (SelectTrigger, SelectContent, SelectItem) are rendered internally. Do not wrap them manually.",
      "DON'T use a raw <select> element. Select is the one control for all single-select use cases. The only allowed raw <select> is a hidden aria-hidden sr-only element kept as an e2e hook paired with a visible Select.",
      "COMPOUND API sub-parts (when NOT using options/loadOptions): Select → SelectTrigger (contains SelectValue) → SelectContent → SelectItem. Optionally wrap items in SelectGroup + SelectLabel for headings, or add SelectSeparator between sections.",
    ],
    useCases: [
      "Status filter on an invoice list — pass options=[{value:'draft',label:'Draft'},{value:'paid',label:'Paid'}] with onChange to drive a query param; no search needed so omit showSearch.",
      "Legal-entity switcher — static options list with showSearch=true for client-side filtering when there are many entities; use selectedLabel to show the entity name before the full list loads.",
      "Account category picker backed by an API — pass loadOptions to stream pages of accounts as the user types; use renderOption to show account code + name side by side; pass selectedLabel so the trigger shows the name on first render.",
      "Grouped currency picker — set option.group='Asia' / 'Europe' on each option; the plain (non-search) data-driven mode renders SelectGroup headings automatically.",
      "Form field in an accounting entry — use the compound API when the trigger must show a currency flag icon alongside the SelectValue; wire SelectTrigger size='sm' for dense table rows.",
      "Required department select in a HR form — pass clearable=false so the user cannot clear the field once set; pair with name='department_id' for Inertia useForm submission.",
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
        name: "onConfirm",
        type: "() => Promise<void> | void",
        description: "Primary action handler.",
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
      "Use `confirmPhrase` for high-friction operations (e.g. requiring `DELETE`) to reduce accidental confirmation.",
      "Pass `keepOpenOnConfirm` when the confirm handler advances a multi-step flow and should not close immediately.",
    ],
    useCases: [
      "Dangerous delete or irreversible workflow confirmation that should block the background UI.",
      "Destructive batch operations that should remain modal and explicit until action is intentionally confirmed.",
    ],
    related: [
      "Dialog — use for form-style and non-destructive modal flows, no confirm preset behavior.",
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
    name: "Sheet",
    group: "feedback",
    tagline:
      "Side-panel drawer (Radix Dialog). Parts: Sheet/SheetTrigger/SheetContent(side=right|left|top|bottom)/SheetHeader/SheetBody/SheetTitle/SheetFooter.",
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
        name: "title / subtitle / extra / tone",
        type: "ReactNode / ReactNode / ReactNode / ToneProp",
        description:
          "On SheetHeader (Ant-style): title (→ SheetTitle, accessible name), subtitle (→ SheetDescription), right-aligned extra actions, and a soft semantic `tone` background band. Children still supported.",
      },
    ],
    usage: [
      "DO build the panel with SheetHeader (pass `title`/`subtitle`/`extra`/`tone` OR children) > SheetBody (scrollable, ring-safe) > SheetFooter (pinned). SheetTitle is required for a11y — the `title` prop renders it for you. Never skip the title.",
      "DO set `width` on SheetContent for a wider/narrower panel (e.g. width={480}); it caps at the viewport so small screens still get a full-width panel.",
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
      "Detail peek panel: show read-only Descriptions / Timeline of a selected record (e.g. a journal entry or invoice) from a DataTable row click, using side='right' with showCloseButton={true}.",
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
        type: '"default" | "destructive" | "warning" | "success"',
        defaultValue: '"default"',
        description: "Colour scheme + default icon.",
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
    ],
    usage: [
      'DO compose with sub-parts in order: wrap text content in `<Alert.Content>` (or bare `<AlertContent>`), then `<Alert.Title>` + `<Alert.Description>` inside it, then `<Alert.Actions>` for any retry/CTA buttons. Example: `<Alert tone="destructive"><Alert.Content><Alert.Title>Error</Alert.Title><Alert.Description>{msg}</Alert.Description></Alert.Content><Alert.Actions><Button …/></Alert.Actions></Alert>`.',
      "DO use `Alert.QueryError` (alias `AlertQueryError`) for TanStack Query / API failure surfaces — it already renders humanError(error), an i18n title, and an optional Retry button. Never hand-roll that pattern.",
      'DON\'T pass raw action elements directly as top-level children of `<Alert>` without wrapping them in `<Alert.Actions>` — the layout slot only activates correctly via the `data-slot="alert-actions"` wrapper.',
      'DON\'T hand-roll a dismiss ✕ button — pass `onDismiss` to `<Alert>` and the component renders its own accessible dismiss button with `aria-label="Dismiss"`. The `onDismiss` handler may return a Promise.',
      'DON\'T suppress the icon with `icon={false}` unless there is a deliberate design reason; the icon is the primary a11y cue for sighted users since the root already carries `role="alert"` for screen readers.',
      "DO NOT use `Alert` for transient ephemeral feedback (e.g. 'saved successfully'). Use `toast()` from sonner + `<Toaster>` for that. `Alert` is for persistent, page-scoped banners that stay visible until the user acts or dismisses.",
    ],
    useCases: [
      'Page-level error banner after a form submission fails server-side validation — `tone="destructive"` with `Alert.Title` summarising the error and `Alert.Description` listing field issues, paired with `onDismiss` so the user can clear it.',
      "Inline warning at the top of an accounting invoice list when the OAuth token for the MF sync is about to expire — `variant=\"warning\"` with an `Alert.Actions` containing a 'Reconnect' Button.",
      'Success confirmation banner rendered after a bulk-import job completes and the user returns to the list page — `tone="success"` with `Alert.Description` showing the record count imported.',
      "TanStack Query data-fetch failure inside a Card body — use `<Alert.QueryError error={error} onRetry={refetch} />` instead of writing a custom error state.",
      "Informational notice at the top of a settings page when a feature is in beta or requires a plan upgrade — `variant=\"default\"` (Info icon) with a short description and an `Alert.Actions` 'Learn more' link.",
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
          "Optional data-driven tab list. When provided, Tabs renders all triggers and content panels.",
      },
      { name: "value", type: "string", description: "Controlled active tab key." },
      { name: "defaultValue", type: "string", description: "Uncontrolled initial tab key." },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Active-tab change handler.",
      },
    ],
    usage: [
      "DO pass `items` when all tab content is known up front — each item needs a unique `value`, trigger `label`, and panel `content`.",
      'When not using `items`, compose the full four-part tree — `<Tabs>` root, `<TabsList>` trigger bar, one `<TabsTrigger value="…">` per tab, one `<TabsContent value="…">` per matching trigger.',
      "DO: use `defaultValue` (uncontrolled) for simple local state; use `value` + `onValueChange` together (controlled) when the active tab is driven by URL query params, router state, or parent state. NEVER set both simultaneously.",
      "DO use `variant` on Tabs when using `items`; when composing manually, set `variant` on `TabsList`.",
      'DO: pass `orientation="vertical"` to `<Tabs>` (not to `TabsList`) for a side-rail layout — the CSS group classes on root and triggers respond automatically, so no extra className gymnastics are needed.',
      "DON'T: hand-roll the active-indicator underline or selected-state ring — `TabsTrigger` already applies `data-[state=active]` styles including the `after:` line element for the `line` variant. Adding your own underline breaks the design.",
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
    ],
    usage: [
      "DO always control Pagination externally: store `value` (page) and `pageSize` in React state (or URL params), and update both in the `onValueChange(page, pageSize)` callback. Pagination is fully controlled — it has no internal state and will not move unless `value` changes.",
      "DO pass `total` as the raw item count (not page count). The component computes `Math.ceil(total / pageSize)` internally; passing a pre-computed page count as `total` will over-paginate.",
      "DO use `showSizeChanger` together with `pageSizeOptions` when the user needs density control (default options are [10, 20, 50, 100]). When `showSizeChanger` is omitted the page-size Select is not rendered at all — do NOT hand-roll your own Select beside Pagination.",
      "DO use `simple` mode for compact contexts (mobile, sidebars, sheet footers) — it renders Prev / `n / total` / Next with no page-number buttons. Use the full form for primary admin list pages.",
      "DO use `showTotal` to surface item counts: pass `true` for the built-in i18n label, or a function `(total, [from, to]) => ReactNode` for a custom range label like '1–10 of 342 invoices'. Never hard-code a total string beside the component.",
      "DON'T use Pagination for cursor- or infinite-scroll-based lists. Pagination is strictly offset/page-based (`value` is a page number). For cursor pagination inside a DataTable use `DataTable.Pagination`; for infinite scroll use `InfiniteQueryState`.",
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
    ],
    usage: [
      "DO: Pass all steps via the `items` array (each `{ title, subtitle?, description?, icon?, status?, disabled? }`) — Steps is a single-component API with no child sub-components to compose manually.",
      "DO: Control the active step with `value` (0-based index). For async operations, set the top-level `status` prop (`'process'|'error'|'finish'`) to override the current step's icon — e.g. `status='error'` turns the active step red without touching `items`.",
      "DO: Use per-item `status` to pin individual steps independently of `value` (e.g. a skipped or already-errored step). Per-item `status` takes precedence over the derived status from `value`.",
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
    ],
    usage: [
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
        name: "children",
        type: "ReactNode",
        description: "Compose AvatarImage and AvatarFallback.",
      },
      { name: "className", type: "string", description: "Extra classes on the avatar root." },
    ],
    usage: [
      "DO compose Avatar > AvatarImage + AvatarFallback so broken or missing images still show a readable fallback.",
      "DON'T use Avatar for decorative thumbnails; use CardCover or an img when the image is content rather than identity.",
    ],
    useCases: ["User profile chips", "Team member lists", "Account owner cells in a DataTable"],
    related: ["Badge — use beside Avatar for role/status metadata."],
    example: `import { Avatar, AvatarFallback, AvatarImage } from "@godxjp/ui/data-display";

<Avatar>
  <AvatarImage src="/user.png" alt="User" />
  <AvatarFallback>UI</AvatarFallback>
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
        name: "onValueChange",
        type: "(value: string | string[]) => void",
        description: "Selection callback.",
      },
    ],
    usage: [
      "DO choose type='single' for mutually exclusive toolbar modes.",
      "DO choose type='multiple' for independent formatting toggles.",
    ],
    useCases: ["Text alignment selector", "Formatting toolbar", "View density switcher"],
    related: ["Toggle", "RadioGroup"],
    example: `import { ToggleGroup, ToggleGroupItem } from "@godxjp/ui/data-entry";

<ToggleGroup type="single">
  <ToggleGroupItem value="left">Left</ToggleGroupItem>
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
    ],
    usage: [
      "DO set `maxLength` to the code length and render that many InputOTPSlot with sequential `index`.",
      "DO wrap slots in InputOTPGroup; use InputOTPSeparator between groups (e.g. 3 + 3).",
      "DON'T build N separate Inputs — this is ONE field with paste, arrow-key, and caret handling built in.",
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
      "Right-click actions on a DataTable/DataGrid row (詳細 / 複製 / 削除) as a power-user accelerator alongside the visible row action button.",
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
        type: "number",
        description: "ResizablePanel initial size as a percentage (0–100) of the group.",
      },
      {
        name: "minSize",
        type: "number",
        description: "ResizablePanel minimum size (%) — drag can't shrink below this.",
      },
      { name: "maxSize", type: "number", description: "ResizablePanel maximum size (%)." },
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
      "DO size panels with `defaultSize`/`minSize`/`maxSize` as PERCENTAGES (the group totals 100), not pixels — don't fight this with a fixed `w-[280px]` className on the panel.",
      "DON'T reach for ResizablePanel when the split is fixed and never user-adjustable — use a plain `Flex`/`ResponsiveGrid`, or `SplitPane` for a simple two-pane layout. Resizable is for *user-draggable* boundaries only.",
      "DO give each panel a stable `id` and use `collapsible` + `collapsedSize` for a side panel the user can fully tuck away (e.g. a filters rail), reacting via `onResize`.",
      "DON'T hand-roll a draggable divider with mouse-move listeners — the primitive handles pointer + keyboard resizing, ARIA separator semantics, and min/max clamping. Always render `<ResizableHandle>`, never a bare styled `<div>`.",
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

<ResizablePanelGroup>
  <ResizablePanel>Panel A</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>Panel B</ResizablePanel>
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
    name: "TimeInput",
    group: "data-entry",
    tagline: "Masking HH:mm input with validation and optional minute step quantization.",
    props: [
      { name: "value", type: "string", description: "Controlled HH:mm value." },
      {
        name: "defaultValue",
        type: "string",
        description: "Uncontrolled initial HH:mm value.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Validated value callback.",
      },
      {
        name: "step",
        type: "number",
        defaultValue: "1",
        description:
          "Minute step (clamped 1–59). Snaps the committed minute to the nearest lower multiple and sets the ArrowUp/ArrowDown increment.",
      },
      { name: "name", type: "string", description: "Form field name." },
    ],
    usage: [
      "DO treat the value as a plain `HH:mm` string (24-hour, zero-padded) — TimeInput is calendar-free. For a date, or a date+time, use `DatePicker`/`Calendar`; for a richer dropdown time selector use `TimePicker`.",
      "DO drive it controlled with `value` + `onValueChange` (it follows the vocabulary — NOT `onChange`/`defaultValue` pairing for control). `onValueChange` fires only with a VALID, step-snapped `HH:mm`, so your state never holds a half-typed value.",
      "DON'T pass `value` without `onValueChange` — like every controlled @godxjp/ui input that freezes the field. Omit both for uncontrolled (use `defaultValue`).",
      "DO set `step` to your scheduling granularity (e.g. `15` or `30`) — the user can still type freely, but blur/Enter snaps the minute down to the nearest multiple, and ArrowUp/ArrowDown step by that amount (wrapping across midnight).",
      "DO let the built-in masking + validation work: digits auto-format to `HH:mm`, invalid input sets `aria-invalid` and is reverted on blur. Don't add your own regex/onChange masking on top.",
      "DON'T use it for a duration/elapsed time that can exceed 23:59 — it's a clock time-of-day input (00:00–23:59). Use a numeric Input for durations.",
    ],
    useCases: [
      "勤怠 (attendance) start/end time fields — 出勤 / 退勤 HH:mm entry with step={1} or a rounding step for shift schedules.",
      "Business-hours / reservation slot editor where times snap to a 15- or 30-minute grid (step={15}).",
      "A from–to time range filter on a report or log screen (two TimeInputs) with no date component.",
      "Any calendar-free HH:mm-only form field (e.g. a recurring daily batch time, a 締め時刻).",
    ],
    storyPath: "data-entry/TimeInput.stories.tsx",
    rules: [3, 6],
    example: `import { TimeInput } from "@godxjp/ui/data-entry";

<TimeInput value="09:00" step={15} onValueChange={(time) => console.log(time)} />`,
  },
  {
    name: "AppSettingPicker",
    group: "navigation",
    tagline:
      "One provider-bound Select for a single AppProvider setting, chosen by `kind` (locale | timezone | dateFormat | timeFormat) — replaces the former Locale/Timezone/Date-format/Time-format pickers. Throws if used without AppProvider AND without controlled value+onValueChange.",
    props: [
      {
        name: "kind",
        type: '"locale" | "timezone" | "dateFormat" | "timeFormat"',
        description:
          "Which AppProvider setting this picker reads and writes. Determines the option list, icon, trigger width, and the context value/setter used.",
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
      "DON'T hand-roll a locale/timezone/format Select — AppSettingPicker already composes Select + the right icon + translated, context-wired options. There is no separate LocalePicker/TimezonePicker/DateFormatPicker/TimeFormatPicker anymore; use kind.",
    ],
    useCases: [
      'App-shell top-nav language switcher: <AppSettingPicker kind="locale" /> under AppProvider, persisting to localStorage with no extra state.',
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

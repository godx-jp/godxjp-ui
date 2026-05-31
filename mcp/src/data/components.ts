/**
 * Component catalog — the REAL published `@godxjp/ui` v6 primitive surface.
 * The MCP bundles this so an agent can author pages with the actual API
 * (PageContainer, Stack, ResponsiveGrid, DataTable + ColumnDef, StatusBadge,
 * FormField, Select, Dialog, FilterBar, …) instead of guessing.
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
  tagline: string;
  props: ComponentProp[];
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
    tagline: "Mandatory page shell — EVERY page wraps its content in PageContainer (title/subtitle/extra/footer/breadcrumb).",
    props: [
      { name: "title", type: "string", required: true, description: "Page heading rendered as <h1>." },
      { name: "subtitle", type: "string", description: "Secondary line beneath the title." },
      { name: "extra", type: "ReactNode", description: "Action buttons / controls rendered right of the title row." },
      { name: "footer", type: "ReactNode", description: "Content area pinned below the page body." },
      { name: "breadcrumb", type: "BreadcrumbItemProp[]", description: "Ordered trail of { label, to? } segments above the title." },
      { name: "variant", type: '"default" | "narrow" | "flush" | "ghost"', defaultValue: '"default"', description: "Page shell layout; flush removes padding for full-bleed content." },
      { name: "density", type: '"compact" | "default" | "comfortable"', defaultValue: '"default"', description: "Spacing density across the page subtree." },
      { name: "stickyFooter", type: "boolean", defaultValue: "false", description: "Pin footer to viewport bottom on scroll — pairs with variant=\"narrow\"." },
    ],
    example: `import { PageContainer, Stack } from "@godxjp/ui/layout";
import { Button } from "@godxjp/ui/general";

export default function OrdersPage() {
  return (
    <PageContainer
      title="注文一覧"
      subtitle="直近30日間の受注データ"
      breadcrumb={[{ label: "ホーム", to: "/" }, { label: "注文一覧" }]}
      extra={<Button>新規注文</Button>}
    >
      <Stack gap="lg">{/* page content */}</Stack>
    </PageContainer>
  );
}`,
    storyPath: "layout/PageContainer.stories.tsx",
    rules: [23],
  },
  {
    name: "Stack",
    group: "layout",
    tagline: "Vertical flex column with token gap — the default block-stacking primitive (use instead of space-y-*).",
    props: [
      { name: "gap", type: '"xs" | "sm" | "md" | "lg" | "xl"', defaultValue: '"md"', description: "Vertical space between children (design tokens)." },
      { name: "className", type: "string", description: "Extra classes merged via cn()." },
      { name: "children", type: "ReactNode", description: "Block-level children to stack." },
    ],
    example: `import { Stack } from "@godxjp/ui/layout";

<Stack gap="lg">
  <KpiRow />
  <FilterBarBlock />
  <TableCard />
</Stack>`,
    storyPath: "layout/Stack.stories.tsx",
    rules: [2, 40],
  },
  {
    name: "Inline",
    group: "layout",
    tagline: "Horizontal flex row with token gap — the default inline/row arrangement (use instead of gap-* on a flex div).",
    props: [
      { name: "gap", type: '"xs" | "sm" | "md" | "lg"', defaultValue: '"sm"', description: "Horizontal space between children." },
      { name: "className", type: "string", description: "Extra classes merged via cn()." },
      { name: "children", type: "ReactNode", description: "Inline children in a row." },
    ],
    example: `import { Inline } from "@godxjp/ui/layout";
import { Button } from "@godxjp/ui/general";

<Inline gap="sm">
  <Button>保存</Button>
  <Button variant="outline">キャンセル</Button>
</Inline>`,
    storyPath: "layout/Inline.stories.tsx",
    rules: [2],
  },
  {
    name: "ResponsiveGrid",
    group: "layout",
    tagline: "Auto-responsive card grid — columns collapse to 1 on mobile, scale up on wider breakpoints.",
    props: [
      { name: "columns", type: "2 | 3 | 4", defaultValue: "3", description: "Target column count at desktop; collapses to 1 on mobile." },
      { name: "children", type: "ReactNode", required: true, description: "Grid items — typically Card or CardStat." },
    ],
    example: `import { ResponsiveGrid } from "@godxjp/ui/layout";
import { CardStat } from "@godxjp/ui/data-display";

<ResponsiveGrid columns={4}>
  <CardStat label="総会員数" value="12,400" />
  <CardStat label="公開中クーポン" value="8" />
  <CardStat label="月間利用数" value="3,210" />
  <CardStat label="割引総額" value="¥480,000" />
</ResponsiveGrid>`,
    storyPath: "layout/ResponsiveGrid.stories.tsx",
    rules: [24, 40],
  },
  {
    name: "AppShell",
    group: "layout",
    tagline: "Root application shell — composes sidebar, topbar rail, main content area, and optional footer.",
    props: [
      { name: "sidebar", type: "ReactNode", required: true, description: "Sidebar node — typically a <Sidebar>." },
      { name: "children", type: "ReactNode", required: true, description: "Main page content rendered in <main>." },
      { name: "topbar", type: "ReactNode", description: "Full topbar override; else a rail is built from topbarLeft/topbarRight/logo." },
      { name: "topbarRight", type: "ReactNode", description: "Right slot of the auto-built topbar rail (user menu, switcher)." },
      { name: "topbarLeft", type: "ReactNode", description: "Left slot of the auto-built topbar rail." },
      { name: "logo", type: "ReactNode", description: "Logo at the far-left of the auto-built topbar rail." },
      { name: "sidebarCollapsed", type: "boolean", defaultValue: "false", description: "Collapse the sidebar to icon-only mode." },
      { name: "footer", type: "ReactNode", description: "App-level footer outside the main content area." },
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

export function CrmLayout({ children }: { children: React.ReactNode }) {
  return <AppShell sidebar={sidebar}>{children}</AppShell>;
}`,
    storyPath: "layout/AppShell.stories.tsx",
    rules: [23],
  },
  {
    name: "Sidebar",
    group: "layout",
    tagline: "Navigation sidebar with sections, items, product header, and collapsible icon-only mode.",
    props: [
      { name: "activeId", type: "string", required: true, description: "Id of the active nav item; drives highlight." },
      { name: "sections", type: "SidebarSectionProp[]", required: true, description: "Array of { label?, items: SidebarItemProp[] } where item = { id, label, icon, badge? }." },
      { name: "onSelect", type: "(id: string) => void", description: "Called on item click; typically router.visit(id)." },
      { name: "product", type: "{ name: string; role?: string; color?: string }", description: "Product/workspace block at the top." },
      { name: "brand", type: "ReactNode", description: "Custom brand node replacing the product block." },
      { name: "collapsed", type: "boolean", defaultValue: "false", description: "Icon-only mode; labels/section headings hidden." },
      { name: "footer", type: "ReactNode", description: "Bottom slot (user info, logout)." },
    ],
    example: `import { Sidebar } from "@godxjp/ui/layout";
import { LayoutDashboard, Users } from "lucide-react";
import { router, usePage } from "@inertiajs/react";

export function AppSidebar() {
  const { url } = usePage();
  return (
    <Sidebar
      activeId={url}
      onSelect={(id) => router.visit(id)}
      sections={[{ label: "メイン", items: [
        { id: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
        { id: "/members", label: "会員管理", icon: Users },
      ] }]}
      product={{ name: "JOVY CRM", role: "本部" }}
    />
  );
}`,
    storyPath: "layout/Sidebar.stories.tsx",
    rules: [23],
  },
  {
    name: "Topbar",
    group: "layout",
    tagline: "Application topbar with product/project switcher and search/notification slots (or use AppShell's topbarRight).",
    props: [
      { name: "product", type: "{ name: string; color?: string }", required: true, description: "Current product chip." },
      { name: "project", type: "{ name: string } | null", description: "Current project chip; null shows placeholder." },
      { name: "onSearchOpen", type: "() => void", description: "Called when the search bar is clicked." },
      { name: "onProductOpen", type: "() => void", description: "Called when the product chip is clicked." },
    ],
    example: `import { Topbar } from "@godxjp/ui/layout";

<Topbar product={{ name: "JOVY CRM" }} project={{ name: "本番環境" }} />`,
    storyPath: "layout/Topbar.stories.tsx",
    rules: [23],
  },
  {
    name: "PageInset",
    group: "layout",
    tagline: "Padded horizontal strip aligned with the page header — use inside variant=\"flush\" for filter bars / intros.",
    props: [
      { name: "children", type: "ReactNode", description: "Content rendered with standard page horizontal padding." },
      { name: "className", type: "string", description: "Extra classes." },
    ],
    example: `import { PageContainer, PageInset } from "@godxjp/ui/layout";

<PageContainer title="商品一覧" variant="flush">
  <PageInset><FilterBarBlock /></PageInset>
  {/* full-bleed table below */}
</PageContainer>`,
    storyPath: "layout/PageInset.stories.tsx",
    rules: [],
  },
  {
    name: "SplitPane",
    group: "layout",
    tagline: "Two-column layout with a main content area and a fixed-width aside panel.",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Main (left) content." },
      { name: "aside", type: "ReactNode", required: true, description: "Aside (right) panel content." },
      { name: "asideWidth", type: '"sm" | "md"', defaultValue: '"md"', description: "Width preset for the aside column." },
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
      { name: "items", type: "BreadcrumbItemProp[]", required: true, description: "Array of { label, to? } — omit `to` on the last (current) segment." },
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
      { name: "variant", type: '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"', defaultValue: '"default"', description: "Visual style." },
      { name: "size", type: '"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"', defaultValue: '"default"', description: "Size preset (height, padding, icon dims)." },
      { name: "asChild", type: "boolean", defaultValue: "false", description: "Render as Radix Slot — merge props onto the child (<a>/<Link>)." },
      { name: "disabled", type: "boolean", description: "Disable the button." },
      { name: "onClick", type: "React.MouseEventHandler<HTMLButtonElement>", description: "Click handler." },
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

  // ─── data-display ───────────────────────────────────────────────────────
  {
    name: "DataTable",
    group: "data-display",
    tagline: "Full-width admin list. Lives in its OWN row (Card + CardContent flush) — never inside a narrow grid column. Cells default to white-space:nowrap (scroll, don't crush).",
    props: [
      { name: "data", type: "T[]", required: true, description: "Row data array." },
      { name: "columns", type: "ColumnDef<T>[]", required: true, description: "Each: { key, header, render?(row), align?: 'left'|'center'|'right', sortable?, width? }. width is a Tailwind class string e.g. 'w-64'." },
      { name: "getRowId", type: "(row: T) => string", description: "Row key extractor (falls back to row.id). Required when selectable." },
      { name: "onRowClick", type: "(row: T) => void", description: "Navigate on row click; ignored when target is interactive." },
      { name: "selectable", type: "boolean", defaultValue: "false", description: "Enable checkbox column + bulk selection." },
      { name: "selected", type: "Set<string>", description: "Controlled selection set." },
      { name: "onSelectChange", type: "(next: Set<string>) => void", description: "Selection change handler." },
      { name: "onSortChange", type: "(sort | undefined) => void", description: "Fires when a sortable header is clicked; undefined clears sort." },
    ],
    example: `import { Card, CardContent, DataTable, StatusBadge } from "@godxjp/ui/data-display";
import type { ColumnDef } from "@godxjp/ui/data-display";
import { router } from "@inertiajs/react";

type Member = { id: string; name: string; status: string };
const columns: ColumnDef<Member>[] = [
  { key: "name", header: "氏名", width: "w-64", render: (m) => <span className="font-medium">{m.name}</span> },
  { key: "status", header: "ステータス", render: (m) => <StatusBadge status={m.status} /> },
];

<Card>
  <CardContent flush>
    <DataTable data={members} columns={columns} getRowId={(m) => m.id}
      onRowClick={(m) => router.visit("/members/" + m.id)} />
  </CardContent>
</Card>`,
    storyPath: "data-display/DataTable.stories.tsx",
    rules: [37, 39, 35],
  },
  {
    name: "Card",
    group: "data-display",
    tagline: "Surface container with optional accent stripe, variant fill, size, and density. Compose with CardHeader/CardTitle/CardContent/CardFooter.",
    props: [
      { name: "accent", type: '"primary" | "success" | "warning" | "info" | "attention" | "destructive"', description: "3px left-edge semantic accent stripe." },
      { name: "variant", type: '"default" | "muted" | "outline" | "featured"', defaultValue: '"default"', description: "Surface fill style." },
      { name: "size", type: '"default" | "compact"', defaultValue: '"default"', description: "Card size preset." },
      { name: "density", type: '"tight" | "cozy"', description: "Internal padding density (base 16 / tight 12 / cozy 20)." },
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
    tagline: "Card body. flush = edge-to-edge (for DataTable/tabs); tight = no top gap; solo = no header above. NEVER put a FilterBar inside flush (it loses padding).",
    props: [
      { name: "flush", type: "boolean", description: "Remove horizontal padding for edge-to-edge tables / tabs lists." },
      { name: "tight", type: "boolean", description: "No top gap after header — pair with flush toolbars/tabs." },
      { name: "solo", type: "boolean", description: "No header above: top padding matches the card shell." },
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
    name: "CardStat",
    group: "data-display",
    tagline: "KPI tile with label, value, optional hint and delta. NO accent prop (accent is a Card prop).",
    props: [
      { name: "label", type: "ReactNode", required: true, description: "Metric name." },
      { name: "value", type: "ReactNode", required: true, description: "Metric value (string/number/ReactNode)." },
      { name: "hint", type: "ReactNode", description: "Secondary context below the value." },
      { name: "delta", type: "ReactNode", description: "Compact trend text beside the value." },
      { name: "layout", type: '"stacked" | "inline"', defaultValue: '"stacked"', description: "stacked = label over value; inline = label left / value right." },
      { name: "align", type: '"start" | "end"', description: "Align the metric group." },
    ],
    example: `import { CardStat } from "@godxjp/ui/data-display";
import { ResponsiveGrid } from "@godxjp/ui/layout";

<ResponsiveGrid columns={3}>
  <CardStat label="総会員数" value="12,450" hint="先月比 +3%" />
  <CardStat label="月次売上" value="¥8,200,000" delta="+12%" />
  <CardStat label="利用率" value="68.4%" />
</ResponsiveGrid>`,
    storyPath: "data-display/CardStat.stories.tsx",
    rules: [],
  },
  {
    name: "StatusBadge",
    group: "data-display",
    tagline: "Lifecycle chip that auto-maps English keys (active/draft/pending/failed/…) to tone + icon. For localized labels or tiers, pass tone explicitly; pass icon={null} for tiers. Chips never wrap.",
    props: [
      { name: "status", type: "string", required: true, description: "Lifecycle key or any domain string. Unknown strings fall back to neutral unless tone is set." },
      { name: "tone", type: '"success" | "warning" | "destructive" | "info" | "neutral"', description: "Override the resolved tone (escape hatch for localized / tier values)." },
      { name: "icon", type: "LucideIcon | null", description: "Override the icon; null hides it — preferred for tier / category badges." },
      { name: "label", type: "ReactNode", description: "Override display text (default: i18n of key, or raw status)." },
    ],
    example: `import { StatusBadge } from "@godxjp/ui/data-display";

<>
  <StatusBadge status="active" label="公開中" />            {/* green check */}
  <StatusBadge status="プレミアム" tone="success" icon={null} />  {/* tier pill, no icon */}
  <StatusBadge status="ゴールド" tone="warning" icon={null} />
</>`,
    storyPath: "data-display/StatusBadge.stories.tsx",
    rules: [35, 36],
  },
  {
    name: "Badge",
    group: "data-display",
    tagline: "Plain label chip with semantic variants. Use for static category tags; use StatusBadge for lifecycle status.",
    props: [
      { name: "variant", type: '"default" | "secondary" | "destructive" | "outline" | "success" | "warning"', defaultValue: '"default"', description: "Visual variant." },
      { name: "children", type: "ReactNode", required: true, description: "Badge text/content." },
    ],
    example: `import { Badge } from "@godxjp/ui/data-display";

<Badge variant="secondary">A/B</Badge>
<Badge variant="success">承認済</Badge>`,
    storyPath: "data-display/Badge.stories.tsx",
    rules: [35],
  },
  {
    name: "KeyValueGrid",
    group: "data-display",
    tagline: "Responsive definition grid for detail-page metadata. COMPOUND — value goes in KeyValueGrid.Item children.",
    props: [
      { name: "columns", type: "1 | 2 | 3", defaultValue: "2", description: "Column count; collapses to 1 on mobile." },
      { name: "children", type: "ReactNode", required: true, description: "KeyValueGrid.Item elements." },
    ],
    example: `import { KeyValueGrid } from "@godxjp/ui/data-display";

<KeyValueGrid columns={2}>
  <KeyValueGrid.Item label="会員ID" mono>{member.id}</KeyValueGrid.Item>
  <KeyValueGrid.Item label="プラン">{member.plan}</KeyValueGrid.Item>
  <KeyValueGrid.Item label="メモ" span={2}>{member.note}</KeyValueGrid.Item>
</KeyValueGrid>`,
    storyPath: "data-display/KeyValueGrid.stories.tsx",
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
    example: `import { EmptyState } from "@godxjp/ui/data-display";

<EmptyState title="該当データがありません" description="検索条件を変更してください。" />`,
    storyPath: "data-display/EmptyState.stories.tsx",
    rules: [],
  },
  {
    name: "ProgressMeter",
    group: "data-display",
    tagline: "Horizontal progress bar 0–100 with optional label and semantic tone.",
    props: [
      { name: "value", type: "number", required: true, description: "Progress percentage 0–100 (clamped)." },
      { name: "label", type: "string", description: "Text label beside/below the bar." },
      { name: "tone", type: '"success" | "warning"', defaultValue: '"success"', description: "Bar colour tone." },
    ],
    example: `import { ProgressMeter } from "@godxjp/ui/data-display";

<ProgressMeter value={pct} label={pct + "% 使用中"} tone={pct >= 80 ? "warning" : "success"} />`,
    storyPath: "data-display/ProgressMeter.stories.tsx",
    rules: [],
  },
  {
    name: "Timeline",
    group: "data-display",
    tagline: "Vertical event list with an icon rail. Current item gets a highlighted glyph.",
    props: [
      { name: "items", type: "TimelineItem[]", required: true, description: "Array of { title, location?, time?, note?, current? }." },
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
    tagline: "Primitive table shell (Table/TableHeader/TableBody/TableRow/TableHead/TableCell). Prefer DataTable for admin lists; use these for custom one-off tables.",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "TableHeader / TableBody composition." },
      { name: "className", type: "string", description: "Extra classes on the table element." },
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
    tagline: "TanStack Query lifecycle widget — skeleton / error / empty / success for one useQuery block. Import from @godxjp/ui/query.",
    props: [
      { name: "query", type: "UseQueryResult<T>", required: true, description: "The useQuery result." },
      { name: "skeleton", type: "ReactNode", required: true, description: "Shown while loading." },
      { name: "children", type: "(data) => ReactNode", required: true, description: "Render function with resolved data." },
      { name: "empty", type: "ReactNode", description: "Shown when isEmpty(data) is true." },
      { name: "isEmpty", type: "(data) => boolean", description: "Custom empty check." },
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
    tagline: "useInfiniteQuery widget — flatten pages, skeleton/empty/error, load-more footer. Import from @godxjp/ui/query.",
    props: [
      { name: "query", type: "UseInfiniteQueryResult", required: true, description: "The useInfiniteQuery result." },
      { name: "skeleton", type: "ReactNode", required: true, description: "Shown while initial load pends." },
      { name: "flatten", type: "(data) => TFlat", required: true, description: "Reduce pages to a flat list (use flattenItemPages helper)." },
      { name: "children", type: "(flat, helpers) => ReactNode", required: true, description: "Render with flat data + { fetchNextPage, hasNextPage, isFetchingNextPage }." },
    ],
    example: `import { InfiniteQueryState, flattenItemPages } from "@godxjp/ui/query";

<InfiniteQueryState query={q} skeleton={<SkeletonRows />} flatten={flattenItemPages} isEmpty={(it) => it.length === 0}>
  {(items) => items.map((a) => <ActivityRow key={a.id} activity={a} />)}
</InfiniteQueryState>`,
    storyPath: "query/InfiniteQueryState.stories.tsx",
    rules: [],
  },
  {
    name: "MutationFeedback",
    group: "data-display",
    tagline: "Inline mutation error — renders nothing when idle/successful. Import from @godxjp/ui/query.",
    props: [
      { name: "mutation", type: "{ isError, error, isPending }", required: true, description: "useMutation result." },
      { name: "onRetry", type: "() => void", description: "Retry handler." },
    ],
    example: `import { MutationFeedback } from "@godxjp/ui/query";

<MutationFeedback mutation={saveMutation} />`,
    storyPath: "query/MutationFeedback.stories.tsx",
    rules: [],
  },

  // ─── data-entry ─────────────────────────────────────────────────────────
  {
    name: "FormField",
    group: "data-entry",
    tagline: "Wraps a control with label, helper, and error; injects aria-describedby/aria-invalid onto the child.",
    props: [
      { name: "id", type: "string", required: true, description: "Forwarded to Label htmlFor + builds helper/error ids." },
      { name: "label", type: "ReactNode", required: true, description: "Field label above the control." },
      { name: "required", type: "boolean", defaultValue: "false", description: "Red asterisk + aria-required on the child." },
      { name: "helper", type: "string", description: "Muted hint shown when there is no error." },
      { name: "error", type: "string", description: "Destructive error message (role=alert); overrides helper." },
      { name: "children", type: "ReactNode", required: true, description: "The single control to render." },
    ],
    example: `import { FormField, Input } from "@godxjp/ui/data-entry";

<FormField id="coupon-name" label="クーポン名" required error={errors.name} helper="最大50文字">
  <Input id="coupon-name" placeholder="春の花粉症対策15%OFF" value={name} onChange={(e) => setName(e.target.value)} />
</FormField>`,
    storyPath: "data-entry/FormField.stories.tsx",
    rules: [23],
  },
  {
    name: "Input",
    group: "data-entry",
    tagline: "Styled wrapper around native <input>; accepts all HTML input attributes. Pair with FormField for labelled fields.",
    props: [
      { name: "id", type: "string", description: "Associates with a <label htmlFor>." },
      { name: "type", type: "string", defaultValue: '"text"', description: "Native input type." },
      { name: "placeholder", type: "string", description: "Placeholder." },
      { name: "value", type: "string | number", description: "Controlled value." },
      { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", description: "Native change handler." },
    ],
    example: `import { Input } from "@godxjp/ui/data-entry";

<Input id="qty" type="number" placeholder="例: 500" value={value} onChange={(e) => setValue(e.target.value)} />`,
    storyPath: "data-entry/Input.stories.tsx",
    rules: [],
  },
  {
    name: "SearchInput",
    group: "data-entry",
    tagline: "Debounced search box with a clear button. Fires onSearch (NOT onChange) after the debounce. Controlled (value) or uncontrolled (defaultValue).",
    props: [
      { name: "onSearch", type: "(q: string) => void", required: true, description: "Called with the query after the debounce. Use this to drive filtering — NOT onChange." },
      { name: "value", type: "string", description: "Controlled value." },
      { name: "defaultValue", type: "string", defaultValue: '""', description: "Initial uncontrolled value." },
      { name: "placeholder", type: "string", description: "Input placeholder." },
      { name: "debounce", type: "number", defaultValue: "250", description: "Debounce delay (ms)." },
    ],
    example: `import { SearchInput } from "@godxjp/ui/data-entry";

<SearchInput placeholder="クーポン名・IDで検索" value={search} onSearch={setSearch} />`,
    storyPath: "data-entry/SearchInput.stories.tsx",
    rules: [23],
  },
  {
    name: "Select",
    group: "data-entry",
    tagline: "Radix compound select. Controlled via value + onValueChange on <Select>; compose SelectTrigger>SelectValue and SelectContent>SelectItem. This is the filter/select pattern the app uses.",
    props: [
      { name: "value", type: "string", description: "Controlled selected value." },
      { name: "defaultValue", type: "string", description: "Uncontrolled initial value." },
      { name: "onValueChange", type: "(value: string) => void", description: "Called when the user picks an item." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Disable the trigger." },
    ],
    example: `import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@godxjp/ui/data-entry";

<Select value={status} onValueChange={setStatus}>
  <SelectTrigger><SelectValue placeholder="全ステータス" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="all">全ステータス</SelectItem>
    <SelectItem value="active">公開中</SelectItem>
    <SelectItem value="draft">下書き</SelectItem>
  </SelectContent>
</Select>`,
    storyPath: "data-entry/Select.stories.tsx",
    rules: [23],
  },
  {
    name: "Switch",
    group: "data-entry",
    tagline: "Radix toggle switch (bare). For a labelled row with a hidden form input use SwitchField.",
    props: [
      { name: "checked", type: "boolean", description: "Controlled checked state." },
      { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Fires when toggled." },
      { name: "id", type: "string", description: "Links to a <Label htmlFor>." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Disable the toggle." },
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
      { name: "onChange", type: "React.ChangeEventHandler<HTMLTextAreaElement>", description: "Change handler." },
    ],
    example: `import { Textarea } from "@godxjp/ui/data-entry";

<Textarea id="notes" rows={4} placeholder="自由記述" value={notes} onChange={(e) => setNotes(e.target.value)} />`,
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
      { name: "checked", type: "boolean | 'indeterminate'", description: "Controlled checked state." },
      { name: "onCheckedChange", type: "(checked) => void", description: "Fires when checked state changes." },
      { name: "id", type: "string", description: "Links to a <Label htmlFor>." },
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
      { name: "onValueChange", type: "(value: string) => void", description: "Fires on selection change." },
      { name: "options", type: "ChoiceOptionProp[]", description: "Declarative list: { label, value, disabled?, description? }." },
      { name: "orientation", type: '"horizontal" | "vertical"', defaultValue: '"vertical"', description: "Layout direction." },
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
    tagline: "Calendar popover for a single date; controlled via value (Date) + onChange.",
    props: [
      { name: "value", type: "Date", description: "Controlled selected date." },
      { name: "onChange", type: "(date: Date | undefined) => void", description: "Fires when picked/cleared." },
      { name: "placeholder", type: "string", description: "Trigger label when empty." },
    ],
    example: `import { DatePicker, FormField } from "@godxjp/ui/data-entry";

<FormField id="valid-from" label="有効開始日">
  <DatePicker id="valid-from" value={validFrom} onChange={setValidFrom} placeholder="日付を選択" />
</FormField>`,
    storyPath: "data-entry/DatePicker.stories.tsx",
    rules: [],
  },

  // ─── feedback ───────────────────────────────────────────────────────────
  {
    name: "Dialog",
    group: "feedback",
    tagline: "Compound modal. Controlled via open + onOpenChange. Parts available flat (DialogTrigger/DialogContent/…) or as Dialog.Trigger/Dialog.Content. mode=\"confirm\" switches to alertdialog.",
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Open-state change handler." },
      { name: "mode", type: '"form" | "confirm"', defaultValue: '"form"', description: "form = Radix Dialog (× close); confirm = AlertDialog (no ×)." },
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
    name: "Sheet",
    group: "feedback",
    tagline: "Side-panel drawer (Radix Dialog). Parts: Sheet/SheetTrigger/SheetContent(side=right|left|top|bottom)/SheetHeader/SheetTitle/SheetFooter.",
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Open-state change handler." },
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
    tagline: "Inline alert banner with variant-aware icon + optional dismiss. Parts: Alert/AlertTitle/AlertDescription/AlertActions/AlertQueryError.",
    props: [
      { name: "variant", type: '"default" | "destructive" | "warning" | "success"', defaultValue: '"default"', description: "Colour scheme + default icon." },
      { name: "onDismiss", type: "() => void", description: "Renders an × dismiss button when provided." },
      { name: "icon", type: "LucideIcon | false", description: "Override or hide (false) the icon." },
    ],
    example: `import { Alert, AlertTitle, AlertDescription } from "@godxjp/ui/feedback";

<Alert variant="warning">
  <AlertTitle>3 件の打刻漏れがあります</AlertTitle>
  <AlertDescription>本日中に確認してください。</AlertDescription>
</Alert>`,
    storyPath: "feedback/Alert.stories.tsx",
    rules: [],
  },
  {
    name: "SkeletonTable",
    group: "feedback",
    tagline: "Loading placeholder matching the DataTable layout (header + N rows). Drop-in while data loads (deferred props).",
    props: [
      { name: "rows", type: "number", defaultValue: "8", description: "Body skeleton rows." },
      { name: "columns", type: "number", defaultValue: "5", description: "Columns in header + body." },
    ],
    example: `import { SkeletonTable } from "@godxjp/ui/feedback";

{!coupons ? <SkeletonTable rows={10} columns={6} /> : <DataTable data={coupons} columns={columns} />}`,
    storyPath: "feedback/Skeleton.stories.tsx",
    rules: [],
  },
  {
    name: "SkeletonCard",
    group: "feedback",
    tagline: "Loading placeholder shaped like a CardStat tile. Use inside a ResponsiveGrid while KPIs load.",
    props: [],
    example: `import { SkeletonCard } from "@godxjp/ui/feedback";
import { ResponsiveGrid } from "@godxjp/ui/layout";

<ResponsiveGrid columns={4}><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></ResponsiveGrid>`,
    storyPath: "feedback/Skeleton.stories.tsx",
    rules: [],
  },
  {
    name: "Toaster",
    group: "feedback",
    tagline: "Mount once at app root to enable toasts. IMPORTANT: trigger toasts via `import { toast } from \"sonner\"` — NOT from @godxjp/ui.",
    props: [
      { name: "position", type: '"top-right" | "top-center" | "bottom-right" | "…"', defaultValue: '"bottom-right"', description: "Toast stack anchor." },
      { name: "richColors", type: "boolean", description: "Enable Sonner rich variant colours." },
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
    tagline: "Radix tab container. Compose Tabs/TabsList/TabsTrigger/TabsContent. Controlled (value/onValueChange) or uncontrolled (defaultValue).",
    props: [
      { name: "value", type: "string", description: "Controlled active tab key." },
      { name: "defaultValue", type: "string", description: "Uncontrolled initial tab key." },
      { name: "onValueChange", type: "(value: string) => void", description: "Active-tab change handler." },
    ],
    example: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@godxjp/ui/navigation";

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">概要</TabsTrigger>
    <TabsTrigger value="history">履歴</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">概要コンテンツ</TabsContent>
  <TabsContent value="history">履歴コンテンツ</TabsContent>
</Tabs>`,
    storyPath: "navigation/Tabs.stories.tsx",
    rules: [],
  },
  {
    name: "FilterBar",
    group: "navigation",
    tagline: "Standard list-page filter strip. Place ABOVE the table Card — NEVER inside CardContent flush (it strips padding). Compose with FilterGroup + SearchInput + Select.",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Filter controls + FilterGroup wrappers." },
      { name: "hasActiveFilters", type: "boolean", description: "Shows a clear-all button when true." },
      { name: "onClear", type: "() => void", description: "Clear-all handler." },
    ],
    example: `import { FilterBar, FilterGroup } from "@godxjp/ui/navigation";
import { SearchInput, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@godxjp/ui/data-entry";

<FilterBar hasActiveFilters={search !== ""} onClear={() => setSearch("")}>
  <SearchInput placeholder="名前で検索" value={search} onSearch={setSearch} />
  <FilterGroup label="ステータス">
    <Select value={status} onValueChange={setStatus}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">すべて</SelectItem>
        <SelectItem value="active">有効</SelectItem>
      </SelectContent>
    </Select>
  </FilterGroup>
</FilterBar>`,
    storyPath: "navigation/FilterBar.stories.tsx",
    rules: [38, 40],
  },
  {
    name: "FilterGroup",
    group: "navigation",
    tagline: "Labelled filter slot inside FilterBar — wraps a single Select/DatePicker.",
    props: [
      { name: "label", type: "ReactNode", required: true, description: "Label shown with the child control." },
      { name: "children", type: "ReactNode", required: true, description: "The filter control." },
    ],
    example: `import { FilterGroup } from "@godxjp/ui/navigation";

<FilterGroup label="スコープ"><Select>{/* ... */}</Select></FilterGroup>`,
    storyPath: "navigation/FilterBar.stories.tsx",
    rules: [38],
  },
  {
    name: "Pagination",
    group: "navigation",
    tagline: "Offset/page-based pagination bar. Sits below a table card.",
    props: [
      { name: "current", type: "number", defaultValue: "1", description: "Current page (1-indexed)." },
      { name: "total", type: "number", description: "Total number of items." },
      { name: "pageSize", type: "number", defaultValue: "10", description: "Items per page." },
      { name: "showTotal", type: "boolean | (total, range) => ReactNode", description: "Show total count, or a custom label fn." },
      { name: "onChange", type: "(page: number, pageSize: number) => void", description: "Page / page-size change handler." },
    ],
    example: `import { Pagination } from "@godxjp/ui/navigation";

<Pagination current={page} total={filtered.length} pageSize={10} showTotal onChange={(p) => setPage(p)} />`,
    storyPath: "navigation/Pagination.stories.tsx",
    rules: [40],
  },
  {
    name: "DropdownMenu",
    group: "navigation",
    tagline: "Radix dropdown menu. Compose DropdownMenu/DropdownMenuTrigger/DropdownMenuContent/DropdownMenuItem/DropdownMenuSeparator.",
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Open-state change handler." },
    ],
    example: `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@godxjp/ui/navigation";
import { Button } from "@godxjp/ui/general";

<DropdownMenu>
  <DropdownMenuTrigger asChild><Button variant="outline" size="sm">操作</Button></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>編集</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">削除</DropdownMenuItem>
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
      { name: "items", type: "StepItemProp[]", description: "Array of { title, subTitle?, description?, icon?, status? }." },
      { name: "current", type: "number", defaultValue: "0", description: "Active step index (0-based)." },
      { name: "orientation", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"', description: "Layout direction." },
    ],
    example: `import { Steps } from "@godxjp/ui/navigation";

<Steps current={1} items={[{ title: "申請" }, { title: "審査中" }, { title: "完了" }]} />`,
    storyPath: "navigation/Steps.stories.tsx",
    rules: [],
  },

  // ─── providers / datetime ───────────────────────────────────────────────
  {
    name: "AppProvider",
    group: "providers",
    tagline: "Root locale/timezone/date-time context — wrap the app ONCE. All pickers + formatDate read from it. Import from @godxjp/ui/app.",
    props: [
      { name: "defaultLocale", type: '"ja" | "en" | "vi"', defaultValue: '"vi"', description: "Initial locale." },
      { name: "defaultTimezone", type: 'string | "browser" | "system"', defaultValue: '"browser"', description: "Initial IANA timezone." },
      { name: "defaultDateFormat", type: '"iso" | "dmy" | "mdy" | "locale"', defaultValue: '"locale"', description: "Initial date display format." },
      { name: "defaultTimeFormat", type: '"24h" | "12h" | "locale"', defaultValue: '"locale"', description: "Initial clock format." },
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
    tagline: "MANDATORY for all date/time display. Auto-detects ISO date / HH:mm / instant; reads AppProvider context. Import from @godxjp/ui/datetime.",
    props: [
      { name: "value", type: "string | Date | null | undefined", required: true, description: "ISO date, ISO datetime, HH:mm, or Date." },
      { name: "options.kind", type: '"auto" | "date" | "datetime" | "time" | "long" | "relative"', defaultValue: '"auto"', description: "Output preset; auto infers from the value." },
    ],
    example: `import { formatDate } from "@godxjp/ui/datetime";

formatDate(coupon.validFrom);                       // "2026-05-01"
formatDate(order.createdAt, { kind: "relative" });  // "3日前"`,
    storyPath: "app/formatDate.stories.tsx",
    rules: [5],
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

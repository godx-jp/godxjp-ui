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
    tagline:
      "Vertical flex column with token gap — the default block-stacking primitive (use instead of space-y-*).",
    props: [
      {
        name: "gap",
        type: '"xs" | "sm" | "md" | "lg" | "xl"',
        defaultValue: '"md"',
        description: "Vertical space between children (design tokens).",
      },
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
    tagline:
      "Horizontal flex row with token gap — the default inline/row arrangement (use instead of gap-* on a flex div).",
    props: [
      {
        name: "gap",
        type: '"xs" | "sm" | "md" | "lg"',
        defaultValue: '"sm"',
        description: "Horizontal space between children.",
      },
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
        description: "Grid items — typically Card or CardStat.",
      },
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
      "DO: Add children: SidebarItemProp[] to any SidebarItemProp to create a collapsible submenu group. The parent item's icon is required even for groups. The group auto-opens and highlights when activeId matches any descendant.",
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
        children: [
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
      "App-shell top bar with product/project chip switchers, search, notifications, and sidebar toggle — pass DropdownMenuContent to productMenu/projectMenu to turn any chip into a real dropdown switcher; the project chip is hidden entirely when neither project nor projectMenu is set.",
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
      "ShellApp — a higher-level opinionated shell that already composes AppShell + Topbar with hardcoded product/project chips; use it for prototypes but use AppShell + Topbar directly for production apps that need real switcher props.",
    ],
    example: `import { Topbar } from "@godxjp/ui/layout";
import { AppShell } from "@godxjp/ui/layout";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@godxjp/ui/navigation";

// Entity-switcher example: product chip opens an entity dropdown,
// project chip is hidden (no project concept in this app).
function MyShell({ children }: { children: React.ReactNode }) {
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
    name: "PageInset",
    group: "layout",
    tagline:
      'Padded horizontal strip aligned with the page header — use inside variant="flush" for filter bars / intros.',
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "Content rendered with standard page horizontal padding.",
      },
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
        type: '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"',
        defaultValue: '"default"',
        description: "Visual style.",
      },
      {
        name: "size",
        type: '"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"',
        defaultValue: '"default"',
        description: "Size preset (height, padding, icon dims).",
      },
      {
        name: "asChild",
        type: "boolean",
        defaultValue: "false",
        description: "Render as Radix Slot — merge props onto the child (<a>/<Link>).",
      },
      { name: "disabled", type: "boolean", description: "Disable the button." },
      {
        name: "onClick",
        type: "React.MouseEventHandler<HTMLButtonElement>",
        description: "Click handler.",
      },
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
          "Column definitions. Each column: { key: string; header: ReactNode; render?: (row: T) => ReactNode; sortable?: boolean; width?: string; align?: 'left'|'center'|'right'; hiddenOnMobile?: boolean }. If render is omitted, the raw value at row[key] is rendered as a string.",
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
        type: "{ key: string; direction: 'asc' | 'desc' }",
        description:
          "Active sort state. When provided alongside onSortChange, sortable columns show directional arrow icons and are clickable. Clicking the active column twice clears sort (calls onSortChange(undefined)).",
      },
      {
        name: "onSortChange",
        type: "(sort: { key: string; direction: 'asc' | 'desc' } | undefined) => void",
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
        type: '"default" | "compact"',
        defaultValue: '"default"',
        description: "Card size preset.",
      },
      {
        name: "density",
        type: '"tight" | "cozy"',
        description: "Internal padding density (base 16 / tight 12 / cozy 20).",
      },
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
      "Card body. flush = edge-to-edge (for DataTable/tabs); tight = no top gap; solo = no header above. NEVER put a FilterBar inside flush (it loses padding).",
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
    tagline:
      "KPI tile. ⚠️ CardStat IS ALREADY a bordered Card — render it DIRECTLY in ResponsiveGrid. NEVER wrap it in <Card>/<CardContent> (that double-borders it → looks too thick). NO accent prop (accent is a Card prop).",
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
    example: `import { CardStat } from "@godxjp/ui/data-display";
import { ResponsiveGrid } from "@godxjp/ui/layout";

// ✅ CardStat sits directly in the grid — it draws its own card + border.
<ResponsiveGrid columns={3}>
  <CardStat label="総会員数" value="12,450" hint="先月比 +3%" />
  <CardStat label="月次売上" value="¥8,200,000" delta="+12%" />
  <CardStat label="利用率" value="68.4%" />
</ResponsiveGrid>

// ❌ Double border — do NOT wrap CardStat in a Card:
// <Card><CardContent><CardStat label="x" value="1" /></CardContent></Card>`,
    storyPath: "data-display/CardStat.stories.tsx",
    rules: [],
  },
  {
    name: "StatusBadge",
    group: "data-display",
    tagline:
      "Lifecycle chip that auto-maps English keys (active/draft/pending/failed/…) to tone + icon. For localized labels or tiers, pass tone explicitly; pass icon={null} for tiers. Chips never wrap.",
    props: [
      {
        name: "status",
        type: "string",
        required: true,
        description:
          "Lifecycle key or any domain string. Unknown strings fall back to neutral unless tone is set.",
      },
      {
        name: "tone",
        type: '"success" | "warning" | "destructive" | "info" | "neutral"',
        description: "Override the resolved tone (escape hatch for localized / tier values).",
      },
      {
        name: "icon",
        type: "LucideIcon | null",
        description: "Override the icon; null hides it — preferred for tier / category badges.",
      },
      {
        name: "label",
        type: "ReactNode",
        description: "Override display text (default: i18n of key, or raw status).",
      },
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
    tagline:
      "Plain label chip with semantic variants. Use for static category tags; use StatusBadge for lifecycle status.",
    props: [
      {
        name: "variant",
        type: '"default" | "secondary" | "destructive" | "outline" | "success" | "warning"',
        defaultValue: '"default"',
        description: "Visual variant.",
      },
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
    tagline:
      "Responsive definition grid for detail-page metadata. COMPOUND — value goes in KeyValueGrid.Item children.",
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
        description: "KeyValueGrid.Item elements.",
      },
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
      {
        name: "items",
        type: "TimelineItem[]",
        required: true,
        description: "Array of { title, location?, time?, note?, current? }.",
      },
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
    tagline:
      "Inline mutation error — renders nothing when idle/successful. Import from @godxjp/ui/query.",
    props: [
      {
        name: "mutation",
        type: "{ isError, error, isPending }",
        required: true,
        description: "useMutation result.",
      },
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
    tagline:
      "Wraps a control with label, helper, and error; injects aria-describedby/aria-invalid onto the child.",
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
        name: "children",
        type: "ReactNode",
        required: true,
        description: "The single control to render.",
      },
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
    example: `import { Input } from "@godxjp/ui/data-entry";

<Input id="qty" type="number" placeholder="例: 500" value={value} onChange={(e) => setValue(e.target.value)} />`,
    storyPath: "data-entry/Input.stories.tsx",
    rules: [],
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
        type: '"sm" | "default"',
        defaultValue: '"default"',
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
      "Autocomplete — deprecated thin wrapper; replaced by Select with options + showSearch.",
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
      onChange={onChange}
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
      onChange={onChange}
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
      onChange={onChange}
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
    tagline:
      "Radix toggle switch (bare). For a labelled row with a hidden form input use SwitchField.",
    props: [
      { name: "checked", type: "boolean", description: "Controlled checked state." },
      {
        name: "onCheckedChange",
        type: "(checked: boolean) => void",
        description: "Fires when toggled.",
      },
      { name: "id", type: "string", description: "Links to a <Label htmlFor>." },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disable the toggle.",
      },
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
        onChange={setDueDate}
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
      'Compound modal. Controlled via open + onOpenChange. Parts available flat (DialogTrigger/DialogContent/…) or as Dialog.Trigger/Dialog.Content. mode="confirm" switches to alertdialog.',
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open-state change handler.",
      },
      {
        name: "mode",
        type: '"form" | "confirm"',
        defaultValue: '"form"',
        description: "form = Radix Dialog (× close); confirm = AlertDialog (no ×).",
      },
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
    tagline:
      "Side-panel drawer (Radix Dialog). Parts: Sheet/SheetTrigger/SheetContent(side=right|left|top|bottom)/SheetHeader/SheetTitle/SheetFooter.",
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open-state change handler.",
      },
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
    example: `import { SkeletonTable } from "@godxjp/ui/feedback";

{!coupons ? <SkeletonTable rows={10} columns={6} /> : <DataTable data={coupons} columns={columns} />}`,
    storyPath: "feedback/Skeleton.stories.tsx",
    rules: [],
  },
  {
    name: "SkeletonCard",
    group: "feedback",
    tagline:
      "Loading placeholder shaped like a CardStat tile. Use inside a ResponsiveGrid while KPIs load.",
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
      "Radix tab container. Compose Tabs/TabsList/TabsTrigger/TabsContent. Controlled (value/onValueChange) or uncontrolled (defaultValue).",
    props: [
      { name: "value", type: "string", description: "Controlled active tab key." },
      { name: "defaultValue", type: "string", description: "Uncontrolled initial tab key." },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Active-tab change handler.",
      },
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
    tagline:
      "Standard list-page filter strip. Place ABOVE the table Card — NEVER inside CardContent flush (it strips padding). Compose with FilterGroup + SearchInput + Select.",
    props: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Filter controls + FilterGroup wrappers.",
      },
      {
        name: "hasActiveFilters",
        type: "boolean",
        description: "Shows a clear-all button when true.",
      },
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
      {
        name: "label",
        type: "ReactNode",
        required: true,
        description: "Label shown with the child control.",
      },
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
      {
        name: "current",
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
        name: "onChange",
        type: "(page: number, pageSize: number) => void",
        description: "Page / page-size change handler.",
      },
    ],
    example: `import { Pagination } from "@godxjp/ui/navigation";

<Pagination current={page} total={filtered.length} pageSize={10} showTotal onChange={(p) => setPage(p)} />`,
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
      {
        name: "items",
        type: "StepItemProp[]",
        description: "Array of { title, subTitle?, description?, icon?, status? }.",
      },
      {
        name: "current",
        type: "number",
        defaultValue: "0",
        description: "Active step index (0-based).",
      },
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        defaultValue: '"horizontal"',
        description: "Layout direction.",
      },
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
        onChange={setStartTime}
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
        onChange={setRange}
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
    name: "SwitchField",
    group: "data-entry",
    tagline:
      "Labelled boolean switch with a hidden 0/1 input for HTML form submission — use this instead of bare Switch whenever you need a label or a form name.",
    props: [
      {
        name: "label",
        type: "string",
        required: true,
        description: "Visible text label rendered to the right of the switch toggle.",
      },
      {
        name: "name",
        type: "string",
        required: true,
        description:
          "HTML name attribute used by the hidden input — the value submitted is '1' (on) or '0' (off).",
      },
      {
        name: "id",
        type: "string",
        description:
          "ID wired to the Switch and Label htmlFor. Auto-generated via useId() when omitted.",
      },
      {
        name: "checked",
        type: "boolean",
        description:
          "Controlled checked state. When provided the component is fully controlled; onCheckedChange must also be supplied.",
      },
      {
        name: "defaultChecked",
        type: "boolean",
        defaultValue: "false",
        description: "Uncontrolled initial checked state. Ignored when checked is provided.",
      },
      {
        name: "onCheckedChange",
        type: "(checked: boolean) => void",
        description: "Fires with the new boolean value whenever the switch is toggled.",
      },
      {
        name: "required",
        type: "boolean",
        description:
          "Marks the field as required — renders a red asterisk next to the label and sets aria-required on the switch.",
      },
      {
        name: "helper",
        type: "string",
        description: "Secondary hint text shown below the label. Hidden when error is set.",
      },
      {
        name: "error",
        type: "string",
        description:
          "Validation error message. Renders below the row as a role=alert paragraph and sets aria-invalid on the switch.",
      },
      {
        name: "labelAddon",
        type: "React.ReactNode",
        description:
          "Optional node rendered inline after the label text (e.g. a Badge or tooltip trigger).",
      },
      { name: "disabled", type: "boolean", description: "Disables the switch toggle." },
      {
        name: "size",
        type: '"sm" | "default"',
        description: "Switch toggle size. Forwarded to the inner Switch primitive.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra class names applied to the outer wrapper div.",
      },
    ],
    usage: [
      "DO use SwitchField (not bare Switch) whenever a form name is required — it automatically mirrors a hidden input with value '1'/'0' so native HTML form.submit() and FormData work without extra wiring.",
      "DO NOT use SwitchField without the name prop if you are not submitting via HTML form — pass name anyway; it is required by the type signature and is a safe no-op when FormData is not read.",
      "Controlled mode: supply both checked and onCheckedChange. Uncontrolled mode: use defaultChecked only. Never mix — passing checked without onCheckedChange leaves the switch frozen.",
      "The error prop replaces the helper text — both cannot appear simultaneously. Show validation errors via error, not as helper text that is always visible.",
      "labelAddon is rendered inline after the label text at the same font size — use it for a small Badge ('Beta'), InfoTooltip, or similar inline decoration, NOT for a full action button.",
      "NEVER hand-roll a Switch + Label + hidden-input pattern yourself; SwitchField already composes Switch, Label, hidden input, aria-describedby, aria-required, aria-invalid, and role=alert in a single component.",
    ],
    useCases: [
      "Settings toggles in an admin form (e.g. 'Enable auto-invoice', 'Allow concurrent sessions') where the page POSTs via Inertia useForm — the hidden 0/1 input is picked up by FormData automatically.",
      "Permissions or feature-flag checkboxes on a user/role edit page where the UI needs a helper hint ('Allows access to billing module') alongside the toggle.",
      "Inline required toggles in a multi-step wizard step where validation errors need to surface below the row via the error prop.",
      "Accounting app: 'Mark as reconciled', 'Exclude from report', 'Apply tax-exempt status' — boolean flags that must be submitted with the record form.",
      "Row-level status toggles in a card layout (e.g. 'Active' on a payment method card) using the sm size to keep the toggle compact.",
      "Any boolean setting that needs a visible label + accessible association (htmlFor / aria) without writing the Switch + Label wiring manually.",
    ],
    related: [
      "Switch — bare Radix toggle with no label, no hidden input, and no error/helper. Use Switch when you are managing the label yourself (e.g. inside a custom flex row) and do not need HTML form submission. Use SwitchField for any form field that needs a label, helper, error, or native form submission.",
      "Checkbox / CheckboxField — semantically for multi-select or tri-state (indeterminate). Use Checkbox for 'agree to terms' or multi-option selection. Use SwitchField for a single on/off boolean setting where the switch affordance fits better than a checkbox.",
      "FormField — generic field wrapper used by Input, Select, etc. SwitchField already bundles its own label/error layout; do NOT also wrap it in FormField.",
    ],
    example: `import { SwitchField } from "@godxjp/ui/data-entry";
import { useState } from "react";

// Uncontrolled — defaultChecked, value submitted as hidden 0/1
<SwitchField
  name="auto_invoice"
  label="自動請求を有効にする"
  helper="有効にすると月末に自動で請求書が発行されます"
  defaultChecked={false}
/>

// Controlled with validation error
function ReconcileToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <SwitchField
      name="reconciled"
      label="照合済み"
      checked={value}
      onCheckedChange={onChange}
      required
      error={!value ? "照合を完了してください" : undefined}
    />
  );
}`,
    storyPath: "data-entry/SwitchField.stories.tsx",
    rules: [3, 6, 13, 23],
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
        name: "onChange",
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
    children: [
      {
        value: "tokyo",
        label: "東京都",
        children: [
          { value: "shinjuku", label: "新宿区" },
          { value: "shibuya", label: "渋谷区" },
        ],
      },
    ],
  },
  {
    value: "vn",
    label: "Việt Nam",
    children: [
      {
        value: "hcm",
        label: "TP. Hồ Chí Minh",
        children: [
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
      onChange={(v) => setPath(v as string[])}
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
      onChange={(v) => setPaths(v as string[][])}
      showSearch
    />
  );
}

// With custom field names (data uses 'name'/'id'/'nodes')
<Cascader
  options={rawApiData}
  fieldNames={{ label: "name", value: "id", children: "nodes" }}
  defaultValue={["dept-1", "team-3"]}
/>

// changeOnSelect: lets user pick a branch node (not only leaves)
<Cascader
  options={REGIONS}
  changeOnSelect
  onChange={(v) => console.log("path", v)}
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
        name: "onChange",
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
          "Remap data object keys. Example: `{ label: 'name', value: 'id', children: 'items' }` so you don't have to transform your API response before passing it to `treeData`.",
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
    children: [
      { value: "current-assets", label: "Current Assets", children: [
          { value: "cash", label: "Cash" },
          { value: "ar", label: "Accounts Receivable" },
        ],
      },
      { value: "fixed-assets", label: "Fixed Assets", children: [
          { value: "equipment", label: "Equipment" },
        ],
      },
    ],
  },
  {
    value: "liabilities",
    label: "Liabilities",
    children: [
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
        onChange={(v) => setAccount(v as string | undefined)}
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
      onChange={(v) => setSelected(v as string[])}
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
      "DO own `targetKeys` in state and update it inside `onChange`: `const [targetKeys, setTargetKeys] = useState<string[]>([]); onChange={(next) => setTargetKeys(next)}`.",
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
  { key: "1010", title: "Cash", description: "Asset" },
  { key: "1020", title: "Accounts Receivable", description: "Asset" },
  { key: "2010", title: "Accounts Payable", description: "Liability" },
  { key: "3010", title: "Revenue", description: "Income" },
  { key: "4010", title: "Cost of Goods Sold", description: "Expense", disabled: true },
];

export function AccountMapping() {
  const [targetKeys, setTargetKeys] = useState<string[]>(["1010"]);

  return (
    <Transfer
      dataSource={ALL_ACCOUNTS}
      targetKeys={targetKeys}
      onChange={(nextKeys) => setTargetKeys(nextKeys)}
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
        onChange={setItems}
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
      onChange={setItems}
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
import { UploadCropDialog } from "@godxjp/ui/data-entry";

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
      <input type="file" accept="image/*" onChange={handleFileChange} />
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
      "DO wrap in FormField when a label or validation message is needed — pass the same id to both FormField and ColorPicker so htmlFor wires up correctly: `<FormField id='brand' label='Brand color'><ColorPicker id='brand' value={v} onChange={setV} /></FormField>`.",
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
        onChange={setColor}
      />
    </FormField>
  );
}

// Compact swatch-only variant (no hex input)
export function SwatchOnly() {
  const [color, setColor] = useState("#16a34a");
  return <ColorPicker value={color} onChange={setColor} showHexInput={false} />;
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
      "ProgressMeter — use ProgressMeter (not a disabled Slider) to show read-only progress; Slider with disabled is semantically a control, not a status indicator.",
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
    name: "CountrySelect",
    group: "data-entry",
    tagline:
      "Flag-and-name country picker built on Select; always uncontrolled — pass `name` for form submission and `defaultValue` to pre-select, not `value`/`onChange`.",
    props: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "HTML id forwarded to the SelectTrigger for label association and a11y.",
      },
      {
        name: "name",
        type: "string",
        required: true,
        description:
          "Form field name. The selected country code (value) is submitted under this key via the hidden native select that Select wraps.",
      },
      {
        name: "options",
        type: "CountryOptionProp[]",
        required: true,
        description:
          "List of country options. Each entry must have at least `name` and either `value` or `code` (the country ISO code). Optionally include `nativeName`, `flagSvgPath`, and `label`.",
      },
      {
        name: "defaultValue",
        type: "string | null",
        description:
          "Pre-selected country code. When omitted (and allowEmpty is false), defaults to the first option's value. Pass null or empty string to show the placeholder.",
      },
      {
        name: "required",
        type: "boolean",
        defaultValue: "false",
        description: "Marks the field as required via aria-required on the trigger.",
      },
      {
        name: "allowEmpty",
        type: "boolean",
        defaultValue: "false",
        description:
          "When true, prepends an empty sentinel option (value '0') rendered as emptyLabel. Lets the user submit no country. Without this, the picker always has a real country selected.",
      },
      {
        name: "emptyLabel",
        type: "string",
        defaultValue: "—",
        description: "Label shown for the empty option when allowEmpty is true.",
      },
      {
        name: "placeholder",
        type: "string",
        description:
          "Placeholder text shown inside the trigger when no value is selected (relevant when defaultValue is null/empty and allowEmpty is true).",
      },
      {
        name: "invalid",
        type: "boolean",
        defaultValue: "false",
        description: "Sets aria-invalid on the SelectTrigger to indicate a validation error.",
      },
    ],
    usage: [
      "DO: Always pass both `id` and `name` — `id` wires up a `<label htmlFor>`, `name` is the form submission key for the selected country code.",
      "DO NOT: Pass `value`/`onChange` — CountrySelect is UNCONTROLLED only. It uses `defaultValue` (passed to the underlying Select). For controlled scenarios wrap the underlying `Select` primitive directly.",
      "DO: Populate `options` with objects satisfying CountryOptionProp — each needs `name` plus either `value` (preferred) or `code` as the ISO code. Add `flagSvgPath` for flag images and `nativeName` for bilingual display.",
      "DO: Use `allowEmpty` when the country field is optional — it inserts a sentinel '0' entry. Without it, a country is always pre-selected (falls back to options[0] if defaultValue is absent), so the form will always submit a real code.",
      "DO: Set `invalid={true}` in error state to surface aria-invalid to assistive technology; pair it with a visible error message adjacent to the control.",
      "DO NOT: Hand-roll a flag+name row or a custom country dropdown — use CountrySelect (for form submission) or CountryOptionLabel standalone (for display-only read-only rows).",
    ],
    useCases: [
      "Billing / shipping address forms where the user must pick a country before proceeding and the code is submitted to the server.",
      "Account settings pages where a user sets their home country or tax residency — use `defaultValue` with the stored ISO code to pre-populate.",
      "Invoice creation forms in an accounting app that require a supplier or customer country, with `allowEmpty={false}` to guarantee a code is always present.",
      "Optional 'country of origin' filter fields — use `allowEmpty={true}` so users can clear the selection back to 'no filter'.",
      "Multi-step onboarding flows that must pre-select a country inferred from the user's locale, then let them correct it.",
      "Read-only display of a country name + flag in a KeyValueGrid or DataTable cell — use `CountryOptionLabel` directly (not CountrySelect) for non-interactive display.",
    ],
    related: [
      "Select — the generic primitive CountrySelect is built on; use Select directly when you need a controlled picker or options that are not country objects.",
      "CountryOptionLabel — the flag + name row exported from the same module; use it standalone in read-only contexts (table cells, detail views) where no picker interaction is needed.",
      "DatePicker — another uncontrolled data-entry primitive that submits via a hidden form value; same pattern but for dates.",
    ],
    example: `import { CountrySelect } from "@godxjp/ui/data-entry";

const countries = [
  { value: "JP", name: "Japan", nativeName: "日本", flagSvgPath: "/flags/jp.svg" },
  { value: "US", name: "United States", nativeName: "United States", flagSvgPath: "/flags/us.svg" },
  { value: "VN", name: "Vietnam", nativeName: "Việt Nam", flagSvgPath: "/flags/vn.svg" },
];

// Required country field — pre-select Japan
<CountrySelect
  id="billing-country"
  name="billingCountry"
  options={countries}
  defaultValue="JP"
  required
  invalid={!!errors.billingCountry}
/>

// Optional country field — allow clearing
<CountrySelect
  id="filter-country"
  name="filterCountry"
  options={countries}
  allowEmpty
  emptyLabel="All countries"
  placeholder="Select a country"
/>`,
    storyPath: "data-entry/CountrySelect.stories.tsx",
    rules: [3, 6, 23, 31],
  },
  {
    name: "ChoiceField",
    group: "data-entry",
    tagline:
      "Layout wrapper that pairs a checkbox/radio control with a Label and optional description — the `id` prop MUST match the control's `id` for the label click to work.",
    props: [
      {
        name: "id",
        type: "string",
        required: true,
        description:
          "ID shared with the inner control (checkbox/radio). Used as `htmlFor` on the Label so clicking the label toggles the control. Must be unique per page.",
      },
      {
        name: "label",
        type: "React.ReactNode",
        required: true,
        description:
          "The visible label text rendered beside the control. Accepts rich content (string, JSX, badges, etc.).",
      },
      {
        name: "description",
        type: "React.ReactNode",
        description:
          "Optional secondary line rendered below the label as a <p> element. Use for help text, hints, or elaborating on the choice.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra CSS classes merged onto the outer wrapper div (ui-choice-field).",
      },
      {
        name: "children",
        type: "React.ReactNode",
        required: true,
        description:
          "The interactive control to render — must be a single Checkbox or Radio.Item element with an `id` matching the `id` prop.",
      },
    ],
    usage: [
      "DO: always pass the same value to both `id` on ChoiceField and `id` on the inner control (Checkbox / Radio.Item). The Label uses `htmlFor={id}` — mismatching IDs breaks click-to-toggle.",
      "DO: use `React.useId()` to generate unique IDs when rendering ChoiceField inside a list or map, as the parent Radio.Group and CheckboxGroup already do internally.",
      "DON'T: use ChoiceField to wrap a raw `<input type='checkbox'>` or `<input type='radio'>` — always use the godx-ui Checkbox or Radio.Item primitives as children.",
      "DON'T: hand-roll this layout (flex + label + description paragraph) yourself. ChoiceField already provides the correct ui-choice-field / ui-choice-control / ui-choice-content / ui-choice-label / ui-choice-description class structure.",
      "PREFER: Radio.Group or Checkbox.Group with the `options` prop when you have a list of choices — they create ChoiceField internally with auto-generated IDs. Only reach for bare ChoiceField for custom compositions.",
      "SKIP ChoiceField for standalone checkboxes that need NO label or description — use Checkbox directly in that case.",
    ],
    useCases: [
      "Rendering a single opt-in checkbox with a descriptive sub-line, e.g. 'Receive email notifications / You can unsubscribe at any time'.",
      "Custom radio group where each option needs a rich label (e.g. icon + text + badge) that the standard options API cannot express.",
      "Building an agreement / terms-of-service checkbox where the label is a React node with a link inside.",
      "Composing a vertically or horizontally oriented list of choices when you need full control over each item's checked state and ID.",
      "Wrapping a Radix-based Radio.Item or Checkbox inside a settings panel where each row needs a two-line label + description layout.",
      "Accessibility-correct label pairing when a third-party or custom control must appear beside descriptive text and clicking the text must activate the control.",
    ],
    related: [
      "Radio.Group / RadioGroup — use this (not bare ChoiceField) for a full group of radio options; it creates ChoiceField internally with correct IDs and orientation.",
      "Checkbox.Group / CheckboxGroup — same as Radio.Group but for multi-select; wraps ChoiceField automatically when you pass the `options` prop.",
      "Checkbox — use standalone (no ChoiceField) when you need a bare control with no label or when the label is already provided by a FormField wrapper.",
      "Radio / Radio.Item — the inner control that goes inside ChoiceField as children in a custom radio composition.",
      "Label — ChoiceField renders Label internally; do NOT add a second Label around ChoiceField or you will double-label the control.",
    ],
    example: `{\`import { Checkbox, Radio, ChoiceField } from "@godxjp/ui/data-entry";
import * as React from "react";

// Example 1: Custom checkbox with description
function NotificationToggle() {
  const id = React.useId();
  const [checked, setChecked] = React.useState(false);

  return (
    <ChoiceField
      id={id}
      label="Receive email notifications"
      description="We will send updates about your account activity."
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => setChecked(Boolean(v))}
      />
    </ChoiceField>
  );
}

// Example 2: Custom radio item with rich label
function PlanOption({ planId, name, price }: { planId: string; name: string; price: string }) {
  const id = \\\`plan-\\\${planId}\\\`;
  return (
    <ChoiceField
      id={id}
      label={<span className="font-semibold">{name}</span>}
      description={\\\`\\\${price} / month\\\`}
    >
      <Radio.Item id={id} value={planId} />
    </ChoiceField>
  );
}\`}`,
    storyPath: "data-entry/ChoiceField.stories.tsx",
    rules: [6, 13, 23, 31],
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
          "Manual children mode: used when `options` is omitted or empty. Render Checkbox items directly as children. You are responsible for composing each Checkbox with a ChoiceField for correct label/description layout.",
      },
    ],
    usage: [
      "DO use the `options` prop for any data-driven list — it auto-generates IDs, handles checked state, and wires up ChoiceField (label + description) for each item. NEVER hand-roll individual `<Checkbox>` elements inside a loop when you have an options array.",
      "DO pass `name` when inside an HTML form so each checkbox submits its value under the same field name, giving the server a multi-value array. Without `name`, native form submission silently drops all values.",
      "Controlled vs uncontrolled: pass `value` + `onChange` together for controlled usage (e.g. react-hook-form). Pass `defaultValue` alone for uncontrolled usage. Do NOT mix both — if `value` is provided, `defaultValue` is ignored and onChange must update value externally or the UI freezes.",
      "Each option's `description` renders as a secondary line below its label via ChoiceField — use it for help text or sub-copy; keep `label` short.",
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
      "Switch / SwitchField — for a single binary on/off toggle with immediate effect (not a form submission value). Do not use CheckboxGroup to fake toggle rows.",
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
      onChange={setSelected}
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
          "Declarative option list: { label: ReactNode; value: string; disabled?: boolean; description?: ReactNode }[]. When provided, Radio.Group renders each option as a labelled ChoiceField automatically. Omit to compose children manually.",
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
          "Manual composition fallback — used only when options is not provided. Render Radio.Item (+ ChoiceField wrapper) children directly inside Radio.Group.",
      },
    ],
    usage: [
      "DO use Radio.Group (not the bare Radio export) as the root — it wires up Radix context, keyboard navigation, and the hidden form input. A lone Radio.Item outside a Radio.Group has no context and will not function.",
      "DO prefer the options array API for static/data-driven option lists: pass options={[{ label, value, description?, disabled? }]} and Radio.Group renders each as a correctly-labelled ChoiceField automatically — no manual id/label wiring needed.",
      "DO pass name to Radio.Group when the selection must be submitted via a native HTML form. Radix injects a hidden <input name={name} value={selected}> so the value is picked up by FormData/fetch without extra wiring.",
      "DO use controlled mode (value + onValueChange) when the selection drives other UI (conditional fields, preview panels). Use defaultValue for fire-and-forget uncontrolled forms.",
      "DON'T hand-roll a label-plus-radio row with raw <input type='radio'> — use Radio.Group with options or compose Radio.Item inside ChoiceField for custom markup. Every option must be wrapped in ChoiceField (or equivalent) for the label htmlFor/id linkage.",
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
      "Switch / SwitchField — use for a single boolean on/off toggle (e.g. enable notifications); Radio.Group is for choosing one among three or more named options.",
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
      {/* wrap each item in ChoiceField for label + description */}
    </Radio.Group>
  );
}\`}`,
    storyPath: "data-entry/Radio.stories.tsx",
    rules: [3, 6, 13, 23],
  },
  {
    name: "SearchSelect",
    group: "data-entry",
    deprecated: true,
    tagline:
      "DEPRECATED searchable single-select combobox (static or async) — use <Select options showSearch> instead; SearchSelect stays exported but Select is now the single data-driven entry point.",
    props: [
      {
        name: "value",
        type: "string",
        defaultValue: '""',
        description: "Controlled selected value. Empty string means nothing selected.",
      },
      {
        name: "onChange",
        type: "(value: string, option?: SearchSelectOptionProp) => void",
        description:
          "Called with the new value string and the full option object on selection, or with ('', undefined) when cleared.",
      },
      {
        name: "options",
        type: "SearchSelectOptionProp[]",
        description:
          "Static option list — filtered client-side by query. Provide this OR loadOptions, not both.",
      },
      {
        name: "loadOptions",
        type: "(params: SearchSelectLoadParamsProp) => Promise<SearchSelectLoadResultProp>",
        description:
          "Async fetcher called with { query, page } — supports debounced search and infinite-scroll pagination. Provide this OR options, not both.",
      },
      {
        name: "renderOption",
        type: "(option: SearchSelectOptionProp) => React.ReactNode",
        description:
          "Custom per-option renderer (Ant-Design style). Defaults to label + optional sublabel layout.",
      },
      {
        name: "selectedLabel",
        type: "string",
        description:
          "Label to display for the current value when its option is not in the currently loaded page (prevents a flash of the raw ID string).",
      },
      {
        name: "placeholder",
        type: "string",
        description:
          "Trigger button placeholder when no value is selected. Defaults to i18n key dataEntry.searchSelect.placeholder.",
      },
      {
        name: "searchPlaceholder",
        type: "string",
        description:
          "Placeholder inside the search input inside the popover. Defaults to i18n key dataEntry.searchSelect.search.",
      },
      {
        name: "emptyMessage",
        type: "string",
        description:
          "Message shown when no options match the search query. Defaults to i18n key dataEntry.searchSelect.empty.",
      },
      {
        name: "loadingMessage",
        type: "string",
        description:
          "Message shown during async fetch. Defaults to i18n key dataEntry.searchSelect.loading.",
      },
      {
        name: "clearLabel",
        type: "string",
        description:
          "Label for the clear row that appears at the top when a value is selected and clearable is true.",
      },
      {
        name: "clearable",
        type: "boolean",
        defaultValue: "true",
        description: "Show a clear row at the top of the list when a value is selected.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables the trigger button and prevents opening the popover.",
      },
      {
        name: "name",
        type: "string",
        description:
          "HTML form field name — injects a hidden <input> so the selected value submits with native forms.",
      },
      {
        name: "id",
        type: "string",
        description: "ID forwarded to the trigger button, used to associate a <label htmlFor>.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Additional Tailwind classes applied to the trigger button (w-full by default).",
      },
      {
        name: "data-testid",
        type: "string",
        description:
          "Test ID on the trigger button. Each option gets a derived ID: ${data-testid}-option-${value}. The clear row gets ${data-testid}-option-none.",
      },
    ],
    usage: [
      "DEPRECATED — prefer <Select options={...} showSearch /> or <Select loadOptions={...} showSearch /> which uses the same engine internally. SearchSelect remains exported for backwards compatibility only.",
      "Provide exactly ONE of `options` (static, client-side filtered) or `loadOptions` (async, debounced, paginated). Passing both is unsupported; loadOptions takes precedence.",
      "Always pass `name` when used inside a native <form> so the hidden input submits the value correctly. Without `name` the selection does not participate in FormData.",
      "When using `loadOptions` with a paginated endpoint, return `hasMore: true` in the result to enable infinite scroll — the component appends the next page when scrolled within 48px of the bottom.",
      "Pass `selectedLabel` when `value` might not appear in the first loaded page (e.g. an edit form pre-populated from the server) — otherwise the trigger shows the placeholder text instead of the selected item's label.",
      "Do NOT render a SearchSelect inside a form and also pass a compound <Select> — choose one API. For new code always prefer <Select options showSearch> from @godxjp/ui/data-entry to avoid the deprecated path.",
    ],
    useCases: [
      "Legacy code that already uses SearchSelect and has not yet been migrated to <Select options showSearch>.",
      "A vendor/account picker with a large server-side list: pass loadOptions calling your API endpoint, return pages of results with hasMore, and use selectedLabel to display the pre-saved label on an edit form.",
      "A client-side filtered dropdown over a moderate static list (e.g. currency codes, department names) where the list fits in memory — pass options array.",
      "A grouped picker (e.g. account chart by category) — add option.group to each option; the component auto-renders optgroup-style headings in first-seen order.",
      "Custom option rendering (e.g. showing an avatar + name + role) — pass renderOption returning JSX; the default label+sublabel layout is bypassed.",
    ],
    related: [
      "Select — THE modern replacement: pass options or loadOptions to <Select> and add showSearch to get the same combobox behavior. For all new code use Select, not SearchSelect.",
      "Autocomplete — also deprecated; Autocomplete is a thin wrapper around SearchSelect kept for older call-sites. Do not use for new code.",
      "Command — low-level primitive (Popover + Command list) that SearchSelect is built on; reach for it only if you need a fully custom command-palette UI that does not fit either Select or SearchSelect.",
    ],
    example: `import { SearchSelect } from "@godxjp/ui/data-entry";

// Static list (client-side filtered) — DEPRECATED pattern, prefer <Select options showSearch>
function LegacyAccountPicker({ value, onChange }) {
  return (
    <SearchSelect
      value={value}
      onChange={onChange}
      options={[
        { value: "acc-001", label: "Cash", sublabel: "Current assets", group: "Assets" },
        { value: "acc-002", label: "Accounts Receivable", group: "Assets" },
        { value: "acc-010", label: "Revenue", group: "Income" },
      ]}
      placeholder="Select account"
      name="account_id"
      data-testid="account-picker"
    />
  );
}

// Async / paginated — DEPRECATED pattern, prefer <Select loadOptions showSearch>
async function fetchVendors({ query, page }) {
  const res = await fetch(\`/api/vendors?q=\${query}&page=\${page}\`);
  const json = await res.json();
  return { options: json.data, hasMore: json.meta.hasNextPage };
}

function LegacyVendorPicker({ value, currentVendorName, onChange }) {
  return (
    <SearchSelect
      value={value}
      onChange={onChange}
      loadOptions={fetchVendors}
      selectedLabel={currentVendorName}
      placeholder="Select vendor"
      name="vendor_id"
      data-testid="vendor-picker"
    />
  );
}`,
    storyPath: "data-entry/SearchSelect.stories.tsx",
    rules: [3, 6, 33],
  },
  {
    name: "Autocomplete",
    group: "data-entry",
    deprecated: true,
    tagline:
      "DEPRECATED thin wrapper over SearchSelect — use <Select options showSearch> instead; kept only for backward compatibility.",
    props: [
      {
        name: "options",
        type: "{ value: string; label: string }[]",
        required: true,
        description:
          "Static list of option rows. Each entry must have a string value and a display label.",
      },
      {
        name: "value",
        type: "string",
        description:
          "Controlled selected value. When provided the component is fully controlled; omit for uncontrolled.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description:
          "Callback fired with the newly selected string value. Required for controlled usage.",
      },
      {
        name: "placeholder",
        type: "string",
        description: "Trigger button placeholder shown when no value is selected.",
      },
      {
        name: "searchPlaceholder",
        type: "string",
        description: "Placeholder text inside the search input in the dropdown.",
      },
      {
        name: "emptyMessage",
        type: "string",
        description: "Message shown in the dropdown when no options match the search query.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables the control entirely — trigger becomes non-interactive.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra Tailwind classes applied to the trigger wrapper.",
      },
      {
        name: "id",
        type: "string",
        description:
          "HTML id forwarded to the underlying trigger element; wire to a <label> for a11y.",
      },
    ],
    usage: [
      "DEPRECATED — do NOT use for new code. Replace with `<Select options={opts} showSearch />` (single data-driven entry point) or `<SearchSelect options={opts} />` for more control. Autocomplete is a thin shim kept only for backward compatibility.",
      "DO pass a controlled `value` + `onValueChange` pair to keep state outside; without `value` the component is uncontrolled and you cannot read the selected item.",
      "DO NOT expect optgroup grouping, sublabels, async loading, or a custom `renderOption` — Autocomplete's option type only has `{ value, label }`. Use SearchSelect or Select with showSearch for those features.",
      "DO NOT use this inside an HTML `<form>` for native form submission — there is no `name` prop and no hidden input. Pair with React Hook Form or manage state manually via `onValueChange`.",
      "Always provide a matching `<label htmlFor={id}>` when using `id` for screen-reader accessibility.",
      "The internal clearable button is always hidden (hardcoded `clearable={false}`). If you need a clear/reset action use `<SearchSelect clearable />` or `<Select showSearch clearable />`.",
    ],
    useCases: [
      "Migrating legacy code that already imports Autocomplete — keep it running without a rewrite while you schedule the migration to Select/SearchSelect.",
      "Simple static list with client-side search where no grouping, sublabels, or async fetch is needed — though even here, prefer Select with showSearch for future-proofing.",
      "Rapid prototyping where the exact API doesn't matter yet and you know it will be replaced before shipping.",
    ],
    related: [
      "Select (with showSearch + options) — the CURRENT canonical replacement for Autocomplete; supports grouping, sublabels, async loadOptions, custom renderOption, clearable, multi, and form name prop. Use this for all new code.",
      "SearchSelect — the direct engine Autocomplete delegates to; exported and stable, supports optgroups, sublabels, async infinite-scroll, and clearable. Use if you need SearchSelect-specific async or render props not yet exposed by Select.",
      "Input with datalist — never hand-roll; use Select/SearchSelect primitives instead.",
    ],
    example: `{\`// ❌ DEPRECATED — do not use in new code
import { Autocomplete } from "@godxjp/ui/data-entry";

// ✅ Replace with:
// import { Select } from "@godxjp/ui/data-entry";
// <Select options={options} showSearch placeholder="Search…" onChange={setValue} value={value} />

// Legacy usage (backward compat only):
import { Autocomplete } from "@godxjp/ui/data-entry";

const options = [
  { value: "acme", label: "Acme Corp" },
  { value: "globex", label: "Globex Inc" },
];

function LegacyVendorPicker() {
  const [value, setValue] = React.useState("");
  return (
    <Autocomplete
      id="vendor"
      options={options}
      value={value}
      onValueChange={setValue}
      placeholder="Select vendor…"
      searchPlaceholder="Search vendors…"
      emptyMessage="No vendor found"
    />
  );
}\`}`,
    storyPath: "data-entry/Autocomplete.stories.tsx",
    rules: [6, 13, 23, 31],
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
      "KeyValueGrid — use KeyValueGrid for label/value pairs; use TreeList when items have a parent-child depth relationship.",
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
    name: "ScanPanel",
    group: "data-display",
    tagline:
      "Square dashed placeholder panel with a scan-line icon — for empty/waiting states where content is scanned or uploaded; never hand-roll this pattern with a raw div.",
    props: [
      {
        name: "title",
        type: "string",
        required: true,
        description: "Primary label rendered below the scan-line icon in semibold large text.",
      },
      {
        name: "description",
        type: "string",
        description:
          "Optional secondary line rendered below the title in muted small text. Omit if no additional context is needed.",
      },
    ],
    usage: [
      "DO use ScanPanel for any empty/awaiting-input area that represents a 'scan something here' or 'drop/upload file' prompt — it provides the icon, border, background tint, and typography in one call.",
      "DON'T hand-roll a dashed-border div with a lucide icon and centered text — ScanPanel is exactly that pattern and keeps visual consistency across the app.",
      "The panel renders 1:1 aspect-ratio (square) via CSS; constrain its width from the parent container (e.g. max-w-xs) rather than trying to override aspect-ratio.",
      "DO pass a concise `title` (required) that names the action or state (e.g. 'Scan invoice', 'No file selected'). Use `description` only for a secondary instruction or status line.",
      "DON'T put interactive controls inside ScanPanel — it is a pure display/empty-state element. Pair it with a nearby Button or file-input for the actual action.",
      "ScanPanel is NOT a general EmptyState — use godx-ui EmptyState for table/list zero-row states. ScanPanel is specifically for scan/upload affordance panels.",
    ],
    useCases: [
      "An invoice-scanning workflow step where the user must point a camera or upload an image — show ScanPanel while no file is selected.",
      "A QR-code / barcode reader pane rendered before the camera stream is active, indicating the scan target area.",
      "A document upload dropzone placeholder in an accounting app (expense receipts, purchase orders) before any file is chosen.",
      "An OCR processing panel shown while the system awaits a document scan input from a connected scanner device.",
      "A 'no attachment yet' state in an accounting record detail view that invites the user to attach a scanned document.",
    ],
    related: [
      "EmptyState — use for zero-row table/list states or generic no-data screens; ScanPanel is specifically scan/upload affordance with its own icon and square layout.",
      "DataState / InfiniteQueryState — use for TanStack Query lifecycle (loading/empty/error) in list views; not for scan prompts.",
      "SkeletonTable — use while data is loading into a table; not for scan/upload placeholder states.",
    ],
    example: `import { ScanPanel } from "@godxjp/ui/data-display";

export function InvoiceScanStep() {
  return (
    <div className="max-w-xs mx-auto">
      <ScanPanel
        title="Scan invoice"
        description="Point your camera at the invoice barcode or upload a file."
      />
    </div>
  );
}`,
    storyPath: "data-display/ScanPanel.stories.tsx",
    rules: [31],
  },
  {
    name: "CodeBadge",
    group: "data-display",
    tagline:
      "Compact labelled icon-chip for displaying typed reference codes (internal, seller, or carrier); never use Badge or a raw span for these domain codes.",
    props: [
      {
        name: "kind",
        type: '"internal" | "seller" | "yamato"',
        required: true,
        description:
          'Determines the icon and abbreviated label prefix rendered inside the chip. "internal" → Hash icon + "INT"; "seller" → ShoppingBag + "SLR"; "yamato" → Truck + "YMT". Falls back to "internal" if an unknown kind is supplied.',
      },
      {
        name: "value",
        type: "string",
        required: true,
        description:
          "The actual reference code string to display after the icon (e.g. an order number, shipment tracking ID, or internal SKU).",
      },
    ],
    usage: [
      "DO: always supply both `kind` and `value` — both are required; omitting either leaves the chip meaningless or broken.",
      'DO: use `kind="internal"` for internal system IDs/SKUs, `kind="seller"` for seller/merchant reference codes, and `kind="yamato"` for Yamato carrier/shipment tracking codes.',
      "DON'T: use a raw `<Badge>` or a plain `<span>` for domain reference codes — `CodeBadge` encodes the correct icon, label prefix, and semantic `data-kind` attribute that CSS/tests rely on.",
      "DON'T: pass display-formatted values (e.g. with leading/trailing whitespace or HTML entities) — `value` is rendered as plain text inside a `<span>`.",
      "DON'T: attempt to extend `kind` inline — if a new code type is needed, add it to `CodeBadgeKind` in the source and export; never pass an arbitrary string and expect the chip to render correctly (it silently falls back to `internal`).",
      'A11Y: the icon is rendered with `aria-hidden="true"` so screen readers see only the label prefix and value text — keep `value` human-readable (e.g. the actual code, not an opaque hash).',
    ],
    useCases: [
      "Displaying an order's internal system reference code alongside seller and carrier codes in an order detail panel or DataTable column.",
      "Rendering a Yamato shipment tracking number in a logistics/fulfillment table so operators can visually distinguish it from internal IDs at a glance.",
      "Showing a seller's own reference code (e.g. merchant PO number) in an invoice or accounting line-item row.",
      "Pairing multiple CodeBadge instances in a KeyValueGrid row — e.g. INT code next to SLR code — to show all reference IDs for a single transaction.",
      "In a DataTable cell renderer, wrapping a code field so the column's kind is immediately obvious without a separate column header.",
    ],
    related: [
      "Badge — generic variant-styled pill (default/secondary/destructive/outline/success/warning). Use Badge for arbitrary status labels or counts. Use CodeBadge specifically for typed domain reference codes (internal/seller/yamato) that need a fixed icon+prefix.",
      'StatusBadge — displays a status string with a semantic tone. Use StatusBadge for workflow/order status chips (e.g. "Paid", "Pending"). Use CodeBadge for reference/ID codes, not status labels.',
    ],
    example: `{\`import { CodeBadge } from "@godxjp/ui/data-display";

// Internal system reference code
<CodeBadge kind="internal" value="ORD-00123" />

// Seller reference code
<CodeBadge kind="seller" value="SLR-98765" />

// Yamato carrier tracking code
<CodeBadge kind="yamato" value="YMT-4444-5555-6666" />

// Multiple codes for one order
<div className="flex flex-wrap gap-2">
  <CodeBadge kind="internal" value="ORD-00123" />
  <CodeBadge kind="seller"   value="SLR-98765" />
  <CodeBadge kind="yamato"   value="YMT-4444-5555-6666" />
</div>\`}`,
    storyPath: "data-display/CodeBadge.stories.tsx",
    rules: [3, 6, 13, 35],
  },
  {
    name: "PageHeader",
    group: "navigation",
    deprecated: true,
    tagline:
      "DEPRECATED header-only shell — use PageContainer instead; PageHeader renders only the title/breadcrumb/actions strip with no body or footer slots.",
    props: [
      {
        name: "title",
        type: "React.ReactNode",
        required: true,
        description: "Page heading text rendered as an <h1>. Accepts a string or any ReactNode.",
      },
      {
        name: "description",
        type: "React.ReactNode",
        description: "Optional subtitle rendered as a <p> below the title.",
      },
      {
        name: "breadcrumb",
        type: "BreadcrumbItemProp[]",
        description:
          "Ordered breadcrumb trail. Each item is { label: ReactNode; to?: string }. The last item is always rendered as a plain span (current page); earlier items with 'to' are router <Link>s.",
      },
      {
        name: "actions",
        type: "React.ReactNode",
        description:
          "Action controls (buttons, menus) rendered in the trailing slot of the header row. Equivalent to PageContainer's 'extra' prop.",
      },
      {
        name: "className",
        type: "string",
        description: "Additional CSS class names applied to the <header> element.",
      },
    ],
    usage: [
      "DEPRECATED — always prefer PageContainer for new pages. PageContainer provides body and footer slots, density/variant controls, and sticky footer support that PageHeader lacks.",
      "DO pass breadcrumb items in order from root to current page. The last item is automatically marked aria-current='page' and rendered without a link regardless of whether 'to' is set.",
      "DON'T place body content as children — PageHeader has no children slot. Use PageContainer with its children prop for page body content.",
      "The 'actions' prop (not 'extra') is the slot for action buttons or menus in the trailing position. Note that PageContainer uses 'extra' for the same slot — they are intentionally different prop names.",
      "Use 'description' (not 'subtitle') for the secondary text beneath the title — again, PageContainer uses 'subtitle' for the same concept.",
      "If you must keep PageHeader for a legacy page, avoid adding new body layout inside the same file; migrate to PageContainer to get density and variant props for responsive layout.",
    ],
    useCases: [
      "Maintaining or reading legacy pages that already use PageHeader and cannot be migrated in the current sprint.",
      "Quick title + breadcrumb strip for a read-only display panel that embeds inside another layout shell (not a full page).",
      "Regression tests and snapshot tests for the navigation module that must cover the legacy component path.",
      "Any scenario where you intentionally render only a header row with no body — though even then, PageContainer with no children is the preferred modern approach.",
    ],
    related: [
      "PageContainer — the current replacement for PageHeader; use this for all new pages. It adds children, footer, density, variant, stickyFooter, and uses 'subtitle'/'extra' instead of 'description'/'actions'.",
      "AppShell — top-level layout shell that wraps sidebar, topbar, and the page area; PageContainer lives inside AppShell's content area.",
      "Topbar — the fixed top bar with product/project chips and search; distinct from the per-page header rendered by PageContainer/PageHeader.",
    ],
    example: `import { PageHeader } from "@godxjp/ui/navigation";
import { Button } from "@godxjp/ui/general";

// DEPRECATED — use PageContainer for new pages.
// Legacy usage only:
export function LegacyInvoiceHeader() {
  return (
    <PageHeader
      title="Invoices"
      description="All issued invoices for the current entity"
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Accounting", to: "/accounting" },
        { label: "Invoices" }, // last item — no 'to', rendered as current page
      ]}
      actions={
        <Button variant="default" size="sm">
          New Invoice
        </Button>
      }
    />
  );
}`,
    storyPath: "navigation/PageHeader.stories.tsx",
    rules: [3, 23, 24, 33],
  },
  {
    name: "LocalePicker",
    group: "navigation",
    tagline:
      "Language selector that reads/writes AppProvider locale automatically — throws if used without AppProvider AND without controlled value+onChange.",
    props: [
      {
        name: "value",
        type: "AppLocale",
        description:
          "Controlled locale value. Must be one of 'vi' | 'en' | 'ja'. When omitted, reads the current locale from AppProvider context.",
      },
      {
        name: "onChange",
        type: "(locale: AppLocale) => void",
        description:
          "Controlled change handler. When omitted, calls AppProvider's setLocale. Required when value is provided without AppProvider.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Extra CSS classes merged onto the SelectTrigger element. Default trigger width is w-full sm:w-40.",
      },
      { name: "disabled", type: "boolean", description: "Disables the Select control." },
      {
        name: "id",
        type: "string",
        description: "HTML id forwarded to the SelectTrigger for label association.",
      },
    ],
    usage: [
      "DO: Wrap the component in AppProvider for zero-config uncontrolled use — locale is read and written via context automatically, no props needed. DO NOT use without AppProvider unless you also supply both value and onChange.",
      "DO: Use controlled mode (value + onChange) when you need to manage locale state outside of AppProvider — for example in a standalone settings form or a Storybook story. Both props are required together in this mode.",
      "DO NOT: Pass only value without onChange, or only onChange without value in controlled mode. The component throws at render time if neither AppProvider context nor both controlled props are present: 'LocalePicker requires <AppProvider> or controlled value + onChange'.",
      "DO: The locale list is fixed to APP_LOCALES = ['vi', 'en', 'ja']. Option labels are rendered via the translation system (t('locale.vi') etc.) — ensure AppProvider is initialized with the correct defaultLocale so labels display in the right language.",
      "DO: Use the id prop to associate a <label> element with the trigger for accessible forms. The trigger already carries an aria-label from the translation key navigation.localePicker.ariaLabel, so a visible label is optional but still preferred for sighted users.",
      "DON'T hand-roll a locale Select with raw <select> or godx-ui Select — LocalePicker already composes the full Select + Languages icon + translated options + context wiring. Use it directly.",
    ],
    useCases: [
      "App shell / top-nav language switcher that persists the user's locale preference via AppProvider and localStorage without any extra state.",
      "Settings page 'Language' field where locale is part of a form submitted to the backend — use controlled mode: value={form.locale} onChange={(v) => form.setLocale(v)}.",
      "Onboarding wizard step that lets the user pick their language before the rest of the app is configured — mount with AppProvider persist={false} and a controlled value to keep state local to the wizard.",
      "Admin user-profile form where locale is one of several preferences (alongside timezone and date/time format) — pair with TimezonePicker, DateFormatPicker, TimeFormatPicker under the same AppProvider.",
      "Storybook / test harness where AppProvider is not present — render in fully controlled mode: <LocalePicker value='en' onChange={fn} />.",
      "Localization QA tool that cycles through locales programmatically — drive via controlled value to switch the UI language without user interaction.",
    ],
    related: [
      "TimezonePicker — same family, same pattern (uncontrolled via AppProvider or controlled). Pick LocalePicker for language, TimezonePicker for IANA timezone.",
      "DateFormatPicker — picks 'dmy' | 'mdy' | 'iso' display format. Use alongside LocalePicker in a preferences form; locale defaults the format automatically.",
      "TimeFormatPicker — picks '12h' | '24h'. Same composition pattern; locale defaults it. Use all four pickers together in a unified settings panel.",
      "AppProvider — required peer unless running in fully controlled mode. Provides the locale, setLocale, and i18n context that LocalePicker depends on.",
    ],
    example: `{\`// Uncontrolled — AppProvider manages state and persists to localStorage
import { AppProvider } from "@godxjp/ui/providers";
import { LocalePicker } from "@godxjp/ui/navigation";

export function AppShell() {
  return (
    <AppProvider defaultLocale="vi">
      {/* Anywhere inside the tree */}
      <LocalePicker />
    </AppProvider>
  );
}

// Controlled — no AppProvider required (e.g. a standalone settings form)
import { useState } from "react";
import { LocalePicker } from "@godxjp/ui/navigation";
import type { AppLocale } from "@godxjp/ui/navigation";

export function LocaleField() {
  const [locale, setLocale] = useState<AppLocale>("en");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="locale-picker">Language</label>
      <LocalePicker id="locale-picker" value={locale} onChange={setLocale} />
    </div>
  );
}\`}`,
    storyPath: "navigation/LocalePicker.stories.tsx",
    rules: [3, 5, 6, 23],
  },
  {
    name: "TimezonePicker",
    group: "navigation",
    tagline:
      "Globe-icon Select for picking an IANA timezone — throws at runtime if neither AppProvider context nor controlled value+onChange is supplied.",
    props: [
      {
        name: "value",
        type: "AppTimezone",
        description:
          'Controlled IANA timezone string (e.g. "Asia/Tokyo", "UTC"). Required when used outside AppProvider; reads from AppProvider context when omitted.',
      },
      {
        name: "onChange",
        type: "(timezone: AppTimezone) => void",
        description:
          "Change handler receiving the selected IANA id. Required when used outside AppProvider; falls back to AppProvider setTimezone when omitted.",
      },
      {
        name: "options",
        type: "readonly AppTimezone[]",
        description:
          "Restrict the dropdown to this list of IANA ids. Omit to inherit AppProvider timezoneOptions, or fall back to the full runtime IANA list. The current value is always injected at the top if absent from the list.",
      },
      {
        name: "id",
        type: "string",
        description: "HTML id forwarded to the trigger element, useful for pairing with a <label>.",
      },
      { name: "disabled", type: "boolean", description: "Disables the picker trigger." },
      {
        name: "className",
        type: "string",
        description:
          "Additional Tailwind classes merged onto the SelectTrigger (default width: w-full sm:w-56).",
      },
    ],
    usage: [
      "DO: Wrap with <AppProvider> and omit value/onChange — the picker reads and writes context automatically. This is the canonical zero-prop usage: <TimezonePicker />.",
      "DO: Pass value + onChange for fully controlled standalone usage (e.g. a form field that posts the timezone string): <TimezonePicker value={tz} onChange={setTz} />. AppProvider is not required in this mode.",
      "DON'T: Omit BOTH AppProvider context AND controlled props — the component throws at runtime: 'TimezonePicker requires <AppProvider> or controlled value + onChange'.",
      "DO: Pass options={['Asia/Tokyo', 'UTC']} to restrict the list. The current value is automatically prepended if it is missing from the list, so the picker never shows an empty/invalid selection.",
      "DON'T: Hand-roll a timezone <select> or a custom combobox — TimezonePicker already handles locale-aware labels (translated city + GMT offset), the full IANA list, and ARIA semantics.",
      "NOTE: Labels are locale-aware via i18n keys (e.g. 'Japan (Tokyo)' in en, translated equivalents in vi/ja). Labels are derived from AppProvider locale; in controlled mode outside AppProvider the locale defaults to the library fallback. No extra i18n wiring is needed.",
    ],
    useCases: [
      "User profile / settings page: let the user pick their display timezone; pair with DateFormatPicker and TimeFormatPicker in a settings panel.",
      "AppProvider bootstrap: pass timezoneOptions={APP_TIMEZONE_PRESET} to AppProvider to restrict the dropdown to a curated Asia-Pacific list, then render <TimezonePicker /> anywhere in the tree.",
      "Multi-tenant admin: render TimezonePicker in a form that POSTs a per-organization timezone; use controlled mode (value/onChange) and submit the selected IANA string.",
      "Shell / top-bar: drop <TimezonePicker /> into an AppShell header or Sidebar alongside LocalePicker so users can adjust timezone globally without a full settings page.",
      "System-timezone default: pass defaultTimezone='system' systemTimezone='Asia/Tokyo' to AppProvider so the picker initializes to the backend timezone; users can still override it.",
    ],
    related: [
      "LocalePicker — sibling picker for language/locale; use alongside TimezonePicker in settings panels. Both read/write AppProvider context.",
      "TimeFormatPicker — picks 12h/24h clock format; same controlled/context dual-mode API.",
      "DateFormatPicker — picks date display format (dmy/mdy/iso); same dual-mode API.",
      "Select — the underlying primitive TimezonePicker is built on; use Select directly only when you need a non-timezone dropdown, not for timezone selection.",
    ],
    example: `import { useState } from "react";
import type { AppTimezone } from "@godxjp/ui/app";
import { TimezonePicker } from "@godxjp/ui/navigation";

// --- Controlled (no AppProvider required) ---
export function TimezoneField() {
  const [tz, setTz] = useState<AppTimezone>("Asia/Tokyo");
  return (
    <TimezonePicker
      value={tz}
      onChange={setTz}
      options={["Asia/Tokyo", "Asia/Ho_Chi_Minh", "UTC"]}
    />
  );
}

// --- Context-driven (zero props inside AppProvider) ---
import { AppProvider } from "@godxjp/ui/app";
import { APP_TIMEZONE_PRESET } from "@godxjp/ui/navigation";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider
      defaultLocale="ja"
      fallbackLocale="en"
      defaultTimezone="system"
      systemTimezone="Asia/Tokyo"
      timezoneOptions={APP_TIMEZONE_PRESET}
    >
      {children}
    </AppProvider>
  );
}

// Anywhere inside Shell:
// <TimezonePicker />   ← reads/writes AppProvider context automatically`,
    storyPath: "navigation/TimezonePicker.stories.tsx",
    rules: [3, 5, 23, 31],
  },
  {
    name: "DateFormatPicker",
    group: "navigation",
    tagline:
      "Locale-aware date format selector (ISO / DMY / MDY) — throws at runtime if neither AppProvider nor controlled value+onChange is provided.",
    props: [
      {
        name: "value",
        type: "AppDateFormat | undefined",
        description:
          'Controlled date format value. One of `"iso"` (yyyy-MM-dd), `"dmy"` (dd/MM/yyyy), or `"mdy"` (MM/dd/yyyy). When omitted the component reads from AppProvider context.',
      },
      {
        name: "onChange",
        type: "((dateFormat: AppDateFormat) => void) | undefined",
        description:
          "Callback fired when the user picks a new format. When omitted the component writes back to AppProvider context via `ctx.setDateFormat`.",
      },
      {
        name: "className",
        type: "string | undefined",
        description:
          "Extra CSS classes merged onto the SelectTrigger. Trigger defaults to `w-full sm:w-44`.",
      },
      {
        name: "disabled",
        type: "boolean | undefined",
        description: "Disables the select trigger and prevents user interaction.",
      },
      {
        name: "id",
        type: "string | undefined",
        description:
          "HTML id forwarded to the SelectTrigger; use with a `<label htmlFor>` for accessible form binding.",
      },
    ],
    usage: [
      "DO wrap with `<AppProvider>` (uncontrolled) OR supply both `value` and `onChange` (controlled). Omitting both causes a runtime throw: `DateFormatPicker requires <AppProvider> or controlled value + onChange`.",
      "DO NOT pass `value` without `onChange` or vice-versa in controlled mode — the component falls back to context for whichever prop is missing, which produces split ownership bugs.",
      "DO use `id` + `<label htmlFor={id}>` for accessible form labeling; the trigger already carries an i18n `aria-label` but an explicit label wins for sighted users.",
      'DO NOT hand-roll a date format `<select>` — `DateFormatPicker` reads the locale from context and shows human-readable, locale-translated option labels (e.g. `"Ngày / Tháng / Năm"` in vi, `"YYYY-MM-DD（年-月-日）"` in ja). A raw select cannot do this.',
      "When AppProvider is present and you need to react to changes globally (e.g. re-format all displayed dates), use `AppProvider`'s `onDateFormatChange` callback instead of threading `onChange` through every picker.",
      'The `AppDateFormat` type is `"iso" | "dmy" | "mdy"`. Import it from `@godxjp/ui/navigation` alongside the component (it is re-exported) — do not duplicate the string-union inline.',
    ],
    useCases: [
      "Settings / Preferences page: let users switch how dates are displayed app-wide (place inside AppProvider, omit value/onChange and it auto-reads/writes context).",
      "Controlled preview panel: show the effect of a date format choice before saving — pass `value` + `onChange` to a local state and commit only on Save.",
      "Admin user-profile form: bind with `id` and a visible `<label>` alongside other pickers (LocalePicker, TimezonePicker, TimeFormatPicker) in a preferences card.",
      "Multi-entity accounting dashboard where different entities prefer different regional date conventions — render a per-entity DateFormatPicker in controlled mode, persist choice per entity.",
      "Onboarding wizard step: collect locale + date format + time format together before creating the user account; all four app pickers compose naturally inside a single AppProvider.",
      "Export/report dialog: let the user choose the date format for a CSV or PDF export independently of the global app setting — use controlled mode so the choice is scoped to the dialog.",
    ],
    related: [
      "LocalePicker — picks the UI language (AppLocale). Use DateFormatPicker alongside LocalePicker, not instead of it; locale affects translation strings while date format controls the display pattern.",
      "TimeFormatPicker — picks 12h vs 24h clock. Sister component; same AppProvider / controlled-mode contract.",
      "TimezonePicker — picks the IANA timezone. Same contract; also accepts an `options` prop to restrict the list.",
      "DatePicker — a calendar-based date input for picking a specific calendar date. Use DatePicker for data entry; use DateFormatPicker in settings to control how those dates are displayed.",
    ],
    example: `{\`// Uncontrolled — reads/writes AppProvider context automatically
import { AppProvider } from "@godxjp/ui/navigation";
import { DateFormatPicker } from "@godxjp/ui/navigation";

export function AppSettings() {
  return (
    <AppProvider defaultLocale="vi" defaultDateFormat="locale" persist>
      <div className="flex flex-col gap-4">
        <label htmlFor="date-fmt">Date format</label>
        <DateFormatPicker id="date-fmt" />
      </div>
    </AppProvider>
  );
}

// Controlled — local state, no AppProvider required
import { useState } from "react";
import { DateFormatPicker } from "@godxjp/ui/navigation";
import type { AppDateFormat } from "@godxjp/ui/navigation";

export function ExportDialog() {
  const [fmt, setFmt] = useState<AppDateFormat>("iso");

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="export-fmt">Export date format</label>
      <DateFormatPicker id="export-fmt" value={fmt} onChange={setFmt} />
    </div>
  );
}\`}`,
    storyPath: "navigation/DateFormatPicker.stories.tsx",
    rules: [3, 5, 6, 13],
  },
  {
    name: "TimeFormatPicker",
    group: "navigation",
    tagline:
      "Clock-format selector (12h / 24h) that reads/writes AppProvider context by default — throws if neither AppProvider nor controlled value+onChange is supplied.",
    props: [
      {
        name: "value",
        type: "AppTimeFormat | undefined",
        description:
          "Controlled clock format ('12h' | '24h'). If omitted the picker reads from the nearest AppProvider context.",
      },
      {
        name: "onChange",
        type: "(timeFormat: AppTimeFormat) => void | undefined",
        description:
          "Controlled change handler. If omitted the picker writes back to AppProvider via setTimeFormat.",
      },
      {
        name: "className",
        type: "string | undefined",
        description:
          "Additional CSS classes merged onto the SelectTrigger. Default width is 'w-full sm:w-44'.",
      },
      {
        name: "disabled",
        type: "boolean | undefined",
        description: "Disables the underlying Select control.",
      },
      {
        name: "id",
        type: "string | undefined",
        description: "HTML id forwarded to the SelectTrigger, useful for associating a <label>.",
      },
    ],
    usage: [
      "DO use inside <AppProvider> with no extra props to let it read/write the global time-format automatically: <AppProvider defaultTimeFormat='24h'><TimeFormatPicker /></AppProvider>",
      "DO switch to fully controlled mode when you need to manage the value yourself — supply BOTH value and onChange, or the component will throw: <TimeFormatPicker value={fmt} onChange={setFmt} />",
      "DON'T omit both AppProvider and controlled props — the component throws an Error at render time: 'TimeFormatPicker requires <AppProvider> or controlled value + onChange'. There is no silent fallback.",
      "DON'T hand-roll a time-format <select> — the locale-aware labels (e.g. '24 giờ' for vi, '24-hour' for en) are generated internally from the i18n layer; reinventing this loses those translations.",
      "DO wire a <label htmlFor={id}> when using the id prop for accessibility; the SelectTrigger already sets aria-label from i18n but a visible label improves discoverability.",
      "AppTimeFormat is exported from '@godxjp/ui/app' — import it from there for type-safe controlled state: import type { AppTimeFormat } from '@godxjp/ui/app'.",
    ],
    useCases: [
      "User preferences / settings panel — place alongside LocalePicker, TimezonePicker, and DateFormatPicker so users can configure their entire display environment in one block.",
      "AppShell top-bar or sidebar controls — the default sm:w-44 width makes it compact enough to sit inline in a toolbar without a wrapper.",
      "Admin dashboard that serves multiple locales (vi/ja default 24h, en defaults 12h) — AppProvider + resolveDefaultTimeFormat already handle the per-locale default, so no manual logic is needed.",
      "Controlled settings form where the time format is saved to a server — use value+onChange, call your API in onChange, then update state on success.",
      "Onboarding wizard step that collects user preferences before creating an account — use controlled mode (no AppProvider yet) and collect all picker values into a single form state.",
      "Multi-entity accounting app (e.g. CoreBooks) where different legal entities may have different locale settings — wrap each entity's UI subtree in its own AppProvider with the entity's persisted preferences.",
    ],
    related: [
      "LocalePicker (@godxjp/ui/navigation) — sibling picker for UI language; often placed adjacent to TimeFormatPicker in a preferences panel.",
      "TimezonePicker (@godxjp/ui/navigation) — sibling for IANA timezone selection; shares the same AppProvider context pattern.",
      "DateFormatPicker (@godxjp/ui/navigation) — sibling for date display format (dmy/mdy/iso); use all four together for a complete locale preferences block.",
      "AppProvider (@godxjp/ui/app) — required context provider when using any picker in uncontrolled mode; set defaultTimeFormat='locale' to auto-derive from the selected locale.",
    ],
    example: `
{\`// Uncontrolled — reads/writes AppProvider automatically
import { AppProvider } from "@godxjp/ui/app";
import { TimeFormatPicker } from "@godxjp/ui/navigation";

export function PreferencesPanel() {
  return (
    <AppProvider defaultLocale="vi" defaultTimeFormat="24h" persist>
      <TimeFormatPicker />
    </AppProvider>
  );
}

// Controlled — manage value yourself (no AppProvider needed)
import { useState } from "react";
import type { AppTimeFormat } from "@godxjp/ui/app";
import { TimeFormatPicker } from "@godxjp/ui/navigation";

export function SettingsForm() {
  const [fmt, setFmt] = useState<AppTimeFormat>("12h");
  return (
    <div>
      <label htmlFor="time-fmt">Time format</label>
      <TimeFormatPicker id="time-fmt" value={fmt} onChange={setFmt} />
    </div>
  );
}\`}
`,
    storyPath: "navigation/TimeFormatPicker.stories.tsx",
    rules: [3, 5, 6, 13],
  },
  {
    name: "TabsItems",
    group: "navigation",
    tagline:
      "Ant Design-style items-array tabs wrapper over Radix Tabs — pass a flat `items` array instead of composing TabsList/TabsTrigger/TabsContent by hand; first item is the default tab unless you specify otherwise.",
    props: [
      {
        name: "items",
        type: "TabItemProp[]",
        required: true,
        description:
          "Array of tab definitions. Each entry has: `key: string` (unique, used as the Radix value), `label: React.ReactNode` (trigger label), `children: React.ReactNode` (panel content), `disabled?: boolean`, `icon?: React.ReactNode` (rendered left of label inside the trigger).",
      },
      {
        name: "value",
        type: "string",
        description:
          "Controlled active tab key. When provided the component is fully controlled — you must also provide `onValueChange`. Do NOT combine with `defaultValue` in controlled mode.",
      },
      {
        name: "defaultValue",
        type: "string",
        description:
          "Uncontrolled initial active tab key. Defaults to `items[0].key` when omitted. Ignored when `value` is provided.",
      },
      {
        name: "onValueChange",
        type: "(key: string) => void",
        description:
          "Callback fired when the user switches tabs. Receives the selected item's `key`. Required in controlled mode.",
      },
      {
        name: "variant",
        type: '"default" | "line" | "card"',
        defaultValue: '"default"',
        description:
          "Visual style. `default` = pill/box tabs (Radix default). `line` = underline-only tabs (border-b indicator, transparent background). `card` = card-style tabs with a subtle shadow on the active trigger.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra Tailwind classes applied to the outer Radix `Tabs` root element.",
      },
      {
        name: "listClassName",
        type: "string",
        description:
          "Extra classes applied to the `TabsList` wrapper (the trigger bar). Useful to control width, alignment, or border overrides.",
      },
      {
        name: "contentClassName",
        type: "string",
        description:
          "Extra classes applied to every `TabsContent` panel. Use for padding, min-height, or background overrides shared across all panels.",
      },
    ],
    usage: [
      "DO: pass a flat `items` array with unique `key` strings — TabsItems renders the full TabsList + all TabsContent panels for you. NEVER hand-compose TabsList/TabsTrigger/TabsContent inside TabsItems; they are rendered internally.",
      "DO: use `defaultValue` (uncontrolled) for simple local tab state. Use `value` + `onValueChange` together (controlled) when the active tab is driven by router state, query params, or parent state. DO NOT set both `value` and `defaultValue` simultaneously.",
      "DO: choose `variant='line'` for page-level section navigation (full-width underline style) and `variant='default'` for contained widget tabs (pill/box). `variant='card'` suits dashboard card contexts.",
      "DON'T: rely on tab position for the default tab — always supply `defaultValue` explicitly when the first item should not be active, or when items order may change.",
      "DO: use `icon` on each `TabItemProp` to prepend an icon node (e.g. a Lucide icon) inside the trigger. Icons are rendered in an inline-flex span with `mr-1.5` spacing; pass sized icon components, not raw SVG strings.",
      "DON'T: use TabsItems to replace a full Radix Tabs composition when you need per-panel extra attributes (e.g. `forceMount`, custom `TabsContent` event handlers) — drop down to the lower-level `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` primitives from the same import subpath.",
    ],
    useCases: [
      "Admin detail pages with multiple sections (Overview / Transactions / Attachments / Audit Log) where all content is known up-front and switching is purely client-side.",
      "Accounting invoice or journal-entry detail drawers that split metadata, line items, and comments into named tabs without needing URL routing.",
      "Dashboard widgets presenting the same data in different views (e.g. Chart / Table / Raw) using controlled `value` driven by a toolbar toggle.",
      "Settings pages with a vertical or horizontal tab strip (line variant) separating General / Notifications / Billing / Security sections.",
      "Entity profile pages (company, partner, employee) where each tab loads deferred or lazy content — combine with Inertia deferred props per panel.",
      "Any place where Ant Design-style `<Tabs items={[...]} />` would have been used — TabsItems is the direct godx-ui equivalent.",
    ],
    related: [
      "Tabs / TabsList / TabsTrigger / TabsContent (@godxjp/ui/navigation) — lower-level Radix primitives. Use these when you need per-panel forceMount, custom data attributes on individual panels, or full control over trigger/content rendering. TabsItems wraps these internally.",
      "Steps (@godxjp/ui/navigation) — sequential wizard/progress indicator. Use Steps for multi-step flows where order matters and completion state must be tracked; use TabsItems for non-sequential switchable views.",
      "FilterBar / FilterGroup (@godxjp/ui/navigation) — horizontal filter chip row. Use FilterBar when the 'tabs' are really dataset filters (not content panels). Visually similar to line-variant tabs but semantically and behaviourally different.",
    ],
    example: `{\`import { TabsItems } from "@godxjp/ui/navigation";
import { FileText, List, BarChart2 } from "lucide-react";

// Uncontrolled — first item active by default
export function InvoiceDetailTabs() {
  return (
    <TabsItems
      variant="line"
      items={[
        {
          key: "overview",
          label: "Overview",
          icon: <FileText size={14} />,
          children: <OverviewPanel />,
        },
        {
          key: "line-items",
          label: "Line Items",
          icon: <List size={14} />,
          children: <LineItemsTable />,
        },
        {
          key: "analytics",
          label: "Analytics",
          icon: <BarChart2 size={14} />,
          disabled: false,
          children: <AnalyticsChart />,
        },
      ]}
    />
  );
}

// Controlled — active tab driven by URL search param
export function ControlledTabs() {
  const [tab, setTab] = React.useState("overview");

  return (
    <TabsItems
      variant="default"
      value={tab}
      onValueChange={setTab}
      items={[
        { key: "overview", label: "Overview", children: <OverviewPanel /> },
        { key: "history",  label: "History",  children: <HistoryPanel /> },
      ]}
    />
  );
}\`}`,
    storyPath: "navigation/TabsItems.stories.tsx",
    rules: [3, 23, 31, 37],
  },
  {
    name: "Menu",
    group: "layout",
    tagline:
      "A simplified sidebar-backed navigation menu — pass sections with active flags and Menu resolves the activeId automatically; never set activeId manually.",
    props: [
      {
        name: "items",
        type: "MenuSection[]",
        required: true,
        description:
          "Array of navigation sections. Each section has an optional label and an array of MenuItem objects. The first item with active: true becomes the active route; if none is marked the very first item is treated as active.",
      },
    ],
    usage: [
      "DO: set `active: true` on the single MenuItem that matches the current route — Menu derives `activeId` from this flag automatically. DON'T try to pass `activeId` (it does not exist on Menu).",
      "DO: supply every item with a unique `id` string — it is required by the underlying SidebarItemProp. Duplicate ids cause incorrect active/highlight state.",
      "DO: provide a Lucide (or compatible SVG) icon component via the `icon` field on each MenuItem. The icon is required by SidebarItemProp and will cause a render error if omitted.",
      "DO: nest child pages under an item using `children: SidebarItemProp[]` — this renders a collapsible submenu that auto-opens when any child is active.",
      "DON'T use Menu when you need to control collapse state, show a product switcher, render a custom brand slot, or attach an onSelect handler — use Sidebar directly for those scenarios.",
      "MenuItem extends SidebarItem so you may also pass `badge` (ReactNode), `disabled` (boolean), and `children` (nested items) on each item.",
    ],
    useCases: [
      "App-shell left-rail navigation where the current route is already known from the router and active state can be derived from a simple boolean flag on each item.",
      "Admin dashboards with a small, fixed set of top-level nav entries (Dashboard, Invoices, Settings) grouped into labelled sections (e.g. 'Accounting', 'Admin').",
      "Multi-section sidebars where some sections have nested child pages (e.g. Reports > Income Statement, Balance Sheet) and you want collapsible submenu groups without wiring up Sidebar manually.",
      "Situations where the product branding chip shown in the sidebar is purely cosmetic and does not need a real switcher — Menu hard-codes a placeholder product; use Sidebar when the product chip must be interactive or the brand slot needs a custom node.",
      "Rapid prototyping: quickly render a working sidebar nav by passing a flat MenuSection array without needing to understand Sidebar's full API.",
    ],
    related: [
      "Sidebar — the underlying component Menu wraps. Use Sidebar directly when you need: a real product/brand switcher (onProductClick, brand slot, productMenu), an onSelect handler to intercept navigation, a collapsed/rail mode toggle, or a custom footer node. Menu is a thin convenience layer on top of Sidebar that trades configurability for simplicity.",
      "AppShell — the page-level shell that accepts a sidebar node. Pass a Menu (or Sidebar) as its sidebar prop.",
      "Topbar — the horizontal bar that pairs with AppShell; not a replacement for Menu/Sidebar nav.",
    ],
    example: `
import { Menu } from "@godxjp/ui/layout";
import { LayoutDashboard, FileText, Settings, Users } from "lucide-react";

const sections = [
  {
    label: "Accounting",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
      { id: "invoices",  label: "Invoices",  icon: FileText },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        id: "users",
        label: "Users",
        icon: Users,
        children: [
          { id: "users-list",    label: "All Users",  icon: Users },
          { id: "users-invite",  label: "Invite",     icon: Users },
        ],
      },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AppSidebar() {
  return <Menu items={sections} />;
}
`,
    storyPath: "layout/Menu.stories.tsx",
    rules: [23],
  },
  {
    name: "ShellApp",
    group: "layout",
    tagline:
      "Opinionated full-page shell (AppShell + a hardcoded Topbar) — use AppShell directly if you need to configure the topbar.",
    props: [
      {
        name: "menu",
        type: "ReactNode",
        required: true,
        description:
          "Sidebar content — pass a configured <Sidebar> component here. Rendered inside the left rail.",
      },
      {
        name: "breadcrumb",
        type: "ReactNode",
        description:
          "Optional breadcrumb strip rendered above the main content area, inside the app-breadcrumb div.",
      },
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description:
          "Main page content — rendered inside <main class='app-main'>. Typically a <PageContainer> or a list of page-level components.",
      },
    ],
    usage: [
      "DO pass a fully configured <Sidebar> (with activeId, onSelect, sections) as the `menu` prop — ShellApp only renders what you give it; it has no built-in nav state.",
      "DO use ShellApp when you want the default GodX Topbar (product chip 'GodX', no live search/notification handlers) and only need sidebar + breadcrumb configuration. For any custom topbar (entity switcher, real onSearchOpen, onNotificationsOpen, user slot) use <AppShell> directly with your own <Topbar> passed to its `topbar` prop.",
      "DO NOT nest a second shell or AppShell inside ShellApp's children — ShellApp renders the root app-root div with sidebar, header, and main; nesting shells breaks layout.",
      "DO NOT pass layout-wrapper divs as children expecting them to fill the full viewport — ShellApp's <main> already provides the scroll container; add padding via <PageContainer> or <PageInset> inside children.",
      "DO pass a <Breadcrumb> (from @godxjp/ui/layout) node to the `breadcrumb` prop for breadcrumb navigation — do not hand-roll a breadcrumb strip inside children.",
      "The built-in Topbar rendered by ShellApp has no-op handlers for search and notifications (both fire () => undefined). Wire those interactions by switching to AppShell + Topbar directly.",
    ],
    useCases: [
      "Rapid admin panel scaffolding where the default GodX branding topbar is acceptable and the only variable parts are the sidebar menu and page content.",
      "Internal tools and dashboards that need a consistent three-zone shell (sidebar / topbar / main) without customising the product chip or notification system.",
      "Prototyping or demo apps where you want a full AppShell layout with minimal boilerplate — three props (menu, children, optional breadcrumb) vs AppShell's seven.",
      "Multi-page Inertia SPA where the sidebar, topbar chrome, and layout are shared across all pages via a persistent layout and each page only provides its own <PageContainer> as children.",
    ],
    related: [
      "AppShell — the underlying primitive ShellApp wraps. Use AppShell directly when you need to supply your own <Topbar> (custom product chip, entity switcher via productMenu, real search/notification handlers, user avatar slot, rightSlot) or any of topbarLeft/topbarRight/logo/footer/sidebarCollapsed.",
      "Sidebar — pass as the `menu` prop; handles activeId, collapsing, section labels, nested groups with Collapsible, and collapsed popover flyouts.",
      "Topbar — ShellApp renders a frozen Topbar internally; import Topbar from @godxjp/ui/layout and pass it to AppShell's topbar prop when you need live handlers.",
      "PageContainer — the right component to use as the direct child of ShellApp to get a titled, padded page with actions/breadcrumb/footer.",
      "PageInset — use inside a flush PageContainer for padded strips (filter bars, intros) that sit above a full-bleed DataTable.",
    ],
    example: `{\`import { ShellApp, Sidebar, PageContainer, Breadcrumb } from "@godxjp/ui/layout";
import { LayoutDashboard, FileText, Settings } from "lucide-react";

const NAV_SECTIONS = [
  {
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "invoices",  label: "Invoices",  icon: FileText },
      { id: "settings",  label: "Settings",  icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = React.useState("dashboard");

  return (
    <ShellApp
      menu={
        <Sidebar
          activeId={activeId}
          onSelect={setActiveId}
          sections={NAV_SECTIONS}
          product={{ name: "CoreBooks", color: "hsl(var(--attention))" }}
        />
      }
      breadcrumb={
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]} />
      }
    >
      {children}
    </ShellApp>
  );
}\`}`,
    storyPath: "layout/ShellApp.stories.tsx",
    rules: [23, 24, 31, 35],
  },
  {
    name: "MobileFrame",
    group: "layout",
    tagline:
      "Simulated smartphone chrome (header + scrollable body + bottom nav) for handheld/PWA screens — it is a full-page layout shell, not a modal or decoration.",
    props: [
      {
        name: "title",
        type: "string",
        required: true,
        description:
          "Primary heading shown in the mobile header bar (e.g. page name or branch name).",
      },
      {
        name: "subtitle",
        type: "string",
        description:
          "Secondary line rendered beneath the title — typically a context descriptor such as location or mode.",
      },
      {
        name: "status",
        type: "string",
        description:
          "Domain status string rendered as a secondary Badge in the header (e.g. 'Online', 'Offline'). Omit to suppress the badge.",
      },
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Main body content rendered inside the scrollable <main> region of the frame.",
      },
      {
        name: "navItems",
        type: "MobileFrameNavItem[]",
        defaultValue: "[]",
        description:
          "Array of bottom-navigation tab descriptors. Each item has { label: string; icon: ComponentType<SVGProps<SVGSVGElement>>; active?: boolean }. The footer is only rendered when the array is non-empty. Mark exactly one item active at a time to indicate the current tab.",
      },
    ],
    usage: [
      "DO: Use MobileFrame as a full-page layout shell for handheld/PWA screens — wrap the entire screen content in it, not a subsection of a desktop page.",
      "DO: Pass lucide-react (or equivalent) icon components directly as `icon` values in navItems; the frame renders them as SVG children and adds aria-hidden automatically.",
      "DO: Mark the active nav item with `active: true` on exactly one navItems entry; multiple or zero active states are valid but only the first receives the active highlight.",
      "DO NOT: Nest MobileFrame inside PageContainer or AppShell — it is an independent shell; mixing shells breaks the layout semantics.",
      "DO NOT: Hand-roll a phone frame with raw divs, CSS borders and overflow — MobileFrame already owns the stage/frame/header/main/nav CSS tokens (ui-mobile-stage, ui-mobile-frame, etc.).",
      "DO NOT: Use MobileFrame for desktop admin pages — it renders a narrow, phone-sized canvas. Use PageContainer + AppShell for desktop screens.",
    ],
    useCases: [
      "Warehouse handheld scanners: a picker/packer app where staff scan barcodes on a phone — title='Tokyo scan', subtitle='Branch handheld', status='Online', navItems for Scan/Receive/Pack/Flight tabs.",
      "Field-agent PWA screens where the same codebase serves a desktop admin shell (AppShell) and a mobile companion app (MobileFrame) rendered at the phone viewport.",
      "Storybook/design-review previews of a mobile screen at realistic size — set Storybook viewport to 'mobile1' and wrap the page in MobileFrame to see the chrome.",
      "Prototype or demo of a consumer-facing mobile app embedded inside an admin dashboard as a live preview widget.",
      "Delivery dispatch or order-tracking app rendered on a handheld device where bottom-tab navigation is the primary navigation affordance.",
    ],
    related: [
      "AppShell — the desktop counterpart (sidebar + topbar shell); use AppShell for admin/desktop layouts, MobileFrame for handheld/phone layouts. Never nest one inside the other.",
      "PageContainer — the page-level content wrapper used inside AppShell for desktop pages; do not substitute for MobileFrame on mobile screens.",
      "ShellApp — another desktop shell variant; same rule as AppShell — mutually exclusive with MobileFrame.",
    ],
    example: `import { Archive, CalendarClock, Package, ScanLine } from "lucide-react";
import { MobileFrame, type MobileFrameNavItem } from "@godxjp/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Stack } from "@godxjp/ui/layout";

const navItems: MobileFrameNavItem[] = [
  { label: "Scan", icon: ScanLine, active: true },
  { label: "Receive", icon: Archive },
  { label: "Pack", icon: Package },
  { label: "Schedule", icon: CalendarClock },
];

export default function HandheldScanPage() {
  return (
    <MobileFrame
      title="Tokyo scan"
      subtitle="Branch handheld"
      status="Online"
      navItems={navItems}
    >
      <Stack gap="md">
        <Card>
          <CardHeader banded>
            <CardTitle>Last scan</CardTitle>
          </CardHeader>
          <CardContent>
            Ready to scan vendor or internal code.
          </CardContent>
        </Card>
      </Stack>
    </MobileFrame>
  );
}`,
    storyPath: "layout/MobileFrame.stories.tsx",
    rules: [2, 3, 23, 24],
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
      "QueryRefetchButton — for triggering a manual cache refresh on an already-loaded page, not for navigation prefetching.",
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
    name: "QueryRefetchButton",
    group: "data-display",
    importPath: "@godxjp/ui/query",
    tagline:
      "Page-header Refresh button wired directly to a TanStack Query result — auto-disables and spins while fetching; never pass onClick or disabled yourself.",
    props: [
      {
        name: "query",
        type: "Pick<UseQueryResult<unknown>, 'isFetching' | 'refetch'>",
        required: true,
        description:
          "The TanStack Query result object. The button calls query.refetch() on click and is disabled while query.isFetching is true. Pass the full useQuery result; only isFetching and refetch are consumed.",
      },
      {
        name: "label",
        type: "React.ReactNode",
        defaultValue: '"Refresh"',
        description: "Text label rendered inside the button. Ignored when children is provided.",
      },
      {
        name: "children",
        type: "React.ReactNode",
        description:
          "If provided, overrides label. Use for custom label content (e.g. translated strings, icons).",
      },
      {
        name: "variant",
        type: "ButtonProp['variant']",
        defaultValue: '"outline"',
        description: "Visual variant forwarded to the underlying Button primitive.",
      },
      {
        name: "size",
        type: "ButtonProp['size']",
        defaultValue: '"sm"',
        description: "Size forwarded to the underlying Button primitive.",
      },
      {
        name: "className",
        type: "string",
        description: "Additional CSS classes applied to the Button root.",
      },
    ],
    usage: [
      "DO pass the raw useQuery result directly — the component only reads isFetching and refetch, so any UseQueryResult shape is safe: `<QueryRefetchButton query={invoicesQuery} />`",
      "DON'T pass onClick or disabled — both are owned by QueryRefetchButton and forwarded internally. They are omitted from the prop type (Omit<ButtonProp, 'onClick' | 'disabled'>) so TypeScript will reject them at compile time.",
      "DON'T use this for mutation triggers — it is wired to query.refetch(), not a mutation. For mutation actions use a plain Button + useMutation.",
      "DO place it in a page header or toolbar beside a title — it renders as size='sm' variant='outline' by default, matching header action patterns.",
      "The RefreshCw icon is always rendered automatically with a spin animation driven by data-fetching={query.isFetching} — do NOT add your own icon or loading spinner.",
      "For i18n, pass a translated string as label or children: `<QueryRefetchButton query={q} label={t('refresh')} />` — the default label is the English string 'Refresh'.",
    ],
    useCases: [
      "Toolbar 'Refresh' button on an invoice list page that re-fetches from the server without a full navigation.",
      "Dashboard header action that re-polls live financial summaries when the user wants fresh data.",
      "Admin data table header where stale data is a concern and users need manual control over re-fetching.",
      "Any page using useQuery where you want a consistent, accessible Refresh affordance without wiring up onClick/disabled logic manually.",
      "Pairing with DataState or a DataTable — place QueryRefetchButton in the page header while DataState manages the content area lifecycle.",
    ],
    related: [
      "DataState — use DataState (not QueryRefetchButton) to handle the full query lifecycle (pending/error/empty/data states) in the content area; QueryRefetchButton is only the header action button.",
      "InfiniteQueryState — for infinite-scroll / load-more lists; has its own refetch wiring; QueryRefetchButton is redundant alongside it.",
      "MutationFeedback — for displaying mutation errors and a retry action; do not use QueryRefetchButton for mutation retries.",
      "Button — the raw primitive; use Button directly when you need custom onClick logic or are not wired to a TanStack Query result.",
    ],
    example: `{\`import { useQuery } from "@tanstack/react-query";
import { QueryRefetchButton } from "@godxjp/ui/query";

export function InvoiceListHeader() {
  const invoicesQuery = useQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
  });

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">Invoices</h1>
      <QueryRefetchButton query={invoicesQuery} label="Refresh" />
    </div>
  );
}\`}`,
    storyPath: "data-display/QueryRefetchButton.stories.tsx",
    rules: [3, 5, 6, 13],
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

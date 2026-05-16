import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Activity,
  Bell,
  Box,
  Code2,
  Cog,
  Database,
  FileText,
  Folder,
  Home,
  Inbox,
  LayoutGrid,
  Users,
} from "lucide-react";
import { Sidebar } from "../components/shell/Sidebar";
import { Avatar } from "../components/primitives/Avatar";
import { Button } from "../components/primitives/Button";
import { PRODUCTS } from "../data/products";

const meta: Meta<typeof Sidebar> = {
  title: "Shell/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
\`Sidebar\` is the vertical nav rail mounted in \`AppShell\`'s sidebar slot.
It renders three regions, top to bottom:

1. **Brand / product chip** — either the supplied \`brand\` slot (replaces
   the default chip) or the product chip that opens \`ProductSwitcher\`
   on click.
2. **Nav sections** — flat list of \`SidebarSection\` groups; each section
   has an optional label and an array of \`SidebarItem\` rows. Items
   carry an \`icon\` (lucide component), \`label\`, optional \`badge\`, and
   optional \`disabled\`.
3. **Footer slot** — fixed-bottom area for the current user / quick
   actions.

### State

The active row is **controlled** via \`activeId\` + \`onSelect\`. The
\`collapsed\` prop hides labels + badges (icons-only mode); the
\`AppShell\` mirrors the same flag onto \`<html data-collapsed>\` so the
CSS reacts globally.

### Composition rules

- Per CLAUDE.md hard rule #19 nothing inside this component is
  service-specific; consumers pass their own sections, icons, and
  brand. The \`product\` chip pulls from the generic \`ForgeProduct\`
  shape in \`@godxjp/ui/data\`.
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

const BASIC_SECTIONS = [
  {
    label: "Overview",
    items: [
      { id: "home", label: "Home", icon: Home },
      { id: "inbox", label: "Inbox", icon: Inbox, badge: 12 },
      { id: "activity", label: "Activity", icon: Activity },
    ],
  },
  {
    label: "Workspace",
    items: [
      { id: "projects", label: "Projects", icon: Folder, badge: 4 },
      { id: "people", label: "People", icon: Users },
      { id: "apps", label: "Apps", icon: LayoutGrid },
    ],
  },
  {
    label: "Manage",
    items: [
      { id: "settings", label: "Settings", icon: Cog },
      { id: "billing", label: "Billing", icon: FileText, disabled: true },
    ],
  },
];

// Wrap the sidebar in a fixed-width column so it renders the way it
// would inside an AppShell grid cell.
function SidebarFrame({ children, collapsed = false }: { children: React.ReactNode; collapsed?: boolean }) {
  return (
    <div
      data-collapsed={collapsed}
      style={{
        display: "flex",
        flexDirection: "column",
        width: collapsed ? "var(--sidebar-collapsed-width, 64px)" : "var(--sidebar-width, 240px)",
        height: 560,
        background: "var(--sidebar-bg, var(--surface-2))",
        borderRight: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <SidebarFrame>
      <Sidebar
        activeId="home"
        onSelect={() => {}}
        sections={BASIC_SECTIONS}
        product={PRODUCTS[0]}
      />
    </SidebarFrame>
  ),
};

export const Collapsed: Story = {
  name: "Collapsed (icons-only)",
  render: () => (
    <SidebarFrame collapsed>
      <Sidebar
        collapsed
        activeId="home"
        onSelect={() => {}}
        sections={BASIC_SECTIONS}
        product={PRODUCTS[0]}
      />
    </SidebarFrame>
  ),
};

export const WithBadges: Story = {
  name: "Badges (numeric + string)",
  render: () => (
    <SidebarFrame>
      <Sidebar
        activeId="projects"
        onSelect={() => {}}
        sections={[
          {
            label: "Work",
            items: [
              { id: "projects", label: "Projects", icon: Folder, badge: 4 },
              { id: "issues", label: "Issues", icon: Inbox, badge: 128 },
              { id: "prs", label: "Pull requests", icon: Code2, badge: "12+" },
              { id: "alerts", label: "Alerts", icon: Bell, badge: "!" },
            ],
          },
        ]}
        product={PRODUCTS[0]}
      />
    </SidebarFrame>
  ),
};

export const DisabledItem: Story = {
  name: "Disabled row (dimmed, unclickable)",
  render: () => (
    <SidebarFrame>
      <Sidebar
        activeId="home"
        onSelect={() => {}}
        sections={[
          {
            label: "Plans",
            items: [
              { id: "home", label: "Home", icon: Home },
              { id: "billing", label: "Billing", icon: FileText, disabled: true },
            ],
          },
        ]}
        product={PRODUCTS[0]}
      />
    </SidebarFrame>
  ),
};

export const ManySections: Story = {
  name: "Many sections (scrolling list)",
  render: () => (
    <SidebarFrame>
      <Sidebar
        activeId="home"
        onSelect={() => {}}
        sections={[
          {
            label: "Overview",
            items: Array.from({ length: 8 }, (_, i) => ({
              id: `o${i}`,
              label: `Overview row ${i + 1}`,
              icon: Home,
            })),
          },
          {
            label: "Data",
            items: Array.from({ length: 8 }, (_, i) => ({
              id: `d${i}`,
              label: `Database ${i + 1}`,
              icon: Database,
            })),
          },
          {
            label: "Apps",
            items: Array.from({ length: 6 }, (_, i) => ({
              id: `a${i}`,
              label: `App ${i + 1}`,
              icon: Box,
            })),
          },
        ]}
        product={PRODUCTS[0]}
      />
    </SidebarFrame>
  ),
};

export const NoSectionLabels: Story = {
  name: "Sections without labels",
  render: () => (
    <SidebarFrame>
      <Sidebar
        activeId="home"
        onSelect={() => {}}
        sections={[
          {
            items: [
              { id: "home", label: "Home", icon: Home },
              { id: "inbox", label: "Inbox", icon: Inbox },
            ],
          },
          {
            items: [
              { id: "settings", label: "Settings", icon: Cog },
            ],
          },
        ]}
        product={PRODUCTS[0]}
      />
    </SidebarFrame>
  ),
};

export const CustomBrandSlot: Story = {
  name: "Brand slot · replaces product chip (me-service pattern)",
  render: () => (
    <SidebarFrame>
      <Sidebar
        activeId="home"
        onSelect={() => {}}
        sections={BASIC_SECTIONS}
        brand={
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", width: "100%" }}>
            <Avatar>SF</Avatar>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Satoshi F</span>
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>info@famgia.com</span>
            </div>
          </div>
        }
      />
    </SidebarFrame>
  ),
};

export const WithFooter: Story = {
  name: "Footer slot (user + actions)",
  render: () => (
    <SidebarFrame>
      <Sidebar
        activeId="home"
        onSelect={() => {}}
        sections={BASIC_SECTIONS}
        product={PRODUCTS[0]}
        footer={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px" }}>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>v3.0.0</span>
            <Button variant="ghost" size="sm">
              <Cog size={14} />
            </Button>
          </div>
        }
      />
    </SidebarFrame>
  ),
};

export const TenantVariantKintai: Story = {
  name: "Tenant variant · dxs-kintai",
  render: () => (
    <SidebarFrame>
      <Sidebar
        activeId="home"
        onSelect={() => {}}
        sections={BASIC_SECTIONS}
        product={PRODUCTS.find((p) => p.tenant === "kintai")!}
      />
    </SidebarFrame>
  ),
};

export const TenantVariantRestaurant: Story = {
  name: "Tenant variant · godx-restaurant",
  render: () => (
    <SidebarFrame>
      <Sidebar
        activeId="home"
        onSelect={() => {}}
        sections={BASIC_SECTIONS}
        product={PRODUCTS.find((p) => p.tenant === "restaurant")!}
      />
    </SidebarFrame>
  ),
};

export const Playground: Story = {
  name: "Playground · controlled selection",
  render: () => {
    function Demo() {
      const [activeId, setActiveId] = useState("home");
      const [collapsed, setCollapsed] = useState(false);
      return (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <SidebarFrame collapsed={collapsed}>
            <Sidebar
              activeId={activeId}
              onSelect={setActiveId}
              sections={BASIC_SECTIONS}
              product={PRODUCTS[0]}
              collapsed={collapsed}
              footer={
                <Button variant="ghost" size="sm" onClick={() => setCollapsed((c) => !c)}>
                  {collapsed ? "Expand" : "Collapse"}
                </Button>
              }
            />
          </SidebarFrame>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            Selected: <code>{activeId}</code>
          </div>
        </div>
      );
    }
    return <Demo />;
  },
};

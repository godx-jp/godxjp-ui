import type { PreviewMeta, PreviewCase } from "../preview-types";
import {
  Archive,
  Boxes,
  KeyRound,
  PackageCheck,
  Plane,
  Search,
  Shield,
  Truck,
  Users,
} from "lucide-react";

import { Sidebar, type SidebarSection } from "../../src/components/layout/sidebar";

const sections: SidebarSection[] = [
  {
    label: "Operations",
    items: [
      { id: "dashboard", label: "Dashboard", icon: PackageCheck },
      { id: "items", label: "Orders inbox", icon: Archive, badge: 128 },
      { id: "packages", label: "Batches", icon: Boxes },
    ],
  },
  {
    label: "Fulfillment",
    items: [
      { id: "booking", label: "Shipping slots", icon: Plane },
      { id: "dispatch", label: "Dispatch queue", icon: Truck, badge: 12 },
      { id: "tracking", label: "Order search", icon: Search },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "users", label: "Users", icon: Users },
      { id: "roles", label: "Roles", icon: Shield },
      { id: "password", label: "Password", icon: KeyRound },
    ],
  },
];

/**
 * `.sb-root` is `display: contents`, so a standalone Sidebar is hosted inside
 * an `.app-sidebar` frame — the same surface the shell gives it.
 */
function SidebarFrame({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div
      className="app-sidebar"
      data-collapsed={collapsed ? "true" : undefined}
      style={{ height: 560, width: collapsed ? "4rem" : "16rem" }}
    >
      <Sidebar
        activeId="items"
        collapsed={collapsed}
        onSelect={() => undefined}
        sections={sections}
        product={{ name: "Acme Inc", role: "Admin Console", color: "hsl(var(--primary))" }}
        footer={
          <div className="text-muted-foreground text-xs">
            <div className="text-foreground font-medium">Operations desk</div>
            <div>Online · Tokyo branch</div>
          </div>
        }
      />
    </div>
  );
}

const meta = {
  title: "Layout/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "padded",
  },
} satisfies PreviewMeta;

export default meta;
type Story = PreviewCase;

export const Default: Story = {
  render: () => <SidebarFrame />,
};

export const Collapsed: Story = {
  render: () => <SidebarFrame collapsed />,
};

export const SideBySide: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "flex-start" }}>
      <SidebarFrame />
      <SidebarFrame collapsed />
    </div>
  ),
};

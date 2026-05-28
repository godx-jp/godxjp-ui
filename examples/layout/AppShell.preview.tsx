import type { PreviewMeta, PreviewCase } from "../preview-types";
import { Archive, Boxes, PackageCheck, Plane, Search, Truck } from "lucide-react";

import { Badge } from "../../src/components/data-display/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardStat,
  CardTitle,
} from "../../src/components/data-display/card";
import { Button } from "../../src/components/general/button";
import { AppShell } from "../../src/components/layout/app-shell";
import { Inline } from "../../src/components/layout/inline";
import { PageContainer } from "../../src/components/layout/page-container";
import { Sidebar, type SidebarSection } from "../../src/components/layout/sidebar";
import { Stack } from "../../src/components/layout/stack";
import { Topbar } from "../../src/components/layout/topbar";

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
];

function ExampleShell({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <AppShell
      sidebarCollapsed={collapsed}
      sidebar={
        <Sidebar
          activeId="dashboard"
          collapsed={collapsed}
          onSelect={() => undefined}
          sections={sections}
          product={{ name: "Acme Inc", role: "Admin Console", color: "hsl(var(--attention))" }}
          footer={
            <div className="text-muted-foreground text-xs">
              <div className="text-foreground font-medium">Operations desk</div>
              <div>Online · Tokyo branch</div>
            </div>
          }
        />
      }
      topbar={
        <Topbar
          product={{ name: "Acme", color: "hsl(var(--attention))" }}
          project={{ name: "Orders & Customers" }}
          collapsed={collapsed}
          onToggleCollapsed={() => undefined}
          onSearchOpen={() => undefined}
          onNotificationsOpen={() => undefined}
          unread
        />
      }
      breadcrumb={<span>Operations / Dashboard</span>}
    >
      <PageContainer
        title="Shell composition"
        subtitle="Canonical admin chrome with slot-based sidebar and topbar."
        extra={
          <Inline gap="sm">
            <Button variant="outline">Export</Button>
            <Button>New order</Button>
          </Inline>
        }
      >
        <Stack gap="md">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "var(--space-3)",
            }}
          >
            <CardStat
              label="Orders inbox"
              value="128"
              delta={<Badge variant="secondary">+18 today</Badge>}
            />
            <CardStat
              label="Fulfilled"
              value="42"
              delta={<Badge variant="success">8 dispatched</Badge>}
            />
            <CardStat
              label="Exceptions"
              value="7"
              delta={<Badge variant="destructive">needs check</Badge>}
            />
          </div>
          <Card>
            <CardHeader banded>
              <CardTitle>Content slot</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Product teams provide page content only; shell structure, density, color and
                navigation behavior stay owned by the UI package.
              </p>
            </CardContent>
          </Card>
        </Stack>
      </PageContainer>
    </AppShell>
  );
}

const meta = {
  title: "Layout/AppShell",
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "desktop",
    },
  },
} satisfies PreviewMeta;

export default meta;
type Story = PreviewCase;

export const Default: Story = {
  render: () => <ExampleShell />,
};

export const CollapsedSidebar: Story = {
  render: () => <ExampleShell collapsed />,
};

import * as React from "react";
import type { PreviewMeta, PreviewCase } from "../preview-types";
import {
  Archive,
  Boxes,
  ClipboardCheck,
  Package,
  PackageCheck,
  Plane,
  QrCode,
  ScanLine,
  Search,
  ShoppingBag,
  Split,
  Truck,
} from "lucide-react";

import { Badge } from "../../src/components/data-display/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  StatCard,
  CardTitle,
} from "../../src/components/data-display/card";
import { DataTable, type ColumnDef } from "../../src/components/data-display/data-table";
import { Descriptions } from "../../src/components/data-display/descriptions";
import { Progress } from "../../src/components/data-display/progress";
import { Timeline, type TimelineItem } from "../../src/components/data-display/timeline";
import { TreeList, type TreeListItem } from "../../src/components/data-display/tree-list";
import { Input } from "../../src/components/data-entry/input";
import { SearchInput } from "../../src/components/data-entry/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/data-entry/select";
import { Button } from "../../src/components/general/button";
import { Breadcrumb } from "../../src/components/layout/breadcrumb";
import { Inline } from "../../src/components/layout/inline";
import { Sidebar, type SidebarSection } from "../../src/components/layout/sidebar";
import { PageContainer } from "../../src/components/layout/page-container";
import { PageInset } from "../../src/components/layout/page-inset";
import { ResponsiveGrid } from "../../src/components/layout/responsive-grid";
import { AppShell } from "../../src/components/layout/app-shell";
import { SplitPane } from "../../src/components/layout/split-pane";
import { Stack } from "../../src/components/layout/stack";
import { Topbar } from "../../src/components/layout/topbar";
import { FilterBar, FilterGroup } from "../../src/components/navigation/filter-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../src/components/navigation/tabs";

type ItemRow = {
  id: string;
  customer: string;
  description: string;
  sellerCode: string;
  weight: string;
  status: "inbox" | "packed" | "exception";
  receivedAt: string;
};

type PackageRow = {
  id: string;
  customer: string;
  internalId: string;
  items: number;
  weight: string;
  booking: string;
  status: "ready" | "booked" | "dispatched";
};

type DispatchRow = {
  id: string;
  internalId: string;
  customer: string;
  method: "dropoff" | "yamato";
  slot: string;
  yamatoCode?: string;
  status: "scheduled" | "label" | "queued";
};

const items: ItemRow[] = [
  {
    id: "itm_10041",
    customer: "Nguyen Mai",
    description: "Sneakers + denim jacket",
    sellerCode: "VND-ITM-7734-2108",
    weight: "1.42 kg",
    status: "inbox",
    receivedAt: "09:18",
  },
  {
    id: "itm_10042",
    customer: "Tran Logistics",
    description: "Kitchen set, fragile",
    sellerCode: "VND-ITM-5591-8830",
    weight: "3.80 kg",
    status: "exception",
    receivedAt: "09:31",
  },
  {
    id: "itm_10043",
    customer: "Bui Linh",
    description: "Camera lens",
    sellerCode: "VND-ITM-1185-4402",
    weight: "0.62 kg",
    status: "packed",
    receivedAt: "10:04",
  },
  {
    id: "itm_10044",
    customer: "Pham Minh",
    description: "Cosmetics bundle, 14 units",
    sellerCode: "VND-ITM-0981-4016",
    weight: "2.15 kg",
    status: "inbox",
    receivedAt: "10:22",
  },
];

const packages: PackageRow[] = [
  {
    id: "pkg_8801",
    customer: "Nguyen Mai",
    internalId: "REC-8801",
    items: 6,
    weight: "8.34 kg",
    booking: "Batch A · 2026-05-27",
    status: "ready",
  },
  {
    id: "pkg_8802",
    customer: "Tran Logistics",
    internalId: "REC-8802",
    items: 12,
    weight: "18.80 kg",
    booking: "Batch B · 2026-05-28",
    status: "booked",
  },
  {
    id: "pkg_8803",
    customer: "Bui Linh",
    internalId: "REC-8803",
    items: 3,
    weight: "4.10 kg",
    booking: "Batch A · 2026-05-24",
    status: "dispatched",
  },
];

const dispatchQueue: DispatchRow[] = [
  {
    id: "dsp_01",
    internalId: "REC-8801",
    customer: "Nguyen Mai",
    method: "dropoff",
    slot: "27 May · 08:30",
    status: "scheduled",
  },
  {
    id: "dsp_02",
    internalId: "REC-8802",
    customer: "Tran Logistics",
    method: "yamato",
    slot: "28 May · 17:00",
    yamatoCode: "VND-AGT-7622-1048",
    status: "label",
  },
  {
    id: "dsp_03",
    internalId: "REC-8806",
    customer: "Pham Minh",
    method: "yamato",
    slot: "Awaiting slot",
    status: "queued",
  },
];

const baseSections: SidebarSection[] = [
  {
    label: "Operations",
    items: [
      { id: "dashboard", label: "Dashboard", icon: PackageCheck },
      { id: "customers", label: "Customers", icon: ClipboardCheck },
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

function PortalShell({ activeId, children }: { activeId: string; children: React.ReactNode }) {
  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId={activeId}
          onSelect={() => undefined}
          sections={baseSections}
          product={{
            name: "Acme Inc",
            role: "Admin Console",
            color: "hsl(var(--attention))",
          }}
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
          onToggleCollapsed={() => undefined}
          onSearchOpen={() => undefined}
          onNotificationsOpen={() => undefined}
          unread
        />
      }
      breadcrumb={<Breadcrumb items={[{ label: "Admin Console" }, { label: activeId }]} />}
    >
      {children}
    </AppShell>
  );
}

function FlightSlot({
  lane,
  date,
  load,
  status,
}: {
  lane: string;
  date: string;
  load: number;
  status: "open" | "filling" | "closed";
}) {
  return (
    <Card size="compact">
      <CardContent solo>
        <Stack gap="sm">
          <Inline gap="sm">
            <div>
              <CardTitle>{lane}</CardTitle>
              <CardDescription>{date}</CardDescription>
            </div>
            <Badge
              status={status === "closed" ? "cancelled" : status === "filling" ? "pending" : "active"}
            >
              {status === "closed" ? "Closed" : status === "filling" ? "Filling" : "Open"}
            </Badge>
          </Inline>
          <Progress
            value={load}
            tone={status === "filling" ? "warning" : "success"}
            label={`${load}% booked by weight`}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

const itemColumns: ColumnDef<ItemRow>[] = [
  {
    key: "sellerCode",
    header: "Seller code",
    render: (row) => <Badge icon={null} variant="secondary">{row.sellerCode}</Badge>,
  },
  { key: "customer", header: "Customer", sortable: true },
  { key: "description", header: "Item description" },
  { key: "weight", header: "Weight", align: "right" },
  {
    key: "status",
    header: "Status",
    render: (row) => {
      const map = {
        inbox: ["pending", "Unpacked"],
        packed: ["completed", "Packed"],
        exception: ["failed", "Exception"],
      } as const;
      return <Badge status={map[row.status][0]}>{map[row.status][1]}</Badge>;
    },
  },
  { key: "receivedAt", header: "Received", align: "right" },
];

const packageColumns: ColumnDef<PackageRow>[] = [
  {
    key: "internalId",
    header: "Internal ID",
    render: (row) => <Badge icon={null} variant="secondary">{row.internalId}</Badge>,
  },
  { key: "customer", header: "Customer" },
  { key: "items", header: "Items", align: "right" },
  { key: "weight", header: "Weight", align: "right" },
  { key: "booking", header: "Booking" },
  {
    key: "status",
    header: "Status",
    render: (row) => {
      const map = {
        ready: ["active", "Ready"],
        booked: ["scheduled", "Booked"],
        dispatched: ["sending", "Dispatched"],
      } as const;
      return <Badge status={map[row.status][0]}>{map[row.status][1]}</Badge>;
    },
  },
];

const dispatchColumns: ColumnDef<DispatchRow>[] = [
  {
    key: "internalId",
    header: "Package",
    render: (row) => <Badge icon={null} variant="secondary">{row.internalId}</Badge>,
  },
  { key: "customer", header: "Customer" },
  {
    key: "method",
    header: "Method",
    render: (row) => (row.method === "yamato" ? "Provider agent" : "Hub drop-off"),
  },
  { key: "slot", header: "Slot" },
  {
    key: "yamatoCode",
    header: "Provider ref",
    render: (row) => (row.yamatoCode ? <Badge icon={null} variant="secondary">{row.yamatoCode}</Badge> : "—"),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => {
      const map = {
        scheduled: ["scheduled", "Scheduled"],
        label: ["pending", "Label ready"],
        queued: ["draft", "Queued"],
      } as const;
      return <Badge status={map[row.status][0]}>{map[row.status][1]}</Badge>;
    },
  },
];

function DashboardLayout() {
  return (
    <PortalShell activeId="dashboard">
      <PageContainer
        title="Operations overview"
        subtitle="Tokyo branch · 24 May · order processing and dispatch control"
        extra={
          <Inline gap="sm">
            <Button variant="outline">
              <QrCode aria-hidden="true" />
              Print labels
            </Button>
            <Button>
              <ScanLine aria-hidden="true" />
              Receive order
            </Button>
          </Inline>
        }
      >
        <Stack gap="md">
          <ResponsiveGrid columns={4}>
            <StatCard
              label="Orders awaiting processing"
              value="128"
              delta={<Badge variant="secondary">+18 today</Badge>}
            />
            <StatCard
              label="Batches ready"
              value="42"
              delta={<Badge variant="success">8 dispatched</Badge>}
            />
            <StatCard label="Dispatch cut-off" value="15:40" hint="Batch A closes in 5h 12m" />
            <StatCard
              label="Exceptions"
              value="7"
              delta={<Badge variant="destructive">needs check</Badge>}
            />
          </ResponsiveGrid>

          <SplitPane
            aside={
              <Stack gap="sm">
                <Card>
                  <CardHeader banded>
                    <CardTitle>Upcoming dispatch slots</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Stack gap="sm">
                      <FlightSlot
                        lane="Batch A · Tokyo"
                        date="27 May · morning run"
                        load={72}
                        status="filling"
                      />
                      <FlightSlot
                        lane="Batch B · Osaka"
                        date="28 May · afternoon run"
                        load={41}
                        status="open"
                      />
                      <FlightSlot
                        lane="Batch C · Kyoto"
                        date="24 May · closed"
                        load={100}
                        status="closed"
                      />
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader banded>
                    <CardTitle>Reference code legend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Stack gap="sm">
                      <Badge icon={null} variant="secondary">REC-8801</Badge>
                      <Badge icon={null} variant="secondary">VND-ITM-7734-2108</Badge>
                      <Badge icon={null} variant="secondary">VND-AGT-7622-1048</Badge>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            }
          >
            <Card>
              <CardHeader banded>
                <CardTitle>Today's orders received</CardTitle>
                <CardDescription>
                  Vendor codes stay separate from internal batch IDs.
                </CardDescription>
                <CardAction>
                  <Button variant="outline" size="sm">
                    Export CSV
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent flush tight>
                <DataTable
                  data={items}
                  columns={itemColumns}
                  getRowId={(row) => row.id}
                  density="compact"
                >
                  <DataTable.Toolbar>
                    <span>4 newest entries · duplicate check active</span>
                    <DataTable.DensityToggle />
                  </DataTable.Toolbar>
                  <DataTable.Content />
                </DataTable>
              </CardContent>
            </Card>
          </SplitPane>
        </Stack>
      </PageContainer>
    </PortalShell>
  );
}

function ReceivePackLayout() {
  const [selected, setSelected] = React.useState<Set<string>>(new Set(["itm_10041", "itm_10044"]));

  return (
    <PortalShell activeId="items">
      <PageContainer
        title="Orders inbox"
        subtitle="Receive vendor deliveries, assign customers, then group into batches."
        extra={
          <Inline gap="sm">
            <Button variant="outline">
              <ShoppingBag aria-hidden="true" />
              Manual create
            </Button>
            <Button>
              <Package aria-hidden="true" />
              Pack selected
            </Button>
          </Inline>
        }
      >
        <Stack gap="sm">
          <PageInset>
            <FilterBar onClear={() => undefined}>
              <FilterGroup label="Universal search">
                <SearchInput
                  defaultValue="VND-ITM"
                  placeholder="Internal ID, vendor code, order ref"
                  ariaLabel="Order search"
                  onSearch={() => undefined}
                />
              </FilterGroup>
              <FilterGroup label="Customer">
                <Input placeholder="Customer name or code" />
              </FilterGroup>
              <FilterGroup label="Status">
                <Select defaultValue="unpacked">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All items</SelectItem>
                    <SelectItem value="unpacked">Unpacked</SelectItem>
                    <SelectItem value="packed">Packed</SelectItem>
                    <SelectItem value="exception">Exception</SelectItem>
                  </SelectContent>
                </Select>
              </FilterGroup>
            </FilterBar>
          </PageInset>

          <SplitPane
            aside={
              <Card>
                <CardHeader banded>
                  <CardTitle>Batch wizard preview</CardTitle>
                  <CardDescription>Validation summary before labels are printed.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Stack gap="sm">
                    <Descriptions columns={1}>
                      <Descriptions.Item label="Selected orders">{selected.size}</Descriptions.Item>
                      <Descriptions.Item label="Customer match">
                        Nguyen Mai · 100%
                      </Descriptions.Item>
                      <Descriptions.Item label="Batch type">
                        Standard single-customer
                      </Descriptions.Item>
                      <Descriptions.Item label="Estimated weight">3.57 kg</Descriptions.Item>
                    </Descriptions>
                    <Badge status="completed">Vendor code collision check passed</Badge>
                  </Stack>
                </CardContent>
                <CardFooter separated>
                  <Button variant="outline">Save draft</Button>
                  <Button>Confirm pack</Button>
                </CardFooter>
              </Card>
            }
            asideWidth="sm"
          >
            <Card>
              <CardHeader banded>
                <CardTitle>Unprocessed orders queue</CardTitle>
                <CardDescription>
                  Bulk action creates a batch draft with audit preview.
                </CardDescription>
              </CardHeader>
              <CardContent flush tight>
                <DataTable
                  data={items}
                  columns={itemColumns}
                  getRowId={(row) => row.id}
                  selectable
                  selected={selected}
                  onSelectChange={setSelected}
                  density="compact"
                >
                  <DataTable.Toolbar>
                    <DataTable.BulkActions count={selected.size}>
                      <Button variant="outline" size="sm">
                        Assign customer
                      </Button>
                      <Button size="sm">Add to batch</Button>
                    </DataTable.BulkActions>
                    <DataTable.DensityToggle />
                  </DataTable.Toolbar>
                  <DataTable.Content />
                </DataTable>
              </CardContent>
            </Card>
          </SplitPane>
        </Stack>
      </PageContainer>
    </PortalShell>
  );
}

function PackageTreeLayout() {
  const treeItems: TreeListItem[] = [
    {
      id: "REC-8801",
      title: "REC-8801",
      description: "Parent batch · 6 items · 8.34 kg",
      active: true,
      badge: "parent",
    },
    {
      id: "REC-8801-A",
      title: "REC-8801-A",
      description: "Sub-batch · sneakers + jacket",
      depth: 1,
    },
    {
      id: "REC-8801-B",
      title: "REC-8801-B",
      description: "Sub-batch · cosmetics bundle",
      depth: 1,
    },
    {
      id: "REC-8801-B-1",
      title: "REC-8801-B-1",
      description: "Inner group · fragile glass",
      depth: 2,
    },
  ];

  return (
    <PortalShell activeId="packages">
      <PageContainer
        title="Batch detail"
        subtitle="Nested batch tree, linked items, provider labels and immutable audit trail."
        extra={
          <Inline gap="sm">
            <Button variant="outline">
              <Split aria-hidden="true" />
              Split
            </Button>
            <Button>
              <Boxes aria-hidden="true" />
              Merge / nest
            </Button>
          </Inline>
        }
      >
        <SplitPane
          aside={
            <Stack gap="md">
              <Card>
                <CardHeader banded>
                  <CardTitle>Allowed actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Stack gap="sm">
                    <Button variant="outline">Nest into parent</Button>
                    <Button variant="outline">Split batch</Button>
                    <Button variant="outline">Change slot</Button>
                  </Stack>
                </CardContent>
              </Card>
              <Card>
                <CardHeader banded>
                  <CardTitle>Audit preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Stack gap="sm">
                    <span>Batched by Sato at 10:18</span>
                    <span>Nested sub-batch B-1 at 10:42</span>
                    <span>Dispatch slot confirmed at 11:03</span>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          }
        >
          <Stack gap="md">
            <Card>
              <CardHeader banded>
                <CardTitle>Batch identity</CardTitle>
                <CardDescription>
                  Parent scan resolves all child batches and item count.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="md">
                  <Inline gap="sm">
                    <Badge icon={null} variant="secondary">REC-8801</Badge>
                    <Badge icon={null} variant="secondary">VND-ITM-7734-2108</Badge>
                    <Badge icon={null} variant="secondary">VND-AGT-7622-1048</Badge>
                  </Inline>
                  <Descriptions columns={2}>
                    <Descriptions.Item label="Customer">Nguyen Mai · CUST-0148</Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Badge status="scheduled">Slot confirmed</Badge>
                    </Descriptions.Item>
                    <Descriptions.Item label="Gross weight">8.34 kg</Descriptions.Item>
                    <Descriptions.Item label="Dimensions">48 x 36 x 31 cm</Descriptions.Item>
                    <Descriptions.Item label="Dispatch slot">Batch A · 27 May</Descriptions.Item>
                    <Descriptions.Item label="Lock state">
                      Editable until dispatch label printed
                    </Descriptions.Item>
                  </Descriptions>
                </Stack>
              </CardContent>
            </Card>
            <Card>
              <CardHeader banded>
                <CardTitle>Batch tree</CardTitle>
                <CardDescription>
                  Collapsible tree pattern for parent, child and nested batches.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TreeList items={treeItems} />
              </CardContent>
            </Card>
          </Stack>
        </SplitPane>
      </PageContainer>
    </PortalShell>
  );
}

function BookingDispatchLayout() {
  return (
    <PortalShell activeId="booking">
      <PageContainer
        title="Dispatch slots & fulfillment"
        subtitle="Assign batches to dispatch slots, then choose hub drop-off or provider shipping."
        extra={
          <Inline gap="sm">
            <Button variant="outline">Print batch list</Button>
            <Button>Confirm handover</Button>
          </Inline>
        }
      >
        <Tabs defaultValue="booking">
          <TabsList>
            <TabsTrigger value="booking">Dispatch slots</TabsTrigger>
            <TabsTrigger value="dispatch">Dispatch queue</TabsTrigger>
          </TabsList>
          <TabsContent value="booking">
            <Stack gap="md">
              <ResponsiveGrid columns={3}>
                <FlightSlot
                  lane="Batch A · Tokyo"
                  date="27 May · 08:30 cut-off"
                  load={72}
                  status="filling"
                />
                <FlightSlot
                  lane="Batch B · Osaka"
                  date="28 May · 16:00 cut-off"
                  load={41}
                  status="open"
                />
                <FlightSlot
                  lane="Batch C · Kyoto"
                  date="24 May · closed"
                  load={100}
                  status="closed"
                />
              </ResponsiveGrid>
              <Card>
                <CardHeader banded>
                  <CardTitle>Ready batches</CardTitle>
                  <CardAction>
                    <Button size="sm">Assign selected to Batch A</Button>
                  </CardAction>
                </CardHeader>
                <CardContent flush tight>
                  <DataTable
                    data={packages}
                    columns={packageColumns}
                    getRowId={(row) => row.id}
                    selectable
                    density="compact"
                  >
                    <DataTable.Content />
                  </DataTable>
                </CardContent>
              </Card>
            </Stack>
          </TabsContent>
          <TabsContent value="dispatch">
            <Card>
              <CardHeader banded>
                <CardTitle>Dispatch queue</CardTitle>
                <CardDescription>
                  Provider labels are distinct from vendor delivery codes.
                </CardDescription>
              </CardHeader>
              <CardContent flush tight>
                <DataTable
                  data={dispatchQueue}
                  columns={dispatchColumns}
                  getRowId={(row) => row.id}
                  density="compact"
                >
                  <DataTable.Toolbar>
                    <DataTable.DensityToggle />
                  </DataTable.Toolbar>
                  <DataTable.Content />
                </DataTable>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContainer>
    </PortalShell>
  );
}

function TrackingTimelineLayout() {
  const timeline: TimelineItem[] = [
    {
      title: "Order received",
      location: "Tokyo branch",
      time: "24 May 09:18",
      note: "Vendor code scanned and linked to customer.",
    },
    {
      title: "Added to batch",
      location: "Processing desk A",
      time: "24 May 10:20",
      note: "Internal batch ID assigned.",
    },
    {
      title: "Nested under parent batch",
      location: "Tokyo branch",
      time: "24 May 10:42",
      note: "Parent scan now resolves 3 child batches.",
    },
    {
      title: "Dispatch slot confirmed",
      location: "Batch A",
      time: "24 May 11:03",
      note: "Ready for dispatch-day drop-off.",
      current: true,
    },
  ];

  return (
    <PortalShell activeId="tracking">
      <PageContainer
        title="Universal order search"
        subtitle="Search by any code, then inspect timeline, batch tree and customer links."
        extra={<Button>Search</Button>}
      >
        <Stack gap="md">
          <Card>
            <CardContent solo>
              <Stack gap="sm">
                <SearchInput
                  defaultValue="VND-AGT-7622-1048"
                  placeholder="Internal ID / vendor code / provider ref"
                  ariaLabel="Universal order search"
                  onSearch={() => undefined}
                />
                <Inline gap="sm">
                  <Badge icon={null} variant="secondary">REC-8801</Badge>
                  <Badge icon={null} variant="secondary">VND-ITM-7734-2108</Badge>
                  <Badge icon={null} variant="secondary">VND-AGT-7622-1048</Badge>
                </Inline>
              </Stack>
            </CardContent>
          </Card>
          <SplitPane
            aside={
              <Card>
                <CardHeader banded>
                  <CardTitle>Linked context</CardTitle>
                </CardHeader>
                <CardContent>
                  <Descriptions columns={1}>
                    <Descriptions.Item label="Customer">Nguyen Mai</Descriptions.Item>
                    <Descriptions.Item label="Batch">Parent + 3 children</Descriptions.Item>
                    <Descriptions.Item label="Slot">Batch A · 27 May</Descriptions.Item>
                    <Descriptions.Item label="Dispatch">Provider label ready</Descriptions.Item>
                    <Descriptions.Item label="Current state">
                      <Badge status="scheduled">Booked</Badge>
                    </Descriptions.Item>
                  </Descriptions>
                </CardContent>
              </Card>
            }
          >
            <Card>
              <CardHeader banded>
                <CardTitle>Order timeline</CardTitle>
                <CardDescription>
                  Current location is derived from batch and order events.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Timeline items={timeline} />
              </CardContent>
            </Card>
          </SplitPane>
        </Stack>
      </PageContainer>
    </PortalShell>
  );
}

const meta = {
  title: "Screens/Admin Console",
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "desktop",
    },
    docs: {
      description: {
        component:
          "High-fidelity screen examples built only by composing godxjp-ui framework components. No screen-level Tailwind classes or inline layout styles.",
      },
    },
  },
} satisfies PreviewMeta;

export default meta;
type Story = PreviewCase;

export const Dashboard: Story = {
  name: "Dashboard · ops overview",
  render: () => <DashboardLayout />,
};

export const ReceivePack: Story = {
  name: "Journey A · receive and pack",
  render: () => <ReceivePackLayout />,
};

export const PackageDetailTree: Story = {
  name: "Packages · detail and tree",
  render: () => <PackageTreeLayout />,
};

export const BookingDispatch: Story = {
  name: "Journey B · book and send",
  render: () => <BookingDispatchLayout />,
};

export const TrackingSearch: Story = {
  name: "Journey C · tracking timeline",
  render: () => <TrackingTimelineLayout />,
};

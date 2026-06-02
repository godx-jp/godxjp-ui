import { Alert, AlertContent, AlertDescription, AlertTitle } from "@godxjp/ui/feedback";
import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  StatCard,
  CardTitle,
  DataTable,
  EmptyState,
  Badge,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import {
  Input,
  SearchInput,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Inline, PageContainer, ResponsiveGrid, SplitPane, Stack } from "@godxjp/ui/layout";
import {
  FilterBar,
  FilterGroup,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@godxjp/ui/navigation";

type Density = "compact" | "default" | "comfortable";

type Row = {
  id: string;
  customer: string;
  lane: string;
  status: "pending" | "scheduled" | "completed";
};

const rows: Row[] = [
  { id: "REC-8801", customer: "Nguyen Mai", lane: "Online", status: "pending" },
  { id: "REC-8802", customer: "Tran & Co.", lane: "In-store", status: "scheduled" },
  { id: "REC-8803", customer: "Bui Linh", lane: "Online", status: "completed" },
];

const columns: ColumnDef<Row>[] = [
  { key: "id", header: "Order Ref" },
  { key: "customer", header: "Customer" },
  { key: "lane", header: "Channel" },
  {
    key: "status",
    header: "Status",
    render: (row) => <Badge status={row.status} />,
  },
];

function DensityFrame({ density }: { density: Density }) {
  const tableDensity = density === "compact" ? "compact" : "comfortable";

  return (
    <PageContainer
      title={`${density} density`}
      subtitle="One primitive base token system: control height, section spacing, inline/stack gaps."
      density={density}
      extra={
        <Inline gap="sm">
          <Button variant="outline">Secondary</Button>
          <Button>Primary</Button>
        </Inline>
      }
    >
      <Stack gap="md">
        <ResponsiveGrid columns={4}>
          <StatCard label="Pending" value="128" delta={<Badge variant="secondary">+18</Badge>} />
          <StatCard label="Ready" value="42" delta={<Badge tone="success">8 booked</Badge>} />
          <StatCard label="Cut-off" value="15:40" hint="Section rhythm sample" />
          <StatCard label="Issues" value="7" delta={<Badge tone="destructive">check</Badge>} />
        </ResponsiveGrid>

        <SplitPane
          aside={
            <Stack gap="md">
              <Card>
                <CardHeader banded>
                  <CardTitle>Banded header</CardTitle>
                  <CardDescription>Muted band, same primitive inset as body.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Stack gap="sm">
                    <Input placeholder="Input height follows density" />
                    <SearchInput
                      ariaLabel="Search"
                      placeholder="Search input"
                      onSearch={() => undefined}
                    />
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Stack>
                </CardContent>
                <CardFooter separated>
                  <Button variant="outline">Cancel</Button>
                  <Button>Save</Button>
                </CardFooter>
              </Card>

              <Alert tone="warning">
                <AlertTitle>Warning rhythm</AlertTitle>
                <AlertContent>
                  <AlertDescription>
                    Alert spacing uses the same primitive section and inline tokens.
                  </AlertDescription>
                </AlertContent>
              </Alert>
            </Stack>
          }
        >
          <Stack gap="md">
            <Card>
              <CardHeader>
                <CardTitle>Plain header</CardTitle>
                <CardDescription>
                  Default card header uses the same primitive inset scale.
                </CardDescription>
                <CardAction>
                  <Button variant="outline" size="sm">
                    Action
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <FilterBar onClear={() => undefined}>
                  <FilterGroup label="Customer">
                    <Input placeholder="Name or code" />
                  </FilterGroup>
                  <FilterGroup label="Order Ref">
                    <SearchInput
                      ariaLabel="Order Ref"
                      placeholder="Search ref"
                      onSearch={() => undefined}
                    />
                  </FilterGroup>
                </FilterBar>
              </CardContent>
            </Card>

            <Card>
              <CardHeader banded>
                <CardTitle>Data table</CardTitle>
                <CardDescription>
                  Cells, toolbar and card chrome should read as one density.
                </CardDescription>
              </CardHeader>
              <CardContent flush tight>
                <DataTable
                  data={rows}
                  columns={columns}
                  getRowId={(row) => row.id}
                  density={tableDensity}
                >
                  <DataTable.Toolbar>
                    <span>3 rows</span>
                    <DataTable.DensityToggle />
                  </DataTable.Toolbar>
                  <DataTable.Content />
                </DataTable>
              </CardContent>
            </Card>

            <Tabs defaultValue="empty">
              <TabsList>
                <TabsTrigger value="empty">Empty</TabsTrigger>
                <TabsTrigger value="copy">Copy</TabsTrigger>
              </TabsList>
              <TabsContent value="empty">
                <Card>
                  <CardContent solo>
                    <EmptyState
                      title="No orders"
                      description="Empty state spacing follows base primitives."
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="copy">
                <Card>
                  <CardContent solo>
                    Body copy follows the same font and section rhythm.
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </Stack>
        </SplitPane>
      </Stack>
    </PageContainer>
  );
}

export default function Demo() {
  return (
    <div className="grid gap-8">
      <DensityFrame density="compact" />
      <DensityFrame density="default" />
      <DensityFrame density="comfortable" />
    </div>
  );
}

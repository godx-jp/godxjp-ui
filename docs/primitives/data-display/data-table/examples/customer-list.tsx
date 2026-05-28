import { Badge, DataTable, type ColumnDef } from "@godxjp/ui/data-display";

type Row = {
  id: string;
  customer: string;
  tier: "VIP" | "Standard";
  parcels: number;
};

const rows: Row[] = [
  { id: "CUS-1001", customer: "Nguyen Mai", tier: "VIP", parcels: 3 },
  { id: "CUS-1002", customer: "Tran Logistics", tier: "Standard", parcels: 1 },
  { id: "CUS-1003", customer: "Bui Linh", tier: "VIP", parcels: 12 },
];

const columns: ColumnDef<Row>[] = [
  { key: "id", header: "Customer ID" },
  { key: "customer", header: "Customer" },
  {
    key: "tier",
    header: "Tier",
    render: (row) => (
      <Badge variant={row.tier === "VIP" ? "success" : "secondary"}>{row.tier}</Badge>
    ),
  },
  { key: "parcels", header: "Parcels", align: "right" },
];

export default function Demo() {
  return <DataTable data={rows} columns={columns} getRowId={(row) => row.id} selectable />;
}

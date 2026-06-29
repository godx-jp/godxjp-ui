import { DataTable, Badge, Button } from "@godxjp/ui";

const columns = [
  { key: "name", header: "Employee" },
  { key: "dept", header: "Department" },
  { key: "hours", header: "Hours", align: "right" as const },
  {
    key: "status",
    header: "Status",
    align: "center" as const,
    render: (row: any) => (
      <Badge tone={row.status === "Approved" ? "success" : row.status === "Pending" ? "warning" : "neutral"}>
        {row.status}
      </Badge>
    ),
  },
  {
    key: "act",
    header: "",
    align: "right" as const,
    render: () => <Button size="xs" variant="ghost">Edit</Button>,
  },
];

const data = [
  { id: "1", name: "Tanaka Yuki", dept: "Operations", hours: "162.0", status: "Approved" },
  { id: "2", name: "Suzuki Hana", dept: "Human Resources", hours: "158.5", status: "Pending" },
  { id: "3", name: "Yamamoto Ken", dept: "Engineering", hours: "171.0", status: "Approved" },
  { id: "4", name: "Sato Mei", dept: "Sales", hours: "140.0", status: "Draft" },
];

export function Basic() {
  return (
    <div style={{ maxWidth: 640 }}>
      <DataTable columns={columns} data={data} getRowId={(r: any) => r.id} striped />
    </div>
  );
}

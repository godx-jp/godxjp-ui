import type { ColumnDef } from "@godxjp/ui/data-display";

export type Row = {
  id: string;
  customer: string;
  status: "pending" | "completed" | "failed";
};

export const rows: Row[] = [
  { id: "ORD-1001", customer: "Nguyen Mai", status: "pending" },
  { id: "ORD-1002", customer: "Tran Retail Co.", status: "completed" },
  { id: "ORD-1003", customer: "Bui Linh", status: "failed" },
];

export const columns: ColumnDef<Row>[] = [
  { key: "id", header: "ID" },
  { key: "customer", header: "Customer" },
  { key: "status", header: "Status" },
];

import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui/data-display";

const rows = [
  { hawb: "ORD-00991", customer: "Nguyen Mai", parcels: 3, status: "Ready" },
  { hawb: "ORD-00988", customer: "Tanaka Yuki", parcels: 1, status: "Review" },
  { hawb: "ORD-00972", customer: "Pham Minh Duc", parcels: 12, status: "Ready" },
];

export default function Demo() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order Ref</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.hawb}>
            <TableCell className="font-mono text-sm">{row.hawb}</TableCell>
            <TableCell>{row.customer}</TableCell>
            <TableCell>{row.parcels}</TableCell>
            <TableCell>
              <Badge variant={row.status === "Ready" ? "success" : "warning"}>{row.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

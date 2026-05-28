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
  { id: "ORD-00991", status: "Ready", tone: "success" as const },
  { id: "ORD-00988", status: "Review", tone: "warning" as const },
  { id: "ORD-00972", status: "Blocked", tone: "destructive" as const },
];

export default function Demo() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order Ref</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-mono text-sm">{row.id}</TableCell>
            <TableCell>
              <Badge variant={row.tone}>{row.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

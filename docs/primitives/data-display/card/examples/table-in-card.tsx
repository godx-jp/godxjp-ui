import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";

const shipments = [
  { id: "1", hawb: "REF-123456789", customer: "Nguyễn A", status: "in_transit" as const },
  { id: "2", hawb: "REF-987654321", customer: "Tanaka B", status: "delivered" as const },
  { id: "3", hawb: "REF-555666777", customer: "Lê C", status: "pending" as const },
];

export default function Demo() {
  return (
    <Card className="max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lô đơn hàng hôm nay</CardTitle>
        <CardAction>
          <Button size="sm" variant="outline">
            Export CSV
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent flush tight>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ui-card-inset-x">Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="ui-card-inset-x font-mono text-xs">
                  {s.hawb.slice(-8)}
                </TableCell>
                <TableCell>{s.customer}</TableCell>
                <TableCell>
                  <StatusBadge status={s.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter separated className="text-muted-foreground justify-end text-xs">
        3 / {shipments.length} đơn hàng
      </CardFooter>
    </Card>
  );
}

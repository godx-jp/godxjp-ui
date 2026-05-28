import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  KeyValueGrid,
  StatusBadge,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Inline } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <Card className="max-w-xl">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="font-mono">REF-00991</CardTitle>
          <CardDescription>Batch REC-8801 · Acme Inc</CardDescription>
        </div>
        <StatusBadge status="pending" label="Review pending" />
      </CardHeader>
      <CardContent>
        <KeyValueGrid columns={2}>
          <KeyValueGrid.Item label="From">Osaka Store</KeyValueGrid.Item>
          <KeyValueGrid.Item label="To">Customer</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Order Date">2026-05-24 09:30 JST</KeyValueGrid.Item>
          <KeyValueGrid.Item label="ETA">2026-05-24 14:10 ICT</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Category" span={2}>
            Apparel, accessories, books — no restricted items.
          </KeyValueGrid.Item>
        </KeyValueGrid>
      </CardContent>
      <CardFooter separated className="justify-between">
        <Button variant="ghost" size="sm">
          Lịch sử audit
        </Button>
        <Inline gap="sm">
          <Button variant="outline" size="sm">
            In nhãn
          </Button>
          <Button size="sm">Xác nhận đơn</Button>
        </Inline>
      </CardFooter>
    </Card>
  );
}

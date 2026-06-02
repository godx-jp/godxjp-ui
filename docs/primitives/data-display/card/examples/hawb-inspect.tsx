import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Descriptions,
  Badge,
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
        <Badge status="pending">Review pending</Badge>
      </CardHeader>
      <CardContent>
        <Descriptions columns={2}>
          <Descriptions.Item label="From">Osaka Store</Descriptions.Item>
          <Descriptions.Item label="To">Customer</Descriptions.Item>
          <Descriptions.Item label="Order Date">2026-05-24 09:30 JST</Descriptions.Item>
          <Descriptions.Item label="ETA">2026-05-24 14:10 ICT</Descriptions.Item>
          <Descriptions.Item label="Category" span={2}>
            Apparel, accessories, books — no restricted items.
          </Descriptions.Item>
        </Descriptions>
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

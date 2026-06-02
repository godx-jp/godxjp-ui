import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Descriptions,
  Badge,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";

export default function Demo() {
  return (
    <Card className="max-w-2xl">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>REC-8801</CardTitle>
          <CardDescription>Consolidated order · Tokyo → Ho Chi Minh</CardDescription>
        </div>
        <CardAction>
          <Badge status="in_transit">In transit</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Descriptions columns={2}>
          <Descriptions.Item label="Vendor">Yamato Logistics</Descriptions.Item>
          <Descriptions.Item label="Service">Express shipping</Descriptions.Item>
          <Descriptions.Item label="Order value">¥842,000</Descriptions.Item>
          <Descriptions.Item label="Items">18 items · 64.5 kg</Descriptions.Item>
          <Descriptions.Item label="Ship to" span={2}>
            District 1, Ho Chi Minh City, Vietnam
          </Descriptions.Item>
        </Descriptions>
      </CardContent>
      <CardFooter separated className="justify-end gap-2">
        <Button variant="outline" size="sm">
          Print label
        </Button>
        <Button size="sm">Update status</Button>
      </CardFooter>
    </Card>
  );
}

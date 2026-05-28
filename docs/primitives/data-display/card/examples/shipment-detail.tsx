import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  KeyValueGrid,
  StatusBadge,
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
          <StatusBadge status="in_transit" label="In transit" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <KeyValueGrid columns={2}>
          <KeyValueGrid.Item label="Vendor">Yamato Logistics</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Service">Express shipping</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Order value">¥842,000</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Items">18 items · 64.5 kg</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Ship to" span={2}>
            District 1, Ho Chi Minh City, Vietnam
          </KeyValueGrid.Item>
        </KeyValueGrid>
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

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Descriptions,
  Badge,
} from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Order</CardTitle>
        </CardHeader>
        <CardContent>
          <Descriptions columns={1}>
            <Descriptions.Item label="Order Ref" mono>
              REF-00991
            </Descriptions.Item>
            <Descriptions.Item label="Location">Osaka Store to Customer</Descriptions.Item>
          </Descriptions>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Internal Note</CardTitle>
        </CardHeader>
        <CardContent>
          <Descriptions columns={1}>
            <Descriptions.Item label="Status">
              <Badge status="pending">Pending</Badge>
            </Descriptions.Item>
            <Descriptions.Item label="Category">Apparel, accessories, books</Descriptions.Item>
          </Descriptions>
        </CardContent>
      </Card>
    </div>
  );
}

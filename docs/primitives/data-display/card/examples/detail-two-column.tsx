import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  KeyValueGrid,
  StatusBadge,
} from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Order</CardTitle>
        </CardHeader>
        <CardContent>
          <KeyValueGrid columns={1}>
            <KeyValueGrid.Item label="Order Ref" mono>
              REF-00991
            </KeyValueGrid.Item>
            <KeyValueGrid.Item label="Location">Osaka Store to Customer</KeyValueGrid.Item>
          </KeyValueGrid>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Internal Note</CardTitle>
        </CardHeader>
        <CardContent>
          <KeyValueGrid columns={1}>
            <KeyValueGrid.Item label="Status">
              <StatusBadge status="pending" label="Pending" />
            </KeyValueGrid.Item>
            <KeyValueGrid.Item label="Category">Apparel, accessories, books</KeyValueGrid.Item>
          </KeyValueGrid>
        </CardContent>
      </Card>
    </div>
  );
}

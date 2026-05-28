import { KeyValueGrid, StatusBadge } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <KeyValueGrid columns={2}>
      <KeyValueGrid.Item label="Order Ref" mono>
        REF-00991
      </KeyValueGrid.Item>
      <KeyValueGrid.Item label="Customer">Nguyen Mai</KeyValueGrid.Item>
      <KeyValueGrid.Item label="Location">Ho Chi Minh City</KeyValueGrid.Item>
      <KeyValueGrid.Item label="Status">
        <StatusBadge status="pending" />
      </KeyValueGrid.Item>
      <KeyValueGrid.Item label="Notes" span={2}>
        Billing address differs from registered profile; confirm before processing.
      </KeyValueGrid.Item>
    </KeyValueGrid>
  );
}

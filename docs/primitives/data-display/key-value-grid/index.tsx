import { KeyValueGrid } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <KeyValueGrid columns={2}>
      <KeyValueGrid.Item label="Order Ref" mono>
        REC-8801
      </KeyValueGrid.Item>
      <KeyValueGrid.Item label="Status">Ready to ship</KeyValueGrid.Item>
      <KeyValueGrid.Item label="Location">Osaka Branch</KeyValueGrid.Item>
      <KeyValueGrid.Item label="Order value">¥842,000</KeyValueGrid.Item>
      <KeyValueGrid.Item label="Notes" span={2}>
        Billing address differs from registered profile; confirm before processing.
      </KeyValueGrid.Item>
    </KeyValueGrid>
  );
}

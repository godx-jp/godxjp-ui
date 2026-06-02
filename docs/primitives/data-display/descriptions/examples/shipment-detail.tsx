import { Descriptions, Badge } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <Descriptions columns={2}>
      <Descriptions.Item label="Order Ref" mono>
        REF-00991
      </Descriptions.Item>
      <Descriptions.Item label="Customer">Nguyen Mai</Descriptions.Item>
      <Descriptions.Item label="Location">Ho Chi Minh City</Descriptions.Item>
      <Descriptions.Item label="Status">
        <Badge status="pending" />
      </Descriptions.Item>
      <Descriptions.Item label="Notes" span={2}>
        Billing address differs from registered profile; confirm before processing.
      </Descriptions.Item>
    </Descriptions>
  );
}

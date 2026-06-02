import { Descriptions } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <Descriptions columns={2}>
      <Descriptions.Item label="Order Ref" mono>
        REC-8801
      </Descriptions.Item>
      <Descriptions.Item label="Status">Ready to ship</Descriptions.Item>
      <Descriptions.Item label="Location">Osaka Branch</Descriptions.Item>
      <Descriptions.Item label="Order value">¥842,000</Descriptions.Item>
      <Descriptions.Item label="Notes" span={2}>
        Billing address differs from registered profile; confirm before processing.
      </Descriptions.Item>
    </Descriptions>
  );
}

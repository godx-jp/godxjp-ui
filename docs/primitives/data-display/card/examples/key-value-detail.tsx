import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Descriptions,
} from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Thông tin khách</CardTitle>
        <CardDescription>CUS-2026-1182</CardDescription>
      </CardHeader>
      <CardContent>
        <Descriptions columns={2}>
          <Descriptions.Item label="Họ tên">Nguyễn Minh Anh</Descriptions.Item>
          <Descriptions.Item label="Email">minh.anh@example.com</Descriptions.Item>
          <Descriptions.Item label="Điện thoại">+84 901 234 567</Descriptions.Item>
          <Descriptions.Item label="Tổng chi tiêu">¥842,000</Descriptions.Item>
          <Descriptions.Item label="Ghi chú CS" span={2}>
            VIP buyer, ưu tiên consolidate cuối tuần.
          </Descriptions.Item>
        </Descriptions>
      </CardContent>
    </Card>
  );
}

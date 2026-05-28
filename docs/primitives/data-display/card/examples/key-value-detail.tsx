import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  KeyValueGrid,
} from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Thông tin khách</CardTitle>
        <CardDescription>CUS-2026-1182</CardDescription>
      </CardHeader>
      <CardContent>
        <KeyValueGrid columns={2}>
          <KeyValueGrid.Item label="Họ tên">Nguyễn Minh Anh</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Email">minh.anh@example.com</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Điện thoại">+84 901 234 567</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Tổng chi tiêu">¥842,000</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Ghi chú CS" span={2}>
            VIP buyer, ưu tiên consolidate cuối tuần.
          </KeyValueGrid.Item>
        </KeyValueGrid>
      </CardContent>
    </Card>
  );
}

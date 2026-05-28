import type { PreviewMeta, PreviewCase } from "../preview-types";
import { Inline } from "../../src/components/layout/inline";
import { Stack } from "../../src/components/layout/stack";
import { StatusBadge } from "../../src/components/data-display/status-badge";
import { Badge } from "../../src/components/data-display/badge";
import { Card, CardContent } from "../../src/components/data-display/card";

const shipments: Array<{
  hawb: string;
  customer: string;
  weight: string;
  status: string;
}> = [
  {
    hawb: "REF-00991",
    customer: "Nguyễn Thị Mai",
    weight: "2.4 kg · 3 món",
    status: "pending",
  },
  {
    hawb: "REF-00988",
    customer: "Tanaka Yuki",
    weight: "0.8 kg · 1 món",
    status: "pending",
  },
  {
    hawb: "REF-00972",
    customer: "Phạm Minh Đức",
    weight: "18.2 kg · 12 món",
    status: "sending",
  },
];

const meta: PreviewMeta<typeof Stack> = {
  title: "Layout/Stack",
  component: Stack,
  tags: ["autodocs"],
  argTypes: {
    gap: { control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
  },
};

export default meta;
type Story = PreviewCase<typeof Stack>;

export const ShipmentQueue: Story = {
  name: "Hàng đợi đơn hàng — Osaka",
  render: () => (
    <Stack gap="sm" className="w-[min(100%,42rem)]">
      <Inline gap="sm" className="justify-between text-sm">
        <span className="font-medium">Chờ xử lý · Cut-off 11:00 JST</span>
        <Badge variant="secondary">23 đơn</Badge>
      </Inline>
      {shipments.map((shipment) => (
        <Card key={shipment.hawb} size="compact">
          <CardContent solo>
            <div className="grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-4 text-sm">
              <Stack gap="xs">
                <span className="text-muted-foreground truncate font-mono text-xs">
                  {shipment.hawb}
                </span>
                <span>{shipment.customer}</span>
              </Stack>
              <Stack gap="xs" className="items-end text-right">
                <span className="text-muted-foreground">{shipment.weight}</span>
                <StatusBadge status={shipment.status} />
              </Stack>
            </div>
          </CardContent>
        </Card>
      ))}
    </Stack>
  ),
};

export const FormSections: Story = {
  name: "Form — các section xếp dọc",
  render: () => (
    <Stack gap="lg" className="max-w-md text-sm">
      <Stack gap="xs">
        <p className="font-medium">Thông tin liên hệ</p>
        <p className="text-muted-foreground">Email, SĐT, mã liên hệ…</p>
      </Stack>
      <Stack gap="xs">
        <p className="font-medium">Địa chỉ giao hàng</p>
        <p className="text-muted-foreground">Quận 1, TP. HCM</p>
      </Stack>
      <Stack gap="xs">
        <p className="font-medium">Ghi chú nội bộ</p>
        <p className="text-muted-foreground">Khách VIP — đặt hàng theo lô cuối tuần</p>
      </Stack>
    </Stack>
  ),
};

import type { PreviewMeta, PreviewCase } from "../preview-types";
import { Inline } from "../../src/components/layout/inline";
import { Button } from "../../src/components/general/button";
import { Badge } from "../../src/components/data-display/badge";

const meta: PreviewMeta<typeof Inline> = {
  title: "Layout/Inline",
  component: Inline,
  tags: ["autodocs"],
  argTypes: {
    gap: { control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
  },
};

export default meta;
type Story = PreviewCase<typeof Inline>;

export const PageHeaderActions: Story = {
  name: "PageContainer extra — actions",
  render: () => (
    <Inline gap="sm">
      <Button variant="outline" size="sm">
        Xuất CSV
      </Button>
      <Button variant="outline" size="sm">
        Gửi email
      </Button>
      <Button size="sm">Tạo đơn hàng</Button>
    </Inline>
  ),
};

export const OrderMetaRow: Story = {
  name: "Metadata đơn hàng",
  render: () => (
    <Inline gap="sm" className="flex-wrap items-center text-sm">
      <span className="font-mono text-xs">ORD-2026-8842</span>
      <Badge status="sending" />
      <Badge variant="outline">Osaka → HCM</Badge>
      <Badge variant="secondary">2.4 kg</Badge>
      <span className="text-muted-foreground">Cập nhật 14:32 JST</span>
    </Inline>
  ),
};

export const FilterChips: Story = {
  name: "Active filter chips",
  render: () => (
    <Inline gap="xs" className="flex-wrap">
      <Badge variant="secondary">Kênh: Website</Badge>
      <Badge variant="secondary">Tag: VIP</Badge>
      <Badge variant="secondary">Trạng thái: Active</Badge>
      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
        Xóa tất cả
      </Button>
    </Inline>
  ),
};

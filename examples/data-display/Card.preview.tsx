import { Download, Inbox, Wrench } from "lucide-react";

import type { PreviewMeta, PreviewCase } from "../preview-types";
import { Badge } from "../../src/components/data-display/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardCover,
  CardDescription,
  CardFooter,
  CardHeader,
  StatCard,
  CardTitle,
} from "../../src/components/data-display/card";
import { EmptyState } from "../../src/components/data-display/empty-state";
import { Descriptions } from "../../src/components/data-display/descriptions";
import { Progress } from "../../src/components/data-display/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../src/components/data-display/table";
import { Timeline, type TimelineItem } from "../../src/components/data-display/timeline";
import { Button } from "../../src/components/general/button";
import { Inline } from "../../src/components/layout/inline";
import { ResponsiveGrid } from "../../src/components/layout/responsive-grid";
import { Stack } from "../../src/components/layout/stack";

const meta: PreviewMeta<typeof Card> = {
  title: "Data display/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "muted", "outline", "featured"] },
    accent: {
      control: "select",
      options: ["primary", "success", "warning", "info", "attention", "destructive"],
    },
    density: { control: "select", options: ["tight", "cozy"] },
    size: { control: "select", options: ["default", "compact"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Một atom .card (viền 1px · bo 6px · phẳng, không đổ bóng) — biến thể chỉ qua mật độ padding (density), nền (variant), viền accent semantic, và header/footer. Composed bằng primitive godxjp-ui, không màu tự chế.",
      },
    },
  },
};

export default meta;
type Story = PreviewCase<typeof Card>;

/* ── Primitive: surface fills ─────────────────────────────────────────── */
export const Surfaces: Story = {
  name: "Biến thể nền — default · muted · outline · featured",
  render: () => (
    <ResponsiveGrid columns={4}>
      <Card>
        <CardContent solo>
          <Stack gap="xs">
            <CardTitle>Default</CardTitle>
            <CardDescription>Nền card, viền 1px, phẳng.</CardDescription>
          </Stack>
        </CardContent>
      </Card>
      <Card variant="muted">
        <CardContent solo>
          <Stack gap="xs">
            <CardTitle>Muted</CardTitle>
            <CardDescription>Nền secondary cho khối phụ.</CardDescription>
          </Stack>
        </CardContent>
      </Card>
      <Card variant="outline">
        <CardContent solo>
          <Stack gap="xs">
            <CardTitle>Outline</CardTitle>
            <CardDescription>Nền trong suốt, chỉ viền.</CardDescription>
          </Stack>
        </CardContent>
      </Card>
      <Card variant="featured">
        <CardContent solo>
          <Stack gap="xs">
            <CardTitle>Featured</CardTitle>
            <CardDescription>Viền primary + ring nhấn mạnh.</CardDescription>
          </Stack>
        </CardContent>
      </Card>
    </ResponsiveGrid>
  ),
};

/* ── Primitive: padding density ───────────────────────────────────────── */
export const Density: Story = {
  name: "Mật độ padding — tight 12 · base 16 · cozy 20",
  render: () => (
    <ResponsiveGrid columns={3}>
      <Card density="tight">
        <CardContent solo>
          <Stack gap="xs">
            <CardTitle>Tight</CardTitle>
            <CardDescription>padding 12px — bảng, danh sách dày.</CardDescription>
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent solo>
          <Stack gap="xs">
            <CardTitle>Base</CardTitle>
            <CardDescription>padding 16px — mặc định.</CardDescription>
          </Stack>
        </CardContent>
      </Card>
      <Card density="cozy">
        <CardContent solo>
          <Stack gap="xs">
            <CardTitle>Cozy</CardTitle>
            <CardDescription>padding 20px — card nổi bật.</CardDescription>
          </Stack>
        </CardContent>
      </Card>
    </ResponsiveGrid>
  ),
};

/* ── Primitive: semantic accent edge ──────────────────────────────────── */
const accents = [
  { accent: "primary", title: "Thông tin chính", body: "Viền primary cho mục mặc định." },
  { accent: "info", title: "Ghi chú", body: "Thông tin trung tính, không khẩn." },
  { accent: "success", title: "Hoàn tất", body: "Tác vụ đã chạy thành công." },
  { accent: "warning", title: "Cần chú ý", body: "Sắp chạm ngưỡng giới hạn." },
  { accent: "attention", title: "Khẩn", body: "Cần thao tác trong hôm nay." },
  { accent: "destructive", title: "Lỗi", body: "Có ngoại lệ cần kiểm tra." },
] as const;

export const AccentEdges: Story = {
  name: "Viền accent — sọc trái semantic",
  render: () => (
    <ResponsiveGrid columns={2}>
      {accents.map((item) => (
        <Card key={item.accent} accent={item.accent}>
          <CardContent solo>
            <Stack gap="xs">
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.body}</CardDescription>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </ResponsiveGrid>
  ),
};

/* ── A · Data display ─────────────────────────────────────────────────── */
export const StatKpis: Story = {
  name: "A · KPI stat",
  render: () => (
    <ResponsiveGrid columns={3}>
      <StatCard
        label="Đơn chờ xử lý"
        value="128"
        delta={<Badge variant="secondary">+18 hôm nay</Badge>}
      />
      <StatCard
        label="Đã hoàn tất"
        value="42"
        hint="8 đơn mới trong ngày"
        delta={<Badge variant="success">+8</Badge>}
      />
      <StatCard
        label="Ngoại lệ"
        value="7"
        delta={<Badge variant="destructive">cần kiểm tra</Badge>}
      />
    </ResponsiveGrid>
  ),
};

export const SummaryAndQuota: Story = {
  name: "A · Datalist + quota",
  render: () => (
    <ResponsiveGrid columns={2}>
      <Card>
        <CardHeader banded>
          <CardTitle>Tổng kết tháng 5</CardTitle>
        </CardHeader>
        <CardContent>
          <Descriptions columns={1}>
            <Descriptions.Item label="Đơn hàng nhận">1,284</Descriptions.Item>
            <Descriptions.Item label="Đã xử lý">1,116</Descriptions.Item>
            <Descriptions.Item label="Đã giao hàng">842</Descriptions.Item>
            <Descriptions.Item label="Ngoại lệ">12</Descriptions.Item>
          </Descriptions>
        </CardContent>
      </Card>
      <Card>
        <CardHeader banded>
          <CardTitle>Dung lượng lưu trữ</CardTitle>
          <CardAction>
            <Badge variant="warning">85%</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Stack gap="sm">
            <Progress value={85} tone="warning" label="42.8 / 50 GB đã dùng" />
            <CardDescription>Còn 7.2 GB · cân nhắc nâng gói lưu trữ.</CardDescription>
          </Stack>
        </CardContent>
      </Card>
    </ResponsiveGrid>
  ),
};

const storeRows = [
  { rank: "01", name: "Shibuya", revenue: "¥ 4,820,500", yoy: "+12.4%", up: true },
  { rank: "02", name: "Omotesando", revenue: "¥ 3,142,800", yoy: "+8.1%", up: true },
  { rank: "03", name: "Jiyugaoka", revenue: "¥ 2,890,300", yoy: "−3.2%", up: false },
  { rank: "04", name: "Shinjuku", revenue: "¥ 2,104,200", yoy: "±0.0%", up: true },
];

export const TableCard: Story = {
  name: "A · Inline table (flush)",
  render: () => (
    <Card>
      <CardHeader banded>
        <CardTitle>Doanh thu theo cửa hàng</CardTitle>
        <CardDescription>1 — 17 tháng 5</CardDescription>
      </CardHeader>
      <CardContent flush tight>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cửa hàng</TableHead>
              <TableHead className="text-right">Doanh thu</TableHead>
              <TableHead className="text-right">YoY</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storeRows.map((row) => (
              <TableRow key={row.rank}>
                <TableCell>
                  <span className="text-muted-foreground">{row.rank}</span> {row.name}
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.revenue}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={row.up ? "success" : "destructive"}>{row.yoy}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter separated>
        <Button variant="outline" size="sm">
          Xem tất cả cửa hàng (12)
        </Button>
      </CardFooter>
    </Card>
  ),
};

/* ── C · Content & commerce ───────────────────────────────────────────── */
export const ContentCards: Story = {
  name: "C · Article · product · document",
  render: () => (
    <ResponsiveGrid columns={3}>
      <Card>
        <CardCover>
          <div className="bg-secondary text-muted-foreground flex aspect-video w-full items-center justify-center font-mono text-xs">
            1280 × 720
          </div>
        </CardCover>
        <CardContent>
          <Stack gap="xs">
            <Inline gap="xs" className="items-center">
              <Badge variant="outline">Thông báo</Badge>
              <span className="text-muted-foreground text-xs">2026/05/14</span>
            </Inline>
            <CardTitle>Tính năng mới tháng 6 và hướng dẫn chuyển đổi</CardTitle>
            <CardDescription>
              Tự động tối ưu ca làm và liên kết tồn kho đa cửa hàng.
            </CardDescription>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardCover>
          <div className="bg-secondary text-muted-foreground flex aspect-square w-full items-center justify-center font-mono text-xs">
            800 × 800
          </div>
        </CardCover>
        <CardContent>
          <Stack gap="xs">
            <span className="text-muted-foreground text-xs">Hải sản · Sushi</span>
            <CardTitle>Sashimi cá ngừ tuyển chọn — 6 miếng</CardTitle>
            <Inline gap="xs" className="items-baseline">
              <span className="text-lg font-semibold tabular-nums">¥ 2,480</span>
              <span className="text-muted-foreground text-xs line-through">¥ 2,980</span>
              <Badge variant="warning" className="ml-auto">
                -17%
              </Badge>
            </Inline>
            <Button size="sm" className="w-full">
              Thêm vào giỏ
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card accent="destructive">
        <CardContent solo>
          <Stack gap="xs">
            <CardTitle>就業規則_2026年版.pdf</CardTitle>
            <CardDescription>2.4 MB · 24 trang</CardDescription>
          </Stack>
        </CardContent>
        <CardFooter separated>
          <Button variant="outline" size="sm">
            <Download aria-hidden="true" />
            Tải xuống
          </Button>
        </CardFooter>
      </Card>
    </ResponsiveGrid>
  ),
};

/* ── D / F · Workflow & timeline ──────────────────────────────────────── */
const trackingTimeline: TimelineItem[] = [
  { title: "Đơn hàng tạo", location: "Chi nhánh Tokyo", time: "24/5 09:18" },
  { title: "Xác nhận thanh toán", location: "Hệ thống", time: "24/5 10:20" },
  { title: "Đã giao nhà cung cấp", location: "Chi nhánh Tokyo", time: "24/5 10:42" },
  { title: "Đang giao hàng", location: "Tokyo → HCM", time: "24/5 11:03", current: true },
];

export const WorkflowAndTimeline: Story = {
  name: "D/F · Approval + timeline",
  render: () => (
    <ResponsiveGrid columns={2}>
      <Card>
        <CardHeader banded>
          <CardTitle>Phê duyệt nghỉ phép</CardTitle>
          <CardDescription>Yêu cầu #4821 · Nguyễn Lan</CardDescription>
        </CardHeader>
        <CardContent>
          <Descriptions columns={1}>
            <Descriptions.Item label="Loại">Nghỉ phép năm</Descriptions.Item>
            <Descriptions.Item label="Thời gian">28/5 — 30/5 (3 ngày)</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Badge status="pending" icon={null}>Chờ duyệt</Badge>
            </Descriptions.Item>
          </Descriptions>
        </CardContent>
        <CardFooter separated>
          <Button variant="outline" size="sm">
            Từ chối
          </Button>
          <Button size="sm">Duyệt</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader banded>
          <CardTitle>Tiến trình đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline items={trackingTimeline} />
        </CardContent>
      </Card>
    </ResponsiveGrid>
  ),
};

/* ── E · Feedback / empty ─────────────────────────────────────────────── */
export const FeedbackStates: Story = {
  name: "E · Empty + notice",
  render: () => (
    <ResponsiveGrid columns={2}>
      <Card>
        <CardContent solo>
          <EmptyState
            icon={Inbox}
            title="Chưa có đơn hàng"
            description="Tạo đơn mới hoặc nhập danh sách để bắt đầu."
            action={<Button size="sm">Tạo đơn hàng</Button>}
          />
        </CardContent>
      </Card>
      <Card accent="info">
        <CardContent solo>
          <Inline gap="sm" className="items-start">
            <Wrench aria-hidden="true" className="text-info mt-0.5 size-4" />
            <Stack gap="xs">
              <CardTitle>Bảo trì hệ thống</CardTitle>
              <CardDescription>
                02:00 — 04:00 JST ngày 28/5. Dịch vụ có thể gián đoạn.
              </CardDescription>
            </Stack>
          </Inline>
        </CardContent>
      </Card>
    </ResponsiveGrid>
  ),
};

/* ── H · Header treatments ────────────────────────────────────────────── */
export const Headers: Story = {
  name: "H · Header treatments",
  render: () => (
    <Stack gap="md">
      <Card>
        <CardHeader>
          <CardTitle>Plain header (không band)</CardTitle>
          <CardDescription>Tiêu đề + mô tả, không nền ngăn cách.</CardDescription>
        </CardHeader>
        <CardContent>
          <CardDescription>Nội dung card.</CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader banded>
          <CardTitle>Banded header</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>Header có nền muted + đường kẻ dưới.</CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader banded>
          <CardTitle>Header + action</CardTitle>
          <CardDescription>Tiêu đề kèm nút thao tác bên phải.</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm">
              Xuất CSV
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardDescription>Nội dung card.</CardDescription>
        </CardContent>
      </Card>
    </Stack>
  ),
};

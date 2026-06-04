/**
 * Showcase · case1 — Warehouse Dashboard (Tổng quan kho)
 *
 * A full standalone admin/勤怠 dashboard page, served at `/showcase/case1-warehouse-dashboard`.
 * Built ENTIRELY from real @godxjp/ui primitives — the dxs-kintai design handoff
 * recreated as a "skeleton" (intent + look), not a transcription of its prototype DOM.
 *
 * Composition map (prototype block → @godxjp/ui primitive):
 *   page chrome ............ AppShell + Sidebar + Topbar
 *   page header + actions .. PageContainer (extra slot) + Button
 *   KPI row ................ ResponsiveGrid + StatCard
 *   "Cần xử lý" queue ...... Card + rows + Badge(tone) + Button
 *   "Hoạt động" feed ....... Card + Timeline
 *   capacity heatmap ....... Card + Progress (per zone) — no hand-rolled heat divs
 *   recent shipments ....... Card + Table + Badge(tone)
 *
 * DNA applied: compact density, small headings, fixed color signaling
 * (success 若竹 / warning 山吹 / attention 朱 / danger 茜), tabular numerics,
 * quiet factual copy, no emoji.
 */
import * as React from "react";
import {
  AlertTriangle,
  Box,
  LayoutDashboard,
  type LucideIcon,
  Package,
  RefreshCw,
  Download,
  ReceiptText,
  Smartphone,
  Truck,
  Boxes,
  MapPin,
  Tags,
} from "lucide-react";

import { Button } from "@godxjp/ui/general";
import {
  Badge,
  type BadgeProps,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Timeline,
  type TimelineItem,
} from "@godxjp/ui/data-display";

/** Badge tone vocabulary (not re-exported by name — derive from BadgeProps). */
type BadgeTone = NonNullable<BadgeProps["tone"]>;
import {
  AppShell,
  Flex,
  PageContainer,
  ResponsiveGrid,
  Sidebar,
  type SidebarSectionProp,
} from "@godxjp/ui/layout";

// ── Mock data (lifted from the design's admin/data.jsx) ───────────────────────

const KPIS: Array<{ label: string; value: number; delta: string; inverse?: boolean }> = [
  // `inverse` flips delta semantics where a rise is bad (more backlog = worse).
  { label: "Item chưa phân loại", value: 9, delta: "+3 trong 2h qua", inverse: true },
  { label: "Kiện đang mở", value: 5, delta: "12 item chưa gán" },
  { label: "Hóa đơn đang chờ", value: 3, delta: "-1 đã thanh toán", inverse: true },
  { label: "Chuyến hàng tuần này", value: 8, delta: "+2 vs tuần trước" },
];

type QueueTone = Extract<BadgeTone, "warning" | "destructive" | "info" | "muted">;

const QUEUE: Array<{
  icon: LucideIcon;
  tone: QueueTone;
  title: string;
  meta: string;
  action: string;
}> = [
  {
    icon: Smartphone,
    tone: "warning",
    title: "2 thiết bị đang chờ duyệt",
    meta: "Phạm Văn C · iPhone 13 mini · 14:12 · cách đây 30 phút",
    action: "Mở danh sách",
  },
  {
    icon: AlertTriangle,
    tone: "destructive",
    title: "Hoá đơn INV-2080 trễ 4 ngày",
    meta: "Lê Hùng · ZOZOTOWN · 9.800¥ · 2 line item",
    action: "Xem hóa đơn",
  },
  {
    icon: Tags,
    tone: "warning",
    title: "9 item chưa phân loại",
    meta: "2 cái > 24 giờ chưa lên giá · ưu tiên xếp",
    action: "Xem item",
  },
  {
    icon: Box,
    tone: "info",
    title: "PKG-000038 sẵn sàng tạo chuyến",
    meta: "Bùi Hà · Hà Nội · 8 item · 2,8kg · đã đóng từ hôm qua",
    action: "Tạo chuyến",
  },
];

const ACTIVITY: TimelineItem[] = [
  { title: "Nguyễn Văn A đã đóng kiện PKG-000040", time: "Hôm nay · 10:15", current: true },
  { title: "Trần Thị B đã thêm 3 item vào PKG-000042", time: "Hôm nay · 10:08" },
  { title: "Hoá đơn INV-2080 trễ 4 ngày", time: "Hôm nay · 09:42" },
  { title: "Phạm Văn C yêu cầu duyệt iPhone 13 mini", time: "Hôm qua · 14:12" },
  { title: "Nguyễn Văn A đã nhập kho INV-2089 (1 item)", time: "Hôm qua · 13:42" },
  { title: "Hệ thống đã tạo shipment SHP-083", time: "Hôm qua · 11:18" },
];

const CAPACITY: Array<{ zone: string; used: number; cap: number }> = [
  { zone: "Zone A", used: 18, cap: 40 },
  { zone: "Zone B", used: 31, cap: 40 },
  { zone: "Zone C", used: 38, cap: 40 },
  { zone: "Zone D", used: 6, cap: 40 },
];

const SHIPMENTS: Array<{ id: string; route: string; status: string; tone: BadgeTone; pkg: number }> =
  [
    { id: "SHP-085", route: "Saitama → Hà Nội", status: "Đang giao", tone: "info", pkg: 12 },
    { id: "SHP-084", route: "Saitama → TP.HCM", status: "Đã đến", tone: "success", pkg: 9 },
    { id: "SHP-083", route: "Saitama → Đà Nẵng", status: "Đang giao", tone: "info", pkg: 7 },
    { id: "SHP-082", route: "Saitama → Hà Nội", status: "Chờ xuất", tone: "warning", pkg: 5 },
    { id: "SHP-081", route: "Saitama → TP.HCM", status: "Đã đến", tone: "success", pkg: 14 },
  ];

// ── Sidebar ───────────────────────────────────────────────────────────────────

const NAV_SECTIONS: SidebarSectionProp[] = [
  {
    label: "Vận hành",
    items: [
      { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
      { id: "items", label: "Item", icon: Boxes, badge: 9 },
      { id: "packings", label: "Đóng kiện", icon: Package, badge: 5 },
      { id: "shipments", label: "Chuyến hàng", icon: Truck },
    ],
  },
  {
    label: "Quản lý",
    items: [
      { id: "invoices", label: "Hóa đơn", icon: ReceiptText, badge: 3 },
      { id: "locations", label: "Vị trí kho", icon: MapPin },
      { id: "devices", label: "Thiết bị", icon: Smartphone, badge: 2 },
    ],
  },
];

function capacityTone(pct: number): "success" | "warning" {
  // Color signaling is fixed-mapping; Progress only offers success/warning tones.
  return pct < 0.85 ? "success" : "warning";
}

export default function WarehouseDashboardShowcase() {
  const [activeNav, setActiveNav] = React.useState("dashboard");

  const sidebar = (
    <Sidebar
      activeId={activeNav}
      onSelect={setActiveNav}
      sections={NAV_SECTIONS}
      product={{ name: "Tiximax", role: "Kho B · Saitama" }}
    />
  );

  return (
    <AppShell
      sidebar={sidebar}
      topbarLeft={<strong className="text-sm">Tổng quan kho</strong>}
      topbarRight={
        <span className="text-xs text-muted-foreground tabular-nums">
          cập nhật 14:32 · 26/05/2026
        </span>
      }
    >
      <PageContainer
        title="Tổng quan"
        subtitle="Kho B · Tiximax Saitama"
        density="compact"
        extra={
          <Flex direction="row" gap="sm">
            <Button variant="outline" size="sm">
              <RefreshCw aria-hidden="true" />
              Làm mới
            </Button>
            <Button variant="outline" size="sm">
              <Download aria-hidden="true" />
              Báo cáo
            </Button>
          </Flex>
        }
      >
        <Flex direction="col" gap="lg">
          {/* KPI row */}
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4 }}>
            {KPIS.map((k) => (
              <StatCard
                key={k.label}
                label={k.label}
                value={k.value}
                delta={k.delta}
                inverse={k.inverse}
              />
            ))}
          </ResponsiveGrid>

          {/* Queue + Activity */}
          <ResponsiveGrid columns={{ sm: 1, md: 1, lg: 2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Cần xử lý</CardTitle>
                <span className="text-xs text-muted-foreground">{QUEUE.length} hàng đợi</span>
              </CardHeader>
              <CardContent flush>
                <ul className="divide-y divide-border">
                  {QUEUE.map((q) => {
                    return (
                      <li key={q.title} className="flex items-center gap-3 px-4 py-3">
                        <Badge tone={q.tone} variant="outline" icon={q.icon} aria-label={q.title} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-medium">{q.title}</div>
                          <div className="truncate text-[11px] text-muted-foreground">{q.meta}</div>
                        </div>
                        <Button variant="outline" size="sm">
                          {q.action}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Hoạt động gần đây</CardTitle>
                <span className="text-xs text-muted-foreground">24h qua</span>
              </CardHeader>
              <CardContent>
                <Timeline items={ACTIVITY} />
              </CardContent>
            </Card>
          </ResponsiveGrid>

          {/* Capacity + Recent shipments */}
          <ResponsiveGrid columns={{ sm: 1, md: 1, lg: 2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Dung lượng giá hàng</CardTitle>
                <Button variant="ghost" size="sm">
                  Xem tất cả
                </Button>
              </CardHeader>
              <CardContent>
                <Flex direction="col" gap="md">
                  {CAPACITY.map((c) => {
                    const pct = c.used / c.cap;
                    return (
                      <Progress
                        key={c.zone}
                        value={Math.round(pct * 100)}
                        label={`${c.zone} · ${c.used}/${c.cap}`}
                        tone={capacityTone(pct)}
                      />
                    );
                  })}
                </Flex>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Chuyến gần nhất</CardTitle>
                <Button variant="ghost" size="sm">
                  Tất cả
                </Button>
              </CardHeader>
              <CardContent flush>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã</TableHead>
                      <TableHead>Tuyến</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Kiện</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SHIPMENTS.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.id}</TableCell>
                        <TableCell>{s.route}</TableCell>
                        <TableCell>
                          <Badge tone={s.tone} variant="outline">
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{s.pkg}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </ResponsiveGrid>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}

/**
 * Showcase · TIXIMAX customer portal — a TOKEN-ONLY re-theme of @godxjp/ui.
 *
 * Proves the brief: can the TIXIMAX design system (gold #DFA930 · navy #0C1A31 ·
 * red #CD3913 · Source Sans 3 · 14px radius · navy-tinted shadows) be produced by
 * CONFIGURING TOKENS ALONE — no component edits, no new components? Every block below
 * is a real @godxjp/ui primitive; the ONLY TIXIMAX-specific code is the scoped token
 * block in `THEME` (anchor + semantic tokens under `[data-tenant="tiximax"]`).
 *
 *   page chrome ........ AppShell + Sidebar + Topbar
 *   header + CTA ....... PageContainer (extra) + Button (default = gold primary)
 *   KPI row ............ ResponsiveGrid + StatCard
 *   "Cần xử lý" ........ Card + rows + Badge(tone) + Button
 *   journey ............ Card + Progress / Steps
 *   orders ............. Card + Table + Badge(tone)  (the centerpiece)
 *
 * Token map (TIXIMAX → godxjp anchor/semantic, HSL components):
 *   gold → --primary/--ring/--warning · navy → --foreground/--secondary · red → --destructive
 *   #1F9D55 → --success · #2563C9 → --info · Source Sans 3 → --font-family-sans
 *   14px → --radius (+ exact 4/6/10/14/20/28 steps) · navy → --shadow-color · 16px → --font-size-base
 */
import * as React from "react";
import {
  Bell,
  Boxes,
  CheckCircle2,
  CreditCard,
  FileText,
  Headphones,
  LayoutDashboard,
  type LucideIcon,
  Package,
  Plane,
  Plus,
  Search,
  Ship,
  Warehouse,
  Wallet,
  AlertTriangle,
  ReceiptText,
} from "lucide-react";

import { Button, Text } from "@godxjp/ui/general";
import {
  Avatar,
  AvatarFallback,
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
} from "@godxjp/ui/data-display";
import { SearchInput } from "@godxjp/ui/data-entry";
import {
  AppShell,
  Flex,
  PageContainer,
  ResponsiveGrid,
  Sidebar,
  type SidebarSectionProp,
} from "@godxjp/ui/layout";

type BadgeTone = NonNullable<BadgeProps["tone"]>;

// ── The ENTIRE TIXIMAX customisation: a SCOPED token block. No component touched. ───────────
// The whole brand lives under `[data-tenant="tiximax"]` — true multi-tenant theming. This works
// because the library declares its colour/radius utilities with `@theme inline`, so `bg-primary`
// etc. inline `hsl(var(--primary))` and re-resolve a scoped --primary at the element (a plain
// @theme froze them at :root). Colours, the focus ring (--focus-ring-color/-width), the brand glow
// (--shadow-glow), gradients (--gradient-hero/-glow), the card lift (--card-shadow) and the modal
// scrim (--overlay-background) are ALL configured here as tokens — nothing else.
// Scoped note: radius derives through intermediate tokens (--card-radius/--control-radius/
// --radius-*) that compute at their declaring element, so a scoped re-theme re-declares them here
// (a :root single-brand theme needs only --radius). See docs/CUSTOMER-THEMING.md.
const THEME = `
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;0,900&display=swap');
[data-tenant="tiximax"] {
  /* Brand / action */
  --primary: 41 73% 53%;             /* gold #DFA930 */
  --primary-foreground: 217 61% 12%; /* navy text on gold */
  --ring: 41 73% 53%;                /* gold focus ring */
  --accent: 42 81% 96%;              /* gold-50 hover tint */
  --accent-foreground: 41 72% 44%;   /* gold-700 */
  /* Surfaces / text */
  --background: 0 0% 100%;
  --foreground: 217 61% 12%;         /* navy */
  --card: 0 0% 100%;
  --card-foreground: 217 61% 12%;
  --popover: 0 0% 100%;
  --popover-foreground: 217 61% 12%;
  --secondary: 217 61% 12%;          /* navy button */
  --secondary-foreground: 0 0% 100%;
  --muted: 216 33% 97%;              /* neutral-50 */
  --muted-foreground: 216 16% 40%;   /* neutral-600, darkened to clear WCAG AA 4.5:1 on cards */
  --border: 217 24% 89%;             /* neutral-200 */
  --input: 216 20% 80%;              /* neutral-300 */
  /* Fixed status signalling (TIXIMAX semantic palette) */
  --success: 152 78% 26%; --success-foreground: 0 0% 100%;  /* darker green: AA for delta text + white-on-fill */
  --warning: 41 73% 53%;  --warning-foreground: 217 61% 12%;  /* = brand gold */
  --destructive: 12 83% 44%; --destructive-foreground: 0 0% 100%;
  --info: 217 69% 47%; --info-foreground: 0 0% 100%;
  /* Shape - base radius + exact TIXIMAX steps; re-declare the intermediates so the scope re-resolves */
  --radius: 0.875rem;                /* 14px card */
  --radius-xs: 4px; --radius-sm: 6px; --radius-md: 10px;
  --radius-lg: 14px; --radius-xl: 20px; --radius-2xl: 28px;
  --card-radius: var(--radius); --control-radius: var(--radius);
  /* Elevation - navy-tinted ramp + a soft navy card lift + a gold CTA glow */
  --shadow-color: 12 26 49;
  --card-shadow: 0 1px 2px rgb(12 26 49 / 0.06), 0 10px 28px -14px rgb(12 26 49 / 0.22);
  --shadow-glow: 0 6px 18px hsl(41 73% 53% / 0.34);
  /* Focus ring → brand gold (also covered by --ring, set explicitly for clarity) */
  --focus-ring-color: 41 73% 53%;
  /* Gradients - a faint gold hero wash (keeps navy text readable) + an ambient corner glow */
  --gradient-hero: linear-gradient(180deg, hsl(42 81% 96%), transparent);
  --gradient-glow: radial-gradient(50% 60% at 92% -8%, hsl(41 73% 53% / 0.10), transparent 70%);
  /* Modal scrim → navy */
  --overlay-background: rgb(12 26 49 / 0.55);
  /* Type */
  --font-size-base: 1rem;            /* 16px TIXIMAX body */
  --font-family-sans: "Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, system-ui, sans-serif;
}

/* Dark NAVY sidebar chrome - the TIXIMAX signature (gold-on-navy). Done by SCOPING the colour
 * ROLES to the .app-sidebar region: the Sidebar's own CSS reads --card / --foreground /
 * --muted-foreground / --accent / --border, so re-pointing them here turns the whole nav dark with
 * NO component change. The active row uses the new --sidebar-item-active-* knobs for a gold tint. */
[data-tenant="tiximax"] .app-sidebar {
  --card: 217 61% 12%;              /* navy #0C1A31 surface */
  --foreground: 0 0% 100%;          /* white logo + active text base */
  --muted-foreground: 217 40% 74%;  /* navy-200 inactive nav text */
  --accent: 217 45% 18%;            /* hover row */
  --border: 217 38% 22%;            /* subtle navy dividers */
  --sidebar-item-active-background: hsl(41 73% 53% / 0.16);  /* gold tint on the selected row */
  --sidebar-item-active-foreground: hsl(41 73% 53%);          /* gold active label */
}
`;

// ── Mock data ─────────────────────────────────────────────────────────────────────────────
const KPIS: Array<{
  label: string;
  value: string;
  delta: string;
  inverse?: boolean;
  icon: LucideIcon;
}> = [
  { label: "Đơn đang xử lý", value: "12", delta: "+3 hôm nay", icon: Package },
  { label: "Đang vận chuyển", value: "8", delta: "Nhật → Việt Nam", icon: Ship },
  { label: "Đã giao tháng này", value: "47", delta: "+9 vs tháng trước", icon: CheckCircle2 },
  { label: "Công nợ", value: "¥18,400", delta: "1 hoá đơn quá hạn", inverse: true, icon: Wallet },
];

const QUEUE: Array<{
  icon: LucideIcon;
  tone: BadgeTone;
  title: string;
  meta: string;
  action: string;
}> = [
  {
    icon: ReceiptText,
    tone: "warning",
    title: "Báo giá BG-2041 chờ bạn duyệt",
    meta: "ZOZOTOWN · 3 sản phẩm · 24.800¥ · hết hạn sau 6 giờ",
    action: "Xem báo giá",
  },
  {
    icon: AlertTriangle,
    tone: "destructive",
    title: "Hoá đơn INV-2080 quá hạn 4 ngày",
    meta: "9.800¥ · vui lòng thanh toán để tiếp tục gom đơn",
    action: "Thanh toán",
  },
  {
    icon: Plane,
    tone: "info",
    title: "Kiện PKG-000038 sẵn sàng xuất kho",
    meta: "8 sản phẩm · 2,8kg · Saitama → Hà Nội",
    action: "Theo dõi",
  },
];

const JOURNEY: Array<{ stage: string; pct: number; tone: "success" | "warning" }> = [
  { stage: "Mua hộ tại Nhật", pct: 100, tone: "success" },
  { stage: "Về kho Saitama", pct: 100, tone: "success" },
  { stage: "Vận chuyển quốc tế", pct: 64, tone: "warning" },
  { stage: "Giao tận nơi (VN)", pct: 0, tone: "warning" },
];

const ORDERS: Array<{
  id: string;
  product: string;
  source: string;
  status: string;
  tone: BadgeTone;
  total: string;
}> = [
  {
    id: "TXM-100241",
    product: "Áo khoác UNIQLO ×2",
    source: "Nhật",
    status: "Đang giao",
    tone: "info",
    total: "¥12,800",
  },
  {
    id: "TXM-100240",
    product: "Mỹ phẩm Shiseido",
    source: "Nhật",
    status: "Tại kho VN",
    tone: "success",
    total: "¥8,400",
  },
  {
    id: "TXM-100239",
    product: "Giày Nike Air",
    source: "Hàn",
    status: "Chờ thanh toán",
    tone: "warning",
    total: "₩96,000",
  },
  {
    id: "TXM-100238",
    product: "Đồng hồ Casio",
    source: "Nhật",
    status: "Mua hộ",
    tone: "muted",
    total: "¥6,200",
  },
  {
    id: "TXM-100237",
    product: "Sữa Meiji ×6",
    source: "Nhật",
    status: "Đã giao",
    tone: "success",
    total: "¥9,900",
  },
];

const NAV_SECTIONS: SidebarSectionProp[] = [
  {
    label: "Mua hộ",
    items: [
      { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
      { id: "orders", label: "Đơn mua hộ", icon: Boxes, badge: 12 },
      { id: "tracking", label: "Tra cứu vận đơn", icon: Search },
      { id: "warehouse", label: "Kho của tôi", icon: Warehouse, badge: 8 },
    ],
  },
  {
    label: "Tài khoản",
    items: [
      { id: "billing", label: "Thanh toán", icon: CreditCard, badge: 1 },
      { id: "invoices", label: "Hoá đơn", icon: FileText },
      { id: "support", label: "Hỗ trợ", icon: Headphones },
    ],
  },
];

export default function TiximaxPortalShowcase() {
  const [activeNav, setActiveNav] = React.useState("dashboard");

  const sidebar = (
    <Sidebar
      activeId={activeNav}
      onSelect={setActiveNav}
      sections={NAV_SECTIONS}
      product={{ name: "TIXIMAX", role: "Cổng khách hàng" }}
    />
  );

  return (
    <div data-tenant="tiximax">
      {/* The one and only TIXIMAX-specific code: a scoped token block. */}
      <style>{THEME}</style>
      <AppShell
        sidebar={sidebar}
        topbarLeft={<Text as="strong">Cổng khách hàng</Text>}
        topbarRight={
          <Flex direction="row" gap="sm" align="center">
            <SearchInput
              defaultValue=""
              placeholder="Tìm mã đơn, sản phẩm…"
              aria-label="Tìm kiếm"
              className="w-64"
            />
            <Button variant="outline" size="icon" aria-label="Thông báo">
              <Bell aria-hidden="true" />
            </Button>
            <Avatar>
              <AvatarFallback>NA</AvatarFallback>
            </Avatar>
            <Text size="xs" tone="muted" tabular>
              Nguyễn An · VIP
            </Text>
          </Flex>
        }
      >
        <PageContainer
          title="Xin chào, An"
          subtitle="Mua hộ &amp; vận chuyển quốc tế · Nhật / Hàn → Việt Nam"
          extra={
            <Flex direction="row" gap="sm">
              <Button variant="outline" size="sm">
                <Search aria-hidden="true" />
                Tra cứu đơn
              </Button>
              <Button size="sm">
                <Plus aria-hidden="true" />
                Tạo đơn mua hộ
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
                  icon={k.icon}
                  label={k.label}
                  value={k.value}
                  delta={k.delta}
                  inverse={k.inverse}
                />
              ))}
            </ResponsiveGrid>

            {/* Queue + Journey */}
            <ResponsiveGrid columns={{ sm: 1, md: 1, lg: 2 }}>
              <Card className="self-start">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Cần bạn xử lý</CardTitle>
                  <Text size="xs" tone="muted">
                    {QUEUE.length} việc
                  </Text>
                </CardHeader>
                <CardContent flush>
                  <ul className="divide-border divide-y">
                    {QUEUE.map((q) => (
                      <li key={q.title} className="flex items-center gap-3 px-4 py-3">
                        <Badge tone={q.tone} variant="outline" icon={q.icon} aria-label={q.title} />
                        <div className="min-w-0 flex-1">
                          <Text as="div" size="sm" weight="medium" truncate>
                            {q.title}
                          </Text>
                          <Text as="div" size="xs" tone="muted" truncate>
                            {q.meta}
                          </Text>
                        </div>
                        <Button variant="outline" size="sm">
                          {q.action}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="self-start">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Hành trình đơn TXM-100241</CardTitle>
                  <Badge tone="info" variant="outline">
                    <Plane aria-hidden="true" /> Đang vận chuyển
                  </Badge>
                </CardHeader>
                <CardContent>
                  <Flex direction="col" gap="md">
                    {JOURNEY.map((j) => (
                      <Progress
                        key={j.stage}
                        value={j.pct}
                        label={`${j.stage} · ${j.pct}%`}
                        tone={j.tone}
                      />
                    ))}
                  </Flex>
                </CardContent>
              </Card>
            </ResponsiveGrid>

            {/* Orders table — the centerpiece */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Đơn mua hộ gần đây</CardTitle>
                <Button variant="ghost" size="sm">
                  <Wallet aria-hidden="true" />
                  Xem tất cả
                </Button>
              </CardHeader>
              <CardContent flush>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Nguồn</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-end">Giá trị</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ORDERS.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>
                          <Text mono size="xs">
                            {o.id}
                          </Text>
                        </TableCell>
                        <TableCell>{o.product}</TableCell>
                        <TableCell>{o.source}</TableCell>
                        <TableCell>
                          <Badge tone={o.tone} variant="outline">
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-end tabular-nums">{o.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Flex>
        </PageContainer>
      </AppShell>
    </div>
  );
}

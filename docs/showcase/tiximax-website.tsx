/**
 * Showcase · TIXIMAX marketing website — a TOKEN-ONLY rebuild of the Claude Design `ui_kits/website`.
 *
 * Proves the hard brief: a CONSUMER agent, given a Claude Design export, reproduces a full marketing
 * landing page from **token configuration + a brand stylesheet + REAL @godxjp/ui primitives** — with
 * NO new framework components. Per docs/COMPOSITION-VS-COMPONENT.md, marketing sections (Navbar,
 * Hero, CTA, Footer) FAIL the Framework-Component Test, so they are COMPOSITION: layout `<section>`s
 * arranging Card / Button / Text / Avatar / ResponsiveGrid / Flex.
 *
 * The brand-specific styling lives in the `THEME` <style> block (a consumer's own stylesheet) — the
 * design's tokens + a few marketing type/section classes + per-region role scoping for the navy
 * sections. The TSX stays clean: real primitives + semantic class names, no arbitrary utilities.
 */
import * as React from "react";
import {
  ArrowRight,
  ChevronDown,
  CreditCard,
  Globe,
  Link2,
  Mail,
  PackageCheck,
  Phone,
  Plus,
  Receipt,
  Scale,
  Search,
  ShieldCheck,
  ShoppingCart,
  Ship,
  UserPlus,
  Warehouse,
} from "lucide-react";

import { Button, Text } from "@godxjp/ui/general";
import { Avatar, AvatarFallback, Card, CardContent, CardCover } from "@godxjp/ui/data-display";
import { Flex, ResponsiveGrid } from "@godxjp/ui/layout";

// ── Brand stylesheet: the design's tokens + marketing type/section classes + navy role-scoping. ───
// This is what a consumer ships as their own theme.css — raw brand values live HERE (CSS), not as
// arbitrary utilities in the markup. The page below reads it via semantic class names only.
const THEME = `
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
[data-tenant="tiximax-web"] {
  --primary: 41 73% 53%; --primary-foreground: 217 61% 12%; --ring: 41 73% 53%;
  --accent: 42 81% 96%; --accent-foreground: 41 72% 44%;
  --background: 210 33% 97%; --foreground: 217 61% 12%;
  --card: 0 0% 100%; --card-foreground: 217 61% 12%;
  --secondary: 217 61% 12%; --secondary-foreground: 0 0% 100%;
  --muted: 214 27% 95%; --muted-foreground: 216 14% 37%;
  --border: 214 27% 90%; --input: 216 16% 80%;
  --success: 152 100% 25%; --warning: 41 73% 53%; --destructive: 11 82% 56%; --info: 203 100% 37%;
  --radius: 0.875rem; --radius-md: 10px; --radius-lg: 14px;
  --card-radius: var(--radius); --control-radius: var(--radius);
  --shadow-color: 38 79 145;
  --card-shadow: 0 1px 3px rgb(38 79 145 / 0.08), 0 1px 2px rgb(38 79 145 / 0.06);
  --shadow-glow: 0 8px 20px hsl(41 73% 53% / 0.32);
  --focus-ring-color: 41 73% 53%;
  --font-family-display: "Source Sans 3", system-ui, sans-serif;
  --font-family-body: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-family-sans: var(--font-family-body);
  --text-brand: 41 84% 26%;          /* dark gold, eyebrows clear AA on light sections */
}
/* Marketing layout + type (a consumer's section stylesheet) */
[data-tenant="tiximax-web"] .tx-shell { margin-inline: auto; width: 100%; max-width: 1200px; padding-inline: 2rem;
  /* ResponsiveGrid uses @container queries, so establish the container here (PageContainer does this
   * in an app; a marketing composition provides it on its own shell). */
  container-type: inline-size; }
[data-tenant="tiximax-web"] .tx-section { padding-block: 5rem; }
[data-tenant="tiximax-web"] .tx-navbar { position: sticky; top: 0; z-index: 30; background: hsl(var(--background) / 0.85);
  backdrop-filter: blur(10px); border-bottom: 1px solid hsl(var(--border)); }
[data-tenant="tiximax-web"] .tx-navbar-inner { height: 72px; display: flex; align-items: center; gap: 2.25rem; }
[data-tenant="tiximax-web"] .tx-brand { font-family: var(--font-family-display); font-weight: 800; font-size: 1.375rem; letter-spacing: -0.01em; color: hsl(var(--foreground)); }
[data-tenant="tiximax-web"] .tx-eyebrow { font-family: var(--font-family-display); font-weight: 700; font-size: 0.8125rem;
  letter-spacing: 0.12em; text-transform: uppercase; color: hsl(var(--text-brand)); }
[data-tenant="tiximax-web"] .tx-display { font-family: var(--font-family-display); font-weight: 900; font-size: 3.5rem;
  line-height: 1.05; letter-spacing: -0.02em; margin: 1rem 0; color: hsl(var(--foreground)); }
[data-tenant="tiximax-web"] .tx-h2 { font-family: var(--font-family-display); font-weight: 800; font-size: 2.25rem;
  line-height: 1.15; letter-spacing: -0.02em; margin: 0.75rem 0 0.625rem; color: hsl(var(--foreground)); }
[data-tenant="tiximax-web"] .tx-lead { font-size: 1.1875rem; line-height: 1.6; color: hsl(var(--muted-foreground)); max-width: 480px; }
[data-tenant="tiximax-web"] .tx-gold { color: hsl(var(--primary)); }
[data-tenant="tiximax-web"] .tx-stat { font-family: var(--font-family-display); font-weight: 800; font-size: 1.75rem; color: hsl(var(--primary)); }
[data-tenant="tiximax-web"] .tx-hero-grid { display: grid; gap: 3rem; align-items: center; padding-block: 6rem; }
@media (min-width: 1024px) { [data-tenant="tiximax-web"] .tx-hero-grid { grid-template-columns: 1.1fr 0.9fr; } }
[data-tenant="tiximax-web"] .tx-glow { position: absolute; inset: 0; pointer-events: none; }
[data-tenant="tiximax-web"] .tx-glow-tr { background: radial-gradient(40% 50% at 88% -10%, hsl(41 73% 53% / 0.22), transparent 70%); }
[data-tenant="tiximax-web"] .tx-glow-bl { background: radial-gradient(40% 50% at 12% 120%, hsl(41 73% 53% / 0.18), transparent 70%); }
[data-tenant="tiximax-web"] .tx-field { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem;
  background: hsl(0 0% 100% / 0.08); border-radius: var(--radius-md); }
[data-tenant="tiximax-web"] .tx-quote-total { display: flex; align-items: center; justify-content: space-between;
  padding: 0.875rem 1rem; background: hsl(var(--primary)); border-radius: var(--radius-md); }
[data-tenant="tiximax-web"] .tx-route-flag { height: 80px; display: flex; align-items: center; justify-content: center; background: hsl(217 49% 24%); }
[data-tenant="tiximax-web"] .tx-route-code { font-family: var(--font-family-display); font-weight: 800; font-size: 1.75rem; letter-spacing: 0.05em; color: hsl(var(--primary)); }
[data-tenant="tiximax-web"] .tx-footer-grid { display: grid; gap: 2.25rem; }
@media (min-width: 768px) { [data-tenant="tiximax-web"] .tx-footer-grid { grid-template-columns: 1.4fr 1fr 1fr 1fr; } }
[data-tenant="tiximax-web"] .tx-footer-bottom { display: flex; align-items: center; justify-content: space-between;
  margin-top: 2.25rem; padding-top: 1.25rem; border-top: 1px solid hsl(0 0% 100% / 0.1); }
[data-tenant="tiximax-web"] .tx-medallion svg { width: 1.25rem; height: 1.25rem; }
[data-tenant="tiximax-web"] .tx-icon-18 { width: 1.125rem; height: 1.125rem; }
[data-tenant="tiximax-web"] .tx-icon-22 { width: 1.375rem; height: 1.375rem; }
/* Navy region: role scoping so descendants render on-dark (white text, glass cards, outline btns). */
[data-tenant="tiximax-web"] .tx-navy {
  background: hsl(217 61% 12%); --foreground: 0 0% 100%;
  --card: 217 45% 18%; --card-foreground: 0 0% 100%;
  --card-background: hsl(0 0% 100% / 0.06); --card-border: 0 0% 100% / 0.12;
  --muted-foreground: 214 36% 80%; --border: 214 30% 30%; --input: 214 24% 60%; --background: 217 61% 12%;
  --text-brand: 41 80% 62%;  /* light gold, eyebrows clear AA on the navy regions */
}
[data-tenant="tiximax-web"] .tx-navy-deep { background: hsl(217 61% 9%); }
`;

const SHELL = "tx-shell";

function Navbar() {
  const links = ["Mua hộ", "Vận chuyển", "Bảng giá", "Tra cứu", "Về chúng tôi"];
  return (
    <header className="tx-navbar">
      <div className={`${SHELL} tx-navbar-inner`}>
        <span className="tx-brand" data-logotype="">
          TIXI<span className="tx-gold">MAX</span>
        </span>
        <Flex direction="row" gap="xs" align="center" className="ms-2">
          {links.map((l, i) => (
            <Button key={l} variant="ghost" size="sm" aria-current={i === 0 ? "page" : undefined}>
              {l}
            </Button>
          ))}
        </Flex>
        <Flex direction="row" gap="sm" align="center" className="ms-auto">
          <Button variant="ghost" size="sm">
            Đăng nhập
          </Button>
          <Button size="sm">
            <Plus aria-hidden="true" />
            Tạo đơn mua hộ
          </Button>
        </Flex>
      </div>
    </header>
  );
}

function Hero() {
  const stats: Array<[string, string]> = [
    ["120K+", "Đơn đã giao"],
    ["6", "Quốc gia"],
    ["12–18", "Ngày vận chuyển"],
  ];
  const fields: Array<[typeof Globe, string, string]> = [
    [Globe, "Quốc gia", "Nhật Bản"],
    [Scale, "Cân nặng (kg)", "3.5 kg"],
  ];
  return (
    <section className="tx-navy relative overflow-hidden">
      <div className="tx-glow tx-glow-tr" />
      <div className={`${SHELL} tx-hero-grid relative`}>
        <div>
          <div className="tx-eyebrow">Mua hộ &amp; vận chuyển quốc tế</div>
          <h1 className="tx-display">
            Mua sắm toàn cầu,
            <br />
            <span className="tx-gold">TIXIMAX</span> lo phần còn lại.
          </h1>
          <p className="tx-lead">
            Đặt mua, thanh toán và vận chuyển hàng từ Nhật, Hàn, Indonesia và Mỹ về tận nhà. Minh
            bạch chi phí, theo dõi từng bước.
          </p>
          <Flex direction="row" gap="md" className="mt-6">
            <Button size="lg">
              Nhận báo giá miễn phí
              <ArrowRight aria-hidden="true" />
            </Button>
            <Button variant="outline" size="lg">
              <Search aria-hidden="true" />
              Tra cứu đơn
            </Button>
          </Flex>
          <Flex direction="row" gap="lg" className="mt-10">
            {stats.map(([n, l]) => (
              <div key={l}>
                <div className="tx-stat">{n}</div>
                <Text as="div" size="xs" tone="muted">
                  {l}
                </Text>
              </div>
            ))}
          </Flex>
        </div>

        <Card>
          <CardContent>
            <div className="tx-eyebrow">Ước tính phí vận chuyển</div>
            <Flex direction="col" gap="sm" className="mt-4">
              {fields.map(([Icon, label, value]) => (
                <div key={label} className="tx-field">
                  <Icon aria-hidden="true" className="tx-gold tx-icon-18" />
                  <div className="min-w-0 flex-1">
                    <Text as="div" size="2xs" tone="muted">
                      {label}
                    </Text>
                    <Text as="div" weight="bold">
                      {value}
                    </Text>
                  </div>
                  <ChevronDown aria-hidden="true" className="tx-icon-18" />
                </div>
              ))}
              <div className="tx-quote-total">
                <Text as="span" weight="bold" className="text-primary-foreground">
                  Tạm tính
                </Text>
                <Text as="span" weight="bold" size="2xl" className="text-primary-foreground">
                  525.000đ
                </Text>
              </div>
            </Flex>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  sub,
  center,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto mb-10 text-center" : "mb-8"}>
      <div className="tx-eyebrow">{eyebrow}</div>
      <h2 className="tx-h2">{title}</h2>
      {sub ? <p className="tx-lead mx-auto">{sub}</p> : null}
    </div>
  );
}

function Medallion({ icon: Icon }: { icon: typeof Globe }) {
  return (
    <Avatar className="rounded-md">
      <AvatarFallback className="bg-primary/10 text-primary tx-medallion rounded-md">
        <Icon aria-hidden="true" />
      </AvatarFallback>
    </Avatar>
  );
}

function Services() {
  const items: Array<[typeof Globe, string, string]> = [
    [
      ShoppingCart,
      "Mua hộ",
      "Gửi link sản phẩm, TIXIMAX đặt mua và thanh toán giúp bạn với tỷ giá minh bạch.",
    ],
    [Ship, "Vận chuyển", "Đường biển và đường bay từ Nhật, Hàn, Indonesia, Mỹ về Việt Nam."],
    [Warehouse, "Gom hàng", "Gom nhiều đơn vào một kiện để tiết kiệm tối đa chi phí vận chuyển."],
    [
      ShieldCheck,
      "Bảo hiểm hàng hóa",
      "Bảo vệ giá trị đơn hàng trong suốt quá trình vận chuyển quốc tế.",
    ],
  ];
  return (
    <section className="bg-card tx-section">
      <div className={SHELL}>
        <SectionHead
          center
          eyebrow="Dịch vụ"
          title="Một điểm chạm, trọn quy trình"
          sub="Từ lúc bạn thấy món hàng ở nước ngoài đến khi nó nằm trong tay bạn."
        />
        <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4 }}>
          {items.map(([icon, t, d]) => (
            <Card key={t}>
              <CardContent>
                <Medallion icon={icon} />
                <Text as="div" weight="bold" size="lg" className="mt-4">
                  {t}
                </Text>
                <Text as="p" size="sm" tone="muted" className="mt-1">
                  {d}
                </Text>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>
      </div>
    </section>
  );
}

function Steps() {
  const steps: Array<[typeof Globe, string, string]> = [
    [Link2, "Gửi link sản phẩm", "Dán đường link món hàng bạn muốn mua từ bất kỳ trang nào."],
    [Receipt, "Nhận báo giá", "TIXIMAX báo giá tiền hàng và phí vận chuyển trong vài phút."],
    [CreditCard, "Thanh toán", "Đặt cọc hoặc thanh toán toàn bộ, chúng tôi đặt mua ngay."],
    [PackageCheck, "Nhận hàng tận nơi", "Theo dõi đơn theo thời gian thực đến khi giao tận nhà."],
  ];
  return (
    <section className="bg-background tx-section">
      <div className={SHELL}>
        <SectionHead eyebrow="Quy trình" title="Mua hàng quốc tế trong 4 bước" />
        <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4 }}>
          {steps.map(([Icon, t, d], i) => (
            <div key={t}>
              <Flex direction="row" gap="sm" align="center" className="mb-3">
                <Avatar>
                  <AvatarFallback className="bg-secondary text-primary font-bold">
                    {i + 1}
                  </AvatarFallback>
                </Avatar>
                <Icon aria-hidden="true" className="text-brand tx-icon-22" />
              </Flex>
              <Text as="div" weight="bold" size="lg">
                {t}
              </Text>
              <Text as="p" size="sm" tone="muted" className="mt-1">
                {d}
              </Text>
            </div>
          ))}
        </ResponsiveGrid>
      </div>
    </section>
  );
}

function Routes() {
  const routes: Array<[string, string, string, string]> = [
    ["Nhật Bản", "JP", "Đường bay · 5–7 ngày", "210.000đ/kg"],
    ["Hàn Quốc", "KR", "Đường bay · 4–6 ngày", "180.000đ/kg"],
    ["Indonesia", "ID", "Đường biển · 12–18 ngày", "38.000đ/kg"],
    ["Hoa Kỳ", "US", "Đường bay · 7–10 ngày", "260.000đ/kg"],
  ];
  return (
    <section className="bg-card tx-section">
      <div className={SHELL}>
        <SectionHead eyebrow="Tuyến vận chuyển" title="Giá cước rõ ràng theo từng tuyến" />
        <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4 }}>
          {routes.map(([c, code, mode, price]) => (
            <Card key={c} className="overflow-hidden">
              <CardCover className="tx-route-flag">
                <span className="tx-route-code">{code}</span>
              </CardCover>
              <CardContent>
                <Text as="div" weight="bold" size="lg">
                  {c}
                </Text>
                <Text as="div" size="xs" tone="muted" className="mt-1 mb-3">
                  {mode}
                </Text>
                <Text as="div" weight="bold" size="2xl">
                  {price}
                </Text>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="tx-navy tx-section relative overflow-hidden">
      <div className="tx-glow tx-glow-bl" />
      <div className={`${SHELL} relative text-center`}>
        <h2 className="tx-h2">Sẵn sàng cho đơn hàng đầu tiên?</h2>
        <p className="tx-lead mx-auto">Tạo tài khoản miễn phí và nhận báo giá trong 5 phút.</p>
        <Flex direction="row" gap="md" className="mt-6 justify-center">
          <Button size="lg">
            <UserPlus aria-hidden="true" />
            Đăng ký ngay
          </Button>
          <Button variant="outline" size="lg">
            Liên hệ tư vấn
          </Button>
        </Flex>
      </div>
    </section>
  );
}

function Footer() {
  const cols: Array<[string, string[]]> = [
    ["Dịch vụ", ["Mua hộ", "Vận chuyển", "Gom hàng", "Bảng giá"]],
    ["Công ty", ["Về TIXIMAX", "Tuyển dụng", "Tin tức", "Liên hệ"]],
    ["Hỗ trợ", ["Tra cứu đơn", "Câu hỏi thường gặp", "Chính sách", "Điều khoản"]],
  ];
  return (
    <footer className="tx-navy tx-navy-deep">
      <div className={`${SHELL} tx-footer-grid`} style={{ paddingBlock: "3.5rem 2rem" }}>
        <div>
          <span className="tx-brand">
            TIXI<span className="tx-gold">MAX</span>
          </span>
          <Text as="p" size="sm" tone="muted" className="mt-4">
            Dịch vụ mua hộ &amp; vận chuyển quốc tế uy tín, minh bạch về tận nhà bạn.
          </Text>
        </div>
        {cols.map(([h, items]) => (
          <div key={h}>
            <div className="tx-eyebrow">{h}</div>
            <Flex direction="col" gap="xs" className="mt-3">
              {items.map((i) => (
                <Button
                  key={i}
                  variant="link"
                  size="sm"
                  className="text-muted-foreground justify-start"
                >
                  {i}
                </Button>
              ))}
            </Flex>
          </div>
        ))}
      </div>
      <div className={`${SHELL} tx-footer-bottom`}>
        <Text as="span" size="xs" tone="muted">
          2026 TIXIMAX Logistics. All rights reserved.
        </Text>
        <Flex direction="row" gap="md">
          {[Mail, Phone, Globe].map((Icon, i) => (
            <Icon key={i} aria-hidden="true" className="text-muted-foreground tx-icon-18" />
          ))}
        </Flex>
      </div>
    </footer>
  );
}

export default function TiximaxWebsiteShowcase() {
  return (
    <div data-tenant="tiximax-web" className="bg-background min-h-screen">
      <style>{THEME}</style>
      <Navbar />
      <Hero />
      <Services />
      <Steps />
      <Routes />
      <CtaBanner />
      <Footer />
    </div>
  );
}

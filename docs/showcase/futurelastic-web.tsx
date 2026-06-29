/**
 * Showcase · FUTURELASTIC (Kiniro System) — a TOKEN-ONLY rebuild of a DARK marketing website.
 *
 * A second Claude Design handoff, deliberately the opposite of the admin/light work: dark-mode
 * default, gold-on-Urushi (Kiniro #C9A84C on near-black), Sora display + Be Vietnam Pro body, 80px
 * hero. Proves the token model handles a whole different brand + a dark website from CONFIGURATION
 * alone — same rule as docs/COMPOSITION-VS-COMPONENT.md: marketing sections (Navbar/Hero/Bento/CTA/
 * Footer) FAIL the Framework-Component Test → they are COMPOSITION over real primitives; ZERO new
 * framework components were needed (the answer to "do I need new components?" here is: no).
 *
 * Brand config lives in the THEME <style> block (a consumer's theme.css): the Kiniro dark tokens +
 * a few marketing section classes. The whole page is one dark region, so no per-region scoping.
 */
import * as React from "react";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Clock,
  Hexagon,
  LayoutGrid,
  Globe,
  AtSign,
} from "lucide-react";

import { Button, Text } from "@godxjp/ui/general";
import { Avatar, AvatarFallback, Card, CardContent } from "@godxjp/ui/data-display";
import { Flex } from "@godxjp/ui/layout";

const THEME = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap');
[data-tenant="futurelastic"] {
  /* Kiniro brand (dark mode is the only mode here) */
  --primary: 42 54% 54%;             /* Kiniro gold #C9A84C */
  --primary-foreground: 38 80% 6%;   /* near-black warm text on gold */
  --ring: 42 54% 54%;
  --accent: 42 40% 12%; --accent-foreground: 42 54% 60%;
  --background: 40 47% 4%;            /* Urushi #0E0B05 */
  --foreground: 0 0% 100%;
  --card: 36 47% 6%;                 /* bg-raised #161008 */
  --card-foreground: 0 0% 100%;
  --secondary: 218 43% 40%;          /* Ai blue #3A5A91 */
  --secondary-foreground: 0 0% 100%;
  --muted: 40 30% 10%; --muted-foreground: 39 28% 70%;  /* text-secondary #C8BAA0 (AA on dark) */
  --border: 36 22% 14%; --input: 36 18% 22%;
  --success: 145 63% 49%; --warning: 33 90% 44%; --destructive: 0 84% 60%; --info: 213 94% 68%;
  --radius: 1rem; --radius-md: 10px; --radius-lg: 14px; --radius-xl: 20px; --radius-2xl: 24px;
  --card-radius: var(--radius-2xl); --control-radius: var(--radius-lg);
  --shadow-color: 0 0 0;
  --shadow-glow: 0 10px 30px hsl(42 54% 54% / 0.22);
  --focus-ring-color: 42 54% 54%;
  --font-family-display: "Sora", system-ui, sans-serif;
  --font-family-body: "Be Vietnam Pro", system-ui, "Noto Sans JP", sans-serif;
  --font-family-sans: var(--font-family-body);
  --font-size-display: 5rem;         /* 80px hero via text-5xl */
  color-scheme: dark;
}
/* Marketing surface (consumer section stylesheet) */
[data-tenant="futurelastic"] { background: hsl(var(--background)); color: hsl(var(--foreground)); min-height: 100vh; }
[data-tenant="futurelastic"] .fl-shell { margin-inline: auto; width: 100%; max-width: 1140px; padding-inline: 2rem; container-type: inline-size; }
[data-tenant="futurelastic"] .fl-section { padding-block: 5.5rem; }
[data-tenant="futurelastic"] .fl-navbar { position: sticky; top: 0; z-index: 30; background: hsl(var(--background) / 0.8);
  backdrop-filter: blur(12px); border-bottom: 1px solid hsl(var(--border)); }
[data-tenant="futurelastic"] .fl-navbar-inner { height: 68px; display: flex; align-items: center; gap: 2rem; }
[data-tenant="futurelastic"] .fl-brand { font-family: var(--font-family-display); font-weight: 700; font-size: 1.25rem; color: hsl(var(--foreground)); }
[data-tenant="futurelastic"] .fl-eyebrow { font-family: var(--font-family-body); font-weight: 600; font-size: 0.75rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: hsl(var(--primary)); }
[data-tenant="futurelastic"] .fl-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.875rem;
  border: 1px solid hsl(var(--primary) / 0.3); background: hsl(var(--primary) / 0.08); border-radius: 999px;
  font-size: 0.8125rem; font-weight: 500; color: hsl(var(--foreground)); }
[data-tenant="futurelastic"] .fl-badge .dot { width: 6px; height: 6px; border-radius: 999px; background: hsl(var(--primary)); }
[data-tenant="futurelastic"] .fl-hero { position: relative; overflow: hidden; padding-block: clamp(5rem, 3rem + 9vw, 10rem); }
[data-tenant="futurelastic"] .fl-hero-glow { position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(60% 50% at 70% 0%, hsl(42 54% 54% / 0.12), transparent 70%); }
[data-tenant="futurelastic"] .fl-hero-inner { position: relative; max-width: 860px; }
[data-tenant="futurelastic"] .fl-display { font-family: var(--font-family-display); font-weight: 700; font-size: 5rem;
  line-height: 1.05; letter-spacing: -0.03em; color: hsl(var(--foreground)); margin: 1.25rem 0; }
[data-tenant="futurelastic"] .fl-h2 { font-family: var(--font-family-display); font-weight: 700; font-size: 2.5rem;
  line-height: 1.1; letter-spacing: -0.02em; color: hsl(var(--foreground)); margin: 0.75rem 0; }
[data-tenant="futurelastic"] .fl-gold { color: hsl(var(--primary)); }
[data-tenant="futurelastic"] .fl-lead { font-size: 1.25rem; line-height: 1.65; color: hsl(var(--muted-foreground)); max-width: 620px; }
[data-tenant="futurelastic"] .fl-note { font-size: 0.9375rem; color: hsl(var(--muted-foreground)); margin-top: 2.5rem; }
[data-tenant="futurelastic"] .fl-head { max-width: 640px; margin-inline: auto; text-align: center; }
[data-tenant="futurelastic"] .fl-cta-inner { position: relative; max-width: 680px; margin-inline: auto; }
[data-tenant="futurelastic"] .fl-footer-tagline { max-width: 260px; }
[data-tenant="futurelastic"] .fl-logocloud { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem 2.5rem; }
[data-tenant="futurelastic"] .fl-logo-item { display: inline-flex; align-items: center; gap: 0.5rem; font-family: var(--font-family-display);
  font-weight: 600; font-size: 1.0625rem; color: hsl(var(--foreground) / 0.85); }
[data-tenant="futurelastic"] .fl-logo-item .tag { font-family: var(--font-family-body); font-weight: 500; font-size: 0.6875rem;
  letter-spacing: 0.06em; text-transform: uppercase; color: hsl(var(--primary)); }
[data-tenant="futurelastic"] .fl-section-tint { background: hsl(var(--card) / 0.5); border-block: 1px solid hsl(var(--border)); padding-block: 3rem; }
[data-tenant="futurelastic"] .fl-bento { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
@container (min-width: 768px) { [data-tenant="futurelastic"] .fl-bento { grid-template-columns: repeat(6, 1fr); } }
@container (min-width: 768px) { [data-tenant="futurelastic"] .fl-bento > .fl-cell { grid-column: span 2; } }
@container (min-width: 768px) { [data-tenant="futurelastic"] .fl-bento > .fl-cell.wide { grid-column: span 4; } }
@container (min-width: 768px) { [data-tenant="futurelastic"] .fl-bento > .fl-cell.half { grid-column: span 3; } }
[data-tenant="futurelastic"] .fl-medallion svg { width: 1.5rem; height: 1.5rem; }
[data-tenant="futurelastic"] .fl-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
@container (min-width: 768px) { [data-tenant="futurelastic"] .fl-stats { grid-template-columns: repeat(4, 1fr); } }
[data-tenant="futurelastic"] .fl-stat-num { font-family: var(--font-family-display); font-weight: 700; font-size: 3rem; color: hsl(var(--primary)); line-height: 1; }
[data-tenant="futurelastic"] .fl-cta { position: relative; overflow: hidden; text-align: center; border: 1px solid hsl(var(--primary) / 0.2);
  border-radius: var(--radius-2xl); background: hsl(var(--card)); padding: 4rem 2rem; }
[data-tenant="futurelastic"] .fl-cta-glow { position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(60% 80% at 50% 0%, hsl(42 54% 54% / 0.14), transparent 70%); }
[data-tenant="futurelastic"] .fl-footer { border-top: 1px solid hsl(var(--border)); padding-block: 3.5rem 2rem; }
[data-tenant="futurelastic"] .fl-footer-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
@container (min-width: 768px) { [data-tenant="futurelastic"] .fl-footer-grid { grid-template-columns: 1.6fr 1fr 1fr 1fr; } }
[data-tenant="futurelastic"] .fl-footer-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
  margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid hsl(var(--border)); }
`;

const SHELL = "fl-shell";

function Navbar() {
  const links = ["Home", "Ventures", "About", "Blog"];
  return (
    <nav className="fl-navbar">
      <div className={`${SHELL} fl-navbar-inner`}>
        <span className="fl-brand">
          futur<span className="fl-gold">elastic</span>
        </span>
        <Flex direction="row" gap="xs" align="center" className="ms-4">
          {links.map((l, i) => (
            <Button key={l} variant="ghost" size="sm" aria-current={i === 0 ? "page" : undefined}>
              {l}
            </Button>
          ))}
        </Flex>
        <Flex direction="row" gap="sm" align="center" className="ms-auto">
          <Text as="span" size="xs" tone="muted">
            EN · 日本語 · VI
          </Text>
          <Button size="sm">Contact</Button>
        </Flex>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="fl-hero">
      <div className="fl-hero-glow" />
      <div className={`${SHELL} fl-hero-inner`}>
        <span className="fl-badge">
          <span className="dot" /> Tech · AI · Holdings
        </span>
        <h1 className="fl-display">
          Building the <span className="fl-gold">elastic</span> infrastructure of the future.
        </h1>
        <p className="fl-lead">
          Futurelastic là pháp nhân holding của nhóm công ty công nghệ &amp; AI vận hành xuyên Nhật
          Bản và Việt Nam, từ logistics, fintech đến F&amp;B và thương mại.
        </p>
        <Flex direction="row" gap="md" className="mt-7">
          <Button size="lg">Khám phá hệ sinh thái</Button>
          <Button variant="outline" size="lg">
            Liên hệ hợp tác
          </Button>
        </Flex>
        <p className="fl-note">未来を、しなやかに。 · 東京 · 大阪 · ホーチミン · カントー</p>
      </div>
    </header>
  );
}

function LogoCloud() {
  const items: Array<[string, string]> = [
    ["Tiximax", "Logistics"],
    ["ベト屋フーズ", "F&B"],
    ["Hub Support", "B2B"],
    ["Big Asia", "Trading"],
    ["US Entity", "Oregon"],
  ];
  return (
    <section className="fl-section-tint">
      <div className={SHELL}>
        <Text as="p" size="xs" tone="muted" className="mb-6 text-center tracking-widest uppercase">
          Các pháp nhân vận hành dưới Futurelastic
        </Text>
        <div className="fl-logocloud">
          {items.map(([name, tag]) => (
            <span key={name} className="fl-logo-item">
              {name} <span className="tag">{tag}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Medallion({ icon: Icon }: { icon: typeof Boxes }) {
  return (
    <Avatar className="rounded-lg">
      <AvatarFallback className="bg-primary/10 text-primary fl-medallion rounded-lg">
        <Icon aria-hidden="true" />
      </AvatarFallback>
    </Avatar>
  );
}

function Bento() {
  const cells: Array<{ icon: typeof Boxes; title: string; text: string; span?: string }> = [
    {
      icon: Boxes,
      span: "wide",
      title: "Cross-border logistics & remittance",
      text: "Tiximax vận hành hành lang Nhật → Việt: xử lý đơn hàng, kho vận và kiều hối với hạ tầng tuân thủ AML/KYC.",
    },
    {
      icon: Clock,
      title: "AI-native operations",
      text: "Tự động hoá quy trình bằng AI từ ngày đầu, lean, nhanh, đo được.",
    },
    {
      icon: BarChart3,
      title: "Multi-market presence",
      text: "日本・ベトナム・アメリカ · pháp nhân thực, vận hành thực.",
    },
    {
      icon: LayoutGrid,
      span: "half",
      title: "F&B brands",
      text: "PHO EXPRESS · Viet Kitchen · Viet Origin · ẩm thực Việt từ bình dân đến cao cấp tại Nhật.",
    },
    {
      icon: Hexagon,
      span: "half",
      title: "Construction & trading",
      text: "Big Asia: xây dựng nhà máy, central kitchen và xuất nhập khẩu giữa Việt Nam và Nhật Bản.",
    },
  ];
  return (
    <section className="fl-section" id="ventures">
      <div className={SHELL}>
        <div className="fl-head mb-12">
          <div className="fl-eyebrow">Hệ sinh thái</div>
          <h2 className="fl-h2">Một mái nhà, nhiều mũi nhọn</h2>
          <p className="fl-lead mx-auto">
            Mỗi entity tự chủ vận hành; Futurelastic cung cấp vốn, công nghệ nền và quản trị chung.
          </p>
        </div>
        <div className="fl-bento">
          {cells.map((c) => (
            <Card key={c.title} className={`fl-cell ${c.span ?? ""}`}>
              <CardContent>
                <Medallion icon={c.icon} />
                <Text as="div" weight="bold" size="lg" className="mt-5">
                  {c.title}
                </Text>
                <Text as="p" size="sm" tone="muted" className="mt-2">
                  {c.text}
                </Text>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats: Array<[string, string]> = [
    ["5+", "Pháp nhân vận hành"],
    ["3", "Thị trường (JP · VN · US)"],
    ["10+", "Chi nhánh & điểm vận hành"],
    ["2025", "Năm thành lập holding"],
  ];
  return (
    <section className="fl-section-tint">
      <div className={SHELL}>
        <div className="fl-stats">
          {stats.map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="fl-stat-num">{n}</div>
              <Text as="div" size="sm" tone="muted" className="mt-2">
                {l}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="fl-section">
      <div className={SHELL}>
        <div className="fl-cta">
          <div className="fl-cta-glow" />
          <div className="fl-cta-inner">
            <h2 className="fl-h2">Cùng xây điều mới?</h2>
            <p className="fl-lead mx-auto mt-3">
              Chúng tôi tìm đối tác, nhân tài và cơ hội M&amp;A trong công nghệ, logistics và
              F&amp;B tại Nhật Bản &amp; Việt Nam.
            </p>
            <Flex direction="row" gap="md" className="mt-7 justify-center">
              <Button size="lg">Đặt lịch trao đổi</Button>
              <Button variant="ghost" size="lg">
                Đọc blog
                <ArrowRight aria-hidden="true" />
              </Button>
            </Flex>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols: Array<[string, string[]]> = [
    ["Ventures", ["Tiximax", "ベト屋フーズ", "Hub Support", "Big Asia"]],
    ["Company", ["About", "Careers", "Press", "Contact"]],
    ["Offices", ["東京", "大阪", "Hồ Chí Minh", "Cần Thơ"]],
  ];
  return (
    <footer className="fl-footer">
      <div className={`${SHELL} fl-footer-grid`}>
        <div>
          <span className="fl-brand">
            futur<span className="fl-gold">elastic</span>
          </span>
          <Text as="p" size="sm" tone="muted" className="fl-footer-tagline mt-4">
            Tech · AI · Holdings · building the elastic infrastructure of the future across Japan
            &amp; Vietnam.
          </Text>
        </div>
        {cols.map(([h, items]) => (
          <div key={h}>
            <Text
              as="div"
              size="2xs"
              weight="bold"
              className="text-foreground mb-3 tracking-widest uppercase"
            >
              {h}
            </Text>
            <Flex direction="col" gap="xs" className="mt-2">
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
      <div className={`${SHELL} fl-footer-bottom`}>
        <Text as="span" size="xs" tone="muted">
          2026 Futurelastic. All rights reserved.
        </Text>
        <Flex direction="row" gap="sm">
          <Button variant="ghost" size="icon" aria-label="Website">
            <Globe aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Email">
            <AtSign aria-hidden="true" />
          </Button>
        </Flex>
      </div>
    </footer>
  );
}

export default function FuturelasticWebShowcase() {
  return (
    <div data-tenant="futurelastic">
      <style>{THEME}</style>
      <Navbar />
      <Hero />
      <LogoCloud />
      <Bento />
      <Stats />
      <Cta />
      <Footer />
    </div>
  );
}

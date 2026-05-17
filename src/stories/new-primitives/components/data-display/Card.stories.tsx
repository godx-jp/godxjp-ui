import type { Meta, StoryObj } from "@storybook/react";
import {
  AlertTriangle,
  Bell,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  Info,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  Upload as UploadIcon,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "../../../../components/primitives/Card";
import { Button } from "../../../../components/primitives/Button";
import { Tag } from "../../../../components/primitives/Tag";
import { Badge } from "../../../../components/primitives/Badge";
import { Avatar } from "../../../../components/primitives/Avatar";
import { Statistic } from "../../../../components/primitives/Statistic";
import { Flex, Space } from "../../../../components/primitives/layout";

/**
 * Components/Data Display/Card — surface container.
 *
 * Primitive: `src/components/primitives/Card.tsx`.
 * CSS:       `src/styles/shell.css` (`.card` family + Card-internal
 *            atoms: .row-between, .micro, .stat, .delta, .dot,
 *            .pulse, .ic, .dl, .prog, .sk, .choice, .dv, .spark,
 *            .bars, .mono, .pill-inline).
 * Canon:     `design-handoff/ui-system/dxs-kintai-design-system/
 *            project/preview/comp-card.html` (1994 lines, A-H).
 *
 * Cardinal rules:
 *  §14 — Radix-ecosystem (no Radix for Card — purely structural)
 *  §21 — every axis (theme/accent/density/font-size)
 *  §22 — every literal token-pinned
 *  §23 — vocabulary (padding/tone/accent/band per new-docs/04 §O,§P)
 *  §24 — mobile-first: `grid-cols-1` default, `md:` for desktop
 *  §25 — primitive is the canon; story is docs
 */

const meta: Meta<typeof Card> = {
  title: "new-primitives/Components/Data Display/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Card** — surface container with header / body / footer slots +
4 orthogonal prop axes (padding / tone / accent / band).

Stories below port the dxs-kintai design canon sections A → H
(\`comp-card.html\` 1994 lines). Each renders verbatim per cardinal
rule 22; per rule 25 ALL visual contract lives in \`Card.tsx\` +
\`.card\` CSS — stories are docs only.

Mobile-first per cardinal rule 24: default layouts use
\`grid-cols-1\` so cards stack on phones; \`md:grid-cols-N\` kicks
in at tablet-landscape and above.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Card>;

const muted = { fontSize: "var(--card-meta-size)", color: "var(--muted-foreground)" } as const;

// ════════════════════════════════════════════════════════════════════
// API axes — quick navigation
// ════════════════════════════════════════════════════════════════════

export const Default: Story = {
  render: () => (
    <Card title="Pull requests" meta="this week" extra={<a href="#">More</a>}>
      <p style={{ margin: 0 }}>Body content. Card padding 16, header 10/16, body 14/16 — all token-pinned.</p>
    </Card>
  ),
};

export const PaddingAxis: Story = {
  name: "Axis · padding",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card padding="tight" title="tight (12)" meta="0.75 × density-card">tight body</Card>
      <Card padding="default" title="default (16)" meta="1 × density-card">default body</Card>
      <Card padding="cozy" title="cozy (20)" meta="1.25 × density-card">cozy body</Card>
      <Card padding="none">
        <CardHeader block title="none (flush)" meta="own .ch padding" />
        <CardBody block>flush body — own .cb pad 14/16</CardBody>
        <CardFooter actions block><Button size="small">OK</Button></CardFooter>
      </Card>
    </div>
  ),
};

export const ToneAxis: Story = {
  name: "Axis · tone",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card title="default" meta="--card">card bg</Card>
      <Card tone="muted" title="muted" meta="--secondary">muted bg</Card>
      <Card tone="outline-only" title="outline" meta="transparent">outline bg</Card>
    </div>
  ),
};

export const AccentAxis: Story = {
  name: "Axis · accent (edge + featured)",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {(["primary", "success", "warning", "attention", "info", "destructive"] as const).map((a) => (
        <Card key={a} accent={a} title={a}>Edge accent.</Card>
      ))}
      <Card accent="featured" title="featured">Full --primary ring.</Card>
    </div>
  ),
};

export const BandAxis: Story = {
  name: "Axis · band (H11 color strip)",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {(["primary", "success", "attention", "destructive", "warning", "info", "gradient", "dotted"] as const).map((b) => (
        <Card key={b} padding="none" band={b}>
          <CardHeader block title="プロジェクト" meta={b} />
        </Card>
      ))}
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════════
// A · DATA DISPLAY
// ════════════════════════════════════════════════════════════════════

export const A1_StatSimple: Story = {
  name: "A1 · Stat (KPI tiles)",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <Card padding="tight">
        <Flex vertical gap="small">
          <span className="micro">出勤率</span>
          <div className="row-between">
            <span className="stat">96.8<span className="unit">%</span></span>
            <span className="delta up"><TrendingUp size={11} aria-hidden /> +1.2</span>
          </div>
        </Flex>
      </Card>
      <Card padding="tight">
        <Flex vertical gap="small">
          <span className="micro">遅刻件数</span>
          <div className="row-between">
            <span className="stat">12</span>
            <span className="delta down"><TrendingDown size={11} aria-hidden /> +3</span>
          </div>
        </Flex>
      </Card>
      <Card padding="tight">
        <Flex vertical gap="small">
          <span className="micro">超勤時間</span>
          <div className="row-between">
            <span className="stat">42.5<span className="unit">h</span></span>
            <span className="delta flat">—</span>
          </div>
        </Flex>
      </Card>
      <Card padding="tight">
        <Flex vertical gap="small">
          <span className="micro">月間給与</span>
          <span className="stat lg">¥1.23M</span>
          <span style={muted}>前月比 +5.4%</span>
        </Flex>
      </Card>
    </div>
  ),
};

export const A4_StatSparkline: Story = {
  name: "A4 · Stat + sparkline",
  render: () => (
    <Card padding="default">
      <div className="row-between">
        <div>
          <div style={muted}>売上 (今週)</div>
          <div className="stat" style={{ marginTop: 4 }}>¥ 4.82M</div>
          <div style={{ ...muted, marginTop: 2 }}>
            先週 ¥ 4.55M · <span className="delta up" style={{ padding: 0 }}>+5.9%</span>
          </div>
        </div>
        <svg className="spark" style={{ width: 120, height: 48 }} viewBox="0 0 120 48" preserveAspectRatio="none" aria-hidden>
          <path d="M0,32 L15,28 L30,30 L45,22 L60,18 L75,24 L90,16 L105,10 L120,12"
            fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M0,32 L15,28 L30,30 L45,22 L60,18 L75,24 L90,16 L105,10 L120,12 L120,48 L0,48 Z"
            fill="color-mix(in oklch, var(--primary) 10%, transparent)" />
          <circle cx="120" cy="12" r="3" fill="var(--primary)" />
        </svg>
      </div>
    </Card>
  ),
};

export const A5_Bars: Story = {
  name: "A5 · Bars chart",
  render: () => (
    <Card padding="none">
      <CardHeader block title="週次 · 実働 vs 所定" meta="第 20 週" />
      <CardBody block>
        <div className="bars" aria-hidden>
          <i style={{ height: "62%" }} />
          <i style={{ height: "78%" }} />
          <i style={{ height: "54%" }} />
          <i style={{ height: "88%" }} />
          <i className="on" style={{ height: "71%" }} />
          <i style={{ height: "40%", background: "color-mix(in oklch, var(--border) 80%, transparent)" }} />
          <i style={{ height: "0%" }} />
        </div>
        <div className="row-between" style={{ marginTop: 6, fontSize: "var(--text-2xs)", color: "var(--muted-foreground)" }}>
          <span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span>土</span><span>日</span>
        </div>
      </CardBody>
      <CardFooter block>
        <span className="dot primary" /><span>実働</span>
        <span className="dot" style={{ background: "var(--border)", marginLeft: 10 }} /><span>未来</span>
        <span style={{ marginLeft: "auto", color: "var(--foreground)", fontWeight: 500 }}>合計 33.2 h</span>
      </CardFooter>
    </Card>
  ),
};

export const A6_ProgressQuota: Story = {
  name: "A6 · Progress / quota",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card padding="default">
        <div className="row-between" style={{ marginBottom: 8 }}>
          <div style={{ fontSize: "var(--card-title-size)", fontWeight: 500 }}>ストレージ</div>
          <span className="mono" style={muted}>42.8 / 50 GB</span>
        </div>
        <div className="prog warning"><i style={{ width: "85%" }} /></div>
        <div style={{ ...muted, marginTop: 6 }}>
          <AlertTriangle size={12} aria-hidden /> 残り 7.2 GB
        </div>
      </Card>
      <Card padding="default">
        <div className="row-between" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "var(--card-title-size)", fontWeight: 500 }}>月次予算</div>
          <Tag>5月 17日</Tag>
        </div>
        <Flex align="baseline" gap="small" style={{ marginBottom: 8 }}>
          <div className="stat" style={{ fontSize: "var(--text-xl)" }}>¥ 2.18M</div>
          <div style={muted}>/ ¥ 3.00M</div>
          <span className="delta up" style={{ marginLeft: "auto" }}>73%</span>
        </Flex>
        <div className="prog success"><i style={{ width: "73%" }} /></div>
      </Card>
    </div>
  ),
};

export const A7_Datalist: Story = {
  name: "A7 · Datalist (key/value)",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card title="5月度サマリー">
        <dl className="dl">
          <dt>所定時間</dt><dd>176.0 h</dd>
          <dt>実働時間</dt><dd>168.5 h</dd>
          <dt>残業時間</dt><dd>12.5 h</dd>
          <dt>有給取得</dt><dd>1.0 日</dd>
        </dl>
      </Card>
      <Card tone="muted" title="給与計算 · 暫定">
        <dl className="dl">
          <dt>基本給</dt><dd>¥ 240,000</dd>
          <dt>残業手当</dt><dd>¥ 22,800</dd>
          <dt>交通費</dt><dd>¥ 8,500</dd>
          <dt style={{ fontWeight: 500, color: "var(--foreground)" }}>支給合計</dt>
          <dd style={{ fontSize: "var(--card-title-size)" }}>¥ 271,300</dd>
        </dl>
      </Card>
    </div>
  ),
};

export const A8_Leaderboard: Story = {
  name: "A8 · Leaderboard (inline table)",
  render: () => (
    <Card padding="none">
      <CardHeader block title="店舗別 売上 Top 5" meta="5月 17日" />
      <CardBody block>
        <div className="dv-stack">
          {[
            ["渋谷本店", "¥ 4.82M", "+5.9%", "up"],
            ["表参道店", "¥ 3.15M", "+2.1%", "up"],
            ["自由が丘店", "¥ 2.94M", "-0.4%", "down"],
            ["新宿西口店", "¥ 2.18M", "—", "flat"],
            ["池袋店", "¥ 1.92M", "+8.2%", "up"],
          ].map(([store, amount, delta, dir]) => (
            <div key={store} className="row-between" style={{ fontSize: "var(--card-title-size)" }}>
              <span>{store}</span>
              <span className="mono" style={{ marginLeft: "auto", marginRight: 12 }}>{amount}</span>
              <span className={`delta ${dir}`}>{delta}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// B · ENTITY & PERSON
// ════════════════════════════════════════════════════════════════════

export const B1_PersonRow: Story = {
  name: "B1 · Person row",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {[
        { name: "Mai Nguyen", role: "Team lead · Engineering", tag: "success" as const, tagText: "On shift" },
        { name: "Hoang Le", role: "Designer", tag: "warning" as const, tagText: "PTO" },
        { name: "Akira Tanaka", role: "Operations", tag: "info" as const, tagText: "Remote" },
      ].map((p) => (
        <Card key={p.name} padding="tight" hoverable>
          <Flex gap="middle" align="center">
            <Avatar name={p.name} />
            <Flex vertical gap="small" style={{ minWidth: 0, flex: 1 }}>
              <strong style={{ fontSize: "var(--card-title-size)" }}>{p.name}</strong>
              <span style={muted}>{p.role}</span>
            </Flex>
            <Badge variant={p.tag}>{p.tagText}</Badge>
          </Flex>
        </Card>
      ))}
    </div>
  ),
};

export const B3_Profile: Story = {
  name: "B3 · Profile (banner + avatar + stats)",
  render: () => (
    <Card padding="none" style={{ maxWidth: 480 }}>
      <div style={{ height: 64, background: "linear-gradient(135deg, var(--primary), var(--info))" }} />
      <CardBody block>
        <Flex vertical gap="small" style={{ marginTop: -32 }}>
          <Avatar name="田中 美咲" size="xl" style={{ border: "2px solid var(--card)" }} />
          <strong style={{ fontSize: "var(--text-base)" }}>田中 美咲</strong>
          <span style={muted}>店長 · 渋谷本店 · 入社 2022/04</span>
          <Space size="small">
            <Tag color="primary">店長</Tag>
            <Tag>JP</Tag>
            <Tag>承認権限</Tag>
          </Space>
        </Flex>
      </CardBody>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// C · CONTENT & COMMERCE
// ════════════════════════════════════════════════════════════════════

export const C1_Article: Story = {
  name: "C1 · Article",
  render: () => (
    <Card padding="none" hoverable style={{ maxWidth: 420 }}>
      <div style={{ height: 140, background: "var(--secondary)" }} />
      <CardBody block>
        <Flex vertical gap="small">
          <span className="micro">プロダクト · 5月リリース</span>
          <strong style={{ fontSize: "var(--text-base)" }}>新しい勤怠ダッシュボード</strong>
          <span style={muted}>運用チームのフィードバックを反映した KPI ハイライト追加。</span>
        </Flex>
      </CardBody>
      <CardFooter block><Clock size={12} aria-hidden /> 5 分 · 2026-05-15</CardFooter>
    </Card>
  ),
};

export const C3_Pricing: Story = {
  name: "C3 · Pricing tier (3-up featured)",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {[
        { name: "Starter", price: "¥0", sub: "Up to 5", featured: false },
        { name: "Team", price: "¥2,900", sub: "Up to 50", featured: true },
        { name: "Enterprise", price: "—", sub: "Custom", featured: false },
      ].map((plan) => (
        <Card key={plan.name} padding="default" accent={plan.featured ? "featured" : undefined}
              hoverable title={plan.name} meta={plan.sub}
              extra={plan.featured ? <Tag color="primary">Popular</Tag> : undefined}>
          <Flex vertical gap="small">
            <span className="stat lg">{plan.price}{plan.price !== "—" && <span className="unit">/月</span>}</span>
            <Button block>{plan.price === "—" ? "Talk to sales" : "Subscribe"}</Button>
          </Flex>
        </Card>
      ))}
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════════
// D · WORKFLOW & ACTION
// ════════════════════════════════════════════════════════════════════

export const D1_Approval: Story = {
  name: "D1 · Approval",
  render: () => (
    <Card padding="none" style={{ maxWidth: 480 }}>
      <CardHeader block title="超勤申請" extra={<Tag color="primary">承認待ち</Tag>} />
      <CardBody block>
        <Flex gap="middle">
          <Avatar name="Mai Nguyen" />
          <Flex vertical gap="small" style={{ minWidth: 0 }}>
            <strong style={{ fontSize: "var(--card-title-size)" }}>Mai Nguyen</strong>
            <span style={muted}>Engineering · 2 時間前</span>
          </Flex>
        </Flex>
        <p style={{ margin: 0, fontSize: "var(--text-sm)" }}>
          2026-05-22 にリリース対応のため 4 時間の超勤を申請します。
        </p>
      </CardBody>
      <CardFooter actions block>
        <Button variant="ghost">却下</Button>
        <Button>承認</Button>
      </CardFooter>
    </Card>
  ),
};

export const D2_Step: Story = {
  name: "D2 · Step / wizard",
  render: () => (
    <Card title="オンボーディング" meta="3 / 5">
      <Flex vertical gap="middle">
        {[
          { done: true, label: "アカウント作成" },
          { done: true, label: "プロフィール入力" },
          { done: true, label: "勤怠端末ペアリング" },
          { done: false, label: "シフト初回登録", cur: true },
          { done: false, label: "管理者承認" },
        ].map((s, i) => (
          <Flex key={i} gap="middle" align="center">
            <span className={`ic ${s.done ? "success" : ""}`} style={{ width: 24, height: 24, fontSize: 12 }}>
              {s.done ? <CheckCircle2 size={14} aria-hidden /> : i + 1}
            </span>
            <span style={{ fontSize: "var(--card-title-size)", color: s.done ? "var(--muted-foreground)" : undefined }}>
              {s.label}
            </span>
            {s.cur && <Tag color="primary" style={{ marginLeft: "auto" }}>現在</Tag>}
          </Flex>
        ))}
      </Flex>
    </Card>
  ),
};

export const D5_CTA: Story = {
  name: "D5 · Action CTA (main action)",
  render: () => (
    <Card padding="cozy" accent="primary" style={{ maxWidth: 420 }}>
      <Flex vertical align="center" gap="middle" style={{ textAlign: "center" }}>
        <span className="ic xl"><Briefcase size={22} aria-hidden /></span>
        <strong style={{ fontSize: "var(--text-base)" }}>出勤を打刻</strong>
        <span style={muted}>10 時間 33 分の勤務がスタートします。</span>
        <Button size="large" block>打刻する</Button>
      </Flex>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// E · FEEDBACK · STATUS · SELECTION
// ════════════════════════════════════════════════════════════════════

export const E1_Notice: Story = {
  name: "E1 · Notice (4 semantic)",
  render: () => (
    <Flex vertical gap="middle">
      {[
        { acc: "info" as const, icon: <Info size={16} aria-hidden style={{ color: "var(--info)" }} />, t: "システムメンテナンス予定", d: "2026-05-25 02:00–04:00 UTC · 停止 ~10 分" },
        { acc: "attention" as const, icon: <CircleAlert size={16} aria-hidden style={{ color: "var(--attention)" }} />, t: "申請が 3 件保留中", d: "週末までに確認してください。" },
        { acc: "success" as const, icon: <CheckCircle2 size={16} aria-hidden style={{ color: "var(--success)" }} />, t: "5 月分の給与計算が完了", d: "従業員 42 名全員を処理。" },
        { acc: "destructive" as const, icon: <AlertTriangle size={16} aria-hidden style={{ color: "var(--destructive)" }} />, t: "インポート失敗", d: "shift-2026-05.csv · 18 行目" },
      ].map((n) => (
        <Card key={n.t} accent={n.acc} padding="tight">
          <Flex gap="middle" align="start">
            <span style={{ marginTop: 2 }}>{n.icon}</span>
            <Flex vertical gap="small">
              <strong style={{ fontSize: "var(--card-title-size)" }}>{n.t}</strong>
              <span style={muted}>{n.d}</span>
            </Flex>
          </Flex>
        </Card>
      ))}
    </Flex>
  ),
};

export const E2_Empty: Story = {
  name: "E2 · Empty state",
  render: () => (
    <Card tone="muted">
      <Flex vertical align="center" gap="middle" style={{ padding: "var(--spacing-6) 0", textAlign: "center" }}>
        <strong style={{ fontSize: "var(--card-title-size)" }}>承認待ちはありません</strong>
        <span style={muted}>新しい申請が届くとここに表示されます。</span>
      </Flex>
    </Card>
  ),
};

export const E4_Loading: Story = {
  name: "E4 · Loading / skeleton",
  render: () => (
    <Card padding="default">
      <Flex vertical gap="small">
        <span className="sk sk-title" />
        <span className="sk sk-line med" />
        <span className="sk sk-line short" />
        <span className="sk sk-block" />
      </Flex>
    </Card>
  ),
};

export const E5_Health: Story = {
  name: "E5 · Health / live status",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card padding="tight">
        <Flex gap="middle" align="center">
          <span className="dot success pulse" style={{ color: "var(--success)" }} />
          <Flex vertical gap="small">
            <strong style={{ fontSize: "var(--card-title-size)" }}>API · 正常稼働</strong>
            <span style={muted}>遅延 142ms</span>
          </Flex>
        </Flex>
      </Card>
      <Card padding="tight">
        <Flex gap="middle" align="center">
          <span className="dot warning" />
          <Flex vertical gap="small">
            <strong style={{ fontSize: "var(--card-title-size)" }}>同期遅延</strong>
            <span style={muted}>15 件処理待ち</span>
          </Flex>
        </Flex>
      </Card>
      <Card padding="tight">
        <Flex gap="middle" align="center">
          <span className="dot destructive" />
          <Flex vertical gap="small">
            <strong style={{ fontSize: "var(--card-title-size)" }}>店舗 #04 オフライン</strong>
            <span style={muted}>最終接続 14 分前</span>
          </Flex>
        </Flex>
      </Card>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════════
// F · SCHEDULE · LIST · TIMELINE
// ════════════════════════════════════════════════════════════════════

export const F1_Shift: Story = {
  name: "F1 · Shift week",
  render: () => (
    <Card title="今週のシフト" extra={<a href="#" style={{ fontSize: "var(--text-xs)", color: "var(--primary)" }}>全表示</a>}>
      <Flex vertical gap="small">
        {[
          { day: "月 5/13", time: "08:00–17:00", role: "早番" },
          { day: "火 5/14", time: "08:00–17:00", role: "早番" },
          { day: "水 5/15", time: "13:00–22:00", role: "遅番" },
          { day: "木 5/16", time: "—", role: "休み", off: true },
          { day: "金 5/17", time: "08:00–17:00", role: "早番" },
        ].map((row) => (
          <div key={row.day} className="row-between" style={{ paddingBottom: 8, borderBottom: "1px dashed var(--border)" }}>
            <span style={{ fontSize: "var(--card-title-size)", fontWeight: 500 }}>{row.day}</span>
            <span className="mono" style={{ fontSize: "var(--text-xs)" }}>{row.time}</span>
            <Tag color={row.off ? "default" : "primary"}>{row.role}</Tag>
          </div>
        ))}
      </Flex>
    </Card>
  ),
};

export const F4_Activity: Story = {
  name: "F4 · Activity feed",
  render: () => (
    <Card padding="none" title="Recent activity" extra={<a href="#" style={{ fontSize: "var(--text-xs)", color: "var(--primary)" }}>See all</a>}
          style={{ maxWidth: 480 }}>
      <CardBody block>
        {[
          { icon: <Bell size={14} aria-hidden />, label: "Hoang submitted leave request", time: "2 min" },
          { icon: <CheckCircle2 size={14} aria-hidden />, label: "Payroll approved by Akira", time: "1 hr" },
          { icon: <Users size={14} aria-hidden />, label: "Mai joined Engineering", time: "Yesterday" },
          { icon: <ExternalLink size={14} aria-hidden />, label: "Linked to Slack #ops", time: "2 days" },
        ].map((row, i) => (
          <Flex key={i} gap="middle" align="center"
                style={{ padding: "var(--spacing-2) 0", borderBottom: i < 3 ? "1px solid var(--border)" : undefined }}>
            <span style={{ color: "var(--muted-foreground)" }}>{row.icon}</span>
            <span style={{ flex: 1, fontSize: "var(--card-title-size)" }}>{row.label}</span>
            <span style={muted}>{row.time}</span>
          </Flex>
        ))}
      </CardBody>
      <CardFooter block><Clock size={12} aria-hidden /> Updated continuously</CardFooter>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// G · DIVIDERS (inside Card)
// ════════════════════════════════════════════════════════════════════

export const G1_Rules: Story = {
  name: "G1 · Plain rules",
  render: () => (
    <Card>
      <div style={muted}>Solid (default)</div>
      <hr className="dv" />
      <div style={muted}>Dashed</div>
      <hr className="dv dashed" />
      <div style={muted}>Dotted</div>
      <hr className="dv dotted" />
      <div style={muted}>Thick</div>
      <hr className="dv thick" />
      <div style={muted}>Gradient</div>
      <hr className="dv gradient" />
      <div style={muted}>After gradient</div>
    </Card>
  ),
};

export const G5_StackedList: Story = {
  name: "G5 · Stacked list (implicit divider)",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card>
        <div style={{ ...muted, marginBottom: 10 }}>Solid</div>
        <div className="dv-stack">
          <div style={{ fontSize: "var(--text-xs)" }}><b>渋谷本店</b><div style={muted}>12 名 · ¥4.8M</div></div>
          <div style={{ fontSize: "var(--text-xs)" }}><b>表参道店</b><div style={muted}>8 名 · ¥3.1M</div></div>
          <div style={{ fontSize: "var(--text-xs)" }}><b>自由が丘店</b><div style={muted}>6 名 · ¥2.9M</div></div>
        </div>
      </Card>
      <Card>
        <div style={{ ...muted, marginBottom: 10 }}>Dashed</div>
        <div className="dv-stack dashed">
          <div style={{ fontSize: "var(--text-xs)", display: "flex", justifyContent: "space-between" }}>
            <span>基本給</span><span className="mono">¥ 240,000</span>
          </div>
          <div style={{ fontSize: "var(--text-xs)", display: "flex", justifyContent: "space-between" }}>
            <span>残業手当</span><span className="mono">¥ 22,800</span>
          </div>
          <div style={{ fontSize: "var(--text-xs)", display: "flex", justifyContent: "space-between", fontWeight: 500 }}>
            <span>合計</span><span className="mono">¥ 263,300</span>
          </div>
        </div>
      </Card>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════════
// H · CARD HEADERS — 16 variants
// ════════════════════════════════════════════════════════════════════

export const H1_TitleOnly: Story = {
  name: "H1 · Title only",
  render: () => (
    <Card padding="none">
      <CardHeader block title="タイトルのみ" />
      <CardBody block><span style={muted}>最小限のヘッダー。</span></CardBody>
    </Card>
  ),
};

export const H2_Stack: Story = {
  name: "H2 · Stacked title + subtitle",
  render: () => (
    <Card padding="none">
      <CardHeader block title="スタック構成" subtitle="タイトル + 補足 (1 行ずつ縦に積む)" />
      <CardBody block><span style={muted}>subtitle dài 1–2 dòng OK.</span></CardBody>
    </Card>
  ),
};

export const H3_MetaRight: Story = {
  name: "H3 · Title + meta-right",
  render: () => (
    <Card padding="none">
      <CardHeader block title="メタ右" meta="5月 17日 · 14 件" />
      <CardBody block><span style={muted}>timestamp / count phải mono.</span></CardBody>
    </Card>
  ),
};

export const H4_Action: Story = {
  name: "H4 · With single action",
  render: () => (
    <Card padding="none">
      <CardHeader block title="承認待ち一覧" meta="12 件"
        extra={<Button size="small" variant="outline">一括承認</Button>} />
      <CardBody block><span style={muted}>1 chính + meta — action ngắn.</span></CardBody>
    </Card>
  ),
};

export const H5_ActionGroup: Story = {
  name: "H5 · With action group",
  render: () => (
    <Card padding="none">
      <CardHeader block title="勤怠データ" extra={
        <Space size="small">
          <Button size="small" variant="ghost" aria-label="Filter"><Filter size={14} aria-hidden /></Button>
          <Button size="small" variant="ghost" aria-label="Export"><UploadIcon size={14} aria-hidden /></Button>
          <Button size="small" variant="secondary">フィルタ</Button>
          <Button size="small">＋ 新規</Button>
        </Space>
      } />
      <CardBody block><span style={muted}>Icon-only trái, labeled phải.</span></CardBody>
    </Card>
  ),
};

export const H6_IconHeader: Story = {
  name: "H6 · Icon header",
  render: () => (
    <Card padding="none">
      <CardHeader block>
        <span className="ic" style={{ width: 28, height: 28 }}><Clock size={14} aria-hidden /></span>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
          <span className="card-title">本日の打刻</span>
          <span style={muted}>リアルタイム</span>
        </div>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: "var(--card-meta-size)" }}>
          <span className="dot success pulse" style={{ color: "var(--success)" }} /> LIVE
        </span>
      </CardHeader>
      <CardBody block><span style={muted}>Icon w/ tinted background — semantic.</span></CardBody>
    </Card>
  ),
};

export const H7_AvatarHeader: Story = {
  name: "H7 · Avatar header",
  render: () => (
    <Card padding="none">
      <CardHeader block>
        <Avatar name="田中 美咲" size="sm" />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
          <span className="card-title">田中 美咲</span>
          <span style={muted}>店長 · 渋谷本店</span>
        </div>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: "var(--card-meta-size)" }}>
          <span className="dot success" /> 勤務中
        </span>
      </CardHeader>
      <CardBody block><span style={muted}>Avatar — entity card (人 · チーム · 組織).</span></CardBody>
    </Card>
  ),
};

export const H10_SearchHeader: Story = {
  name: "H10 · Search header",
  render: () => (
    <Card padding="none">
      <CardHeader block title="従業員一覧" meta="· 38 名">
        <span style={{
          marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6,
          padding: "0 8px", height: 28, border: "1px solid var(--input)",
          borderRadius: "var(--radius-md)", background: "var(--input-background)",
          maxWidth: 280,
        }}>
          <Search size={14} aria-hidden style={{ color: "var(--muted-foreground)" }} />
          <input placeholder="名前 / メール"
            style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontSize: "var(--text-sm)", fontFamily: "inherit", minWidth: 0 }} />
          <kbd style={{ padding: "1px 6px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
            background: "var(--secondary)", fontSize: 10, color: "var(--muted-foreground)" }}>⌘K</kbd>
        </span>
      </CardHeader>
      <CardBody block><span style={muted}>Search input căn phải, max 280px.</span></CardBody>
    </Card>
  ),
};

export const H11_ColorBand: Story = {
  name: "H11 · Color band",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {([
        ["primary", "プロジェクト"],
        ["success", "承認済"],
        ["attention", "要対応"],
        ["destructive", "エラー"],
        ["warning", "下書き"],
        ["info", "情報"],
        ["gradient", "特集"],
        ["dotted", "下書き"],
      ] as const).map(([band, label]) => (
        <Card key={band} padding="none" band={band}>
          <CardHeader block title={label} meta={band} />
        </Card>
      ))}
    </div>
  ),
};

export const H12_Kicker: Story = {
  name: "H12 · Kicker (3-tier hierarchy)",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card padding="none">
        <CardHeader block kicker="5月度 · 暫定" title="¥ 8,420,500" subtitle="支払合計 · 38 名 · 振込日 5/25" />
        <CardBody block><span style={muted}>Kicker (uppercase) · big title (h2).</span></CardBody>
      </Card>
      <Card padding="none">
        <CardHeader block kicker="特集記事" title="2026 年 6 月リリース予定の新機能" subtitle="シフト自動最適化と多店舗在庫連携を導入" />
        <CardBody block><span style={muted}>Article hierarchy 3 cấp.</span></CardBody>
      </Card>
    </div>
  ),
};

export const H13_Hero: Story = {
  name: "H13 · Hero (branded promo)",
  render: () => (
    <Card padding="none">
      <div style={{
        padding: "20px var(--density-card)",
        background: "linear-gradient(135deg, var(--info), var(--primary))",
        color: "var(--primary-foreground)",
      }}>
        <div className="card-kicker" style={{ color: "rgba(255,255,255,0.85)" }}>NEW · 6月リリース</div>
        <h3 style={{ margin: "4px 0", fontSize: "var(--text-xl)", fontWeight: 500 }}>シフト自動最適化</h3>
        <p style={{ margin: 0, fontSize: "var(--text-sm)", opacity: 0.9 }}>需要予測 + スキル + 希望で最適なシフトを生成</p>
        <Space size="small" style={{ marginTop: 12 }}>
          <Button size="small" style={{ background: "var(--card)", color: "var(--info)" }}>試験運用に参加</Button>
          <Button size="small" variant="ghost" style={{ color: "var(--primary-foreground)" }}>あとで</Button>
        </Space>
      </div>
      <CardBody block><span style={muted}>Hero — branded promo + CTA.</span></CardBody>
    </Card>
  ),
};

export const H15_Toolbar: Story = {
  name: "H15 · Toolbar (view switcher + date nav)",
  render: () => (
    <Card padding="none">
      <CardHeader block>
        <span className="card-title">シフト</span>
        <Space size="small">
          <Button size="small" variant="ghost">日</Button>
          <Button size="small" variant="primary">週</Button>
          <Button size="small" variant="ghost">月</Button>
        </Space>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
          <Button size="small" variant="ghost" aria-label="前週">‹</Button>
          <span className="mono" style={{ fontSize: "var(--text-xs)", padding: "0 6px" }}>5/12 – 5/18</span>
          <Button size="small" variant="ghost" aria-label="翌週">›</Button>
        </span>
        <span style={{ marginLeft: "auto" }}>
          <Button size="small" variant="secondary" startContent={<Plus size={14} aria-hidden />}>シフト追加</Button>
        </span>
      </CardHeader>
      <CardBody block><span style={muted}>View seg + date nav + primary action.</span></CardBody>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// Mobile-first showcase (cardinal rule 24)
// ════════════════════════════════════════════════════════════════════

export const MobileFirstGrid: Story = {
  name: "Mobile-first (cardinal rule 24)",
  parameters: {
    docs: {
      description: {
        story: `Resize the Storybook canvas (Viewports toolbar) to
**mobile1** (< 768px) and observe the grid collapsing to one
column. Every Card story above uses \`grid-cols-1 md:grid-cols-N\`
so phones get a stacked layout and desktops get the multi-column
canon shape.`.trim(),
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} padding="tight" title={`Card ${i + 1}`} meta={`item ${i + 1}`}>
          <span style={muted}>
            Stacks 1-col on phone, 2-col on tablet, 3-col on laptop,
            4-col on desktop. Touch targets inside (Buttons) floor to 44px
            on \`xs/sm\`.
          </span>
        </Card>
      ))}
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════════
// Pattern matrix — axes sweep
// ════════════════════════════════════════════════════════════════════

export const Grid: Story = {
  name: "Pattern matrix (axes sweep)",
  parameters: {
    docs: {
      description: {
        story: `Sweep the Storybook toolbar (theme × accent × density ×
fontSize) and observe every variant adapt. All values token-pinned.`.trim(),
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card padding="tight" title="tight">short</Card>
      <Card padding="cozy" title="cozy">wide</Card>
      <Card tone="muted" title="muted">tone</Card>
      <Card tone="outline-only" title="outline">tone</Card>
      <Card accent="primary" title="accent primary">edge</Card>
      <Card accent="success" title="accent success">edge</Card>
      <Card accent="featured" title="featured">ring</Card>
      <Card band="primary" padding="none">
        <CardHeader block title="band" />
      </Card>
      <Card padding="none">
        <CardHeader block kicker="KICKER" title="¥1,234,567" subtitle="3-tier" />
      </Card>
      <Card hoverable title="hoverable">lift</Card>
      <Card title="meta-right" meta="14 件">row</Card>
      <Card title="with extra" extra={<Tag color="primary">Live</Tag>}>row</Card>
    </div>
  ),
};

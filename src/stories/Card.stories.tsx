import type { Meta, StoryObj } from "@storybook/react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Gauge,
  Info,
  Mail,
  MoreHorizontal,
  Package,
  Search,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";
import { Tag } from "../components/primitives/Tag";
import { Badge } from "../components/primitives/Badge";
import { Avatar } from "../components/primitives/Avatar";
import { Statistic } from "../components/primitives/Statistic";
import { Flex, Row, Col, Space } from "../components/primitives/layout";

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Card** — surface container. 100% mapped to the dxs-kintai design
canon ([\`comp-card.html\`](https://github.com/godx-jp/godxjp-ui/blob/main/design-handoff/ui-system/dxs-kintai-design-system/project/preview/comp-card.html)).

One atom (\`.card\`, 1px border, 6px radius, \`var(--card)\` bg,
no shadow at rest) + four orthogonal prop axes:

| Prop | Values | Effect |
|---|---|---|
| \`padding\` | \`tight\` / \`default\` / \`cozy\` / \`none\` | 12 / 16 / 20 / 0 px |
| \`tone\` | \`default\` / \`muted\` / \`outline-only\` | bg = card / secondary / transparent |
| \`accent\` | \`primary\` / \`success\` / \`warning\` / \`attention\` / \`info\` / \`destructive\` / \`featured\` | 3px left edge or full ring |
| \`hoverable\` | boolean | border + shadow lift |

Per cardinal rule 21 every modifier reads from semantic tokens —
theme / accent / density / font-size axes flow through unchanged.
Per cardinal rule 22 every visual literal (padding 10/16, 14/16;
title 13px / 500; subtitle 11px) is pinned via token (\`--card-pad-y-*\`,
\`--card-title-size\`, \`--card-meta-size\`) to the design canon.

The 50+ stories below exercise sections A–H from the design canon.
Switch the Storybook toolbar through theme × accent × density ×
fontSize to confirm every section adapts.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Card>;

const muted: React.CSSProperties = {
  fontSize: "var(--card-meta-size)",
  color: "var(--muted-foreground)",
};

// ════════════════════════════════════════════════════════════════════
// API / axes (pre-design-canon — for navigation in the sidebar)
// ════════════════════════════════════════════════════════════════════

export const Default: Story = {
  render: () => (
    <Card title="Pull requests" subtitle="Open this week" extra={<a href="#">More</a>}>
      <p>Body content goes here.</p>
    </Card>
  ),
};

export const PaddingAxis: Story = {
  name: "Axis · padding",
  render: () => (
    <Row gutter={[16, 16]}>
      <Col span={6}>
        <Card padding="tight" title="tight (12)">tight body</Card>
      </Col>
      <Col span={6}>
        <Card padding="default" title="default (16)">default body</Card>
      </Col>
      <Col span={6}>
        <Card padding="cozy" title="cozy (20)">cozy body</Card>
      </Col>
      <Col span={6}>
        <Card padding="none">
          <CardHeader title="none — explicit regions" block />
          <CardBody block>Body pads itself.</CardBody>
          <CardFooter actions block>
            <Button size="small">OK</Button>
          </CardFooter>
        </Card>
      </Col>
    </Row>
  ),
};

export const ToneAxis: Story = {
  name: "Axis · tone",
  render: () => (
    <Row gutter={[16, 16]}>
      <Col span={8}><Card title="default">bg: --card</Card></Col>
      <Col span={8}><Card tone="muted" title="muted">bg: --secondary</Card></Col>
      <Col span={8}><Card tone="outline-only" title="outline">bg: transparent</Card></Col>
    </Row>
  ),
};

export const AccentAxis: Story = {
  name: "Axis · accent",
  render: () => (
    <Row gutter={[16, 16]}>
      {(["primary","success","warning","attention","info","destructive"] as const).map((a) => (
        <Col span={8} key={a}><Card accent={a} title={a}>Edge accent.</Card></Col>
      ))}
      <Col span={8}>
        <Card accent="featured" title="featured">Full --primary ring.</Card>
      </Col>
    </Row>
  ),
};

// ════════════════════════════════════════════════════════════════════
// A · Data display — stat / trend / sparkline / progress / table / datalist
// ════════════════════════════════════════════════════════════════════

export const A_StatSimple: Story = {
  name: "A1 · Stat — simple",
  render: () => (
    <Row gutter={[14, 14]}>
      <Col span={6}>
        <Card padding="tight">
          <Flex vertical gap="small">
            <span className="micro">出勤率</span>
            <div className="row-between">
              <span className="stat">96.8<span className="unit">%</span></span>
              <span className="delta up"><TrendingUp size={11} aria-hidden /> +1.2</span>
            </div>
          </Flex>
        </Card>
      </Col>
      <Col span={6}>
        <Card padding="tight">
          <Flex vertical gap="small">
            <span className="micro">遅刻件数</span>
            <div className="row-between">
              <span className="stat">12</span>
              <span className="delta down"><TrendingDown size={11} aria-hidden /> +3</span>
            </div>
          </Flex>
        </Card>
      </Col>
      <Col span={6}>
        <Card padding="tight">
          <Flex vertical gap="small">
            <span className="micro">超勤時間</span>
            <div className="row-between">
              <span className="stat">42.5<span className="unit">h</span></span>
              <span className="delta flat">—</span>
            </div>
          </Flex>
        </Card>
      </Col>
      <Col span={6}>
        <Card padding="tight">
          <Flex vertical gap="small">
            <span className="micro">月間給与総額</span>
            <span className="stat lg">¥1,234,567</span>
            <span style={muted}>前月比 +5.4%</span>
          </Flex>
        </Card>
      </Col>
    </Row>
  ),
};

export const A_StatProgress: Story = {
  name: "A2 · Stat with progress",
  render: () => (
    <Row gutter={[14, 14]}>
      <Col span={8}>
        <Card padding="tight">
          <Flex vertical gap="small">
            <div className="row-between">
              <span className="micro">月次目標</span>
              <span style={muted}>78 / 100</span>
            </div>
            <span className="stat">78<span className="unit">%</span></span>
            <div className="prog"><i style={{ width: "78%" }} /></div>
          </Flex>
        </Card>
      </Col>
      <Col span={8}>
        <Card padding="tight">
          <Flex vertical gap="small">
            <div className="row-between">
              <span className="micro">勤怠承認率</span>
              <span style={muted}>92 / 100</span>
            </div>
            <span className="stat">92<span className="unit">%</span></span>
            <div className="prog success"><i style={{ width: "92%" }} /></div>
          </Flex>
        </Card>
      </Col>
      <Col span={8}>
        <Card padding="tight">
          <Flex vertical gap="small">
            <div className="row-between">
              <span className="micro">未処理申請</span>
              <span style={muted}>3 / 20</span>
            </div>
            <span className="stat">15<span className="unit">%</span></span>
            <div className="prog attention"><i style={{ width: "15%" }} /></div>
          </Flex>
        </Card>
      </Col>
    </Row>
  ),
};

export const A_Datalist: Story = {
  name: "A3 · Datalist",
  render: () => (
    <Card title="勤務状況" subtitle="2026-05-15 (水)" padding="default">
      <dl className="dl">
        <dt>出勤時刻</dt><dd>09:02</dd>
        <dt>退勤時刻</dt><dd>18:14</dd>
        <dt>勤務時間</dt><dd>8:42</dd>
        <dt>休憩</dt><dd>1:00</dd>
        <dt>残業</dt><dd>0:42</dd>
      </dl>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// B · Entity & person
// ════════════════════════════════════════════════════════════════════

export const B_PersonRow: Story = {
  name: "B1 · Person row",
  render: () => (
    <Row gutter={[14, 14]}>
      {[
        { name: "Mai Nguyen", role: "Team lead · Engineering", tag: "success", tagText: "On shift" },
        { name: "Hoang Le",  role: "Designer",                  tag: "warning", tagText: "PTO" },
        { name: "Akira Tanaka", role: "Operations",            tag: "info",    tagText: "Remote" },
      ].map((p) => (
        <Col span={8} key={p.name}>
          <Card padding="tight" hoverable>
            <Flex gap="middle" align="center">
              <Avatar name={p.name} />
              <Flex vertical gap="small" style={{ minWidth: 0, flex: 1 }}>
                <strong style={{ fontSize: "var(--card-title-size)" }}>{p.name}</strong>
                <span style={muted}>{p.role}</span>
              </Flex>
              <Badge variant={p.tag as "success" | "warning" | "info"}>{p.tagText}</Badge>
            </Flex>
          </Card>
        </Col>
      ))}
    </Row>
  ),
};

export const B_Profile: Story = {
  name: "B2 · Profile",
  render: () => (
    <Card padding="none" style={{ maxWidth: 360 }}>
      <CardBody block>
        <Flex vertical align="center" gap="small">
          <Avatar name="Mai Nguyen" size="xl" />
          <strong style={{ fontSize: "var(--text-base)" }}>Mai Nguyen</strong>
          <span style={muted}>Team lead · Engineering · Tokyo</span>
          <Space size="small">
            <Tag color="primary">Manager</Tag>
            <Tag>JP fluent</Tag>
            <Tag>EN fluent</Tag>
          </Space>
        </Flex>
      </CardBody>
      <CardFooter actions block>
        <Button variant="ghost" size="small"><Mail size={14} aria-hidden /> Message</Button>
        <Button size="small">View profile</Button>
      </CardFooter>
    </Card>
  ),
};

export const B_Team: Story = {
  name: "B3 · Team / org",
  render: () => (
    <Card padding="default" title="Engineering" extra={<Tag>12 members</Tag>}>
      <Flex gap="small">
        {["Mai Nguyen","Hoang Le","Akira Tanaka","Yuki Sato","Linh Pham"].map((n) => (
          <Avatar key={n} name={n} size="sm" />
        ))}
        <Avatar size="sm">+7</Avatar>
      </Flex>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// C · Content & commerce
// ════════════════════════════════════════════════════════════════════

export const C_Article: Story = {
  name: "C1 · Article",
  render: () => (
    <Card padding="none" hoverable style={{ maxWidth: 420 }}>
      <div style={{ height: 140, background: "var(--secondary)" }} />
      <CardBody block>
        <Flex vertical gap="small">
          <span className="micro">プロダクト · 5月リリース</span>
          <strong style={{ fontSize: "var(--text-base)" }}>新しい勤怠ダッシュボードのリリース</strong>
          <span style={muted}>
            運用チームのフィードバックを反映した KPI ハイライトとシフト
            ホットスポット可視化を追加しました。
          </span>
        </Flex>
      </CardBody>
      <CardFooter block>
        <Clock size={12} aria-hidden /> 5 分で読める · 2026-05-15
      </CardFooter>
    </Card>
  ),
};

export const C_Product: Story = {
  name: "C2 · Product",
  render: () => (
    <Row gutter={[14, 14]}>
      {[
        { name: "Starter", price: 0, sub: "Up to 5 employees", featured: false },
        { name: "Team", price: 2900, sub: "Up to 50 employees", featured: true },
        { name: "Enterprise", price: null, sub: "Custom", featured: false },
      ].map((plan) => (
        <Col span={8} key={plan.name}>
          <Card
            padding="default"
            accent={plan.featured ? "featured" : undefined}
            hoverable
            extra={plan.featured ? <Tag color="primary">Popular</Tag> : undefined}
            title={plan.name}
            subtitle={plan.sub}
            footer={plan.price === null ? "Contact sales" : <><CreditCard size={12} aria-hidden /> Billed monthly</>}
          >
            <Flex vertical gap="small">
              <span className="stat lg">
                {plan.price === null ? "—" : `¥${plan.price}`}
                {plan.price !== null && <span className="unit">/月</span>}
              </span>
              <Button>{plan.price === null ? "Talk to sales" : "Subscribe"}</Button>
            </Flex>
          </Card>
        </Col>
      ))}
    </Row>
  ),
};

export const C_Feature: Story = {
  name: "C3 · Feature highlight",
  render: () => (
    <Row gutter={[14, 14]}>
      <Col span={8}>
        <Card padding="default">
          <Flex vertical gap="small">
            <span className="ic info"><Gauge size={16} aria-hidden /></span>
            <strong style={{ fontSize: "var(--card-title-size)" }}>リアルタイム勤怠</strong>
            <span style={muted}>5秒間隔の打刻同期で、現場の出退勤がそのまま管理ダッシュボードに反映されます。</span>
          </Flex>
        </Card>
      </Col>
      <Col span={8}>
        <Card padding="default">
          <Flex vertical gap="small">
            <span className="ic success"><Zap size={16} aria-hidden /></span>
            <strong style={{ fontSize: "var(--card-title-size)" }}>自動承認ルール</strong>
            <span style={muted}>事前定義のしきい値で残業申請を一次承認、複雑な業務だけ人手にエスカレーション。</span>
          </Flex>
        </Card>
      </Col>
      <Col span={8}>
        <Card padding="default">
          <Flex vertical gap="small">
            <span className="ic attention"><Wifi size={16} aria-hidden /></span>
            <strong style={{ fontSize: "var(--card-title-size)" }}>オフライン対応</strong>
            <span style={muted}>店舗の通信が落ちても打刻は端末に保持され、復旧時にバッチで反映されます。</span>
          </Flex>
        </Card>
      </Col>
    </Row>
  ),
};

// ════════════════════════════════════════════════════════════════════
// D · Workflow & action
// ════════════════════════════════════════════════════════════════════

export const D_Approval: Story = {
  name: "D1 · Approval",
  render: () => (
    <Card padding="none" style={{ maxWidth: 480 }}>
      <CardHeader title="超勤申請" extra={<Tag color="primary">承認待ち</Tag>} block />
      <CardBody block>
        <Flex vertical gap="middle">
          <Flex gap="middle">
            <Avatar name="Mai Nguyen" />
            <Flex vertical gap="small" style={{ minWidth: 0 }}>
              <strong style={{ fontSize: "var(--card-title-size)" }}>Mai Nguyen</strong>
              <span style={muted}>Engineering · 2 時間前に申請</span>
            </Flex>
          </Flex>
          <p style={{ margin: 0, fontSize: "var(--text-sm)" }}>
            2026-05-22 にリリース対応のため 4 時間の超勤を申請します。タイムゾーンの引き継ぎは Akira と調整済み。
          </p>
        </Flex>
      </CardBody>
      <CardFooter actions block>
        <Button variant="ghost">却下</Button>
        <Button>承認</Button>
      </CardFooter>
    </Card>
  ),
};

export const D_Step: Story = {
  name: "D2 · Step / progress",
  render: () => (
    <Card title="オンボーディング" subtitle="3 / 5 完了">
      <Flex vertical gap="middle">
        {[
          { done: true,  label: "アカウント作成" },
          { done: true,  label: "プロフィール入力" },
          { done: true,  label: "勤怠端末ペアリング" },
          { done: false, label: "シフト初回登録",       cur: true },
          { done: false, label: "管理者承認" },
        ].map((s, i) => (
          <Flex key={i} gap="middle" align="center">
            <span
              className={`ic ${s.done ? "success" : s.cur ? "" : ""}`}
              style={{ width: 24, height: 24, fontSize: 12 }}
            >
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

export const D_Settings: Story = {
  name: "D3 · Settings rows",
  render: () => (
    <Card title="通知設定" padding="default">
      <Flex vertical gap="middle">
        {[
          { t: "申請承認", d: "新規申請が届いたときに通知" },
          { t: "シフト変更", d: "シフトに変更が入ったときに通知" },
          { t: "残業しきい値", d: "月 40 時間を超えたら通知" },
        ].map((r) => (
          <div key={r.t} className="row-between" style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
            <Flex vertical gap="small">
              <strong style={{ fontSize: "var(--card-title-size)" }}>{r.t}</strong>
              <span style={muted}>{r.d}</span>
            </Flex>
            <Button size="small" variant="ghost">編集</Button>
          </div>
        ))}
      </Flex>
    </Card>
  ),
};

export const D_CTA: Story = {
  name: "D4 · CTA / main action",
  render: () => (
    <Card padding="cozy" accent="primary" style={{ maxWidth: 420 }}>
      <Flex vertical align="center" gap="middle" style={{ textAlign: "center", padding: 12 }}>
        <span className="ic xl"><Briefcase size={22} aria-hidden /></span>
        <strong style={{ fontSize: "var(--text-base)" }}>出勤を打刻</strong>
        <span style={muted}>10 時間 33 分の勤務がスタートします。</span>
        <Button size="large" style={{ width: "100%" }}>打刻する</Button>
      </Flex>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// E · Feedback · status · selection
// ════════════════════════════════════════════════════════════════════

export const E_Notice: Story = {
  name: "E1 · Notice",
  render: () => (
    <Flex vertical gap="middle">
      <Card accent="info" padding="tight">
        <Flex gap="middle" align="start">
          <Info size={16} aria-hidden style={{ color: "var(--info)", marginTop: 2 }} />
          <Flex vertical gap="small">
            <strong style={{ fontSize: "var(--card-title-size)" }}>システムメンテナンス予定</strong>
            <span style={muted}>2026-05-25 02:00–04:00 UTC · 予定停止 ~10 分</span>
          </Flex>
        </Flex>
      </Card>
      <Card accent="attention" padding="tight">
        <Flex gap="middle" align="start">
          <CircleAlert size={16} aria-hidden style={{ color: "var(--attention)", marginTop: 2 }} />
          <Flex vertical gap="small">
            <strong style={{ fontSize: "var(--card-title-size)" }}>申請が 3 件保留中</strong>
            <span style={muted}>週末までに確認してください。</span>
          </Flex>
        </Flex>
      </Card>
      <Card accent="success" padding="tight">
        <Flex gap="middle" align="start">
          <CheckCircle2 size={16} aria-hidden style={{ color: "var(--success)", marginTop: 2 }} />
          <Flex vertical gap="small">
            <strong style={{ fontSize: "var(--card-title-size)" }}>5 月分の給与計算が完了しました</strong>
            <span style={muted}>従業員 42 名全員を処理。</span>
          </Flex>
        </Flex>
      </Card>
      <Card accent="destructive" padding="tight">
        <Flex gap="middle" align="start">
          <AlertTriangle size={16} aria-hidden style={{ color: "var(--destructive)", marginTop: 2 }} />
          <Flex vertical gap="small">
            <strong style={{ fontSize: "var(--card-title-size)" }}>インポート失敗</strong>
            <span style={muted}>shift-2026-05.csv · 18 行目の日付フォーマットが不正です。</span>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  ),
};

export const E_Empty: Story = {
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

export const E_Loading: Story = {
  name: "E3 · Loading / skeleton",
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

export const E_Health: Story = {
  name: "E4 · Health / live",
  render: () => (
    <Row gutter={[14, 14]}>
      <Col span={8}>
        <Card padding="tight">
          <Flex gap="middle" align="center">
            <span className="dot success pulse" style={{ color: "var(--success)" }} />
            <Flex vertical gap="small">
              <strong style={{ fontSize: "var(--card-title-size)" }}>API · 正常稼働</strong>
              <span style={muted}>遅延 142ms · 直近 5 分平均</span>
            </Flex>
          </Flex>
        </Card>
      </Col>
      <Col span={8}>
        <Card padding="tight">
          <Flex gap="middle" align="center">
            <span className="dot warning" />
            <Flex vertical gap="small">
              <strong style={{ fontSize: "var(--card-title-size)" }}>同期遅延</strong>
              <span style={muted}>15 件の打刻が処理待ち</span>
            </Flex>
          </Flex>
        </Card>
      </Col>
      <Col span={8}>
        <Card padding="tight">
          <Flex gap="middle" align="center">
            <span className="dot destructive" />
            <Flex vertical gap="small">
              <strong style={{ fontSize: "var(--card-title-size)" }}>店舗 #04 オフライン</strong>
              <span style={muted}>最終接続: 14 分前</span>
            </Flex>
          </Flex>
        </Card>
      </Col>
    </Row>
  ),
};

export const E_Choice: Story = {
  name: "E5 · Choice / selection",
  render: () => (
    <Row gutter={[14, 14]}>
      <Col span={12}>
        <div className="choice on">
          <span className="choice-radio" />
          <div className="choice-meta">
            <span className="choice-title">月次プラン</span>
            <span className="choice-desc">¥2,900/月 · いつでもキャンセル可</span>
          </div>
        </div>
      </Col>
      <Col span={12}>
        <div className="choice">
          <span className="choice-radio" />
          <div className="choice-meta">
            <span className="choice-title">年次プラン</span>
            <span className="choice-desc">¥29,000/年 · 2 ヶ月分お得</span>
          </div>
        </div>
      </Col>
    </Row>
  ),
};

// ════════════════════════════════════════════════════════════════════
// F · Schedule · list · timeline
// ════════════════════════════════════════════════════════════════════

export const F_Shift: Story = {
  name: "F1 · Shift",
  render: () => (
    <Card padding="default" title="今週のシフト" extra={<a href="#" className="lnk">全表示</a>}>
      <Flex vertical gap="small">
        {[
          { day: "月 5/13", time: "08:00–17:00", role: "早番" },
          { day: "火 5/14", time: "08:00–17:00", role: "早番" },
          { day: "水 5/15", time: "13:00–22:00", role: "遅番" },
          { day: "木 5/16", time: "—",           role: "休み", off: true },
          { day: "金 5/17", time: "08:00–17:00", role: "早番" },
        ].map((row) => (
          <div key={row.day} className="row-between" style={{ paddingBottom: 8, borderBottom: "1px dashed var(--border)" }}>
            <span style={{ fontSize: "var(--card-title-size)", fontWeight: 500 }}>{row.day}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}>{row.time}</span>
            <Tag color={row.off ? "default" : "primary"}>{row.role}</Tag>
          </div>
        ))}
      </Flex>
    </Card>
  ),
};

export const F_List: Story = {
  name: "F2 · Ranked list / activity",
  render: () => (
    <Card padding="none" title="Recent activity" extra={<a href="#" className="lnk">See all</a>} style={{ maxWidth: 480 }}>
      <CardBody block>
        {[
          { icon: <Bell size={14} aria-hidden />, label: "Hoang submitted leave request", time: "2 min" },
          { icon: <CheckCircle2 size={14} aria-hidden />, label: "Payroll approved by Akira", time: "1 hr" },
          { icon: <Users size={14} aria-hidden />, label: "Mai joined Engineering", time: "Yesterday" },
          { icon: <ExternalLink size={14} aria-hidden />, label: "Linked to Slack #ops", time: "2 days" },
        ].map((row, i) => (
          <Flex
            key={i}
            gap="middle"
            align="center"
            style={{
              padding: "var(--spacing-2) 0",
              borderBottom: i < 3 ? "1px solid var(--border)" : undefined,
            }}
          >
            <span style={muted}>{row.icon}</span>
            <span style={{ flex: 1, fontSize: "var(--card-title-size)" }}>{row.label}</span>
            <span style={muted}>{row.time}</span>
          </Flex>
        ))}
      </CardBody>
      <CardFooter block><Clock size={12} aria-hidden /> Updated continuously</CardFooter>
    </Card>
  ),
};

export const F_Timeline: Story = {
  name: "F3 · Timeline",
  render: () => (
    <Card padding="default" title="2026-05-15 タイムライン">
      <Flex vertical gap="middle">
        {[
          { t: "09:02", label: "出勤打刻",     icon: <CheckCircle2 size={14} aria-hidden style={{ color: "var(--success)" }} /> },
          { t: "10:30", label: "ミーティング", icon: <Users size={14} aria-hidden style={{ color: "var(--info)" }} /> },
          { t: "12:30", label: "休憩",         icon: <Clock size={14} aria-hidden style={{ color: "var(--muted-foreground)" }} /> },
          { t: "18:14", label: "退勤打刻",     icon: <CheckCircle2 size={14} aria-hidden style={{ color: "var(--success)" }} /> },
        ].map((r) => (
          <Flex key={r.t} gap="middle" align="center">
            <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--muted-foreground)", width: 48 }}>{r.t}</span>
            {r.icon}
            <span style={{ fontSize: "var(--card-title-size)" }}>{r.label}</span>
          </Flex>
        ))}
      </Flex>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// H · Card headers (16 variants — sampled)
// ════════════════════════════════════════════════════════════════════

export const H_Headers: Story = {
  name: "H · Header variants",
  render: () => (
    <Row gutter={[14, 14]}>
      <Col span={12}>
        <Card title="Title only">Body.</Card>
      </Col>
      <Col span={12}>
        <Card title="With subtitle" subtitle="and meta text">Body.</Card>
      </Col>
      <Col span={12}>
        <Card title="With extra" extra={<Tag color="primary">Live</Tag>}>Body.</Card>
      </Col>
      <Col span={12}>
        <Card title="With actions" extra={<Button size="small" variant="ghost"><MoreHorizontal size={14} aria-hidden /></Button>}>Body.</Card>
      </Col>
      <Col span={12}>
        <Card padding="none">
          <CardHeader block title={<Flex gap="small" align="center"><span className="ic"><FileText size={14} aria-hidden /></span>With icon</Flex>} />
          <CardBody block>Body in flush card with icon header.</CardBody>
        </Card>
      </Col>
      <Col span={12}>
        <Card padding="none">
          <CardHeader block title={<Flex gap="small" align="center"><Avatar name="Mai Nguyen" size="sm" />With avatar</Flex>} extra={<Tag>Owner</Tag>} />
          <CardBody block>Body in flush card with avatar header.</CardBody>
        </Card>
      </Col>
      <Col span={12}>
        <Card padding="none">
          <CardHeader block title="Live" extra={<Flex gap="small" align="center"><span className="dot success pulse" style={{ color: "var(--success)" }} /><span className="micro">on air</span></Flex>} />
          <CardBody block>Body with live indicator.</CardBody>
        </Card>
      </Col>
      <Col span={12}>
        <Card padding="none">
          <CardHeader block title={<Flex vertical gap="small"><span className="micro">DASHBOARD</span><span>Kicker + title</span></Flex>} />
          <CardBody block>Body with kicker over title.</CardBody>
        </Card>
      </Col>
      <Col span={12}>
        <Card padding="none">
          <CardHeader block>
            <Flex gap="small" align="center" style={{ flex: 1 }}>
              <Search size={14} aria-hidden style={{ color: "var(--muted-foreground)" }} />
              <input
                placeholder="Search…"
                style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontSize: "var(--card-title-size)", fontFamily: "inherit" }}
              />
            </Flex>
          </CardHeader>
          <CardBody block>Body with search header.</CardBody>
        </Card>
      </Col>
      <Col span={12}>
        <Card padding="none">
          <CardHeader block title="Toolbar header" extra={
            <Space size="small">
              <Button size="small" variant="ghost">Export</Button>
              <Button size="small" variant="ghost">Filter</Button>
              <Button size="small">+ Add</Button>
            </Space>
          } />
          <CardBody block>Body with toolbar header.</CardBody>
        </Card>
      </Col>
    </Row>
  ),
};

// ════════════════════════════════════════════════════════════════════
// Hoverable + Grid (axes sanity)
// ════════════════════════════════════════════════════════════════════

export const Hoverable: Story = {
  render: () => (
    <Row gutter={[16, 16]}>
      <Col span={12}><Card title="Static" subtitle="No hover">Static.</Card></Col>
      <Col span={12}><Card hoverable title="Hoverable" subtitle="Hover me">Lifts.</Card></Col>
    </Row>
  ),
};

export const Grid: Story = {
  name: "Pattern matrix (axes sweep)",
  render: () => (
    <Row gutter={[16, 16]}>
      <Col span={6}><Card padding="tight" title="tight">short</Card></Col>
      <Col span={6}><Card padding="cozy" title="cozy">wide</Card></Col>
      <Col span={6}><Card tone="muted" title="muted">tone</Card></Col>
      <Col span={6}><Card tone="outline-only" title="outline">tone</Card></Col>
      <Col span={6}><Card accent="primary" title="accent">edge</Card></Col>
      <Col span={6}><Card accent="success" title="success">edge</Card></Col>
      <Col span={6}><Card accent="featured" title="featured">ring</Card></Col>
      <Col span={6}><Card hoverable title="hoverable">lift</Card></Col>
    </Row>
  ),
};

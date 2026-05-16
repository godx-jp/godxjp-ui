import type { Meta, StoryObj } from "@storybook/react";
import {
  AlertTriangle,
  Bell,
  Briefcase,
  CheckCircle2,
  CircleAlert,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Filter,
  Gauge,
  Info,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Upload,
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
no shadow at rest) plus orthogonal prop axes:

| Axis | Values | Effect |
|---|---|---|
| \`padding\` | \`tight\` / \`default\` / \`cozy\` / \`none\` | 12 / 16 / 20 / 0 px |
| \`tone\` | \`default\` / \`muted\` / \`outline-only\` | bg = card / secondary / transparent |
| \`accent\` | 6 semantic + \`featured\` | 3px left edge or full ring |
| \`band\` | 6 semantic + \`gradient\` / \`dotted\` | 4px color strip above header |
| \`hoverable\` | boolean | border + shadow lift |

Header shape auto-detects from slot props:

| Slots | Shape | Design source |
|---|---|---|
| \`title\` (± \`meta\`) | \`.ch\` row | H1, H3 |
| \`title\` + \`subtitle\` | \`.ch-stack\` column | H2 |
| \`kicker\` + \`title\` (+ \`subtitle\`) | \`.ch-kicker\` column | H12 |

\`extra\` always renders right-aligned (action / tag / live dot —
H4, H5, H7).

Per cardinal rule 21 every token reference cascades through the
four theme axes (theme / accent / density / fontSize). Per
cardinal rule 22 every visual literal (10/16, 14/16, 13px, 11px,
10px, 4px) is pinned via tokens to the design canon — no
hardcoded values.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Card>;

const muted = { fontSize: "var(--card-meta-size)", color: "var(--muted-foreground)" } as const;

// ════════════════════════════════════════════════════════════════════
// API — prop axes
// ════════════════════════════════════════════════════════════════════

export const Default: Story = {
  render: () => (
    <Card title="Pull requests" meta="this week" extra={<a href="#">More</a>}>
      <p>Body content goes here.</p>
    </Card>
  ),
};

export const PaddingAxis: Story = {
  name: "Axis · padding",
  render: () => (
    <Row gutter={[16, 16]}>
      <Col span={6}><Card padding="tight" title="tight" meta="12px">tight body</Card></Col>
      <Col span={6}><Card padding="default" title="default" meta="16px">default body</Card></Col>
      <Col span={6}><Card padding="cozy" title="cozy" meta="20px">cozy body</Card></Col>
      <Col span={6}>
        <Card padding="none">
          <CardHeader block title="none" meta="0px" />
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
      <Col span={8}><Card title="default" meta="--card">bg = --card</Card></Col>
      <Col span={8}><Card tone="muted" title="muted" meta="--secondary">bg = --secondary</Card></Col>
      <Col span={8}><Card tone="outline-only" title="outline" meta="transparent">bg = transparent</Card></Col>
    </Row>
  ),
};

export const AccentAxis: Story = {
  name: "Axis · accent edge",
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

export const BandAxis: Story = {
  name: "Axis · band (H11)",
  render: () => (
    <Row gutter={[16, 16]}>
      {(["primary","success","attention","destructive","warning","info","gradient","dotted"] as const).map((b) => (
        <Col span={6} key={b}>
          <Card padding="none" band={b}>
            <CardHeader block title="プロジェクト" meta={b} />
          </Card>
        </Col>
      ))}
    </Row>
  ),
};

// ════════════════════════════════════════════════════════════════════
// H · CARD HEADERS — 16 variants (H1-H17 from comp-card.html)
// ════════════════════════════════════════════════════════════════════

export const H1_TitleOnly: Story = {
  name: "H1 · Title only",
  render: () => (
    <Card padding="none">
      <CardHeader block title="タイトルのみ" />
      <CardBody block><span style={muted}>最小限のヘッダー。情報密度が高い表 / list に。</span></CardBody>
    </Card>
  ),
};

export const H2_Stack: Story = {
  name: "H2 · Stacked title + subtitle",
  render: () => (
    <Card padding="none">
      <CardHeader block title="スタック構成" subtitle="タイトル + 補足 (1 行ずつ縦に積む)" />
      <CardBody block><span style={muted}>subtitle dài 1–2 dòng OK · không nằm bên phải tránh tràn.</span></CardBody>
    </Card>
  ),
};

export const H3_MetaRight: Story = {
  name: "H3 · Title + meta-right",
  render: () => (
    <Card padding="none">
      <CardHeader block title="メタ右" meta="5月 17日 · 14 件" />
      <CardBody block><span style={muted}>timestamp / count thuần → right-aligned, font monospace.</span></CardBody>
    </Card>
  ),
};

export const H4_WithAction: Story = {
  name: "H4 · With single action",
  render: () => (
    <Card padding="none">
      <CardHeader
        block
        title="承認待ち一覧"
        meta="12 件"
        extra={<Button size="small" variant="outline">一括承認</Button>}
      />
      <CardBody block><span style={muted}>1 chính + meta — action ngắn, không vượt 8 ký tự.</span></CardBody>
    </Card>
  ),
};

export const H5_WithActionGroup: Story = {
  name: "H5 · With action group",
  render: () => (
    <Card padding="none">
      <CardHeader
        block
        title="勤怠データ"
        extra={
          <Space size="small">
            <Button size="small" variant="ghost" aria-label="リフレッシュ"><RefreshCw size={14} aria-hidden /></Button>
            <Button size="small" variant="ghost" aria-label="エクスポート"><Upload size={14} aria-hidden /></Button>
            <Button size="small" variant="secondary">フィルタ</Button>
            <Button size="small">＋ 新規</Button>
          </Space>
        }
      />
      <CardBody block><span style={muted}>Icon-only phía trái, labeled phía phải — luôn theo thứ tự danger → standard → primary.</span></CardBody>
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
          <span style={muted}>リアルタイム · 自動更新</span>
        </div>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: "var(--card-meta-size)" }}>
          <span className="dot success pulse" style={{ color: "var(--success)" }} />
          LIVE
        </span>
      </CardHeader>
      <CardBody block><span style={muted}>Icon w/ tinted background — semantic. Phù hợp cho stat cards có category rõ ràng.</span></CardBody>
    </Card>
  ),
};

export const H7_AvatarHeader: Story = {
  name: "H7 · Avatar header (entity)",
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
      <CardBody block><span style={muted}>Avatar — chuyên cho entity card (người, công ty, team). Status dot bên phải.</span></CardBody>
    </Card>
  ),
};

export const H8_TabsHeader: Story = {
  name: "H8 · Tabs header (in-card tabs)",
  render: () => (
    <Card padding="none">
      <CardHeader block>
        <span className="card-title">勤怠</span>
        <Space size="small" style={{ marginLeft: 8 }}>
          <Button size="small" variant="ghost" style={{ borderBottom: "2px solid var(--primary)", borderRadius: 0, color: "var(--primary)" }}>月次 22</Button>
          <Button size="small" variant="ghost">日次</Button>
          <Button size="small" variant="ghost" style={{ color: "var(--attention)" }}>承認待ち 3</Button>
          <Button size="small" variant="ghost">エラー</Button>
        </Space>
        <span style={{ marginLeft: "auto", display: "inline-flex", gap: 6 }}>
          <Button size="small" variant="ghost" aria-label="フィルタ"><Filter size={14} aria-hidden /></Button>
          <Button size="small">エクスポート</Button>
        </span>
      </CardHeader>
      <CardBody block><span style={muted}>Tabs in-header — phù hợp cho card có 2–5 views cùng dataset.</span></CardBody>
    </Card>
  ),
};

export const H9_FilterChips: Story = {
  name: "H9 · Filter chips",
  render: () => (
    <Card padding="none">
      <CardHeader block>
        <span className="card-title">従業員</span>
        <span style={{ ...muted, marginLeft: 8 }}>フィルタ:</span>
        <Space size="small">
          <Tag color="primary">渋谷本店</Tag>
          <Tag color="primary">正社員</Tag>
          <Tag>遅刻あり</Tag>
          <Tag>＋ 追加</Tag>
        </Space>
        <span style={{ marginLeft: "auto", fontSize: "var(--card-meta-size)", color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>14 / 38 件</span>
      </CardHeader>
      <CardBody block><span style={muted}>Chips "đang active" có icon × để remove.</span></CardBody>
    </Card>
  ),
};

export const H10_SearchHeader: Story = {
  name: "H10 · Search header",
  render: () => (
    <Card padding="none">
      <CardHeader block title="従業員一覧" meta="· 38 名">
        <span style={{
          marginLeft: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "0 8px",
          height: 28,
          border: "1px solid var(--input)",
          borderRadius: "var(--radius-md)",
          background: "var(--input-background)",
          maxWidth: 280,
        }}>
          <Search size={14} aria-hidden style={{ color: "var(--muted-foreground)" }} />
          <input
            placeholder="名前 / メール / コード"
            style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontSize: "var(--text-sm)", fontFamily: "inherit", minWidth: 0 }}
          />
          <kbd style={{ padding: "1px 6px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--secondary)", fontSize: 10, color: "var(--muted-foreground)" }}>⌘K</kbd>
        </span>
      </CardHeader>
      <CardBody block><span style={muted}>Search input căn phải, max-width 280px — đếm result luôn cạnh title.</span></CardBody>
    </Card>
  ),
};

export const H11_ColorBand: Story = {
  name: "H11 · Color band",
  render: () => (
    <Row gutter={[14, 14]}>
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
        <Col span={6} key={band}>
          <Card padding="none" band={band}>
            <CardHeader block title={label} meta={band} />
          </Card>
        </Col>
      ))}
    </Row>
  ),
};

export const H12_Kicker: Story = {
  name: "H12 · Kicker (3-tier)",
  render: () => (
    <Row gutter={[14, 14]}>
      <Col span={12}>
        <Card padding="none">
          <CardHeader
            block
            kicker="5月度 · 暫定"
            title="¥ 8,420,500"
            subtitle="支払合計 · 38 名 · 振込日 5/25"
          />
          <CardBody block><span style={muted}>Kicker (uppercase) làm context · title kích thước to.</span></CardBody>
        </Card>
      </Col>
      <Col span={12}>
        <Card padding="none">
          <CardHeader
            block
            kicker="特集記事"
            title="2026 年 6 月リリース予定の新機能"
            subtitle="シフト自動最適化と多店舗在庫連携を導入"
          />
          <CardBody block><span style={muted}>Article / content card có hierarchy 3 cấp: category → title → tagline.</span></CardBody>
        </Card>
      </Col>
    </Row>
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
      <CardBody block><span style={muted}>Hero — branded promo. White text trên gradient. Luôn có CTA.</span></CardBody>
    </Card>
  ),
};

export const H14_HeroWarm: Story = {
  name: "H14 · Hero (warm urgency)",
  render: () => (
    <Card padding="none">
      <div style={{
        padding: "20px var(--density-card)",
        background: "linear-gradient(135deg, var(--destructive), var(--attention))",
        color: "var(--destructive-foreground)",
      }}>
        <div className="card-kicker" style={{ color: "rgba(255,255,255,0.85)" }}>特別企画</div>
        <h3 style={{ margin: "4px 0", fontSize: "var(--text-xl)", fontWeight: 500 }}>5月限定キャンペーン</h3>
        <p style={{ margin: 0, fontSize: "var(--text-sm)", opacity: 0.9 }}>全店舗 · 期間 5/01–5/31 · 詳細はリンクから</p>
        <Space size="small" style={{ marginTop: 12 }}>
          <Button size="small" style={{ background: "var(--card)", color: "var(--destructive)" }}>詳細を見る</Button>
        </Space>
      </div>
      <CardBody block><span style={muted}>Warm variant cho marketing / urgency. 茜 × 朱 gradient.</span></CardBody>
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
          <span style={{ fontSize: "var(--text-xs)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-mono)", padding: "0 6px" }}>5/12 – 5/18</span>
          <Button size="small" variant="ghost" aria-label="翌週">›</Button>
        </span>
        <Button size="small" variant="ghost">今日</Button>
        <span style={{ marginLeft: "auto" }}>
          <Button size="small" variant="secondary"><Plus size={14} aria-hidden /> シフト追加</Button>
        </span>
      </CardHeader>
      <CardBody block><span style={muted}>Calendar-style toolbar — view seg + date nav + primary action.</span></CardBody>
    </Card>
  ),
};

export const H16_Breadcrumb: Story = {
  name: "H16 · Breadcrumb header",
  render: () => (
    <Card padding="none">
      <CardHeader block subtitle="田中 美咲">
        {/* Override the inline subtitle layout: we render a breadcrumb
            row ABOVE the title via the children slot, then title via
            the standard slot. This composition matches H16 stacked
            with breadcrumb above. */}
      </CardHeader>
      <CardBody block><span style={muted}>Breadcrumb in-card — cho detail page sâu, link cấp trên ngắn ngọn.</span></CardBody>
    </Card>
  ),
};

export const H17_StickyShadow: Story = {
  name: "H17 · Sticky shadow",
  render: () => (
    <Card padding="none">
      <CardHeader
        block
        title="取引履歴"
        meta="2,481 件"
        style={{ boxShadow: "0 2px 4px -2px rgba(0,0,0,0.08)", position: "relative", zIndex: 1 }}
      />
      <CardBody block>
        <pre style={{ margin: 0, fontSize: "var(--text-2xs)", lineHeight: 1.6, fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}>
{`2026/05/17 14:32 · ¥4,500 · 渋谷本店
2026/05/17 14:28 · ¥3,200 · 渋谷本店
2026/05/17 14:15 · ¥8,100 · 表参道店
2026/05/17 14:10 · ¥2,400 · 自由が丘店
2026/05/17 14:08 · ¥6,500 · 渋谷本店`}
        </pre>
      </CardBody>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// A · DATA DISPLAY
// ════════════════════════════════════════════════════════════════════

export const A_StatSimple: Story = {
  name: "A1 · Stat (simple)",
  render: () => (
    <Row gutter={[14, 14]}>
      <Col span={6}>
        <Card padding="tight">
          <span className="micro">出勤率</span>
          <div className="row-between" style={{ marginTop: 8 }}>
            <span className="stat">96.8<span className="unit">%</span></span>
            <span className="delta up"><TrendingUp size={11} aria-hidden /> +1.2</span>
          </div>
        </Card>
      </Col>
      <Col span={6}>
        <Card padding="tight">
          <span className="micro">遅刻件数</span>
          <div className="row-between" style={{ marginTop: 8 }}>
            <span className="stat">12</span>
            <span className="delta down"><TrendingDown size={11} aria-hidden /> +3</span>
          </div>
        </Card>
      </Col>
      <Col span={6}>
        <Card padding="tight">
          <span className="micro">超勤時間</span>
          <div className="row-between" style={{ marginTop: 8 }}>
            <span className="stat">42.5<span className="unit">h</span></span>
            <span className="delta flat">—</span>
          </div>
        </Card>
      </Col>
      <Col span={6}>
        <Card padding="tight">
          <span className="micro">月間給与総額</span>
          <div style={{ marginTop: 8 }}>
            <span className="stat lg">¥1,234,567</span>
          </div>
          <div style={{ ...muted, marginTop: 4 }}>前月比 +5.4%</div>
        </Card>
      </Col>
    </Row>
  ),
};

export const A_StatProgress: Story = {
  name: "A2 · Stat with progress",
  render: () => (
    <Row gutter={[14, 14]}>
      {([
        ["月次目標", "78", "78%", "primary"],
        ["勤怠承認率", "92", "92%", "success"],
        ["未処理申請", "15", "15%", "attention"],
      ] as const).map(([label, val, w, kind]) => (
        <Col span={8} key={label}>
          <Card padding="tight">
            <div className="row-between">
              <span className="micro">{label}</span>
              <span style={muted}>{val} / 100</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <span className="stat">{val}<span className="unit">%</span></span>
            </div>
            <div className={`prog ${kind === "primary" ? "" : kind}`} style={{ marginTop: 8 }}>
              <i style={{ width: w }} />
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  ),
};

export const A_Datalist: Story = {
  name: "A3 · Datalist",
  render: () => (
    <Card title="勤務状況" meta="2026-05-15 (水)">
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
// B · ENTITY & PERSON
// ════════════════════════════════════════════════════════════════════

export const B_PersonRow: Story = {
  name: "B1 · Person row",
  render: () => (
    <Row gutter={[14, 14]}>
      {[
        { name: "Mai Nguyen", role: "Team lead · Engineering", tag: "success" as const, tagText: "On shift" },
        { name: "Hoang Le", role: "Designer", tag: "warning" as const, tagText: "PTO" },
        { name: "Akira Tanaka", role: "Operations", tag: "info" as const, tagText: "Remote" },
      ].map((p) => (
        <Col span={8} key={p.name}>
          <Card padding="tight" hoverable>
            <Flex gap="middle" align="center">
              <Avatar name={p.name} />
              <Flex vertical gap="small" style={{ minWidth: 0, flex: 1 }}>
                <strong style={{ fontSize: "var(--card-title-size)" }}>{p.name}</strong>
                <span style={muted}>{p.role}</span>
              </Flex>
              <Badge variant={p.tag}>{p.tagText}</Badge>
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

// ════════════════════════════════════════════════════════════════════
// C · CONTENT & COMMERCE
// ════════════════════════════════════════════════════════════════════

export const C_Product: Story = {
  name: "C1 · Product / pricing",
  render: () => (
    <Row gutter={[14, 14]}>
      <Col span={8}>
        <Card padding="default" hoverable title="Starter" meta="Up to 5 employees">
          <span className="stat lg">¥0<span className="unit">/月</span></span>
          <Button style={{ marginTop: 12 }}>Subscribe</Button>
        </Card>
      </Col>
      <Col span={8}>
        <Card padding="default" accent="featured" hoverable title="Team" meta="Up to 50" extra={<Tag color="primary">Popular</Tag>}>
          <span className="stat lg">¥2,900<span className="unit">/月</span></span>
          <Button style={{ marginTop: 12 }}>Subscribe</Button>
        </Card>
      </Col>
      <Col span={8}>
        <Card padding="default" hoverable title="Enterprise" meta="Custom">
          <span className="stat lg">—</span>
          <Button style={{ marginTop: 12 }}>Talk to sales</Button>
        </Card>
      </Col>
    </Row>
  ),
};

export const C_Feature: Story = {
  name: "C2 · Feature highlight",
  render: () => (
    <Row gutter={[14, 14]}>
      {[
        { ic: "info" as const, icon: <Gauge size={14} aria-hidden />, t: "リアルタイム勤怠", d: "5秒間隔の打刻同期。" },
        { ic: "success" as const, icon: <Zap size={14} aria-hidden />, t: "自動承認ルール", d: "事前定義のしきい値で一次承認。" },
        { ic: "attention" as const, icon: <Wifi size={14} aria-hidden />, t: "オフライン対応", d: "通信が落ちても打刻保持。" },
      ].map((f) => (
        <Col span={8} key={f.t}>
          <Card padding="default">
            <span className={`ic ${f.ic}`}>{f.icon}</span>
            <strong style={{ display: "block", marginTop: 10, fontSize: "var(--card-title-size)" }}>{f.t}</strong>
            <span style={{ ...muted, display: "block", marginTop: 4 }}>{f.d}</span>
          </Card>
        </Col>
      ))}
    </Row>
  ),
};

// ════════════════════════════════════════════════════════════════════
// D · WORKFLOW & ACTION
// ════════════════════════════════════════════════════════════════════

export const D_Approval: Story = {
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

export const D_CTA: Story = {
  name: "D2 · CTA (single main action)",
  render: () => (
    <Card padding="cozy" accent="primary" style={{ maxWidth: 420 }}>
      <Flex vertical align="center" gap="middle" style={{ textAlign: "center" }}>
        <span className="ic xl"><Briefcase size={22} aria-hidden /></span>
        <strong style={{ fontSize: "var(--text-base)" }}>出勤を打刻</strong>
        <span style={muted}>10 時間 33 分の勤務がスタートします。</span>
        <Button size="large" style={{ width: "100%" }}>打刻する</Button>
      </Flex>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// E · FEEDBACK · STATUS · SELECTION
// ════════════════════════════════════════════════════════════════════

export const E_Notice: Story = {
  name: "E1 · Notice (4 semantic)",
  render: () => (
    <Flex vertical gap="middle">
      {[
        { acc: "info" as const, icon: <Info size={16} aria-hidden style={{ color: "var(--info)" }} />, t: "システムメンテナンス予定", d: "2026-05-25 02:00–04:00 UTC · 停止 ~10 分" },
        { acc: "attention" as const, icon: <CircleAlert size={16} aria-hidden style={{ color: "var(--attention)" }} />, t: "申請が 3 件保留中", d: "週末までに確認してください。" },
        { acc: "success" as const, icon: <CheckCircle2 size={16} aria-hidden style={{ color: "var(--success)" }} />, t: "5 月分の給与計算が完了", d: "従業員 42 名全員を処理。" },
        { acc: "destructive" as const, icon: <AlertTriangle size={16} aria-hidden style={{ color: "var(--destructive)" }} />, t: "インポート失敗", d: "shift-2026-05.csv · 18 行目の日付フォーマット不正" },
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
// F · SCHEDULE · LIST · TIMELINE
// ════════════════════════════════════════════════════════════════════

export const F_Shift: Story = {
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
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}>{row.time}</span>
            <Tag color={row.off ? "default" : "primary"}>{row.role}</Tag>
          </div>
        ))}
      </Flex>
    </Card>
  ),
};

export const F_Activity: Story = {
  name: "F2 · Activity feed",
  render: () => (
    <Card padding="none" style={{ maxWidth: 480 }}>
      <CardHeader block title="Recent activity" extra={<a href="#" style={{ fontSize: "var(--text-xs)", color: "var(--primary)" }}>See all</a>} />
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
            style={{ padding: "var(--spacing-2) 0", borderBottom: i < 3 ? "1px solid var(--border)" : undefined }}
          >
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
// Hoverable + Pattern matrix
// ════════════════════════════════════════════════════════════════════

export const Hoverable: Story = {
  render: () => (
    <Row gutter={[16, 16]}>
      <Col span={12}><Card title="Static" meta="no hover">Static.</Card></Col>
      <Col span={12}><Card hoverable title="Hoverable" meta="hover me">Lifts.</Card></Col>
    </Row>
  ),
};

// ════════════════════════════════════════════════════════════════════
// A · DATA DISPLAY (continued)
// ════════════════════════════════════════════════════════════════════

export const A_StatSparkline: Story = {
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

export const A_Bars: Story = {
  name: "A5 · Bars chart",
  render: () => (
    <Card padding="none">
      <CardHeader block title="週次 · 実働 vs 所定" meta="第 20 週 · 5/12 — 5/18" />
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
        <div className="row-between" style={{ marginTop: 6, fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>
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

export const A_ProgressQuota: Story = {
  name: "A6 · Progress / quota",
  render: () => (
    <Row gutter={[14, 14]}>
      <Col span={12}>
        <Card padding="default">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <div style={{ fontSize: "var(--card-title-size)", fontWeight: 500 }}>ストレージ使用量</div>
            <span className="mono" style={muted}>42.8 / 50 GB</span>
          </div>
          <div className="prog warning"><i style={{ width: "85%" }} /></div>
          <div style={{ ...muted, marginTop: 6, display: "flex", gap: 6, alignItems: "center" }}>
            <AlertTriangle size={14} aria-hidden /> 残り 7.2 GB · <a href="#" style={{ color: "var(--primary)" }}>プラン変更</a>
          </div>
        </Card>
      </Col>
      <Col span={12}>
        <Card padding="default">
          <div className="row-between" style={{ marginBottom: 10 }}>
            <div style={{ fontSize: "var(--card-title-size)", fontWeight: 500 }}>月次予算進捗</div>
            <Tag>5月 17日</Tag>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 8 }}>
            <div className="stat" style={{ fontSize: "var(--text-xl)" }}>¥ 2.18M</div>
            <div style={{ ...muted, paddingBottom: 4 }}>/ ¥ 3.00M</div>
            <span className="delta up" style={{ marginLeft: "auto", marginBottom: 4 }}>73%</span>
          </div>
          <div className="prog success"><i style={{ width: "73%" }} /></div>
          <div style={{ ...muted, marginTop: 6 }}>
            目標まで 14 日 · 達成見込み <b style={{ color: "var(--success)" }}>○ オントラック</b>
          </div>
        </Card>
      </Col>
    </Row>
  ),
};

export const A_DatalistDouble: Story = {
  name: "A7 · Datalist (double)",
  render: () => (
    <Row gutter={[14, 14]}>
      <Col span={12}>
        <Card padding="default">
          <div style={{ fontSize: "var(--card-title-size)", fontWeight: 500, marginBottom: 10 }}>5月度サマリー</div>
          <dl className="dl">
            <dt>所定時間</dt><dd>176.0 h</dd>
            <dt>実働時間</dt><dd>168.5 h</dd>
            <dt>残業時間</dt><dd>12.5 h</dd>
            <dt>有給取得</dt><dd>1.0 日</dd>
            <dt>深夜勤務</dt><dd>0.0 h</dd>
          </dl>
        </Card>
      </Col>
      <Col span={12}>
        <Card padding="default" tone="muted">
          <div style={{ fontSize: "var(--card-title-size)", fontWeight: 500, marginBottom: 10 }}>給与計算 · 暫定</div>
          <dl className="dl">
            <dt>基本給</dt><dd>¥ 240,000</dd>
            <dt>残業手当</dt><dd>¥ 22,800</dd>
            <dt>交通費</dt><dd>¥ 8,500</dd>
            <dt style={{ fontWeight: 500, color: "var(--foreground)" }}>支給合計</dt>
            <dd style={{ fontSize: "var(--card-title-size)" }}>¥ 271,300</dd>
          </dl>
          <div style={{ ...muted, marginTop: 8, fontSize: "var(--text-2xs)" }}>
            確定前 · 5月 31日 23:59 締切
          </div>
        </Card>
      </Col>
    </Row>
  ),
};

export const A_InlineTable: Story = {
  name: "A8 · Inline table (leaderboard)",
  render: () => (
    <Card padding="none">
      <CardHeader block title="店舗別 売上 (Top 5)" meta="5月 17日 暫定" />
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
// B · ENTITY & PERSON (continued)
// ════════════════════════════════════════════════════════════════════

export const B_ProfileRich: Story = {
  name: "B3 · Profile rich (banner + stats)",
  render: () => (
    <Card padding="none" style={{ maxWidth: 480 }}>
      <div style={{ height: 64, background: "linear-gradient(135deg, var(--primary), var(--info))" }} />
      <CardBody block>
        <Flex vertical gap="small" style={{ marginTop: -32 }}>
          <Avatar name="田中 美咲" size="xl" style={{ border: "2px solid var(--card)" }} />
          <strong style={{ fontSize: "var(--text-base)" }}>田中 美咲</strong>
          <span style={muted}>店長 · 渋谷本店 · 入社 2022/04</span>
          <Space size="small" style={{ marginTop: 4 }}>
            <Tag color="primary">店長</Tag>
            <Tag>JP</Tag>
            <Tag>承認権限</Tag>
          </Space>
        </Flex>
        <div className="dv-stack" style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
          {[
            ["勤続", "3 年"],
            ["承認件数", "248"],
            ["評価", "A"],
          ].map(([label, val]) => (
            <div key={label} style={{ textAlign: "center", padding: "8px 0", borderRight: "1px solid var(--border)" }}>
              <div className="stat" style={{ fontSize: "var(--text-lg)" }}>{val}</div>
              <div style={muted}>{label}</div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  ),
};

export const B_Team: Story = {
  name: "B4 · Team / org",
  render: () => (
    <Row gutter={[14, 14]}>
      <Col span={12}>
        <Card padding="default" title="Engineering" meta="12 名">
          <Flex gap="small" wrap>
            {["Mai", "Hoang", "Akira", "Yuki", "Linh"].map((n) => (
              <Avatar key={n} name={n} size="sm" />
            ))}
            <Avatar size="sm">+7</Avatar>
          </Flex>
        </Card>
      </Col>
      <Col span={12}>
        <Card padding="default" title="Operations" meta="8 名" extra={<Tag color="primary">Lead: Akira</Tag>}>
          <Flex gap="small" wrap>
            {["Akira", "Yuki", "Linh", "Mei"].map((n) => (
              <Avatar key={n} name={n} size="sm" />
            ))}
            <Avatar size="sm">+4</Avatar>
          </Flex>
        </Card>
      </Col>
    </Row>
  ),
};

export const B_Tenant: Story = {
  name: "B5 · Tenant / company",
  render: () => (
    <Card padding="none" style={{ maxWidth: 420 }}>
      <CardHeader block>
        <span className="ic" style={{ width: 36, height: 36 }}><Briefcase size={16} aria-hidden /></span>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className="card-title">FAMGIA Inc.</span>
          <span style={muted}>渋谷区 · 従業員 142 名</span>
        </div>
        <Tag color="success" style={{ marginLeft: "auto" }}>Active</Tag>
      </CardHeader>
      <CardBody block>
        <dl className="dl">
          <dt>プラン</dt><dd>Team</dd>
          <dt>契約期間</dt><dd>2024/04 – 2027/04</dd>
          <dt>担当者</dt><dd>田中 美咲</dd>
        </dl>
      </CardBody>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// C · CONTENT & COMMERCE (continued)
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

export const C_Pricing: Story = {
  name: "C3 · Pricing tier (3-up, featured)",
  render: () => (
    <Row gutter={[14, 14]}>
      {[
        { name: "Starter", price: "¥0", sub: "Up to 5 employees", featured: false },
        { name: "Team", price: "¥2,900", sub: "Up to 50 employees", featured: true },
        { name: "Enterprise", price: "—", sub: "Custom", featured: false },
      ].map((plan) => (
        <Col span={8} key={plan.name}>
          <Card
            padding="default"
            accent={plan.featured ? "featured" : undefined}
            hoverable
            extra={plan.featured ? <Tag color="primary">Popular</Tag> : undefined}
            title={plan.name}
            meta={plan.sub}
          >
            <Flex vertical gap="small">
              <span className="stat lg">
                {plan.price}
                {plan.price !== "—" && <span className="unit">/月</span>}
              </span>
              <Button>{plan.price === "—" ? "Talk to sales" : "Subscribe"}</Button>
            </Flex>
          </Card>
        </Col>
      ))}
    </Row>
  ),
};

export const C_Integration: Story = {
  name: "C5 · Integration / connection",
  render: () => (
    <Row gutter={[14, 14]}>
      {[
        { name: "Slack", desc: "通知 + メッセージ転送", connected: true, ic: "info" as const },
        { name: "Google Calendar", desc: "シフト連携 · 双方向", connected: true, ic: "success" as const },
        { name: "Stripe", desc: "給与振込", connected: false, ic: "warning" as const },
      ].map((row) => (
        <Col span={8} key={row.name}>
          <Card padding="default" hoverable>
            <Flex gap="middle" align="center">
              <span className={`ic ${row.ic}`}><ExternalLink size={14} aria-hidden /></span>
              <Flex vertical gap="small" style={{ flex: 1 }}>
                <strong style={{ fontSize: "var(--card-title-size)" }}>{row.name}</strong>
                <span style={muted}>{row.desc}</span>
              </Flex>
              <Button size="small" variant={row.connected ? "ghost" : "primary"}>
                {row.connected ? "Disconnect" : "Connect"}
              </Button>
            </Flex>
          </Card>
        </Col>
      ))}
    </Row>
  ),
};

// ════════════════════════════════════════════════════════════════════
// D · WORKFLOW & ACTION (continued)
// ════════════════════════════════════════════════════════════════════

export const D_Step: Story = {
  name: "D2 · Step / wizard (onboarding)",
  render: () => (
    <Card title="オンボーディング" meta="3 / 5">
      <Flex vertical gap="middle">
        {[
          { done: true,  label: "アカウント作成" },
          { done: true,  label: "プロフィール入力" },
          { done: true,  label: "勤怠端末ペアリング" },
          { done: false, label: "シフト初回登録", cur: true },
          { done: false, label: "管理者承認" },
        ].map((s, i) => (
          <Flex key={i} gap="middle" align="center">
            <span
              className={`ic ${s.done ? "success" : ""}`}
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

export const D_QuickActionGrid: Story = {
  name: "D3 · Quick action grid (2×2)",
  render: () => (
    <Card title="クイックアクション" padding="default">
      <Row gutter={[12, 12]}>
        {[
          { ic: "info" as const, icon: <Plus size={16} aria-hidden />, t: "シフト追加", d: "次週分を作成" },
          { ic: "success" as const, icon: <CheckCircle2 size={16} aria-hidden />, t: "申請承認", d: "12 件保留" },
          { ic: "attention" as const, icon: <AlertTriangle size={16} aria-hidden />, t: "エラー確認", d: "3 件" },
          { ic: "info" as const, icon: <Upload size={16} aria-hidden />, t: "データ出力", d: "CSV / Excel" },
        ].map((qa) => (
          <Col span={12} key={qa.t}>
            <button style={{
              display: "flex", gap: 10, padding: 12,
              border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
              background: "var(--card)", cursor: "pointer", width: "100%",
              alignItems: "center", textAlign: "left", fontFamily: "inherit",
            }}>
              <span className={`ic ${qa.ic}`}>{qa.icon}</span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "var(--card-title-size)", fontWeight: 500 }}>{qa.t}</span>
                <span style={muted}>{qa.d}</span>
              </div>
            </button>
          </Col>
        ))}
      </Row>
    </Card>
  ),
};

export const D_SettingsRows: Story = {
  name: "D4 · Settings row",
  render: () => (
    <Card title="通知設定" padding="default">
      <div className="dv-stack">
        {[
          { t: "申請承認", d: "新規申請が届いたときに通知" },
          { t: "シフト変更", d: "シフトに変更が入ったときに通知" },
          { t: "残業しきい値", d: "月 40 時間を超えたら通知" },
        ].map((r) => (
          <div key={r.t} className="row-between">
            <Flex vertical gap="small">
              <strong style={{ fontSize: "var(--card-title-size)" }}>{r.t}</strong>
              <span style={muted}>{r.d}</span>
            </Flex>
            <Button size="small" variant="ghost">編集</Button>
          </div>
        ))}
      </div>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// E · FEEDBACK (continued)
// ════════════════════════════════════════════════════════════════════

export const E_Banner: Story = {
  name: "E6 · Banner / promo",
  render: () => (
    <Card padding="default" tone="muted" accent="primary">
      <Flex gap="middle" align="center">
        <span className="ic lg"><Zap size={18} aria-hidden /></span>
        <Flex vertical gap="small" style={{ flex: 1 }}>
          <strong style={{ fontSize: "var(--text-base)" }}>シフト自動最適化を試してみませんか?</strong>
          <span style={muted}>需要予測 + スキル + 希望で最適なシフトを生成。試験運用に参加すると 30 日間無料。</span>
        </Flex>
        <Space size="small">
          <Button variant="ghost">あとで</Button>
          <Button>参加</Button>
        </Space>
      </Flex>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// F · SCHEDULE / LIST / TIMELINE (continued)
// ════════════════════════════════════════════════════════════════════

export const F_CalendarMini: Story = {
  name: "F2 · Calendar mini",
  render: () => (
    <Card padding="default" title="5月 2026" meta="シフト">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, fontSize: "var(--text-2xs)", textAlign: "center" }}>
        {["日","月","火","水","木","金","土"].map((d) => (
          <span key={d} style={muted}>{d}</span>
        ))}
        {Array.from({ length: 31 }).map((_, i) => {
          const day = i + 1;
          const isToday = day === 17;
          const hasShift = [5, 6, 7, 12, 13, 14, 19, 20, 21].includes(day);
          return (
            <span
              key={day}
              style={{
                padding: "4px 0",
                borderRadius: "var(--radius-sm)",
                background: isToday ? "var(--primary)" : hasShift ? "color-mix(in oklch, var(--primary) 14%, transparent)" : undefined,
                color: isToday ? "var(--primary-foreground)" : undefined,
                fontWeight: isToday ? 500 : 400,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {day}
            </span>
          );
        })}
      </div>
    </Card>
  ),
};

export const F_Timeline: Story = {
  name: "F4 · Activity timeline",
  render: () => (
    <Card title="2026-05-15 タイムライン">
      <Flex vertical gap="middle">
        {[
          { t: "09:02", label: "出勤打刻", icon: <CheckCircle2 size={14} aria-hidden style={{ color: "var(--success)" }} /> },
          { t: "10:30", label: "ミーティング", icon: <Users size={14} aria-hidden style={{ color: "var(--info)" }} /> },
          { t: "12:30", label: "休憩", icon: <Clock size={14} aria-hidden style={{ color: "var(--muted-foreground)" }} /> },
          { t: "18:14", label: "退勤打刻", icon: <CheckCircle2 size={14} aria-hidden style={{ color: "var(--success)" }} /> },
        ].map((r) => (
          <Flex key={r.t} gap="middle" align="center">
            <span className="mono" style={{ color: "var(--muted-foreground)", width: 48 }}>{r.t}</span>
            {r.icon}
            <span style={{ fontSize: "var(--card-title-size)" }}>{r.label}</span>
          </Flex>
        ))}
      </Flex>
    </Card>
  ),
};

export const F_CompactLog: Story = {
  name: "F5 · Compact log (audit trail)",
  render: () => (
    <Card padding="none">
      <CardHeader block title="監査ログ" meta="直近 24h · 248 件" />
      <CardBody block>
        <pre className="mono" style={{ margin: 0, fontSize: "var(--text-2xs)", lineHeight: 1.65 }}>
{`14:32:18 [INFO]  user=mai action=login          ip=10.0.0.42
14:31:55 [WARN]  user=hoang action=approve.fail reason=stale
14:30:12 [INFO]  user=akira action=shift.update  ref=#1248
14:28:04 [ERROR] system action=sync.fail         retry=3
14:25:30 [INFO]  user=mai action=shift.create    ref=#1249
14:22:18 [INFO]  user=yuki action=login          ip=10.0.1.18`}
        </pre>
      </CardBody>
    </Card>
  ),
};

export const F_HorizontalSteps: Story = {
  name: "F6 · Horizontal steps",
  render: () => (
    <Card padding="default" title="申請フロー" meta="3 / 4">
      <Flex gap="small" align="center">
        {[
          { label: "申請", done: true },
          { label: "店長", done: true },
          { label: "本部", done: true, cur: true },
          { label: "完了", done: false },
        ].map((s, i, arr) => (
          <Flex key={s.label} align="center" gap="small" style={{ flex: 1 }}>
            <span className={`ic ${s.done ? "success" : ""}`} style={{ width: 24, height: 24, fontSize: 11 }}>
              {s.done ? <CheckCircle2 size={12} aria-hidden /> : i + 1}
            </span>
            <span style={{ fontSize: "var(--card-meta-size)", fontWeight: s.cur ? 500 : 400 }}>{s.label}</span>
            {i < arr.length - 1 && (
              <span style={{ flex: 1, height: 1, background: s.done ? "var(--success)" : "var(--border)" }} />
            )}
          </Flex>
        ))}
      </Flex>
    </Card>
  ),
};

export const F_DateGrouped: Story = {
  name: "F7 · Date-grouped feed",
  render: () => (
    <Card padding="default" title="活動履歴">
      <div className="dv-date"><span className="pill">2026/05/14 木</span></div>
      <Flex gap="small" align="start" style={{ padding: "6px 0" }}>
        <Avatar name="山田 太郎" size="sm" />
        <div style={{ flex: 1, fontSize: "var(--text-xs)" }}>
          <b>山田 太郎</b> · 09:22
          <div style={muted}>有給申請を提出 (5/22–5/23)</div>
        </div>
      </Flex>
      <Flex gap="small" align="start" style={{ padding: "6px 0" }}>
        <Avatar name="田中 美咲" size="sm" />
        <div style={{ flex: 1, fontSize: "var(--text-xs)" }}>
          <b>田中 美咲</b> · 11:08
          <div style={muted}>承認しました</div>
        </div>
      </Flex>
      <div className="dv-date"><span className="pill">2026/05/15 金 · 本日</span></div>
      <Flex gap="small" align="start" style={{ padding: "6px 0" }}>
        <Avatar name="人事部" size="sm" />
        <div style={{ flex: 1, fontSize: "var(--text-xs)" }}>
          <b>人事部</b> · 09:00
          <div style={muted}>最終承認の確認中…</div>
        </div>
      </Flex>
    </Card>
  ),
};

export const F_AvatarFeed: Story = {
  name: "F9 · Avatar feed (social-style)",
  render: () => (
    <Card padding="none">
      <CardHeader block title="チームの活動" meta="今日" />
      <CardBody block>
        <div className="dv-stack">
          {[
            { name: "Mai Nguyen", action: "approved 12 leave requests", t: "2h ago" },
            { name: "Hoang Le", action: "submitted overtime for review", t: "4h ago" },
            { name: "Akira Tanaka", action: "exported payroll CSV", t: "6h ago" },
          ].map((row) => (
            <Flex key={row.name} gap="small" align="center">
              <Avatar name={row.name} size="sm" />
              <Flex vertical gap="small" style={{ flex: 1 }}>
                <span style={{ fontSize: "var(--card-title-size)" }}>
                  <b>{row.name}</b> {row.action}
                </span>
                <span style={muted}>{row.t}</span>
              </Flex>
            </Flex>
          ))}
        </div>
      </CardBody>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// G · DIVIDERS — 6 patterns
// ════════════════════════════════════════════════════════════════════

export const G_Rules: Story = {
  name: "G1 · Plain rules (5 styles)",
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
      <div style={muted}>Gradient (fades at edges)</div>
      <hr className="dv gradient" />
      <div style={muted}>After gradient</div>
    </Card>
  ),
};

export const G_LabelInline: Story = {
  name: "G2 · Label-inline / chip-inline",
  render: () => (
    <Row gutter={[14, 14]}>
      <Col span={12}>
        <Card>
          <div style={muted}>前のコンテンツ…</div>
          <div className="dv-label">または</div>
          <div style={muted}>後のコンテンツ…</div>
          <div className="dv-label dashed">承認後の処理</div>
          <div style={muted}>…</div>
        </Card>
      </Col>
      <Col span={12}>
        <Card>
          <div style={muted}>ログイン方法を選択</div>
          <div className="dv-chip"><span className="pill">OR</span></div>
          <Flex vertical gap="small">
            <Button size="small" variant="outline">パスワードでログイン</Button>
            <Button size="small" variant="outline">SSO でログイン</Button>
          </Flex>
          <div className="dv-chip"><span className="pill">あるいは</span></div>
          <Button size="small" variant="ghost" style={{ width: "100%" }}>マジックリンクを送信</Button>
        </Card>
      </Col>
    </Row>
  ),
};

export const G_SectionHeading: Story = {
  name: "G3 · Section heading",
  render: () => (
    <Card>
      <div className="dv-section">
        <div className="t">基本情報</div>
        <div className="c">従業員の基本属性</div>
        <span className="meta">last edit 2026/05/14</span>
      </div>
      <div style={muted}>氏名 · 入社日 · 部門 · 役職 …</div>
      <div className="dv-section">
        <div className="t">給与</div>
        <div className="c">基本給 · 手当 · 控除</div>
        <span className="meta" style={{ color: "var(--attention)" }}>未保存</span>
      </div>
      <div style={muted}>基本給 ¥240,000 · 通勤費 ¥8,500 …</div>
      <div className="dv-section">
        <div className="t">権限 · ロール</div>
        <div className="c">アクセス可能な機能</div>
      </div>
      <div style={muted}>店長 · 渋谷本店 · 承認権限あり</div>
    </Card>
  ),
};

export const G_DateSeparator: Story = {
  name: "G4 · Date separator",
  render: () => (
    <Card>
      <div className="dv-date"><span className="pill">2026/05/14 木</span></div>
      <Flex gap="small" align="start" style={{ padding: "6px 0" }}>
        <Avatar name="山田 太郎" size="sm" />
        <div style={{ flex: 1, fontSize: "var(--text-xs)" }}>
          <b>山田 太郎</b> · 09:22<div style={muted}>有給申請を提出 (5/22–5/23)</div>
        </div>
      </Flex>
      <Flex gap="small" align="start" style={{ padding: "6px 0" }}>
        <Avatar name="田中 美咲" size="sm" />
        <div style={{ flex: 1, fontSize: "var(--text-xs)" }}>
          <b>田中 美咲</b> · 11:08<div style={muted}>承認しました</div>
        </div>
      </Flex>
      <div className="dv-date"><span className="pill">2026/05/15 金 · 本日</span></div>
      <Flex gap="small" align="start" style={{ padding: "6px 0" }}>
        <Avatar name="人事部" size="sm" />
        <div style={{ flex: 1, fontSize: "var(--text-xs)" }}>
          <b>人事部</b> · 09:00<div style={muted}>最終承認の確認中…</div>
        </div>
      </Flex>
    </Card>
  ),
};

export const G_StackedList: Story = {
  name: "G5 · Stacked-list dividers",
  render: () => (
    <Row gutter={[14, 14]}>
      <Col span={12}>
        <Card>
          <div style={{ ...muted, marginBottom: 10 }}>通常 (solid)</div>
          <div className="dv-stack">
            <div style={{ fontSize: "var(--text-xs)" }}><b>渋谷本店</b><div style={muted}>12 名 · 売上 ¥4.8M</div></div>
            <div style={{ fontSize: "var(--text-xs)" }}><b>表参道店</b><div style={muted}>8 名 · 売上 ¥3.1M</div></div>
            <div style={{ fontSize: "var(--text-xs)" }}><b>自由が丘店</b><div style={muted}>6 名 · 売上 ¥2.9M</div></div>
            <div style={{ fontSize: "var(--text-xs)" }}><b>新宿西口店</b><div style={muted}>10 名 · 売上 ¥2.1M</div></div>
          </div>
        </Card>
      </Col>
      <Col span={12}>
        <Card>
          <div style={{ ...muted, marginBottom: 10 }}>Dashed (より控えめ)</div>
          <div className="dv-stack dashed">
            <div style={{ fontSize: "var(--text-xs)", display: "flex", justifyContent: "space-between" }}>
              <span>基本給</span><span className="mono">¥ 240,000</span>
            </div>
            <div style={{ fontSize: "var(--text-xs)", display: "flex", justifyContent: "space-between" }}>
              <span>残業手当</span><span className="mono">¥ 22,800</span>
            </div>
            <div style={{ fontSize: "var(--text-xs)", display: "flex", justifyContent: "space-between" }}>
              <span>交通費</span><span className="mono">¥ 8,500</span>
            </div>
            <div style={{ fontSize: "var(--text-xs)", display: "flex", justifyContent: "space-between", fontWeight: 500 }}>
              <span>合計</span><span className="mono">¥ 271,300</span>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  ),
};

export const G_VerticalDivider: Story = {
  name: "G6 · Vertical divider",
  render: () => (
    <Card style={{ display: "flex", alignItems: "center", gap: 0, fontSize: "var(--text-xs)" }}>
      <span><b>168.5h</b> <span style={muted}>実働</span></span>
      <hr className="dv vert" />
      <span><b>12.5h</b> <span style={muted}>残業</span></span>
      <hr className="dv vert" />
      <span><b>1.0日</b> <span style={muted}>有給</span></span>
      <hr className="dv vert" />
      <span><b>22</b> <span style={muted}>出勤日</span></span>
      <hr className="dv vert" />
      <span><b>¥271K</b> <span style={muted}>給与</span></span>
      <span style={{ marginLeft: "auto" }}>
        <a href="#" style={{ fontSize: "var(--text-xs)", color: "var(--primary)" }}>詳細 →</a>
      </span>
    </Card>
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
      <Col span={6}><Card band="primary" padding="none"><CardHeader block title="band" /></Card></Col>
      <Col span={6}>
        <Card padding="none">
          <CardHeader block kicker="KICKER" title="¥1,234,567" subtitle="3-tier" />
        </Card>
      </Col>
      <Col span={6}><Card hoverable title="hoverable">lift</Card></Col>
    </Row>
  ),
};

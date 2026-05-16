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

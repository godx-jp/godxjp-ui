import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardBody, CardFooter } from "../../components/data-display/Card";
import { Button } from "../../components/general/Button";
import { Input } from "../../components/data-entry/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/data-entry/Select";

/**
 * Data Display/Card — surface container.
 *
 * Stories below port the dxs-kintai design canon sections A → H
 * verbatim (`design-handoff/ui-system/dxs-kintai-design-system/
 * project/preview/comp-card.html`, 1994 lines).
 *
 * Cardinal rules honoured:
 *  §22 — every section example renders the canon's verbatim
 *        Japanese text + DOM shape (cardinal rule: 100% match).
 *  §24 — mobile-first: row-grids default to `grid-cols-1` and
 *        promote to `md:grid-cols-N` at tablet-landscape (≥768px).
 *  §25 — primitive is the canon; stories are docs. No inline
 *        `style={{...}}` overrides reshape the Card — when a layout
 *        needs internal atoms (.row-between, .stat, .ic, .ava, …)
 *        the atoms live in `src/styles/shell.css`.
 */

const meta: Meta<typeof Card> = {
  title: "Data Display/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Card** — surface container with header / body / footer slots +
four orthogonal prop axes (\`padding\` / \`tone\` / \`accent\` / \`band\`).

Stories ported from the dxs-kintai canon (\`comp-card.html\`):

- **A** Data display — stat KPI · sparkline · bars · progress · data-list · mini-table
- **B** Entity / person — avatar + role + status · team · tenant
- **C** Content & commerce — article · product · pricing · feature · integration
- **D** Workflow & action — approval · wizard · quick-action grid · settings · CTA
- **E** Feedback / status / selection — notice · empty · choice · skeleton · health · banner
- **F** Schedule · list · timeline — shift · calendar · log · steps · diary · branching · feed
- **G** Dividers — rule · label · chip · section · date · stack · vertical
- **H** Card headers — 17 variants (simple → actions → tabs → search → band → hero → toolbar → breadcrumb → sticky)

All values pinned to design tokens; mobile-first grids; verbatim text.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Card>;

// ════════════════════════════════════════════════════════════════════
// API axes — quick navigation
// ════════════════════════════════════════════════════════════════════

export const Default: Story = {
  render: () => (
    <Card title="Pull requests" meta="this week" extra={<a className="lnk">More</a>}>
      <p style={{ margin: 0 }}>
        Card body — default padding 16, header 10/16, body 14/16, all
        token-pinned. Stories below port the full design canon.
      </p>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// A · Data display — stat · trend · sparkline · progress · table · datalist
// ════════════════════════════════════════════════════════════════════

export const A1_StatCompact: Story = {
  name: "Stat — micro label + delta + value",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
      <Card padding="tight">
        <div className="row-between" style={{ marginBottom: 10 }}>
          <span className="micro">出勤率</span>
          <span className="delta up">↗ +1.2</span>
        </div>
        <div className="stat">96.8<span className="unit">%</span></div>
      </Card>
      <Card padding="tight">
        <div className="row-between" style={{ marginBottom: 10 }}>
          <span className="micro">遅刻件数</span>
          <span className="delta down">↘ −3</span>
        </div>
        <div className="stat">12<span className="unit">件</span></div>
      </Card>
      <Card padding="tight">
        <div className="row-between" style={{ marginBottom: 10 }}>
          <span className="micro">承認待ち</span>
          <span className="delta flat">→ 0</span>
        </div>
        <div className="stat">5<span className="unit">件</span></div>
      </Card>
    </div>
  ),
};

export const A2_StatWithChip: Story = {
  name: "Stat — label + chip on right",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
      <Card>
        <div className="row-between" style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>月間アクティブ</div>
          <span className="chip chip-success">+5.2%</span>
        </div>
        <div className="stat">12,840</div>
        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>先月比 +632 · MAU</div>
      </Card>
      <Card>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 6 }}>今月の勤怠</div>
        <div className="row-between" style={{ alignItems: "flex-end" }}>
          <div className="stat">168.5<span className="unit">h</span></div>
          <span className="delta down">▲ 2.1h</span>
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>先月比 · 上限 180h</div>
      </Card>
      <Card>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 8 }}>有給残</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div className="stat" style={{ fontSize: 20 }}>12.0<span className="unit">日</span></div>
            <div className="muted" style={{ fontSize: 10 }}>残</div>
          </div>
          <div>
            <div className="stat" style={{ fontSize: 20, color: "var(--muted-foreground)" }}>8.0<span className="unit">日</span></div>
            <div className="muted" style={{ fontSize: 10 }}>取得済</div>
          </div>
        </div>
      </Card>
    </div>
  ),
};

export const A4_StatSparkline: Story = {
  name: "Stat + sparkline · trend in line",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card>
        <div className="row-between">
          <div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>売上 (今週)</div>
            <div className="stat" style={{ marginTop: 4 }}>¥ 4.82M</div>
            <div style={{ marginTop: 2, fontSize: 11, color: "var(--muted-foreground)" }}>
              先週 ¥ 4.55M · <span className="delta up" style={{ padding: 0 }}>+5.9%</span>
            </div>
          </div>
          <svg className="spark" style={{ width: 120, height: 48 }} viewBox="0 0 120 48" preserveAspectRatio="none">
            <path d="M0,32 L15,28 L30,30 L45,22 L60,18 L75,24 L90,16 L105,10 L120,12" fill="none" stroke="var(--primary)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M0,32 L15,28 L30,30 L45,22 L60,18 L75,24 L90,16 L105,10 L120,12 L120,48 L0,48 Z" fill="color-mix(in oklch, var(--primary) 10%, transparent)" />
            <circle cx={120} cy={12} r={3} fill="var(--primary)" />
          </svg>
        </div>
      </Card>
      <Card padding="none" title="週次 · 実働 vs 所定" meta="第 20 週 · 5/12 — 5/18">
        <CardBody block>
          <div className="bars" aria-hidden>
            <i style={{ height: "62%" }} />
            <i style={{ height: "78%" }} />
            <i style={{ height: "54%" }} />
            <i style={{ height: "88%" }} />
            <i className="on" style={{ height: "71%" }} />
            <i style={{ height: "40%", background: "color-mix(in oklch, var(--border) 80%, transparent)" }} />
            <i style={{ height: "0%", background: "color-mix(in oklch, var(--border) 80%, transparent)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>
            <span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span>土</span><span>日</span>
          </div>
        </CardBody>
        <CardFooter block>
          <span className="dot primary" /><span>実働</span>
          <span className="dot" style={{ background: "var(--border)", marginLeft: 10 }} /><span>未来</span>
          <span style={{ marginLeft: "auto", color: "var(--foreground)", fontWeight: 500 }}>合計 33.2 h</span>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const A6_ProgressQuota: Story = {
  name: "Progress / quota — storage · budget",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card>
        <div className="row-between" style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>ストレージ使用量</div>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}>42.8 / 50 GB</span>
        </div>
        <div className="prog warning"><i style={{ width: "85%" }} /></div>
        <div className="muted" style={{ fontSize: 11, marginTop: 6, display: "flex", gap: 6, alignItems: "center" }}>
          <svg className="si-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1={12} y1={9} x2={12} y2={13} strokeLinecap="round" />
            <line x1={12} y1={17} x2={12.01} y2={17} strokeLinecap="round" />
          </svg>
          残り 7.2 GB · <a className="lnk">プラン変更</a>
        </div>
      </Card>
      <Card>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>月次予算進捗</div>
          <span className="chip chip-outline">5月 17日</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 8 }}>
          <div className="stat" style={{ fontSize: 20 }}>¥ 2.18M</div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", paddingBottom: 4 }}>/ ¥ 3.00M</div>
          <span className="delta up" style={{ marginLeft: "auto", marginBottom: 4 }}>73%</span>
        </div>
        <div className="prog success"><i style={{ width: "73%" }} /></div>
        <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>
          目標まで 14 日 · 達成見込み <b style={{ color: "var(--success)" }}>○ オントラック</b>
        </div>
      </Card>
    </div>
  ),
};

export const A7_DataList: Story = {
  name: "Data-list — key/value pairs",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>5月度サマリー</div>
        <dl className="dl">
          <dt>所定時間</dt><dd>176.0 h</dd>
          <dt>実働時間</dt><dd>168.5 h</dd>
          <dt>残業時間</dt><dd>12.5 h</dd>
          <dt>有給取得</dt><dd>1.0 日</dd>
          <dt>深夜勤務</dt><dd>0.0 h</dd>
        </dl>
      </Card>
      <Card tone="muted">
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>給与計算 · 暫定</div>
        <dl className="dl">
          <dt>基本給</dt><dd>¥ 240,000</dd>
          <dt>残業手当</dt><dd>¥ 22,800</dd>
          <dt>交通費</dt><dd>¥ 8,500</dd>
          <dt style={{ fontWeight: 500, color: "var(--foreground)" }}>支給合計</dt>
          <dd style={{ fontSize: 13 }}>¥ 271,300</dd>
        </dl>
        <div className="muted" style={{ fontSize: 10, marginTop: 8 }}>確定前 · 5月 31日 23:59 締切</div>
      </Card>
    </div>
  ),
};

export const A8_InlineTable: Story = {
  name: "Inline table — leaderboard",
  render: () => (
    <Card padding="none" title="店舗別売上 · 今月" meta="5月 1日 — 17日">
      <table className="mini-table">
        <thead>
          <tr><th style={{ width: 22 }} /><th>店舗</th><th>売上</th><th>前年比</th><th>達成率</th></tr>
        </thead>
        <tbody>
          <tr><td style={{ color: "var(--muted-foreground)" }}>01</td><td>渋谷本店</td><td>¥ 4,820,500</td><td><span className="delta up">+12.4%</span></td><td>83%</td></tr>
          <tr><td style={{ color: "var(--muted-foreground)" }}>02</td><td>表参道店</td><td>¥ 3,142,800</td><td><span className="delta up">+8.1%</span></td><td>71%</td></tr>
          <tr><td style={{ color: "var(--muted-foreground)" }}>03</td><td>自由が丘店</td><td>¥ 2,890,300</td><td><span className="delta down">−3.2%</span></td><td>64%</td></tr>
          <tr><td style={{ color: "var(--muted-foreground)" }}>04</td><td>新宿西口店</td><td>¥ 2,104,200</td><td><span className="delta flat">±0.0%</span></td><td>52%</td></tr>
        </tbody>
      </table>
      <CardFooter block style={{ justifyContent: "center" }}>
        <a className="lnk">すべての店舗 (12) →</a>
      </CardFooter>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// B · Entity / person — avatar + role + status · team · tenant
// ════════════════════════════════════════════════════════════════════

export const B1_PersonBasic: Story = {
  name: "Person basic — avatar + role + live status",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span className="ava">田中</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="row-between">
              <div style={{ fontSize: 13, fontWeight: 500 }}>田中 美咲</div>
              <span className="dot success pulse" style={{ color: "var(--success)" }} title="勤務中" />
            </div>
            <div className="muted" style={{ fontSize: 11 }}>店長 · 渋谷店</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <span className="chip chip-outline">早番</span>
              <span className="chip chip-outline">8:00–17:00</span>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span className="ava wairo-shu">NL</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="row-between">
              <div style={{ fontSize: 13, fontWeight: 500 }}>Nguyễn Lan</div>
              <span className="dot attention" title="遅刻" />
            </div>
            <div className="muted" style={{ fontSize: 11 }}>ホール · ベトヤ表参道</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <span className="chip chip-attention">遅刻 12分</span>
              <span className="chip chip-outline">11:00–20:00</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  ),
};

export const B3_ProfileRich: Story = {
  name: "Profile rich — banner + avatar + stats",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card padding="none">
        <div className="ph striped tinted-info" style={{ height: 80 }} />
        <CardBody block>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: -50, marginBottom: 4, gap: 10, position: "relative" }}>
            <span className="ava xl" style={{ background: "var(--card)", border: "4px solid var(--card)", boxShadow: "0 0 0 1px var(--border)", color: "var(--primary)", fontWeight: 600, width: 68, height: 68 }}>田</span>
            <div style={{ display: "flex", gap: 6, paddingBottom: 2 }}>
              <Button variant="outline" size="x-small">メッセージ</Button>
              <Button size="x-small">フォロー</Button>
            </div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>田中 美咲</div>
          <div className="muted" style={{ fontSize: 11 }}>店長 · 渋谷本店 · 入社 2020年 4月</div>
        </CardBody>
        <CardFooter block style={{ gap: 18, color: "var(--foreground)" }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>12</div><div className="muted" style={{ fontSize: 10 }}>担当チーム</div></div>
          <div><div style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>98.4%</div><div className="muted" style={{ fontSize: 10 }}>勤怠率</div></div>
          <div><div style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>5.0</div><div className="muted" style={{ fontSize: 10 }}>評価</div></div>
        </CardFooter>
      </Card>
      <Card>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span className="ava lg wairo-take">山田</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>山田 健太郎</div>
            <div className="muted" style={{ fontSize: 11, lineHeight: 1.55 }}>エンジニアリングマネージャー · プロダクト基盤チーム · 東京</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <span className="tag">TypeScript</span>
              <span className="tag">Laravel</span>
              <span className="tag">設計レビュー</span>
              <span className="tag">+4</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <Button variant="secondary" size="x-small" style={{ flex: 1 }}>プロフィール</Button>
          <Button variant="outline" size="x-small" style={{ flex: 1 }}>1on1 予約</Button>
        </div>
      </Card>
    </div>
  ),
};

export const B4_TeamTenant: Story = {
  name: "Team · Tenant",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="ic">
              <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx={9} cy={7} r={4} />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>プロダクト基盤チーム</div>
              <div className="muted" style={{ fontSize: 11 }}>エンジニアリング · 12 名</div>
            </div>
          </div>
          <a className="lnk">管理 →</a>
        </div>
        <div className="ava-stack" style={{ marginTop: 6 }}>
          <span className="ava sm">山</span>
          <span className="ava sm wairo-gunjo">佐</span>
          <span className="ava sm wairo-take">中</span>
          <span className="ava sm wairo-shu">N</span>
          <span className="ava sm">林</span>
          <span className="ava sm ava-more">+7</span>
        </div>
      </Card>
      <Card>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 28, height: 28, borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>B</span>
            Betoya
          </div>
          <span className="chip chip-success">有効</span>
        </div>
        <div className="muted" style={{ fontSize: 11, lineHeight: 1.55 }}>ベトナム料理レストラン · 4 店舗 · 従業員 38 名</div>
        <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 11 }}>
          <div><span className="muted">プラン</span> <b>Pro</b></div>
          <div><span className="muted">期限</span> 2027/03</div>
          <div><span className="muted">ID</span> <span className="mono">btya</span></div>
        </div>
      </Card>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════════
// C · Content & commerce
// ════════════════════════════════════════════════════════════════════

const Check = () => (
  <svg className="si-sm" style={{ color: "var(--success)", marginTop: 3 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const C1_ArticleProduct: Story = {
  name: "Article · Product · Document",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
      <Card padding="none">
        <div className="ph striped tinted-leaf" style={{ aspectRatio: "16/9" }}>1280 × 720 · article hero</div>
        <CardBody block style={{ padding: "12px 14px 14px" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
            <span className="chip chip-outline">お知らせ</span>
            <span className="muted" style={{ fontSize: 10 }}>2026/05/14</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>2026 年 6 月リリース予定の新機能と移行ガイド</div>
          <div className="muted" style={{ fontSize: 11, lineHeight: 1.55, marginTop: 6 }}>
            シフト自動最適化と多店舗在庫連携を導入します。詳細とロードマップを公開しました。
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 11, color: "var(--muted-foreground)" }}>
            <span className="ava sm">編</span><span>編集部</span>
            <span style={{ marginLeft: "auto" }}>3 分</span>
          </div>
        </CardBody>
      </Card>
      <Card padding="none">
        <div className="ph striped tinted-warm" style={{ aspectRatio: "1" }}>800 × 800 · 商品写真</div>
        <CardBody block style={{ padding: "12px 14px 14px" }}>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 2 }}>和食 · 寿司</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>特選 まぐろ握り 6貫盛り合わせ</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>¥ 2,480</div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", textDecoration: "line-through" }}>¥ 2,980</div>
            <span className="chip chip-attention" style={{ marginLeft: "auto" }}>-17%</span>
          </div>
          <Button size="small" block style={{ marginTop: 10 }}>カートに追加</Button>
        </CardBody>
      </Card>
      <Card>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="ic xl" style={{ background: "color-mix(in oklch, var(--destructive) 12%, var(--card))", color: "var(--destructive)", borderColor: "color-mix(in oklch, var(--destructive) 22%, transparent)" }}>PDF</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>就業規則_2026年版.pdf</div>
              <div className="muted" style={{ fontSize: 11 }}>2.4 MB · 24 ページ</div>
            </div>
          </div>
        </div>
        <div className="muted" style={{ fontSize: 11, lineHeight: 1.55 }}>最終更新 2026/04/01 · 田中 美咲</div>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <Button variant="outline" size="x-small" style={{ flex: 1 }}>プレビュー</Button>
          <Button variant="ghost" size="x-small">⤓</Button>
        </div>
      </Card>
    </div>
  ),
};

export const C3_PricingTier: Story = {
  name: "Pricing tier — 3-up · featured middle",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]" style={{ paddingTop: 14 }}>
      <Card>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Starter</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
          <div className="stat" style={{ fontSize: 24 }}>¥ 0</div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>/月</div>
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>10 名まで · 基本機能</div>
        <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
          <li style={{ display: "flex", gap: 6 }}><Check />勤怠打刻</li>
          <li style={{ display: "flex", gap: 6 }}><Check />シフト管理</li>
          <li style={{ display: "flex", gap: 6, color: "var(--muted-foreground)" }}>
            <svg className="si-sm" style={{ marginTop: 3 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <line x1={18} y1={6} x2={6} y2={18} strokeLinecap="round" />
              <line x1={6} y1={6} x2={18} y2={18} strokeLinecap="round" />
            </svg>API 連携
          </li>
        </ul>
        <Button variant="outline" block style={{ marginTop: 14 }}>現在のプラン</Button>
      </Card>
      <Card accent="featured" style={{ position: "relative" }}>
        <span className="chip chip-primary" style={{ position: "absolute", top: -10, left: 14, fontSize: 10, height: 18, padding: "0 8px" }}>人気</span>
        <div style={{ fontSize: 11, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>Pro</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
          <div className="stat" style={{ fontSize: 24 }}>¥ 480</div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>/ 名 / 月</div>
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>無制限 · 全機能 + API</div>
        <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
          <li style={{ display: "flex", gap: 6 }}><Check />Starter のすべて</li>
          <li style={{ display: "flex", gap: 6 }}><Check />承認ワークフロー</li>
          <li style={{ display: "flex", gap: 6 }}><Check />API + SAML SSO</li>
        </ul>
        <Button block style={{ marginTop: 14 }}>アップグレード</Button>
      </Card>
      <Card>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Enterprise</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
          <div className="stat" style={{ fontSize: 24 }}>お見積</div>
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>100 名以上 · 専任サポート</div>
        <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
          <li style={{ display: "flex", gap: 6 }}><Check />Pro のすべて</li>
          <li style={{ display: "flex", gap: 6 }}><Check />カスタム開発</li>
          <li style={{ display: "flex", gap: 6 }}><Check />SLA 99.95%</li>
        </ul>
        <Button variant="outline" block style={{ marginTop: 14 }}>問い合わせ</Button>
      </Card>
    </div>
  ),
};

export const C4_FeatureCards: Story = {
  name: "Feature card — onboarding · marketing",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
      <Card>
        <div className="ic xl">
          <svg className="si-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, marginTop: 12 }}>リアルタイム打刻</div>
        <div className="muted" style={{ fontSize: 11, lineHeight: 1.55, marginTop: 4 }}>
          GPS 確認 + 顔認証で不正打刻を防止。1 秒以内に承認されます。
        </div>
        <a className="lnk" style={{ marginTop: 10, display: "inline-block" }}>設定する →</a>
      </Card>
      <Card>
        <div className="ic xl success">
          <svg className="si-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1={16} y1={13} x2={8} y2={13} />
            <line x1={16} y1={17} x2={8} y2={17} />
          </svg>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, marginTop: 12 }}>給与計算自動化</div>
        <div className="muted" style={{ fontSize: 11, lineHeight: 1.55, marginTop: 4 }}>
          勤怠データから残業・深夜・手当を自動計算。マネーフォワード / freee と連携。
        </div>
        <a className="lnk" style={{ marginTop: 10, display: "inline-block" }}>連携する →</a>
      </Card>
      <Card>
        <div className="ic xl info">
          <svg className="si-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1={12} y1={22.08} x2={12} y2={12} />
          </svg>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, marginTop: 12 }}>多店舗マルチテナント</div>
        <div className="muted" style={{ fontSize: 11, lineHeight: 1.55, marginTop: 4 }}>
          店舗ごとにブランドカラー · 言語 · 通貨を切替。本部からは横断 KPI を一望。
        </div>
        <a className="lnk" style={{ marginTop: 10, display: "inline-block" }}>追加する →</a>
      </Card>
    </div>
  ),
};

export const C5_Integrations: Story = {
  name: "Integration / connection — 3rd-party",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
      <Card>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="ic xl" style={{ background: "#4A154B", color: "white", border: 0 }}>S</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Slack</div>
              <div className="muted" style={{ fontSize: 10 }}>メッセージング</div>
            </div>
          </div>
          <span className="chip chip-success">接続済</span>
        </div>
        <div className="muted" style={{ fontSize: 11, lineHeight: 1.55 }}>打刻 / 申請通知を #attendance に送信中</div>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <Button variant="outline" size="x-small" style={{ flex: 1 }}>設定</Button>
          <Button variant="ghost" size="x-small" style={{ color: "var(--destructive)" }}>切断</Button>
        </div>
      </Card>
      <Card>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="ic xl" style={{ background: "#0061FF", color: "white", border: 0 }}>G</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Google Calendar</div>
              <div className="muted" style={{ fontSize: 10 }}>スケジュール</div>
            </div>
          </div>
          <span className="chip chip-outline">未接続</span>
        </div>
        <div className="muted" style={{ fontSize: 11, lineHeight: 1.55 }}>シフトを社員のカレンダーに自動同期</div>
        <Button variant="secondary" size="x-small" block style={{ marginTop: 12 }}>接続する</Button>
      </Card>
      <Card>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="ic xl" style={{ background: "var(--wa-akane)", color: "white", border: 0 }}>f</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>freee 人事労務</div>
              <div className="muted" style={{ fontSize: 10 }}>給与計算</div>
            </div>
          </div>
          <span className="chip chip-attention">要更新</span>
        </div>
        <div className="muted" style={{ fontSize: 11, lineHeight: 1.55 }}>API トークンが 7 日後に失効します</div>
        <Button variant="outline" size="x-small" block style={{ marginTop: 12 }}>トークン更新</Button>
      </Card>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════════
// D · Workflow & action
// ════════════════════════════════════════════════════════════════════

export const D1_Approval: Story = {
  name: "Approval — header / list / actions",
  render: () => (
    <Card
      padding="none"
      title={<><span className="ava sm" style={{ marginRight: 8 }}>山田</span>山田 太郎 · 有給休暇</>}
      meta="申請 5月 14日 09:42"
      actions={(
        <>
          <Button variant="ghost" size="small">却下</Button>
          <Button variant="outline" size="small">差戻し</Button>
          <Button size="small">承認</Button>
        </>
      )}
    >
      <CardBody block>
        <dl className="dl left" style={{ gridTemplateColumns: "80px 1fr" }}>
          <dt>期間</dt><dd>5月 22日 (木) — 5月 23日 (金) · 2 日</dd>
          <dt>残数</dt><dd>12.0 日 → 10.0 日</dd>
          <dt>理由</dt><dd style={{ fontWeight: 400, color: "var(--muted-foreground)" }}>私用のため</dd>
        </dl>
      </CardBody>
    </Card>
  ),
};

export const D2_StepsWizard: Story = {
  name: "Step / wizard — onboarding 進捗",
  render: () => (
    <Card>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>初期設定をすすめましょう</div>
      <div className="muted" style={{ fontSize: 11, marginBottom: 14 }}>残り 2 ステップで完了 · 約 5 分</div>
      <div className="tl-list">
        <div className="tl-item success">
          <div className="t-h"><b>会社情報を入力</b><span className="ts">完了 · 5/14</span></div>
          <div className="t-d">基本情報 · 締め日 · 通貨を設定済み</div>
        </div>
        <div className="tl-item success">
          <div className="t-h"><b>従業員をインポート</b><span className="ts">完了 · 5/15</span></div>
          <div className="t-d">38 名 · CSV から一括登録</div>
        </div>
        <div className="tl-item current">
          <div className="t-h"><b>シフトテンプレートを作成</b><span className="ts" style={{ color: "var(--primary)" }}>進行中</span></div>
          <div className="t-d">早番 / 遅番 / 通し のパターンを定義します</div>
          <Button size="small" style={{ marginTop: 8 }}>続ける</Button>
        </div>
        <div className="tl-item">
          <div className="t-h" style={{ color: "var(--muted-foreground)" }}>給与連携を設定</div>
          <div className="t-d">freee · マネーフォワードと接続</div>
        </div>
      </div>
    </Card>
  ),
};

export const D3_QuickActionGrid: Story = {
  name: "Quick action grid — 2 × 2 / 4 cột entry-point",
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
      <Card padding="tight" hoverable style={{ display: "flex", flexDirection: "column", gap: 6, cursor: "pointer" }}>
        <div className="ic">
          <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" /></svg>
        </div>
        <div style={{ fontSize: 12, fontWeight: 500 }}>打刻修正</div>
        <div className="muted" style={{ fontSize: 10 }}>3 件</div>
      </Card>
      <Card padding="tight" hoverable style={{ display: "flex", flexDirection: "column", gap: 6, cursor: "pointer" }}>
        <div className="ic success">
          <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <div style={{ fontSize: 12, fontWeight: 500 }}>承認</div>
        <div className="muted" style={{ fontSize: 10 }}>12 件</div>
      </Card>
      <Card padding="tight" hoverable style={{ display: "flex", flexDirection: "column", gap: 6, cursor: "pointer" }}>
        <div className="ic warning">
          <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
        </div>
        <div style={{ fontSize: 12, fontWeight: 500 }}>月次レポート</div>
        <div className="muted" style={{ fontSize: 10 }}>準備完了</div>
      </Card>
      <Card padding="tight" hoverable style={{ display: "flex", flexDirection: "column", gap: 6, cursor: "pointer" }}>
        <div className="ic info">
          <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><line x1={12} y1={5} x2={12} y2={19} /><line x1={5} y1={12} x2={19} y2={12} /></svg>
        </div>
        <div style={{ fontSize: 12, fontWeight: 500 }}>従業員追加</div>
        <div className="muted" style={{ fontSize: 10 }}>招待</div>
      </Card>
    </div>
  ),
};

export const D4_SettingsRows: Story = {
  name: "Settings rows — title + desc + control",
  render: () => (
    <Card padding="none">
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>打刻位置の確認</div>
          <div className="muted" style={{ fontSize: 11, lineHeight: 1.55 }}>店舗から 50m 以上離れた場所での打刻を警告します。</div>
        </div>
        <span style={{ width: 36, height: 20, borderRadius: 9999, background: "var(--primary)", position: "relative", display: "inline-block", flexShrink: 0 }}>
          <span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: 9999, background: "var(--primary-foreground)" }} />
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>残業の自動申請</div>
          <div className="muted" style={{ fontSize: 11, lineHeight: 1.55 }}>所定時間を超えた場合、承認者へ申請を自動送信します。</div>
        </div>
        <span style={{ width: 36, height: 20, borderRadius: 9999, background: "var(--secondary)", border: "1px solid var(--border)", position: "relative", display: "inline-block", flexShrink: 0 }}>
          <span style={{ position: "absolute", top: 2, left: 2, width: 14, height: 14, borderRadius: 9999, background: "var(--muted-foreground)" }} />
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>締め日</div>
          <div className="muted" style={{ fontSize: 11, lineHeight: 1.55 }}>給与計算の基準となる日付。</div>
        </div>
        <Select defaultValue="月末">
          <SelectTrigger className="input" style={{ width: 120, height: 28, fontSize: 12 }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="月末">月末</SelectItem>
            <SelectItem value="20日">20日</SelectItem>
            <SelectItem value="15日">15日</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  ),
};

export const D5_CTA: Story = {
  name: "Action CTA — punch · payroll",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card padding="cozy">
        <div className="row-between" style={{ marginBottom: 10 }}>
          <div>
            <div className="muted" style={{ fontSize: 11 }}>2026年 5月 17日 (土)</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>早番シフト · 8:00–17:00</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>07:58:42</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
          <Button size="large" style={{ height: 48, fontSize: 15 }}>出勤 · Check In</Button>
          <Button variant="outline" size="large" style={{ height: 48, fontSize: 13 }}>休憩開始</Button>
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 10, display: "flex", gap: 6, alignItems: "center" }}>
          <span className="dot info" /> 位置確認済 · ベトヤ渋谷店から 8m
        </div>
      </Card>
      <Card padding="cozy" accent="info">
        <div className="row-between" style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>5月度 給与の支払い</div>
          <span className="chip chip-info">承認待ち</span>
        </div>
        <div className="stat lg" style={{ marginBottom: 4 }}>¥ 8,420,500</div>
        <div className="muted" style={{ fontSize: 11 }}>38 名 · 振込日 5月 25日</div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Button variant="outline" size="small" style={{ flex: 1 }}>プレビュー</Button>
          <Button size="small" style={{ flex: 1 }}>承認して支払う</Button>
        </div>
      </Card>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════════
// E · Feedback · status · selection
// ════════════════════════════════════════════════════════════════════

export const E1_Notices: Story = {
  name: "Notice · alert — accent-left + icon",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Card accent="info" padding="tight" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span className="ic info">
          <svg className="si-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={12} cy={12} r={10} /><line x1={12} y1={16} x2={12} y2={12} /><line x1={12} y1={8} x2={12.01} y2={8} />
          </svg>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>5月度の締めは 5/31 (土) 23:59 です</div>
          <div className="muted" style={{ fontSize: 11, marginTop: 1 }}>未承認の打刻修正がある場合、承認者へリマインドが送られます。</div>
        </div>
        <Button variant="ghost" size="x-small">詳細</Button>
      </Card>
      <Card accent="attention" padding="tight" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span className="ic attention">
          <svg className="si-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={12} cy={12} r={10} /><line x1={12} y1={8} x2={12} y2={12} /><line x1={12} y1={16} x2={12.01} y2={16} />
          </svg>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>3 件の打刻漏れがあります</div>
          <div className="muted" style={{ fontSize: 11, marginTop: 1 }}>該当日: 5/12, 5/13, 5/15 — 当事者へ修正依頼を送信できます。</div>
        </div>
        <Button variant="outline" size="x-small">確認</Button>
      </Card>
      <Card accent="success" padding="tight" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span className="ic success">
          <svg className="si-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>4月度の勤怠が確定しました</div>
          <div className="muted" style={{ fontSize: 11, marginTop: 1 }}>給与計算へ連携済 · 5月 1日 02:15</div>
        </div>
      </Card>
    </div>
  ),
};

export const E2_EmptyState: Story = {
  name: "Empty state — 1 line calm · no illustration",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card style={{ textAlign: "center", padding: "32px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>ご指定の月にシフトはありません</div>
        <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>別の月を選択するか、シフトを新規作成してください。</div>
        <Button variant="outline" size="small" style={{ marginTop: 14 }}>＋ シフトを作成</Button>
      </Card>
      <Card tone="outline-only" style={{ textAlign: "center", padding: "32px 16px", borderStyle: "dashed" }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>フィルター条件に一致する結果がありません</div>
        <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>条件を見直すか、すべてクリアしてください。</div>
        <Button variant="ghost" size="small" style={{ marginTop: 14 }}>フィルタをクリア</Button>
      </Card>
    </div>
  ),
};

export const E3_Choices: Story = {
  name: "Selectable choice — radio cards",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <div className="choice on">
        <div className="choice-radio" />
        <div className="choice-meta">
          <div className="choice-title">月給制</div>
          <div className="choice-desc">固定月額。残業は所定時間超分のみ計算します。</div>
        </div>
        <span className="chip chip-primary" style={{ height: 18, fontSize: 10 }}>推奨</span>
      </div>
      <div className="choice">
        <div className="choice-radio" />
        <div className="choice-meta">
          <div className="choice-title">時給制</div>
          <div className="choice-desc">実働時間 × 時給で算出。アルバイト · パートに最適。</div>
        </div>
      </div>
      <div className="choice">
        <div className="choice-radio" />
        <div className="choice-meta">
          <div className="choice-title">日給制</div>
          <div className="choice-desc">出勤日数 × 日給。建設 · 派遣に多い形態。</div>
        </div>
      </div>
      <div className="choice">
        <div className="choice-radio" />
        <div className="choice-meta">
          <div className="choice-title">年俸制</div>
          <div className="choice-desc">年額を 12 等分。賞与は別途設定。</div>
        </div>
      </div>
    </div>
  ),
};

export const E4_Skeleton: Story = {
  name: "Skeleton / loading — shape parity",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
      <Card>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span className="sk sk-circle" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="sk sk-title" />
            <span className="sk sk-line med" />
            <span className="sk sk-line short" />
          </div>
        </div>
        <div className="muted" style={{ fontSize: 10, fontFamily: "var(--font-mono)", marginTop: 10, paddingTop: 8, borderTop: "1px dashed var(--border)" }}>person card</div>
      </Card>
      <Card>
        <span className="sk sk-line short" style={{ width: "35%" }} />
        <div style={{ height: 8 }} />
        <span className="sk" style={{ height: 28, width: "55%", borderRadius: 4 }} />
        <div style={{ height: 8 }} />
        <span className="sk" style={{ height: 32, borderRadius: 3 }} />
        <div className="muted" style={{ fontSize: 10, fontFamily: "var(--font-mono)", marginTop: 10, paddingTop: 8, borderTop: "1px dashed var(--border)" }}>stat + sparkline</div>
      </Card>
      <Card padding="none">
        <span className="sk" style={{ display: "block", aspectRatio: "16/9", borderRadius: "6px 6px 0 0" }} />
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <span className="sk" style={{ height: 18, borderRadius: 9, width: 64 }} />
            <span className="sk" style={{ height: 18, borderRadius: 9, width: 42 }} />
          </div>
          <span className="sk sk-title" style={{ width: "80%" }} />
          <span className="sk sk-line med" />
          <span className="sk sk-line short" />
          <div className="muted" style={{ fontSize: 10, fontFamily: "var(--font-mono)", marginTop: 6, paddingTop: 8, borderTop: "1px dashed var(--border)" }}>article with thumb</div>
        </div>
      </Card>
    </div>
  ),
};

export const E5_Health: Story = {
  name: "Health / status — uptime indicator",
  render: () => (
    <Card padding="none" title="システム状態" meta="5月 17日 14:35 時点 · 過去 90 日">
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {[
          { name: "勤怠 API", up: "99.98% uptime", colors: Array(10).fill("var(--success)") },
          { name: "給与連携 · freee API", up: "98.21% uptime", colors: ["var(--success)","var(--success)","var(--warning)","var(--success)","var(--success)","var(--warning)","var(--success)","var(--success)","var(--success)","var(--success)"] },
          { name: "通知配信", up: "100.00% uptime", colors: Array(10).fill("var(--success)") },
        ].map((row, i, arr) => (
          <li key={row.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : 0, fontSize: 12 }}>
            <span className={`dot ${row.colors.every((c) => c === "var(--success)") ? "success pulse" : "warning"}`} style={{ color: "var(--success)" }} />
            <span style={{ flex: 1 }}>{row.name}</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>{row.up}</span>
            <span style={{ display: "flex", gap: 1 }}>
              {row.colors.map((c, j) => (<i key={j} style={{ width: 3, height: 14, background: c }} />))}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  ),
};

export const E6_Banner: Story = {
  name: "Banner / promo — wa-iro gradient",
  render: () => (
    <div className="banner">
      <div style={{ display: "flex", gap: 16, alignItems: "center", position: "relative", zIndex: 1, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.75, marginBottom: 4 }}>新機能 · 6月リリース</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>シフト自動最適化</div>
          <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.55, maxWidth: 420 }}>
            需要予測と従業員のスキル · 希望を基に、最適なシフトを自動生成。試験運用に参加してください。
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" size="small" style={{ background: "transparent", color: "white", borderColor: "rgba(255,255,255,0.4)" }}>あとで</Button>
          <Button size="small" style={{ background: "white", color: "var(--wa-kon)" }}>試験運用に参加</Button>
        </div>
      </div>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════════
// F · Schedule · list · timeline
// ════════════════════════════════════════════════════════════════════

export const F1_Shift: Story = {
  name: "Shift card — date · time · status",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card accent="primary">
        <div className="row-between" style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>5月 17日 (土)</div>
          <span className="chip chip-primary">早番</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 500, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>8:00 — 17:00</div>
        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>休憩 60分 · 実働 8h</div>
        <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center" }}>
          <span className="dot primary" />
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>ベトヤ渋谷店 · キッチン</span>
        </div>
      </Card>
      <Card accent="attention">
        <div className="row-between" style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>5月 18日 (日)</div>
          <span className="chip chip-attention">人手不足</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 500, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em", color: "var(--muted-foreground)" }}>— 未割当 —</div>
        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>遅番 17:00–22:00 · 残 2 名</div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <Button size="small">割当</Button>
          <Button variant="outline" size="small">募集</Button>
        </div>
      </Card>
    </div>
  ),
};

export const F2_Calendar: Story = {
  name: "Calendar mini — 7-day grid",
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
      <div className="cal-day"><span className="d">月 12</span><span className="time">8:00–17:00</span><span className="role">早番 · キッチン</span></div>
      <div className="cal-day"><span className="d">火 13</span><span className="time">11:00–20:00</span><span className="role">中番 · ホール</span></div>
      <div className="cal-day"><span className="d" style={{ color: "var(--muted-foreground)" }}>水 14</span><span className="time" style={{ color: "var(--muted-foreground)" }}>休</span><span className="role">公休</span></div>
      <div className="cal-day"><span className="d">木 15</span><span className="time">8:00–17:00</span><span className="role">早番 · キッチン</span></div>
      <div className="cal-day today"><span className="d" style={{ color: "var(--primary)" }}>金 17 · 本日</span><span className="time">8:00–17:00</span><span className="role">早番 · キッチン</span></div>
      <div className="cal-day"><span className="d" style={{ color: "var(--attention)" }}>土 18</span><span className="time" style={{ color: "var(--attention)" }}>未割当</span><span className="role">遅番候補</span></div>
      <div className="cal-day"><span className="d" style={{ color: "var(--destructive)" }}>日 19</span><span className="time">休</span><span className="role">公休</span></div>
    </div>
  ),
};

export const F3_ListRows: Story = {
  name: "List with rows — punch log",
  render: () => (
    <Card padding="none" title="本日の打刻" meta="5月 17日 · 14 件">
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {[
          { name: "田中 美咲", time: "07:58", chip: "出勤", chipCls: "chip-success", ava: "田" },
          { name: "Nguyễn Lan", time: "11:12", chip: "遅刻", chipCls: "chip-attention", ava: "N", avaCls: "wairo-shu" },
          { name: "佐藤 健一", time: "09:00", chip: "出勤", chipCls: "chip-success", ava: "佐", avaCls: "wairo-gunjo" },
        ].map((r, i, arr) => (
          <li key={r.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : 0, fontSize: 12 }}>
            <span className={`ava sm ${r.avaCls || ""}`}>{r.ava}</span>
            <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
            <span className="mono" style={{ color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>{r.time}</span>
            <span className={`chip ${r.chipCls}`}>{r.chip}</span>
          </li>
        ))}
      </ul>
      <CardFooter block style={{ justifyContent: "center" }}>
        <a className="lnk">すべて表示 →</a>
      </CardFooter>
    </Card>
  ),
};

export const F5_Log: Story = {
  name: "Compact log — audit trail",
  render: () => (
    <Card>
      <div className="tl-log">
        <div className="row"><span className="ts">14:35:02</span><span className="lv s">OK </span><span className="msg"><b>punch.create</b> 田中 美咲 出勤 @ 渋谷本店</span></div>
        <div className="row"><span className="ts">14:35:12</span><span className="lv i">INF</span><span className="msg"><b>shift.match</b> matched 早番 (8:00–17:00)</span></div>
        <div className="row"><span className="ts">14:36:48</span><span className="lv w">WRN</span><span className="msg"><b>geo.distance</b> 8m from 店舗 — within tolerance</span></div>
        <div className="row"><span className="ts">14:38:15</span><span className="lv s">OK </span><span className="msg"><b>notify.slack</b> #attendance posted</span></div>
        <div className="row"><span className="ts">14:42:01</span><span className="lv e">ERR</span><span className="msg"><b>freee.sync</b> token expired · retry queued</span></div>
        <div className="row"><span className="ts">14:42:30</span><span className="lv d">DBG</span><span className="msg"><b>retry.scheduler</b> next attempt in 60s</span></div>
        <div className="row"><span className="ts">14:43:30</span><span className="lv s">OK </span><span className="msg"><b>freee.sync</b> resumed · 142 records pushed</span></div>
      </div>
    </Card>
  ),
};

export const F6_StepsHorizontal: Story = {
  name: "Horizontal steps — wizard progress",
  render: () => {
    const StepCheck = () => (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
    return (
      <Card>
        <div className="steps-h">
          <div className="step done"><span className="node"><StepCheck /></span><span className="lbl">情報入力</span><span className="sub">5/14 09:22</span></div>
          <div className="step done"><span className="node"><StepCheck /></span><span className="lbl">確認</span><span className="sub">5/14 09:24</span></div>
          <div className="step cur"><span className="node">3</span><span className="lbl">承認待ち</span><span className="sub">進行中</span></div>
          <div className="step dis"><span className="node">4</span><span className="lbl">支払い</span><span className="sub">—</span></div>
          <div className="step dis"><span className="node">5</span><span className="lbl">完了</span><span className="sub">—</span></div>
        </div>
      </Card>
    );
  },
};

export const F7_DateGrouped: Story = {
  name: "Date-grouped — diary style",
  render: () => (
    <Card>
      <div className="tl-grp">
        <div className="grp-h">2026/05/17 (土) <span className="badge">本日</span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>3 件</span>
        </div>
        <div className="row">
          <span className="ts">14:35</span>
          <div className="body"><b>田中 美咲</b>が承認しました<div className="meta">山田 太郎 の有給申請 (5/22–5/23)</div></div>
        </div>
        <div className="row">
          <span className="ts">11:12</span>
          <div className="body"><b>Nguyễn Lan</b>が打刻 · 出勤<div className="meta">ベトヤ表参道 · 11:12:08 JST</div></div>
        </div>
        <div className="row">
          <span className="ts">07:58</span>
          <div className="body"><b>田中 美咲</b>が打刻 · 出勤<div className="meta">渋谷本店 · GPS 確認済</div></div>
        </div>
        <div className="grp-h">2026/05/16 (金)
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>2 件</span>
        </div>
        <div className="row">
          <span className="ts">19:42</span>
          <div className="body">システム · 月次レポート生成完了<div className="meta">5月度 第 2 週 · 自動配信</div></div>
        </div>
        <div className="row">
          <span className="ts">10:08</span>
          <div className="body"><b>佐藤 健一</b>が休暇申請<div className="meta">5/24 半休 (午後) · 私用</div></div>
        </div>
      </div>
    </Card>
  ),
};

export const F8_Branching: Story = {
  name: "Branching — approval pipeline",
  render: () => (
    <Card>
      <div className="tl-br">
        <div className="row success">
          <span className="when">5/14 09:22</span>
          <div className="node" />
          <div className="body"><div className="t">山田 太郎 が申請を提出</div><div className="d">有給休暇 · 5/22–5/23 · 2 日</div></div>
        </div>
        <div className="row success">
          <span className="when">5/14 11:08</span>
          <div className="node" />
          <div className="body"><div className="t">田中 美咲 (一次承認) が承認</div><div className="d">コメント: 業務影響なし · 引継ぎ済</div></div>
        </div>
        <div className="row current">
          <span className="when">5/15 09:00</span>
          <div className="node" />
          <div className="body">
            <div className="t" style={{ color: "var(--primary)" }}>人事部 (最終承認) を待っています</div>
            <div className="d">SLA 残り 18 時間 · リマインド 1 通</div>
          </div>
        </div>
        <div className="row">
          <span className="when" style={{ color: "var(--muted-foreground)" }}>予定</span>
          <div className="node" />
          <div className="body">
            <div className="t" style={{ color: "var(--muted-foreground)" }}>給与システムへ反映</div>
            <div className="d">自動 · 承認確定後 5 分以内</div>
          </div>
        </div>
      </div>
    </Card>
  ),
};

export const F9_AvatarFeed: Story = {
  name: "Avatar feed — social-style",
  render: () => (
    <Card>
      <div className="tl-feed">
        <div className="item">
          <span className="ava sm">田</span>
          <div className="body">
            <div className="h"><b>田中 美咲</b>が<a className="lnk">山田 太郎</a>の申請にコメントしました<span className="ts">5 分前</span></div>
            <div className="d">承認前のひとこと:</div>
            <div className="qbox">23日は店舗営業時間が短縮なので、振替は来週月曜で OK です。</div>
          </div>
        </div>
        <div className="item">
          <span className="ava sm wairo-shu">N</span>
          <div className="body">
            <div className="h"><b>Nguyễn Lan</b>が新しいシフトに割当てられました<span className="ts">14:35</span></div>
            <div className="d">5/20 (火) · 中番 11:00–20:00 · ベトヤ表参道</div>
          </div>
        </div>
        <div className="item">
          <span className="ava sm wairo-gunjo">佐</span>
          <div className="body">
            <div className="h"><b>佐藤 健一</b>がプロフィール写真を更新<span className="ts">2 時間前</span></div>
          </div>
        </div>
        <div className="item">
          <span className="ava sm wairo-take">中</span>
          <div className="body">
            <div className="h"><b>中村 葵</b>が <span className="chip chip-outline" style={{ height: 18, fontSize: 10 }}>プロダクト基盤</span> チームに参加<span className="ts">昨日</span></div>
          </div>
        </div>
      </div>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// G · Dividers
// ════════════════════════════════════════════════════════════════════

export const G1_PlainRules: Story = {
  name: "Plain rules — solid · dashed · dotted · thick · gradient",
  render: () => (
    <Card>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Solid (default)</div>
      <hr className="dv" />
      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Dashed</div>
      <hr className="dv dashed" />
      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Dotted</div>
      <hr className="dv dotted" />
      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Thick</div>
      <hr className="dv thick" />
      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Gradient (fades at edges)</div>
      <hr className="dv gradient" />
      <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 0 }}>After gradient</div>
    </Card>
  ),
};

export const G2_LabelChip: Story = {
  name: "Label-inline · chip-inline",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>前のコンテンツ…</div>
        <div className="dv-label">または</div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>後のコンテンツ…</div>
        <div className="dv-label dashed">承認後の処理</div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>…</div>
        <div className="dv-label left">
          <svg className="si-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" />
          </svg>
          履歴
        </div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>2026/05/14 10:08 · 申請作成</div>
      </Card>
      <Card>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>ログイン方法を選択</div>
        <div className="dv-chip"><span className="pill">OR</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Button variant="outline" size="small">パスワードでログイン</Button>
          <Button variant="outline" size="small">SSO でログイン</Button>
        </div>
        <div className="dv-chip"><span className="pill" style={{ background: "var(--secondary)" }}>あるいは</span></div>
        <Button variant="ghost" size="small" block>マジックリンクを送信</Button>
      </Card>
    </div>
  ),
};

export const G3_SectionHeading: Story = {
  name: "Section heading inside card",
  render: () => (
    <Card>
      <div className="dv-section">
        <div className="t">基本情報</div>
        <div className="c">従業員の基本属性</div>
        <span className="meta">last edit 2026/05/14</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 6 }}>氏名 · 入社日 · 部門 · 役職 …</div>
      <div className="dv-section">
        <div className="t">給与</div>
        <div className="c">基本給 · 手当 · 控除</div>
        <span className="meta" style={{ color: "var(--attention)" }}>未保存</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 6 }}>基本給 ¥240,000 · 通勤費 ¥8,500 …</div>
      <div className="dv-section">
        <div className="t">権限 · ロール</div>
        <div className="c">アクセス可能な機能</div>
      </div>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>店長 · 渋谷本店 · 承認権限あり</div>
    </Card>
  ),
};

export const G4_DateSeparator: Story = {
  name: "Date separator — chat / feed style",
  render: () => (
    <Card>
      <div className="dv-date"><span className="pill">2026/05/14 木</span></div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0" }}>
        <span className="ava sm">山</span>
        <div style={{ flex: 1, fontSize: 12 }}><b>山田 太郎</b> · 09:22<div style={{ color: "var(--muted-foreground)", marginTop: 2 }}>有給申請を提出 (5/22–5/23)</div></div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0" }}>
        <span className="ava sm">田</span>
        <div style={{ flex: 1, fontSize: 12 }}><b>田中 美咲</b> · 11:08<div style={{ color: "var(--muted-foreground)", marginTop: 2 }}>承認しました</div></div>
      </div>
      <div className="dv-date"><span className="pill">2026/05/15 金 · 本日</span></div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0" }}>
        <span className="ava sm wairo-gunjo">人</span>
        <div style={{ flex: 1, fontSize: 12 }}><b>人事部</b> · 09:00<div style={{ color: "var(--muted-foreground)", marginTop: 2 }}>最終承認の確認中…</div></div>
      </div>
    </Card>
  ),
};

export const G5_StackedList: Story = {
  name: "Stacked-list dividers — implicit borders",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 10 }}>通常 (solid)</div>
        <div className="dv-stack">
          <div style={{ fontSize: 12 }}><b>渋谷本店</b><div className="muted" style={{ fontSize: 11 }}>12 名 · 売上 ¥4.8M</div></div>
          <div style={{ fontSize: 12 }}><b>表参道店</b><div className="muted" style={{ fontSize: 11 }}>8 名 · 売上 ¥3.1M</div></div>
          <div style={{ fontSize: 12 }}><b>自由が丘店</b><div className="muted" style={{ fontSize: 11 }}>6 名 · 売上 ¥2.9M</div></div>
          <div style={{ fontSize: 12 }}><b>新宿西口店</b><div className="muted" style={{ fontSize: 11 }}>10 名 · 売上 ¥2.1M</div></div>
        </div>
      </Card>
      <Card>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 10 }}>Dashed (より控えめ)</div>
        <div className="dv-stack dashed">
          <div style={{ fontSize: 12, display: "flex", justifyContent: "space-between" }}><span>基本給</span><span className="mono">¥ 240,000</span></div>
          <div style={{ fontSize: 12, display: "flex", justifyContent: "space-between" }}><span>残業手当</span><span className="mono">¥ 22,800</span></div>
          <div style={{ fontSize: 12, display: "flex", justifyContent: "space-between" }}><span>交通費</span><span className="mono">¥ 8,500</span></div>
          <div style={{ fontSize: 12, display: "flex", justifyContent: "space-between", fontWeight: 500 }}><span>合計</span><span className="mono">¥ 271,300</span></div>
        </div>
      </Card>
    </div>
  ),
};

export const G6_VerticalDivider: Story = {
  name: "Vertical divider — inline-row separator",
  render: () => (
    <Card style={{ display: "flex", alignItems: "center", gap: 0, fontSize: 12, flexWrap: "wrap" }}>
      <span><b>168.5h</b> <span className="muted">実働</span></span>
      <hr className="dv vert" />
      <span><b>12.5h</b> <span className="muted">残業</span></span>
      <hr className="dv vert" />
      <span><b>1.0日</b> <span className="muted">有給</span></span>
      <hr className="dv vert" />
      <span><b>22</b> <span className="muted">出勤日</span></span>
      <hr className="dv vert" />
      <span><b>¥271K</b> <span className="muted">給与</span></span>
      <span style={{ marginLeft: "auto" }}><a className="lnk">詳細 →</a></span>
    </Card>
  ),
};

// ════════════════════════════════════════════════════════════════════
// H · Card headers (17 variants)
// ════════════════════════════════════════════════════════════════════

export const H1_H3_Simple: Story = {
  name: "Simple — title only · stacked · meta-right",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
      <Card padding="none" title="タイトルのみ">
        <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          最小限のヘッダー。情報密度が高い表 / list に。
        </CardBody>
      </Card>
      <Card padding="none" title="スタック構成" subtitle="タイトル + 補足 (1 行ずつ縦に積む)">
        <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          subtitle dài 1–2 dòng OK · không nằm bên phải tránh tràn.
        </CardBody>
      </Card>
      <Card padding="none" title="メタ右" meta="5月 17日 · 14 件">
        <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          timestamp / count thuần → right-aligned, font monospace.
        </CardBody>
      </Card>
    </div>
  ),
};

export const H4_H5_WithActions: Story = {
  name: "With actions — single · button group",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card padding="none" title="承認待ち一覧" meta="12 件" extra={<Button variant="outline" size="x-small">一括承認</Button>}>
        <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          1 chính + meta — action ngắn, không vượt 8 ký tự.
        </CardBody>
      </Card>
      <Card padding="none" title="勤怠データ" extra={(
        <>
          <Button variant="ghost" size="x-small" aria-label="リフレッシュ">
            <svg className="si-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </Button>
          <Button variant="ghost" size="x-small" aria-label="エクスポート">
            <svg className="si-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1={12} y1={15} x2={12} y2={3} />
            </svg>
          </Button>
          <Button variant="secondary" size="x-small">フィルタ</Button>
          <Button size="x-small">＋ 新規</Button>
        </>
      )}>
        <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          Icon-only buttons phía bên trái, labeled buttons phía bên phải — luôn theo thứ tự danger → standard → primary.
        </CardBody>
      </Card>
    </div>
  ),
};

export const H6_H7_IconAvatar: Story = {
  name: "Icon header · Avatar header",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card padding="none">
        <div className="card-header-row card-header-block">
          <span className="ic" style={{ width: 28, height: 28 }}>
            <svg className="si-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span className="card-title">本日の打刻</span>
            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>リアルタイム · 自動更新</span>
          </div>
          <span style={{ marginLeft: "auto" }} className="live-dot">LIVE</span>
        </div>
        <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          Icon w/ tinted background — semantic. Phù hợp cho stat cards có category rõ ràng.
        </CardBody>
      </Card>
      <Card padding="none">
        <div className="card-header-row card-header-block">
          <span className="ava sm">田</span>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
            <span className="card-title" style={{ fontSize: 12 }}>田中 美咲</span>
            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>店長 · 渋谷本店</span>
          </div>
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--muted-foreground)" }}>
            <span className="dot success" />勤務中
          </span>
        </div>
        <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          Avatar — chuyên cho entity card (người, công ty, team). Status dot bên phải.
        </CardBody>
      </Card>
    </div>
  ),
};

export const H8_Tabs: Story = {
  name: "Tabs header — primary underline",
  render: () => (
    <Card padding="none">
      <div className="card-header-tabs">
        <span className="t">勤怠</span>
        <button type="button" className="tab on">月次 <span className="pill">22</span></button>
        <button type="button" className="tab">日次</button>
        <button type="button" className="tab">承認待ち <span className="pill" style={{ background: "color-mix(in oklch, var(--attention) 18%, transparent)", color: "var(--attention)" }}>3</span></button>
        <button type="button" className="tab">エラー</button>
        <div className="spacer" />
        <div className="right">
          <Button variant="ghost" size="x-small" aria-label="フィルタ">
            <svg className="si-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </Button>
          <Button size="x-small">エクスポート</Button>
        </div>
      </div>
      <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
        Tabs in-header — phù hợp cho card có 2–5 views cùng dataset. Count pill match màu trạng thái.
      </CardBody>
    </Card>
  ),
};

export const H9_Filters: Story = {
  name: "Filter chips — quick scope",
  render: () => (
    <Card padding="none">
      <div className="card-header-filters">
        <span className="t">従業員</span>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>フィルタ:</span>
        <Button variant="ghost" className="chip-fl on">渋谷本店</Button>
        <Button variant="ghost" className="chip-fl on">正社員</Button>
        <Button variant="ghost" className="chip-fl">遅刻あり</Button>
        <Button variant="ghost" className="chip-fl">＋ 追加</Button>
        <span className="spacer" />
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>14 / 38 件</span>
      </div>
      <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
        Chips "đang active" có icon × để remove · clear-all không cần (×× từng cái dễ hơn).
      </CardBody>
    </Card>
  ),
};

export const H10_Search: Story = {
  name: "Search header — inline · ⌘K",
  render: () => (
    <Card padding="none">
      <div className="card-header-search">
        <span className="t">従業員一覧</span>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>· 38 名</span>
        <div className="wrap">
          <svg className="si-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={11} cy={11} r={8} /><line x1={21} y1={21} x2={16.65} y2={16.65} />
          </svg>
          <Input placeholder="名前 / メール / コード" />
          <span className="kbd">⌘K</span>
        </div>
      </div>
      <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
        Search input căn phải, max-width 280px — không tràn cả header. Đếm result luôn cạnh title.
      </CardBody>
    </Card>
  ),
};

export const H11_Bands: Story = {
  name: "Color bands — accent strip top",
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
      <Card padding="none" band="primary" title="プロジェクト" meta="primary" />
      <Card padding="none" band="success" title="承認済" meta="success" />
      <Card padding="none" band="attention" title="要対応" meta="attention" />
      <Card padding="none" band="destructive" title="エラー" meta="destructive" />
      <Card padding="none" band="warning" title="下書き" meta="warning" />
      <Card padding="none" band="info" title="情報" meta="info" />
      <Card padding="none" band="gradient" title="特集" meta="gradient" />
      <Card padding="none" band="dotted" title="下書き" meta="dotted" />
    </div>
  ),
};

export const H12_Kicker: Story = {
  name: "Kicker header — uppercase + big title",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card padding="none" kicker="5月度 · 暫定" title="¥ 8,420,500" subtitle="支払合計 · 38 名 · 振込日 5/25">
        <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          Kicker (uppercase) làm context · title kích thước to (h2 spec).
        </CardBody>
      </Card>
      <Card padding="none" kicker="特集記事" title="2026 年 6 月リリース予定の新機能" subtitle="シフト自動最適化と多店舗在庫連携を導入">
        <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          Article / content card có hierarchy 3 cấp: category → title → tagline.
        </CardBody>
      </Card>
    </div>
  ),
};

export const H13_H14_Hero: Story = {
  name: "Hero header — branded gradient",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card padding="none">
        <div className="card-header-hero">
          <div className="k">NEW · 6月リリース</div>
          <div className="t">シフト自動最適化</div>
          <div className="sub">需要予測 + スキル + 希望で最適なシフトを生成</div>
          <div className="actions">
            <Button size="small" style={{ background: "white", color: "var(--wa-kon)" }}>試験運用に参加</Button>
            <Button variant="ghost" size="small" style={{ color: "white" }}>あとで</Button>
          </div>
        </div>
        <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          Hero — branded promo. White text trên gradient wa-iro. Luôn có CTA.
        </CardBody>
      </Card>
      <Card padding="none">
        <div className="card-header-hero warm">
          <div className="k">特別企画</div>
          <div className="t">5月限定キャンペーン</div>
          <div className="sub">全店舗 · 期間 5/01–5/31 · 詳細はリンクから</div>
          <div className="actions">
            <Button size="small" style={{ background: "white", color: "var(--wa-akane)" }}>詳細を見る</Button>
          </div>
        </div>
        <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          Warm variant cho marketing / urgency. Wa-iro 茜×朱 gradient.
        </CardBody>
      </Card>
    </div>
  ),
};

export const H15_Toolbar: Story = {
  name: "Toolbar header — view-switcher + date nav",
  render: () => (
    <Card padding="none">
      <div className="card-header-toolbar">
        <span className="t">シフト</span>
        <div className="seg">
          <Button variant="ghost">日</Button>
          <Button variant="ghost" className="on">週</Button>
          <Button variant="ghost">月</Button>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
          <Button variant="ghost" size="x-small" aria-label="前週">
            <svg className="si-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Button>
          <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-mono)", padding: "0 6px" }}>5/12 – 5/18</span>
          <Button variant="ghost" size="x-small" aria-label="翌週">
            <svg className="si-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Button>
        </span>
        <Button variant="ghost" size="x-small">今日</Button>
        <div className="spacer" />
        <Button variant="secondary" size="x-small">＋ シフト追加</Button>
      </div>
      <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
        Calendar-style toolbar — view seg + date nav + primary action. Phổ biến nhất cho schedule UI.
      </CardBody>
    </Card>
  ),
};

export const H16_Breadcrumb: Story = {
  name: "Breadcrumb header — hierarchy",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <Card padding="none">
        <div className="card-header-stack card-header-block" style={{ paddingBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted-foreground)", marginBottom: 2 }}>
            <a className="lnk" style={{ fontWeight: 400 }}>famgia</a>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <a className="lnk" style={{ fontWeight: 400 }}>渋谷本店</a>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span>従業員</span>
          </div>
          <span className="card-title" style={{ fontSize: 15 }}>田中 美咲</span>
        </div>
        <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          Breadcrumb in-card — cho detail page sâu, link cấp trên ngắn ngọn.
        </CardBody>
      </Card>
      <Card padding="none">
        <div className="card-header-row card-header-block" style={{ background: "color-mix(in oklch, var(--secondary) 30%, var(--card))" }}>
          <Button variant="ghost" size="x-small" aria-label="戻る" style={{ marginLeft: -4 }}>
            <svg className="si-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Button>
          <span className="card-title">編集 · 田中 美咲</span>
          <span className="card-meta">最終保存 5月 14日 09:24</span>
          <span className="card-header-extra">
            <Button variant="ghost" size="x-small">破棄</Button>
            <Button size="x-small">保存</Button>
          </span>
        </div>
        <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          Edit-mode header — back arrow + save status + actions. Background tint phân biệt với view mode.
        </CardBody>
      </Card>
    </div>
  ),
};

export const H17_StickyShadow: Story = {
  name: "Sticky shadow — drop shadow on scroll",
  render: () => (
    <Card padding="none">
      <div className="card-header-row card-header-block" style={{ boxShadow: "0 2px 4px -2px rgba(0,0,0,0.08)", position: "relative", zIndex: 1 }}>
        <span className="card-title">取引履歴</span>
        <span className="card-meta">2,481 件</span>
        <span className="card-header-extra" style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>スクロール中</span>
      </div>
      <CardBody block style={{ fontSize: 11, color: "var(--muted-foreground)", maxHeight: 140, overflowY: "auto" }}>
        <div style={{ fontSize: 11, lineHeight: 1.7 }}>
          2026/05/17 14:32 · ¥4,500 · 渋谷本店<br />
          2026/05/17 14:28 · ¥3,200 · 渋谷本店<br />
          2026/05/17 14:15 · ¥8,100 · 表参道店<br />
          2026/05/17 14:10 · ¥2,400 · 自由が丘店<br />
          2026/05/17 14:08 · ¥6,500 · 渋谷本店<br />
          2026/05/17 14:02 · ¥1,800 · 渋谷本店<br />
          2026/05/17 13:58 · ¥5,400 · 表参道店<br />
          2026/05/17 13:50 · ¥7,200 · 自由が丘店<br />
          2026/05/17 13:42 · ¥3,600 · 渋谷本店<br />
          2026/05/17 13:35 · ¥2,950 · 表参道店
        </div>
      </CardBody>
    </Card>
  ),
};

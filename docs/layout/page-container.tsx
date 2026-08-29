import { forwardRef, useState } from "react";
import type { AnchorHTMLAttributes, CSSProperties } from "react";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatCard,
  Badge,
  DataTable,
  Descriptions,
  ListRow,
} from "@godxjp/ui/data-display";
import type { ColumnDef } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { SearchInput } from "@godxjp/ui/data-entry";
import { ResponsiveGrid } from "@godxjp/ui/layout";
import { Toolbar, ToolbarGroup } from "@godxjp/ui/navigation";
import { Plus, Download, Filter } from "lucide-react";

/**
 * Router Link stub passed to `linkComponent` · proves breadcrumb segments can render
 * through a router primitive (react-router / next/link) instead of a plain <a>.
 * PageContainer forwards both `href` and `to`; a real Link reads `to`.
 */
/**
 * `--page-toolbar-background` · the toolbar band's GROUND, quiet (`transparent`) by default so the
 * band looks exactly as it did before the knob existed. A service normally declares these once in
 * its theme.css (`:root`, or a scoped `[data-tenant]`); they are scoped to one demo frame here so
 * the default band can sit beside the painted one. NEVER put `className="bg-card"` on the strip at
 * the call site: that is hand-laid page chrome, and it cannot be re-themed per tenant.
 *
 * The inset comes with it, and it is the band's ONLY breathing room: the band sits FLUSH against
 * the header above and the body below, because chrome is attached · a painted, ruled band adrift
 * between two 16px voids divides nothing. `--page-toolbar-pad-block` still stays `0` by default on
 * purpose · a transparent band is not a surface and has no inside to breathe, and under `fill`
 * every pixel of it is taken from the transcript. A band that is PAINTED does have an inside, so
 * the theme that paints it also sets its inset here rather than reaching for a `py-*` utility on
 * the strip.
 */
const TOOLBAR_CHROME_TOKENS = {
  "--page-toolbar-background": "hsl(var(--card))",
  "--page-toolbar-pad-block": "var(--space-2)",
  "--page-toolbar-divider": "1px solid hsl(var(--border))",
} as CSSProperties;

const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }
>(function RouterLink({ to, href, children, ...props }, ref) {
  return (
    <a ref={ref} href={to ?? href} data-router-link="" {...props}>
      {children}
    </a>
  );
});

type JournalEntry = {
  id: string;
  date: string;
  desc: string;
  amount: string;
  status: "承認済" | "保留中";
};

const journalEntries: JournalEntry[] = [
  { id: "JE-0041", date: "2026-05-31", desc: "売上計上", amount: "¥840,000", status: "承認済" },
  { id: "JE-0040", date: "2026-05-30", desc: "仕入計上", amount: "¥320,000", status: "承認済" },
  { id: "JE-0039", date: "2026-05-29", desc: "給与仕訳", amount: "¥1,200,000", status: "保留中" },
];

const journalColumns: ColumnDef<JournalEntry>[] = [
  { key: "id", header: "伝票番号", width: "w-28", render: (r) => <Text mono>{r.id}</Text> },
  { key: "date", header: "日付", width: "w-32" },
  { key: "desc", header: "摘要" },
  {
    key: "amount",
    header: "金額",
    align: "right",
    render: (r) => <Text weight="medium">{r.amount}</Text>,
  },
  {
    key: "status",
    header: "ステータス",
    align: "right",
    render: (r) => <Badge tone={r.status === "承認済" ? "success" : "warning"}>{r.status}</Badge>,
  },
];

/**
 * PageContainer · mandatory page shell.
 * Covers: title/subtitle/status/extra/footer/breadcrumb/linkComponent + variant
 * default/narrow/flush/ghost + density compact/default/comfortable + PageContainer.Inset.
 * The embedded header is the CANONICAL DXS PageHeader (gh#255) — status/meta band included.
 * Each example is standalone (no AppShell) so the variant behaviour is visible in
 * isolation. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [activeVariant, setActiveVariant] = useState<"default" | "narrow" | "flush" | "ghost">(
    "default",
  );
  const [activeDensity, setActiveDensity] = useState<"compact" | "default" | "comfortable">(
    "default",
  );
  const [memberQuery, setMemberQuery] = useState("");

  const variants = [
    { key: "default", label: "default" },
    { key: "narrow", label: "narrow" },
    { key: "flush", label: "flush" },
    { key: "ghost", label: "ghost" },
  ] as const;

  const densities = [
    { key: "compact", label: "compact" },
    { key: "default", label: "default" },
    { key: "comfortable", label: "comfortable" },
  ] as const;

  return (
    <Flex direction="col" gap="xl">
      {/* ── 1. Default variant · dashboard-style + linkComponent (router Link) ── */}
      <PageContainer
        title="売上ダッシュボード"
        subtitle="直近30日間の集計データ"
        linkComponent={RouterLink}
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "ダッシュボード" }]}
        breadcrumbLabel="売上ダッシュボードのパンくず"
        extra={
          <Flex gap="sm">
            <Button variant="outline" size="sm">
              <Download />
              エクスポート
            </Button>
            <Button size="sm">
              <Plus />
              新規登録
            </Button>
          </Flex>
        }
      >
        <ResponsiveGrid columns={{ sm: 2, md: 4 }}>
          <StatCard label="月次売上" value="¥8,200,000" delta="+12%" hint="先月比" />
          <StatCard label="請求件数" value="312" delta="+4%" />
          <StatCard label="売掛金残高" value="¥1,284,500" hint="未回収 18件" />
          <StatCard label="回収率" value="96.8%" delta="+1.2%" />
        </ResponsiveGrid>
      </PageContainer>

      {/* ── 1b. Canonical page-header contract (gh#255) · status/meta band ── */}
      {/* PageContainer's embedded header IS the DXS PageHeader: breadcrumbs + title +
          subtitle + status/meta + actions + responsive overflow on ONE renderer. The
          `status` band shares the title line at --page-header-status-gap and wraps
          UNDER the long JA title at 390px — nothing clips, no consumer CSS. */}
      <PageContainer
        title="株式会社ファムジア（本社・東京オフィス）の組織プロファイル"
        subtitle="Organization profile · Hồ sơ tổ chức · trạng thái hợp đồng và môi trường"
        status={
          <>
            <Badge tone="success">有効</Badge>
            <Badge tone="info">本番環境</Badge>
          </>
        }
        breadcrumb={[
          { label: "ホーム", to: "/" },
          { label: "組織", to: "/organizations" },
          { label: "株式会社ファムジア" },
        ]}
        breadcrumbLabel="組織プロファイルのパンくず"
        extra={
          <Button size="sm" variant="outline">
            編集
          </Button>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle level={2}>ステータスバンドの契約</CardTitle>
            <CardDescription>
              status はタイトル行に載り、コンパクト幅ではタイトルの下に折り返します。バッジを h1
              の隣に手置きしないでください。余白は --page-header-status-gap が所有します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text tone="muted">
              読み込み中は title/subtitle にスケルトンを、拒否 (403) / 不明 (404) / 障害 (5xx)
              はページごと ErrorSurface に置き換えます。
            </Text>
          </CardContent>
        </Card>
      </PageContainer>

      {/* ── 2. Narrow variant · settings form ── */}
      <PageContainer
        variant="narrow"
        title="エンティティ設定"
        subtitle="法人基本情報を編集します"
        breadcrumb={[
          { label: "ホーム", to: "/" },
          { label: "管理", to: "/admin" },
          { label: "エンティティ設定" },
        ]}
        breadcrumbLabel="エンティティ設定のパンくず"
        footer={
          <Flex gap="sm">
            <Button>保存</Button>
            <Button variant="outline">キャンセル</Button>
          </Flex>
        }
        stickyFooter
        footerReveal="onScroll"
      >
        <Card>
          <CardHeader>
            <CardTitle level={2}>法人情報</CardTitle>
            <CardDescription>登録されている法人の基本情報です。</CardDescription>
          </CardHeader>
          <CardContent>
            <Descriptions columns={1}>
              <Descriptions.Item label="法人名">株式会社サンプル</Descriptions.Item>
              <Descriptions.Item label="法人番号" mono>
                1234567890123
              </Descriptions.Item>
              <Descriptions.Item label="決算月">3月</Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>
      </PageContainer>

      {/* ── 3. Flush variant · full-bleed list ── */}
      <PageContainer
        variant="flush"
        title="仕訳一覧"
        subtitle="承認済み仕訳エントリ"
        breadcrumb={[{ label: "会計", to: "/" }, { label: "仕訳一覧" }]}
        breadcrumbLabel="仕訳一覧のパンくず"
        extra={
          <Flex gap="sm">
            <Button variant="outline" size="sm">
              <Filter />
              フィルター
            </Button>
            <Button size="sm">
              <Plus />
              仕訳作成
            </Button>
          </Flex>
        }
      >
        {/* flush strips body padding so the DataTable runs full-bleed, edge to edge. */}
        <DataTable data={journalEntries} columns={journalColumns} getRowId={(r) => r.id} />
        {/* PageContainer.Inset · escape hatch that re-applies the page inset inside a
            full-bleed body, so a footnote keeps the header's left/right alignment. */}
        <PageContainer.Inset>
          <Text as="p" size="xs" tone="muted">
            承認済みの仕訳のみ表示しています。保留中の仕訳は別途承認が必要です。
          </Text>
        </PageContainer.Inset>
      </PageContainer>

      {/* ── 4. Ghost variant + breadcrumb depth ──
          ghost は「クロムをどこまで静かにするか」を答える variant です。下余白は落とします
          （padding-bottom: 0 · これが本当の静かさ）が、罫線は打ち消しません · サービスが
          --page-header-divider を明示的に立てたなら ghost でも引かれます。帯（toolbar）の
          --page-toolbar-divider と同じ規則で、ページのクロム 3 本が一つの契約に揃います。 */}
      <PageContainer
        variant="ghost"
        title="取引先詳細"
        subtitle="株式会社グローバル商事"
        breadcrumb={[
          { label: "ホーム", to: "/" },
          { label: "取引先", to: "/partners" },
          { label: "株式会社グローバル商事" },
        ]}
        breadcrumbLabel="取引先詳細のパンくず"
        extra={<Badge tone="success">取引中</Badge>}
      >
        <Flex direction="col" gap="md">
          <Card>
            <CardHeader>
              <CardTitle level={2}>基本情報</CardTitle>
            </CardHeader>
            <CardContent>
              <Descriptions columns={3}>
                <Descriptions.Item label="代表者">山田 太郎</Descriptions.Item>
                <Descriptions.Item label="所在地">東京都千代田区</Descriptions.Item>
                <Descriptions.Item label="与信枠">¥5,000,000</Descriptions.Item>
              </Descriptions>
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>

      {/* ── 4b. density axis · 3 段すべてを静止状態で並べる ──
          density は variant と直交する間隔スケール（ui-density-*）で、既定値は "default"。
          既定も明示値として扱えるため、3 つを同じ本文で並べると段差がそのまま読めます。 */}
      <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
        <PageContainer
          density="compact"
          variant="ghost"
          title="コンパクト密度"
          subtitle='density="compact" · 行間・余白を詰めた一覧向け'
        >
          <Card>
            <CardContent>
              <Descriptions columns={1}>
                <Descriptions.Item label="表示密度">コンパクト</Descriptions.Item>
                <Descriptions.Item label="用途">大量データの一覧</Descriptions.Item>
              </Descriptions>
            </CardContent>
          </Card>
        </PageContainer>
        <PageContainer
          density="default"
          variant="ghost"
          title="デフォルト密度"
          subtitle='density="default"（既定）· 業務画面の標準リズム'
        >
          <Card>
            <CardContent>
              <Descriptions columns={1}>
                <Descriptions.Item label="表示密度">デフォルト</Descriptions.Item>
                <Descriptions.Item label="用途">一般的な業務画面</Descriptions.Item>
              </Descriptions>
            </CardContent>
          </Card>
        </PageContainer>
        <PageContainer
          density="comfortable"
          variant="ghost"
          title="コンフォータブル密度"
          subtitle='density="comfortable" · 余白を広げた閲覧向け'
        >
          <Card>
            <CardContent>
              <Descriptions columns={1}>
                <Descriptions.Item label="表示密度">コンフォータブル</Descriptions.Item>
                <Descriptions.Item label="用途">詳細・設定画面</Descriptions.Item>
              </Descriptions>
            </CardContent>
          </Card>
        </PageContainer>
      </ResponsiveGrid>

      {/* ── 5. Variant + density switcher · interactive (both axes are orthogonal) ── */}
      <PageContainer
        variant={activeVariant}
        density={activeDensity}
        title="バリアント比較"
        subtitle={`現在: variant="${activeVariant}" / density="${activeDensity}"`}
        extra={
          <Flex direction="col" gap="sm">
            <Flex gap="sm" wrap>
              {variants.map((v) => (
                <Button
                  key={v.key}
                  size="sm"
                  variant={activeVariant === v.key ? "default" : "outline"}
                  onClick={() => setActiveVariant(v.key)}
                >
                  {v.label}
                </Button>
              ))}
            </Flex>
            <Flex gap="sm" wrap>
              {densities.map((d) => (
                <Button
                  key={d.key}
                  size="sm"
                  variant={activeDensity === d.key ? "default" : "outline"}
                  onClick={() => setActiveDensity(d.key)}
                >
                  {d.label}
                </Button>
              ))}
            </Flex>
          </Flex>
        }
      >
        <Card>
          <CardContent>
            <Text as="p" tone="muted">
              ページ本文コンテンツ。variant はヘッダー余白・幅制御を、density
              は行間・間隔スケール（ui-density-*）を切り替えます。
            </Text>
          </CardContent>
        </Card>
      </PageContainer>

      {/* ── 6. fill · body height behaviour on a tall shell (gh#103) ──
          Each PageContainer sits in a fixed-height framed box that stands in for the
          viewport-tall app shell, so the two behaviours are visible side by side. */}
      <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
        {/* Default: top-packed. Short content does NOT stretch · the space below is
            just neutral page background, never a jarring void. */}
        <div className="h-80 overflow-auto rounded-md border">
          <PageContainer title="既定（top-pack）" subtitle="fill なし · 余白は中立な背景">
            <Card>
              <CardContent>
                <Text as="p" tone="muted">
                  短いコンテンツでも下に空白の「穴」は出ません。
                </Text>
              </CardContent>
            </Card>
          </PageContainer>
        </div>

        {/* fill: body grows to fill the shell; the composer footer pins to the bottom. */}
        <div className="h-80 overflow-auto rounded-md border">
          <PageContainer
            fill
            title="fill · 全高ボディ"
            subtitle="メッセージ一覧が伸び、コンポーザーは下部固定"
            footer={
              <Flex gap="sm" align="center">
                <Button size="sm" variant="outline">
                  添付
                </Button>
                <Button size="sm">送信</Button>
              </Flex>
            }
            stickyFooter
          >
            <Card>
              <CardContent>
                <Text as="p" tone="muted">
                  ボディがシェルの残り高さを占有し、フッター（コンポーザー）が下部に固定されます。
                </Text>
              </CardContent>
            </Card>
          </PageContainer>
        </div>
      </ResponsiveGrid>

      {/* ── 7. headerLayout · 390px でヘッダー extra をタイトル行に残す (gh#231) ──
          stack (既定) は 640px 未満で extra を subtitle の下の全幅行に落とす。
          responsive-inline は --page-header-extra-measure (11rem) の測度で
          title 帯の横に残す。640px 以上では両者は同一。
          幅は完全にトークン所有 — このページに px 指定もメディアクエリもありません。 */}
      <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
        <PageContainer
          variant="ghost"
          title="メンバー"
          subtitle='headerLayout="stack"（既定）· 640px 未満では検索が subtitle の下に回り込む'
          extra={
            <SearchInput
              id="page-header-layout-stack-search"
              ariaLabel="メンバーを検索（stack）"
              placeholder="メンバーを検索"
              onValueChange={setMemberQuery}
            />
          }
        >
          <Card>
            <CardContent>
              <Text as="p" tone="muted">
                入力中の絞り込み語: {memberQuery === "" ? "（なし）" : memberQuery}
              </Text>
            </CardContent>
          </Card>
        </PageContainer>

        <PageContainer
          variant="ghost"
          headerLayout="responsive-inline"
          title="メンバー"
          subtitle='headerLayout="responsive-inline" · 390px でも検索がタイトル行に残る'
          extra={
            <SearchInput
              id="page-header-layout-inline-search"
              ariaLabel="メンバーを検索（responsive-inline）"
              placeholder="メンバーを検索"
              onValueChange={setMemberQuery}
            />
          }
        >
          <Card>
            <CardContent>
              <Text as="p" tone="muted">
                extra の測度はトークン --page-header-extra-measure。タイトルと subtitle
                は残りの幅で折り返します。
              </Text>
            </CardContent>
          </Card>
        </PageContainer>
      </ResponsiveGrid>

      {/* ── 8. measure · ヘッダーとボディを 1 つの測度で束ねる (gh#245 / gh#247) ──
          measure は variant（クローム）と直交する第 3 の軸。variant="narrow" は
          .ui-page-body しか絞らないため、ヘッダーのアクションはページ端に取り残される。
          measure はヘッダーとボディの両方を同じトークン測度で絞るので、extra の終端が
          ボディ面の終端と一致する。既定 measure="default" は一切のルールに一致しない。
          幅はすべて --page-measure-* が所有 — このページに px 指定はありません。 */}
      <PageContainer
        title="通知"
        subtitle='measure="default"（既定）· 面はページ幅いっぱいに広がります'
        extra={
          <Button variant="outline" size="sm">
            すべて既読にする
          </Button>
        }
      >
        <Card>
          <CardContent flush>
            <ListRow
              unread
              title="請求書 INV-2041 が承認されました"
              description="2026-08-05 10:24 · 経理部"
              trailing={<Badge tone="success">承認</Badge>}
            />
            <ListRow
              title="月次締め処理のリマインド"
              description="2026-08-04 18:00 · システム"
              trailing={<Badge tone="warning">要対応</Badge>}
            />
          </CardContent>
        </Card>
      </PageContainer>

      {/* 通知フィードの正準構成: ghost（静かなヘッダー律動）× medium（720px の共有測度）×
          responsive-inline（390px でもアクションをタイトル行に残す）。3 つは独立した prop。 */}
      <PageContainer
        variant="ghost"
        measure="medium"
        headerLayout="responsive-inline"
        title="通知"
        subtitle='variant="ghost" × measure="medium" × headerLayout="responsive-inline" · ヘッダーのアクションが 720px のフィード面と同じ端で終わります'
        extra={
          <Button variant="outline" size="sm">
            すべて既読にする
          </Button>
        }
      >
        <Card>
          <CardContent flush>
            <ListRow
              unread
              title="請求書 INV-2041 が承認されました"
              description="2026-08-05 10:24 · 経理部"
              trailing={<Badge tone="success">承認</Badge>}
            />
            <ListRow
              unread
              title="組織「株式会社ファムジア」への招待が届いています"
              description="2026-08-05 09:12 · 管理者"
              trailing={<Badge tone="info">招待</Badge>}
            />
            <ListRow
              title="月次締め処理のリマインド"
              description="2026-08-04 18:00 · システム"
              trailing={<Badge tone="warning">要対応</Badge>}
            />
          </CardContent>
        </Card>
      </PageContainer>

      {/* measure="narrow" — variant="narrow" と同じ 624px の面だが、ヘッダーも一緒に絞られる。 */}
      <PageContainer
        measure="narrow"
        title="招待"
        subtitle='measure="narrow" · 624px。variant="narrow" と違いヘッダーも同じ測度で絞られます'
        extra={
          <Button variant="outline" size="sm">
            招待を送る
          </Button>
        }
      >
        <Card>
          <CardContent>
            <Text as="p" tone="muted">
              測度はトークン --page-measure-narrow（42rem 外寸）。ページ余白は測度の内側にあるため、
              可視面は 624px になります。390px ではどのトークンも効かず、面は流動的なままです。
            </Text>
          </CardContent>
        </Card>
      </PageContainer>

      {/* ── 9. toolbar · ヘッダーと本文の間に固定されるクロム帯 ──
          fill のとき本文（.ui-page-body）がスクロール領域になるので、帯はその SIBLING として
          スクロール領域の外に置かれる（flex: none）。呼び出し側で position: sticky を手置き
          しないための唯一の正規スロット。ページ余白と measure はヘッダー／本文と共有され、
          帯の内側余白と下罫線はトークン所有（--page-toolbar-pad-block / --page-toolbar-divider）。
          帯は上下の帯に密着します（.ui-page-container の段間はこの帯だけ打ち消される）· クロムは
          くっつくものであり、空白に浮く「3 つ目のセクション」ではないからです。呼吸する場所は
          帯の内側（--page-toolbar-pad-block）だけ。 */}
      <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
        {/* fill · 帯は固定、トランスクリプトだけがその下でスクロールする（帯の下に潜り込まない）。 */}
        <div className="h-80 overflow-auto rounded-md border">
          <PageContainer
            fill
            title="#経理チャンネル"
            subtitle="toolbar 帯はスクロールせず · 上下の帯に密着します"
            toolbar={
              <Toolbar>
                <ToolbarGroup label="表示">
                  <Button size="sm" variant="outline">
                    すべて
                  </Button>
                  <Button size="sm" variant="outline">
                    未読
                  </Button>
                </ToolbarGroup>
                <Badge tone="info">接続中</Badge>
              </Toolbar>
            }
            footer={
              <Flex gap="sm" align="center">
                <Button size="sm" variant="outline">
                  添付
                </Button>
                <Button size="sm">送信</Button>
              </Flex>
            }
            stickyFooter
          >
            <Flex direction="col" gap="md">
              {[
                "月次締めの締切は 8/31 です。",
                "経費精算の申請が 3 件あります。",
                "監査資料を共有しました。",
                "請求書 INV-2041 を承認しました。",
                "来週の定例は水曜 10:00 です。",
              ].map((message) => (
                <Card key={message}>
                  <CardContent>
                    <Text as="p" tone="muted">
                      {message}
                    </Text>
                  </CardContent>
                </Card>
              ))}
            </Flex>
          </PageContainer>
        </div>

        {/* variant="flush" · 帯も本文と同じく全幅になるため、中身は PageContainer.Inset で
            ヘッダーと同じ左右余白に戻す。DataTable は全幅のまま。 */}
        <PageContainer
          variant="flush"
          title="仕訳一覧"
          subtitle='variant="flush" では帯も全幅 · 中身は PageContainer.Inset で整列'
          toolbar={
            <PageContainer.Inset>
              <Toolbar>
                <ToolbarGroup label="状態">
                  <Button size="sm" variant="outline">
                    承認済
                  </Button>
                  <Button size="sm" variant="outline">
                    保留中
                  </Button>
                </ToolbarGroup>
              </Toolbar>
            </PageContainer.Inset>
          }
        >
          <DataTable data={journalEntries} columns={journalColumns} getRowId={(r) => r.id} />
        </PageContainer>
      </ResponsiveGrid>

      {/* ── 10. headerScale · 先頭行は「文書の見出し」か、それとも「クロム」か ──
          headerScale="document"（既定）は従来どおり h1 = --page-title-font-size（20px）＋ 720px
          未満での縮小ステップ。headerScale="chrome" は先頭行が画面そのものの家具（チャットの
          チャンネル名、メールの件名、IDE のタブ）である場合で、h1 は本文と同じ型段
          （--page-title-font-size-chrome = --heading-h3 / 14px）になり、720px 未満でも戻りません。
          要素は h1 のまま — 見出しレベルは下げないので、スクリーンリーダーの見出し階層は不変。
          同じ属性でページ上端の余白も落ちます · 既定の --space-page-active-y（24px · 720px 未満は
          16px）は「文書の見出しの上の余白」であって、チャンネル名やタブは枠そのものだからです。
          上端だけ --page-pad-block-start-chrome（既定 0）に切り替わり、下端は従来どおり
          stickyFooter の担当。設計がクロムに余白を求めるならテーマでこのトークンを一度だけ
          調整します（呼び出し側の padding や負マージンは不可）。
          variant="ghost"（罫線と下余白を落とす）と組み合わせると静かなクロムヘッダーになります。 */}
      <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
        <PageContainer
          title="請求書 INV-2041"
          subtitle='headerScale="document"（既定）· 先頭行はこのページの見出し'
          extra={
            <Button size="sm" variant="outline">
              PDF
            </Button>
          }
        >
          <Card>
            <CardContent>
              <Descriptions columns={1}>
                <Descriptions.Item label="タイトルの型段">
                  --page-title-font-size（h1 · 20px）
                </Descriptions.Item>
                <Descriptions.Item label="720px 未満">
                  --page-title-font-size-compact（h2 · 18px）
                </Descriptions.Item>
                <Descriptions.Item label="ページ上端の余白">
                  --space-page-active-y（24px）· chrome では --page-pad-block-start-chrome（0）
                </Descriptions.Item>
              </Descriptions>
            </CardContent>
          </Card>
        </PageContainer>

        {/* チャット面の正準構成: chrome（型段）× ghost（クロムの重さ）× fill × toolbar ×
            stickyFooter。チャンネル名は「今いる場所の名前」であって記事の見出しではない。
            footer の上罫線も --page-footer-divider で消せます · 入力欄が自前で枠を持つ Card の
            場合、全幅の罫線がその真上に重なって 2 本目の線になるためです。既定は「引く」のまま
            （フォームの保存／取消バーはこの線で本文と分かれる）。 */}
        <div className="h-80 overflow-auto rounded-md border">
          <PageContainer
            fill
            headerScale="chrome"
            variant="ghost"
            title="# 経理チャンネル"
            status={<Badge tone="info">接続中</Badge>}
            toolbar={
              <Toolbar>
                <ToolbarGroup label="表示">
                  <Button size="sm" variant="outline">
                    すべて
                  </Button>
                  <Button size="sm" variant="outline">
                    未読
                  </Button>
                </ToolbarGroup>
              </Toolbar>
            }
            footer={
              <Flex gap="sm" align="center">
                <Button size="sm" variant="outline">
                  添付
                </Button>
                <Button size="sm">送信</Button>
              </Flex>
            }
            stickyFooter
          >
            <Flex direction="col" gap="md">
              {[
                "チャンネル名は本文と同じ 14px · 見出しではなく面のラベルとして読ませます。",
                "h1 のままなので、見出し階層は document と同じ。",
                "帯の高さが下がったぶんは、そのまま会話の高さになります。",
                "縮めたいだけの理由で通常の文書ページに使わないこと。",
              ].map((message) => (
                <Card key={message}>
                  <CardContent>
                    <Text as="p" tone="muted">
                      {message}
                    </Text>
                  </CardContent>
                </Card>
              ))}
            </Flex>
          </PageContainer>
        </div>
      </ResponsiveGrid>

      {/* ── 11. --page-toolbar-background · 帯の地の色もトークン ──
          既定は transparent（＝トークン導入前と完全に同じ見え方）。設計が「帯だけカード面に
          乗せる」と言うときは、呼び出し側に className="bg-card" を書くのではなく、テーマで
          --page-toolbar-background を一度だけ宣言します。手置きのページクロムは禁止であり、
          テナントごとの再テーマも効かなくなるためです。帯を塗るなら内側の余白も一緒に
          （--page-toolbar-pad-block）· 既定の 0 は「透明な帯には内側がない」ことに由来します。 */}
      <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
        <div className="h-80 overflow-auto rounded-md border">
          <PageContainer
            fill
            headerScale="chrome"
            variant="ghost"
            title="# 経理チャンネル"
            subtitle="既定 · --page-toolbar-background は transparent"
            toolbar={
              <Toolbar>
                <ToolbarGroup label="表示">
                  <Button size="sm" variant="outline">
                    未読
                  </Button>
                </ToolbarGroup>
              </Toolbar>
            }
          >
            <Flex direction="col" gap="md">
              {[
                "帯はページの地の色のまま · header と body の間に浮いて見えます。",
                "トークンを足すまで DOM もスタイルも従来どおりです。",
              ].map((message) => (
                <Card key={message}>
                  <CardContent>
                    <Text as="p" tone="muted">
                      {message}
                    </Text>
                  </CardContent>
                </Card>
              ))}
            </Flex>
          </PageContainer>
        </div>

        <div className="h-80 overflow-auto rounded-md border" style={TOOLBAR_CHROME_TOKENS}>
          <PageContainer
            fill
            headerScale="chrome"
            variant="ghost"
            title="# 経理チャンネル"
            subtitle="テーマで --page-toolbar-background: hsl(var(--card))"
            toolbar={
              <Toolbar>
                <ToolbarGroup label="表示">
                  <Button size="sm" variant="outline">
                    未読
                  </Button>
                </ToolbarGroup>
                <Badge tone="info">接続中</Badge>
              </Toolbar>
            }
          >
            <Flex direction="col" gap="md">
              {[
                "帯がカード面に乗り、本文から分離して読めます。",
                "塗った帯には内側の余白が要るので pad-block も同じテーマで指定します。",
                "呼び出し側の bg-card / py-1.5 は不要 · どちらもトークンの仕事です。",
              ].map((message) => (
                <Card key={message}>
                  <CardContent>
                    <Text as="p" tone="muted">
                      {message}
                    </Text>
                  </CardContent>
                </Card>
              ))}
            </Flex>
          </PageContainer>
        </div>
      </ResponsiveGrid>
    </Flex>
  );
}

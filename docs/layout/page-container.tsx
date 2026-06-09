import { forwardRef, useState } from "react";
import type { AnchorHTMLAttributes } from "react";
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
} from "@godxjp/ui/data-display";
import type { ColumnDef } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { ResponsiveGrid } from "@godxjp/ui/layout";
import { Plus, Download, Filter } from "lucide-react";

/**
 * Router Link stub passed to `linkComponent` — proves breadcrumb segments can render
 * through a router primitive (react-router / next/link) instead of a plain <a>.
 * PageContainer forwards both `href` and `to`; a real Link reads `to`.
 */
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
 * PageContainer — mandatory page shell.
 * Covers: title/subtitle/extra/footer/breadcrumb/linkComponent + variant
 * default/narrow/flush/ghost + density compact/default/comfortable + PageContainer.Inset.
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
      {/* ── 1. Default variant — dashboard-style + linkComponent (router Link) ── */}
      <PageContainer
        title="売上ダッシュボード"
        subtitle="直近30日間の集計データ"
        linkComponent={RouterLink}
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "ダッシュボード" }]}
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

      {/* ── 2. Narrow variant — settings form ── */}
      <PageContainer
        variant="narrow"
        title="エンティティ設定"
        subtitle="法人基本情報を編集します"
        breadcrumb={[
          { label: "ホーム", to: "/" },
          { label: "管理", to: "/admin" },
          { label: "エンティティ設定" },
        ]}
        footer={
          <Flex gap="sm">
            <Button>保存</Button>
            <Button variant="outline">キャンセル</Button>
          </Flex>
        }
        stickyFooter
      >
        <Card>
          <CardHeader>
            <CardTitle>法人情報</CardTitle>
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

      {/* ── 3. Flush variant — full-bleed list ── */}
      <PageContainer
        variant="flush"
        title="仕訳一覧"
        subtitle="承認済み仕訳エントリ"
        breadcrumb={[{ label: "会計", to: "/" }, { label: "仕訳一覧" }]}
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
        {/* PageContainer.Inset — escape hatch that re-applies the page inset inside a
            full-bleed body, so a footnote keeps the header's left/right alignment. */}
        <PageContainer.Inset>
          <Text as="p" size="xs" tone="muted">
            承認済みの仕訳のみ表示しています。保留中の仕訳は別途承認が必要です。
          </Text>
        </PageContainer.Inset>
      </PageContainer>

      {/* ── 4. Ghost variant + breadcrumb depth ── */}
      <PageContainer
        variant="ghost"
        title="取引先詳細"
        subtitle="株式会社グローバル商事"
        breadcrumb={[
          { label: "ホーム", to: "/" },
          { label: "取引先", to: "/partners" },
          { label: "株式会社グローバル商事" },
        ]}
        extra={<Badge tone="success">取引中</Badge>}
      >
        <Flex direction="col" gap="md">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
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

      {/* ── 4b. density axis (compact vs comfortable) — static, side by side ── */}
      <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
        <PageContainer
          density="compact"
          variant="ghost"
          title="コンパクト密度"
          subtitle='density="compact" — 行間・余白を詰めた一覧向け'
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
          density="comfortable"
          variant="ghost"
          title="コンフォータブル密度"
          subtitle='density="comfortable" — 余白を広げた閲覧向け'
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

      {/* ── 5. Variant + density switcher — interactive (both axes are orthogonal) ── */}
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

      {/* ── 6. fill — body height behaviour on a tall shell (gh#103) ──
          Each PageContainer sits in a fixed-height framed box that stands in for the
          viewport-tall app shell, so the two behaviours are visible side by side. */}
      <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
        {/* Default: top-packed. Short content does NOT stretch — the space below is
            just neutral page background, never a jarring void. */}
        <div className="h-80 overflow-auto rounded-md border">
          <PageContainer title="既定（top-pack）" subtitle="fill なし — 余白は中立な背景">
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
            title="fill — 全高ボディ"
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
    </Flex>
  );
}

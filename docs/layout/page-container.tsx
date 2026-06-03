import { useState } from "react";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatCard,
  Badge,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { ResponsiveGrid } from "@godxjp/ui/layout";
import { Plus, Download, Filter } from "lucide-react";

/**
 * PageContainer — mandatory page shell.
 * Covers: title/subtitle/extra/footer/breadcrumb + variant default/narrow/flush/ghost.
 * Each example is standalone (no AppShell) so the variant behaviour is visible in
 * isolation. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [activeVariant, setActiveVariant] = useState<"default" | "narrow" | "flush" | "ghost">(
    "default",
  );

  const variants = [
    { key: "default", label: "default" },
    { key: "narrow", label: "narrow" },
    { key: "flush", label: "flush" },
    { key: "ghost", label: "ghost" },
  ] as const;

  return (
    <Flex direction="col" gap="xl">
      {/* ── 1. Default variant — dashboard-style ── */}
      <PageContainer
        title="売上ダッシュボード"
        subtitle="直近30日間の集計データ"
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
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="xs">
                <div className="text-foreground text-sm font-medium">法人名</div>
                <div className="text-muted-foreground text-sm">株式会社サンプル</div>
              </Flex>
              <Flex direction="col" gap="xs">
                <div className="text-foreground text-sm font-medium">法人番号</div>
                <div className="text-muted-foreground text-sm">1234567890123</div>
              </Flex>
              <Flex direction="col" gap="xs">
                <div className="text-foreground text-sm font-medium">決算月</div>
                <div className="text-muted-foreground text-sm">3月</div>
              </Flex>
            </Flex>
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
        {/* In production this would be a DataTable (flush = no padding, full-bleed) */}
        <Card>
          <CardContent className="p-0">
            <Flex direction="col">
              {[
                {
                  id: "JE-0041",
                  date: "2026-05-31",
                  desc: "売上計上",
                  amount: "¥840,000",
                  status: "承認済",
                },
                {
                  id: "JE-0040",
                  date: "2026-05-30",
                  desc: "仕入計上",
                  amount: "¥320,000",
                  status: "承認済",
                },
                {
                  id: "JE-0039",
                  date: "2026-05-29",
                  desc: "給与仕訳",
                  amount: "¥1,200,000",
                  status: "保留中",
                },
              ].map((row, i) => (
                <Flex
                  key={row.id}
                  align="center"
                  justify="between"
                  className={`px-4 py-3 text-sm ${i < 2 ? "border-border border-b" : ""}`}
                >
                  <Flex gap="md" align="center">
                    <span className="text-muted-foreground font-mono text-xs">{row.id}</span>
                    <span className="text-muted-foreground">{row.date}</span>
                    <span>{row.desc}</span>
                  </Flex>
                  <Flex gap="md" align="center">
                    <span className="font-medium">{row.amount}</span>
                    <Badge variant={row.status === "承認済" ? "success" : "warning"}>
                      {row.status}
                    </Badge>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>
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
        extra={<Badge variant="success">取引中</Badge>}
      >
        <Flex direction="col" gap="md">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent>
              <Flex gap="lg">
                <Flex direction="col" gap="xs">
                  <span className="text-muted-foreground text-xs">代表者</span>
                  <span className="text-sm">山田 太郎</span>
                </Flex>
                <Flex direction="col" gap="xs">
                  <span className="text-muted-foreground text-xs">所在地</span>
                  <span className="text-sm">東京都千代田区</span>
                </Flex>
                <Flex direction="col" gap="xs">
                  <span className="text-muted-foreground text-xs">与信枠</span>
                  <span className="text-sm">¥5,000,000</span>
                </Flex>
              </Flex>
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>

      {/* ── 5. Variant switcher — interactive ── */}
      <PageContainer
        variant={activeVariant}
        title="バリアント比較"
        subtitle={`現在: variant="${activeVariant}"`}
        extra={
          <Flex gap="sm">
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
        }
      >
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              ページ本文コンテンツ。バリアントを切り替えるとヘッダー余白・幅制御が変化します。
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    </Flex>
  );
}

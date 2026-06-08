import { useState } from "react";
import { Flex, PageContainer, SplitPane } from "@godxjp/ui/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  StatCard,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { FileText, Building2, Calendar, CreditCard, ArrowRight } from "lucide-react";

/**
 * SplitPane — main + fixed aside panel.
 * Shows: main list + detail panel, asideWidth sm/md, nested inside PageContainer.
 * Composed only from real @godxjp/ui components.
 *
 * NOTE: <Flex> defaults to direction="col"; every horizontal row sets direction="row"
 * explicitly. Spacing comes from the Flex `gap` prop or valid 4-point utilities
 * (gap-3, pt-2, ml-3) — never named classes like `gap-md` (no such utility exists).
 */

type Invoice = {
  id: string;
  partner: string;
  date: string;
  amount: string;
  status: "承認済" | "保留中" | "未承認";
};

const INVOICES: Invoice[] = [
  {
    id: "INV-0241",
    partner: "株式会社アクメ",
    date: "2026-05-31",
    amount: "¥840,000",
    status: "承認済",
  },
  {
    id: "INV-0240",
    partner: "グローバル商事",
    date: "2026-05-29",
    amount: "¥320,000",
    status: "保留中",
  },
  {
    id: "INV-0239",
    partner: "イニテック有限会社",
    date: "2026-05-28",
    amount: "¥1,200,000",
    status: "承認済",
  },
  {
    id: "INV-0238",
    partner: "フューチャー工業",
    date: "2026-05-26",
    amount: "¥460,000",
    status: "未承認",
  },
  {
    id: "INV-0237",
    partner: "東京メディア",
    date: "2026-05-24",
    amount: "¥980,000",
    status: "承認済",
  },
];

const STATUS_TONE = {
  承認済: "success",
  保留中: "warning",
  未承認: "destructive",
} as const;

const yen = (n: number) => `¥${Math.round(n).toLocaleString()}`;
const toNumber = (amount: string) => Number(amount.replace(/[^0-9]/g, ""));

export default function Demo() {
  const [selectedId, setSelectedId] = useState<string>("INV-0241");
  const [asideWidth, setAsideWidth] = useState<"sm" | "md">("md");

  const selected = INVOICES.find((inv) => inv.id === selectedId) ?? INVOICES[0];
  const base = toNumber(selected.amount);

  return (
    <PageContainer
      title="SplitPane デモ"
      subtitle="請求書一覧 + 詳細パネル"
      breadcrumb={[{ label: "ホーム", to: "/" }, { label: "請求書一覧" }]}
      extra={
        <Flex direction="row" gap="sm">
          <Button
            size="sm"
            variant={asideWidth === "sm" ? "default" : "outline"}
            onClick={() => setAsideWidth("sm")}
          >
            asideWidth=&quot;sm&quot;
          </Button>
          <Button
            size="sm"
            variant={asideWidth === "md" ? "default" : "outline"}
            onClick={() => setAsideWidth("md")}
          >
            asideWidth=&quot;md&quot;
          </Button>
        </Flex>
      }
    >
      <Flex direction="col" gap="lg">
        {/* ── Example 1: Invoice list + detail panel ── */}
        <SplitPane
          asideWidth={asideWidth}
          aside={
            <Flex direction="col" gap="md">
              <Card>
                <CardHeader>
                  <Flex direction="row" justify="between" align="center" gap="sm">
                    <CardTitle className="text-base">{selected.id}</CardTitle>
                    <Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>
                  </Flex>
                  <CardDescription>請求書詳細</CardDescription>
                </CardHeader>
                <CardContent>
                  <Flex direction="col" gap="md">
                    <Flex direction="row" align="center" gap="sm">
                      <Building2 className="text-muted-foreground size-4 shrink-0" />
                      <Flex direction="col" gap="xs">
                        <Text size="xs" tone="muted">
                          取引先
                        </Text>
                        <Text weight="medium">{selected.partner}</Text>
                      </Flex>
                    </Flex>
                    <Flex direction="row" align="center" gap="sm">
                      <Calendar className="text-muted-foreground size-4 shrink-0" />
                      <Flex direction="col" gap="xs">
                        <Text size="xs" tone="muted">
                          請求日
                        </Text>
                        <Text tabular>{selected.date}</Text>
                      </Flex>
                    </Flex>
                    <Flex direction="row" align="center" gap="sm">
                      <CreditCard className="text-muted-foreground size-4 shrink-0" />
                      <Flex direction="col" gap="xs">
                        <Text size="xs" tone="muted">
                          金額（税抜）
                        </Text>
                        <Text size="lg" weight="bold" tabular>
                          {selected.amount}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">明細概要</CardTitle>
                </CardHeader>
                <CardContent>
                  <Flex direction="col" gap="sm">
                    <Flex direction="row" justify="between">
                      <Text tone="muted">小計</Text>
                      <Text tabular>{selected.amount}</Text>
                    </Flex>
                    <Flex direction="row" justify="between">
                      <Text tone="muted">消費税 (10%)</Text>
                      <Text tabular>{yen(base * 0.1)}</Text>
                    </Flex>
                    <div className="border-border mt-1 border-t pt-2">
                      <Flex direction="row" justify="between">
                        <Text weight="bold">合計</Text>
                        <Text weight="bold" tabular>
                          {yen(base * 1.1)}
                        </Text>
                      </Flex>
                    </div>
                  </Flex>
                </CardContent>
              </Card>

              <Flex direction="col" gap="sm">
                <Button className="w-full" disabled={selected.status === "承認済"}>
                  <ArrowRight />
                  承認
                </Button>
                <Button variant="outline" className="w-full">
                  PDF ダウンロード
                </Button>
              </Flex>
            </Flex>
          }
        >
          {/* Main: invoice list */}
          <Flex direction="col" gap="xs">
            {INVOICES.map((inv) => {
              const active = selectedId === inv.id;
              return (
                <Card
                  key={inv.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  aria-label={`請求書 ${inv.id} ${inv.partner}`}
                  className={`focus-visible:ring-ring hover:border-primary/40 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                    active ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedId(inv.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(inv.id);
                    }
                  }}
                >
                  <CardContent>
                    <Flex direction="row" align="center" gap="md">
                      <FileText className="text-muted-foreground size-5 shrink-0" />
                      <Flex direction="col" gap="xs" className="min-w-0 flex-1">
                        <Flex direction="row" justify="between" align="center" gap="sm">
                          <Text size="xs" tone="muted" mono>
                            {inv.id}
                          </Text>
                          <Badge tone={STATUS_TONE[inv.status]}>{inv.status}</Badge>
                        </Flex>
                        <Flex direction="row" justify="between" align="baseline" gap="sm">
                          <Text weight="medium" truncate>
                            {inv.partner}
                          </Text>
                          <Text weight="bold" tabular className="shrink-0">
                            {inv.amount}
                          </Text>
                        </Flex>
                        <Text size="xs" tone="muted" tabular>
                          {inv.date}
                        </Text>
                      </Flex>
                    </Flex>
                  </CardContent>
                </Card>
              );
            })}
          </Flex>
        </SplitPane>

        {/* ── Example 2: Summary stats + aside narration ── */}
        <SplitPane
          asideWidth="sm"
          aside={
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">利用ガイド</CardTitle>
              </CardHeader>
              <CardContent>
                <Flex direction="col" gap="sm">
                  <Text as="p" tone="muted">
                    <Text as="strong" weight="bold">
                      asideWidth=&quot;sm&quot;
                    </Text>{" "}
                    (20rem) — フィルター、統計サマリー、クイック操作などのコンパクトパネル向け。
                  </Text>
                  <Text as="p" tone="muted">
                    <Text as="strong" weight="bold">
                      asideWidth=&quot;md&quot;
                    </Text>{" "}
                    (22rem) — 詳細フォーム、タイムライン、長いメタデータリスト向け。
                  </Text>
                  <Text as="p" tone="muted">
                    1080px 未満のビューポートでは縦積みにフォールバックします。
                    常にサイドバイサイドが必要な場合は CSS Grid を使用してください。
                  </Text>
                </Flex>
              </CardContent>
            </Card>
          }
        >
          <Flex direction="col" gap="md">
            <Text weight="medium">月次サマリー</Text>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatCard label="請求総額" value="¥3,800,000" delta="+8%" />
              <StatCard label="承認済件数" value="3" hint="全5件中" />
              <StatCard label="保留中" value="1" delta="-2" />
              <StatCard label="未承認" value="1" delta="+1" inverse />
            </div>
          </Flex>
        </SplitPane>
      </Flex>
    </PageContainer>
  );
}

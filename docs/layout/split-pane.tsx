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
import { Button } from "@godxjp/ui/general";
import { FileText, Building2, Calendar, CreditCard, ArrowRight } from "lucide-react";

/**
 * SplitPane — main + fixed aside panel.
 * Shows: main list + detail panel, asideWidth sm/md, nested inside PageContainer.
 * Composed only from real @godxjp/ui components.
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

const STATUS_VARIANT = {
  承認済: "success",
  保留中: "warning",
  未承認: "destructive",
} as const;

export default function Demo() {
  const [selectedId, setSelectedId] = useState<string>("INV-0241");
  const [asideWidth, setAsideWidth] = useState<"sm" | "md">("md");

  const selected = INVOICES.find((inv) => inv.id === selectedId) ?? INVOICES[0];

  return (
    <PageContainer
      title="SplitPane デモ"
      subtitle="請求書一覧 + 詳細パネル"
      breadcrumb={[{ label: "ホーム", to: "/" }, { label: "請求書一覧" }]}
      extra={
        <Flex gap="sm">
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
                  <Flex justify="between" align="center">
                    <CardTitle className="text-base">{selected.id}</CardTitle>
                    <Badge variant={STATUS_VARIANT[selected.status]}>{selected.status}</Badge>
                  </Flex>
                  <CardDescription>請求書詳細</CardDescription>
                </CardHeader>
                <CardContent>
                  <Flex direction="col" gap="md">
                    <Flex align="center" gap="sm" className="text-sm">
                      <Building2 className="text-muted-foreground size-4 shrink-0" />
                      <Flex direction="col" gap="xs">
                        <span className="text-muted-foreground text-xs">取引先</span>
                        <span className="font-medium">{selected.partner}</span>
                      </Flex>
                    </Flex>
                    <Flex align="center" gap="sm" className="text-sm">
                      <Calendar className="text-muted-foreground size-4 shrink-0" />
                      <Flex direction="col" gap="xs">
                        <span className="text-muted-foreground text-xs">請求日</span>
                        <span>{selected.date}</span>
                      </Flex>
                    </Flex>
                    <Flex align="center" gap="sm" className="text-sm">
                      <CreditCard className="text-muted-foreground size-4 shrink-0" />
                      <Flex direction="col" gap="xs">
                        <span className="text-muted-foreground text-xs">金額（税抜）</span>
                        <span className="text-lg font-semibold">{selected.amount}</span>
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
                  <Flex direction="col" gap="sm" className="text-sm">
                    <Flex justify="between">
                      <span className="text-muted-foreground">小計</span>
                      <span>{selected.amount}</span>
                    </Flex>
                    <Flex justify="between">
                      <span className="text-muted-foreground">消費税 (10%)</span>
                      <span>
                        ¥
                        {Math.round(
                          parseInt(selected.amount.replace(/[^0-9]/g, "")) * 0.1,
                        ).toLocaleString()}
                      </span>
                    </Flex>
                    <div className="border-border pt-sm border-t" />
                    <Flex justify="between" className="font-semibold">
                      <span>合計</span>
                      <span>
                        ¥
                        {Math.round(
                          parseInt(selected.amount.replace(/[^0-9]/g, "")) * 1.1,
                        ).toLocaleString()}
                      </span>
                    </Flex>
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
          <Flex direction="col" gap="md">
            <Flex direction="col" gap="xs">
              {INVOICES.map((inv) => (
                <Card
                  key={inv.id}
                  className={`cursor-pointer transition-colors ${
                    selectedId === inv.id ? "ring-primary ring-2" : ""
                  }`}
                  onClick={() => setSelectedId(inv.id)}
                >
                  <CardContent>
                    <Flex align="center" gap="md">
                      <FileText className="text-muted-foreground size-5 shrink-0" />
                      <Flex direction="col" gap="xs" className="min-w-0 flex-1">
                        <Flex justify="between" align="center">
                          <span className="text-muted-foreground font-mono text-xs">{inv.id}</span>
                          <Badge variant={STATUS_VARIANT[inv.status]}>{inv.status}</Badge>
                        </Flex>
                        <Flex justify="between" align="center">
                          <span className="truncate text-sm font-medium">{inv.partner}</span>
                          <span className="ml-md shrink-0 text-sm font-semibold">{inv.amount}</span>
                        </Flex>
                        <span className="text-muted-foreground text-xs">{inv.date}</span>
                      </Flex>
                    </Flex>
                  </CardContent>
                </Card>
              ))}
            </Flex>
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
                <Flex direction="col" gap="sm" className="text-muted-foreground text-sm">
                  <p>
                    <strong className="text-foreground">asideWidth=&quot;sm&quot;</strong> (20rem) —
                    フィルター、統計サマリー、クイック操作などのコンパクトパネル向け。
                  </p>
                  <p>
                    <strong className="text-foreground">asideWidth=&quot;md&quot;</strong> (22rem) —
                    詳細フォーム、タイムライン、長いメタデータリスト向け。
                  </p>
                  <p>
                    1080px 未満のビューポートでは縦積みにフォールバックします。
                    常にサイドバイサイドが必要な場合は CSS Grid を使用してください。
                  </p>
                </Flex>
              </CardContent>
            </Card>
          }
        >
          <Flex direction="col" gap="md">
            <div className="text-foreground text-sm font-semibold">月次サマリー</div>
            <div className="gap-md grid grid-cols-2">
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

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Pagination } from "@godxjp/ui/navigation";

/**
 * Pagination — fully controlled offset/page bar. Sits BELOW a table card.
 * Pass total as raw item count (not page count). onValueChange receives (page, pageSize).
 * Composed only from real @godxjp/ui components.
 */
const yen = new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" });

const invoices = Array.from({ length: 47 }, (_, i) => ({
  id: `INV-${String(i + 1).padStart(4, "0")}`,
  partner: ["株式会社山田商事", "有限会社田中工業", "ABC株式会社", "合同会社鈴木", "株式会社佐藤"][
    i % 5
  ],
  amount: (i + 1) * 38500 + 12000,
  status: ["承認済", "未承認", "取消済"][i % 3],
}));

export default function Demo() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [simplePage, setSimplePage] = useState(1);

  const start = (page - 1) * pageSize;
  const pageData = invoices.slice(start, start + pageSize);

  function handleChange(p: number, ps: number) {
    setPage(p);
    setPageSize(ps);
  }

  return (
    <PageContainer
      title="Pagination"
      subtitle="Fully controlled offset/page bar · total is raw item count, not page count"
    >
      <Flex direction="col" gap="lg">
        {/* Full pagination below a Table */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>請求書一覧 (47 件)</CardTitle>
            <CardDescription>
              Pagination sits BELOW the card. value + pageSize are controlled state. showTotal shows
              the built-in i18n count label. showSizeChanger lets users pick rows per page.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>番号</TableHead>
                  <TableHead>取引先</TableHead>
                  <TableHead className="text-end">金額 (円)</TableHead>
                  <TableHead>ステータス</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-sm">{inv.id}</TableCell>
                    <TableCell>{inv.partner}</TableCell>
                    <TableCell className="text-end">{yen.format(inv.amount)}</TableCell>
                    <TableCell>{inv.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination component itself — outside the card, below it */}
        <Pagination
          ariaLabel="請求書一覧のページネーション"
          value={page}
          total={invoices.length}
          pageSize={pageSize}
          showTotal
          showSizeChanger
          pageSizeOptions={[5, 10, 20, 50]}
          onValueChange={handleChange}
        />

        {/* Regression: total=0, exactly one page, multiple pages, + the single-page opt-in (gh#153). */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>境界状態 · 0 件 / 1 ページ / 複数ページ</CardTitle>
            <CardDescription>
              Pagination は複数ページ間のナビゲーション。0 件と 1 ページ（total ≤ pageSize）は
              既定で「非表示」になる（下の 2 例は何もレンダリングしない）。合計だけ見せたい 1
              ページでは hideOnSinglePage={"{false}"} で明示的にオプトインする。複数ページでは 1
              行のまま折り返さずに全ページャを表示する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {/* total=0 → hidden (nothing renders). */}
              <Pagination total={0} pageSize={10} showTotal />
              {/* exactly one page → hidden by default (nothing renders). */}
              <Pagination total={8} pageSize={10} showTotal />
              {/* single-page opt-in → the bar renders so the total stays visible. */}
              <Pagination
                total={8}
                pageSize={10}
                hideOnSinglePage={false}
                showTotal={(total, [from, to]) => `${from}〜${to} / ${total} 件`}
                ariaLabel="1 ページのみ・opt-in 表示のページネーション"
              />
              {/* multiple pages → full pager, one horizontal row, no wrap. */}
              <Pagination
                value={2}
                total={137}
                pageSize={10}
                showTotal
                showSizeChanger
                onValueChange={() => {}}
                ariaLabel="複数ページの境界状態のページネーション"
              />
            </Flex>
          </CardContent>
        </Card>

        {/* Long localized total label — the row stays ONE line and never wraps on desktop (gh#153). */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>長いローカライズ済みラベル · 折り返さない</CardTitle>
            <CardDescription>
              長い合計ラベル（JA/VI）でも Pagination は 1 行を維持する。ラベルは省略記号で切り詰め、
              ページ送りを 2 行目に押し出さない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Pagination
                value={3}
                total={1284}
                pageSize={20}
                showSizeChanger
                showTotal={(total, [from, to]) =>
                  `${from.toLocaleString("ja-JP")}〜${to.toLocaleString("ja-JP")} 件目 / 全 ${total.toLocaleString("ja-JP")} 件の請求書を表示中`
                }
                onValueChange={() => {}}
                ariaLabel="日本語ラベルのページネーション"
              />
              <Pagination
                value={3}
                total={1284}
                pageSize={20}
                showSizeChanger
                showTotal={(total, [from, to]) =>
                  `Đang hiển thị ${from}–${to} trong tổng số ${total.toLocaleString("vi-VN")} hoá đơn`
                }
                onValueChange={() => {}}
                ariaLabel="Phân trang nhãn tiếng Việt"
              />
            </Flex>
          </CardContent>
        </Card>

        {/* showTotal custom label */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>showTotal · カスタムラベル関数</CardTitle>
            <CardDescription>
              showTotal に関数を渡すと範囲ラベルをカスタマイズできる。 例: &quot;1〜10 / 47
              件の請求書&quot;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Pagination
              ariaLabel="カスタムラベル例のページネーション"
              value={page}
              total={invoices.length}
              pageSize={pageSize}
              showTotal={(total, [from, to]) => `${from}〜${to} / ${total} 件の請求書`}
              onValueChange={handleChange}
            />
          </CardContent>
        </Card>

        {/* Simple mode for compact contexts */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>Simple モード · コンパクト表示</CardTitle>
            <CardDescription>
              simple=true でモーダルフッターやサイドバーに収まるコンパクトな Prev / n/total / Next
              を表示する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Pagination
              ariaLabel="コンパクト例のページネーション"
              simple
              value={simplePage}
              total={200}
              pageSize={20}
              onValueChange={(p) => setSimplePage(p)}
            />
          </CardContent>
        </Card>

        {/* Disabled state */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>Disabled 状態</CardTitle>
            <CardDescription>
              disabled=true でデータ読み込み中などページ送りを一時的に無効にする。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Pagination
              ariaLabel="無効状態例のページネーション"
              value={1}
              total={100}
              pageSize={10}
              showTotal
              disabled
              onValueChange={() => {}}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}

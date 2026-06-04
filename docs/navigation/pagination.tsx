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
const invoices = Array.from({ length: 47 }, (_, i) => ({
  id: `INV-${String(i + 1).padStart(4, "0")}`,
  partner: ["株式会社山田商事", "有限会社田中工業", "ABC株式会社", "合同会社鈴木", "株式会社佐藤"][
    i % 5
  ],
  amount: ((i + 1) * 38500 + 12000).toLocaleString("ja-JP"),
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
      subtitle="Fully controlled offset/page bar — total is raw item count, not page count"
    >
      <Flex direction="col" gap="lg">
        {/* Full pagination below a Table */}
        <Card>
          <CardHeader>
            <CardTitle>請求書一覧 (47 件)</CardTitle>
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
                  <TableHead className="text-right">金額 (円)</TableHead>
                  <TableHead>ステータス</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-sm">{inv.id}</TableCell>
                    <TableCell>{inv.partner}</TableCell>
                    <TableCell className="text-right">¥{inv.amount}</TableCell>
                    <TableCell>{inv.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination component itself — outside the card, below it */}
        <Pagination
          value={page}
          total={invoices.length}
          pageSize={pageSize}
          showTotal
          showSizeChanger
          pageSizeOptions={[5, 10, 20, 50]}
          onValueChange={handleChange}
        />

        {/* showTotal custom label */}
        <Card>
          <CardHeader>
            <CardTitle>showTotal — カスタムラベル関数</CardTitle>
            <CardDescription>
              showTotal に関数を渡すと範囲ラベルをカスタマイズできる。 例: &quot;1〜10 / 47
              件の請求書&quot;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Pagination
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
            <CardTitle>Simple モード — コンパクト表示</CardTitle>
            <CardDescription>
              simple=true でモーダルフッターやサイドバーに収まるコンパクトな Prev / n/total / Next
              を表示する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Pagination
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
            <CardTitle>Disabled 状態</CardTitle>
            <CardDescription>
              disabled=true でデータ読み込み中などページ送りを一時的に無効にする。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Pagination
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

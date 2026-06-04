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

/**
 * Table — the primitive table shell (Table/TableHeader/TableBody/TableRow/
 * TableHead/TableCell). Prefer DataTable for admin lists; reach for these only
 * for a custom one-off table. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Table"
      subtitle="Primitive table shell — prefer DataTable for admin lists"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>仕訳明細</CardTitle>
            <CardDescription>
              A fixed double-entry breakdown. The second row is rendered with the
              built-in selected state (TableRow data-state=&quot;selected&quot;), and a
              caption + total footer row exercise caption-bottom and a summary row.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <Table>
              <caption className="px-4 py-2 text-start text-xs text-muted-foreground">
                2026年5月 売上計上（税込）
              </caption>
              <TableHeader>
                <TableRow>
                  <TableHead>勘定科目</TableHead>
                  <TableHead className="text-right">借方</TableHead>
                  <TableHead className="text-right">貸方</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>売掛金</TableCell>
                  <TableCell className="text-right tabular-nums">¥482,000</TableCell>
                  <TableCell className="text-right">—</TableCell>
                </TableRow>
                {/* Built-in selected-row state — data-[state=selected]:bg-primary/[0.06]. */}
                <TableRow data-state="selected">
                  <TableCell>売上高</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right tabular-nums">¥438,182</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>仮受消費税</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right tabular-nums">¥43,818</TableCell>
                </TableRow>
                <TableRow className="font-medium">
                  <TableCell>合計</TableCell>
                  <TableCell className="text-right tabular-nums">¥482,000</TableCell>
                  <TableCell className="text-right tabular-nums">¥482,000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>月次推移</CardTitle>
            <CardDescription>
              A wide table — more columns than the viewport can hold, so the
              built-in scroll wrapper (.relative w-full overflow-auto) scrolls
              horizontally.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>勘定科目</TableHead>
                  <TableHead className="text-right">1月</TableHead>
                  <TableHead className="text-right">2月</TableHead>
                  <TableHead className="text-right">3月</TableHead>
                  <TableHead className="text-right">4月</TableHead>
                  <TableHead className="text-right">5月</TableHead>
                  <TableHead className="text-right">6月</TableHead>
                  <TableHead className="text-right">7月</TableHead>
                  <TableHead className="text-right">8月</TableHead>
                  <TableHead className="text-right">9月</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>売上高</TableCell>
                  <TableCell className="text-right tabular-nums">¥412,000</TableCell>
                  <TableCell className="text-right tabular-nums">¥438,182</TableCell>
                  <TableCell className="text-right tabular-nums">¥455,900</TableCell>
                  <TableCell className="text-right tabular-nums">¥471,300</TableCell>
                  <TableCell className="text-right tabular-nums">¥482,000</TableCell>
                  <TableCell className="text-right tabular-nums">¥499,540</TableCell>
                  <TableCell className="text-right tabular-nums">¥510,200</TableCell>
                  <TableCell className="text-right tabular-nums">¥528,770</TableCell>
                  <TableCell className="text-right tabular-nums">¥541,090</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>売上原価</TableCell>
                  <TableCell className="text-right tabular-nums">¥206,000</TableCell>
                  <TableCell className="text-right tabular-nums">¥219,091</TableCell>
                  <TableCell className="text-right tabular-nums">¥227,950</TableCell>
                  <TableCell className="text-right tabular-nums">¥235,650</TableCell>
                  <TableCell className="text-right tabular-nums">¥241,000</TableCell>
                  <TableCell className="text-right tabular-nums">¥249,770</TableCell>
                  <TableCell className="text-right tabular-nums">¥255,100</TableCell>
                  <TableCell className="text-right tabular-nums">¥264,385</TableCell>
                  <TableCell className="text-right tabular-nums">¥270,545</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}

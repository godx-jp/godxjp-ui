import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ListRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
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
      subtitle="Primitive table shell · prefer DataTable for admin lists"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>仕訳明細</CardTitle>
            <CardDescription>
              A fixed double-entry breakdown. The second row is rendered with the built-in selected
              state (TableRow data-state=&quot;selected&quot;), and a caption + total footer row
              exercise caption-bottom and a summary row.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <Table>
              <caption className="px-4 py-2 text-start">
                <Text size="xs" tone="muted">
                  2026年5月 売上計上（税込）
                </Text>
              </caption>
              <TableHeader>
                <TableRow>
                  <TableHead>勘定科目</TableHead>
                  <TableHead className="text-end">借方</TableHead>
                  <TableHead className="text-end">貸方</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>売掛金</TableCell>
                  <TableCell className="text-end tabular-nums">¥482,000</TableCell>
                  <TableCell className="text-end">—</TableCell>
                </TableRow>
                {/* Built-in selected-row state — data-[state=selected]:bg-primary/[0.06]. */}
                <TableRow data-state="selected">
                  <TableCell>売上高</TableCell>
                  <TableCell className="text-end">—</TableCell>
                  <TableCell className="text-end tabular-nums">¥438,182</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>仮受消費税</TableCell>
                  <TableCell className="text-end">—</TableCell>
                  <TableCell className="text-end tabular-nums">¥43,818</TableCell>
                </TableRow>
                <TableRow className="font-medium">
                  <TableCell>合計</TableCell>
                  <TableCell className="text-end tabular-nums">¥482,000</TableCell>
                  <TableCell className="text-end tabular-nums">¥482,000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>月次推移</CardTitle>
            <CardDescription>
              A wide table, more columns than the viewport can hold, so the built-in scroll wrapper
              (.relative w-full overflow-auto) scrolls horizontally.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>勘定科目</TableHead>
                  <TableHead className="text-end">1月</TableHead>
                  <TableHead className="text-end">2月</TableHead>
                  <TableHead className="text-end">3月</TableHead>
                  <TableHead className="text-end">4月</TableHead>
                  <TableHead className="text-end">5月</TableHead>
                  <TableHead className="text-end">6月</TableHead>
                  <TableHead className="text-end">7月</TableHead>
                  <TableHead className="text-end">8月</TableHead>
                  <TableHead className="text-end">9月</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>売上高</TableCell>
                  <TableCell className="text-end tabular-nums">¥412,000</TableCell>
                  <TableCell className="text-end tabular-nums">¥438,182</TableCell>
                  <TableCell className="text-end tabular-nums">¥455,900</TableCell>
                  <TableCell className="text-end tabular-nums">¥471,300</TableCell>
                  <TableCell className="text-end tabular-nums">¥482,000</TableCell>
                  <TableCell className="text-end tabular-nums">¥499,540</TableCell>
                  <TableCell className="text-end tabular-nums">¥510,200</TableCell>
                  <TableCell className="text-end tabular-nums">¥528,770</TableCell>
                  <TableCell className="text-end tabular-nums">¥541,090</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>売上原価</TableCell>
                  <TableCell className="text-end tabular-nums">¥206,000</TableCell>
                  <TableCell className="text-end tabular-nums">¥219,091</TableCell>
                  <TableCell className="text-end tabular-nums">¥227,950</TableCell>
                  <TableCell className="text-end tabular-nums">¥235,650</TableCell>
                  <TableCell className="text-end tabular-nums">¥241,000</TableCell>
                  <TableCell className="text-end tabular-nums">¥249,770</TableCell>
                  <TableCell className="text-end tabular-nums">¥255,100</TableCell>
                  <TableCell className="text-end tabular-nums">¥264,385</TableCell>
                  <TableCell className="text-end tabular-nums">¥270,545</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ── The flush full-bleed FRAME contract (gh#305 · gh#306) ───────────────────────────
            Four cards, side by side, so the whole rule is visible at once: which edges a
            full-bleed table keeps inside a card, and who draws the line under the header. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>出荷伝票一覧 · bordered, flush</CardTitle>
            <CardDescription>
              `bordered` draws the full cell grid for merged (rowSpan) cells. Inside a flush
              CardContent the three edges that coincide with the CARD frame are dropped, so there is
              no doubled frame. The block-start edge stays, as the divider under this header. Its
              width is `--table-flush-divider-width`.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <Table bordered>
              <TableHeader>
                <TableRow>
                  <TableHead>倉庫</TableHead>
                  <TableHead>伝票番号</TableHead>
                  <TableHead className="text-end">個数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell rowSpan={2}>東京第一</TableCell>
                  <TableCell>SH-2026-0412</TableCell>
                  <TableCell className="text-end tabular-nums">18</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SH-2026-0413</TableCell>
                  <TableCell className="text-end tabular-nums">6</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>大阪南</TableCell>
                  <TableCell>SH-2026-0414</TableCell>
                  <TableCell className="text-end tabular-nums">24</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>出荷伝票一覧 · bordered, NOT flush</CardTitle>
            <CardDescription>
              The same table in a padded CardContent. Nothing frames it here, so it keeps its own
              full frame. The suppression above is scoped to a flush body, never to `bordered`.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table bordered>
              <TableHeader>
                <TableRow>
                  <TableHead>倉庫</TableHead>
                  <TableHead>伝票番号</TableHead>
                  <TableHead className="text-end">個数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>東京第一</TableCell>
                  <TableCell>SH-2026-0412</TableCell>
                  <TableCell className="text-end tabular-nums">18</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader banded>
            <CardTitle level={2}>出荷伝票一覧 · banded header</CardTitle>
            <CardDescription>
              A banded header already draws its own bottom border, so the flush table below stands
              its divider down instead of stacking a second hairline on it. Same for a CardBar or a
              DataTable.Toolbar above the table. Same again for a card with no header at all, where
              the card frame IS the top edge.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <Table bordered>
              <TableHeader>
                <TableRow>
                  <TableHead>倉庫</TableHead>
                  <TableHead>伝票番号</TableHead>
                  <TableHead className="text-end">個数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>東京第一</TableCell>
                  <TableCell>SH-2026-0412</TableCell>
                  <TableCell className="text-end tabular-nums">18</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>関連ファイル · flush, no table</CardTitle>
            <CardDescription>
              A flush body that is not a table at all. `flush` zeroes BOTH block edges for every
              full-bleed body, so these rows butt against the header band exactly like the tables
              above. The header supplies the gap, not the body.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <ListRow title="出荷指図書_2026-04.pdf" description="1.2 MB · 2026-04-12" />
            <ListRow title="検品記録_2026-04.csv" description="18 KB · 2026-04-12" />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}

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
              A fixed double-entry breakdown — no sorting/selection needed.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <Table>
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
                <TableRow>
                  <TableCell>売上高</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right tabular-nums">¥438,182</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>仮受消費税</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right tabular-nums">¥43,818</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}

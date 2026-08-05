import { describe, it } from "vitest";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { Button, Text } from "../../general";
import { expectNoA11yViolations } from "@/test/a11y";

// The SCR-105 access-approval queue (gh#253): five columns — requester · target · reason ·
// requested date · row actions — under the action-collection preset. The preset changes only the
// sizing model, so this guards that the table axe sees at 390 is the SAME table it sees at 1440:
// real header cells with scope, an accessible name on the icon-only row action, no empty header.
describe("Table action-collection a11y (gh#253)", () => {
  it("has no axe violations for the canonical approval queue", async () => {
    await expectNoA11yViolations(
      <Table preset="action-collection" collapseBelow="sm">
        <TableHeader>
          <TableRow>
            <TableHead priority="primary" scope="col">
              申請者
            </TableHead>
            <TableHead priority="secondary" scope="col">
              対象
            </TableHead>
            <TableHead scope="col">理由</TableHead>
            <TableHead priority="meta" scope="col">
              申請日時
            </TableHead>
            <TableHead priority="actions" scope="col">
              <span className="sr-only">操作</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell priority="primary">Nguyễn Thị Hồng Ánh</TableCell>
            <TableCell priority="secondary">Kho vận / Quản trị phiếu xuất kho</TableCell>
            <TableCell>
              <Text size="sm">
                Cần quyền quản trị để xử lý phiếu xuất kho tồn đọng của chi nhánh miền Nam.
              </Text>
            </TableCell>
            <TableCell priority="meta">
              <time dateTime="2026-08-03T11:47:00+09:00">2026/08/03 11:47</time>
            </TableCell>
            <TableCell priority="actions">
              <Button variant="ghost" size="xs" aria-label="この申請の操作">
                ⋯
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
  });
});

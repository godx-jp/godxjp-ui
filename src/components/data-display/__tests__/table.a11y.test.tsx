import { describe, it } from "vitest";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { expectNoA11yViolations } from "@/test/a11y";

// The Table primitives are thin wrappers over native table elements; a proper
// header row plus body rows keeps the column/row semantics intact.
describe("Table a11y", () => {
  it("has no axe violations for a headed data table", async () => {
    await expectNoA11yViolations(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">HAWB</TableHead>
            <TableHead scope="col">仕向地</TableHead>
            <TableHead scope="col">重量</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>GX-001</TableCell>
            <TableCell>東京</TableCell>
            <TableCell>12.4 kg</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>GX-002</TableCell>
            <TableCell>大阪</TableCell>
            <TableCell>8.1 kg</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
  });
});

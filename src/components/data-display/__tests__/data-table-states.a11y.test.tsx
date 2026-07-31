// axe guard for the DataTable error / denied states (gh#216). The failure surfaces live INSIDE
// the table grid (one cell spanning every column), which is exactly where a hand-rolled version
// breaks the table structure — so each state is asserted at 0 violations.
import { describe, it } from "vitest";

import { expectNoA11yViolations } from "@/test/a11y";
import { Button } from "../../general/button";
import { DataTable, type ColumnDef } from "../data-table";

type Row = { id: string; name: string };

const COLUMNS: ColumnDef<Row>[] = [
  { key: "name", header: "Name" },
  { key: "id", header: "Identifier" },
  // A visually-empty action header still needs a screen-reader name.
  { key: "actions", header: "", ariaLabel: "Row actions", align: "right" },
];

describe("DataTable state a11y", () => {
  it("has no violations in the built-in error state (with retry)", async () => {
    await expectNoA11yViolations(
      <DataTable
        data={[]}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        error
        onRetry={() => undefined}
      />,
    );
  });

  it("has no violations in the built-in denied state", async () => {
    await expectNoA11yViolations(
      <DataTable data={[]} columns={COLUMNS} getRowId={(r) => r.id} selectable denied />,
    );
  });

  it("has no violations with a custom error node carrying its own action", async () => {
    await expectNoA11yViolations(
      <DataTable
        data={[]}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        error={
          <div>
            <p>ATTEND_FETCH_504 · req_7f3a91c0d2</p>
            <Button variant="outline" size="sm">
              Reload
            </Button>
          </div>
        }
      />,
    );
  });
});

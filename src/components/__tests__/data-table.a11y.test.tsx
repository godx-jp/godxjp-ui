import { describe, it } from "vitest";
import { DataTable, type ColumnDef } from "../data-display/data-table";
import { expectNoA11yViolations } from "@/test/a11y";

// A populated admin list is the most common DataTable usage, so the rendered
// table (header + rows) must expose a valid accessibility tree to screen readers.
type Row = { id: string; name: string; email: string };

const columns: ColumnDef<Row>[] = [
  { key: "name", header: "Name", render: (row) => row.name },
  { key: "email", header: "Email", render: (row) => row.email },
];

const data: Row[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com" },
  { id: "2", name: "Alan Turing", email: "alan@example.com" },
];

describe("DataTable a11y", () => {
  it("has no axe violations with rows and columns", async () => {
    await expectNoA11yViolations(<DataTable data={data} columns={columns} />);
  });
});

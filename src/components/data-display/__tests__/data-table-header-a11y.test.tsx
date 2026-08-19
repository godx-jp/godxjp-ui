import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { within } from "@testing-library/react";
import { renderWithUi, screen } from "@/test/render";

import { DataTable, type ColumnDef } from "../data-table";
import { expectNoA11yViolations } from "@/test/a11y";

type Row = { id: string; name: string };
const data: Row[] = [
  { id: "1", name: "Ada Lovelace" },
  { id: "2", name: "Alan Turing" },
];

// A visually-empty action column that carries an accessible header via ariaLabel.
const columnsWithActions: ColumnDef<Row>[] = [
  { key: "name", header: "名前", render: (r) => r.name },
  {
    key: "_actions",
    header: "",
    ariaLabel: "操作",
    align: "right",
    enableHiding: false,
    render: () => <button type="button">…</button>,
  },
];

describe("DataTable accessible header contract (#155)", () => {
  it("gives a visually-empty action column a screen-reader header via ariaLabel", () => {
    const { container } = renderWithUi(
      <DataTable data={data} columns={columnsWithActions} getRowId={(r) => r.id} />,
    );
    // The <th> is announced as "操作" even though it shows no visible label.
    const actionsHeader = screen.getByRole("columnheader", { name: "操作" });
    expect(actionsHeader).toBeInTheDocument();
    // The label is present but visually hidden (sr-only).
    const srOnly = actionsHeader.querySelector(".sr-only");
    expect(srOnly).not.toBeNull();
    expect(srOnly).toHaveTextContent("操作");
    // Still flagged visually-empty for styling.
    expect(actionsHeader).toHaveAttribute("data-empty", "true");
    // sanity: only one visible text header + one sr-only actions header.
    expect(within(container).getByRole("columnheader", { name: "名前" })).toBeInTheDocument();
  });

  it("has no empty-table-header axe violation with an action column + selection column", async () => {
    await expectNoA11yViolations(
      <DataTable data={data} columns={columnsWithActions} getRowId={(r) => r.id} selectable>
        <DataTable.Content />
      </DataTable>,
    );
  });

  describe("dev warning for an unnamed empty header", () => {
    let warn: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    });
    afterEach(() => {
      warn.mockRestore();
    });

    it("warns in development when a <th> has neither visible nor accessible text", () => {
      const bad: ColumnDef<Row>[] = [
        { key: "name", header: "名前", render: (r) => r.name },
        { key: "_actions", header: "", align: "right", render: () => <button>…</button> },
      ];
      renderWithUi(<DataTable data={data} columns={bad} getRowId={(r) => r.id} />);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Column "_actions"'));
    });

    it("does NOT warn when the empty header carries an ariaLabel", () => {
      renderWithUi(<DataTable data={data} columns={columnsWithActions} getRowId={(r) => r.id} />);
      expect(warn).not.toHaveBeenCalled();
    });
  });
});

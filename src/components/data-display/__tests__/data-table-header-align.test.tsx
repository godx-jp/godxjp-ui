import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable } from "../data-table";

/**
 * Heading alignment, separately from the rows.
 *
 * A table can want centred headings over start-aligned text: a long subject
 * reads from the left while its heading sits over the column. `align` alone
 * cannot say that — setting it to `center` centres the rows too — so consumers
 * reached for `[&_th_button]:justify-center`, a hand-tuned override of a
 * layout the table owns.
 */
const rows = [{ id: 1, subject: "a long subject that reads from the left" }];

describe("DataTable headerAlign", () => {
  it("centres the heading while the rows stay where they were", () => {
    render(
      <DataTable
        data={rows}
        getRowId={(row) => String(row.id)}
        columns={[{ key: "subject", header: "Subject", headerAlign: "center" }]}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Subject" })).toHaveClass(
      "text-center",
    );
    expect(screen.getByRole("cell", { name: rows[0].subject })).not.toHaveClass(
      "text-center",
    );
  });

  it("follows align when headerAlign is not given", () => {
    // The default has to stay what every existing caller already renders.
    render(
      <DataTable
        data={rows}
        getRowId={(row) => String(row.id)}
        columns={[{ key: "subject", header: "Subject", align: "center" }]}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Subject" })).toHaveClass(
      "text-center",
    );
  });

  it("lets headerAlign override align rather than merging with it", () => {
    render(
      <DataTable
        data={rows}
        getRowId={(row) => String(row.id)}
        columns={[
          { key: "subject", header: "Subject", align: "center", headerAlign: "right" },
        ]}
      />,
    );

    const heading = screen.getByRole("columnheader", { name: "Subject" });

    expect(heading).toHaveClass("text-end");
    expect(heading).not.toHaveClass("text-center");
  });
});

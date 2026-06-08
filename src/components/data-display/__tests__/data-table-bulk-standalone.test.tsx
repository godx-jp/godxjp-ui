import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { DataTable } from "../data-table";

describe("DataTable.BulkActions — outside a table context", () => {
  it("uses an explicit count when there is no surrounding DataTable", () => {
    renderWithUi(
      <DataTable.BulkActions count={2}>
        <button type="button">削除</button>
      </DataTable.BulkActions>,
    );
    expect(screen.getByRole("region")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  it("renders nothing without a count and without a context selection", () => {
    const { container } = renderWithUi(
      <DataTable.BulkActions>
        <button type="button">削除</button>
      </DataTable.BulkActions>,
    );
    // c = count(undefined) ?? ctx?.selected.size(undefined) ?? 0 → 0 → null
    expect(container.querySelector('[role="region"]')).toBeNull();
  });
});

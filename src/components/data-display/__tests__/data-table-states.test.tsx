// DataTable lifecycle states (gh#216) — the six states a consumer list page must be able to
// render WITHOUT hand-rolling one: loading · empty · error · denied · pagination · row actions.
// This file codifies the two that were missing (error / denied) plus their precedence, so a
// regression that silently drops a failure state into "Chưa có dữ liệu" is caught by `pnpm test`.
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { renderWithUi, screen } from "@/test/render";
import { DataTable, type ColumnDef } from "../data-table";

type Row = { id: string; name: string };

const COLUMNS: ColumnDef<Row>[] = [
  { key: "name", header: "Name" },
  { key: "id", header: "Identifier" },
];
const ROWS: Row[] = [
  { id: "r-1", name: "Sato" },
  { id: "r-2", name: "Suzuki" },
];

describe("DataTable lifecycle states", () => {
  it("renders the built-in localized error state for error={true}", () => {
    renderWithUi(<DataTable data={[]} columns={COLUMNS} getRowId={(r) => r.id} error />);

    // Assertive announcement: the user's read did not complete.
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Không tải được danh sách này")).toBeInTheDocument();
    expect(
      screen.getByText("Không lấy được dữ liệu. Vui lòng thử lại sau giây lát."),
    ).toBeInTheDocument();
    // No blind retry unless the consumer supplied one.
    expect(screen.queryByRole("button", { name: "Thử lại" })).toBeNull();
  });

  it("offers Retry in the error state only when onRetry is supplied, and calls it", async () => {
    const onRetry = vi.fn();
    renderWithUi(
      <DataTable data={[]} columns={COLUMNS} getRowId={(r) => r.id} error onRetry={onRetry} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // Browser-confirmed (headless Chromium, /isolate/data-display-data-table-index at 1440/1024/390):
  // every failure cell reads tagName TD with role=null, and the alert is an inner DIV. Overriding a
  // cell's implicit `cell` role with `alert` would drop it out of the table's grid semantics for AT,
  // so this pins the wrapper placement rather than merely "an alert exists somewhere".
  it("puts role=alert on an inner wrapper, never on the <td> itself", () => {
    renderWithUi(
      <DataTable data={[]} columns={COLUMNS} getRowId={(r) => r.id} error onRetry={vi.fn()} />,
    );

    const alert = screen.getByRole("alert");
    expect(alert.tagName).toBe("DIV");

    const cell = alert.closest("td");
    expect(cell).not.toBeNull();
    // The cell keeps its native table semantics: no role override, and the alert is a descendant.
    expect(cell).not.toHaveAttribute("role");
    expect(cell).not.toBe(alert);
    expect(cell?.contains(alert)).toBe(true);
    // The retry affordance lives inside the announced region, so AT reads the recovery path.
    expect(alert).toContainElement(screen.getByRole("button", { name: "Thử lại" }));
  });

  it("renders a custom error node instead of the built-in copy", () => {
    renderWithUi(
      <DataTable
        data={[]}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        error={<span>ATTEND_FETCH_504 · req_7f3a91c0d2</span>}
      />,
    );

    expect(screen.getByText("ATTEND_FETCH_504 · req_7f3a91c0d2")).toBeInTheDocument();
    expect(screen.queryByText("Không tải được danh sách này")).toBeNull();
  });

  it("renders the built-in DENIED state with NO retry (a 403 cannot be retried)", () => {
    renderWithUi(
      <DataTable data={[]} columns={COLUMNS} getRowId={(r) => r.id} denied onRetry={vi.fn()} />,
    );

    expect(screen.getByText("Bạn không có quyền xem danh sách này")).toBeInTheDocument();
    expect(
      screen.getByText("Hãy đề nghị quản trị viên cấp quyền xem các bản ghi này."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Thử lại" })).toBeNull();
    // A permission boundary is expected information, announced politely — not an alert.
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("treats error={false} / denied={false} as 'the read succeeded' and shows rows", () => {
    renderWithUi(
      <DataTable
        data={ROWS}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        error={false}
        denied={false}
      />,
    );

    expect(screen.getByText("Sato")).toBeInTheDocument();
    expect(screen.queryByText("Không tải được danh sách này")).toBeNull();
    expect(screen.queryByText("Chưa có dữ liệu")).toBeNull();
  });

  it("applies the precedence loading > denied > error > empty", () => {
    const { rerender } = renderWithUi(
      <DataTable data={[]} columns={COLUMNS} getRowId={(r) => r.id} loading denied error />,
    );
    // loading wins: neither message is rendered.
    expect(screen.queryByText("Bạn không có quyền xem danh sách này")).toBeNull();
    expect(screen.queryByText("Không tải được danh sách này")).toBeNull();

    rerender(<DataTable data={[]} columns={COLUMNS} getRowId={(r) => r.id} denied error />);
    // denied wins over error: refused beats failed.
    expect(screen.getByText("Bạn không có quyền xem danh sách này")).toBeInTheDocument();
    expect(screen.queryByText("Không tải được danh sách này")).toBeNull();

    rerender(<DataTable data={[]} columns={COLUMNS} getRowId={(r) => r.id} error />);
    expect(screen.getByText("Không tải được danh sách này")).toBeInTheDocument();
    expect(screen.queryByText("Chưa có dữ liệu")).toBeNull();

    rerender(<DataTable data={[]} columns={COLUMNS} getRowId={(r) => r.id} />);
    expect(screen.getByText("Chưa có dữ liệu")).toBeInTheDocument();
  });

  it("keeps the error/denied cell spanning every visible column", () => {
    const { container } = renderWithUi(
      <DataTable data={[]} columns={COLUMNS} getRowId={(r) => r.id} selectable error />,
    );

    const cell = container.querySelector(".ui-data-table-empty");
    // 2 data columns + the selection column.
    expect(cell?.getAttribute("colspan")).toBe("3");
  });
});

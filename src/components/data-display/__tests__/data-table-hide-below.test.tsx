import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { DataTable, resolveColumnHideBelow, type ColumnDef } from "../data-table";

const layoutCss = readFileSync(resolve(process.cwd(), "src/styles/layout.css"), "utf8");

/** Viewport min widths for each step — same rem ladder as `Flex hideBelow` (16px root). */
const HIDE_BELOW_MIN_PX: Record<string, number> = {
  sm: 40 * 16,
  md: 48 * 16,
  lg: 64 * 16,
  xl: 80 * 16,
};

function columnHeadersReadableAtWidth(widthPx: number): string[] {
  return screen
    .getAllByRole("columnheader")
    .filter((header) => {
      const step = header.getAttribute("data-hide-below");
      if (!step) return true;
      const min = HIDE_BELOW_MIN_PX[step];
      return min !== undefined && widthPx >= min;
    })
    .map((header) => header.textContent ?? "");
}

type TaskRow = {
  id: string;
  due: string;
  days: string;
  subject: string;
  target: string;
  kind: string;
  owner: string;
};

const taskRows: TaskRow[] = [
  {
    id: "1",
    due: "2026-04-01",
    days: "残3日",
    subject: "実習報告書の提出",
    target: "田中 太郎",
    kind: "期限",
    owner: "わたし",
  },
];

/** gh#603 — six columns, four hide steps (content-driven drop order). */
const taskColumns: ColumnDef<TaskRow>[] = [
  { key: "due", header: "期限日" },
  { key: "days", header: "残日数", hideBelow: "lg" },
  { key: "subject", header: "件名" },
  { key: "target", header: "対象", hideBelow: "md" },
  { key: "kind", header: "種別", hideBelow: "xl" },
  { key: "owner", header: "担当", hideBelow: "sm" },
];

describe("DataTable ColumnDef.hideBelow (gh#603)", () => {
  it("stamps the same hideBelow contract as Flex on head and body cells", () => {
    renderWithUi(
      <DataTable data={taskRows} columns={taskColumns} getRowId={(row) => row.id} />,
    );

    const kindHeader = screen.getByRole("columnheader", { name: "種別" });
    expect(kindHeader).toHaveAttribute("data-hide-below", "xl");
    expect(screen.getByRole("cell", { name: "期限" })).toHaveAttribute("data-hide-below", "xl");
  });

  it("keeps the expected readable column headers at each viewport step", () => {
    renderWithUi(
      <DataTable data={taskRows} columns={taskColumns} getRowId={(row) => row.id} />,
    );

    expect(columnHeadersReadableAtWidth(1400)).toEqual([
      "期限日",
      "残日数",
      "件名",
      "対象",
      "種別",
      "担当",
    ]);
    expect(columnHeadersReadableAtWidth(1100)).toEqual([
      "期限日",
      "残日数",
      "件名",
      "対象",
      "担当",
    ]);
    expect(columnHeadersReadableAtWidth(900)).toEqual(["期限日", "件名", "対象", "担当"]);
    expect(columnHeadersReadableAtWidth(700)).toEqual(["期限日", "件名", "担当"]);
    expect(columnHeadersReadableAtWidth(500)).toEqual(["期限日", "件名"]);
  });

  it("treats hiddenOnMobile: true as hideBelow: md", () => {
    renderWithUi(
      <DataTable
        data={taskRows}
        columns={[
          { key: "due", header: "期限日" },
          { key: "target", header: "対象", hiddenOnMobile: true },
        ]}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "対象" })).toHaveAttribute(
      "data-hide-below",
      "md",
    );
    expect(columnHeadersReadableAtWidth(900)).toEqual(["期限日", "対象"]);
    expect(columnHeadersReadableAtWidth(700)).toEqual(["期限日"]);
  });

  it("hides table cells at the canonical Flex hideBelow steps in layout.css", () => {
    for (const [step, width] of [
      ["sm", "40rem"],
      ["md", "48rem"],
      ["lg", "64rem"],
      ["xl", "80rem"],
    ] as const) {
      expect(layoutCss).toMatch(
        new RegExp(
          `@media \\(width < ${width}\\)[^{]*\\{[^}]*\\[data-slot="table-head"\\]\\[data-hide-below="${step}"\\]`,
        ),
      );
      expect(layoutCss).toMatch(
        new RegExp(
          `@media \\(width < ${width}\\)[^{]*\\{[^}]*\\[data-slot="table-cell"\\]\\[data-hide-below="${step}"\\]`,
        ),
      );
    }
  });
});

describe("resolveColumnHideBelow", () => {
  it("prefers hideBelow over hiddenOnMobile", () => {
    expect(resolveColumnHideBelow({ hideBelow: "lg", hiddenOnMobile: true })).toBe("lg");
  });
});

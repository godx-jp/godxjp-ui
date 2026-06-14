import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { DataTable } from "../data-table";

type Row = { id: string; name: string };
const rows: Row[] = [
  { id: "1", name: "A" },
  { id: "2", name: "B" },
];
const columns = [{ key: "name", header: "名前" }];

const surface = (c: HTMLElement) => c.querySelector(".ui-data-table-surface")!;
const header = (c: HTMLElement) => c.querySelector("thead")!;

describe("DataTable display props", () => {
  it("opts into zebra striping via `striped`", () => {
    const { container } = renderWithUi(
      <DataTable data={rows} columns={columns} getRowId={(r) => r.id} striped />,
    );
    expect(surface(container)).toHaveAttribute("data-striped");
  });

  it("opts into row hover via `hoverable` without making rows clickable", () => {
    const { container } = renderWithUi(
      <DataTable data={rows} columns={columns} getRowId={(r) => r.id} hoverable />,
    );
    expect(surface(container)).toHaveAttribute("data-hoverable");
    const row = container.querySelector("tbody tr")!;
    expect(row.className).toContain("hover:bg-muted/50");
    expect(row.className).not.toContain("cursor-pointer");
  });

  it("keeps the header sticky by default and drops it when stickyHeader=false", () => {
    const { container: a } = renderWithUi(
      <DataTable data={rows} columns={columns} getRowId={(r) => r.id} />,
    );
    expect(header(a).className).toContain("sticky");

    const { container: b } = renderWithUi(
      <DataTable data={rows} columns={columns} getRowId={(r) => r.id} stickyHeader={false} />,
    );
    expect(header(b).className).not.toContain("sticky");
  });

  it("accepts the third density tier (default) and applies its density class", () => {
    const { container } = renderWithUi(
      <DataTable data={rows} columns={columns} getRowId={(r) => r.id} density="default" />,
    );
    expect(surface(container).closest(".ui-data-table-scroll")).toBeTruthy();
    // the density class lives on the scroll wrapper
    expect(container.querySelector(".ui-density-default")).toBeInTheDocument();
  });

  it("tints individual rows via `rowClassName` and skips rows that return undefined", () => {
    const { container } = renderWithUi(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        rowClassName={(r) => (r.id === "1" ? "bg-destructive/10" : undefined)}
      />,
    );
    const bodyRows = container.querySelectorAll("tbody tr");
    expect(bodyRows[0].className).toContain("bg-destructive/10");
    expect(bodyRows[1].className).not.toContain("bg-destructive/10");
  });

  it("is unstyled (no stripe/hover attrs) by default", () => {
    const { container } = renderWithUi(
      <DataTable data={rows} columns={columns} getRowId={(r) => r.id} />,
    );
    expect(surface(container)).not.toHaveAttribute("data-striped");
    expect(surface(container)).not.toHaveAttribute("data-hoverable");
  });
});

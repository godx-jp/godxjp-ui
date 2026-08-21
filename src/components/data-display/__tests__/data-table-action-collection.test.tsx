import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTable, type ColumnDef } from "../data-table";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
const tableCss = read("../../../styles/table-layout.css");
// Prettier may wrap a long `var(--token)` across lines; compare against a whitespace-free copy.
const tableCssFlat = tableCss.replace(/\s+/g, "");
// …and a copy with the (long, prose-heavy) comments stripped, for whole-rule assertions.
const tableCssBare = tableCss.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, "");
const tableTokens = read("../../../tokens/components/table.css");
const dataTableSource = read("../data-table.tsx");

type AccessRequest = {
  id: string;
  requester: string;
  target: string;
  reason: string;
  requestedAt: string;
};

const requests: AccessRequest[] = [
  {
    id: "req-1041",
    requester: "田中 太郎",
    target: "会計 / 請求書エクスポート",
    reason: "月次決算のため請求データの一括出力権限が必要です。",
    requestedAt: "2026-08-03T09:12:00+09:00",
  },
  {
    id: "req-1042",
    requester: "Nguyễn Thị Hồng Ánh",
    target: "Kho vận / Quản trị phiếu xuất kho khu vực miền Nam",
    reason: "Cần quyền quản trị để xử lý phiếu xuất kho tồn đọng của chi nhánh miền Nam.",
    requestedAt: "2026-08-03T11:47:00+09:00",
  },
];

const columns: ColumnDef<AccessRequest>[] = [
  { key: "requester", header: "申請者", priority: "primary", sortable: true },
  { key: "target", header: "対象", priority: "secondary" },
  // The free-text column is deliberately unmarked — it takes the remaining space.
  { key: "reason", header: "理由" },
  { key: "requestedAt", header: "申請日時", priority: "meta" },
  { key: "actions", header: "", ariaLabel: "操作", priority: "actions", enableHiding: false },
];

function Queue(props: { preset?: "default" | "action-collection" }) {
  return (
    <DataTable
      data={requests}
      columns={columns}
      getRowId={(row) => row.id}
      preset={props.preset}
      collapseBelow="sm"
    />
  );
}

describe("DataTable action-collection preset (gh#253)", () => {
  it("is inert by default — no preset attribute anywhere, no container class", () => {
    const { container } = render(<Queue />);
    const surface = container.querySelector(".ui-data-table-surface")!;

    expect(surface).not.toHaveAttribute("data-preset");
    expect(container.querySelector("[data-preset]")).toBeNull();
    expect(container.querySelector("[data-collapse-below]")).toBeNull();
    expect(container.querySelector(".ui-table-collection")).toBeNull();
  });

  it("emits no priority attribute for a column that does not declare one", () => {
    const { container } = render(
      <DataTable
        data={requests}
        columns={[
          { key: "requester", header: "申請者" },
          { key: "reason", header: "理由" },
        ]}
        getRowId={(row) => row.id}
      />,
    );

    expect(container.querySelector("[data-priority]")).toBeNull();
  });

  it("keeps the pre-gh#253 surface markup byte-identical by default", () => {
    const { container } = render(<Queue />);
    const surface = container.querySelector(".ui-data-table-surface")!;

    // The width floor moved from a `min-w-[640px] sm:min-w-0` utility pair to a token, so the
    // surface carries the single structural class and nothing else.
    expect(surface.className).toBe("ui-data-table-surface");
    expect(dataTableSource).not.toContain("min-w-[640px]");
    expect(dataTableSource).not.toContain("sm:min-w-0");
  });

  it("opts in with one prop — the surface and the table both carry the contract", () => {
    const { container } = render(<Queue preset="action-collection" />);
    const surface = container.querySelector(".ui-data-table-surface")!;
    const collection = container.querySelector(".ui-table-collection")!;

    expect(surface).toHaveAttribute("data-preset", "action-collection");
    expect(collection).toHaveAttribute("data-preset", "action-collection");
    expect(collection).toHaveAttribute("data-collapse-below", "sm");
  });

  it("forwards the collapse step to the table's own container query", () => {
    const { container } = render(
      <DataTable
        data={requests}
        columns={columns}
        getRowId={(row) => row.id}
        preset="action-collection"
        collapseBelow="lg"
      />,
    );

    expect(container.querySelector(".ui-table-collection")).toHaveAttribute(
      "data-collapse-below",
      "lg",
    );
  });

  it("stamps ColumnDef.priority on BOTH the header cell and every body cell", () => {
    const { container } = render(<Queue preset="action-collection" />);

    expect(container.querySelector('th[data-priority="primary"]')?.textContent).toContain("申請者");
    expect(container.querySelector('th[data-priority="secondary"]')?.textContent).toContain("対象");
    expect(container.querySelector('th[data-priority="meta"]')?.textContent).toContain("申請日時");
    expect(container.querySelector('th[data-priority="actions"]')).toBeInTheDocument();
    // One <td> per row for each of the four marked columns.
    expect(container.querySelectorAll('td[data-priority="primary"]')).toHaveLength(requests.length);
    expect(container.querySelectorAll('td[data-priority="actions"]')).toHaveLength(requests.length);
    // The unmarked free-text column stays attribute-free on both cells.
    expect(container.querySelectorAll("th:not([data-priority])")).toHaveLength(1);
    expect(container.querySelectorAll("tbody td:not([data-priority])")).toHaveLength(
      requests.length,
    );
  });

  it("stamps the priority on the loading skeleton row too, so columns don't jump", () => {
    const { container } = render(
      <DataTable
        data={requests}
        columns={columns}
        getRowId={(row) => row.id}
        preset="action-collection"
        loading
      />,
    );

    expect(
      container.querySelectorAll('tbody td[data-priority="primary"]').length,
    ).toBeGreaterThanOrEqual(6);
  });

  it("keeps REAL table semantics under the preset — no display or role rewriting", () => {
    const { container } = render(<Queue preset="action-collection" />);

    expect(container.querySelector("table")).not.toHaveAttribute("role");
    expect(container.querySelector("thead")).not.toHaveAttribute("aria-hidden");
    expect(container.querySelectorAll("thead th")).toHaveLength(columns.length);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(requests.length);
    // A sortable column keeps its aria-sort even at the collapsed measure.
    expect(container.querySelector('th[data-priority="primary"]')).toHaveAttribute(
      "aria-sort",
      "none",
    );
  });

  it("REUSES the Table priority tokens — no parallel --data-table-* family", () => {
    for (const token of [
      "--table-action-collection-primary-width",
      "--table-action-collection-secondary-width",
      "--table-action-collection-meta-width",
      "--table-action-collection-actions-width",
    ]) {
      expect(tableCssFlat).toContain(`var(${token})`);
    }
    expect(tableTokens).not.toMatch(/--data-table-action-collection-/);
    expect(tableCss).not.toMatch(/--data-table-action-collection-/);
  });

  it("owns the surface width floor as a documented token, not a literal", () => {
    expect(tableTokens).toContain("--table-surface-min-inline-size: 640px;");
    // `clip`, not `hidden` (gh#291 family): both clip to the rounded border, but
    // `hidden` makes the surface a SCROLL CONTAINER and silently captures the
    // sticky context of stickyHeader/pinned columns — measured: the header then
    // scrolls away 1:1 with the body. Keep this pinned so it cannot regress.
    expect(tableCssBare).toContain(
      ".ui-data-table-surface{overflow:clip;min-inline-size:var(--table-surface-min-inline-size);",
    );
    // Logical property only (RTL) — never `min-width`.
    expect(tableCssBare).not.toMatch(/\.ui-data-table-surface[^{]*\{[^}]*min-width:/);
  });

  it("releases the floor for the preset and above the sm step, and nowhere else", () => {
    expect(tableCssBare).toContain(
      '.ui-data-table-surface[data-preset="action-collection"]{min-inline-size:0;}',
    );
    expect(tableCssBare).toContain("@media(min-width:640px){");
    expect(tableCssBare).toMatch(
      /@media\(min-width:640px\)\{[^@]*\.ui-data-table-surface\{min-inline-size:0;\}/,
    );
  });

  it("never styles a DataTable that did not opt in — the inert-default contract (gh#231)", () => {
    expect(tableCss).not.toMatch(/\[data-preset="default"\]/);
    expect(tableCss).not.toMatch(/\.ui-data-table-surface\[data-preset\]\s*\{/);
  });

  // ── Measured-frame evidence (headless Chromium, `pnpm preview:build`) ─────────────────────────
  // /isolate/data-display-data-table-examples-approval-queue, LTR and RTL, console clean:
  //   1440×900 → document 1440/1440 (no overflow) · surface & table 1182 · table-layout: fixed
  //              columns 212.8 primary · 260 secondary · 511.4 reason · 141.8 meta · 56 actions
  //   1024×768 → document 1024/1024 · surface & table 766
  //              columns 137.9 · 168.5 · 311.7 · 91.9 · 56
  //    390×844 → document  390/390  · surface & table 388 · .ui-data-table-scroll overflow 0
  //              columns  93.1 ·  85.4 ·  87.9 ·  77.6 · 44 — all five headers inside the frame
  // The SAME page with `preset` omitted keeps min-inline-size 640px at 390 (282px of internal
  // scroll) and 0 at 1024/1440 — i.e. exactly the old `min-w-[640px] sm:min-w-0` behaviour.
  //
  // Those widths are pure arithmetic on the priority tokens, so pin the arithmetic here: a token
  // edit that would push the actions column back out of the 390 frame fails in `pnpm test`.
  it("reproduces the measured column geometry from the priority tokens", () => {
    const tokenValue = (name: string) =>
      tableTokens.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]?.trim() ?? "";
    const percent = (name: string) => Number.parseFloat(tokenValue(name));
    const rem = (name: string) => Number.parseFloat(tokenValue(name)) * 16;

    const round = (n: number) => Math.round(n * 10) / 10;
    const desktop = (tableWidth: number) => ({
      primary: round((tableWidth * percent("--table-action-collection-primary-width")) / 100),
      secondary: round((tableWidth * percent("--table-action-collection-secondary-width")) / 100),
      meta: round((tableWidth * percent("--table-action-collection-meta-width")) / 100),
      actions: rem("--table-action-collection-actions-width"),
    });
    const compact = (tableWidth: number) => ({
      primary: round(
        (tableWidth * percent("--table-action-collection-primary-width-compact")) / 100,
      ),
      secondary: round(
        (tableWidth * percent("--table-action-collection-secondary-width-compact")) / 100,
      ),
      meta: round((tableWidth * percent("--table-action-collection-meta-width-compact")) / 100),
      actions: rem("--table-action-collection-actions-width-compact"),
    });
    const free = (tableWidth: number, m: ReturnType<typeof desktop>) =>
      round(tableWidth - m.primary - m.secondary - m.meta - m.actions);

    // 1440 → 1182px table
    expect(desktop(1182)).toEqual({ primary: 212.8, secondary: 260, meta: 141.8, actions: 56 });
    expect(free(1182, desktop(1182))).toBe(511.4);
    // 1024 → 766px table
    expect(desktop(766)).toEqual({ primary: 137.9, secondary: 168.5, meta: 91.9, actions: 56 });
    expect(free(766, desktop(766))).toBe(311.7);
    // 390 → 388px table, compact PERCENT tier below the `sm` container step — the ratios that
    // keep the canonical five-column queue scroll-free at the acceptance artboards (gh#253),
    // restored after the gh#262 floors briefly replaced them and broke exactly that frame.
    expect(compact(388)).toEqual({ primary: 93.1, secondary: 85.4, meta: 77.6, actions: 44 });
    expect(free(388, compact(388))).toBe(87.9);
    // 320 artboard → a 278px content box in the geometry frame: the free-text measure must stay
    // non-negative there too, or the five columns cannot fit without a scroll.
    expect(free(278, compact(278))).toBeGreaterThan(0);
    // Budget invariant: the compact shares sum under 100%, so a queue within the six-column
    // budget can never be percentage-normalized into sub-glyph columns.
    expect(
      percent("--table-action-collection-primary-width-compact") +
        percent("--table-action-collection-secondary-width-compact") +
        percent("--table-action-collection-meta-width-compact"),
    ).toBeLessThan(100);
    // Wide-collection floor tier (gh#262, seven columns and up): absolute rem measures — the
    // only floor `table-layout: fixed` respects — sized for ~5 CJK glyphs per line at the
    // compact type tier. The over-constrained table then grows and scrolls by design.
    expect(rem("--table-action-collection-primary-width-floor")).toBe(96);
    expect(rem("--table-action-collection-secondary-width-floor")).toBe(88);
    expect(rem("--table-action-collection-meta-width-floor")).toBe(80);
    expect(rem("--table-action-collection-flex-width-floor")).toBe(80);
    // The reserved actions measure must clear the WCAG 2.5.8 24px target even at the compact tier.
    expect(rem("--table-action-collection-actions-width-compact")).toBeGreaterThanOrEqual(24);
  });

  // ── gh#262 follow-up: scroll ownership under the preset ───────────────────────────────────────
  // Past the column budget the floor tier grows the TABLE past 100%; the surface between the
  // table and `.ui-data-table-scroll` is an `overflow: hidden` block that cannot size to a
  // fixed-layout table's degenerate intrinsics, so it would CLIP the grown table before the outer
  // region ever saw an overflow (the frame-geometry regression on the approval-queue frame).
  // Only the table's DIRECT wrapper sees the growth — so under the preset the Table primitive's
  // own wrapper is the keyboard-reachable scroll region, and the outer region drops its tab stop
  // rather than adding a second, never-scrollable one.
  it("moves the scroll region to the table's direct wrapper under the preset", () => {
    const { container } = render(<Queue preset="action-collection" />);
    const wrapper = container.querySelector(".ui-table-collection")!;
    const outer = container.querySelector(".ui-data-table-scroll")!;

    expect(wrapper.className).toContain("overflow-auto");
    expect(wrapper).toHaveAttribute("tabindex", "0");
    expect(outer).not.toHaveAttribute("tabindex");
  });

  it("keeps the outer scroll region + tab stop for a DataTable that did not opt in", () => {
    const { container } = render(<Queue />);
    const outer = container.querySelector(".ui-data-table-scroll")!;
    const wrapper = outer.querySelector(".ui-data-table-surface > div")!;

    expect(outer).toHaveAttribute("tabindex", "0");
    // The primitive's wrapper stays a bare positioning box — no nested scroller, no second stop.
    expect(wrapper.className).not.toContain("overflow-auto");
    expect(wrapper).not.toHaveAttribute("tabindex");
  });

  it("does not regress the gh#236 pagination inset tokens", () => {
    expect(tableTokens).toContain("--table-pagination-padding-y: initial;");
    expect(tableTokens).toContain("--table-pagination-padding-x: initial;");
    expect(tableCssFlat).toContain(
      "padding-block:var(--table-pagination-padding-y,var(--space-stack-sm));",
    );
    expect(tableCssFlat).toContain(
      "padding-inline:var(--table-pagination-padding-x,var(--table-cell-space-x));",
    );
  });
});

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { ruleSelector } from "@/test/css-selector";
import { Card, CardBar, CardContent, CardHeader, CardTitle } from "../card";
import { DataTable } from "../data-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";

/**
 * The flush full-bleed FRAME contract — gh#305 (a doubled outer frame) and gh#306 (the repair
 * for it swallowing the one edge that had nothing behind it).
 *
 * Both defects are cascade defects, so both are tested the way src/test/css-selector.ts
 * prescribes: the selector is pulled OUT of the shipped stylesheet and run with `.matches()`
 * against really rendered DOM. A string match on the CSS proves a rule says the right thing and
 * nothing about what it selects — which is exactly how gh#306 shipped: the repair was correct,
 * in the file, and reached only ONE of the two full-bleed surfaces the library has.
 */
const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "../../../styles/table-layout.css"), "utf8");
const tokens = readFileSync(join(here, "../../../tokens/components/table.css"), "utf8");

/** The declaration block of the rule whose selector contains `anchor`. */
const ruleBlock = (anchor: string | RegExp): string => {
  const at = typeof anchor === "string" ? css.indexOf(anchor) : (anchor.exec(css)?.index ?? -1);
  expect(at, `rule not found for anchor: ${String(anchor)}`).toBeGreaterThan(-1);
  const open = css.indexOf("{", at);
  const close = css.indexOf("}", open);
  return css.slice(open + 1, close).trim();
};

const ERASE = /\[data-slot="card-content"\]\[data-flush\]\s*\n\s*:is\(/;
const RESTORE =
  /\[data-slot="card-header"\]:not\(\[data-banded\]\)\s*\+\s*\[data-slot="card-content"\]\[data-flush\]/;
const TOOLBAR_QUIET = /\.ui-data-table-root:has\(\.ui-data-table-toolbar\)/;

const rows = [
  { id: 1, name: "a" },
  { id: 2, name: "b" },
];
const columns = [{ key: "name" as const, header: "Name" }];

const dataTable = () => (
  <DataTable data={rows} getRowId={(row) => String(row.id)} columns={columns} />
);

const borderedTable = (testId: string) => (
  <Table bordered data-testid={testId}>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Qty</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>a</TableCell>
        <TableCell>1</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

const surfaceIn = (container: HTMLElement): HTMLElement => {
  const el = container.querySelector<HTMLElement>(".ui-data-table-surface");
  expect(el, "fixture renders a .ui-data-table-surface").not.toBeNull();
  return el!;
};

describe("bordered / full-bleed frame inside a flush CardContent (gh#305)", () => {
  it("suppresses the redundant frame on BOTH full-bleed surfaces, and only inside a flush body", () => {
    const selector = ruleSelector(css, ERASE);

    // The canonical composition: <Card><CardContent flush><DataTable/></CardContent></Card>.
    const canonical = renderWithUi(
      <Card>
        <CardHeader>
          <CardTitle>出荷伝票一覧</CardTitle>
        </CardHeader>
        <CardContent flush>{dataTable()}</CardContent>
      </Card>,
    );
    expect(surfaceIn(canonical.container).matches(selector)).toBe(true);

    // …and the bare `<Table bordered>` the original report was measured on.
    const bare = renderWithUi(
      <>
        <Card>
          <CardContent flush>{borderedTable("flush-table")}</CardContent>
        </Card>
        <Card>
          <CardContent>{borderedTable("padded-table")}</CardContent>
        </Card>
      </>,
    );
    expect(bare.getByTestId("flush-table").matches(selector)).toBe(true);
    // A bordered table NOT in a flush body keeps its full frame — nothing frames it there.
    expect(bare.getByTestId("padded-table").matches(selector)).toBe(false);

    // And a DataTable standing on a page, with no card around it, keeps its own frame.
    const loose = renderWithUi(dataTable());
    expect(surfaceIn(loose.container).matches(selector)).toBe(false);
  });

  it("erases widths only — it never repaints chrome (cardinal rule #44)", () => {
    const block = ruleBlock(ERASE);
    expect(block).toMatch(/border-width:\s*0/);
    // The shape that caused gh#306: `border: 0` followed by a hard-coded repaint of one edge.
    // Style and colour must stay with the surface's own border declaration, so this block may
    // not name a width, a style or a colour of its own.
    expect(block).not.toMatch(/solid|hsl|var\(--(?!table-flush-divider)/);
    expect(block).not.toMatch(/\dpx/);
  });
});

describe("the flush body's block-start divider survives (gh#306)", () => {
  it("is restored on BOTH full-bleed surfaces when a plain CardHeader sits above them", () => {
    const selector = ruleSelector(css, RESTORE);

    const canonical = renderWithUi(
      <Card>
        <CardHeader>
          <CardTitle>出荷伝票一覧</CardTitle>
        </CardHeader>
        <CardContent flush>{dataTable()}</CardContent>
      </Card>,
    );
    expect(surfaceIn(canonical.container).matches(selector)).toBe(true);

    const bare = renderWithUi(
      <Card>
        <CardHeader>
          <CardTitle>社長リマインダー</CardTitle>
        </CardHeader>
        <CardContent flush>{borderedTable("flush-table")}</CardContent>
      </Card>,
    );
    expect(bare.getByTestId("flush-table").matches(selector)).toBe(true);
  });

  it("stays away from every edge the card already draws a line on", () => {
    const selector = ruleSelector(css, RESTORE);

    // No header at all — the body's top edge IS the card frame, so a divider doubles it.
    const headerless = renderWithUi(
      <Card>
        <CardContent flush>{dataTable()}</CardContent>
      </Card>,
    );
    expect(surfaceIn(headerless.container).matches(selector)).toBe(false);

    // A BANDED header already carries its own border-bottom.
    const banded = renderWithUi(
      <Card>
        <CardHeader banded>
          <CardTitle>出荷伝票一覧</CardTitle>
        </CardHeader>
        <CardContent flush>{dataTable()}</CardContent>
      </Card>,
    );
    expect(surfaceIn(banded.container).matches(selector)).toBe(false);

    // A CardBar between the header and the body carries its own border-block.
    const barred = renderWithUi(
      <Card>
        <CardHeader>
          <CardTitle>出荷伝票一覧</CardTitle>
        </CardHeader>
        <CardBar>filters</CardBar>
        <CardContent flush>{dataTable()}</CardContent>
      </Card>,
    );
    expect(surfaceIn(barred.container).matches(selector)).toBe(false);
  });

  it("is quieted by the DataTable toolbar, which draws that line itself", () => {
    const selector = ruleSelector(css, TOOLBAR_QUIET);
    const withToolbar = renderWithUi(
      <Card>
        <CardHeader>
          <CardTitle>出荷伝票一覧</CardTitle>
        </CardHeader>
        <CardContent flush>
          <DataTable data={rows} getRowId={(row) => String(row.id)} columns={columns}>
            <DataTable.Toolbar>
              <DataTable.Search />
            </DataTable.Toolbar>
          </DataTable>
        </CardContent>
      </Card>,
    );
    const root = withToolbar.container.querySelector<HTMLElement>(".ui-data-table-root");
    expect(root, "fixture renders a .ui-data-table-root").not.toBeNull();
    expect(root!.matches(selector)).toBe(true);
    expect(ruleBlock(TOOLBAR_QUIET)).toMatch(/--table-flush-divider-width:\s*0/);

    // Without a toolbar the same root must NOT quiet the divider.
    const plain = renderWithUi(
      <Card>
        <CardHeader>
          <CardTitle>出荷伝票一覧</CardTitle>
        </CardHeader>
        <CardContent flush>{dataTable()}</CardContent>
      </Card>,
    );
    expect(
      plain.container.querySelector<HTMLElement>(".ui-data-table-root")!.matches(selector),
    ).toBe(false);
  });

  it("covers the SkeletonTable too, so the loading→loaded swap does not move a hairline", () => {
    // alert-layout.css frames `.ui-skeleton-table` to mirror `.ui-data-table-surface` exactly.
    // Give the surface a divider and not the skeleton and a 1px line appears the instant the
    // data lands — the regression class this whole file exists to stop.
    expect(ruleSelector(css, ERASE)).toContain(".ui-skeleton-table");
    expect(ruleSelector(css, RESTORE)).toContain(".ui-skeleton-table");
  });

  it("takes its width from a declared token, not a literal (cardinal rules #44/#45)", () => {
    expect(ruleBlock(RESTORE)).toBe("border-block-start-width: var(--table-flush-divider-width);");
    expect(tokens).toMatch(/--table-flush-divider-width:\s*var\(--table-row-border-width\);/);
  });
});

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable } from "../data-table";
import { ruleSelector } from "@/test/css-selector";

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

const tableCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../styles/table-layout.css"),
  "utf8",
);

/**
 * The ANCESTOR half of the shipped centring rule — the part that decides which header cell the
 * rule reaches — taken out of the stylesheet rather than retyped. `data-align` says what the
 * table promised; this says the promise and the paint still land on the same node.
 */
const centredHeaderSelector = ruleSelector(
  tableCss,
  /\.text-center > \.ui-data-table-sort-button > \.ui-data-table-sort-label \{/,
).split(" > ")[0];

describe("DataTable headerAlign", () => {
  it("centres the heading while the rows stay where they were", () => {
    render(
      <DataTable
        data={rows}
        getRowId={(row) => String(row.id)}
        columns={[{ key: "subject", header: "Subject", headerAlign: "center" }]}
      />,
    );

    const heading = screen.getByRole("columnheader", { name: "Subject" });
    expect(heading).toHaveAttribute("data-align", "center");
    // …and the shipped centring rule really selects that heading.
    expect(heading.matches(centredHeaderSelector)).toBe(true);
    // The row keeps its start alignment — it asked for none, so it carries no align attribute.
    expect(screen.getByRole("cell", { name: rows[0].subject })).not.toHaveAttribute("data-align");
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

    expect(screen.getByRole("columnheader", { name: "Subject" })).toHaveAttribute(
      "data-align",
      "center",
    );
  });

  it("lets headerAlign override align rather than merging with it", () => {
    render(
      <DataTable
        data={rows}
        getRowId={(row) => String(row.id)}
        columns={[{ key: "subject", header: "Subject", align: "center", headerAlign: "right" }]}
      />,
    );

    const heading = screen.getByRole("columnheader", { name: "Subject" });

    // One value, not two: `headerAlign` REPLACES `align` on the heading rather than merging with
    // it, which a single-valued attribute states outright.
    expect(heading).toHaveAttribute("data-align", "right");
    // …while the body cell still follows `align`.
    expect(screen.getByRole("cell", { name: rows[0].subject })).toHaveAttribute(
      "data-align",
      "center",
    );
  });

  /* The assertions above all read class names, and a class name is only half
   * the mechanism — jsdom applies no stylesheet, so a centred heading whose
   * words sit 8px left of the column still passes every one of them. That was
   * the actual bug. These read the CSS. */
  describe("how the centred label is actually centred", () => {
    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../../styles/table-layout.css"),
      "utf8",
    );
    /* Each selector's own block, and nothing after it. Slicing to the end of
     * the file instead was the first version of this helper, and it made the
     * out-of-flow assertion vacuous: `.ui-data-table-scroll::after` further
     * down also says `position: absolute`, so the test stayed green with the
     * chevron put back in flow. Caught by mutating it, not by reading it. */
    const block = (selector: string): string => {
      const start = css.indexOf(selector);
      expect(start, `no rule for ${selector}`).toBeGreaterThan(-1);
      const open = css.indexOf("{", start);
      return css.slice(open + 1, css.indexOf("}", open));
    };

    const centredLabel = block(
      ".text-center > .ui-data-table-sort-button > .ui-data-table-sort-label",
    );

    it("reserves the chevron's width on both sides of the label", () => {
      // `padding-inline` and not `padding-inline-end`: the words are centred by
      // the label box being symmetric, so a one-sided reservation centres the
      // wrong thing.
      expect(centredLabel).toMatch(
        /padding-inline:\s*calc\(0\.75rem \+ var\(--space-inline-xs\)\)/,
      );
      expect(centredLabel.slice(0, 400)).not.toMatch(/padding-inline-(start|end):/);
    });

    it("takes the chevron out of flow so it cannot displace the words", () => {
      const indicator = block("> :last-child");

      expect(indicator).toMatch(/position:\s*absolute/);
      // Logical, so RTL moves it to the side its padding also moved to.
      expect(indicator).toMatch(/inset-inline-end:\s*0/);
      expect(indicator).not.toMatch(/\bright:\s/);
    });

    it("aims that rule at an element the rendered label actually has", () => {
      /* The assertions above prove the CSS says the right thing. They cannot
       * prove it SELECTS anything, and that is where this went wrong once:
       * the rule read `> :not(:first-child)`, which is correct-looking and
       * matched nothing. A string header renders as a text node, `:first-child`
       * counts only elements, so the chevron was itself the first element child
       * and the negation excluded the one node it was written for. The stylesheet
       * contained the fix; the DOM never saw it, and the words stayed 8px off.
       *
       * So: take the selector out of the CSS and run it against a real render. */
      const { container } = render(
        <DataTable
          data={rows}
          getRowId={(row) => String(row.id)}
          columns={[{ key: "subject", header: "Subject", headerAlign: "center", sortable: true }]}
          sort={{ key: "subject", direction: "asc" }}
          onSortChange={() => {}}
        />,
      );

      const label = container.querySelector(
        ".ui-data-table-sort-button > .ui-data-table-sort-label",
      );
      expect(label, "a sortable centred header renders the label").not.toBeNull();

      // The chevron: the label's last element child, whatever the header was.
      const chevron = label!.lastElementChild;
      expect(chevron, "the label renders a sort indicator").not.toBeNull();

      // The exact selector tail the stylesheet uses to reach it.
      const tail = /> \.ui-data-table-sort-label\s*>\s*([^{\s]+)\s*\{/.exec(css);
      expect(tail, "found the indicator rule in the CSS").not.toBeNull();

      expect(
        chevron!.matches(tail![1]),
        `stylesheet selects "${tail![1]}" but the chevron does not match it`,
      ).toBe(true);
    });

    it("no longer counterweights the chevron with a flex sibling", () => {
      // The first attempt. It balanced the label only while the column had room
      // to spare — flex items shrink — so it read as fixed on the wide columns
      // and stayed 8px off on the narrow ones.
      expect(css).not.toMatch(/\.ui-data-table-sort-button::before/);
    });
  });
});

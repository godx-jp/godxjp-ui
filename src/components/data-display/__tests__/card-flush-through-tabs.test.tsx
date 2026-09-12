import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { ruleSelectors } from "@/test/css-selector";

import { Card, CardContent } from "../card";
import { DataTable } from "../data-table";
import { Tabs } from "../../navigation/tabs";

/**
 * `CardContent flush` means "this body touches the card's edge". gh#554: it stopped one link short
 * of the table whenever the most common detail-screen shape — a `Tabs` — sat in between.
 *
 * Measured at 1280px on `Card > CardContent flush > Tabs > tabs-panel > DataTable`: every link in
 * the ancestor chain was at inline padding 0 (surface, scroller, root, tabs, content, card) and the
 * ONE link in the middle held 16px, insetting the table by 32px of card width.
 *
 * Tested through `ruleSelectors` + `.matches()` against real DOM rather than by string-matching the
 * stylesheet, per src/test/css-selector.ts: a string match proves a rule SAYS the right thing and
 * nothing about what it SELECTS. That distinction is the whole of this bug — the package already
 * had a flush exception for `.ui-data-table-scroll`, and it was correct, and it did not reach.
 */
const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "../../../styles/card-layout.css"), "utf8");

const FLUSH_PANEL = /\[data-slot="card-content"\]\[data-flush\] \[data-slot="tabs-panel"\]/;
const PANEL_INSET = /\[data-slot="card"\] \[data-slot="tabs-panel"\]/;

const rows = [
  { id: 1, name: "a" },
  { id: 2, name: "b" },
];

function screen(flush: boolean) {
  return renderWithUi(
    <Card>
      <CardContent flush={flush || undefined}>
        {/* The `items` API, because that is the one that emits `data-slot="tabs-panel"` — a bare
            <TabsContent> does not, and a test built on it would assert against an element the
            shipped rule never sees. */}
        <Tabs
          defaultValue="one"
          items={[
            {
              value: "one",
              label: "One",
              content: (
                <DataTable
                  data={rows}
                  getRowId={(row) => String(row.id)}
                  columns={[{ key: "name" as const, header: "Name" }]}
                />
              ),
            },
          ]}
        />
      </CardContent>
    </Card>,
  ).container;
}

const panelOf = (container: HTMLElement) => {
  const panel = container.querySelector<HTMLElement>('[data-slot="tabs-panel"]');
  expect(panel, "no tabs panel rendered").not.toBeNull();
  return panel!;
};

describe("flush reaches through a tab panel (gh#554)", () => {
  it("the flush rule actually MATCHES the panel — not just exists in the file", () => {
    const panel = panelOf(screen(true));
    const selectors = ruleSelectors(css, FLUSH_PANEL);

    expect(selectors.some((selector) => panel.matches(selector))).toBe(true);
  });

  it("and it OUT-SPECIFIES the rule that puts the inset back", () => {
    // Both rules match the same element, so order and specificity decide. The flush rule carries
    // one more attribute selector and comes later; if either changed, the inset would win again
    // and the bug would be back with the fix still sitting in the file.
    const panel = panelOf(screen(true));
    const inset = ruleSelectors(css, PANEL_INSET);
    const flush = ruleSelectors(css, FLUSH_PANEL);

    expect(inset.some((selector) => panel.matches(selector))).toBe(true);
    expect(css.indexOf(flush[0]!)).toBeGreaterThan(css.indexOf(inset[0]!));
  });

  it("a NON-flush card keeps its panel inset — prose in a tab still reads correctly", () => {
    const panel = panelOf(screen(false));
    const flush = ruleSelectors(css, FLUSH_PANEL);

    expect(flush.some((selector) => panel.matches(selector))).toBe(false);
  });

  it("only the inline axis is released — the table keeps its gap under the tab list", () => {
    const open = css.indexOf("{", css.search(FLUSH_PANEL));
    const block = css.slice(open + 1, css.indexOf("}", open));

    expect(block).toMatch(/padding-inline:\s*0/);
    expect(block).not.toMatch(/padding-block|padding-top|padding:/);
  });
});

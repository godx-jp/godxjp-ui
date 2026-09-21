import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { ruleSelector } from "@/test/css-selector";
import { Pagination } from "../pagination";

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, rel), "utf8");
const layoutCss = read("../../../styles/layout.css");
const navCss = read("../../../styles/navigation-layout.css");
const navTokens = read("../../../tokens/components/navigation.css");

const ruleBody = (css: string, anchor: string) => {
  const at = css.indexOf(anchor);
  expect(at, `missing rule ${anchor}`).toBeGreaterThan(-1);
  return css.slice(css.indexOf("{", at), css.indexOf("}", at) + 1);
};

/**
 * gh#705 — antd `showTotal` sits BESIDE the page buttons. The base `.ui-pagination-total` parked it
 * at the inline-start edge with `margin-inline-end: auto`, whatever `align` said.
 *
 * jsdom performs no layout, so the geometry is browser evidence (Chromium 1440, preview
 * `navigation-pagination`, align="end"): total inline-end → first control, LTR and RTL alike,
 *   before  628.7 – 1187.8px (the whole free row between them)
 *   after   8px (= --pagination-gap)
 * What this file pins is the CONTRACT that produced it, plus the DOM order jsdom does settle.
 */
describe("Pagination total placement (gh#705)", () => {
  it("an end-aligned bar drops the auto margin, so the total sits beside the buttons", () => {
    const selector = ruleSelector(
      navCss,
      '.ui-pagination[data-align="end"] > .ui-pagination-total',
    );
    expect(selector).toBe('.ui-pagination[data-align="end"] > .ui-pagination-total');
    expect(ruleBody(navCss, selector)).toMatch(/margin-inline-end:\s*0;/);
  });

  it("start / center keep the base layout (total pushed to the inline start)", () => {
    expect(ruleBody(layoutCss, ".ui-pagination-total {")).toMatch(/margin-inline-end:\s*auto;/);
    expect(navCss).not.toMatch(/data-align="(start|center)"\][^{]*\.ui-pagination-total/);
  });

  it("renders the total immediately before the page list, in DOM (= inline) order", () => {
    const { container } = renderWithUi(
      <Pagination value={1} total={95} pageSize={10} showTotal align="end" />,
    );
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("data-align", "end");
    const total = container.querySelector(".ui-pagination-total") as HTMLElement;
    expect(total.parentElement).toBe(nav);
    expect(total.nextElementSibling).toHaveClass("ui-pagination-list");
  });

  it("size=sm reads the density-scoped --control-height-sm step unless the knob is themed", () => {
    expect(navTokens).toMatch(/--pagination-control-height-sm:\s*initial;/);
    expect(ruleBody(navCss, '.ui-pagination[data-size="sm"] {')).toMatch(
      /--control-height:\s*var\(\s*--pagination-control-height-sm,\s*var\(\s*--control-height-sm\)\);/,
    );
  });
});

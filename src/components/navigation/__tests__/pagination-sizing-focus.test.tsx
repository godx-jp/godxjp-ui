import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { ruleSelector } from "@/test/css-selector";
import { Pagination } from "../pagination";
import { buildPageRange } from "../pagination-utils";

const here = dirname(fileURLToPath(import.meta.url));
const layoutCss = readFileSync(join(here, "../../../styles/layout.css"), "utf8");
// The ring itself moved OUT of layout.css into the single-source stylesheet: every
// :focus-visible ring in the system is drawn by one rule reading four tokens, so a
// service retunes them once instead of per component. Pagination is a member of that
// rule's selector list rather than carrying a hand-written copy.
const focusRingCss = readFileSync(join(here, "../../../styles/focus-ring.css"), "utf8");

/**
 * Three defects reported from a consumer list of 21,185 rows (1,060 pages), 2026-08-24:
 * page numbers spilling out of their button, a browser-blue focus ring on a teal theme, and a
 * four-control strip (`1 2 … 1043`) with a wide dead gap.
 *
 * jsdom performs NO layout, so `scrollWidth`/`clientWidth` both read 0 here and an overflow
 * assertion would pass vacuously (same reasoning as list-row-responsive.test.tsx). The geometry
 * below was therefore measured in real Chrome against the shipped stylesheet, and what these tests
 * pin is the CONTRACT that produced it: the sizing rule, the ring rule, and — the part jsdom does
 * settle honestly — how many controls the strip renders.
 *
 *   label        before (fixed square)          after (min-width + padding)
 *   "1"          32 x 32                        32 x 32   (still square)
 *   "42"         32 x 32                        32 x 32   (still square)
 *   "1043"       32 x 32, text 29.7 in 30       39.7 x 32
 *   "12345678"   32 x 32, CLIPPED (45 > 30)     69.3 x 32
 *   focus        outline rgb(0,95,204) auto 1px box-shadow 0 0 0 2px hsl(var(--ring))
 */
describe("正常系: ページボタンの寸法 (gh consumer 2026-08-24)", () => {
  // A rigid `width` is what clipped long page numbers. The rule must size from a FLOOR
  // (min-width) plus padding so the box grows with the label instead of cropping it.
  it("ページボタンは固定幅ではなく min-width + 左右パディングで伸びる", () => {
    const rule = layoutCss.slice(
      layoutCss.indexOf(".ui-pagination-link {"),
      layoutCss.indexOf("}", layoutCss.indexOf(".ui-pagination-link {")),
    );

    expect(rule).toContain("min-width: var(--control-height)");
    expect(rule).toContain("padding-inline: var(--pagination-page-padding-x)");
    expect(rule).toContain("height: var(--control-height)");
    // The old fixed width must be gone — `min-width:` above would otherwise be dead weight.
    expect(rule).not.toMatch(/^\s*width:/m);
  });

  // The selector has to actually reach a rendered page button; a rule that reads correctly and
  // selects nothing is the failure mode css-selector.ts exists to catch.
  it("寸法ルールのセレクタが実際のページボタンに一致する", () => {
    const selector = ruleSelector(layoutCss, ".ui-pagination-link {");
    renderWithUi(<Pagination value={1} total={21185} pageSize={20} onValueChange={() => {}} />);

    // Selected by visible text, not accessible name — the label is localized.
    const page = screen.getAllByRole("button").find((b) => (b.textContent ?? "").trim() === "1060");
    expect(page, "last-page button missing").toBeDefined();
    expect(page!.matches(selector)).toBe(true);
  });

  // Height and rhythm must NOT move — only the horizontal axis was allowed to change.
  it("高さのトークンは据え置きでリズムが崩れない", () => {
    const rule = layoutCss.slice(
      layoutCss.indexOf(".ui-pagination-link {"),
      layoutCss.indexOf("}", layoutCss.indexOf(".ui-pagination-link {")),
    );

    expect(rule).toContain("height: var(--control-height)");
  });
});

describe("正常系: キーボードフォーカスの輪郭", () => {
  // Without an explicit rule the browser paints its own ring (measured rgb(0,95,204)) which
  // belongs to no theme. The ring must come from the same tokens as .ui-button.
  it("フォーカスリングはブラウザ既定ではなくデザインシステムのトークンを使う", () => {
    const start = focusRingCss.indexOf(".ui-focus-ring,");
    expect(start, "shadow-form ring rule missing").toBeGreaterThan(-1);
    const rule = focusRingCss.slice(start, focusRingCss.indexOf("}", start));

    expect(rule).toContain(".ui-pagination-link");
    expect(rule).toContain("outline: none");
    expect(rule).toContain("var(--focus-ring-width)");
    expect(rule).toContain("var(--focus-ring-color, var(--ring))");

    // …and nothing paints a competing ring back in layout.css.
    expect(layoutCss).not.toMatch(/\.ui-pagination-link:focus-visible[^}]*box-shadow/);
  });

  it("フォーカスルールのセレクタがページボタンに一致する", () => {
    const selector = ruleSelector(focusRingCss, ".ui-focus-ring,", ".ui-pagination-link");
    renderWithUi(<Pagination value={1} total={21185} pageSize={20} onValueChange={() => {}} />);

    // `.matches()` on a :focus-visible selector needs the element focused — jsdom resolves the
    // pseudo-class against the real active element.
    const page = screen.getAllByRole("button").find((b) => (b.textContent ?? "").trim() === "2");
    expect(page, "page-2 button missing").toBeDefined();
    page!.focus();
    expect(page!.matches(selector)).toBe(true);
  });
});

describe("正常系: ページ番号の並び (件数一定)", () => {
  // The window used to collapse against the edges: 1,060 pages opened as `1 2 … 1060`, four
  // controls with a dead gap. Ant Design / MUI clamp the window instead, so the strip keeps its
  // width wherever the current page sits.
  it("先頭・中央・末尾のどこでも表示件数が変わらない", () => {
    const first = buildPageRange(1, 1060);
    const middle = buildPageRange(500, 1060);
    const last = buildPageRange(1060, 1060);

    expect(first).toEqual([1, 2, 3, 4, 5, "ellipsis", 1060]);
    expect(middle).toEqual([1, "ellipsis", 499, 500, 501, "ellipsis", 1060]);
    expect(last).toEqual([1, "ellipsis", 1056, 1057, 1058, 1059, 1060]);
    expect(new Set([first.length, middle.length, last.length])).toEqual(new Set([7]));
  });

  // The rendered strip must carry that same number of page controls (prev/next excluded).
  it("1,060 ページの一覧でもページボタンが 6 個描画される", () => {
    renderWithUi(<Pagination value={1} total={21185} pageSize={20} onValueChange={() => {}} />);

    const numbered = screen
      .getAllByRole("button")
      .filter((b) => /^\d+$/.test((b.textContent ?? "").trim()));

    expect(numbered.map((b) => b.textContent?.trim())).toEqual(["1", "2", "3", "4", "5", "1060"]);
  });

  // A one-page gap is spelled out rather than hidden behind an ellipsis — hiding a single page
  // would both waste a slot and break the constant count.
  it("省略記号が 1 ページだけを隠す場合はその番号を表示する", () => {
    expect(buildPageRange(4, 20)).toEqual([1, 2, 3, 4, 5, "ellipsis", 20]);
  });
});

describe("異常系: 端の値", () => {
  // Guards the clamp itself: out-of-range and degenerate totals must not produce a shorter or
  // malformed strip.
  it("ページ数が窓より少ないときは全ページを並べる", () => {
    expect(buildPageRange(2, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(buildPageRange(1, 1)).toEqual([1]);
    expect(buildPageRange(1, 0)).toEqual([]);
  });
});

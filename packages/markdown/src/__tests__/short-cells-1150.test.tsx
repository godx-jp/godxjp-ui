import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Markdown } from "../markdown";

/** gh#1150 — which table cells are a single short token, stamped `data-short` for `Prose`. */
const cells = (markdown: string, props: { shortCellLength?: number | false } = {}) => {
  const html = renderToStaticMarkup(<Markdown {...props}>{markdown}</Markdown>);
  return [...html.matchAll(/<(td|th)([^>]*)>([\s\S]*?)<\/\1>/g)].map(([, , attrs, inner]) => ({
    text: inner!.replace(/<[^>]+>/g, ""),
    short: attrs!.includes("data-short"),
  }));
};
const row = (...values: string[]) =>
  `| ${values.map((_, i) => `h${i}`).join(" | ")} |\n|${" --- |".repeat(values.length)}\n| ${values.join(" | ")} |`;

describe("short table cells (gh#1150)", () => {
  it("stamps a single short token — CJK, an id, a date, inline code — and not a sentence", () => {
    const body = cells(row("優先度", "GXS-123", "2026-10-05", "`F02`", "a longer sentence here"));
    const byText = Object.fromEntries(body.slice(5).map((c) => [c.text, c.short]));
    expect(byText).toEqual({
      優先度: true,
      "GXS-123": true,
      "2026-10-05": true,
      F02: true,
      "a longer sentence here": false,
    });
  });

  it("holds at 24 characters by default and stops at 25", () => {
    const [, , at, over] = cells(row("x".repeat(24), "y".repeat(25)));
    expect(at).toEqual({ text: "x".repeat(24), short: true });
    expect(over).toEqual({ text: "y".repeat(25), short: false });
  });

  it("counts user-perceived characters, so one family emoji is one", () => {
    const family = "👨‍👩‍👧";
    const [, cell] = cells(row(family + "x".repeat(23)));
    expect(cell!.short).toBe(true);
  });

  it("skips an empty cell and a cell holding an image", () => {
    const [, , empty, image] = cells(row(" ", "![a](https://example.com/a.png)"));
    expect(empty!.short).toBe(false);
    expect(image!.short).toBe(false);
  });

  it("takes a host threshold, and `false` stamps nothing", () => {
    expect(cells(row("abcdef"), { shortCellLength: 5 })[1]!.short).toBe(false);
    expect(cells(row("abcde"), { shortCellLength: 5 })[1]!.short).toBe(true);
    expect(cells(row("優先度"), { shortCellLength: false }).some((c) => c.short)).toBe(false);
  });
});

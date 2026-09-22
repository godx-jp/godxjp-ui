import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * ATTACHMENTS SHIPPED WITH NO STYLESHEET AT ALL (gh#855).
 *
 * Measured from `/isolate/data-entry-attachments` at 28.10.0, in Chromium:
 *
 *     slot classes the component emits                15
 *     slot classes with any CSS rule                    1
 *     that rule       `.ui-attachments-input { min-block-size: var(--touch-target-min) }`
 *     `--attachments-*` tokens declared                12
 *     `--attachments-*` tokens read by anything         0
 *     `.ui-attachments-list`   computed display      block
 *     `.ui-attachments-card`   computed display      list-item
 *     raw `<input type="file">` painted          9 x 265x24
 *
 * The one rule that existed targeted the raw file input, which was visible. Every other slot fell
 * through to the browser's defaults, so the page rendered as raw HTML because it WAS raw HTML,
 * and twelve tokens resolved, were generated into the MCP catalog and were described to every
 * consumer while being read by nothing.
 *
 * A CSS-TEXT TEST, deliberately: jsdom performs no layout, so nothing rendered in a unit test can
 * reproduce `display: list-item`. What it CAN hold is the thing whose absence WAS the defect —
 * that each emitted slot has a rule, and that each declared knob has a reader. The browser half of
 * the evidence is the isolate frame and `check:frame-overflow --only attachments`; the DOM half is
 * `src/components/data-entry/__tests__/attachments-slots-855.test.tsx`.
 */
describe("Attachments stylesheet — every slot has a rule, every knob has a reader", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/data-entry-layout.css"), "utf8");
  const tokens = readFileSync(
    resolve(process.cwd(), "src/tokens/components/attachments.css"),
    "utf8",
  );
  const tsx = readFileSync(
    resolve(process.cwd(), "src/components/data-entry/attachments.tsx"),
    "utf8",
  );

  /** Rule bodies for an exact selector, ignoring anything that merely contains it. */
  const ruleBodies = (selector: string) =>
    [
      ...css.matchAll(
        new RegExp(
          `\\n\\s*${selector.replace(/[.:*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`,
          "g",
        ),
      ),
    ].map((m) => m[1]);

  /** Every `ui-attachments…` class name the component actually puts in the DOM. */
  const emitted = [...new Set([...tsx.matchAll(/ui-attachments[a-z-]*/g)].map((m) => m[0]))].sort();

  /** Every `--attachments-…` custom property the tier file declares. */
  const declared = [
    ...new Set([...tokens.matchAll(/^\s*(--attachments-[a-z-]+):/gm)].map((m) => m[1])),
  ].sort();

  it("emits the slots it is documented to emit, and none of them is orphaned", () => {
    // `-input` is the one class with no rule of its own BY DESIGN: it is hidden by the shared
    // `sr-only` utility, which is Upload's mechanism and is deliberately not re-derived here.
    const withoutRule = emitted.filter(
      (cls) => cls !== "ui-attachments-input" && !new RegExp(`\\.${cls}[\\s,:\\[>]`).test(css),
    );
    expect(withoutRule).toEqual([]);
    expect(emitted.length).toBeGreaterThanOrEqual(15);
  });

  it("reads all twelve knobs the tier file declares — a token with no reader is the defect again", () => {
    // `var(` may be broken across lines by the formatter, so compare against a compacted copy.
    const compact = css.replace(/var\(\s+/g, "var(");
    const unread = declared.filter((token) => !compact.includes(`var(${token}`));
    expect(unread).toEqual([]);
    expect(declared.length).toBeGreaterThanOrEqual(12);
  });

  it("gives the list a flex row with no list marker — it computed `display: block`", () => {
    const [list] = ruleBodies(".ui-attachments-list");
    expect(list).toMatch(/display:\s*flex/);
    expect(list).toMatch(/list-style:\s*none/);
    expect(list).toMatch(/gap:\s*var\(--attachments-gap\)/);
  });

  it("gives the card a real box — it computed `display: list-item` at the full container width", () => {
    const [card] = ruleBodies(".ui-attachments-card");
    expect(card).toMatch(/display:\s*flex/);
    expect(card).toMatch(/inline-size:\s*var\(--attachments-card-size\)/);
    expect(card).toMatch(/block-size:\s*var\(--attachments-card-block-size\)/);
    expect(card).toMatch(/border-radius:\s*var\(--attachments-card-radius\)/);
    // Ant X pins 268px flat; a ceiling is what keeps a 320px frame from spilling.
    expect(card).toMatch(/max-inline-size:\s*100%/);
  });

  it("drops gh#643's floor on the file input instead of keeping a rule for a control nobody sees", () => {
    expect(ruleBodies(".ui-attachments-input")).toEqual([]);
    expect(css).not.toMatch(/\.ui-attachments-input\s*\{[^}]*min-block-size/);
  });

  it("resolves the drop scrim's role at the CALL SITE, so a scoped dark theme reaches it", () => {
    // docs/TOKENS.md — a role-mirror knob is `initial` at :root and carries its default as a
    // `var()` fallback where it is painted, never as a `:root` binding that freezes.
    expect(tokens).toMatch(/--attachments-drop-overlay-background:\s*initial/);
    const [layer] = ruleBodies(".ui-attachments-drop-layer");
    expect(layer).toMatch(/var\(\s*--attachments-drop-overlay-background,/);
    expect(layer).toMatch(/pointer-events:\s*none/);
  });

  it("keeps every offset logical, so the tray flips whole under dir=rtl", () => {
    const section = css.slice(css.indexOf(".ui-attachments"), css.indexOf(".ui-combobox-content"));
    expect(section).not.toMatch(/(?:^|[\s;{])(?:margin|padding|inset|border)-(?:left|right)\s*:/m);
    expect(section).not.toMatch(/(?:^|[\s;{])(?:left|right)\s*:/m);
  });

  it("puts none of it behind a media or container query", () => {
    for (const selector of [".ui-attachments-list {", ".ui-attachments-card {"]) {
      const index = css.indexOf(selector);
      expect(index).toBeGreaterThan(-1);
      const before = css.slice(0, index);
      const depth = (before.match(/\{/g) ?? []).length - (before.match(/\}/g) ?? []).length;
      // Depth 1 is the `@layer components` wrapper every rule in this file lives in.
      expect(depth).toBe(1);
    }
  });
});

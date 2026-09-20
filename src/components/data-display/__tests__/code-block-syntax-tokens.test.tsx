import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { anchorIndex } from "@/test/css-selector";
import { CodeBlock } from "../code-block";

/**
 * SYNTAX COLOURS FOR CodeBlock (gh#784).
 *
 * The defect was not "no syntax palette" — that would be a feature request. It was that the
 * package's own prop docs told a consumer to bring a highlighter and pass its spans, while the
 * consumer rules closed every route those spans could take colour from: `style` and `className`
 * are both visual overrides, and an app stylesheet may declare no custom properties. The
 * documented path was unbuildable.
 *
 * So two halves have to hold together, and either alone is useless:
 *   1. twelve knobs, named for Shiki's `createCssVariablesTheme` so mapping is a rename;
 *   2. package-owned CSS keyed on `data-code-token`, so the consumer never writes a colour.
 */
const tokens = readFileSync(join(process.cwd(), "src/tokens/components/data-display.css"), "utf8");
const layout = readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");

/** Shiki's `createCssVariablesTheme` vocabulary, verbatim. */
const SHIKI = [
  "comment",
  "keyword",
  "string",
  "string-expression",
  "function",
  "constant",
  "parameter",
  "punctuation",
  "link",
  "inserted",
  "deleted",
] as const;

describe("CodeBlock syntax tokens (gh#784)", () => {
  it("declares a knob for every name Shiki emits, plus the foreground", () => {
    // Eleven `token-*` plus `foreground` is the whole of createCssVariablesTheme's output. A
    // shorter list would force a consumer to write a translation layer, which is the thing a
    // shared vocabulary exists to avoid.
    for (const name of SHIKI) {
      expect(tokens, `--code-block-token-${name}-color must exist`).toContain(
        `--code-block-token-${name}-color:`,
      );
    }
    expect(tokens).toContain("--code-block-foreground:");
  });

  it("keeps every colour knob a role-mirror, so the theme is not frozen at :root", () => {
    // docs/TOKENS.md: a knob defaulting to a role AT :root freezes that role's light value.
    // `initial` + a call-site fallback re-resolves live, which is what makes dark mode work
    // without a second palette in this file.
    for (const name of SHIKI) {
      expect(tokens).toMatch(new RegExp(`--code-block-token-${name}-color:\\s*initial;`));
    }
    expect(tokens).toMatch(/--code-block-foreground:\s*initial;/);
  });

  it("puts each role default at the CALL SITE, where it can re-resolve", () => {
    for (const name of SHIKI) {
      expect(layout, `${name} needs its role default in the rule`).toMatch(
        new RegExp(`var\\(\\s*--code-block-token-${name}-color,\\s*hsl\\(\\s*var\\(\\s*--`),
      );
    }
  });

  it("colours by a SEMANTIC attribute, never by a class or an inline style", () => {
    // This is the half that actually unblocks a consumer. `data-code-token` names what the token
    // IS; the package decides how it looks. A consumer writing `style` or a palette `className`
    // is exactly what their own audit forbids, which is how gh#784 arose.
    for (const name of SHIKI) {
      expect(layout).toContain(`[data-code-token="${name}"]`);
    }
  });

  it("reaches a highlighter's spans inside Prose's `pre` too, not only the component", () => {
    // Prose delegates its `pre` treatment to the same knobs (see the token block), so a rendered
    // markdown page gets the same colours as an explicit CodeBlock.
    const at = anchorIndex(layout, '.ui-prose pre [data-code-token="keyword"]');
    expect(at, "Prose's pre must share the syntax rules").toBeGreaterThan(-1);
  });

  it("renders a highlighter's spans as children, which is the documented path", () => {
    renderWithUi(
      <CodeBlock language="ts">
        <span data-code-token="keyword">const</span>
        <span> </span>
        <span data-code-token="parameter">x</span>
        <span data-code-token="punctuation">=</span>
        <span data-code-token="string">&quot;hi&quot;</span>
      </CodeBlock>,
    );
    const block = screen.getByText("const").closest("pre")!;
    expect(block).toHaveAttribute("data-language", "ts");
    expect(block.querySelectorAll("[data-code-token]")).toHaveLength(4);
    // Nothing the consumer wrote carries a colour: no style attribute, no palette class.
    for (const span of block.querySelectorAll("[data-code-token]")) {
      expect(span.getAttribute("style")).toBeNull();
      expect(span.className).toBe("");
    }
  });
});

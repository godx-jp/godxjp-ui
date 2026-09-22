import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// @ts-expect-error — a plain .mjs rule module, the same shape as component-token-rules.
import { commentText } from "../../../scripts/css-comment-text.mjs";

type Token = { name: string; value: string; description: string; tier?: string };

const root = join(import.meta.dirname, "../../..");
const read = (path: string) => readFileSync(join(root, path), "utf8");
const flatten = commentText as (comment: string) => string;

/**
 * THE DEFECT (gh#871): 938 of the 1974 descriptions in `agent/tokens.json` carried a stray `*`
 * mid-sentence — 4916 occurrences, ~14.7 kB — because both token parsers turned a comment into
 * prose with `.replace(/\s+/g, " ")` and nothing removed the per-line `*` a multi-line comment is
 * written with. Every continuation line's gutter marker survived as a WORD:
 *
 *   > … warm hue-60 neutral spine, GoDX violet `*` primary (identity v2.3) …
 *
 * This is the field an agent reads to decide whether a token is a knob it may set, and a `*` in the
 * middle of a clause is indistinguishable from emphasis markup, a footnote marker or a glob. Worse,
 * it meant no description in the file could be trusted to be the text that was written.
 */

/**
 * WHY NOT SIMPLY "NO DESCRIPTION MATCHES `/\s\*\s/`", which is what the report proposed.
 *
 * Measured: that assertion cannot reach 0, and demanding it would delete real prose. 20 of the 938
 * hits are MULTIPLICATION — `--font-size-lg`'s "= calc(base * ratio * ratio) — ratio² ≈ 17.6px",
 * `--attachments-card-block-size`'s "Ant X `cardHeight` = 14 * 1.5714 * 2 + 12 + 12 = 68",
 * `--tabs-indicator-inset`'s "`size: (origin) => origin - 2 * padding`". A gutter star and an
 * operator star are textually identical, so no rule over the description ALONE can separate them.
 *
 * The source can. An operator sits between its two operands ON ONE LINE; a gutter star is the line
 * break itself, so its left operand ends one line and its right operand begins the next, and NO
 * single source line ever contains the pair. That derivation is read from the stylesheets on every
 * run — it is not a hand-kept allowlist, which is the shape that went blind in gh#854.
 *
 * Revert-proof, measured: restore the naive collapse in `scripts/css-comment-text.mjs` and this
 * fails with 928 offending tokens (49 foundation · 29 semantic · 850 component).
 */
const TIER_FILES = [
  "src/tokens/foundation.css",
  "src/tokens/derived.css",
  ...globSync("src/tokens/semantic/*.css", { cwd: root }).sort(),
  ...globSync("src/tokens/components/*.css", { cwd: root }).sort(),
];

/** Every source line, gutter removed and whitespace collapsed — the width of one written line. */
const sourceLines = TIER_FILES.flatMap((file) =>
  read(file)
    .split("\n")
    .map((line) => line.replace(/^[ \t]*\*[ \t]?/, "").replace(/\s+/g, " ").trim()),
);

/** `<word> * <word>` pairs in a description that no single source line ever wrote. */
const gutterStars = (description: string) =>
  [...description.matchAll(/(\S+)\s\*\s(\S+)/g)]
    .map(([, left, right]) => `${left} * ${right}`)
    .filter((pair) => !sourceLines.some((line) => line.includes(pair)));

const offendersIn = (tokens: Token[]) =>
  tokens.flatMap((token) => gutterStars(token.description).map((pair) => `${token.name}: "${pair}"`));

describe("the published token catalog carries no CSS comment gutter (gh#871)", () => {
  const catalog = JSON.parse(read("agent/tokens.json")) as Token[];

  it("publishes 1974 descriptions and none of them leaks a gutter marker", () => {
    expect(catalog.length).toBeGreaterThan(0);
    expect(offendersIn(catalog)).toEqual([]);
  });

  for (const tier of ["foundation", "semantic", "component"]) {
    // PER TIER, so a fix to one read path cannot read as a fix to both. The defect lived in
    // scripts/component-token-rules.mjs (856 hits) AND scripts/theme-token-rules.mjs (82), and
    // "two of three is how a defect hides" is this repo's own repeated lesson (gh#841, gh#845).
    it(`leaks none in the ${tier} tier`, () => {
      const rows = catalog.filter((token) => token.tier === tier);
      expect(rows.length).toBeGreaterThan(0);
      expect(offendersIn(rows)).toEqual([]);
    });
  }

  it("holds for the MCP's own copy of the same text", () => {
    // mcp/src/data/component-tokens.generated.ts is what `get_component` serves and what
    // gen-agent-catalog reads back for the component tier — the same prose, a second artefact.
    const generated = read("mcp/src/data/component-tokens.generated.ts");
    const descriptions = [...generated.matchAll(/"description":\s*("(?:[^"\\]|\\.)*")/g)].map(
      (match) => JSON.parse(match[1]) as string,
    );
    expect(descriptions.length).toBeGreaterThan(0);
    expect(offendersIn(descriptions.map((description) => ({ name: "-", value: "", description })))).toEqual([]);
  });
});

describe("commentText keeps the prose it is not there to remove", () => {
  it("strips the gutter of a continuation line", () => {
    expect(flatten(" Color system — warm spine, GoDX violet\n * primary (identity v2.3).")).toBe(
      "Color system — warm spine, GoDX violet primary (identity v2.3).",
    );
  });

  it("leaves a single-line comment alone", () => {
    expect(flatten(" Badge component tokens. ")).toBe("Badge component tokens.");
  });

  it("leaves the first line alone when it carries no gutter", () => {
    expect(flatten(" 2 * 8px of padding\n * per side.")).toBe("2 * 8px of padding per side.");
  });

  it("takes the star of a `/**` opener, which belongs to the delimiter", () => {
    // src/tokens/components/flex.css is written that way, and the star was published as a word.
    expect(flatten("* Lightweight row surfaces and hover actions. ")).toBe(
      "Lightweight row surfaces and hover actions.",
    );
  });

  it("keeps `**bold**` and `*italic*` on a gutter line", () => {
    // segmented.css writes "   * **1.09:1**, against the 3:1 floor" and sheet.css " * *responsive*
    // contract" — `[ \t]?` consumes exactly ONE space after the gutter star, so both markers live.
    expect(flatten("Contrast is\n   * **1.09:1**, against the 3:1 floor.")).toBe(
      "Contrast is **1.09:1**, against the 3:1 floor.",
    );
    expect(flatten("The\n * *responsive* contract.")).toBe("The *responsive* contract.");
  });

  it("keeps a multiplication written on a gutter line", () => {
    expect(flatten("Ant X `cardHeight`\n * = 14 * 1.5714 * 2 + 12 + 12 = 68")).toBe(
      "Ant X `cardHeight` = 14 * 1.5714 * 2 + 12 + 12 = 68",
    );
  });
});

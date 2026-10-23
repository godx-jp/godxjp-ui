/**
 * `--font-family-tabular` — the opt-in FIGURES face for tabular numbers. Consumer report (TCG-M): the
 * brand sets prices in DM Sans beside a Noto Sans JP UI; `Text tabular` / numeric cells only switched
 * `font-variant-numeric`, so the only route to the figure face was a class on every price.
 * Unset, the declaration must INHERIT (a var() whose token is `initial` takes the fallback), so no
 * existing consumer's figures change face.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");
const DECL = "font-family: var(--font-family-tabular, inherit);";

describe("--font-family-tabular", () => {
  it("is declared `initial` in the foundation tier", () => {
    expect(read("../../../tokens/foundation.css")).toMatch(/--font-family-tabular: initial;/);
  });

  it("Text tabular reads it", () => {
    const rule =
      read("../../../styles/text-layout.css").match(
        /\[data-slot="text"\]\[data-tabular\]\s*\{([^}]*)\}/,
      )?.[1] ?? "";
    expect(rule).toContain("font-variant-numeric: tabular-nums;");
    expect(rule).toContain(DECL);
  });

  it("Badge tabular reads it", () => {
    const rule =
      read("../../../styles/badge-layout.css").match(
        /\[data-slot="badge"\]\[data-tabular\]\s*\{([^}]*)\}/,
      )?.[1] ?? "";
    expect(rule).toContain(DECL);
  });

  it("numeric TableHead / TableCell read it", () => {
    const rule =
      read("../../../styles/table-layout.css").match(
        /:is\(\[data-slot="table-head"\], \[data-slot="table-cell"\]\)\[data-numeric\]\s*\{([^}]*)\}/,
      )?.[1] ?? "";
    expect(rule).toContain(DECL);
  });

  it("Text mono still wins over the figures face (declared after it)", () => {
    const css = read("../../../styles/text-layout.css");
    expect(css.indexOf('[data-slot="text"][data-mono] {')).toBeGreaterThan(
      css.indexOf('[data-slot="text"][data-tabular] {'),
    );
  });
});

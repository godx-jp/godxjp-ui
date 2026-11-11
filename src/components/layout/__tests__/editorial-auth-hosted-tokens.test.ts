/**
 * The three EditorialAuth hosted-flow knobs: declared `initial` (so nothing moves until a theme
 * sets them) and read at the call site with the historical value as the fallback.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");
const tokens = read("../../../tokens/components/editorial-account.css");
const layout = read("../../../styles/editorial-account-layout.css");
const rule = (selector: string) => {
  const start = layout.indexOf(`${selector} {`);
  expect(start, selector).toBeGreaterThan(-1);
  return layout.slice(start, layout.indexOf("}", start));
};

describe("EditorialAuth hosted-flow tokens", () => {
  it("ships all three inert", () => {
    expect(tokens).toMatch(/--editorial-auth-background:\s*initial;/);
    expect(tokens).toMatch(/--editorial-auth-card-footer-border:\s*initial;/);
    expect(tokens).toMatch(/--editorial-auth-card-title-font-weight:\s*initial;/);
  });

  it("reads each at its call site, defaulting to what it painted before", () => {
    expect(rule(".ui-editorial-auth")).toContain(
      "background: var(--editorial-auth-background, transparent);",
    );
    expect(rule(".ui-editorial-auth-card-title")).toMatch(
      /font-weight: var\(--editorial-auth-card-title-font-weight, var\(--font-weight-semibold, 600\)\)/,
    );
    expect(rule(".ui-editorial-auth-card-footer").replace(/\s+/g, " ")).toContain(
      "border-block-start: var( --editorial-auth-card-footer-border, var(--stroke-hairline) solid hsl(var(--border)) );",
    );
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Exercise the exact shared parser without executing either generator's file-writing CLI.
const source = readFileSync("scripts/read-css-block.mjs", "utf8");
const readBlock = new Function(
  `${source.replace("export function", "function")}; return readCssBlock;`,
)() as (css: string, open: number) => string;

describe("generator CSS block reader", () => {
  it("ignores comment braces and handles nested blocks and quoted escaped braces", () => {
    const body =
      '\n/* } { --fake: 1; */\n--first: 1;\n@nested { --quoted: "}\\"{"; }\n--last: 2;\n';
    const css = `@media not print { .dark {${body}} } .next { --outside: 3; }`;
    expect(readBlock(css, css.indexOf("{", css.indexOf(".dark")))).toBe(body);
  });
  it("handles empty and adjacent blocks without reading the next rule", () => {
    expect(readBlock("{} .next {}", 0)).toBe("");
    expect(readBlock("{--x: 1;} .next {}", 0)).toBe("--x: 1;");
  });
  it("rejects missing and unterminated blocks, comments and strings", () => {
    for (const css of ["", "{", "{/* }", '{"}']) expect(() => readBlock(css, 0)).toThrow();
  });
  it("both generators use the shared balanced parser", () => {
    for (const name of ["brand", "email-tokens"]) {
      const cli = readFileSync(`scripts/gen-${name}.mjs`, "utf8");
      expect(cli).toContain('from "./read-css-block.mjs"');
      expect(cli).toMatch(/readCssBlock\((?:foundation|css), open\)/);
    }
  });
});

import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A TEST MAY NOT BAKE THE FORMATTER'S LINE BREAKS INTO A CSS SELECTOR (gh#767, gh#769).
 *
 * Prettier wraps a selector list the moment it crosses the print width, so the SAME rule reads as
 * one line or as four depending only on how long its selector happens to be. That is a fact about
 * the formatter, never about the stylesheet — and a probe that searches for a literal with `\n`
 * inside it turns it into a fact about whether the suite passes. It fails in two ways:
 *
 *   LOUD  — `[data-placement="start"]` is two characters longer than `end`; that alone pushed the
 *           selector over the width and the rule read as MISSING. `main` went red saying the CSS
 *           had no RTL rail. It had one the whole time (gh#767).
 *   QUIET — a literal leaning on `\n` + exactly two spaces to mean "the TOP-LEVEL rule, not the
 *           nested one" keeps matching after a reformat, just a DIFFERENT rule. Green, guarding
 *           nothing. card-layout.css carries 23 `card-content` selectors at mixed indents, so this
 *           was a live hazard, not a hypothetical (gh#769, group B).
 *
 * gh#769 asked for this guard explicitly, and asked for it LAST: it would have been red at six
 * places on the day it was written. #770/#771/#772 closed those six, so it can land.
 *
 * Say it with structure instead. `src/test/css-selector` matches a one-line selector across any
 * whitespace (`ruleSelectors`/`ruleSelector`), and the rule-boundary anchor in
 * `card-axis-independence.test.ts` shows how to name a top-level rule without counting spaces.
 */

/**
 * A literal that carries CSS. Deliberately NOT keyed on a bare `{` — `ui-audit-cli.test.ts` feeds
 * the linter 19 multi-line JSX fixtures (`<Select\n  value={v}\n/>`), and a brace alone cannot
 * tell those from a stylesheet.
 */
const LOOKS_LIKE_CSS = /\[data-|\.ui-|\.sb-|\.tb-|:root|:is\(|:where\(/;

/**
 * A `\n` that a SELECTOR continues across: the next non-space character opens another compound, a
 * combinator, or a declaration. A block TERMINATOR (`\n}`, `\n  }`, `\n  };`) is a different and
 * much less brittle idiom — it survives everything but a change of indent — and is not banned here.
 */
const WRAPPED_SELECTOR = /\\n[ ]*[.[:#>+~*a-zA-Z]/;

/** Single-line string and template literals, as authored. */
const LITERALS = /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\\n]|\\.)*)`/g;

/** Comments describe the defect; they are not the defect. `${…}` is interpolation, not a selector. */
const strip = (line: string) =>
  line
    .replace(/\/\/.*$/, "")
    .replace(/\$\{[^}]*\}/g, "")
    .trim();

/** A comment BODY (inside `/* … *␘/`) has no code on it — cheapest reliable test: no `(` and no `=`. */
const isProse = (line: string) => /^\*|^\/\*/.test(line.trim());

describe("CSS probes read structure, not Prettier's line breaks (gh#769)", () => {
  it("no test bakes a line break into a selector string", () => {
    const offenders: string[] = [];

    for (const file of globSync("src/**/*.test.{ts,tsx}", { cwd: process.cwd() })) {
      const text = readFileSync(join(process.cwd(), file), "utf8");
      text.split("\n").forEach((raw, i) => {
        if (isProse(raw)) return;
        for (const match of strip(raw).matchAll(LITERALS)) {
          const body = match[1] ?? match[2] ?? match[3] ?? "";
          if (!WRAPPED_SELECTOR.test(body) || !LOOKS_LIKE_CSS.test(body)) continue;
          offenders.push(`${file}:${i + 1} — ${body.slice(0, 100)}`);
        }
      });
    }

    expect(
      offenders,
      'these probes read as "rule not found" the next time Prettier re-wraps that selector, and ' +
        `the failure blames the CSS. Anchor on structure — src/test/css-selector:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});

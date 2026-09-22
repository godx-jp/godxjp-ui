import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * THE DOCUMENTED SCOPE AND THE IMPLEMENTED SCOPE MUST AGREE (gh#863).
 *
 * `check-no-consumer-coupling.mjs` runs four passes with deliberately different reach, and its
 * header states each one. The docs pass, added in gh#846 for hard-coded CJK chrome, also called
 * `scanLocale` — the component-source rule for currency codes and IANA timezones — while the
 * header kept saying `src/components only`. Two statements about scope in one file disagreed for a
 * day and nothing noticed.
 *
 * The consequence was not abstract: a new showcase of a Japanese price-comparison board could not
 * name JPY, while an older docs page carrying the identical literal passed because it sat inside
 * the per-file baseline. Permitted where it already exists, forbidden where it is written today.
 *
 * So this asserts the relationship, not the wording: the docs pass must not reach the
 * component-source scanner.
 */
const SOURCE = readFileSync(
  resolve(process.cwd(), "scripts/check-no-consumer-coupling.mjs"),
  "utf8",
);

/** The body of one top-level function, brace-matched. */
function bodyOf(name: string): string {
  const at = SOURCE.indexOf(`function ${name}(`);
  expect(at, `function ${name} not found — the gate was restructured`).toBeGreaterThan(-1);
  const open = SOURCE.indexOf("{", at);
  let depth = 0;
  let end = open;
  for (; end < SOURCE.length; end += 1) {
    if (SOURCE[end] === "{") depth += 1;
    if (SOURCE[end] === "}") depth -= 1;
    if (depth === 0) break;
  }
  return SOURCE.slice(open, end);
}

describe("check:no-consumer-coupling — declared scope is the implemented scope (gh#863)", () => {
  it("still declares the currency/timezone rule as component-source only", () => {
    // If someone deliberately widens it, this is the line they must change first — and changing it
    // makes the next assertion the conversation rather than a surprise in CI.
    expect(SOURCE).toMatch(/locale\/currency\/tz literals\s+src\/components only/);
  });

  it("does NOT run the component-source scanner over docs/**", () => {
    expect(
      bodyOf("collectDocsHits"),
      "the docs pass is about CJK CHROME. A currency code in an example is usually the DATA — a " +
        "Japanese price board quotes JPY in every language — and this pass already leaves data " +
        "literals unscanned by design.",
    ).not.toMatch(/scanLocale\s*\(/);
  });

  it("DOES run it over component globs, which is where the header says it belongs", () => {
    expect(SOURCE, "the component pass must keep the strict rule").toMatch(
      /for \(const rel of collect\(COMPONENT_GLOBS\)\)[\s\S]{0,200}scanLocale\s*\(/,
    );
  });
});

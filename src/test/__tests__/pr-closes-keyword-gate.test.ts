import { describe, expect, it } from "vitest";

// @ts-expect-error — a plain .mjs rule module, the same shape as component-token-rules.
import { findClosingKeywords as findRaw } from "../../../scripts/check-pr-closes-keyword.mjs";

type Hit = { keyword: string; issue: string; text: string };
const findClosingKeywords = findRaw as (body: string) => Hit[];

/**
 * THE GATE THAT MAKES gh#620 STRUCTURAL RATHER THAN REMEMBERED (gh#783).
 *
 * gh#620 requires a close to carry the release the reporter can install. GitHub's `Closes #N`
 * fires on MERGE, when no release exists and no version is knowable — so the keyword cannot
 * satisfy the rule, every time, by construction.
 *
 * It is not hypothetical: PR #773 carried `Closes #765 / #769 / #748`, all three closed at merge
 * with no comment and no version, while `main` was about to go red across seven gates from that
 * same commit and npm was still a release behind.
 */
describe("check:pr-closes-keyword (gh#783)", () => {
  it.each([
    "Closes #765",
    "closes #765",
    "CLOSES #765",
    "Fixes #1",
    "fixed #1",
    "Resolve #99",
    "Resolves: #12",
    "Closes godx-jp/godxjp-ui#765",
    "resolves https://github.com/godx-jp/godxjp-ui/issues/9",
  ])("refuses %s", (body) => {
    expect(findClosingKeywords(body)).toHaveLength(1);
  });

  it("reports the issue number, so the message names what would have been closed", () => {
    const [hit] = findClosingKeywords("Closes #748");
    expect(hit.issue).toBe("748");
  });

  it("catches every reference in a multi-issue body, not just the first", () => {
    // #773's exact shape — the one that produced gh#783.
    expect(findClosingKeywords("Closes #765\nCloses #769\nCloses #748")).toHaveLength(3);
  });

  it.each([
    "Refs #765",
    "See #765",
    "Related in shape: godxjp-ui#762",
    "fixes the clipping at 320px",
    "this closes the gap in coverage",
    "",
  ])("allows %s", (body) => {
    expect(findClosingKeywords(body)).toHaveLength(0);
  });

  it("does NOT strip code fences, because GitHub does not either", () => {
    // A keyword inside a fence still closes the issue on GitHub, so a gate that ignored fences
    // would pass exactly the bodies that still fire. Quoting the rule needs the explicit marker.
    expect(findClosingKeywords("```\nCloses #1\n```")).toHaveLength(1);
  });

  it("has one deliberate escape hatch, and it is a literal marker", () => {
    // So a PR ABOUT this rule can quote it. A syntax class (code fence, blockquote) would not do:
    // those still fire on GitHub. Opting out has to be an explicit statement.
    expect(findClosingKeywords("Closes #1\n<!-- allow-closing-keyword -->")).toHaveLength(0);
  });
});

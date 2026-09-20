#!/usr/bin/env node
/**
 * A PR BODY MAY NOT CARRY A GITHUB AUTO-CLOSING KEYWORD (gh#783).
 *
 * gh#620 says a close has to carry the number the reporter can act on: paste the new measurement,
 * or the release that carries the fix, in the closing comment — and close it once the change is
 * shipped in a release the reporter can install.
 *
 * `Closes #N` fires on MERGE. At merge time no release exists and no version number is knowable.
 * So the keyword cannot satisfy gh#620 — not occasionally, not when someone is careless, but by
 * construction, every time.
 *
 * It happened here: PR #773 carried `Closes #765 / #769 / #748` and closed all three at 21:49 on
 * merge, COMPLETED, no comment and no version, while `main` was about to go red across seven gates
 * from that same commit and the registry was still a release behind. The three issues read as
 * delivered for the whole window in which they were least deliverable.
 *
 * Write `Refs #N` instead, and close the issue from the release with the version in the comment.
 * That is the lifecycle gh#620 describes: resolve → deliver → communicate → close.
 */
import { readFileSync } from "node:fs";

/** GitHub's closing keywords, exactly: docs "Linking a pull request to an issue". */
const KEYWORDS = "close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved";

/**
 * A keyword followed by an issue reference: `#12`, `owner/repo#12`, or an issue URL. Case
 * insensitive, as GitHub is. Requires the `#` form so prose like "fixes the clipping" is not a hit.
 */
const CLOSING = new RegExp(
  `\\b(${KEYWORDS})\\b\\s*:?\\s*(?:[\\w.-]+\\/[\\w.-]+)?#(\\d+)|` +
    `\\b(${KEYWORDS})\\b\\s*:?\\s*https?:\\/\\/github\\.com\\/[\\w.-]+\\/[\\w.-]+\\/issues\\/(\\d+)`,
  "gi",
);

/** Fenced code blocks and inline code are quotation, not instruction to GitHub — and vice versa:
 *  GitHub DOES honour keywords inside code fences, so they are NOT stripped. Only this file's own
 *  documentation of the rule is exempt, which is why the exemption is a literal marker and not a
 *  syntax class. */
const EXEMPT = /<!--\s*allow-closing-keyword\s*-->/i;

export function findClosingKeywords(body) {
  if (!body || EXEMPT.test(body)) return [];
  return [...body.matchAll(CLOSING)].map((m) => ({
    keyword: m[1] ?? m[3],
    issue: m[2] ?? m[4],
    text: m[0].trim(),
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.env.PR_BODY_FILE;
  const body = file ? readFileSync(file, "utf8") : (process.env.PR_BODY ?? "");
  const hits = findClosingKeywords(body);
  if (hits.length === 0) {
    console.log("✓ check:pr-closes-keyword — no auto-closing keyword in the PR body.");
    process.exit(0);
  }
  console.error("✗ this PR body would auto-close an issue on MERGE (gh#783):\n");
  for (const h of hits) console.error(`    ${h.text}   → would close #${h.issue}`);
  console.error(
    `\n  GitHub fires these on merge, when no release exists and no version is knowable, so the\n` +
      `  close cannot carry the number gh#620 requires. It is not a question of being careful:\n` +
      `  the keyword violates the rule by construction.\n\n` +
      `  Write "Refs #N" instead, and close the issue from the release with the version and the\n` +
      `  measurement in the closing comment.\n`,
  );
  process.exit(1);
}

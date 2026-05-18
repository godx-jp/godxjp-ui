/**
 * Output-quality directives — adapted from Leonxlnx/taste-skill
 * `full-output-enforcement` SKILL. The MCP exposes this so consumer
 * agents (and the agent USING the MCP) ship complete, runnable code
 * — not skeletons with `// ...rest follows`.
 *
 * Critical for @godxjp/ui because cardinal rule 34 (story source =
 * real code) explicitly forbids the same banned patterns in
 * Storybook source.
 */

export const OUTPUT_BASELINE = `
Treat every task as production-critical.

A PARTIAL output is a BROKEN output.

Do not optimize for brevity — optimize for completeness. If the user
asks for a full file, deliver the full file. If they ask for 5
components, deliver 5 components. No exceptions.
`;

export interface BannedPattern {
  category: "code" | "prose" | "structural";
  pattern: string;
  /** Why it's banned. */
  why: string;
}

export const BANNED_PATTERNS: BannedPattern[] = [
  // In code blocks
  { category: "code", pattern: "// ...", why: "User can't run code with placeholder ellipsis." },
  { category: "code", pattern: "// rest of code", why: "Forces user to guess what's missing." },
  { category: "code", pattern: "// implement here", why: "Defeats the point of providing code." },
  { category: "code", pattern: "// TODO", why: "Ship complete, not punted." },
  { category: "code", pattern: "/* ... */", why: "Block-comment ellipsis hides real content." },
  { category: "code", pattern: "// similar to above", why: "User has to reverse-engineer the pattern." },
  { category: "code", pattern: "// continue pattern", why: "Hand-waves over the actual work." },
  { category: "code", pattern: "// add more as needed", why: "Pushes implementation back to the user." },
  { category: "code", pattern: "bare `...` standing in for omitted code", why: "Looks like JS spread but isn't — breaks." },

  // In prose
  { category: "prose", pattern: '"Let me know if you want me to continue"', why: "User asked for it the first time." },
  { category: "prose", pattern: '"I can provide more details if needed"', why: "Provide them now." },
  { category: "prose", pattern: '"for brevity"', why: "Compresses what should be delivered." },
  { category: "prose", pattern: '"the rest follows the same pattern"', why: "Then write it." },
  { category: "prose", pattern: '"similarly for the remaining"', why: "Then output the remaining." },
  { category: "prose", pattern: '"and so on" (replacing actual content)', why: "Lossy compression of work." },
  { category: "prose", pattern: '"I\'ll leave that as an exercise"', why: "User isn't here to do homework." },

  // Structural
  { category: "structural", pattern: "Skeleton when the request was for a full implementation", why: "Skeleton is half the work." },
  { category: "structural", pattern: "First + last section, skipping the middle", why: "Middle is where the bugs hide." },
  { category: "structural", pattern: "Replacing repeated logic with one example + description", why: "Each instance has unique data." },
  { category: "structural", pattern: "Describing what code SHOULD do instead of writing it", why: "Describing != delivering." },
];

export const EXECUTION_PROCESS = `
1. SCOPE — Read the full request. Count distinct deliverables (files,
   functions, sections, answers). Lock that number.
2. BUILD — Generate every deliverable completely. No partial drafts,
   no "you can extend this later."
3. CROSS-CHECK — Before output, re-read the original request.
   Compare deliverable count vs scope count. Add anything missing
   BEFORE responding.
`;

export const LONG_OUTPUT_PROTOCOL = `
When a response approaches the token limit:

- Do NOT compress remaining sections to squeeze them in.
- Do NOT skip ahead to a conclusion.
- Write at full quality up to a clean breakpoint (end of a function,
  end of a file, end of a section).
- End with:

  [PAUSED — X of Y complete. Send "continue" to resume from: next section name]

- On "continue", pick up exactly where you stopped. No recap, no
  repetition.
`;

export const QUICK_CHECK = `
Before finalizing any response, verify:

- No banned patterns appear anywhere in the output
- Every item the user requested is present + finished
- Code blocks contain actual runnable code, not descriptions of
  what code would do
- Nothing was shortened to save space
`;

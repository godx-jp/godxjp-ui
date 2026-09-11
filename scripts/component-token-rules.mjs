/**
 * WHICH TOKEN A COMMENT IN `src/tokens/components/*.css` IS ACTUALLY TALKING ABOUT.
 *
 * Extracted from the generator so the rule can be tested against fixtures, the way
 * token-scale-bypass-rules.mjs and visual-audit-rules.mjs are.
 *
 * THE RULE IT REPLACED WAS "THE NEAREST COMMENT ABOVE", WITH NO END TO IT — so one comment became
 * the description of EVERY token after it until the next comment appeared, across blank lines and
 * across rule blocks. What shipped in the catalog because of that:
 *
 *   · `--mobile-shell-safe-inset-block-start`, `-block-end` and `-inline` each documented with the
 *     430px note that belongs to `--mobile-shell-max-inline-size`;
 *   · `--tabs-overflow-radius` and `--tabs-overflow-icon-size` carrying a note about the overflow
 *     trigger's SIZE;
 *   · `--control-height-compact`, `--control-height-default` and the four `--textarea-padding-*`
 *     tokens carrying prose about amber warning boundaries — a comment two rule blocks above them.
 *
 * An agent reading `get_component` was told a padding knob was a WCAG contrast decision. That is
 * worse than telling it nothing, because it reads as specific.
 *
 * THE RULE NOW: A COMMENT DESCRIBES THE ONE DECLARATION IMMEDIATELY BELOW IT. Nothing else.
 *
 * The tempting alternative was to let a comment head a GROUP and end its claim at the first blank
 * line, which would have kept 525 more specific descriptions. It was measured and rejected: this
 * tier is not written that way. `--mobile-shell-max-inline-size` is followed by the three
 * safe-inset tokens with no blank line between them, `--card-space-gap` by five card-title and
 * card-description tokens, `--card-header-border-bottom` by `--card-radius` — so the blank-line
 * boundary leaves the very defects this rule exists to end. A sibling test (same name but the last
 * segment) was measured too: it ends most leaks but cuts real ladders, and left 485 tokens on the
 * file header anyway — a cleverer rule for almost the same coverage.
 *
 * THE COST, STATED: 525 of 1364 tokens (38%) now carry their FILE's one-line header instead of a
 * group comment. Some of those headings were genuinely about the whole group. That is the price of
 * a rule that cannot be wrong, and the way back is in the author's hands and visible in a diff:
 * move the comment directly above the token it describes, or give the token its own line of
 * comment. Nothing about the source has to change for the catalog to stop lying.
 *
 * A TRAILING COMMENT BELONGS TO ITS OWN LINE. `--x: initial; /* default = … *\u200b/` is written
 * about the declaration it sits beside; handing it to the next declaration moves it one line down,
 * which is the same defect in miniature. legal-document.css writes five of those in a row, so the
 * three that follow the first would all have been described as
 * "default = hsl(var(--muted-foreground))" — two of them wrongly. A trailing comment is appended to
 * the description its own token already has rather than replacing it, because the two say different
 * things: the heading above says what the group of knobs IS, the trailing note says what this one
 * resolves to.
 *
 * THE FILE HEADER IS A FALLBACK, never an override: every file in this tier opens with one line
 * naming what it covers (`Badge component tokens.`) before the first `{`, so a token with no
 * comment of its own is described at the level that is still true of it.
 */

/**
 * @param {string} text one component-token stylesheet
 * @returns {{name: string, value: string, description: string}[]}
 */
export function parseComponentTokens(text) {
  const re = /\/\*([\s\S]*?)\*\/|(--[a-z0-9-]+)\s*:\s*([^;]+);/g;
  // Everything before the first rule block belongs to the file, not to any one token — and the
  // brace that opens that block has to be found with COMMENTS STRIPPED. Two headers in this tier
  // (activity.css, chat-bubble.css) contain a `{` inside their own prose, so a raw `indexOf("{")`
  // cut the preamble in half, found no complete comment in it, and left every token in those two
  // files with an empty description.
  const firstBrace = text.replace(/\/\*[\s\S]*?\*\//g, (c) => " ".repeat(c.length)).indexOf("{");
  const preamble = text.slice(0, firstBrace === -1 ? text.length : firstBrace);
  const header = (preamble.match(/\/\*([\s\S]*?)\*\//)?.[1] ?? "").replace(/\s+/g, " ").trim();

  const items = [];
  /** The comment that has not yet been claimed by a declaration. Cleared the moment one does. */
  let pending = "";
  let previousEnd = 0;

  for (const m of text.matchAll(re)) {
    const gap = text.slice(previousEnd, m.index);
    previousEnd = m.index + m[0].length;

    if (m[1] !== undefined) {
      const body = m[1].replace(/\s+/g, " ").trim();
      // A TRAILING comment — `--x: initial; /* default = … */` — is about the declaration on its
      // OWN line, not the next one. legal-document.css writes five in a row that way, and handing
      // each to the token below it moves every one of them exactly one line down.
      const trailing = items.length > 0 && !gap.includes("\n");
      if (trailing) {
        const owner = items[items.length - 1];
        owner.description = [owner.description === header ? "" : owner.description, body]
          .filter(Boolean)
          .join(" ");
      } else {
        pending = body;
      }
      continue;
    }
    items.push({
      name: m[2],
      value: m[3].replace(/\s+/g, " ").trim(),
      description: pending || header,
    });
    pending = "";
  }
  return items;
}

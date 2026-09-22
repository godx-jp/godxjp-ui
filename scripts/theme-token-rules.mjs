/**
 * WHICH DECLARATIONS IN `src/tokens/foundation.css`, `src/tokens/derived.css` AND
 * `src/tokens/semantic/*.css` ARE THE THEME SURFACE — the tiers a consumer is invited to set.
 *
 * WHY THIS IS NOT `parseComponentTokens`. The component tier is one flat `:root` block per file, so
 * that parser reads a whole stylesheet linearly and is right. These three files are not: the SAME
 * token name is declared again under `:root[data-theme="dark"]` (36 of them in foundation.css),
 * again under `.ui-scale-fixed` (49 more), and again inside `@supports not (color: hsl(from …))`
 * in derived.css (7 more). Read linearly, `--background` appears twice with different values and
 * nothing says which one is the default — the exact "looks complete, is wrong" failure the
 * component parser was written to end.
 *
 * THE RULE: a declaration counts when its innermost AND ONLY enclosing block is a top-level
 * `:root`. That is the light-theme default — the value a reader gets before any axis, any theme
 * attribute and any `@supports` fallback. Every other block redeclares a name this set already
 * carries, so nothing is lost by skipping them, and the alternative (publish every scope) hands an
 * agent five values for `--background` and no way to pick.
 *
 * DESCRIPTIONS follow the component tier's rule exactly, because the failure is the same one:
 * A COMMENT DESCRIBES THE ONE DECLARATION IMMEDIATELY BELOW IT, a trailing comment belongs to the
 * declaration on its own line, and the file's opening comment is the fallback for a token that has
 * neither. See scripts/component-token-rules.mjs for what "the nearest comment above, with no end
 * to it" cost the last time it was tried.
 */

/**
 * The byte ranges of every TOP-LEVEL `:root { … }` body, plus the file's opening comment.
 *
 * @param {string} text one stylesheet
 * @returns {{header: string, bodies: [number, number][]}}
 */
function rootBodies(text) {
  // Comments are BLANKED (newlines and length preserved, so offsets stay true) before the brace
  // walk: derived.css writes `{`, `}` and `;` inside its prose, and a raw scan desynchronises on
  // the first one — which would silently move the boundary of the block being read.
  const blank = text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
  const bodies = [];
  let depth = 0;
  let selectorStart = 0;
  let openedAt = -1;
  for (let i = 0; i < blank.length; i += 1) {
    const ch = blank[i];
    if (ch === "{") {
      if (depth === 0 && blank.slice(selectorStart, i).trim() === ":root") openedAt = i + 1;
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        if (openedAt !== -1) bodies.push([openedAt, i]);
        openedAt = -1;
        selectorStart = i + 1;
      }
    } else if (depth === 0 && (ch === ";" || ch === "\n") && openedAt === -1) {
      // An at-rule statement (`@import "…";`) or a blank line between rules — the selector of the
      // NEXT block starts after it, not at the last `}`.
      if (ch === ";") selectorStart = i + 1;
    }
  }
  const firstBrace = blank.indexOf("{");
  const preamble = text.slice(0, firstBrace === -1 ? text.length : firstBrace);
  const opening = (preamble.match(/\/\*([\s\S]*?)\*\//)?.[1] ?? "").replace(/\s+/g, " ").trim();
  // THE FIRST SENTENCE, not the whole opening comment. Each component-tier file opens with one
  // line (`Badge component tokens.`), so taking the block whole costs nothing there — these three
  // open with an essay. derived.css's is 4 KB and would be repeated verbatim as the fallback
  // description of the 20 tokens that carry no comment of their own: 60 KB of the same paragraphs,
  // published to every consumer, saying no more than its first line does.
  const header = opening.match(/^.*?[.．](?=\s|$)/)?.[0] ?? opening;
  return { header, bodies };
}

/**
 * @param {string} text one foundation / derived / semantic stylesheet
 * @returns {{name: string, value: string, description: string}[]}
 */
export function parseThemeTokens(text) {
  const { header, bodies } = rootBodies(text);
  const items = [];
  const seen = new Map();

  for (const [start, end] of bodies) {
    const body = text.slice(start, end);
    const re = /\/\*([\s\S]*?)\*\/|(--[a-z0-9-]+)\s*:\s*([^;]+);/g;
    let pending = "";
    let previousEnd = 0;
    for (const m of body.matchAll(re)) {
      const gap = body.slice(previousEnd, m.index);
      previousEnd = m.index + m[0].length;
      if (m[1] !== undefined) {
        const comment = m[1].replace(/\s+/g, " ").trim();
        const trailing = items.length > 0 && !gap.includes("\n");
        if (trailing) {
          const owner = items[items.length - 1];
          owner.description = [owner.description === header ? "" : owner.description, comment]
            .filter(Boolean)
            .join(" ");
        } else {
          pending = comment;
        }
        continue;
      }
      const entry = {
        name: m[2],
        value: m[3].replace(/\s+/g, " ").trim(),
        description: pending || header,
      };
      pending = "";
      // A name declared twice in top-level `:root` (foundation.css restates `--radius-*` after the
      // ratio block) keeps the LAST value, which is the one that actually applies in the cascade.
      const at = seen.get(entry.name);
      if (at === undefined) {
        seen.set(entry.name, items.length);
        items.push(entry);
      } else {
        items[at] = entry;
      }
    }
  }
  return items;
}

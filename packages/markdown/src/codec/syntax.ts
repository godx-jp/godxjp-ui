import { directive } from "micromark-extension-directive";
import { gfm } from "micromark-extension-gfm";
import { cjkFriendlyExtension } from "micromark-extension-cjk-friendly";
import { frontmatter } from "micromark-extension-frontmatter";
import { math } from "micromark-extension-math";
import { frontmatterFromMarkdown, frontmatterToMarkdown } from "mdast-util-frontmatter";
import { mathFromMarkdown, mathToMarkdown } from "mdast-util-math";
import { directiveFromMarkdown } from "mdast-util-directive";
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import type { Code, Construct, Extension, State, Tokenizer } from "micromark-util-types";

/**
 * THE ONE SYNTAX both the codec and the renderer read (gh#1156), so a body parses identically in
 * the editor, on the server and in `<Markdown>`:
 *
 * - GFM (tables, task lists, strikethrough, autolinks, footnotes);
 * - CJK-friendly emphasis — `の**「強調」**です` is strong, where CommonMark's flanking rules leave
 *   literal asterisks next to 、。「」（）;
 * - YAML FRONT MATTER (`---` … `---` as the first lines): the page's own properties, kept verbatim —
 *   without it, `---\ntitle: x\n---` read as a rule and a setext heading (gh#1163);
 * - MATH — `$…$` / `$$…$$` inline, `$$` on its own lines for a display block. The content is
 *   literal (no Markdown inside, `\,` keeps its backslash). The codec keeps it verbatim; the
 *   renderer draws it with KaTeX. A ```math fence is display math too, but stays a code block here.
 *   A SINGLE-dollar span follows Pandoc's rule (`dollarMath`), so prices stay prose: the opening `$`
 *   is not followed by whitespace, the closing `$` is not preceded by whitespace or a backslash
 *   (`\$` is a dollar) and not followed by a digit. `$5 and $10`, `$5-$10`, `$5-\$10` are text;
 *   `$x$`, `$$ x $$` are math.
 * - CONTAINER directives only (`:::name[label]{attrs}`). The text (`:name`) and leaf (`::name`)
 *   forms are deliberately off: with them, ordinary prose like `10:30` or `note:x` would turn into
 *   directives.
 */
export function micromarkExtensions(): Extension[] {
  // `directive()` registers [container, leaf] on `:` (58) for flow, and the text form for text.
  const [container] = directive().flow![58] as Construct[];
  const containerOnly: Extension = { flow: { 58: container! } };
  return [gfm(), cjkFriendlyExtension(), frontmatter(["yaml"]), dollarMath(), containerOnly];
}

const DOLLAR = 36;
const isSpace = (code: Code | undefined) =>
  code === null || code === undefined || code < 0 || code === 32;
const isDigit = (code: Code | undefined) => code != null && code >= 48 && code <= 57;
const BACKSLASH = 92;

/**
 * `micromark-extension-math` with Pandoc's single-dollar rule on top. The original tokenizer runs
 * unchanged; this wrapper only watches the codes it is fed, and when it reports a complete
 * single-dollar span that breaks the rule, the attempt fails (`nok`) and the `$` is plain text.
 */
function dollarMath(): Extension {
  const extension = math();
  const text = extension.text![DOLLAR] as Construct;
  const tokenize: Tokenizer = function (effects, ok, nok) {
    const codes: Code[] = [];
    let done = false;
    const finish = (code: Code): State | undefined => {
      done = true;
      // codes: `$` … before `$` after
      const single = codes[1] !== DOLLAR;
      const after = codes[codes.length - 1];
      const before = codes[codes.length - 3];
      const refused =
        isSpace(codes[1]) || isSpace(before) || before === BACKSLASH || isDigit(after);
      if (single && refused) return nok(code);
      return ok(code);
    };
    const watch =
      (state: State): State =>
      (code) => {
        if (done) return state(code);
        codes.push(code);
        const next = state(code);
        return next && !done ? watch(next) : next;
      };
    return watch(
      text.tokenize.call(this, effects, finish, (code) => {
        done = true;
        return nok(code);
      }),
    );
  };
  return { ...extension, text: { [DOLLAR]: { ...text, tokenize } } };
}

export function fromMarkdownExtensions() {
  return [
    gfmFromMarkdown(),
    directiveFromMarkdown(),
    frontmatterFromMarkdown(["yaml"]),
    mathFromMarkdown(),
  ];
}

/**
 * Display width for table padding: an East Asian wide or fullwidth character takes two columns in a
 * monospace view, so `| 優先度 |` pads like the six-column cell it looks like, not a three-unit one.
 */
const WIDE =
  /[\u1100-\u115F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6\u{1F300}-\u{1F64F}\u{1F900}-\u{1F9FF}\u{20000}-\u{3FFFD}]/u;

export function displayWidth(value: string): number {
  let width = 0;
  for (const char of value) width += WIDE.test(char) ? 2 : 1;
  return width;
}

export function toMarkdownGfm() {
  return gfmToMarkdown({ stringLength: displayWidth });
}

export function toMarkdownFrontmatter() {
  return frontmatterToMarkdown(["yaml"]);
}

export function toMarkdownMath() {
  return mathToMarkdown();
}

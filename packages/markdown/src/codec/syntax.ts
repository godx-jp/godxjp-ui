import { directive } from "micromark-extension-directive";
import { gfm } from "micromark-extension-gfm";
import { cjkFriendlyExtension } from "micromark-extension-cjk-friendly";
import { frontmatter } from "micromark-extension-frontmatter";
import { frontmatterFromMarkdown, frontmatterToMarkdown } from "mdast-util-frontmatter";
import { directiveFromMarkdown } from "mdast-util-directive";
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import type { Construct, Extension } from "micromark-util-types";

/**
 * THE ONE SYNTAX both the codec and the renderer read (gh#1156), so a body parses identically in
 * the editor, on the server and in `<Markdown>`:
 *
 * - GFM (tables, task lists, strikethrough, autolinks, footnotes);
 * - CJK-friendly emphasis — `の**「強調」**です` is strong, where CommonMark's flanking rules leave
 *   literal asterisks next to 、。「」（）;
 * - YAML FRONT MATTER (`---` … `---` as the first lines): the page's own properties, kept verbatim —
 *   without it, `---\ntitle: x\n---` read as a rule and a setext heading (gh#1163);
 * - CONTAINER directives only (`:::name[label]{attrs}`). The text (`:name`) and leaf (`::name`)
 *   forms are deliberately off: with them, ordinary prose like `10:30` or `note:x` would turn into
 *   directives.
 */
export function micromarkExtensions(): Extension[] {
  // `directive()` registers [container, leaf] on `:` (58) for flow, and the text form for text.
  const [container] = directive().flow![58] as Construct[];
  const containerOnly: Extension = { flow: { 58: container! } };
  return [gfm(), cjkFriendlyExtension(), frontmatter(["yaml"]), containerOnly];
}

export function fromMarkdownExtensions() {
  return [gfmFromMarkdown(), directiveFromMarkdown(), frontmatterFromMarkdown(["yaml"])];
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

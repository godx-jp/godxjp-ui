import { directive } from "micromark-extension-directive";
import { gfm } from "micromark-extension-gfm";
import { cjkFriendlyExtension } from "micromark-extension-cjk-friendly";
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
 * - CONTAINER directives only (`:::name[label]{attrs}`). The text (`:name`) and leaf (`::name`)
 *   forms are deliberately off: with them, ordinary prose like `10:30` or `note:x` would turn into
 *   directives.
 */
export function micromarkExtensions(): Extension[] {
  // `directive()` registers [container, leaf] on `:` (58) for flow, and the text form for text.
  const [container] = directive().flow![58] as Construct[];
  const containerOnly: Extension = { flow: { 58: container! } };
  return [gfm(), cjkFriendlyExtension(), containerOnly];
}

export function fromMarkdownExtensions() {
  return [gfmFromMarkdown(), directiveFromMarkdown()];
}

export function toMarkdownGfm() {
  return gfmToMarkdown();
}

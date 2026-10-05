import GithubSlugger from "github-slugger";
import type { Nodes, PhrasingContent } from "mdast";
import { visit } from "unist-util-visit";

import { parseMdast } from "./parse";

export type OutlineEntry = { depth: number; text: string; id: string };

/** A heading's text as the renderer reads it: text and code, never an image's alt (gh#1163). */
function textOf(node: Nodes | PhrasingContent): string {
  if (node.type === "text" || node.type === "inlineCode" || node.type === "html") return node.value;
  if (node.type === "image" || node.type === "imageReference") return "";
  if ("children" in node) return (node.children as Nodes[]).map(textOf).join("");
  return "";
}

/**
 * The body's headings with the ids `<Markdown>` gives them — GitHub slugs, de-duplicated in
 * document order, the renderer's default rule — for a table of contents (the kit's `Anchor`). Pure.
 * A host that passes its own `headingId` resolver to `<Markdown>` must use that same resolver here.
 */
export function outline(markdown: string): OutlineEntry[] {
  const slugger = new GithubSlugger();
  const entries: OutlineEntry[] = [];
  visit(parseMdast(markdown.replace(/\r\n?/g, "\n")), "heading", (node) => {
    const text = textOf(node);
    entries.push({ depth: node.depth, text, id: slugger.slug(text) });
  });
  return entries;
}

/** The body's YAML front matter, verbatim (without the `---` fences), or null. Parse it with your YAML library. */
export function frontmatterOf(markdown: string): string | null {
  const first = parseMdast(markdown.replace(/\r\n?/g, "\n")).children[0];
  return first?.type === "yaml" ? first.value : null;
}

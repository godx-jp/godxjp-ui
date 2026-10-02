import GithubSlugger from "github-slugger";
import type { Element, ElementContent, Root } from "hast";
import { visit } from "unist-util-visit";

/** What a host is told about each heading, in document order. */
export type HeadingInfo = { depth: number; text: string; index: number };

/**
 * Chooses a heading's anchor. Return `undefined` to give the heading no id.
 *
 * The default is GitHub's slug (`github-slugger`, the same rule `rehype-slug` uses), de-duplicated
 * in document order (`a`, `a-1`, `a-2`). A host whose server already assigned anchors (godx-task
 * keeps its outline server-side, so a link and the page agree) passes its own: computing "the same"
 * slug in two languages is one rule written twice, and it drifts.
 */
export type HeadingIdResolver = (heading: HeadingInfo) => string | undefined;

const HEADING = /^h([1-6])$/;

function textOf(node: Element | ElementContent): string {
  if (node.type === "text") return node.value;
  if ("children" in node) return node.children.map(textOf).join("");
  return "";
}

/** rehype plugin: an `id` on every heading. Runs BEFORE the sanitiser, which allows `id` on h1–h6. */
export function rehypeHeadingIds(options: { resolve?: HeadingIdResolver } = {}) {
  return (tree: Root) => {
    const slugger = new GithubSlugger();
    let index = 0;
    visit(tree, "element", (node: Element) => {
      const match = HEADING.exec(node.tagName);
      if (!match) return;
      // A heading the pipeline already named keeps its id: the GFM footnotes heading is
      // `id="footnote-label"`, and every footnote reference points at it with aria-describedby.
      if (node.properties?.id != null) return;
      const text = textOf(node);
      const info: HeadingInfo = { depth: Number(match[1]), text, index: index++ };
      const id = options.resolve ? options.resolve(info) : slugger.slug(text);
      if (id) node.properties = { ...node.properties, id };
    });
  };
}

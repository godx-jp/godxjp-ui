import type { Blockquote, Nodes, Paragraph, Root } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";

import type { CalloutKind } from "./codec/model";
import { columnShares, readCallout, readColumns, readToggle } from "./codec/readers";
import { fromMarkdownExtensions, micromarkExtensions } from "./codec/syntax";

/** The default visible callout title per kind; a host localizes with `calloutTitles`. */
export const DEFAULT_CALLOUT_TITLES: Record<CalloutKind, string> = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
};

type Data = { micromarkExtensions?: unknown[]; fromMarkdownExtensions?: unknown[] };

type Properties = Record<string, string | number | boolean | (string | number)[] | null>;
const element = (hName: string, hProperties: Properties = {}) => ({
  hName,
  hProperties,
});

/**
 * remark plugin: grammar v1 in the RENDERER (gh#1156) — the same syntax extensions and the same
 * readers as `@godxjp/markdown/codec`, so a body is a callout / toggle / column row in `<Markdown>`
 * exactly when the codec and the editor say it is.
 *
 * - `> [!NOTE] Title` → `<div class="ui-prose-callout" data-kind role="note">` with a title line;
 * - `:::toggle[Summary]` → `<details class="ui-prose-toggle"><summary>`;
 * - `::::columns` → `<div class="ui-prose-columns">`, each column's share as `--prose-column-grow`;
 * - a container directive v1 does not model renders its content (the fences are not prose).
 */
export function remarkKitSyntax(
  options: { calloutTitles?: Partial<Record<CalloutKind, string>> } = {},
) {
  const titles = { ...DEFAULT_CALLOUT_TITLES, ...options.calloutTitles };
  // `this` is the unified processor; typed loosely so the plugin needs no `unified` dependency.
  return function (this: unknown) {
    const data = (this as { data(): Data }).data();
    (data.micromarkExtensions ??= []).push(...micromarkExtensions().slice(1)); // gfm comes from remark-gfm
    (data.fromMarkdownExtensions ??= []).push(fromMarkdownExtensions()[1]); // directives
    // Depth-first, parents before children, carrying whether we are inside a column (columns
    // never nest). Children are read AFTER the parent is rewritten, so a callout inside a column
    // or a toggle inside a callout is still found.
    const walk = (node: Nodes, inColumn: boolean) => {
      if (node.type === "blockquote") callout(node, titles);
      else if (node.type === "containerDirective") directive(node, inColumn);
      if (!("children" in node)) return;
      const isColumn = node.type === "containerDirective" && node.name === "column";
      for (const child of node.children as Nodes[]) walk(child, inColumn || isColumn);
    };
    return (tree: Root) => walk(tree, false);
  };
}

function callout(node: Blockquote, titles: Record<CalloutKind, string>) {
  const parts = readCallout(node);
  if (!parts) return;
  const title: Paragraph = {
    type: "paragraph",
    data: element("p", { className: ["ui-prose-callout-title"] }),
    children: [{ type: "text", value: parts.title ?? titles[parts.kind] }],
  };
  node.data = element("div", {
    className: ["ui-prose-callout"],
    dataKind: parts.kind,
    role: "note",
  });
  node.children = [title, ...(parts.body as Blockquote["children"])];
}

function directive(node: ContainerDirective, nested: boolean) {
  const toggle = readToggle(node);
  if (toggle) {
    const summary: Paragraph = {
      type: "paragraph",
      data: element("summary", { className: ["ui-prose-toggle-summary"] }),
      children: toggle.summary,
    };
    node.data = element("details", { className: ["ui-prose-toggle"] });
    node.children = [summary, ...(toggle.body as ContainerDirective["children"])];
    return;
  }
  const columns = readColumns(node, nested);
  if (columns) {
    const shares = columnShares(columns);
    node.data = element("div", { className: ["ui-prose-columns"] });
    node.children = columns.map((column, i) => ({
      type: "containerDirective",
      name: "column",
      attributes: {},
      data: element("div", {
        className: ["ui-prose-column"],
        style: `--prose-column-grow:${shares[i]}`,
      }),
      children: column.body as ContainerDirective["children"],
    }));
    return;
  }
  // Not modelled: show the content, drop the fence. A label paragraph stays visible as text.
  if (!node.data?.hName) node.data = element("div", { className: ["ui-prose-directive"] });
}

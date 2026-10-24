import type { Blockquote, Nodes, Paragraph, Root } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";

import type { DirectiveBlock } from "./codec/directive";
import { MODELLED_DIRECTIVES, type CalloutKind } from "./codec/model";
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
 * - a container directive v1 does not model renders its content (the fences are not prose); one
 *   whose name is in `directives` is also marked (`data-directive` + its parts as JSON in
 *   `data-directive-block`) for the host renderer `<Markdown directives>` hands it to.
 */
export function remarkKitSyntax(
  options: {
    calloutTitles?: Partial<Record<CalloutKind, string>>;
    directives?: readonly string[];
  } = {},
) {
  const titles = { ...DEFAULT_CALLOUT_TITLES, ...options.calloutTitles };
  const registered = new Set(
    (options.directives ?? []).filter((name) => !MODELLED_DIRECTIVES.includes(name)),
  );
  // `this` is the unified processor; typed loosely so the plugin needs no `unified` dependency.
  return function (this: unknown) {
    const data = (this as { data(): Data }).data();
    (data.micromarkExtensions ??= []).push(...micromarkExtensions().slice(1)); // gfm comes from remark-gfm
    // directives + front matter (GFM's comes from remark-gfm)
    (data.fromMarkdownExtensions ??= []).push(...fromMarkdownExtensions().slice(1));
    // Depth-first, parents before children, carrying whether we are inside a column (columns
    // never nest). Children are read AFTER the parent is rewritten, so a callout inside a column
    // or a toggle inside a callout is still found.
    let text = "";
    const walk = (node: Nodes, inColumn: boolean) => {
      if (node.type === "blockquote") callout(node, titles);
      else if (node.type === "containerDirective") directive(node, inColumn, registered, text);
      if (!("children" in node)) return;
      const isColumn = node.type === "containerDirective" && node.name === "column";
      for (const child of node.children as Nodes[]) walk(child, inColumn || isColumn);
    };
    return (tree: Root, file?: { value?: unknown }) => {
      text = typeof file?.value === "string" ? file.value : "";
      // Front matter is the page's properties, not its prose: never rendered (gh#1163).
      tree.children = tree.children.filter((node) => (node.type as string) !== "yaml");
      walk(tree, false);
    };
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

/** Removes the container prefix (`> `, a list item's indent) the first line sat behind. */
function unprefix(line: string, prefix: string): string {
  if (!prefix) return line;
  if (line.startsWith(prefix)) return line.slice(prefix.length);
  const bare = prefix.trimEnd();
  return bare && line.startsWith(bare) ? line.slice(bare.length) : line;
}

/**
 * A registered directive's parts, sliced from the body AS WRITTEN (no serializer in the renderer's
 * bundle): the label between its brackets, the body between the fences, the whole block — each
 * line freed of the prefix of the container it sits in (a callout's `> `, a list item's indent).
 */
function directiveSlices(node: ContainerDirective, text: string): Omit<DirectiveBlock, "name"> {
  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(node.attributes ?? {})) attributes[key] = value ?? "";
  const at = (position: Nodes["position"]) =>
    position && position.start.offset != null && position.end.offset != null
      ? { from: position.start.offset, to: position.end.offset }
      : null;
  const whole = at(node.position);
  if (!whole) return { label: null, attributes, source: "", body: "" };
  const prefix = text.slice(text.lastIndexOf("\n", whole.from - 1) + 1, whole.from);
  const slice = (from: number, to: number) =>
    text
      .slice(from, to)
      .split("\n")
      .map((line, i) => (i === 0 ? line : unprefix(line, prefix)))
      .join("\n");
  const [first, ...rest] = node.children;
  const hasLabel = first?.type === "paragraph" && Boolean(first.data?.directiveLabel);
  const label = hasLabel ? at(first.position) : null;
  const body = (hasLabel ? rest : node.children).map((child) => at(child.position));
  const start = body[0];
  const end = body[body.length - 1];
  return {
    label: label ? slice(label.from + 1, label.to - 1) : hasLabel ? "" : null,
    attributes,
    source: slice(whole.from, whole.to),
    body: start && end ? slice(start.from, end.to) : "",
  };
}

function directive(
  node: ContainerDirective,
  nested: boolean,
  registered: ReadonlySet<string>,
  text: string,
) {
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
  if (registered.has(node.name)) {
    node.data = element("div", {
      className: ["ui-prose-directive"],
      dataDirective: node.name,
      dataDirectiveBlock: JSON.stringify(directiveSlices(node, text)),
    });
    return;
  }
  if (!node.data?.hName) node.data = element("div", { className: ["ui-prose-directive"] });
}

import { Extension, Node, mergeAttributes, type Extensions } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import StarterKit from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { Image } from "@tiptap/extension-image";
import { Details, DetailsContent, DetailsSummary } from "@tiptap/extension-details";
import { Placeholder } from "@tiptap/extensions";

/**
 * THE EDITOR SCHEMA IS THE CODEC'S DOCUMENT (gh#1156). Every node `@godxjp/markdown/codec` emits
 * has a node type here with the same name and attributes, so `setContent(parse(md))` loses nothing
 * and `serialize(getJSON())` writes it back. A node the codec does not know never enters the
 * schema — underline is switched off because Markdown has no underline.
 */

export type CalloutTitles = Record<"note" | "tip" | "important" | "warning" | "caution", string>;

/** `tight` on the three list types: a loose list's blank lines survive a round trip. */
const ListTightness = Extension.create({
  name: "listTightness",
  addGlobalAttributes() {
    return [
      {
        types: ["bulletList", "orderedList", "taskList"],
        attributes: {
          tight: {
            default: true,
            parseHTML: (element) => element.getAttribute("data-tight") !== "false",
            renderHTML: (attrs) => ({ "data-tight": attrs.tight ? "true" : "false" }),
          },
        },
      },
    ];
  },
});

/** GFM column alignment on header and body cells. */
const CellAlignment = Extension.create({
  name: "cellAlignment",
  addGlobalAttributes() {
    return [
      {
        types: ["tableHeader", "tableCell"],
        attributes: {
          align: {
            default: null,
            parseHTML: (element) => element.style.textAlign || null,
            renderHTML: (attrs) => (attrs.align ? { style: `text-align:${attrs.align}` } : {}),
          },
        },
      },
    ];
  },
});

export const Callout = Node.create<{ titles: CalloutTitles }>({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addOptions() {
    return {
      titles: { note: "Note", tip: "Tip", important: "Important", warning: "Warning", caution: "Caution" },
    };
  },
  addAttributes() {
    return {
      kind: { default: "note" },
      title: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="callout"]', contentElement: "div[data-callout-body]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const kind = node.attrs.kind as keyof CalloutTitles;
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "callout",
        "data-kind": kind,
        class: "ui-prose-callout",
        role: "note",
      }),
      [
        "p",
        { class: "ui-prose-callout-title", contenteditable: "false" },
        (node.attrs.title as string | null) ?? this.options.titles[kind] ?? kind,
      ],
      ["div", { "data-callout-body": "" }, 0],
    ];
  },
});

/** Each column's share of the row: its own width, or an equal split of what the widths leave. */
function shares(widths: (number | null)[]): number[] {
  const explicit = widths.reduce<number>((sum, w) => sum + (w ?? 0), 0);
  const open = widths.filter((w) => w == null).length;
  const each = open ? Math.max(1, (100 - explicit) / open) : 0;
  return widths.map((w) => w ?? Math.round(each * 100) / 100);
}

export const Columns = Node.create({
  name: "columns",
  group: "block",
  content: "column{2,4}",
  defining: true,
  isolating: true,
  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "columns", class: "ui-prose-columns" }), 0];
  },
  addProseMirrorPlugins() {
    // The renderer writes each column's share as `--prose-column-grow`; the editor does the same
    // with a node decoration, because a column's share depends on its SIBLINGS' widths.
    return [
      new Plugin({
        key: new PluginKey("columnShares"),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = [];
            state.doc.descendants((node, pos) => {
              if (node.type.name !== "columns") return true;
              const widths: (number | null)[] = [];
              node.forEach((column) => widths.push((column.attrs.width as number | null) ?? null));
              const grow = shares(widths);
              node.forEach((column, offset, index) => {
                const from = pos + 1 + offset;
                decorations.push(
                  Decoration.node(from, from + column.nodeSize, {
                    style: `--prose-column-grow:${grow[index]}`,
                  }),
                );
              });
              return true;
            });
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

export const Column = Node.create({
  name: "column",
  content: "block+",
  isolating: true,
  addAttributes() {
    return { width: { default: null } };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "column", class: "ui-prose-column" }), 0];
  },
});

/** `[[target#heading|label]]` — an atom: it is one thing to the caret, Backspace removes it whole. */
export const Wikilink = Node.create({
  name: "wikilink",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return { target: { default: "" }, heading: { default: null }, label: { default: null } };
  },
  parseHTML() {
    return [{ tag: "span[data-wikilink]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const { target, heading, label } = node.attrs as { target: string; heading: string | null; label: string | null };
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-wikilink": target, class: "ui-block-editor-wikilink" }),
      label ?? (heading ? `${target}#${heading}` : target),
    ];
  },
  renderText({ node }) {
    const { target, heading, label } = node.attrs as { target: string; heading: string | null; label: string | null };
    return `[[${target}${heading ? `#${heading}` : ""}${label ? `|${label}` : ""}]]`;
  },
});

export const EmbedInline = Node.create({
  name: "embedInline",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return { target: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "span[data-embed]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-embed": node.attrs.target, class: "ui-block-editor-embed-inline" }),
      `![[${node.attrs.target as string}]]`,
    ];
  },
  renderText({ node }) {
    return `![[${node.attrs.target as string}]]`;
  },
});

export const RawInline = Node.create({
  name: "rawInline",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return { source: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "code[data-raw-inline]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "code",
      mergeAttributes(HTMLAttributes, { "data-raw-inline": "", class: "ui-block-editor-raw-inline" }),
      node.attrs.source as string,
    ];
  },
  renderText({ node }) {
    return node.attrs.source as string;
  },
});

/** `![[target]]` alone on its line. The component swaps in the host's renderer as a node view. */
export const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { target: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "div[data-embed]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-embed": node.attrs.target, class: "ui-block-editor-embed" }),
      `![[${node.attrs.target as string}]]`,
    ];
  },
});

/**
 * Markdown the document does not model (raw HTML, a footnote definition, a malformed directive),
 * kept as its source so nothing is lost. The component gives it an editable node view.
 */
export const RawBlock = Node.create({
  name: "rawBlock",
  group: "block",
  atom: true,
  addAttributes() {
    return { source: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "pre[data-raw-block]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "pre",
      mergeAttributes(HTMLAttributes, { "data-raw-block": "", class: "ui-block-editor-raw-block" }),
      node.attrs.source as string,
    ];
  },
});

/**
 * The editor's extensions. Block atoms that need React — the host's embed renderer, the raw
 * Markdown block, an upload in flight — are added by the component, which owns their node views.
 */
export function schemaExtensions(options: {
  placeholder: string;
  headingPlaceholder: (level: number) => string;
  togglePlaceholder: string;
  calloutTitles: CalloutTitles;
  /** Node views the component owns (React); omitted, the nodes render as plain HTML. */
  embed?: Node;
  rawBlock?: Node;
}): Extensions {
  return [
    StarterKit.configure({
      underline: false,
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: null },
      },
      heading: { levels: [1, 2, 3, 4, 5, 6] },
    }),
    ListTightness,
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    CellAlignment,
    Image.configure({ inline: true, allowBase64: false }),
    Details.configure({ persist: false }),
    DetailsSummary,
    DetailsContent,
    Callout.configure({ titles: options.calloutTitles }),
    Columns,
    Column,
    Wikilink,
    EmbedInline,
    RawInline,
    options.embed ?? Embed,
    options.rawBlock ?? RawBlock,
    Placeholder.configure({
      includeChildren: true,
      placeholder: ({ node }) => {
        if (node.type.name === "heading") return options.headingPlaceholder(node.attrs.level as number);
        if (node.type.name === "detailsSummary") return options.togglePlaceholder;
        return options.placeholder;
      },
    }),
  ];
}

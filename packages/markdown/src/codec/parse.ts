import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import type { Blockquote, Nodes, Paragraph, PhrasingContent, Root, RootContent } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";

import type { Doc, DocNode, Mark } from "./model";
import { readCallout, readColumns, readToggle } from "./readers";
import { fromMarkdownExtensions, micromarkExtensions } from "./syntax";
import { toMarkdownOptions } from "./options";

/**
 * `![[embed]]` (inner text verbatim — `![[B#見出し]]`, `![[img.png|300]]`) or a wikilink:
 * `[[target]]`, `[[target#heading]]`, `[[target|label]]`. Obsidian/wiki form.
 */
const WIKILINK = /!\[\[([^[\]\n]+)\]\]|\[\[([^[\]\n|#]+)(?:#([^[\]\n|]+))?(?:\|([^[\]\n]+))?\]\]/g;

export function parseMdast(markdown: string): Root {
  return fromMarkdown(markdown, {
    extensions: micromarkExtensions(),
    mdastExtensions: fromMarkdownExtensions(),
  });
}

/** A node the document does not model, kept as Markdown that parses back to the same thing. */
function raw(node: Nodes, inline: boolean): DocNode {
  const source =
    node.type === "html" ? node.value : toMarkdown(node, toMarkdownOptions()).replace(/\n+$/, "");
  return { type: inline ? "rawInline" : "rawBlock", attrs: { source } };
}

function withMark(marks: Mark[], mark: Mark): Mark[] {
  return [...marks, mark];
}

function text(value: string, marks: Mark[]): DocNode[] {
  const out: DocNode[] = [];
  let last = 0;
  for (const match of value.matchAll(WIKILINK)) {
    const at = match.index!;
    if (at > last) out.push(leafText(value.slice(last, at), marks));
    const [, embed, target, heading, label] = match;
    out.push(
      withMarks(
        embed !== undefined
          ? { type: "embedInline", attrs: { target: embed } }
          : {
              type: "wikilink",
              attrs: {
                target: target!.trim(),
                heading: heading?.trim() ?? null,
                label: label ?? null,
              },
            },
        marks,
      ),
    );
    last = at + match[0].length;
  }
  if (last < value.length) out.push(leafText(value.slice(last), marks));
  return out;
}

/** An inline atom keeps the marks around it: `**[[x]]**`, `[![img](a)](b)`, `**a  \nb**`. */
function withMarks(node: DocNode, marks: Mark[]): DocNode {
  return marks.length ? { ...node, marks } : node;
}

function leafText(value: string, marks: Mark[]): DocNode {
  return marks.length ? { type: "text", text: value, marks } : { type: "text", text: value };
}

function inline(nodes: PhrasingContent[], marks: Mark[] = []): DocNode[] {
  return nodes.flatMap((node): DocNode[] => {
    switch (node.type) {
      case "text":
        return text(node.value, marks);
      case "emphasis":
        return inline(node.children, withMark(marks, { type: "italic" }));
      case "strong":
        return inline(node.children, withMark(marks, { type: "bold" }));
      case "delete":
        return inline(node.children, withMark(marks, { type: "strike" }));
      case "inlineCode":
        return [leafText(node.value, withMark(marks, { type: "code" }))];
      case "link":
        return inline(
          node.children,
          withMark(marks, { type: "link", attrs: { href: node.url, title: node.title ?? null } }),
        );
      case "image":
        return [
          withMarks(
            {
              type: "image",
              attrs: { src: node.url, alt: node.alt ?? "", title: node.title ?? null },
            },
            marks,
          ),
        ];
      case "break":
        return [withMarks({ type: "hardBreak" }, marks)];
      default:
        // inline HTML, footnote / link / image references
        return [withMarks(raw(node, true), marks)];
    }
  });
}

function paragraph(node: Paragraph): DocNode[] {
  const content = inline(node.children);
  // `![[x]]` alone in its paragraph is a BLOCK embed.
  if (content.length === 1 && content[0]!.type === "embedInline" && !content[0]!.marks) {
    return [{ type: "embed", attrs: { ...content[0]!.attrs } }];
  }
  return [content.length ? { type: "paragraph", content } : { type: "paragraph" }];
}

function blocks(nodes: RootContent[], depth: { columns: boolean }): DocNode[] {
  return nodes.flatMap((node) => block(node, depth));
}

function callout(node: Blockquote, depth: { columns: boolean }): DocNode | null {
  const parts = readCallout(node);
  if (!parts) return null;
  return {
    type: "callout",
    attrs: { kind: parts.kind, title: parts.title },
    content: blocks(parts.body, depth),
  };
}

/**
 * A blockquote that LOOKS like an alert but is not one v1 models — an Obsidian fold
 * (`[!NOTE]-`), an unknown kind, a title with formatting — keeps its marker verbatim instead of
 * having its `[` escaped on the way out.
 */
const MARKER = /^\[![A-Za-z]+\][+-]?/;
function keepMarker(children: RootContent[]): RootContent[] {
  const [first, ...rest] = children;
  if (first?.type !== "paragraph") return children;
  const [head, ...tail] = first.children;
  const marker = head?.type === "text" ? MARKER.exec(head.value)?.[0] : undefined;
  if (!marker || head?.type !== "text") return children;
  const remainder = head.value.slice(marker.length);
  return [
    {
      ...first,
      children: [
        { type: "html", value: marker },
        ...(remainder ? [{ ...head, value: remainder }] : []),
        ...tail,
      ],
    },
    ...rest,
  ];
}

function directiveBlock(node: ContainerDirective, depth: { columns: boolean }): DocNode {
  const toggle = readToggle(node);
  if (toggle) {
    const summary = inline(toggle.summary);
    return {
      type: "details",
      content: [
        summary.length ? { type: "detailsSummary", content: summary } : { type: "detailsSummary" },
        { type: "detailsContent", content: nonEmpty(blocks(toggle.body, depth)) },
      ],
    };
  }
  const columns = readColumns(node, depth.columns);
  if (columns) {
    return {
      type: "columns",
      content: columns.map((column) => ({
        type: "column",
        attrs: { width: column.width },
        content: nonEmpty(blocks(column.body, { columns: true })),
      })),
    };
  }
  return raw(node, false);
}

function nonEmpty(content: DocNode[]): DocNode[] {
  return content.length ? content : [{ type: "paragraph" }];
}

function block(node: RootContent, depth: { columns: boolean }): DocNode[] {
  switch (node.type) {
    case "paragraph":
      return paragraph(node);
    case "heading": {
      const content = inline(node.children);
      return [
        { type: "heading", attrs: { level: node.depth }, ...(content.length ? { content } : {}) },
      ];
    }
    case "thematicBreak":
      return [{ type: "horizontalRule" }];
    case "code":
      // A fence meta (```js title=x) has nowhere to live in the document: keep the block raw.
      if (node.meta) return [raw(node, false)];
      return [
        {
          type: "codeBlock",
          attrs: { language: node.lang ?? null },
          ...(node.value ? { content: [{ type: "text", text: node.value }] } : {}),
        },
      ];
    case "blockquote":
      return [
        callout(node, depth) ?? {
          type: "blockquote",
          content: nonEmpty(blocks(keepMarker(node.children), depth)),
        },
      ];
    case "list": {
      const tasks = node.children.map((item) => typeof item.checked === "boolean");
      if (tasks.some(Boolean) && !tasks.every(Boolean)) return [raw(node, false)];
      const isTask = tasks.length > 0 && tasks.every(Boolean);
      const tight = !node.spread && node.children.every((item) => !item.spread);
      const items = node.children.map((item) => ({
        type: isTask ? "taskItem" : "listItem",
        ...(isTask ? { attrs: { checked: item.checked === true } } : {}),
        content: nonEmpty(blocks(item.children, depth)),
      }));
      if (isTask) return [{ type: "taskList", attrs: { tight }, content: items }];
      return node.ordered
        ? [{ type: "orderedList", attrs: { start: node.start ?? 1, tight }, content: items }]
        : [{ type: "bulletList", attrs: { tight }, content: items }];
    }
    case "table": {
      // GFM ignores cells beyond the header's count; keeping them would turn hidden text into a
      // visible column on the next save (a render change), so the header fixes the width.
      const width = node.children[0]?.children.length ?? 0;
      return [
        {
          type: "table",
          content: node.children.map((row, r) => ({
            type: "tableRow",
            content: row.children.slice(0, width).map((cell, c) => {
              const content = inline(cell.children);
              return {
                type: r === 0 ? "tableHeader" : "tableCell",
                attrs: { align: node.align?.[c] ?? null },
                content: [content.length ? { type: "paragraph", content } : { type: "paragraph" }],
              };
            }),
          })),
        },
      ];
    }
    case "containerDirective":
      return [directiveBlock(node, depth)];
    case "yaml":
      // Front matter: the page's own properties, verbatim (gh#1163).
      return [{ type: "frontmatter", attrs: { source: node.value } }];
    default:
      // html, definition, footnoteDefinition, and anything else the document does not model
      return [raw(node, false)];
  }
}

/** Markdown → document (plain JSON, ProseMirror/Tiptap shape). Pure: no DOM. */
export function parse(markdown: string): Doc {
  const content = blocks(parseMdast(markdown.replace(/\r\n?/g, "\n")).children, { columns: false });
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

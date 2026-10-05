import { toMarkdown } from "mdast-util-to-markdown";
import type { BlockContent, Paragraph, PhrasingContent, Root, RootContent, TableCell } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";

import type { Doc, DocNode, Mark } from "./model";
import { toMarkdownOptions } from "./options";
import { parse } from "./parse";

const MARK_RANK = ["link", "bold", "italic", "strike"] as const;

const hasMark = (node: DocNode, type: string) => node.marks?.some((m) => m.type === type) ?? false;
const linkOf = (node: DocNode) =>
  node.marks?.find((m) => m.type === "link") as Extract<Mark, { type: "link" }> | undefined;
const sameLink = (a: DocNode, b: DocNode) =>
  linkOf(a)?.attrs.href === linkOf(b)?.attrs.href &&
  linkOf(a)?.attrs.title === linkOf(b)?.attrs.title;

function wikilinkSource(node: DocNode, inTable: boolean): string {
  const a = node.attrs as { target: string; heading?: string | null; label?: string | null };
  const pipe = inTable ? "\\|" : "|";
  return `[[${a.target}${a.heading ? `#${a.heading}` : ""}${a.label ? `${pipe}${a.label}` : ""}]]`;
}

function leaf(node: DocNode, inTable: boolean): PhrasingContent[] {
  switch (node.type) {
    case "text":
      return hasMark(node, "code")
        ? [{ type: "inlineCode", value: node.text ?? "" }]
        : [{ type: "text", value: node.text ?? "" }];
    case "hardBreak":
      return [{ type: "break" }];
    case "image": {
      const a = node.attrs as { src: string; alt?: string | null; title?: string | null };
      return [{ type: "image", url: a.src, alt: a.alt ?? "", title: a.title ?? null }];
    }
    case "wikilink":
      return [{ type: "html", value: wikilinkSource(node, inTable) }];
    case "embedInline":
      return [{ type: "html", value: `![[${(node.attrs as { target: string }).target}]]` }];
    case "rawInline":
      return [{ type: "html", value: String((node.attrs as { source: string }).source) }];
    default:
      return [];
  }
}

/** Flat marks → nested mdast, in a fixed rank so one document always gives one Markdown. */
function phrasing(nodes: DocNode[], inTable = false, rank = 0): PhrasingContent[] {
  if (rank === MARK_RANK.length) return nodes.flatMap((n) => leaf(n, inTable));
  const mark = MARK_RANK[rank]!;
  const out: PhrasingContent[] = [];
  let i = 0;
  while (i < nodes.length) {
    const start = nodes[i]!;
    const marked = hasMark(start, mark);
    let j = i + 1;
    while (
      j < nodes.length &&
      hasMark(nodes[j]!, mark) === marked &&
      (!marked || mark !== "link" || sameLink(start, nodes[j]!))
    ) {
      j++;
    }
    const inner = phrasing(nodes.slice(i, j), inTable, rank + 1);
    if (!marked) out.push(...inner);
    else if (mark === "link") {
      const { href, title } = linkOf(start)!.attrs;
      out.push({ type: "link", url: href, title, children: inner });
    } else if (mark === "bold") out.push({ type: "strong", children: inner });
    else if (mark === "italic") out.push({ type: "emphasis", children: inner });
    else out.push({ type: "delete", children: inner });
    i = j;
  }
  return out;
}

const content = (node: DocNode) => node.content ?? [];

function paragraphOf(node: DocNode): Paragraph {
  return { type: "paragraph", children: phrasing(content(node)) };
}

function flow(nodes: DocNode[]): RootContent[] {
  return nodes.flatMap(block);
}

function block(node: DocNode): RootContent[] {
  const attrs = (node.attrs ?? {}) as Record<string, unknown>;
  switch (node.type) {
    case "paragraph":
      return [paragraphOf(node)];
    case "heading":
      return [
        {
          type: "heading",
          depth: Math.min(6, Math.max(1, Number(attrs.level) || 1)) as 1,
          children: phrasing(content(node)),
        },
      ];
    case "horizontalRule":
      return [{ type: "thematicBreak" }];
    case "codeBlock":
      return [
        {
          type: "code",
          lang: (attrs.language as string | null) ?? null,
          meta: null,
          value: content(node)
            .map((t) => t.text ?? "")
            .join(""),
        },
      ];
    case "blockquote":
      return [{ type: "blockquote", children: flow(content(node)) as BlockContent[] }];
    case "callout": {
      const marker = `[!${String(attrs.kind).toUpperCase()}]`;
      const head: Paragraph = {
        type: "paragraph",
        children: [
          { type: "html", value: marker },
          ...(attrs.title ? [{ type: "text" as const, value: ` ${String(attrs.title)}` }] : []),
        ],
      };
      return [{ type: "blockquote", children: [head, ...(flow(content(node)) as BlockContent[])] }];
    }
    case "bulletList":
    case "orderedList":
    case "taskList": {
      const tight = attrs.tight !== false;
      return [
        {
          type: "list",
          ordered: node.type === "orderedList",
          start: node.type === "orderedList" ? Number(attrs.start ?? 1) : null,
          spread: !tight,
          children: content(node).map((item) => ({
            type: "listItem",
            spread: !tight,
            checked:
              node.type === "taskList"
                ? (item.attrs as { checked?: boolean })?.checked === true
                : null,
            children: flow(content(item)) as BlockContent[],
          })),
        },
      ];
    }
    case "table": {
      const rows = content(node);
      const align = content(rows[0] ?? { type: "tableRow" }).map(
        (cell) => ((cell.attrs as { align?: string | null })?.align ?? null) as "left" | null,
      );
      return [
        {
          type: "table",
          align,
          children: rows.map((row) => ({
            type: "tableRow",
            children: content(row).map((cell): TableCell => ({
              type: "tableCell",
              children: phrasing(
                content(cell).flatMap((p) => content(p)),
                true,
              ),
            })),
          })),
        },
      ];
    }
    case "details": {
      const [summary, body] = [
        content(node).find((n) => n.type === "detailsSummary"),
        content(node).find((n) => n.type === "detailsContent"),
      ];
      const label =
        summary && content(summary).length
          ? [
              {
                type: "paragraph",
                data: { directiveLabel: true },
                children: phrasing(content(summary)),
              } as Paragraph,
            ]
          : [];
      return [
        {
          type: "containerDirective",
          name: "toggle",
          attributes: {},
          children: [
            ...label,
            ...(flow(content(body ?? { type: "detailsContent" })) as BlockContent[]),
          ],
        },
      ];
    }
    case "columns":
      return [
        {
          type: "containerDirective",
          name: "columns",
          attributes: {},
          children: content(node).map((column): ContainerDirective => ({
            type: "containerDirective",
            name: "column",
            attributes:
              (column.attrs as { width?: number | null })?.width != null
                ? { width: String((column.attrs as { width: number }).width) }
                : {},
            children: flow(content(column)) as BlockContent[],
          })),
        },
      ];
    case "embed":
      return [{ type: "html", value: `![[${String(attrs.target)}]]` }];
    case "rawBlock":
      return [{ type: "html", value: String(attrs.source) }];
    case "frontmatter":
      return [{ type: "yaml", value: String(attrs.source) } as RootContent];
    default:
      return [];
  }
}

/**
 * `mdast-util-to-markdown` judges emphasis by CommonMark's flanking rules, so next to CJK it
 * writes the neighbouring character as a reference — `&#x306E;**「強調」**&#x3067;す` — to keep the
 * asterisks parseable. Our parser is CJK-friendly (it reads `の**「強調」**です` as strong), so each
 * reference is decoded back to its character wherever the result parses to the SAME document:
 * verified, never assumed. Text never yields a reference otherwise — a literal `&` is escaped.
 */
function decodeAttentionReferences(markdown: string): string {
  const references = [...markdown.matchAll(/&#x([0-9A-F]+);/g)];
  if (references.length === 0) return markdown;
  const target = JSON.stringify(parse(markdown));
  let out = markdown;
  for (const reference of references.reverse()) {
    const at = reference.index!;
    const candidate =
      out.slice(0, at) +
      String.fromCodePoint(Number.parseInt(reference[1]!, 16)) +
      out.slice(at + reference[0].length);
    if (JSON.stringify(parse(candidate)) === target) out = candidate;
  }
  return out;
}

/** Document → canonical Markdown. Pure: no DOM. */
export function serialize(doc: Doc | DocNode): string {
  const root: Root = { type: "root", children: flow(doc.content ?? []) };
  // An empty paragraph serializes to nothing; drop the blank lines it would leave.
  const markdown = toMarkdown(root, toMarkdownOptions());
  if (markdown.trim() === "") return "";
  // Empty paragraphs (an editor keeps one at the end, and after a deleted block) serialize to
  // nothing; neither they nor the blank lines around them belong in the stored body.
  const tidy = markdown
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "\n");
  return decodeAttentionReferences(tidy);
}

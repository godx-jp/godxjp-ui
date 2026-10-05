import type { Blockquote, Paragraph, PhrasingContent, RootContent } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";

import { CALLOUT_KINDS, COLUMNS_MAX, COLUMNS_MIN, type CalloutKind } from "./model";

/**
 * Grammar v1, read off the syntax tree ONCE and shared by the codec and the renderer (gh#1156): a
 * body can never be a callout to one and a plain quote to the other.
 */

const CALLOUT = /^\[!([A-Za-z]+)\](?:[ \t]+([^\n]*))?$/;

export type CalloutParts = { kind: CalloutKind; title: string | null; body: RootContent[] };

/** `> [!NOTE] Optional title` + body. The marker line must be plain text. */
export function readCallout(node: Blockquote): CalloutParts | null {
  const [first, ...rest] = node.children;
  if (first?.type !== "paragraph") return null;
  const [head, ...tail] = first.children;
  if (head?.type !== "text") return null;
  const newline = head.value.indexOf("\n");
  if (newline === -1 && tail.length > 0) return null;
  const line = newline === -1 ? head.value : head.value.slice(0, newline);
  const match = CALLOUT.exec(line);
  const kind = match?.[1]?.toLowerCase() as CalloutKind | undefined;
  if (!match || !kind || !CALLOUT_KINDS.includes(kind)) return null;
  const remainder: PhrasingContent[] = [
    ...(newline === -1 ? [] : [{ ...head, value: head.value.slice(newline + 1) }]),
    ...tail,
  ].filter((n) => !(n.type === "text" && n.value === ""));
  return {
    kind,
    title: match[2]?.trim() || null,
    body: [
      ...(remainder.length ? [{ type: "paragraph", children: remainder } as Paragraph] : []),
      ...rest,
    ],
  };
}

function labelOf(node: ContainerDirective): Paragraph | null {
  const first = node.children[0];
  return first?.type === "paragraph" && first.data?.directiveLabel ? first : null;
}

/** `:::toggle[Summary]` — no attributes. */
export function readToggle(
  node: ContainerDirective,
): { summary: PhrasingContent[]; body: RootContent[] } | null {
  if (node.name !== "toggle" || Object.keys(node.attributes ?? {}).length > 0) return null;
  const label = labelOf(node);
  return {
    summary: label?.children ?? [],
    body: (label ? node.children.slice(1) : node.children) as RootContent[],
  };
}

export type ColumnParts = { width: number | null; body: RootContent[] };

/**
 * `::::columns` holding 2–4 `:::column{width=N}` and nothing else, never inside another column
 * (`nested`). Widths are integer percents 1–100.
 */
export function readColumns(node: ContainerDirective, nested: boolean): ColumnParts[] | null {
  if (
    node.name !== "columns" ||
    nested ||
    labelOf(node) ||
    Object.keys(node.attributes ?? {}).length
  ) {
    return null;
  }
  const columns = node.children;
  if (columns.length < COLUMNS_MIN || columns.length > COLUMNS_MAX) return null;
  const parts: ColumnParts[] = [];
  for (const column of columns) {
    if (column.type !== "containerDirective" || column.name !== "column" || labelOf(column))
      return null;
    const attributes = Object.entries(column.attributes ?? {});
    if (attributes.length > 1) return null;
    let width: number | null = null;
    if (attributes.length === 1) {
      const [key, value] = attributes[0]!;
      if (key !== "width" || typeof value !== "string" || !/^(?:[1-9]\d?|100)$/.test(value))
        return null;
      width = Number(value);
    }
    parts.push({ width, body: column.children as RootContent[] });
  }
  return parts;
}

/**
 * Each column's share of the row: its own width, or an equal split of what the explicit widths
 * leave (never below 1, so an over-full row still shows every column).
 */
export function columnShares(columns: readonly { width: number | null }[]): number[] {
  const explicit = columns.reduce((sum, c) => sum + (c.width ?? 0), 0);
  const open = columns.filter((c) => c.width == null).length;
  const each = open ? Math.max(1, (100 - explicit) / open) : 0;
  return columns.map((c) => c.width ?? Math.round(each * 100) / 100);
}

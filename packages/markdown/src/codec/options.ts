import type { Info, Options, State } from "mdast-util-to-markdown";
import type { Paragraph, Root, RootContent } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";

import { toMarkdownFrontmatter, toMarkdownGfm } from "./syntax";

/**
 * Container directives, written by hand: `mdast-util-directive`'s own serializer also registers
 * an "unsafe" rule that escapes every `:` followed by a letter or digit in prose (`10:30` →
 * `10\:30`), which is wrong for a syntax where only `:::` fences exist.
 *
 * The fence is one colon longer than the longest fence anywhere in the body — measured on the
 * serialized body, not counted from directive nodes, because a raw block (a malformed row kept
 * verbatim) carries fences the tree cannot see. The innermost fence is therefore `:::`.
 */
function containerDirective(
  node: ContainerDirective,
  _: unknown,
  state: State,
  info: Info,
): string {
  const tracker = state.createTracker(info);
  const [first, ...rest] = node.children;
  const hasLabel = first?.type === "paragraph" && first.data?.directiveLabel;
  const label = hasLabel
    ? `[${state.containerPhrasing(first as Paragraph, { ...tracker.current(), before: "[", after: "]" })}]`
    : "";
  const attributes = Object.entries(node.attributes ?? {})
    .map(([key, value]) =>
      value === "" || value == null
        ? key
        : `${key}=${/^[\w.-]+$/.test(String(value)) ? value : JSON.stringify(value)}`,
    )
    .join(" ");
  const opening = `${node.name}${label}${attributes ? `{${attributes}}` : ""}`;
  const body = state.containerFlow(
    { type: "root", children: (hasLabel ? rest : node.children) as RootContent[] } as Root,
    tracker.current(),
  );
  const longest = Math.max(2, ...[...body.matchAll(/^[ \t>]*(:{3,})/gm)].map((m) => m[1]!.length));
  const fence = ":".repeat(longest + 1);
  return body ? `${fence}${opening}\n${body}\n${fence}` : `${fence}${opening}\n${fence}`;
}

/**
 * CANONICAL serialization (grammar v1): ATX headings, `-` bullets, `1.` ordered lists, `*em*`,
 * `**strong**`, ``` fences, `---` rules, one blank line between blocks, LF, trailing newline.
 */
export function toMarkdownOptions(): Options {
  return {
    bullet: "-",
    bulletOther: "*",
    emphasis: "*",
    strong: "*",
    fence: "`",
    fences: true,
    rule: "-",
    listItemIndent: "one",
    incrementListMarker: true,
    setext: false,
    closeAtx: false,
    resourceLink: false,
    extensions: [
      toMarkdownGfm(),
      toMarkdownFrontmatter(),
      { handlers: { containerDirective: containerDirective as never } },
    ],
  };
}

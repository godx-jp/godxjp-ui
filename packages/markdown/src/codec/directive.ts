import { toMarkdown } from "mdast-util-to-markdown";
import type { Paragraph, Root, RootContent } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";

import { toMarkdownOptions } from "./options";

/**
 * DIRECTIVE BLOCKS: a container directive the kit does not model itself (`:::poll[…]{…}`,
 * `::::form`), read once so the codec, the renderer and the block editor hand a host the same
 * parts. Here everything is the CANONICAL Markdown the codec writes (what the editor saves);
 * `<Markdown directives>` slices the same parts from the body as written, which is the same text for
 * a body the editor saved.
 */
export type DirectiveBlock = {
  /** The directive's name: `poll` for `:::poll`. */
  name: string;
  /** The `[label]` as inline Markdown, or `null` when the directive has none. */
  label: string | null;
  /** The `{…}` attributes; a bare flag (`{anonymous}`) is `""`, `{#x}` is `id`, `{.x}` is `class`. */
  attributes: Record<string, string>;
  /** The whole directive, fences included: canonical from the codec, as written from `<Markdown>`. */
  source: string;
  /** The content between the fences (without the label) as Markdown; `""` when empty. */
  body: string;
};

const markdownOf = (node: Root | Paragraph | ContainerDirective) =>
  toMarkdown(node, toMarkdownOptions()).replace(/\n+$/, "");

/** The parts of a container directive node (mdast). */
export function directiveParts(node: ContainerDirective): DirectiveBlock {
  const [first, ...rest] = node.children;
  const hasLabel = first?.type === "paragraph" && Boolean(first.data?.directiveLabel);
  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(node.attributes ?? {})) attributes[key] = value ?? "";
  return {
    name: node.name,
    label: hasLabel
      ? markdownOf({ type: "paragraph", children: (first as Paragraph).children })
      : null,
    attributes,
    source: markdownOf(node),
    body: markdownOf({
      type: "root",
      children: (hasLabel ? rest : node.children) as RootContent[],
    }),
  };
}

import { MarkdownCore, type MarkdownProps, type MarkdownRuntime } from "./core";
import { rehypeHighlight } from "./highlight";
import { rehypeMath } from "./math";

export { MARKDOWN_FORMAT, RENDERER_VERSION } from "./core";
export type { DirectiveRenderer, DirectiveRenderProps, MarkdownProps } from "./core";

/** KaTeX and the code tokeniser, bundled in: the output is final on the first, synchronous render. */
const EAGER: MarkdownRuntime = { math: rehypeMath, highlight: rehypeHighlight };

/**
 * THE ONE RENDERER (gh#1108) — the deterministic entry: math and code colour are drawn in the same
 * synchronous render, on a server, in a Worker and in a browser alike. `@godxjp/markdown/lazy` is
 * the same component with those two engines loaded only when a body needs them.
 */
export function Markdown(props: MarkdownProps) {
  return <MarkdownCore {...props} runtime={EAGER} />;
}

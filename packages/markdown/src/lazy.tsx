import * as React from "react";
import type { Nodes, Root } from "mdast";

import { parseMdast } from "./codec/parse";
import { MarkdownCore, type MarkdownProps, type MarkdownRuntime } from "./core";

export { MARKDOWN_FORMAT, RENDERER_VERSION } from "./core";
export type { DirectiveRenderer, DirectiveRenderProps, MarkdownProps } from "./core";
export type { DirectiveBlock } from "./codec/directive";
export { markdownSchema, extendSchema, safeUrl } from "./schema";
export type { SchemaExtension } from "./schema";
export { rehypeHeadingIds } from "./headings";
export type { HeadingIdResolver, HeadingInfo } from "./headings";
export { MermaidDiagram, checkMermaidSvg } from "./mermaid";
export type { MermaidDiagramProps, MermaidSvgCheck } from "./mermaid";
export { MARKDOWN_FIXTURES } from "./fixtures";
export type { MarkdownFixture } from "./fixtures";

/**
 * `@godxjp/markdown/lazy` — the same renderer, with KaTeX (+ its stylesheet) and the code
 * tokeniser (highlight.js through lowlight) left out of the host's entry chunk: each is imported
 * the first time a rendered body NEEDS it — math (`$…$`, `$$…$$`, a ```math fence) or a fence with
 * a language — and the body re-renders once it has arrived.
 *
 * Why a second entry rather than the default: until an engine has arrived, the body shows the
 * same fallback as `highlight={false}` and an unloaded formula (TeX in `code.language-math`). A
 * server render or a Worker cannot wait inside a synchronous render, so the default entry stays
 * eager and deterministic. A server rendering with this entry awaits `preloadMarkdownRuntime(body)`
 * first, and a client hydrating server HTML does the same before `hydrateRoot`, or the first
 * client render will not match. `RENDERER_VERSION` describes the finished output, which is the
 * same from both entries; the fallback is a loading state, never stored.
 */

type Needs = { math: boolean; highlight: boolean };

const loaded: { math?: MarkdownRuntime["math"]; highlight?: MarkdownRuntime["highlight"] } = {};
let mathLoad: Promise<void> | undefined;
let highlightLoad: Promise<void> | undefined;

function loadMath(): Promise<void> {
  mathLoad ??= Promise.all([
    import("./math"),
    // The stylesheet only where there is a document to style (a server has none, and cannot
    // import CSS).
    typeof document === "undefined" ? undefined : import("./katex-styles"),
  ]).then(
    ([math]) => {
      loaded.math = math.rehypeMath;
    },
    (error: unknown) => {
      mathLoad = undefined; // a failed chunk may be retried by the next render
      throw error;
    },
  );
  return mathLoad;
}

function loadHighlight(): Promise<void> {
  highlightLoad ??= import("./highlight").then(
    (highlight) => {
      loaded.highlight = highlight.rehypeHighlight;
    },
    (error: unknown) => {
      highlightLoad = undefined;
      throw error;
    },
  );
  return highlightLoad;
}

/** What a parsed body needs: math nodes / a ```math fence, and a fence in some language. */
function needsOf(tree: Root): Needs {
  const needs: Needs = { math: false, highlight: false };
  const walk = (node: Nodes) => {
    if (node.type === "inlineMath" || node.type === "math") needs.math = true;
    else if (node.type === "code" && node.lang) {
      if (node.lang === "math") needs.math = true;
      else if (node.lang !== "mermaid") needs.highlight = true;
    }
    if ("children" in node) for (const child of node.children as Nodes[]) walk(child);
  };
  walk(tree);
  return needs;
}

/**
 * Loads the engines a body needs (both when `markdown` is omitted). Await it before a server
 * render or a hydration that must match the eager entry's HTML.
 */
export function preloadMarkdownRuntime(markdown?: string): Promise<void> {
  const needs =
    markdown === undefined ? { math: true, highlight: true } : needsOf(parseMdast(markdown));
  return Promise.all([
    needs.math ? loadMath() : undefined,
    needs.highlight ? loadHighlight() : undefined,
  ]).then(() => undefined);
}

/** `<Markdown>` with its engines loaded on demand (see the module comment). Same props. */
export function Markdown(props: MarkdownProps) {
  const needs = React.useRef<Needs>({ math: false, highlight: false });
  const [, rerender] = React.useReducer((n: number) => n + 1, 0);
  // Runs last among the remark plugins, so it sees the body exactly as the renderer parsed it.
  const probe = React.useMemo(
    () => () => (tree: Root) => {
      needs.current = needsOf(tree);
    },
    [],
  );
  const highlight = props.highlight !== false;
  React.useEffect(() => {
    const pending = [
      needs.current.math && !loaded.math ? loadMath() : undefined,
      highlight && needs.current.highlight && !loaded.highlight ? loadHighlight() : undefined,
    ].filter(Boolean);
    if (pending.length === 0) return;
    let mounted = true;
    Promise.all(pending).then(
      () => mounted && rerender(),
      () => undefined, // the fallback stays: a body without colour is still the body
    );
    return () => {
      mounted = false;
    };
  });
  return (
    <MarkdownCore {...props} runtime={{ math: loaded.math, highlight: loaded.highlight, probe }} />
  );
}

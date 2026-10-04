import * as React from "react";
import ReactMarkdown, {
  type Components,
  type Options as ReactMarkdownOptions,
} from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

import { rehypeHeadingIds, type HeadingIdResolver } from "./headings";
import { MermaidDiagram } from "./mermaid";
import { TableScroll } from "./table-scroll";
import { extendSchema, safeUrl, type SchemaExtension } from "./schema";

type PluggableList = NonNullable<ReactMarkdownOptions["remarkPlugins"]>;

/**
 * The stored body's format, and the renderer generation that produced its output. A consumer
 * records both on every saved version (content-media contracts § 6.6) and never re-interprets an
 * old version under a different format. `RENDERER_VERSION` moves when the SAME input renders
 * differently — a schema change, a new default plugin — not on every release.
 */
export const MARKDOWN_FORMAT = "md";
// 2 — tables render inside a scroll box (gh#1131).
// 3 — short single-token table cells carry `data-short` (gh#1150).
export const RENDERER_VERSION = 3;

export type MarkdownProps = {
  /** The Markdown source. */
  children: string;
  /**
   * remark plugins run after GFM (a callout or embed marker plugin). Whatever they emit still goes
   * through the sanitiser, so a marker attribute must be allowed with `schema`.
   */
  remarkPlugins?: PluggableList;
  /**
   * rehype plugins run AFTER the sanitiser, on a tree that is already safe. Presentation only: a
   * plugin here must not introduce URLs, raw HTML or event handlers — it is past the gate.
   */
  rehypePlugins?: PluggableList;
  /** Tags / attributes a host plugin needs. Additive; cannot widen the URL policy. */
  schema?: SchemaExtension;
  /**
   * Element overrides (react-markdown `components`). A host `pre` renders every fence EXCEPT
   * ```mermaid, which is drawn through the gate first; `mermaid={false}` hands those to it too.
   */
  components?: Components;
  /**
   * Resolves a host-specific URL (`asset:…`, a wiki link) to a real one. Runs before the sanitiser
   * and the scheme allow-list, so whatever it returns is still checked; `undefined` keeps the URL.
   */
  resolveUrl?: (url: string, key: "href" | "src" | string) => string | undefined;
  /** Heading anchors: GitHub slugs by default; a host with server-side anchors supplies its own. */
  headingId?: HeadingIdResolver;
  /**
   * Render ```mermaid fences as gated diagrams (default true). They are drawn BEFORE a host `pre`
   * is consulted, so a host code renderer keeps Mermaid; `false` hands mermaid fences to the host
   * `pre` (or plain code) as well (gh#1116).
   */
  mermaid?: boolean;
  /**
   * NARROW the elements a body may produce — an activity feed that shows only inline formatting.
   * react-markdown's own options, applied after the sanitiser; they can only remove, never allow
   * what the schema strips (gh#1116).
   */
  allowedElements?: ReactMarkdownOptions["allowedElements"];
  disallowedElements?: ReactMarkdownOptions["disallowedElements"];
  allowElement?: ReactMarkdownOptions["allowElement"];
  /** With an element filter: keep a removed element's children (its text) instead of dropping it. */
  unwrapDisallowed?: boolean;
  /**
   * A table cell whose trimmed text has no whitespace and at most this many characters — a code,
   * an id, a date, 優先度 — is stamped `data-short`, and `Prose` keeps it on one line: CJK otherwise
   * breaks between any two ideographs in a narrow column (gh#1150). A sentence still wraps.
   * Characters are user-perceived (grapheme clusters). Default 24; `false` stamps nothing.
   */
  shortCellLength?: number | false;
};

/** Element attributes that carry a URL, by tag. */
const URL_ATTRIBUTES: Record<string, string> = {
  a: "href",
  img: "src",
  blockquote: "cite",
  q: "cite",
};

/**
 * rehype plugin: a host's URL resolver, BEFORE the sanitiser. react-markdown's `urlTransform` runs
 * after every rehype plugin, so a resolver there would only ever see what the sanitiser already
 * stripped (`asset:abc` is not an allowed scheme). Here the host turns its scheme into a real URL
 * first, and the sanitiser and `safeUrl` then judge the RESULT.
 */
function rehypeResolveUrls(options: { resolve?: MarkdownProps["resolveUrl"] }) {
  return (tree: Root) => {
    if (!options.resolve) return;
    visit(tree, "element", (node: Element) => {
      const key = URL_ATTRIBUTES[node.tagName];
      const value = key ? node.properties?.[key] : undefined;
      if (typeof value !== "string") return;
      const resolved = options.resolve!(value, key!);
      if (resolved !== undefined) node.properties = { ...node.properties, [key!]: resolved };
    });
  };
}

const graphemes =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : undefined;

function textOf(node: Element): { text: string; hasImage: boolean } {
  let text = "";
  let hasImage = false;
  visit(node, (child) => {
    if (child.type === "text") text += child.value;
    else if (child.type === "element" && child.tagName === "img") hasImage = true;
  });
  return { text, hasImage };
}

/**
 * rehype plugin, AFTER the sanitiser (presentation only — it adds one data attribute and nothing
 * the sanitiser would judge): stamps `data-short` on a table cell holding a single short token.
 */
function rehypeShortCells(options: { max: number | false }) {
  return (tree: Root) => {
    const { max } = options;
    if (max === false || max <= 0) return;
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "td" && node.tagName !== "th") return;
      const { text, hasImage } = textOf(node);
      const token = text.trim();
      if (hasImage || token === "" || /\s/.test(token)) return;
      const length = graphemes ? [...graphemes.segment(token)].length : [...token].length;
      if (length <= max) node.properties = { ...node.properties, dataShort: "" };
    });
  };
}

/** react-markdown hands a component its hast `node`; a DOM element must not receive it. */
function omitNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const { node: _node, ...rest } = props;
  return rest;
}

function fenceOf(node: Element | undefined): { language?: string; text: string } | undefined {
  const code = node?.children?.[0];
  if (!code || code.type !== "element" || code.tagName !== "code") return undefined;
  const classes = (code.properties?.className as string[] | undefined) ?? [];
  const language = classes.find((name) => name.startsWith("language-"))?.slice(9);
  const text = code.children.map((child) => (child.type === "text" ? child.value : "")).join("");
  return { language, text };
}

/**
 * THE ONE RENDERER (gh#1108). GFM — tables, task lists, fenced code, autolinks, footnotes,
 * strikethrough — plus heading anchors, sanitised by `markdownSchema`, with ```mermaid drawn only
 * through the SVG gate. Raw HTML in the source is never parsed into elements (no `rehype-raw`): it
 * stays visible text. Output matches `react-markdown` + `remark-gfm` + `rehype-sanitize`, which is
 * what godx-task and godx-content rendered before, so the swap is drop-in.
 *
 * Renders bare elements; the host wraps it (`<Prose>` from `@godxjp/ui/data-display`), so this
 * package carries no UI-kit dependency.
 */
export function Markdown({
  children,
  remarkPlugins = [],
  rehypePlugins = [],
  schema,
  components,
  resolveUrl,
  headingId,
  mermaid = true,
  allowedElements,
  disallowedElements,
  allowElement,
  unwrapDisallowed,
  shortCellLength = 24,
}: MarkdownProps) {
  const sanitizeSchema = React.useMemo(() => extendSchema(schema), [schema]);
  const merged = React.useMemo<Components>(() => {
    // Every table in its own scroll box (gh#1131). A host `table` override still wins.
    const HostTable = components?.table;
    const table: Components["table"] = (props) => (
      <TableScroll>
        {HostTable ? (
          typeof HostTable === "string" ? (
            React.createElement(HostTable, props)
          ) : (
            <HostTable {...props} />
          )
        ) : (
          <table {...omitNode(props)} />
        )}
      </TableScroll>
    );
    if (!mermaid) return { ...components, table };
    const HostPre = components?.pre;
    // Mermaid first, then the host's renderer: a host that styles code keeps the gated diagrams.
    const pre: Components["pre"] = (props) => {
      const fence = fenceOf(props.node as Element | undefined);
      if (fence?.language === "mermaid") return <MermaidDiagram source={fence.text} />;
      if (HostPre)
        return typeof HostPre === "string" ? (
          React.createElement(HostPre, props)
        ) : (
          <HostPre {...props} />
        );
      const { node: _node, children: inner, ...rest } = props;
      return <pre {...rest}>{inner}</pre>;
    };
    return { ...components, table, pre };
  }, [components, mermaid]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, ...remarkPlugins]}
      rehypePlugins={[
        [rehypeResolveUrls, { resolve: resolveUrl }],
        [rehypeHeadingIds, { resolve: headingId }],
        [rehypeSanitize, sanitizeSchema],
        [rehypeShortCells, { max: shortCellLength }],
        ...rehypePlugins,
      ]}
      urlTransform={safeUrl}
      components={merged}
      allowedElements={allowedElements}
      disallowedElements={disallowedElements}
      allowElement={allowElement}
      unwrapDisallowed={unwrapDisallowed}
    >
      {children}
    </ReactMarkdown>
  );
}

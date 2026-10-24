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
import { remarkKitSyntax } from "./directives";
import type { CalloutKind } from "./codec/model";
import type { DirectiveBlock } from "./codec/directive";

type PluggableList = NonNullable<ReactMarkdownOptions["remarkPlugins"]>;
type Pluggable = PluggableList[number];

/** What a host's directive renderer receives: the block's parts plus its content, already rendered. */
export type DirectiveRenderProps = DirectiveBlock & {
  /** The body as the renderer draws it (the label excluded) — a `::::form`'s `:::poll` cards. */
  children: React.ReactNode;
};

/**
 * Draws one container directive (`:::poll[…]{…}`). Return `undefined` to leave the block as the
 * kit renders an unknown directive (its content in a `div.ui-prose-directive`) — a block the host
 * judges invalid. Called during render: return elements, call no hooks here.
 */
export type DirectiveRenderer = (block: DirectiveRenderProps) => React.ReactNode | undefined;

/**
 * The stored body's format, and the renderer generation that produced its output. A consumer
 * records both on every saved version (content-media contracts § 6.6) and never re-interprets an
 * old version under a different format. `RENDERER_VERSION` moves when the SAME input renders
 * differently — a schema change, a new default plugin — not on every release.
 */
export const MARKDOWN_FORMAT = "md";
// 2 — tables render inside a scroll box (gh#1131).
// 3 — short single-token table cells carry `data-short` (gh#1150).
// 4 — grammar v1: callouts, toggles, columns; CJK-friendly emphasis (gh#1156).
// 5 — YAML front matter renders nothing (was an <hr> + a setext <h2> of the YAML) (gh#1163).
// 6 — math (`$…$`, `$$…$$`, ```math) drawn by KaTeX; fenced code tokenised as
//     `<span data-code-token>`.
export const RENDERER_VERSION = 6;

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
   * Tokenise fenced code in a known language as `<span data-code-token="keyword">` … (default
   * true), which `Prose` colours. `false` leaves the code as plain text — a host `pre` that runs
   * its own highlighter.
   */
  highlight?: boolean;
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
  /**
   * Visible callout titles per kind when a callout has none of its own (`> [!WARNING]`). English by
   * default — this package carries no i18n; a host passes its localized strings.
   */
  calloutTitles?: Partial<Record<CalloutKind, string>>;
  /**
   * Where an EXTERNAL link opens. An external link is an absolute http(s) URL whose origin differs
   * from `origin`. `"new-tab"` gives it `target="_blank"` and `rel="noopener noreferrer"`. Relative
   * links, `#anchors`, wikilinks resolved to a path, and `mailto:` stay in the tab. The default,
   * `"same-tab"`, changes nothing. Markdown has no syntax for `target`, so this is a renderer policy.
   */
  externalLinks?: "same-tab" | "new-tab";
  /**
   * The page origin that `externalLinks` compares against. Defaults to `location.origin`. Pass it
   * when rendering on the server, or every absolute link counts as external there and hydration
   * disagrees on same-origin ones.
   */
  origin?: string;
  /**
   * Host renderers for container directives the kit does not model, by name:
   * `{ poll: (block) => <PollCard … /> }`. Each receives the directive's name, label, attributes,
   * canonical source and body Markdown (`DirectiveBlock`, the same parts the codec and the block
   * editor give) and its rendered content. A directive without a renderer renders as before.
   * `toggle`, `columns` and `column` are the kit's own and cannot be overridden.
   */
  directives?: Readonly<Record<string, DirectiveRenderer>>;
};

/** The two parse-time engines, eager (`@godxjp/markdown`) or loaded on demand (`/lazy`). */
export type MarkdownRuntime = {
  /** rehype-katex, configured (math.ts); absent: math stays its TeX source in `code.language-math`. */
  math?: Pluggable | null;
  /** The code tokeniser (highlight.ts); absent: fences stay plain text. */
  highlight?: Pluggable | null;
  /** A remark plugin run last, to see what the body needs (the lazy entry's probe). */
  probe?: Pluggable | null;
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

/**
 * rehype plugin, AFTER the sanitiser (presentation only: it adds `target` / `rel`, never a URL):
 * opens links to another origin in a new tab.
 */
function rehypeExternalLinks(options: { policy: "same-tab" | "new-tab"; origin?: string }) {
  return (tree: Root) => {
    if (options.policy !== "new-tab") return;
    const origin = options.origin ?? globalThis.location?.origin;
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string" || !/^https?:\/\//i.test(href)) return;
      let target: URL;
      try {
        target = new URL(href);
      } catch {
        return;
      }
      if (origin && target.origin === origin) return;
      node.properties = { ...node.properties, target: "_blank", rel: ["noopener", "noreferrer"] };
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

/** Directive marker attributes on `div` (directives.ts writes them, `MarkdownCore` reads them). */
const DIRECTIVE_SCHEMA: SchemaExtension = {
  attributes: { div: ["dataDirective", "dataDirectiveBlock"] },
};

type DivProps = React.ComponentProps<"div"> & { node?: Element };

/** `children` without the label paragraph: the hast child index maps 1:1 onto react-markdown's. */
function withoutLabel(node: Element | undefined, children: React.ReactNode): React.ReactNode {
  const at = node?.children.findIndex((child) => child.type === "element") ?? -1;
  if (at === -1) return children;
  if (!Array.isArray(children)) return at === 0 ? null : children;
  return children.filter((_, index) => index !== at);
}

/**
 * THE ONE RENDERER (gh#1108), with its two parse-time engines supplied by the entry point: the
 * default entry passes them eagerly, `@godxjp/markdown/lazy` once loaded. GFM — tables, task
 * lists, fenced code, autolinks, footnotes, strikethrough — plus heading anchors, KaTeX math,
 * highlighted code, sanitised by `markdownSchema`, with ```mermaid drawn only through the SVG gate.
 * Raw HTML in the source is never parsed into elements (no `rehype-raw`): it stays visible text.
 *
 * Renders bare elements; the host wraps it (`<Prose>` from `@godxjp/ui/data-display`), so this
 * package carries no UI-kit dependency.
 */
export function MarkdownCore({
  children,
  remarkPlugins = [],
  rehypePlugins = [],
  schema,
  components,
  resolveUrl,
  headingId,
  mermaid = true,
  highlight = true,
  allowedElements,
  disallowedElements,
  allowElement,
  unwrapDisallowed,
  shortCellLength = 24,
  calloutTitles,
  externalLinks = "same-tab",
  origin,
  directives,
  runtime,
}: MarkdownProps & { runtime: MarkdownRuntime }) {
  const directiveNames = React.useMemo(
    () =>
      Object.keys(directives ?? {})
        .sort()
        .join(" "),
    [directives],
  );
  const sanitizeSchema = React.useMemo(() => {
    if (!directiveNames) return extendSchema(schema);
    return extendSchema({
      tagNames: schema?.tagNames,
      attributes: {
        ...schema?.attributes,
        div: [...(schema?.attributes?.div ?? []), ...DIRECTIVE_SCHEMA.attributes!.div!],
      },
    });
  }, [schema, directiveNames]);
  const kitSyntax = React.useMemo(
    () =>
      remarkKitSyntax({
        calloutTitles,
        directives: directiveNames ? directiveNames.split(" ") : [],
      }),
    [calloutTitles, directiveNames],
  );
  const live = React.useRef(directives);
  live.current = directives;
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
    const out: Components = { ...components, table };
    if (directiveNames) {
      // A registered directive is drawn by the host; one it declines renders as before.
      const HostDiv = components?.div;
      out.div = (props: DivProps) => {
        const {
          "data-directive": name,
          "data-directive-block": block,
          ...rest
        } = props as DivProps & Record<string, unknown>;
        const registry = live.current;
        const render =
          typeof name === "string" && registry && Object.hasOwn(registry, name)
            ? registry[name]
            : undefined;
        if (render && typeof block === "string") {
          const parts = JSON.parse(block) as Omit<DirectiveBlock, "name">;
          const drawn = render({
            name: name as string,
            ...parts,
            children:
              parts.label === null ? props.children : withoutLabel(props.node, props.children),
          });
          if (drawn !== undefined) return <>{drawn}</>;
        }
        if (HostDiv)
          return typeof HostDiv === "string" ? (
            React.createElement(HostDiv, rest)
          ) : (
            <HostDiv {...rest} />
          );
        return <div {...omitNode(rest)} />;
      };
    }
    if (!mermaid) return out;
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
    return { ...out, pre };
  }, [components, mermaid, directiveNames]);

  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm,
        kitSyntax,
        ...remarkPlugins,
        ...(runtime.probe ? [runtime.probe] : []),
      ]}
      rehypePlugins={[
        [rehypeResolveUrls, { resolve: resolveUrl }],
        [rehypeHeadingIds, { resolve: headingId }],
        // Both BEFORE the sanitiser, which judges their output (schema.ts).
        ...(runtime.math ? [runtime.math] : []),
        ...(highlight && runtime.highlight ? [runtime.highlight] : []),
        [rehypeSanitize, sanitizeSchema],
        [rehypeShortCells, { max: shortCellLength }],
        [rehypeExternalLinks, { policy: externalLinks, origin }],
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

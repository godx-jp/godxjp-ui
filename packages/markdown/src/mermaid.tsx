import * as React from "react";

/**
 * MERMAID IS A PICTURE ONLY AFTER ITS SVG PASSES THE GATE (gh#1108; godx-task media ADR § Editor,
 * wiki plan § 6.1). Mermaid turns user text into SVG, and SVG is a document format: it can carry
 * `<script>`, event handlers, `<foreignObject>` (arbitrary HTML), and URLs in attributes and CSS.
 * So the generated SVG is CHECKED, fail-closed, before anything is shown; a diagram that does not
 * pass — or a host without mermaid installed — renders as the escaped code it was written as.
 *
 * The check rejects rather than repairs: a stripped diagram that still renders would hide that the
 * input tried something, and a partial picture is a wrong picture.
 */

/** SVG elements a diagram may contain. No `foreignObject`, `script`, `a`, `image`, `iframe`. */
const ALLOWED_ELEMENTS = new Set([
  "svg",
  "g",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "textpath",
  "marker",
  "defs",
  "style",
  "title",
  "desc",
  "lineargradient",
  "radialgradient",
  "stop",
  "clippath",
  "mask",
  "pattern",
  "symbol",
  "use",
  "filter",
  "fegaussianblur",
  "feoffset",
  "feblend",
  "feflood",
  "fecomposite",
  "femerge",
  "femergenode",
  "fedropshadow",
]);

const URL_REF = /url\s*\(\s*(['"]?)([^'")]*)\1\s*\)/gi;
const CSS_HAZARD = /@import|expression\s*\(|javascript:|behavior\s*:|-moz-binding|<\//i;

export type MermaidSvgCheck = { ok: true; svg: SVGSVGElement } | { ok: false; reason: string };

/** Every `url(...)` in a value points inside the document (`url(#id)`), or the value fails. */
function urlsAreLocal(value: string): boolean {
  for (const match of value.matchAll(URL_REF)) {
    if (!match[2]!.trim().startsWith("#")) return false;
  }
  return true;
}

/**
 * Parses `svg` as XML and checks every element and attribute. On success returns the PARSED root,
 * which the caller inserts as a node — never re-serialised into HTML, so what was checked is what
 * is shown (an HTML re-parse of an SVG string can differ from the XML parse: mutation XSS).
 */
export function checkMermaidSvg(svg: string): MermaidSvgCheck {
  if (typeof DOMParser === "undefined") return { ok: false, reason: "no DOMParser" };
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  if (doc.getElementsByTagName("parsererror").length > 0) return { ok: false, reason: "parse" };
  const root = doc.documentElement;
  if (root.localName.toLowerCase() !== "svg") return { ok: false, reason: "root" };

  const elements = [root, ...Array.from(root.getElementsByTagName("*"))];
  for (const element of elements) {
    const name = element.localName.toLowerCase();
    if (!ALLOWED_ELEMENTS.has(name)) return { ok: false, reason: `element ${name}` };
    if (name === "style") {
      const css = element.textContent ?? "";
      if (CSS_HAZARD.test(css) || !urlsAreLocal(css)) return { ok: false, reason: "style" };
    }
    for (const attribute of Array.from(element.attributes)) {
      const attr = attribute.localName.toLowerCase();
      const value = attribute.value;
      if (attr.startsWith("on")) return { ok: false, reason: `handler ${attr}` };
      if ((attr === "href" || attr === "src") && !value.trim().startsWith("#")) {
        return { ok: false, reason: `ref ${attr}` };
      }
      if (attr === "style" && CSS_HAZARD.test(value)) return { ok: false, reason: "style attr" };
      if (!urlsAreLocal(value)) return { ok: false, reason: `url ${attr}` };
    }
  }
  return { ok: true, svg: root as unknown as SVGSVGElement };
}

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, text: string) => Promise<{ svg: string }>;
};

let loading: Promise<MermaidApi | null> | null = null;

/** Lazy, once. `mermaid` is an OPTIONAL peer: a host that does not install it gets code blocks. */
function loadMermaid(): Promise<MermaidApi | null> {
  loading ??= import("mermaid")
    .then((module) => {
      const api = (module as { default: MermaidApi }).default;
      api.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        // SVG text labels, not HTML in <foreignObject> — which the gate rejects outright.
        htmlLabels: false,
        flowchart: { htmlLabels: false },
        theme: document.documentElement.dataset.theme === "dark" ? "dark" : "default",
      });
      return api;
    })
    .catch(() => null);
  return loading;
}

export type MermaidDiagramProps = {
  /** The fence's text. */
  source: string;
  /** Accessible name of the rendered diagram (the figure). */
  label?: string;
};

/** The code a diagram falls back to: exactly what an ordinary ```mermaid fence renders. */
function MermaidCode({ source }: { source: string }) {
  return (
    <pre data-mermaid="code">
      <code className="language-mermaid">{source}</code>
    </pre>
  );
}

/**
 * A ```mermaid fence. Shows the code until the diagram has rendered AND passed `checkMermaidSvg`,
 * and keeps showing it if either fails — so the page is never blank and never unsafe.
 */
export function MermaidDiagram({ source, label }: MermaidDiagramProps) {
  const host = React.useRef<HTMLDivElement>(null);
  const id = `godx-mermaid-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [state, setState] = React.useState<"code" | "diagram">("code");

  React.useEffect(() => {
    let cancelled = false;
    setState("code");
    void (async () => {
      const api = await loadMermaid();
      if (!api || cancelled) return;
      try {
        const { svg } = await api.render(id, source);
        const checked = checkMermaidSvg(svg);
        if (cancelled || !checked.ok || !host.current) return;
        host.current.replaceChildren(document.importNode(checked.svg, true));
        setState("diagram");
      } catch {
        // Invalid diagram syntax: the code stays.
      } finally {
        // mermaid leaves a measuring node in <body> when render throws.
        document.getElementById(`d${id}`)?.remove();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, source]);

  return (
    <figure data-mermaid={state} aria-label={state === "diagram" ? label : undefined}>
      <div ref={host} hidden={state !== "diagram"} />
      {state === "code" ? <MermaidCode source={source} /> : null}
    </figure>
  );
}

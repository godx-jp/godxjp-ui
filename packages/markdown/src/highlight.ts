import type { Element, ElementContent, Root } from "hast";
import { createLowlight } from "lowlight";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import diff from "highlight.js/lib/languages/diff";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import go from "highlight.js/lib/languages/go";
import ini from "highlight.js/lib/languages/ini";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import shell from "highlight.js/lib/languages/shell";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import { visit } from "unist-util-visit";

import { CODE_TOKENS, type CodeToken } from "./code-tokens";

export { CODE_TOKENS };

/**
 * SYNTAX COLOUR (renderer v6). A fence with a known language is tokenised at parse time by
 * highlight.js (through lowlight: synchronous, no DOM, so the same HTML comes out of a browser, a
 * server and a Worker), and every token becomes `<span data-code-token="…">`. The NAMES are the
 * kit's: `Prose` and `CodeBlock` colour exactly these from their `--code-block-token-*` knobs, so
 * this package carries no palette and no stylesheet for code.
 *
 * Curated languages (their aliases come with them: ts, js, jsx, sh, zsh, yml, html, py, rs, …).
 * An unknown or missing language, ```mermaid and ```math stay plain text.
 */
const lowlight = createLowlight({
  bash,
  css,
  diff,
  dockerfile,
  go,
  ini,
  java,
  javascript,
  json,
  markdown,
  php,
  python,
  rust,
  shell,
  sql,
  typescript,
  xml,
  yaml,
});

/**
 * highlight.js scope → kit token, by the scope's first segment (`title.function.invoke` reads
 * `title.function` first, then `title`). A scope not listed draws in the block's foreground.
 */
const SCOPES: Record<string, CodeToken> = {
  comment: "comment",
  quote: "comment",
  doctag: "keyword",
  keyword: "keyword",
  built_in: "keyword",
  type: "keyword",
  "selector-tag": "keyword",
  tag: "punctuation",
  name: "keyword",
  section: "keyword",
  string: "string",
  char: "string",
  regexp: "string-expression",
  subst: "string-expression",
  "template-variable": "string-expression",
  "title.function": "function",
  title: "function",
  "title.class": "constant",
  number: "constant",
  literal: "constant",
  symbol: "constant",
  "variable.constant": "constant",
  "variable.language": "constant",
  "selector-id": "constant",
  "selector-class": "constant",
  bullet: "constant",
  params: "parameter",
  attr: "parameter",
  attribute: "parameter",
  property: "parameter",
  "template-tag": "parameter",
  punctuation: "punctuation",
  operator: "punctuation",
  link: "link",
  addition: "inserted",
  deletion: "deleted",
};

/** highlight.js 11 writes scope `title.function.invoke` as `hljs-title function_ invoke__`. */
function tokenOf(className: unknown): CodeToken | undefined {
  if (!Array.isArray(className) || !String(className[0]).startsWith("hljs-")) return undefined;
  const parts = className.map((name, i) =>
    i === 0 ? String(name).slice(5) : String(name).replace(/_+$/, ""),
  );
  for (let n = parts.length; n > 0; n--) {
    const token = SCOPES[parts.slice(0, n).join(".")];
    if (token) return token;
  }
  return undefined;
}

/** lowlight's `<span class="hljs-…">` → `<span data-code-token>`; an unmapped span is unwrapped. */
function retag(nodes: ElementContent[]): ElementContent[] {
  return nodes.flatMap((node): ElementContent[] => {
    if (node.type !== "element") return [node];
    const children = retag(node.children);
    const token = tokenOf(node.properties?.className);
    return token
      ? [{ type: "element", tagName: "span", properties: { dataCodeToken: token }, children }]
      : children;
  });
}

const SKIP = new Set(["mermaid", "math"]);

/** rehype plugin, BEFORE the sanitiser (schema.ts pins `data-code-token` to the twelve names). */
export function rehypeHighlight() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, _index, parent) => {
      if (node.tagName !== "code" || parent?.type !== "element" || parent.tagName !== "pre") return;
      const classes = (node.properties?.className as string[] | undefined) ?? [];
      const language = classes.find((name) => name.startsWith("language-"))?.slice(9);
      if (!language || SKIP.has(language) || !lowlight.registered(language)) return;
      if (!node.children.every((child) => child.type === "text")) return;
      const text = node.children
        .map((child) => (child.type === "text" ? child.value : ""))
        .join("");
      node.children = retag(lowlight.highlight(language, text).children as ElementContent[]);
    });
  };
}

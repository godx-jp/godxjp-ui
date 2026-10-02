import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Root } from "mdast";
import { visit } from "unist-util-visit";

import { MARKDOWN_FIXTURES } from "../fixtures";
import { Markdown, MARKDOWN_FORMAT, RENDERER_VERSION } from "../markdown";
import { extendSchema, markdownSchema, safeUrl } from "../schema";

/** React's static renderer adds a preload `<link>` per image; the corpus is the renderer's HTML. */
const normalizeFixtureHtml = (html: string) => html.replace(/<link rel="preload"[^>]*\/>/g, "");
const render = (markdown: string, props: Partial<Parameters<typeof Markdown>[0]> = {}) =>
  normalizeFixtureHtml(renderToStaticMarkup(<Markdown {...props}>{markdown}</Markdown>));

describe("@godxjp/markdown fixture corpus (gh#1108)", () => {
  for (const fixture of MARKDOWN_FIXTURES) {
    it(fixture.name, () => {
      const html = render(fixture.markdown);
      expect(html).toBe(fixture.html);
      for (const needle of fixture.forbidden ?? []) expect(html).not.toContain(needle);
    });
  }

  it("every hostile fixture names what must never appear", () => {
    for (const fixture of MARKDOWN_FIXTURES.filter((f) => f.hostile)) {
      expect(fixture.forbidden?.length, fixture.name).toBeGreaterThan(0);
    }
  });

  it("records a format and a renderer generation for stored versions", () => {
    expect(MARKDOWN_FORMAT).toBe("md");
    expect(Number.isInteger(RENDERER_VERSION)).toBe(true);
  });
});

describe("URL policy", () => {
  it("safeUrl keeps http(s), mailto and relative URLs, drops every other scheme", () => {
    expect(safeUrl("https://a.example/x", "href")).toBe("https://a.example/x");
    expect(safeUrl("mailto:a@b.c", "href")).toBe("mailto:a@b.c");
    expect(safeUrl("/wiki/x", "href")).toBe("/wiki/x");
    expect(safeUrl("#top", "href")).toBe("#top");
    expect(safeUrl("javascript:alert(1)", "href")).toBe("");
    expect(safeUrl(" JavaScript:alert(1)", "href")).toBe("");
    expect(safeUrl("java\nscript:alert(1)", "href")).toBe("");
    expect(safeUrl("data:text/html,x", "href")).toBe("");
    // An image is never a mailto, and never a data: URI (SVG never inline).
    expect(safeUrl("mailto:a@b.c", "src")).toBe("");
    expect(safeUrl("data:image/svg+xml;base64,PHN2Zz4=", "src")).toBe("");
  });

  it("a host resolver maps its own scheme to a real URL, which is still checked", () => {
    const resolveUrl = (url: string) =>
      url.startsWith("asset:") ? `https://files.example/${url.slice(6)}` : undefined;
    expect(render("![a](asset:abc)", { resolveUrl })).toBe(
      '<p><img src="https://files.example/abc" alt="a"/></p>',
    );
    // A resolver that returns something unsafe does not get past the allow-list.
    expect(render("[x](asset:abc)", { resolveUrl: () => "javascript:alert(1)" })).toBe(
      "<p><a>x</a></p>",
    );
  });
});

describe("schema extension", () => {
  it("is additive: a host marker survives, the URL policy cannot be widened", () => {
    const schema = extendSchema({
      tagNames: ["section"],
      attributes: { blockquote: [["data-callout", "note", "tip"]] },
    });
    expect(schema.tagNames).toContain("section");
    expect(schema.protocols).toEqual(markdownSchema.protocols);
    expect(schema.attributes?.blockquote).toEqual([
      ...(markdownSchema.attributes?.blockquote ?? []),
      ["data-callout", "note", "tip"],
    ]);
  });

  it("an attribute a host plugin emits is stripped unless the extension allows it", () => {
    const remarkCallout = () => (tree: Root) => {
      visit(tree, "blockquote", (node) => {
        node.data = { hProperties: { "data-callout": "note" } };
      });
    };
    expect(render("> hi", { remarkPlugins: [remarkCallout] })).not.toContain("data-callout");
    expect(
      render("> hi", {
        remarkPlugins: [remarkCallout],
        schema: { attributes: { blockquote: [["data-callout", "note"]] } },
      }),
    ).toContain('data-callout="note"');
  });
});

describe("heading anchors", () => {
  it("a host resolver supplies its own ids (godx-task keeps its outline server-side)", () => {
    const ids = ["intro", "x-setup"];
    expect(render("# Intro\n\n## Setup", { headingId: ({ index }) => ids[index] })).toBe(
      '<h1 id="intro">Intro</h1>\n<h2 id="x-setup">Setup</h2>',
    );
  });

  it("returning undefined leaves a heading without an id", () => {
    expect(render("# A", { headingId: () => undefined })).toBe("<h1>A</h1>");
  });
});

describe("mermaid option", () => {
  it("mermaid={false} renders the fence as ordinary code", () => {
    expect(render("```mermaid\ngraph TD; A-->B\n```", { mermaid: false })).toBe(
      '<pre><code class="language-mermaid">graph TD; A--&gt;B\n</code></pre>',
    );
  });

  it("a host `pre` override replaces the mermaid default", () => {
    const html = render("```mermaid\nx\n```", { components: { pre: () => <div data-host="" /> } });
    expect(html).toBe('<div data-host=""></div>');
  });
});

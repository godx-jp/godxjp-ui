import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { frontmatterOf, normalize, outline, parse } from "../codec";
import { Markdown } from "../markdown";

/** gh#1163 — YAML front matter survives the codec, never renders, and `outline` ids match the page. */
const BODY =
  "---\ntitle: 見積\ntags: [spec, f05]\n---\n\n# 概要\n\n## Setup\n\n## Setup\n\n### ![i](https://example.com/i.png) 画像付き\n\n#### `code` と **太字**";

describe("front matter and outline (gh#1163)", () => {
  it("keeps front matter verbatim — it used to become a rule and an h2", () => {
    expect(normalize(BODY).startsWith("---\ntitle: 見積\ntags: [spec, f05]\n---\n\n# 概要")).toBe(
      true,
    );
    expect(normalize(normalize(BODY))).toBe(normalize(BODY));
    expect(parse(BODY).content[0]).toEqual({
      type: "frontmatter",
      attrs: { source: "title: 見積\ntags: [spec, f05]" },
    });
    expect(frontmatterOf(BODY)).toBe("title: 見積\ntags: [spec, f05]");
    expect(frontmatterOf("# no front matter")).toBeNull();
    // A rule that is not at the very top is still a rule.
    expect(normalize("text\n\n---\n\nmore")).toBe("text\n\n---\n\nmore\n");
  });

  it("never renders front matter as prose", () => {
    // React's static renderer prepends a preload <link> per image; the renderer's HTML follows it.
    const html = renderToStaticMarkup(<Markdown>{BODY}</Markdown>).replace(
      /<link rel="preload"[^>]*\/>/g,
      "",
    );
    expect(html).not.toContain("title:");
    expect(html).not.toContain("<hr");
    expect(html.slice(0, 3)).toBe("<h1");
  });

  it("gives each heading the id the renderer writes, de-duplicated", () => {
    const entries = outline(BODY);
    expect(entries.map((e) => [e.depth, e.id])).toEqual([
      [1, "概要"],
      [2, "setup"],
      [2, "setup-1"],
      [3, "-画像付き"],
      [4, "code-と-太字"],
    ]);
    const html = renderToStaticMarkup(<Markdown>{BODY}</Markdown>);
    const rendered = [...html.matchAll(/<h[1-6] id="([^"]+)"/g)].map((m) => m[1]);
    expect(entries.map((e) => e.id)).toEqual(rendered);
  });
});

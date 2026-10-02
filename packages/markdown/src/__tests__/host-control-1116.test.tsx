import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Root } from "mdast";
import { visit } from "unist-util-visit";

import { Markdown } from "../markdown";
import { extendSchema, markdownSchema } from "../schema";

/**
 * gh#1116 — three things godx-task hit adopting 31.18.0: an extension could not WIDEN a rule the
 * base already constrains, there was no way to NARROW the element set, and a host `pre` silently
 * took Mermaid away.
 */
const render = (markdown: string, props: Partial<Parameters<typeof Markdown>[0]> = {}) =>
  renderToStaticMarkup(<Markdown {...props}>{markdown}</Markdown>).replace(
    /<link rel="preload"[^>]*\/>/g,
    "",
  );

/** remark-math's shape: inline code marked by class. */
const remarkMathMarker = () => (tree: Root) => {
  visit(tree, "inlineCode", (node) => {
    node.data = { hProperties: { className: ["math-inline"] } };
  });
};

describe("@godxjp/markdown host control (gh#1116)", () => {
  it("an extension WIDENS an attribute rule the base constrains (code className + math-inline)", () => {
    const html = render("`E = mc^2`", {
      remarkPlugins: [remarkMathMarker],
      schema: { attributes: { code: [["className", "math-inline", "math-display"]] } },
    });
    expect(html).toBe('<p><code class="math-inline">E = mc^2</code></p>');
    // …and the base value it widened still passes: fences keep their language class.
    expect(
      render("```ts\nx\n```", {
        schema: { attributes: { code: [["className", "math-inline"]] } },
      }),
    ).toContain('class="language-ts"');
  });

  it("merging never reaches protocols, and a value not added stays stripped", () => {
    const schema = extendSchema({ attributes: { code: [["className", "math-inline"]] } });
    expect(schema.protocols).toEqual(markdownSchema.protocols);
    const html = render("`x`", {
      remarkPlugins: [
        () => (tree: Root) =>
          visit(tree, "inlineCode", (node) => {
            node.data = { hProperties: { className: ["evil"] } };
          }),
      ],
      schema: { attributes: { code: [["className", "math-inline"]] } },
    });
    expect(html).not.toContain("evil");
  });

  it("allowedElements + unwrapDisallowed narrow a body to inline formatting (activity feed)", () => {
    expect(
      render("# Title\n\n**b** _i_ ~~d~~ `c` [link](https://x.example)", {
        allowedElements: ["p", "strong", "em", "del", "code"],
        unwrapDisallowed: true,
      }),
    ).toBe("Title\n<p><strong>b</strong> <em>i</em> <del>d</del> <code>c</code> link</p>");
  });

  it("a host `pre` keeps built-in Mermaid: mermaid fences pass the gate first", () => {
    const html = render("```mermaid\ngraph TD; A-->B\n```\n\n```ts\nx\n```", {
      components: { pre: ({ children }) => <div data-host-pre="">{children}</div> },
    });
    expect(html).toContain('<figure data-mermaid="code">');
    expect(html).toContain('<div data-host-pre=""><code class="language-ts">x\n</code></div>');
  });

  it("mermaid={false} hands mermaid fences to the host `pre` too", () => {
    const html = render("```mermaid\nx\n```", {
      mermaid: false,
      components: { pre: ({ children }) => <div data-host-pre="">{children}</div> },
    });
    expect(html).toBe('<div data-host-pre=""><code class="language-mermaid">x\n</code></div>');
  });
});

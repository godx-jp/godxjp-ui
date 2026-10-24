import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MARKDOWN_FIXTURES } from "../fixtures";
import { Markdown as EagerMarkdown } from "../markdown";
import { Markdown, preloadMarkdownRuntime } from "../lazy";

/**
 * `@godxjp/markdown/lazy`: KaTeX and the code tokeniser are not in the entry chunk; each is loaded
 * when a body needs it. Until then the body shows the plain fallback; once loaded, the HTML is the
 * eager entry's, byte for byte — so `RENDERER_VERSION` still describes it. The order of these
 * tests matters: the engines are module state, loaded once.
 */
const strip = (html: string) => html.replace(/<link rel="preload"[^>]*\/>/g, "");
const lazy = (markdown: string) => strip(renderToStaticMarkup(<Markdown>{markdown}</Markdown>));
const eager = (markdown: string) =>
  strip(renderToStaticMarkup(<EagerMarkdown>{markdown}</EagerMarkdown>));

const BODY = "Inline $x^2$.\n\n```ts\nconst a = 1;\n```";

describe("@godxjp/markdown/lazy", () => {
  it("renders the plain fallback before the engines have loaded", () => {
    const html = lazy(BODY);
    expect(html).toContain('<p>Inline <code class="language-math">x^2</code>.</p>');
    expect(html).toContain('<code class="language-ts">const a = 1;\n</code>');
    expect(html).not.toContain("katex");
    expect(html).not.toContain("data-code-token");
    // A body that needs neither is already final.
    expect(lazy("# Title\n\n*plain*")).toBe(eager("# Title\n\n*plain*"));
  });

  it("loads what a mounted body needs and re-renders with it", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => root.render(<Markdown>{BODY}</Markdown>));
    await expect.poll(() => host.querySelector(".katex") !== null, { timeout: 5000 }).toBe(true);
    await expect
      .poll(() => host.querySelector("[data-code-token]") !== null, { timeout: 5000 })
      .toBe(true);
    act(() => root.unmount());
    host.remove();
  });

  it("after preloadMarkdownRuntime(), renders every fixture exactly as the eager entry", async () => {
    await preloadMarkdownRuntime();
    for (const fixture of MARKDOWN_FIXTURES) {
      expect(lazy(fixture.markdown), fixture.name).toBe(fixture.html);
    }
    expect(lazy(BODY)).toBe(eager(BODY));
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Markdown } from "../markdown";

/**
 * GDX-1467: a host that narrows a body (an activity feed: `allowedElements` of inline marks plus
 * `unwrapDisallowed`) unwrapped KaTeX's spans and MathML into their text, so `$a^2$` read
 * "a2a^2a2". A formula is one unit: the narrowing keeps it whole, and still applies around it.
 */
const INLINE_MARKS = ["p", "strong", "em", "del", "code"];
const text = (html: string) => {
  const host = document.createElement("div");
  host.innerHTML = html;
  host.querySelectorAll(".katex-mathml").forEach((node) => node.remove());
  return host.textContent;
};

describe("narrowing keeps a formula whole (GDX-1467)", () => {
  it("allowedElements + unwrapDisallowed: inline and display math stay KaTeX, read once", () => {
    const html = renderToStaticMarkup(
      <Markdown allowedElements={INLINE_MARKS} unwrapDisallowed mermaid={false}>
        {"# Title\n\nMath $a^2$ inline, [link](https://x.example).\n\n$$\n\\int_0^1 x\\,dx\n$$"}
      </Markdown>,
    );
    const host = document.createElement("div");
    host.innerHTML = html;
    expect(host.querySelectorAll(".katex")).toHaveLength(2);
    expect(host.querySelectorAll(".katex-display")).toHaveLength(1);
    expect(host.querySelectorAll(".katex .katex-mathml math")).toHaveLength(2);
    expect(host.querySelector(".katex .katex-html")?.getAttribute("aria-hidden")).toBe("true");
    // The visible text carries the formula once, not its MathML and TeX source beside it.
    expect(text(html)).not.toContain("a2a^2");
    expect(text(html)).toContain("Math a2 inline");
    // Structure around the formula is still narrowed.
    expect(host.querySelector("h1, a")).toBeNull();
    expect(html.startsWith("Title")).toBe(true);
  });

  it("disallowedElements of span and MathML do not take a formula apart", () => {
    const html = renderToStaticMarkup(
      <Markdown disallowedElements={["span", "math", "mi", "mn", "msup"]} unwrapDisallowed>
        {"$a^2$ and <span>raw</span>"}
      </Markdown>,
    );
    const host = document.createElement("div");
    host.innerHTML = html;
    expect(host.querySelectorAll(".katex .katex-mathml math msup")).toHaveLength(1);
  });

  it("a host allowElement still judges everything outside formulas", () => {
    const html = renderToStaticMarkup(
      <Markdown allowElement={(node) => node.tagName !== "strong"} unwrapDisallowed>
        {"**bold** $x$"}
      </Markdown>,
    );
    expect(html).not.toContain("<strong>");
    expect(html).toContain('<span class="katex">');
  });
});

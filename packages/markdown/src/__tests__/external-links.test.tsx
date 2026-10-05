import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Markdown } from "../markdown";

const body = [
  "[out](https://example.com/a)",
  "[same](https://pages.godx.jp/p/1)",
  "[rel](/p/2)",
  "[hash](#top)",
  "[mail](mailto:a@example.com)",
].join(" ");

const render = (props: Partial<Parameters<typeof Markdown>[0]>) =>
  renderToStaticMarkup(<Markdown {...props}>{body}</Markdown>);

const anchor = (html: string, text: string) =>
  html.match(new RegExp(`<a [^>]*>${text}</a>`))?.[0] ?? "";

describe("Markdown externalLinks", () => {
  it("opens only other-origin http(s) links in a new tab", () => {
    const html = render({ externalLinks: "new-tab", origin: "https://pages.godx.jp" });
    expect(anchor(html, "out")).toContain('target="_blank"');
    expect(anchor(html, "out")).toContain('rel="noopener noreferrer"');
    for (const text of ["same", "rel", "hash", "mail"]) {
      expect(anchor(html, text)).toMatch(/^<a /);
      expect(anchor(html, text)).not.toContain("target=");
    }
  });

  it("changes nothing by default", () => {
    expect(render({ origin: "https://pages.godx.jp" })).not.toContain("target=");
  });

  it("treats every absolute http(s) link as external when no origin is known", () => {
    const html = render({ externalLinks: "new-tab" });
    expect(anchor(html, "same")).toContain('target="_blank"');
    expect(anchor(html, "rel")).not.toContain("target=");
  });
});

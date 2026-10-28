/**
 * gh#1451 — a CMS / Markdown body (a `Prose` holding rendered HTML) inside `EditorialArticle` reads
 * like `EditorialArticleSection`: the article's heading and paragraph tokens and the editorial face,
 * not Prose's own typography. Fails without the change (the rules do not exist).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Prose } from "../../data-display/prose";
import { EditorialArticle } from "../editorial";

// Through a variable: Vite rewrites a literal `new URL("…", import.meta.url)` into an asset URL.
const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
const layoutCss = read("../../../styles/layout.css") + read("../../../styles/editorial-layout.css");

const rule = (selector: string) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...layoutCss.matchAll(new RegExp(`(?:^|[\\s}])${esc}\\s*\\{([^}]*)\\}`, "g"))]
    .map((m) => m[1])
    .join("\n");
};

describe("EditorialArticle with a Prose body (gh#1451)", () => {
  it("keeps the rendered HTML as the article's body", () => {
    render(
      <EditorialArticle title="その価格、同じ条件で比べていますか。" intro="比べる前に。">
        <Prose
          dangerouslySetInnerHTML={{ __html: "<h2>まず、同じ一枚か</h2><p>確認します。</p>" }}
        />
      </EditorialArticle>,
    );
    const article = screen.getByRole("article");
    const body = article.querySelector(":scope > .ui-prose");
    expect(body).not.toBeNull();
    expect(within(article).getByRole("heading", { level: 2 })).toHaveTextContent(
      "まず、同じ一枚か",
    );
  });

  it("gives the body's headings and paragraphs the article's tokens", () => {
    const heading = rule(".ui-editorial-article > .ui-prose > h2");
    expect(heading).toMatch(
      /font-family:\s*var\(--font-family-editorial, var\(--font-family-display\)\)/,
    );
    expect(heading).toMatch(/font-size:\s*var\(--editorial-article-heading-font-size\)/);
    expect(heading).toMatch(/line-height:\s*var\(--editorial-article-heading-line-height\)/);
    expect(heading).toMatch(/letter-spacing:\s*var\(--editorial-article-heading-letter-spacing\)/);
    expect(heading).toMatch(
      /margin-block:\s*var\(--editorial-article-heading-space-block-start\)\s+var\(--editorial-article-heading-space-block-end\)/,
    );

    const body = rule(".ui-editorial-article > .ui-prose");
    expect(body).toMatch(/font-size:\s*var\(--editorial-article-paragraph-font-size\)/);
    expect(body).toMatch(/line-height:\s*var\(--editorial-article-paragraph-line-height\)/);
    expect(rule(".ui-editorial-article > .ui-prose > *")).toMatch(
      /margin-block:\s*0 var\(--editorial-article-paragraph-space-block-end\)/,
    );
    expect(rule(".ui-editorial-article > .ui-prose :is(p, li):lang(ja)")).toMatch(
      /word-break:\s*inherit/,
    );
  });
});

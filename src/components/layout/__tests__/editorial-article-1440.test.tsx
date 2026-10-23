/**
 * gh#1440 — the editorial reader: EditorialArticle (+ Section, Note), EditorialPanel,
 * ResponsiveGrid preset="panels" and the journal cover image knobs. Every length is a token so a
 * theme matches a design's own breakpoints. Fails without the change (the exports, the preset and
 * the rules do not exist).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  EditorialArticle,
  EditorialArticleSection,
  EditorialNote,
  EditorialPanel,
  Eyebrow,
} from "../editorial";
import { ResponsiveGrid } from "../responsive-grid";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
const layoutCss = read("../../../styles/layout.css");
const tokens = read("../../../tokens/components/editorial.css");
const shellTokens = read("../../../tokens/components/shell.css");

const rule = (selector: string) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...layoutCss.matchAll(new RegExp(`(?:^|[\\s}])${esc}\\s*\\{([^}]*)\\}`, "g"))]
    .map((m) => m[1])
    .join("\n");
};

describe("EditorialArticle (gh#1440)", () => {
  it("is an article with the kicker, the one h1, the intro, named sections and a note", () => {
    render(
      <EditorialArticle
        eyebrow={<Eyebrow>価格比較の基本</Eyebrow>}
        title="その価格、同じ条件で比べていますか。"
        titleId="article-title"
        intro="カードの名前が同じでも、価格の意味はひとつではありません。"
      >
        <EditorialArticleSection
          title="まず、同じ一枚かを確認する"
          titleId="s1"
          paragraphs={["ゲーム、カード番号、収録弾を確認します。", "二段落目。"]}
        />
        <EditorialNote>この読みものはTCG-Mのオリジナルガイドです。</EditorialNote>
      </EditorialArticle>,
    );
    const article = screen.getByRole("article");
    expect(article).toHaveClass("ui-editorial-article");
    expect(within(article).getByRole("heading", { level: 1 })).toHaveAttribute(
      "id",
      "article-title",
    );
    expect(article.querySelector(".ui-editorial-article-intro")).toHaveTextContent("カードの名前");
    const section = within(article).getByRole("region", { name: "まず、同じ一枚かを確認する" });
    expect(section.querySelectorAll("p.ui-editorial-article-paragraph")).toHaveLength(2);
    expect(within(article).getByRole("note")).toHaveTextContent("オリジナルガイド");
  });

  it("omits the intro when none is given", () => {
    const { container } = render(<EditorialArticle title="掲載データと、情報の出典。" />);
    expect(container.querySelector(".ui-editorial-article-intro")).toBeNull();
  });

  it("reads the reading geometry from tokens", () => {
    expect(tokens).toMatch(/--editorial-article-max-width:\s*47\.5rem;/);
    expect(tokens).toMatch(/--editorial-article-title-font-size:\s*2\.375rem;/);
    expect(tokens).toMatch(/--editorial-article-paragraph-line-height:\s*1\.95;/);
    expect(rule(".ui-editorial-article")).toMatch(
      /max-width:\s*var\(--editorial-article-max-width\)/,
    );
    expect(rule(".ui-editorial-article > .ui-editorial-eyebrow")).toMatch(
      /margin-block-end:\s*var\(--editorial-article-kicker-space-block-end\)/,
    );
    expect(rule(".ui-editorial-article > .ui-editorial-eyebrow")).toMatch(
      /font-size:\s*var\(--editorial-article-kicker-font-size\)/,
    );
    expect(rule(".ui-editorial-article .ui-editorial-article-title:lang(ja)")).toMatch(
      /word-break:\s*var\(--editorial-article-title-line-breaking\)/,
    );
    expect(rule(".ui-editorial-article-heading")).toMatch(
      /margin:\s*var\(--editorial-article-heading-space-block-start\) 0/,
    );
    expect(rule(".ui-editorial-article")).toMatch(
      /--editorial-text-link-font-size:\s*var\(--editorial-article-link-font-size\)/,
    );
    expect(rule(".ui-editorial-note")).toMatch(
      /border-inline-start:\s*var\(--editorial-note-rule-width\) solid/,
    );
  });
});

describe("EditorialPanel + ResponsiveGrid preset=panels (gh#1440)", () => {
  it("renders the tag, an h2 and the list; the grid takes token tracks", () => {
    const { container } = render(
      <ResponsiveGrid preset="panels">
        <EditorialPanel tag="NEXT" title="もっと探しやすく。" items={["一", "二", "三"]} />
      </ResponsiveGrid>,
    );
    expect(container.querySelector(".ui-responsive-grid")).toHaveAttribute("data-preset", "panels");
    const panel = screen.getByRole("article");
    expect(panel.querySelector(".ui-editorial-panel-tag")).toHaveTextContent("NEXT");
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent(
      "もっと探しやすく。",
    );
    expect(within(panel).getAllByRole("listitem")).toHaveLength(3);

    expect(rule('.ui-responsive-grid[data-preset="panels"]')).toMatch(
      /grid-template-columns:\s*var\(--responsive-grid-panels-track-size\)/,
    );
    expect(shellTokens).toMatch(/--responsive-grid-panels-gap:/);
    expect(rule(".ui-editorial-panel")).toMatch(/padding:\s*var\(--editorial-panel-padding\)/);
  });
});

describe("Journal cover image knobs (gh#1440)", () => {
  it("fit and position are tokens whose defaults keep object-fit: cover", () => {
    const img = rule('.ui-editorial-card[data-variant="journal"] .ui-editorial-card-media img');
    expect(img).toMatch(/object-fit:\s*var\(--editorial-journal-cover-image-size\)/);
    expect(img).toMatch(/object-position:\s*var\(--editorial-journal-cover-image-align\)/);
    expect(tokens).toMatch(/--editorial-journal-cover-image-size:\s*cover;/);
    expect(tokens).toMatch(/--editorial-journal-cover-image-align:\s*center;/);
  });
});

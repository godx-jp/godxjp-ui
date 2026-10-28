import { environment, resolveToken } from "../../../tokens/__tests__/css-token-resolve";
/**
 * gh#1435 — the editorial family: full-width sections in `CenteredShell flow="sections"`, the hero,
 * the ruled kicker, the section head, the inset site search, the pill navigation band, the card
 * showcase (fan / binder), the brand banner, the catalog tile and the journal / spotlight cards,
 * plus token-driven ResponsiveGrid presets.
 *
 * Before: none of these shapes could be built without a className or style (a public site with a
 * hero wash running edge to edge, a fanned card composition, an overlaid favourite toggle…), and a
 * design with breakpoints of its own could not reach exact column counts. Every geometry value is
 * a `--editorial-*` token so a theme re-declares it under its own width queries.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CenteredShell } from "../centered-shell";
import {
  CardShowcase,
  CatalogCard,
  CatalogCardTag,
  EditorialBanner,
  EditorialCard,
  EditorialFilterBar,
  EditorialFooter,
  EditorialHero,
  EditorialMasthead,
  EditorialMastheadAction,
  EditorialMastheadLink,
  EditorialPillNav,
  EditorialPillNavItem,
  EditorialSearch,
  EditorialSection,
  EditorialSectionHead,
  EditorialTextLink,
  Eyebrow,
} from "../editorial";
import { ResponsiveGrid } from "../responsive-grid";
import { Select } from "../../data-entry/select";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
const layoutCss = read("../../../styles/layout.css") + read("../../../styles/editorial-layout.css");
const tokens = read("../../../tokens/components/editorial.css");
const shellTokens = read("../../../tokens/components/shell.css");

const rule = (selector: string) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const bodies = [
    ...layoutCss.matchAll(new RegExp(`(?:^|[\\s}])${esc}\\s*\\{([^}]*)\\}`, "g")),
  ].map((m) => m[1]);
  return bodies.length ? bodies.join("\n") : "";
};

describe("CenteredShell flow (gh#1435)", () => {
  it('stamps data-flow="sections" only when asked, and the section flow drops the column cap, gap and main padding', () => {
    const sections = render(
      <CenteredShell preset="public-landing" flow="sections">
        本文
      </CenteredShell>,
    );
    expect(sections.container.querySelector(".ui-centered-shell")).toHaveAttribute(
      "data-flow",
      "sections",
    );
    const plain = render(<CenteredShell preset="public-landing">本文</CenteredShell>);
    expect(plain.container.querySelector(".ui-centered-shell")).not.toHaveAttribute("data-flow");

    expect(rule('.ui-centered-shell[data-flow="sections"] .ui-centered-shell-main')).toMatch(
      /padding:\s*0/,
    );
    const column = rule('.ui-centered-shell[data-flow="sections"] .ui-centered-shell-column');
    expect(column).toMatch(/max-width:\s*none/);
    expect(column).toMatch(/gap:\s*0/);
  });
});

describe("EditorialSection (gh#1435)", () => {
  it("renders a full-width band with the content in the landing column", () => {
    const { container } = render(
      <EditorialSection tone="hero" divider="end" spacing="section" aria-label="ヒーロー">
        内容
      </EditorialSection>,
    );
    const band = container.querySelector("section.ui-editorial-section")!;
    expect(band).toHaveAttribute("data-tone", "hero");
    expect(band).toHaveAttribute("data-divider", "end");
    expect(band).toHaveAttribute("data-spacing", "section");
    expect(band).toHaveAccessibleName("ヒーロー");
    expect(band.firstElementChild).toHaveClass("ui-editorial-section-content");

    const content = rule(".ui-editorial-section-content");
    expect(content).toMatch(/max-width:\s*var\(--editorial-section-max-width\)/);
    expect(content).toMatch(/width:\s*calc\(100% - 2 \* var\(--editorial-section-inset-inline\)\)/);
    expect(rule('.ui-editorial-section[data-tone="hero"]')).toMatch(
      /--editorial-section-hero-background/,
    );
  });

  it("emits no attribute for the defaults", () => {
    const { container } = render(<EditorialSection>内容</EditorialSection>);
    const band = container.querySelector(".ui-editorial-section")!;
    expect(band).not.toHaveAttribute("data-tone");
    expect(band).not.toHaveAttribute("data-divider");
    expect(band).not.toHaveAttribute("data-spacing");
  });
});

describe("EditorialHero + Eyebrow + EditorialSearch (gh#1435)", () => {
  it("renders the one h1 with kicker, lead, search and suggestions beside the media", () => {
    const onSearch = vi.fn();
    render(
      <EditorialHero
        eyebrow={<Eyebrow>FOR EVERY CARD, EVERY COLLECTOR.</Eyebrow>}
        title="探す。比べる。"
        description="気になる一枚も。"
        search={
          <EditorialSearch
            label="カード名・カード番号"
            placeholder="カード名で検索"
            submitLabel="検索"
            onSearch={onSearch}
          />
        }
        footer={<a href="/cards?q=pikachu">ピカチュウ</a>}
        media={<span>media</span>}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "探す。比べる。" })).toBeInTheDocument();
    const search = screen.getByRole("search", { name: "カード名・カード番号" });
    const field = screen.getByRole("searchbox", { name: "カード名・カード番号" });
    expect(search).toContainElement(field);
    fireEvent.change(field, { target: { value: "  リザードン " } });
    fireEvent.click(screen.getByRole("button", { name: "検索" }));
    expect(onSearch).toHaveBeenCalledWith("リザードン");
  });

  it("the label is visually hidden and the box insets the button (64px box, 6/16 padding)", () => {
    const { container } = render(<EditorialSearch label="検索語" submitLabel="検索" />);
    expect(container.querySelector("label")).toHaveClass("sr-only");
    expect(tokens).toMatch(/--editorial-search-min-height:\s*4rem;/);
    expect(resolveToken("--editorial-search-padding-inline-start", tokenEnvironment)).toBe("16px");
    expect(resolveToken("--editorial-search-padding-block", tokenEnvironment)).toBe("6px");
    expect(rule(".ui-editorial-search")).toMatch(
      /min-height:\s*var\(--editorial-search-min-height\)/,
    );
  });

  it("the ruled kicker leads with an ornament rule; plain has none", () => {
    const { container } = render(
      <>
        <Eyebrow>A</Eyebrow>
        <Eyebrow variant="plain">B</Eyebrow>
      </>,
    );
    const [ruled, plain] = container.querySelectorAll(".ui-editorial-eyebrow");
    expect(ruled).toHaveAttribute("data-variant", "ruled");
    expect(plain).toHaveAttribute("data-variant", "plain");
    const before = rule('.ui-editorial-eyebrow[data-variant="ruled"]::before');
    expect(before).toMatch(/width:\s*var\(--editorial-eyebrow-rule-width\)/);
    expect(before).toMatch(/background:\s*var\(--editorial-ornament-color,/);
  });
});

describe("EditorialSectionHead + EditorialTextLink (gh#1435)", () => {
  it("renders the h2 with an id and the trailing link with its arrow inside the router link", () => {
    render(
      <EditorialSectionHead
        eyebrow={<Eyebrow>THE CURATED SELECTION</Eyebrow>}
        title="いま、気になる一枚。"
        titleId="curated"
        description="ゲームを越えて。"
        action={
          <EditorialTextLink asChild>
            <a href="/cards/">すべて見る</a>
          </EditorialTextLink>
        }
      />,
    );
    const title = screen.getByRole("heading", { level: 2, name: "いま、気になる一枚。" });
    expect(title).toHaveAttribute("id", "curated");
    const link = screen.getByRole("link", { name: "すべて見る" });
    expect(link).toHaveClass("ui-editorial-text-link");
    expect(link.querySelector("svg")).not.toBeNull();
  });
});

describe("EditorialPillNav (gh#1435)", () => {
  it("is a named navigation landmark with pills; the current one keeps aria-current", () => {
    render(
      <EditorialPillNav aria-label="ゲームから探す" label="ゲームから探す">
        <EditorialPillNavItem href="/cards/" aria-current="page" icon="dot">
          すべて
        </EditorialPillNavItem>
        <EditorialPillNavItem asChild icon="dot">
          <a href="/cards/?game=pokemon">ポケモン</a>
        </EditorialPillNavItem>
      </EditorialPillNav>,
    );
    const nav = screen.getByRole("navigation", { name: "ゲームから探す" });
    const current = screen.getByRole("link", { name: "すべて" });
    expect(nav).toContainElement(current);
    expect(current).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "ポケモン" })).toHaveClass("ui-editorial-pill");
    expect(rule('.ui-editorial-pill[aria-current]:not([aria-current="false"])')).toMatch(
      /hsl\(var\(--accent\)\)/,
    );
  });
});

describe("CardShowcase (gh#1435)", () => {
  it("fan: three placed cards (centre painted last), decorations aria-hidden, caption kept", () => {
    const { container } = render(
      <CardShowcase
        preset="fan"
        label="ONE PLACE. MANY WORLDS."
        caption={{ overline: "一枚から。", title: "好きなゲームを。" }}
        items={[
          <a key="a" href="/a" aria-label="A">
            <img alt="A" src="a.png" />
          </a>,
          <a key="b" href="/b" aria-label="B">
            <img alt="B" src="b.png" />
          </a>,
          <a key="c" href="/c" aria-label="C">
            <img alt="C" src="c.png" />
          </a>,
        ]}
      />,
    );
    const cards = [...container.querySelectorAll(".ui-card-showcase-card")];
    expect(cards.map((c) => c.getAttribute("data-position"))).toEqual(["start", "end", "center"]);
    expect(container.querySelectorAll(".ui-card-showcase-orbit")).toHaveLength(3);
    for (const decoration of container.querySelectorAll(
      ".ui-card-showcase-orbit, .ui-card-showcase-star, .ui-card-showcase-label",
    )) {
      expect(decoration).toHaveAttribute("aria-hidden");
    }
    expect(screen.getByText("好きなゲームを。")).toBeInTheDocument();
    expect(rule('.ui-card-showcase-card[data-position="center"]')).toMatch(
      /rotate\(var\(--editorial-showcase-center-offset-angle\)\)/,
    );
    expect(tokens).toMatch(/--editorial-showcase-start-offset-angle:\s*-14deg;/);
  });

  it("binder: one pocket per item in a tilted grid", () => {
    const { container } = render(
      <CardShowcase
        preset="binder"
        items={[1, 2, 3, 4, 5, 6].map((n) => (
          <img key={n} alt="" src={`${n}.png`} />
        ))}
      />,
    );
    expect(container.querySelectorAll(".ui-card-showcase-pocket")).toHaveLength(6);
    expect(rule('.ui-card-showcase[data-preset="binder"]')).toMatch(
      /rotate\(var\(--editorial-binder-offset-angle\)\)/,
    );
  });
});

describe("EditorialBanner (gh#1435)", () => {
  it("renders the title and re-points the kit Button roles inside the action slot", () => {
    render(
      <EditorialBanner
        eyebrow={<Eyebrow>YOUR COLLECTION HAS A STORY.</Eyebrow>}
        title="大切な一枚に。"
        description="自分のペースで。"
        action={<a href="/collection/">はじめる</a>}
        media={<span>binder</span>}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "大切な一枚に。" })).toBeInTheDocument();
    const action = rule(".ui-editorial-banner-action");
    expect(action).toMatch(/--primary:\s*var\(--editorial-banner-action-background,/);
    expect(action).toMatch(/--primary-foreground:\s*var\(--editorial-banner-action-foreground,/);
  });
});

describe("CatalogCard (gh#1435)", () => {
  it("overlays a named favourite toggle and puts the item link in an h3", () => {
    const onPressedChange = vi.fn();
    render(
      <CatalogCard
        media={<img alt="" src="card.png" />}
        favorite={{ pressed: false, onPressedChange, label: "ピカチュウexをお気に入りに保存" }}
        overline="ポケモンカード"
        title={<a href="/cards/1/">ピカチュウex</a>}
        meta={
          <>
            <span>132/106</span>
            <CatalogCardTag>SAR</CatalogCardTag>
          </>
        }
        priceLabel="国内・販売参考価格"
        price="¥12,800"
        change="↓ −4.2% 下落"
      />,
    );
    const toggle = screen.getByRole("button", { name: "ピカチュウexをお気に入りに保存" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(toggle);
    expect(onPressedChange).toHaveBeenCalledWith(true);
    const { getAllByRole } = render(
      <CatalogCard
        media={<img alt="" src="card.png" />}
        favorite={{ pressed: false, onPressedChange, label: "保存（読み込み中）", disabled: true }}
        title={<a href="/cards/2/">リザードンex</a>}
      />,
    );
    expect(getAllByRole("button", { name: "保存（読み込み中）" })[0]).toBeDisabled();
    const heading = screen.getByRole("heading", { level: 3, name: "ピカチュウex" });
    expect(heading.querySelector("a")).toHaveAttribute("href", "/cards/1/");
    expect(screen.getByText("SAR")).toHaveClass("ui-catalog-card-tag");
    expect(rule(".ui-catalog-card-favorite")).toMatch(/position:\s*absolute/);
    expect(
      resolveToken("--editorial-catalog-card-media-padding-block-start", tokenEnvironment),
    ).toBe("48px");
    expect(rule(".ui-catalog-card-price-label")).toMatch(
      /-webkit-line-clamp:\s*var\(--editorial-catalog-card-price-label-line-clamp\)/,
    );
    expect(tokens).toMatch(/--editorial-catalog-card-price-label-line-clamp:\s*none;/);
  });
});

describe("EditorialCard (gh#1435)", () => {
  it("journal: the whole card is one link named by its title", () => {
    render(
      <EditorialCard
        variant="journal"
        link={<a href="/journal/price-guide/" />}
        media={<img alt="" src="cover.jpg" />}
        overline="価格の見方"
        title="同じカードでも、価格が違う理由。"
        description="状態や言語で価格は変わります。"
        action="記事を読む"
      />,
    );
    expect(screen.getByRole("link", { name: "同じカードでも、価格が違う理由。" })).toHaveAttribute(
      "href",
      "/journal/price-guide/",
    );
  });

  it("spotlight: the link is the card, with the picture hidden from assistive tech", () => {
    const { container } = render(
      <EditorialCard
        variant="spotlight"
        link={<a href="/expansions/sv9/" />}
        media={<img alt="" src="set.png" />}
        overline="SV9 · ポケモン"
        title="バトルパートナーズ"
        description="掲載 106枚"
      />,
    );
    const link = screen.getByRole("link", { name: /バトルパートナーズ/ });
    expect(link).toHaveAttribute("data-variant", "spotlight");
    expect(container.querySelector(".ui-editorial-card-media")).toHaveAttribute("aria-hidden");
  });
});

describe("ResponsiveGrid token presets (gh#1435)", () => {
  it("catalog / trio / lead read their tracks and gap from tokens", () => {
    const { container } = render(
      <ResponsiveGrid preset="catalog">
        <span>a</span>
      </ResponsiveGrid>,
    );
    expect(container.querySelector(".ui-responsive-grid")).toHaveAttribute(
      "data-preset",
      "catalog",
    );
    for (const preset of ["catalog", "trio", "lead"]) {
      const body = rule(`.ui-responsive-grid[data-preset="${preset}"]`);
      expect(body).toMatch(
        new RegExp(`grid-template-columns:\\s*var\\(--responsive-grid-${preset}-track-size\\)`),
      );
      expect(body).toMatch(new RegExp(`gap:\\s*var\\(--responsive-grid-${preset}-gap\\)`));
      expect(shellTokens).toMatch(new RegExp(`--responsive-grid-${preset}-track-size:`));
    }
  });

  it("pricing-plans keeps its container steps and emits no data-preset", () => {
    const { container } = render(
      <ResponsiveGrid preset="pricing-plans">
        <span>a</span>
      </ResponsiveGrid>,
    );
    expect(container.querySelector(".ui-responsive-grid")).not.toHaveAttribute("data-preset");
  });
});

describe("EditorialMasthead (gh#1435)", () => {
  it("renders logo, a named navigation with the current link, and the end actions", () => {
    const onLocale = vi.fn();
    render(
      <EditorialMasthead
        brand={
          <a href="/ja/" aria-label="TCG-M ホーム">
            logo
          </a>
        }
        navLabel="メインナビゲーション"
        nav={
          <>
            <EditorialMastheadLink href="/ja/cards/" aria-current="page">
              カードを探す
            </EditorialMastheadLink>
            <EditorialMastheadLink asChild>
              <a href="/ja/products/">BOX・パック</a>
            </EditorialMastheadLink>
          </>
        }
        actions={
          <>
            <Select
              aria-label="表示言語"
              variant="borderless"
              width="auto"
              value="ja"
              options={[
                { value: "ja", label: "日本語" },
                { value: "en", label: "EN" },
              ]}
              onValueChange={onLocale}
            />
            <EditorialMastheadAction aria-label="配色を切り替える" collapse>
              ☾
            </EditorialMastheadAction>
            <EditorialMastheadAction asChild variant="outline">
              <a href="/ja/login/" aria-label="ログイン">
                ☺
              </a>
            </EditorialMastheadAction>
          </>
        }
      />,
    );
    const nav = screen.getByRole("navigation", { name: "メインナビゲーション" });
    expect(nav).toContainElement(screen.getByRole("link", { name: "カードを探す" }));
    expect(screen.getByRole("link", { name: "BOX・パック" })).toHaveClass(
      "ui-editorial-masthead-link",
    );
    // Pickers are the kit's Select (its own listbox popup), never a native <select>.
    const picker = screen.getByRole("combobox", { name: "表示言語" });
    expect(picker).toHaveAttribute("data-slot", "select-trigger");
    // (react-aria keeps a hidden, untabbable <select> for form submission only.)
    expect(document.querySelector('.ui-editorial-masthead select:not([tabindex="-1"])')).toBeNull();
    expect(rule('.ui-editorial-masthead-actions [data-slot="select-trigger"]')).toMatch(
      /min-height:\s*var\(--editorial-masthead-action-size\)/,
    );
    // Measured on a consumer: the trigger kept the control tier's 48px beside 44px actions, and
    // a design's picker width cap per breakpoint had no knob.
    const pickerRule = rule('.ui-editorial-masthead-actions [data-slot="select-trigger"]');
    expect(pickerRule).toMatch(/(^|[\s;{])height:\s*var\(--editorial-masthead-action-size\)/);
    expect(pickerRule).toMatch(/--control-height:\s*var\(--editorial-masthead-action-size\)/);
    expect(pickerRule).toMatch(/max-width:\s*var\(--editorial-masthead-picker-max-width\)/);
    expect(tokens).toMatch(/--editorial-masthead-picker-max-width:\s*none;/);
    expect(screen.getByRole("button", { name: "配色を切り替える" })).toHaveAttribute(
      "data-collapse",
    );
    expect(screen.getByRole("link", { name: "ログイン" })).toHaveAttribute(
      "data-variant",
      "outline",
    );
    expect(rule(".ui-centered-shell-bar:has(> .ui-editorial-masthead)")).toMatch(
      /position:\s*sticky/,
    );
    expect(rule('.ui-editorial-masthead-link[aria-current="page"]::after')).toMatch(
      /height:\s*var\(--editorial-masthead-indicator-size\)/,
    );
  });
});

describe("EditorialFooter (gh#1435)", () => {
  it("renders brand, titled link groups and the bottom row; the holding footer takes the editorial spacing", () => {
    render(
      <EditorialFooter
        brand={
          <a href="/ja/" aria-label="TCG-M ホーム">
            logo
          </a>
        }
        tagline="探す。比べる。"
        groups={[
          {
            title: "見つける",
            links: [
              <a key="c" href="/ja/cards/">
                カードを探す
              </a>,
            ],
          },
        ]}
        legal="© 2026 TCG-M."
        note="権利は各権利者に帰属します。"
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "見つける" })).toBeInTheDocument();
    expect(screen.getByText("© 2026 TCG-M.")).toBeInTheDocument();
    expect(
      rule(".ui-centered-shell .ui-centered-shell-footer:has(> .ui-editorial-footer)"),
    ).toMatch(/margin-block-start:\s*var\(--editorial-footer-space-block-start\)/);
  });
});

describe("EditorialFilterBar (gh#1435)", () => {
  it("is a named group of aria-pressed toggles, one pressed", () => {
    const onValueChange = vi.fn();
    render(
      <EditorialFilterBar
        aria-label="表示条件"
        value="all"
        onValueChange={onValueChange}
        options={[
          { value: "all", label: "ピックアップ" },
          { value: "down", label: "値下がり" },
        ]}
        extra="30日前比"
      />,
    );
    expect(screen.getByRole("group", { name: "表示条件" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ピックアップ" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "値下がり" }));
    expect(onValueChange).toHaveBeenCalledWith("down");
    expect(rule('.ui-editorial-filter-bar-option[aria-pressed="true"]')).toMatch(
      /border-block-end-color:\s*hsl\(var\(--primary\)\)/,
    );
  });
});

describe("Button label knobs (gh#1435)", () => {
  it("reads --button-font-weight and the default size reads --button-font-size", () => {
    const control = read("../../../styles/control.css");
    expect(control).toMatch(/\.ui-button \{[^}]*font-weight:\s*var\(--button-font-weight\)/);
    expect(control).toMatch(
      /\.ui-button--default-size \{[^}]*font-size:\s*var\(--button-font-size\)/,
    );
    expect(control).toMatch(
      /\.ui-button--default-size \{[^}]*padding-inline:\s*var\(--button-padding-inline\)/,
    );
  });
});

describe("EditorialSearch scope (gh#1435)", () => {
  it("hosts the kit Select as its scope inside the box, before the field", () => {
    const onSearch = vi.fn();
    render(
      <EditorialSearch
        label="カード名"
        submitLabel="検索"
        onSearch={onSearch}
        scope={
          <Select
            aria-label="ゲーム"
            name="game"
            variant="borderless"
            width="auto"
            value="pokemon"
            options={[
              { value: "pokemon", label: "ポケモンカードゲーム" },
              { value: "onepiece", label: "ONE PIECEカードゲーム" },
            ]}
            onValueChange={() => {}}
          />
        }
      />,
    );
    const search = screen.getByRole("search");
    const trigger = screen.getByRole("combobox", { name: "ゲーム" });
    expect(search).toContainElement(trigger);
    expect(trigger).toHaveAttribute("data-slot", "select-trigger");
    expect(search.querySelector('select:not([tabindex="-1"])')).toBeNull();
    // The trigger comes before the field in the box.
    expect(
      trigger.compareDocumentPosition(screen.getByRole("searchbox")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "ルフィ" } });
    fireEvent.click(screen.getByRole("button", { name: "検索" }));
    expect(onSearch).toHaveBeenCalledWith("ルフィ");
    expect(rule(".ui-editorial-search-scope")).toMatch(/border-inline-end:/);
  });
});

// Resolve the token graph at the 16px root used by the measured editorial design.
const tokenEnvironment = new Map(
  [...environment({ selectors: [":root"] })].map(([name, value]) => [
    name,
    value.replace(/([\d.]+)rem\b/g, (_, n: string) => `${Number(n) * 16}px`),
  ]),
);

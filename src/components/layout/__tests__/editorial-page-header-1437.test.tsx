import { environment, resolveToken } from "../../../tokens/__tests__/css-token-resolve";
/**
 * gh#1437 — EditorialPageHeader + EditorialBreadcrumb: the intro of an editorial listing / reader
 * page (trail, ruled kicker, the page's one h1, a lead and an action on the title row), every
 * length a `--editorial-page-header-*` / `--editorial-breadcrumb-*` token so a theme matches a
 * design's own breakpoints. Fails without the change (the exports and the rules do not exist).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EditorialBreadcrumb, EditorialPageHeader, Eyebrow } from "../editorial";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
const layoutCss = read("../../../styles/layout.css");
const tokens = read("../../../tokens/components/editorial.css");

const rule = (selector: string) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...layoutCss.matchAll(new RegExp(`(?:^|[\\s}])${esc}\\s*\\{([^}]*)\\}`, "g"))]
    .map((m) => m[1])
    .join("\n");
};

function RouterLink({ to, children, ...rest }: { to: string; children?: React.ReactNode }) {
  return (
    <a data-router="" href={to} {...rest}>
      {children}
    </a>
  );
}

describe("EditorialBreadcrumb (gh#1437)", () => {
  it("is the Breadcrumb landmark: router links for ancestors, aria-current on the last", () => {
    render(
      <EditorialBreadcrumb
        ariaLabel="パンくずリスト"
        linkComponent={RouterLink}
        items={[
          { label: "ホーム", to: "/ja/" },
          { label: "ポケモンカード", to: "/ja/pokemon/" },
          { label: "カード", to: "/ja/pokemon/cards/" },
          { label: "ピカチュウ" },
        ]}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "パンくずリスト" });
    expect(nav.closest(".ui-editorial-breadcrumb")).not.toBeNull();
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/ja/",
      "/ja/pokemon/",
      "/ja/pokemon/cards/",
    ]);
    links.forEach((a) => expect(a).toHaveAttribute("data-router"));
    expect(within(nav).getByText("ピカチュウ")).toHaveAttribute("aria-current", "page");
  });

  it("reads its inset, gap and leading from tokens (column gap only: the coarse row pitch stays)", () => {
    expect(resolveToken("--editorial-breadcrumb-padding-block-start", tokenEnvironment)).toBe(
      "24px",
    );
    expect(resolveToken("--editorial-breadcrumb-gap", tokenEnvironment)).toBe("8px");
    expect(tokens).toMatch(/--editorial-breadcrumb-line-height:\s*1\.7;/);
    const box = rule(".ui-editorial-breadcrumb");
    expect(box).toMatch(/padding-block-start:\s*var\(--editorial-breadcrumb-padding-block-start\)/);
    expect(box).toMatch(/line-height:\s*var\(--editorial-breadcrumb-line-height\)/);
    const list = rule(".ui-editorial-breadcrumb .ui-breadcrumb-list");
    expect(list).toMatch(/column-gap:\s*var\(--editorial-breadcrumb-gap\)/);
    expect(list).not.toMatch(/(^|[^-])gap:/);
  });
});

describe("EditorialPageHeader (gh#1437)", () => {
  it("renders the trail, then a header with the kicker, the one h1, the lead and the action", () => {
    const { container } = render(
      <EditorialPageHeader
        breadcrumb={[{ label: "ホーム", to: "/ja/" }, { label: "読みもの" }]}
        eyebrow={<Eyebrow>THE TCG-M JOURNAL</Eyebrow>}
        title="知るほど、トレカはおもしろい。"
        titleId="journal-title"
        description="探すとき、比べるとき、集めるとき。"
        actions={<button type="button">追加</button>}
      />,
    );
    const root = container.firstElementChild!;
    expect(root).toHaveClass("ui-editorial-page-header");
    expect(root.firstElementChild).toHaveClass("ui-editorial-breadcrumb");
    const header = root.querySelector("header.ui-editorial-page-header-row")!;
    const h1 = screen.getByRole("heading", { level: 1, name: "知るほど、トレカはおもしろい。" });
    expect(h1).toHaveAttribute("id", "journal-title");
    expect(header).toContainElement(h1);
    expect(header.querySelector(".ui-editorial-eyebrow")).toHaveTextContent("THE TCG-M JOURNAL");
    expect(header.querySelector(".ui-editorial-page-header-description")).toHaveTextContent(
      "探すとき",
    );
    expect(
      within(header.querySelector(".ui-editorial-page-header-actions") as HTMLElement).getByRole(
        "button",
        { name: "追加" },
      ),
    ).toBeInTheDocument();
  });

  it("renders no trail, lead or action wrapper when they are not given", () => {
    const { container } = render(<EditorialPageHeader title="設定" breadcrumb={[]} />);
    expect(container.querySelector(".ui-editorial-breadcrumb")).toBeNull();
    expect(container.querySelector(".ui-editorial-page-header-description")).toBeNull();
    expect(container.querySelector(".ui-editorial-page-header-actions")).toBeNull();
  });

  it("every length is a token; the kicker inside takes the header's own size and colour knobs", () => {
    expect(resolveToken("--editorial-page-header-padding-block-start", tokenEnvironment)).toBe(
      "28px",
    );
    expect(resolveToken("--editorial-page-header-padding-block-end", tokenEnvironment)).toBe(
      "32px",
    );
    expect(tokens).toMatch(/--editorial-page-header-title-font-size:\s*2\.25rem;/);
    expect(tokens).toMatch(/--editorial-page-header-description-max-width:\s*47\.5rem;/);
    const row = rule(".ui-editorial-page-header-row");
    expect(row).toMatch(/display:\s*var\(--editorial-page-header-row-display\)/);
    expect(row).toMatch(/padding-block:\s*var\(--editorial-page-header-padding-block-start\)/);
    const title = rule(".ui-editorial-page-header-title");
    expect(title).toMatch(/margin:\s*var\(--editorial-page-header-title-space-block-start\) 0/);
    expect(title).toMatch(/font-size:\s*var\(--editorial-page-header-title-font-size\)/);
    expect(rule(".ui-editorial-page-header .ui-editorial-page-header-title:lang(ja)")).toMatch(
      /word-break:\s*var\(--editorial-page-header-title-line-breaking\)/,
    );
    expect(tokens).toMatch(/--editorial-page-header-title-line-breaking:\s*auto-phrase;/);
    const lead = rule(".ui-editorial-page-header-description");
    expect(lead).toMatch(/max-width:\s*var\(--editorial-page-header-description-max-width\)/);
    const kicker = rule(".ui-editorial-page-header-copy > .ui-editorial-eyebrow");
    expect(kicker).toMatch(/font-size:\s*var\(--editorial-page-header-kicker-font-size\)/);
    expect(kicker).toMatch(/color:\s*var\(\s*--editorial-page-header-kicker-color,/);
  });
});

// Resolve the token graph at the 16px root used by the measured editorial design.
const tokenEnvironment = new Map(
  [...environment({ selectors: [":root"] })].map(([name, value]) => [
    name,
    value.replace(/([\d.]+)rem\b/g, (_, n: string) => `${Number(n) * 16}px`),
  ]),
);

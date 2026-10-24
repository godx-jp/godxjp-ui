/**
 * gh#1438 — the item page of the editorial catalog: its head (framed picture with the save toggle,
 * kicker, h1, tags, summary price, actions, facts), the bands under it, the joined price summary
 * strip and the polite sign-in prompt.
 *
 * Before: none of these could be laid out as Website v4 without a className or style (two fixed
 * tracks, a framed picture with an overlaid toggle, figures split by hairlines that follow a
 * phone wrap). Every length is an `--editorial-*` token.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CatalogDetail,
  CatalogDetailSection,
  CatalogDetailTag,
  EditorialPrompt,
  PriceSummary,
} from "../editorial-catalog";
import * as layout from "../index";

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

describe("exports (gh#1438)", () => {
  it("are on the layout entry", () => {
    expect(layout.CatalogDetail).toBe(CatalogDetail);
    expect(layout.CatalogDetailTag).toBe(CatalogDetailTag);
    expect(layout.CatalogDetailSection).toBe(CatalogDetailSection);
    expect(layout.PriceSummary).toBe(PriceSummary);
    expect(layout.EditorialPrompt).toBe(EditorialPrompt);
  });
});

describe("CatalogDetail / CatalogDetailTag (gh#1438)", () => {
  it("renders the one h1, the save toggle over the frame, summary, actions and facts as a dl", () => {
    let pressed = false;
    render(
      <CatalogDetail
        media={<img src="x.png" alt="Pikachu ex" />}
        favorite={{
          pressed: false,
          onPressedChange: (next) => {
            pressed = next;
          },
          label: "Save Pikachu ex",
        }}
        mediaCaption="Image: catalogue"
        overline={<p>Pokémon</p>}
        title="Pikachu ex"
        meta={<CatalogDetailTag>SAR</CatalogDetailTag>}
        summary={{ label: "Market", price: "¥32,800", note: "Reference" }}
        actions={<button type="button">Add</button>}
        facts={[
          { key: "set", label: "Expansion", value: "151" },
          { key: "lang", label: "Language", value: "Japanese" },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Pikachu ex");
    const save = screen.getByRole("button", { name: "Save Pikachu ex" });
    expect(save.closest(".ui-catalog-detail-art")).toBeTruthy();
    save.click();
    expect(pressed).toBe(true);
    expect(screen.getByText("¥32,800").className).toBe("ui-catalog-detail-summary-price");
    expect(screen.getByText("SAR").className).toBe("ui-catalog-detail-tag");
    expect(screen.getAllByRole("term").map((n) => n.textContent)).toEqual(["Expansion", "Language"]);
  });

  it("lays out two token-driven tracks and a framed picture", () => {
    expect(rule(".ui-catalog-detail")).toMatch(
      /grid-template-columns:\s*var\(--editorial-catalog-detail-track-size\)/,
    );
    const art = rule(".ui-catalog-detail-art");
    expect(art).toMatch(/min-height:\s*var\(--editorial-catalog-detail-art-min-height\)/);
    expect(art).toMatch(/border-radius:\s*var\(--editorial-catalog-detail-art-radius\)/);
    expect(rule(".ui-catalog-detail-summary")).toMatch(/border-block:/);
    expect(rule(".ui-catalog-detail-facts")).toMatch(
      /grid-template-columns:\s*var\(--editorial-catalog-detail-facts-track-size\)/,
    );
    expect(tokens).toMatch(/--editorial-catalog-detail-track-size:\s*21\.875rem minmax\(0, 1fr\)/);
    expect(tokens).toMatch(/--editorial-catalog-detail-summary-price-font-size:\s*2\.5rem/);
  });
});

describe("CatalogDetailSection (gh#1438)", () => {
  it("is a region named by its h2, under a top hairline", () => {
    render(
      <CatalogDetailSection titleId="info" title="Card information" description="From the catalogue." />,
    );
    expect(screen.getByRole("region", { name: "Card information" })).toBeTruthy();
    expect(rule(".ui-catalog-detail-section")).toMatch(/border-block-start:/);
  });

  it('variant="module" carries the id, drops the hairline and reads the module rhythm', () => {
    const { container } = render(<CatalogDetailSection variant="module" id="price-section" />);
    const section = container.querySelector("section");
    expect(section?.id).toBe("price-section");
    expect(section?.getAttribute("data-variant")).toBe("module");
    const body = rule('.ui-catalog-detail-section[data-variant="module"]');
    expect(body).toMatch(/padding-block:\s*var\(--editorial-catalog-detail-module-padding-block\)/);
    expect(body).toMatch(/border-block-start:\s*0/);
  });

  it("lets a theme give the lead action a row of its own", () => {
    expect(rule(".ui-catalog-detail-actions > :first-child")).toMatch(
      /flex-basis:\s*var\(--editorial-catalog-detail-actions-lead-width-basis\)/,
    );
    expect(tokens).toMatch(/--editorial-catalog-detail-actions-lead-width-basis:\s*auto/);
  });
});

describe("PriceSummary (gh#1438)", () => {
  it("renders one cell per figure plus the context cell last", () => {
    const { container } = render(
      <PriceSummary
        items={[
          { key: "sell", label: "Asking", value: "¥32,800", caption: "Japan" },
          { key: "buy", label: "Buying", value: "¥23,616" },
        ]}
        context={{ label: "Compared", value: "JP · NM · Raw" }}
      />,
    );
    const cells = container.querySelectorAll(".ui-price-summary-cell");
    expect(cells).toHaveLength(3);
    expect(cells[2].hasAttribute("data-context")).toBe(true);
    expect(screen.getByText("¥32,800").tagName).toBe("STRONG");
  });

  it("draws dividers as a hairline gap over the border ground and shares the row by tokens", () => {
    const strip = rule(".ui-price-summary");
    expect(strip).toMatch(/gap:\s*var\(--stroke-hairline\)/);
    expect(strip).toMatch(/background:\s*hsl\(var\(--border\)\)/);
    expect(rule(".ui-price-summary-cell")).toMatch(
      /flex:\s*1 1 var\(--editorial-price-summary-cell-width-basis\)/,
    );
    expect(rule(".ui-price-summary-cell[data-context]")).toMatch(
      /var\(--editorial-price-summary-context-size-grow\)/,
    );
    expect(tokens).toMatch(/--editorial-price-summary-context-size-grow:\s*1\.15/);
  });
});

describe("EditorialPrompt (gh#1438)", () => {
  it("renders glyph, heading, paragraph, note and the action, without a live region", () => {
    const { container } = render(
      <EditorialPrompt
        icon={<svg />}
        title="See more when you sign in"
        description="Per-market prices are for members."
        note="Free."
        action={<a href="/login">Sign in</a>}
      />,
    );
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("See more when you sign in");
    expect(screen.getByRole("link", { name: "Sign in" })).toBeTruthy();
    expect(container.querySelector("[role=status],[role=alert],[aria-live]")).toBeNull();
    expect(container.querySelector(".ui-editorial-prompt-icon")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  it("scopes the action's button knobs", () => {
    const action = rule(".ui-editorial-prompt-action");
    expect(action).toMatch(/--button-radius:\s*var\(--editorial-prompt-action-radius\)/);
    expect(action).toMatch(/--button-font-weight:\s*var\(--editorial-prompt-action-font-weight\)/);
  });

  it("keeps the action beside the copy unless a theme lets the copy grow", () => {
    expect(rule(".ui-editorial-prompt-copy")).toMatch(
      /flex:\s*var\(--editorial-prompt-copy-size-grow\) 1 var\(--editorial-prompt-copy-width-basis\)/,
    );
    expect(tokens).toMatch(/--editorial-prompt-copy-size-grow:\s*0/);
  });
});

describe("Button outline ink knob (gh#1438)", () => {
  const controlCss = read("../../../styles/control.css");
  it("reads --button-outline-foreground, defaulting to --foreground", () => {
    const outline = [...controlCss.matchAll(/\.ui-button--outline\s*\{([^}]*)\}/g)].map((m) => m[1]).join("\n");
    expect(outline).toMatch(/color:\s*var\(--button-outline-foreground, hsl\(var\(--foreground\)\)\)/);
  });

  it("is set to the action colour on no fill inside the catalog's filter action and item actions", () => {
    for (const selector of [".ui-editorial-filter-panel-action", ".ui-catalog-detail-actions"]) {
      const body = rule(selector);
      expect(body).toMatch(/--button-outline-foreground:\s*var\(--editorial-catalog-outline-color, hsl\(var\(--primary\)\)\)/);
      expect(body).toMatch(/--button-outline-background:\s*var\(--editorial-catalog-outline-background, transparent\)/);
    }
  });
});

describe("EditorialSectionHead scale (gh#1438)", () => {
  it('stamps data-scale only for "module"', async () => {
    const { EditorialSectionHead } = await import("../editorial");
    const { container, rerender } = render(<EditorialSectionHead title="Compare" scale="module" />);
    expect(container.firstElementChild?.getAttribute("data-scale")).toBe("module");
    rerender(<EditorialSectionHead title="Compare" />);
    expect(container.firstElementChild?.hasAttribute("data-scale")).toBe(false);
  });

  it("re-points the head's knobs to the module scale", () => {
    const body = rule('.ui-editorial-section-head[data-scale="module"]');
    expect(body).toMatch(/--editorial-section-head-title-font-size:\s*var\(--editorial-section-head-module-title-font-size\)/);
    expect(body).toMatch(/--editorial-eyebrow-letter-spacing:\s*var\(--editorial-section-head-module-kicker-letter-spacing\)/);
    expect(tokens).toMatch(/--editorial-section-head-module-title-font-size:\s*1\.875rem/);
  });
});

/**
 * gh#1438 — the editorial catalog bodies: a listing's filter panel (labelled fields that wrap,
 * bottom aligned, with a trailing reset) and its toolbar (result count + note, order / view).
 *
 * Before: the only filter strip was the application `Toolbar` (400-weight labels, 16px controls on
 * the page ground, search + count + actions in one row), so a catalog laid out as Website v4 needed a
 * className or style. Every length is an `--editorial-*` token, re-declared by a theme at its own
 * breakpoints.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  EditorialFilterField,
  EditorialFilterPanel,
  EditorialListingToolbar,
} from "../editorial-catalog";
import { EditorialPageHeader } from "../editorial";
import * as layout from "../index";

describe("EditorialPageHeader search slot (gh#1438)", () => {
  it("renders the search inside the header, after the description", () => {
    render(
      <EditorialPageHeader
        title="Cards"
        description="Search by name."
        search={<form role="search" aria-label="Cards" />}
      />,
    );
    const search = screen.getByRole("search", { name: "Cards" });
    const slot = search.parentElement;
    expect(slot?.className).toBe("ui-editorial-page-header-search");
    expect(slot?.previousElementSibling?.textContent).toBe("Search by name.");
    expect(slot?.closest("header")).toBeTruthy();
  });

  it("leaves a header without a search unchanged", () => {
    const { container } = render(<EditorialPageHeader title="Journal" />);
    expect(container.querySelector(".ui-editorial-page-header-search")).toBeNull();
  });

  it("caps and spaces the search from tokens", () => {
    const slot = rule(".ui-editorial-page-header-search");
    expect(slot).toMatch(/max-width:\s*var\(--editorial-page-header-search-max-width\)/);
    expect(slot).toMatch(/margin-block-start:\s*var\(--editorial-page-header-search-space-block-start\)/);
    expect(tokens).toMatch(/--editorial-page-header-search-max-width:\s*45rem/);
    // The search button inside a page header drops the hero's arrow.
    expect(slot).toMatch(
      /--editorial-search-button-icon-display:\s*var\(--editorial-page-header-search-button-icon-display\)/,
    );
    expect(tokens).toMatch(/--editorial-page-header-search-button-icon-display:\s*none/);
  });
});

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

describe("EditorialFilterPanel / EditorialFilterField (gh#1438)", () => {
  it("is exported from the layout entry", () => {
    expect(layout.EditorialFilterPanel).toBe(EditorialFilterPanel);
    expect(layout.EditorialFilterField).toBe(EditorialFilterField);
    expect(layout.EditorialListingToolbar).toBe(EditorialListingToolbar);
  });

  it("renders a named group whose visible labels name their controls, with the action last", () => {
    render(
      <EditorialFilterPanel aria-label="Filters" action={<button type="button">Reset</button>}>
        <EditorialFilterField label="Expansion" htmlFor="f-set">
          <select id="f-set">
            <option>All</option>
          </select>
        </EditorialFilterField>
        <EditorialFilterField label="Rarity" htmlFor="f-rarity">
          <select id="f-rarity">
            <option>All</option>
          </select>
        </EditorialFilterField>
      </EditorialFilterPanel>,
    );
    const group = screen.getByRole("group", { name: "Filters" });
    expect(screen.getByLabelText("Expansion").id).toBe("f-set");
    expect(screen.getByLabelText("Rarity").id).toBe("f-rarity");
    expect(group.lastElementChild?.textContent).toBe("Reset");
  });

  it("lays fields out as a wrapping, bottom-aligned row on a bordered surface, all from tokens", () => {
    const panel = rule(".ui-editorial-filter-panel");
    expect(panel).toMatch(/flex-wrap:\s*wrap/);
    expect(panel).toMatch(/align-items:\s*flex-end/);
    expect(panel).toMatch(/padding:\s*var\(--editorial-filter-panel-padding\)/);
    expect(panel).toMatch(/gap:\s*var\(--editorial-filter-panel-gap\)/);
    expect(panel).toMatch(/border-radius:\s*var\(--editorial-filter-panel-radius\)/);
    expect(panel).toMatch(/background:\s*hsl\(var\(--card\)\)/);
    // The selects inside read the panel's scale, not the app default.
    expect(panel).toMatch(/--control-font-size:\s*var\(--editorial-filter-panel-control-font-size\)/);
    expect(panel).toMatch(/--control-padding-x:\s*var\(--editorial-filter-panel-control-padding-x\)/);
    expect(panel).toMatch(/--control-surface-background:\s*var\(\s*--editorial-filter-panel-control-background/);
    const field = rule(".ui-editorial-filter-field");
    expect(field).toMatch(/flex:\s*1 1 var\(--editorial-filter-field-width-basis\)/);
    expect(field).toMatch(/min-width:\s*var\(--editorial-filter-field-min-width\)/);
    expect(rule(".ui-editorial-filter-field-label")).toMatch(/font-weight:\s*var\(--editorial-filter-field-label-font-weight\)/);
    expect(tokens).toMatch(/--editorial-filter-field-label-font-weight:\s*var\(--font-weight-semibold\)/);
    expect(rule(".ui-editorial-filter-panel-action")).toMatch(/flex-grow:\s*var\(--editorial-filter-panel-action-size-grow\)/);
  });

  it('variant="bare" keeps the field row and drops the frame, with its own label scale', () => {
    const { container } = render(
      <EditorialFilterPanel aria-label="Compare" variant="bare">
        <EditorialFilterField label="Currency" htmlFor="c">
          <select id="c" />
        </EditorialFilterField>
      </EditorialFilterPanel>,
    );
    expect(container.firstElementChild?.getAttribute("data-variant")).toBe("bare");
    const bare = rule('.ui-editorial-filter-panel[data-variant="bare"]');
    expect(bare).toMatch(/border:\s*0/);
    expect(bare).toMatch(/padding:\s*0/);
    expect(bare).toMatch(/background:\s*transparent/);
    expect(bare).toMatch(/--editorial-filter-field-label-font-size:\s*var\(--editorial-filter-panel-bare-label-font-size\)/);
    expect(tokens).toMatch(/--editorial-filter-panel-bare-label-font-size:\s*0\.8125rem/);
  });

  it("ships the v4 defaults as tokens", () => {
    expect(tokens).toMatch(/--editorial-filter-panel-padding:\s*1\.25rem/);
    expect(tokens).toMatch(/--editorial-filter-panel-gap:\s*1rem/);
    expect(tokens).toMatch(/--editorial-filter-field-min-width:\s*9\.0625rem/);
    expect(tokens).toMatch(/--editorial-filter-panel-control-font-size:\s*0\.875rem/);
  });
});

describe("EditorialListingToolbar (gh#1438)", () => {
  it("announces the count politely and puts the actions at the end", () => {
    render(
      <EditorialListingToolbar
        count="396 results"
        note="Reference prices."
        actions={<button type="button">Sort</button>}
      />,
    );
    const count = screen.getByText("396 results");
    expect(count.getAttribute("aria-live")).toBe("polite");
    expect(screen.getByText("Reference prices.")).toBeTruthy();
    const root = count.closest("[data-slot=editorial-listing-toolbar]");
    expect(root?.lastElementChild?.textContent).toBe("Sort");
  });

  it("renders nothing for the summary when neither count nor note is given", () => {
    const { container } = render(<EditorialListingToolbar actions={<span>x</span>} />);
    expect(container.querySelector(".ui-editorial-listing-toolbar-summary")).toBeNull();
  });

  it("takes free start / end slots (end in place of actions) and an optional hairline", () => {
    const { container } = render(
      <EditorialListingToolbar divider start={<span>lead</span>} end={<span>tail</span>} actions={<span>old</span>} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.hasAttribute("data-divider")).toBe(true);
    expect(root.querySelector(".ui-editorial-listing-toolbar-summary")?.textContent).toBe("lead");
    expect(root.lastElementChild?.textContent).toBe("tail");
    expect(rule(".ui-editorial-listing-toolbar[data-divider]")).toMatch(/border-block-end:/);
  });

  it("spaces the row and sizes its selects from tokens; the count can be hidden by a theme", () => {
    const bar = rule(".ui-editorial-listing-toolbar");
    expect(bar).toMatch(/justify-content:\s*space-between/);
    expect(bar).toMatch(/margin-block:\s*var\(--editorial-listing-toolbar-space-block\)/);
    expect(bar).toMatch(/align-items:\s*var\(--editorial-listing-toolbar-align\)/);
    expect(rule(".ui-editorial-listing-toolbar-count")).toMatch(
      /display:\s*var\(--editorial-listing-toolbar-count-display\)/,
    );
    expect(rule(".ui-editorial-listing-toolbar-actions .ui-control-trigger")).toMatch(
      /min-width:\s*var\(--editorial-listing-toolbar-control-min-width\)/,
    );
    expect(tokens).toMatch(/--editorial-listing-toolbar-control-min-width:\s*9\.375rem/);
  });
});

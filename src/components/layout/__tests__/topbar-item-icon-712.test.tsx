/**
 * gh#712 — a TopbarItem's glyph survives being wrapped.
 *
 * `.ui-topbar-item > svg` reaches a DIRECT child only, so a cell that wraps its glyph to hide it by
 * breakpoint (`<Flex hideBelow="sm">`) loses the metric: measured at 390px in Chromium, an
 * org-switcher glyph drew at lucide's intrinsic **24px** against the cell's own 16px step.
 *
 * Widening the rule was tried and MEASURED before it was rejected, and the numbers are why this is
 * a slot instead: as a descendant rule at (0,1,1) a Badge's own glyph inside the cell went
 * 12px → 16px (`[data-slot="badge-icon"]` is only (0,1,0)); raised to (0,2,1) so it could reach
 * through a wrapper, it also out-ranked `.ui-button svg` and a nested `Button size="sm"` glyph went
 * 14px → 16px. A rule that resizes OTHER components' glyphs is not a fix.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Building2 } from "lucide-react";
import { describe, expect, it } from "vitest";

import { Icon } from "../../general/icon";
import { Flex } from "../flex";
import { TopbarItem } from "../topbar-item";
import { renderWithUi, screen } from "@/test/render";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");
const shell = read("../../../styles/shell-layout.css");
const slotOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="topbar-item-icon"]');

describe("TopbarItem icon slot (gh#712)", () => {
  it("renders no slot node at all when the prop is absent", () => {
    const { container } = renderWithUi(<TopbarItem aria-label="拠点">東京本社</TopbarItem>);
    expect(slotOf(container)).toBeNull();
  });

  it("puts the glyph in a box the CELL owns, ahead of the label", () => {
    const { container } = renderWithUi(<TopbarItem icon={<Building2 />}>東京本社</TopbarItem>);
    const slot = slotOf(container);
    expect(slot).toHaveClass("ui-topbar-item-icon");
    expect(slot?.querySelector("svg")).not.toBeNull();
    const cell = screen.getByRole("button", { name: "東京本社" });
    expect(cell.firstElementChild).toBe(slot);
  });

  it("ignores the slot under asChild — Slot has nowhere to put a sibling", () => {
    const { container } = renderWithUi(
      <TopbarItem asChild icon={<Building2 />}>
        <a href="/org">東京本社</a>
      </TopbarItem>,
    );
    expect(slotOf(container)).toBeNull();
    expect(container.querySelector("a")).toHaveClass("ui-topbar-item");
  });

  it("sizes the slot's glyph from the bar's own token, not a literal", () => {
    expect(shell).toMatch(
      /\.ui-topbar-item-icon svg\s*\{\s*inline-size: var\(--topbar-icon-size\);\s*block-size: var\(--topbar-icon-size\);/,
    );
  });

  it("accepts an <Icon> in the slot, which keeps its own declared step", () => {
    const { container } = renderWithUi(
      <TopbarItem icon={<Icon as={Building2} size="lg" label="拠点" />}>東京本社</TopbarItem>,
    );
    expect(slotOf(container)?.querySelector("svg")).toHaveAttribute("data-size", "lg");
  });

  it("leaves a wrapped <Icon> in children sized, which is the responsive route", () => {
    const { container } = renderWithUi(
      <TopbarItem aria-label="拠点を切り替える">
        <Flex hideBelow="sm">
          <Icon as={Building2} size="md" />
        </Flex>
        東京本社
      </TopbarItem>,
    );
    const glyph = container.querySelector('[data-slot="icon"]');
    // Not a direct child of the cell — which is exactly the case `> svg` cannot reach, and which
    // Icon's own (0,3,1) rule does (measured 16px at 1280px, against 24px for a bare glyph there).
    expect(glyph?.parentElement).toHaveClass("ui-flex");
    expect(glyph).toHaveAttribute("data-size", "md");
  });
});

/**
 * The FOUR rules that size a glyph, pinned WITH their combinators (gh#712).
 *
 * The bug was never in any one of them; it was that three of the four are direct-child rules and
 * nothing said so anywhere a reader would look. If one of these is widened, narrowed or renamed,
 * this fails and the new blast radius has to be measured rather than assumed.
 */
describe("the glyph-sizing selectors (rot pin, gh#712)", () => {
  const rules: [string, string, RegExp][] = [
    ["Button", "src/styles/control.css", /(?<![>\w-])\.ui-button svg\s*\{/],
    ["DropdownMenuItem", "src/styles/navigation-layout.css", /\.ui-dropdown-menu-item > svg,/],
    ["TopbarItem", "src/styles/shell-layout.css", /\.ui-topbar-item > svg\s*\{/],
    [
      "ListRow leading",
      "src/styles/data-display-layout.css",
      /\[data-slot="list-row-leading"\] > svg:not\(\[class\*="size-"\]\)\s*\{/,
    ],
    ["Icon", "src/styles/icon-layout.css", /svg\.ui-icon\[data-slot="icon"\]\s*\{/],
  ];

  it.each(rules)("%s keeps its selector and its combinator", (_name, file, pattern) => {
    expect(readFileSync(resolve(process.cwd(), file), "utf8")).toMatch(pattern);
  });
});

import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { MegaMenu } from "../mega-menu";
import type { MegaMenuItemProp } from "../mega-menu";

/**
 * MegaMenu behaviour — WAI-ARIA APG "Disclosure Navigation with Top-Level Links".
 *
 * Asserted through roles, accessible names and real key presses only, never through a class. The
 * first test is the one that matters most: if these triggers ever become `role="menuitem"`, the
 * component has silently turned into the Menubar pattern, which is the classic megamenu a11y
 * defect and the reason this is not built on `DropdownMenu`.
 */

const NAV = "Main";

const ITEMS: MegaMenuItemProp[] = [
  {
    key: "products",
    label: "Products",
    panel: {
      groups: [
        {
          key: "core",
          label: "Core",
          links: [
            { key: "hr", label: "HR", href: "/hr" },
            { key: "payroll", label: "Payroll", href: "/payroll" },
          ],
        },
        {
          key: "addons",
          label: "Add-ons",
          links: [{ key: "analytics", label: "Analytics", href: "/analytics" }],
        },
      ],
    },
  },
  {
    key: "solutions",
    label: "Solutions",
    panel: {
      groups: [
        {
          key: "size",
          label: "By size",
          links: [
            { key: "smb", label: "Small business", href: "/smb" },
            { key: "enterprise", label: "Enterprise", href: "/enterprise" },
          ],
        },
      ],
    },
  },
  { key: "pricing", label: "Pricing", href: "/pricing" },
];

function trigger(name: string) {
  return screen.getByRole("button", { name: new RegExp(name) });
}

function panelOf(name: string) {
  return document.getElementById(trigger(name).getAttribute("aria-controls") ?? "") as HTMLElement;
}

describe("MegaMenu — the pattern it implements", () => {
  it("is a nav landmark of BUTTONS and LINKS, with no menu role anywhere", () => {
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} />);

    const nav = screen.getByRole("navigation", { name: NAV });
    expect(nav).toBeInTheDocument();
    // The defect this guards: a site nav announced as an application menu.
    expect(nav.querySelector('[role="menu"]')).toBeNull();
    expect(nav.querySelector('[role="menuitem"]')).toBeNull();
    expect(nav.querySelector('[role="menubar"]')).toBeNull();
    // An item WITHOUT a panel is a plain link — the "Top-Level Links" half of the pattern.
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
  });

  it("carries aria-expanded and aria-controls on every disclosure trigger", () => {
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} />);

    const products = trigger("Products");
    expect(products).toHaveAttribute("aria-expanded", "false");
    expect(products).toHaveAttribute("aria-controls");
    expect(panelOf("Products")).toBeInTheDocument();
    // Closed means OUT of the accessibility tree, not merely invisible.
    expect(panelOf("Products")).not.toBeVisible();
  });

  it("names each panel column's list by its own heading", () => {
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} defaultOpen="products" />);

    expect(within(panelOf("Products")).getByRole("list", { name: "Core" })).toBeInTheDocument();
    expect(within(panelOf("Products")).getByRole("list", { name: "Add-ons" })).toBeInTheDocument();
  });
});

describe("MegaMenu — opening and closing", () => {
  it("opens on click and closes on a second click", async () => {
    const user = userEvent.setup();
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} />);

    await user.click(trigger("Products"));
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "true");
    expect(panelOf("Products")).toBeVisible();

    await user.click(trigger("Products"));
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "false");
  });

  it("opens only ONE panel: opening the next closes the first", async () => {
    const user = userEvent.setup();
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} />);

    await user.click(trigger("Products"));
    await user.click(trigger("Solutions"));

    expect(trigger("Products")).toHaveAttribute("aria-expanded", "false");
    expect(trigger("Solutions")).toHaveAttribute("aria-expanded", "true");
  });

  it("reports the open key through onOpenChange and honours a controlled `open`", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} open={null} onOpenChange={onOpenChange} />);

    await user.click(trigger("Products"));

    expect(onOpenChange).toHaveBeenCalledWith("products");
    // Controlled and the owner said no: the panel stays shut.
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when the pointer goes down outside the nav", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <div>
        <MegaMenu label={NAV} items={ITEMS} />
        <p data-testid="outside">elsewhere</p>
      </div>,
    );

    await user.click(trigger("Products"));
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByTestId("outside"));
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when the route changes underneath it", async () => {
    const user = userEvent.setup();
    function Host() {
      const [route, setRoute] = React.useState("pricing");
      return (
        <div>
          <MegaMenu label={NAV} items={ITEMS} value={route} />
          <button type="button" onClick={() => setRoute("hr")}>
            navigate
          </button>
        </div>
      );
    }
    renderWithUi(<Host />);

    await user.click(trigger("Products"));
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "navigate" }));
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "false");
  });
});

describe("MegaMenu — keyboard (APG)", () => {
  it("is ONE tab stop: a roving tabindex across the top-level items", async () => {
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} />);

    expect(trigger("Products")).toHaveAttribute("tabindex", "0");
    expect(trigger("Solutions")).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("tabindex", "-1");
  });

  it("moves between top-level items with Arrow, Home and End", async () => {
    const user = userEvent.setup();
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} />);

    await user.tab();
    expect(trigger("Products")).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(trigger("Solutions")).toHaveFocus();

    await user.keyboard("{End}");
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveFocus();

    await user.keyboard("{Home}");
    expect(trigger("Products")).toHaveFocus();

    // Wraps, as a roving strip must.
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveFocus();
  });

  it("opens with ArrowDown and puts focus on the FIRST link in the panel", async () => {
    const user = userEvent.setup();
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} />);

    await user.tab();
    await user.keyboard("{ArrowDown}");

    expect(trigger("Products")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "HR" })).toHaveFocus();
  });

  it("opens with ArrowUp on the LAST link — the deepest row is reachable in one key", async () => {
    const user = userEvent.setup();
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} />);

    await user.tab();
    await user.keyboard("{ArrowUp}");

    expect(screen.getByRole("link", { name: "Analytics" })).toHaveFocus();
  });

  it("toggles with Enter and with Space, leaving focus on the button (APG)", async () => {
    const user = userEvent.setup();
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} />);

    await user.tab();
    await user.keyboard("{Enter}");
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "true");
    expect(trigger("Products")).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "false");

    await user.keyboard(" ");
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "true");
    expect(trigger("Products")).toHaveFocus();
  });

  it("walks every link in an open panel with ArrowDown, across group boundaries", async () => {
    const user = userEvent.setup();
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} defaultOpen="products" />);

    screen.getByRole("link", { name: "HR" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("link", { name: "Payroll" })).toHaveFocus();
    // The next row lives in a DIFFERENT group column; the walk must not stop at the boundary.
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("link", { name: "Analytics" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("link", { name: "HR" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("link", { name: "Analytics" })).toHaveFocus();
  });

  it("closes on Escape from inside the panel and RETURNS focus to the trigger", async () => {
    const user = userEvent.setup();
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} defaultOpen="products" />);

    screen.getByRole("link", { name: "Payroll" }).focus();
    await user.keyboard("{Escape}");

    expect(trigger("Products")).toHaveAttribute("aria-expanded", "false");
    expect(trigger("Products")).toHaveFocus();
  });

  it("closes when focus leaves the nav entirely (Tab out)", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <div>
        <MegaMenu label={NAV} items={ITEMS} defaultOpen="solutions" />
        <button type="button">after</button>
      </div>,
    );

    screen.getByRole("link", { name: "Enterprise" }).focus();
    await user.tab();

    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
    expect(trigger("Solutions")).toHaveAttribute("aria-expanded", "false");
  });

  it("carries the open panel along when Arrow moves to another trigger", async () => {
    const user = userEvent.setup();
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} />);

    await user.tab();
    // Nothing open: Arrow moves focus and opens nothing.
    await user.keyboard("{ArrowRight}");
    expect(trigger("Solutions")).toHaveFocus();
    expect(trigger("Solutions")).toHaveAttribute("aria-expanded", "false");

    // Something open: the panel follows focus, so a panel never belongs to an item the user has
    // already walked away from.
    await user.keyboard("{Enter}{ArrowLeft}");
    expect(trigger("Products")).toHaveFocus();
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "true");
    expect(trigger("Solutions")).toHaveAttribute("aria-expanded", "false");

    // And onto an item with NO panel, everything closes rather than leaving a stray one open.
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveFocus();
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "false");
  });
});

describe("MegaMenu — hover intent", () => {
  it("does NOT close when the pointer leaves the trigger toward the panel", async () => {
    const user = userEvent.setup();
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} triggerAction="hover" />);

    await user.hover(trigger("Products"));
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "true");

    // The diagonal: off the trigger, onto a link deep inside the panel. Nothing may close on the
    // trigger's own pointerleave — that is the documented Cascader defect (interaction-feel §4).
    await user.hover(screen.getByRole("link", { name: "Analytics" }));
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Analytics" })).toBeVisible();
  });

  it("hands off to the next panel instantly when the pointer crosses the bar", async () => {
    const user = userEvent.setup();
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} triggerAction="hover" />);

    await user.hover(trigger("Products"));
    await user.hover(trigger("Solutions"));

    expect(trigger("Products")).toHaveAttribute("aria-expanded", "false");
    expect(trigger("Solutions")).toHaveAttribute("aria-expanded", "true");
  });

  it("does not open on hover under the default click action", async () => {
    const user = userEvent.setup();
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} />);

    await user.hover(trigger("Products"));
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "false");
  });
});

describe("MegaMenu — selection, disabled and i18n", () => {
  it("marks the current route with aria-current on the bar and in the panel", () => {
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} defaultOpen="products" value="payroll" />);

    expect(screen.getByRole("link", { name: "Payroll" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "HR" })).not.toHaveAttribute("aria-current");
  });

  it("reports an activated panel link through onValueChange and closes the panel", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <MegaMenu label={NAV} items={ITEMS} defaultOpen="products" onValueChange={onValueChange} />,
    );

    await user.click(screen.getByRole("link", { name: "Payroll" }));

    expect(onValueChange).toHaveBeenCalledWith("payroll");
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps a disabled row out of the tab order while it still announces its name", () => {
    const items: MegaMenuItemProp[] = [
      {
        key: "products",
        label: "Products",
        panel: {
          groups: [
            {
              key: "core",
              label: "Core",
              links: [{ key: "soon", label: "Coming soon", href: "/soon", disabled: true }],
            },
          ],
        },
      },
    ];
    renderWithUi(<MegaMenu label={NAV} items={items} defaultOpen="products" />);

    const row = screen.getByText("Coming soon").closest("a") as HTMLAnchorElement;
    expect(row).not.toHaveAttribute("href");
    expect(row).toHaveAttribute("aria-disabled", "true");
  });

  it("skips a disabled top-level item in the arrow walk", async () => {
    const user = userEvent.setup();
    const items: MegaMenuItemProp[] = [
      { key: "a", label: "Alpha", href: "/a" },
      { key: "b", label: "Beta", href: "/b", disabled: true },
      { key: "c", label: "Gamma", href: "/c" },
    ];
    renderWithUi(<MegaMenu label={NAV} items={items} />);

    screen.getByText("Alpha").closest("a")?.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Gamma").closest("a")).toHaveFocus();
  });

  it("falls back to a localized landmark name when `label` is omitted", () => {
    renderWithUi(<MegaMenu items={ITEMS} />);
    // The harness renders under `vi`; the key is navigation.megaMenu.label. Asserting the
    // Vietnamese string is the point — an English default here would mean the fallback name
    // never went through `t()` at all.
    expect(screen.getByRole("navigation", { name: "Điều hướng chính" })).toBeInTheDocument();
  });

  it("forwards ref, className, id and arbitrary props to the nav element", () => {
    const ref = React.createRef<HTMLElement>();
    renderWithUi(
      <MegaMenu
        ref={ref}
        id="site-nav"
        className="custom"
        data-testid="mm"
        label={NAV}
        items={ITEMS}
        size="sm"
      />,
    );

    expect(ref.current).toBe(screen.getByTestId("mm"));
    expect(ref.current).toHaveAttribute("id", "site-nav");
    expect(ref.current).toHaveClass("custom");
    expect(ref.current).toHaveAttribute("data-size", "sm");
  });

  it("renders every panel link through a router linkComponent when one is given", () => {
    const Link = ({ href, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a data-router="true" href={href} {...rest} />
    );
    renderWithUi(
      <MegaMenu label={NAV} items={ITEMS} defaultOpen="products" linkComponent={Link} />,
    );

    expect(screen.getByRole("link", { name: "HR" })).toHaveAttribute("data-router", "true");
  });
});

/**
 * The panel is `position: fixed` with MEASURED geometry, and these two tests are the regression
 * guard for the defect that forced it.
 *
 * Measured in Chrome before the fix, panel open, one viewport: inside `Topbar` the nearest clipping
 * ancestor is `.ui-topbar-center` (`overflow: clip`) and the panel became a 32px strip; inside
 * `Card` it is `.group/card` (`overflow: hidden`) and 331px of a 348px panel was clipped away — not
 * painted and not hit-testable, so `elementFromPoint` inside the panel's own rect returned the card
 * behind it and the hover diagonal died on its first step.
 *
 * jsdom cannot measure a clip, so these assert the OBSERVABLE half: the component publishes the
 * measured geometry while open and takes it back when closed. Anyone who "simplifies" this back to
 * `position: absolute` deletes these properties and fails here.
 */
describe("MegaMenu — the panel escapes a clipping ancestor", () => {
  it("publishes measured geometry on the nav while a panel is open", async () => {
    const user = userEvent.setup();
    renderWithUi(<MegaMenu label={NAV} items={ITEMS} data-testid="mm" />);
    const nav = screen.getByTestId("mm");

    expect(nav.style.getPropertyValue("--mega-menu-panel-translate-x")).toBe("");

    await user.click(trigger("Products"));

    // jsdom reports every rect as 0, so the VALUES are not the assertion — the presence is.
    expect(nav.style.getPropertyValue("--mega-menu-panel-translate-x")).toMatch(/px$/);
    expect(nav.style.getPropertyValue("--mega-menu-panel-translate-y")).toMatch(/px$/);
    expect(nav.style.getPropertyValue("--mega-menu-panel-measured-width")).toMatch(/px$/);
    expect(nav).toHaveAttribute("data-open", "true");
  });

  it("takes the geometry back on close, and never eats a consumer's own style", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <MegaMenu label={NAV} items={ITEMS} data-testid="mm" style={{ marginBlockStart: "8px" }} />,
    );
    const nav = screen.getByTestId("mm");

    await user.click(trigger("Products"));
    expect(nav.style.getPropertyValue("--mega-menu-panel-translate-x")).toMatch(/px$/);
    expect(nav.style.marginBlockStart).toBe("8px");

    await user.keyboard("{Escape}");
    expect(nav.style.getPropertyValue("--mega-menu-panel-translate-x")).toBe("");
    expect(nav).not.toHaveAttribute("data-open");
    expect(nav.style.marginBlockStart).toBe("8px");
  });
});

import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs } from "../tabs";
import { resolveTabScrollTarget } from "../tabs-scroll";
import { createSidebarLink } from "../../layout/sidebar-link";

/**
 * gh#1364 — a ROUTE tab strip: `TabItemProp.href` turns `Tabs` into a `<nav>` of real links, the
 * current route (`value`) carrying `aria-current="page"`.
 *
 * WHY A NAV AND NOT REACT ARIA LINK TABS: RAC's `Tab href` renders `<a role="tab">` and its
 * `useSelectableItem` installs `onClick = e => { if (!openLink.isOpening) e.preventDefault() }` on
 * every link item (react-aria 3.53.0) — so a real Ctrl/⌘-click is cancelled and replayed
 * synthetically, which is exactly the interception the "middle-click / open in new tab" contract
 * forbids. The modified-click assertions below are that measurement.
 *
 * NOT proved here (jsdom has no layout): that 14 tabs overflow at 390px without page overflow.
 * That is measured in Chromium against `/isolate/navigation-tabs-route-links`.
 */

const ROUTES = [
  { value: "cart-timeout", label: "Cart timeout", href: "/settings/cart-timeout" },
  { value: "customer", label: "Customer", href: "/settings/customer" },
  { value: "line", label: "LINE", href: "/settings/line" },
  { value: "billing", label: "Billing", href: "/settings/billing", disabled: true },
];

function strip(props: Partial<React.ComponentProps<typeof Tabs>> = {}) {
  return render(<Tabs aria-label="Store settings" items={ROUTES} value="customer" {...props} />);
}

describe("Tabs route links (gh#1364)", () => {
  it("renders every enabled tab as an <a href> inside a named <nav>, and no tablist/panels", () => {
    strip();
    const nav = screen.getByRole("navigation", { name: "Store settings" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/settings/cart-timeout",
      "/settings/customer",
      "/settings/line",
      null, // the disabled route: an inert link, see below
    ]);
    expect(links.every((a) => a.tagName === "A")).toBe(true);
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.queryByRole("tabpanel")).toBeNull();
  });

  it("a disabled route is an inert anchor: no href, aria-disabled", () => {
    const { container } = strip();
    const billing = container.querySelector<HTMLElement>('[data-value="billing"]');
    expect(billing?.tagName).toBe("A");
    expect(billing?.hasAttribute("href")).toBe(false);
    expect(billing?.getAttribute("aria-disabled")).toBe("true");
  });

  it("aria-current=page marks exactly the active route, derived from value", () => {
    const { rerender } = strip();
    const current = () =>
      screen
        .getAllByRole("link")
        .filter((a) => a.getAttribute("aria-current") === "page")
        .map((a) => a.textContent);
    expect(current()).toEqual(["Customer"]);
    expect(screen.getByRole("link", { name: "Customer" }).getAttribute("data-state")).toBe(
      "active",
    );
    rerender(<Tabs aria-label="Store settings" items={ROUTES} value="line" />);
    expect(current()).toEqual(["LINE"]);
  });

  it("does not preventDefault a plain, modified or middle click (the browser owns the link)", async () => {
    const onTabClick = vi.fn();
    strip({ onTabClick });
    const link = screen.getByRole("link", { name: "LINE" });
    // jsdom does not implement navigation; swallow the default AFTER every handler has run so
    // the assertion reads what the component did, not what jsdom would.
    const seen: boolean[] = [];
    const record = (event: Event) => {
      seen.push(event.defaultPrevented);
      event.preventDefault();
    };
    document.addEventListener("click", record);
    document.addEventListener("auxclick", record);
    fireEvent.click(link, { ctrlKey: true });
    fireEvent.click(link, { metaKey: true });
    fireEvent.click(link, { shiftKey: true });
    fireEvent.click(link);
    fireEvent(link, new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 }));
    await userEvent.setup().pointer({ keys: "[MouseMiddle]", target: link });
    document.removeEventListener("click", record);
    document.removeEventListener("auxclick", record);
    expect(seen.length).toBeGreaterThanOrEqual(5);
    expect(seen.every((prevented) => prevented === false)).toBe(true);
    expect(onTabClick).toHaveBeenCalledWith("line", expect.anything());
  });

  it("routes every link through linkComponent (createSidebarLink, unchanged)", () => {
    const calls: Record<string, unknown>[] = [];
    function RouterLink({ to, ...rest }: { to: string } & React.ComponentProps<"a">) {
      calls.push({ to, ...rest });
      return <a href={`#router${to}`} {...rest} />;
    }
    strip({ linkComponent: createSidebarLink(RouterLink, "to") });
    expect(calls.map((c) => c.to)).toEqual(
      expect.arrayContaining(["/settings/cart-timeout", "/settings/customer", "/settings/line"]),
    );
    const active = screen.getByRole("link", { name: "Customer" });
    expect(active.getAttribute("href")).toBe("#router/settings/customer");
    expect(active.getAttribute("aria-current")).toBe("page");
    // The strip's styling hooks survive the adapter.
    expect(active.getAttribute("data-slot")).toBe("tabs-trigger");
    expect(active.getAttribute("data-state")).toBe("active");
  });

  it("keyboard: Tab walks the links in order, Enter activates the focused one", async () => {
    const user = userEvent.setup();
    const clicked = vi.fn((event: React.MouseEvent) => event.preventDefault());
    strip({ onTabClick: (_value, event) => clicked(event as React.MouseEvent) });
    await user.tab();
    expect(document.activeElement?.textContent).toBe("Cart timeout");
    await user.tab();
    expect(document.activeElement?.textContent).toBe("Customer");
    await user.tab();
    expect(document.activeElement?.textContent).toBe("LINE");
    await user.keyboard("{Enter}");
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it("scrolls a partially clipped route fully into view on keyboard focus", async () => {
    const user = userEvent.setup();
    strip();
    const nav = screen.getByRole("navigation");
    const link = screen.getByRole("link", { name: "Cart timeout" });
    vi.spyOn(nav, "getBoundingClientRect").mockReturnValue({
      left: 0,
      right: 200,
      top: 0,
      bottom: 40,
    } as DOMRect);
    vi.spyOn(link, "getBoundingClientRect").mockReturnValue({
      left: 150,
      right: 250,
      top: 0,
      bottom: 40,
    } as DOMRect);
    const scroll = vi.spyOn(link, "scrollIntoView");
    await user.tab();
    expect(link).toHaveFocus();
    expect(scroll).toHaveBeenCalledWith(
      expect.objectContaining({ inline: "nearest", block: "nearest" }),
    );
    vi.restoreAllMocks();
  });

  it("overflow menu keeps hidden destinations as real links", async () => {
    const user = userEvent.setup();
    const { container } = strip({ overflow: "menu" });
    const nav = screen.getByRole("navigation");
    const box = (left: number, right: number) => ({
      left,
      right,
      top: 0,
      bottom: 32,
      width: right - left,
      height: 32,
      x: left,
      y: 0,
      toJSON() {},
    });
    vi.spyOn(nav, "getBoundingClientRect").mockReturnValue(box(0, 200));
    within(nav)
      .getAllByRole("link")
      .forEach((link, i) => {
        vi.spyOn(link, "getBoundingClientRect").mockReturnValue(box(i * 100, (i + 1) * 100));
      });
    fireEvent.scroll(nav);
    await user.click(container.querySelector<HTMLButtonElement>(".ui-tabs-overflow")!);
    const link = screen.getByRole("menuitem", { name: "LINE" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/settings/line");
    expect(screen.getByRole("menuitem", { name: "Billing" }).hasAttribute("href")).toBe(false);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    vi.restoreAllMocks();
  });

  it("the keep-active-visible scroll target resolves to the active link", () => {
    const { container } = strip();
    const list = container.querySelector<HTMLElement>('[data-slot="tabs-list"]');
    expect(list?.tagName).toBe("NAV");
    expect(resolveTabScrollTarget(list!)?.textContent).toBe("Customer");
  });
});

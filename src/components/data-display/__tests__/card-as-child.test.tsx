import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";

import { Button } from "../../general/button";
import { Card, CardContent, CardHeader, CardTitle } from "../card";

/**
 * `Card asChild` (gh#740) — the half of `hoverable`'s own docblock that had no spelling.
 *
 * The flag's prose has always said to pair the hover lift with a real control, "a Link/Button
 * inside, OR THE WHOLE CARD RENDERED AS ONE". A consumer who tried the second reading found every
 * route closed: `Card` had no `asChild`, `<button><Card/></button>` is a `no-raw-button` error,
 * and a bare `onClick` on the div is what the same docblock forbids. These tests pin the route
 * that was missing, and the two things it must not silently change — the card's own DOM contract
 * and the number of tab stops a card is worth.
 *
 * Geometry is NOT asserted here: jsdom performs no layout. The chrome was measured in Chromium on
 * /isolate/data-display-card-index at 1440 and 390 (`div` / `<a>` / `<button>` identical on box,
 * border, radius, fill, padding inset, shadow, cursor and text-align), and the rules that make
 * that true are read out of the stylesheet in
 * `src/styles/__tests__/card-as-child-chrome.test.ts`.
 */
const q = (c: HTMLElement, slot: string) => c.querySelector(`[data-slot="${slot}"]`) as HTMLElement;

describe("Card `asChild` — the child becomes the card box", () => {
  it("renders the child element as the root and puts the card's contract on it", () => {
    const { container } = render(
      <Card asChild hoverable accent="info" density="tight" className="from-card">
        <a href="/orders/1" className="from-child">
          <CardContent>body</CardContent>
        </a>
      </Card>,
    );

    // No div wrapper survives: the anchor IS the card.
    const card = q(container, "card");
    expect(card.tagName).toBe("A");
    expect(card).toBe(container.firstElementChild);
    expect(card).toHaveAttribute("href", "/orders/1");

    // Every data flag the div would have emitted rides along unchanged.
    expect(card).toHaveAttribute("data-hoverable", "");
    expect(card).toHaveAttribute("data-accent", "info");
    expect(card).toHaveAttribute("data-density", "tight");

    // `className` CONCATENATES (Slot's documented merge), so the card's own hook and the
    // consumer's class both survive — neither one silently replaces the other.
    expect(card.className.split(/\s+/)).toEqual(
      expect.arrayContaining(["group/card", "from-card", "from-child"]),
    );

    // The card's children are the child's children, still in their real slots.
    expect(q(container, "card-content")).toHaveTextContent("body");
  });

  it("chains handlers and lets the child's own props win, exactly as every other Slot here", () => {
    const order: string[] = [];
    const { container } = render(
      <Card asChild onClick={() => order.push("card")} id="from-card">
        <button type="button" onClick={() => order.push("child")} id="from-child">
          body
        </button>
      </Card>,
    );

    const card = q(container, "card");
    expect(card.tagName).toBe("BUTTON");
    // A plain prop: the CHILD wins (mergeProps).
    expect(card).toHaveAttribute("id", "from-child");

    card.click();
    // Handlers CHAIN — parent first, then child — rather than one overwriting the other.
    expect(order).toEqual(["card", "child"]);
  });

  it("forwards `ref` to the borrowed element, not to a wrapper", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Card asChild ref={ref}>
        <a href="/x">body</a>
      </Card>,
    );
    expect(ref.current?.tagName).toBe("A");
    expect(ref.current).toHaveAttribute("data-slot", "card");
  });

  it("is inert when off — a plain Card still renders the byte-identical div", () => {
    const { container } = render(<Card>body</Card>);
    const card = q(container, "card");
    expect(card.tagName).toBe("DIV");
    expect(card).not.toHaveAttribute("data-as-child");
  });
});

describe("Card `asChild` — a non-element child fails the way Button's does", () => {
  /** The same text React's `Children.only` throws, for whichever component is asked. */
  const throwsFor = (node: React.ReactNode, render_: (n: React.ReactNode) => void) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    let message = "";
    try {
      render_(node);
    } catch (error) {
      message = (error as Error).message;
    } finally {
      spy.mockRestore();
    }
    return message;
  };

  it("throws `React.Children.only` for a bare string, identically to Button", () => {
    const fromCard = throwsFor("just text", (n) => render(<Card asChild>{n}</Card>));
    const fromButton = throwsFor("just text", (n) => render(<Button asChild>{n}</Button>));

    expect(fromCard).toMatch(/Children\.only/);
    expect(fromCard).toBe(fromButton);
  });

  it("throws for two children too — there is no element to borrow", () => {
    const two = [
      <a href="/a" key="a">
        a
      </a>,
      <a href="/b" key="b">
        b
      </a>,
    ];
    const fromCard = throwsFor(two, (n) => render(<Card asChild>{n}</Card>));
    const fromButton = throwsFor(two, (n) => render(<Button asChild>{n}</Button>));

    expect(fromCard).toMatch(/Children\.only/);
    expect(fromCard).toBe(fromButton);
  });
});

describe("Card `asChild` + `hoverable` — the affordance finally has an owner", () => {
  it("keeps the hover flag on the control itself, so the CSS hook is unchanged", () => {
    const { container } = render(
      <Card asChild hoverable>
        <a href="/orders/1">
          <CardContent>body</CardContent>
        </a>
      </Card>,
    );
    const card = q(container, "card");
    // The one selector `[data-slot="card"][data-hoverable]` keys on, now on an `<a>`: the lift,
    // the pointer cursor and the control are the same element instead of two.
    expect(card.matches('a[data-slot="card"][data-hoverable]')).toBe(true);
  });

  it("makes the whole card ONE tab stop, and the focus lands on the card box", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Button>before</Button>
        <Card asChild hoverable>
          <a href="/orders/1">
            <CardHeader>
              <CardTitle level={2}>Order 1</CardTitle>
            </CardHeader>
            <CardContent>¥1,234,567</CardContent>
          </a>
        </Card>
        <Button>after</Button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "before" })).toHaveFocus();

    // ONE tab reaches the card — not an inner element, and not a stop the user has to pass.
    await user.tab();
    const card = screen.getByRole("link");
    expect(card).toHaveFocus();
    // The focused element IS the card box, which is what `a[data-slot="card"]:focus-visible` in
    // focus-ring.css paints — measured in Chromium as `outline: rgb(122,0,255) solid 1px` on the
    // card's own rect (688×140.09 → ring 690×142.09).
    expect(card).toHaveAttribute("data-slot", "card");
    expect(card).toHaveAccessibleName(/Order 1/);

    // And exactly one: the next Tab leaves the card entirely.
    await user.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });
});

describe("Card `asChild` + `tabList` — the one combination that is refused", () => {
  it("drops the tab strip and says so, because buttons inside a link are invalid HTML", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <Card asChild tabList={[{ key: "a", tab: "A" }]}>
        <a href="/orders/1">
          <CardContent>body</CardContent>
        </a>
      </Card>,
    );

    const card = q(container, "card");
    expect(card.tagName).toBe("A");
    expect(card).not.toHaveAttribute("data-tab-list");
    expect(container.querySelector('[data-slot="tabs-list"]')).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("`tabList` is ignored"));
    warn.mockRestore();
  });

  it("leaves `tabList` alone without `asChild`", () => {
    const { container } = render(
      <Card tabList={[{ key: "a", tab: "A" }]}>
        <CardContent>body</CardContent>
      </Card>,
    );
    expect(q(container, "card")).toHaveAttribute("data-tab-list", "");
    expect(container.querySelector('[data-slot="tabs-list"]')).not.toBeNull();
  });
});

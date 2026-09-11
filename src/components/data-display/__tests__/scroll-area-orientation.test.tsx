import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ScrollArea, ScrollBar } from "../scroll-area";

/**
 * ORIENTATION IS THE WHOLE AXIS CONTRACT since v23.
 *
 * Under Radix the axes were opened by MOUNTING a `<ScrollBar>`: Radix read `scrollbarXEnabled` /
 * `scrollbarYEnabled` from those children and wrote the viewport's `overflowX`/`overflowY` as an
 * INLINE style, which is what the old version of this file asserted. Native scrolling has no such
 * children and no inline style — the axes come from `data-orientation` plus three CSS rules, so
 * what jsdom can honestly prove here is the DOM contract those rules key on.
 *
 * The rules themselves are asserted as CSS text in `src/styles/__tests__/scroll-area-native.test.ts`
 * (jsdom loads no stylesheet, so `getComputedStyle(...).overflowY` here would report `visible` for
 * every orientation and prove nothing), and the resulting behaviour is measured in a real browser.
 */
const viewport = () => document.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;

describe("ScrollArea — orientation", () => {
  it("defaults to vertical", () => {
    render(
      <ScrollArea>
        <div>本文</div>
      </ScrollArea>,
    );
    expect(viewport()).toHaveAttribute("data-orientation", "vertical");
  });

  it.each(["vertical", "horizontal", "both"] as const)(
    "carries orientation=%s onto the scrolling element, which is what the CSS keys on",
    (orientation) => {
      render(
        <ScrollArea orientation={orientation}>
          <div>内容</div>
        </ScrollArea>,
      );
      expect(viewport()).toHaveAttribute("data-orientation", orientation);
    },
  );

  it("keeps the viewport keyboard-reachable on every orientation (WCAG 2.1.1)", () => {
    for (const orientation of ["vertical", "horizontal", "both"] as const) {
      const { unmount } = render(
        <ScrollArea orientation={orientation}>
          <div>内容</div>
        </ScrollArea>,
      );
      expect(viewport()).toHaveAttribute("tabindex", "0");
      unmount();
    }
  });

  it("wraps the children in ONE content element — the box a ResizeObserver watches grow", () => {
    render(
      <ScrollArea>
        <div>行 1</div>
        <div>行 2</div>
      </ScrollArea>,
    );
    const content = viewport().firstElementChild as HTMLElement;
    expect(content).toHaveAttribute("data-slot", "scroll-area-content");
    expect(content.children).toHaveLength(2);
  });

  it("leaves bottom anchoring reachable on a horizontal strip (the props are orthogonal)", () => {
    render(
      <ScrollArea orientation="horizontal" anchor="bottom">
        <div>ログ</div>
      </ScrollArea>,
    );
    expect(viewport()).toHaveAttribute("data-anchor", "bottom");
    expect(viewport()).toHaveAttribute("data-orientation", "horizontal");
  });

  it("renders the children on a horizontal strip without asking the consumer for overflow classes", () => {
    render(
      <ScrollArea orientation="horizontal">
        <div>カラム</div>
      </ScrollArea>,
    );
    expect(screen.getByText("カラム")).toBeInTheDocument();
  });

  it("still forwards viewportRef, which names the element that scrolls", () => {
    const seen: (HTMLDivElement | null)[] = [];
    render(
      <ScrollArea orientation="horizontal" viewportRef={(node) => {
          seen.push(node);
        }}>
        <div>参照</div>
      </ScrollArea>,
    );
    expect(seen.filter(Boolean)).toHaveLength(1);
    expect(seen.find(Boolean)).toBe(viewport());
  });

  it("renders ScrollBar as nothing at all — the axis it used to open is now `orientation`", () => {
    const { container } = render(
      <ScrollArea orientation="both">
        <div>両方</div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>,
    );
    // No element, no wrapper, no comment node with layout: a deprecated export that renders
    // nothing must not leave a box behind for a flex/grid parent to space around.
    expect(container.querySelectorAll('[class*="scroll-area-bar"]')).toHaveLength(0);
    expect((viewport().firstElementChild as HTMLElement).children).toHaveLength(1);
  });
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ScrollArea } from "../scroll-area";

/**
 * Mounting a ScrollBar is what ENABLES its axis: Radix reads `scrollbarXEnabled`/`scrollbarYEnabled`
 * from these children and writes the viewport's inline `overflowX`/`overflowY` from them. So an axis
 * with no scrollbar is `overflow: hidden` — its content is CLIPPED, not merely un-barred — and the
 * inline style means no stylesheet can put it back. These tests therefore assert the rendered
 * scrollbars AND the resulting inline overflow, which is the property a consumer actually depends on.
 */
const viewport = () => document.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
/**
 * Rendered bar ELEMENTS. Only meaningful under `type="always"`: at the default `type="hover"` Radix
 * mounts `ScrollAreaScrollbar` (which is what enables the axis, in an effect) but paints nothing
 * until the pointer arrives — so an empty list here says nothing about whether the axis scrolls.
 * The inline overflow below is the contract that holds at every `type`.
 */
const bars = () =>
  Array.from(document.querySelectorAll(".ui-scroll-area-bar"))
    .map((node) => node.getAttribute("data-orientation"))
    .sort();

describe("ScrollArea — orientation", () => {
  it("defaults to vertical: one vertical bar, and the horizontal axis stays hidden", () => {
    render(
      <ScrollArea>
        <div>本文</div>
      </ScrollArea>,
    );
    expect(viewport().style.overflowY).toBe("scroll");
    expect(viewport().style.overflowX).toBe("hidden");
    expect(viewport()).toHaveAttribute("data-orientation", "vertical");
  });

  it('orientation="horizontal" scrolls across and does NOT leave the vertical axis scrolling', () => {
    render(
      <ScrollArea orientation="horizontal">
        <div>列</div>
      </ScrollArea>,
    );
    expect(viewport().style.overflowX).toBe("scroll");
    expect(viewport().style.overflowY).toBe("hidden");
    expect(viewport()).toHaveAttribute("data-orientation", "horizontal");
  });

  it('orientation="both" renders both bars and opens both axes', () => {
    render(
      <ScrollArea orientation="both">
        <div>両方</div>
      </ScrollArea>,
    );
    expect(viewport().style.overflowX).toBe("scroll");
    expect(viewport().style.overflowY).toBe("scroll");
  });

  it('paints the bars each orientation asks for (type="always", where they are in the DOM)', () => {
    const { unmount } = render(
      <ScrollArea type="always">
        <div>縦</div>
      </ScrollArea>,
    );
    expect(bars()).toEqual(["vertical"]);
    unmount();

    const horizontal = render(
      <ScrollArea type="always" orientation="horizontal">
        <div>横</div>
      </ScrollArea>,
    );
    expect(bars()).toEqual(["horizontal"]);
    horizontal.unmount();

    render(
      <ScrollArea type="always" orientation="both">
        <div>両方</div>
      </ScrollArea>,
    );
    expect(bars()).toEqual(["horizontal", "vertical"]);
  });

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

  it("leaves bottom anchoring reachable on a horizontal strip (the props are orthogonal)", () => {
    render(
      <ScrollArea orientation="horizontal" anchor="bottom">
        <div>ログ</div>
      </ScrollArea>,
    );
    expect(viewport()).toHaveAttribute("data-anchor", "bottom");
    expect(viewport()).toHaveAttribute("data-orientation", "horizontal");
  });

  it("still forwards viewportRef, which is the only handle on the scrolling element", () => {
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

  it("renders the children on a horizontal strip without asking the consumer for overflow classes", () => {
    render(
      <ScrollArea orientation="horizontal">
        <div>カラム</div>
      </ScrollArea>,
    );
    expect(screen.getByText("カラム")).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";

import { renderWithUi } from "@/test/render";
import { ScrollArea } from "../scroll-area";

/**
 * A scroll area must not decide the reading direction for the content it merely scrolls.
 *
 * Radix's `ScrollArea.Root` called `useDirection(dir)`, which falls back to the literal `"ltr"` when
 * there is neither a `dir` prop nor a `DirectionProvider`, and then STAMPED that on the root. A
 * `dir` attribute is not advisory — it resets the inline axis for the whole subtree, so every
 * `margin-inline-*`, `inset-inline-*`, `text-align: start` and `align-items: flex-end` inside the
 * viewport resolved left-to-right regardless of the page around it.
 *
 * Found in a real browser: a `ChatBubbleList` inside `<div dir="rtl">` computed `direction: rtl` on
 * the list and `ltr` on the Radix root under it, and the "my message" bubble stayed on the right
 * instead of flipping. Nothing in the stylesheet was physical; the axis had been reset one element
 * up.
 *
 * Native scrolling fixes this by having nothing to fix: a plain element inherits the page's
 * direction. So the assertion that matters now is the ABSENCE of a stamp — a component that starts
 * writing `dir` again would reintroduce exactly that bug.
 */
describe("ScrollArea direction", () => {
  it("stamps no direction of its own", () => {
    const { container } = renderWithUi(
      <div dir="rtl">
        <ScrollArea>
          <div data-testid="row">مرحبا</div>
        </ScrollArea>
      </div>,
    );

    const scroller = container.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    expect(scroller).not.toBeNull();
    expect(scroller!.hasAttribute("dir")).toBe(false);
  });

  it("inherits an RTL page instead of forcing its content back to LTR", () => {
    const { container } = renderWithUi(
      <div dir="rtl">
        <ScrollArea>
          <div data-testid="row">مرحبا</div>
        </ScrollArea>
      </div>,
    );

    const row = container.querySelector<HTMLElement>('[data-testid="row"]');
    expect(window.getComputedStyle(row!).direction).toBe("rtl");
  });

  it("stays LTR on an LTR page", () => {
    const { container } = renderWithUi(
      <div dir="ltr">
        <ScrollArea>
          <div data-testid="row">hello</div>
        </ScrollArea>
      </div>,
    );

    const row = container.querySelector<HTMLElement>('[data-testid="row"]');
    expect(window.getComputedStyle(row!).direction).toBe("ltr");
  });

  it("lets an explicit `dir` prop ride through to the scrolling element", () => {
    const { container } = renderWithUi(
      <div dir="ltr">
        <ScrollArea dir="rtl">
          <div data-testid="row">مرحبا</div>
        </ScrollArea>
      </div>,
    );

    const row = container.querySelector<HTMLElement>('[data-testid="row"]');
    expect(window.getComputedStyle(row!).direction).toBe("rtl");
  });
});

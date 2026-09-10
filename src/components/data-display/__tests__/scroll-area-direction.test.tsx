import { describe, expect, it } from "vitest";

import { renderWithUi } from "@/test/render";
import { ScrollArea } from "../scroll-area";

/**
 * A scroll area must not decide the reading direction for the content it merely scrolls.
 *
 * Radix's `ScrollArea.Root` calls `useDirection(dir)`, which falls back to the literal `"ltr"` when
 * there is neither a `dir` prop nor a `DirectionProvider`, and then STAMPS that on the root. A
 * `dir` attribute is not advisory — it resets the inline axis for the whole subtree, so every
 * `margin-inline-*`, `inset-inline-*`, `text-align: start` and `align-items: flex-end` inside the
 * viewport resolves left-to-right regardless of the page around it.
 *
 * Found in a real browser: a `ChatBubbleList` inside `<div dir="rtl">` computed `direction: rtl` on
 * the list and `ltr` on the Radix root under it, and the "my message" bubble stayed on the right
 * instead of flipping. Nothing in the stylesheet was physical; the axis had been reset one element
 * up. These tests fail against a ScrollArea that hands Radix no direction.
 */
describe("ScrollArea direction", () => {
  it("inherits an RTL page instead of forcing its content back to LTR", () => {
    const { container } = renderWithUi(
      <div dir="rtl">
        <ScrollArea>
          <div data-testid="row">مرحبا</div>
        </ScrollArea>
      </div>,
    );

    const root = container.querySelector<HTMLElement>('[dir="rtl"] > div');
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("dir", "rtl");
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

  it("lets an explicit `dir` prop win over the ambient direction", () => {
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

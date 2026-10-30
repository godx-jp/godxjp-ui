import { createRef } from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Flex } from "../flex";

describe("Flex bounded workspace", () => {
  it("measures actual top and updates after viewport resize without guessed chrome", () => {
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ top: 140 } as DOMRect);
    Object.defineProperty(window, "innerHeight", { value: 768, configurable: true });
    const { unmount } = render(
      <Flex viewport data-testid="stage">
        <Flex basis="equal" overflow="scroll-x">
          Cards
        </Flex>
      </Flex>,
    );
    expect(screen.getByTestId("stage").style.getPropertyValue("--flex-viewport-available")).toBe(
      "628px",
    );
    Object.defineProperty(window, "innerHeight", { value: 600, configurable: true });
    act(() => window.dispatchEvent(new Event("resize")));
    expect(screen.getByTestId("stage").style.getPropertyValue("--flex-viewport-available")).toBe(
      "460px",
    );
    unmount();
    rect.mockRestore();
  });
  it("keeps omitted axes inert and orientation entirely declarative", () => {
    const { rerender } = render(<Flex data-testid="piece">Art</Flex>);
    expect(screen.getByTestId("piece")).not.toHaveAttribute("data-viewport");
    expect(screen.getByTestId("piece")).not.toHaveAttribute("data-rotate");
    rerender(
      <Flex data-testid="piece" rotate={90} animated measure="card-compact" overflow="hidden">
        Art
      </Flex>,
    );
    expect(screen.getByTestId("piece")).toHaveAttribute("data-rotate", "90");
    expect(screen.getByTestId("piece")).toHaveAttribute("data-animated");
    rerender(
      <Flex data-testid="piece" rotate={0}>
        Art
      </Flex>,
    );
    expect(screen.getByTestId("piece")).not.toHaveAttribute("data-animated");
  });
  it("uses visual viewport coordinates and forwards the rendered element ref", () => {
    const original = window.visualViewport;
    const visual = Object.assign(new EventTarget(), { height: 500, offsetTop: 40 });
    Object.defineProperty(window, "visualViewport", { value: visual, configurable: true });
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ top: 120 } as DOMRect);
    const ref = createRef<HTMLElement>();
    const { unmount } = render(<Flex ref={ref} viewport data-testid="visual-stage" />);
    expect(ref.current).toBe(screen.getByTestId("visual-stage"));
    expect(ref.current?.style.getPropertyValue("--flex-viewport-available")).toBe("420px");
    visual.height = 400;
    act(() => visual.dispatchEvent(new Event("resize")));
    expect(ref.current?.style.getPropertyValue("--flex-viewport-available")).toBe("320px");
    visual.offsetTop = 70;
    act(() => visual.dispatchEvent(new Event("scroll")));
    expect(ref.current?.style.getPropertyValue("--flex-viewport-available")).toBe("350px");
    unmount();
    expect(ref.current).toBe(null);
    rect.mockRestore();
    Object.defineProperty(window, "visualViewport", { value: original, configurable: true });
  });
});

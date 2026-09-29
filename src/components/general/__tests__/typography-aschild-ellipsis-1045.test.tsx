import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";

import { Text } from "../typography";

/**
 * gh#1045 comment (1): `Text asChild` + `ellipsis` handed the CHILD ELEMENT to the block renderer as
 * its text, so `<Text asChild link ellipsis><a/></Text>` rendered `<a><a>…</a></a>`, and the asChild
 * branch never attached the measuring ref, so `onEllipsis` / the tooltip never learned it clipped.
 */
const resizeCallbacks: (() => void)[] = [];

beforeEach(() => {
  resizeCallbacks.length = 0;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resizeCallbacks.push(callback);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Text asChild + ellipsis (gh#1045)", () => {
  it("renders ONE element — the child — holding the child's own text", () => {
    const { container } = render(
      <Text asChild link ellipsis={{ tooltip: true }}>
        <a href="#case">第3四半期 結合テスト</a>
      </Text>,
    );
    expect(container.querySelectorAll("a a")).toHaveLength(0);
    const anchors = container.querySelectorAll("a");
    expect(anchors).toHaveLength(1);
    expect(anchors[0]).toHaveAttribute("href", "#case");
    expect(anchors[0]).toHaveAttribute("data-slot", "text");
    expect(anchors[0]).toHaveAttribute("data-truncate", "");
    expect(anchors[0]).toHaveTextContent("第3四半期 結合テスト");
  });

  it("measures the child, so onEllipsis fires when it clips", () => {
    const onEllipsis = vi.fn();
    const { container } = render(
      <Text asChild ellipsis={{ onEllipsis }}>
        <a href="#case">第3四半期 結合テスト</a>
      </Text>,
    );
    const anchor = container.querySelector("a")!;
    Object.defineProperty(anchor, "scrollWidth", { value: 320, configurable: true });
    Object.defineProperty(anchor, "clientWidth", { value: 120, configurable: true });
    act(() => {
      for (const fire of resizeCallbacks) fire();
    });
    expect(onEllipsis).toHaveBeenCalledWith(true);
  });
});

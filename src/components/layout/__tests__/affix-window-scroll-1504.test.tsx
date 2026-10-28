import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Affix } from "../affix";

// Browser reproduction: a viewport TOC starts at top 96, then reaches -765 after the
// document moves its contain:paint ancestor. Stub layout only; exercise real Affix effects.
let observer: IntersectionObserverCallback;
let top: number;
let frames: Map<number, FrameRequestCallback>;
let paint: HTMLDivElement;
const viewport = () => window;

beforeEach(() => {
  top = -300;
  frames = new Map();
  let nextFrame = 1;
  class MockIO {
    constructor(callback: IntersectionObserverCallback) {
      observer = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", MockIO);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    const id = nextFrame++;
    frames.set(id, callback);
    return id;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    frames.delete(id);
  });
  const computed = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    (element) =>
      new Proxy(computed(element), {
        get(style, key) {
          const value = Reflect.get(style, key, style);
          return ["filter", "backdropFilter", "transform", "perspective", "contain"].includes(
            String(key),
          )
            ? value || "none"
            : value;
        },
      }),
  );
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    const y = this === paint ? top : 96;
    const height = this === paint ? 4000 : 200;
    return {
      x: 0,
      y,
      left: 0,
      top: y,
      right: 280,
      bottom: y + height,
      width: 280,
      height,
      toJSON() {},
    } as DOMRect;
  });
  paint = document.createElement("div");
  paint.style.contain = "paint";
  Object.defineProperties(paint, {
    scrollHeight: { value: 4000 },
    clientHeight: { value: 4000 },
    scrollTop: { value: 0 },
  });
  document.body.append(paint);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

function pin() {
  act(() =>
    observer(
      [{ isIntersecting: false, intersectionRatio: 0 } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ),
  );
}
function flushFrame() {
  const callbacks = [...frames.values()];
  frames.clear();
  act(() => callbacks.forEach((callback) => callback(0)));
}

describe("Affix viewport compensation while its containing block moves (gh#1504)", () => {
  it.each(["top", "bottom"] as const)(
    "keeps its %s viewport pin after window scroll, coalescing resize and scroll",
    (edge) => {
      const { container, unmount } = render(
        <Affix
          target={viewport}
          {...(edge === "top" ? { offsetBlockStart: 96 } : { offsetBlockEnd: 0 })}
        >
          <span>TOC</span>
        </Affix>,
        { container: paint },
      );
      pin();
      const root = container.querySelector<HTMLElement>('[data-slot="affix"]')!;
      const position = () => {
        const inset = Number.parseFloat(root.style.getPropertyValue("--affix-target-inset") || "0");
        return edge === "top" ? top + 96 + inset : top + 4000 - inset;
      };
      const expected = edge === "top" ? 96 : window.innerHeight;
      expect(position()).toBe(expected);
      top = -1161;
      act(() => {
        window.dispatchEvent(new Event("scroll"));
        window.dispatchEvent(new Event("scroll"));
        window.dispatchEvent(new Event("resize"));
      });
      expect(frames.size).toBe(1);
      flushFrame();
      expect(position()).toBe(expected);
      act(() => window.dispatchEvent(new Event("scroll")));
      const pending = [...frames.keys()][0]!;
      unmount();
      expect(window.cancelAnimationFrame).toHaveBeenCalledWith(pending);
      expect(frames.size).toBe(0);
    },
  );
});

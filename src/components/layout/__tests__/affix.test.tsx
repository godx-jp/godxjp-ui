import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Affix } from "../affix";

/**
 * The pin is an `IntersectionObserver` crossing, so the observer IS the unit under test — a real
 * one needs a layout engine jsdom does not have. This fake is the page-container test's, kept to
 * one shape and given the two things these assertions need on top: the `root`/`rootMargin` the
 * component asked for, and the ability to drive several observers at once.
 */
type Observed = {
  callback: IntersectionObserverCallback;
  elements: Element[];
  options: IntersectionObserverInit | undefined;
  disconnected: boolean;
};

let observers: Observed[] = [];

function flip(intersecting: boolean, index = 0) {
  const observer = observers[index];
  act(() => {
    observer.callback(
      [
        // `intersectionRatio` is not optional here, and a fake that omits it is the fake that is
        // wrong: `useInView` compares the RATIO against its clamped threshold rather than trusting
        // `isIntersecting`, which flips at the first pixel and is only the right answer at
        // `amount: "some"`. A real observer always sends both.
        {
          isIntersecting: intersecting,
          intersectionRatio: intersecting ? 1 : 0,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );
  });
}

/** The measured box. jsdom reports 0 for every rect, so the component would measure nothing. */
function stubRects(inline: number, block: number) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    const isContent = this.dataset.slot === "affix-content";
    return {
      width: inline,
      height: isContent ? block : 0,
      top: 0,
      bottom: isContent ? block : 0,
      left: 0,
      right: inline,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;
  });
}

beforeEach(() => {
  observers = [];
  class MockIO {
    root: Element | Document | null;
    rootMargin: string;
    thresholds: readonly number[] = [];
    #entry: Observed;
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.root = (options?.root as Element | null) ?? null;
      this.rootMargin = options?.rootMargin ?? "";
      this.#entry = { callback, elements: [], options, disconnected: false };
      observers.push(this.#entry);
    }
    observe(element: Element) {
      this.#entry.elements.push(element);
    }
    unobserve() {}
    disconnect() {
      this.#entry.disconnected = true;
    }
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", MockIO as unknown as typeof IntersectionObserver);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const root = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="affix"]')!;
const sentinel = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="affix-sentinel"]')!;
const content = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="affix-content"]')!;
const placeholder = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="affix-placeholder"]');

describe("Affix — the pin, and what it reports", () => {
  it("renders IN FLOW at rest: no placeholder, no `data-affixed`", () => {
    const { container } = render(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    expect(root(container)).not.toHaveAttribute("data-affixed");
    expect(content(container)).not.toHaveAttribute("data-affixed");
    expect(placeholder(container)).toBeNull();
  });

  it("observes the SENTINEL, not the box — the leading edge is what crosses the line", () => {
    const { container } = render(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    expect(observers[0].elements).toEqual([sentinel(container)]);
  });

  it("pins when the sentinel stops intersecting, and releases when it comes back", () => {
    const { container } = render(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    flip(false);
    expect(root(container)).toHaveAttribute("data-affixed", "");
    expect(content(container)).toHaveAttribute("data-affixed", "");
    flip(true);
    expect(root(container)).not.toHaveAttribute("data-affixed");
  });

  it("the sentinel is hidden from assistive technology and carries the pinning edge", () => {
    const { container } = render(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    expect(sentinel(container)).toHaveAttribute("aria-hidden", "true");
    expect(sentinel(container)).toHaveAttribute("data-edge", "block-start");
  });
});

describe("Affix — the placeholder is what stops the page jumping", () => {
  it("holds the MEASURED block size of the content, and only while pinned", () => {
    stubRects(400, 64);
    const { container } = render(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    expect(placeholder(container)).toBeNull();

    flip(false);
    const held = placeholder(container);
    expect(held).not.toBeNull();
    // The exact height the content occupied in flow — so the block size the page loses and the
    // block size it gets back are the same number.
    expect(held!.style.blockSize).toBe("64px");
    expect(held).toHaveAttribute("aria-hidden", "true");

    flip(true);
    expect(placeholder(container)).toBeNull();
  });

  it("re-publishes the measured INLINE size, because a fixed box has no containing block left", () => {
    stubRects(400, 64);
    const { container } = render(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    flip(false);
    expect(root(container).style.getPropertyValue("--affix-content-inline-size")).toBe("400px");
  });
});

describe("Affix — `onChange` fires on the TRANSITION and only on it", () => {
  it("does not fire on mount", () => {
    const onChange = vi.fn();
    render(
      <Affix onChange={onChange}>
        <p>bar</p>
      </Affix>,
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("fires once per flip, with the new state", () => {
    const onChange = vi.fn();
    render(
      <Affix onChange={onChange}>
        <p>bar</p>
      </Affix>,
    );
    flip(false);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(true);
    flip(true);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("does NOT fire when an observer callback repeats the state it is already in", () => {
    const onChange = vi.fn();
    render(
      <Affix onChange={onChange}>
        <p>bar</p>
      </Affix>,
    );
    flip(false);
    flip(false);
    flip(false);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe("Affix — the offset is CSS, written once, read by both the line and the paint", () => {
  it("writes no custom property at all when the offset is left to the token", () => {
    const { container } = render(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    expect(root(container).style.getPropertyValue("--affix-inset-block-start")).toBe("");
  });

  it("`offsetBlockStart` overrides the token per instance", () => {
    const { container } = render(
      <Affix offsetBlockStart={64}>
        <p>bar</p>
      </Affix>,
    );
    expect(root(container).style.getPropertyValue("--affix-inset-block-start")).toBe("64px");
  });

  it("`offsetBlockEnd` alone selects block-END pinning — antd's `internalOffsetTop` rule", () => {
    const { container } = render(
      <Affix offsetBlockEnd={0}>
        <p>bar</p>
      </Affix>,
    );
    expect(sentinel(container)).toHaveAttribute("data-edge", "block-end");
    expect(content(container)).toHaveAttribute("data-edge", "block-end");
  });

  it("block-start still wins when BOTH offsets are given, as in Ant Design", () => {
    const { container } = render(
      <Affix offsetBlockStart={8} offsetBlockEnd={8}>
        <p>bar</p>
      </Affix>,
    );
    expect(sentinel(container)).toHaveAttribute("data-edge", "block-start");
    expect(root(container).style.getPropertyValue("--affix-inset-block-end")).toBe("8px");
  });

  it("grows the clipping box past the line instead of shrinking it — one constant, both modes", () => {
    render(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    expect(observers[0].options?.rootMargin).toBe("0px 0px 1000000px 0px");

    render(
      <Affix offsetBlockEnd={0}>
        <p>bar</p>
      </Affix>,
    );
    expect(observers[1].options?.rootMargin).toBe("1000000px 0px 0px 0px");
  });
});

describe("Affix — antd's physical spellings fail loudly", () => {
  it("`offsetTop` warns in development and is ignored", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      // @ts-expect-error — `offsetTop` is typed `never` on purpose: antd's spelling is a compile
      // error here that names `offsetBlockStart`.
      <Affix offsetTop={64}>
        <p>bar</p>
      </Affix>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("offsetBlockStart"));
    expect(root(container).style.getPropertyValue("--affix-inset-block-start")).toBe("");
  });

  it("`offsetBottom` warns in development and is ignored", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      // @ts-expect-error — see `offsetTop`.
      <Affix offsetBottom={64}>
        <p>bar</p>
      </Affix>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("offsetBlockEnd"));
  });
});

describe("Affix — the scroll box", () => {
  it("observes against the document viewport by default (`root: null`)", () => {
    render(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    expect(observers[0].options?.root ?? null).toBeNull();
  });

  it("observes against the element `target` returns, which is resolved after mount", () => {
    const box = document.createElement("div");
    document.body.append(box);
    render(
      <Affix target={() => box}>
        <p>bar</p>
      </Affix>,
    );
    // The first observer used the viewport (no element yet); the re-run re-observes against it.
    expect(observers.at(-1)?.options?.root).toBe(box);
    box.remove();
  });

  it("`target={() => window}` is the viewport, not an element", () => {
    render(
      <Affix target={() => window}>
        <p>bar</p>
      </Affix>,
    );
    expect(observers.at(-1)?.options?.root ?? null).toBeNull();
  });
});

describe("Affix — WCAG 2.4.11, the bar must not hide what the browser scrolls to", () => {
  it("sets `scroll-padding-block-start` on the scroll box while pinned, and restores it after", () => {
    stubRects(400, 64);
    document.documentElement.style.scrollPaddingBlockStart = "12px";
    const { container } = render(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    flip(false);
    expect(content(container)).toHaveAttribute("data-affixed", "");
    expect(document.documentElement.style.scrollPaddingBlockStart).toBe("64px");

    flip(true);
    // Restored, not cleared: an app that set its own scroll padding gets it back.
    expect(document.documentElement.style.scrollPaddingBlockStart).toBe("12px");
    document.documentElement.style.scrollPaddingBlockStart = "";
  });

  it("does not touch scroll padding when pinned to the block-END edge", () => {
    stubRects(400, 64);
    render(
      <Affix offsetBlockEnd={0}>
        <p>bar</p>
      </Affix>,
    );
    flip(false);
    expect(document.documentElement.style.scrollPaddingBlockStart).toBe("");
  });
});

describe("Affix — SSR / jsdom without an IntersectionObserver", () => {
  it("renders in flow rather than crashing or pinning on a measurement it never took", () => {
    vi.unstubAllGlobals();
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = render(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    expect(root(container)).not.toHaveAttribute("data-affixed");
    expect(placeholder(container)).toBeNull();
  });
});

import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Anchor } from "../../navigation/anchor";
import { Affix } from "../affix";

/**
 * AFFIX INSIDE AN INNER SCROLLER (gh#984).
 *
 * Measured in Chromium on `/frame/navigation-anchor`, card 4 (an Anchor with the default `affix`),
 * whose page scrolls an element rather than the window — as `PageContainer fill` and MasterDetail's
 * master do in an app:
 *
 *   before  load: affixed=true  root w0   content w0   top 16  (its column sat at 1680, viewport 800)
 *   after   load: affixed=false root w122 content w122 top 1680
 *           scrolled to it: affixed=true, pinned at the scroller's edge + 16, still 122px wide,
 *           and the highlight follows the scroll (Alpha → Beta → Beta, part two).
 *
 * Three defects, one assertion group each. jsdom has no layout, so the observer is faked the way
 * affix.test.tsx fakes it and the rects are stubbed.
 */
type Observed = {
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit | undefined;
};
let observers: Observed[] = [];

function flip(intersecting: boolean) {
  const observer = observers.at(-1)!;
  act(() => {
    observer.callback(
      [
        {
          isIntersecting: intersecting,
          intersectionRatio: intersecting ? 1 : 0,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );
  });
}

beforeEach(() => {
  observers = [];
  class MockIO {
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      observers.push({ callback, options });
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", MockIO as unknown as typeof IntersectionObserver);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  document.documentElement.style.overflowY = "";
});

/** Render `ui` inside a box that scrolls on the block axis, the way `.ui-page-body` does. */
function inScroller(ui: React.ReactElement, overflowY = "auto") {
  const scroller = document.createElement("div");
  scroller.style.overflowY = overflowY;
  document.body.append(scroller);
  return {
    scroller,
    ...render(ui, { container: scroller.appendChild(document.createElement("div")) }),
  };
}

const rootOf = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-slot="affix"]')!;

describe("A — with no `target`, the scroll box is the nearest block-axis scroller", () => {
  it("observes against the scroller it lives in, not the viewport it never scrolls", () => {
    const { scroller } = inScroller(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    expect(observers.at(-1)?.options?.root).toBe(scroller);
  });

  it("…for `overflow-y: scroll` too", () => {
    const { scroller } = inScroller(
      <Affix>
        <p>bar</p>
      </Affix>,
      "scroll",
    );
    expect(observers.at(-1)?.options?.root).toBe(scroller);
  });

  it("is still the viewport when nothing above it scrolls", () => {
    render(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    expect(observers.at(-1)?.options?.root ?? null).toBeNull();
  });

  it("treats a root element that 'scrolls' (a reset's `html { overflow-y: scroll }`) as the viewport", () => {
    document.documentElement.style.overflowY = "scroll";
    render(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    expect(observers.at(-1)?.options?.root ?? null).toBeNull();
  });

  it("an explicit `target={() => window}` still means the viewport, even inside a scroller", () => {
    inScroller(
      <Affix target={() => window}>
        <p>bar</p>
      </Affix>,
    );
    expect(observers.at(-1)?.options?.root ?? null).toBeNull();
  });

  it("Anchor with neither `target` nor `getContainer` pins against the same scroller", () => {
    const { scroller } = inScroller(
      <Anchor label="On this page" items={[{ key: "a", href: "#a", title: "A" }]} />,
    );
    expect(observers.map((o) => o.options?.root)).toContain(scroller);
  });
});

describe("B — the pinned bar keeps its column", () => {
  it("the placeholder holds the measured INLINE size as well as the block size", () => {
    // In a shrink-to-fit parent the root is only as wide as what is in flow. A block-only
    // placeholder let it collapse to 0, the next measurement read 0, and the rail painted 0px.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      const isContent = this.dataset.slot === "affix-content";
      return {
        width: 122,
        height: isContent ? 180 : 0,
        top: 0,
        bottom: 0,
        left: 0,
        right: 122,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    });
    const { container } = render(
      <Affix>
        <p>bar</p>
      </Affix>,
    );
    flip(false);
    const held = container.querySelector<HTMLElement>('[data-slot="affix-placeholder"]')!;
    expect(held.style.inlineSize).toBe("122px");
    expect(held.style.blockSize).toBe("180px");
  });
});

describe("C — a hidden Affix is not a pinned one", () => {
  it("inside `display: none` an out-of-view sentinel does not pin, and onChange stays silent", () => {
    const hidden = document.createElement("div");
    hidden.style.display = "none";
    document.body.append(hidden);
    const onChange = vi.fn();
    const { container } = render(
      <Affix onChange={onChange}>
        <p>bar</p>
      </Affix>,
      { container: hidden.appendChild(document.createElement("div")) },
    );
    flip(false);
    expect(rootOf(container)).not.toHaveAttribute("data-affixed");
    expect(onChange).not.toHaveBeenCalledWith(true);
  });

  it("the same Affix, shown, pins as before", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Affix onChange={onChange}>
        <p>bar</p>
      </Affix>,
    );
    flip(false);
    expect(rootOf(container)).toHaveAttribute("data-affixed", "");
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

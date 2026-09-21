import { createRef } from "react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Reveal } from "../reveal";
import { renderWithUi } from "@/test/render";

/**
 * A consumer-supplied utility, hoisted so the literal appears once as a FIXTURE rather than as an
 * assertion about how the component is painted. What is under test is pass-through: whatever class
 * the consumer hands in survives `cn()` onto the rendered node.
 */
const CONSUMER_CLASS = "my-2";

describe("Reveal", () => {
  it("wraps content in a ui-reveal element with the reveal slot", () => {
    const { getByText, container } = renderWithUi(
      <Reveal>
        <p>コンテンツ</p>
      </Reveal>,
    );
    expect(getByText("コンテンツ")).toBeInTheDocument();
    const root = container.querySelector('[data-slot="reveal"]');
    expect(root).toHaveClass("ui-reveal");
    // delay defaults to 0 → no stagger attribute (enters immediately).
    expect(root).not.toHaveAttribute("data-reveal-delay");
  });

  it("emits the stagger ordinal as a data attribute for positive delays", () => {
    const { container } = renderWithUi(<Reveal delay={3}>x</Reveal>);
    expect(container.querySelector('[data-slot="reveal"]')).toHaveAttribute(
      "data-reveal-delay",
      "3",
    );
  });

  it("merges onto the single child (no wrapper div) when asChild", () => {
    const { container } = renderWithUi(
      <Reveal asChild delay={2} className="extra">
        <section className="panel">パネル</section>
      </Reveal>,
    );
    // No wrapper div: the <section> itself carries the reveal.
    expect(container.querySelector("div.ui-reveal")).toBeNull();
    const section = container.querySelector("section");
    expect(section).toHaveClass("ui-reveal", "panel", "extra");
    expect(section).toHaveAttribute("data-slot", "reveal");
    expect(section).toHaveAttribute("data-reveal-delay", "2");
  });

  it("forwards className and native props to the wrapper", () => {
    const { getByLabelText } = renderWithUi(
      <Reveal className={CONSUMER_CLASS} aria-label="region">
        y
      </Reveal>,
    );
    const root = getByLabelText("region");
    expect(root).toHaveClass("ui-reveal", CONSUMER_CLASS);
  });

  it("forwards its ref to the rendered element", () => {
    const ref = createRef<HTMLDivElement>();
    renderWithUi(<Reveal ref={ref}>z</Reveal>);
    expect(ref.current).toHaveClass("ui-reveal");
  });
});

/* ────────────────────────────────────────────────────────────────────────────────────────────
 * gh#829 — `on="view"`.
 *
 * jsdom has no layout and no `IntersectionObserver`, so the observer is installed here as a
 * recording double. That is the point rather than a workaround: what these tests assert is the
 * CONTRACT between the component and the API — which options it asks for, when it is allowed to
 * write the hidden state, and (twice over) that there are paths on which it never constructs an
 * observer at all.
 * ──────────────────────────────────────────────────────────────────────────────────────────── */

type ObserverLog = {
  options: IntersectionObserverInit | undefined;
  observed: Element[];
  unobserved: Element[];
  fire: (entry: { isIntersecting: boolean; intersectionRatio: number }) => void;
};

const observerLog: ObserverLog[] = [];

/** Install a recording `IntersectionObserver`; returns the log of every one constructed. */
function recordObservers(): ObserverLog[] {
  observerLog.length = 0;
  class RecordingObserver {
    private readonly entry: ObserverLog;
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.entry = {
        options,
        observed: [],
        unobserved: [],
        fire: ({ isIntersecting, intersectionRatio }) => {
          const target = this.entry.observed[0];
          callback(
            [
              { isIntersecting, intersectionRatio, target },
            ] as unknown as IntersectionObserverEntry[],
            this as unknown as IntersectionObserver,
          );
        },
      };
      observerLog.push(this.entry);
    }
    observe(element: Element) {
      this.entry.observed.push(element);
    }
    unobserve(element: Element) {
      this.entry.unobserved.push(element);
    }
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", RecordingObserver);
  return observerLog;
}

/** Make `prefers-reduced-motion: reduce` the user's OS setting for this test. */
function preferReducedMotion() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const realMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = realMatchMedia;
  vi.unstubAllGlobals();
});

const revealOf = (container: HTMLElement) => container.querySelector('[data-slot="reveal"]');

describe('Reveal on="view"', () => {
  it('default on="mount" observes nothing and carries no view state', () => {
    const observers = recordObservers();
    const { container } = renderWithUi(<Reveal>マウント時に入場</Reveal>);
    const root = revealOf(container);
    expect(observers).toHaveLength(0);
    expect(root).not.toHaveAttribute("data-reveal-on");
    expect(root).not.toHaveAttribute("data-reveal-state");
  });

  it("is hidden before entry and shown after, and asks for threshold 0 for the default amount", () => {
    const observers = recordObservers();
    const { container } = renderWithUi(<Reveal on="view">ビューポートで入場</Reveal>);
    const root = revealOf(container);

    expect(root).toHaveAttribute("data-reveal-on", "view");
    // `out` is only ever written by a mounted component holding a live observer.
    expect(root).toHaveAttribute("data-reveal-state", "out");
    expect(observers).toHaveLength(1);
    expect(observers[0].options?.threshold).toBe(0);
    expect(observers[0].observed[0]).toBe(root);

    act(() => {
      observers[0].fire({ isIntersecting: true, intersectionRatio: 0.02 });
    });
    expect(root).toHaveAttribute("data-reveal-state", "in");
  });

  it("reveals once by default — leaving the viewport never re-hides, and the target is unobserved", () => {
    const observers = recordObservers();
    const { container } = renderWithUi(<Reveal on="view">一度きり</Reveal>);
    const root = revealOf(container);

    act(() => {
      observers[0].fire({ isIntersecting: true, intersectionRatio: 1 });
    });
    expect(observers[0].unobserved[0]).toBe(root);

    act(() => {
      observers[0].fire({ isIntersecting: false, intersectionRatio: 0 });
    });
    expect(root).toHaveAttribute("data-reveal-state", "in");
  });

  it("once={false} re-hides on exit so the entrance replays", () => {
    const observers = recordObservers();
    const { container } = renderWithUi(
      <Reveal on="view" once={false}>
        毎回
      </Reveal>,
    );
    const root = revealOf(container);

    act(() => {
      observers[0].fire({ isIntersecting: true, intersectionRatio: 1 });
    });
    expect(root).toHaveAttribute("data-reveal-state", "in");
    expect(observers[0].unobserved).toHaveLength(0);

    act(() => {
      observers[0].fire({ isIntersecting: false, intersectionRatio: 0 });
    });
    expect(root).toHaveAttribute("data-reveal-state", "out");
  });

  it('honours amount — "all" asks for 1, a number passes through, and a partial entry is not enough', () => {
    const observers = recordObservers();
    const { container } = renderWithUi(
      <Reveal on="view" amount="all">
        全面
      </Reveal>,
    );
    expect(observers[0].options?.threshold).toBe(1);

    const root = revealOf(container);
    // `isIntersecting` flips at the first pixel; `amount` is what decides.
    act(() => {
      observers[0].fire({ isIntersecting: true, intersectionRatio: 0.4 });
    });
    expect(root).toHaveAttribute("data-reveal-state", "out");

    act(() => {
      observers[0].fire({ isIntersecting: true, intersectionRatio: 1 });
    });
    expect(root).toHaveAttribute("data-reveal-state", "in");

    renderWithUi(
      <Reveal on="view" amount={0.35}>
        三割五分
      </Reveal>,
    );
    expect(observers[1].options?.threshold).toBe(0.35);
  });

  it('clamps amount="all" to what an element taller than the viewport can actually reach', () => {
    // The ratio is measured against the TARGET's own box, so a section twice the viewport height
    // tops out at 0.5 and a literal threshold of 1 would hide it for good.
    const measure = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ width: 1024, height: 1536 } as DOMRect);
    vi.stubGlobal("innerWidth", 1024);
    vi.stubGlobal("innerHeight", 768);

    const observers = recordObservers();
    renderWithUi(
      <Reveal on="view" amount="all">
        背の高いセクション
      </Reveal>,
    );
    expect(observers[0].options?.threshold).toBeCloseTo(0.5, 5);
    measure.mockRestore();
  });

  it("attaches NO observer under prefers-reduced-motion, and leaves the content visible", () => {
    preferReducedMotion();
    const observers = recordObservers();
    const { container, getByText } = renderWithUi(
      <Reveal on="view" delay={3}>
        モーション低減
      </Reveal>,
    );
    const root = revealOf(container);

    // The acceptance criterion, measured: not one observer exists…
    expect(observers).toHaveLength(0);
    // …and nothing in the DOM can hide the element, because the hidden state is never written.
    expect(root).not.toHaveAttribute("data-reveal-state");
    expect(root).toHaveAttribute("data-reveal-on", "view");
    expect(getByText("モーション低減")).toBeInTheDocument();
  });

  it("never writes the hidden state in an environment without IntersectionObserver", () => {
    // No `recordObservers()` here: jsdom ships none, which is also the no-JS/legacy-browser shape.
    const { container, getByText } = renderWithUi(<Reveal on="view">観測できない環境</Reveal>);
    expect(revealOf(container)).not.toHaveAttribute("data-reveal-state", "out");
    expect(getByText("観測できない環境")).toBeInTheDocument();
  });

  it("observes the child itself, not a wrapper, when asChild", () => {
    const observers = recordObservers();
    const { container } = renderWithUi(
      <Reveal on="view" asChild delay={2}>
        <section className="panel">パネル</section>
      </Reveal>,
    );
    const section = container.querySelector("section");
    expect(container.querySelector("div.ui-reveal")).toBeNull();
    expect(observers[0].observed[0]).toBe(section);
    expect(section).toHaveAttribute("data-reveal-state", "out");
    expect(section).toHaveAttribute("data-reveal-delay", "2");
  });
});

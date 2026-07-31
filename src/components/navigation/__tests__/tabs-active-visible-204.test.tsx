import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import {
  isTabFullyVisible,
  resolveTabScrollTarget,
  syncActiveTabIntoView,
  type TabsScrollBox,
} from "../tabs-scroll";

/**
 * Regression coverage for gh#204 — after a responsive resize (1440 → 1024 → 390) the horizontal
 * `TabsList` kept its internal scroll offset, so the ACTIVE first trigger stayed in the DOM with
 * `data-state="active"` / `aria-selected="true"` but sat entirely outside the visible strip.
 *
 * ── WHAT THIS FILE PROVES / DOES NOT PROVE ───────────────────────────────────────────────────
 * jsdom performs NO layout: every `getBoundingClientRect()` is a zero rect and there is no real
 * scrolling. So this suite deliberately splits into two halves and does not pretend to be a
 * pixel-level browser test:
 *
 *  1. **Decision logic (pure, real numbers).** `isTabFullyVisible` is exercised with the exact
 *     geometry from the bug report — first tab left of the scrollport, last tab past its right
 *     edge, the RTL mirror of both. These are honest assertions: the function is pure and takes
 *     plain edge numbers, nothing is faked.
 *  2. **Wiring (mocked observers + spied `scrollIntoView`).** The `ResizeObserver` /
 *     `MutationObserver` callbacks are captured and invoked by hand, and `Element.scrollIntoView`
 *     is a spy. This proves the code PATH — that a resize/selection notification reaches
 *     `scrollIntoView({block:"nearest", inline:"nearest"})` on the right element with the right
 *     `behavior`, and that it is skipped when the target is already visible. The one place a
 *     geometry stub is used (`getBoundingClientRect`) is called out inline.
 *
 * NOT proved here: that the browser's own scrolling then puts the tab at viewport ratio > 0, that
 * the strip actually overflows at 390px, or the smoothness/timing of the animation. Those need the
 * Playwright acceptance test in the reporting app (`toBeInViewport` at 1440/1024/390).
 */

const JA_ITEMS = [
  { value: "failed", label: "失敗", content: "失敗パネル" },
  { value: "bounced", label: "バウンス", content: "バウンスパネル" },
  { value: "complained", label: "苦情", content: "苦情パネル" },
  { value: "delivered", label: "配信済み", content: "配信済みパネル" },
  { value: "queued", label: "キュー待ち", content: "キュー待ちパネル" },
  { value: "sending", label: "送信中", content: "送信中パネル" },
  { value: "suppressed", label: "抑制済み", content: "抑制済みパネル" },
];

/** Build a rect-ish box from physical viewport edges. */
const box = (left: number, right: number, top = 0, bottom = 40): TabsScrollBox => ({
  left,
  right,
  top,
  bottom,
});

describe("tabs-scroll — visibility decision (pure geometry, gh#204)", () => {
  it("a first trigger scrolled off the START of the strip is NOT fully visible", () => {
    // 390px strip whose scrollLeft survived the 1440 → 390 resize: the visible run starts partway
    // through the SECOND label, so 失敗 sits entirely left of the scrollport.
    const scrollport = box(0, 390);
    const firstTrigger = box(-96, -20);
    expect(isTabFullyVisible(scrollport, firstTrigger)).toBe(false);
  });

  it("a LAST trigger scrolled off the END of the strip is NOT fully visible", () => {
    expect(isTabFullyVisible(box(0, 390), box(420, 520))).toBe(false);
  });

  it("a trigger only PARTIALLY clipped still counts as not visible (either edge)", () => {
    expect(isTabFullyVisible(box(0, 390), box(-10, 60))).toBe(false);
    expect(isTabFullyVisible(box(0, 390), box(340, 410))).toBe(false);
  });

  it("a trigger fully inside the strip IS visible — the guard that stops us fighting user scroll", () => {
    expect(isTabFullyVisible(box(0, 390), box(12, 96))).toBe(true);
  });

  it("tolerates sub-pixel layout (a 0.4px overhang is not 'clipped')", () => {
    expect(isTabFullyVisible(box(0, 390), box(-0.4, 389.6))).toBe(true);
  });

  it("RTL: the same test works on the mirrored strip because the boxes are PHYSICAL rects", () => {
    // dir="rtl" — the first (active) trigger is visually at the RIGHT end of the strip. When the
    // strip is scrolled the wrong way it overflows past the right edge instead of the left one.
    expect(isTabFullyVisible(box(0, 390), box(400, 486))).toBe(false);
    expect(isTabFullyVisible(box(0, 390), box(300, 386))).toBe(true);
  });

  it("vertical rail: an out-of-view trigger is detected on the BLOCK axis too", () => {
    expect(isTabFullyVisible(box(0, 200, 0, 300), box(0, 200, 320, 360))).toBe(false);
    expect(isTabFullyVisible(box(0, 200, 0, 300), box(0, 200, 40, 80))).toBe(true);
  });

  it("a zero-area scrollport (hidden / no layout engine) reports visible — nothing to correct", () => {
    expect(isTabFullyVisible(box(0, 0, 0, 0), box(0, 0, 0, 0))).toBe(true);
  });
});

describe("tabs-scroll — keep-visible target resolution (gh#204)", () => {
  it("targets the ACTIVE trigger when focus is outside the strip", () => {
    render(<Tabs items={JA_ITEMS} defaultValue="failed" />);
    const list = screen.getByRole("tablist");
    expect(resolveTabScrollTarget(list)).toBe(screen.getByRole("tab", { name: "失敗" }));
  });

  it("prefers the FOCUSED trigger over the active one, so manual roving focus is never stranded", async () => {
    const user = userEvent.setup();
    render(<Tabs items={JA_ITEMS} defaultValue="failed" activationMode="manual" />);
    const list = screen.getByRole("tablist");

    await user.tab(); // roving tabindex → the active trigger
    await user.keyboard("{ArrowRight}{ArrowRight}"); // focus moves, selection does NOT (manual)

    expect(screen.getByRole("tab", { name: "失敗" })).toHaveAttribute("aria-selected", "true");
    expect(resolveTabScrollTarget(list)).toBe(document.activeElement);
    expect(resolveTabScrollTarget(list)).not.toBe(screen.getByRole("tab", { name: "失敗" }));
  });

  it("returns null when nothing is selected (every item disabled — gh#175 fallback)", () => {
    render(
      <Tabs
        items={[
          { value: "a", label: "無効A", content: "A", disabled: true },
          { value: "b", label: "無効B", content: "B", disabled: true },
        ]}
      />,
    );
    expect(resolveTabScrollTarget(screen.getByRole("tablist"))).toBeNull();
  });
});

/**
 * Wiring half. `Element.prototype.scrollIntoView` is a `vi.fn()` from `vitest.setup.ts`; here we
 * additionally capture the observer callbacks so a "resize" can be delivered deterministically.
 */
describe("TabsList — resize re-pins the active trigger (gh#204)", () => {
  let resizeCallbacks: ResizeObserverCallback[] = [];
  let mutationCallbacks: MutationCallback[] = [];
  let observedByResize: Element[] = [];
  const scrollIntoView = Element.prototype.scrollIntoView as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    resizeCallbacks = [];
    mutationCallbacks = [];
    observedByResize = [];
    scrollIntoView.mockClear();

    // Reset the shared `window.matchMedia` mock — the reduced-motion test below rewrites it.
    vi.mocked(window.matchMedia).mockImplementation(
      (query: string) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    vi.stubGlobal(
      "ResizeObserver",
      class FakeResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          resizeCallbacks.push(callback);
        }
        observe(target: Element) {
          observedByResize.push(target);
        }
        unobserve() {}
        disconnect() {}
      },
    );

    const RealMutationObserver = globalThis.MutationObserver;
    vi.stubGlobal(
      "MutationObserver",
      class SpyMutationObserver extends RealMutationObserver {
        constructor(callback: MutationCallback) {
          super(callback);
          mutationCallbacks.push(callback);
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * The ONE geometry fake in this file: jsdom returns zero rects for everything, which the
   * visibility guard (correctly) reads as "nothing to correct". Stubbing just these two elements
   * reproduces the reported layout — a 390px strip whose active first trigger sits at [-96, -20].
   */
  const stubOffScreenFirstTab = (list: HTMLElement, trigger: HTMLElement) => {
    vi.spyOn(list, "getBoundingClientRect").mockReturnValue({
      left: 0,
      right: 390,
      top: 0,
      bottom: 40,
      width: 390,
      height: 40,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      left: -96,
      right: -20,
      top: 0,
      bottom: 40,
      width: 76,
      height: 40,
      x: -96,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
  };

  it("observes the tablist for size changes on mount", () => {
    render(<Tabs items={JA_ITEMS} defaultValue="failed" />);
    expect(observedByResize).toContain(screen.getByRole("tablist"));
  });

  it("a resize notification scrolls the off-strip ACTIVE FIRST trigger back into view, instantly", () => {
    render(<Tabs items={JA_ITEMS} defaultValue="failed" />);
    const list = screen.getByRole("tablist");
    const first = screen.getByRole("tab", { name: "失敗" });
    stubOffScreenFirstTab(list, first);
    scrollIntoView.mockClear();

    // Deliver the resize the way the browser would after 1440 → 390.
    for (const callback of resizeCallbacks) {
      callback([] as unknown as ResizeObserverEntry[], {} as ResizeObserver);
    }

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.instances[0]).toBe(first);
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
      inline: "nearest",
      behavior: "auto", // resize corrections never animate
    });
    // The tab that was reported as invisible is still the selected one afterwards.
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(first).toHaveAttribute("data-state", "active");
  });

  it("does NOT scroll when the active trigger is already fully visible (never fights user scroll)", () => {
    render(<Tabs items={JA_ITEMS} defaultValue="failed" />);
    scrollIntoView.mockClear();

    // No geometry stub → zero rects → the guard treats the target as in-view.
    for (const callback of resizeCallbacks) {
      callback([] as unknown as ResizeObserverEntry[], {} as ResizeObserver);
    }

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("works for the LAST trigger too, not just the first", () => {
    render(<Tabs items={JA_ITEMS} defaultValue="suppressed" />);
    const list = screen.getByRole("tablist");
    const last = screen.getByRole("tab", { name: "抑制済み" });
    // Same stub shape, mirrored: the last trigger sits past the right edge of a 390px strip.
    vi.spyOn(list, "getBoundingClientRect").mockReturnValue({
      left: 0,
      right: 390,
      top: 0,
      bottom: 40,
      width: 390,
      height: 40,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(last, "getBoundingClientRect").mockReturnValue({
      left: 420,
      right: 520,
      top: 0,
      bottom: 40,
      width: 100,
      height: 40,
      x: 420,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    scrollIntoView.mockClear();

    for (const callback of resizeCallbacks) {
      callback([] as unknown as ResizeObserverEntry[], {} as ResizeObserver);
    }

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.instances[0]).toBe(last);
  });

  it('RTL: the same resize correction runs under dir="rtl"', () => {
    render(
      <div dir="rtl">
        <Tabs items={JA_ITEMS} defaultValue="failed" />
      </div>,
    );
    const list = screen.getByRole("tablist");
    const first = screen.getByRole("tab", { name: "失敗" });
    // Mirrored overflow: in RTL the first trigger runs off the RIGHT edge.
    vi.spyOn(list, "getBoundingClientRect").mockReturnValue({
      left: 0,
      right: 390,
      top: 0,
      bottom: 40,
      width: 390,
      height: 40,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(first, "getBoundingClientRect").mockReturnValue({
      left: 400,
      right: 486,
      top: 0,
      bottom: 40,
      width: 86,
      height: 40,
      x: 400,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    scrollIntoView.mockClear();

    for (const callback of resizeCallbacks) {
      callback([] as unknown as ResizeObserverEntry[], {} as ResizeObserver);
    }

    // `inline: "nearest"` is what makes this direction-agnostic — no LTR/RTL branch in our code.
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
      inline: "nearest",
      behavior: "auto",
    });
    expect(scrollIntoView.mock.instances[0]).toBe(first);
  });

  it("reduced motion downgrades a SELECTION-change correction to an instant jump", async () => {
    vi.mocked(window.matchMedia).mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("prefers-reduced-motion"),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    render(<Tabs items={JA_ITEMS} defaultValue="failed" />);
    const list = screen.getByRole("tablist");
    const first = screen.getByRole("tab", { name: "失敗" });
    stubOffScreenFirstTab(list, first);
    scrollIntoView.mockClear();

    // Drive the selection-change path (the MutationObserver one) rather than the resize path.
    for (const callback of mutationCallbacks) {
      callback([] as unknown as MutationRecord[], {} as MutationObserver);
    }

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({
        block: "nearest",
        inline: "nearest",
        behavior: "auto", // "smooth" would have been requested without prefers-reduced-motion
      });
    });
  });

  it("without reduced motion, a SELECTION change animates smoothly", () => {
    render(<Tabs items={JA_ITEMS} defaultValue="failed" />);
    const list = screen.getByRole("tablist");
    const first = screen.getByRole("tab", { name: "失敗" });
    stubOffScreenFirstTab(list, first);
    scrollIntoView.mockClear();

    for (const callback of mutationCallbacks) {
      callback([] as unknown as MutationRecord[], {} as MutationObserver);
    }

    expect(scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  });

  it("the compound (manual TabsList) API gets the same observers as the items API", () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
        <TabsContent value="two">Second</TabsContent>
      </Tabs>,
    );
    expect(observedByResize).toContain(screen.getByRole("tablist"));
  });
});

describe("TabsList — the fix does not break the existing contract (gh#175 + a11y)", () => {
  it("a forwarded ref still receives the tablist node (the internal ref is composed, not stolen)", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Tabs defaultValue="one">
        <TabsList ref={ref}>
          <TabsTrigger value="one">One</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
      </Tabs>,
    );
    expect(ref.current).toBe(screen.getByRole("tablist"));
  });

  it("a CALLBACK ref is still invoked with the node", () => {
    const seen: (HTMLElement | null)[] = [];
    render(
      <Tabs defaultValue="one">
        <TabsList
          ref={(node) => {
            seen.push(node);
          }}
        >
          <TabsTrigger value="one">One</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
      </Tabs>,
    );
    expect(seen[0]).toBe(screen.getByRole("tablist"));
  });

  it("keyboard roving focus + activation still work with localized labels", async () => {
    const user = userEvent.setup();
    render(<Tabs items={JA_ITEMS} defaultValue="failed" />);

    await user.tab();
    expect(document.activeElement).toHaveAccessibleName("失敗");

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toHaveAccessibleName("バウンス");
    expect(screen.getByRole("tab", { name: "バウンス" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("バウンスパネル")).toBeInTheDocument();

    await user.keyboard("{End}");
    expect(document.activeElement).toHaveAccessibleName("抑制済み");
  });

  it("clicking a trigger still switches panels (no scroll hijack side effects)", async () => {
    const user = userEvent.setup();
    render(<Tabs items={JA_ITEMS} defaultValue="failed" />);
    await user.click(screen.getByRole("tab", { name: "苦情" }));
    expect(screen.getByText("苦情パネル")).toBeInTheDocument();
    expect(screen.queryByText("失敗パネル")).toBeNull();
  });

  it("unmounting disconnects cleanly (no throw, no stray scroll)", () => {
    const { unmount } = render(<Tabs items={JA_ITEMS} defaultValue="failed" />);
    expect(() => {
      unmount();
    }).not.toThrow();
  });

  it("syncActiveTabIntoView is a safe no-op without a list node", () => {
    expect(syncActiveTabIntoView(null)).toBeNull();
  });
});

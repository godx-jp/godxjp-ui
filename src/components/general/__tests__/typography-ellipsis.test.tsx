import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import { Text } from "../typography";

/**
 * antd `ellipsis` — `EllipsisConfig` in antd 6.6.3.
 *
 * jsdom reports 0 for every layout box, so "does this run overflow?" has to be STUBBED to be
 * measured at all — and the re-measure has to be driven through the same `ResizeObserver` a browser
 * would use, because the global stub in `vitest.setup.ts` never invokes its callback.
 *
 * That is exactly the claim this port's CSS path makes and antd's JS path does not: antd
 * binary-searches a character index across three off-screen probe spans, which no assertion in this
 * repo's test environment could ever reach. Stubbing two numbers and firing one observer is the
 * difference between a verified contract and a screenshot.
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
  vi.restoreAllMocks();
});

/** Make one element report that it is clipping its own content, then let the observer notice. */
function clip(el: Element) {
  for (const [prop, value] of [
    ["scrollHeight", 120],
    ["clientHeight", 40],
    ["scrollWidth", 320],
    ["clientWidth", 120],
  ] as const) {
    Object.defineProperty(el, prop, { value, configurable: true });
  }
  act(() => {
    for (const fire of resizeCallbacks) fire();
  });
}

function run(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-slot="text"]');
  if (!el) throw new Error('no [data-slot="text"] in the tree');
  return el;
}

describe("Text — ellipsis", () => {
  it("is the single-line contract when set to true", () => {
    render(<Text ellipsis>とても長い件名</Text>);
    const el = screen.getByText("とても長い件名");
    expect(el).toHaveAttribute("data-ellipsis", "");
    expect(el).toHaveAttribute("data-truncate", "");
  });

  it("outranks truncate and clamp, and says so in dev", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Text ellipsis clamp={3}>
        件名
      </Text>,
    );
    const el = screen.getByText("件名");
    // `ellipsis` won: one line, not three.
    expect(el).toHaveAttribute("data-truncate", "");
    expect(el).not.toHaveAttribute("data-clamp");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("`ellipsis` takes precedence"));
  });

  it("leaves truncate and clamp exactly as they were when `ellipsis` is absent", () => {
    // The backward-compatibility contract for the two props that already shipped.
    const { rerender } = render(<Text truncate>件名</Text>);
    expect(screen.getByText("件名")).toHaveAttribute("data-truncate", "");
    rerender(<Text clamp={2}>件名</Text>);
    const el = screen.getByText("件名");
    expect(el).toHaveAttribute("data-clamp", "");
    expect(el.style.getPropertyValue("--text-clamp")).toBe("2");
    expect(el).not.toHaveAttribute("data-ellipsis");
  });

  it("pins a suffix after the ellipsis", () => {
    render(<Text ellipsis={{ suffix: "--EOF" }}>ログ</Text>);
    expect(screen.getByText("--EOF")).toBeInTheDocument();
  });

  it("never writes its own ellipsis characters — CSS already draws one", () => {
    // antd emits a literal `<span aria-hidden>...</span>` because antd CUTS the string in JS and
    // nothing else would mark the cut. Here the browser draws the ellipsis (`text-overflow` /
    // `line-clamp`), so emitting antd's three periods as well would render TWO — the visible
    // symptom of porting the markup instead of the behaviour.
    const { container } = render(<Text ellipsis={{ suffix: "件" }}>とても長い件名</Text>);
    clip(run(container));
    expect(container.textContent).not.toContain("...");
    expect(container.textContent).toContain("件");
  });
});

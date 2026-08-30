import * as React from "react";
import { act, render, waitFor } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { ScrollArea } from "../scroll-area";
import { Button } from "../../general/button";

/**
 * Bottom anchoring (gh#311) — the behaviour, not the rendering.
 *
 * jsdom has NO layout engine: `scrollHeight`, `clientHeight`, `offsetTop` and `offsetHeight` are
 * all hard 0, and setting `scrollTop` never emits a `scroll` event. So this file installs a
 * deliberately simple layout model — every row is ROW_HEIGHT tall, the viewport is VIEWPORT_HEIGHT
 * tall — and a "scroll" means what a browser means: move `scrollTop`, then dispatch `scroll`.
 * `scrollTop` itself is real (jsdom stores it), so every assertion below is against the value the
 * component actually wrote.
 *
 * What that model CANNOT reach, and which therefore has no test here:
 *   - the ResizeObserver path (growth with no DOM mutation — an image finishing load). The repo's
 *     vitest setup stubs ResizeObserver with a no-op class, so it never fires; the MutationObserver
 *     path exercised below runs the same `handleContentChange`.
 *   - native CSS `overflow-anchor`, which jsdom does not implement at all. The compensation tested
 *     here is the fallback written to be idempotent with it.
 *   - momentum/touch scrolling and `prefers-reduced-motion` as an OS state.
 */

const ROW_HEIGHT = 20;
const VIEWPORT_HEIGHT = 100;
const VIEWPORT_SELECTOR = '[data-slot="scroll-area-viewport"]';

/**
 * Radix wraps the children in one content div; descend past single-child wrappers exactly the way
 * the component does, so the modelled height counts the same rows it anchors to.
 */
function rowCount(viewport: Element): number {
  let container: Element = viewport;
  while (container.children.length === 1 && container.firstElementChild) {
    container = container.firstElementChild;
  }
  return container.children.length;
}

let originalDescriptors: Record<string, PropertyDescriptor | undefined>;

beforeAll(() => {
  originalDescriptors = {
    clientHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight"),
    scrollHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight"),
    offsetTop: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetTop"),
    offsetHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight"),
  };

  const isViewport = (element: HTMLElement) => element.dataset.slot === "scroll-area-viewport";

  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get(this: HTMLElement) {
      return isViewport(this) ? VIEWPORT_HEIGHT : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get(this: HTMLElement) {
      return isViewport(this) ? rowCount(this) * ROW_HEIGHT : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetTop", {
    configurable: true,
    get(this: HTMLElement) {
      const parent = this.parentElement;
      if (!parent) return 0;
      return Array.prototype.indexOf.call(parent.children, this) * ROW_HEIGHT;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get: () => ROW_HEIGHT,
  });
});

afterAll(() => {
  for (const [name, descriptor] of Object.entries(originalDescriptors)) {
    if (descriptor) Object.defineProperty(HTMLElement.prototype, name, descriptor);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
  }
});

function Stream({
  rows,
  ...props
}: { rows: readonly string[] } & React.ComponentProps<typeof ScrollArea>) {
  return (
    <ScrollArea {...props}>
      {rows.map((row) => (
        <div key={row} data-testid={row}>
          {row}
        </div>
      ))}
    </ScrollArea>
  );
}

const rowsFrom = (start: number, count: number) =>
  Array.from({ length: count }, (_, index) => `msg-${String(start + index)}`);

function viewportOf(container: HTMLElement): HTMLElement {
  const viewport = container.querySelector<HTMLElement>(VIEWPORT_SELECTOR);
  if (!viewport) throw new Error("viewport not found");
  return viewport;
}

/** What a browser does when the reader drags the bar: move the offset, then announce it. */
function readerScrollsTo(viewport: HTMLElement, top: number) {
  act(() => {
    viewport.scrollTop = top;
    viewport.dispatchEvent(new Event("scroll"));
  });
}

const bottomOf = (viewport: HTMLElement) => viewport.scrollHeight - viewport.clientHeight;

describe("ScrollArea anchor='bottom'", () => {
  it("lands on the newest row at mount instead of the top", () => {
    const { container } = render(<Stream anchor="bottom" rows={rowsFrom(1, 20)} />);
    const viewport = viewportOf(container);

    expect(viewport.scrollHeight).toBe(400);
    expect(viewport.scrollTop).toBe(300);
  });

  it("follows new rows while the reader is at the bottom", async () => {
    const { container, rerender } = render(<Stream anchor="bottom" rows={rowsFrom(1, 20)} />);
    const viewport = viewportOf(container);

    rerender(<Stream anchor="bottom" rows={rowsFrom(1, 30)} />);

    await waitFor(() => {
      expect(viewport.scrollTop).toBe(500);
    });
    expect(viewport.scrollTop).toBe(bottomOf(viewport));
  });

  it("does NOT follow new rows once the reader has scrolled up to read history", async () => {
    const onAnchoredChange = vi.fn();
    const { container, rerender } = render(
      <Stream
        anchor="bottom"
        anchorOffset={40}
        onAnchoredChange={onAnchoredChange}
        rows={rowsFrom(1, 20)}
      />,
    );
    const viewport = viewportOf(container);

    readerScrollsTo(viewport, 0);
    expect(onAnchoredChange).toHaveBeenCalledWith(false);

    rerender(
      <Stream
        anchor="bottom"
        anchorOffset={40}
        onAnchoredChange={onAnchoredChange}
        rows={rowsFrom(1, 30)}
      />,
    );

    // Give the MutationObserver every chance to move the viewport — it must not.
    await act(async () => {
      await Promise.resolve();
    });
    expect(viewport.scrollTop).toBe(0);
    expect(onAnchoredChange).toHaveBeenCalledTimes(1);
  });

  it("re-pins as soon as the reader comes back inside the anchor band", async () => {
    const onAnchoredChange = vi.fn();
    const { container, rerender } = render(
      <Stream
        anchor="bottom"
        anchorOffset={40}
        onAnchoredChange={onAnchoredChange}
        rows={rowsFrom(1, 20)}
      />,
    );
    const viewport = viewportOf(container);

    readerScrollsTo(viewport, 0);
    expect(onAnchoredChange).toHaveBeenLastCalledWith(false);

    // A "jump to newest" click, or a drag back down: within 40px of the bottom counts as back.
    readerScrollsTo(viewport, bottomOf(viewport) - 20);
    expect(onAnchoredChange).toHaveBeenLastCalledWith(true);

    rerender(
      <Stream
        anchor="bottom"
        anchorOffset={40}
        onAnchoredChange={onAnchoredChange}
        rows={rowsFrom(1, 30)}
      />,
    );
    await waitFor(() => {
      expect(viewport.scrollTop).toBe(500);
    });
  });

  it("keeps the read row under the reader's eyes when older history is prepended", async () => {
    const onAnchoredChange = vi.fn();
    const { container, rerender } = render(
      <Stream
        anchor="bottom"
        anchorOffset={40}
        onAnchoredChange={onAnchoredChange}
        rows={rowsFrom(11, 20)}
      />,
    );
    const viewport = viewportOf(container);

    // Reading msg-16 (row index 5) with its top edge exactly at the viewport's top edge.
    readerScrollsTo(viewport, 100);
    const readRow = container.querySelector<HTMLElement>('[data-testid="msg-16"]');
    expect(readRow?.offsetTop).toBe(100);

    // A page of ten older messages arrives ABOVE everything the reader can see.
    rerender(
      <Stream
        anchor="bottom"
        anchorOffset={40}
        onAnchoredChange={onAnchoredChange}
        rows={[...rowsFrom(1, 10), ...rowsFrom(11, 20)]}
      />,
    );

    await waitFor(() => {
      expect(viewport.scrollTop).toBe(300);
    });
    // The row is 200px further down the content, and the viewport moved by exactly that much, so
    // it is still at the top edge: no jump.
    expect(readRow?.offsetTop).toBe(300);
    expect(readRow!.offsetTop - viewport.scrollTop).toBe(0);
    // A prepend never re-pins.
    expect(onAnchoredChange).toHaveBeenLastCalledWith(false);
  });

  it("still compensates a prepend when the rows sit inside the documented single wrapper", async () => {
    const Wrapped = ({ rows }: { rows: readonly string[] }) => (
      <ScrollArea anchor="bottom" anchorOffset={40}>
        <div className="ui-test-wrapper">
          {rows.map((row) => (
            <div key={row} data-testid={row}>
              {row}
            </div>
          ))}
        </div>
      </ScrollArea>
    );
    const { container, rerender } = render(<Wrapped rows={rowsFrom(11, 20)} />);
    const viewport = viewportOf(container);

    readerScrollsTo(viewport, 100);
    rerender(<Wrapped rows={[...rowsFrom(1, 10), ...rowsFrom(11, 20)]} />);

    await waitFor(() => {
      expect(viewport.scrollTop).toBe(300);
    });
  });

  it("is a no-op when the content is shorter than the viewport", () => {
    const { container } = render(<Stream anchor="bottom" rows={rowsFrom(1, 2)} />);
    const viewport = viewportOf(container);

    expect(viewport.scrollHeight).toBeLessThan(viewport.clientHeight);
    expect(viewport.scrollTop).toBe(0);
  });

  it("honours anchorOffset over the token default", () => {
    const onAnchoredChange = vi.fn();
    const { container } = render(
      <Stream
        anchor="bottom"
        anchorOffset={0}
        onAnchoredChange={onAnchoredChange}
        rows={rowsFrom(1, 20)}
      />,
    );
    const viewport = viewportOf(container);

    // 10px off the bottom is still "following" under the 48px fallback band, but not under 0.
    readerScrollsTo(viewport, bottomOf(viewport) - 10);
    expect(onAnchoredChange).toHaveBeenCalledWith(false);
  });

  it("uses the token band (48px fallback) when anchorOffset is omitted", () => {
    const onAnchoredChange = vi.fn();
    const { container } = render(
      <Stream anchor="bottom" onAnchoredChange={onAnchoredChange} rows={rowsFrom(1, 20)} />,
    );
    const viewport = viewportOf(container);

    readerScrollsTo(viewport, bottomOf(viewport) - 40);
    expect(onAnchoredChange).not.toHaveBeenCalled();

    readerScrollsTo(viewport, bottomOf(viewport) - 60);
    expect(onAnchoredChange).toHaveBeenCalledWith(false);
  });

  it("never animates: the browser path asks for behavior 'instant'", async () => {
    const { container, rerender } = render(<Stream anchor="bottom" rows={rowsFrom(1, 20)} />);
    const viewport = viewportOf(container);
    const scrollTo = vi.fn((options: ScrollToOptions) => {
      viewport.scrollTop = options.top ?? 0;
    });
    Object.defineProperty(viewport, "scrollTo", { configurable: true, value: scrollTo });

    rerender(<Stream anchor="bottom" rows={rowsFrom(1, 30)} />);

    await waitFor(() => {
      expect(scrollTo).toHaveBeenCalled();
    });
    expect(scrollTo).toHaveBeenCalledWith({ top: 500, behavior: "instant" });
  });

  it("does not move focus when it scrolls", async () => {
    const { container, rerender } = render(
      <ScrollArea anchor="bottom">
        {rowsFrom(1, 20).map((row) => (
          <div key={row}>{row}</div>
        ))}
        <Button type="button">最新へ</Button>
      </ScrollArea>,
    );
    const viewport = viewportOf(container);
    const button = container.querySelector("button");
    act(() => button?.focus());
    expect(document.activeElement).toBe(button);

    rerender(
      <ScrollArea anchor="bottom">
        {rowsFrom(1, 30).map((row) => (
          <div key={row}>{row}</div>
        ))}
        <Button type="button">最新へ</Button>
      </ScrollArea>,
    );

    await waitFor(() => {
      expect(viewport.scrollTop).toBeGreaterThan(0);
    });
    expect(document.activeElement).toBe(button);
  });
});

describe("ScrollArea anchor='none' (the default)", () => {
  it("leaves the scroll offset alone when content arrives", async () => {
    const { container, rerender } = render(<Stream rows={rowsFrom(1, 20)} />);
    const viewport = viewportOf(container);

    expect(viewport.scrollTop).toBe(0);
    expect(viewport.dataset.anchor).toBe("none");

    rerender(<Stream rows={rowsFrom(1, 30)} />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(viewport.scrollTop).toBe(0);
  });
});

describe("ScrollArea viewportRef", () => {
  it("hands back the element that actually scrolls, not the root", () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const viewportRef = React.createRef<HTMLDivElement>();
    const { container } = render(
      <ScrollArea ref={rootRef} viewportRef={viewportRef}>
        <div>msg-1</div>
      </ScrollArea>,
    );

    expect(viewportRef.current).toBe(viewportOf(container));
    expect(viewportRef.current).not.toBe(rootRef.current);
    // The public handle replaces reaching for the Radix-internal attribute — but it is the same
    // node, so a consumer that already had that selector keeps identical behaviour.
    expect(viewportRef.current).toHaveAttribute("data-radix-scroll-area-viewport");
    expect(rootRef.current).toContainElement(viewportRef.current);
  });

  it("accepts a callback ref and clears it on unmount", () => {
    const seen: Array<HTMLDivElement | null> = [];
    const { unmount } = render(
      <ScrollArea
        viewportRef={(node) => {
          seen.push(node);
        }}
      >
        <div>msg-1</div>
      </ScrollArea>,
    );

    expect(seen[0]).toBeInstanceOf(HTMLElement);
    unmount();
    expect(seen.at(-1)).toBeNull();
  });

  it("keeps the viewport keyboard-reachable (WCAG 2.1.1) alongside the new handle", () => {
    const viewportRef = React.createRef<HTMLDivElement>();
    render(
      <ScrollArea anchor="bottom" viewportRef={viewportRef}>
        <div>msg-1</div>
      </ScrollArea>,
    );

    expect(viewportRef.current).toHaveAttribute("tabindex", "0");
  });
});

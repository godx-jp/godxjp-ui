import { act, render, screen } from "@testing-library/react";
import { useRef, type CSSProperties } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Table, TableBody, TableCell, TableRow } from "../../components/data-display/table";
import { useScrollsOnAxis } from "../hooks";

/**
 * gh#907 — the scroll region's tab stop must never lag the overflow it is for.
 *
 * WHAT WAS WRONG, and it is one frame wide. `useScrollsOnAxis` starts `true`, so the mount frame
 * always carries the stop; the report's stated mechanism ("between paint and that measurement")
 * cannot happen. The real window opens AFTER a correct removal: a box that fits loses the stop,
 * then something widens it again, and the `ResizeObserver` callback — which runs after layout and
 * BEFORE paint — batched its `setScrolls`, so the re-render landed in the NEXT frame. The frame in
 * between paints a genuinely scrollable box with no keyboard access, which is what axe reports as
 * `scrollable-region-focusable`.
 *
 * MEASURED in Chromium on /showcase/table-sticky-columns, by widening the viewport until the table
 * fits (stop correctly withheld) and narrowing it again, sampling from inside a `ResizeObserver`
 * registered AFTER the component's so it reads the same frame's final DOM:
 *
 *     without the fix   1 painted frame overflowing with no tab stop
 *     with the fix      0
 *
 * A `requestAnimationFrame` sampler reports 1 in BOTH, because rAF callbacks run BEFORE resize
 * observations in the frame — it reads the DOM the component has not updated yet. Trusting that
 * number would have said the fix does nothing. The sampler's position is part of the measurement.
 *
 * WHY THE DIRECTIONS ARE NOT SYMMETRIC. `hooks.ts` already ranks the two failures: "the
 * measurement may only ever REMOVE the stop, never withhold it on a guess", and an extra tab stop
 * is the lesser fault. So ADDING is flushed synchronously and REMOVING stays batched — one
 * synchronous render, only on the transition into overflow. This test pins that asymmetry, because
 * a well-meaning "simplify" that flushes both, or neither, silently restores the defect.
 */

const flushSync = vi.hoisted(() => vi.fn());

vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return { ...actual, flushSync: (fn: () => void) => (flushSync(), actual.flushSync(fn)) };
});

/** The observer the hook installs, captured so a test can drive one notification at a time. */
let notify: (() => void) | undefined;

/** The `loadingdone` listeners the hook installs on `document.fonts`, driven the same way. */
const fontListeners = new Set<() => void>();

class CapturingResizeObserver {
  constructor(callback: () => void) {
    notify = callback;
  }
  observe() {}
  disconnect() {
    notify = undefined;
  }
}

/**
 * Every box size is 0 in jsdom, and a box with BOTH client sizes 0 is "unlaid out", never "it
 * fits". All four are written every time: they are stubbed on the prototype, so a height left over
 * from one test would otherwise leak into the next.
 */
function layout({
  client,
  scroll,
  clientHeight = 0,
  scrollHeight = 0,
}: {
  client: number;
  scroll: number;
  clientHeight?: number;
  scrollHeight?: number;
}) {
  const box = { clientWidth: client, scrollWidth: scroll, clientHeight, scrollHeight };
  for (const [name, value] of Object.entries(box)) {
    Object.defineProperty(HTMLElement.prototype, name, { value, configurable: true });
  }
}

function Region({ style }: { style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const scrolls = useScrollsOnAxis(ref, true, "horizontal");
  return (
    <div
      ref={ref}
      data-testid="box"
      style={style}
      {...(scrolls ? { tabIndex: 0, role: "group" } : {})}
    />
  );
}

describe("the scroll region's tab stop (gh#907)", () => {
  beforeEach(() => {
    flushSync.mockClear();
    fontListeners.clear();
    globalThis.ResizeObserver = CapturingResizeObserver as unknown as typeof ResizeObserver;
    /* jsdom has no `document.fonts`; the hook guards with `?.` so it simply does nothing there.
     * A stub is installed so the font path can be DRIVEN rather than assumed absent. */
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: {
        ready: Promise.resolve(),
        addEventListener: (type: string, fn: () => void) => {
          if (type === "loadingdone") fontListeners.add(fn);
        },
        removeEventListener: (_type: string, fn: () => void) => fontListeners.delete(fn),
      },
    });
  });
  afterEach(() => {
    notify = undefined;
  });

  it("carries the stop on the mount frame, before anything has been measured", () => {
    // The state starts `true` on purpose: an unmeasured box is not evidence that nothing overflows.
    layout({ client: 0, scroll: 0 });
    render(<Region />);
    expect(screen.getByTestId("box")).toHaveAttribute("tabindex", "0");
  });

  it("drops the stop once the box is measured to fit — a stop that scrolls nothing is noise", () => {
    layout({ client: 800, scroll: 800 });
    render(<Region />);
    expect(screen.getByTestId("box")).not.toHaveAttribute("tabindex");
  });

  it("ADDS the stop back synchronously when overflow returns, so no frame paints without it", () => {
    layout({ client: 800, scroll: 800 });
    render(<Region />);
    expect(screen.getByTestId("box")).not.toHaveAttribute("tabindex");

    flushSync.mockClear();
    layout({ client: 375, scroll: 1200 }); // the viewport narrowed; the box overflows again
    notify?.();

    expect(screen.getByTestId("box")).toHaveAttribute("tabindex", "0");
    expect(flushSync, "the ADD must not wait for the next frame").toHaveBeenCalled();
  });

  it("does NOT flush the removal — the lesser failure stays cheap", () => {
    layout({ client: 375, scroll: 1200 });
    render(<Region />);
    expect(screen.getByTestId("box")).toHaveAttribute("tabindex", "0");

    flushSync.mockClear();
    layout({ client: 800, scroll: 800 }); // it fits now
    // `act` is REQUIRED here and deliberately absent from the test above: the removal is batched,
    // so nothing has re-rendered when the observer returns. That asymmetry IS the fix — the add
    // lands without act because it was flushed, the removal needs act because it was not.
    act(() => {
      notify?.();
    });

    expect(screen.getByTestId("box")).not.toHaveAttribute("tabindex");
    expect(flushSync, "a removal does not earn a synchronous render").not.toHaveBeenCalled();
  });

  it("ADDS the stop when a web face lands, with no resize at all (gh#907, reopened)", () => {
    /* THE THIRD WAY INTO OVERFLOW, and the one 30.0.2 missed. `[data-slot="table"]` is `w-full`
     * inside a `w-full` wrapper, so a font slice that re-lays-out the cell text changes NEITHER
     * observed box — the text overflows inside them and `scrollWidth` crosses `clientWidth` with
     * no resize to notice. Driven here with the ResizeObserver deliberately silent: if the fix
     * ever regresses to resize-only, `notify` is never called and this fails. */
    layout({ client: 800, scroll: 800 });
    render(<Region />);
    expect(screen.getByTestId("box")).not.toHaveAttribute("tabindex");

    flushSync.mockClear();
    layout({ client: 375, scroll: 1200 }); // a slice landed; the text is wider now
    for (const fn of fontListeners) fn();

    expect(screen.getByTestId("box")).toHaveAttribute("tabindex", "0");
    expect(flushSync, "a font-driven add is as urgent as a resize-driven one").toHaveBeenCalled();
  });

  it("keeps listening after the first batch — a sliced face arrives in many", () => {
    /* `fonts.ready` settles once, for the faces pending at that moment. The reporter's app loads
     * 729 unicode-range slices, which keep fetching as new glyphs are needed, so the slice that
     * widens the table can land long after that promise resolved. `loadingdone` is why a SECOND
     * batch still re-measures. */
    layout({ client: 800, scroll: 800 });
    render(<Region />);
    for (const fn of fontListeners) fn(); // batch one: still fits
    expect(screen.getByTestId("box")).not.toHaveAttribute("tabindex");

    layout({ client: 375, scroll: 1200 });
    for (const fn of fontListeners) fn(); // batch two: now it overflows
    expect(screen.getByTestId("box")).toHaveAttribute("tabindex", "0");
  });

  it("unsubscribes from `document.fonts` on unmount", () => {
    layout({ client: 800, scroll: 800 });
    const { unmount } = render(<Region />);
    expect(fontListeners.size).toBe(1);
    unmount();
    expect(fontListeners.size, "a listener per mounted region would leak").toBe(0);
  });

  it("does not flush on the FIRST measurement, which runs inside the effect", () => {
    // React warns when `flushSync` is called from a lifecycle, and it would buy nothing: the state
    // already starts `true`, so the mount frame carries the stop whatever the first read says.
    layout({ client: 375, scroll: 1200 });
    render(<Region />);
    expect(flushSync).not.toHaveBeenCalled();
  });
});

describe("the scroll region's tab stop on the axis the box REALLY scrolls on (gh#907, 31.0.3)", () => {
  /* REOPENED with a concrete DOM: a `Table` in a `[role="tabpanel"]` that was hidden when the table
   * mounted, settled at 317/309 with no `tabindex`, and axe `scrollable-region-focusable` failing.
   * The report's reading — "hidden measured 0/0, taken as FITS, never re-measured" — does not hold:
   * a box with both client sizes 0 counts as scrolling, and Chromium's ResizeObserver fires when a
   * `display:none` box is shown. Measured in Chromium against the unfixed hook, hidden by
   * `display:none`, `visibility`, `content-visibility`, a 0-height collapse, a 0-width box, off
   * screen, and the kit's own `Tabs` (`destroyOnHidden` both ways): the stop was present after
   * showing in every case. The first two tests pin that, so it stays true.
   *
   * What DID fail was the axis. axe's matcher only looks at a region whose overflow exceeds 13px
   * (`getScroll(node, 13)`), so 317/309 — and the report's other sample, 310/309 — cannot be what
   * axe flagged on the inline axis. It was the BLOCK axis: the wrapper is `overflow-auto`, a
   * height-constrained parent made the table taller than its box, and the hook only ever asked the
   * horizontal question. Chromium, a `Table` in a 160px flex column, unfixed: 309/309 × 204/160
   * and 310/309 × 204/160 → no stop, axe fails; fixed → stop, axe passes. */
  beforeEach(() => {
    globalThis.ResizeObserver = CapturingResizeObserver as unknown as typeof ResizeObserver;
  });
  afterEach(() => {
    notify = undefined;
    document.head.querySelector("style[data-test-907]")?.remove();
  });

  it("keeps the stop through a hidden mount — a 0×0 box is UNKNOWN, never proof it fits", () => {
    layout({ client: 0, scroll: 0 }); // `display:none` ancestor: the tabpanel is not selected
    render(<Region />);
    notify?.(); // the observer's first report of the hidden box
    expect(screen.getByTestId("box")).toHaveAttribute("tabindex", "0");

    layout({ client: 309, scroll: 317, clientHeight: 200, scrollHeight: 200 }); // tab selected
    notify?.();
    expect(screen.getByTestId("box")).toHaveAttribute("tabindex", "0");
  });

  it("still drops the stop when the shown box provably FITS (gh#821's contract)", () => {
    layout({ client: 0, scroll: 0 });
    render(<Region />);
    layout({ client: 309, scroll: 309, clientHeight: 200, scrollHeight: 200 });
    act(() => {
      notify?.();
    });
    expect(screen.getByTestId("box")).not.toHaveAttribute("tabindex");
  });

  it("ADDS the stop for BLOCK-axis overflow when the box's own `overflow` scrolls that axis", () => {
    layout({ client: 309, scroll: 309, clientHeight: 200, scrollHeight: 200 });
    // Longhands: jsdom does not expand the `overflow` shorthand into `overflowX`/`overflowY`.
    render(<Region style={{ overflowX: "auto", overflowY: "auto" }} />);
    expect(screen.getByTestId("box")).not.toHaveAttribute("tabindex");

    flushSync.mockClear();
    layout({ client: 309, scroll: 310, clientHeight: 160, scrollHeight: 204 }); // the report's 310/309
    notify?.();

    expect(screen.getByTestId("box")).toHaveAttribute("tabindex", "0");
    expect(flushSync, "a block-axis add is as urgent as an inline one").toHaveBeenCalled();
  });

  it("does NOT add it for an axis the box clips — `overflow-y: hidden` cannot be scrolled to", () => {
    layout({ client: 309, scroll: 309, clientHeight: 160, scrollHeight: 204 });
    render(<Region style={{ overflowX: "auto", overflowY: "hidden" }} />);
    expect(screen.getByTestId("box")).not.toHaveAttribute("tabindex");
  });

  it("covers the Table primitive's own `overflow-auto` wrapper (and so DataTable's preset)", () => {
    // jsdom loads no stylesheet; the one rule the wrapper's scroll axes come from is supplied, as
    // longhands because jsdom does not expand the `overflow` shorthand.
    const style = document.createElement("style");
    style.dataset.test907 = "";
    style.textContent = ".overflow-auto { overflow-x: auto; overflow-y: auto; }";
    document.head.append(style);

    layout({ client: 309, scroll: 309, clientHeight: 160, scrollHeight: 204 });
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>春のキャンペーンチラシ</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const wrapper = container.querySelector("div.overflow-auto");
    expect(wrapper).toHaveAttribute("tabindex", "0");
    expect(wrapper).toHaveAttribute("role", "group");
  });
});

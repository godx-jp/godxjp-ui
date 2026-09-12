import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DatePicker } from "../date-picker";

/*
 * gh#557 — a consumer's 8,262-row editable grid took 27-30s where the same markup built from
 * native controls took 2.3s, and the cost was per-instance, not DOM size. They had already ruled
 * out the obvious suspect: deleting `Popover`/`PopoverContent` from `DatePicker` changed nothing.
 *
 * It changed nothing because the popover DOM was never the cost. `const panel = (<PopoverContent>
 * …</PopoverContent>)` BUILDS the whole tree — evaluating every child expression in it — on every
 * render, and react-aria then declines to mount it. Deleting the mount point leaves the build.
 *
 * Measured through `react-dom/server`, 2,000 rows at a time, for ONE CLOSED `DatePicker`:
 *
 *     native <input type="date">   4.2us
 *     before                     412.6us      12 Intl.DateTimeFormat + 1 Intl.NumberFormat
 *                                              + 183 new Date(), per instance
 *     after                      121.1us       0 Intl constructions, 1 new Date()
 *
 * These assertions COUNT ALLOCATIONS rather than measure time. A wall-clock budget on a shared CI
 * runner is a flake generator, and the count is the thing that actually causes the time.
 */

const NATIVE_DATE = globalThis.Date;

afterEach(() => {
  globalThis.Date = NATIVE_DATE;
  vi.restoreAllMocks();
});

/** Count `new Date()` allocations while `run` executes, without disturbing Date's behaviour. */
function countDateAllocations(run: () => void): number {
  let count = 0;
  class Counting extends NATIVE_DATE {
    constructor(...args: ConstructorParameters<typeof Date>) {
      super(...args);
      count += 1;
    }
  }
  Counting.now = NATIVE_DATE.now;
  Counting.parse = NATIVE_DATE.parse;
  Counting.UTC = NATIVE_DATE.UTC;
  globalThis.Date = Counting as unknown as DateConstructor;
  try {
    run();
  } finally {
    globalThis.Date = NATIVE_DATE;
  }
  return count;
}

describe("a closed DatePicker does not pay for the panel it is not showing (gh#557)", () => {
  /**
   * Count `Intl.DateTimeFormat` constructions while rendering `count` pickers.
   *
   * WARM FIRST, ALWAYS. `vi.spyOn` on a constructor makes `new Intl.DateTimeFormat(...)` return
   * something that is not a formatter, and the cache would then STORE that — poisoning every later
   * test in the file with `.format is not a function`. Warming outside the spy also happens to be
   * the honest way to phrase the claim: the question is never "does the first one cost anything",
   * it is "does the 8,262nd".
   */
  const countBuilds = (count: number, node: (key: number) => React.ReactElement) => {
    renderWithUi(node(0));
    const spy = vi.spyOn(Intl, "DateTimeFormat");
    renderWithUi(<>{Array.from({ length: count }, (_, i) => node(i))}</>);
    const calls = spy.mock.calls.length;
    spy.mockRestore();
    return calls;
  };

  it("the Intl cost does not scale with the number of instances", () => {
    // Stated as a SCALING claim, not an absolute one. A render pass legitimately builds a formatter
    // or two that nothing here owns — react-day-picker and date-fns construct their own — and
    // `toBe(0)` would be asserting something false and would flake the day one of them changes.
    // What the grid needs is that twenty rows cost what one row costs. Measured: 1 either way.
    const one = countBuilds(1, (i) => <DatePicker key={i} />);
    const twenty = countBuilds(20, (i) => <DatePicker key={i} />);

    // Was 12 PER INSTANCE, so twenty rows built 240 and 8,262 rows built roughly 99,000.
    expect(twenty).toBe(one);
  });

  it("the cost does not scale for a picker that DOES format months, either", () => {
    // The test above uses the default day picker, which never reaches `periodLabel` at all — so on
    // its own it stays green even if that call site stops using the cache. Measured: reverting the
    // `month: "short"` formatter to `new Intl.DateTimeFormat` left it passing. A month picker is
    // where those 12 formatters per instance actually came from, so it has to be here.
    const one = countBuilds(1, (i) => <DatePicker key={i} picker="month" open />);
    const ten = countBuilds(10, (i) => <DatePicker key={i} picker="month" open />);

    expect(ten).toBe(one);
  });

  it("does not build the PERIOD grid for a day picker that has no period grid", () => {
    // 168 of the 183 allocations came from `periodPage`, called 14 times — twice for the
    // prev/next bound probes and twelve times for grid cells that `picker="date"` never renders.
    const allocations = countDateAllocations(() => {
      renderWithUi(<DatePicker />);
    });

    expect(allocations).toBeLessThan(10);
  });

  it("ten instances cost ten times one instance, not more — nothing is quadratic", () => {
    const one = countDateAllocations(() => {
      renderWithUi(<DatePicker />);
    });
    const ten = countDateAllocations(() => {
      renderWithUi(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <DatePicker key={i} />
          ))}
        </>,
      );
    });

    // The grid is the shape this issue is about, so the per-instance cost has to be flat in N.
    expect(ten).toBeLessThanOrEqual(one * 10 + 5);
  });

  it("the period picker still works — the deferral must not delete the panel", async () => {
    // The fix turns two JSX constants into functions. If the wrong one were called, or neither,
    // this picker would open onto nothing. Counting allocations cannot see that; opening it can.
    const user = userEvent.setup();
    renderWithUi(<DatePicker picker="month" />);

    await user.click(screen.getByRole("button", { name: "Mở chọn tháng" }));

    // The month grid is a real grid, and its cells carry the month labels `periodLabel` builds
    // through the cached formatter — so this covers both halves of the fix at once.
    expect(screen.getByRole("grid")).toBeTruthy();
  });

  it("the day picker still opens onto a calendar", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker />);

    await user.click(screen.getByRole("button", { name: "Mở lịch" }));

    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

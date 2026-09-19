import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderWithUi, screen, userEvent } from "@/test/render";

import { Select } from "../select";
import type { SearchSelectLoadResultProp } from "../search-select";

/**
 * A data-driven Select must never open a blank popover when it has zero options,
 * for BOTH the static `options` path and the async `loadOptions` path.
 *
 *  - static `options=[]`      → nothing to pick → the trigger is disabled (can't open a blank list).
 *  - async, resolves empty    → a localized "no results" affordance (never blank).
 *  - async, REJECTS           → a DISTINCT error affordance (not a false "no results", not a
 *                               leaked unhandled rejection).
 */
afterEach(async () => {
  // Radix FocusScope schedules its unmount autofocus event. Let that task drain while jsdom's
  // Event constructor is still alive; otherwise a large full-suite run can report a false
  // unhandled dispatch after this worker environment has already been torn down.
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  vi.restoreAllMocks();
});

describe("Select empty / async states (#138)", () => {
  it("disables the trigger for a static empty options list (never opens a blank popover)", () => {
    renderWithUi(<Select options={[]} placeholder="選択" data-testid="s" />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("disables a searchable static empty list too (no async loader ⇒ nothing to search)", () => {
    renderWithUi(<Select showSearch options={[]} placeholder="選択" data-testid="s" />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("async loadOptions resolving empty shows an empty affordance, not a blank panel", async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn(async () => ({ options: [], hasMore: false }));
    renderWithUi(
      <Select
        loadOptions={loadOptions}
        emptyMessage="no-options-here"
        placeholder="選択"
        data-testid="s"
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).not.toBeDisabled(); // an async Select opens to load/search
    await user.click(trigger);
    // The affordance is rendered as a disabled option row inside the listbox (never blank).
    const empty = await screen.findByText("no-options-here");
    expect(empty).toBeInTheDocument();
    expect(empty).toHaveAttribute("role", "option");
    expect(empty).toHaveAttribute("aria-disabled", "true");
    expect(loadOptions).toHaveBeenCalled();
  });

  it("async loadOptions that REJECTS shows a distinct error affordance (no unhandled rejection)", async () => {
    const user = userEvent.setup();
    const onUnhandled = vi.fn();
    process.on("unhandledRejection", onUnhandled);
    const loadOptions = vi.fn(async () => {
      throw new Error("network down");
    });
    renderWithUi(
      <Select
        loadOptions={loadOptions}
        errorMessage="could-not-load"
        emptyMessage="no-options-here"
        placeholder="選択"
        data-testid="s"
      />,
    );
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    const error = await screen.findByText("could-not-load");
    expect(error).toBeInTheDocument();
    expect(error).toHaveAttribute("role", "option");
    expect(error).toHaveAttribute("aria-disabled", "true");
    // The error state is DISTINCT — it must not masquerade as the empty state.
    expect(screen.queryByText("no-options-here")).not.toBeInTheDocument();
    // The trigger stays operable (no crash, no focus trap on nothing).
    expect(trigger).not.toBeDisabled();

    await Promise.resolve();
    expect(onUnhandled).not.toHaveBeenCalled();
    process.off("unhandledRejection", onUnhandled);
  });

  it("recovers: a rejected load followed by a successful reload shows options, clearing the error", async () => {
    const user = userEvent.setup();
    let attempt = 0;
    const loadOptions = vi.fn(async () => {
      attempt += 1;
      if (attempt === 1) throw new Error("transient");
      return { options: [{ value: "a", label: "選択肢A" }], hasMore: false };
    });
    renderWithUi(
      <Select
        loadOptions={loadOptions}
        errorMessage="could-not-load"
        placeholder="選択"
        data-testid="s"
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByText("could-not-load")).toBeInTheDocument();

    // Typing re-queries — the debounced reload succeeds and the error clears.
    await user.keyboard("A");

    /*
     * gh#748: this assertion failed ONCE on CI, between two green runs, and has never
     * reproduced — 0/15 in isolation, 0/8 under CPU contention, 166/166 across three full runs
     * of CI's own shard command. Two causes produce the identical "Unable to find an element
     * with the text" message, and they need opposite fixes:
     *
     *   loadOptions called 1× — the 250 ms debounce (`DEBOUNCE_MS`, search-select.tsx) never
     *                           elapsed, so the reload was never even requested
     *   loadOptions called 2× — the reload ran and its result did not reach the DOM in time
     *
     * The bare failure cannot tell them apart, which is why gh#748 is open with no fix: a
     * guessed remedy (raising the timeout) would bury whichever one it is. So the call count
     * travels WITH the failure. Nothing here changes what the test asserts.
     */
    try {
      expect(await screen.findByText("選択肢A")).toBeInTheDocument();
    } catch (error) {
      throw new Error(
        `gh#748 diagnostic — loadOptions was called ${loadOptions.mock.calls.length}×. ` +
          "1× means the debounced reload never fired; 2× means it fired and did not render. " +
          `Rendered text: ${JSON.stringify(document.body.textContent?.slice(0, 200))}`,
        // Keep the original — its stack points at the matcher, which this message does not.
        { cause: error },
      );
    }

    expect(screen.queryByText("could-not-load")).not.toBeInTheDocument();
  });
});

describe("Select async reload — every reject/reload interleaving (#748)", () => {
  type Deferred = {
    resolve: (result: SearchSelectLoadResultProp) => void;
    reject: (reason: unknown) => void;
  };

  function makeLoader() {
    const pending: Deferred[] = [];
    const loadOptions = vi.fn(
      (_params: { query: string; page: number }) =>
        new Promise<SearchSelectLoadResultProp>((resolve, reject) => {
          pending.push({ resolve, reject });
        }),
    );
    return { pending, loadOptions };
  }

  const panel = (
    loadOptions: ReturnType<typeof makeLoader>["loadOptions"],
    open: boolean,
    search: string,
  ) => (
    <Select
      open={open}
      search={search}
      loadOptions={loadOptions}
      errorMessage="could-not-load"
      emptyMessage="no-options-here"
      loadingMessage="loading-now"
      placeholder="選択"
      data-testid="s"
    />
  );

  async function flush() {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  /** Step past the 250 ms debounce so a changed query issues its load. */
  async function settleDebounce() {
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    await flush();
  }

  function panelText() {
    return document.querySelector('[role="listbox"]')?.textContent ?? "<no listbox>";
  }

  /** Mount CLOSED, then open — exactly what a click does, and one request per open. */
  async function openPanel() {
    const { pending, loadOptions } = makeLoader();
    const view = renderWithUi(panel(loadOptions, false, ""));
    await flush();
    view.rerender(panel(loadOptions, true, ""));
    await flush();
    return { pending, loadOptions, view };
  }

  const recovered = { options: [{ value: "a", label: "選択肢A" }], hasMore: false };

  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    // This file's own afterEach awaits a real `setTimeout(0)`; leave the clock real for it.
    vi.useRealTimers();
  });

  it("opening issues exactly ONE request (a duplicate would race with itself)", async () => {
    const { pending, loadOptions } = await openPanel();
    expect(loadOptions).toHaveBeenCalledTimes(1);
    expect(pending).toHaveLength(1);
  });

  it("the rejection settles FIRST, then the reload starts and resolves", async () => {
    const { pending, loadOptions, view } = await openPanel();
    pending[0]!.reject(new Error("transient"));
    await flush();
    expect(panelText()).toContain("could-not-load");

    view.rerender(panel(loadOptions, true, "A"));
    await settleDebounce();
    expect(pending).toHaveLength(2);
    pending[1]!.resolve(recovered);
    await flush();
    expect(panelText()).toContain("選択肢A");
    expect(panelText()).not.toContain("could-not-load");
  });

  it("the reload STARTS first, the stale rejection lands next, the reload resolves last", async () => {
    const { pending, loadOptions, view } = await openPanel();
    view.rerender(panel(loadOptions, true, "A"));
    await settleDebounce();
    expect(pending).toHaveLength(2);

    pending[0]!.reject(new Error("transient")); // superseded — must not show the error
    await flush();
    expect(panelText()).not.toContain("could-not-load");

    pending[1]!.resolve(recovered);
    await flush();
    expect(panelText()).toContain("選択肢A");
    expect(panelText()).not.toContain("could-not-load");
  });

  it("the reload RESOLVES first and the stale rejection lands LAST (must not blank the options)", async () => {
    const { pending, loadOptions, view } = await openPanel();
    view.rerender(panel(loadOptions, true, "A"));
    await settleDebounce();

    pending[1]!.resolve(recovered);
    await flush();
    expect(panelText()).toContain("選択肢A");

    pending[0]!.reject(new Error("transient"));
    await flush();
    expect(panelText()).toContain("選択肢A");
    expect(panelText()).not.toContain("could-not-load");
  });

  it("two reloads in flight, results arriving OUT OF ORDER — the newest query wins", async () => {
    const { pending, loadOptions, view } = await openPanel();
    pending[0]!.reject(new Error("transient"));
    await flush();

    view.rerender(panel(loadOptions, true, "A"));
    await settleDebounce();
    view.rerender(panel(loadOptions, true, "AB"));
    await settleDebounce();
    expect(pending).toHaveLength(3);

    pending[2]!.resolve({ options: [{ value: "ab", label: "AB-row" }], hasMore: false });
    await flush();
    pending[1]!.resolve({ options: [{ value: "a", label: "A-row" }], hasMore: false });
    await flush();
    expect(panelText()).toContain("AB-row");
    expect(panelText()).not.toContain("A-row");
  });

  it("reject → reload → reject again → reload: the error tracks the NEWEST outcome", async () => {
    const { pending, loadOptions, view } = await openPanel();
    pending[0]!.reject(new Error("t1"));
    await flush();
    expect(panelText()).toContain("could-not-load");

    view.rerender(panel(loadOptions, true, "A"));
    await settleDebounce();
    pending[1]!.reject(new Error("t2"));
    await flush();
    expect(panelText()).toContain("could-not-load");

    view.rerender(panel(loadOptions, true, "AB"));
    await settleDebounce();
    pending[2]!.resolve(recovered);
    await flush();
    expect(panelText()).toContain("選択肢A");
    expect(panelText()).not.toContain("could-not-load");
  });

  it("closing mid-reload then reopening reloads cleanly", async () => {
    const { pending, loadOptions, view } = await openPanel();
    pending[0]!.reject(new Error("t1"));
    await flush();

    view.rerender(panel(loadOptions, true, "A"));
    await settleDebounce();
    view.rerender(panel(loadOptions, false, "A")); // closed while in flight
    await flush();
    pending[1]!.resolve(recovered);
    await flush();

    view.rerender(panel(loadOptions, true, "A")); // reopened
    await flush();
    expect(pending).toHaveLength(3);
    pending[2]!.resolve(recovered);
    await flush();
    expect(panelText()).toContain("選択肢A");
    expect(panelText()).not.toContain("could-not-load");
  });
});

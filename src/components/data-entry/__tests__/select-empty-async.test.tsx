import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Select } from "../select";

/**
 * Issue #138 — a data-driven Select must never open a blank popover when it has zero options,
 * for BOTH the static `options` path and the async `loadOptions` path.
 *
 *  - static `options=[]`      → nothing to pick → the trigger is disabled (can't open a blank list).
 *  - async, resolves empty    → a localized "no results" affordance (never blank).
 *  - async, REJECTS           → a DISTINCT error affordance (not a false "no results", not a
 *                               leaked unhandled rejection).
 */
afterEach(() => vi.restoreAllMocks());

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
    expect(await screen.findByText("選択肢A")).toBeInTheDocument();
    expect(screen.queryByText("could-not-load")).not.toBeInTheDocument();
  });
});

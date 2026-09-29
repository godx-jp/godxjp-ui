import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { act, renderWithUi, screen, userEvent, waitFor, within } from "@/test/render";
import { SearchSelect } from "../search-select";

/*
 * gh#1071 — a fresh page re-chooses the active row ONCE. When `loadOptions` resolves with the
 * very array it returned before (a cached page), the drawn list does not change; the pending
 * "re-choose" must not linger and fire on a later, unrelated re-render (a held value toggled).
 */

/** A server cache: every query answers with the SAME array reference. */
const CACHED = [
  { value: "bug", label: "bug" },
  { value: "feature", label: "feature" },
  { value: "docs", label: "docs" },
];

const listRows = () => within(screen.getByRole("listbox")).getAllByRole("option");
const activeRow = () => {
  const id = screen.getByRole("textbox").getAttribute("aria-activedescendant");
  return id ? document.getElementById(id) : null;
};

/** Lets the test change the controlled value from outside, as a parent re-render would. */
let setHeld: (next: string[]) => void = () => undefined;

function Harness({
  loadOptions,
}: {
  loadOptions: (args: { query: string; page: number }) => Promise<{
    options: typeof CACHED;
    hasMore: boolean;
  }>;
}) {
  const [value, setValue] = React.useState<string[]>([]);
  setHeld = setValue;
  return (
    <SearchSelect
      aria-label="タグ"
      mode="tags"
      value={value}
      onValueChange={() => undefined}
      loadOptions={loadOptions}
    />
  );
}

/** Open, type `text`, and wait until the debounced fetch for it has landed. */
async function openAndType(
  user: ReturnType<typeof userEvent.setup>,
  loadOptions: ReturnType<typeof vi.fn>,
  text: string,
) {
  await user.click(screen.getByRole("combobox"));
  await waitFor(() => expect(listRows().length).toBeGreaterThan(0));
  await user.type(screen.getByRole("textbox"), text);
  await waitFor(() =>
    expect(loadOptions).toHaveBeenCalledWith(expect.objectContaining({ query: text })),
  );
  await act(async () => {
    await Promise.resolve();
  });
}

describe("gh#1071 — a cached (same-reference) page does not leave a pending active-row reset", () => {
  it("toggling a held value after ArrowDown keeps the active row where the user moved it", async () => {
    const loadOptions = vi.fn(async () => ({ options: CACHED, hasMore: false }));
    renderWithUi(<Harness loadOptions={loadOptions} />);
    const user = userEvent.setup();
    await openAndType(user, loadOptions, "zz");

    // create row "zz" first and active; move down to "bug".
    expect(activeRow()).toBe(listRows()[0]);
    await user.keyboard("{ArrowDown}");
    expect(activeRow()).toBe(listRows()[1]);
    expect(activeRow()).toHaveTextContent("bug");

    // An unrelated change: the parent adds a held value (filtered out by "zz", so not drawn).
    act(() => setHeld(["held"]));
    expect(activeRow()).toHaveTextContent("bug");
  });

  it("a genuinely new typed text still re-activates the first row", async () => {
    const loadOptions = vi.fn(async () => ({ options: CACHED, hasMore: false }));
    renderWithUi(<Harness loadOptions={loadOptions} />);
    const user = userEvent.setup();
    await openAndType(user, loadOptions, "zz");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(activeRow()).toHaveTextContent("feature");

    await user.type(screen.getByRole("textbox"), "q");
    await waitFor(() =>
      expect(loadOptions).toHaveBeenCalledWith(expect.objectContaining({ query: "zzq" })),
    );
    expect(activeRow()).toBe(listRows()[0]);
    expect(activeRow()).toHaveTextContent("zzq");
  });

  it("a fresh page with a NEW list still re-activates its first row", async () => {
    let call = 0;
    const loadOptions = vi.fn(async () => {
      call += 1;
      return { options: call === 1 ? CACHED : [...CACHED].reverse(), hasMore: false };
    });
    renderWithUi(<SearchSelect aria-label="タグ" loadOptions={loadOptions} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await waitFor(() => expect(listRows()[0]).toHaveTextContent("bug"));
    await user.keyboard("{ArrowDown}");
    expect(activeRow()).toHaveTextContent("feature");

    await user.type(screen.getByRole("textbox"), "o");
    await waitFor(() => expect(listRows()[0]).toHaveTextContent("docs"));
    expect(activeRow()).toBe(listRows()[0]);
  });
});

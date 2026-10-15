import { describe, expect, it, vi } from "vitest";

import { act, fireEvent, renderWithUi, screen, userEvent, waitFor, within } from "@/test/render";
import { Select } from "../select";

/*
 * Enter right after typing in a static `options` list must commit the first row MATCHING what is
 * typed. The static filter used to run behind the 250ms search debounce (plus an async load), so
 * an Enter inside that window committed row 0 of the UNFILTERED list — on qc.godx.jp, typing
 * "Máy xay" + Enter picked "Máy pha espresso".
 */

const EQUIPMENT = [
  { value: "espresso", label: "Máy pha espresso" },
  { value: "kettle", label: "Ấm đun nước" },
  { value: "grinder", label: "Máy xay cà phê" },
  { value: "scale", label: "Cân điện tử" },
];

async function openSearch(onValueChange: (value: string) => void) {
  renderWithUi(
    <Select aria-label="Thiết bị" showSearch options={EQUIPMENT} onValueChange={onValueChange} />,
  );
  await userEvent.setup().click(screen.getByRole("combobox"));
  await waitFor(() =>
    expect(within(screen.getByRole("listbox")).getAllByRole("option")).toHaveLength(4),
  );
  return screen.getByRole("textbox");
}

/**
 * Type, then press Enter synchronously: React commits each event (as a browser does between two
 * key events), but no timer fires and no promise settles in between — the debounce never ends.
 */
function typeThenEnter(box: HTMLElement, text: string) {
  act(() => {
    fireEvent.change(box, { target: { value: text } });
  });
  act(() => {
    fireEvent.keyDown(box, { key: "Enter" });
  });
}

describe("Select showSearch — Enter acts on the list for the CURRENT query", () => {
  it("commits the first match of the typed text, not row 0 of the unfiltered list", async () => {
    const onValueChange = vi.fn();
    const box = await openSearch(onValueChange);
    typeThenEnter(box, "Máy xay");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]?.[0]).toBe("grinder");
  });

  it("commits nothing when the typed text matches no option", async () => {
    const onValueChange = vi.fn();
    const box = await openSearch(onValueChange);
    typeThenEnter(box, "zzz");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

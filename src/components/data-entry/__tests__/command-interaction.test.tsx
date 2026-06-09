import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../command";

/**
 * Behavioral interaction tests for the Command (cmdk) palette.
 * Codifies real runtime behavior so future runs need NO browser MCP:
 * - typing into the search input STICKS (controlled value not frozen)
 * - typing FILTERS the visible options live
 * - ArrowDown/ArrowUp move the active option (aria-selected)
 * - Enter fires onSelect for the active item
 * - clicking an item fires onSelect
 * - empty state shows when no item matches
 * - disabled item cannot be selected
 *
 * cmdk a11y contract (v1.1.1): input role=combobox, list role=listbox,
 * item role=option with aria-selected on the active one.
 */

function Palette({
  onSelect,
  withDisabled = false,
  filter = true,
}: {
  onSelect?: (value: string) => void;
  withDisabled?: boolean;
  filter?: boolean;
}) {
  const [search, setSearch] = React.useState("");
  return (
    <Command shouldFilter={filter}>
      <CommandInput
        placeholder="検索…"
        aria-label="command-search"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>該当なし</CommandEmpty>
        <CommandGroup heading="果物">
          <CommandItem value="apple" onSelect={onSelect}>
            りんご
          </CommandItem>
          <CommandItem value="banana" onSelect={onSelect}>
            バナナ
          </CommandItem>
          <CommandItem value="cherry" disabled={withDisabled} onSelect={onSelect}>
            さくらんぼ
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

describe("Command — interaction behavior", () => {
  it("input is a combobox; typing sticks (controlled value not frozen)", async () => {
    const user = userEvent.setup();
    renderWithUi(<Palette />);
    const input = screen.getByRole("combobox");

    await user.type(input, "りんご");
    expect(input).toHaveValue("りんご");
  });

  it("typing filters the visible options live", async () => {
    const user = userEvent.setup();
    renderWithUi(<Palette />);
    const input = screen.getByRole("combobox");

    // All three options visible initially.
    expect(screen.getAllByRole("option")).toHaveLength(3);

    await user.type(input, "ban");
    await waitFor(() => {
      const opts = screen.getAllByRole("option");
      expect(opts).toHaveLength(1);
      expect(opts[0]).toHaveTextContent("バナナ");
    });
  });

  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    renderWithUi(<Palette />);
    const input = screen.getByRole("combobox");

    await user.type(input, "zzzzz");
    await waitFor(() => {
      expect(screen.getByText("該当なし")).toBeInTheDocument();
      expect(screen.queryAllByRole("option")).toHaveLength(0);
    });
  });

  it("ArrowDown / ArrowUp move the active option (aria-selected)", async () => {
    const user = userEvent.setup();
    renderWithUi(<Palette />);
    const input = screen.getByRole("combobox");
    input.focus();

    // cmdk auto-selects the first item.
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");
    });

    await user.keyboard("{ArrowUp}");
    await waitFor(() => {
      expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true");
    });
  });

  it("Enter selects the active option and fires onSelect with its value", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(<Palette onSelect={onSelect} />);
    const input = screen.getByRole("combobox");
    input.focus();

    // First item active by default → move to second → Enter.
    await user.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith("banana");
    });
  });

  it("clicking an item fires onSelect with its value", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(<Palette onSelect={onSelect} />);

    await user.click(screen.getByRole("option", { name: "りんご" }));
    expect(onSelect).toHaveBeenCalledWith("apple");
  });

  it("a disabled item is not activated and does not fire onSelect on click", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(<Palette onSelect={onSelect} withDisabled />);

    const disabled = screen.getByRole("option", { name: "さくらんぼ" });
    expect(disabled).toHaveAttribute("aria-disabled", "true");

    await user.click(disabled);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor, within } from "@/test/render";

import { CommandPalette } from "../command-palette";
import messages from "../../../i18n/messages/vi.json";

// renderWithUi runs in `vi`; read the strings from the catalog rather than hard-coding them.
const RECENT = messages.dataEntry.commandPalette.recent;
const CLEAR = messages.dataEntry.commandPalette.clearRecent;

/**
 * gh#1249 — recent queries are a consumer-owned seam: the palette renders them as the first group
 * while the query is empty, with a trailing "Clear recent searches" row, and never touches storage.
 */
const groups = [
  {
    id: "pages",
    label: "Pages",
    items: [
      { id: "/a", label: "Alpha" },
      { id: "/b", label: "Beta" },
    ],
  },
];
const labels = {
  open: "Open",
  title: "Palette",
  description: "Find",
  placeholder: "Search",
  empty: "None",
};

function setup(
  props: Partial<React.ComponentProps<typeof CommandPalette>> & {
    items?: string[];
  } = {},
) {
  const onRecentSelect = vi.fn();
  const onClear = vi.fn();
  const onOpenChange = vi.fn();
  const { items = ["invoice 2024", "tanaka"], ...rest } = props;
  renderWithUi(
    <CommandPalette
      groups={groups}
      labels={labels}
      onSelect={vi.fn()}
      defaultOpen
      trigger={null}
      onOpenChange={onOpenChange}
      recent={{ items, onSelect: onRecentSelect, onClear }}
      {...rest}
    />,
  );
  return { onRecentSelect, onClear, onOpenChange, user: userEvent.setup() };
}

const recentGroup = () => screen.queryByRole("group", { name: RECENT });

describe("CommandPalette recent (gh#1249)", () => {
  it("empty query shows the recent group FIRST with one row per item, the heading and the clear row", () => {
    setup();
    const group = recentGroup();
    expect(group).not.toBeNull();
    const rows = within(group!).getAllByRole("option");
    expect(rows.map((row) => row.textContent)).toEqual(["invoice 2024", "tanaka", CLEAR]);
    // First group in the listbox.
    expect(screen.getAllByRole("group")[0]).toBe(group);
  });

  it("typing hides the group; clearing the query brings it back", async () => {
    const { user } = setup();
    const input = screen.getByRole("combobox");
    await user.type(input, "al");
    expect(recentGroup()).toBeNull();
    await user.clear(input);
    expect(recentGroup()).not.toBeNull();
  });

  it("selecting a row calls onSelect with the string and closes", async () => {
    const { user, onRecentSelect, onOpenChange } = setup();
    await user.click(screen.getByRole("option", { name: "tanaka" }));
    expect(onRecentSelect).toHaveBeenCalledWith("tanaka");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("choosing the clear row calls onClear and keeps the palette open", async () => {
    const { user, onClear, onRecentSelect } = setup();
    await user.click(screen.getByRole("option", { name: CLEAR }));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onRecentSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders duplicates exactly as given (the consumer de-duplicates)", () => {
    setup({ items: ["tanaka", "tanaka"] });
    expect(within(recentGroup()!).getAllByRole("option", { name: "tanaka" })).toHaveLength(2);
  });

  it("an empty items list renders no group", () => {
    setup({ items: [] });
    expect(recentGroup()).toBeNull();
  });

  it("server-side mode: recents with no groups do not also render the empty state", () => {
    setup({ groups: [], shouldFilter: false });
    expect(recentGroup()).not.toBeNull();
    expect(screen.queryByText("None")).toBeNull();
  });

  it("a custom label replaces the default heading", () => {
    setup({ recent: { items: ["x"], onSelect: vi.fn(), onClear: vi.fn(), label: "History" } });
    expect(screen.getByRole("group", { name: "History" })).toBeInTheDocument();
  });

  it("never touches localStorage while rendering, selecting or clearing", async () => {
    const { user } = setup();
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    await user.click(screen.getByRole("option", { name: CLEAR }));
    await user.click(screen.getByRole("option", { name: "tanaka" }));
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    getItem.mockRestore();
    setItem.mockRestore();
  });
});

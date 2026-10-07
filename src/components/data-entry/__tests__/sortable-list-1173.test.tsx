import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { SortableList } from "../sortable-list";
import { renderWithUi, screen, userEvent } from "@/test/render";

/**
 * gh#1173 — SortableList's keyboard path (WCAG 2.5.7: every drag has a single-pointer-free
 * alternative): Space lifts, arrows / Home / End move, Space drops, Esc cancels, and every step is
 * spoken in a polite live region. jsdom has no layout, so the pointer drag is in the browser test.
 */
const ITEMS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

/** English strings, so the assertions read the announcements a person hears. */
const en = (ui: React.ReactElement) =>
  renderWithUi(
    <AppProvider persist={false} defaultLocale="en">
      {ui}
    </AppProvider>,
  );

const labels = () =>
  screen
    .getAllByRole("listitem")
    .map((li) => li.querySelector(".ui-sortable-list-content")?.textContent);
const status = () => screen.getByRole("status").textContent;
const grip = (label: string) => screen.getByRole("button", { name: `Reorder ${label}` });

describe("SortableList keyboard path (gh#1173)", () => {
  it("lifts with Space, moves with the arrows, drops with Space — one onValueChange per drop", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    en(<SortableList aria-label="Widgets" items={ITEMS} onValueChange={onValueChange} />);
    expect(screen.getByRole("list", { name: "Widgets" })).toBeInTheDocument();

    grip("Alpha").focus();
    await user.keyboard(" ");
    expect(grip("Alpha")).toHaveAttribute("aria-pressed", "true");
    expect(status()).toBe("Picked up Alpha. Position 1 of 3.");

    await user.keyboard("{ArrowDown}");
    expect(labels()).toEqual(["Beta", "Alpha", "Gamma"]);
    expect(status()).toBe("Alpha: position 2 of 3.");
    // The held grip keeps focus while React moves its node.
    expect(grip("Alpha")).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(labels()).toEqual(["Beta", "Gamma", "Alpha"]);
    expect(onValueChange).not.toHaveBeenCalled(); // previews are not commits

    await user.keyboard(" ");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(["b", "c", "a"]);
    expect(status()).toBe("Dropped Alpha at position 3 of 3.");
    expect(grip("Alpha")).toHaveAttribute("aria-pressed", "false");
    expect(labels()).toEqual(["Beta", "Gamma", "Alpha"]);
  });

  it("Home / End jump, and the arrows stop at the ends", async () => {
    const user = userEvent.setup();
    en(<SortableList aria-label="Widgets" items={ITEMS} />);
    grip("Gamma").focus();
    await user.keyboard(" {Home}");
    expect(labels()).toEqual(["Gamma", "Alpha", "Beta"]);
    await user.keyboard("{ArrowUp}{ArrowLeft}");
    expect(labels()).toEqual(["Gamma", "Alpha", "Beta"]);
    await user.keyboard("{End} ");
    expect(labels()).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("Escape cancels: the order returns and nothing is reported", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    en(<SortableList aria-label="Widgets" items={ITEMS} onValueChange={onValueChange} />);
    grip("Alpha").focus();
    await user.keyboard(" {ArrowDown}{ArrowDown}{Escape}");
    expect(labels()).toEqual(["Alpha", "Beta", "Gamma"]);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(status()).toBe("Move cancelled. Alpha is back at position 1 of 3.");
  });

  it("controlled: renders the value's order and does not move until the parent says so", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    en(
      <SortableList
        aria-label="Widgets"
        items={ITEMS}
        value={["c", "b", "a"]}
        onValueChange={onValueChange}
      />,
    );
    expect(labels()).toEqual(["Gamma", "Beta", "Alpha"]);
    grip("Gamma").focus();
    await user.keyboard(" {ArrowDown} ");
    expect(onValueChange).toHaveBeenCalledWith(["b", "c", "a"]);
    // The parent did not apply it, so the controlled order stands.
    expect(labels()).toEqual(["Gamma", "Beta", "Alpha"]);
  });

  it("reconciles: unknown keys drop out, new items join at the end", () => {
    en(<SortableList aria-label="Widgets" items={ITEMS} defaultValue={["c", "zzz", "a"]} />);
    expect(labels()).toEqual(["Gamma", "Alpha", "Beta"]);
  });

  it("a disabled item's grip is inert; a disabled list has no live grip", () => {
    const { unmount } = en(
      <SortableList
        aria-label="Widgets"
        items={[ITEMS[0]!, { ...ITEMS[1]!, disabled: true }, ITEMS[2]!]}
      />,
    );
    expect(grip("Beta")).toBeDisabled();
    expect(grip("Alpha")).toBeEnabled();
    unmount();
    en(<SortableList aria-label="Widgets" items={ITEMS} disabled />);
    for (const label of ["Alpha", "Beta", "Gamma"]) expect(grip(label)).toBeDisabled();
  });

  it("the grip names the item and points at the keyboard hint", () => {
    en(<SortableList aria-label="Widgets" items={ITEMS} />);
    const hint = document.getElementById(grip("Beta").getAttribute("aria-describedby")!);
    expect(hint?.textContent).toMatch(/Space to pick up/);
  });
});

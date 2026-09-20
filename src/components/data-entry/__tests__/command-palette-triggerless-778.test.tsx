import { describe, expect, it } from "vitest";

import { CommandPalette } from "../command-palette";
import { renderWithUi, screen, userEvent } from "@/test/render";

/**
 * gh#778 — `trigger={null}` means NO trigger.
 *
 * The defect was `trigger ?? <default/>`: `??` falls back on `null` as well as `undefined`, so
 * the one spelling a consumer reaches for to REMOVE the trigger rendered the default Button
 * instead. The only working spelling was `trigger={<></>}` — an empty fragment in the slot.
 *
 * These cases pin the DISTINCTION, because collapsing it is exactly what regressed: omitted and
 * null must not behave alike.
 */
const labels = {
  open: "Search screens",
  title: "Command palette",
  description: "Search for a screen to open",
  placeholder: "Search screens…",
  empty: "No results",
  loading: "Loading",
  move: "Move",
  select: "Open",
  close: "Close",
};

const groups = [{ id: "screens", label: "Screens", items: [{ id: "/a", label: "Alpha" }] }];

describe("CommandPalette trigger (gh#778)", () => {
  it("renders the default trigger when `trigger` is omitted", () => {
    renderWithUi(<CommandPalette groups={groups} labels={labels} onSelect={() => {}} />);

    expect(document.querySelectorAll(".ui-command-palette-trigger")).toHaveLength(1);
  });

  it("renders NO trigger when `trigger` is null", () => {
    renderWithUi(
      <CommandPalette groups={groups} labels={labels} onSelect={() => {}} trigger={null} />,
    );

    // The defect: this was 1, because `??` read null as "not provided".
    expect(document.querySelectorAll(".ui-command-palette-trigger")).toHaveLength(0);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("still opens on the shortcut with no trigger — the shape the null spelling exists for", async () => {
    renderWithUi(
      <CommandPalette
        groups={groups}
        labels={labels}
        onSelect={() => {}}
        trigger={null}
        shortcut
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
    await userEvent.keyboard("{Meta>}k{/Meta}");

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("renders a consumer's own trigger when one is given", () => {
    renderWithUi(
      <CommandPalette
        groups={groups}
        labels={labels}
        onSelect={() => {}}
        trigger={<button>Mine</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Mine" })).toBeInTheDocument();
    expect(document.querySelectorAll(".ui-command-palette-trigger")).toHaveLength(0);
  });
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs } from "../tabs";

/**
 * `activationMode` is the Radix name for what React Aria calls `keyboardActivation`, and the rename
 * is the one translation in tabs.tsx that a consumer would never notice going missing until it cost
 * them four page loads: `.ai/rules/settings.md` requires `activationMode="manual"` on the settings
 * rail because every item there is a URL, and follow-focus activation would fetch each one the
 * reader merely arrows past.
 *
 * Both directions are asserted, because a prop that is silently dropped behaves exactly like RAC's
 * default (`"automatic"`) — only the contrast between the two proves it is still wired.
 */
const ITEMS = [
  { value: "a", label: "One", content: "PanelA" },
  { value: "b", label: "Two", content: "PanelB" },
  { value: "c", label: "Three", content: "PanelC" },
];

describe("Tabs — activationMode survives the rename to keyboardActivation", () => {
  it('activationMode="manual" moves focus with the arrow keys WITHOUT selecting', async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} activationMode="manual" />);

    await user.tab();
    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toHaveAccessibleName("Two");
    // Focus moved, selection did not: still the first tab, still the first panel.
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("PanelA")).toBeInTheDocument();
    expect(screen.queryByText("PanelB")).toBeNull();

    // …and the focused tab is still activatable on demand.
    await user.keyboard("{Enter}");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("PanelB")).toBeInTheDocument();
  });

  it("the default (no activationMode) still selects on arrow, as it always did", async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} />);

    await user.tab();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("PanelB")).toBeInTheDocument();
  });
});

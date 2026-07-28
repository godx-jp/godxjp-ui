import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { CommandPalette } from "../command-palette";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

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

const groups = [
  {
    id: "screens",
    label: "Screens",
    items: [
      { id: "/dashboard", label: "Dashboard", meta: "/dashboard" },
      { id: "/services", label: "Services", meta: "/services" },
    ],
  },
];

describe("CommandPalette", () => {
  it("owns the shortcut, keyboard selection, Escape and focus restoration", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(<CommandPalette groups={groups} labels={labels} onSelect={onSelect} />);

    const trigger = screen.getByRole("button", { name: "Search screens" });
    trigger.focus();
    await user.keyboard("{Control>}k{/Control}");
    const dialog = await screen.findByRole("dialog", { name: "Command palette" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Command palette" })).toHaveFocus();

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "/services" }));
    await waitFor(() => expect(trigger).toHaveFocus());

    await user.keyboard("{Control>}k{/Control}");
    await screen.findByRole("dialog", { name: "Command palette" });
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it("supports controlled state and click-out close without a consumer key handler", async () => {
    const user = userEvent.setup();

    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <span data-testid="state">{String(open)}</span>
          <CommandPalette
            open={open}
            onOpenChange={setOpen}
            groups={groups}
            labels={labels}
            onSelect={vi.fn()}
          />
        </>
      );
    }

    renderWithUi(<Controlled />);
    await user.click(document.querySelector(".ui-dialog-overlay") as HTMLElement);
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("false"));
  });

  it("renders loading, error and empty states inside the same accessible dialog", () => {
    const { rerender } = renderWithUi(
      <CommandPalette defaultOpen loading groups={groups} labels={labels} onSelect={vi.fn()} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading");

    rerender(
      <CommandPalette defaultOpen error="Request failed" groups={groups} labels={labels} onSelect={vi.fn()} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Request failed");

    rerender(
      <CommandPalette defaultOpen groups={[]} labels={labels} onSelect={vi.fn()} />,
    );
    expect(screen.getByText("No results")).toBeInTheDocument();
  });
});

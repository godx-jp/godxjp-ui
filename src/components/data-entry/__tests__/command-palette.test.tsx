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
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("combobox", { name: "Command palette" })).toHaveFocus();

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "/services" }));
    await waitFor(() => expect(trigger).toHaveFocus());

    await user.keyboard("{Control>}k{/Control}");
    await screen.findByRole("dialog", { name: "Command palette" });
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
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

  it("restores focus to the active control when opened by the global shortcut", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <>
        <button type="button">Account menu</button>
        <CommandPalette groups={groups} labels={labels} onSelect={vi.fn()} />
      </>,
    );

    const accountMenu = screen.getByRole("button", { name: "Account menu" });
    accountMenu.focus();
    await user.keyboard("{Control>}k{/Control}");
    await screen.findByRole("dialog", { name: "Command palette" });
    await user.keyboard("{Escape}");

    await waitFor(() => expect(accountMenu).toHaveFocus());
  });

  it("renders loading, error and empty states inside the same accessible dialog", () => {
    const { rerender } = renderWithUi(
      <CommandPalette defaultOpen loading groups={groups} labels={labels} onSelect={vi.fn()} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading");

    rerender(
      <CommandPalette
        defaultOpen
        error="Request failed"
        groups={groups}
        labels={labels}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Request failed");

    rerender(<CommandPalette defaultOpen groups={[]} labels={labels} onSelect={vi.fn()} />);
    expect(screen.getByText("No results")).toBeInTheDocument();
  });
});

describe("CommandPalette query accessor (gh#412)", () => {
  it("reports every keystroke and accepts a controlled query", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    function Controlled() {
      const [search, setSearch] = useState("das");
      return (
        <CommandPalette
          defaultOpen
          search={search}
          onSearchChange={(next) => {
            setSearch(next);
            onSearchChange(next);
          }}
          groups={groups}
          labels={labels}
          onSelect={vi.fn()}
        />
      );
    }

    renderWithUi(<Controlled />);
    const input = screen.getByRole("combobox", { name: "Command palette" });
    expect(input).toHaveValue("das");

    await user.type(input, "h");
    expect(onSearchChange).toHaveBeenLastCalledWith("dash");
    await waitFor(() => expect(input).toHaveValue("dash"));
  });

  it("seeds an uncontrolled query and resets it — announced — when the palette closes", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    renderWithUi(
      <CommandPalette
        defaultSearch="ser"
        onSearchChange={onSearchChange}
        groups={groups}
        labels={labels}
        onSelect={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Search screens" }));
    const input = await screen.findByRole("combobox", { name: "Command palette" });
    expect(input).toHaveValue("ser");

    await user.type(input, "vices");
    expect(onSearchChange).toHaveBeenLastCalledWith("services");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(onSearchChange).toHaveBeenLastCalledWith("ser"));

    await user.click(screen.getByRole("button", { name: "Search screens" }));
    expect(await screen.findByRole("combobox", { name: "Command palette" })).toHaveValue("ser");
  });

  it("hands filtering to the consumer with shouldFilter={false} — no second client-side match", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <CommandPalette
        defaultOpen
        shouldFilter={false}
        groups={groups}
        labels={labels}
        onSelect={vi.fn()}
      />,
    );

    // A query that matches NEITHER row: with client filtering both would disappear. The server
    // said these are the matches, so both stay.
    await user.type(screen.getByRole("combobox", { name: "Command palette" }), "zzzz");
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.queryByText("No results")).toBeNull();
  });

  it("derives the empty node from `groups`, never from a scheduled cmdk count", async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithUi(
      <CommandPalette
        defaultOpen
        shouldFilter={false}
        groups={[{ id: "screens", label: "Screens", items: [] }]}
        labels={labels}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("No results")).toBeInTheDocument();

    // In flight: a request that has not answered is NOT an empty result, at any query.
    rerender(
      <CommandPalette
        defaultOpen
        shouldFilter={false}
        loading
        groups={[{ id: "screens", label: "Screens", items: [] }]}
        labels={labels}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByText("No results")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Loading");

    // Answered, with matches — the empty node is gone on the SAME render the items arrive on.
    rerender(
      <CommandPalette
        defaultOpen
        shouldFilter={false}
        groups={groups}
        labels={labels}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByText("No results")).toBeNull();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();

    // Typing cannot reintroduce it — the consumer owns the query and the result set.
    await user.type(screen.getByRole("combobox", { name: "Command palette" }), "anything");
    expect(screen.queryByText("No results")).toBeNull();
  });
});

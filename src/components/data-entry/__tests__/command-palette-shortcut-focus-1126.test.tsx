import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { CommandPalette } from "../command-palette";

/**
 * gh#1126 — a configurable shortcut (two palettes side by side) and the modifier keys held while
 * choosing an item. (The focus-restore report did not reproduce — see the issue.)
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
  loading: "Loading",
};

describe("CommandPalette shortcut / focus / modifiers (gh#1126)", () => {
  it("two palettes on mod+o and mod+p each open on their own combo; mod+shift+p is not mod+p", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <>
        <CommandPalette
          groups={groups}
          labels={{ ...labels, title: "Switcher" }}
          onSelect={vi.fn()}
          shortcut="mod+o"
          trigger={null}
        />
        <CommandPalette
          groups={groups}
          labels={{ ...labels, title: "Commands" }}
          onSelect={vi.fn()}
          shortcut="mod+p"
          trigger={null}
        />
      </>,
    );
    await user.keyboard("{Control>}{Shift>}p{/Shift}{/Control}");
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.keyboard("{Meta>}p{/Meta}");
    expect(await screen.findByRole("dialog", { name: "Commands" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Switcher" })).toBeNull();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await user.keyboard("{Control>}o{/Control}");
    expect(await screen.findByRole("dialog", { name: "Switcher" })).toBeInTheDocument();
  });

  it("the default trigger shows the configured combo", () => {
    renderWithUi(
      <CommandPalette groups={groups} labels={labels} onSelect={vi.fn()} shortcut="mod+shift+p" />,
    );
    expect(screen.getByRole("button", { name: /Open/ })).toHaveTextContent("⌘⇧P");
  });

  it("onSelect receives the modifier keys held on Enter and on click", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(
      <CommandPalette
        groups={groups}
        labels={labels}
        onSelect={onSelect}
        defaultOpen
        trigger={null}
      />,
    );
    await screen.findByRole("dialog", { name: "Palette" });
    await user.keyboard("{Meta>}{Enter}{/Meta}");
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ id: "/a" }), {
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    });
    await user.keyboard("{Control>}k{/Control}");
    await screen.findByRole("dialog", { name: "Palette" });
    await user.keyboard("{Shift>}");
    await user.click(screen.getByRole("option", { name: "Beta" }));
    await user.keyboard("{/Shift}");
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ id: "/b" }), {
      metaKey: false,
      ctrlKey: false,
      shiftKey: true,
      altKey: false,
    });
  });
});

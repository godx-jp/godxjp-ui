import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, userEvent } from "@/test/render";

import { SearchInput } from "../search-input";

/** gh#1250 — `shortcut` focuses the field from anywhere and shows a key-cap hint while empty. */

/** Pretend to be a Mac (or not) for the platform-dependent `mod` key (gh#1129). */
function onPlatform(platform: string) {
  vi.spyOn(navigator, "platform", "get").mockReturnValue(platform);
}

const hint = (container: HTMLElement) => container.querySelector("kbd.ui-search-input-shortcut");

describe("SearchInput shortcut (gh#1250)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("non-Apple: Ctrl+K focuses the input; the hint reads Ctrl+K and is aria-hidden", async () => {
    onPlatform("Win32");
    const user = userEvent.setup();
    const { container } = renderWithUi(<SearchInput shortcut label="Search" />);
    expect(screen.getByRole("searchbox")).not.toHaveFocus();
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("searchbox")).toHaveFocus();
    expect(hint(container)?.textContent).toBe("Ctrl+K");
    expect(hint(container)).toHaveAttribute("aria-hidden", "true");
  });

  it("Mac: Ctrl+K does nothing, Meta+K focuses; the hint reads ⌘K", async () => {
    onPlatform("MacIntel");
    const user = userEvent.setup();
    const { container } = renderWithUi(<SearchInput shortcut label="Search" />);
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("searchbox")).not.toHaveFocus();
    await user.keyboard("{Meta>}k{/Meta}");
    expect(screen.getByRole("searchbox")).toHaveFocus();
    expect(hint(container)?.textContent).toBe("⌘K");
  });

  it("a combo string binds that combo", async () => {
    onPlatform("Win32");
    const user = userEvent.setup();
    const { container } = renderWithUi(<SearchInput shortcut="mod+shift+f" label="Search" />);
    await user.keyboard("{Control>}f{/Control}");
    expect(screen.getByRole("searchbox")).not.toHaveFocus();
    await user.keyboard("{Control>}{Shift>}f{/Shift}{/Control}");
    expect(screen.getByRole("searchbox")).toHaveFocus();
    expect(hint(container)?.textContent).toBe("Ctrl+⇧F");
  });

  it("never fires during IME composition", () => {
    onPlatform("Win32");
    renderWithUi(<SearchInput shortcut label="Search" />);
    fireEvent.keyDown(document, { key: "k", code: "KeyK", ctrlKey: true, isComposing: true });
    expect(screen.getByRole("searchbox")).not.toHaveFocus();
    fireEvent.keyDown(document, { key: "k", code: "KeyK", ctrlKey: true, keyCode: 229 });
    expect(screen.getByRole("searchbox")).not.toHaveFocus();
    // Positive control: the same dispatch without composition reaches the listener and focuses.
    fireEvent.keyDown(document, { key: "k", code: "KeyK", ctrlKey: true });
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });

  it("the hint is absent while the field has text, and returns when it is cleared", async () => {
    onPlatform("Win32");
    const user = userEvent.setup();
    const { container, rerender } = renderWithUi(
      <SearchInput shortcut label="Search" value="tanaka" onValueChange={() => undefined} />,
    );
    expect(hint(container)).toBeNull();
    rerender(<SearchInput shortcut label="Search" value="" onValueChange={() => undefined} />);
    expect(hint(container)).not.toBeNull();
    // Uncontrolled: typing hides it.
    rerender(<SearchInput shortcut label="Search" />);
    await user.type(screen.getByRole("searchbox"), "a");
    expect(hint(container)).toBeNull();
  });

  it("the text keeps clear of the key cap while it shows, and gets the ✕ padding back once typed", async () => {
    const user = userEvent.setup();
    renderWithUi(<SearchInput shortcut label="Search" />);
    const box = screen.getByRole("searchbox");
    expect(box.className).toContain("!pe-[calc(var(--search-input-end-padding)_-_var(--control-icon-size)_-_var(--control-gap)_+_6ch)]");
    await user.type(box, "a");
    // Once typed, the key-cap padding is gone and the ✕ padding comes from the stylesheet
    // (`.ui-search-input-control`, which a coarse-pointer target token can widen — gh#1371),
    // not from a utility class; its clearance is measured in input-affix-coarse-1371-browser.
    expect(box.className).not.toContain("6ch");
    expect(box.className).toContain("ui-search-input-control");
  });

  it("off by default, and off while disabled: no hint, no focus", async () => {
    onPlatform("Win32");
    const user = userEvent.setup();
    const { container, rerender } = renderWithUi(<SearchInput label="Search" />);
    expect(hint(container)).toBeNull();
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("searchbox")).not.toHaveFocus();
    rerender(<SearchInput shortcut disabled label="Search" />);
    expect(hint(container)).toBeNull();
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("searchbox")).not.toHaveFocus();
  });
});

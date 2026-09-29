import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { ChatComposer } from "../data-entry/chat-composer";
import { ChatSuggestion } from "../data-entry/chat-suggestion";
import { CommandPalette } from "../data-entry/command-palette";
import { DatePicker } from "../data-entry/date-picker";
import { NumberInput } from "../data-entry/number-input";
import { TimePicker } from "../data-entry/time-picker";
import { Input } from "../data-entry/input";
import { Dialog, DialogBody, DialogContent, DialogHeader } from "../feedback/dialog";
import { Text } from "../general/typography";
import { Pagination } from "../navigation/pagination";

/**
 * gh#1054 — the Enter (or Escape/Tab) that CONFIRMS an IME conversion arrives as an ordinary
 * `keydown`. Every text-entry site where the kit acts on such a key must ignore it while the IME
 * composes, whichever way the browser reports that: `isComposing` (the standard) or `keyCode 229`
 * (Safari after `compositionend`, legacy Chromium on Windows). The same key WITHOUT a composition
 * still acts — the guard must not swallow the real thing.
 *
 * None of these cases fires `compositionstart`: the guard has to come from the key event itself,
 * because a browser that sends `compositionend` before the confirming keydown leaves any
 * composition-event bookkeeping already reset.
 */
const COMPOSING: Array<[string, Partial<KeyboardEventInit> & { keyCode?: number }]> = [
  ["isComposing", { isComposing: true }],
  ["keyCode 229", { keyCode: 229 }],
];

describe.each(COMPOSING)("gh#1054 — a composing key is the IME's (%s)", (_label, composing) => {
  it("TimePicker field: Enter does not commit the typed time", () => {
    const onValueChange = vi.fn();
    renderWithUi(<TimePicker onValueChange={onValueChange} />);
    const field = screen.getByRole("combobox");
    fireEvent.change(field, { target: { value: "14:45" } });
    onValueChange.mockClear();

    fireEvent.keyDown(field, { key: "Enter", ...composing });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.keyDown(field, { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith("14:45");
  });

  it("TimePicker panel draft: Enter does not commit the draft", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimePicker defaultValue="09:00" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("combobox"));
    const draft = screen.getByRole("textbox");
    fireEvent.change(draft, { target: { value: "14:45" } });

    fireEvent.keyDown(draft, { key: "Enter", ...composing });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.keyDown(draft, { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith("14:45");
  });

  it("DatePicker field: Enter neither closes the panel nor is swallowed", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker />);
    const field = screen.getByRole("combobox");
    await user.click(field);
    expect(field).toHaveAttribute("aria-expanded", "true");

    // `fireEvent` returns false when the handler called preventDefault — the kit acted.
    expect(fireEvent.keyDown(field, { key: "Enter", ...composing })).toBe(true);
    expect(field).toHaveAttribute("aria-expanded", "true");

    expect(fireEvent.keyDown(field, { key: "Enter" })).toBe(false);
    await waitFor(() => expect(field).toHaveAttribute("aria-expanded", "false"));
  });

  it("Pagination quick jumper: Enter does not jump", () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <Pagination
        total={95}
        pageSize={10}
        value={3}
        showQuickJumper
        onValueChange={onValueChange}
      />,
    );
    const jumper = screen.getByRole("spinbutton");
    fireEvent.change(jumper, { target: { value: "7" } });

    fireEvent.keyDown(jumper, { key: "Enter", ...composing });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.keyDown(jumper, { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith(7, 10);
  });

  it("Text editable: the confirming Enter does not save the edit", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(<Text editable={{ onChange }}>件名</Text>);
    await user.click(screen.getByRole("button", { name: "Sửa" }));
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "新しい件名" } });

    // The keyup of the confirming Enter carries no composition flag any more.
    fireEvent.keyDown(textarea, { key: "Enter", ...composing });
    fireEvent.keyUp(textarea, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(textarea, { key: "Enter" });
    fireEvent.keyUp(textarea, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("新しい件名");
  });

  it("ChatSuggestion: Enter does not pick the active suggestion (nor send)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onSubmit = vi.fn();
    function Harness() {
      const [draft, setDraft] = React.useState("");
      return (
        <ChatSuggestion
          items={[{ value: "summarize", label: "要約する" }]}
          onValueChange={onValueChange}
        >
          {({ onTrigger, onKeyDown }) => (
            <ChatComposer
              aria-label="メッセージ"
              value={draft}
              onValueChange={(next) => {
                setDraft(next);
                onTrigger(next);
              }}
              onKeyDown={onKeyDown}
              onSubmit={onSubmit}
            />
          )}
        </ChatSuggestion>
      );
    }
    renderWithUi(<Harness />);
    const field = screen.getByRole("textbox", { name: "メッセージ" });
    await user.type(field, "/");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));

    fireEvent.keyDown(field, { key: "Enter", ...composing });
    fireEvent.keyDown(field, { key: "Tab", ...composing });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(field, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("summarize");
  });

  it("ChatComposer: Enter does not send", () => {
    const onSubmit = vi.fn();
    renderWithUi(
      <ChatComposer aria-label="メッセージ" defaultValue="日本語" onSubmit={onSubmit} />,
    );
    const field = screen.getByRole("textbox", { name: "メッセージ" });

    fireEvent.keyDown(field, { key: "Enter", ...composing });
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(field, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("日本語");
  });

  it("NumberInput: Enter does not commit (clamp) the draft", () => {
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput max={10} onValueChange={onValueChange} aria-label="qty" />);
    const field = screen.getByRole("spinbutton", { name: "qty" });
    fireEvent.change(field, { target: { value: "42" } });

    fireEvent.keyDown(field, { key: "Enter", ...composing });
    expect(onValueChange).not.toHaveBeenCalledWith(10);

    fireEvent.keyDown(field, { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith(10);
  });

  it("CommandPalette: ⌘K/Ctrl+K typed through an IME does not toggle the palette", async () => {
    renderWithUi(
      <CommandPalette
        groups={[{ id: "g", label: "Screens", items: [{ id: "/a", label: "A" }] }]}
        labels={{
          open: "Search screens",
          title: "Command palette",
          description: "Search for a screen to open",
          placeholder: "Search screens…",
          empty: "No results",
          loading: "Loading",
          move: "Move",
          select: "Open",
          close: "Close",
        }}
        onSelect={vi.fn()}
      />,
    );

    fireEvent.keyDown(document, { key: "k", ctrlKey: true, ...composing });
    expect(screen.queryByRole("dialog", { name: "Command palette" })).toBeNull();

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(await screen.findByRole("dialog", { name: "Command palette" })).toBeInTheDocument();
  });

  it("non-modal Dialog: Escape that cancels a conversion does not close the dialog", () => {
    const onOpenChange = vi.fn();
    renderWithUi(
      <Dialog modal={false} open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader title="編集" />
          <DialogBody>
            <Input aria-label="件名" />
          </DialogBody>
        </DialogContent>
      </Dialog>,
    );
    const field = screen.getByRole("textbox", { name: "件名" });

    fireEvent.keyDown(field, { key: "Escape", ...composing });
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.keyDown(field, { key: "Escape" });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});

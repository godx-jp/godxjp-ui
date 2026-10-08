import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { ChatComposer } from "../chat-composer";
import { ChatSuggestion } from "../chat-suggestion";

/**
 * gh#1054 (chat cases; the core ones stay in src/components/__tests__) — the Enter (or Escape/Tab) that CONFIRMS an IME conversion arrives as an ordinary
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
});

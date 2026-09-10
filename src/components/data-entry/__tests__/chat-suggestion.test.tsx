import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { ChatComposer } from "../chat-composer";
import { ChatSuggestion } from "../chat-suggestion";
import type { ChatSuggestionItemProp } from "../chat-suggestion";

/**
 * ChatSuggestion behaviour — the trigger-character list over a real ChatComposer.
 *
 * Everything here is driven through the textarea, because that is where the user's hands are: the
 * list never takes focus, so if the keyboard path is broken the control is unusable even though it
 * renders perfectly.
 */

const ITEMS: ChatSuggestionItemProp[] = [
  { value: "summarize", label: "要約する", description: "Summarize the thread" },
  { value: "translate", label: "翻訳する" },
  { value: "explain", label: "説明する" },
  { value: "archived", label: "アーカイブ", disabled: true },
];

/** The canonical call site: both halves of the render prop wired. */
function Harness({
  items = ITEMS,
  onValueChange,
  onSubmit,
  triggerCharacter,
}: {
  items?: ChatSuggestionItemProp[];
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  triggerCharacter?: string;
}) {
  const [draft, setDraft] = React.useState("");
  return (
    <>
      <ChatSuggestion
        items={items}
        onValueChange={onValueChange}
        triggerCharacter={triggerCharacter}
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
      <span data-testid="mirror">{draft}</span>
    </>
  );
}

const field = () => screen.getByRole("textbox") as HTMLTextAreaElement;
const rows = () => screen.queryAllByRole("option");

describe("ChatSuggestion — opening and closing", () => {
  it("the trigger character at a word boundary opens the list", async () => {
    const user = userEvent.setup();
    renderWithUi(<Harness />);

    expect(rows()).toHaveLength(0);
    await user.type(field(), "/");

    await waitFor(() => expect(rows()).toHaveLength(4));
    expect(screen.getByText("要約する")).toBeInTheDocument();
  });

  it("a trigger character MID-WORD opens nothing — a URL is not a slash command", async () => {
    const user = userEvent.setup();
    renderWithUi(<Harness />);

    await user.type(field(), "https://x");

    // Nothing to wait for on the happy path, so give the deferred caret read a turn first.
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(rows()).toHaveLength(0);
  });

  it("a word break closes the list again", async () => {
    const user = userEvent.setup();
    renderWithUi(<Harness />);

    await user.type(field(), "/tra");
    await waitFor(() => expect(rows()).toHaveLength(1));

    await user.type(field(), " ");
    await waitFor(() => expect(rows()).toHaveLength(0));
  });

  it("deleting back past the trigger character closes the list", async () => {
    const user = userEvent.setup();
    renderWithUi(<Harness />);

    await user.type(field(), "/t");
    await waitFor(() => expect(rows().length).toBeGreaterThan(0));

    await user.keyboard("{Backspace}{Backspace}");
    await waitFor(() => expect(rows()).toHaveLength(0));
  });

  it("a custom `triggerCharacter` is honoured and `/` then does nothing", async () => {
    const user = userEvent.setup();
    renderWithUi(<Harness triggerCharacter="@" />);

    await user.type(field(), "/");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(rows()).toHaveLength(0);

    await user.clear(field());
    await user.type(field(), "@");
    await waitFor(() => expect(rows()).toHaveLength(4));
  });
});

describe("ChatSuggestion — the open triad", () => {
  it("`defaultOpen` starts open without a trigger character being typed", () => {
    renderWithUi(
      <ChatSuggestion items={ITEMS} defaultOpen>
        {({ onTrigger, onKeyDown }) => (
          <ChatComposer aria-label="メッセージ" onValueChange={onTrigger} onKeyDown={onKeyDown} />
        )}
      </ChatSuggestion>,
    );
    expect(rows()).toHaveLength(4);
  });

  it("a CONTROLLED `open` wins over the caret, and onOpenChange reports what the caret wanted", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(
      <ChatSuggestion items={ITEMS} open={false} onOpenChange={onOpenChange}>
        {({ onTrigger, onKeyDown }) => (
          <ChatComposer aria-label="メッセージ" onValueChange={onTrigger} onKeyDown={onKeyDown} />
        )}
      </ChatSuggestion>,
    );

    await user.type(field(), "/");

    // The parent said closed, so it STAYS closed — but it is told the trigger fired, which is the
    // only way a controlled parent can decide to open.
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
    expect(rows()).toHaveLength(0);
  });
});

describe("ChatSuggestion — filtering", () => {
  it("the query is the text between the trigger and the caret", async () => {
    const user = userEvent.setup();
    renderWithUi(<Harness />);

    await user.type(field(), "/sum");
    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(screen.getByText("要約する")).toBeInTheDocument();
  });

  it("a query matching nothing shows the localized empty message, not a blank panel", async () => {
    const user = userEvent.setup();
    renderWithUi(<Harness />);

    await user.type(field(), "/zzz");

    await waitFor(() => expect(screen.getByText("Không có gợi ý phù hợp")).toBeInTheDocument());
    expect(rows()).toHaveLength(0);
  });
});

describe("ChatSuggestion — keyboard, from the textarea", () => {
  it("ArrowDown/ArrowUp move the active row and Enter picks it — WITHOUT sending the message", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onSubmit = vi.fn();
    renderWithUi(<Harness onValueChange={onValueChange} onSubmit={onSubmit} />);

    await user.type(field(), "/");
    await waitFor(() => expect(rows()).toHaveLength(4));
    // The first ENABLED row is active at rest, so Enter always has something to pick.
    await waitFor(() => expect(rows()[0]).toHaveAttribute("aria-selected", "true"));

    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(rows()[1]).toHaveAttribute("aria-selected", "true"));
    await user.keyboard("{ArrowUp}");
    await waitFor(() => expect(rows()[0]).toHaveAttribute("aria-selected", "true"));

    await user.keyboard("{ArrowDown}{Enter}");

    expect(onValueChange).toHaveBeenCalledWith("translate");
    // The Enter that picked a suggestion is NOT also a send.
    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => expect(rows()).toHaveLength(0));
    expect(field()).toHaveFocus();
  });

  it("a disabled row is skipped by the arrows and can never be picked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Harness onValueChange={onValueChange} />);

    await user.type(field(), "/");
    await waitFor(() => expect(rows()).toHaveLength(4));

    // Three enabled rows, so four ArrowDowns wrap back to the first — the disabled 4th is never
    // reached, and Enter therefore cannot land on it.
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{Enter}");

    expect(onValueChange).toHaveBeenCalledWith("summarize");
  });

  it("Escape closes the list, returns focus to the textarea and leaves the draft INTACT", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Harness onValueChange={onValueChange} />);

    await user.type(field(), "hello /tra");
    await waitFor(() => expect(rows()).toHaveLength(1));

    await user.keyboard("{Escape}");

    await waitFor(() => expect(rows()).toHaveLength(0));
    expect(field()).toHaveFocus();
    // The whole point: dismissing a suggestion must not cost the user their sentence.
    expect(field()).toHaveValue("hello /tra");
    expect(screen.getByTestId("mirror")).toHaveTextContent("hello /tra");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("Tab picks the active row too (an autocomplete convention), and does not tab away", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Harness onValueChange={onValueChange} />);

    await user.type(field(), "/ex");
    await waitFor(() => expect(rows()).toHaveLength(1));

    await user.keyboard("{Tab}");

    expect(onValueChange).toHaveBeenCalledWith("explain");
    expect(field()).toHaveFocus();
  });
});

describe("ChatSuggestion — the popup contract on the draft box", () => {
  it("the textarea carries only the ARIA a <textarea> may carry, and drops the id refs on close", async () => {
    const user = userEvent.setup();
    renderWithUi(<Harness />);

    const node = field();
    // NOT role="combobox" and NOT aria-expanded: ARIA in HTML allows neither on a <textarea>, and
    // axe fails both. The state is announced by the status region asserted below instead.
    expect(node).not.toHaveAttribute("role");
    expect(node).toHaveAttribute("aria-haspopup", "listbox");
    expect(node).toHaveAttribute("aria-autocomplete", "list");
    expect(node).not.toHaveAttribute("aria-controls");

    await user.type(node, "/");
    const listbox = await screen.findByRole("listbox");
    await waitFor(() => expect(node).toHaveAttribute("aria-controls", listbox.id));
    // The active row is ANNOUNCED, which is the only way a screen-reader user knows what Enter
    // will pick while focus stays in the textarea.
    await waitFor(() =>
      expect(node.getAttribute("aria-activedescendant")).toBe(rows()[0].getAttribute("id")),
    );
    // The count is the open/closed signal aria-expanded would have carried — pluralized via
    // Intl.PluralRules, never a template string.
    expect(screen.getByRole("status")).toHaveTextContent("4 gợi ý");

    await user.keyboard("{Escape}");
    // Both attributes point at a panel that is unmounted when closed — a dangling id reference is
    // an axe violation and a broken relationship for a screen reader.
    await waitFor(() => expect(node).not.toHaveAttribute("aria-controls"));
    expect(node).not.toHaveAttribute("aria-activedescendant");
    expect(screen.getByRole("status")).toHaveTextContent("");
  });
});

describe("ChatSuggestion — one level of children", () => {
  const NESTED: ChatSuggestionItemProp[] = [
    {
      value: "templates",
      label: "テンプレート",
      children: [
        { value: "templates/meeting", label: "議事録" },
        { value: "templates/report", label: "週報" },
      ],
    },
    { value: "translate", label: "翻訳する" },
  ];

  it("picking a parent DRILLS into its children instead of emitting a value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Harness items={NESTED} onValueChange={onValueChange} />);

    await user.type(field(), "/tem");
    await waitFor(() => expect(rows()).toHaveLength(1));

    await user.keyboard("{Enter}");

    // The parent emits nothing; the sub-list replaces it, whole (the query resets).
    expect(onValueChange).not.toHaveBeenCalled();
    await waitFor(() => expect(rows()).toHaveLength(2));
    expect(screen.getByText("議事録")).toBeInTheDocument();

    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("templates/meeting");
  });
});

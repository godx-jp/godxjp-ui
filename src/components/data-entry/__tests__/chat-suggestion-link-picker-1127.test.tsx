import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { ChatComposer } from "../chat-composer";
import { ChatSuggestion } from "../chat-suggestion";
import type { ChatSuggestionItemProp, ChatSuggestionProp } from "../chat-suggestion";

/**
 * gh#1127 — ChatSuggestion as a `[[` link picker: spaces inside the query, a trigger right after
 * Japanese text, a terminator, and results the host has already filtered.
 */
const PAGES: ChatSuggestionItemProp[] = [
  { value: "meeting-notes", label: "Meeting notes" },
  { value: "design-doc", label: "Design doc" },
];

function Harness(props: Partial<ChatSuggestionProp>) {
  const [draft, setDraft] = React.useState("");
  return (
    <ChatSuggestion items={PAGES} triggerCharacter="[[" {...props}>
      {({ onTrigger, onKeyDown }) => (
        <ChatComposer
          aria-label="本文"
          value={draft}
          onValueChange={(next) => {
            setDraft(next);
            onTrigger(next);
          }}
          onKeyDown={onKeyDown}
        />
      )}
    </ChatSuggestion>
  );
}

const field = () => screen.getByRole("textbox") as HTMLTextAreaElement;
const rows = () => screen.queryAllByRole("option");
/** user-event reads `[` and `{` as key descriptors; doubled, they type literally. */
const literal = (text: string) => text.replace(/[[{]/g, "$&$&");
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

describe("ChatSuggestion link picker (gh#1127)", () => {
  it("`[[` right after Japanese text opens — CJK has no word spaces", async () => {
    const user = userEvent.setup();
    renderWithUi(<Harness />);
    await user.type(field(), literal("会議[["));
    await waitFor(() => expect(rows()).toHaveLength(2));
  });

  it("an ASCII letter before the trigger still blocks it (a URL stays a URL)", async () => {
    const user = userEvent.setup();
    renderWithUi(<Harness triggerCharacter="/" />);
    await user.type(field(), literal("https://x"));
    await settle();
    expect(rows()).toHaveLength(0);
  });

  it("allowSpaces keeps the list open across a space and filters on the whole query", async () => {
    const user = userEvent.setup();
    renderWithUi(<Harness allowSpaces />);
    await user.type(field(), literal("[[Meeting no"));
    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(screen.getByRole("option", { name: /Meeting notes/ })).toBeInTheDocument();
  });

  it("without allowSpaces a space still ends the query (unchanged default)", async () => {
    const user = userEvent.setup();
    renderWithUi(<Harness />);
    await user.type(field(), literal("[[Meeting "));
    await settle();
    expect(rows()).toHaveLength(0);
  });

  it("a terminator closes the list", async () => {
    const user = userEvent.setup();
    renderWithUi(<Harness allowSpaces terminator="]]" />);
    await user.type(field(), literal("[[Design"));
    await waitFor(() => expect(rows()).toHaveLength(1));
    await user.type(field(), literal("]]"));
    await settle();
    // The LIST is gone, not merely empty: `Design]]` would also match nothing if it stayed open.
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("shouldFilter={false}: the host's results are shown as given, and it hears the query", async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    // The host's own search found a page whose label does not contain the typed text.
    const fromServer: ChatSuggestionItemProp[] = [
      { value: "q3-review", label: "Quarterly review" },
    ];
    renderWithUi(
      <Harness items={fromServer} shouldFilter={false} onQueryChange={onQueryChange} allowSpaces />,
    );
    await user.type(field(), literal("[[会議 メモ"));
    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(onQueryChange).toHaveBeenLastCalledWith("会議 メモ");
  });
});

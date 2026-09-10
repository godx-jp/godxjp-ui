import * as React from "react";
import { describe, it } from "vitest";

import { expectNoA11yViolations } from "@/test/a11y";
import { ChatComposer } from "../chat-composer";
import { ChatSuggestion } from "../chat-suggestion";
import type { ChatSuggestionItemProp } from "../chat-suggestion";

const ITEMS: ChatSuggestionItemProp[] = [
  { value: "summarize", label: "要約する", description: "Summarize the thread" },
  { value: "translate", label: "翻訳する" },
  { value: "archived", label: "アーカイブ", disabled: true },
];

function Harness({ defaultOpen }: { defaultOpen?: boolean }) {
  const [draft, setDraft] = React.useState("");
  return (
    <ChatSuggestion items={ITEMS} defaultOpen={defaultOpen} onValueChange={setDraft}>
      {({ onTrigger, onKeyDown }) => (
        <ChatComposer
          aria-label="メッセージ"
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

describe("ChatSuggestion — accessibility", () => {
  it("closed: the draft box is a collapsed combobox with no dangling id references", async () => {
    // `aria-controls`/`aria-activedescendant` pointing at an unmounted panel is an axe violation
    // in its own right, which is what this closed-state audit exists to catch.
    await expectNoA11yViolations(<Harness />);
  });

  it("OPEN: the portalled listbox, its options and the active-descendant wiring", async () => {
    // The panel portals into document.body — exactly the scope expectNoA11yViolations audits.
    await expectNoA11yViolations(<Harness defaultOpen />);
  });
});

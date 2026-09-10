import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../popover";

/**
 * An ANCHORED popover positions itself against `PopoverAnchor` instead of its trigger, and that
 * anchor is part of the widget — not the outside world. `ChatSuggestion` is the case that found
 * this: the anchor IS the textarea the panel is completing.
 *
 * Before the fix, the outside-click handler excluded only the trigger, so a pointer-down inside
 * the anchor closed the panel and the owner's own caret read reopened it a frame later — the list
 * visibly flickered on every click into the draft box.
 *
 * The trigger stays excluded for the original reason (its own `onClick` already toggles), and a
 * click on genuinely outside ground must still close.
 */
describe("Popover — an anchored popover treats its anchor as inside the widget", () => {
  function Anchored() {
    return (
      <Popover defaultOpen>
        <PopoverAnchor>
          <span data-testid="anchor">the anchored input surface</span>
        </PopoverAnchor>
        <PopoverContent>
          <span data-testid="panel">panel</span>
        </PopoverContent>
      </Popover>
    );
  }

  it("keeps the panel open when the pointer goes down inside the anchor", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Anchored />
        <span data-testid="outside">outside ground</span>
      </>,
    );
    expect(screen.getByTestId("panel")).toBeInTheDocument();

    await user.click(screen.getByTestId("anchor"));
    expect(screen.queryByTestId("panel")).toBeInTheDocument();
  });

  it("still closes on a click on genuinely outside ground", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Anchored />
        <span data-testid="outside">outside ground</span>
      </>,
    );
    expect(screen.getByTestId("panel")).toBeInTheDocument();

    await user.click(screen.getByTestId("outside"));
    expect(screen.queryByTestId("panel")).not.toBeInTheDocument();
  });

  it("leaves an UNanchored popover's behaviour untouched — outside still closes", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Popover defaultOpen>
          <PopoverTrigger>open</PopoverTrigger>
          <PopoverContent>
            <span data-testid="plain-panel">panel</span>
          </PopoverContent>
        </Popover>
        <span data-testid="outside">outside ground</span>
      </>,
    );
    expect(screen.getByTestId("plain-panel")).toBeInTheDocument();

    await user.click(screen.getByTestId("outside"));
    expect(screen.queryByTestId("plain-panel")).not.toBeInTheDocument();
  });
});

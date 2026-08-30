import * as React from "react";
import { describe, expect, it } from "vitest";

import { ScrollArea, ScrollBar } from "../scroll-area";
import { Button } from "../../general/button";
import { expectNoA11yViolations } from "@/test/a11y";
import { renderWithUi } from "@/test/render";

const messages = Array.from({ length: 12 }, (_, index) => `メッセージ ${String(index + 1)}`);

/**
 * ScrollArea a11y (gh#311). Anchoring is a scroll-offset write and nothing else — it must add no
 * roles, no live region, and above all no second announcement of content the consumer's own live
 * region already announces. The viewport's `tabIndex={0}` is the WCAG 2.1.1 fix from f665ee1 and
 * must survive the new props.
 */
describe("ScrollArea a11y", () => {
  // ScrollArea wraps content in a Radix viewport with custom scrollbars; the scrollable region
  // must keep its content reachable to assistive tech.
  it("has no axe violations for a scrollable list", async () => {
    await expectNoA11yViolations(
      <ScrollArea className="h-24 w-48">
        <ul>
          {Array.from({ length: 20 }, (_, i) => (
            <li key={i}>行 {i + 1}</li>
          ))}
        </ul>
      </ScrollArea>,
    );
  });

  it("has no axe violations as a plain scroll region", async () => {
    await expectNoA11yViolations(
      <ScrollArea className="h-40">
        <div>
          {messages.map((message) => (
            <div key={message}>{message}</div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>,
    );
  });

  it("has no axe violations as an anchored live stream with a jump-to-newest button", async () => {
    await expectNoA11yViolations(
      <div>
        <ScrollArea anchor="bottom" className="h-40">
          <div>
            {messages.map((message) => (
              <div key={message}>{message}</div>
            ))}
          </div>
        </ScrollArea>
        <Button type="button">最新のメッセージへ移動</Button>
      </div>,
    );
  });

  it("keeps the viewport focusable and adds no live region of its own", () => {
    const viewportRef = React.createRef<HTMLDivElement>();
    const { container } = renderWithUi(
      <ScrollArea anchor="bottom" viewportRef={viewportRef} className="h-40">
        <div>
          {messages.map((message) => (
            <div key={message}>{message}</div>
          ))}
        </div>
      </ScrollArea>,
    );

    expect(viewportRef.current).toHaveAttribute("tabindex", "0");
    // Announcing arriving content is the consumer's decision and its own region; a live region on
    // a scroll container would re-announce on every reflow.
    expect(container.querySelector("[aria-live]")).toBeNull();
    expect(container.querySelector("[role='status']")).toBeNull();
    expect(container.querySelector("[role='alert']")).toBeNull();
  });
});

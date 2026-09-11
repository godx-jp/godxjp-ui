import * as React from "react";
import { describe, expect, it } from "vitest";

import { ScrollArea } from "../scroll-area";
import { renderWithUi } from "@/test/render";

const messages = Array.from({ length: 12 }, (_, index) => `メッセージ ${String(index + 1)}`);

/**
 * ScrollArea a11y. Anchoring is a scroll-offset write and nothing else — it must add no
 * roles, no live region, and above all no second announcement of content the consumer's own live
 * region already announces. The viewport's `tabIndex={0}` is the WCAG 2.1.1 fix from f665ee1 and
 * must survive the new props.
 */
describe("ScrollArea a11y", () => {
  // ScrollArea is a native scroll container; the scrollable region must keep its content reachable
  // to assistive tech, and must stay focusable (axe scrollable-region-focusable).
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

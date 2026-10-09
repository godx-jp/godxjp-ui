import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "../popover";

/**
 * v32 #1223 — HoverCard folds into `<Popover openOn="hover" openDelay closeDelay>`, TIMERS KEPT.
 * PARITY FIRST. This file was written against the retired `HoverCard` and drove both through the
 * same pointer/focus script, comparing the open/closed timeline at every step and the trigger and
 * open-card markup byte for byte. It was red until Popover learned `openOn="hover"`, then green,
 * and only then was HoverCard deleted. The timelines and snapshots below are HoverCard's.
 */
type Opts = { openDelay?: number; closeDelay?: number; open?: boolean };

const newTree = (o: Opts = {}) => (
  <Popover openOn="hover" openDelay={o.openDelay} closeDelay={o.closeDelay} open={o.open}>
    <PopoverTrigger asChild>
      <button type="button">株式会社ベトヤ</button>
    </PopoverTrigger>
    <PopoverContent side="top" align="start">
      取引先 · BTY-0012
    </PopoverContent>
  </Popover>
);

const card = () => document.querySelector('[data-slot="hover-card-content"]');
/** RAC ids are per-render (`react-aria-…`); everything else must match. */
const normalize = (html: string) => html.replace(/react-aria\d*-?[:\w-]*/g, "ID");

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

/** Drives one script and returns the open/closed timeline it produced. */
async function timeline(ui: (o: Opts) => ReactElement, o: Opts = {}) {
  const { unmount } = render(ui(o));
  const trigger = screen.getByRole("button", { name: "株式会社ベトヤ" });
  const states: string[] = [];
  const at = async (ms: number) => {
    await act(async () => {
      vi.advanceTimersByTime(ms);
    });
    states.push(card() ? "open" : "closed");
  };
  fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
  await at((o.openDelay ?? 200) - 1);
  await at(1);
  fireEvent.pointerLeave(trigger, { pointerType: "mouse" });
  await at((o.closeDelay ?? 100) - 1);
  // the pointer reaches the card before the close fires → it stays open
  fireEvent.pointerEnter(card()!, { pointerType: "mouse" });
  await at(500);
  fireEvent.pointerLeave(card()!, { pointerType: "mouse" });
  await at(o.closeDelay ?? 100);
  // touch never opens
  fireEvent.pointerEnter(trigger, { pointerType: "touch" });
  await at(1000);
  // keyboard focus opens and blur closes IMMEDIATELY
  act(() => trigger.focus());
  states.push(card() ? "open" : "closed");
  act(() => trigger.blur());
  await at(0);
  unmount();
  return states;
}

describe("HoverCard → <Popover openOn='hover'> parity (#1223)", () => {
  // [delay−1ms, delay, leave+close−1ms, card hovered 500ms, card left, touch, focus, blur]
  const HOVER_CARD_TIMELINE = [
    "closed",
    "open",
    "open",
    "open",
    "closed",
    "closed",
    "open",
    "closed",
  ];

  it("default 200/100ms timers: HoverCard's open/close timeline", async () => {
    expect(await timeline(newTree)).toEqual(HOVER_CARD_TIMELINE);
  });

  it("custom openDelay/closeDelay: HoverCard's timeline at the new instants", async () => {
    expect(await timeline(newTree, { openDelay: 700, closeDelay: 300 })).toEqual(
      HOVER_CARD_TIMELINE,
    );
  });

  it("the trigger and the open card render HoverCard's markup", () => {
    const { container } = render(newTree({ open: true }));
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<button type="button" data-state="open">株式会社ベトヤ</button>"`,
    );
    expect(normalize(card()!.outerHTML)).toMatchInlineSnapshot(
      `"<div dir="ltr" data-slot="hover-card-content" data-side="top" data-align="start" data-state="open" class="ui-hover-card-content origin-[var(--radix-hover-card-content-transform-origin)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2" style="position: absolute; z-index: 100000; max-height: 0px; --radix-hover-card-content-transform-origin: var(--trigger-anchor-point); --trigger-anchor-point: -12px 0px; --trigger-width: 0px; left: 12px; bottom: 4px;" data-placement="top">取引先 · BTY-0012</div>"`,
    );
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { ScrollArea } from "../scroll-area";

/**
 * `scrollbar="always"` — AN AFFORDANCE THE PLATFORM WOULD NOT DRAW (gh#798).
 *
 * `scrollbar-width` / `scrollbar-color` style whatever bar the platform decides to draw. On
 * macOS/iPadOS with the system default "Show scroll bars: when scrolling" that decision is an
 * OVERLAY bar — present only while the reader is already scrolling. So the tokens styled a bar
 * nobody saw, and a wide area did not read as scrollable at rest. Measured by a consumer on a
 * 31-column roster: clientWidth 727, scrollWidth 3476, `offsetHeight - clientHeight` = 2px — the
 * border twice, and no bar occupying layout. A manager said it showed "only five days".
 *
 * jsdom does no layout and paints no scrollbars, so what is pinned here is the contract: the
 * attribute the CSS keys on, and the rules that key on it.
 */
const css = readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");
const tokens = readFileSync(join(process.cwd(), "src/tokens/components/scroll-area.css"), "utf8");

describe("ScrollArea scrollbar (gh#798)", () => {
  it("defaults to auto, so nothing moves for anyone using it today", () => {
    renderWithUi(<ScrollArea aria-label="log">x</ScrollArea>);
    expect(screen.getByLabelText("log")).toHaveAttribute("data-scrollbar", "auto");
  });

  it("publishes the always value for the CSS to key on", () => {
    renderWithUi(
      <ScrollArea scrollbar="always" orientation="both" aria-label="roster">
        x
      </ScrollArea>,
    );
    const el = screen.getByLabelText("roster");
    expect(el).toHaveAttribute("data-scrollbar", "always");
    // The axes are still the orientation's business — `scrollbar` says how the bar is DRAWN, never
    // which axis may overflow.
    expect(el).toHaveAttribute("data-orientation", "both");
  });

  it("draws the bar through ::-webkit-scrollbar, which overlay mode still honours", () => {
    // The standard properties cannot force a bar that the platform has decided to overlay; the
    // pseudo-elements can, in Chrome and Safari. That is the entire mechanism.
    expect(css).toMatch(/\[data-scrollbar="always"\]::-webkit-scrollbar\b/);
    expect(css).toMatch(/\[data-scrollbar="always"\]::-webkit-scrollbar-thumb/);
    expect(css).toMatch(/\[data-scrollbar="always"\]::-webkit-scrollbar-track/);
  });

  it("reads the SAME colour knobs as the platform bar, not a second palette", () => {
    // A second palette would drift: a `[data-tenant]` retint of the thumb would reach one bar and
    // not the other. Only the two geometry knobs are new, because an always-on bar is drawn by
    // this package and therefore has a size this package must name.
    const always = css.slice(css.indexOf('[data-scrollbar="always"]::-webkit-scrollbar-track'));
    expect(always).toMatch(/var\(--scroll-area-track-color, transparent\)/);
    expect(always).toMatch(/var\(--scroll-area-thumb-color, hsl\(var\(--border\)\)\)/);
    expect(tokens).toMatch(/--scroll-area-always-bar-size:/);
    expect(tokens).toMatch(/--scroll-area-always-thumb-radius:/);
  });

  it("uses the full-width bar, not the `thin` token, when it is always on", () => {
    // A thin always-on bar is harder to grab than the platform one, and this value is chosen
    // exactly where the affordance matters.
    expect(css).toMatch(/\[data-scrollbar="always"\]\s*\{[^}]*scrollbar-width:\s*auto;/s);
  });
});

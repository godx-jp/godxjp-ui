import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { DatePicker } from "../date-picker";
import { TimePicker } from "../time-picker";

/**
 * `width` ON THE PICKERS (gh#799).
 *
 * CONSUMER-RULES §5 — "a control outside a form takes `width="auto"`" — and `Select` has carried
 * `width` since gh#375. The pickers carried none, so the ONE control in a toolbar with a known
 * content width was the one that could not be sized: a consumer measured a month picker showing
 * `2026/09` at 275px against the 144px box it replaced, because with no prop it falls to the flex
 * default and stretches.
 *
 * Mapped exactly as `Select` maps it, including the part that is easy to get wrong: `bounded`
 * emits NO utility, because control.css owns that width and a utility would win the layer order
 * and make the token dead (gh#366, gh#371).
 */
const box = (testid: string) =>
  screen.getByTestId(testid).querySelector<HTMLElement>(".ui-control");

describe("DatePicker width (gh#799)", () => {
  it.each(["auto", "full", "bounded"] as const)(
    "publishes width=%s on the control box",
    (width) => {
      renderWithUi(
        <div data-testid="host">
          <DatePicker width={width} aria-label="月" />
        </div>,
      );
      expect(box("host")).toHaveAttribute("data-width", width);
    },
  );

  it("sizes `bounded` FROM THE TOKEN, past the width Input bakes in", () => {
    renderWithUi(
      <div data-testid="bounded">
        <DatePicker width="bounded" aria-label="月" />
      </div>,
    );
    const bounded = box("bounded")!;
    // The CONTRACT is "this width comes from `--control-bounded-width`" — not which utility spells
    // it. Asserted by naming the token, so a change of spelling that still reads the token passes
    // and a hard-coded rem fails.
    expect(bounded.className, "bounded must resolve --control-bounded-width").toContain(
      "--control-bounded-width",
    );
    // `bounded` DIFFERS from Select, and the difference is forced. Select's trigger emits no width
    // utility so `[data-width="bounded"]` in control.css can own it — that works because the
    // trigger has no baked width. `Input` DOES bake `w-full`, and a utility beats a
    // `@layer components` rule, so the CSS rule could never reach it: the token would be dead in
    // exactly the way gh#366 describes, silently. So the utility is emitted FROM the token, which
    // keeps the token the single source and lets tailwind-merge drop the baked `w-full`.
    // Word-boundary anchored on WHITESPACE, not `\b`: `\bw-full\b` also matches inside
    // `max-w-full`, which this very class list contains — the assertion would fail on a correct
    // result. Caught by writing it wrong first.
    expect(
      ` ${bounded.className} `,
      "the baked w-full must be gone, not merely overridden",
    ).not.toMatch(/\sw-full\s/);
  });

  it("carries no width attribute when the prop is omitted, so nothing moves for existing callers", () => {
    renderWithUi(
      <div data-testid="host">
        <DatePicker aria-label="月" />
      </div>,
    );
    expect(box("host")).not.toHaveAttribute("data-width");
  });

  it("reaches the RANGE field too, which is a different element from the single one", () => {
    renderWithUi(
      <div data-testid="host">
        <DatePicker range width="auto" aria-label="期間" />
      </div>,
    );
    const field = screen.getByTestId("host").querySelector(".ui-control-composite-field");
    expect(field).toHaveAttribute("data-width", "auto");
  });
});

describe("TimePicker width (gh#799)", () => {
  it.each(["auto", "full", "bounded"] as const)("publishes width=%s", (width) => {
    renderWithUi(
      <div data-testid="host">
        <TimePicker width={width} aria-label="時刻" />
      </div>,
    );
    expect(box("host")).toHaveAttribute("data-width", width);
  });

  it("keeps its own tabular-nums class when width is set", () => {
    // The width is folded into the EXISTING className rather than a second attribute — two
    // `className` props on one element is a TS error, and the first silently wins in JSX. This
    // names `tabular-nums` because that one IS the component's promise (a time reads in a fixed
    // column), unlike the width utility, which is only how the promise is painted today.
    renderWithUi(
      <div data-testid="host">
        <TimePicker width="auto" aria-label="時刻" />
      </div>,
    );
    const el = box("host")!;
    expect(el).toHaveClass("tabular-nums");
    expect(el).toHaveAttribute("data-width", "auto");
  });
});

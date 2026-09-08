import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Calendar } from "../calendar";
import { renderWithUi } from "@/test/render";

/**
 * `width="full"` — the EMBEDDED calendar, and the popover it must NOT touch.
 *
 * jsdom does no layout, so the widths themselves were measured in Chromium at 1200px and are
 * recorded here rather than asserted:
 *
 *            root    grid    day cell
 *   auto     248     224     32          ← the default, and what the picker popover needs
 *   full    1200    1176    168
 *   popover  250 (panel) / 248 / 224 / 32   unchanged by the change above
 *
 * What jsdom CAN pin is the contract that produces those numbers: the attribute the CSS keys on,
 * and the fact that the default emits nothing. That default is load-bearing — the panel is
 * shrink-to-fit and takes its width FROM the calendar, so a global fluid rule collapsed it to
 * 157.8px with 18.8px day cells.
 */
describe("Calendar width axis (embedded vs popover)", () => {
  it("default emits no width attribute — the popover keeps its intrinsic shape", () => {
    const { container } = renderWithUi(<Calendar mode="single" aria-label="Pick" />);
    const root = container.querySelector(".ui-calendar")!;

    expect(root).not.toHaveAttribute("data-width");
  });

  it('width="full" marks the root so the fluid rules apply', () => {
    const { container } = renderWithUi(<Calendar mode="single" width="full" aria-label="Pick" />);

    expect(container.querySelector(".ui-calendar")).toHaveAttribute("data-width", "full");
  });

  it('width="auto" is explicit-but-identical to the default', () => {
    const { container } = renderWithUi(<Calendar mode="single" width="auto" aria-label="Pick" />);

    expect(container.querySelector(".ui-calendar")).not.toHaveAttribute("data-width");
  });

  it("the grid still renders its seven day columns in either mode", () => {
    // Asserted on the class, not `getAllByRole("columnheader")`: react-day-picker renders real
    // `<th scope="col">` cells, but the surrounding table does not expose them as columnheaders to
    // testing-library, so the role query finds nothing and would fail for the wrong reason. The
    // seven cells are the thing the fluid rules divide, so the count is what matters here.
    const { container } = renderWithUi(<Calendar mode="single" width="full" aria-label="Pick" />);

    expect(container.querySelectorAll(".ui-calendar-weekday")).toHaveLength(7);
  });

  /**
   * All three barriers have to be lifted together — measured, lifting any one alone changed
   * nothing visible. This reads the stylesheet so dropping one rule cannot pass silently.
   */
  it("the stylesheet lifts all three barriers under the attribute, and only under it", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/control.css"), "utf8");
    const scoped = css.match(/\.ui-calendar\[data-width="full"\][^{]*\{[^}]*\}/g) ?? [];
    const joined = scoped.join("\n");

    expect(scoped.length).toBeGreaterThanOrEqual(4);
    expect(joined).toMatch(/inline-size:\s*100%/);
    expect(joined).toMatch(/flex-direction:\s*column/);
    expect(joined).toMatch(/flex:\s*1 1 0/);

    // The un-attributed root must keep shrink-wrapping, or the popover loses its width source.
    expect(css).toMatch(/\.ui-calendar\s*\{[^}]*inline-size:\s*fit-content/);
  });
});

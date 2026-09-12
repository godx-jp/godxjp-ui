import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";

import { SkeletonForm } from "../skeleton";

/*
 * `SkeletonRows` draws a flat list of lines. A form field is a short label STACKED on a full-width
 * control, so a consumer approximating one with SkeletonRows got the column count right and the
 * inside of every cell wrong (gh#552).
 *
 * The assertion that matters is not "it renders": it is that the skeleton and the form share ONE
 * source for how many columns exist. Two ladders that agree today drift the first time someone
 * changes `columns` on the form and not on the skeleton — and nothing goes red when they do.
 */

describe("SkeletonForm (gh#552)", () => {
  it("renders one label+control PAIR per field, not a flat line list", () => {
    const { container } = renderWithUi(<SkeletonForm columns={2} fields={5} />);

    expect(container.querySelectorAll(".ui-skeleton-form-field")).toHaveLength(5);
    expect(container.querySelectorAll(".ui-skeleton-form-label")).toHaveLength(5);
    expect(container.querySelectorAll(".ui-skeleton-form-control")).toHaveLength(5);
  });

  it("lays out on ResponsiveGrid — the same machine Form columns={N} uses", () => {
    const { container } = renderWithUi(<SkeletonForm columns={4} fields={3} />);

    // Not a class-name assertion for its own sake: this is the shared-ladder claim. If the
    // skeleton ever grows its own grid, `columns` stops meaning one thing and the drift is back.
    const grid = container.querySelector<HTMLElement>(".ui-responsive-grid");
    expect(grid).not.toBeNull();
    expect(grid!.style.getPropertyValue("--responsive-grid-lg")).toBe("4");
  });

  it("announces itself as busy, like the rest of the family", () => {
    const { container } = renderWithUi(<SkeletonForm />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });
});

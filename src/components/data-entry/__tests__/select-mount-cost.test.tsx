import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { Select } from "../select";

/*
 * gh#557 — Select was ~280µs/row through `react-dom/server` (2,000 rows, median of 3) with no CPU
 * hot spot. Counting allocations: react-aria `HiddenSelect` built (N+1) `<option>` nodes per
 * instance even without `name`/`form`. Removing that build path (vendor patch) took ~5 opts from
 * ~251µs to ~207µs/row and `<option>`/row from 6 to 0; named fields keep the hidden select.
 */

function hiddenOptionsPerRow(optionCount: number, extra?: { name?: string }) {
  const rows = 10;
  const { container } = renderWithUi(
    <>
      {Array.from({ length: rows }, (_, i) => (
        <Select
          key={i}
          aria-label="status"
          options={Array.from({ length: optionCount }, (_, j) => ({
            value: String(j + 1),
            label: `O${j + 1}`,
          }))}
          defaultValue="1"
          {...extra}
        />
      ))}
    </>,
  );
  const hiddenOptions = container.querySelectorAll(
    '[data-testid="hidden-select-container"] option',
  ).length;
  return hiddenOptions / rows;
}

describe("Select mount cost — hidden <select> mirrors options only when submitted (gh#557)", () => {
  it("unnamed instances do not build hidden <option> rows", () => {
    expect(hiddenOptionsPerRow(5)).toBe(0);
    expect(hiddenOptionsPerRow(20)).toBe(0);
  });

  it("named instances still build one hidden <option> per data option (+ placeholder)", () => {
    // Placeholder option + five data options = 6 per row (react-aria HiddenSelect).
    expect(hiddenOptionsPerRow(5, { name: "status" })).toBe(6);
  });
});

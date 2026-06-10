import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithUi } from "@/test/render";

import { Select } from "../select";

/**
 * Regression: a *controlled* data-Select fed `value=""` (the unselected
 * state every FormField produces) must stay controlled when the parent
 * later sets a real value. The old code did `value={value || undefined}`,
 * which collapsed "" → undefined → Radix saw no `value` prop → it ran
 * uncontrolled, then flipped back to controlled on first pick. React logs
 * "Select is changing from uncontrolled to controlled" for exactly that.
 *
 * We assert React never logs that warning across the empty→filled rerender.
 */
const OPTIONS = [
  { value: "draft", label: "下書き" },
  { value: "fixed", label: "仮確定" },
];

afterEach(() => vi.restoreAllMocks());

describe("Select (data) controlled-ness with empty value", () => {
  it("stays controlled across an empty → filled value change (no React warning)", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { rerender } = renderWithUi(
      <Select value="" options={OPTIONS} placeholder="選択" onValueChange={() => {}} />,
    );
    // Parent commits a real selection — the empty controlled value becomes a real one.
    rerender(
      <Select value="fixed" options={OPTIONS} placeholder="選択" onValueChange={() => {}} />,
    );
    // …and back to empty (clear), which previously flipped controlled → uncontrolled too.
    rerender(<Select value="" options={OPTIONS} placeholder="選択" onValueChange={() => {}} />);

    const flip = spy.mock.calls.find(
      (args) =>
        String(args[0]).includes("changing from uncontrolled to controlled") ||
        String(args[0]).includes("changing from controlled to uncontrolled"),
    );
    expect(flip).toBeUndefined();
  });
});

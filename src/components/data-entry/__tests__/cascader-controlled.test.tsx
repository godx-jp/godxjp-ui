import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Cascader } from "../cascader";
import { REGION_OPTIONS } from "../__fixtures__/tree-options";

describe("Cascader — controlled single value", () => {
  it("selecting a leaf emits onValueChange without mutating internal state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Cascader options={REGION_OPTIONS} value={["jp"]} onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /việt nam/i }));
    await user.click(screen.getByRole("option", { name: /tp\. hồ chí minh/i }));
    await user.click(screen.getByRole("option", { name: /quận 1/i }));
    // controlled → setSingleValue skips setInternalSingle but still emits
    expect(onValueChange).toHaveBeenCalledWith(["vn", "hcm", "q1"], expect.any(Array));
  });
});

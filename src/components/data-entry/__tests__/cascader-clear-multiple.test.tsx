import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Cascader } from "../cascader";
import { REGION_OPTIONS } from "../__fixtures__/tree-options";

describe("Cascader — clear in multiple mode", () => {
  it("the clear icon commits an empty selection via commitMulti", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Cascader
        options={REGION_OPTIONS}
        multiple
        defaultValue={[["vn", "hcm", "q1"]]}
        onValueChange={onValueChange}
      />,
    );
    const clearButton = screen.getByRole("button", { name: /xóa lựa chọn/i });
    await user.click(clearButton);
    // multiple branch of clearValue → commitMulti([])
    expect(onValueChange).toHaveBeenLastCalledWith([], expect.anything());
  });
});

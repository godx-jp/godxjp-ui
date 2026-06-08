import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Cascader } from "../cascader";
import { REGION_OPTIONS } from "../__fixtures__/tree-options";

describe("Cascader — controlled multiple value", () => {
  it("toggling a leaf emits onValueChange without mutating internal state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Cascader
        options={REGION_OPTIONS}
        multiple
        showSearch
        value={[]}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByPlaceholderText(/tìm kiếm/i), "quận 1");
    await user.click(await screen.findByRole("option", { name: /quận 1/i }));
    // controlled multi → commitMulti skips setInternalMulti but still emits
    expect(onValueChange).toHaveBeenCalledWith([["vn", "hcm", "q1"]], expect.anything());
  });
});

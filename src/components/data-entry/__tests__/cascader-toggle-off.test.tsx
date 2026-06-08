import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { Cascader } from "../cascader";
import { REGION_OPTIONS } from "../__fixtures__/tree-options";

describe("Cascader — multiple toggle off", () => {
  it("re-selecting a checked leaf removes it (togglePath filter branch)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Cascader options={REGION_OPTIONS} multiple showSearch onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("combobox"));

    const search = screen.getByPlaceholderText(/tìm kiếm/i);
    await user.type(search, "quận 1");
    await user.click(await screen.findByRole("option", { name: /quận 1/i }));
    expect(onValueChange).toHaveBeenLastCalledWith([["vn", "hcm", "q1"]], expect.anything());

    // re-select the same leaf → pathInValues true → filter it out
    await user.clear(search);
    await user.type(search, "quận 1");
    await user.click(await screen.findByRole("option", { name: /quận 1/i }));
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith([], expect.anything()));
  });
});

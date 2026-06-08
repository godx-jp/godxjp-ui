import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Cascader } from "../cascader";
import { REGION_OPTIONS } from "../__fixtures__/tree-options";

describe("Cascader — selected-leaf checkmark in search results", () => {
  it("shows the checkmark on the selected result and hides it on the others", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Cascader options={REGION_OPTIONS} showSearch defaultValue={["vn", "hcm", "q1"]} />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByPlaceholderText(/tìm kiếm/i), "quận"); // matches Quận 1 + Quận 3

    const q1 = await screen.findByRole("option", { name: /quận 1/i });
    const q3 = screen.getByRole("option", { name: /quận 3/i });
    expect(q1.querySelector('[class*="opacity-100"]')).not.toBeNull(); // selected → visible
    expect(q3.querySelector('[class*="opacity-0"]')).not.toBeNull(); // unselected → hidden
  });
});

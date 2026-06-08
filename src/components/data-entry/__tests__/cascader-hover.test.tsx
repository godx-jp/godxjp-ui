import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Cascader } from "../cascader";
import { REGION_OPTIONS } from "../__fixtures__/tree-options";

describe("Cascader — hover expand", () => {
  it("hovering a parent opens its children column", async () => {
    const user = userEvent.setup();
    renderWithUi(<Cascader options={REGION_OPTIONS} expandTrigger="hover" placeholder="地域" />);
    await user.click(screen.getByRole("combobox"));
    // first column only, until we hover a parent
    expect(screen.queryByText("TP. Hồ Chí Minh")).toBeNull();

    await user.hover(screen.getByText("Việt Nam"));
    expect(screen.getByText("TP. Hồ Chí Minh")).toBeInTheDocument();

    // hovering deeper opens the grandchildren column
    await user.hover(screen.getByText("TP. Hồ Chí Minh"));
    expect(screen.getByText("Quận 1")).toBeInTheDocument();
  });
});

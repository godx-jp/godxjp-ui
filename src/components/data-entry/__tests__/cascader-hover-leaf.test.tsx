import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Cascader } from "../cascader";
import { REGION_OPTIONS } from "../__fixtures__/tree-options";

describe("Cascader — hover over a leaf", () => {
  it("hovering a leaf keeps its column (collapses any deeper level)", async () => {
    const user = userEvent.setup();
    renderWithUi(<Cascader options={REGION_OPTIONS} expandTrigger="hover" placeholder="地域" />);
    await user.click(screen.getByRole("combobox"));
    await user.hover(screen.getByText("Việt Nam")); // parent → children column
    await user.hover(screen.getByText("TP. Hồ Chí Minh")); // parent → grandchildren column

    // hovering a leaf takes the `path.slice(0, -1)` branch — its own column stays visible
    await user.hover(screen.getByText("Quận 1"));
    expect(screen.getByText("Quận 1")).toBeInTheDocument();
    expect(screen.getByText("Quận 3")).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Cascader } from "../cascader";

const TREE = [
  {
    value: "cat",
    label: "カテゴリ",
    disabled: true,
    children: [{ value: "a", label: "子項目" }],
  },
];

describe("Cascader — hover on a disabled parent", () => {
  it("does not expand a disabled parent on hover (the !node.disabled guard)", async () => {
    const user = userEvent.setup();
    renderWithUi(<Cascader options={TREE} expandTrigger="hover" placeholder="地域" />);
    await user.click(screen.getByRole("combobox"));
    await user.hover(screen.getByText("カテゴリ"));
    // disabled → onMouseEnter handler is undefined → the children column never opens
    expect(screen.queryByText("子項目")).toBeNull();
  });
});

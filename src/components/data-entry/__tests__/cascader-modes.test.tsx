import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Cascader } from "../cascader";
import { REGION_OPTIONS } from "../__fixtures__/tree-options";

describe("Cascader — clear / hover / disabled", () => {
  it("allowClear: the clear affordance resets the selection", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Cascader
        options={REGION_OPTIONS}
        defaultValue={["vn", "hcm", "q1"]}
        allowClear
        onValueChange={onValueChange}
      />,
    );
    // the clear button is the non-combobox button sitting on the trigger
    const clearBtn = screen
      .getAllByRole("button")
      .find((b) => b.getAttribute("role") !== "combobox");
    expect(clearBtn).toBeTruthy();
    await user.click(clearBtn!);
    expect(onValueChange).toHaveBeenCalled();
    const [val] = onValueChange.mock.calls.at(-1)!;
    expect(val).toEqual([]);
  });

  it("expandTrigger='hover' expands a parent on hover", async () => {
    const user = userEvent.setup();
    renderWithUi(<Cascader options={REGION_OPTIONS} expandTrigger="hover" />);
    await user.click(screen.getByRole("combobox"));
    // before hover, the second-level option is not shown
    expect(screen.queryByRole("option", { name: /tp\. hồ chí minh/i })).toBeNull();
    await user.hover(screen.getByRole("option", { name: /việt nam/i }));
    expect(await screen.findByRole("option", { name: /tp\. hồ chí minh/i })).toBeInTheDocument();
  });

  it("disabled trigger is inert", () => {
    renderWithUi(<Cascader options={REGION_OPTIONS} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("controlled value reflects on the trigger", () => {
    renderWithUi(<Cascader options={REGION_OPTIONS} value={["jp", "tokyo", "shinjuku"]} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("日本 / 東京都 / 新宿区");
  });
});

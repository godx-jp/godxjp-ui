import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../select";

describe("Select — grouped content (label + separator)", () => {
  it("renders a labelled group, a separator and selectable items", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select defaultValue="apple">
        <SelectTrigger aria-label="果物">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>フルーツ</SelectLabel>
            <SelectItem value="apple">りんご</SelectItem>
            <SelectSeparator />
            <SelectItem value="banana">バナナ</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    await user.click(screen.getByRole("combobox", { name: "果物" }));
    const listbox = await screen.findByRole("listbox");
    // the group label renders
    expect(screen.getByText("フルーツ")).toBeInTheDocument();
    // both options are present and selectable
    expect(screen.getByRole("option", { name: "りんご" })).toBeInTheDocument();
    const banana = screen.getByRole("option", { name: "バナナ" });
    // a separator divides the group
    expect(listbox.querySelector('[data-slot="select-separator"]')).not.toBeNull();

    await user.click(banana);
    expect(screen.getByRole("combobox", { name: "果物" })).toHaveTextContent("バナナ");
  });
});

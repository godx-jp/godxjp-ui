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

  /**
   * gh#643 — a `listbox` may own `option` and `group`, and `separator` is not on that list. The
   * divider used to render react-aria's `<Separator>`, i.e. `role="separator"`, straight into the
   * viewport; axe's `aria-required-children` fired CRITICAL on the whole listbox and only ever with
   * the list OPEN, which is why the frame gate could not see it until it grew an overlay scope.
   */
  it("the open listbox owns no role=separator (aria-required-children)", async () => {
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
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>野菜</SelectLabel>
            <SelectItem value="carrot">にんじん</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    await user.click(screen.getByRole("combobox", { name: "果物" }));
    const listbox = await screen.findByRole("listbox");
    const separator = listbox.querySelector('[data-slot="select-separator"]');
    expect(separator).not.toBeNull();
    expect(separator).toHaveAttribute("aria-hidden", "true");
    // The options either side of it must still exist — see the note on `SelectSeparator`: it is a
    // react-aria COLLECTION node, and replacing it with a plain element truncates the collection.
    expect(screen.getByRole("option", { name: "りんご" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "にんじん" })).toBeInTheDocument();
  });
});

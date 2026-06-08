import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { SearchSelect } from "../search-select";

const OPTIONS = [
  { value: "1", label: "現金" },
  { value: "2", label: "普通預金" },
  { value: "3", label: "売上" },
];

const trigger = () => screen.getByRole("combobox");

describe("SearchSelect — static options / uncontrolled / clear / empty", () => {
  it("shows a defaultValue's label at rest (uncontrolled, #102)", () => {
    renderWithUi(<SearchSelect options={OPTIONS} defaultValue="2" />);
    expect(trigger()).toHaveTextContent("普通預金");
  });

  it("uncontrolled: selecting updates the trigger label without external state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<SearchSelect options={OPTIONS} onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.click(await screen.findByRole("option", { name: "売上" }));
    expect(onValueChange).toHaveBeenCalledWith("3", expect.objectContaining({ value: "3" }));
    expect(trigger()).toHaveTextContent("売上");
  });

  it("clearable: the clear row resets the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <SearchSelect options={OPTIONS} defaultValue="1" clearable onValueChange={onValueChange} />,
    );
    await user.click(trigger());
    // when a value is set + clearable, the FIRST listbox row is the clear entry (value "")
    const options = screen.getAllByRole("option");
    await user.click(options[0]);
    expect(onValueChange).toHaveBeenCalledWith("", undefined);
  });

  it("shows the empty message when a query matches nothing", async () => {
    const user = userEvent.setup();
    renderWithUi(<SearchSelect options={OPTIONS} emptyMessage="該当なし" />);
    await user.click(trigger());
    await user.type(screen.getByRole("textbox"), "zzz該当しない");
    expect(await screen.findByText("該当なし")).toBeInTheDocument();
  });

  it("uses selectedLabel for a value whose option is not loaded", () => {
    renderWithUi(<SearchSelect value="999" selectedLabel="読込中の科目" />);
    expect(trigger()).toHaveTextContent("読込中の科目");
  });
});

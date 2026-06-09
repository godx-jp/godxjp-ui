import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { SearchSelect } from "../search-select";

const OPTIONS = [
  { value: "1", label: "Tanaka", icon: <span data-testid="ic-1">★</span> },
  { value: "2", label: "Suzuki", icon: <span data-testid="ic-2">♦</span> },
];

const trigger = () => screen.getByRole("combobox");

describe("SearchSelect — option icon", () => {
  it("shows the selected option's icon on the trigger", () => {
    renderWithUi(<SearchSelect options={OPTIONS} defaultValue="1" />);
    // trigger shows the label AND the icon for the selected option
    expect(trigger()).toHaveTextContent("Tanaka");
    expect(screen.getByTestId("ic-1")).toBeInTheDocument();
  });

  it("renders the icon in option rows and swaps the trigger icon on select", async () => {
    const user = userEvent.setup();
    renderWithUi(<SearchSelect options={OPTIONS} defaultValue="1" />);

    await user.click(trigger());
    // both option rows render their icons
    expect(screen.getAllByTestId("ic-2").length).toBeGreaterThan(0);

    await user.click(await screen.findByRole("option", { name: /Suzuki/ }));
    // trigger now reflects the newly-selected option's icon + label
    expect(trigger()).toHaveTextContent("Suzuki");
  });

  it("uses selectedIcon on the trigger when the value's option is not loaded (async preset)", () => {
    renderWithUi(
      <SearchSelect
        value="999"
        selectedLabel="読込中の科目"
        selectedIcon={<span data-testid="sel-ic">◎</span>}
      />,
    );
    expect(trigger()).toHaveTextContent("読込中の科目");
    expect(screen.getByTestId("sel-ic")).toBeInTheDocument();
  });
});

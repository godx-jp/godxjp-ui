import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Select } from "../select";

const OPTIONS = [
  { value: "jpy", label: "日本円", group: "アジア" },
  { value: "vnd", label: "ドン", group: "アジア" },
  { value: "usd", label: "米ドル" }, // ungrouped
];

describe("Select (options data API)", () => {
  it("renders grouped headings, ungrouped items, custom renderOption + option test ids", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        options={OPTIONS}
        placeholder="通貨"
        data-testid="cur"
        renderOption={(o) => <span>★{o.label}</span>}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    // grouped heading renders (branch: group.heading truthy)
    expect(screen.getByText("アジア")).toBeInTheDocument();
    // custom renderOption is used for the label
    expect(screen.getByText("★日本円")).toBeInTheDocument();
    expect(screen.getByText("★米ドル")).toBeInTheDocument(); // ungrouped Fragment branch
    // optionTestId derives from data-testid
    expect(screen.getByTestId("cur-option-jpy")).toBeInTheDocument();
  });

  it("falls back to the option label when no renderOption is given", async () => {
    const user = userEvent.setup();
    renderWithUi(<Select options={[{ value: "x", label: "プレーン" }]} placeholder="p" />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByText("プレーン")).toBeInTheDocument();
  });
});

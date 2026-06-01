import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { Label } from "../label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";

describe("Label", () => {
  it("associates with control via htmlFor", () => {
    renderWithUi(
      <>
        <Label htmlFor="hawb">Mã HAWB</Label>
        <input id="hawb" aria-label="Mã HAWB" />
      </>,
    );
    expect(screen.getByText("Mã HAWB")).toHaveAttribute("for", "hawb");
    expect(screen.getByText("Mã HAWB")).toHaveAttribute("data-slot", "label");
  });
});

describe("Select", () => {
  it("opens listbox and selects an option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(
      <Select onValueChange={onChange}>
        <SelectTrigger aria-label="Hub">
          <SelectValue placeholder="Chọn hub" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="osaka">Osaka</SelectItem>
          <SelectItem value="tokyo">Tokyo</SelectItem>
        </SelectContent>
      </Select>,
    );

    await user.click(screen.getByRole("combobox", { name: "Hub" }));
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Osaka" })).toHaveAttribute(
        "data-slot",
        "select-item",
      );
    });
    await user.click(screen.getByRole("option", { name: "Osaka" }));
    expect(onChange).toHaveBeenCalledWith("osaka");
  });

  it("SelectTrigger uses ui-control from control-styles", () => {
    renderWithUi(
      <Select>
        <SelectTrigger aria-label="Hub">
          <SelectValue placeholder="Chọn hub" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="osaka">Osaka</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole("combobox", { name: "Hub" });
    expect(trigger).toHaveClass("ui-control");
    expect(trigger).toHaveAttribute("data-slot", "select-trigger");
    expect(trigger).toHaveAttribute("data-size", "default");
  });
});

describe("Select (data-driven, Ant-style)", () => {
  it("renders a no-search Radix listbox when given options without showSearch", () => {
    renderWithUi(
      <Select
        value=""
        onChange={() => undefined}
        placeholder="Pick"
        options={[{ value: "1", label: "Cash" }]}
      />,
    );
    // No search box — it's the plain Radix listbox trigger.
    expect(screen.getByRole("combobox")).toHaveAttribute("data-slot", "select-trigger");
  });

  it("becomes a searchable combobox with showSearch (one Select, Ant-style)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(
      <Select
        value=""
        onChange={onChange}
        showSearch
        options={[
          { value: "1", label: "Cash" },
          { value: "2", label: "Sales" },
        ]}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    // The search box appears (SearchSelect engine) and selecting fires onChange with the option.
    expect(await screen.findByRole("textbox")).toBeInTheDocument();
    await user.click(await screen.findByText("Sales"));
    expect(onChange).toHaveBeenCalledWith("2", expect.objectContaining({ value: "2" }));
  });
});

import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { Calendar } from "../calendar";
import { DatePicker } from "../date-picker";
import { DateRangePicker } from "../date-range-picker";
import { Autocomplete } from "../autocomplete";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "../command";

describe("Calendar", () => {
  it("renders month grid", () => {
    renderWithUi(<Calendar mode="single" />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });
});

describe("DatePicker", () => {
  it("shows placeholder and opens calendar popover", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker placeholder="Chọn ngày ETD" />);
    const trigger = screen.getByRole("button", { name: /chọn ngày etd/i });
    expect(trigger).toBeInTheDocument();
    await user.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });
  });

  it("calls onChange when a day is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(<DatePicker value={new Date(2026, 4, 1)} onChange={onChange} />);
    await user.click(screen.getByRole("button"));
    const dayButtons = screen.getAllByRole("gridcell").filter((cell) => cell.textContent === "15");
    const dayButton = dayButtons[0]?.querySelector("button");
    expect(dayButton).toBeTruthy();
    if (dayButton) await user.click(dayButton);
    expect(onChange).toHaveBeenCalled();
  });
});

describe("DateRangePicker", () => {
  it("renders trigger with formatted range", () => {
    renderWithUi(
      <DateRangePicker
        value={{ from: new Date(2026, 4, 1), to: new Date(2026, 4, 10) }}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("01/05/2026");
    expect(screen.getByRole("button")).toHaveTextContent("10/05/2026");
  });
});

describe("Autocomplete", () => {
  const options = [
    { value: "osaka", label: "Osaka Hub" },
    { value: "tokyo", label: "Tokyo Hub" },
  ];

  it("opens list and selects option", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Autocomplete
        options={options}
        value="osaka"
        onValueChange={onValueChange}
        placeholder="Chọn hub"
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Tokyo Hub" }));
    expect(onValueChange).toHaveBeenCalledWith("tokyo");
  });
});

describe("Command", () => {
  it("filters items by search input", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Command>
        <CommandInput placeholder="Tìm HAWB" />
        <CommandList>
          <CommandEmpty>Không có kết quả</CommandEmpty>
          <CommandItem value="GX-001">GX-001</CommandItem>
          <CommandItem value="GX-002">GX-002</CommandItem>
        </CommandList>
      </Command>,
    );
    await user.type(screen.getByPlaceholderText("Tìm HAWB"), "002");
    expect(screen.getByText("GX-002")).toBeInTheDocument();
    expect(screen.queryByText("GX-001")).not.toBeInTheDocument();
  });
});

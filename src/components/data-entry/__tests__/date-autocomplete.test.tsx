import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { Calendar } from "../calendar";
import { DatePicker } from "../date-picker";
import { DateRangePicker } from "../date-range-picker";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "../command";

describe("Calendar", () => {
  it("renders month grid", () => {
    renderWithUi(<Calendar mode="single" />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });
});

describe("DatePicker", () => {
  it("exposes a typeable combobox input and opens the calendar via the icon", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker placeholder="Chọn ngày ETD" />);
    // The value lives on a real, typeable input (WAI-ARIA date combobox) — not a button.
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("placeholder", "Chọn ngày ETD");
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });
  });

  it("emits an ISO-8601 value when the user types, and submits as a form field", async () => {
    const onChange = vi.fn();
    renderWithUi(<DatePicker name="etd" onValueChange={onChange} />);
    const input = screen.getByRole<HTMLInputElement>("combobox");
    // Enter a complete ISO date in one edit (the input self-normalises while typing,
    // which would otherwise fight a char-by-char simulation).
    fireEvent.change(input, { target: { value: "2024-04-15" } });
    expect(onChange).toHaveBeenCalled();
    // The parsed date round-trips back to the ISO value the user committed.
    expect(onChange).toHaveBeenLastCalledWith(new Date(2024, 3, 15));
    // Form-submittable: the input carries the name and the ISO value.
    expect(input).toHaveAttribute("name", "etd");
    expect(input.value).toBe("2024-04-15");
  });

  it("calls onChange when a day is selected from the calendar", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(<DatePicker value={new Date(2026, 4, 1)} onValueChange={onChange} />);
    await user.click(screen.getByRole("button"));
    const dayButtons = screen.getAllByRole("gridcell").filter((cell) => cell.textContent === "15");
    const dayButton = dayButtons[0]?.querySelector("button");
    expect(dayButton).toBeTruthy();
    if (dayButton) await user.click(dayButton);
    expect(onChange).toHaveBeenCalled();
  });
});

describe("DateRangePicker", () => {
  it("renders editable ISO inputs for the range edges and submits as form fields", () => {
    renderWithUi(
      <DateRangePicker
        value={{ from: new Date(2026, 4, 1), to: new Date(2026, 4, 10) }}
        onValueChange={() => undefined}
        name="period"
      />,
    );
    const from = screen.getByRole<HTMLInputElement>("textbox", { name: /from|từ|開始/i });
    const to = screen.getByRole<HTMLInputElement>("textbox", { name: /to|đến|終了/i });
    expect(from.value).toBe("2026-05-01");
    expect(to.value).toBe("2026-05-10");
    expect(from).toHaveAttribute("name", "period_from");
    expect(to).toHaveAttribute("name", "period_to");
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

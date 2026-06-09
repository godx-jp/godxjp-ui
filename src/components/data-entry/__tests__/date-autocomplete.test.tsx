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
    // Open via the input (combobox) — unambiguous now that an inline clear ✕ also exists.
    await user.click(screen.getByRole("combobox"));
    const dayButtons = screen.getAllByRole("gridcell").filter((cell) => cell.textContent === "15");
    const dayButton = dayButtons[0]?.querySelector("button");
    expect(dayButton).toBeTruthy();
    if (dayButton) await user.click(dayButton);
    expect(onChange).toHaveBeenCalled();
  });

  // Regression (godxjp-ui-behavioral-test): the input declares aria-haspopup="dialog" so it must
  // actually open the calendar — clicking only the icon was the reported "focus shows nothing" bug.
  it("opens the calendar when the INPUT itself is clicked (not only the icon)", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker value={new Date(2026, 0, 15)} onValueChange={vi.fn()} />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.click(input);
    expect(await screen.findByRole("grid")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("opens the calendar on ArrowDown from the input", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker onValueChange={vi.fn()} />);
    screen.getByRole("combobox").focus();
    await user.keyboard("{ArrowDown}");
    expect(await screen.findByRole("grid")).toBeInTheDocument();
  });

  it("opens on the value's month so the selected date is visible (defaultMonth)", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker value={new Date(2026, 0, 15)} onValueChange={vi.fn()} />);
    await user.click(screen.getByRole("combobox"));
    const grid = await screen.findByRole("grid");
    // With defaultMonth the selected day (Jan 15) is in view; without it the calendar opens on
    // today's month and the selection is off-screen.
    const selected = grid.querySelector('[aria-selected="true"]');
    expect(selected).toHaveTextContent("15");
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

  it("opens the calendar when a range field is clicked, showing two months", async () => {
    const user = userEvent.setup();
    renderWithUi(<DateRangePicker onValueChange={() => undefined} />);
    await user.click(screen.getByRole("textbox", { name: /from|từ|開始/i }));
    // A range picker shows two month grids so a cross-month range needs no navigation.
    const grids = await screen.findAllByRole("grid");
    expect(grids).toHaveLength(2);
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

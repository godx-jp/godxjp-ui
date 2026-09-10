import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { DatePicker } from "../date-picker";
import { TimePicker } from "../time-picker";

const date = new Date(2026, 5, 15);
const cases = [
  {
    name: "DatePicker",
    render: (filled: boolean, allowClear = true) => (
      <DatePicker defaultValue={filled ? date : undefined} allowClear={allowClear} />
    ),
    icon: "Mở lịch",
  },
  {
    name: "TimePicker",
    render: (filled: boolean, allowClear = true) => (
      <TimePicker defaultValue={filled ? "09:30" : undefined} allowClear={allowClear} />
    ),
    icon: "Mở chọn giờ",
  },
  {
    name: "MonthPicker",
    render: (filled: boolean, allowClear = true) => (
      <DatePicker picker="month" defaultValue={filled ? date : undefined} allowClear={allowClear} />
    ),
    icon: "Mở chọn tháng",
  },
  {
    name: "DateRangePicker",
    render: (filled: boolean, allowClear = true) => (
      <DatePicker
        range
        defaultValue={filled ? { from: date, to: date } : undefined}
        allowClear={allowClear}
      />
    ),
    icon: "Mở lịch",
  },
  {
    name: "MonthRangePicker",
    render: (filled: boolean, allowClear = true) => (
      <DatePicker
        range
        picker="month"
        defaultValue={filled ? { from: date, to: date } : undefined}
        allowClear={allowClear}
      />
    ),
    icon: "Mở chọn tháng",
  },
];

describe.each(cases)("$name exclusive trailing action", ({ render: picker, icon }) => {
  it("shows only the picker icon when empty", () => {
    renderWithUi(picker(false));
    expect(screen.getByRole("button", { name: icon })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xóa" })).not.toBeInTheDocument();
  });
  it("shows only clear when filled, then restores the picker icon", async () => {
    const user = userEvent.setup();
    renderWithUi(picker(true));
    expect(screen.queryByRole("button", { name: icon })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Xóa" }));
    expect(screen.getByRole("button", { name: icon })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xóa" })).not.toBeInTheDocument();
  });
  it("keeps the picker icon when clearing is forbidden", () => {
    renderWithUi(picker(true, false));
    expect(screen.getByRole("button", { name: icon })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xóa" })).not.toBeInTheDocument();
  });
});

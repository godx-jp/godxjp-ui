import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider } from "../../../app/app-provider";
import { LocalePicker } from "../locale-picker";
import { DateFormatPicker } from "../date-format-picker";
import { TimeFormatPicker } from "../time-format-picker";
import { TimezonePicker } from "../timezone-picker";

describe("LocalePicker", () => {
  it("renders current locale from AppProvider", () => {
    render(
      <AppProvider persist={false} defaultLocale="vi">
        <LocalePicker />
      </AppProvider>,
    );

    expect(screen.getByRole("combobox", { name: "Ngôn ngữ" })).toBeInTheDocument();
    expect(screen.getByText("Tiếng Việt")).toBeInTheDocument();
  });

  it("works in controlled mode without AppProvider", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<LocalePicker value="en" onChange={onChange} />);
    await user.click(screen.getByRole("combobox", { name: "Ngôn ngữ" }));
    await user.click(screen.getByRole("option", { name: "日本語" }));

    expect(onChange).toHaveBeenCalledWith("ja");
  });
});

describe("TimezonePicker", () => {
  it("lists configured timezones from AppProvider", async () => {
    const user = userEvent.setup();

    render(
      <AppProvider
        persist={false}
        defaultLocale="en"
        defaultTimezone="Asia/Tokyo"
        timezoneOptions={["Asia/Tokyo", "Asia/Ho_Chi_Minh"]}
      >
        <TimezonePicker />
      </AppProvider>,
    );

    await user.click(screen.getByRole("combobox", { name: "Timezone" }));
    expect(screen.getByRole("option", { name: "Japan (Tokyo)" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Vietnam (Ho Chi Minh)" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Paris/ })).not.toBeInTheDocument();
  });
});

describe("DateFormatPicker", () => {
  it("renders dmy for vi locale by default", () => {
    render(
      <AppProvider persist={false} defaultLocale="vi">
        <DateFormatPicker />
      </AppProvider>,
    );

    expect(screen.getByText("Ngày / Tháng / Năm")).toBeInTheDocument();
  });

  it("renders iso for ja locale by default", () => {
    render(
      <AppProvider persist={false} defaultLocale="ja">
        <DateFormatPicker />
      </AppProvider>,
    );

    expect(screen.getByText("YYYY-MM-DD（年-月-日）")).toBeInTheDocument();
  });

  it("works in controlled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AppProvider persist={false} defaultLocale="en">
        <DateFormatPicker value="mdy" onChange={onChange} />
      </AppProvider>,
    );
    await user.click(screen.getByRole("combobox", { name: "Date format" }));
    await user.click(screen.getByRole("option", { name: "ISO (yyyy-MM-dd)" }));

    expect(onChange).toHaveBeenCalledWith("iso");
  });
});

describe("TimeFormatPicker", () => {
  it("renders 24h for vi locale by default", () => {
    render(
      <AppProvider persist={false} defaultLocale="vi">
        <TimeFormatPicker />
      </AppProvider>,
    );

    expect(screen.getByText("24 giờ")).toBeInTheDocument();
  });

  it("works in controlled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AppProvider persist={false} defaultLocale="en">
        <TimeFormatPicker value="24h" onChange={onChange} />
      </AppProvider>,
    );
    await user.click(screen.getByRole("combobox", { name: "Time format" }));
    await user.click(screen.getByRole("option", { name: "12-hour (AM/PM)" }));

    expect(onChange).toHaveBeenCalledWith("12h");
  });
});

import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Switch } from "../switch";
import { Slider } from "../slider";
import { ColorPicker } from "../color-picker";
import { TimePicker } from "../time-picker";

describe("Switch", () => {
  it("toggles checked state", async () => {
    const user = userEvent.setup();
    renderWithUi(<Switch aria-label="Notify" />);
    const control = screen.getByRole("switch", { name: "Notify" });
    expect(control).toHaveAttribute("data-slot", "switch");
    expect(control).toHaveAttribute("data-size", "default");
    expect(control).toHaveAttribute("data-state", "unchecked");
    await user.click(control);
    expect(control).toHaveAttribute("data-state", "checked");
  });
});

describe("Slider", () => {
  it("renders thumb control", () => {
    const { container } = renderWithUi(<Slider defaultValue={[40]} aria-label="Percent" />);
    expect(container.querySelector('[data-slot="slider"]')).toBeInTheDocument();
    expect(screen.getAllByRole("slider")[0]).toHaveAttribute("data-slot", "slider-thumb");
  });
});

describe("ColorPicker", () => {
  it("calls onChange with hex value on blur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(<ColorPicker value="#2563eb" onValueChange={onChange} />);
    const hexInput = screen.getByRole("textbox");
    await user.clear(hexInput);
    await user.type(hexInput, "#ff0000");
    await user.tab();
    expect(onChange).toHaveBeenCalledWith("#ff0000");
  });
});

describe("TimePicker", () => {
  it("exposes the time on a typeable combobox input (form-submittable)", () => {
    renderWithUi(<TimePicker defaultValue="09:30" id="cutoff" name="cutoff" />);
    const input = screen.getByRole<HTMLInputElement>("combobox");
    expect(input.value).toBe("09:30");
    expect(input).toHaveAttribute("id", "cutoff");
    expect(input).toHaveAttribute("name", "cutoff");
  });

  it("opens panel and selects minute", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(<TimePicker defaultValue="09:00" onValueChange={onChange} minuteStep={15} id="t" />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Giờ")).toBeInTheDocument();
    expect(screen.getByText("Phút")).toBeInTheDocument();

    const minute45 = screen
      .getAllByRole("button", { name: "45" })
      .find((el) => el.closest(".h-52"));
    expect(minute45).toBeDefined();
    await user.click(minute45!);
    expect(onChange).toHaveBeenCalledWith("09:45");
  });

  it("opens scroll columns for hour and minute", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker defaultValue="09:00" minuteStep={15} id="t" />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Giờ")).toBeInTheDocument();
    expect(screen.getByText("Phút")).toBeInTheDocument();
    expect(screen.getByLabelText("Nhập giờ HH:mm")).toBeInTheDocument();
  });
});

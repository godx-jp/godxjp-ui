import { describe, expect, it } from "vitest";

import { renderWithUi, screen, userEvent } from "@/test/render";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../input-otp";

if (typeof document.elementFromPoint !== "function") {
  document.elementFromPoint = () => null;
}

function GroupedOtp() {
  return (
    <InputOTP maxLength={8} aria-label="device code">
      <InputOTPGroup appearance="grouped">
        {[0, 1, 2, 3].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup appearance="grouped">
        {[4, 5, 6, 7].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

describe("InputOTP grouped appearance", () => {
  it("renders one semantic outline owner per four-character group", () => {
    const { container } = renderWithUi(<GroupedOtp />);
    const groups = container.querySelectorAll('[data-slot="input-otp-group"]');
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveAttribute("data-appearance", "grouped");
    expect(groups[1].querySelectorAll('[data-slot="input-otp-slot"]')).toHaveLength(4);
  });

  it("retains the single hidden-input typing, paste and backspace behavior", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(<GroupedOtp />);
    const field = screen.getByRole("textbox");
    await user.click(field);
    await user.paste("12345678");
    expect(field).toHaveValue("12345678");
    expect(container.querySelectorAll('[data-slot="input-otp-slot"]')[7]).toHaveTextContent("8");
    await user.keyboard("{Backspace}");
    expect(field).toHaveValue("1234567");
  });
});

describe("InputOTP alignment (gh#12)", () => {
  it("centres the row through `align` instead of a consumer wrapper div", () => {
    // `input-otp` owns the container element, so the ONLY thing a consumer could reach was a
    // wrapping flex div — which every one of them wrote. The attribute lands on the hidden input
    // and `.ui-otp-container` reads it back with :has(), the same mechanism the invalid and
    // disabled states already use.
    const { container } = renderWithUi(
      <InputOTP maxLength={2} align="center" aria-label="code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const field = container.querySelector('[data-slot="input-otp"]');
    expect(field).toHaveAttribute("data-align", "center");
    // The :has() selector needs the flagged input to be a DESCENDANT of the container that
    // input-otp renders — it is nested one level down inside the overlay wrapper, not a child.
    const otpContainer = container.querySelector(".ui-otp-container");
    expect(otpContainer).not.toBeNull();
    expect(otpContainer?.contains(field!)).toBe(true);
  });

  it("emits no alignment attribute for the default — an existing field is byte-identical", () => {
    const { container } = renderWithUi(
      <InputOTP maxLength={2} aria-label="code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );
    expect(container.querySelector('[data-slot="input-otp"]')).not.toHaveAttribute("data-align");
  });
});

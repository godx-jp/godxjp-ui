import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../input-otp";

describe("InputOTPSeparator", () => {
  it("renders a separator between two slot groups", () => {
    renderWithUi(
      <InputOTP maxLength={4} aria-label="code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("data-slot", "input-otp-separator");
  });
});

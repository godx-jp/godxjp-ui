import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../input-otp";

// input-otp polls document.elementFromPoint in a timer for its fake-caret positioning;
// jsdom doesn't implement it, which leaks post-test errors. Stub it (the visual caret is
// irrelevant to behaviour).
if (typeof document.elementFromPoint !== "function") {
  document.elementFromPoint = () => null;
}

/**
 * Behavioural regression tests (godxjp-ui-behavioral-test) for the OTP field.
 * Driven in jsdom with user-event — the deterministic source of truth, since the
 * browser-MCP harness gives noisy readings across many focusable OTP slots.
 */
function Otp({
  maxLength = 6,
  pattern,
  onComplete,
  disabled,
}: {
  maxLength?: number;
  pattern?: string;
  onComplete?: (code: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = React.useState("");
  return (
    <InputOTP
      maxLength={maxLength}
      pattern={pattern}
      value={value}
      onChange={setValue}
      onComplete={onComplete}
      disabled={disabled}
      aria-label="otp"
    >
      <InputOTPGroup>
        {Array.from({ length: maxLength }, (_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

describe("InputOTP", () => {
  it("typing digits fills the value", async () => {
    const user = userEvent.setup();
    renderWithUi(<Otp />);
    const field = screen.getByRole("textbox");
    await user.type(field, "123456");
    expect(field).toHaveValue("123456");
  });

  it("a digits-only pattern rejects non-digit characters", async () => {
    const user = userEvent.setup();
    renderWithUi(<Otp maxLength={4} pattern="^[0-9]+$" />);
    const field = screen.getByRole("textbox");
    await user.type(field, "a5b7");
    expect(field).toHaveValue("57");
  });

  it("onComplete fires once every slot is filled (auto-submit)", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWithUi(<Otp onComplete={onComplete} />);
    await user.type(screen.getByRole("textbox"), "123456");
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("backspace deletes the last digit", async () => {
    const user = userEvent.setup();
    renderWithUi(<Otp />);
    const field = screen.getByRole("textbox");
    await user.type(field, "123");
    await user.keyboard("{Backspace}");
    expect(field).toHaveValue("12");
  });

  it("disabled blocks typing", async () => {
    const user = userEvent.setup();
    renderWithUi(<Otp disabled />);
    const field = screen.getByRole("textbox");
    await user.type(field, "123");
    expect(field).toHaveValue("");
  });
});

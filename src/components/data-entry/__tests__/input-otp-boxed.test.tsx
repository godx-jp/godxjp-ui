import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent } from "@/test/render";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../input-otp";

if (typeof document.elementFromPoint !== "function") {
  document.elementFromPoint = () => null;
}

function DeviceCode(props: { mono?: boolean; onComplete?: (v: string) => void }) {
  return (
    <InputOTP
      maxLength={8}
      aria-label="device code"
      mono={props.mono}
      onComplete={props.onComplete}
      formatter={(v) => v.toUpperCase()}
      pasteTransformer={(v) => v.replace(/[^a-z0-9]/gi, "")}
    >
      <InputOTPGroup appearance="boxed">
        {[0, 1, 2, 3].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup appearance="boxed">
        {[4, 5, 6, 7].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

describe("InputOTP boxed appearance + mono", () => {
  it("reflects appearance=boxed on each group and mono on the hidden input", () => {
    const { container } = renderWithUi(<DeviceCode mono />);
    const groups = container.querySelectorAll('[data-slot="input-otp-group"]');
    expect(groups).toHaveLength(2);
    for (const group of groups) expect(group).toHaveAttribute("data-appearance", "boxed");
    expect(screen.getByRole("textbox")).toHaveAttribute("data-mono", "");
  });

  it("emits no data-mono by default (inert default)", () => {
    renderWithUi(<DeviceCode />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("data-mono");
  });

  it("keeps the one hidden input: a dashed paste fills both groups and completes", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const { container } = renderWithUi(<DeviceCode mono onComplete={onComplete} />);
    const field = screen.getByRole("textbox");
    await user.click(field);
    await user.paste("ltzw-czps");
    expect(field).toHaveValue("LTZWCZPS");
    const painted = [...container.querySelectorAll('[data-slot="input-otp-slot"]')].map(
      (slot) => slot.textContent,
    );
    expect(painted.join("")).toBe("LTZWCZPS");
    expect(onComplete).toHaveBeenCalledWith("LTZWCZPS");
  });
});

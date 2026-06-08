import { beforeAll, describe, expect, it } from "vitest";
import { renderWithUi, userEvent } from "@/test/render";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "../input-otp";

// input-otp polls document.elementFromPoint (absent in jsdom) on a timer for focus tracking.
beforeAll(() => {
  if (!document.elementFromPoint) {
    document.elementFromPoint = () => null;
  }
});

const slots = (c: HTMLElement) => c.querySelectorAll('[data-slot="input-otp-slot"]');

describe("InputOTPSlot", () => {
  it("falls back to an empty slot when the index is out of range", () => {
    const { container } = renderWithUi(
      <InputOTP maxLength={2} aria-label="code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={9} /> {/* beyond maxLength → context.slots[9] is undefined */}
        </InputOTPGroup>
      </InputOTP>,
    );
    const all = slots(container);
    expect(all[1]).not.toHaveAttribute("data-active"); // fallback slot is inactive, no caret
    expect(all[1].querySelector(".ui-otp-caret")).toBeNull();
  });

  it("marks the next slot active (with a caret) as the user types", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <InputOTP maxLength={4} aria-label="code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const input = container.querySelector("input")!;
    await user.type(input, "12");
    const all = slots(container);
    expect(all[0]).toHaveTextContent("1"); // filled
    expect(all[2]).toHaveAttribute("data-active"); // next slot becomes active
    expect(all[2].querySelector(".ui-otp-caret")).not.toBeNull(); // fake caret on the active slot
  });
});

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { ruleSelector } from "@/test/css-selector";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../input-otp";

/** Structural selectors in control.css (OTP slot corners) against really rendered DOM. */
const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../styles/control.css"),
  "utf8",
);

describe("control.css OTP structural selectors select the rendered DOM", () => {
  it("only the first slot re-opens its leading border, only the last rounds the end corners", () => {
    const first = ruleSelector(css, ".ui-otp-group .ui-otp-slot:first-child");
    const last = ruleSelector(css, ".ui-otp-group .ui-otp-slot:last-child");
    const { container } = renderWithUi(
      <InputOTP maxLength={4} aria-label="code">
        <InputOTPGroup>
          {[0, 1, 2, 3].map((index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>,
    );

    const slots = [...container.querySelectorAll(".ui-otp-slot")];
    expect(slots).toHaveLength(4);
    expect(slots[0].matches(first)).toBe(true);
    expect(slots[0].matches(last)).toBe(false);
    expect(slots[1].matches(first)).toBe(false);
    expect(slots[1].matches(last)).toBe(false);
    expect(slots[3].matches(first)).toBe(false);
    expect(slots[3].matches(last)).toBe(true);
  });
});

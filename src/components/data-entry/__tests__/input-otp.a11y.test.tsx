import { describe, it } from "vitest";

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../input-otp";
import { Label } from "../label";
import { expectNoA11yViolations } from "@/test/a11y";

describe("InputOTP a11y", () => {
  it("has no axe violations (6-slot code, associated Label)", async () => {
    await expectNoA11yViolations(
      <>
        <Label htmlFor="otp">確認コード</Label>
        <InputOTP id="otp" maxLength={6} aria-label="確認コード">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </>,
    );
  });

  it("has no axe violations (grouped 3+3 with separator)", async () => {
    await expectNoA11yViolations(
      <InputOTP maxLength={6} aria-label="ワンタイムパスワード">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>,
    );
  });

  it("has no axe violations (outlined grouped 4+4 device code)", async () => {
    await expectNoA11yViolations(
      <InputOTP maxLength={8} aria-label="デバイスコード">
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
      </InputOTP>,
    );
  });

  it("has no axe violations (disabled)", async () => {
    await expectNoA11yViolations(
      <InputOTP maxLength={4} aria-label="PIN" disabled>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    );
  });
});

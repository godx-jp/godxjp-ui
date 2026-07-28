import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TwoFactorSetup } from "../two-factor-setup";

const labels = {
  title: "Enable two-factor authentication",
  description: "Scan the QR code and enter the six-digit code.",
  qrLabel: "Authenticator QR code",
  manualKeyLabel: "Manual setup key",
  codeLabel: "Verification code",
  codePlaceholder: "123 456",
  recoveryNotice: "Save these recovery codes now.",
  cancel: "Cancel",
  confirm: "Verify and enable",
  acknowledge: "I have saved them",
};

describe("TwoFactorSetup", () => {
  it("owns canonical enrollment fields and reports only six numeric digits", async () => {
    const user = userEvent.setup();
    const onCodeChange = vi.fn();
    render(
      <TwoFactorSetup
        open
        onOpenChange={() => {}}
        qrValue="otpauth://totp/Godx"
        manualKey="JBSWY3DPEHPK3PXP"
        code=""
        onCodeChange={onCodeChange}
        onConfirm={() => {}}
        onAcknowledge={() => {}}
        labels={labels}
      />,
    );

    expect(screen.getByRole("dialog")).toHaveClass("ui-two-factor-setup");
    expect(screen.getByLabelText(labels.qrLabel)).toBeInTheDocument();
    await user.type(screen.getByLabelText(labels.codeLabel), "12a34567");
    expect(onCodeChange).toHaveBeenLastCalledWith("7");
    expect(screen.getByRole("button", { name: labels.confirm })).toBeDisabled();
  });

  it("renders one-time recovery state and acknowledges without inventing persistence", async () => {
    const user = userEvent.setup();
    const onAcknowledge = vi.fn();
    render(
      <TwoFactorSetup
        open
        onOpenChange={() => {}}
        manualKey="secret"
        code=""
        onCodeChange={() => {}}
        onConfirm={() => {}}
        recoveryCodes={["alpha-1", "beta-2"]}
        onAcknowledge={onAcknowledge}
        labels={labels}
      />,
    );

    expect(screen.getByText("alpha-1")).toBeInTheDocument();
    expect(screen.queryByLabelText(labels.codeLabel)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: labels.acknowledge }));
    expect(onAcknowledge).toHaveBeenCalledOnce();
  });
});

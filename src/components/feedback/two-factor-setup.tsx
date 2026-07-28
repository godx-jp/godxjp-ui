import * as React from "react";

import { CredentialReveal } from "../data-display/credential-reveal";
import { QrCode } from "../data-display/qr-code";
import { Input } from "../data-entry/input";
import { Button } from "../general/button";
import { Text } from "../general/typography";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

export type TwoFactorSetupLabels = {
  title: React.ReactNode;
  description: React.ReactNode;
  qrLabel: string;
  manualKeyLabel: React.ReactNode;
  codeLabel: string;
  codePlaceholder?: string;
  recoveryNotice: React.ReactNode;
  cancel: React.ReactNode;
  confirm: React.ReactNode;
  acknowledge: React.ReactNode;
};

export type TwoFactorSetupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrValue?: string;
  manualKey: string;
  code: string;
  onCodeChange: (code: string) => void;
  onConfirm: () => void;
  recoveryCodes?: string[];
  onAcknowledge: () => void;
  labels: TwoFactorSetupLabels;
  pending?: boolean;
};

/**
 * Canonical two-factor setup overlay. Network requests and state persistence remain application
 * concerns; this component only owns the QR/manual-key/OTP/recovery presentation contract.
 */
export function TwoFactorSetup({
  open,
  onOpenChange,
  qrValue,
  manualKey,
  code,
  onCodeChange,
  onConfirm,
  recoveryCodes = [],
  onAcknowledge,
  labels,
  pending = false,
}: TwoFactorSetupProps) {
  const showingRecovery = recoveryCodes.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ui-two-factor-setup" showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          {showingRecovery ? (
            <section
              className="ui-two-factor-setup-recovery"
              aria-live="polite"
              data-state="recovery"
            >
              <Text as="p" tone="muted">
                {labels.recoveryNotice}
              </Text>
              <ul className="ui-two-factor-setup-recovery-codes">
                {recoveryCodes.map((recoveryCode) => (
                  <li key={recoveryCode}>
                    <code>{recoveryCode}</code>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <div className="ui-two-factor-setup-enrollment" data-state="enrollment">
              <Text as="p" tone="muted">
                {labels.description}
              </Text>
              <div className="ui-two-factor-setup-grid">
                {qrValue ? <QrCode value={qrValue} label={labels.qrLabel} size="sm" /> : null}
                <div className="ui-two-factor-setup-fields">
                  <CredentialReveal
                    secret={manualKey}
                    label={labels.manualKeyLabel}
                    warning={null}
                    defaultRevealed
                    size="sm"
                  />
                  <label className="ui-two-factor-setup-code">
                    <Text as="span" size="sm" weight="medium">
                      {labels.codeLabel}
                    </Text>
                    <Input
                      value={code}
                      onChange={(event) =>
                        onCodeChange(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder={labels.codePlaceholder}
                      aria-label={labels.codeLabel}
                    />
                  </label>
                </div>
              </div>
              <Text as="p" size="sm" tone="muted" className="ui-two-factor-setup-notice">
                {labels.recoveryNotice}
              </Text>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          {showingRecovery ? (
            <Button onClick={onAcknowledge}>{labels.acknowledge}</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
                {labels.cancel}
              </Button>
              <Button onClick={onConfirm} disabled={pending || code.length !== 6} loading={pending}>
                {labels.confirm}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

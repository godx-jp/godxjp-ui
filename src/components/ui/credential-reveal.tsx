import * as React from "react";
import { Check, Copy, Download, Eye, EyeOff } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { Text } from "../general/typography";
import { Button } from "../general/button";
import { Alert, AlertDescription } from "../feedback/alert";
import type { CredentialRevealProp } from "../../props/components/data-display.prop";

export type {
  CredentialRevealProp,
  CredentialRevealProp as CredentialRevealProps,
  CredentialRevealTone,
} from "../../props/components/data-display.prop";

// Fixed-length mask — the number of dots is a constant so the masked state never leaks the
// secret's real length (a subtle info-disclosure the GitHub/Stripe token pattern avoids).
const MASK = "•".repeat(24);
const COPIED_RESET_MS = 2000;

/**
 * CredentialReveal — one-time secret surface (device credential / API key / service-account
 * secret). Masked by default with a show/hide toggle, a copy button that confirms the copy, an
 * optional download, and an optional acknowledge action to pair with a Dialog.
 */
export const CredentialReveal = React.forwardRef<HTMLDivElement, CredentialRevealProp>(
  (
    {
      secret,
      label,
      warning,
      revealed,
      defaultRevealed = false,
      onRevealedChange,
      onCopy,
      onAcknowledge,
      acknowledgeLabel,
      downloadable = false,
      downloadFileName = "credential.txt",
      size = "md",
      tone = "warning",
      className,
      id,
      "aria-label": ariaLabel,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [internalRevealed, setInternalRevealed] = React.useState(defaultRevealed);
    const isRevealed = revealed ?? internalRevealed;
    const [copied, setCopied] = React.useState(false);
    const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const labelId = React.useId();

    // A fresh credential re-blurs and clears any "copied" cue — a new secret is a new reveal flow.
    React.useEffect(() => {
      if (revealed === undefined) setInternalRevealed(defaultRevealed);
      setCopied(false);
      // Intentionally keyed on the secret only: re-arming on `defaultRevealed`/`revealed` changes
      // would fight the controlled/uncontrolled toggle below.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [secret]);

    React.useEffect(
      () => () => {
        if (copyTimer.current) clearTimeout(copyTimer.current);
      },
      [],
    );

    const setRevealed = (next: boolean) => {
      if (revealed === undefined) setInternalRevealed(next);
      onRevealedChange?.(next);
    };

    const copy = async () => {
      try {
        await navigator.clipboard.writeText(secret);
        setCopied(true);
        onCopy?.(secret);
        if (copyTimer.current) clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
      } catch {
        // Clipboard blocked (insecure context / permissions) — leave the state untouched so the UI
        // never falsely claims a copy succeeded.
      }
    };

    const download = () => {
      if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return;
      const url = URL.createObjectURL(new Blob([secret], { type: "text/plain" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = downloadFileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    };

    // A guaranteed string accessible name (aria-label must be a string; `label` may be any
    // ReactNode). When `label` is set the secret is wired by `aria-labelledby` to the rendered
    // label element instead, so a non-string label still names it.
    const accessibleName =
      ariaLabel ??
      (typeof label === "string" ? label : undefined) ??
      t("ui.credentialReveal.secretLabel");

    return (
      <div
        ref={ref}
        id={id}
        data-slot="credential-reveal"
        data-size={size}
        role="group"
        aria-label={accessibleName}
        className={cn("ui-credential-reveal", className)}
      >
        {warning !== null ? (
          <Alert tone={tone} className="ui-credential-reveal-warning">
            <AlertDescription>{warning ?? t("ui.credentialReveal.warning")}</AlertDescription>
          </Alert>
        ) : null}

        <div className="ui-credential-reveal-surface">
          {label ? (
            <Text
              id={labelId}
              size="xs"
              tone="muted"
              weight="medium"
              className="ui-credential-reveal-label"
            >
              {label}
            </Text>
          ) : null}
          <div className="ui-credential-reveal-row">
            <Text
              mono
              size="sm"
              data-slot="credential-reveal-secret"
              data-state={isRevealed ? "revealed" : "masked"}
              aria-labelledby={label ? labelId : undefined}
              aria-label={label ? undefined : accessibleName}
              className="ui-credential-reveal-secret"
            >
              {isRevealed ? secret : MASK}
            </Text>
            <div className="ui-credential-reveal-actions">
              <Button
                type="button"
                variant="ghost"
                size={size}
                onClick={() => setRevealed(!isRevealed)}
                aria-pressed={isRevealed}
                aria-label={
                  isRevealed ? t("ui.credentialReveal.hide") : t("ui.credentialReveal.show")
                }
              >
                {isRevealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                size={size}
                onClick={copy}
                data-state={copied ? "copied" : "idle"}
                aria-label={
                  copied ? t("ui.credentialReveal.copied") : t("ui.credentialReveal.copy")
                }
              >
                {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              </Button>
              {downloadable ? (
                <Button
                  type="button"
                  variant="ghost"
                  size={size}
                  onClick={download}
                  aria-label={t("ui.credentialReveal.download")}
                >
                  <Download aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {onAcknowledge ? (
          <div className="ui-credential-reveal-footer">
            <Button type="button" variant="default" size={size} onClick={onAcknowledge}>
              {acknowledgeLabel ?? t("ui.credentialReveal.acknowledge")}
            </Button>
          </div>
        ) : null}

        <span aria-live="polite" className="sr-only" data-slot="credential-reveal-status">
          {copied ? t("ui.credentialReveal.copiedAnnounce") : ""}
        </span>
      </div>
    );
  },
);
CredentialReveal.displayName = "CredentialReveal";

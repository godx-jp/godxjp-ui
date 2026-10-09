import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Lightbulb,
  LogIn,
  MessageSquareWarning,
  OctagonAlert,
  RefreshCw,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { humanError } from "../../lib/format";
import { classifyQueryError, type QueryErrorCategory } from "../../lib/query-error";
import { Flex } from "../layout/flex";
import { Button } from "../general/button";
import { Text } from "../general/typography";
import { useAuthExpiry } from "./auth-expiry";
import type { AlertVariantProp, CalloutKindProp, IconProp, ToneProp } from "../../props/vocabulary";
import type {
  AlertActionsProp,
  AlertContentProp,
  AlertDescriptionProp,
  AlertProp,
  AlertQueryErrorProp,
  AlertTitleProp,
} from "../../props/components/feedback.prop";

export type {
  AlertProp,
  AlertProp as AlertProps,
  AlertTitleProp,
  AlertTitleProp as AlertTitleProps,
  AlertContentProp,
  AlertContentProp as AlertContentProps,
  AlertDescriptionProp,
  AlertDescriptionProp as AlertDescriptionProps,
  AlertActionsProp,
  AlertActionsProp as AlertActionsProps,
  AlertQueryErrorProp,
  AlertQueryErrorProp as AlertQueryErrorProps,
} from "../../props/components/feedback.prop";

const AlertContext = React.createContext<ToneProp>("default");

/** Tones that warrant an assertive `role="alert"`; all others use the polite `role="status"`. */
const ASSERTIVE_TONES: ReadonlySet<ToneProp> = new Set<ToneProp>(["destructive", "warning"]);

/**
 * The role the surface carries when the consumer does not name one.
 *
 * `callout` is the one variant that is NOT a live region, and that is the whole reason it exists
 * (gh#765): an aside inside a document body is part of what the reader is reading, not an update
 * to it, so a page with three of them must not announce three times on load. Every other variant
 * keeps the tone-derived politeness — assertive for the two tones that interrupt, polite
 * otherwise.
 */
const roleFor = (variant: AlertVariantProp, tone: ToneProp): string => {
  if (variant === "callout") return "note";
  return ASSERTIVE_TONES.has(tone) ? "alert" : "status";
};

const DEFAULT_ICONS: Record<ToneProp, LucideIcon> = {
  default: Info,
  destructive: AlertCircle,
  warning: TriangleAlert,
  success: CheckCircle2,
  info: Info,
  muted: Info,
  neutral: Info,
};

/**
 * The five admonitions GitHub documents (`> [!NOTE]` … `[!CAUTION]`), which Obsidian's lower-case
 * spelling maps onto one-for-one. Each resolves a `tone` and a glyph for `variant="callout"`, and
 * each is still overridable per instance — `kind` is a preset, not a second colour axis.
 *
 * `important` takes the NEUTRAL tone on purpose: GitHub paints it purple, this system has no purple
 * role, and borrowing `info` would make it indistinguishable from `note`. Its glyph carries the
 * difference instead, which is also what keeps the set readable without colour (WCAG 1.4.1).
 */
const CALLOUT_KINDS: Record<CalloutKindProp, { tone: ToneProp; icon: IconProp }> = {
  note: { tone: "info", icon: Info },
  tip: { tone: "success", icon: Lightbulb },
  important: { tone: "neutral", icon: MessageSquareWarning },
  warning: { tone: "warning", icon: TriangleAlert },
  caution: { tone: "destructive", icon: OctagonAlert },
};

const AlertBase = React.forwardRef<HTMLDivElement, AlertProp>(
  (
    { variant = "default", kind, tone: toneProp, icon, onDismiss, className, children, ...props },
    ref,
  ) => {
    const { t } = useTranslation();
    // `kind` is the callout preset (v32 #1223 folded `Callout` in here); a callout with no kind is
    // a `note`, exactly as the retired component defaulted. Other variants ignore it.
    const preset = variant === "callout" ? CALLOUT_KINDS[kind ?? "note"] : undefined;
    const tone = toneProp ?? preset?.tone ?? "default";
    const IconComponent = icon === false ? null : (icon ?? preset?.icon ?? DEFAULT_ICONS[tone]);

    return (
      <AlertContext.Provider value={tone}>
        <div
          ref={ref}
          role={roleFor(variant, tone)}
          data-slot="alert"
          data-variant={variant}
          data-tone={tone}
          data-dismissible={onDismiss ? "" : undefined}
          className={className}
          {...props}
        >
          {IconComponent && (
            <IconComponent data-slot="alert-icon" data-tone={tone} aria-hidden="true" />
          )}
          <div data-slot="alert-body">{children}</div>
          {onDismiss && (
            <button
              type="button"
              onClick={() => {
                void onDismiss();
              }}
              data-slot="alert-dismiss"
              // Rest alpha, its hover companion and the transition all live in alert-layout.css
              // ✕ off its 0.7 rest state, with the two halves split across two files.
              className="ui-focus-ring"
              aria-label={t("feedback.alert.dismiss")}
            >
              <X className="ui-alert-dismiss-icon" aria-hidden="true" />
            </button>
          )}
        </div>
      </AlertContext.Provider>
    );
  },
);
AlertBase.displayName = "Alert";

export const AlertTitle = React.forwardRef<HTMLParagraphElement, AlertTitleProp>(
  ({ className, ...props }, ref) => {
    const tone = React.useContext(AlertContext);
    return (
      <p ref={ref} data-slot="alert-title" data-tone={tone} className={className} {...props} />
    );
  },
);
AlertTitle.displayName = "AlertTitle";

export const AlertContent = React.forwardRef<HTMLDivElement, AlertContentProp>(
  // `min-w-0 flex-1` moved to alert-layout.css [data-slot="alert-content"] — same box, but a
  // consumer className now overrides it from the utilities layer instead of tying with it.
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="alert-content" className={className} {...props} />
  ),
);
AlertContent.displayName = "AlertContent";

export const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProp>(
  ({ className, ...props }, ref) => (
    <p ref={ref} data-slot="alert-description" className={className} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export const AlertActions = React.forwardRef<HTMLDivElement, AlertActionsProp>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="alert-actions" className={className} {...props} />
  ),
);
AlertActions.displayName = "AlertActions";

/** Causes that read as a soft warning (the request reached a valid, non-broken state). */
const WARNING_CATEGORIES: ReadonlySet<QueryErrorCategory> = new Set<QueryErrorCategory>([
  "forbidden",
  "notFound",
  "validation",
]);

/** Causes where repeating the same request could plausibly help — the only ones that show Retry. */
const RETRYABLE_CATEGORIES: ReadonlySet<QueryErrorCategory> = new Set<QueryErrorCategory>([
  "transient",
  "unknown",
]);

function RetryButton({ onRetry }: { onRetry: NonNullable<AlertQueryErrorProp["onRetry"]> }) {
  const { t } = useTranslation();
  return (
    <AlertActions>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          void onRetry();
        }}
      >
        {/* No `size-*` on the glyph: `.ui-button--sm svg` already sizes it from --control-icon-size-sm. */}
        <Flex direction="row" wrap align="center" gap="xs">
          <RefreshCw aria-hidden="true" />
          {t("common.retry")}
        </Flex>
      </Button>
    </AlertActions>
  );
}

/**
 * TanStack Query / API failure preset used by `DataState` (@godxjp/ui/query).
 *
 * - **Cause-aware mode** (pass `category`, as `DataState` does): presents a safe, localized message
 *   — never the raw backend/token/stack text — with a cause-appropriate action. `auth`
 *   (401/expired) offers session renewal (`onAuthAction`) instead of Retry; transient/network/5xx
 *   offer Retry (`onRetry`); permission/not-found/validation offer neither by default.
 * - **Legacy mode** (no `category`, e.g. mutation/infinite feedback): shows the cleaned domain
 *   message (`humanError`) + optional Retry — form-submit corrective guidance stays visible.
 * - **Under an `AuthExpiryProvider`** an auth-class error (either mode) is never painted as an
 *   alert: the provider's `onAuthExpired` runs once and this renders a small polite status
 *   ("redirecting to sign-in") instead. If the handler fails, the sign-in alert comes back with its
 *   button wired to the provider (gh#1022).
 */
export function AlertQueryError({
  error,
  category,
  onRetry,
  onAuthAction,
  className,
}: AlertQueryErrorProp) {
  const { t } = useTranslation();
  const resolved = category ?? classifyQueryError(error).category;
  const expiry = useAuthExpiry(resolved === "auth", error);

  if (expiry?.status === "redirecting") {
    return (
      <Text
        as="p"
        size="sm"
        tone="muted"
        role="status"
        aria-live="polite"
        data-slot="alert-query-auth-pending"
        className={className}
      >
        {t("query.authExpiry.redirecting")}
      </Text>
    );
  }
  // The provider's handler failed: keep the sign-in recovery, now wired to the provider.
  const authAction = expiry ? expiry.retry : onAuthAction;

  if (!category && !expiry) {
    return (
      <Alert tone="destructive" className={className}>
        <AlertTitle>{t("common.error")}</AlertTitle>
        <AlertDescription>{humanError(error)}</AlertDescription>
        {onRetry && <RetryButton onRetry={onRetry} />}
      </Alert>
    );
  }

  // An expired session is an expected, recoverable condition, not a failure of the page: it reads
  // in the neutral tone (polite status, not an assertive alert) at a capped reading width instead
  // of a full-bleed destructive panel (gh#1022).
  const tone: ToneProp =
    resolved === "auth" ? "default" : WARNING_CATEGORIES.has(resolved) ? "warning" : "destructive";
  return (
    <Alert tone={tone} className={className} data-query-category={resolved}>
      <AlertTitle>{t(`query.error.title.${resolved}`)}</AlertTitle>
      <AlertDescription>{t(`query.error.description.${resolved}`)}</AlertDescription>
      {resolved === "auth" && authAction && (
        <AlertActions>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void authAction();
            }}
          >
            {/* Sized by `.ui-button--sm svg` — see RetryButton above. */}
            <Flex direction="row" wrap align="center" gap="xs">
              <LogIn aria-hidden="true" />
              {t("query.error.action.signIn")}
            </Flex>
          </Button>
        </AlertActions>
      )}
      {RETRYABLE_CATEGORIES.has(resolved) && onRetry && <RetryButton onRetry={onRetry} />}
    </Alert>
  );
}

export const Alert = Object.assign(AlertBase, {
  Title: AlertTitle,
  Content: AlertContent,
  Description: AlertDescription,
  Actions: AlertActions,
  QueryError: AlertQueryError,
});

export { AlertBase };

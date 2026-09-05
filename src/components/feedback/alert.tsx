import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  LogIn,
  RefreshCw,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { humanError } from "../../lib/format";
import { type QueryErrorCategory } from "../../lib/query-error";
import { Flex } from "../layout/flex";
import { Button } from "../general/button";
import type { ToneProp } from "../../props/vocabulary";
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

const DEFAULT_ICONS: Record<ToneProp, LucideIcon> = {
  default: Info,
  destructive: AlertCircle,
  warning: TriangleAlert,
  success: CheckCircle2,
  info: Info,
  muted: Info,
  neutral: Info,
};

const AlertBase = React.forwardRef<HTMLDivElement, AlertProp>(
  (
    { variant = "default", tone = "default", icon, onDismiss, className, children, ...props },
    ref,
  ) => {
    const { t } = useTranslation();
    const IconComponent = icon === false ? null : (icon ?? DEFAULT_ICONS[tone]);

    return (
      <AlertContext.Provider value={tone}>
        <div
          ref={ref}
          role={ASSERTIVE_TONES.has(tone) ? "alert" : "status"}
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
 */
export function AlertQueryError({
  error,
  category,
  onRetry,
  onAuthAction,
  className,
}: AlertQueryErrorProp) {
  const { t } = useTranslation();

  if (!category) {
    return (
      <Alert tone="destructive" className={className}>
        <AlertTitle>{t("common.error")}</AlertTitle>
        <AlertDescription>{humanError(error)}</AlertDescription>
        {onRetry && <RetryButton onRetry={onRetry} />}
      </Alert>
    );
  }

  const tone: ToneProp = WARNING_CATEGORIES.has(category) ? "warning" : "destructive";
  return (
    <Alert tone={tone} className={className}>
      <AlertTitle>{t(`query.error.title.${category}`)}</AlertTitle>
      <AlertDescription>{t(`query.error.description.${category}`)}</AlertDescription>
      {category === "auth" && onAuthAction && (
        <AlertActions>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void onAuthAction();
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
      {RETRYABLE_CATEGORIES.has(category) && onRetry && <RetryButton onRetry={onRetry} />}
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

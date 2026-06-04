import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  RefreshCw,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { humanError } from "../../lib/format";
import { cn } from "../../lib/utils";
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
              className="ring-offset-background focus-visible:ring-ring transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              aria-label={t("feedback.alert.dismiss")}
            >
              <X className="size-4" aria-hidden="true" />
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
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert-content"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    />
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

/** TanStack Query / API failure preset — same visual as `Alert tone="destructive"`. Used by `DataState` (@godxjp/ui/query). */
export function AlertQueryError({ error, onRetry, className }: AlertQueryErrorProp) {
  const { t } = useTranslation();
  return (
    <Alert tone="destructive" className={className}>
      <AlertTitle>{t("common.error")}</AlertTitle>
      <AlertDescription>{humanError(error)}</AlertDescription>
      {onRetry && (
        <AlertActions>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void onRetry();
            }}
          >
            <Flex direction="row" wrap align="center" gap="xs">
              <RefreshCw className="size-4" aria-hidden="true" />
              {t("common.retry")}
            </Flex>
          </Button>
        </AlertActions>
      )}
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

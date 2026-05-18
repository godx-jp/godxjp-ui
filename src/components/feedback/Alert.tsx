import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { Info, CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";
import { cn } from "../cn";
import type { FeedbackColorProp } from "../../props";

/**
 * Alert — Ant-Design banner-style notice.
 *
 *   <Alert color="info" title="5月度の締めは 5/31 (土) 23:59 です" />
 *   <Alert
 *     color="warning"
 *     title="3 件の打刻漏れがあります"
 *     description="本日中に確認してください。"
 *     actions={<Button size="small">確認する</Button>}
 *     closable
 *     onClose={() => …}
 *   />
 *   <Alert variant="banner" color="info" title="メンテナンス予定 …" />
 *
 * Concept mapping (Ant → @godxjp/ui vocabulary per cardinal rule 23 §B):
 *   - Ant `type`        → `color`  (semantic role)
 *   - Ant `banner`      → `variant="banner"` (full-width borderless)
 *   - Ant `message`     → `title`  (ReactNode slot)
 *   - Ant `description` → `description` (ReactNode slot)
 *   - Ant `action`      → `actions` (plural — matches Card)
 *   - Ant `showIcon`    → boolean (omit `icon` + set false → no icon)
 *   - Ant `closeIcon`   → not exposed; default × ships
 *   - Ant `closable`    → already vocab (Tag uses it)
 *   - Ant `onClose`     → onClose callback
 */

/** Alias of the shared `FeedbackColorProp` — same shape as
 *  ResultColor / ProgressColor; kept as a named export for back-compat. */
export type AlertColor = FeedbackColorProp;

export type AlertVariant = "outlined" | "banner";

export interface AlertProps
  extends Omit<ComponentProps<"div">, "color" | "title"> {
  /** Semantic role. Defaults to `default`. */
  color?: AlertColor;
  /** Outlined card (default) or full-width banner. */
  variant?: AlertVariant;
  /** Primary message. */
  title?: ReactNode;
  /** Optional secondary body text. */
  description?: ReactNode;
  /** Leading icon. Omit to auto-pick a semantic icon for the color. */
  icon?: ReactNode;
  /** Render an × close button. */
  closable?: boolean;
  /** Called when the × close button is clicked. */
  onClose?: () => void;
  /** Footer action slot (typically a Button group). */
  actions?: ReactNode;
}

const DEFAULT_ICON: Record<AlertColor, ReactNode> = {
  default: <Info aria-hidden="true" width={16} height={16} />,
  info: <Info aria-hidden="true" width={16} height={16} />,
  success: <CheckCircle2 aria-hidden="true" width={16} height={16} />,
  warning: <AlertTriangle aria-hidden="true" width={16} height={16} />,
  destructive: <AlertOctagon aria-hidden="true" width={16} height={16} />,
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    color = "default",
    variant = "outlined",
    title,
    description,
    icon,
    closable,
    onClose,
    actions,
    className,
    children,
    ...rest
  },
  ref,
) {
  const resolvedIcon = icon === undefined ? DEFAULT_ICON[color] : icon;
  const showIcon = resolvedIcon !== null && resolvedIcon !== false;

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "alert",
        `alert-color-${color}`,
        `alert-variant-${variant}`,
        className,
      )}
      {...rest}
    >
      {showIcon && <span className="alert-icon">{resolvedIcon}</span>}
      <div className="alert-body">
        {title !== undefined && <div className="alert-title">{title}</div>}
        {description !== undefined && (
          <div className="alert-desc">{description}</div>
        )}
        {children}
        {actions !== undefined && (
          <div className="alert-actions">{actions}</div>
        )}
      </div>
      {closable && (
        <button
          type="button"
          className="alert-close"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
});

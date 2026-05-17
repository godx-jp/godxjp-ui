import { forwardRef, type ComponentProps, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";
import { cn } from "./cn";

/**
 * Result — page-level outcome surface (Ant-Design `Result` shape).
 *
 *   <Result
 *     color="success"
 *     title="ご注文が完了しました"
 *     description="番号 No. 2026-05-17-0042 でお手元に届きます。"
 *     extra={<Button>注文履歴を見る</Button>}
 *   />
 *
 * Concept mapping (Ant → @godxjp/ui vocabulary per cardinal rule 23 §B):
 *   - Ant `status`       → `color`        (semantic role; HTTP-status
 *                                          shortcuts dropped — consumers
 *                                          wire their own icon)
 *   - Ant `title`        → `title`        (ReactNode slot)
 *   - Ant `subTitle`     → `description`  (matches Alert vocabulary)
 *   - Ant `icon`         → `icon`         (ReactNode slot)
 *   - Ant `extra`        → `extra`        (matches Card footer slot)
 */

export type ResultColor =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "destructive";

export interface ResultProps
  extends Omit<ComponentProps<"div">, "color" | "title"> {
  /** Semantic role. Defaults to `info`. */
  color?: ResultColor;
  /** Primary headline. */
  title?: ReactNode;
  /** Secondary body text. */
  description?: ReactNode;
  /** Leading visual. Omit to auto-pick a semantic icon for the color. */
  icon?: ReactNode;
  /** Action area below the description (typically a Button group). */
  extra?: ReactNode;
}

const DEFAULT_ICON: Record<ResultColor, ReactNode> = {
  default: <Info aria-hidden="true" width={64} height={64} />,
  info: <Info aria-hidden="true" width={64} height={64} />,
  success: <CheckCircle2 aria-hidden="true" width={64} height={64} />,
  warning: <AlertTriangle aria-hidden="true" width={64} height={64} />,
  destructive: <XCircle aria-hidden="true" width={64} height={64} />,
};

export const Result = forwardRef<HTMLDivElement, ResultProps>(function Result(
  {
    color = "info",
    title,
    description,
    icon,
    extra,
    className,
    children,
    ...rest
  },
  ref,
) {
  const resolvedIcon = icon === undefined ? DEFAULT_ICON[color] : icon;

  return (
    <div
      ref={ref}
      role="status"
      className={cn("result", `result-color-${color}`, className)}
      {...rest}
    >
      <div className="result-icon">{resolvedIcon}</div>
      {title !== undefined && <h3 className="result-title">{title}</h3>}
      {description !== undefined && (
        <p className="result-desc">{description}</p>
      )}
      {children}
      {extra !== undefined && <div className="result-extra">{extra}</div>}
    </div>
  );
});

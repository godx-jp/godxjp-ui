import { cn } from "../../lib/utils";
import type { EmptyStateProp } from "../../props/components/data-display.prop";

export type {
  EmptyStateProp,
  EmptyStateProp as EmptyStateProps,
} from "../../props/components/data-display.prop";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "page",
  className,
}: EmptyStateProp) {
  return (
    <div
      data-slot="empty-state"
      data-variant={variant}
      role="status"
      className={cn("ui-empty-state", className)}
    >
      {Icon && variant !== "compact" && (
        <div className="ui-empty-state-icon">
          <Icon className="text-muted-foreground size-6" aria-hidden="true" />
        </div>
      )}
      <h3 className="ui-empty-state-title">{title}</h3>
      {description && <p className="ui-empty-state-description">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

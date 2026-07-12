import { cn } from "../../lib/utils";
import type { EmptyStateProp } from "../../props/components/data-display.prop";

export type {
  EmptyStateProp,
  EmptyStateProp as EmptyStateProps,
} from "../../props/components/data-display.prop";

export function EmptyState({
  icon: Icon,
  title,
  titleAs,
  description,
  action,
  variant = "page",
  tone = "muted",
  className,
}: EmptyStateProp) {
  const Title = titleAs ?? (variant === "page" ? "h2" : variant === "section" ? "h3" : "p");
  return (
    <div
      data-slot="empty-state"
      data-variant={variant}
      data-tone={tone}
      role="status"
      className={cn("ui-empty-state", className)}
    >
      {Icon && variant !== "compact" && (
        <div className="ui-empty-state-icon">
          <Icon className="text-muted-foreground size-6" aria-hidden="true" />
        </div>
      )}
      <Title className="ui-empty-state-title">{title}</Title>
      {description && <p className="ui-empty-state-description">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

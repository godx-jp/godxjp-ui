import { createElement } from "react";

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
  tone = "muted",
  titleLevel = 3,
  titleAs,
  className,
}: EmptyStateProp) {
  // Title element: a real heading at `titleLevel` by default (pick the level for
  // a valid page outline, never for size), or a non-heading `titleAs` element
  // when the empty state sits inside a section that already owns its heading.
  const TitleTag = titleAs ?? `h${titleLevel}`;
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
          {/* The glyph inherits `currentColor` from `.ui-empty-state-icon`, which reads
           * `--empty-state-icon-foreground` (default `hsl(var(--muted-foreground))` at the call
           * site). A hard-coded `text-muted-foreground` here would out-specify the inherited
           * colour and pin every tone to muted — only the medallion tint would vary. */}
          <Icon aria-hidden="true" />
        </div>
      )}
      {createElement(TitleTag, { className: "ui-empty-state-title" }, title)}
      {description && <p className="ui-empty-state-description">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

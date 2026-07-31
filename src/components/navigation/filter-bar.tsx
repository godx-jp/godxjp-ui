import { useId } from "react";
import { X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { Button } from "../general/button";
import { cn } from "../../lib/utils";
import type { ToolbarGroupProp, ToolbarProp } from "../../props/components/navigation.prop";

export type {
  FilterBarOverflowProp,
  ToolbarGroupProp,
  ToolbarGroupProp as ToolbarGroupProps,
  ToolbarGroupProp as FilterBarGroupProp,
  ToolbarGroupProp as FilterBarGroupProps,
  ToolbarProp,
  ToolbarProp as ToolbarProps,
  ToolbarProp as FilterBarProp,
  ToolbarProp as FilterBarProps,
} from "../../props/components/navigation.prop";

export function Toolbar({
  onClear,
  hasActiveFilters = true,
  sticky = false,
  overflow = "wrap",
  className,
  children,
}: ToolbarProp) {
  const { t } = useTranslation();

  return (
    <div
      role="toolbar"
      aria-label={t("navigation.toolbar.ariaLabel")}
      // `data-overflow` drives the responsive strategy in CSS (never JS measurement, so it is
      // container-width truthful at 1440/1024/390 with long JA/EN/VI labels alike):
      //   wrap   — groups stack on narrow, then wrap onto extra rows (default)
      //   scroll — one bounded row that scrolls inline; groups never shrink or wrap
      // The scroll region needs no tabIndex: every filter group holds a focusable control, so it
      // is already keyboard-reachable (axe scrollable-region-focusable / WCAG 2.1.1).
      data-overflow={overflow}
      className={cn("ui-toolbar", sticky && "ui-toolbar-sticky", className)}
    >
      {children}
      {onClear && hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="ui-toolbar-clear">
          <X aria-hidden="true" />
          {t("common.clearFilters")}
        </Button>
      )}
    </div>
  );
}

export function ToolbarGroup({ label, controlId, className, children }: ToolbarGroupProp) {
  const labelId = useId();

  return (
    <div
      role="group"
      aria-labelledby={label ? labelId : undefined}
      className={cn("ui-stack-xs ui-toolbar-group", className)}
    >
      {/* With `controlId` the visible group label becomes the CONTROL's real <label>, so the
       * filter is named by the text the user can see (WCAG 2.5.3 label-in-name / 1.3.1) instead
       * of only naming the group wrapper. Without it the label stays a plain group caption and
       * the control must carry its own accessible name (`aria-label`) — a bare Select under a
       * group caption alone is nameless (axe: button-name / select-name). */}
      {label ? (
        controlId ? (
          <label id={labelId} htmlFor={controlId} className="ui-toolbar-label">
            {label}
          </label>
        ) : (
          <div id={labelId} className="ui-toolbar-label">
            {label}
          </div>
        )
      ) : null}
      {children}
    </div>
  );
}

/**
 * Canonical list-page filter strip.
 *
 * `Toolbar` remains available for backwards compatibility. `FilterBar` is the
 * public domain-neutral name used by application design specifications.
 */
export const FilterBar = Toolbar;

/** Labelled control group for {@link FilterBar}. */
export const FilterBarGroup = ToolbarGroup;

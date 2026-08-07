import { useId } from "react";
import { X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { Button } from "../general/button";
import { cn } from "../../lib/utils";
import type { ToolbarGroupProp, ToolbarProp } from "../../props/components/navigation.prop";

export type {
  FilterBarChipProp,
  FilterBarChipProp as FilterBarChipProps,
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
  search,
  chips,
  onChipRemove,
  resultCount,
  actions,
  className,
  children,
}: ToolbarProp) {
  const { t } = useTranslation();
  const hasChips = chips != null && chips.length > 0;

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
      {/* ORDER IS THE CONTRACT (#258). DOM order is tab order, so the bar — not each caller —
       * decides it: search → filter groups → applied chips → result count → reset → actions. Every
       * region below the existing `children` is opt-in and emits NOTHING when its prop is absent,
       * so a bar built the old way (children + onClear) is byte-identical to before. */}
      {search != null && (
        // A region, not a bare child, so the search control gets ONE measure
        // (--filter-bar-search-width) across every list page instead of whatever width the
        // caller's control happened to have.
        <div className="ui-filter-bar-search">{search}</div>
      )}

      {children}

      {hasChips && (
        // `group` (not a second toolbar) — a toolbar may own a group, and the chips are a labelled
        // set of related controls rather than an independent toolbar competing for the same role.
        <div
          role="group"
          aria-label={t("navigation.filterBar.appliedFilters")}
          className="ui-filter-bar-chips"
        >
          {chips.map((chip) => (
            <span key={chip.id} className="ui-filter-bar-chip">
              <span className="ui-filter-bar-chip-label">{chip.label}</span>
              {/* No remove control at all for a chip the user may not lift — a disabled ✕ is a
               * dead tab stop that promises an action the app will never perform. */}
              {(chip.onRemove || onChipRemove) && (
                <Button
                  variant="ghost"
                  size="xs"
                  className="ui-filter-bar-chip-remove"
                  // Names the SPECIFIC filter being lifted: a row of buttons all called "Remove"
                  // is unusable from a screen-reader's control list (WCAG 2.4.6 / 4.1.2).
                  aria-label={t("navigation.filterBar.removeFilter", { label: chip.label })}
                  onClick={() => {
                    chip.onRemove?.();
                    onChipRemove?.(chip.id);
                  }}
                >
                  <X aria-hidden="true" />
                </Button>
              )}
            </span>
          ))}
        </div>
      )}

      {resultCount !== undefined && (
        // The whole reason this is a prop rather than caller markup: a sighted user SEES the table
        // change, and a polite live region is what tells everyone else that filtering happened.
        // The number is grouped by `Intl.NumberFormat` and the noun selected by CLDR plural rules
        // for the active locale — never a hand-built "N items".
        <div role="status" aria-live="polite" className="ui-filter-bar-count">
          {t("navigation.filterBar.resultCount", { count: resultCount })}
        </div>
      )}

      {onClear && hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="ui-toolbar-clear">
          <X aria-hidden="true" />
          {t("common.clearFilters")}
        </Button>
      )}

      {/* After the reset, so "clear filters" never lands at the end of the row next to an
       * unrelated primary action. */}
      {actions != null && <div className="ui-filter-bar-actions">{actions}</div>}
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

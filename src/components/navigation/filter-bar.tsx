import { useId } from "react";
import { X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { Button } from "../general/button";
import { Badge } from "../data-display/badge";
import { SearchInput } from "../data-entry/search-input";
import { Select } from "../data-entry/select";
import { cn } from "../../lib/utils";
import type { ToolbarGroupProp, ToolbarProp } from "../../props/components/navigation.prop";

export type {
  FilterBarChipProp,
  FilterBarChipProp as FilterBarChipProps,
  FilterBarFilterProp,
  FilterBarFilterProp as FilterBarFilterProps,
  FilterBarOverflowProp,
  FilterBarSearchProp,
  FilterBarSearchProp as FilterBarSearchProps,
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
  filters,
  chips,
  onChipRemove,
  actions,
  resultCount,
  loading,
  disabled,
  error,
  className,
  children,
}: ToolbarProp) {
  const { t } = useTranslation();
  const reactId = useId();

  // Typed model (gh#258): ANY model prop switches to the canonical model layout. Without one,
  // the legacy children-composition markup below is rendered UNCHANGED (backward compatible).
  const hasModel =
    search !== undefined ||
    filters !== undefined ||
    chips !== undefined ||
    onChipRemove !== undefined ||
    actions !== undefined ||
    resultCount !== undefined ||
    loading !== undefined ||
    disabled !== undefined ||
    error !== undefined;

  if (!hasModel) {
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

  const showClear = Boolean(onClear && hasActiveFilters);
  const showChips = Boolean(chips && chips.length > 0);
  const showMeta = error != null || resultCount !== undefined;

  // Canonical DOM (= keyboard/tab) order, gh#258:
  //   search → typed filters → children (custom composition filters) → reset → actions
  //   → applied-filter chips row → result-count / error line.
  return (
    <div
      className={cn("ui-filter-bar", sticky && "ui-toolbar-sticky", className)}
      data-loading={loading || undefined}
    >
      <div
        role="toolbar"
        aria-label={t("navigation.toolbar.ariaLabel")}
        aria-busy={loading || undefined}
        data-overflow={overflow}
        className="ui-toolbar"
      >
        {search && (
          <SearchInput
            id={search.id}
            className="ui-filter-bar-search"
            label={search.label}
            ariaLabel={search.ariaLabel}
            placeholder={search.placeholder}
            value={search.value}
            defaultValue={search.defaultValue}
            onValueChange={search.onValueChange}
            onSearch={search.onSearch}
            disabled={disabled || search.disabled}
          />
        )}
        {filters?.map((filter) => {
          const controlId = `${reactId}-filter-${filter.value}`;
          return (
            <ToolbarGroup
              key={filter.value}
              label={filter.label}
              controlId={controlId}
              className="ui-filter-bar-filter"
            >
              <Select
                id={controlId}
                options={filter.options}
                value={filter.selected}
                defaultValue={filter.defaultSelected}
                onValueChange={(selected: string) => filter.onSelectedChange?.(selected)}
                placeholder={filter.placeholder}
                disabled={disabled || filter.disabled}
              />
            </ToolbarGroup>
          );
        })}
        {children}
        {(showClear || actions != null) && (
          <div className="ui-filter-bar-end">
            {showClear && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                disabled={disabled}
                className="ui-toolbar-clear"
              >
                <X aria-hidden="true" />
                {t("common.clearFilters")}
              </Button>
            )}
            {actions != null && <div className="ui-filter-bar-actions">{actions}</div>}
          </div>
        )}
      </div>
      {showChips && (
        <div
          role="group"
          aria-label={t("navigation.filterBar.appliedFilters")}
          className="ui-filter-bar-chips"
        >
          {chips!.map((chip) => (
            <span key={chip.value} className="ui-filter-bar-chip">
              <Badge variant="outline">{chip.label}</Badge>
              {onChipRemove && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled || chip.disabled}
                  aria-label={t("navigation.filterBar.removeFilter", {
                    label: typeof chip.label === "string" ? chip.label : chip.value,
                  })}
                  onClick={() => onChipRemove(chip.value)}
                >
                  <X aria-hidden="true" />
                </Button>
              )}
            </span>
          ))}
        </div>
      )}
      {showMeta && (
        <div className="ui-filter-bar-meta">
          {error != null ? (
            <p role="alert" className="ui-filter-bar-error">
              {error}
            </p>
          ) : (
            <p role="status" className="ui-filter-bar-count">
              {t("navigation.filterBar.resultCount", { count: resultCount! })}
            </p>
          )}
        </div>
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

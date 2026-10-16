import { useId } from "react";
import { X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { Button } from "../general/button";
import { Badge } from "../data-display/badge";
import { SearchInput } from "../data-entry/search-input";
import { Select } from "../data-entry/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../feedback/tooltip";
import { cn } from "../../lib/utils";
import type { ToolbarGroupProp, ToolbarProp } from "../../props/components/navigation.prop";

export type {
  FilterBarChipProp,
  FilterBarChipProp as FilterBarChipProps,
  FilterBarFilterProp,
  FilterBarFilterProp as FilterBarFilterProps,
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
  search,
  filters,
  chips,
  onChipRemove,
  actions,
  resultCount,
  loading,
  disabled,
  error,
  clearDisplay = "label",
  views,
  viewsPlacement = "above",
  className,
  children,
}: ToolbarProp) {
  const { t } = useTranslation();
  const reactId = useId();

  // Without one,
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
    error !== undefined ||
    views !== undefined;

  /**
   * The clear-all control in either display (gh#1264). `icon` keeps the accessible name and moves
   * the visible text into a tooltip, so the button is a control-height square instead of ~150px.
   */
  const clearButton = (isDisabled?: boolean) => {
    const label = t("common.clearFilters");
    if (clearDisplay === "icon") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClear}
              disabled={isDisabled}
              aria-label={label}
              className="ui-toolbar-clear"
              data-display="icon"
            >
              <X aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      );
    }
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        disabled={isDisabled}
        className="ui-toolbar-clear"
      >
        <X aria-hidden="true" />
        {label}
      </Button>
    );
  };

  if (!hasModel) {
    return (
      <div
        role="toolbar"
        aria-label={t("navigation.toolbar.ariaLabel")}
        className={cn("ui-toolbar", sticky && "ui-toolbar-sticky", className)}
      >
        {children}
        {onClear && hasActiveFilters && clearButton()}
      </div>
    );
  }

  const showClear = Boolean(onClear && hasActiveFilters);
  const showChips = Boolean(chips && chips.length > 0);
  const showMeta = error != null || resultCount !== undefined;

  //   views row → search → typed filters → children (custom composition filters) → reset
  //   → actions → applied-filter chips row → result-count / error line.
  return (
    <div
      className={cn("ui-filter-bar", sticky && "ui-toolbar-sticky", className)}
      data-loading={loading || undefined}
    >
      {views != null && viewsPlacement === "above" && (
        <div className="ui-filter-bar-views">{views}</div>
      )}
      <div
        role="toolbar"
        aria-label={t("navigation.toolbar.ariaLabel")}
        aria-busy={loading || undefined}
        className="ui-toolbar"
      >
        {views != null && viewsPlacement === "inline" && (
          <div className="ui-filter-bar-views" data-placement="inline">
            {views}
          </div>
        )}
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
                /* A filter is optional by nature — "no filter" is its resting state — so the bar
                 * asks for the ✕ explicitly now that `Select` follows antd and ships none by
                 * default (#691). */
                allowClear
                /* THE ✕ IS NAMED AFTER THE FILTER IT CLEARS. The clear affix's default name is the generic 「選択をクリア」 — measured on
                 * /isolate/navigation-filter-bar after giving two filters a value: two buttons,
                 * one name, and nothing in either that says WHICH filter it empties. A consumer
                 * screen reported three on one screen. The chip row beside it already names
                 * itself this way (`removeFilter`), so the bar was inconsistent with itself.
                 * `Select` has always had `clearLabel`; only the bar never passed one — a
                 * component that renders a control on the consumer's behalf owes it the context
                 * the consumer cannot reach. */
                clearLabel={
                  typeof filter.label === "string"
                    ? t("navigation.filterBar.clearFilter", { label: filter.label })
                    : undefined
                }
              />
            </ToolbarGroup>
          );
        })}
        {children}
        {(showClear || actions != null) && (
          <div className="ui-filter-bar-end">
            {showClear && clearButton(disabled)}
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
            <Badge
              key={chip.value}
              variant="outline"
              className="ui-filter-bar-chip"
              onRemove={onChipRemove ? () => onChipRemove(chip.value) : undefined}
              removeDisabled={Boolean(disabled || chip.disabled)}
            >
              {typeof chip.label === "string" ? chip.label : chip.value}
            </Badge>
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
      {/* The control cell (gh#1362): `--control-height` tall with the control centred in it, so a
       * Switch (20px) or any control shorter than the inputs beside it lines up on their centre,
       * and every group's label lands on the same row. */}
      <div className="ui-toolbar-control">{children}</div>
    </div>
  );
}

/** Canonical list-page filter strip. `Toolbar` remains available for backwards compatibility. */
export const FilterBar = Toolbar;

/** Labelled control group for {@link FilterBar}. */
export const FilterBarGroup = ToolbarGroup;

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { SearchFormProp } from "../../props/components/navigation.prop";
import { Form } from "../data-entry/form";
import { Button } from "../general/button";
import { ResponsiveGrid } from "../layout/responsive-grid";

export type { SearchFormProp, SearchFormProp as SearchFormProps };

const DEFAULT_COLUMNS = { base: 1, md: 2, lg: 3 } as const;

/** The widest step of a `columns` value: how many conditions make up one row on a wide screen. */
function widestStep(columns: SearchFormProp["columns"]): number {
  if (typeof columns === "number") return Math.max(1, columns);
  const steps = Object.values(columns ?? DEFAULT_COLUMNS).filter(
    (n): n is number => typeof n === "number",
  );
  return Math.max(1, ...steps);
}

/**
 * SearchForm — the submit-driven 検索条件フォーム (Ant Design ProComponents `QueryFilter`).
 *
 * A `search` landmark (`<form role="search">`) holding a grid of labelled conditions, aligned in
 * columns. The conditions past the first row sit behind one 詳細条件を開く / 閉じる toggle that
 * names how many are hidden; Search (検索) submits, Clear (クリア) resets. After a search the
 * conditions the results were searched with, and the result count, are announced in one
 * `role="status"` line. Every label is localized through the library catalogue.
 *
 * Choose it over a live FilterBar when the conditions are many, the query is heavy, or the users
 * expect an explicit 検索 button (Japanese business systems). Hidden conditions stay MOUNTED, so a
 * value typed into one survives collapsing the section.
 */
export const SearchForm = React.forwardRef<HTMLFormElement, SearchFormProp>(function SearchForm(
  {
    children,
    columns = DEFAULT_COLUMNS,
    visibleFields,
    open,
    defaultOpen = false,
    onOpenChange,
    onReset,
    searchLabel,
    resetLabel,
    summary,
    resultCount,
    loading,
    label,
    className,
    ...props
  },
  ref,
) {
  const { t } = useTranslation();
  const baseId = React.useId();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;

  const fields = React.Children.toArray(children).filter(React.isValidElement);
  const limit = Math.max(1, visibleFields ?? widestStep(columns));
  const hiddenCount = Math.max(0, fields.length - limit);
  const hiddenIds = Array.from({ length: hiddenCount }, (_, i) => `${baseId}-more-${i}`);

  const toggle = () => {
    const next = !isOpen;
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const showMeta = summary != null || resultCount !== undefined;

  return (
    <Form
      ref={ref}
      role="search"
      aria-label={label ?? t("navigation.searchForm.label")}
      className={cn("ui-search-form", className)}
      {...props}
    >
      <div className="ui-search-form-body">
        <ResponsiveGrid columns={columns}>
          {fields.map((field, index) =>
            index < limit ? (
              field
            ) : (
              /* Past the first row: kept mounted and hidden, so a typed value survives a collapse. */
              <div
                key={field.key ?? index}
                id={hiddenIds[index - limit]}
                hidden={!isOpen}
                className="ui-search-form-more"
              >
                {field}
              </div>
            ),
          )}
        </ResponsiveGrid>
        <div className="ui-search-form-actions">
          {hiddenCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ui-search-form-toggle"
              aria-expanded={isOpen}
              aria-controls={hiddenIds.join(" ")}
              onClick={toggle}
              count={isOpen ? undefined : hiddenCount}
              showZero={false}
              countLabel={t("navigation.searchForm.hiddenCount")}
            >
              {isOpen ? t("navigation.searchForm.collapse") : t("navigation.searchForm.expand")}
              {isOpen ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
            </Button>
          )}
          <div className="ui-search-form-submit">
            {onReset && (
              <Button type="button" variant="outline" onClick={onReset}>
                {resetLabel ?? t("navigation.searchForm.reset")}
              </Button>
            )}
            <Button type="submit" loading={loading}>
              {searchLabel ?? t("navigation.searchForm.search")}
            </Button>
          </div>
        </div>
        {showMeta && (
          <p role="status" className="ui-search-form-meta">
            {summary != null && (
              <span className="ui-search-form-summary">
                <span className="ui-search-form-summary-label">
                  {t("navigation.searchForm.summary")}
                </span>{" "}
                {summary}
              </span>
            )}
            {resultCount !== undefined && (
              <span className="ui-search-form-count">
                {t("navigation.filterBar.resultCount", { count: resultCount })}
              </span>
            )}
          </p>
        )}
      </div>
    </Form>
  );
});

import * as React from "react";

import { cn } from "../../lib/utils";
import type {
  EditorialFilterFieldProp,
  EditorialFilterPanelProp,
  EditorialListingToolbarProp,
} from "../../props/components/layout.prop";

export type {
  EditorialFilterFieldProp,
  EditorialFilterFieldProp as EditorialFilterFieldProps,
  EditorialFilterPanelProp,
  EditorialFilterPanelProp as EditorialFilterPanelProps,
  EditorialListingToolbarProp,
  EditorialListingToolbarProp as EditorialListingToolbarProps,
} from "../../props/components/layout.prop";

/*
 * The catalog bodies of the editorial family (gh#1438): a listing's filter panel and toolbar. As in
 * editorial.tsx, every length is an --editorial-* token (tokens/components/editorial.css) and no rule
 * names a breakpoint.
 */

/** A catalog's filter panel: labelled fields that wrap, bottom aligned, and a trailing action. */
export function EditorialFilterPanel({
  children,
  action,
  className,
  ...rest
}: EditorialFilterPanelProp) {
  return (
    <div
      role="group"
      aria-label={rest["aria-label"]}
      data-slot="editorial-filter-panel"
      className={cn("ui-editorial-filter-panel", className)}
    >
      {children}
      {action != null && <div className="ui-editorial-filter-panel-action">{action}</div>}
    </div>
  );
}

/** One field of an `EditorialFilterPanel`: a visible label over one control. */
export function EditorialFilterField({
  label,
  htmlFor,
  children,
  className,
}: EditorialFilterFieldProp) {
  return (
    <div data-slot="editorial-filter-field" className={cn("ui-editorial-filter-field", className)}>
      <label htmlFor={htmlFor} className="ui-editorial-filter-field-label">
        {label}
      </label>
      {children}
    </div>
  );
}

/** The row above a catalog's results: count and note at the start, order / view at the end. */
export function EditorialListingToolbar({
  count,
  note,
  actions,
  className,
}: EditorialListingToolbarProp) {
  return (
    <div
      data-slot="editorial-listing-toolbar"
      className={cn("ui-editorial-listing-toolbar", className)}
    >
      {(count != null || note != null) && (
        <div className="ui-editorial-listing-toolbar-summary">
          {count != null && (
            <p aria-live="polite" className="ui-editorial-listing-toolbar-count">
              {count}
            </p>
          )}
          {note != null && <p className="ui-editorial-listing-toolbar-note">{note}</p>}
        </div>
      )}
      {actions != null && <div className="ui-editorial-listing-toolbar-actions">{actions}</div>}
    </div>
  );
}

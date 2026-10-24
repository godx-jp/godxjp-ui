import * as React from "react";
import { Bookmark } from "lucide-react";

import { cn } from "../../lib/utils";
import type {
  CatalogDetailProp,
  CatalogDetailSectionProp,
  CatalogDetailTagProp,
  EditorialFilterFieldProp,
  EditorialFilterPanelProp,
  EditorialListingToolbarProp,
  EditorialPromptProp,
  PriceSummaryProp,
} from "../../props/components/layout.prop";

export type {
  CatalogDetailProp,
  CatalogDetailProp as CatalogDetailProps,
  CatalogDetailSectionProp,
  CatalogDetailSectionProp as CatalogDetailSectionProps,
  CatalogDetailTagProp,
  EditorialPromptProp,
  EditorialPromptProp as EditorialPromptProps,
  PriceSummaryProp,
  PriceSummaryProp as PriceSummaryProps,
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
  variant = "panel",
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
      data-variant={variant === "bare" ? "bare" : undefined}
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

/** The head of a catalog item's page: framed picture beside kicker, h1, tags, summary, facts. */
export function CatalogDetail({
  variant = "card",
  media,
  favorite,
  mediaCaption,
  overline,
  title,
  meta,
  summary,
  actions,
  facts,
  className,
}: CatalogDetailProp) {
  return (
    <div
      data-slot="catalog-detail"
      data-variant={variant}
      className={cn("ui-catalog-detail", className)}
    >
      <div className="ui-catalog-detail-visual">
        <div className="ui-catalog-detail-art">
          {favorite && (
            <button
              type="button"
              aria-pressed={favorite.pressed}
              aria-label={favorite.label}
              disabled={favorite.disabled}
              className="ui-catalog-card-favorite ui-focus-ring"
              onClick={() => favorite.onPressedChange(!favorite.pressed)}
            >
              <Bookmark aria-hidden className="ui-catalog-card-favorite-icon" />
            </button>
          )}
          {media}
        </div>
        {mediaCaption != null && <p className="ui-catalog-detail-caption">{mediaCaption}</p>}
      </div>
      <div className="ui-catalog-detail-main">
        {overline}
        <h1 className="ui-catalog-detail-title">{title}</h1>
        {meta != null && <div className="ui-catalog-detail-meta">{meta}</div>}
        {summary && (
          <div className="ui-catalog-detail-summary">
            {summary.label != null && (
              <p className="ui-catalog-detail-summary-label">{summary.label}</p>
            )}
            <p className="ui-catalog-detail-summary-price">{summary.price}</p>
            {summary.note != null && (
              <p className="ui-catalog-detail-summary-note">{summary.note}</p>
            )}
          </div>
        )}
        {actions != null && <div className="ui-catalog-detail-actions">{actions}</div>}
        {facts && facts.length > 0 && (
          <dl className="ui-catalog-detail-facts">
            {facts.map((fact) => (
              <div key={fact.key} className="ui-catalog-detail-fact">
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

/** One outlined tag in a `CatalogDetail` meta row. */
export function CatalogDetailTag({ children, className }: CatalogDetailTagProp) {
  return <span className={cn("ui-catalog-detail-tag", className)}>{children}</span>;
}

/** One band of an item page under its head: hairline, h2, muted paragraph, then the rest. */
export function CatalogDetailSection({
  variant = "band",
  title,
  description,
  children,
  id,
  titleId,
  className,
}: CatalogDetailSectionProp) {
  return (
    <section
      id={id}
      aria-labelledby={title != null ? titleId : undefined}
      data-slot="catalog-detail-section"
      data-variant={variant === "module" ? "module" : undefined}
      className={cn("ui-catalog-detail-section", className)}
    >
      {title != null && (
        <h2 id={titleId} className="ui-catalog-detail-section-title">
          {title}
        </h2>
      )}
      {description != null && (
        <p className="ui-catalog-detail-section-description">{description}</p>
      )}
      {children}
    </section>
  );
}

/** A joined strip of headline figures, with an optional wider context cell. */
export function PriceSummary({ items, context, className }: PriceSummaryProp) {
  return (
    <div data-slot="price-summary" className={cn("ui-price-summary", className)}>
      {items.map((item) => (
        <div key={item.key} className="ui-price-summary-cell">
          <span className="ui-price-summary-label">{item.label}</span>
          <strong className="ui-price-summary-value">{item.value}</strong>
          {item.caption != null && <small className="ui-price-summary-caption">{item.caption}</small>}
        </div>
      ))}
      {context && (
        <div className="ui-price-summary-cell" data-context="">
          <span className="ui-price-summary-label">{context.label}</span>
          <b className="ui-price-summary-context">{context.value}</b>
          {context.caption != null && (
            <small className="ui-price-summary-caption">{context.caption}</small>
          )}
        </div>
      )}
    </div>
  );
}

/** A polite inline invitation: round glyph, heading, paragraph, note, one action. */
export function EditorialPrompt({
  icon,
  title,
  description,
  note,
  action,
  level = 3,
  className,
}: EditorialPromptProp) {
  const Heading = level === 2 ? "h2" : level === 4 ? "h4" : "h3";
  return (
    <div data-slot="editorial-prompt" className={cn("ui-editorial-prompt", className)}>
      {icon != null && (
        <span aria-hidden className="ui-editorial-prompt-icon">
          {icon}
        </span>
      )}
      <div className="ui-editorial-prompt-copy">
        <Heading className="ui-editorial-prompt-title">{title}</Heading>
        {description != null && <p className="ui-editorial-prompt-description">{description}</p>}
        {note != null && <p className="ui-editorial-prompt-note">{note}</p>}
      </div>
      {action != null && <div className="ui-editorial-prompt-action">{action}</div>}
    </div>
  );
}

/**
 * PageHeader — the canonical page title band (gh#255).
 *
 * This is the geometry `PageContainer` has always rendered, lifted into its own export so a
 * consumer can mount it OUTSIDE a full page shell — a Sheet detail, a `MasterDetail` detail pane, a
 * tab body, a nested route header — without re-authoring `.ui-page-header` CSS locally. There is
 * exactly ONE implementation: `PageContainer` renders this component, so the two can never drift.
 *
 * The band owns: breadcrumbs (a named `<nav>` landmark with `aria-current="page"` on the leaf), the
 * `<h1>` title, the subtitle/description, a status/meta slot, the `extra` action region, the
 * responsive overflow arrangement (`layout`), and the pending state (`loading`). It owns no page
 * chrome — padding, measure and body rhythm stay with `PageContainer`.
 *
 * DENIED / ERROR are deliberately NOT states of this component: a page the user may not see must
 * not render its title, breadcrumb trail or actions at all (they leak the resource's existence and
 * its name). That whole-surface contract belongs to `ErrorSurface`, which is the canonical public
 * replacement — see `docs/CANONICAL-CONTRACTS.md`.
 */
import * as React from "react";
import { ChevronRight } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { PageHeaderProp } from "../../props/components/layout.prop";

export type {
  PageHeaderProp,
  PageHeaderProp as PageHeaderProps,
} from "../../props/components/layout.prop";

export const PageHeader = React.forwardRef<HTMLElement, PageHeaderProp>(function PageHeader(
  {
    title,
    subtitle,
    meta,
    extra,
    breadcrumb,
    breadcrumbLabel,
    breadcrumbAriaLabel,
    linkComponent: LinkComponent = "a",
    layout = "stack",
    loading = false,
    className,
  },
  ref,
) {
  const { t } = useTranslation();

  return (
    // `data-layout` is the only hook the header arrangement needs: `stack` (the default)
    // matches no rule, so the historical geometry is untouched, while `responsive-inline`
    // selects the compact-range rules that keep `extra` beside the title band (gh#231).
    <header
      ref={ref}
      className={cn("ui-page-header", className)}
      data-layout={layout}
      // Only emitted while pending, so a settled header carries no ARIA state at all.
      aria-busy={loading ? "true" : undefined}
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <nav
          aria-label={
            breadcrumbLabel ?? breadcrumbAriaLabel ?? t("navigation.breadcrumb.ariaLabel")
          }
          className="ui-breadcrumb"
        >
          <ol className="ui-breadcrumb-list">
            {breadcrumb.map((item, i) => {
              const isLast = i === breadcrumb.length - 1;
              return (
                <li key={i} className="ui-inline-xs">
                  {item.to && !isLast ? (
                    <LinkComponent
                      href={item.to}
                      to={item.to}
                      className="hover:text-foreground hover:underline"
                    >
                      {item.label}
                    </LinkComponent>
                  ) : (
                    <span
                      className={isLast ? "text-foreground" : ""}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight className="size-3" aria-hidden="true" />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      <div className="ui-page-header-row">
        <div className="ui-page-header-heading min-w-0">
          {/* The `<h1>` stays in the tree while pending — a page that drops its only level-1
           * heading mid-load breaks the heading outline a screen-reader user navigates by. It
           * BECOMES the placeholder by wearing the library's own `ui-skeleton-block` skin rather
           * than wrapping a `<Skeleton>` element: `<h1>` takes phrasing content, so nesting
           * Skeleton's `<div>` inside it is invalid HTML. The visible name is sr-only text, because
           * a heading rendered as a bare decorative box is an EMPTY heading (axe `empty-heading`,
           * WCAG 1.3.1). */}
          {loading ? (
            <h1 className="ui-page-title ui-skeleton-block ui-page-title-placeholder">
              <span className="sr-only">{t("layout.pageHeader.loading")}</span>
            </h1>
          ) : meta != null ? (
            <div className="ui-page-title-band">
              <h1 className="ui-page-title">{title}</h1>
              <div className="ui-page-header-meta">{meta}</div>
            </div>
          ) : (
            <h1 className="ui-page-title">{title}</h1>
          )}
          {loading ? (
            // Decorative only — the pending state is already announced once by the heading above,
            // so a second live placeholder here would double-announce it.
            <p
              className="ui-page-subtitle ui-skeleton-block ui-page-subtitle-placeholder"
              aria-hidden="true"
            />
          ) : (
            subtitle && <p className="ui-page-subtitle">{subtitle}</p>
          )}
        </div>
        {extra && <div className="ui-page-header-extra">{extra}</div>}
      </div>
    </header>
  );
});

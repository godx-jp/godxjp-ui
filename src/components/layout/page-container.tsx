/** PageContainer — mandatory shell for every admin page (Ant Design PageHeader equivalent). */
import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { densityClass, pageContainerVariantClass } from "../../lib/variants";
import type { PageContainerProp, PageInsetProp } from "../../props/components/layout.prop";

/** Nearest scrollable ancestor (the page's scroll viewport), else the window. */
function scrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node) {
    const overflowY = getComputedStyle(node).overflowY;
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") return node;
    node = node.parentElement;
  }
  return null;
}

/**
 * `footerReveal="onScroll"`: reveal the sticky footer once the header scrolls
 * out of the page's scroll viewport. The footer stays mounted (CSS only flips
 * a transform), so toggling never reflows the body — no scroll jitter.
 */
function useFooterReveal(enabled: boolean) {
  const headerRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const el = headerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return; // jsdom/SSR-safe

    const observer = new IntersectionObserver(([entry]) => setRevealed(!entry.isIntersecting), {
      root: scrollParent(el),
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return { headerRef, revealed: enabled && revealed };
}

export type {
  PageContainerProp,
  PageContainerProp as PageContainerProps,
} from "../../props/components/layout.prop";
export type {
  BreadcrumbItemProp,
  BreadcrumbItemProp as BreadcrumbItem,
} from "../../props/vocabulary/navigation.prop";

export function PageContainerInset({ className, children, ...props }: PageInsetProp) {
  return (
    <div className={cn("ui-page-container-inset", className)} {...props}>
      {children}
    </div>
  );
}

function PageContainerRoot({
  title,
  subtitle,
  status,
  extra,
  toolbar,
  footer,
  breadcrumb,
  breadcrumbLabel,
  breadcrumbAriaLabel,
  linkComponent: LinkComponent = "a",
  headerLoading = false,
  density,
  variant = "default",
  preset = "default",
  headerLayout = "stack",
  headerScale = "document",
  measure = "default",
  stickyFooter = false,
  footerReveal = "always",
  fill = false,
  children,
  className,
}: PageContainerProp) {
  const reveal = stickyFooter && footer != null && footerReveal === "onScroll";
  const { headerRef, revealed } = useFooterReveal(reveal);
  const { t } = useTranslation();

  // `data-measure` caps the HEADER and the BODY to one shared token-owned measure so a header
  // action ends flush with the body surface (gh#245/gh#247). `default` matches no rule in the
  // stylesheet, so a page that never sets `measure` is geometrically untouched.
  //
  // `data-header-scale` is emitted ONLY for `chrome` (rule #44: present-when-on, absent-when-off),
  // so a document page's DOM is byte-identical to before and no consumer selector has to out-
  // specify a marker that means "nothing changed".
  return (
    <div
      data-preset={preset}
      data-measure={measure}
      data-header-scale={headerScale === "chrome" ? "chrome" : undefined}
      data-revealed={revealed ? "true" : undefined}
      className={cn(
        "ui-page-container",
        // Unset → no class, so the page inherits the global density axis
        // (:root[data-density]); an explicit prop emits a class that overrides it.
        density && densityClass[density],
        pageContainerVariantClass[variant],
        stickyFooter && "ui-page-container--sticky-footer",
        reveal && "ui-page-container--reveal-footer",
        fill && "ui-page-container--fill",
        className,
      )}
    >
      {/* `data-layout` is the only hook the header arrangement needs: `stack` (the default)
          matches no rule, so the historical geometry is untouched, while `responsive-inline`
          selects the compact-range rules that keep `extra` beside the title band (gh#231). */}
      <header
        ref={headerRef}
        className="ui-page-header"
        data-layout={headerLayout}
        // Only emitted while pending, so a settled header carries no ARIA state at all.
        aria-busy={headerLoading ? "true" : undefined}
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
            {/* `status` (godxjp-ui#255): the status/meta band shares the title line at the
                token-owned --page-header-status-gap and wraps UNDER the title on compact
                viewports. The wrapper row exists only when `status` is passed, so a page
                without one keeps the exact historical DOM and geometry. */}
            {/* `headerLoading` (gh#255): the `<h1>` stays in the tree while pending — a page that
                drops its only level-1 heading mid-load breaks the heading outline a screen-reader
                user navigates by. It BECOMES the placeholder by wearing the library's own
                `ui-skeleton-block` skin rather than wrapping a `<Skeleton>` element: `<h1>` takes
                phrasing content, so nesting Skeleton's `<div>` inside it is invalid HTML. The
                visible name is sr-only text, because a heading rendered as a bare decorative box
                is an EMPTY heading (axe `empty-heading`, WCAG 1.3.1). */}
            {headerLoading ? (
              <h1 className="ui-page-title ui-skeleton-block ui-page-title-placeholder">
                <span className="sr-only">{t("layout.pageHeader.loading")}</span>
              </h1>
            ) : status != null ? (
              <div className="ui-page-header-title-row">
                <h1 className="ui-page-title">{title}</h1>
                <div className="ui-page-header-status">{status}</div>
              </div>
            ) : (
              <h1 className="ui-page-title">{title}</h1>
            )}
            {headerLoading ? (
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

      {/* `toolbar` — the fixed chrome band between the header and the body: a filter strip, a
          status bar, a channel workflow rail. It is a SIBLING of `.ui-page-body`, never a child,
          because under `fill` the body is the scroll viewport: as a `flex: none` sibling the band
          stays put and the transcript scrolls beneath NOTHING, whereas a `position: sticky` strip
          inside the scroller keeps content flowing under it (the half-sliced row a hand-laid page
          chrome always produces). Absent → no element and no gap at all. */}
      {toolbar != null && <div className="ui-page-toolbar">{toolbar}</div>}

      {children != null && <div className="ui-page-body">{children}</div>}

      {footer && <footer className="ui-page-footer">{footer}</footer>}
    </div>
  );
}

export const PageContainer = Object.assign(PageContainerRoot, {
  Inset: PageContainerInset,
});

/** PageContainer — mandatory shell for every admin page (Ant Design PageHeader equivalent). */
import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

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

    const observer = new IntersectionObserver(
      ([entry]) => setRevealed(!entry.isIntersecting),
      { root: scrollParent(el), threshold: 0 },
    );
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
  extra,
  footer,
  breadcrumb,
  linkComponent: LinkComponent = "a",
  density,
  variant = "default",
  stickyFooter = false,
  footerReveal = "always",
  fill = false,
  children,
  className,
}: PageContainerProp) {
  const reveal = stickyFooter && footer != null && footerReveal === "onScroll";
  const { headerRef, revealed } = useFooterReveal(reveal);

  return (
    <div
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
      <header ref={headerRef} className="ui-page-header">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="ui-breadcrumb">
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
          <div className="min-w-0">
            <h1 className="ui-page-title">{title}</h1>
            {subtitle && <p className="ui-page-subtitle">{subtitle}</p>}
          </div>
          {extra && <div className="ui-page-header-extra">{extra}</div>}
        </div>
      </header>

      {children != null && <div className="ui-page-body">{children}</div>}

      {footer && <footer className="ui-page-footer">{footer}</footer>}
    </div>
  );
}

export const PageContainer = Object.assign(PageContainerRoot, {
  Inset: PageContainerInset,
});

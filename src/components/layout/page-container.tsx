/** PageContainer — mandatory shell for every admin page (Ant Design PageHeader equivalent). */
import { useEffect, useRef, useState } from "react";

import { cn } from "../../lib/utils";
import { densityClass, pageContainerVariantClass } from "../../lib/variants";
import { PageHeader } from "./page-header";
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
  meta,
  headerLoading,
  extra,
  footer,
  breadcrumb,
  breadcrumbLabel,
  breadcrumbAriaLabel,
  linkComponent: LinkComponent = "a",
  density,
  variant = "default",
  preset = "default",
  headerLayout = "stack",
  measure = "default",
  stickyFooter = false,
  footerReveal = "always",
  fill = false,
  children,
  className,
}: PageContainerProp) {
  const reveal = stickyFooter && footer != null && footerReveal === "onScroll";
  const { headerRef, revealed } = useFooterReveal(reveal);

  // `data-measure` caps the HEADER and the BODY to one shared token-owned measure so a header
  // action ends flush with the body surface (gh#245/gh#247). `default` matches no rule in the
  // stylesheet, so a page that never sets `measure` is geometrically untouched.
  return (
    <div
      data-preset={preset}
      data-measure={measure}
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
      {/* ONE implementation of the title band, shared with the standalone `PageHeader` export
          (gh#255) — the two can never drift, because this IS that component. */}
      <PageHeader
        ref={headerRef}
        title={title}
        subtitle={subtitle}
        meta={meta}
        extra={extra}
        breadcrumb={breadcrumb}
        breadcrumbLabel={breadcrumbLabel}
        breadcrumbAriaLabel={breadcrumbAriaLabel}
        linkComponent={LinkComponent}
        layout={headerLayout}
        loading={headerLoading}
      />

      {children != null && <div className="ui-page-body">{children}</div>}

      {footer && <footer className="ui-page-footer">{footer}</footer>}
    </div>
  );
}

export const PageContainer = Object.assign(PageContainerRoot, {
  Inset: PageContainerInset,
});

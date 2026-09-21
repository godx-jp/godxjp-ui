/** PageContainer — mandatory shell for every admin page (the PageHeader equivalent). */
import { isValidElement, useRef, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { useIntersects } from "../../lib/hooks";
import { cn } from "../../lib/utils";
import { densityClass, pageContainerVariantClass, padStyle } from "../../lib/variants";
import type { PageContainerProp, PageInsetProp } from "../../props/components/layout.prop";

/**
 * `footerReveal="onScroll"`: reveal the sticky footer once the header scrolls
 * out of the page's scroll viewport. The footer stays mounted (CSS only flips
 * a transform), so toggling never reflows the body — no scroll jitter.
 *
 * The observer itself is `useIntersects` (`src/lib/hooks.ts`) — this function's former body,
 * moved up so `Affix` could stop short of writing a second one. Same root (the nearest scroll
 * parent, which is what omitting `root` means there), same `threshold: 0`, same jsdom guard.
 *
 * `initial: true` is what keeps the behaviour byte-identical. The old local state was `revealed`
 * and started `false`; the shared hook's state is `intersects` and the reveal is its NEGATION, so
 * the same resting answer is "it IS intersecting". Left at the hook's `false` default the footer
 * would paint revealed for the frame before the first observer callback, and would stay revealed
 * forever in jsdom and under SSR, where the old code kept it hidden.
 */
function useFooterReveal(enabled: boolean) {
  const headerRef = useRef<HTMLElement>(null);
  const intersects = useIntersects(headerRef, { enabled, initial: true });
  return { headerRef, revealed: enabled && !intersects };
}

export type {
  PageContainerProp,
  PageContainerProp as PageContainerProps,
  PageContainerExtraProp,
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

/**
 * `extra` as one node, or as the two named sub-slots — the resolution `Tabs` already does for
 * `TabsExtraProp` (`src/components/navigation/tabs.tsx`), because it is the same union: a valid
 * element and an array are NODES even though `typeof` says "object", so a plain object is the
 * slot map.
 *
 * Two deliberate differences from Tabs, each for a stated reason:
 *
 *  · A bare node lands in `start`, not `end`. Tabs' bare `extra` is its TRAILING content, but
 *    PageContainer's is the action cluster every page already passes, and the whole point of the
 *    new slot is to sit AFTER it. Mapping it to `end` would silently move every existing page's
 *    actions behind an empty slot.
 *  · An object with NEITHER key is still a slot map, where Tabs would fall through and try to
 *    render it as a child (React then throws "Objects are not valid as a React child"). It is a
 *    real call: `extra={{ ...(canPage && { end: pager }) }}` evaluates to `{}` on the page that
 *    cannot be paged, and that page must render, not crash.
 */
function resolvePageExtra(extra: PageContainerProp["extra"]): {
  start?: ReactNode;
  end?: ReactNode;
} {
  if (extra === undefined || extra === null || extra === false) return {};
  const isSlotMap = typeof extra === "object" && !isValidElement(extra) && !Array.isArray(extra);
  if (isSlotMap) return extra as { start?: ReactNode; end?: ReactNode };
  return { start: extra as ReactNode };
}

/**
 * `footerPad` re-insets the band inline, and an inline `padding-inline-end` would replace the
 * stylesheet's — dropping the width a page cap adds to the band's end inset, so the footer content
 * would snap back to the band's edge (gh#682). The instance end inset keeps that slack on top.
 */
function footerPadStyle(footerPad: PageContainerProp["footerPad"]) {
  const style = padStyle(footerPad, undefined);
  const end = style?.paddingInlineEnd ?? style?.padding;
  if (end === undefined) return style;
  return { ...style, paddingInlineEnd: `calc(${end} + var(--page-footer-content-slack))` };
}

function PageContainerRoot({
  title,
  subtitle,
  status,
  extra,
  toolbar,
  footer,
  toolbarPad,
  footerPad,
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
  const { start: extraStart, end: extraEnd } = resolvePageExtra(extra);

  // `data-measure` caps the HEADER and the BODY to one shared token-owned measure so a header
  // `default` matches no rule in the
  // stylesheet, so a page that never sets `measure` is geometrically untouched.
  //
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
      {}
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
                  // `--space-inline-xs` gap the previous `.ui-inline-xs` gave, and it brings
                  // `.ui-breadcrumb-item svg { 0.75rem }` with it, so the separator glyph no
                  // longer carries a `size-3` literal. It also drops `.ui-inline-xs`'s
                  // `flex-wrap: wrap` — a crumb must not break between its label and its
                  // chevron; the LIST wraps instead, exactly as <Breadcrumb> already behaves.
                  <li key={i} className="ui-breadcrumb-item">
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
                    {!isLast && <ChevronRight aria-hidden="true" />}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <div className="ui-page-header-row">
          <div className="ui-page-header-heading">
            {}
            {/* It BECOMES the placeholder by wearing the library's own `ui-skeleton-block` skin rather than wrapping a `<Skeleton>` element: `<h1>` takes phrasing content, so nesting Skeleton's `<div>` inside it is invalid HTML. The visible name is sr-only text, because a heading rendered as a bare decorative box is an EMPTY heading (axe `empty-heading`, WCAG 1.3.1). */}
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
          {/* Both sub-slots are direct children of the ONE `.ui-page-header-extra` box, in source
              order, so the DOM order IS the reading order and the box's existing wrap + gap apply
              to the pair with no second container. Neither side is wrapped: `.ui-page-header-extra
              > .ui-flex[data-direction="row"]` is the tested overflow fix that keeps an action
              group from running over the `<h1>`, and it matches DIRECT children only, so a wrapper
              would silently disarm it. Unused ⇒ nothing is rendered at all. */}
          {(extraStart != null || extraEnd != null) && (
            <div className="ui-page-header-extra">
              {extraStart}
              {extraEnd}
            </div>
          )}
        </div>
      </header>

      {/* It is a SIBLING of `.ui-page-body`, never a child, because under `fill` the body is the scroll viewport: as a `flex: none` sibling the band stays put and the transcript scrolls beneath NOTHING, whereas a `position: sticky` strip inside the scroller keeps content flowing under it (the half-sliced row a hand-laid page chrome always produces). Absent → no element and no gap at all. */}
      {toolbar != null && (
        <div className="ui-page-toolbar" style={padStyle(toolbarPad, undefined)}>
          {toolbar}
        </div>
      )}

      {children != null && <div className="ui-page-body">{children}</div>}

      {footer && (
        <footer className="ui-page-footer" style={footerPadStyle(footerPad)}>
          {footer}
        </footer>
      )}
    </div>
  );
}

export const PageContainer = Object.assign(PageContainerRoot, {
  Inset: PageContainerInset,
});

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MasterDetailProp } from "../../props/components/layout.prop";

export type MasterDetailProps = MasterDetailProp;

/**
 * Token-owned master-detail composition: a selectable collection beside the detail surface it
 * drives. Either way `master` comes first in DOM order, so below the threshold the regions stack
 * list-then-detail.
 */
export function MasterDetail({
  master,
  mobilePane,
  detailBack,
  children,
  rail = "detail",
  railWidth = "standard",
  masterViewport = "auto",
  collapseBelow,
  masterLabel,
  detailLabel,
  detailId,
}: MasterDetailProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const thresholdRef = useRef<HTMLSpanElement>(null);
  const [compact, setCompact] = useState(false);
  const navigable = mobilePane !== undefined;
  useLayoutEffect(() => {
    if (!navigable || !rootRef.current || !thresholdRef.current) return;
    const root = rootRef.current;
    const threshold = thresholdRef.current;
    const measure = () =>
      setCompact(root.getBoundingClientRect().width < threshold.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(threshold);
    return () => observer.disconnect();
  }, [navigable, collapseBelow]);
  const masterRef = useRef<HTMLElement>(null);
  const detailRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!mobilePane) return;
    if (mobilePane === "detail" && masterRef.current?.getClientRects().length === 0) {
      const heading = detailRef.current?.querySelector<HTMLElement>("h1, h2, h3");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus();
      } else {
        detailRef.current?.focus();
      }
    } else if (mobilePane === "master" && detailRef.current?.getClientRects().length === 0) {
      masterRef.current
        ?.querySelector<HTMLElement>("a[aria-current], a[href]")
        ?.focus({ preventScroll: true });
    }
  }, [mobilePane, detailLabel, compact]);
  const bounded = masterViewport !== "auto";

  return (
    <div
      ref={rootRef}
      className="ui-master-detail"
      data-mobile-compact={navigable && compact ? "" : undefined}
      data-mobile-pane={mobilePane}
      data-rail={rail}
      data-rail-width={railWidth}
      data-master-viewport={masterViewport}
      // Omitted entirely when the prop is unset, so the themeable token keeps ownership of the
      // threshold; present, it overrides that token for this instance only.
      data-collapse-below={collapseBelow === undefined ? undefined : String(collapseBelow)}
    >
      <section
        ref={masterRef}
        className="ui-master-detail-master"
        aria-label={masterLabel}
        // A bounded region is a scroll container, so it MUST be reachable and scrollable with the
        // keyboard alone even when the collection holds nothing focusable (WCAG 2.1.1; axe's
        // `scrollable-region-focusable`). It is an ordinary tab stop — Tab/Shift+Tab leave it, so
        // nothing is trapped — and it is omitted entirely in the unbounded default, which never
        // scrolls and must not gain a tab stop.
        tabIndex={bounded ? 0 : undefined}
      >
        {master}
      </section>
      <section
        ref={detailRef}
        className="ui-master-detail-detail"
        id={detailId}
        aria-label={detailLabel}
        tabIndex={-1}
      >
        {mobilePane && detailBack ? (
          <div className="ui-master-detail-back">{detailBack}</div>
        ) : null}
        {children}
      </section>
      {navigable ? (
        <span className="ui-master-detail-measure" aria-hidden="true">
          <span ref={thresholdRef} />
        </span>
      ) : null}
    </div>
  );
}

import type { MasterDetailProp } from "../../props/components/layout.prop";

export type MasterDetailProps = MasterDetailProp;

/**
 * Token-owned master-detail composition: a selectable collection beside the detail surface it
 * drives. Either way `master` comes first in DOM order, so below the threshold the regions stack
 * list-then-detail.
 */
export function MasterDetail({
  master,
  children,
  rail = "detail",
  railWidth = "standard",
  masterViewport = "auto",
  collapseBelow,
  masterLabel,
  detailLabel,
  detailId,
}: MasterDetailProps) {
  const bounded = masterViewport !== "auto";

  return (
    <div
      className="ui-master-detail"
      data-rail={rail}
      data-rail-width={railWidth}
      data-master-viewport={masterViewport}
      // Omitted entirely when the prop is unset, so the themeable token keeps ownership of the
      // threshold; present, it overrides that token for this instance only.
      data-collapse-below={collapseBelow === undefined ? undefined : String(collapseBelow)}
    >
      <section
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
        className="ui-master-detail-detail"
        id={detailId}
        aria-label={detailLabel}
        tabIndex={-1}
      >
        {children}
      </section>
    </div>
  );
}

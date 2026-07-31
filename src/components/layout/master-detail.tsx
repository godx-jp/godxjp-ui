import type { MasterDetailProp } from "../../props/components/layout.prop";

export type MasterDetailProps = MasterDetailProp;

/**
 * Token-owned master-detail composition: a selectable collection beside the detail surface it
 * drives. Geometry is the component's only responsibility — the tracks (`--master-detail-rail-*`),
 * the gap (`--master-detail-gap`) and the stacking threshold (`--master-detail-collapse-below`)
 * are all tokens, so a consumer never authors grid tracks or per-screen spacing (gh#223).
 *
 * `rail` chooses which region keeps the fixed track: `detail` (default) is the canonical fluid
 * list + fixed detail rail; `master` is the leading navigator rail. Either way `master` comes
 * first in DOM order, so below the threshold the regions stack list-then-detail.
 *
 * SELECTION AND KEYBOARD STAY WITH THE CALLER — deliberately. The controls inside `master` may be
 * a listbox, a tablist, a link list or toggle buttons, and only the caller knows which APG pattern
 * applies; a layout that imposed one would fight it. What the layout DOES own is the wiring those
 * patterns need: two named landmark regions, a stable `detailId` for `aria-controls`, and a
 * `tabIndex={-1}` detail region so the app can move focus to the new detail after a selection.
 */
export function MasterDetail({
  master,
  children,
  rail = "detail",
  railWidth = "standard",
  collapseBelow,
  masterLabel,
  detailLabel,
  detailId,
}: MasterDetailProps) {
  return (
    <div
      className="ui-master-detail"
      data-rail={rail}
      data-rail-width={railWidth}
      // Omitted entirely when the prop is unset, so the themeable token keeps ownership of the
      // threshold; present, it overrides that token for this instance only.
      data-collapse-below={collapseBelow === undefined ? undefined : String(collapseBelow)}
    >
      <section className="ui-master-detail-master" aria-label={masterLabel}>
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

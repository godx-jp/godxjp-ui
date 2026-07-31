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
 * `masterViewport` bounds the collection (gh#231): `auto` (default) lets it grow with its content
 * exactly as before, while `compact`/`standard` cap its block size with a token and scroll it
 * INSIDE the region — the only thing that stops a long real collection from pushing the detail
 * thousands of pixels below the fold once the layout stacks.
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

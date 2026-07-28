import type { MasterDetailProp } from "../../props/components/layout.prop";

export type MasterDetailProps = MasterDetailProp;

/**
 * Token-owned master-detail composition for a selectable collection and its detail surface.
 *
 * Selection and keyboard behavior stay with the interactive controls rendered in `master`;
 * this component owns only the responsive geometry and the two named regions.
 */
export function MasterDetail({
  master,
  children,
  railWidth = "standard",
  masterLabel,
  detailLabel,
}: MasterDetailProps) {
  return (
    <div className="ui-master-detail-scope">
      <div className="ui-master-detail" data-rail-width={railWidth}>
        <section className="ui-master-detail-master" aria-label={masterLabel}>
          {master}
        </section>
        <section className="ui-master-detail-detail" aria-label={detailLabel}>
          {children}
        </section>
      </div>
    </div>
  );
}

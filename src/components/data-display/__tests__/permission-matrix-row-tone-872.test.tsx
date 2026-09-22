import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { PermissionMatrix } from "../permission-matrix";

/**
 * gh#872 — the diff row's warning ground belongs to the PRIMITIVE, not to this component.
 *
 * It used to be written here as `bg-warning/[0.07] hover:bg-warning/10`, a second and private
 * definition of what a warning row looks like: a hand-picked alpha the `--table-row-tone-*`
 * tokens could not reach, and — after gh#866 gave every status tone a `--surface-*` role — the one
 * warning surface in the library a brand could not re-ground. The same row renders a
 * `Badge tone="warning"` beside it, which DOES follow `--surface-warning`, so one row carried two
 * warning grounds and only one of them was themeable.
 *
 * The fix is `data-tone="warning"` — the identical hand-off `DataTable rowTone` emits — so
 * `styles/table-layout.css` owns the wash (`--table-row-tone-wash-alpha`, 0.06), its leading rail
 * and its hover step, and `--surface-warning` overrides the wash when a tenant sets one.
 *
 * Measured in Chromium on the `/isolate/data-display-permission-matrix` frame:
 *   before  background-color: oklab(… / 0.07), background-image: none, rail 0px
 *   after   background-image: linear-gradient(rgba(143,86,0,0.06) …), rail 6px
 *   before, under `[data-tenant] { --surface-warning: #FFF4D8 }`: row stays oklab(… / 0.07)
 *                                                                 badge is rgb(255,244,216)
 *   after,  same tenant:  row AND badge are both rgb(255,244,216)
 */
const here = dirname(fileURLToPath(import.meta.url));
const componentSource = readFileSync(join(here, "../permission-matrix.tsx"), "utf8");
const showcaseSource = readFileSync(
  join(here, "../../../../docs/showcase/permission-matrix.tsx"),
  "utf8",
);
const tableCss = readFileSync(join(here, "../../../styles/table-layout.css"), "utf8");

const ROLES = [
  { id: "admin", name: "管理者" },
  { id: "editor", name: "編集者" },
  { id: "viewer", name: "閲覧者" },
];
const PERMISSIONS = [
  { id: "user.manage", name: "ユーザー管理" },
  { id: "invoice.read", name: "請求書の閲覧" },
];
/** `editor` and `viewer` differ on `user.manage` and agree on `invoice.read`. */
const GRANTS = [
  { roleId: "admin", permissionId: "user.manage" },
  { roleId: "editor", permissionId: "user.manage" },
  { roleId: "admin", permissionId: "invoice.read" },
  { roleId: "editor", permissionId: "invoice.read" },
  { roleId: "viewer", permissionId: "invoice.read" },
];

function bodyRows(container: HTMLElement): HTMLTableRowElement[] {
  return [...container.querySelectorAll<HTMLTableRowElement>("tbody tr")];
}

describe("PermissionMatrix diff row wears the Table primitive's tone (gh#872)", () => {
  it("marks the differing row with data-tone=warning and leaves the agreeing row untoned", () => {
    const { container } = renderWithUi(
      <PermissionMatrix
        roles={ROLES}
        permissions={PERMISSIONS}
        grants={GRANTS}
        compare={["editor", "viewer"]}
      />,
    );
    const rows = bodyRows(container);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute("data-tone", "warning");
    expect(rows[1]).not.toHaveAttribute("data-tone");
  });

  it("emits no data-tone at all when compare is off", () => {
    const { container } = renderWithUi(
      <PermissionMatrix roles={ROLES} permissions={PERMISSIONS} grants={GRANTS} />,
    );
    for (const row of bodyRows(container)) expect(row).not.toHaveAttribute("data-tone");
  });

  it("paints no warning utility of its own on any row", () => {
    const { container } = renderWithUi(
      <PermissionMatrix
        roles={ROLES}
        permissions={PERMISSIONS}
        grants={GRANTS}
        compare={["editor", "viewer"]}
      />,
    );
    for (const row of bodyRows(container)) {
      expect(row.className).not.toMatch(/bg-warning/);
    }
  });

  it("keeps the 差分 badge, so the meaning is in a cell and not only in the colour (WCAG 1.4.1)", () => {
    const { container } = renderWithUi(
      <PermissionMatrix
        roles={ROLES}
        permissions={PERMISSIONS}
        grants={GRANTS}
        compare={["editor", "viewer"]}
      />,
    );
    const toned = bodyRows(container).filter((r) => r.getAttribute("data-tone") === "warning");
    expect(toned).toHaveLength(1);
    expect(toned[0].querySelector('[data-slot="badge"]')).not.toBeNull();
  });

  it("leaves no hand-rolled warning wash in the component or in the hand-composed showcase", () => {
    // A CLASS STRING, not a prose mention: both files explain in a comment what they no longer
    // do, and a bare /bg-warning/ would fail on the explanation instead of on the defect.
    const utilityLiteral = /"[^"\n]*bg-warning[^"\n]*"/;
    expect(componentSource).not.toMatch(utilityLiteral);
    expect(showcaseSource).not.toMatch(utilityLiteral);
    expect(showcaseSource).toMatch(/data-tone=\{isDiffRow \? "warning" : undefined\}/);
  });

  it("is re-groundable because the primitive's wash reads --surface-warning first", () => {
    // The hand-off gh#866 landed: if this stops being true, `data-tone` buys the row nothing a
    // tenant can reach and the local utility would have been no worse.
    expect(tableCss).toMatch(
      /\.ui-table-row\[data-tone="warning"\]\s*\{[^}]*--table-row-tone-surface:\s*var\(--surface-warning\)/,
    );
  });
});

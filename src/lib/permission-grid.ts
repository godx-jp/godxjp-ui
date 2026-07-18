/**
 * permission-grid — pure, render-neutral helpers for RBAC role × permission
 * matrices.
 *
 * A permission matrix maps a set of PERMISSION rows against a set of ROLE
 * columns; each (role, permission) pair is either granted or not. A "permission
 * matrix" is NOT a framework component — it is a COMPOSITION of `Table`/
 * `DataTable` + `Badge` + tokens (see `docs/COMPOSITION-VS-COMPONENT.md`, Gate 0:
 * fails C2/C3/C7). What it DOES need is a single, tested source of truth for the
 * non-trivial data logic every consumer would otherwise re-derive: grant lookup,
 * the per-permission diff between two roles (compare mode), and the row set that
 * survives a "differences only" (差分のみ) filter.
 *
 * These functions are framework-neutral (no React) and locale-neutral (no
 * strings) so the showcase — and any RBAC admin — composes UI on top of them.
 *
 * Grants are modelled as a flat `Set` of composite keys for O(1) membership,
 * which mirrors how an authz decision cache (`role:permission` tuples) is
 * typically held in memory.
 */

/** Any object addressable by a stable string `id` (a role or a permission). */
export interface GridEntity {
  readonly id: string;
}

/** A pair of role ids being compared side by side in compare mode. */
export type ComparePair = readonly [roleA: string, roleB: string];

/** Options controlling which permission rows are visible. */
export interface VisibleRowsOptions {
  /** The two roles under comparison; enables the diff-only filter. */
  readonly compare?: ComparePair | null;
  /**
   * When true AND `compare` is set, keep only the permissions on which the two
   * compared roles disagree. Without a `compare` pair this is a no-op (there is
   * nothing to diff against), so every row is returned.
   */
  readonly diffOnly?: boolean;
}

/** Separator that cannot appear inside a role/permission id token. */
const KEY_SEP = "\u0000";

/**
 * Build the composite grant key for a (role, permission) pair. Use this both to
 * seed the grant `Set` and to query it, so the encoding stays in one place.
 */
export function grantKey(roleId: string, permissionId: string): string {
  return `${roleId}${KEY_SEP}${permissionId}`;
}

/** Is `permissionId` granted to `roleId`? */
export function hasGrant(
  grants: ReadonlySet<string>,
  roleId: string,
  permissionId: string,
): boolean {
  return grants.has(grantKey(roleId, permissionId));
}

/**
 * Do the two compared roles DISAGREE on `permissionId` (one grants it, the other
 * does not)? Comparing a role with itself is always `false`.
 */
export function rolesDifferOnPermission(
  grants: ReadonlySet<string>,
  compare: ComparePair,
  permissionId: string,
): boolean {
  const [a, b] = compare;
  return hasGrant(grants, a, permissionId) !== hasGrant(grants, b, permissionId);
}

/**
 * The permission rows to render: every row normally, or — when `diffOnly` is on
 * and a `compare` pair is set — only the rows on which the two roles differ.
 * Order is preserved; the input array is never mutated.
 */
export function visibleRows<P extends GridEntity>(
  permissions: readonly P[],
  grants: ReadonlySet<string>,
  { compare, diffOnly = false }: VisibleRowsOptions = {},
): P[] {
  if (!diffOnly || !compare) return permissions.slice();
  return permissions.filter((p) => rolesDifferOnPermission(grants, compare, p.id));
}

/** How many permissions the two compared roles disagree on (badge in the header). */
export function countDifferences<P extends GridEntity>(
  permissions: readonly P[],
  grants: ReadonlySet<string>,
  compare: ComparePair,
): number {
  return permissions.reduce(
    (n, p) => n + (rolesDifferOnPermission(grants, compare, p.id) ? 1 : 0),
    0,
  );
}

/** How many permissions a single role is granted (column subtotal). */
export function countGrants<P extends GridEntity>(
  permissions: readonly P[],
  grants: ReadonlySet<string>,
  roleId: string,
): number {
  return permissions.reduce((n, p) => n + (hasGrant(grants, roleId, p.id) ? 1 : 0), 0);
}

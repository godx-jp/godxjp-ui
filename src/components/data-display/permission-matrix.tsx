import * as React from "react";
import { AlertCircle, Check, Lock, Minus, RefreshCw, ShieldAlert } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import {
  grantKey,
  hasGrant,
  rolesDifferOnPermission,
  visibleRows,
  type ComparePair,
} from "../../lib/permission-grid";
import { cn } from "../../lib/utils";
import { Checkbox } from "../data-entry/checkbox";
import { SkeletonTable } from "../feedback/skeleton";
import { Button } from "../general/button";
import { Text } from "../general/typography";
import { Badge } from "./badge";
import { EmptyState } from "./empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import type {
  PermissionMatrixGrantsProp,
  PermissionMatrixProp,
} from "../../props/components/data-display.prop";

export type {
  PermissionMatrixGrantsProp,
  PermissionMatrixPermissionProp,
  PermissionMatrixProp,
  PermissionMatrixProp as PermissionMatrixProps,
  PermissionMatrixRoleProp,
} from "../../props/components/data-display.prop";

/** Normalize the grant relation to the canonical `grantKey` Set form. */
function toGrantSet(grants: PermissionMatrixGrantsProp): ReadonlySet<string> {
  if (grants instanceof Set) return grants;
  return new Set(
    (grants as readonly { roleId: string; permissionId: string }[]).map((pair) =>
      grantKey(pair.roleId, pair.permissionId),
    ),
  );
}

/** Sticky first column (権限): the scrolling grid passes under it, so opaque bg + token edge. */
const PIN_START = "sticky start-0 z-20 bg-inherit border-e border-border";

/**
 * PermissionMatrix — the canonical role × permission grid (gh#257 / DXS platform#311).
 *
 * Formalizes the `docs/showcase/permission-matrix` composition as a PACKAGE-OWNED export, for the
 * same reason `ErrorSurface` became one (gh#251): a consumer cannot import a docs page, and every
 * RBAC admin was about to re-derive the same sticky-column grid, ✓/— cell semantics and lifecycle
 * states. The matrix stays THIN: all data logic lives in the already-tested
 * `@godxjp/ui/lib/permission-grid` helpers, the table is the real Table family, and the states are
 * the DataTable #216 vocabulary (`loading` → `denied` → `error` → `empty`, same precedence).
 *
 * - **Read-only by default.** Without `onGrantChange` (or with `readOnly`) cells are shape-encoded
 *   ✓/— (icon + `sr-only` text, never colour alone). With `onGrantChange` the cells become real
 *   `Checkbox` controls — except for roles marked `locked`, which keep the read-only cell and a
 *   lock badge.
 * - **Compare mode** (`compare` + `diffOnly`) reuses `lib/permission-grid` verbatim: compared
 *   columns are tinted, differing rows carry a localized 差分 badge.
 * - **Domain-neutral**: roles, permissions and grants all arrive via props; nothing about the
 *   consuming platform is encoded.
 * - **Responsive**: the grid scrolls horizontally inside its own container below its natural
 *   measure (390px shows the sticky permission column + scrollable role columns); 1024/1440 render
 *   the full grid.
 */
export const PermissionMatrix = React.forwardRef<HTMLDivElement, PermissionMatrixProp>(
  function PermissionMatrix(
    {
      roles,
      permissions,
      grants,
      onGrantChange,
      readOnly = false,
      compare = null,
      diffOnly = false,
      label,
      loading = false,
      empty,
      error,
      denied,
      onRetry,
      className,
      id,
    },
    ref,
  ) {
    const { t } = useTranslation();
    const grantSet = React.useMemo(() => toGrantSet(grants), [grants]);

    const compareA = compare?.[0];
    const compareB = compare?.[1];
    const comparePair = React.useMemo<ComparePair | null>(
      () =>
        compareA === undefined || compareB === undefined || compareA === compareB
          ? null
          : [compareA, compareB],
      [compareA, compareB],
    );
    const compared = React.useMemo(() => new Set(comparePair ?? []), [comparePair]);

    const rows = React.useMemo(
      () =>
        visibleRows(permissions, grantSet, {
          compare: comparePair,
          diffOnly: diffOnly && comparePair !== null,
        }),
      [permissions, grantSet, comparePair, diffOnly],
    );

    const editable = typeof onGrantChange === "function" && !readOnly;
    const isDenied = denied !== undefined && denied !== null && denied !== false;
    const isError = error !== undefined && error !== null && error !== false;

    const stateSurface = (state: React.ReactNode) => (
      <div
        ref={ref}
        id={id}
        data-slot="permission-matrix"
        className={cn("ui-permission-matrix", className)}
      >
        {state}
      </div>
    );

    // Lifecycle precedence mirrors DataTable #216: loading → denied → error → empty → grid.
    if (loading) {
      return stateSurface(
        <div aria-busy="true" aria-label={t("dataDisplay.permissionMatrix.loading")} role="status">
          <SkeletonTable rows={6} columns={Math.max(2, roles.length + 1)} />
        </div>,
      );
    }
    if (isDenied) {
      return stateSurface(
        <div aria-live="polite">
          {denied === true ? (
            <EmptyState
              icon={ShieldAlert}
              tone="warning"
              variant="section"
              title={t("dataDisplay.permissionMatrix.denied")}
              description={t("dataDisplay.permissionMatrix.deniedDescription")}
              titleAs="p"
            />
          ) : (
            denied
          )}
        </div>,
      );
    }
    if (isError) {
      return stateSurface(
        <div role="alert">
          {error === true ? (
            <EmptyState
              icon={AlertCircle}
              tone="destructive"
              variant="section"
              title={t("dataDisplay.permissionMatrix.error")}
              description={t("dataDisplay.permissionMatrix.errorDescription")}
              titleAs="p"
              action={
                onRetry ? (
                  <Button variant="outline" size="sm" onClick={onRetry}>
                    <RefreshCw aria-hidden="true" />
                    {t("common.retry")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            error
          )}
        </div>,
      );
    }
    if (permissions.length === 0) {
      return stateSurface(
        <div aria-live="polite">
          {empty ?? (
            <EmptyState
              variant="section"
              title={t("dataDisplay.permissionMatrix.empty")}
              titleAs="p"
            />
          )}
        </div>,
      );
    }

    const accessibleName =
      typeof label === "string" ? label : t("dataDisplay.permissionMatrix.caption");

    return (
      <div
        ref={ref}
        id={id}
        data-slot="permission-matrix"
        data-editable={editable || undefined}
        className={cn("ui-permission-matrix overflow-x-auto", className)}
      >
        <Table className="min-w-[48rem]" aria-label={accessibleName}>
          <TableHeader className="bg-secondary [&_tr]:bg-secondary">
            <TableRow className="bg-secondary hover:bg-secondary">
              <TableHead className={cn(PIN_START, "w-64 min-w-64")}>
                {t("dataDisplay.permissionMatrix.permissionColumn")}
              </TableHead>
              {roles.map((role) => {
                const isCompared = compared.has(role.id);
                return (
                  <TableHead
                    key={role.id}
                    className={cn("text-center", isCompared && "bg-primary/[0.06]")}
                  >
                    <span className="inline-flex flex-col items-center leading-tight">
                      <span className="inline-flex items-center gap-1">
                        <Text weight="medium">{role.name}</Text>
                        {role.locked && (
                          <Badge tone="default" variant="outline">
                            <Lock aria-hidden="true" />
                            {t("dataDisplay.permissionMatrix.locked")}
                          </Badge>
                        )}
                      </span>
                      {role.description !== undefined && (
                        <Text size="2xs" tone="muted">
                          {role.description}
                        </Text>
                      )}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((permission) => {
              const isDiffRow =
                comparePair !== null &&
                rolesDifferOnPermission(grantSet, comparePair, permission.id);
              return (
                <TableRow
                  key={permission.id}
                  className={cn(isDiffRow && "bg-warning/[0.07] hover:bg-warning/10")}
                >
                  <TableCell className={cn(PIN_START, "w-64 min-w-64 align-middle")}>
                    <div className="flex flex-col leading-tight">
                      <span className="inline-flex items-center gap-1.5">
                        <Text weight="medium">{permission.name}</Text>
                        {isDiffRow && (
                          <Badge tone="warning" variant="outline">
                            {t("dataDisplay.permissionMatrix.difference")}
                          </Badge>
                        )}
                      </span>
                      {(permission.group !== undefined || permission.description !== undefined) && (
                        <Text size="2xs" tone="muted">
                          {[permission.group, permission.description]
                            .filter((part) => part !== undefined)
                            .join(" · ")}
                        </Text>
                      )}
                    </div>
                  </TableCell>
                  {roles.map((role) => {
                    const granted = hasGrant(grantSet, role.id, permission.id);
                    const isCompared = compared.has(role.id);
                    const cellEditable = editable && !role.locked;
                    return (
                      <TableCell
                        key={role.id}
                        className={cn(
                          "text-center align-middle",
                          isCompared && "bg-primary/[0.04]",
                        )}
                      >
                        {cellEditable ? (
                          <Checkbox
                            checked={granted}
                            onCheckedChange={(next) =>
                              onGrantChange?.(role.id, permission.id, next === true)
                            }
                            aria-label={t("dataDisplay.permissionMatrix.toggle", {
                              role: role.name,
                              permission: permission.name,
                            })}
                          />
                        ) : granted ? (
                          <Badge tone="success" variant="outline" className="justify-center">
                            <Check aria-hidden="true" />
                            <span className="sr-only">
                              {t("dataDisplay.permissionMatrix.granted")}
                            </span>
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground inline-flex items-center justify-center">
                            <Minus aria-hidden="true" className="size-4" />
                            <span className="sr-only">
                              {t("dataDisplay.permissionMatrix.notGranted")}
                            </span>
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  },
);
PermissionMatrix.displayName = "PermissionMatrix";

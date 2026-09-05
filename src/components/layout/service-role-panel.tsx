import * as React from "react";
import { AlertCircle, Lock, RefreshCw, ShieldAlert, Trash2 } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { Badge } from "../data-display/badge";
import { EmptyState } from "../data-display/empty-state";
import { AlertDialog } from "../feedback/dialog";
import { SkeletonRows } from "../feedback/skeleton";
import { Button } from "../general/button";
import { Text } from "../general/typography";
import { MasterDetail } from "./master-detail";
import type { ServiceRoleItemProp, ServiceRolePanelProp } from "../../props/components/layout.prop";

export type {
  ServiceRoleItemProp,
  ServiceRolePanelProp,
  ServiceRolePanelProp as ServiceRolePanelProps,
} from "../../props/components/layout.prop";

/**
 * What the panel adds is exactly the contract every service-role screen kept re-deriving: -
 * **Selection** as the controlled triad (`value`/`defaultValue`/`onValueChange`, defaulting to the
 * first role). Each role row is a real `Button` carrying `aria-current`, and selecting moves
 * focus-target wiring through `MasterDetail`'s `detailId`/`tabIndex={-1}` detail region. -
 * **Destructive confirmation built in**: `onDeleteRole`'s presence arms a per-role delete
 * affordance behind the package `AlertDialog` (variant `destructive`); the handler fires only
 * after the user confirms.
 */
export const ServiceRolePanel = React.forwardRef<HTMLDivElement, ServiceRolePanelProp>(
  function ServiceRolePanel(
    {
      roles,
      value: controlledValue,
      defaultValue,
      onValueChange,
      children,
      onDeleteRole,
      readOnly = false,
      loading = false,
      empty,
      error,
      denied,
      onRetry,
      masterLabel,
      detailLabel,
      railWidth,
      masterViewport,
      collapseBelow,
      id,
      className,
    },
    ref,
  ) {
    const { t } = useTranslation();
    const reactId = React.useId();
    const rootId = id ?? `service-role-panel-${reactId}`;
    const detailId = `${rootId}-detail`;

    const [uncontrolled, setUncontrolled] = React.useState<string | undefined>(
      defaultValue ?? roles[0]?.id,
    );
    const value = controlledValue ?? uncontrolled;
    const selectedRole = roles.find((role) => role.id === value);

    const select = (roleId: string) => {
      if (controlledValue === undefined) setUncontrolled(roleId);
      onValueChange?.(roleId);
    };

    const [pendingDelete, setPendingDelete] = React.useState<ServiceRoleItemProp | null>(null);

    const isDenied = denied !== undefined && denied !== null && denied !== false;
    const isError = error !== undefined && error !== null && error !== false;
    const deletable = typeof onDeleteRole === "function" && !readOnly;

    const surface = (state: React.ReactNode) => (
      <div
        ref={ref}
        id={rootId}
        data-slot="service-role-panel"
        className={cn("ui-service-role-panel", className)}
      >
        {state}
      </div>
    );

    if (loading) {
      return surface(
        <div aria-busy="true" aria-label={t("layout.serviceRolePanel.loading")} role="status">
          <SkeletonRows rows={5} columns={3} />
        </div>,
      );
    }
    if (isDenied) {
      return surface(
        <div aria-live="polite">
          {denied === true ? (
            <EmptyState
              icon={ShieldAlert}
              tone="warning"
              variant="section"
              title={t("layout.serviceRolePanel.denied")}
              description={t("layout.serviceRolePanel.deniedDescription")}
              titleAs="p"
            />
          ) : (
            denied
          )}
        </div>,
      );
    }
    if (isError) {
      return surface(
        <div role="alert">
          {error === true ? (
            <EmptyState
              icon={AlertCircle}
              tone="destructive"
              variant="section"
              title={t("layout.serviceRolePanel.error")}
              description={t("layout.serviceRolePanel.errorDescription")}
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
    if (roles.length === 0) {
      return surface(
        <div aria-live="polite">
          {empty ?? (
            <EmptyState
              variant="section"
              title={t("layout.serviceRolePanel.empty")}
              description={t("layout.serviceRolePanel.emptyDescription")}
              titleAs="p"
            />
          )}
        </div>,
      );
    }

    const detail =
      typeof children === "function"
        ? children(selectedRole)
        : (children ?? (
            <EmptyState
              variant="compact"
              title={t("layout.serviceRolePanel.noDetail")}
              titleAs="p"
            />
          ));

    return surface(
      <>
        <MasterDetail
          rail="master"
          railWidth={railWidth}
          masterViewport={masterViewport}
          collapseBelow={collapseBelow}
          masterLabel={masterLabel ?? t("layout.serviceRolePanel.rolesLabel")}
          detailLabel={detailLabel ?? t("layout.serviceRolePanel.detailLabel")}
          detailId={detailId}
          master={
            <ul className="ui-service-role-panel-list" data-slot="service-role-panel-list">
              {roles.map((role) => {
                const selected = role.id === value;
                return (
                  // NOT `.ui-inline-xs`: that helper adds `flex-wrap: wrap`, and this row holds a
                  // flex-1 select button next to an icon-only delete button that must never wrap
                  // onto its own line.
                  <li key={role.id} className="ui-service-role-panel-row">
                    {/* Select and delete stay SIBLINGS — never nested interactive controls. */}
                    <Button
                      variant={selected ? "secondary" : "ghost"}
                      className="ui-service-role-panel-item h-auto flex-1 justify-start text-start"
                      aria-current={selected ? "true" : undefined}
                      aria-controls={detailId}
                      onClick={() => select(role.id)}
                    >
                      <span className="ui-service-role-panel-item-body">
                        <span className="ui-service-role-panel-item-title">
                          <Text weight="medium" className="truncate">
                            {role.name}
                          </Text>
                          {role.locked && (
                            <Badge tone="default" variant="outline">
                              <Lock aria-hidden="true" />
                              {t("layout.serviceRolePanel.locked")}
                            </Badge>
                          )}
                        </span>
                        {(role.description !== undefined || role.memberCount !== undefined) && (
                          <Text size="2xs" tone="muted" className="max-w-full truncate">
                            {[
                              role.description,
                              role.memberCount !== undefined
                                ? // `{count}` is Intl.NumberFormat-grouped by `interpolate`,
                                  // pluralized by CLDR category — no hand-built formatting.
                                  t("layout.serviceRolePanel.memberCount", {
                                    count: role.memberCount,
                                  })
                                : undefined,
                            ]
                              .filter((part) => part !== undefined)
                              .join(" · ")}
                          </Text>
                        )}
                      </span>
                    </Button>
                    {deletable && !role.locked && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("layout.serviceRolePanel.deleteRole", { role: role.name })}
                        onClick={() => setPendingDelete(role)}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          }
        >
          {detail}
        </MasterDetail>

        {deletable && (
          <AlertDialog
            open={pendingDelete !== null}
            onOpenChange={(open) => {
              if (!open) setPendingDelete(null);
            }}
            title={t("layout.serviceRolePanel.deleteTitle")}
            description={
              pendingDelete
                ? t("layout.serviceRolePanel.deleteDescription", { role: pendingDelete.name })
                : undefined
            }
            confirmLabel={t("layout.serviceRolePanel.deleteConfirm")}
            variant="destructive"
            onConfirm={() => {
              if (pendingDelete) onDeleteRole?.(pendingDelete.id);
              setPendingDelete(null);
            }}
          />
        )}
      </>,
    );
  },
);
ServiceRolePanel.displayName = "ServiceRolePanel";

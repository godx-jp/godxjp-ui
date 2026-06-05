import { useId } from "react";
import { X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { Button } from "../general/button";
import { cn } from "../../lib/utils";
import type { ToolbarGroupProp, ToolbarProp } from "../../props/components/navigation.prop";

export type {
  ToolbarGroupProp,
  ToolbarGroupProp as ToolbarGroupProps,
  ToolbarProp,
  ToolbarProp as ToolbarProps,
} from "../../props/components/navigation.prop";

export function Toolbar({ onClear, hasActiveFilters = true, className, children }: ToolbarProp) {
  const { t } = useTranslation();

  return (
    <div
      role="toolbar"
      aria-label={t("navigation.toolbar.ariaLabel")}
      className={cn("ui-toolbar", className)}
    >
      {children}
      {onClear && hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="ui-toolbar-clear">
          <X aria-hidden="true" />
          {t("common.clearFilters")}
        </Button>
      )}
    </div>
  );
}

export function ToolbarGroup({ label, className, children }: ToolbarGroupProp) {
  const labelId = useId();

  return (
    <div
      role="group"
      aria-labelledby={label ? labelId : undefined}
      className={cn("ui-stack-xs ui-toolbar-group", className)}
    >
      {label ? (
        <div id={labelId} className="ui-toolbar-label">
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}

import { X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { Button } from "../general/button";
import { cn } from "../../lib/utils";
import type { FilterBarProp, FilterGroupProp } from "../../props/components/navigation.prop";

export type { FilterBarProp, FilterGroupProp } from "../../props/components/navigation.prop";

export function FilterBar({
  onClear,
  hasActiveFilters = true,
  className,
  children,
}: FilterBarProp) {
  const { t } = useTranslation();

  return (
    <div className={cn("ui-filter-bar", className)}>
      {children}
      {onClear && hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="ui-filter-clear">
          <X aria-hidden="true" />
          {t("common.clearFilters")}
        </Button>
      )}
    </div>
  );
}

export function FilterGroup({ label, className, children }: FilterGroupProp) {
  return (
    <div className={cn("ui-stack-xs ui-filter-group", className)}>
      <div className="ui-filter-label">{label}</div>
      {children}
    </div>
  );
}

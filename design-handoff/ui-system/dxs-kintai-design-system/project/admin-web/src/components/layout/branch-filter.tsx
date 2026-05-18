"use client";

/**
 * BranchFilter — topbar dropdown that narrows the admin surface to one
 * branch (or "All shops"). Plan-004 T4.1.
 *
 * Props:
 *   value       current branch id, null = "All shops"
 *   onChange    fires when the user picks a different option
 *   locked      true for shop_manager — dropdown disabled + lock icon +
 *               tooltip explaining the pinned scope
 *   options     { id, name, brand_name? }[] — user's accessible branches
 *
 * Uses `@godxjp/ui` `Select` + `Tooltip` primitives exclusively; when
 * `locked`, we render a `<Select disabled>` (still visually consistent) and
 * an adjacent 🔒 icon wrapped in a `Tooltip` that explains the lock.
 */

import {
  Select,
  SelectMenu,
  SelectOptionRow,
  SelectControl,
  SelectDisplay,
  Tooltip,
} from "@godxjp/ui";
import { Lock } from "lucide-react";

/** Sentinel value passed to Radix Select — it rejects the literal empty string. */
const ALL_SHOPS = "__all__";

export interface BranchFilterOption {
  id: string;
  name: string;
  brand_name?: string | null;
}

export interface BranchFilterProps {
  value: string | null;
  onChange: (next: string | null) => void;
  locked?: boolean;
  /** Name of the pinned branch — shown inside the tooltip for shop_manager. */
  lockedLabel?: string;
  options: BranchFilterOption[];
  /** Override the "All shops" label (i18n). */
  allShopsLabel?: string;
  /** Override the lock tooltip body (i18n). */
  lockedTooltip?: string;
}

export function BranchFilter({
  value,
  onChange,
  locked = false,
  lockedLabel,
  options,
  allShopsLabel = "All shops",
  lockedTooltip,
}: BranchFilterProps) {
  // Radix Select drives value via string; we map null ↔ ALL_SHOPS so
  // callers keep working with `string | null` (null = unscoped).
  const selectValue = value ?? ALL_SHOPS;
  const tooltipText =
    lockedTooltip ?? (lockedLabel ? `Role scoped to ${lockedLabel}` : "Role scoped to this branch");

  const handleChange = (next: string) => {
    onChange(next === ALL_SHOPS ? null : next);
  };

  const trigger = (
    <SelectControl
      className="h-8 w-44 text-xs"
      disabled={locked}
      aria-label="Branch filter"
      data-slot="branch-filter-trigger"
    >
      <div className="flex items-center gap-1.5 truncate">
        {locked && <Lock className="text-muted-foreground size-3 shrink-0" />}
        <SelectDisplay placeholder={allShopsLabel} />
      </div>
    </SelectControl>
  );

  const select = (
    <Select value={selectValue} onValueChange={handleChange} disabled={locked}>
      {trigger}
      <SelectMenu>
        <SelectOptionRow value={ALL_SHOPS}>{allShopsLabel}</SelectOptionRow>
        {options.map((opt) => (
          <SelectOptionRow key={opt.id} value={opt.id}>
            <span className="truncate">{opt.name}</span>
            {opt.brand_name && (
              <span className="text-muted-foreground ml-2 text-[10px]">{opt.brand_name}</span>
            )}
          </SelectOptionRow>
        ))}
      </SelectMenu>
    </Select>
  );

  if (!locked) return <div data-slot="branch-filter">{select}</div>;

  // Locked → wrap the disabled trigger in a tooltip that explains the
  // pinned scope. We keep the Select component (not a naked Button) so the
  // visual language stays identical for admin vs shop_manager.
  return (
    <div data-slot="branch-filter" data-locked="true">
      <Tooltip content={tooltipText} placement="bottom">
        {/* span wrapper — disabled SelectControl swallows pointer events,
            which would also block tooltip detection without a live host. */}
        <span className="inline-flex">{select}</span>
      </Tooltip>
    </div>
  );
}

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, RotateCcw } from "lucide-react";

import { useMediaQuery } from "../../lib/hooks";
import { cn } from "../../lib/utils";
import type { OrgSwitcherOrganization, OrgSwitcherProp } from "../../props/components/layout.prop";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../data-entry/command";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTrigger } from "../feedback/sheet";
import { Button } from "../general/button";

export type {
  OrgSwitcherLabels,
  OrgSwitcherOrganization,
  OrgSwitcherProp,
  OrgSwitcherProp as OrgSwitcherProps,
} from "../../props/components/layout.prop";

function OrganizationMark({ organization }: { organization?: OrgSwitcherOrganization }) {
  return (
    <span className="ui-org-switcher-avatar" aria-hidden="true">
      {organization?.avatar ?? organization?.name.trim().charAt(0).toUpperCase() ?? "?"}
    </span>
  );
}

function OrgSwitcherTrigger({
  organization,
  collapsed,
  disabled,
  label,
}: {
  organization?: OrgSwitcherOrganization;
  collapsed: boolean;
  disabled: boolean;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="ui-org-switcher-trigger"
      data-collapsed={collapsed ? "true" : undefined}
      disabled={disabled}
      aria-label={label}
    >
      <OrganizationMark organization={organization} />
      {!collapsed ? (
        <>
          <span className="ui-org-switcher-current">
            <span className="ui-org-switcher-name">{organization?.name ?? label}</span>
            {organization?.meta != null ? (
              <span className="ui-org-switcher-meta">{organization.meta}</span>
            ) : null}
          </span>
          <ChevronsUpDown className="ui-org-switcher-chevron" aria-hidden="true" />
        </>
      ) : null}
    </Button>
  );
}

function OrgSwitcherPanel({
  organizations,
  value,
  onValueChange,
  loading,
  error,
  onRetry,
  labels,
  close,
}: Pick<
  OrgSwitcherProp,
  "organizations" | "value" | "onValueChange" | "loading" | "error" | "onRetry" | "labels"
> & {
  close: () => void;
}) {
  if (loading) {
    return (
      <div className="ui-org-switcher-state" role="status">
        <Loader2 className="ui-org-switcher-spinner" aria-hidden="true" />
        <span>{labels.loading}</span>
      </div>
    );
  }

  if (error != null) {
    return (
      <div className="ui-org-switcher-state" role="alert">
        <span>{error}</span>
        {onRetry != null ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RotateCcw aria-hidden="true" />
            {labels.retry}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <Command label={labels.title} className="ui-org-switcher-command">
      <CommandInput placeholder={labels.search} aria-label={labels.search} />
      <CommandList>
        <CommandEmpty>{labels.empty}</CommandEmpty>
        <CommandGroup>
          {organizations.map((organization) => {
            const selected = organization.id === value;
            return (
              <CommandItem
                key={organization.id}
                value={`${organization.name} ${String(organization.meta ?? "")}`}
                keywords={[organization.id]}
                disabled={organization.disabled}
                onSelect={() => {
                  onValueChange?.(organization.id);
                  close();
                }}
              >
                <OrganizationMark organization={organization} />
                <span className="ui-org-switcher-option">
                  <span className="ui-org-switcher-name">{organization.name}</span>
                  {organization.meta != null ? (
                    <span className="ui-org-switcher-meta">{organization.meta}</span>
                  ) : null}
                </span>
                {selected ? (
                  <>
                    <Check className="ui-org-switcher-check" aria-hidden="true" />
                    <span className="sr-only">({labels.title})</span>
                  </>
                ) : null}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

/**
 * Organization switcher with one stable shell contract: canonical trigger geometry, searchable
 * desktop popover, a focus-trapped bottom Sheet at 390px, and explicit loading/empty/error states.
 */
export function OrgSwitcher({
  organizations,
  value,
  onValueChange,
  collapsed = false,
  disabled = false,
  loading = false,
  error,
  onRetry,
  labels,
  responsive = "auto",
  open,
  onOpenChange,
  className,
}: OrgSwitcherProp) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const resolvedOpen = open ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const mobile = useMediaQuery("(max-width: 390px)");
  const sheet = responsive === "sheet" || (responsive === "auto" && mobile);
  const current = organizations.find((organization) => organization.id === value);
  const fallbackName = current?.name ?? labels.title;
  const triggerLabel = labels.trigger(fallbackName);
  // Loading and empty are inspectable panel states, not disabled controls. Only the explicit
  // disabled prop removes the switcher's affordance.
  const triggerDisabled = disabled;
  const trigger = (
    <OrgSwitcherTrigger
      organization={current}
      collapsed={collapsed}
      disabled={triggerDisabled}
      label={triggerLabel}
    />
  );
  const panel = (
    <OrgSwitcherPanel
      organizations={organizations}
      value={value}
      onValueChange={onValueChange}
      loading={loading}
      error={error}
      onRetry={onRetry}
      labels={labels}
      close={() => setOpen(false)}
    />
  );

  if (sheet) {
    return (
      <div className={cn("ui-org-switcher", className)} data-collapsed={collapsed || undefined}>
        <Sheet open={resolvedOpen} onOpenChange={setOpen}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent side="bottom" className="ui-org-switcher-sheet">
            <SheetHeader title={labels.title} />
            <SheetBody>{panel}</SheetBody>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className={cn("ui-org-switcher", className)} data-collapsed={collapsed || undefined}>
      <Popover open={resolvedOpen} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent align="start" className="ui-org-switcher-popover">
          {panel}
        </PopoverContent>
      </Popover>
    </div>
  );
}

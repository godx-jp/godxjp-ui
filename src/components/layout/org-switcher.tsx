import * as React from "react";
import { Check, ChevronsUpDown, Loader2, RotateCcw } from "lucide-react";

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
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  useSheetResponsiveMode,
} from "../feedback/sheet";
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

type OrgSwitcherTriggerProps = React.ComponentPropsWithoutRef<typeof Button> & {
  organization?: OrgSwitcherOrganization;
  collapsed: boolean;
  label: string;
};

/**
 * End-aligned status/plan slot. The node itself is treated as PRESENTATIONAL whenever the consumer
 * supplied `badgeLabel`, so the localized text is announced exactly once (WCAG 1.1.1) instead of
 * being duplicated by the badge's own glyph/text.
 */
function OrganizationBadge({ organization }: { organization: OrgSwitcherOrganization }) {
  if (organization.badge == null) return null;

  return (
    <span
      data-slot="org-switcher-badge"
      className="shrink-0"
      aria-hidden={organization.badgeLabel != null ? "true" : undefined}
    >
      {organization.badge}
    </span>
  );
}

const OrgSwitcherTrigger = React.forwardRef<HTMLButtonElement, OrgSwitcherTriggerProps>(
  ({ organization, collapsed, disabled, label, ...props }, ref) => {
    const reactId = React.useId();
    // The trigger's accessible name comes from `aria-label`, which SUPPRESSES descendant text — so a
    // meaningful badge is announced as a DESCRIPTION (APG: name then description) rather than lost.
    const badgeDescriptionId =
      !collapsed && organization?.badge != null && organization.badgeLabel != null
        ? `${reactId}-badge`
        : undefined;

    return (
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        className="ui-org-switcher-trigger"
        data-collapsed={collapsed ? "true" : undefined}
        disabled={disabled}
        aria-label={label}
        aria-describedby={badgeDescriptionId}
        {...props}
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
            {organization != null ? <OrganizationBadge organization={organization} /> : null}
            {badgeDescriptionId != null ? (
              <span id={badgeDescriptionId} className="sr-only">
                {organization?.badgeLabel}
              </span>
            ) : null}
            <ChevronsUpDown className="ui-org-switcher-chevron" aria-hidden="true" />
          </>
        ) : null}
      </Button>
    );
  },
);
OrgSwitcherTrigger.displayName = "OrgSwitcherTrigger";

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
                keywords={
                  organization.badgeLabel != null
                    ? [organization.id, organization.badgeLabel]
                    : [organization.id]
                }
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
                <OrganizationBadge organization={organization} />
                {organization.badge != null && organization.badgeLabel != null ? (
                  <span className="sr-only">{organization.badgeLabel}</span>
                ) : null}
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
 * Organization switcher with one stable shell contract: canonical trigger geometry, an optional
 * status badge, a searchable desktop popover, a focus-trapped bottom Sheet at/below the shared
 * `--sheet-responsive-breakpoint-width`, and explicit loading/empty/error states.
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
  const controlled = open !== undefined;
  const resolvedOpen = controlled ? open : uncontrolledOpen;
  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!controlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [controlled, onOpenChange],
  );
  // The popover→bottom-sheet switch is the SHARED Sheet contract, not a page-local media query:
  // one themeable knob (--sheet-responsive-breakpoint-width) moves the drawer line for every
  // overlay in the system at once (rule #45).
  const compactViewport = useSheetResponsiveMode("auto") === "bottom";
  const sheet = responsive === "sheet" || (responsive === "auto" && compactViewport);
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
          <SheetContent
            responsive="bottom"
            className="ui-org-switcher-sheet"
            // Keep the published --org-switcher-sheet-max-height knob authoritative for THIS
            // surface: the responsive bottom sheet is capped by --sheet-bottom-max-height, so alias
            // it here rather than letting the generic cap silently shadow the component token.
            style={
              {
                "--sheet-bottom-max-height": "var(--org-switcher-sheet-max-height)",
              } as React.CSSProperties
            }
          >
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
        <PopoverContent align="start" className="ui-org-switcher-popover" aria-label={labels.title}>
          {panel}
        </PopoverContent>
      </Popover>
    </div>
  );
}

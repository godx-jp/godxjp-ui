import * as React from "react";
import { defaultFilter, useCommandState } from "cmdk";
import { Building2, Check, ChevronsUpDown, Loader2, RotateCcw } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type {
  OrgSwitcherAction,
  OrgSwitcherOrganization,
  OrgSwitcherProp,
} from "../../props/components/layout.prop";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../feedback/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../data-entry/command";
import {
  Sheet,
  SheetBody,
  SheetFooter,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  useSheetResponsiveMode,
} from "../feedback/sheet";
import { Button } from "../general/button";

export type {
  OrgSwitcherAction,
  OrgSwitcherLabels,
  OrgSwitcherOrganization,
  OrgSwitcherProp,
  OrgSwitcherProp as OrgSwitcherProps,
} from "../../props/components/layout.prop";

/*
 * NOTHING SELECTED IS NOT AN ERROR. The empty trigger used to draw "?" here, which reads as a
 * failure state beside a label that is only asking for a choice, and no prop could change it. The
 * default is now a neutral organization glyph; `placeholderAvatar` replaces it (a product whose
 * switcher picks a project or a workspace passes its own icon).
 */
function OrganizationMark({
  organization,
  placeholder,
}: {
  organization?: OrgSwitcherOrganization;
  placeholder?: React.ReactNode;
}) {
  if (organization == null) {
    return (
      <span className="ui-org-switcher-avatar" data-placeholder="true" aria-hidden="true">
        {placeholder ?? <Building2 />}
      </span>
    );
  }

  return (
    <span
      className="ui-org-switcher-avatar"
      data-kind={organization.kind === "personal" ? "personal" : undefined}
      aria-hidden="true"
    >
      {organization.avatar ?? organization.name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

type OrgSwitcherTriggerProps = React.ComponentPropsWithoutRef<typeof Button> & {
  organization?: OrgSwitcherOrganization;
  placeholderAvatar?: React.ReactNode;
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

/** Arbitrary `data-*` hooks — the one escape hatch this closed component keeps open. */
type DataAttributes = { [key: `data-${string}`]: string | number | boolean | undefined };

const OrgSwitcherTrigger = React.forwardRef<HTMLButtonElement, OrgSwitcherTriggerProps>(
  ({ organization, placeholderAvatar, collapsed, disabled, label, ...props }, ref) => {
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
        // THE HEIGHT HAS TO BE A UTILITY. `.ui-org-switcher-trigger` declares
        // `height: var(--org-switcher-trigger-height)` in @layer components, and Button emits its
        // size as a Tailwind utility — utilities win, always, so that declaration never applied.
        // Measured in a consumer's collapsed rail: 44 × 32px. The width was right (the collapsed
        // rule sets a width and Button emits none, so nothing outranked it) which is exactly why
        // it read as correct: a box that is right on one axis and silently wrong on the other.
        // 32px is below the 44px target floor that this very token is named for (rule #24,
        // WCAG 2.2 AA 2.5.8), so the collapsed rail trigger was under-sized wherever it shipped.
        className={cn("ui-org-switcher-trigger", "h-[length:var(--org-switcher-trigger-height)]")}
        data-collapsed={collapsed ? "true" : undefined}
        disabled={disabled}
        aria-label={label}
        aria-describedby={badgeDescriptionId}
        {...props}
      >
        <OrganizationMark organization={organization} placeholder={placeholderAvatar} />
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

/*
 * THE PERSONAL SECTION (#1556). The account's own workspace is listed apart from the companies,
 * after them, so nobody mistakes it for one and it is never the first row. Search narrows the
 * ORGANIZATIONS only: there is one personal workspace, and hiding it because a company name did
 * not match would make "where is my own space" depend on what was typed.
 *
 * cmdk re-appends the groups that match in score order and leaves an unmatched group where it was,
 * so a personal group that scored 0 would be hoisted ABOVE the matching organizations. It scores
 * the smallest positive number instead: always matched, always last. That also puts it in cmdk's
 * filtered count, so the empty line is the component's own, counted over organizations.
 */
const PERSONAL_KEYWORD = "\u0000org-switcher-personal";
/*
 * THE ACTIONS (「組織を管理」) take the same always-matched trick one step lower: a search never hides
 * them, and their group is appended after the personal one, so they stay the last rows.
 */
const ACTION_KEYWORD = "\u0000org-switcher-action";
const ACTION_SCORE = Number.MIN_VALUE;
const PERSONAL_SCORE = Number.MIN_VALUE * 2;

function orgSwitcherFilter(value: string, search: string, keywords?: string[]) {
  if (keywords?.includes(ACTION_KEYWORD)) return ACTION_SCORE;
  return keywords?.includes(PERSONAL_KEYWORD)
    ? PERSONAL_SCORE
    : defaultFilter(value, search, keywords);
}

function OrganizationsEmpty({
  alwaysListed,
  children,
}: {
  /** Rows the filter always matches (personal workspaces, actions) — not organizations. */
  alwaysListed: number;
  children: React.ReactNode;
}) {
  const organizations = useCommandState((state) => state.filtered.count) - alwaysListed;
  if (organizations > 0) return null;
  // The same box CommandEmpty renders — it cannot be used here, because it counts every row.
  return (
    <div className="ui-command-empty" role="presentation">
      {children}
    </div>
  );
}

function OrganizationRow({
  organization,
  value,
  onValueChange,
  labels,
  close,
}: Pick<OrgSwitcherProp, "value" | "onValueChange" | "labels"> & {
  organization: OrgSwitcherOrganization;
  close: () => void;
}) {
  const selected = organization.id === value;
  const keywords =
    organization.badgeLabel != null
      ? [organization.id, organization.badgeLabel]
      : [organization.id];
  return (
    <CommandItem
      value={`${organization.name} ${String(organization.meta ?? "")}`}
      keywords={organization.kind === "personal" ? [...keywords, PERSONAL_KEYWORD] : keywords}
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
}

function OrgSwitcherPanel({
  organizations,
  actions = [],
  value,
  onValueChange,
  loading,
  error,
  onRetry,
  labels,
  close,
}: Pick<
  OrgSwitcherProp,
  | "organizations"
  | "actions"
  | "value"
  | "onValueChange"
  | "loading"
  | "error"
  | "onRetry"
  | "labels"
> & {
  close: () => void;
}) {
  const { t } = useTranslation();
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

  const companies = organizations.filter((organization) => organization.kind !== "personal");
  const personal = organizations.filter((organization) => organization.kind === "personal");
  const alwaysListed = personal.length + actions.length;
  const row = (organization: OrgSwitcherOrganization) => (
    <OrganizationRow
      key={organization.id}
      organization={organization}
      value={value}
      onValueChange={onValueChange}
      labels={labels}
      close={close}
    />
  );

  return (
    <Command
      label={labels.title}
      className="ui-org-switcher-command"
      split
      filter={alwaysListed > 0 ? orgSwitcherFilter : undefined}
    >
      <CommandInput placeholder={labels.search} aria-label={labels.search} />
      <CommandList>
        {alwaysListed > 0 ? (
          <OrganizationsEmpty alwaysListed={alwaysListed}>{labels.empty}</OrganizationsEmpty>
        ) : (
          <CommandEmpty>{labels.empty}</CommandEmpty>
        )}
        <CommandGroup>{companies.map(row)}</CommandGroup>
        {personal.length > 0 ? (
          <CommandGroup heading={labels.personal ?? t("layout.orgSwitcher.personal")}>
            {personal.map(row)}
          </CommandGroup>
        ) : null}
        {actions.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup>
              {actions.map((action: OrgSwitcherAction) => (
                <CommandItem
                  key={action.id}
                  value={`${ACTION_KEYWORD} ${action.id}`}
                  keywords={[ACTION_KEYWORD]}
                  disabled={action.disabled}
                  data-action={action.id}
                  className="ui-org-switcher-action"
                  onSelect={() => {
                    action.onSelect();
                    close();
                  }}
                >
                  {action.icon != null ? (
                    <span className="ui-org-switcher-action-icon" aria-hidden="true">
                      {action.icon}
                    </span>
                  ) : null}
                  <span className="ui-org-switcher-name">{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
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
  actions,
  value,
  onValueChange,
  collapsed = false,
  disabled = false,
  loading = false,
  error,
  onRetry,
  labels,
  placeholderAvatar,
  responsive = "auto",
  open,
  onOpenChange,
  className,
  ...rest
}: OrgSwitcherProp & Pick<React.ComponentPropsWithoutRef<"button">, "id"> & DataAttributes) {
  const { t } = useTranslation();
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
  const compactViewport = useSheetResponsiveMode("auto") === "bottom";
  /*
   * `auto` and `dialog` are the two RESPONSIVE pairs and share their mobile half: below the
   * breakpoint both are the bottom Sheet, because a centred modal on a phone is a Sheet with worse
   * ergonomics. They differ only in the desktop half. `popover` and `sheet` stay pinned.
   */
  const responsivePair = responsive === "auto" || responsive === "dialog";
  const sheet = responsive === "sheet" || (responsivePair && compactViewport);
  const dialog = responsive === "dialog" && !sheet;
  const current = organizations.find((organization) => organization.id === value);
  const fallbackName = current?.name ?? labels.title;
  const triggerLabel = labels.trigger(fallbackName);
  // Loading and empty are inspectable panel states, not disabled controls. Only the explicit
  // disabled prop removes the switcher's affordance.
  const triggerDisabled = disabled;
  /*
   * `data-*` and `id` REACH THE TRIGGER. Everything else about this component is deliberately
   * closed, but a switcher that cannot be addressed is a switcher no end-to-end test can drive,
   * and the alternative consumers reach for is worse: a hand-rolled Select they CAN address.
   * Measured — one shipped consumer bound `[data-test="organization-switcher"]` to a raw Select
   * for months, and swapping in this component silently detached the selector because the prop
   * was swallowed. The accessible name is localized, so it is not a selector a test can hold.
   */
  const trigger = (
    <OrgSwitcherTrigger
      organization={current}
      placeholderAvatar={placeholderAvatar}
      collapsed={collapsed}
      disabled={triggerDisabled}
      label={triggerLabel}
      {...rest}
    />
  );
  const panel = (
    <OrgSwitcherPanel
      organizations={organizations}
      actions={actions}
      value={value}
      onValueChange={onValueChange}
      loading={loading}
      error={error}
      onRetry={onRetry}
      labels={labels}
      close={() => setOpen(false)}
    />
  );

  /*
   * THE KEYBOARD LEGEND — the fourth part of the command-palette anatomy this panel already builds
   * the other three of: a search input, grouped rows, and one active row that Enter runs.
   *
   * It is not decoration. The list is arrow-navigable and Enter-committed, and until the legend
   * existed the only way to learn that was to try it: a picker that looks like a menu gets clicked
   * through, one organization at a time, by people who would rather have typed three letters and
   * pressed Enter. Raycast, Linear and GitHub all pay for this strip for the same reason.
   *
   * Modal surfaces only. A popover is a small anchored panel a pointer is already inside — a legend
   * there is a line of chrome taller than the thing it explains.
   */
  const keyboardLegend = (
    <div className="ui-org-switcher-legend">
      <span className="ui-org-switcher-hint">
        <kbd className="kbd" aria-hidden="true">
          ↑↓
        </kbd>
        {t("layout.orgSwitcher.hintMove")}
      </span>
      <span className="ui-org-switcher-hint">
        <kbd className="kbd" aria-hidden="true">
          ↵
        </kbd>
        {t("layout.orgSwitcher.hintSelect")}
      </span>
      <span className="ui-org-switcher-hint">
        <kbd className="kbd" aria-hidden="true">
          esc
        </kbd>
        {t("layout.orgSwitcher.hintClose")}
      </span>
    </div>
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
            <SheetFooter>{keyboardLegend}</SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  if (dialog) {
    /*
     * The panel earns a modal once it carries more than a name per row. A popover is anchored to
     * its trigger, clipped by the viewport and sized by --org-switcher-menu-width; a dialog has a
     * real title, a scrolling body and room for a footer — and it takes the reader's full
     * attention, which is the right trade when switching organization re-scopes everything on
     * screen.
     */
    return (
      <div className={cn("ui-org-switcher", className)} data-collapsed={collapsed || undefined}>
        <Dialog open={resolvedOpen} onOpenChange={setOpen}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent className="ui-org-switcher-dialog">
            <DialogHeader>
              <DialogTitle>{labels.title}</DialogTitle>
            </DialogHeader>
            <DialogBody>{panel}</DialogBody>
            <DialogFooter>{keyboardLegend}</DialogFooter>
          </DialogContent>
        </Dialog>
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

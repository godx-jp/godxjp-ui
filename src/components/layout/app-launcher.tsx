import * as React from "react";
import { Grip, Loader2, RotateCcw } from "lucide-react";

import { cn } from "../../lib/utils";
import type {
  AppLauncherApp,
  AppLauncherProp,
  SidebarLinkComponentProp,
} from "../../props/components/layout.prop";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../feedback/dialog";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  useSheetResponsiveMode,
} from "../feedback/sheet";
import { Button } from "../general/button";
import { TopbarItem } from "./topbar-item";

export type {
  AppLauncherApp,
  AppLauncherGroup,
  AppLauncherLabels,
  AppLauncherProp,
  AppLauncherProp as AppLauncherProps,
} from "../../props/components/layout.prop";

/** Arbitrary `data-*` hooks — the one escape hatch this closed component keeps open. */
type DataAttributes = { [key: `data-${string}`]: string | number | boolean | undefined };

/**
 * The app's own mark, or the first character of its name — the same fallback `OrgSwitcher` uses for
 * an organization with no avatar, so the two platform-scope controls degrade identically.
 * Presentational: the tile's accessible name is the visible `name` beneath it.
 */
function AppMark({ app }: { app: AppLauncherApp }) {
  return (
    <span className="ui-app-launcher-mark" aria-hidden="true">
      {app.icon ?? app.name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * ONE tile — a real `<a href>`, never a `div` with an `onClick`.
 *
 * An `external` app renders the bare anchor and skips `linkComponent` on purpose: a client-side
 * router link pointed at another origin is a router asked to route somewhere it does not own.
 */
function AppLauncherTile({
  app,
  linkComponent: Link,
  externalHint,
  close,
}: {
  app: AppLauncherApp;
  linkComponent?: SidebarLinkComponentProp;
  externalHint?: string;
  close: () => void;
}) {
  const children = (
    <>
      <AppMark app={app} />
      <span className="ui-app-launcher-name">{app.name}</span>
      {app.external && externalHint != null ? (
        <span className="sr-only">{externalHint}</span>
      ) : null}
    </>
  );
  const linkProps = {
    href: app.href,
    className: "ui-app-launcher-tile ui-focus-ring",
    "data-active": app.current ? ("true" as const) : undefined,
    "aria-current": app.current ? ("page" as const) : undefined,
    onClick: close,
    children,
  };

  return (
    <li className="ui-app-launcher-cell" data-app={app.id}>
      {app.external || Link == null ? (
        <a
          {...linkProps}
          target={app.external ? "_blank" : undefined}
          rel={app.external ? "noreferrer noopener" : undefined}
        />
      ) : (
        <Link {...linkProps} />
      )}
    </li>
  );
}

function AppLauncherGrid({
  apps,
  linkComponent,
  externalHint,
  close,
  ...props
}: {
  apps: readonly AppLauncherApp[];
  linkComponent?: SidebarLinkComponentProp;
  externalHint?: string;
  close: () => void;
} & Pick<React.HTMLAttributes<HTMLUListElement>, "aria-labelledby" | "aria-label">) {
  return (
    <ul className="ui-app-launcher-grid" {...props}>
      {apps.map((app) => (
        <AppLauncherTile
          key={app.id}
          app={app}
          linkComponent={linkComponent}
          externalHint={externalHint}
          close={close}
        />
      ))}
    </ul>
  );
}

/**
 * A labelled band uses `role="group"` + `aria-labelledby`, NOT a heading.
 *
 * The panel is a `dialog` whose own name is `labels.title`, and it is rendered under a popover on
 * one surface and under a `SheetHeader` (which already emits a title element) on the other — so any
 * heading level chosen here would be right on one surface and a skipped level on the other. A group
 * name is what is wanted; `role="group"` says exactly that on both.
 */
function AppLauncherSection({
  label,
  apps,
  linkComponent,
  externalHint,
  close,
}: {
  label: string;
  apps: readonly AppLauncherApp[];
  linkComponent?: SidebarLinkComponentProp;
  externalHint?: string;
  close: () => void;
}) {
  const labelId = React.useId();

  return (
    <div role="group" aria-labelledby={labelId} className="ui-app-launcher-group">
      <span id={labelId} className="ui-app-launcher-group-label">
        {label}
      </span>
      <AppLauncherGrid
        apps={apps}
        linkComponent={linkComponent}
        externalHint={externalHint}
        close={close}
      />
    </div>
  );
}

function AppLauncherPanel({
  apps,
  groups,
  labels,
  columns,
  linkComponent,
  loading,
  error,
  onRetry,
  close,
}: Pick<
  AppLauncherProp,
  "apps" | "groups" | "labels" | "columns" | "linkComponent" | "loading" | "error" | "onRetry"
> & {
  close: () => void;
}) {
  if (loading) {
    return (
      <div className="ui-app-launcher-state" role="status">
        <Loader2 className="ui-app-launcher-spinner" aria-hidden="true" />
        <span>{labels.loading}</span>
      </div>
    );
  }

  if (error != null) {
    return (
      <div className="ui-app-launcher-state" role="alert">
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

  if (!apps.length && (groups ?? []).every((group) => !group.apps.length)) {
    return (
      <div className="ui-app-launcher-state" role="status">
        <span>{labels.empty}</span>
      </div>
    );
  }

  return (
    <div
      className="ui-app-launcher-panel"
      /*
       * The COUNT is written as a custom property rather than a class, because a class per count is
       * a closed set and this is an open one — and only when the consumer asked for one. The
       * DEFAULT is the `--app-launcher-columns` declaration on `.ui-app-launcher-panel`
       * (styles/shell-layout.css), so an unset prop leaves the stylesheet in charge and a theme can
       * move every launcher at once; naming 3 here as well would be a second answer that drifts.
       */
      style={
        columns == null
          ? undefined
          : ({ "--app-launcher-columns": String(columns) } as React.CSSProperties)
      }
    >
      {apps.length ? (
        <AppLauncherGrid
          apps={apps}
          linkComponent={linkComponent}
          externalHint={labels.externalHint}
          close={close}
          aria-label={labels.title}
        />
      ) : null}
      {groups?.map((group) => (
        <AppLauncherSection
          key={group.label}
          label={group.label}
          apps={group.apps}
          linkComponent={linkComponent}
          externalHint={labels.externalHint}
          close={close}
        />
      ))}
    </div>
  );
}

/**
 * AppLauncher — the nine-dot app grid in the topbar: the platform's standard way to change app.
 *
 * THE TRIGGER IS A `TopbarItem`, NOT A `Button`. A bar cell is as tall as the bar, its hover IS the
 * bar's surface, and its focus mark is hosted inside it; a `Button variant="ghost"` in the same slot
 * draws a `--control-height` pill floating in a taller strip, with its own hover fill and its own
 * ring drawn around that pill. That was the 20.0.0 correction, and it is why nothing here emits a
 * height: the cell stretches to whatever the bar's height happens to be (`--app-shell-bar-height`,
 * `--topbar-height`, or the coarse-pointer override), so it names none of them.
 *
 * The panel is the SAME responsive contract as `OrgSwitcher`: a desktop popover above
 * `--sheet-responsive-breakpoint-width` and a focus-trapped bottom Sheet at/below it, through the
 * shared `useSheetResponsiveMode()` hook rather than a component-local media query.
 *
 * ## Related — two components this is repeatedly confused with
 *
 * - `ServiceLauncherCard` (data-display) is a launcher tile too, but a PAGE-SIZED one: status,
 *   hostname, plan, an action button, a reason it is locked. It belongs on a service-catalogue page,
 *   where choosing is a considered act. The tile here is bar-sized — mark plus name, the whole tile
 *   one link — because changing app is a reflex. Neither is built out of the other, and a grid of
 *   `ServiceLauncherCard`s inside a popover is the wrong component, not a smaller version of this.
 * - `AppShellProp.navRail` says the SAME platform scope as a docked column. Pick ONE: the launcher
 *   for a platform with MANY apps where switching is occasional (Google Workspace), the rail for a
 *   single product where switching workspace is constant enough to be worth permanent screen width
 *   (Slack). Shipping both puts one scope in two places and makes neither authoritative.
 */
export function AppLauncher({
  apps,
  groups,
  labels,
  columns,
  linkComponent,
  loading = false,
  error,
  onRetry,
  responsive = "auto",
  appearance = "bar",
  side,
  align,
  open,
  onOpenChange,
  className,
  ...rest
}: AppLauncherProp & Pick<React.ComponentPropsWithoutRef<"button">, "id"> & DataAttributes) {
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
  // The popover→bottom-sheet switch is the SHARED Sheet contract, not a page-local media query: one
  // themeable knob (--sheet-responsive-breakpoint-width) moves the drawer line for every overlay.
  const compactViewport = useSheetResponsiveMode("auto") === "bottom";
  const sheet = responsive === "sheet" || (responsive === "auto" && compactViewport);
  const launchpad = responsive === "fullscreen";
  const close = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  /*
   * `data-*` and `id` REACH THE TRIGGER. Everything else about this component is deliberately
   * closed, but a control no end-to-end test can address is a control consumers replace with a
   * hand-rolled menu they CAN address — measured on `OrgSwitcher`, where the swallowed prop
   * silently detached one shipped consumer's `[data-test=…]` selector. The accessible name is
   * localized, so it is not a selector a test can hold.
   */
  /*
   * THE BOX FOLLOWS THE CHROME IT SITS IN — the same split `AppSettingToggle` already draws.
   * `bar` is a `TopbarItem`: a cell as tall as the bar, whose hover IS the bar's surface. `icon` is
   * a square ghost `Button`, for chrome that is NOT a bar — a nav rail, a card header, a toolbar.
   * A `TopbarItem` there has no bar to bleed to: it stretches to a container that never set a band
   * height, and its squared corners and full-bleed hover read as a broken cell rather than a
   * control. `Grip` is the glyph either way; only the box changes.
   */
  const triggerProps = {
    className: cn("ui-app-launcher-trigger", className),
    "aria-label": labels.trigger,
    ...rest,
  };
  const trigger =
    appearance === "bar" ? (
      <TopbarItem {...triggerProps}>
        <Grip aria-hidden="true" />
      </TopbarItem>
    ) : (
      <Button variant="ghost" size="icon-sm" {...triggerProps}>
        <Grip aria-hidden="true" />
      </Button>
    );
  const panel = (
    <AppLauncherPanel
      apps={apps}
      groups={groups}
      labels={labels}
      columns={columns}
      linkComponent={linkComponent}
      loading={loading}
      error={error}
      onRetry={onRetry}
      close={close}
    />
  );

  /*
   * NO WRAPPER ELEMENT, and that is load-bearing rather than tidy. `Popover` and `Sheet` are both
   * context providers that render no DOM of their own, so the trigger is the topbar slot's own flex
   * child — which is the only way `.ui-topbar-item { align-self: stretch }` can reach the bar's
   * height. A wrapping `<div>` would become the flex item, the cell would stretch to the WRAPPER
   * instead, and the pill-in-a-bar this component exists to avoid would come back through the box
   * around it. It also means `className`, `id` and `data-*` all land on one addressable element.
   */
  /*
   * THE LAUNCHPAD. A `Dialog`, not a third overlay hand-built here: the focus trap, the scroll
   * lock, Escape, the close button and `UNSTABLE_portalContainer` (which is what lets any of this
   * work inside an embedded shadow root) are all already its contract. What this surface changes
   * is geometry and ground — full viewport, blurred page, tiles at tile size — and those are CSS,
   * so they live in the stylesheet where a theme can reach them.
   *
   * The title RENDERS rather than hiding in an `aria-label`: `DialogContent` names itself from the
   * `DialogTitle` element, and a dialog whose name lives only in an attribute is a dialog whose
   * name silently disappears the first time someone reorders the children.
   */
  if (launchpad) {
    return (
      <Dialog open={resolvedOpen} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent
          className="ui-app-launcher-launchpad"
          overlayClassName="ui-app-launcher-launchpad-overlay"
        >
          <DialogHeader>
            <DialogTitle>{labels.title}</DialogTitle>
          </DialogHeader>
          {panel}
        </DialogContent>
      </Dialog>
    );
  }

  if (sheet) {
    return (
      <Sheet open={resolvedOpen} onOpenChange={setOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          responsive="bottom"
          className="ui-app-launcher-sheet"
          // Keep the published --app-launcher-sheet-max-height knob authoritative for THIS surface:
          // the responsive bottom sheet is capped by --sheet-bottom-max-height, so alias it here
          // rather than letting the generic cap silently shadow the component token.
          style={
            {
              "--sheet-bottom-max-height": "var(--app-launcher-sheet-max-height)",
            } as React.CSSProperties
          }
        >
          <SheetHeader title={labels.title} />
          <SheetBody>{panel}</SheetBody>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={resolvedOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      {/*
       * THE PANEL OPENS AWAY FROM THE CHROME IT BELONGS TO, and which chrome that is, is what
       * `appearance` already says.
       *
       * In a BAR the grid drops below the trigger and aligns to the bar's end — the Workspace
       * shape, and the only direction that does not cover the bar itself. In a RAIL that same
       * placement opens straight down the screen edge, across whatever the rail sits beside:
       * measured on an embedded bar, a trigger at (2,50) put its panel at (12,90), 40px down and
       * lying over the host application's sidebar. A rail is vertical, so its panel goes beside
       * it — `inline-end`, aligned to the trigger's own start.
       *
       * `appearance` says the trigger is NOT in a bar; it does not say which way is out. A rail
       * pinned to the top edge is not a bar and still opens downward. So the default is derived
       * and the caller may state it: chrome that can be re-docked knows its own orientation, and
       * this component cannot.
       */}
      <PopoverContent
        side={side ?? (appearance === "bar" ? "bottom" : "right")}
        align={align ?? (appearance === "bar" ? "end" : "start")}
        className="ui-app-launcher-popover"
        aria-label={labels.title}
      >
        {panel}
      </PopoverContent>
    </Popover>
  );
}

import {
  Bell,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { DropdownMenu, DropdownMenuTrigger } from "../navigation/dropdown-menu";
import { useTranslation } from "../../i18n/use-translation";
import type { TopbarProp } from "../../props/components/layout.prop";

export type {
  TopbarProductProp as TopbarProduct,
  TopbarProjectProp as TopbarProject,
  TopbarProp,
  TopbarProp as TopbarProps,
} from "../../props/components/layout.prop";

export function Topbar({
  product,
  project,
  productMenu,
  projectMenu,
  projectPlaceholder,
  onProductOpen,
  onProjectOpen,
  onSearchOpen,
  onTweaksOpen,
  collapsed = false,
  onToggleCollapsed,
  rightSlot,
  unread = false,
  searchPlaceholder,
  onNotificationsOpen,
  user,
}: TopbarProp) {
  const { t } = useTranslation();
  // A chip is a SWITCHER only when there's actually something to open — a menu or a click handler.
  // Otherwise it's a plain brand label: no caret, no button, no dropdown affordance with nothing
  // to choose (the "dead dropdown" bug). The caret is the promise of a menu; don't show it empty.
  const productInteractive = productMenu != null || onProductOpen != null;
  const productIcon = (
    <span className="tb-chip-icon" style={{ background: product.color ?? "hsl(var(--attention))" }}>
      {product.name[0]?.toUpperCase() ?? "?"}
    </span>
  );
  const productChip = productInteractive ? (
    <button
      type="button"
      className="tb-chip"
      aria-label={product.name}
      onClick={productMenu ? undefined : onProductOpen}
    >
      {productIcon}
      <span className="tb-chip-label">{product.name}</span>
      <span className="tb-chip-caret">
        <ChevronDown aria-hidden="true" />
      </span>
    </button>
  ) : (
    <span className="tb-chip tb-chip-static">
      {productIcon}
      <span className="tb-chip-label">{product.name}</span>
    </span>
  );

  // The project chip is optional chrome — only render it when there is a project or a project
  // menu to show, so consumers that don't use it don't get a dead "Pick project" placeholder.
  const showProject = project != null || projectMenu != null;
  const projectInteractive = projectMenu != null || onProjectOpen != null;
  const projectChip = projectInteractive ? (
    <button
      type="button"
      className={`tb-chip ${project ? "" : "tb-chip-empty"}`}
      aria-label={project ? project.name : (projectPlaceholder ?? "")}
      onClick={projectMenu ? undefined : onProjectOpen}
    >
      <span className="tb-chip-label">{project ? project.name : (projectPlaceholder ?? "—")}</span>
      <span className="tb-chip-caret">
        <ChevronDown aria-hidden="true" />
      </span>
    </button>
  ) : (
    <span className="tb-chip tb-chip-static" aria-label={project ? project.name : undefined}>
      <span className="tb-chip-label">{project ? project.name : (projectPlaceholder ?? "—")}</span>
    </span>
  );

  return (
    <>
      {onToggleCollapsed ? (
        <button
          type="button"
          className="tb-icon-btn"
          aria-label={t("layout.topbar.toggleSidebar")}
          aria-pressed={collapsed}
          onClick={onToggleCollapsed}
        >
          {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
        </button>
      ) : null}

      <div className="tb-switcher">
        {productMenu ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>{productChip}</DropdownMenuTrigger>
            {productMenu}
          </DropdownMenu>
        ) : (
          productChip
        )}
        {showProject ? <span className="tb-chip-sep">/</span> : null}
        {showProject ? (
          projectMenu ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>{projectChip}</DropdownMenuTrigger>
              {projectMenu}
            </DropdownMenu>
          ) : (
            projectChip
          )
        ) : null}
      </div>

      <button
        type="button"
        className="tb-search"
        aria-label={t("layout.topbar.search")}
        aria-keyshortcuts="Meta+K"
        onClick={onSearchOpen}
      >
        <Search aria-hidden="true" />
        <span>{searchPlaceholder ?? t("layout.topbar.searchPlaceholder")}</span>
        <kbd className="kbd">⌘K</kbd>
      </button>

      {rightSlot}

      {onNotificationsOpen ? (
        <button
          type="button"
          className="tb-icon-btn tb-bell"
          aria-label={t("layout.topbar.notifications")}
          onClick={onNotificationsOpen}
        >
          <Bell aria-hidden="true" />
          {unread ? <span className="tb-bell-dot" aria-hidden="true" /> : null}
        </button>
      ) : null}

      {user}

      {onTweaksOpen ? (
        <button
          type="button"
          className="tb-icon-btn"
          aria-label={t("layout.topbar.tweaks")}
          onClick={onTweaksOpen}
        >
          <SlidersHorizontal aria-hidden="true" />
        </button>
      ) : null}
    </>
  );
}

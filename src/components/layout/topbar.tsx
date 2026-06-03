import {
  Bell,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { DropdownMenu, DropdownMenuTrigger } from "../navigation/dropdown-menu";
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
  onNotificationsOpen,
  user,
}: TopbarProp) {
  const productChip = (
    <button
      type="button"
      className="tb-chip"
      aria-label={product.name}
      onClick={productMenu ? undefined : onProductOpen}
    >
      <span
        className="tb-chip-icon"
        style={{ background: product.color ?? "hsl(var(--attention))" }}
      >
        {product.name[0]?.toUpperCase() ?? "?"}
      </span>
      <span className="tb-chip-label">{product.name}</span>
      <span className="tb-chip-caret">
        <ChevronDown aria-hidden="true" />
      </span>
    </button>
  );

  // The project chip is optional chrome — only render it when there is a project or a project
  // menu to show, so consumers that don't use it don't get a dead "Pick project" placeholder.
  const showProject = project != null || projectMenu != null;
  const projectChip = (
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
  );

  return (
    <>
      {onToggleCollapsed ? (
        <button
          type="button"
          className="tb-icon-btn"
          aria-label="Toggle sidebar"
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

      <button type="button" className="tb-search" onClick={onSearchOpen}>
        <Search aria-hidden="true" />
        <span>Search...</span>
        <kbd className="kbd">⌘K</kbd>
      </button>

      {rightSlot}

      {onNotificationsOpen ? (
        <button
          type="button"
          className="tb-icon-btn tb-bell"
          aria-label="Notifications"
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
          aria-label="Open tweaks"
          onClick={onTweaksOpen}
        >
          <SlidersHorizontal aria-hidden="true" />
        </button>
      ) : null}
    </>
  );
}

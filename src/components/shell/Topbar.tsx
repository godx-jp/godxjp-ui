import { Bell, ChevronDown, PanelLeftClose, PanelLeftOpen, Search, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../primitives/cn";
import type { ForgeProduct, ForgeProject } from "../../data/products";

// Topbar — sits across the top of every screen. Hosts:
//
//   • Sidebar collapse toggle (mirror of useTweaks.sidebarCollapsed)
//   • Product chip      → opens ProductSwitcher (dropdown — TBD)
//   • Project chip      → opens ProjectSwitcher (dropdown — TBD)
//                         shown as a dashed empty chip when no
//                         active project (fixes the picker-empty
//                         bug super-admin used to hit).
//   • Search shortcut   → opens CommandPalette (⌘K)
//   • Tweaks button     → opens TweaksPanel (right-side drawer)
//
// Switcher dropdowns themselves render via callbacks supplied by the
// host page so the host can manage open state + keyboard nav. This
// component renders the closed chips + invokes `onProduct/Project
// Open`.

export interface TopbarProps {
  product: ForgeProduct;
  project?: ForgeProject | null;
  onProductOpen?: () => void;
  onProjectOpen?: () => void;
  onSearchOpen?: () => void;
  onTweaksOpen?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  /** Optional breadcrumb / actions slot on the right. */
  rightSlot?: ReactNode;
  /**
   * Notification bell. When `unread` is true a 6×6 attention-colored
   * dot renders in the top-right corner. Click handler invokes
   * `onNotificationsOpen`. Hidden when both are unset.
   */
  unread?: boolean;
  onNotificationsOpen?: () => void;
  /**
   * Right-edge user chip. Rendered as the trailing element (after
   * notifications, before tweaks) to match the design-handoff topbar
   * shape (shell.jsx:366). Pass any node — typically a `<Avatar>` or
   * a `<DropdownMenu>` wrapping one.
   */
  user?: ReactNode;
}

export function Topbar({
  product,
  project,
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
}: TopbarProps) {
  const { t } = useTranslation();

  return (
    <>
      {onToggleCollapsed && (
        <button
          type="button"
          className="tb-icon-btn"
          aria-label={t("shell.sidebarCollapse")}
          aria-pressed={collapsed}
          onClick={onToggleCollapsed}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      )}

      <div className="tb-switcher">
        <button
          type="button"
          className="tb-chip"
          aria-label={product.name}
          onClick={onProductOpen}
        >
          <span
            className="tb-chip-icon"
            style={{ background: product.color }}
          >
            {product.name[0]?.toUpperCase() ?? "?"}
          </span>
          <span className="tb-chip-label">{product.name}</span>
          <span className="tb-chip-caret">
            <ChevronDown size={12} />
          </span>
        </button>
        <span className="tb-chip-sep">/</span>
        <button
          type="button"
          className={cn("tb-chip", !project && "tb-chip-empty")}
          aria-label={project ? project.name : t("shell.pickProject")}
          onClick={onProjectOpen}
        >
          <span className="tb-chip-label">
            {project ? project.name : t("shell.pickProject")}
          </span>
          <span className="tb-chip-caret">
            <ChevronDown size={12} />
          </span>
        </button>
      </div>

      <button
        type="button"
        className="tb-search ml-auto"
        onClick={onSearchOpen}
      >
        <Search size={14} />
        <span>{t("common.search")}…</span>
        <kbd className="kbd">⌘K</kbd>
      </button>

      {rightSlot}

      {onNotificationsOpen && (
        <button
          type="button"
          className="tb-icon-btn tb-bell"
          aria-label={t("topbar.notifications", { defaultValue: "Notifications" })}
          onClick={onNotificationsOpen}
        >
          <Bell size={16} />
          {unread && <span className="tb-bell-dot" aria-hidden />}
        </button>
      )}

      {user}

      {onTweaksOpen && (
        <button
          type="button"
          className="tb-icon-btn"
          aria-label={t("tweaks.title")}
          onClick={onTweaksOpen}
        >
          <SlidersHorizontal size={16} />
        </button>
      )}
    </>
  );
}

import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../../primitives/Button";
import {
  SegmentedControl,
  type SegmentedControlItem,
} from "../../primitives/SegmentedControl";

/**
 * CalendarTopbar — top rail for the calendar screen:
 *   - product sticker + product name + tenant tag
 *   - Today button + prev/next nav
 *   - main title (date range / month / etc.)
 *   - search field (cmd-K)
 *   - bell + settings icon buttons
 *   - view-switcher segmented control
 *   - viewer avatar
 *
 * Generic — service identity strings are caller-supplied so the topbar
 * stays product-agnostic.
 */
export interface CalendarTopbarProps<V extends string = string> {
  /** Sticker glyph (single character or short label). */
  sticker: ReactNode;
  productName: ReactNode;
  /** Optional tenant chip (e.g. "Famgia"). */
  tenant?: ReactNode;
  titleMain: ReactNode;
  titleSub?: ReactNode;
  /** View-switcher options. */
  views: SegmentedControlItem<V>[];
  view: V;
  onChangeView: (next: V) => void;
  onToday?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  todayLabel: string;
  searchPlaceholder: string;
  searchKbd?: string;
  /** Viewer avatar — typically `<Avatar size={32}>` with initials. */
  avatar?: ReactNode;
  onSearchOpen?: () => void;
  onNotificationsOpen?: () => void;
  onSettingsOpen?: () => void;
}

export function CalendarTopbar<V extends string = string>({
  sticker,
  productName,
  tenant,
  titleMain,
  titleSub,
  views,
  view,
  onChangeView,
  onToday,
  onPrev,
  onNext,
  todayLabel,
  searchPlaceholder,
  searchKbd,
  avatar,
  onSearchOpen,
  onNotificationsOpen,
  onSettingsOpen,
}: CalendarTopbarProps<V>) {
  return (
    <header className="cal-topbar">
      <div className="row gap-2" style={{ marginRight: 4 }}>
        <span className="cal-topbar-sticker">{sticker}</span>
        <span className="cal-topbar-product">{productName}</span>
        {tenant && <span className="cal-topbar-tenant">{tenant}</span>}
      </div>

      <Button variant="secondary" size="sm" onClick={onToday}>
        {todayLabel}
      </Button>
      <div className="row" style={{ marginLeft: 2 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          style={{ width: 28, padding: 0 }}
          aria-label="Previous"
        >
          <ChevronLeft size={15} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          style={{ width: 28, padding: 0 }}
          aria-label="Next"
        >
          <ChevronRight size={15} />
        </Button>
      </div>

      <h1 className="cal-topbar-title">
        {titleMain}
        {titleSub && <span className="cal-topbar-title-sub">{titleSub}</span>}
      </h1>

      <div style={{ marginLeft: "auto" }} className="row gap-2">
        <button
          type="button"
          className="cal-topbar-search"
          onClick={onSearchOpen}
        >
          <Search size={13} />
          <span>{searchPlaceholder}</span>
          {searchKbd && <span className="cal-topbar-search-kbd">{searchKbd}</span>}
        </button>
        <Button
          variant="ghost"
          size="sm"
          style={{ width: 30, padding: 0 }}
          onClick={onNotificationsOpen}
          aria-label="Notifications"
        >
          <Bell size={15} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          style={{ width: 30, padding: 0 }}
          onClick={onSettingsOpen}
          aria-label="Settings"
        >
          <Settings size={15} />
        </Button>

        <SegmentedControl<V>
          items={views}
          value={view}
          onChange={onChangeView}
          variant="pill"
          aria-label="View"
        />

        <div className="cal-topbar-divider" />
        {avatar ?? <span className="cal-topbar-avatar">·</span>}
      </div>
    </header>
  );
}

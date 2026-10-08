import * as React from "react";
import {
  Clock,
  Flag,
  Lightbulb,
  PawPrint,
  Plane,
  Shapes,
  Smile,
  SmilePlus,
  Trophy,
  User,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import { useTranslation } from "../i18n/use-translation";
import { cn } from "../lib/utils";
import type { EmojiPickerProp } from "../props/components/data-entry.prop";
import { Popover, PopoverContent, PopoverTrigger } from "../components/data-display/popover";
import { Button } from "../components/general/button";
import { Text } from "../components/general/typography";
import { EMOJI_GROUPS, loadEmoji, searchEmoji, type EmojiEntry } from "./emoji-data";
import { SearchInput } from "../components/data-entry/search-input";

export type {
  EmojiPickerProp,
  EmojiPickerProp as EmojiPickerProps,
} from "../props/components/data-entry.prop";

const COLUMNS = 8;
/** The trigger shows the chosen emoji as a labelled button, or an icon button when empty. */
const ICON_SIZE = { xs: "icon-xs", sm: "icon-sm", md: "icon", lg: "icon-lg" } as const;
const RECENTS_LIMIT = 24;
/** One icon per category tab — chrome, so a kit glyph, not an emoji (the emoji are the content). */
const GROUP_ICON: Record<string, LucideIcon> = {
  smileys: Smile,
  people: User,
  animals: PawPrint,
  food: UtensilsCrossed,
  travel: Plane,
  activities: Trophy,
  objects: Lightbulb,
  symbols: Shapes,
  flags: Flag,
};

function readRecents(key: string): string[] {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((e): e is string => typeof e === "string") : [];
  } catch {
    return [];
  }
}

function writeRecents(key: string, list: string[]) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(list));
  } catch {
    // Private mode / storage blocked: recents just are not remembered.
  }
}

/**
 * EmojiPicker (gh#1164) — a page icon / reaction picker in a Popover: search by ja / en / vi
 * keywords (emojibase-data, the CLDR annotations, loaded for the active locale only when it first
 * opens), categories, per-user recents, and "remove icon". No skin tones.
 *
 * The emoji are a WAI-ARIA GRID: one tab stop, arrows move by cell / row, Home / End to the row
 * ends, Ctrl+Home / End to the first / last emoji, Enter or Space picks. ArrowDown from the search
 * field enters the grid.
 */
export function EmojiPicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  removable = true,
  recentsKey = "godxjp-ui:emoji-recents",
  size = "md",
  disabled = false,
  trigger,
  "aria-label": ariaLabel,
  id,
  className,
}: EmojiPickerProp) {
  const { t, locale } = useTranslation();
  const [inner, setInner] = React.useState<string | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : inner;
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
  const open = openProp ?? innerOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  const [entries, setEntries] = React.useState<EmojiEntry[] | null>(null);
  const [query, setQuery] = React.useState("");
  const [recents, setRecents] = React.useState<string[]>([]);
  const [tab, setTab] = React.useState<string>("smileys");
  const [active, setActive] = React.useState(0);
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const gridId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    setRecents(readRecents(recentsKey));
    setQuery("");
    let live = true;
    void loadEmoji(locale).then((loaded) => {
      if (live) setEntries(loaded);
    });
    return () => {
      live = false;
    };
  }, [open, locale, recentsKey]);

  React.useEffect(() => {
    if (open && recents.length > 0) setTab("recent");
  }, [open, recents.length]);

  const byUnicode = React.useMemo(
    () => new Map((entries ?? []).map((e) => [e.unicode, e])),
    [entries],
  );
  const shown: EmojiEntry[] = React.useMemo(() => {
    if (!entries) return [];
    if (query.trim()) return searchEmoji(entries, query);
    if (tab === "recent") {
      return recents.map(
        (u) => byUnicode.get(u) ?? { unicode: u, label: u, tags: [], group: -1, order: 0 },
      );
    }
    const group = EMOJI_GROUPS.find((g) => g.key === tab)?.group;
    return entries.filter((e) => e.group === group);
  }, [entries, query, tab, recents, byUnicode]);

  React.useEffect(() => setActive(0), [tab, query]);

  const pick = (unicode: string | null) => {
    if (valueProp === undefined) setInner(unicode);
    onValueChange?.(unicode);
    if (unicode) {
      const next = [unicode, ...readRecents(recentsKey).filter((u) => u !== unicode)].slice(
        0,
        RECENTS_LIMIT,
      );
      writeRecents(recentsKey, next);
    }
    setOpen(false);
  };

  const focusCell = (index: number) => {
    const clamped = Math.max(0, Math.min(shown.length - 1, index));
    setActive(clamped);
    // Focus NOW when the cell is rendered — a key pressed right after (ArrowDown, Enter) must land
    // on it; only a cell the next render adds waits a frame.
    const cell = () => gridRef.current?.querySelector<HTMLElement>(`[data-index="${clamped}"]`);
    const now = cell();
    if (now) now.focus();
    else requestAnimationFrame(() => cell()?.focus());
  };

  const onGridKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const row = Math.floor(active / COLUMNS);
    const moves: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      ArrowDown: active + COLUMNS,
      ArrowUp: active - COLUMNS,
      Home: event.ctrlKey ? 0 : row * COLUMNS,
      End: event.ctrlKey ? shown.length - 1 : row * COLUMNS + COLUMNS - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      focusCell(moves[event.key]!);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const entry = shown[active];
      if (entry) pick(entry.unicode);
    }
  };

  const rows: EmojiEntry[][] = [];
  for (let i = 0; i < shown.length; i += COLUMNS) rows.push(shown.slice(i, i + COLUMNS));
  const tabs = [
    ...(recents.length
      ? [{ key: "recent", label: t("dataEntry.emojiPicker.recent"), Icon: Clock }]
      : []),
    ...EMOJI_GROUPS.map((g) => ({
      key: g.key,
      label: t(`dataEntry.emojiPicker.categories.${g.key}`),
      Icon: GROUP_ICON[g.key]!,
    })),
  ];
  const gridLabel = query.trim()
    ? t("dataEntry.emojiPicker.search")
    : (tabs.find((x) => x.key === tab)?.label ?? t("dataEntry.emojiPicker.grid"));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button
            id={id}
            variant="ghost"
            size={value ? size : ICON_SIZE[size]}
            disabled={disabled}
            aria-label={ariaLabel ?? t("dataEntry.emojiPicker.trigger")}
            className={cn("ui-emoji-picker-trigger", className)}
            data-has-value={value ? "" : undefined}
          >
            {value ? <span aria-hidden="true">{value}</span> : <SmilePlus aria-hidden="true" />}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="ui-emoji-picker"
        aria-label={ariaLabel ?? t("dataEntry.emojiPicker.trigger")}
      >
        <div
          className="ui-emoji-picker-head"
          // ArrowDown from the search field enters the grid (the key bubbles up from the input).
          onKeyDown={(event) => {
            if (
              event.key === "ArrowDown" &&
              shown.length &&
              (event.target as HTMLElement).tagName === "INPUT"
            ) {
              event.preventDefault();
              focusCell(0);
            }
          }}
        >
          <SearchInput
            aria-label={t("dataEntry.emojiPicker.search")}
            placeholder={t("dataEntry.emojiPicker.search")}
            value={query}
            onValueChange={setQuery}
          />
          {removable && value ? (
            <Button size="sm" variant="ghost" onClick={() => pick(null)}>
              {t("dataEntry.emojiPicker.remove")}
            </Button>
          ) : null}
        </div>
        {!query.trim() ? (
          <div
            role="tablist"
            aria-label={t("dataEntry.emojiPicker.grid")}
            className="ui-emoji-picker-tabs"
          >
            {tabs.map((x) => (
              <Button
                key={x.key}
                role="tab"
                size="icon-sm"
                variant="ghost"
                aria-selected={tab === x.key}
                aria-controls={gridId}
                aria-label={x.label}
                title={x.label}
                data-state={tab === x.key ? "active" : undefined}
                onClick={() => setTab(x.key)}
              >
                <x.Icon aria-hidden="true" />
              </Button>
            ))}
          </div>
        ) : null}
        {entries === null ? (
          <Text size="sm" tone="muted" role="status" className="ui-emoji-picker-state">
            {t("dataEntry.emojiPicker.loading")}
          </Text>
        ) : shown.length === 0 ? (
          <Text size="sm" tone="muted" role="status" className="ui-emoji-picker-state">
            {t("dataEntry.emojiPicker.empty")}
          </Text>
        ) : (
          <div
            ref={gridRef}
            id={gridId}
            role="grid"
            aria-label={gridLabel}
            className="ui-emoji-picker-grid"
            onKeyDown={onGridKeyDown}
          >
            {rows.map((row, r) => (
              <div role="row" key={r} className="ui-emoji-picker-row">
                {row.map((entry, c) => {
                  const index = r * COLUMNS + c;
                  return (
                    <div
                      key={entry.unicode}
                      role="gridcell"
                      data-index={index}
                      tabIndex={index === active ? 0 : -1}
                      aria-label={entry.label}
                      aria-selected={entry.unicode === value}
                      title={entry.label}
                      className="ui-emoji-picker-cell ui-focus-ring"
                      onClick={() => pick(entry.unicode)}
                      onFocus={() => setActive(index)}
                    >
                      <span aria-hidden="true">{entry.unicode}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

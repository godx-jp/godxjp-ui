"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Button } from "../general/button";
import { Dialog, DialogContent } from "../feedback/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { isApplePlatform } from "../../lib/platform";
import { isImeComposing } from "../../lib/ime";

export type CommandPaletteItem = {
  id: string;
  label: React.ReactNode;
  /**
   * Decorative glyph before the label — a folder, a file, an emoji (gh#1159). Sized like a menu
   * row's icon (`--menu-icon-size`) and hidden from assistive tech: the label is the name.
   */
  icon?: React.ReactNode;
  searchValue?: string;
  meta?: React.ReactNode;
  disabled?: boolean;
};

export type CommandPaletteGroup = {
  id: string;
  label: React.ReactNode;
  items: CommandPaletteItem[];
};

export type CommandPaletteLabels = {
  open: string;
  title: string;
  description: string;
  placeholder: string;
  empty: React.ReactNode;
  loading?: React.ReactNode;
  move?: React.ReactNode;
  select?: React.ReactNode;
  close?: React.ReactNode;
};

/** The modifier keys held while an item was chosen (gh#1126). */
export type CommandPaletteSelectModifiers = {
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
};

export type CommandPaletteProps = {
  groups: CommandPaletteGroup[];
  labels: CommandPaletteLabels;
  /**
   * Fires with the chosen item and the modifier keys held while choosing it (gh#1126) — Enter or a
   * click with ⌘/Ctrl/Shift/Alt — so a host can "open in split" or "open in a new tab".
   */
  onSelect: (item: CommandPaletteItem, modifiers: CommandPaletteSelectModifiers) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Controlled search-box query. Pairs with `onSearchChange`; leave it out for the uncontrolled
   * palette (seeded by `defaultSearch`).
   */
  search?: string;
  /** Initial uncontrolled query, and the value the palette resets to when it closes. Default `""`. */
  defaultSearch?: string;
  /**
   * Fires on every keystroke with the current query — the seam a server-backed group needs to run
   * search-as-you-type. Also fires with `defaultSearch` when the palette closes.
   */
  onSearchChange?: (query: string) => void;
  /**
   * Whether the palette filters `groups` itself (cmdk's client-side fuzzy match). Set `false` when
   * the QUERY is answered by a server and `groups` already holds the matches — otherwise every row
   * is scored a second time against the same string and late-arriving matches are dropped.
   */
  shouldFilter?: boolean;
  loading?: boolean;
  error?: React.ReactNode;
  /**
   * The control that opens the palette.
   *
   * `undefined` (omitted) — the default outline Button with the ⌘K hint.
   * `null` — **NO trigger at all**, for a palette driven purely by `shortcut`.
   *
   * The two are deliberately NOT the same, and that is the whole point of gh#778: the previous
   * `trigger ?? <default/>` collapsed them, so `null` — the spelling every consumer reaches for —
   * silently rendered the very Button it was asked to remove. The only working spelling was
   * `trigger={<></>}`, which is a hack that renders an empty fragment into the trigger slot.
   *
   * A keyboard-only palette is a NORMAL shape: `shortcut` already binds ⌘K/Ctrl+K and handles
   * `event.isComposing` (i.e. every keystroke of a Japanese IME) and focus restore, so it is a
   * better handler than a consumer's own. A topbar with no width to spare should be able to say so.
   */
  trigger?: React.ReactNode;
  /**
   * The global shortcut that toggles the palette (gh#1126). `true` (default) is ⌘K / Ctrl+K;
   * `false` binds none; a combo string — `"mod+o"`, `"mod+p"`, `"mod+shift+p"` — binds that, so two
   * palettes (a quick switcher and a command palette) can live side by side. `mod` is ⌘ on Apple
   * and Ctrl elsewhere — never both, so Ctrl+O keeps its editing meaning on a Mac; `shift` and
   * `alt` must match exactly, so `mod+p` and
   * `mod+shift+p` are different shortcuts. Never fires during IME composition.
   */
  shortcut?: boolean | string;
};

type ShortcutSpec = {
  key: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  ctrl: boolean;
};

/** `"mod+shift+p"` → its parts. `true` is `mod+k`. */
function parseShortcut(shortcut: boolean | string): ShortcutSpec | null {
  if (shortcut === false) return null;
  const parts = (shortcut === true ? "mod+k" : shortcut)
    .toLowerCase()
    .split("+")
    .map((p) => p.trim());
  const key = parts.pop() ?? "";
  if (!key) return null;
  return {
    key,
    mod: parts.includes("mod"),
    meta: parts.includes("meta") || parts.includes("cmd"),
    ctrl: parts.includes("ctrl"),
    shift: parts.includes("shift"),
    alt: parts.includes("alt") || parts.includes("option"),
  };
}

function shortcutMatches(spec: ShortcutSpec, event: KeyboardEvent): boolean {
  // `event.code` too: with ⌥ held on a Mac, `event.key` is a symbol (⌥P is "π"), not the letter.
  const keyMatches =
    event.key.toLowerCase() === spec.key ||
    (/^[a-z]$/.test(spec.key) && event.code === `Key${spec.key.toUpperCase()}`);
  if (!keyMatches) return false;
  // `mod` is THE platform's command key (gh#1129): ⌘ on Apple, Ctrl elsewhere — never both. On a
  // Mac, Ctrl+O / Ctrl+P / Ctrl+K are text-editing keys in every input and must keep that meaning.
  if (spec.mod && !(isApplePlatform() ? event.metaKey : event.ctrlKey)) return false;
  if (spec.meta && !event.metaKey) return false;
  if (spec.ctrl && !event.ctrlKey) return false;
  return event.shiftKey === spec.shift && event.altKey === spec.alt;
}

/** The hint the default trigger shows: `mod+shift+p` → `⌘⇧P`. */
function shortcutHint(spec: ShortcutSpec): string {
  return [
    spec.meta || (spec.mod && isApplePlatform()) ? "⌘" : "",
    spec.ctrl || (spec.mod && !isApplePlatform()) ? "Ctrl+" : "",
    spec.alt ? "⌥" : "",
    spec.shift ? "⇧" : "",
    spec.key.length === 1 ? spec.key.toUpperCase() : spec.key,
  ].join("");
}

const modifiersOf = (
  event: React.KeyboardEvent | React.MouseEvent,
): CommandPaletteSelectModifiers => ({
  metaKey: event.metaKey,
  ctrlKey: event.ctrlKey,
  shiftKey: event.shiftKey,
  altKey: event.altKey,
});

const NO_MODIFIERS: CommandPaletteSelectModifiers = {
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
};

/**
 * Unchanged. - **`shouldFilter={false}` (server-side)** — the PALETTE owns it, derived
 * synchronously from props: the empty node renders when `groups` carries no items, and never while
 * `loading` or `error` is set. cmdk's own empty node cannot be trusted here, because it is driven
 * by a scheduled count of the items that have REGISTERED in the DOM, not by what the consumer
 * knows — so an async group that populates a frame late flips it on and off and any assertion over
 * it races. Reading `groups` instead makes "did we render the empty state?" a pure function of the
 * props at that render, which is what a contract test can assert.
 */
export function CommandPalette({
  groups,
  labels,
  onSelect,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  search: controlledSearch,
  defaultSearch = "",
  onSearchChange,
  shouldFilter = true,
  loading = false,
  error,
  trigger,
  shortcut = true,
}: CommandPaletteProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [uncontrolledSearch, setUncontrolledSearch] = React.useState(defaultSearch);
  const shortcutRestoreFocusRef = React.useRef<HTMLElement | null>(null);
  /** The modifier keys of the keystroke or click that chose an item (cmdk passes no event). */
  const modifiersRef = React.useRef<CommandPaletteSelectModifiers>(NO_MODIFIERS);
  const shortcutSpec = React.useMemo(() => parseShortcut(shortcut), [shortcut]);
  const open = controlledOpen ?? uncontrolledOpen;
  const search = controlledSearch ?? uncontrolledSearch;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );
  const setSearch = React.useCallback(
    (next: string) => {
      if (controlledSearch === undefined) {
        setUncontrolledSearch(next);
      }
      onSearchChange?.(next);
    },
    [controlledSearch, onSearchChange],
  );

  // The query never survives a close — reopening always starts from `defaultSearch`.
  // fall out of the dialog unmounting cmdk's internal state; now that the query is a prop the
  // palette has to say it, and say it OUT so a controlled consumer can drop the stale result set
  // it fetched for the abandoned query.
  const previousOpenRef = React.useRef(open);
  React.useEffect(() => {
    const wasOpen = previousOpenRef.current;
    previousOpenRef.current = open;
    if (!wasOpen || open || search === defaultSearch) return;
    setSearch(defaultSearch);
  }, [open, search, defaultSearch, setSearch]);

  React.useEffect(() => {
    if (!shortcutSpec) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isImeComposing(event) && shortcutMatches(shortcutSpec, event)) {
        event.preventDefault();
        if (!open && document.activeElement instanceof HTMLElement) {
          shortcutRestoreFocusRef.current = document.activeElement;
        }
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen, shortcutSpec]);

  const hasItems = React.useMemo(() => groups.some((group) => group.items.length > 0), [groups]);

  // gh#778 — `=== undefined`, NOT `??`. `??` falls back on `null` too, which is what made
  // `trigger={null}` render the default. An explicit `null` now reaches the JSX below and
  // removes the trigger slot entirely.
  const triggerNode =
    trigger === undefined ? (
      <Button variant="outline" size="sm" className="ui-command-palette-trigger">
        <Search aria-hidden="true" />
        <span>{labels.open}</span>
        {shortcutSpec ? (
          <span className="kbd" aria-hidden="true">
            {shortcutHint(shortcutSpec)}
          </span>
        ) : null}
      </Button>
    ) : (
      trigger
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* No `Dialog.Trigger` at all when `trigger` is null — an empty one would still occupy the
          slot, which is the `trigger={<></>}` workaround this replaces. Radix opens fine from the
          controlled `open` prop alone, which is how `shortcut` already drives it. */}
      {triggerNode === null ? null : <Dialog.Trigger asChild>{triggerNode}</Dialog.Trigger>}
      <DialogContent
        className="ui-command-palette"
        showCloseButton={false}
        aria-modal="true"
        aria-describedby="ui-command-palette-description"
        onCloseAutoFocus={(event) => {
          const restoreTarget = shortcutRestoreFocusRef.current;
          if (restoreTarget?.isConnected) {
            event.preventDefault();
            requestAnimationFrame(() => {
              if (restoreTarget.isConnected) {
                restoreTarget.focus({ preventScroll: true });
              }
            });
          }
          shortcutRestoreFocusRef.current = null;
        }}
      >
        <Dialog.Title className="sr-only">{labels.title}</Dialog.Title>
        <Dialog.Description id="ui-command-palette-description" className="sr-only">
          {labels.description}
        </Dialog.Description>
        <Command
          label={labels.title}
          shouldFilter={shouldFilter}
          // Record the modifiers BEFORE cmdk handles the Enter / click that selects (capture phase).
          onKeyDownCapture={(event) => {
            if (event.key === "Enter") modifiersRef.current = modifiersOf(event);
          }}
          onClickCapture={(event) => {
            modifiersRef.current = modifiersOf(event);
          }}
        >
          <CommandInput
            autoFocus
            value={search}
            onValueChange={setSearch}
            placeholder={labels.placeholder}
            aria-label={labels.placeholder}
          />
          <CommandList aria-busy={loading}>
            {loading ? (
              <div className="ui-command-palette-state" role="status">
                {labels.loading}
              </div>
            ) : error ? (
              <div className="ui-command-palette-state" role="alert">
                {error}
              </div>
            ) : (
              <>
                {shouldFilter ? (
                  <CommandEmpty>{labels.empty}</CommandEmpty>
                ) : hasItems ? null : (
                  // Same node cmdk would have rendered (class + role), decided from `groups`
                  // instead of from its scheduled DOM-registration count — see the doc block.
                  <div className="ui-command-empty" role="presentation">
                    {labels.empty}
                  </div>
                )}
                {groups.map((group) => (
                  <CommandGroup key={group.id} heading={group.label}>
                    {group.items.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.searchValue ?? `${item.id} ${String(item.label)}`}
                        disabled={item.disabled}
                        onSelect={() => {
                          const modifiers = modifiersRef.current;
                          modifiersRef.current = NO_MODIFIERS;
                          setOpen(false);
                          onSelect(item, modifiers);
                        }}
                      >
                        {item.icon != null ? (
                          <span className="ui-command-palette-icon" aria-hidden="true">
                            {item.icon}
                          </span>
                        ) : null}
                        <span className="ui-command-palette-label">{item.label}</span>
                        {item.meta != null ? (
                          <span className="ui-command-palette-meta">{item.meta}</span>
                        ) : null}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            )}
          </CommandList>
        </Command>
        {labels.move != null || labels.select != null || labels.close != null ? (
          <div className="ui-command-palette-hints" aria-hidden="true">
            {labels.move != null ? <span>↑↓ {labels.move}</span> : null}
            {labels.select != null ? <span>↵ {labels.select}</span> : null}
            {labels.close != null ? <span>esc {labels.close}</span> : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

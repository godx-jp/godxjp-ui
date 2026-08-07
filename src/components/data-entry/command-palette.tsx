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

export type CommandPaletteItem = {
  id: string;
  label: React.ReactNode;
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

export type CommandPaletteProps = {
  groups: CommandPaletteGroup[];
  labels: CommandPaletteLabels;
  onSelect: (item: CommandPaletteItem) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Controlled search-box query. Pairs with `onSearchChange`; leave it out for the uncontrolled
   * palette (seeded by `defaultSearch`). Same idiom as `SearchSelect`'s `search`.
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
   *
   * It also decides who owns the empty node; see the component doc block. Default `true`.
   */
  shouldFilter?: boolean;
  loading?: boolean;
  error?: React.ReactNode;
  trigger?: React.ReactNode;
  shortcut?: boolean;
};

/**
 * CommandPalette — the ⌘K search dialog.
 *
 * ## The empty-state contract (gh#412)
 *
 * `labels.empty` renders under exactly one rule, and which mechanism decides follows `shouldFilter`:
 *
 * - **`shouldFilter` (default, client-side)** — cmdk owns it: the palette holds items, the query
 *   matches none of them. Unchanged.
 * - **`shouldFilter={false}` (server-side)** — the PALETTE owns it, derived synchronously from
 *   props: the empty node renders when `groups` carries no items, and never while `loading` or
 *   `error` is set. cmdk's own empty node cannot be trusted here, because it is driven by a
 *   scheduled count of the items that have REGISTERED in the DOM, not by what the consumer knows —
 *   so an async group that populates a frame late flips it on and off and any assertion over it
 *   races. Reading `groups` instead makes "did we render the empty state?" a pure function of the
 *   props at that render, which is what a contract test can assert.
 *
 * The practical consequence for search-as-you-type: hold `loading` true for the whole in-flight
 * window. While it is true the palette shows `labels.loading` and never claims "no results" —
 * a request that has not answered yet is not an empty result.
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

  // The query never survives a close — reopening always starts from `defaultSearch`. That used to
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
    if (!shortcut) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !event.isComposing &&
        event.key.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        if (!open && document.activeElement instanceof HTMLElement) {
          shortcutRestoreFocusRef.current = document.activeElement;
        }
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen, shortcut]);

  const hasItems = React.useMemo(() => groups.some((group) => group.items.length > 0), [groups]);

  const triggerNode = trigger ?? (
    <Button variant="outline" size="sm" className="ui-command-palette-trigger">
      <Search aria-hidden="true" />
      <span>{labels.open}</span>
      <span className="kbd" aria-hidden="true">
        ⌘K
      </span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{triggerNode}</Dialog.Trigger>
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
        <Command label={labels.title} shouldFilter={shouldFilter}>
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
                          setOpen(false);
                          onSelect(item);
                        }}
                      >
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

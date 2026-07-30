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
  loading?: boolean;
  error?: React.ReactNode;
  trigger?: React.ReactNode;
  shortcut?: boolean;
};

export function CommandPalette({
  groups,
  labels,
  onSelect,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  loading = false,
  error,
  trigger,
  shortcut = true,
}: CommandPaletteProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const shortcutRestoreFocusRef = React.useRef<HTMLElement | null>(null);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

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

  const triggerNode =
    trigger ?? (
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
        <Command label={labels.title}>
          <CommandInput autoFocus placeholder={labels.placeholder} aria-label={labels.placeholder} />
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
                <CommandEmpty>{labels.empty}</CommandEmpty>
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

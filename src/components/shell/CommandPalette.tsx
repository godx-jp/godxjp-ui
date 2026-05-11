import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Command } from "cmdk";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

// CommandPalette — ⌘K shortcut. Opens a centered dialog with a cmdk
// list of commands. Caller supplies the command set + handlers; this
// component provides the chrome (overlay, dialog, input, list).
//
// Per MUST RULE #11 (shell layout), every GoDX service uses this exact
// palette — services do not roll their own ⌘K dialogs.

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  hint?: string;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: CommandItem[];
}

export function CommandPalette({ open, onOpenChange, commands }: CommandPaletteProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isModifier = e.metaKey || e.ctrlKey;
      if (isModifier && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      } else if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  // Group commands for display.
  const groups = new Map<string, CommandItem[]>();
  for (const cmd of commands) {
    const key = cmd.group ?? "";
    const arr = groups.get(key) ?? [];
    arr.push(cmd);
    groups.set(key, arr);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-[20%] z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-border bg-popover text-popover-foreground shadow-2xl outline-none"
          aria-describedby={undefined}
        >
          <VisuallyHidden.Root>
            <Dialog.Title>{t("common.search")}</Dialog.Title>
          </VisuallyHidden.Root>
          <Command label="Command palette" className="flex flex-col">
            <Command.Input
              ref={inputRef}
              autoFocus
              placeholder={`${t("common.search")}…`}
              className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Command.List className="max-h-80 overflow-y-auto p-1">
              <Command.Empty className="px-3 py-6 text-center text-xs text-muted-foreground">
                —
              </Command.Empty>
              {[...groups.entries()].map(([groupLabel, items]) => (
                <Command.Group
                  key={groupLabel || "default"}
                  heading={
                    groupLabel ? (
                      <span className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {groupLabel}
                      </span>
                    ) : undefined
                  }
                >
                  {items.map((cmd) => (
                    <Command.Item
                      key={cmd.id}
                      value={cmd.label}
                      onSelect={() => {
                        cmd.onSelect();
                        onOpenChange(false);
                      }}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer data-[selected=true]:bg-accent"
                    >
                      <span className="flex-1">{cmd.label}</span>
                      {cmd.hint && (
                        <span className="text-[10px] text-muted-foreground">
                          {cmd.hint}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
            <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground flex items-center gap-3">
              <span>
                <kbd className="kbd">↑↓</kbd> navigate
              </span>
              <span>
                <kbd className="kbd">⏎</kbd> select
              </span>
              <span className="ml-auto">
                <kbd className="kbd">esc</kbd> close
              </span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

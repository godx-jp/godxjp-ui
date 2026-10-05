import * as React from "react";
import { Popover, PopoverAnchor, PopoverContent } from "@godxjp/ui/data-display";
import { Command, CommandEmpty, CommandItem, CommandList } from "@godxjp/ui/data-entry";
import { VisuallyHidden } from "@godxjp/ui/general";

export type SuggestionMenuItem = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
};

/**
 * The list a `/` or `[[` opens at the caret — ChatSuggestion's composition (gh#1127): the kit
 * Popover anchored at the caret, focus LEFT in the editor (the user is mid-sentence), and a kit
 * Command list driven from the editor's keystrokes. The editable keeps its `textbox` role and
 * carries `aria-haspopup` / `aria-controls` / `aria-activedescendant`; a polite status says how
 * many rows match, since a textbox may not carry `aria-expanded`.
 */
export function SuggestionMenu({
  open,
  rect,
  host,
  items,
  active,
  onActiveChange,
  onPick,
  onDismiss,
  label,
  empty,
  countLabel,
  editable,
}: {
  open: boolean;
  /** The caret's client rect, from the suggestion plugin. */
  rect: DOMRect | null;
  /** The positioned wrapper the anchor is placed in. */
  host: HTMLElement | null;
  items: SuggestionMenuItem[];
  active: string | undefined;
  onActiveChange: (value: string) => void;
  onPick: (value: string) => void;
  onDismiss: () => void;
  label: string;
  empty: string;
  countLabel: string;
  editable: HTMLElement | null;
}) {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const box = host?.getBoundingClientRect();
  const anchorStyle: React.CSSProperties =
    rect && box
      ? {
          position: "absolute",
          insetInlineStart: rect.left - box.left,
          insetBlockStart: rect.top - box.top,
          blockSize: rect.height,
          inlineSize: 1,
          pointerEvents: "none",
        }
      : { position: "absolute", inlineSize: 0, blockSize: 0 };

  // Wire the popup contract onto the editable while the list is up; remove it when it is not, so
  // no attribute points at an unmounted list.
  React.useEffect(() => {
    if (!editable) return;
    const list = contentRef.current?.querySelector("[cmdk-list]")?.id;
    const option = contentRef.current?.querySelector('[cmdk-item][aria-selected="true"]')?.id;
    editable.setAttribute("aria-haspopup", "listbox");
    editable.setAttribute("aria-autocomplete", "list");
    if (open && list) editable.setAttribute("aria-controls", list);
    else editable.removeAttribute("aria-controls");
    if (open && option) editable.setAttribute("aria-activedescendant", option);
    else editable.removeAttribute("aria-activedescendant");
  });

  return (
    <Popover open={open} onOpenChange={(next) => (next ? undefined : onDismiss())}>
      <PopoverAnchor style={anchorStyle} aria-hidden="true" />
      <VisuallyHidden role="status" aria-live="polite">
        {open ? countLabel : ""}
      </VisuallyHidden>
      <PopoverContent
        ref={contentRef}
        flush
        align="start"
        aria-label={label}
        className="ui-block-editor-menu"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <Command
          value={active ?? ""}
          onValueChange={onActiveChange}
          shouldFilter={false}
          label={label}
        >
          <CommandList label={label}>
            <CommandEmpty>{empty}</CommandEmpty>
            {items.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                // A row is picked with the pointer here; the keyboard path goes through the editor.
                onMouseDown={(event) => event.preventDefault()}
                onSelect={() => onPick(item.value)}
              >
                {item.icon ? (
                  <span className="ui-block-editor-menu-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                ) : null}
                <span className="ui-block-editor-menu-text">
                  <span>{item.label}</span>
                  {item.description ? (
                    <span className="ui-block-editor-menu-description">{item.description}</span>
                  ) : null}
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

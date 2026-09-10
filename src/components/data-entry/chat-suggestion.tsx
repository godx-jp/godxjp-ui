import * as React from "react";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { VisuallyHidden } from "../general/visually-hidden";
import { Popover, PopoverAnchor, PopoverContent } from "../data-display/popover";
import { Command, CommandEmpty, CommandItem, CommandList } from "./command";

import type {
  ChatSuggestionItemProp,
  ChatSuggestionProp,
} from "../../props/components/data-entry.prop";

export type {
  ChatSuggestionProp,
  ChatSuggestionProp as ChatSuggestionProps,
  ChatSuggestionItemProp,
  ChatSuggestionRenderProp,
} from "../../props/components/data-entry.prop";

/** The trigger token under the caret, or `null` when the caret is not inside one. */
type TriggerMatch = { query: string };

/**
 * Read the trigger token that ENDS at the caret.
 *
 * The scan runs backwards from the caret and stops at the first whitespace, which is what makes
 * the three closing conditions fall out of one rule instead of three flags: typing a space ends
 * the token (word break), moving the caret out of the token ends it, and deleting back past the
 * trigger character ends it. The character before the trigger must itself be a boundary, so a
 * URL's `https://x` never opens a slash-command list.
 */
function matchTrigger(text: string, caret: number, trigger: string): TriggerMatch | null {
  if (!trigger) return null;
  const before = text.slice(0, caret);
  const start = before.lastIndexOf(trigger);
  if (start === -1) return null;
  const query = before.slice(start + trigger.length);
  if (/\s/.test(query)) return null;
  const preceding = start === 0 ? "" : before[start - 1];
  if (preceding !== "" && !/\s/.test(preceding)) return null;
  return { query };
}

/** Flatten one level of `children`, honouring the level the user has drilled into. */
function levelItems(
  items: readonly ChatSuggestionItemProp[],
  path: string[],
): readonly ChatSuggestionItemProp[] {
  let current = items;
  for (const step of path) {
    const next = current.find((item) => item.value === step)?.children;
    if (!next) return current;
    current = next;
  }
  return current;
}

function labelOf(item: ChatSuggestionItemProp): string {
  return item.label ?? item.value;
}

function matches(item: ChatSuggestionItemProp, query: string): boolean {
  if (!query) return true;
  const needle = query.toLocaleLowerCase();
  return (
    labelOf(item).toLocaleLowerCase().includes(needle) ||
    item.value.toLocaleLowerCase().includes(needle) ||
    (item.description?.toLocaleLowerCase().includes(needle) ?? false)
  );
}

/**
 * ChatSuggestion — trigger-character autocomplete over a `ChatComposer` (Ant Design X
 * `Suggestion`).
 *
 * ## What it owns, and what it deliberately does not
 *
 * The list is the existing `Command` (cmdk) inside a `Popover`: the listbox/option roles, the
 * active-row bookkeeping and the scroll-into-view all come from a primitive that already ships
 * them, so there is no hand-rolled listbox here. What this component owns is the part `Command`
 * cannot know about — a `<textarea>` it does not render:
 *
 * - **Detecting the trigger at the CARET**, not merely anywhere in the text, so a `/` in the
 *   middle of a URL opens nothing and a caret moved out of a token closes the list.
 * - **Driving the list from a box that keeps focus.** Focus never leaves the textarea (the popover
 *   is opened with `onOpenAutoFocus` prevented), so arrows/Enter are forwarded through the render
 *   prop and the active row is announced through `aria-activedescendant` — the APG combobox
 *   pattern, rather than moving focus into the panel and stranding the draft.
 * - **`Escape` costs nothing.** It closes the list, returns focus to the textarea and leaves the
 *   typed text exactly as it was; a suggestion list that eats the draft on dismiss is the defect
 *   this guards.
 */
export function ChatSuggestion({
  items,
  onValueChange,
  triggerCharacter = "/",
  open,
  defaultOpen,
  onOpenChange,
  children,
  emptyMessage,
  listLabel: listLabelProp,
  id,
  className,
}: ChatSuggestionProp) {
  const { t } = useTranslation();

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const isOpen = open ?? uncontrolledOpen;
  const [query, setQuery] = React.useState("");
  const [path, setPath] = React.useState<string[]>([]);
  const [activeValue, setActiveValue] = React.useState("");
  const [activeId, setActiveId] = React.useState<string | undefined>(undefined);

  const anchorRef = React.useRef<HTMLSpanElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  /*
   * cmdk OWNS the listbox id: `CommandList` writes its own `id` after the prop spread, so one
   * passed in is discarded. `aria-controls` on the textarea has to name the element that actually
   * exists, so the id is read back off the mounted panel rather than invented here.
   */
  const [listId, setListId] = React.useState<string | undefined>(undefined);

  /** The composer's draft box. Found through the anchor, so the wiring order at the call site
   * cannot change whether the caret is readable. */
  const field = React.useCallback(() => anchorRef.current?.querySelector("textarea") ?? null, []);

  /*
   * The LIVE open state, readable from a callback that was created one render ago.
   *
   * Every caret read here is deferred by a task (the caret has not moved yet when the keydown
   * fires), so by the time it runs the closure it came from can be stale — and it was: a click
   * into the draft box closes the panel through the popover's own outside-click handler, the
   * queued read then still believed the panel was open, skipped its own `setOpen`, and a list
   * whose word break had already ended stayed on screen. Reading the ref instead of the captured
   * `isOpen` is what makes the deferred reads idempotent AND correct.
   */
  const openRef = React.useRef(isOpen);
  openRef.current = isOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openRef.current === next) return;
      openRef.current = next;
      if (open === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
      if (!next) {
        setQuery("");
        setPath([]);
      }
    },
    [open, onOpenChange],
  );

  const visible = React.useMemo(() => {
    return levelItems(items, path).filter((item) => matches(item, query));
  }, [items, path, query]);

  // The active row always exists: after a keystroke narrows the list the previously active value
  // may be gone, and a list whose Enter does nothing is worse than one with no highlight at all.
  const enabled = React.useMemo(() => visible.filter((item) => !item.disabled), [visible]);
  React.useEffect(() => {
    if (enabled.length === 0) {
      setActiveValue("");
      return;
    }
    setActiveValue((current) =>
      enabled.some((item) => item.value === current) ? current : enabled[0].value,
    );
  }, [enabled]);

  /*
   * Both ids are READ BACK OFF THE PANEL rather than generated here, and both for the same
   * reason: cmdk owns them. `CommandList` writes its own `id` after the prop spread, and
   * `CommandItem` does the same — a supplied id is discarded — so `aria-controls` and
   * `aria-activedescendant` would otherwise name elements that do not exist. cmdk's own
   * `selectedItemId` is not usable either: it is only recomputed when cmdk's INTERNAL navigation
   * moves the value, and the active row here is driven from the `value` prop, which takes the
   * branch that skips that bookkeeping.
   *
   * NO DEPENDENCY LIST, and measured that way. cmdk repaints `aria-selected` from its own store
   * when its `value` prop changes, one commit LATER than the render that changed it — keying this
   * effect on `[isOpen, activeValue, visible]` reads the DOM before that repaint and leaves
   * `aria-activedescendant` empty (its test failed exactly so). Running on every render costs two
   * `querySelector` calls and always converges: both writes settle on the same value, so React
   * bails out instead of looping.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps -- see the note above; deps make it stale
  React.useEffect(() => {
    if (!isOpen) {
      setListId(undefined);
      setActiveId(undefined);
      return;
    }
    const content = contentRef.current;
    setListId(content?.querySelector("[cmdk-list]")?.id || undefined);
    setActiveId(content?.querySelector('[cmdk-item][aria-selected="true"]')?.id || undefined);
  });

  const close = React.useCallback(() => {
    setOpen(false);
    // Escape must never cost the draft: the text is untouched and the caret goes back where it was.
    field()?.focus();
  }, [field, setOpen]);

  /** Re-read the caret and decide whether the list belongs open. */
  const evaluate = React.useCallback(() => {
    const node = field();
    if (!node) return;
    const caret = node.selectionStart ?? node.value.length;
    const hit = matchTrigger(node.value, caret, triggerCharacter);
    if (!hit) {
      setOpen(false);
      return;
    }
    setQuery(hit.query);
    setOpen(true);
  }, [field, setOpen, triggerCharacter]);

  const onTrigger = React.useCallback(
    (next?: string | false) => {
      if (next === false) {
        setOpen(false);
        return;
      }
      if (next === undefined) {
        setQuery("");
        setOpen(true);
        return;
      }
      // The caret has not settled until the browser has applied the keystroke that moved it, so
      // the read is deferred by one task rather than done inline.
      window.setTimeout(evaluate, 0);
    },
    [evaluate, setOpen],
  );

  const pick = React.useCallback(
    (item: ChatSuggestionItemProp) => {
      if (item.disabled) return;
      if (item.children && item.children.length > 0) {
        // A parent DRILLS instead of emitting — one level, per the spec — and the query resets so
        // the sub-list starts whole.
        setPath((current) => [...current, item.value]);
        setQuery("");
        field()?.focus();
        return;
      }
      onValueChange?.(item.value);
      setOpen(false);
      field()?.focus();
    },
    [field, onValueChange, setOpen],
  );

  const move = React.useCallback(
    (direction: 1 | -1) => {
      if (enabled.length === 0) return;
      const index = enabled.findIndex((item) => item.value === activeValue);
      const from = index === -1 ? (direction === 1 ? -1 : 0) : index;
      const next = (from + direction + enabled.length) % enabled.length;
      setActiveValue(enabled[next].value);
    },
    [activeValue, enabled],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!openRef.current) {
        // A caret that moves without changing the text still changes the query.
        if (event.key.startsWith("Arrow") || event.key === "Home" || event.key === "End") {
          window.setTimeout(evaluate, 0);
        }
        return;
      }
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          move(1);
          return;
        case "ArrowUp":
          event.preventDefault();
          move(-1);
          return;
        case "Enter":
        case "Tab": {
          const item = enabled.find((candidate) => candidate.value === activeValue);
          if (!item) return;
          // `preventDefault` is also what tells ChatComposer this Enter was ours: it checks
          // `defaultPrevented` before treating the key as a send.
          event.preventDefault();
          pick(item);
          return;
        }
        case "Escape":
          event.preventDefault();
          // The composer sits inside overlays of its own in real screens; a dismissed suggestion
          // list must not also close the dialog around it.
          event.stopPropagation();
          close();
          return;
        default:
          // Left/Right/Home/End move the caret out of (or back into) the trigger token.
          if (event.key.startsWith("Arrow") || event.key === "Home" || event.key === "End") {
            window.setTimeout(evaluate, 0);
          }
      }
    },
    [activeValue, close, enabled, evaluate, move, pick],
  );

  const listLabel = listLabelProp ?? t("dataEntry.chatSuggestion.label");

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverAnchor
        ref={anchorRef}
        id={id}
        data-slot="chat-suggestion"
        className={cn("block w-full", className)}
        // A caret moved by the POINTER fires no key event, so the token under it is re-read here
        // too — otherwise clicking away from `/hel` left a stale list open over the draft.
        onPointerUp={() => window.setTimeout(evaluate, 0)}
        onBlurCapture={(event: React.FocusEvent<HTMLSpanElement>) => {
          const next = event.relatedTarget as Node | null;
          if (next && anchorRef.current?.contains(next)) return;
          if (openRef.current) setOpen(false);
        }}
      >
        {children({
          onTrigger,
          onKeyDown,
        })}
        {/* The combobox wiring lives on the draft box itself — it is the element the user types
            into and the one a screen reader is parked on. Written imperatively because the
            textarea belongs to the composer this component WRAPS, not to this component. */}
        <FieldPopupWiring field={field} open={isOpen} listId={listId} activeId={activeId} />
        {/* `aria-expanded` is what would normally say "the list is showing", and a `<textarea>`
            may not carry it (see FieldPopupWiring). A polite status says the same thing in words,
            counted with Intl.PluralRules — and, unlike the attribute, it also reports how the
            list narrowed as the user keeps typing. */}
        <VisuallyHidden role="status" aria-live="polite">
          {isOpen ? t("dataEntry.chatSuggestion.count", { count: visible.length }) : ""}
        </VisuallyHidden>
      </PopoverAnchor>
      <PopoverContent
        ref={contentRef}
        flush
        align="start"
        aria-label={listLabel}
        className="ui-chat-suggestion-panel"
        // Focus STAYS in the draft box: the user is mid-sentence, and a panel that steals focus
        // turns every suggestion into a round trip. The list is driven through the render prop.
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <Command
          value={activeValue}
          onValueChange={setActiveValue}
          // The query is read off the textarea, not typed into a `CommandInput` — cmdk must not
          // also filter, or an empty internal search would hide every row.
          shouldFilter={false}
          label={listLabel}
        >
          <CommandList label={listLabel}>
            <CommandEmpty>{emptyMessage ?? t("dataEntry.chatSuggestion.empty")}</CommandEmpty>
            {visible.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                onSelect={() => pick(item)}
              >
                {item.icon ? (
                  <span className="flex shrink-0 items-center" aria-hidden="true">
                    {item.icon}
                  </span>
                ) : null}
                <span className="ui-chat-suggestion-item-text">
                  <span className="truncate">{labelOf(item)}</span>
                  {item.description ? (
                    <span className="text-muted-foreground truncate text-xs">
                      {item.description}
                    </span>
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
ChatSuggestion.displayName = "ChatSuggestion";

/**
 * Put the popup contract on the composer's `<textarea>`.
 *
 * The textarea is rendered by the composer, not by this file, so the attributes are set on the
 * live node instead of passed as props: reaching in through `cloneElement` would break the moment
 * a consumer wrapped the composer in anything at all, and duplicating these props onto
 * `ChatComposer` would make every composer that has no suggestion list claim a popup it does not
 * have.
 *
 * ## Why this is not literally `role="combobox"`
 *
 * ARIA in HTML allows `combobox` on `<input type="text">` and NOT on `<textarea>`, and `textbox`
 * does not support `aria-expanded` either — axe reports both (`aria-allowed-role`,
 * `aria-allowed-attr`), and this library ships zero violations. So the textarea keeps its native
 * `textbox` role and carries the three properties `textbox` genuinely supports —
 * `aria-haspopup="listbox"`, `aria-autocomplete="list"` and `aria-activedescendant` — while the
 * open/closed state and the result count are announced by a polite status region instead. Same
 * information, no invalid ARIA.
 */
function FieldPopupWiring({
  field,
  open,
  listId,
  activeId,
}: {
  field: () => HTMLTextAreaElement | null;
  open: boolean;
  listId: string | undefined;
  activeId: string | undefined;
}) {
  React.useEffect(() => {
    const node = field();
    if (!node) return;
    node.setAttribute("aria-haspopup", "listbox");
    node.setAttribute("aria-autocomplete", "list");
    if (open && listId) {
      node.setAttribute("aria-controls", listId);
      if (activeId) node.setAttribute("aria-activedescendant", activeId);
      else node.removeAttribute("aria-activedescendant");
    } else {
      // Both point at a panel that is UNMOUNTED while closed; leaving them behind is a dangling
      // id reference, which axe reports and a screen reader reads as a broken relationship.
      node.removeAttribute("aria-controls");
      node.removeAttribute("aria-activedescendant");
    }
  }, [activeId, field, listId, open]);

  return null;
}

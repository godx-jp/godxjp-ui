import { isImeComposing } from "./ime";
import { isApplePlatform } from "./platform";

/**
 * A global keyboard shortcut, parsed from a combo string. Shared by `CommandPalette` (toggles the
 * dialog), `SearchInput` (focuses the field) and `DropdownMenu` (opens the menu) so all three read
 * `"mod+k"` the same way (gh#1250).
 */
export type ShortcutSpec = {
  key: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  ctrl: boolean;
};

/** `"mod+shift+p"` → its parts. `true` is `mod+k`. */
export function parseShortcut(shortcut: boolean | string): ShortcutSpec | null {
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

export function shortcutMatches(spec: ShortcutSpec, event: KeyboardEvent): boolean {
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

/** The hint a trigger shows: `mod+shift+p` → `⌘⇧P`. */
export function shortcutHint(spec: ShortcutSpec): string {
  return [
    spec.meta || (spec.mod && isApplePlatform()) ? "⌘" : "",
    spec.ctrl || (spec.mod && !isApplePlatform()) ? "Ctrl+" : "",
    spec.alt ? "⌥" : "",
    spec.shift ? "⇧" : "",
    spec.key.length === 1 ? spec.key.toUpperCase() : spec.key,
  ].join("");
}

/**
 * Is focus somewhere the user is TYPING — an input, a textarea, a select, a contenteditable or an
 * ARIA textbox/combobox? A bare key is text there: `"/"` typed into a dialog field is a slash,
 * not "focus the search box" (gh#1264, measured: typing `a/b` lost the `/`).
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement) {
    return ![
      "button",
      "checkbox",
      "radio",
      "range",
      "reset",
      "submit",
      "color",
      "file",
      "image",
    ].includes(target.type);
  }
  const role = target.getAttribute("role");
  return role === "textbox" || role === "combobox" || role === "searchbox";
}

/**
 * Should this keydown run the shortcut? The ONE gate every global shortcut goes through:
 *  - never during IME composition (the key belongs to the conversion, gh#1054);
 *  - the combo must match;
 *  - a shortcut with NO command modifier (`"/"`, `"f"`, `"shift+?"`) is ignored while focus is in
 *    an editable element, where that key is text. A modified one (`"mod+k"`) still fires there —
 *    no text field types ⌘K — which is how GitHub's and Linear's palettes behave.
 */
export function shouldHandleShortcut(spec: ShortcutSpec, event: KeyboardEvent): boolean {
  if (isImeComposing(event) || !shortcutMatches(spec, event)) return false;
  const commandModifier = spec.mod || spec.meta || spec.ctrl || spec.alt;
  return commandModifier || !isEditableTarget(event.target);
}

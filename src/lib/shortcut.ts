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
 *  - never from inside a dialog/menu/listbox that does not contain `owner` (gh#1267);
 *  - the combo must match;
 *  - a shortcut with NO command modifier (`"/"`, `"f"`, `"shift+?"`) is ignored while focus is in
 *    an editable element, where that key is text. A modified one (`"mod+k"`) still fires there —
 *    no text field types ⌘K — which is how GitHub's and Linear's palettes behave.
 */
export function shouldHandleShortcut(
  spec: ShortcutSpec,
  event: KeyboardEvent,
  owner?: Element | null,
): boolean {
  if (isImeComposing(event) || !shortcutMatches(spec, event)) return false;
  // The REAL target: on a `document` listener a key typed inside a shadow root arrives retargeted
  // to the shadow host, which is neither editable nor inside a layer (gh#1340).
  const target = event.composedPath()[0] ?? event.target;
  if (inForeignLayer(target, owner)) return false;
  const commandModifier = spec.mod || spec.meta || spec.ctrl || spec.alt;
  return commandModifier || !isEditableTarget(target);
}

/** The layers a page-level shortcut must not reach through (gh#1267). */
const SHORTCUT_LAYER =
  '[role="dialog"], [role="alertdialog"], [aria-modal="true"], [role="menu"], [role="listbox"]';

/**
 * Is focus inside a dialog, menu or listbox that does NOT contain the shortcut's owner? A page
 * shortcut fired from there opens something BEHIND the layer and pulls focus out of it — measured:
 * `f` pressed on a button inside a Dialog opened a page `DropdownMenu shortcut="f"` over the dialog
 * (gh#1267). A shortcut whose owner lives inside that same layer (a SearchInput in the dialog)
 * still works.
 */
function inForeignLayer(target: EventTarget | null, owner?: Element | null): boolean {
  if (!(target instanceof Element)) return false;
  const layer = target.closest(SHORTCUT_LAYER);
  return layer !== null && !(owner && layer.contains(owner));
}

/**
 * The `aria-keyshortcuts` value for a spec (WAI-ARIA 1.2: modifiers then key, `+`-joined, with
 * `Control`/`Meta`/`Alt`/`Shift` spelled out and a letter upper-cased): `mod+k` → `Meta+K` on
 * Apple platforms, `Control+K` elsewhere; `"/"` → `/` (gh#1267).
 */
export function ariaKeyShortcuts(spec: ShortcutSpec): string {
  return [
    spec.ctrl || (spec.mod && !isApplePlatform()) ? "Control" : "",
    spec.meta || (spec.mod && isApplePlatform()) ? "Meta" : "",
    spec.alt ? "Alt" : "",
    spec.shift ? "Shift" : "",
    spec.key.length === 1 ? spec.key.toUpperCase() : spec.key,
  ]
    .filter(Boolean)
    .join("+");
}

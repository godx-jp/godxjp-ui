import { isApplePlatform } from "./platform";

/**
 * A global keyboard shortcut, parsed from a combo string. Shared by `CommandPalette` (toggles the
 * dialog) and `SearchInput` (focuses the field) so both read `"mod+k"` the same way (gh#1250).
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

import {
  useLocale,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@godxjp/ui";
import { GlobeIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type { LocaleCode } from "@godxjp/ui";

// ─── Flag helpers ────────────────────────────────────────────────────────────

/** Common locale code → flag emoji map. */
const LOCALE_TO_FLAG: Record<string, string> = {
  en: "🇺🇸",
  vi: "🇻🇳",
  ja: "🇯🇵",
  ko: "🇰🇷",
  zh: "🇨🇳",
  fr: "🇫🇷",
  de: "🇩🇪",
  es: "🇪🇸",
  pt: "🇧🇷",
  it: "🇮🇹",
  ru: "🇷🇺",
  ar: "🇸🇦",
  th: "🇹🇭",
  id: "🇮🇩",
  ms: "🇲🇾",
};

/**
 * Derive flag emoji from a locale code.
 * 1. Check the built-in map using the base language (before `-`).
 * 2. If a region subtag exists (e.g. `en-US`), convert to regional indicator symbols.
 * 3. Fall back to globe emoji.
 */
function deriveFlag(code: LocaleCode, customFlags?: Record<string, string>): string {
  if (customFlags?.[code]) return customFlags[code];

  const base = code.split("-")[0].toLowerCase();
  if (LOCALE_TO_FLAG[base]) return LOCALE_TO_FLAG[base];

  // Try region subtag → flag emoji (e.g. "US" → 🇺🇸)
  const parts = code.split("-");
  if (parts.length > 1) {
    const region = parts[parts.length - 1].toUpperCase();
    if (region.length === 2) {
      return String.fromCodePoint(...Array.from(region).map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
    }
  }

  return "🌐";
}

// ─── Component ───────────────────────────────────────────────────────────────

export interface LocaleSwitcherProps {
  /** Show flag emoji. Default: false */
  showFlag?: boolean;
  /** Show locale label (e.g. "English"). Default: true */
  showLabel?: boolean;
  /** Show locale code (e.g. "EN"). Default: false */
  showCode?: boolean;
  /** Dropdown alignment. Default: "end" */
  align?: "start" | "center" | "end";
  /** Custom flag map. Auto-derived from locale code if not provided. */
  flags?: Record<string, string>;
  /** Button variant. Default: "ghost" */
  variant?: "ghost" | "outline" | "default";
  /** Button size. Default: inferred (icon when no label/code, default otherwise) */
  size?: "default" | "sm" | "icon";
  /** Additional class names for the trigger button. */
  className?: string;
}

/**
 * Dropdown locale switcher that reads from UIProvider.
 *
 * Requires `<UIProvider locales={...}>` to be an ancestor.
 *
 * @example
 * ```tsx
 * <LocaleSwitcher />
 * <LocaleSwitcher showFlag showLabel={false} />
 * <LocaleSwitcher showCode variant="outline" />
 * ```
 */
export function LocaleSwitcher({
  showFlag = false,
  showLabel = true,
  showCode = false,
  align = "end",
  flags,
  variant = "ghost",
  size,
  className,
}: LocaleSwitcherProps) {
  const { currentLocale, setLocale, locales } = useLocale();

  const entries = Object.entries(locales);
  if (entries.length === 0) return null;

  const currentLabel = locales[currentLocale] ?? currentLocale;
  const hasText = showLabel || showCode;
  const resolvedSize = size ?? (hasText ? "default" : "icon");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={resolvedSize} className={cn("gap-2", className)}>
          {showFlag ? (
            <span className="text-base leading-none">{deriveFlag(currentLocale, flags)}</span>
          ) : (
            <GlobeIcon className="size-4" />
          )}
          {showLabel && <span>{currentLabel}</span>}
          {showCode && !showLabel && <span>{currentLocale.split("-")[0].toUpperCase()}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuRadioGroup value={currentLocale} onValueChange={setLocale}>
          {entries.map(([code, label]) => (
            <DropdownMenuRadioItem key={code} value={code}>
              {showFlag && (
                <span className="mr-2 text-base leading-none">{deriveFlag(code, flags)}</span>
              )}
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

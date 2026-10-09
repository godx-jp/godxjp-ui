import * as React from "react";

/**
 * An app PRESET (v32, gh#1220): the product-specific defaults a host opts into, so the library's
 * own defaults can stay neutral. Core never imports a preset; a host passes one to
 * `<AppProvider preset={…}>`, and the GoDX look ships as `godxPreset` from
 * `@godxjp/ui/themes/godx` together with `@godxjp/ui/themes/godx.css`.
 *
 * Every field is optional and only fills what the host left unset: an explicit `AppProvider` prop
 * always wins over the preset.
 */
export interface AppPreset {
  /** Stable name, written to `<html data-preset>` so a preset stylesheet can scope itself. */
  name: string;
  /** BCP-47 tag used when the host gives no `defaultLocale` (and `<html lang>` has none registered). */
  defaultLocale?: string;
  /** IANA zone used when the host gives no `timeZone`. */
  timeZone?: string;
  /** The brand mark `AuthIdentity` (and other identity surfaces) render when given no `brand`. */
  brandMark?: React.ReactNode;
  /** Label for the email brand mark when the caller passes none. */
  emailBrandLabel?: string;
}

export const AppPresetContext = React.createContext<AppPreset | undefined>(undefined);

/** The active preset, or `undefined` when the host chose none (the neutral default). */
export function useAppPreset(): AppPreset | undefined {
  return React.useContext(AppPresetContext);
}

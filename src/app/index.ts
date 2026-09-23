export * from "./types";
export * from "./locales";
export * from "./timezones";
export * from "./time-formats";
export * from "./date-formats";
export * from "./time-format-labels";
export * from "./date-format-labels";
export * from "./storage";
export * from "./theme-axes";
export * from "./tenant-theme";
export * from "./request-headers";
export {
  AppProvider,
  useAppContext,
  useOptionalAppContext,
  useAppLocale,
  useAppTimezone,
  useAppTimeFormat,
  useAppDateFormat,
} from "./app-provider";
export { useFormatting, useDateTime } from "./use-formatting";
export {
  syncDatetimeContext,
  getDatetimeContext,
  formatDate,
  isFormatDateValue,
  detectFormatDateKind,
  formatAppDate,
  formatAppDateTime,
  formatAppTime,
  formatAppDateLong,
  formatAppRelative,
  formatCalendarDate,
  formatTimeOfDay,
  parseDateInput,
  normalizeHhmm,
  isValidHhmm,
  type FormatDateOptions,
  type FormatDateKind,
  type FormatDatetimeOptions,
} from "../lib/datetime";
export { useTranslation, usePickerLocales } from "../i18n/use-translation";

/*
 * Where every overlay in this library renders. It lives beside AppProvider because it is the same
 * KIND of fact — one statement at the root that every component below obeys — and because the one
 * situation that needs it, mounting into a shadow root, is a property of the whole tree rather
 * than of any control in it.
 */
export { OverlayPortalProvider } from "../lib/overlay-portal";
export type { OverlayPortalProviderProps } from "../lib/overlay-portal";

/*
 * ThemeScope is the same KIND of statement about the tree, for the other half of what a portal
 * destination decides: not only WHERE an overlay lands but which TOKENS it inherits there. It sits
 * beside OverlayPortalProvider because it composes with it — a ThemeScope inside one puts its host
 * inside that container, so a shadow-rooted app can be tenant-themed too (gh#877).
 */
export { ThemeScope } from "../lib/overlay-portal";
export type { ThemeScopeProps } from "../lib/overlay-portal";

/** App shell prop types — @see docs/COMPONENTS.md#app */
import type { Locale } from "date-fns";
import type { DayPickerProps } from "react-day-picker";
import type {
  AppLocale,
  AppRequestHeaders,
  AppTimeFormat,
  AppTimezone,
  AppTimezoneDefault,
  AppDateFormat,
} from "../../app/types";
import type { AppBrand, AppDensity, AppFontSize, AppTheme } from "../../app/theme-axes";
import type { AppPreferenceAxis } from "../../app/storage";
import type {
  AppSettingPickerAppearanceProp,
  AppSettingToggleAppearanceProp,
  ChildrenProp,
  ClassNameProp,
  DisabledProp,
  IdProp,
  NameProp,
  OnValueChangeProp,
  ValueProp,
} from "../vocabulary";

/** @see AppProvider */
export type AppProviderProp = {
  children: ChildrenProp;
  /** Initial locale when nothing in storage. Default: `vi`. */
  defaultLocale?: AppLocale;
  /** Fallback when a translation key is missing. Default: `en`. */
  fallbackLocale?: AppLocale;
  /** Initial timezone: IANA id, `browser`, or `system`. Default: `browser`. */
  defaultTimezone?: AppTimezoneDefault;
  /** Backend/system timezone when `defaultTimezone` is `system`. */
  systemTimezone?: AppTimezone;
  /** Initial clock format. `"locale"` derives from `defaultLocale`. */
  defaultTimeFormat?: AppTimeFormat | "locale";
  /** Initial date display format. `"locale"` derives from `defaultLocale`. */
  defaultDateFormat?: AppDateFormat | "locale";
  /**
   * IANA ids offered by the timezone-picker recipe (`useAppContext().timezoneOptions`). Omit for
   * the full IANA list; set to restrict (e.g.
   */
  timezoneOptions?: readonly AppTimezone[];
  /** localStorage key. Default: `godxjp.app`. */
  storageKey?: string;
  /**
   * Which viewer preferences survive a reload. `true` (default) every axis, `false` none, or a
   * LIST of axes — `["theme", "density", "fontSize"]`.
   *
   * The list exists because the axes do not share an owner. `theme` / `brand` / `density` /
   * `fontSize` / `scaling` are the VIEWER's and belong in this browser. `locale` / `timezone` /
   * `timeFormat` / `dateFormat` are frequently the SERVER's, resolved per request from a cookie,
   * an account row or a header — and a stored copy then WINS over the value the server just sent,
   * because storage is read after the props. Faced with one all-or-nothing flag, that consumer
   * sets `persist={false}` and loses the viewer's theme along with it; naming the axes keeps both.
   */
  persist?: boolean | readonly AppPreferenceAxis[];
  /**
   * Initial theme choice. `"light"` / `"dark"` are written straight to `<html data-theme>`;
   * `"system"` defers to `prefers-color-scheme` and is re-resolved whenever the OS changes.
   * Default: `"light"`.
   */
  theme?: AppTheme;
  /**
   * Initial brand palette preset — written to `<html data-brand>`. OPT-IN: omit
   * (or `null`) to keep the brand `--primary` your own `theme.css` defines.
   */
  brand?: AppBrand | null;
  /** Initial density — written to `<html data-density>`. Default: `"default"`. */
  density?: AppDensity;
  /** Initial base type size — written to `<html data-font-size>`. Default: `"default"`. */
  fontSize?: AppFontSize;
  /**
   * Continuous global size multiplier — sets inline `--scaling` on `<html>`. Every size token
   * (spacing, control/table/checkbox/switch heights, radius) rescales in proportion (Radix-style).
   */
  scaling?: number | null;
  /**
   * Emit a native `name` on every control a `FormField` wraps, taken from the field's key (`field`
   * → `name` → `id`). `data-field` is inert metadata and is always emitted; `name` is NOT — it
   * changes what a native `<form>` submit sends.
   */
  emitFieldNames?: boolean;
  onLocaleChange?: (locale: AppLocale) => void;
  onTimezoneChange?: (timezone: AppTimezone) => void;
  onTimeFormatChange?: (timeFormat: AppTimeFormat) => void;
  onDateFormatChange?: (dateFormat: AppDateFormat) => void;
  onThemeChange?: (theme: AppTheme) => void;
  onBrandChange?: (brand: AppBrand | null) => void;
  onDensityChange?: (density: AppDensity) => void;
  onFontSizeChange?: (fontSize: AppFontSize) => void;
  onScalingChange?: (scaling: number | null) => void;
};

/** Which AppProvider setting the {@link AppSettingPicker} reads/writes. */
export type AppSettingKind =
  "locale" | "timezone" | "dateFormat" | "timeFormat" | "theme" | "brand" | "density" | "fontSize";

/**
 * @see AppSettingPicker — one provider-bound Select for any single AppProvider setting.
 * Replaces the former Locale/Timezone/Date-format/Time-format pickers; pick the target
 * via `kind`. Bound to `<AppProvider>` by default; pass value + onValueChange to control.
 */
export type AppSettingPickerProp = {
  kind: AppSettingKind;
  /**
   * Trigger presentation. `"labeled"` shows the leading icon + the selected value in a control
   * sized to the setting.
   */
  appearance?: AppSettingPickerAppearanceProp;
  /**
   * Use it for an auth/legal footer locale switch (`kind="locale" appearance="labeled" compact`),
   * where the square icon-only default reads as a stray button and the full labelled trigger is
   * too tall. All geometry is tokenized (`--app-setting-picker-compact-*`).
   */
  compact?: boolean;
  className?: ClassNameProp;
  disabled?: DisabledProp;
  id?: IdProp;
  /** Form field name — submits the selected value with the form. */
  name?: NameProp;
  /** Controlled value; default reads/writes the matching AppProvider context. */
  value?: ValueProp<string>;
  onValueChange?: OnValueChangeProp<string>;
};

/**
 * The {@link AppSettingToggle} subset of {@link AppSettingKind} — the settings whose value set is
 * CLOSED and short enough to cycle by tapping. `locale`, `timezone`, `dateFormat` and `brand` are
 * deliberately absent: a 400-entry IANA list (or a palette a service extends) is a menu, not a
 * cycle, and tapping through it is not a control anyone can use.
 */
export type AppSettingToggleKind = Extract<
  AppSettingKind,
  "theme" | "density" | "fontSize" | "timeFormat"
>;

/**
 * @see AppSettingToggle — one BUTTON that steps a single AppProvider setting to its next value and
 * shows that value as its glyph. The no-menu counterpart to {@link AppSettingPickerProp}: same
 * binding contract (context-bound by default, controlled via value + onValueChange), same option
 * order, one tap instead of open-then-choose.
 */
export type AppSettingToggleProp = {
  kind: AppSettingToggleKind;
  /** Box the button takes. Default: `"bar"` — a toggle exists for a top bar. */
  appearance?: AppSettingToggleAppearanceProp;
  className?: ClassNameProp;
  disabled?: DisabledProp;
  id?: IdProp;
  /** Controlled value; default reads/writes the matching AppProvider context. */
  value?: ValueProp<string>;
  onValueChange?: OnValueChangeProp<string>;
};

/** Value exposed by `useAppContext`. */
export type AppContextValue = {
  locale: AppLocale;
  fallbackLocale: AppLocale;
  timezone: AppTimezone;
  timeFormat: AppTimeFormat;
  dateFormat: AppDateFormat;
  dateFnsLocale: Locale;
  dayPickerLocale: NonNullable<DayPickerProps["locale"]>;
  requestHeaders: AppRequestHeaders;
  /** Configured timezone list; `undefined` → full IANA in the timezone-picker recipe. */
  timezoneOptions?: readonly AppTimezone[];
  /**
   * Current theme axes (mirror `<html data-*>` / inline `--scaling`). `theme` is the user's
   * CHOICE — it can be `"system"`, which `<html data-theme>` never is.
   */
  theme: AppTheme;
  brand: AppBrand | null;
  density: AppDensity;
  fontSize: AppFontSize;
  scaling: number | null;
  /** Default `false`. */
  emitFieldNames: boolean;
  setLocale: (locale: AppLocale) => void;
  setTimezone: (timezone: AppTimezone) => void;
  setTimeFormat: (timeFormat: AppTimeFormat) => void;
  setDateFormat: (dateFormat: AppDateFormat) => void;
  setTheme: (theme: AppTheme) => void;
  setBrand: (brand: AppBrand | null) => void;
  setDensity: (density: AppDensity) => void;
  setFontSize: (fontSize: AppFontSize) => void;
  setScaling: (scaling: number | null) => void;
};

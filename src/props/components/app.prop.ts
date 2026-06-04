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
import type {
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
  /** Initial clock format. `"locale"` derives from `defaultLocale`. Default: `"locale"`. */
  defaultTimeFormat?: AppTimeFormat | "locale";
  /** Initial date display format. `"locale"` derives from `defaultLocale`. Default: `"locale"`. */
  defaultDateFormat?: AppDateFormat | "locale";
  /**
   * IANA ids offered by the timezone-picker recipe (`useAppContext().timezoneOptions`).
   * Omit for the full IANA list; set to restrict (e.g. `APP_TIMEZONE_PRESET`).
   */
  timezoneOptions?: readonly AppTimezone[];
  /** localStorage key. Default: `godxjp.app`. */
  storageKey?: string;
  /** Persist user choices. Default: true. */
  persist?: boolean;
  onLocaleChange?: (locale: AppLocale) => void;
  onTimezoneChange?: (timezone: AppTimezone) => void;
  onTimeFormatChange?: (timeFormat: AppTimeFormat) => void;
  onDateFormatChange?: (dateFormat: AppDateFormat) => void;
};

/** Which AppProvider setting the {@link AppSettingPicker} reads/writes. */
export type AppSettingKind = "locale" | "timezone" | "dateFormat" | "timeFormat";

/**
 * @see AppSettingPicker — one provider-bound Select for any single AppProvider setting.
 * Replaces the former Locale/Timezone/Date-format/Time-format pickers; pick the target
 * via `kind`. Bound to `<AppProvider>` by default; pass value + onValueChange to control.
 */
export type AppSettingPickerProp = {
  kind: AppSettingKind;
  className?: ClassNameProp;
  disabled?: DisabledProp;
  id?: IdProp;
  /** Form field name — submits the selected value with the form. */
  name?: NameProp;
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
  setLocale: (locale: AppLocale) => void;
  setTimezone: (timezone: AppTimezone) => void;
  setTimeFormat: (timeFormat: AppTimeFormat) => void;
  setDateFormat: (dateFormat: AppDateFormat) => void;
};

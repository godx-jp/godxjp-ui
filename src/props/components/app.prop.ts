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
   * IANA ids shown in `TimezonePicker`.
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

/** @see LocalePicker */
export type LocalePickerProp = {
  className?: ClassNameProp;
  disabled?: DisabledProp;
  id?: IdProp;
  /** Controlled value; default reads/writes AppProvider. */
  value?: ValueProp<AppLocale>;
  onValueChange?: OnValueChangeProp<AppLocale>;
  /** Override selectable locale list; omit to use APP_LOCALES. */
  options?: readonly { value: string; label?: string }[];
};

/** @see TimezonePicker */
export type TimezonePickerProp = {
  className?: ClassNameProp;
  disabled?: DisabledProp;
  id?: IdProp;
  value?: ValueProp<AppTimezone>;
  onValueChange?: OnValueChangeProp<AppTimezone>;
  /** Override AppProvider list; omit to use context or full IANA. */
  options?: readonly AppTimezone[];
};

/** @see TimeFormatPicker */
export type TimeFormatPickerProp = {
  className?: ClassNameProp;
  disabled?: DisabledProp;
  id?: IdProp;
  value?: ValueProp<AppTimeFormat>;
  onValueChange?: OnValueChangeProp<AppTimeFormat>;
};

/** @see DateFormatPicker */
export type DateFormatPickerProp = {
  className?: ClassNameProp;
  disabled?: DisabledProp;
  id?: IdProp;
  value?: ValueProp<AppDateFormat>;
  onValueChange?: OnValueChangeProp<AppDateFormat>;
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
  /** Configured picker list; `undefined` → full IANA in TimezonePicker. */
  timezoneOptions?: readonly AppTimezone[];
  setLocale: (locale: AppLocale) => void;
  setTimezone: (timezone: AppTimezone) => void;
  setTimeFormat: (timeFormat: AppTimeFormat) => void;
  setDateFormat: (dateFormat: AppDateFormat) => void;
};

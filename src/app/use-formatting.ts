import { useMemo } from "react";
import { formatDate, type FormatDateOptions } from "../lib/datetime";
import { useAppContext } from "./app-provider";

/** Date/time formatters bound to the current AppProvider preferences. */
export function useFormatting() {
  const { locale, timezone, timeFormat, dateFormat, dateFnsLocale } = useAppContext();

  const defaults = useMemo(
    () => ({ locale: dateFnsLocale, timezone, timeFormat, dateFormat }),
    [dateFnsLocale, timezone, timeFormat, dateFormat],
  );

  const bind = useMemo(
    () => (value: Parameters<typeof formatDate>[0], options?: FormatDateOptions) =>
      formatDate(value, { ...defaults, ...options }),
    [defaults],
  );

  return useMemo(
    () => ({
      locale,
      timezone,
      timeFormat,
      dateFormat,
      /** Primary formatter — auto-detect + AppProvider defaults. */
      format: bind,
      formatDate: bind,
      formatCalendarDate: (value: Date | null | undefined, options?: FormatDateOptions) =>
        formatDate(value, { ...defaults, ...options, kind: "calendar" }),
      formatTime: (value: Parameters<typeof formatDate>[0], options?: FormatDateOptions) =>
        formatDate(value, { ...defaults, ...options, kind: "time" }),
      formatDateTime: (value: Parameters<typeof formatDate>[0], options?: FormatDateOptions) =>
        formatDate(value, { ...defaults, ...options, kind: "datetime" }),
      formatDateLong: (value: Parameters<typeof formatDate>[0], options?: FormatDateOptions) =>
        formatDate(value, { ...defaults, ...options, kind: "long" }),
      formatRelative: (value: Parameters<typeof formatDate>[0], options?: FormatDateOptions) =>
        formatDate(value, { ...defaults, ...options, kind: "relative" }),
      formatTimeOfDay: (value: Parameters<typeof formatDate>[0], options?: FormatDateOptions) =>
        formatDate(value, { ...defaults, ...options, kind: "time" }),
    }),
    [locale, timezone, timeFormat, dateFormat, defaults, bind],
  );
}

/** Alias for useFormatting — emphasises timezone-aware datetime helpers. */
export const useDateTime = useFormatting;

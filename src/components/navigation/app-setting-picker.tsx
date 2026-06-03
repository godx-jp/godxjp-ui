import * as React from "react";
import { CalendarDays, Clock, Globe, Languages, type LucideIcon } from "lucide-react";

import { APP_DATE_FORMAT_OPTIONS, getDateFormatLabel } from "../../app/date-format-labels";
import { APP_TIME_FORMAT_OPTIONS, getTimeFormatLabel } from "../../app/time-format-labels";
import { getTimezoneLabel, resolveTimezonePickerOptions } from "../../app/timezones";
import { APP_LOCALES } from "../../app/types";
import { useOptionalAppContext } from "../../app/app-provider";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { AppSettingKind, AppSettingPickerProp } from "../../props/components/app.prop";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../data-entry/select";

export type {
  AppSettingKind,
  AppSettingPickerProp,
  AppSettingPickerProp as AppSettingPickerProps,
} from "../../props/components/app.prop";

const ICON: Record<AppSettingKind, LucideIcon> = {
  locale: Languages,
  timezone: Globe,
  dateFormat: CalendarDays,
  timeFormat: Clock,
};

const TRIGGER_WIDTH: Record<AppSettingKind, string> = {
  locale: "sm:w-40",
  timezone: "sm:w-56",
  dateFormat: "sm:w-44",
  timeFormat: "sm:w-44",
};

const ARIA_KEY: Record<AppSettingKind, string> = {
  locale: "navigation.localePicker.ariaLabel",
  timezone: "navigation.timezonePicker.ariaLabel",
  dateFormat: "navigation.dateFormatPicker.ariaLabel",
  timeFormat: "navigation.timeFormatPicker.ariaLabel",
};

/**
 * One provider-bound Select for any single AppProvider setting — replaces the former
 * Locale/Timezone/Date-format/Time-format pickers. Mount under `<AppProvider>` and it
 * reads/writes the matching context (`kind`); or pass value + onValueChange to control it.
 */
export function AppSettingPicker({
  kind,
  className,
  disabled,
  id,
  value,
  onValueChange,
}: AppSettingPickerProp) {
  const ctx = useOptionalAppContext();
  const { t, locale, fallbackLocale } = useTranslation();

  const current = value ?? ctx?.[kind];
  const setter = ctx
    ? {
        locale: ctx.setLocale,
        timezone: ctx.setTimezone,
        dateFormat: ctx.setDateFormat,
        timeFormat: ctx.setTimeFormat,
      }[kind]
    : undefined;
  const handleChange = onValueChange ?? (setter as ((value: string) => void) | undefined);

  const items = React.useMemo<{ value: string; label: React.ReactNode }[]>(() => {
    switch (kind) {
      case "locale":
        return APP_LOCALES.map((code) => ({ value: code, label: t(`locale.${code}`) }));
      case "timezone":
        return resolveTimezonePickerOptions(ctx?.timezoneOptions, current ?? "").map((tz) => ({
          value: tz,
          label: getTimezoneLabel(tz, locale, fallbackLocale),
        }));
      case "dateFormat":
        return APP_DATE_FORMAT_OPTIONS.map((option) => ({
          value: option.value,
          label: getDateFormatLabel(option.value, locale, fallbackLocale),
        }));
      case "timeFormat":
        return APP_TIME_FORMAT_OPTIONS.map((option) => ({
          value: option.value,
          label: getTimeFormatLabel(option.value, locale, fallbackLocale),
        }));
    }
  }, [kind, ctx?.timezoneOptions, current, t, locale, fallbackLocale]);

  if (current === undefined || !handleChange) {
    throw new Error("AppSettingPicker requires <AppProvider> or controlled value + onValueChange");
  }

  const Icon = ICON[kind];

  return (
    <Select value={current} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        className={cn("w-full", TRIGGER_WIDTH[kind], className)}
        aria-label={t(ARIA_KEY[kind])}
      >
        <Icon className="mr-2 size-4 shrink-0 opacity-70" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

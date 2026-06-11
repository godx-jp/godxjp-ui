import * as React from "react";
import {
  CalendarDays,
  Clock,
  Globe,
  Languages,
  Palette,
  Rows3,
  SunMoon,
  Type,
  type LucideIcon,
} from "lucide-react";

import { APP_DATE_FORMAT_OPTIONS, getDateFormatLabel } from "../../app/date-format-labels";
import { APP_TIME_FORMAT_OPTIONS, getTimeFormatLabel } from "../../app/time-format-labels";
import { getTimezoneLabel, resolveTimezonePickerOptions } from "../../app/timezones";
import { APP_LOCALES } from "../../app/types";
import {
  APP_BRANDS,
  APP_DENSITIES,
  APP_FONT_SIZES,
  APP_THEMES,
  type AppBrand,
} from "../../app/theme-axes";
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
  theme: SunMoon,
  brand: Palette,
  density: Rows3,
  fontSize: Type,
};

const TRIGGER_WIDTH: Record<AppSettingKind, string> = {
  locale: "sm:w-40",
  timezone: "sm:w-56",
  dateFormat: "sm:w-44",
  timeFormat: "sm:w-44",
  theme: "sm:w-36",
  brand: "sm:w-44",
  density: "sm:w-40",
  fontSize: "sm:w-36",
};

const ARIA_KEY: Record<AppSettingKind, string> = {
  locale: "navigation.localePicker.ariaLabel",
  timezone: "navigation.timezonePicker.ariaLabel",
  dateFormat: "navigation.dateFormatPicker.ariaLabel",
  timeFormat: "navigation.timeFormatPicker.ariaLabel",
  theme: "navigation.themePicker.ariaLabel",
  brand: "navigation.brandPicker.ariaLabel",
  density: "navigation.densityPicker.ariaLabel",
  fontSize: "navigation.fontSizePicker.ariaLabel",
};

/** brand opt-out wire value (null → app token). Radix forbids an empty SelectItem value. */
const BRAND_NONE = "__app__";

/**
 * One provider-bound Select for any single AppProvider setting — locale / timezone /
 * date-format / time-format and the four theme axes (theme / brand / density / fontSize).
 * Mount under `<AppProvider>` and it reads/writes the matching context (`kind`); or pass
 * value + onValueChange to control it.
 */
export const AppSettingPicker = React.forwardRef<HTMLButtonElement, AppSettingPickerProp>(
  function AppSettingPicker({ kind, className, disabled, id, name, value, onValueChange }, ref) {
    const ctx = useOptionalAppContext();
    const { t, locale, fallbackLocale } = useTranslation();

    const raw = value ?? ctx?.[kind];
    // brand is `AppBrand | null`; null is the opt-out, shown as the BRAND_NONE option.
    const current = raw == null ? (kind === "brand" ? BRAND_NONE : undefined) : String(raw);
    const setter = ctx
      ? {
          locale: ctx.setLocale,
          timezone: ctx.setTimezone,
          dateFormat: ctx.setDateFormat,
          timeFormat: ctx.setTimeFormat,
          theme: ctx.setTheme,
          density: ctx.setDensity,
          fontSize: ctx.setFontSize,
          brand: (next: string) =>
            ctx.setBrand(next === BRAND_NONE ? null : (next as AppBrand)),
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
        case "theme":
          return APP_THEMES.map((v) => ({ value: v, label: t(`navigation.themePicker.${v}`) }));
        case "density":
          return APP_DENSITIES.map((v) => ({
            value: v,
            label: t(`navigation.densityPicker.${v}`),
          }));
        case "fontSize":
          return APP_FONT_SIZES.map((v) => ({
            value: v,
            label: t(`navigation.fontSizePicker.${v}`),
          }));
        case "brand":
          return [
            { value: BRAND_NONE, label: t("navigation.brandPicker.none") },
            ...APP_BRANDS.map((v) => ({ value: v, label: t(`navigation.brandPicker.${v}`) })),
          ];
      }
    }, [kind, ctx?.timezoneOptions, current, t, locale, fallbackLocale]);

    // Outside <AppProvider> and uncontrolled: render disabled rather than throwing — ergonomics
    // parity with the other data-entry controls.
    const unbound = current === undefined || !handleChange;
    const Icon = ICON[kind];

    return (
      <Select
        value={current ?? ""}
        onValueChange={handleChange ?? (() => {})}
        disabled={disabled || unbound}
        name={name}
      >
        <SelectTrigger
          ref={ref}
          id={id}
          className={cn("w-full", TRIGGER_WIDTH[kind], className)}
          aria-label={t(ARIA_KEY[kind])}
        >
          <Icon className="me-2 size-4 shrink-0 opacity-70" aria-hidden="true" />
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
  },
);

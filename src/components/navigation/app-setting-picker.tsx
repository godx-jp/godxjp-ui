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
  function AppSettingPicker(
    { kind, appearance, compact = false, className, disabled, id, name, value, onValueChange },
    ref,
  ) {
    // Product contract (gh#175): the locale picker's canonical form is the compact icon-only
    // language switcher (a globe/languages glyph in the topbar), so `kind="locale"` DEFAULTS to
    // `appearance="icon"`. Every other kind defaults to the labeled trigger. Either can be
    // overridden explicitly (e.g. a locale row inside a settings form passes `appearance="labeled"`).
    const resolvedAppearance = appearance ?? (kind === "locale" ? "icon" : "labeled");
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
          brand: (next: string) => ctx.setBrand(next === BRAND_NONE ? null : (next as AppBrand)),
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
    const iconOnly = resolvedAppearance === "icon";
    const inline = resolvedAppearance === "inline";
    // `compact` (gh#217) re-tiers the trigger box to --control-height-sm and drops the picker's
    // owned per-kind width, so a LABELLED footer locale switch hugs its value instead of stretching
    // to the width its kind would otherwise claim (#319 moved those into
    // `.ui-app-setting-picker-trigger[data-kind]`). `inline` is already chrome-less, so compact is
    // a no-op there.
    const isCompact = compact && !inline;

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
          // Icon-only triggers drop the chevron via the supported `showIndicator={false}` API
          // (SelectTrigger omits the indicator from the DOM) — no consumer descendant-selector CSS.
          showIndicator={!iconOnly && !inline}
          className={cn(
            inline
              ? "ui-app-setting-picker-inline"
              : iconOnly
                ? // Structurally icon-only: drop the owned width + value spacing and square the box to
                  // the density-aware --control-height tap target, centring the icon. Visually it
                  // sits among ghost icon buttons (the topbar's sidebar-toggle/notifications/account
                  // triggers), so it drops controlTriggerClass's form-input chrome (border/bg/shadow)
                  // at rest and adopts the same ghost hover — a resting border here read as visually
                  // inconsistent next to its borderless topbar siblings. The open-state ring
                  // (`data-[state=open]:border-ring`, from controlTriggerClass) and the
                  // focus-visible ring are untouched, so keyboard and "is this open" affordance
                  // still hold.
                  "ui-app-setting-picker-icon hover:bg-accent hover:text-accent-foreground"
                : // Labeled: sized to a per-kind width from `sm` up; below `sm` it hugs its content and
                  // caps at the container (`w-auto max-w-full`) instead of the old UNCONDITIONAL
                  // `w-full` — so a labeled picker dropped into a narrow topbar no longer stretches to
                  // fill the bar (gh#165). A form field that wants a full-width control passes
                  // `className="w-full"`, which wins over `w-auto`.
                  // `compact` drops the per-kind width entirely so the trigger hugs its value.
                  cn("w-auto max-w-full", !isCompact && "ui-app-setting-picker-trigger"),
            // Compact re-tiers the box through tokens (--app-setting-picker-compact-*); the height
            // still comes from the official --control-height-sm tier, never a literal. The gap is a
            // utility (not the class rule) so it beats SelectTrigger's own `gap-2`.
            isCompact &&
              "ui-app-setting-picker-compact gap-[length:var(--app-setting-picker-compact-gap)]",
            className,
          )}
          data-kind={kind}
          // The localized aria-label is ALWAYS applied — an icon-only trigger drops the visible
          // value text, so this is its only accessible name; it can never ship nameless.
          aria-label={t(ARIA_KEY[kind])}
        >
          {inline ? null : (
            <Icon
              className={cn(
                "ui-app-setting-picker-glyph",
                // Compact relies on the trigger's tokenized flex gap instead of an icon margin.
                !iconOnly && !isCompact && "me-2",
              )}
              aria-hidden="true"
            />
          )}
          {iconOnly ? null : <SelectValue />}
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

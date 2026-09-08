import * as React from "react";
import {
  AArrowDown,
  AArrowUp,
  ALargeSmall,
  Clock,
  Monitor,
  Moon,
  Rows2,
  Rows3,
  Rows4,
  Sun,
  type LucideIcon,
} from "lucide-react";

import { APP_TIME_FORMAT_OPTIONS, getTimeFormatLabel } from "../../app/time-format-labels";
import type { AppTimeFormat } from "../../app/time-formats";
import { APP_DENSITIES, APP_FONT_SIZES, APP_THEMES } from "../../app/theme-axes";
import { useOptionalAppContext } from "../../app/app-provider";
import { useTranslation } from "../../i18n/use-translation";
import type { AppSettingToggleKind, AppSettingToggleProp } from "../../props/components/app.prop";
import { Button } from "../general/button";
import { TopbarItem } from "../layout/topbar-item";

export type {
  AppSettingToggleKind,
  AppSettingToggleProp,
  AppSettingToggleProp as AppSettingToggleProps,
} from "../../props/components/app.prop";

/**
 * The cycle order, taken FROM THE SAME CONSTANTS `AppSettingPicker` builds its option list from.
 * A second literal array here would be a copy that drifts: add a theme and the menu would offer it
 * while the button skipped it. `timeFormat` reads the picker's own option objects for the same
 * reason.
 */
const VALUES: Record<AppSettingToggleKind, readonly string[]> = {
  theme: APP_THEMES,
  density: APP_DENSITIES,
  fontSize: APP_FONT_SIZES,
  timeFormat: APP_TIME_FORMAT_OPTIONS.map((option) => option.value),
};

/**
 * The glyph says the CURRENT VALUE, not the kind — that is the whole point of a cycler, and it is
 * why `SunMoon` (the picker's kind glyph for `theme`) is wrong here: it looks identical in light,
 * dark and system, so the one piece of state the control carries would be invisible.
 *
 * `density` uses the row-count glyphs the way they read: more rows in the same box = tighter.
 * `fontSize` uses lucide's dedicated type-size marks (small-A-down / mixed / large-A-up).
 * A kind with NO glyph set that can say its value is absent from this map by design.
 */
const VALUE_ICON: Record<AppSettingToggleKind, Record<string, LucideIcon>> = {
  theme: { light: Sun, dark: Moon, system: Monitor },
  density: { compact: Rows4, default: Rows3, comfortable: Rows2 },
  fontSize: { sm: AArrowDown, default: ALargeSmall, lg: AArrowUp },
  // 12h vs 24h is a NOTATION, not a picture: `Clock3`/`Clock12` differ only by hand position, which
  // reads as a time of day. So this kind shows the kind glyph plus the value as text instead.
  timeFormat: {},
};

/** Fallback glyph when the value has no mark of its own — it accompanies the value TEXT. */
const KIND_ICON: Record<AppSettingToggleKind, LucideIcon> = {
  theme: Sun,
  density: Rows3,
  fontSize: ALargeSmall,
  timeFormat: Clock,
};

/** Same keys `AppSettingPicker` names its trigger with, so both controls say one thing. */
const ARIA_KEY: Record<AppSettingToggleKind, string> = {
  theme: "navigation.themePicker.ariaLabel",
  density: "navigation.densityPicker.ariaLabel",
  fontSize: "navigation.fontSizePicker.ariaLabel",
  timeFormat: "navigation.timeFormatPicker.ariaLabel",
};

/**
 * AppSettingToggle — ONE button that steps a single AppProvider setting to its next value.
 *
 * The no-menu counterpart to {@link AppSettingPicker}: same binding contract, same option order,
 * one tap instead of open-then-choose. Reach for it when the value set is closed and short (theme,
 * density, font size, clock format) and the control lives in a top bar, where a dropdown for three
 * values is a menu nobody wanted to open.
 *
 * The accessible name carries BOTH the setting and its current value ("Theme: Dark"), because the
 * glyph is the only visible state and a screen-reader user would otherwise be told only which
 * setting they are standing on, never where it currently is.
 */
export const AppSettingToggle = React.forwardRef<HTMLButtonElement, AppSettingToggleProp>(
  function AppSettingToggle(
    { kind, appearance = "bar", className, disabled, id, value, onValueChange },
    ref,
  ) {
    const ctx = useOptionalAppContext();
    const { t, locale, fallbackLocale } = useTranslation();

    const raw = value ?? ctx?.[kind];
    const current = raw == null ? undefined : String(raw);
    const setter = ctx
      ? {
          theme: ctx.setTheme,
          density: ctx.setDensity,
          fontSize: ctx.setFontSize,
          timeFormat: ctx.setTimeFormat,
        }[kind]
      : undefined;
    const handleChange = onValueChange ?? (setter as ((next: string) => void) | undefined);

    // Outside <AppProvider> and uncontrolled: render disabled rather than throwing — ergonomics
    // parity with AppSettingPicker's `unbound`.
    const unbound = current === undefined || !handleChange;

    const values = VALUES[kind];
    const handleClick = () => {
      if (current === undefined || !handleChange) return;
      // A value outside the list (a stale persisted preference) lands on index -1, so the step
      // takes it to values[0] — the cycle recovers instead of freezing.
      handleChange(values[(values.indexOf(current) + 1) % values.length]);
    };

    const ValueIcon = current === undefined ? undefined : VALUE_ICON[kind][current];
    const Icon = ValueIcon ?? KIND_ICON[kind];
    const valueLabel =
      current === undefined
        ? ""
        : kind === "timeFormat"
          ? getTimeFormatLabel(current as AppTimeFormat, locale, fallbackLocale)
          : t(`navigation.${kind}Picker.${current}`);

    const shared = {
      ref,
      id,
      type: "button" as const,
      disabled: disabled || unbound,
      onClick: handleClick,
      "data-kind": kind,
      // The button has no visible label, so this aria-label is its ONLY accessible name — and it
      // must name the VALUE too, or a cycler announces the same string at every step.
      "aria-label": t("navigation.settingToggle.label", {
        setting: t(ARIA_KEY[kind]),
        value: valueLabel,
      }),
      children: (
        <>
          <Icon aria-hidden="true" />
          {ValueIcon ? null : <span>{current}</span>}
        </>
      ),
    };

    // `bar` is a CELL of the bar, so it IS TopbarItem — the shape is not re-derived here. That
    // matters beyond reuse: the cell's height is an `align-self: stretch` chain up to whatever the
    // bar happens to be (AppShell's grid row, --topbar-height, the coarse-pointer override), and
    // any length this component emitted for it would freeze a --control-height pill inside a taller
    // bar. Utilities beat @layer components (gh#366/#371), so emitting one here is not a smaller
    // mistake than authoring the rule — it is the same mistake with more precedence.
    if (appearance === "bar") {
      return <TopbarItem className={className} {...shared} />;
    }

    // `icon` is a control, not chrome: the square --control-height ghost box Button already owns.
    // The text-bearing kinds take the labelled small tier instead, since a square would clip them.
    return (
      <Button variant="ghost" size={ValueIcon ? "icon" : "sm"} className={className} {...shared} />
    );
  },
);

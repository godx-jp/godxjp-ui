import * as React from "react";
import { Globe } from "lucide-react";
import { useOptionalAppContext } from "../../app/app-provider";
import { getTimezoneLabel, resolveTimezonePickerOptions } from "../../app/timezones";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { TimezonePickerProp } from "../../props/components/app.prop";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../data-entry/select";

export type {
  TimezonePickerProp,
  TimezonePickerProp as TimezonePickerProps,
} from "../../props/components/app.prop";

export function TimezonePicker({
  className,
  disabled,
  id,
  value,
  onValueChange,
  options: optionsProp,
}: TimezonePickerProp) {
  const ctx = useOptionalAppContext();
  const { t, locale, fallbackLocale } = useTranslation();
  const current = value ?? ctx?.timezone;
  const handleChange = onValueChange ?? ctx?.setTimezone;
  const configured = optionsProp ?? ctx?.timezoneOptions;

  if (current === undefined || !handleChange) {
    throw new Error("TimezonePicker requires <AppProvider> or controlled value + onValueChange");
  }

  const options = React.useMemo(
    () => resolveTimezonePickerOptions(configured, current),
    [configured, current],
  );

  return (
    <Select value={current} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        className={cn("w-full sm:w-56", className)}
        aria-label={t("navigation.timezonePicker.ariaLabel")}
      >
        <Globe className="mr-2 size-4 shrink-0 opacity-70" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((tz) => (
          <SelectItem key={tz} value={tz}>
            {getTimezoneLabel(tz, locale, fallbackLocale)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

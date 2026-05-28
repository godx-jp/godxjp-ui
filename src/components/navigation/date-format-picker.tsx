import { CalendarDays } from "lucide-react";
import { APP_DATE_FORMAT_OPTIONS, getDateFormatLabel } from "../../app/date-format-labels";
import { useOptionalAppContext } from "../../app/app-provider";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { DateFormatPickerProp } from "../../props/components/app.prop";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../data-entry/select";

export type {
  DateFormatPickerProp,
  DateFormatPickerProp as DateFormatPickerProps,
} from "../../props/components/app.prop";

export function DateFormatPicker({
  className,
  disabled,
  id,
  value,
  onChange,
}: DateFormatPickerProp) {
  const ctx = useOptionalAppContext();
  const { t, locale, fallbackLocale } = useTranslation();
  const current = value ?? ctx?.dateFormat;
  const handleChange = onChange ?? ctx?.setDateFormat;

  if (current === undefined || !handleChange) {
    throw new Error("DateFormatPicker requires <AppProvider> or controlled value + onChange");
  }

  return (
    <Select value={current} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        className={cn("w-full sm:w-44", className)}
        aria-label={t("navigation.dateFormatPicker.ariaLabel")}
      >
        <CalendarDays className="mr-2 size-4 shrink-0 opacity-70" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {APP_DATE_FORMAT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {getDateFormatLabel(option.value, locale, fallbackLocale)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

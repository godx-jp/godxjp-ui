import * as React from "react";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { formatDate } from "../../lib/datetime";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Calendar } from "./calendar";
import type { DateRangePickerProp } from "../../props/components/data-entry.prop";

export type {
  DateRangePickerProp,
  DateRangePickerProp as DateRangePickerProps,
} from "../../props/components/data-entry.prop";

function formatRange(range: DateRange | undefined): string {
  if (!range?.from) return "";
  const fmt = (d: Date) => formatDate(d, { kind: "calendar" });
  if (!range.to) return fmt(range.from);
  return `${fmt(range.from)} – ${fmt(range.to)}`;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  id,
  locale: localeProp,
  fromDate,
  toDate,
}: DateRangePickerProp) {
  const { t } = useTranslation();
  const { dayPickerLocale } = usePickerLocales(localeProp);
  const [open, setOpen] = React.useState(false);
  const label = formatRange(value);
  const resolvedPlaceholder = placeholder ?? t("dataEntry.dateRangePicker.placeholder");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !label && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0" aria-hidden="true" />
          {label || resolvedPlaceholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          locale={dayPickerLocale}
          disabled={[
            ...(fromDate ? [{ before: fromDate }] : []),
            ...(toDate ? [{ after: toDate }] : []),
          ]}
          startMonth={fromDate}
          endMonth={toDate}
        />
      </PopoverContent>
    </Popover>
  );
}

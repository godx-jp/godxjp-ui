import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { formatDate } from "../../lib/datetime";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Calendar } from "./calendar";
import type { DatePickerProp } from "../../props/components/data-entry.prop";

export type {
  DatePickerProp,
  DatePickerProp as DatePickerProps,
} from "../../props/components/data-entry.prop";

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  id,
  locale: localeProp,
  fromDate,
  toDate,
}: DatePickerProp) {
  const { t } = useTranslation();
  const { dayPickerLocale } = usePickerLocales(localeProp);
  const [open, setOpen] = React.useState(false);
  const resolvedPlaceholder = placeholder ?? t("dataEntry.datePicker.placeholder");

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
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0" aria-hidden="true" />
          {value ? formatDate(value, { kind: "calendar" }) : resolvedPlaceholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
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

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { parseDateInput, toIsoDate } from "../../lib/datetime";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Calendar } from "./calendar";
import type { DateRangePickerProp } from "../../props/components/data-entry.prop";

export type {
  DateRangePickerProp,
  DateRangePickerProp as DateRangePickerProps,
} from "../../props/components/data-entry.prop";

const ISO_HINT = "yyyy-mm-dd";

/**
 * DateRangePicker — WAI-ARIA date-range combobox. Two real, typeable ISO `yyyy-MM-dd` inputs
 * hold the start/end values (form-submittable via `${name}_from` / `${name}_to`, screen-reader
 * friendly, e2e-testable by filling either input). The range calendar is the visual affordance.
 */
export function DateRangePicker({
  value,
  onValueChange,
  placeholder,
  disabled,
  className,
  id,
  name,
  locale: localeProp,
  fromDate,
  toDate,
}: DateRangePickerProp) {
  const { t } = useTranslation();
  const { dayPickerLocale } = usePickerLocales(localeProp);
  const [open, setOpen] = React.useState(false);
  const [fromText, setFromText] = React.useState(() => toIsoDate(value?.from));
  const [toText, setToText] = React.useState(() => toIsoDate(value?.to));

  React.useEffect(() => {
    setFromText(toIsoDate(value?.from));
    setToText(toIsoDate(value?.to));
  }, [value?.from, value?.to]);

  const resolvedPlaceholder = placeholder ?? t("dataEntry.dateRangePicker.placeholder") ?? ISO_HINT;

  const emit = (next: DateRange | undefined) => onValueChange?.(next);

  const commitEdge = (edge: "from" | "to", raw: string) => {
    const parsed = raw.trim() === "" ? undefined : (parseDateInput(raw.trim()) ?? undefined);
    const next = { from: value?.from, to: value?.to, [edge]: parsed } as DateRange;
    emit(next.from || next.to ? next : undefined);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Input
        id={id}
        name={name ? `${name}_from` : undefined}
        value={fromText}
        disabled={disabled}
        placeholder={resolvedPlaceholder}
        inputMode="numeric"
        autoComplete="off"
        aria-label={t("dataEntry.dateRangePicker.from") ?? "From"}
        className="tabular-nums"
        onChange={(event) => {
          setFromText(event.target.value);
          commitEdge("from", event.target.value);
        }}
        onBlur={(event) => {
          const parsed = parseDateInput(event.target.value.trim());
          setFromText(parsed ? toIsoDate(parsed) : toIsoDate(value?.from));
        }}
      />
      <span className="text-muted-foreground shrink-0" aria-hidden="true">
        –
      </span>
      <Input
        name={name ? `${name}_to` : undefined}
        value={toText}
        disabled={disabled}
        placeholder={resolvedPlaceholder}
        inputMode="numeric"
        autoComplete="off"
        aria-label={t("dataEntry.dateRangePicker.to") ?? "To"}
        className="tabular-nums"
        onChange={(event) => {
          setToText(event.target.value);
          commitEdge("to", event.target.value);
        }}
        onBlur={(event) => {
          const parsed = parseDateInput(event.target.value.trim());
          setToText(parsed ? toIsoDate(parsed) : toIsoDate(value?.to));
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            tabIndex={-1}
            aria-label={t("dataEntry.dateRangePicker.openCalendar") ?? "Open calendar"}
            className="text-muted-foreground shrink-0 hover:bg-transparent"
          >
            <CalendarIcon className="size-4 shrink-0" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={value}
            onSelect={(range) => {
              emit(range);
              setFromText(toIsoDate(range?.from));
              setToText(toIsoDate(range?.to));
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
    </div>
  );
}

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
  value: valueProp,
  defaultValue,
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
  // Controlled-ness fixed at mount; uncontrolled state seeds from `defaultValue`.
  const isControlled = React.useRef(valueProp !== undefined).current;
  const [internalValue, setInternalValue] = React.useState<DateRange | undefined>(defaultValue);
  const value = isControlled ? valueProp : internalValue;
  const [fromText, setFromText] = React.useState(() => toIsoDate(value?.from));
  const [toText, setToText] = React.useState(() => toIsoDate(value?.to));

  React.useEffect(() => {
    setFromText(toIsoDate(value?.from));
    setToText(toIsoDate(value?.to));
  }, [value?.from, value?.to]);

  const resolvedPlaceholder = placeholder ?? t("dataEntry.dateRangePicker.placeholder") ?? ISO_HINT;

  const emit = (next: DateRange | undefined) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const commitEdge = (edge: "from" | "to", raw: string) => {
    const trimmed = raw.trim();
    // Only commit a COMPLETE date (or a clear). Feeding a partial string to the lenient
    // parser (parseISO("20") is a valid year-2000 date) would change `value`, and the
    // text-mirror effect would then rewrite the field mid-type — mangling input. Partial
    // input keeps the text and emits nothing; onBlur normalizes any loose-but-complete entry.
    if (trimmed !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return;
    const parsed = trimmed === "" ? undefined : (parseDateInput(trimmed) ?? undefined);
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
        // Clicking a field (or ArrowDown) opens the calendar; focus stays on the field for typing.
        onClick={() => {
          if (!disabled) setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          } else if (event.key === "Escape" && open) {
            setOpen(false);
          }
        }}
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
        onClick={() => {
          if (!disabled) setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          } else if (event.key === "Escape" && open) {
            setOpen(false);
          }
        }}
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
        <PopoverContent
          className="w-auto p-0"
          align="end"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Calendar
            mode="range"
            selected={value}
            defaultMonth={value?.from}
            // A range picker shows two months so a cross-month range can be picked without
            // navigating. The Calendar wrapper stacks them vertically below `sm` for mobile.
            numberOfMonths={2}
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

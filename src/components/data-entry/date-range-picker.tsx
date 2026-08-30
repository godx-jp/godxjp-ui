import * as React from "react";
import { ArrowRight, CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { parseDateInput, toIsoDate } from "../../lib/datetime";
import { useControlledLatch } from "../../lib/hooks";
import { pickGroupFieldA11y } from "../../lib/field-a11y";
import { cn } from "../../lib/utils";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Calendar } from "./calendar";
import type { DateRangePickerProp } from "../../props/components/data-entry.prop";

export type {
  DateRangePickerProp,
  DateRangePickerProp as DateRangePickerProps,
} from "../../props/components/data-entry.prop";

const ISO_HINT = "yyyy-mm-dd";

/**
 * DateRangePicker — WAI-ARIA date-range combobox rendered as ONE input-styled control
 * (Ant Design RangePicker convention): `[ from → to  ✕ 📅 ]`. The two inner fields stay
 * real, typeable ISO `yyyy-MM-dd` inputs (form-submittable via `${name}_from` /
 * `${name}_to`, screen-reader friendly, e2e-testable by filling either input); the
 * range calendar is the visual affordance.
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
  allowClear = true,
  ...ariaProps
}: DateRangePickerProp) {
  const { t } = useTranslation();
  const { dayPickerLocale } = usePickerLocales(localeProp);
  const [open, setOpen] = React.useState(false);
  // The range has no single labelable focus target (two inputs) — the shell is a role="group"
  // named by the FormField label. pickGroupFieldA11y forwards aria-labelledby/-describedby (error
  // folded in) — the widget-only aria-invalid/-required are invalid on role="group".
  const groupA11y = pickGroupFieldA11y(ariaProps);
  // Both inner inputs always carry ids (Chrome flags form fields without id/name); the group owns
  // the injected `id` so it isn't duplicated across the two inputs.
  const autoId = React.useId();
  const groupId = id ?? autoId;
  const fromId = `${groupId}-from`;
  const toId = `${groupId}-to`;
  // Controlled once a defined `value` has EVER been passed (an empty form may
  // restore a saved value later); uncontrolled state seeds from `defaultValue`.
  const isControlled = useControlledLatch(valueProp !== undefined);
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

  const showClear = allowClear && Boolean(value?.from || value?.to) && !disabled;

  const clear = () => {
    emit(undefined);
    setFromText("");
    setToText("");
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

  const sharedKeyHandlers = {
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === "Escape" && open) {
        setOpen(false);
      }
    },
  };

  // Bare inputs: the BORDER lives on the shared container (one control, antd
  // RangePicker style) — an Input here would draw a second border inside it.
  const innerInputClass = "ui-month-picker-input";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Anchor the calendar to the whole control so align="start" puts it under the
       * leading (from) edge — the international date-picker convention. */}
      <PopoverAnchor asChild>
        <div
          role="group"
          id={groupId}
          {...groupA11y}
          aria-disabled={disabled ? true : undefined}
          className={cn(
            // One input-styled shell for the whole range — the shared composite-field box, so
            // this and the month range picker cannot drift into two slightly different fields.
            "ui-control ui-control-composite-field",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
            open && "border-ring ring-ring/50 ring-[3px]",
            className,
          )}
          onClick={() => {
            if (!disabled) setOpen(true);
          }}
        >
          <input
            id={fromId}
            name={name ? `${name}_from` : undefined}
            value={fromText}
            disabled={disabled}
            placeholder={resolvedPlaceholder}
            inputMode="numeric"
            autoComplete="off"
            aria-label={t("dataEntry.dateRangePicker.from") ?? "From"}
            className={innerInputClass}
            {...sharedKeyHandlers}
            onChange={(event) => {
              setFromText(event.target.value);
              commitEdge("from", event.target.value);
            }}
            onBlur={(event) => {
              const parsed = parseDateInput(event.target.value.trim());
              setFromText(parsed ? toIsoDate(parsed) : toIsoDate(value?.from));
            }}
          />
          <ArrowRight className="ui-month-picker-separator-icon" aria-hidden="true" />
          <input
            id={toId}
            name={name ? `${name}_to` : undefined}
            value={toText}
            disabled={disabled}
            placeholder={resolvedPlaceholder}
            inputMode="numeric"
            autoComplete="off"
            aria-label={t("dataEntry.dateRangePicker.to") ?? "To"}
            className={innerInputClass}
            {...sharedKeyHandlers}
            onChange={(event) => {
              setToText(event.target.value);
              commitEdge("to", event.target.value);
            }}
            onBlur={(event) => {
              const parsed = parseDateInput(event.target.value.trim());
              setToText(parsed ? toIsoDate(parsed) : toIsoDate(value?.to));
            }}
          />
          {/* ONE trailing icon: the clear (×) replaces the calendar while a range is set;
              the field itself still opens the calendar (onClick). */}
          {showClear ? (
            <button
              type="button"
              tabIndex={-1}
              aria-label={t("common.clear") ?? "Clear"}
              className="text-muted-foreground hover:text-foreground shrink-0"
              onClick={(event) => {
                event.stopPropagation();
                clear();
              }}
            >
              <X className="ui-month-picker-icon" aria-hidden="true" />
            </button>
          ) : null}
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              tabIndex={-1}
              aria-label={t("dataEntry.dateRangePicker.openCalendar") ?? "Open calendar"}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <CalendarIcon className="ui-month-picker-icon" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="ui-control-panel-flush"
            align="start"
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
        </div>
      </PopoverAnchor>
    </Popover>
  );
}

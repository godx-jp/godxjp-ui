import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { parseDateInput, toIsoDate } from "../../lib/datetime/parse";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { Input } from "./input";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Calendar } from "./calendar";
import type { DatePickerProp } from "../../props/components/data-entry.prop";

export type {
  DatePickerProp,
  DatePickerProp as DatePickerProps,
} from "../../props/components/data-entry.prop";

const ISO_HINT = "yyyy-mm-dd";

/**
 * DatePicker — WAI-ARIA date combobox. A real, typeable `<input>` holds the value as an
 * ISO-8601 `yyyy-MM-dd` string (the international standard): it is form-submittable (give it a
 * `name`), screen-reader friendly, and e2e-testable by simply filling the input. The calendar
 * popover is the visual affordance; typing and the calendar stay in sync.
 */
export function DatePicker({
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
}: DatePickerProp) {
  const { t } = useTranslation();
  const { dayPickerLocale } = usePickerLocales(localeProp);
  const [open, setOpen] = React.useState(false);
  // Controlled-ness is fixed at mount so a controlled `value={undefined}` (no selection) isn't
  // mistaken for uncontrolled. Uncontrolled state seeds from `defaultValue`.
  const isControlled = React.useRef(valueProp !== undefined).current;
  const [internalValue, setInternalValue] = React.useState<Date | undefined>(defaultValue);
  const value = isControlled ? valueProp : internalValue;
  const emit = (next: Date | undefined) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };
  // Local text mirrors the input while the user types a (possibly incomplete) date; the committed
  // value flows back through `onValueChange`. Kept in sync whenever the controlled `value` changes.
  const [text, setText] = React.useState(() => toIsoDate(value));

  React.useEffect(() => {
    setText(toIsoDate(value));
  }, [value]);

  const resolvedPlaceholder = placeholder ?? t("dataEntry.datePicker.placeholder") ?? ISO_HINT;
  const showClear = allowClear && Boolean(value) && !disabled;

  const clear = () => {
    emit(undefined);
    setText("");
  };

  const commit = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "") {
      emit(undefined);
      return;
    }
    // Only commit a COMPLETE date. A partial string fed to the lenient parser
    // (parseISO("20") is a valid year-2000 date) would change `value`, and the text-mirror
    // effect then rewrites the field mid-type — mangling input. onBlur normalizes loose entry.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return;
    const parsed = parseDateInput(trimmed);
    if (parsed) {
      emit(parsed);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Anchor the calendar to the whole FIELD wrapper (a plain div with a reliable ref) so
       * align="start" drops it under the field's leading edge — the international date-picker
       * convention (Google/Ant/MUI), not flush to the trailing icon. */}
      <PopoverAnchor asChild>
        <div className={cn("relative", className)}>
          <Input
            id={id}
            name={name}
            value={text}
            disabled={disabled}
            placeholder={resolvedPlaceholder}
            inputMode="numeric"
            autoComplete="off"
            // Combobox semantics: the input owns the value, the calendar is a secondary popup.
            role="combobox"
            aria-expanded={open}
            aria-haspopup="dialog"
            className={cn("pe-10", showClear && "pe-16")}
            // Combobox semantics made real: clicking the field (or ArrowDown) opens the calendar —
            // the input declares aria-haspopup="dialog", so it must actually control the popup, not
            // only the icon button. Focus stays on the input (PopoverContent.onOpenAutoFocus is
            // prevented) so the field is still typeable while the calendar is visible.
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
              setText(event.target.value);
              commit(event.target.value);
            }}
            onBlur={(event) => {
              // Normalise a valid entry back to canonical ISO; revert an unparseable one.
              const parsed = parseDateInput(event.target.value.trim());
              setText(parsed ? toIsoDate(parsed) : toIsoDate(value));
            }}
          />
          {showClear ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              tabIndex={-1}
              aria-label={t("common.clear") ?? "Clear"}
              className="text-muted-foreground absolute inset-y-0 end-8 h-full px-2 hover:bg-transparent"
              onClick={clear}
            >
              <X className="size-4 shrink-0" aria-hidden="true" />
            </Button>
          ) : null}
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              tabIndex={-1}
              aria-label={t("dataEntry.datePicker.openCalendar") ?? "Open calendar"}
              className="text-muted-foreground absolute inset-y-0 end-0 h-full px-2 hover:bg-transparent"
            >
              <CalendarIcon className="size-4 shrink-0" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="start"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <Calendar
              mode="single"
              selected={value}
              defaultMonth={value}
              onSelect={(date) => {
                emit(date);
                setText(toIsoDate(date));
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
        </div>
      </PopoverAnchor>
    </Popover>
  );
}

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { parseDateInput, toIsoDate } from "../../lib/datetime/parse";
import { useControlledLatch } from "../../lib/hooks";
import { pickFieldA11y, useFieldIdentity } from "../../lib/field-a11y";
import { cn } from "../../lib/utils";
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
 * DatePicker — WAI-ARIA date combobox. A real, typeable `<input>` holds the value as an ISO-8601
 * `yyyy-MM-dd` string (the international standard): it is form-submittable (give it a `name`),
 * screen-reader friendly, and e2e-testable by simply filling the input.
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
  showToday,
  showClose,
  fromDate,
  toDate,
  allowClear = true,
  ...ariaProps
}: DatePickerProp) {
  const { t } = useTranslation();
  const { dayPickerLocale } = usePickerLocales(localeProp);
  const [open, setOpen] = React.useState(false);
  // The typeable <input> is the semantic focus target: forward the FormField label/helper/error
  // contract onto it (never the wrapper div) so the visible label names the control for AT.
  const fieldA11y = pickFieldA11y(ariaProps);
  // Resolved HERE rather than left to the inner `Input`, because this
  // component — not the input — decides which element owns the native `name`. Passing `data-field`
  // down also tells Input's own resolver to keep its hands off (see useFieldIdentity).
  const identity = useFieldIdentity({ id, name, "data-field": fieldA11y["data-field"] });
  const resolvedName = name ?? identity.name;
  const resolvedField = fieldA11y["data-field"] ?? identity["data-field"];
  const reactId = React.useId();
  const dialogId = `${id ?? reactId}-dialog`;
  // Controlled once a defined `value` has EVER been passed — a controlled
  // `value={undefined}` (no selection) isn't mistaken for uncontrolled, and an
  // empty-mounted form can still restore a saved value later. Uncontrolled
  // state seeds from `defaultValue`.
  const isControlled = useControlledLatch(valueProp !== undefined);
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

  const clear = () => {
    emit(undefined);
    setText("");
  };

  // Input's `allowClear` REPLACES the
  // trailingIcon while a value is set — right for a plain text field, wrong for a picker,
  // where the calendar icon is the only visual sign that this field HAS a calendar. So the
  // picker renders its own trailing cluster and leaves Input's `allowClear` untouched
  // (nothing changes for every other Input consumer).
  const showClear = allowClear && text !== "" && !disabled;

  const commit = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "") {
      emit(undefined);
      return;
    }
    // A partial string fed to the lenient parser
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
          {/* The field owns the value; the calendar is a secondary popup. The clear (×) sits
              BESIDE the calendar trigger, never in place of it — see `showClear` above. */}
          <Input
            id={id}
            name={resolvedName}
            data-field={resolvedField}
            value={text}
            disabled={disabled}
            placeholder={resolvedPlaceholder}
            inputMode="numeric"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-controls={open ? dialogId : undefined}
            {...fieldA11y}
            // Two 20px buttons + gap need more room than Input's single-icon `pe-9`.
            className={showClear ? "ui-control-inline-affix-pair-affixed" : undefined}
            trailingIcon={
              <span className="ui-time-picker-affix">
                {showClear ? (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={t("common.clear") ?? "Clear"}
                    onClick={clear}
                    className="ui-control-inline-affix-action"
                  >
                    <X className="ui-control-inline-affix-icon" aria-hidden="true" />
                  </button>
                ) : null}
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled}
                    tabIndex={-1}
                    aria-label={t("dataEntry.datePicker.openCalendar") ?? "Open calendar"}
                    className="ui-control-inline-affix-action"
                  >
                    <CalendarIcon className="ui-control-inline-affix-icon" aria-hidden="true" />
                  </button>
                </PopoverTrigger>
              </span>
            }
            // Combobox semantics made real: clicking the field (or ArrowDown) opens the calendar —
            // the input declares aria-haspopup="dialog", so it controls the popup, not only the
            // icon. Focus stays on the input (PopoverContent.onOpenAutoFocus prevented) so it's typeable.
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
          <PopoverContent
            id={dialogId}
            role="dialog"
            aria-label={t("dataEntry.datePicker.openCalendar") ?? "Calendar"}
            className="ui-control-panel-flush"
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
              showToday={showToday}
              showClose={showClose}
              onClose={() => setOpen(false)}
            />
          </PopoverContent>
        </div>
      </PopoverAnchor>
    </Popover>
  );
}

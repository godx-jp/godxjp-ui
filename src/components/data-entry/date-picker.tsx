import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { toIsoDate } from "../../lib/datetime/parse";
import {
  formatPickerDate,
  parsePickerDate,
  pickerDateAllowed,
  pickerPeriodStart,
} from "../../lib/datetime/picker-format";
import { Button } from "../general/button";
import { Flex } from "../layout/flex";
import { TimePicker } from "./time-picker";
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
export function DatePicker(props: DatePickerProp) {
  const {
    value: valueProp,
    defaultValue,
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
    disabledDate,
    cellRender,
    allowClear = true,
    format: formatProp,
    parseFormat,
    minDate,
    maxDate,
    showWeek,
    showTime,
    presets,
    multiple = false,
    picker = "date",
    order = true,
    needConfirm = Boolean(showTime),
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    inputReadOnly,
    preserveInvalidOnBlur,
    placement = "bottom-start",
    renderExtraFooter,
    size,
    status,
    variant,
    ref,
    ...ariaProps
  } = props;
  const format =
    formatProp ??
    (typeof showTime === "object" && showTime.showSeconds ? "yyyy-MM-dd HH:mm:ss" : undefined);
  const { t } = useTranslation();
  const { dayPickerLocale, locale } = usePickerLocales(localeProp);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = !disabled && (openProp ?? internalOpen);
  const [pending, setPending] = React.useState<Date | Date[] | undefined>();
  const [hasPending, setHasPending] = React.useState(false);
  const setOpen = (next: boolean) => {
    if (disabled && next) return;
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
    if (!next) {
      setHasPending(false);
      setPending(undefined);
    }
  };
  const timeAllowed = (date: Date) => {
    const rules = typeof showTime === "object" ? showTime.disabledTime?.() : undefined;
    return !(
      rules?.disabledHours?.().includes(date.getHours()) ||
      rules?.disabledMinutes?.(date.getHours()).includes(date.getMinutes()) ||
      rules?.disabledSeconds?.(date.getHours(), date.getMinutes()).includes(date.getSeconds())
    );
  };
  const minimum = minDate ?? fromDate;
  const maximum = maxDate ?? toDate;
  const allowed = (date: Date) => pickerDateAllowed(date, minimum, maximum, disabledDate);
  const display = (date: Date | Date[] | undefined): string =>
    Array.isArray(date)
      ? date.map((day) => formatPickerDate(day, format, locale)).join(", ")
      : formatPickerDate(date, format, locale, Boolean(showTime));
  const parse = (text: string) => parsePickerDate(text, format, parseFormat, Boolean(showTime));
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
  const [internalValue, setInternalValue] = React.useState<Date | Date[] | undefined>(defaultValue);
  const value = isControlled ? valueProp : internalValue;
  const working = hasPending ? pending : value;
  const selectedDate = Array.isArray(working) ? working[0] : working;
  const [viewYear, setViewYear] = React.useState((selectedDate ?? new Date()).getFullYear());
  const periodDate = (date: Date) => pickerPeriodStart(date, picker, dayPickerLocale);
  const emit = (next: Date | Date[] | undefined) => {
    if (!isControlled) setInternalValue(next);
    if (props.multiple)
      props.onValueChange?.(Array.isArray(next) ? next : next ? [next] : undefined);
    else props.onValueChange?.(Array.isArray(next) ? next[0] : next);
  };
  // Local text mirrors the input while the user types a (possibly incomplete) date; the committed
  // value flows back through `onValueChange`. Kept in sync whenever the controlled `value` changes.
  const [text, setText] = React.useState(() => display(value));

  React.useEffect(() => {
    setText(
      Array.isArray(value)
        ? value.map((date) => formatPickerDate(date, format, locale)).join(", ")
        : formatPickerDate(value, format, locale, Boolean(showTime)),
    );
  }, [value, format, locale, showTime]);

  const resolvedPlaceholder = placeholder ?? t("dataEntry.datePicker.placeholder") ?? ISO_HINT;

  const clear = () => {
    emit(undefined);
    setText("");
  };

  // One trailing action: clear when permitted, otherwise the calendar trigger.
  const showClear = allowClear && text !== "" && !disabled;

  const choose = (input: Date | Date[] | undefined) => {
    let date = input;
    if (Array.isArray(date)) {
      if (date.some((day) => !allowed(day))) return;
      if (order) date = [...date].sort((a, b) => +a - +b);
    } else if (date) {
      date = periodDate(date);
      if (!allowed(date) || (!needConfirm && !timeAllowed(date))) return;
      if (multiple) {
        const current = Array.isArray(working) ? working : [];
        date = current.some((day) => +day === +date!)
          ? current.filter((day) => +day !== +date!)
          : [...current, date];
        if (order) date.sort((a, b) => +a - +b);
      }
    }
    if (needConfirm) {
      setPending(date);
      setHasPending(true);
    } else {
      emit(date);
      setText(display(date));
    }
  };
  const commit = (raw: string) => {
    if (!raw.trim()) {
      choose(undefined);
      return;
    }
    const parsed = parse(raw);
    if (parsed && allowed(parsed)) choose(parsed);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {(format || showTime || multiple || needConfirm || preserveInvalidOnBlur) && resolvedName ? (
        <input
          type="hidden"
          disabled={disabled}
          name={resolvedName}
          value={
            showTime
              ? ((Array.isArray(value) ? value[0] : value)?.toISOString() ?? "")
              : Array.isArray(value)
                ? value.map(toIsoDate).join(",")
                : toIsoDate(value)
          }
        />
      ) : null}
      {/* Anchor the calendar to the whole FIELD wrapper (a plain div with a reliable ref) so
       * align="start" drops it under the field's leading edge — the international date-picker
       * convention (Google/Ant/MUI), not flush to the trailing icon. */}
      <PopoverAnchor asChild>
        <div className={cn("relative", className)}>
          <Input
            id={id}
            name={
              format || showTime || multiple || needConfirm || preserveInvalidOnBlur
                ? ""
                : resolvedName
            }
            ref={ref}
            size={size}
            status={status}
            variant={variant}
            readOnly={inputReadOnly || multiple}
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

            trailingIcon={
              <span className="ui-time-picker-affix">
                {showClear ? (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={t("common.clear") ?? "Clear"}
                    onClick={(event) => {
                      event.stopPropagation();
                      event.currentTarget
                        .closest("div")
                        ?.querySelector<HTMLInputElement>("input:not([type=hidden])")
                        ?.focus();
                      clear();
                    }}
                    className="ui-control-inline-affix-action"
                  >
                    <X className="ui-control-inline-affix-icon" aria-hidden="true" />
                  </button>
                ) : (
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
                )}
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
              } else if (event.key === "Enter") {
                const parsed = parse(text);
                if (parsed && allowed(parsed) && timeAllowed(parsed)) {
                  const next = periodDate(parsed);
                  emit(next);
                  setText(display(parsed));
                  setOpen(false);
                }
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
              const parsed = parse(event.target.value);
              const accepted =
                parsed && allowed(parsed) && timeAllowed(parsed) ? parsed : undefined;
              if (!preserveInvalidOnBlur) setText(accepted ? display(accepted) : display(value));
            }}
          />
          <PopoverContent
            id={dialogId}
            role="dialog"
            aria-label={t("dataEntry.datePicker.openCalendar") ?? "Calendar"}
            className="ui-control-panel-flush"
            side={placement.startsWith("top") ? "top" : "bottom"}
            align={placement.endsWith("end") ? "end" : "start"}
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            {presets?.length ? (
              <Flex wrap gap="xs" pad="sm">
                {presets.map((preset, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => {
                      const date =
                        typeof preset.value === "function" ? preset.value() : preset.value;
                      if (!allowed(date)) return;
                      choose(date);
                      if (!needConfirm && !multiple) setOpen(false);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </Flex>
            ) : null}
            {picker === "date" || picker === "week" ? (
              multiple ? (
                <Calendar
                  mode="multiple"
                  selected={Array.isArray(working) ? working : []}
                  defaultMonth={selectedDate}
                  locale={dayPickerLocale}
                  onSelect={choose}
                  disabled={(day) => !allowed(day)}
                  cellRender={cellRender}
                  showWeekNumber={showWeek}
                  startMonth={minimum}
                  endMonth={maximum}
                  showToday={showToday}
                  showClose={showClose}
                  onClose={() => setOpen(false)}
                />
              ) : (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  defaultMonth={selectedDate}
                  showWeekNumber={showWeek}
                  onSelect={(date) => {
                    if (date && showTime && selectedDate)
                      date.setHours(
                        selectedDate.getHours(),
                        selectedDate.getMinutes(),
                        selectedDate.getSeconds(),
                      );
                    choose(date);
                    if (!needConfirm && !multiple) setOpen(false);
                  }}
                  locale={dayPickerLocale}
                  disabled={[
                    ...(minimum ? [{ before: minimum }] : []),
                    ...(maximum ? [{ after: maximum }] : []),
                    ...(disabledDate ? [disabledDate] : []),
                  ]}
                  cellRender={cellRender}
                  startMonth={minimum}
                  endMonth={maximum}
                  showToday={showToday}
                  showClose={showClose}
                  onClose={() => setOpen(false)}
                />
              )
            ) : (
              <div className="ui-month-picker-panel">
                <Flex justify="between" align="center">
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={t("dataEntry.monthPicker.previousYear")}
                    onClick={() => setViewYear(viewYear - (picker === "year" ? 12 : 1))}
                  >
                    <ChevronLeft aria-hidden="true" />
                  </Button>
                  <span aria-live="polite">
                    {new Intl.NumberFormat(locale, { useGrouping: false }).format(viewYear)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={t("dataEntry.monthPicker.nextYear")}
                    onClick={() => setViewYear(viewYear + (picker === "year" ? 12 : 1))}
                  >
                    <ChevronRight aria-hidden="true" />
                  </Button>
                </Flex>
                <div className="ui-month-picker-grid">
                  {Array.from({ length: picker === "quarter" ? 4 : 12 }, (_, index) => {
                    const date =
                      picker === "year"
                        ? new Date(viewYear + index, 0, 1)
                        : new Date(viewYear, index * (picker === "quarter" ? 3 : 1), 1);
                    const label =
                      picker === "year"
                        ? new Intl.DateTimeFormat(locale, { year: "numeric" }).format(date)
                        : picker === "quarter"
                          ? t("dataEntry.datePicker.quarter", { quarter: index + 1 })
                          : new Intl.DateTimeFormat(locale, { month: "short" }).format(date);
                    const selected = (
                      Array.isArray(working) ? working : working ? [working] : []
                    ).some((day) => +periodDate(day) === +date);
                    return (
                      <Button
                        key={index}
                        type="button"
                        variant={selected ? "default" : "ghost"}
                        aria-pressed={selected}
                        disabled={!allowed(date)}
                        onClick={() => {
                          choose(date);
                          if (!needConfirm && !multiple) setOpen(false);
                        }}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            {showTime ? (
              <Flex pad="sm">
                <TimePicker
                  {...(typeof showTime === "object" ? showTime : {})}
                  aria-label={t("dataEntry.timePicker.openPicker")}
                  value={
                    selectedDate
                      ? [
                          selectedDate.getHours(),
                          selectedDate.getMinutes(),
                          ...(typeof showTime === "object" && showTime.showSeconds
                            ? [selectedDate.getSeconds()]
                            : []),
                        ]
                          .map((n) => String(n).padStart(2, "0"))
                          .join(":")
                      : ""
                  }
                  onValueChange={(time) => {
                    if (!time) return;
                    const date = new Date(selectedDate ?? new Date());
                    const [h, m, sec = 0] = time.split(":").map(Number);
                    date.setHours(h, m, sec, 0);
                    choose(date);
                  }}
                />
              </Flex>
            ) : null}
            {needConfirm ? (
              <Flex pad="sm" justify="end">
                <Button
                  type="button"
                  disabled={!selectedDate || !allowed(selectedDate) || !timeAllowed(selectedDate)}
                  onClick={() => {
                    if (selectedDate && allowed(selectedDate) && timeAllowed(selectedDate)) {
                      emit(working);
                      setText(display(working));
                      setOpen(false);
                    }
                  }}
                >
                  {t("dataEntry.timePicker.confirm")}
                </Button>
              </Flex>
            ) : null}
            {renderExtraFooter?.()}
          </PopoverContent>
        </div>
      </PopoverAnchor>
    </Popover>
  );
}

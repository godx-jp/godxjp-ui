import * as React from "react";
import { ArrowRight, CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { toIsoDate } from "../../lib/datetime";
import {
  formatPickerDate,
  parsePickerDate,
  pickerDateAllowed,
} from "../../lib/datetime/picker-format";
import { Button } from "../general/button";
import { Flex } from "../layout/flex";
import {
  CONTROL_VARIANT_CHROME_CLASS,
  CONTROL_STATUS_CHROME_CLASS,
  controlAppearanceAttributes,
} from "./control-appearance";
import { useControlledLatch } from "../../lib/hooks";
import { pickGroupFieldA11y, useFieldIdentity } from "../../lib/field-a11y";
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
 * (the established RangePicker convention): `[ from → to  ✕ 📅 ]`. The two inner fields stay
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
  showToday,
  showClose,
  fromDate,
  toDate,
  disabledDate,
  cellRender,
  allowClear = true,
  format,
  parseFormat,
  minDate,
  maxDate,
  showWeek,
  presets,
  needConfirm = false,
  allowEmpty = [true, true],
  order = true,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  inputReadOnly,
  preserveInvalidOnBlur,
  placement = "bottom-start",
  renderExtraFooter,
  size,
  status,
  variant = "outlined",
  ref,
  ...ariaProps
}: DateRangePickerProp) {
  const { t } = useTranslation();
  const { dayPickerLocale, locale } = usePickerLocales(localeProp);
  const appearance = controlAppearanceAttributes({ status, variant });
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = !disabled && (openProp ?? internalOpen);
  const [pending, setPending] = React.useState<DateRange | undefined>();
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
  const minimum = minDate ?? fromDate;
  const maximum = maxDate ?? toDate;
  const allowed = (date: Date) => pickerDateAllowed(date, minimum, maximum, disabledDate);
  const display = (date: Date | undefined) => formatPickerDate(date, format, locale);
  const parse = (text: string) => parsePickerDate(text, format, parseFormat);
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
  // The two inner inputs take the SAME `_from`/`_to` suffixes this
  // control already uses for `name`, so the pair is addressable the way it already submits;
  // the group keeps the bare key. `identity` covers the NESTED case (no cloneElement reach).
  const identity = useFieldIdentity({ id: groupId, name, "data-field": groupA11y["data-field"] });
  const rangeField = groupA11y["data-field"] ?? identity["data-field"];
  const rangeName = name ?? identity.name;
  // Controlled once a defined `value` has EVER been passed (an empty form may
  // restore a saved value later); uncontrolled state seeds from `defaultValue`.
  const isControlled = useControlledLatch(valueProp !== undefined);
  const [internalValue, setInternalValue] = React.useState<DateRange | undefined>(defaultValue);
  const value = isControlled ? valueProp : internalValue;
  const working = hasPending ? pending : value;
  const [fromText, setFromText] = React.useState(() => display(value?.from));
  const [toText, setToText] = React.useState(() => display(value?.to));

  React.useEffect(() => {
    setFromText(formatPickerDate(value?.from, format, locale));
    setToText(formatPickerDate(value?.to, format, locale));
  }, [value?.from, value?.to, format, locale]);

  const resolvedPlaceholder = placeholder ?? t("dataEntry.dateRangePicker.placeholder") ?? ISO_HINT;

  const emit = (next: DateRange | undefined) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const showClear =
    allowClear && allowEmpty.every(Boolean) && Boolean(value?.from || value?.to) && !disabled;

  const clear = () => {
    emit(undefined);
    setFromText("");
    setToText("");
  };

  const validRange = (next: DateRange | undefined) =>
    Boolean(
      next &&
      (next.from ? allowed(next.from) : allowEmpty[0]) &&
      (next.to ? allowed(next.to) : allowEmpty[1]),
    );
  const choose = (range: DateRange | undefined) => {
    let next = range;
    if ((next?.from && !allowed(next.from)) || (next?.to && !allowed(next.to))) return;
    if (order && next?.from && next.to && next.from > next.to)
      next = { from: next.to, to: next.from };
    if (needConfirm) {
      setPending(next);
      setHasPending(true);
    } else emit(next);
  };
  const commitEdge = (edge: "from" | "to", raw: string) => {
    const trimmed = raw.trim();
    const parsed = parse(trimmed);
    if (trimmed && (!parsed || !allowed(parsed))) return;
    if (!trimmed && !allowEmpty[edge === "from" ? 0 : 1]) return;
    const next = { from: working?.from, to: working?.to, [edge]: parsed };
    choose(next.from || next.to ? next : undefined);
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

  // Bare inputs: the BORDER lives on the shared container (one control, RangePicker
  // RangePicker style) — an Input here would draw a second border inside it.
  const innerInputClass = "ui-month-picker-input";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {(format || needConfirm || preserveInvalidOnBlur) && rangeName ? (
        <>
          <input
            type="hidden"
            disabled={disabled}
            name={`${rangeName}_from`}
            value={toIsoDate(value?.from)}
          />
          <input
            type="hidden"
            disabled={disabled}
            name={`${rangeName}_to`}
            value={toIsoDate(value?.to)}
          />
        </>
      ) : null}
      {/* Anchor the calendar to the whole control so align="start" puts it under the
       * leading (from) edge — the international date-picker convention. */}
      <PopoverAnchor asChild>
        <div
          role="group"
          id={groupId}
          {...groupA11y}
          data-field={rangeField}
          data-size={size}
          {...appearance}
          aria-disabled={disabled ? true : undefined}
          data-state={open ? "open" : "closed"}
          className={cn(
            // One input-styled shell for the whole range — the shared composite-field box, so
            // this and the month range picker cannot drift into two slightly different fields.
            "ui-control ui-control-composite-field",
            "aria-invalid:border-destructive",
            CONTROL_VARIANT_CHROME_CLASS[variant],
            CONTROL_STATUS_CHROME_CLASS,
            className,
          )}
          onClick={() => {
            if (!disabled) setOpen(true);
          }}
        >
          <input
            id={fromId}
            data-field={rangeField ? `${rangeField}_from` : undefined}
            name={
              !format && !needConfirm && !preserveInvalidOnBlur && rangeName
                ? `${rangeName}_from`
                : undefined
            }
            ref={ref}
            readOnly={inputReadOnly}
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
              const parsed = parse(event.target.value);
              const accepted = parsed && allowed(parsed) ? parsed : undefined;
              if (!preserveInvalidOnBlur)
                setFromText(accepted ? display(accepted) : display(value?.from));
            }}
          />
          <ArrowRight className="ui-month-picker-separator-icon" aria-hidden="true" />
          <input
            id={toId}
            data-field={rangeField ? `${rangeField}_to` : undefined}
            name={
              !format && !needConfirm && !preserveInvalidOnBlur && rangeName
                ? `${rangeName}_to`
                : undefined
            }
            readOnly={inputReadOnly}
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
              const parsed = parse(event.target.value);
              const accepted = parsed && allowed(parsed) ? parsed : undefined;
              if (!preserveInvalidOnBlur)
                setToText(accepted ? display(accepted) : display(value?.to));
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
                event.currentTarget
                  .closest("div")
                  ?.querySelector<HTMLInputElement>("input:not([type=hidden])")
                  ?.focus();
                clear();
              }}
            >
              <X className="ui-month-picker-icon" aria-hidden="true" />
            </button>
          ) : (
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
          )}
          <PopoverContent
            className="ui-control-panel-flush"
            side={placement.startsWith("top") ? "top" : "bottom"}
            align={placement.endsWith("end") ? "end" : "start"}
            onClick={(event) => event.stopPropagation()}
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            {presets?.length ? (
              <Flex wrap gap="xs" pad="sm">
                {presets.map((preset, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const range =
                        typeof preset.value === "function" ? preset.value() : preset.value;
                      if (validRange(range)) choose(range);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </Flex>
            ) : null}
            <Calendar
              mode="range"
              selected={working}
              defaultMonth={working?.from}
              showWeekNumber={showWeek}
              // A range picker shows two months so a cross-month range can be picked without
              // navigating. The Calendar wrapper stacks them vertically below `sm` for mobile.
              numberOfMonths={2}
              onSelect={(range) => {
                choose(range);
                setFromText(display(range?.from));
                setToText(display(range?.to));
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
            {needConfirm ? (
              <Flex pad="sm" justify="end">
                <Button
                  type="button"
                  disabled={!validRange(working)}
                  onClick={() => {
                    if (validRange(working)) {
                      emit(working);
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

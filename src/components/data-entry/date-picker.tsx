import * as React from "react";
import { ArrowRight, CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import {
  formatPickerDate,
  parseIsoPeriod,
  parsePickerDate,
  pickerDateAllowed,
  pickerPeriodStart,
  toIsoPeriod,
} from "../../lib/datetime/picker-format";
import { Button } from "../general/button";
import { Flex } from "../layout/flex";
import { TimePicker } from "./time-picker";
import { useControlledLatch } from "../../lib/hooks";
import { pickFieldA11y, pickGroupFieldA11y, useFieldIdentity } from "../../lib/field-a11y";
import { cn } from "../../lib/utils";
import { resolveAllowClear } from "./control-surface";
import { CONTROL_STATUS_CHROME_CLASS, CONTROL_VARIANT_CHROME_CLASS } from "./control-appearance";
import { Input } from "./input";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Calendar } from "./calendar";
import type { DatePickerProp } from "../../props/components/data-entry.prop";
import { dateTimeFormat, numberFormat } from "../../lib/intl-cache";

export type {
  DatePickerProp,
  DatePickerProp as DatePickerProps,
} from "../../props/components/data-entry.prop";

const ISO_HINT = "yyyy-mm-dd";

/** Granularities that swap the day grid for a period grid. */
const PERIOD_PICKERS = new Set(["month", "quarter", "year"]);

/** The period grid's column count, mirroring `.ui-month-picker-grid`'s `repeat(3, …)`. */
const PERIOD_COLUMNS = 3;

type Picker = NonNullable<DatePickerProp["picker"]>;

/** What a field of this granularity looks like when empty, in the format it accepts. */
const PERIOD_HINT: Record<Picker, string> = {
  date: ISO_HINT,
  week: "yyyy-Www",
  month: "yyyy-mm",
  quarter: "yyyy-mm",
  year: "yyyy",
};

/**
 * DatePicker — ONE date control, WAI-ARIA date combobox. A real, typeable `<input>` holds the
 * value (form-submittable via `name`, screen-reader friendly, e2e-testable by filling the input);
 * the panel is the visual affordance.
 *
 * Two axes: `picker` sets the GRANULARITY (day · week · month · quarter · year), `range` sets the
 * CARDINALITY (one date, `multiple` dates, or a two-endpoint `DateRange`). This replaces the four
 * components this package used to ship — `DateRangePicker`, `MonthPicker`, `MonthRangePicker` were
 * separate copies of this same machine, and every one of them had drifted: a disabled picker that
 * still opened, bounds that greyed a chevron and clamped nothing, an unhandled Enter key, and a
 * `name` that submitted `2026/03`. Written once, those are fixed on all eight combinations.
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
    allowClear,
    triggerLabel,
    format: formatProp,
    parseFormat,
    minDate,
    maxDate,
    showWeek,
    showTime,
    defaultPickerValue,
    pickerValue,
    presets,
    multiple = false,
    range = false,
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
    ...rest
  } = props as DatePickerProp & {
    range?: boolean;
    multiple?: boolean;
    allowEmpty?: [boolean, boolean];
    value?: Date | Date[] | DateRange;
    defaultValue?: Date | Date[] | DateRange;
    presets?: { label: React.ReactNode; value: unknown }[];
  };
  const { allowEmpty = [true, true] as [boolean, boolean], ...ariaProps } = rest;
  const format =
    formatProp ??
    (typeof showTime === "object" && showTime.showSeconds ? "yyyy-MM-dd HH:mm:ss" : undefined);
  const { t } = useTranslation();
  const { dayPickerLocale, locale } = usePickerLocales(localeProp);
  const isPeriod = PERIOD_PICKERS.has(picker);
  // `disabled` is scalar everywhere except a range, where antd lets it lock ONE endpoint:
  // "the start is fixed by the contract, only the end is negotiable". Everything below reads the
  // pair, so the scalar case is just the pair with both halves equal — no second code path.
  const disabledEdges: [boolean, boolean] = Array.isArray(disabled)
    ? disabled
    : [Boolean(disabled), Boolean(disabled)];
  const allDisabled = disabledEdges[0] && disabledEdges[1];
  const anyDisabled = disabledEdges[0] || disabledEdges[1];
  const edgeDisabled = (edge: "from" | "to") => disabledEdges[edge === "from" ? 0 : 1];

  // ── ONE open machine ────────────────────────────────────────────────────────────────────────
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  // A disabled control is inert, controlled `open` or not. `MonthPicker` and `MonthRangePicker`
  // read the controlled prop straight through, so `<MonthPicker disabled open />` rendered a live
  // grid over a dead field; only this guard has ever been correct.
  const open = !allDisabled && (openProp ?? internalOpen);
  const [pending, setPending] = React.useState<Date | Date[] | DateRange | undefined>();
  const [hasPending, setHasPending] = React.useState(false);
  const setOpen = (next: boolean) => {
    // `inputReadOnly` is NOT a second `disabled`. antd defines it as "set the readonly attribute of
    // the input" — its purpose is to keep the mobile virtual keyboard down while the panel stays
    // the way you pick. The two month pickers had it refuse to open at all, which made it a
    // synonym for the `disabled` this component already has, and left "pick by grid only" —
    // the one thing it is for — inexpressible. antd's meaning wins.
    if (allDisabled && next) return;
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
    if (!next) {
      setHasPending(false);
      setPending(undefined);
    }
  };

  // ── ONE bounds predicate, enforced on BOTH routes into the value ─────────────────────────────
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

  // Display follows the GRANULARITY, not the day: a month field reads `2026-03`, a year field
  // `2026`, a week field `2026-W07`. All of them are ISO reduced forms, so what the user sees is
  // what the field submits — which `MonthPicker`, showing `2026/03` and submitting the same, was
  // consistent about in the one way that does not help.
  const display = (date: Date | undefined): string =>
    format || showTime
      ? formatPickerDate(date, format, locale, Boolean(showTime))
      : toIsoPeriod(date, picker);
  const displayAll = (date: Date | Date[] | undefined): string =>
    Array.isArray(date) ? date.map((day) => display(day)).join(", ") : display(date);
  const parse = (text: string) =>
    parsePickerDate(text, format, parseFormat, Boolean(showTime)) ?? parseIsoPeriod(text, picker);
  const periodDate = (date: Date) => pickerPeriodStart(date, picker, dayPickerLocale);

  // ── Identity / a11y. A range has no single labelable focus target (two inputs), so its shell is
  // a role="group"; a single field forwards the FormField contract onto the input itself. ────────
  const fieldA11y = range ? pickGroupFieldA11y(ariaProps) : pickFieldA11y(ariaProps);
  const identity = useFieldIdentity({ id, name, "data-field": fieldA11y["data-field"] });
  const resolvedName = name ?? identity.name;
  const resolvedField = fieldA11y["data-field"] ?? identity["data-field"];
  const reactId = React.useId();
  const rootId = id ?? reactId;
  const dialogId = `${rootId}-dialog`;
  const fromId = `${rootId}-from`;
  const toId = `${rootId}-to`;

  // ── ONE value latch. Controlled once a defined `value` has EVER been passed — a controlled
  // `value={undefined}` (no selection) isn't mistaken for uncontrolled, and an empty-mounted form
  // can still restore a saved value later. Uncontrolled state seeds from `defaultValue`. ─────────
  const isControlled = useControlledLatch(valueProp !== undefined);
  const [internalValue, setInternalValue] = React.useState<Date | Date[] | DateRange | undefined>(
    defaultValue,
  );
  const value = isControlled ? valueProp : internalValue;
  const working = hasPending ? pending : value;
  const rangeValue = range ? (working as DateRange | undefined) : undefined;
  const selectedDate = range
    ? rangeValue?.from
    : Array.isArray(working)
      ? working[0]
      : (working as Date | undefined);

  const emit = (next: Date | Date[] | DateRange | undefined) => {
    if (!isControlled) setInternalValue(next);
    const onValueChange = props.onValueChange as ((next: unknown) => void) | undefined;
    // Each cardinality keeps its own callback type, so a consumer never has to narrow what it gets.
    if (range) onValueChange?.(next);
    else if (multiple) onValueChange?.(Array.isArray(next) ? next : next ? [next] : undefined);
    else onValueChange?.(Array.isArray(next) ? next[0] : next);
  };

  // ── Text mirrors. One per visible input: the single field has one, the range has two. ─────────
  // `value` is the COMMITTED value; `working` may hold an unconfirmed pick. The text mirrors and
  // the native submission follow the committed one — a pending pick is not a value yet.
  const committedSingle = range ? undefined : (value as Date | Date[] | undefined);
  const committedRange = range ? (value as DateRange | undefined) : undefined;
  const [text, setText] = React.useState(() => (range ? "" : displayAll(committedSingle)));
  const [fromText, setFromText] = React.useState(() => display(committedRange?.from));
  const [toText, setToText] = React.useState(() => display(committedRange?.to));

  const committedFrom = committedRange?.from;
  const committedTo = committedRange?.to;
  React.useEffect(() => {
    if (range) {
      setFromText(display(committedFrom));
      setToText(display(committedTo));
    } else {
      setText(displayAll(committedSingle));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, value, committedFrom, committedTo, format, locale, showTime]);

  // ── ONE panel-view anchor, for both panels ───────────────────────────────────────────────────
  // The panel follows the value at rest — a `<DatePicker picker="month" value={2020-01} />` opens
  // on 2020, not on this year — unless the caller says otherwise. `pickerValue` is the controlled
  // form and always wins; `defaultPickerValue` is re-applied on every OPEN, which is antd's own
  // wording ("will be reset when panel open") and the reason it needs no reconciliation with the
  // value: opening is the only moment either of them speaks.
  const valueAnchor = range
    ? committedRange?.from
    : Array.isArray(committedSingle)
      ? committedSingle[0]
      : committedSingle;
  const [internalView, setInternalView] = React.useState<Date | undefined>(
    () => defaultPickerValue ?? valueAnchor,
  );
  const viewAnchor = pickerValue ?? internalView ?? new Date();
  const viewYear = viewAnchor.getFullYear();
  const setViewAnchor = (next: Date) => {
    if (pickerValue === undefined) setInternalView(next);
  };
  const setViewYear = (year: number) => setViewAnchor(new Date(year, viewAnchor.getMonth(), 1));
  React.useEffect(() => {
    if (open) setInternalView(defaultPickerValue ?? valueAnchor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const resolvedPlaceholder =
    placeholder ??
    (isPeriod
      ? t("dataEntry.monthPicker.placeholder")
      : range
        ? t("dataEntry.dateRangePicker.placeholder")
        : t("dataEntry.datePicker.placeholder")) ??
    PERIOD_HINT[picker];

  // ── ONE clear. antd `allowClear`, incl. its `{ clearIcon, label }` form — the SAME
  // `resolveAllowClear` the select family routes through, so "clear this field" is one mechanism
  // across the library. ────────────────────────────────────────────────────────────────────────
  const clearControl = resolveAllowClear(allowClear, true, t("common.clear") ?? "Clear");
  const showClear =
    clearControl.enabled &&
    !anyDisabled &&
    (range
      ? allowEmpty.every(Boolean) && Boolean(committedRange?.from || committedRange?.to)
      : text !== "");
  const clear = () => {
    emit(undefined);
    setText("");
    setFromText("");
    setToText("");
  };

  // ── ONE commit path ─────────────────────────────────────────────────────────────────────────
  const validRange = (next: DateRange | undefined) =>
    Boolean(
      next &&
      (next.from ? allowed(next.from) : allowEmpty[0]) &&
      (next.to ? allowed(next.to) : allowEmpty[1]),
    );

  const choose = (input: Date | Date[] | DateRange | undefined) => {
    if (range) {
      let next = input as DateRange | undefined;
      if (anyDisabled && next)
        next = {
          from: disabledEdges[0] ? committedRange?.from : next.from,
          to: disabledEdges[1] ? committedRange?.to : next.to,
        };
      if ((next?.from && !allowed(next.from)) || (next?.to && !allowed(next.to))) return;
      // `order` — ONE rule for every value shape: normalise into ascending order. On a range that
      // means SWAP the endpoints; on a `multiple` array it means SORT. The split components spelled
      // the same invariant three ways (and `MonthRangePicker` swapped with no prop at all, so it
      // could not be turned off).
      if (order && next?.from && next.to && next.from > next.to)
        next = { from: next.to, to: next.from };
      if (needConfirm) {
        setPending(next);
        setHasPending(true);
      } else emit(next);
      return;
    }
    let date = input as Date | Date[] | undefined;
    if (Array.isArray(date)) {
      if (date.some((day) => !allowed(day))) return;
      if (order) date = [...date].sort((a, b) => +a - +b);
    } else if (date) {
      date = periodDate(date);
      if (!allowed(date) || (!needConfirm && !timeAllowed(date))) return;
      if (multiple) {
        const current = Array.isArray(working) ? (working as Date[]) : [];
        const picked = date;
        date = current.some((day) => +day === +picked)
          ? current.filter((day) => +day !== +picked)
          : [...current, picked];
        if (order) date.sort((a, b) => +a - +b);
      }
    }
    if (needConfirm) {
      setPending(date);
      setHasPending(true);
    } else {
      emit(date);
      setText(displayAll(date));
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

  const commitEdge = (edge: "from" | "to", raw: string) => {
    if (edgeDisabled(edge)) return;
    const trimmed = raw.trim();
    const parsed = parse(trimmed);
    if (trimmed && (!parsed || !allowed(parsed))) return;
    if (!trimmed && !allowEmpty[edge === "from" ? 0 : 1]) return;
    const base = working as DateRange | undefined;
    const next = { from: base?.from, to: base?.to, [edge]: parsed && periodDate(parsed) };
    choose(next.from || next.to ? next : undefined);
  };

  /**
   * ONE key contract for every visible input. Enter used to be handled in exactly one of the four
   * components: typing a date into a `DateRangePicker`, a `MonthPicker` or a `MonthRangePicker` and
   * pressing Enter did nothing at all — the panel stayed open over a field the user had already
   * finished with, and in a `<form>` the keystroke fell through to submit.
   */
  const keyHandlers = (onEnter: () => void) => ({
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === "Enter") {
        event.preventDefault();
        onEnter();
      } else if (event.key === "Escape" && open) {
        setOpen(false);
      }
    },
  });

  const enterSingle = () => {
    const parsed = parse(text);
    if (parsed && allowed(parsed) && timeAllowed(parsed)) {
      const next = periodDate(parsed);
      emit(next);
      setText(display(parsed));
    }
    setOpen(false);
  };
  const enterEdge = (edge: "from" | "to") => () => {
    commitEdge(edge, edge === "from" ? fromText : toText);
    setOpen(false);
  };

  // ── Native submission. The VISIBLE input may carry `name` only while what it DISPLAYS is already
  // the canonical ISO string; the moment the two diverge a hidden input owns `name`. `picker` is
  // part of that test now: a month field displays "3月" or "Mar" and must still submit `2026-03`. ─
  const displayIsCanonical =
    !format &&
    !showTime &&
    !multiple &&
    !needConfirm &&
    !preserveInvalidOnBlur &&
    picker === "date";
  const isoValue = (date: Date | undefined) =>
    showTime ? (date?.toISOString() ?? "") : toIsoPeriod(date, picker);

  const hiddenFields = displayIsCanonical ? null : range ? (
    <>
      <input
        type="hidden"
        disabled={allDisabled}
        name={`${resolvedName}_from`}
        value={isoValue(committedRange?.from)}
      />
      <input
        type="hidden"
        disabled={allDisabled}
        name={`${resolvedName}_to`}
        value={isoValue(committedRange?.to)}
      />
    </>
  ) : (
    <input
      type="hidden"
      disabled={allDisabled}
      name={resolvedName}
      value={
        Array.isArray(committedSingle)
          ? committedSingle.map((day) => isoValue(day)).join(",")
          : isoValue(committedSingle)
      }
    />
  );

  // ── The panel ───────────────────────────────────────────────────────────────────────────────
  const periodCells = picker === "quarter" ? 4 : 12;
  const periodPage = (year: number) =>
    Array.from({ length: periodCells }, (_, index) =>
      picker === "year"
        ? new Date(year + index, 0, 1)
        : new Date(year, index * (picker === "quarter" ? 3 : 1), 1),
    );
  const periodDateAt = (index: number) => periodPage(viewYear)[index];
  const periodRow = (row: number) =>
    Array.from({ length: PERIOD_COLUMNS }, (_, column) => row * PERIOD_COLUMNS + column).filter(
      (index) => index < periodCells,
    );
  // A chevron greys out only when the ENTIRE page behind it is out of bounds — the affordance,
  // on top of the per-cell clamp below rather than instead of it, which is where the two month
  // pickers stopped.
  const pageStep = picker === "year" ? periodCells : 1;
  // Called from inside `renderPeriodPanel` only. Each one allocates a 12-Date page, and neither is
  // meaningful for a day picker — see the note on `renderPeriodPanel`.
  const prevDisabled = () =>
    !pickerDateAllowed(periodPage(viewYear - pageStep)[periodCells - 1], minimum, undefined);
  const nextDisabled = () =>
    !pickerDateAllowed(periodPage(viewYear + pageStep)[0], undefined, maximum);
  const periodLabel = (date: Date, index: number) =>
    picker === "year"
      ? dateTimeFormat(locale, { year: "numeric" }).format(date)
      : picker === "quarter"
        ? (t("dataEntry.datePicker.quarter", { quarter: index + 1 }) ?? `Q${index + 1}`)
        : dateTimeFormat(locale, { month: "short" }).format(date);

  const periodPick = (date: Date) => {
    if (!range) {
      choose(date);
      if (!needConfirm && !multiple) setOpen(false);
      return;
    }
    // Two-step range pick with reset-on-complete: a pick while the range is empty or already
    // COMPLETE starts a new one; a pick while only `from` is held completes it.
    const base = working as DateRange | undefined;
    const pendingFrom = base?.from && !base.to ? base.from : undefined;
    if (!pendingFrom) {
      choose({ from: date, to: undefined });
      return;
    }
    choose({ from: pendingFrom, to: date });
    if (!needConfirm) setOpen(false);
  };

  /*
   * A FUNCTION, not a const holding JSX, and the same for `renderDayPanel` below. Building a JSX
   * tree EVALUATES every child expression in it, so `const a = <X/>; const b = <Y/>; return cond ?
   * a : b` builds both and throws one away. Measured for a closed `picker="date"` instance, which
   * never shows this panel at all: 168 `new Date()` allocations per instance, 12 of them behind
   * `periodDateAt` in the grid below and the rest behind `prevDisabled`/`nextDisabled` (gh#557).
   * Multiply by the reporter's 8,262 rows.
   */
  const renderPeriodPanel = () => (
    <div className="ui-month-picker-panel">
      <div className="ui-month-picker-nav">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={prevDisabled()}
          aria-label={t("dataEntry.monthPicker.previousYear") ?? "Previous year"}
          className="ui-month-picker-nav-button"
          onClick={() => setViewYear(viewYear - pageStep)}
        >
          <ChevronLeft className="ui-month-picker-icon" aria-hidden="true" />
        </Button>
        <span className="ui-month-picker-nav-label" aria-live="polite">
          {numberFormat(locale, { useGrouping: false }).format(viewYear)}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={nextDisabled()}
          aria-label={t("dataEntry.monthPicker.nextYear") ?? "Next year"}
          className="ui-month-picker-nav-button"
          onClick={() => setViewYear(viewYear + pageStep)}
        >
          <ChevronRight className="ui-month-picker-icon" aria-hidden="true" />
        </Button>
      </div>
      {/* A REAL grid: `role="grid"` obliges `row` children and a row obliges `gridcell` children.
       * `MonthPicker` put the role on a div full of bare buttons, which axe flags as
       * `aria-required-children` — and its own a11y test never opened the panel, so nothing saw
       * it. Both wrappers are `display: contents`, so the cells stay direct grid items and the
       * 3-column shape is untouched. */}
      <div role="grid" aria-label={String(viewYear)} className="ui-month-picker-grid">
        {Array.from({ length: Math.ceil(periodCells / PERIOD_COLUMNS) }, (_, row) => (
          <div role="row" className="ui-month-picker-row" key={row}>
            {periodRow(row).map((index) => {
              const date = periodDateAt(index);
              const selected = range
                ? [rangeValue?.from, rangeValue?.to].some(
                    (edge) => edge && +periodDate(edge) === +date,
                  )
                : (Array.isArray(working) ? working : working ? [working as Date] : []).some(
                    (day) => +periodDate(day) === +date,
                  );
              const inRange =
                range && rangeValue?.from && rangeValue.to
                  ? +date > +periodDate(rangeValue.from) && +date < +periodDate(rangeValue.to)
                  : false;
              return (
                <div role="gridcell" className="ui-month-picker-gridcell" key={index}>
                  <Button
                    type="button"
                    variant={selected ? "default" : inRange ? "secondary" : "ghost"}
                    size="sm"
                    aria-pressed={selected}
                    // The bounds are enforced HERE, on the cell, not only on the year chevrons. The two
                    // month pickers greyed the chevrons out of `fromYear`/`toYear` and left every cell
                    // live, so an out-of-range month stayed one click (or one keystroke) away.
                    disabled={!allowed(date)}
                    className="ui-month-picker-cell"
                    onClick={() => periodPick(date)}
                  >
                    {periodLabel(date, index)}
                  </Button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const calendarBounds = [
    ...(minimum ? [{ before: minimum }] : []),
    ...(maximum ? [{ after: maximum }] : []),
    ...(disabledDate ? [disabledDate] : []),
  ];
  const calendarShared = {
    // The day grid takes its month from the SAME anchor the period grid uses, so `pickerValue` and
    // `defaultPickerValue` mean one thing at every granularity.
    month: viewAnchor,
    onMonthChange: setViewAnchor,
    locale: dayPickerLocale,
    cellRender,
    showWeekNumber: showWeek,
    startMonth: minimum,
    endMonth: maximum,
    showToday,
    showClose,
    onClose: () => setOpen(false),
  } as const;

  const renderDayPanel = () =>
    range ? (
      <Calendar
        mode="range"
        selected={rangeValue}
        // A range picker shows two months so a cross-month range can be picked without navigating.
        numberOfMonths={2}
        onSelect={(next) => {
          choose(next);
          setFromText(display(next?.from));
          setToText(display(next?.to));
        }}
        disabled={calendarBounds}
        {...calendarShared}
      />
    ) : multiple ? (
      <Calendar
        mode="multiple"
        selected={Array.isArray(working) ? (working as Date[]) : []}
        onSelect={choose}
        disabled={(day) => !allowed(day)}
        {...calendarShared}
      />
    ) : (
      <Calendar
        mode="single"
        selected={selectedDate}
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
        disabled={calendarBounds}
        {...calendarShared}
      />
    );

  const trailing = showClear ? (
    <button
      type="button"
      tabIndex={-1}
      aria-label={clearControl.label}
      onClick={(event) => {
        event.stopPropagation();
        event.currentTarget
          .closest("div")
          ?.querySelector<HTMLInputElement>("input:not([type=hidden])")
          ?.focus();
        clear();
      }}
      className={
        range
          ? "text-muted-foreground hover:text-foreground shrink-0"
          : "ui-control-inline-affix-action"
      }
    >
      {clearControl.clearIcon ?? (
        <X
          className={range ? "ui-month-picker-icon" : "ui-control-inline-affix-icon"}
          aria-hidden="true"
        />
      )}
    </button>
  ) : (
    <PopoverTrigger asChild>
      <button
        type="button"
        disabled={allDisabled}
        tabIndex={-1}
        // `triggerLabel` first: three date fields on one screen otherwise give a screen reader
        // three buttons with the identical name and nothing to tell them apart (gh#551).
        aria-label={
          triggerLabel ??
          (isPeriod
            ? t("dataEntry.monthPicker.openGrid")
            : range
              ? t("dataEntry.dateRangePicker.openCalendar")
              : t("dataEntry.datePicker.openCalendar")) ??
          "Open calendar"
        }
        className={
          range
            ? "text-muted-foreground hover:text-foreground shrink-0"
            : "ui-control-inline-affix-action"
        }
      >
        <CalendarIcon
          className={range ? "ui-month-picker-icon" : "ui-control-inline-affix-icon"}
          aria-hidden="true"
        />
      </button>
    </PopoverTrigger>
  );

  const panel = (
    <PopoverContent
      id={dialogId}
      role="dialog"
      aria-label={
        (isPeriod ? t("dataEntry.monthPicker.openGrid") : t("dataEntry.datePicker.openCalendar")) ??
        "Calendar"
      }
      className={isPeriod ? "ui-month-picker-panel" : "ui-control-panel-flush"}
      side={placement.startsWith("top") ? "top" : "bottom"}
      align={placement.endsWith("end") ? "end" : "start"}
      onOpenAutoFocus={(event) => event.preventDefault()}
      // The content is portaled but stays a React child of the shell, so panel clicks would bubble
      // to the shell's onClick={setOpen(true)} and re-open the popover right after a pick closed it.
      onClick={(event) => event.stopPropagation()}
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
                const picked =
                  typeof preset.value === "function"
                    ? (preset.value as () => Date | DateRange)()
                    : (preset.value as Date | DateRange);
                if (range) {
                  if (!validRange(picked as DateRange)) return;
                  choose(picked as DateRange);
                  return;
                }
                if (!allowed(picked as Date)) return;
                choose(picked as Date);
                if (!needConfirm && !multiple) setOpen(false);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </Flex>
      ) : null}
      {isPeriod ? renderPeriodPanel() : renderDayPanel()}
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
            disabled={
              range
                ? !validRange(rangeValue)
                : !selectedDate || !allowed(selectedDate) || !timeAllowed(selectedDate)
            }
            onClick={() => {
              if (range ? validRange(rangeValue) : selectedDate && allowed(selectedDate)) {
                emit(working);
                if (range) {
                  setFromText(display(rangeValue?.from));
                  setToText(display(rangeValue?.to));
                } else {
                  setText(displayAll(working as Date | Date[] | undefined));
                }
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
  );

  // ── The two shells ──────────────────────────────────────────────────────────────────────────
  if (range) {
    const edgeInput = (edge: "from" | "to") => (
      <input
        id={edge === "from" ? fromId : toId}
        data-field={resolvedField ? `${resolvedField}_${edge}` : undefined}
        name={displayIsCanonical && resolvedName ? `${resolvedName}_${edge}` : undefined}
        ref={edge === "from" ? ref : undefined}
        readOnly={inputReadOnly}
        aria-readonly={inputReadOnly || undefined}
        value={edge === "from" ? fromText : toText}
        disabled={edgeDisabled(edge)}
        placeholder={resolvedPlaceholder}
        inputMode="numeric"
        autoComplete="off"
        aria-label={
          (edge === "from"
            ? t("dataEntry.dateRangePicker.from")
            : t("dataEntry.dateRangePicker.to")) ?? edge
        }
        // Bare inputs: the BORDER lives on the shared container (one control, the RangePicker
        // convention) — an Input here would draw a second border inside it.
        className="ui-month-picker-input"
        {...keyHandlers(enterEdge(edge))}
        onChange={(event) => {
          if (edge === "from") setFromText(event.target.value);
          else setToText(event.target.value);
          commitEdge(edge, event.target.value);
        }}
        onBlur={(event) => {
          // antd `preserveInvalidOnBlur` — keep a half-typed edge visible instead of reverting it,
          // so a mistyped date can be corrected rather than retyped.
          if (preserveInvalidOnBlur) return;
          const parsed = parse(event.target.value);
          const accepted = parsed && allowed(parsed) ? parsed : undefined;
          const fallback = edge === "from" ? committedRange?.from : committedRange?.to;
          const next = accepted ? display(accepted) : display(fallback);
          if (edge === "from") setFromText(next);
          else setToText(next);
        }}
      />
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        {hiddenFields}
        {/* Anchor the panel to the whole control so align="start" puts it under the leading (from)
         * edge — the international date-picker convention. */}
        <PopoverAnchor asChild>
          <div
            role="group"
            id={rootId}
            {...fieldA11y}
            data-field={resolvedField}
            data-size={size}
            data-status={status}
            data-variant={variant}
            aria-disabled={allDisabled ? true : undefined}
            data-disabled={allDisabled ? "" : undefined}
            data-state={open ? "open" : "closed"}
            className={cn(
              "ui-control ui-control-composite-field",
              "aria-invalid:border-destructive",
              CONTROL_VARIANT_CHROME_CLASS[variant ?? "outlined"],
              CONTROL_STATUS_CHROME_CLASS,
              className,
            )}
            onClick={() => {
              if (!allDisabled) setOpen(true);
            }}
          >
            {edgeInput("from")}
            <ArrowRight className="ui-month-picker-separator-icon" aria-hidden="true" />
            {edgeInput("to")}
            {trailing}
            {panel}
          </div>
        </PopoverAnchor>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {hiddenFields}
      {/* Anchor the calendar to the whole FIELD wrapper (a plain div with a reliable ref) so
       * align="start" drops it under the field's leading edge — the international date-picker
       * convention (Google/Ant/MUI), not flush to the trailing icon. */}
      <PopoverAnchor asChild>
        <div className={cn("relative", className)}>
          <Input
            // Always an id, injected or generated — Chrome flags a form field without one, and a
            // FormField label needs something to point `htmlFor` at.
            id={rootId}
            name={displayIsCanonical ? resolvedName : ""}
            ref={ref}
            size={size}
            status={status}
            variant={variant}
            readOnly={inputReadOnly || multiple}
            data-field={resolvedField}
            value={text}
            disabled={allDisabled}
            placeholder={resolvedPlaceholder}
            inputMode="numeric"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-controls={open ? dialogId : undefined}
            {...fieldA11y}
            trailingIcon={<span className="ui-time-picker-affix">{trailing}</span>}
            // Combobox semantics made real: clicking the field (or ArrowDown) opens the calendar —
            // the input declares aria-haspopup="dialog", so it controls the popup, not only the
            // icon. Focus stays on the input (PopoverContent.onOpenAutoFocus prevented).
            onClick={() => {
              if (!allDisabled) setOpen(true);
            }}
            {...keyHandlers(enterSingle)}
            onChange={(event) => {
              setText(event.target.value);
              commit(event.target.value);
            }}
            onBlur={(event) => {
              // Normalise a valid entry back to canonical ISO; revert an unparseable one.
              const parsed = parse(event.target.value);
              const accepted =
                parsed && allowed(parsed) && timeAllowed(parsed) ? parsed : undefined;
              if (!preserveInvalidOnBlur)
                setText(accepted ? display(accepted) : displayAll(committedSingle));
            }}
          />
          {panel}
        </div>
      </PopoverAnchor>
    </Popover>
  );
}

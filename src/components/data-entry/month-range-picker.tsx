import * as React from "react";
import { ArrowRight, CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { useControlledLatch } from "../../lib/hooks";
import { pickGroupFieldA11y, useFieldIdentity } from "../../lib/field-a11y";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../data-display/popover";
import type { MonthRangePickerProp } from "../../props/components/data-entry.prop";

export type {
  MonthRangePickerProp,
  MonthRangePickerProp as MonthRangePickerProps,
} from "../../props/components/data-entry.prop";

const YM_HINT = "yyyy/mm";

const toYmText = (d: Date | undefined): string =>
  d ? `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}` : "";

const parseYm = (raw: string): Date | undefined => {
  const m = /^(\d{4})[/-](\d{1,2})$/.exec(raw.trim());
  if (!m) return undefined;
  const month = Number(m[2]);
  if (month < 1 || month > 12) return undefined;
  return new Date(Number(m[1]), month - 1, 1);
};

const ymIndex = (d: Date): number => d.getFullYear() * 12 + d.getMonth();

/**
 * MonthRangePicker — year/month (`yyyy/MM`) RANGE rendered as ONE input-styled
 * control (Ant Design RangePicker convention): `[ from → to  ✕ 📅 ]`. The two
 * inner fields stay real, typeable `yyyy/MM` inputs (form-submittable via
 * `${name}_from` / `${name}_to`); the Ant-style month grid is the visual
 * affordance. Grid picks are two-step (from, then to — swapped when picked
 * backwards) and a pick on a COMPLETE range starts a new one (reset-on-complete).
 */
export function MonthRangePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder,
  disabled,
  className,
  id,
  name,
  fromYear,
  toYear,
  allowClear = true,
  ...ariaProps
}: MonthRangePickerProp) {
  const { t } = useTranslation();
  const { locale } = usePickerLocales();
  const [open, setOpen] = React.useState(false);
  // No single labelable focus target (two inputs) — the shell is a role="group" named by the
  // FormField label; pickGroupFieldA11y forwards aria-labelledby/-describedby (error folded in).
  const groupA11y = pickGroupFieldA11y(ariaProps);
  // Both inner inputs always carry ids (Chrome flags form fields without id/name); the group owns
  // the injected `id` so it isn't duplicated across the two inputs.
  const autoId = React.useId();
  const groupId = id ?? autoId;
  const fromId = `${groupId}-from`;
  const toId = `${groupId}-to`;
  // gh#337 — the machine key. The two inner inputs take the SAME `_from`/`_to` suffixes this
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
  const [fromText, setFromText] = React.useState(() => toYmText(value?.from));
  const [toText, setToText] = React.useState(() => toYmText(value?.to));
  // Value-at-rest: the grid opens on the year already held by the range.
  const [viewYear, setViewYear] = React.useState(() => (value?.from ?? new Date()).getFullYear());

  React.useEffect(() => {
    setFromText(toYmText(value?.from));
    setToText(toYmText(value?.to));
    if (value?.from) setViewYear(value.from.getFullYear());
  }, [value?.from, value?.to]);

  const monthLabels = React.useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: "short" });
    return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2026, i, 1)));
  }, [locale]);

  const emit = (next: DateRange | undefined) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const showClear = allowClear && Boolean(value?.from || value?.to) && !disabled;
  const prevDisabled = fromYear !== undefined && viewYear <= fromYear;
  const nextDisabled = toYear !== undefined && viewYear >= toYear;

  const clear = () => {
    emit(undefined);
    setFromText("");
    setToText("");
  };

  const commitEdge = (edge: "from" | "to", raw: string) => {
    const trimmed = raw.trim();
    // Only commit a COMPLETE yyyy/MM (or a clear) — committing a partial string
    // would let the text-mirror effect rewrite the field mid-type.
    const parsed = trimmed === "" ? undefined : parseYm(trimmed);
    if (trimmed !== "" && !parsed) return;
    const next = { from: value?.from, to: value?.to, [edge]: parsed } as DateRange;
    if (next.from && next.to && ymIndex(next.from) > ymIndex(next.to)) {
      const swapped = { from: next.to, to: next.from } as DateRange;
      emit(swapped);
      return;
    }
    emit(next.from || next.to ? next : undefined);
  };

  // Two-step grid pick with reset-on-complete: a pick while the range is empty
  // or already COMPLETE starts a new range; a pick while only `from` is held
  // completes it (swapped when picked backwards).
  const pickMonth = (picked: Date) => {
    const pendingFrom = value?.from && !value?.to ? value.from : undefined;
    if (!pendingFrom) {
      emit({ from: picked, to: undefined });
      return;
    }
    const [from, to] =
      ymIndex(picked) < ymIndex(pendingFrom) ? [picked, pendingFrom] : [pendingFrom, picked];
    emit({ from, to });
    setOpen(false);
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

  const resolvedPlaceholder = placeholder ?? t("dataEntry.monthPicker.placeholder") ?? YM_HINT;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Anchor the grid to the whole control so align="start" puts it under the
       * leading (from) edge — the international range-picker convention. */}
      <PopoverAnchor asChild>
        <div
          role="group"
          id={groupId}
          {...groupA11y}
          data-field={rangeField}
          aria-disabled={disabled ? true : undefined}
          data-disabled={disabled ? "" : undefined}
          data-state={open ? "open" : "closed"}
          className={cn("ui-control ui-control-composite-field", className)}
          onClick={() => {
            if (!disabled) setOpen(true);
          }}
        >
          <input
            id={fromId}
            data-field={rangeField ? `${rangeField}_from` : undefined}
            name={rangeName ? `${rangeName}_from` : undefined}
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
            onBlur={() => setFromText(toYmText(value?.from))}
          />
          <ArrowRight className="ui-month-picker-separator-icon" aria-hidden="true" />
          <input
            id={toId}
            data-field={rangeField ? `${rangeField}_to` : undefined}
            name={rangeName ? `${rangeName}_to` : undefined}
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
            onBlur={() => setToText(toYmText(value?.to))}
          />
          {/* ONE trailing icon: the clear (×) replaces the calendar while a range is set;
              the field itself still opens the grid (onClick). */}
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
              aria-label={t("dataEntry.monthPicker.openGrid") ?? "Open month grid"}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <CalendarIcon className="ui-month-picker-icon" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="ui-month-picker-panel"
            align="start"
            onOpenAutoFocus={(event) => event.preventDefault()}
            // The content is portaled but stays a React child of the shell div,
            // so grid clicks would bubble to its onClick={setOpen(true)} and
            // re-open the popover right after a completing pick closed it.
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ui-month-picker-nav">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={prevDisabled}
                aria-label={t("dataEntry.monthPicker.previousYear") ?? "Previous year"}
                className="ui-month-picker-nav-button"
                onClick={() => setViewYear((y) => y - 1)}
              >
                <ChevronLeft className="ui-month-picker-icon" aria-hidden="true" />
              </Button>
              <span className="ui-month-picker-nav-label" aria-live="polite">
                {viewYear}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={nextDisabled}
                aria-label={t("dataEntry.monthPicker.nextYear") ?? "Next year"}
                className="ui-month-picker-nav-button"
                onClick={() => setViewYear((y) => y + 1)}
              >
                <ChevronRight className="ui-month-picker-icon" aria-hidden="true" />
              </Button>
            </div>
            <div role="grid" aria-label={String(viewYear)} className="ui-month-picker-grid">
              {monthLabels.map((label, i) => {
                const cell = new Date(viewYear, i, 1);
                const cellIdx = ymIndex(cell);
                const fromIdx = value?.from ? ymIndex(value.from) : undefined;
                const toIdx = value?.to ? ymIndex(value.to) : undefined;
                const isEdge = cellIdx === fromIdx || cellIdx === toIdx;
                const inRange =
                  fromIdx !== undefined &&
                  toIdx !== undefined &&
                  cellIdx > fromIdx &&
                  cellIdx < toIdx;
                return (
                  <Button
                    key={label}
                    type="button"
                    variant={isEdge ? "default" : inRange ? "secondary" : "ghost"}
                    size="sm"
                    aria-pressed={isEdge}
                    className="ui-month-picker-cell"
                    onClick={() => pickMonth(cell)}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </div>
      </PopoverAnchor>
    </Popover>
  );
}

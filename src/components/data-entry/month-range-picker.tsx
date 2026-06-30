import * as React from "react";
import { ArrowRight, CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { useControlledLatch } from "../../lib/hooks";
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
}: MonthRangePickerProp) {
  const { t } = useTranslation();
  const { locale } = usePickerLocales();
  const [open, setOpen] = React.useState(false);
  // Both inner inputs always carry ids (Chrome flags form fields without id/name).
  const autoId = React.useId();
  const fromId = id ?? autoId;
  const toId = `${fromId}-to`;
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
  const innerInputClass =
    "min-w-0 flex-1 bg-transparent tabular-nums outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed";

  const resolvedPlaceholder = placeholder ?? t("dataEntry.monthPicker.placeholder") ?? YM_HINT;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Anchor the grid to the whole control so align="start" puts it under the
       * leading (from) edge — the international range-picker convention. */}
      <PopoverAnchor asChild>
        <div
          className={cn(
            "ui-control border-input bg-background flex w-full min-w-0 items-center gap-2 rounded-[var(--control-radius)] transition-[color,box-shadow] outline-none",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
            open && "border-ring ring-ring/50 ring-[3px]",
            disabled && "pointer-events-none cursor-not-allowed opacity-50",
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
            onBlur={() => setFromText(toYmText(value?.from))}
          />
          <ArrowRight className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
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
              <X className="size-4 shrink-0" aria-hidden="true" />
            </button>
          ) : (
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                tabIndex={-1}
                aria-label={t("dataEntry.monthPicker.openGrid") ?? "Open month grid"}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <CalendarIcon className="size-4 shrink-0" aria-hidden="true" />
              </button>
            </PopoverTrigger>
          )}
          <PopoverContent
            className="w-auto p-3"
            align="start"
            onOpenAutoFocus={(event) => event.preventDefault()}
            // The content is portaled but stays a React child of the shell div,
            // so grid clicks would bubble to its onClick={setOpen(true)} and
            // re-open the popover right after a completing pick closed it.
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={prevDisabled}
                aria-label={t("dataEntry.monthPicker.previousYear") ?? "Previous year"}
                className="bg-transparent opacity-70 hover:opacity-100"
                onClick={() => setViewYear((y) => y - 1)}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
              <span className="text-sm font-medium" aria-live="polite">
                {viewYear}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={nextDisabled}
                aria-label={t("dataEntry.monthPicker.nextYear") ?? "Next year"}
                className="bg-transparent opacity-70 hover:opacity-100"
                onClick={() => setViewYear((y) => y + 1)}
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <div role="grid" aria-label={String(viewYear)} className="mt-3 grid grid-cols-3 gap-1">
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
                    className="px-4 font-normal"
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

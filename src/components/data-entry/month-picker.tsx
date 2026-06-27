import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { useControlledLatch } from "../../lib/hooks";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../data-display/popover";
import type { MonthPickerProp } from "../../props/components/data-entry.prop";

export type {
  MonthPickerProp,
  MonthPickerProp as MonthPickerProps,
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

/**
 * MonthPicker — year/month (`yyyy/MM`) input with an Ant-Design-style month grid
 * popover: a year header with chevrons over a 3×4 grid of the twelve months.
 * The field stays a real, typeable input (form-submittable via `name` as
 * `yyyy-MM`); the grid is the visual affordance.
 */
export function MonthPicker({
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
}: MonthPickerProp) {
  const { t } = useTranslation();
  const { locale } = usePickerLocales();
  const [open, setOpen] = React.useState(false);
  const autoId = React.useId();
  const inputId = id ?? autoId;

  // Controlled once a defined `value` has EVER been passed (an empty form may
  // restore a saved value later); uncontrolled state seeds from `defaultValue`.
  const isControlled = useControlledLatch(valueProp !== undefined);
  const [internalValue, setInternalValue] = React.useState<Date | undefined>(defaultValue);
  const value = isControlled ? valueProp : internalValue;
  const [text, setText] = React.useState(() => toYmText(value));
  const [viewYear, setViewYear] = React.useState(() => (value ?? new Date()).getFullYear());

  React.useEffect(() => {
    setText(toYmText(value));
    if (value) setViewYear(value.getFullYear());
  }, [value]);

  const monthLabels = React.useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: "short" });
    return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2026, i, 1)));
  }, [locale]);

  const emit = (next: Date | undefined) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const showClear = allowClear && Boolean(value) && !disabled;
  const prevDisabled = fromYear !== undefined && viewYear <= fromYear;
  const nextDisabled = toYear !== undefined && viewYear >= toYear;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          className={cn(
            "ui-control border-input bg-background flex w-full min-w-0 items-center gap-2 rounded-md border px-3 shadow-xs transition-[color,box-shadow] outline-none",
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
            id={inputId}
            name={name}
            value={text}
            disabled={disabled}
            placeholder={placeholder ?? t("dataEntry.monthPicker.placeholder") ?? YM_HINT}
            inputMode="numeric"
            autoComplete="off"
            className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent tabular-nums outline-none disabled:cursor-not-allowed"
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
              const parsed = parseYm(event.target.value);
              if (parsed) emit(parsed);
              else if (event.target.value.trim() === "") emit(undefined);
            }}
            onBlur={() => setText(toYmText(value))}
          />
          {/* ONE trailing icon: the clear (×) replaces the calendar while a value is set;
              the field itself still opens the grid (onClick / ArrowDown). */}
          {showClear ? (
            <button
              type="button"
              tabIndex={-1}
              aria-label={t("common.clear") ?? "Clear"}
              className="text-muted-foreground hover:text-foreground shrink-0"
              onClick={(event) => {
                event.stopPropagation();
                emit(undefined);
                setText("");
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
            // re-open the popover right after a selecting pick closed it.
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
                const selected = value?.getFullYear() === viewYear && value?.getMonth() === i;
                return (
                  <Button
                    key={label}
                    type="button"
                    variant={selected ? "default" : "ghost"}
                    size="sm"
                    aria-pressed={selected}
                    className="px-4 font-normal"
                    onClick={() => {
                      emit(new Date(viewYear, i, 1));
                      setOpen(false);
                    }}
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

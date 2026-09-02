import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { useControlledLatch } from "../../lib/hooks";
import { pickFieldA11y, useFieldIdentity } from "../../lib/field-a11y";
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
  ...ariaProps
}: MonthPickerProp) {
  const { t } = useTranslation();
  const { locale } = usePickerLocales();
  const [open, setOpen] = React.useState(false);
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const dialogId = `${inputId}-dialog`;
  // Forward the FormField label/helper/error contract onto the typeable input (focus target).
  const fieldA11y = pickFieldA11y(ariaProps);
  // gh#337 — the machine key for a MonthPicker NESTED under a layout wrapper (a 年/月 combo is the
  // measured shape). Resolved here, not in the inner `Input`, because this component owns which
  // element carries the native `name`.
  const identity = useFieldIdentity({ id, name, "data-field": fieldA11y["data-field"] });

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
          data-disabled={disabled ? "" : undefined}
          className={cn(
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
            id={inputId}
            name={name ?? identity.name}
            data-field={fieldA11y["data-field"] ?? identity["data-field"]}
            value={text}
            disabled={disabled}
            placeholder={placeholder ?? t("dataEntry.monthPicker.placeholder") ?? YM_HINT}
            inputMode="numeric"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-controls={open ? dialogId : undefined}
            {...fieldA11y}
            className="ui-month-picker-input"
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
          {/* Clear (×) sits BESIDE the trigger, never in place of it (gh#308) — the calendar
              icon is the only visual sign this field opens a month grid; the field itself
              still opens it too (onClick / ArrowDown). */}
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
            id={dialogId}
            role="dialog"
            aria-label={t("dataEntry.monthPicker.openGrid") ?? "Month grid"}
            className="ui-month-picker-panel"
            align="start"
            onOpenAutoFocus={(event) => event.preventDefault()}
            // The content is portaled but stays a React child of the shell div,
            // so grid clicks would bubble to its onClick={setOpen(true)} and
            // re-open the popover right after a selecting pick closed it.
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
                const selected = value?.getFullYear() === viewYear && value?.getMonth() === i;
                return (
                  <Button
                    key={label}
                    type="button"
                    variant={selected ? "default" : "ghost"}
                    size="sm"
                    aria-pressed={selected}
                    className="ui-month-picker-cell"
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

import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { useControlledLatch } from "../../lib/hooks";
import { pickFieldA11y, useFieldIdentity } from "../../lib/field-a11y";
import { cn } from "../../lib/utils";
import { resolveAllowClear, resolveAriaInvalid } from "./control-surface";
import { CONTROL_STATUS_CHROME_CLASS, CONTROL_VARIANT_CHROME_CLASS } from "./control-appearance";
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
 * MonthPicker — year/month (`yyyy/MM`) input with a 12-cell month grid
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
  allowClear,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  status,
  variant,
  size,
  inputReadOnly,
  preserveInvalidOnBlur,
  placement = "bottom-start",
  renderExtraFooter,
  ref,
  ...ariaProps
}: MonthPickerProp) {
  const { t } = useTranslation();
  const { locale } = usePickerLocales();
  // Controlled/uncontrolled open (the picker-chrome contract every other picker already states):
  // `open` wins when provided, otherwise internal state seeded from `defaultOpen`; `onOpenChange`
  // fires either way. Read-only never opens.
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpenControlled = openProp !== undefined;
  const open = isOpenControlled ? openProp : internalOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next && inputReadOnly) return;
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange, inputReadOnly],
  );
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const dialogId = `${inputId}-dialog`;
  // Forward the FormField label/helper/error contract onto the typeable input (focus target).
  const fieldA11y = pickFieldA11y(ariaProps);
  // Resolved here, not in the inner `Input`, because this component owns which
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

  // antd `allowClear`, incl. its `{ clearIcon, label }` form — the same `resolveAllowClear` the
  // select family routes through, so a per-instance clear label is expressible here too.
  const clearControl = resolveAllowClear(allowClear, true, t("common.clear") ?? "Clear");
  const showClear = clearControl.enabled && Boolean(value) && !disabled && !inputReadOnly;
  const prevDisabled = fromYear !== undefined && viewYear <= fromYear;
  const nextDisabled = toYear !== undefined && viewYear >= toYear;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          data-disabled={disabled ? "" : undefined}
          data-state={open ? "open" : "closed"}
          // The same `variant` × `status` × `size` axes DateRangePicker already puts on the shared
          // composite-field shell, through the same helper — a month field and a date field in one
          // form row cannot end up on two different ladders. (`aria-invalid` belongs on the INPUT,
          // the focus target, not on this presentational shell.)
          data-size={size}
          data-status={status}
          data-variant={variant}
          className={cn(
            "ui-control ui-control-composite-field",
            "aria-invalid:border-destructive",
            CONTROL_VARIANT_CHROME_CLASS[variant ?? "outlined"],
            CONTROL_STATUS_CHROME_CLASS,
            className,
          )}
          onClick={() => {
            if (!disabled) setOpen(true);
          }}
        >
          <input
            ref={ref}
            id={inputId}
            name={name ?? identity.name}
            data-field={fieldA11y["data-field"] ?? identity["data-field"]}
            value={text}
            disabled={disabled}
            readOnly={inputReadOnly}
            placeholder={placeholder ?? t("dataEntry.monthPicker.placeholder") ?? YM_HINT}
            inputMode="numeric"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-controls={open ? dialogId : undefined}
            aria-readonly={inputReadOnly || undefined}
            {...fieldA11y}
            aria-invalid={resolveAriaInvalid(fieldA11y["aria-invalid"], status)}
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
            onBlur={() => {
              // antd `preserveInvalidOnBlur` — keep a half-typed `2026/1` visible instead of
              // reverting it, so a mistyped month can be corrected rather than retyped.
              if (!preserveInvalidOnBlur) setText(toYmText(value));
            }}
          />
          {}
          {showClear ? (
            <button
              type="button"
              tabIndex={-1}
              aria-label={clearControl.label}
              className="text-muted-foreground hover:text-foreground shrink-0"
              onClick={(event) => {
                event.stopPropagation();
                event.currentTarget
                  .closest("div")
                  ?.querySelector<HTMLInputElement>("input:not([type=hidden])")
                  ?.focus();
                emit(undefined);
                setText("");
              }}
            >
              {clearControl.clearIcon ?? <X className="ui-month-picker-icon" aria-hidden="true" />}
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
                <CalendarIcon className="ui-month-picker-icon" aria-hidden="true" />
              </button>
            </PopoverTrigger>
          )}
          <PopoverContent
            id={dialogId}
            role="dialog"
            aria-label={t("dataEntry.monthPicker.openGrid") ?? "Month grid"}
            className="ui-month-picker-panel"
            side={placement.startsWith("top") ? "top" : "bottom"}
            align={placement.endsWith("end") ? "end" : "start"}
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
            {renderExtraFooter?.()}
          </PopoverContent>
        </div>
      </PopoverAnchor>
    </Popover>
  );
}

import * as React from "react";
import { Clock, X } from "lucide-react";

import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { isValidHhmm, normalizeHhmm } from "../../lib/datetime";
import { pickFieldA11y } from "../../lib/field-a11y";
import { cn } from "../../lib/utils";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Input } from "./input";
import type { TimePickerProp } from "../../props/components/data-entry.prop";

export type {
  TimePickerProp,
  TimePickerProp as TimePickerProps,
} from "../../props/components/data-entry.prop";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function buildMinutes(step: number) {
  const safe = Math.min(60, Math.max(1, step));
  const items: number[] = [];
  for (let m = 0; m < 60; m += safe) items.push(m);
  return items;
}

function parseHhmm(value: string | undefined): { hour: number; minute: number } {
  const normalized = value ? normalizeHhmm(value) : null;
  if (!normalized) return { hour: 9, minute: 0 };
  const [h, m] = normalized.split(":").map(Number);
  return { hour: h, minute: m };
}

/** Convert a canonical 24h hour into a 12h display hour (1-12). */
function to12h(hour24: number): number {
  const h = hour24 % 12;
  return h === 0 ? 12 : h;
}

/** Compose a canonical 24h hour from a 12h display hour + meridiem. */
function from12h(hour12: number, meridiem: "am" | "pm"): number {
  const base = hour12 % 12;
  return meridiem === "pm" ? base + 12 : base;
}

interface TimePickerPanelProps {
  value: string;
  minuteStep: number;
  use12h: boolean;
  onChange: (value: string) => void;
  onDone?: () => void;
}

function TimeColumn({
  label,
  items,
  selected,
  formatItem,
  onSelect,
}: {
  label: string;
  items: number[];
  selected: number;
  formatItem: (value: number) => string;
  onSelect: (value: number) => void;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: "center" });
  }, [selected]);

  const moveFocus = (index: number) => {
    const options = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
    options?.[index]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveFocus(Math.min(items.length - 1, index + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(Math.max(0, index - 1));
        break;
      case "Home":
        e.preventDefault();
        moveFocus(0);
        break;
      case "End":
        e.preventDefault();
        moveFocus(items.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onSelect(items[index]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="ui-time-picker-column">
      <div className="ui-time-picker-column-heading">{label}</div>
      <div ref={listRef} role="listbox" aria-label={label} className="ui-time-picker-column-scroll">
        {items.map((item, index) => {
          const isSelected = item === selected;
          return (
            <button
              key={item}
              type="button"
              role="option"
              aria-selected={isSelected}
              data-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className="ui-time-picker-option"
              onClick={() => {
                onSelect(item);
              }}
              onKeyDown={(e) => onKeyDown(e, index)}
            >
              {formatItem(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimePickerPanel({ value, minuteStep, use12h, onChange, onDone }: TimePickerPanelProps) {
  const { t } = useTranslation();
  const draftId = React.useId();
  const { hour, minute } = parseHhmm(value);
  const minutes = buildMinutes(minuteStep);
  const snappedMinute = minutes.includes(minute) ? minute : minutes[0];
  const [draft, setDraft] = React.useState(value);
  const meridiem: "am" | "pm" = hour >= 12 ? "pm" : "am";

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep editable text in sync when controlled value changes.
    setDraft(value);
  }, [value]);

  const commitDraft = () => {
    const normalized = normalizeHhmm(draft);
    if (!normalized) return;
    onChange(normalized);
    onDone?.();
  };

  const commit = (next: string) => {
    onChange(next);
    onDone?.();
  };

  const hourItems = use12h
    ? Array.from({ length: 12 }, (_, i) => i + 1)
    : Array.from({ length: 24 }, (_, i) => i);
  const selectedHourItem = use12h ? to12h(hour) : hour;

  return (
    <div className="ui-time-picker-panel" data-hour-cycle={use12h ? "h12" : "h23"}>
      <div className="divide-border flex divide-x">
        <TimeColumn
          label={t("dataEntry.timePicker.hour")}
          items={hourItems}
          selected={selectedHourItem}
          formatItem={(h) => (use12h ? String(h) : pad2(h))}
          onSelect={(h) => {
            const hour24 = use12h ? from12h(h, meridiem) : h;
            onChange(`${pad2(hour24)}:${pad2(snappedMinute)}`);
          }}
        />
        <TimeColumn
          label={t("dataEntry.timePicker.minute")}
          items={minutes}
          selected={snappedMinute}
          formatItem={(m) => pad2(m)}
          onSelect={(m) => {
            commit(`${pad2(hour)}:${pad2(m)}`);
          }}
        />
        {use12h && (
          <TimeColumn
            label={t("dataEntry.timePicker.meridiem")}
            items={[0, 1]}
            selected={meridiem === "pm" ? 1 : 0}
            formatItem={(m) =>
              m === 1 ? t("dataEntry.timePicker.pm") : t("dataEntry.timePicker.am")
            }
            onSelect={(m) => {
              const nextMeridiem: "am" | "pm" = m === 1 ? "pm" : "am";
              const hour24 = from12h(to12h(hour), nextMeridiem);
              onChange(`${pad2(hour24)}:${pad2(snappedMinute)}`);
            }}
          />
        )}
      </div>
      <div className="ui-time-picker-footer">
        <Input
          id={draftId}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
          }}
          inputMode="numeric"
          autoComplete="off"
          placeholder={t("dataEntry.timePicker.typeLabel")}
          aria-label={t("dataEntry.timePicker.typeLabel")}
          className="text-center tabular-nums"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitDraft();
            }
          }}
          onBlur={() => {
            const normalized = normalizeHhmm(draft);
            if (normalized) setDraft(normalized);
          }}
        />
      </div>
    </div>
  );
}

/**
 * TimePicker — WAI-ARIA time combobox. The value lives on a real, typeable `HH:mm` `<input>` (24h
 * canonical): form-submittable (give it a `name`), screen-reader friendly, and e2e-testable by
 * filling the input.
 */
export function TimePicker({
  value: controlledValue,
  defaultValue,
  onValueChange,
  placeholder,
  disabled,
  className,
  id,
  name,
  minuteStep = 5,
  allowClear = true,
  ...ariaProps
}: TimePickerProp) {
  const { t } = useTranslation();
  const { timeFormat } = usePickerLocales();
  const use12h = timeFormat === "12h";
  const [open, setOpen] = React.useState(false);
  // Forward the FormField label/helper/error contract onto the typeable input (focus target).
  const fieldA11y = pickFieldA11y(ariaProps);
  const reactId = React.useId();
  const dialogId = `${id ?? reactId}-dialog`;
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internal;
  const resolvedPlaceholder = placeholder ?? t("dataEntry.timePicker.placeholder") ?? "hh:mm";
  // Local text mirrors the input while typing; the canonical HH:mm flows out through onValueChange.
  const [text, setText] = React.useState(value);

  React.useEffect(() => {
    setText(value);
  }, [value]);

  const setValue = (next: string) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  const clear = () => {
    setValue("");
    setText("");
  };

  // clock icon is the only visual sign this field opens a time panel, so the clear (×) sits
  // beside it instead of replacing it. Input's own `allowClear` is left alone.
  const showClear = allowClear && text !== "" && !disabled;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={cn("relative", className)}>
          {/* The clear (×) sits BESIDE the clock trigger, never in place of it (see `showClear`);
              the field itself (onClick / ArrowDown) still opens the panel. */}
          <Input
            id={id}
            name={name}
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
            // Two affix buttons + gap need more room than Input's single-icon reserve.
            className={cn("tabular-nums", showClear && "ui-control-inline-affix-pair-affixed")}
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
                    aria-label={t("dataEntry.timePicker.openPicker") ?? "Open time picker"}
                    className="ui-control-inline-affix-action"
                  >
                    <Clock className="ui-control-inline-affix-icon" aria-hidden="true" />
                  </button>
                </PopoverTrigger>
              </span>
            }
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
              const normalized = normalizeHhmm(event.target.value);
              if (normalized) setValue(normalized);
            }}
            onBlur={(event) => {
              const normalized = normalizeHhmm(event.target.value);
              setText(normalized ?? (isValidHhmm(value) ? value : ""));
            }}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        id={dialogId}
        role="dialog"
        aria-label={t("dataEntry.timePicker.openPicker") ?? "Time picker"}
        className="ui-time-picker-popover"
        align="end"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <TimePickerPanel
          value={value || "09:00"}
          minuteStep={minuteStep}
          use12h={use12h}
          onChange={(next) => {
            setValue(next);
            setText(next);
          }}
          onDone={() => {
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

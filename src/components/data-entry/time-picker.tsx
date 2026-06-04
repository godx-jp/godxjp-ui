import * as React from "react";
import { Clock } from "lucide-react";

import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { isValidHhmm, normalizeHhmm } from "../../lib/datetime";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
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
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="text-muted-foreground border-b px-1 py-1.5 text-center text-xs font-medium">
        {label}
      </div>
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        className="h-52 [scrollbar-width:thin] [scrollbar-gutter:stable] overflow-y-scroll overscroll-contain p-1"
      >
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
              className={cn(
                "hover:bg-accent flex w-full items-center justify-center rounded-md py-1.5 text-sm tabular-nums transition-colors",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
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
    <div className={use12h ? "w-52" : "w-36"}>
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
      <div className="border-t p-2">
        <Input
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
 * TimePicker — WAI-ARIA time combobox. The value lives on a real, typeable `HH:mm` `<input>`
 * (24h canonical): form-submittable (give it a `name`), screen-reader friendly, and e2e-testable
 * by filling the input. The HH/mm column popover is the visual affordance and stays in sync.
 * The column display honours the active `timeFormat` (12h shows 1-12 + AM/PM) while the canonical
 * value remains 24h `HH:mm`.
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
}: TimePickerProp) {
  const { t } = useTranslation();
  const { timeFormat } = usePickerLocales();
  const use12h = timeFormat === "12h";
  const [open, setOpen] = React.useState(false);
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

  return (
    <div className={cn("relative", className)}>
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
        className="pe-10 tabular-nums"
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            tabIndex={-1}
            aria-label={t("dataEntry.timePicker.openPicker") ?? "Open time picker"}
            className="text-muted-foreground absolute inset-y-0 end-0 h-full px-2 hover:bg-transparent"
          >
            <Clock className="size-4 shrink-0" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
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
    </div>
  );
}

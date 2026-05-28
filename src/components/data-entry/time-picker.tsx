import * as React from "react";
import { Clock } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { formatTimeOfDay, isValidHhmm, normalizeHhmm } from "../../lib/datetime";
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

interface TimePickerPanelProps {
  value: string;
  minuteStep: number;
  onChange: (value: string) => void;
  onDone?: () => void;
}

function TimeColumn({
  label,
  items,
  selected,
  onSelect,
}: {
  label: string;
  items: number[];
  selected: number;
  onSelect: (value: number) => void;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: "center" });
  }, [selected]);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="text-muted-foreground border-b px-1 py-1.5 text-center text-xs font-medium">
        {label}
      </div>
      <div
        ref={listRef}
        className="h-52 [scrollbar-width:thin] [scrollbar-gutter:stable] overflow-y-scroll overscroll-contain p-1"
      >
        {items.map((item) => (
          <button
            key={item}
            type="button"
            data-selected={item === selected}
            className={cn(
              "hover:bg-accent flex w-full items-center justify-center rounded-md py-1.5 text-sm tabular-nums transition-colors",
              item === selected && "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
            onClick={() => {
              onSelect(item);
            }}
          >
            {pad2(item)}
          </button>
        ))}
      </div>
    </div>
  );
}

function TimePickerPanel({ value, minuteStep, onChange, onDone }: TimePickerPanelProps) {
  const { t } = useTranslation();
  const { hour, minute } = parseHhmm(value);
  const minutes = buildMinutes(minuteStep);
  const snappedMinute = minutes.includes(minute) ? minute : minutes[0];
  const [draft, setDraft] = React.useState(value);

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

  return (
    <div className="w-36">
      <div className="divide-border flex divide-x">
        <TimeColumn
          label={t("dataEntry.timePicker.hour")}
          items={Array.from({ length: 24 }, (_, i) => i)}
          selected={hour}
          onSelect={(h) => {
            onChange(`${pad2(h)}:${pad2(snappedMinute)}`);
          }}
        />
        <TimeColumn
          label={t("dataEntry.timePicker.minute")}
          items={minutes}
          selected={snappedMinute}
          onSelect={(m) => {
            commit(`${pad2(hour)}:${pad2(m)}`);
          }}
        />
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

export function TimePicker({
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder,
  disabled,
  className,
  id,
  minuteStep = 5,
}: TimePickerProp) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internal;
  const resolvedPlaceholder = placeholder ?? t("dataEntry.timePicker.placeholder");

  const setValue = (next: string) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const display = value && isValidHhmm(value) ? formatTimeOfDay(value) : value || null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal tabular-nums",
            !display && "text-muted-foreground",
            className,
          )}
        >
          <Clock className="mr-2 size-4 shrink-0" aria-hidden="true" />
          {display ?? resolvedPlaceholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <TimePickerPanel
          value={value || "09:00"}
          minuteStep={minuteStep}
          onChange={setValue}
          onDone={() => {
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

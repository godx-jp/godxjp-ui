import * as React from "react";
import { Clock, X } from "lucide-react";

import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { normalizeHhmm } from "../../lib/datetime";
import { useControlledLatch } from "../../lib/hooks";
import { pickFieldA11y } from "../../lib/field-a11y";
import { cn } from "../../lib/utils";
import { resolveAllowClear } from "./control-surface";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Button } from "../general/button";
import { Input } from "./input";
import type {
  TimePickerDisabledTimeProp,
  TimePickerProp,
} from "../../props/components/data-entry.prop";

export type {
  TimePickerDisabledTimeProp,
  TimePickerProp,
  TimePickerProp as TimePickerProps,
} from "../../props/components/data-entry.prop";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function buildMinutes(step: number, limit = 60) {
  const safe = Number.isFinite(step) ? Math.min(limit, Math.max(1, Math.floor(step))) : 1;
  const items: number[] = [];
  for (let m = 0; m < limit; m += safe) items.push(m);
  return items;
}

function normalizeTime(raw: string, seconds = false): string | null {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i.exec(raw.trim());
  if (!match) return seconds ? null : normalizeHhmm(raw);
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? 0);
  if (match[4]) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (match[4].toLowerCase() === "pm" ? 12 : 0);
  }
  if (hour > 23 || minute > 59 || second > 59) return null;
  return `${pad2(hour)}:${pad2(minute)}${seconds ? `:${pad2(second)}` : ""}`;
}

function parseHhmm(value: string | undefined) {
  const [hour, minute, second] = (normalizeTime(value ?? "", true) ?? "09:00:00")
    .split(":")
    .map(Number);
  return { hour, minute, second };
}

function displayTime(value: string, pattern: string | undefined): string {
  if (!value || !pattern) return value;
  const { hour, minute, second } = parseHhmm(value);
  return pattern.replace(
    /HH|hh|H|h|mm|ss|A|a/g,
    (token) =>
      ({
        HH: pad2(hour),
        H: String(hour),
        hh: pad2(to12h(hour)),
        h: String(to12h(hour)),
        mm: pad2(minute),
        ss: pad2(second),
        A: hour >= 12 ? "PM" : "AM",
        a: hour >= 12 ? "pm" : "am",
      })[token] ?? token,
  );
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
  hourStep: number;
  secondStep: number;
  showSeconds: boolean;
  changeOnScroll?: boolean;
  use12h: boolean;
  disabledTime?: TimePickerDisabledTimeProp;
  hideDisabledOptions?: boolean;
  showNow: boolean;
  needConfirm: boolean;
  onChange: (value: string) => void;
  onDone?: () => void;
}

/**
 * Resolve `disabledTime` ONCE per render into the two predicates the columns ask.
 *
 * antd's shape is a single call returning both, so a consumer deriving them from the same source
 * (a start time, a shift window) pays for that derivation once — calling it per option would make
 * a 24×12 panel do it 288 times.
 */
function useTimeRefusals(disabledTime: TimePickerDisabledTimeProp | undefined) {
  const rules = disabledTime?.();
  const hours = rules?.disabledHours?.();
  return {
    isHourRefused: (hour: number) => hours?.includes(hour) ?? false,
    isMinuteRefused: (hour: number, minute: number) =>
      rules?.disabledMinutes?.(hour)?.includes(minute) ?? false,
  };
}

/** Is this exact `HH:mm` one the rule refuses? The gate for BOTH routes into the value. */
function isTimeRefused(value: string, disabledTime: TimePickerDisabledTimeProp | undefined) {
  if (!disabledTime) return false;
  const normalized = normalizeTime(value, true);
  if (!normalized) return false;
  const [hour, minute, second] = normalized.split(":").map(Number);
  const rules = disabledTime();
  return (
    (rules.disabledHours?.().includes(hour) ?? false) ||
    (rules.disabledMinutes?.(hour).includes(minute) ?? false) ||
    (rules.disabledSeconds?.(hour, minute).includes(second) ?? false)
  );
}

function TimeColumn({
  label,
  items,
  selected,
  formatItem,
  onSelect,
  isDisabled,
  hideDisabled = false,
  onScrollSelect,
}: {
  label: string;
  items: number[];
  selected: number;
  formatItem: (value: number) => string;
  onSelect: (value: number) => void;
  /** Refuse this option — `disabledTime` said so (gh#390). */
  isDisabled?: (value: number) => boolean;
  hideDisabled?: boolean;
  onScrollSelect?: (value: number) => void;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: "center" });
  }, [selected]);

  const visible = hideDisabled && isDisabled ? items.filter((item) => !isDisabled(item)) : items;

  React.useEffect(() => {
    const list = listRef.current;
    if (!list || !onScrollSelect) return;
    const wheel = (event: WheelEvent) => {
      if (!event.deltaY) return;
      event.preventDefault();
      const step = Math.sign(event.deltaY);
      for (
        let index = visible.indexOf(selected) + step;
        index >= 0 && index < visible.length;
        index += step
      ) {
        if (!isDisabled?.(visible[index])) {
          onScrollSelect(visible[index]);
          break;
        }
      }
    };
    list.addEventListener("wheel", wheel, { passive: false });
    return () => list.removeEventListener("wheel", wheel);
  }, [onScrollSelect, selected, visible, isDisabled]);

  /**
   * Move to the next option the rule allows, in `step` direction. A disabled option is still in
   * the DOM (that is the point of showing it) but arrowing onto it would strand the caret on
   * something Enter refuses, so the walk skips it — the same thing a native `<select>` does.
   */
  const moveFocus = (index: number, step: number) => {
    const options = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
    if (!options) return;
    for (let at = index; at >= 0 && at < visible.length; at += step) {
      if (isDisabled?.(visible[at])) continue;
      options[at]?.focus();
      return;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveFocus(Math.min(visible.length - 1, index + 1), 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(Math.max(0, index - 1), -1);
        break;
      case "Home":
        e.preventDefault();
        moveFocus(0, 1);
        break;
      case "End":
        e.preventDefault();
        moveFocus(visible.length - 1, -1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isDisabled?.(visible[index])) onSelect(visible[index]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="ui-time-picker-column">
      <div className="ui-time-picker-column-heading">{label}</div>
      <div ref={listRef} role="listbox" aria-label={label} className="ui-time-picker-column-scroll">
        {visible.map((item, index) => {
          const isSelected = item === selected;
          const refused = isDisabled?.(item) ?? false;
          return (
            <button
              key={item}
              type="button"
              role="option"
              aria-selected={isSelected}
              data-selected={isSelected}
              // `aria-disabled`, not `disabled`: a refused option stays in the a11y tree and stays
              // reachable, so a screen-reader user is told the rule exists instead of finding the
              // option silently absent (APG listbox pattern).
              aria-disabled={refused || undefined}
              data-disabled={refused || undefined}
              tabIndex={
                !refused &&
                (isSelected ||
                  (!visible.some((option) => option === selected && !isDisabled?.(option)) &&
                    index === visible.findIndex((option) => !isDisabled?.(option))))
                  ? 0
                  : -1
              }
              className="ui-time-picker-option"
              onClick={() => {
                if (!refused) onSelect(item);
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

function TimePickerPanel({
  value,
  minuteStep,
  hourStep,
  secondStep,
  showSeconds,
  changeOnScroll,
  use12h,
  disabledTime,
  hideDisabledOptions,
  showNow,
  needConfirm,
  onChange,
  onDone,
}: TimePickerPanelProps) {
  const { t } = useTranslation();
  const draftId = React.useId();
  const { isHourRefused, isMinuteRefused } = useTimeRefusals(disabledTime);
  const minutes = buildMinutes(minuteStep);
  const [draft, setDraft] = React.useState(value);
  /**
   * With `needConfirm`, a column click moves this pending value instead of the real one, and only
   * the confirm action calls `onChange`. Without it the panel behaves as it always has: select
   * commits, and the panel closes.
   */
  const [pending, setPending] = React.useState<string | null>(null);
  const working = needConfirm ? (pending ?? value) : value;
  const { hour, minute, second } = parseHhmm(working);
  const seconds = buildMinutes(secondStep);
  const time = (h: number, m: number, s = second) =>
    `${pad2(h)}:${pad2(m)}${showSeconds ? `:${pad2(s)}` : ""}`;
  const snappedMinute = minutes.includes(minute) ? minute : minutes[0];
  const meridiem: "am" | "pm" = hour >= 12 ? "pm" : "am";

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep editable text in sync when controlled value changes.
    setDraft(value);
  }, [value]);

  const commitDraft = () => {
    const normalized = normalizeTime(draft, showSeconds);
    // A refused time typed into the panel's own field is rejected exactly like an unparseable one,
    // so the keyboard cannot walk around the rule the columns enforce.
    if (!normalized || isTimeRefused(normalized, disabledTime)) return;
    choose(normalized, { done: true });
  };

  /**
   * Every choice goes through here, so `needConfirm` is decided in ONE place.
   *
   * `done` is a SEPARATE axis and it is not decoration: picking an hour leaves the panel open
   * because the minute is still unchosen, while picking a minute finishes the job and closes it.
   * Collapsing the two shut the panel on the first click and made the minute column unreachable —
   * caught by time-picker.test.tsx, which had pinned exactly this.
   */
  const choose = (next: string, { done }: { done: boolean }) => {
    if (isTimeRefused(next, disabledTime)) return;
    if (needConfirm) {
      setPending(next);
      setDraft(next);
      return;
    }
    onChange(next);
    if (done) onDone?.();
  };

  const chooseHour = (nextHour: number) => {
    const candidates = [snappedMinute, ...minutes.filter((m) => m !== snappedMinute)];
    for (const nextMinute of candidates) {
      const candidateSeconds = showSeconds ? [second, ...seconds.filter((s) => s !== second)] : [0];
      for (const nextSecond of candidateSeconds) {
        const next = time(nextHour, nextMinute, nextSecond);
        if (!isTimeRefused(next, disabledTime)) {
          choose(next, { done: false });
          return;
        }
      }
    }
  };

  const confirm = () => {
    const next = normalizeTime(draft, showSeconds);
    if (!next || isTimeRefused(next, disabledTime)) return;
    onChange(next);
    onDone?.();
  };

  const now = () => {
    const at = new Date();
    const snapped = minutes.filter((minute) => minute <= at.getMinutes()).at(-1) ?? 0;
    return time(
      at.getHours(),
      snapped,
      seconds.filter((second) => second <= at.getSeconds()).at(-1) ?? 0,
    );
  };
  const nowValue = now();
  const nowRefused = isTimeRefused(nowValue, disabledTime);

  const hourItems = use12h
    ? buildMinutes(hourStep, 12).map((hour) => hour || 12)
    : buildMinutes(hourStep, 24);
  const selectedHourItem = use12h ? to12h(hour) : hour;

  return (
    <div className="ui-time-picker-panel" data-hour-cycle={use12h ? "h12" : "h23"}>
      <div className="divide-border flex divide-x">
        <TimeColumn
          onScrollSelect={
            changeOnScroll
              ? (h) => choose(time(use12h ? from12h(h, meridiem) : h, minute), { done: false })
              : undefined
          }
          label={t("dataEntry.timePicker.hour")}
          items={hourItems}
          selected={selectedHourItem}
          formatItem={(h) => (use12h ? String(h) : pad2(h))}
          isDisabled={(h) => isHourRefused(use12h ? from12h(h, meridiem) : h)}
          hideDisabled={hideDisabledOptions}
          onSelect={(h) => {
            const hour24 = use12h ? from12h(h, meridiem) : h;
            // The minute is still unchosen, so the panel stays open.
            chooseHour(hour24);
          }}
        />
        <TimeColumn
          onScrollSelect={
            changeOnScroll ? (m) => choose(time(hour, m), { done: false }) : undefined
          }
          label={t("dataEntry.timePicker.minute")}
          items={minutes}
          selected={snappedMinute}
          formatItem={(m) => pad2(m)}
          isDisabled={(m) => isMinuteRefused(hour, m)}
          hideDisabled={hideDisabledOptions}
          onSelect={(m) => {
            choose(time(hour, m), { done: !showSeconds });
          }}
        />
        {showSeconds && (
          <TimeColumn
            onScrollSelect={
              changeOnScroll ? (s) => choose(time(hour, minute, s), { done: false }) : undefined
            }
            label={t("dataEntry.timePicker.second")}
            items={seconds}
            selected={second}
            formatItem={pad2}
            hideDisabled={hideDisabledOptions}
            isDisabled={(s) => isTimeRefused(time(hour, minute, s), disabledTime)}
            onSelect={(s) => choose(time(hour, minute, s), { done: true })}
          />
        )}
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
              chooseHour(hour24);
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
            const normalized = normalizeTime(draft, showSeconds);
            if (normalized) setDraft(normalized);
          }}
        />
        {showNow || needConfirm ? (
          <div className="ui-time-picker-footer-actions">
            {showNow ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                // Refused rather than hidden, for the same reason a forbidden column option is:
                // an action that vanishes tells the reader nothing about why.
                disabled={nowRefused}
                onClick={() => {
                  setDraft(nowValue);
                  choose(nowValue, { done: true });
                }}
              >
                {t("dataEntry.timePicker.now")}
              </Button>
            ) : null}
            {needConfirm ? (
              <Button type="button" size="sm" onClick={confirm}>
                {t("dataEntry.timePicker.confirm")}
              </Button>
            ) : null}
          </div>
        ) : null}
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
  hourStep = 1,
  changeOnScroll,
  secondStep = 1,
  showSeconds: showSecondsProp = false,
  use12Hours,
  format,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  inputReadOnly,
  preserveInvalidOnBlur,
  placement = "bottom-end",
  renderExtraFooter,
  size,
  status,
  variant,
  ref,
  disabledTime,
  hideDisabledOptions,
  showNow = true,
  needConfirm = false,
  allowClear,
  ...ariaProps
}: TimePickerProp) {
  const { t } = useTranslation();
  const { timeFormat } = usePickerLocales();
  const use12h = use12Hours ?? (format ? /h|a|A/.test(format) : timeFormat === "12h");
  const showSeconds = showSecondsProp || Boolean(format?.includes("ss"));
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = !disabled && (openProp ?? internalOpen);
  const setOpen = (next: boolean) => {
    if (disabled && next) return;
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  // Forward the FormField label/helper/error contract onto the typeable input (focus target).
  const fieldA11y = pickFieldA11y(ariaProps);
  const reactId = React.useId();
  const dialogId = `${id ?? reactId}-dialog`;
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const isControlled = useControlledLatch(controlledValue !== undefined);
  const value = (isControlled ? controlledValue : internal) ?? "";
  const resolvedPlaceholder = placeholder ?? t("dataEntry.timePicker.placeholder") ?? "hh:mm";
  // Local text mirrors the input while typing; the canonical HH:mm flows out through onValueChange.
  const [text, setText] = React.useState(displayTime(value, format));

  React.useEffect(() => {
    setText(displayTime(value, format));
  }, [value, format]);

  const setValue = (next: string) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  const clear = () => {
    setValue("");
    setText("");
  };

  // The trailing action is exclusive: clear a value, otherwise open the picker.
  // antd `allowClear`, incl. its `{ clearIcon, label }` form — the SAME `resolveAllowClear` the
  // select family routes through, so "clear this field" is one mechanism across the library.
  const clearControl = resolveAllowClear(allowClear, true, t("common.clear") ?? "Clear");
  const showClear = clearControl.enabled && text !== "" && !disabled;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {(format || needConfirm || preserveInvalidOnBlur) && name ? (
        <input type="hidden" disabled={disabled} name={name} value={value} />
      ) : null}
      <PopoverAnchor asChild>
        <div className={cn("relative", className)}>
          <Input
            id={id}
            ref={ref}
            size={size}
            status={status}
            variant={variant}
            readOnly={inputReadOnly}
            name={format || needConfirm || preserveInvalidOnBlur ? "" : name}
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

            className="tabular-nums"
            trailingIcon={
              <span className="ui-time-picker-affix">
                {showClear ? (
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
                    className="ui-control-inline-affix-action"
                  >
                    {clearControl.clearIcon ?? (
                      <X className="ui-control-inline-affix-icon" aria-hidden="true" />
                    )}
                  </button>
                ) : (
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
                )}
              </span>
            }
            onClick={() => {
              if (!disabled) setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setOpen(true);
              } else if (event.key === "Enter") {
                const next = normalizeTime(text, showSeconds);
                if (next && !isTimeRefused(next, disabledTime)) {
                  setValue(next);
                  setOpen(false);
                }
              } else if (event.key === "Escape" && open) {
                setOpen(false);
              }
            }}
            onChange={(event) => {
              setText(event.target.value);
              const normalized = normalizeTime(event.target.value, showSeconds);
              // A refused time is rejected on the typed route too — see `isTimeRefused`.
              if (
                normalized &&
                (!showSeconds || /^\d{1,2}:\d{2}:\d{2}/.test(event.target.value)) &&
                (!format || !/[aA]/.test(format) || /[ap]m$/i.test(event.target.value.trim())) &&
                !isTimeRefused(normalized, disabledTime) &&
                !needConfirm
              )
                setValue(normalized);
            }}
            onBlur={(event) => {
              const normalized = normalizeTime(event.target.value, showSeconds);
              const accepted =
                normalized && !isTimeRefused(normalized, disabledTime) ? normalized : undefined;
              if (!preserveInvalidOnBlur) setText(displayTime(accepted ?? value, format));
            }}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        id={dialogId}
        role="dialog"
        aria-label={t("dataEntry.timePicker.openPicker") ?? "Time picker"}
        className="ui-time-picker-popover"
        side={placement.startsWith("top") ? "top" : "bottom"}
        align={placement.endsWith("start") ? "start" : "end"}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <TimePickerPanel
          value={(needConfirm ? normalizeTime(text, showSeconds) : undefined) || value || "09:00"}
          minuteStep={minuteStep}
          hourStep={hourStep}
          changeOnScroll={changeOnScroll}
          secondStep={secondStep}
          showSeconds={showSeconds}
          use12h={use12h}
          disabledTime={disabledTime}
          hideDisabledOptions={hideDisabledOptions}
          showNow={showNow}
          needConfirm={needConfirm}
          onChange={(next) => {
            setValue(next);
            setText(displayTime(next, format));
          }}
          onDone={() => {
            setOpen(false);
          }}
        />
        {renderExtraFooter?.()}
      </PopoverContent>
    </Popover>
  );
}

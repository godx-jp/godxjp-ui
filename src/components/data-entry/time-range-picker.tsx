import * as React from "react";
import { useTranslation } from "../../i18n/use-translation";
import { useControlledLatch } from "../../lib/hooks";
import { pickGroupFieldA11y } from "../../lib/field-a11y";
import { Flex } from "../layout/flex";
import { TimePicker } from "./time-picker";
import type { TimeRangePickerProp } from "../../props/components/data-entry.prop";

export type {
  TimeRangePickerProp,
  TimeRangePickerProp as TimeRangePickerProps,
} from "../../props/components/data-entry.prop";

/** A range owns ordering and partial endpoints; the time controls own editing and constraints. */
export function TimeRangePicker({
  value: controlledValue,
  defaultValue,
  onValueChange,
  order = true,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  allowEmpty = [true, true],
  name,
  id,
  placeholder,
  className,
  ref,
  ...props
}: TimeRangePickerProp) {
  const { t } = useTranslation();
  const autoId = React.useId();
  const groupId = id ?? autoId;
  const controlled = useControlledLatch(controlledValue !== undefined);
  const [internal, setInternal] = React.useState<[string, string]>(defaultValue ?? ["", ""]);
  const value = controlled ? (controlledValue ?? ["", ""]) : internal;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [activeEdge, setActiveEdge] = React.useState<0 | 1>(0);
  const open = openProp ?? internalOpen;
  const changeOpen = (edge: 0 | 1, next: boolean) => {
    if (next) setActiveEdge(edge);
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const choose = (edge: 0 | 1, time: string) => {
    if (!time && !allowEmpty[edge]) return;
    const next: [string, string] = [value[0], value[1]];
    next[edge] = time;
    if (order && next[0] && next[1] && next[0] > next[1]) next.reverse();
    if (!controlled) setInternal(next);
    onValueChange?.(next);
  };
  return (
    <Flex role="group" id={groupId} className={className} gap="sm" {...pickGroupFieldA11y(props)}>
      <TimePicker
        {...props}
        open={open && activeEdge === 0}
        onOpenChange={(next) => changeOpen(0, next)}
        ref={ref}
        id={`${groupId}-from`}
        name={name ? `${name}_from` : undefined}
        aria-labelledby={undefined}
        aria-label={t("dataEntry.dateRangePicker.from")}
        placeholder={placeholder?.[0]}
        value={value[0]}
        onValueChange={(time) => choose(0, time)}
        allowClear={props.allowClear !== false && allowEmpty[0]}
      />
      <TimePicker
        {...props}
        open={open && activeEdge === 1}
        onOpenChange={(next) => changeOpen(1, next)}
        id={`${groupId}-to`}
        name={name ? `${name}_to` : undefined}
        aria-labelledby={undefined}
        aria-label={t("dataEntry.dateRangePicker.to")}
        placeholder={placeholder?.[1]}
        value={value[1]}
        onValueChange={(time) => choose(1, time)}
        allowClear={props.allowClear !== false && allowEmpty[1]}
      />
    </Flex>
  );
}

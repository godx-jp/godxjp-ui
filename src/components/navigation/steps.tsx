import * as React from "react";
import { ArrowRight, Check, ChevronRight, Circle, Loader2, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { controlIconClass } from "../../lib/control-styles";
import type { StepStatusProp, StepsProp } from "../../props/components/navigation.prop";

export type {
  StepsProp,
  StepsProp as StepsProps,
  StepItemProp,
  StepStatusProp,
  StepsSeparatorProp,
} from "../../props/components/navigation.prop";

function resolveStepStatus(
  index: number,
  current: number,
  itemStatus: StepStatusProp | undefined,
  currentStatus: StepStatusProp | undefined,
): StepStatusProp {
  if (itemStatus) return itemStatus;
  if (index < current) return "finish";
  if (index === current) return currentStatus ?? "process";
  return "wait";
}

function StepIcon({
  status,
  icon,
  type,
}: {
  status: StepStatusProp;
  icon?: React.ReactNode;
  type?: StepsProp["type"];
}) {
  if (icon)
    return <span className={cn("flex items-center justify-center", controlIconClass)}>{icon}</span>;

  if (type === "dot") {
    // The dot sits in the SAME control-height slot as the full icon (centered), so it lines up with
    // the title exactly like the default marker — a bare dot would top-align and drift above the label.
    return (
      <span className={cn("flex items-center justify-center", controlIconClass)}>
        <span className="ui-steps-dot" data-status={status} />
      </span>
    );
  }

  return (
    <span
      data-status={status}
      className={cn("flex items-center justify-center", controlIconClass, "ui-steps-marker")}
    >
      {status === "finish" && <Check className="ui-steps-marker-icon" aria-hidden="true" />}
      {status === "process" && (
        <Loader2 className="ui-steps-marker-icon animate-spin" aria-hidden="true" />
      )}
      {status === "error" && <X className="ui-steps-marker-icon" aria-hidden="true" />}
      {status === "wait" && <Circle className="ui-steps-wait-icon" aria-hidden="true" />}
    </span>
  );
}

export function Steps({
  items = [],
  value: current = 0,
  defaultValue = 0,
  status: currentStatus = "process",
  orientation = "horizontal",
  type = "default",
  size = "md",
  titlePlacement = "horizontal",
  separator = "chevron",
  onValueChange,
  className,
}: StepsProp) {
  const { t } = useTranslation();
  const base = defaultValue;
  const isVertical = orientation === "vertical";
  const compact = size === "sm";
  const inline = type === "inline";
  // Both glyphs point along the reading direction, so both flip under dir="rtl".
  const SeparatorIcon = separator === "arrow" ? ArrowRight : ChevronRight;

  return (
    <ol
      data-direction={inline ? undefined : isVertical ? "vertical" : "horizontal"}
      className={cn("flex w-full", inline ? "ui-steps-inline" : "ui-steps-list", className)}
      aria-label={t("navigation.steps.ariaLabel")}
    >
      {items.map((item, index) => {
        const absoluteIndex = base + index;
        const stepStatus = resolveStepStatus(absoluteIndex, current, item.status, currentStatus);
        const interactive = Boolean(onValueChange);
        const clickable = interactive && !item.disabled;
        const description = item.description;
        const isCurrent = absoluteIndex === current;
        const statusLabel = t(
          stepStatus === "finish"
            ? "navigation.steps.status.finish"
            : stepStatus === "process"
              ? "navigation.steps.status.process"
              : stepStatus === "error"
                ? "navigation.steps.status.error"
                : "navigation.steps.status.wait",
        );

        // When `onValueChange` is provided the step is an actionable control (a real <button> that
        // may be disabled). When it is not, the steps are purely informational, so render a non-button
        // wrapper to keep disabled steps out of the tab order (WAI-ARIA: don't emit dead buttons).
        const stepDirection = inline ? undefined : isVertical ? "vertical" : "horizontal";
        const stepClassName = cn(
          "group",
          inline ? "ui-steps-inline-control" : "ui-steps-control",
          clickable ? "cursor-pointer" : "cursor-default",
        );

        const stepInner = inline ? (
          <>
            <span className="ui-steps-inline-index" aria-hidden="true">
              {absoluteIndex + 1}
            </span>
            <span className="ui-steps-inline-title">{item.title}</span>
            <span className="sr-only">{statusLabel}</span>
          </>
        ) : (
          <>
            <StepIcon status={stepStatus} icon={item.icon} type={type} />
            <div className="ui-steps-text">
              <div
                className="ui-steps-title"
                data-status={stepStatus}
                data-compact={compact ? "" : undefined}
              >
                {item.title}
              </div>
              {item.subtitle && <div className="ui-steps-subtitle">{item.subtitle}</div>}
              {description && (
                <div className="ui-steps-description" data-compact={compact ? "" : undefined}>
                  {description}
                </div>
              )}
            </div>
          </>
        );

        return (
          <li
            key={index}
            aria-current={isCurrent ? "step" : undefined}
            data-direction={inline ? undefined : isVertical ? "vertical" : "horizontal"}
            data-title-placement={titlePlacement}
            data-connector={!isVertical && !inline && index < items.length - 1 ? "" : undefined}
            className={cn(!inline && "flex-1", inline ? "ui-steps-inline-item" : "ui-steps-item")}
            data-status={stepStatus}
          >
            {interactive ? (
              <button
                type="button"
                disabled={!clickable}
                onClick={clickable ? () => onValueChange?.(absoluteIndex) : undefined}
                data-direction={stepDirection}
                className={stepClassName}
              >
                {stepInner}
              </button>
            ) : (
              <span data-direction={stepDirection} className={stepClassName}>
                {stepInner}
              </span>
            )}
            {inline && index < items.length - 1 ? (
              <SeparatorIcon
                className="ui-steps-inline-separator rtl:rotate-180"
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

import * as React from "react";
import { Check, Circle, Loader2, X } from "lucide-react";

import { cn } from "../../lib/utils";
import { controlIconClass } from "../../lib/control-styles";
import type { StepStatusProp, StepsProp } from "../../props/components/navigation.prop";

export type {
  StepsProp,
  StepsProp as StepsProps,
  StepItemProp,
  StepStatusProp,
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
    return (
      <span
        className={cn(
          "block size-2.5 rounded-full",
          status === "finish" && "bg-primary",
          status === "process" && "bg-primary ring-primary/20 ring-4",
          status === "error" && "bg-destructive",
          status === "wait" && "bg-muted-foreground/30",
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center",
        controlIconClass,
        "rounded-full border-2 text-sm font-medium",
        status === "finish" && "border-primary bg-primary text-primary-foreground",
        status === "process" && "border-primary text-primary",
        status === "error" && "border-destructive bg-destructive text-destructive-foreground",
        status === "wait" && "border-muted-foreground/30 text-muted-foreground",
      )}
    >
      {status === "finish" && <Check className="size-4" aria-hidden="true" />}
      {status === "process" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {status === "error" && <X className="size-4" aria-hidden="true" />}
      {status === "wait" && <Circle className="size-3 fill-current" aria-hidden="true" />}
    </span>
  );
}

export function Steps({
  items = [],
  current = 0,
  initial = 0,
  status: currentStatus = "process",
  orientation = "horizontal",
  type = "default",
  size = "default",
  titlePlacement = "horizontal",
  onChange,
  className,
}: StepsProp) {
  const base = initial;
  const isVertical = orientation === "vertical";
  const compact = size === "sm";

  return (
    <ol
      className={cn(
        "flex w-full",
        isVertical ? "flex-col gap-0" : "flex-row items-start",
        className,
      )}
      aria-label="Progress"
    >
      {items.map((item, index) => {
        const absoluteIndex = base + index;
        const stepStatus = resolveStepStatus(absoluteIndex, current, item.status, currentStatus);
        const clickable = Boolean(onChange) && !item.disabled;
        const description = item.content ?? item.description;

        return (
          <li
            key={index}
            className={cn(
              "relative flex min-w-0 flex-1",
              isVertical ? "flex-row gap-3 pb-8 last:pb-0" : "flex-col items-center text-center",
              !isVertical &&
                index < items.length - 1 &&
                "after:bg-border after:absolute after:top-4 after:h-px",
              !isVertical &&
                index < items.length - 1 &&
                "after:left-[calc(50%+1.25rem)] after:w-[calc(100%-2.5rem)]",
            )}
          >
            <button
              type="button"
              disabled={!clickable}
              onClick={clickable ? () => onChange?.(absoluteIndex) : undefined}
              className={cn(
                "group flex min-w-0",
                isVertical ? "flex-row items-start gap-3" : "flex-col items-center",
                clickable && "cursor-pointer",
                !clickable && "cursor-default",
              )}
            >
              <StepIcon status={stepStatus} icon={item.icon} type={type} />
              <div
                className={cn(
                  "min-w-0",
                  isVertical ? "pt-1 text-left" : "mt-2 px-2",
                  titlePlacement === "vertical" && !isVertical && "mt-1",
                )}
              >
                <div
                  className={cn(
                    "font-medium",
                    compact ? "text-xs" : "text-sm",
                    stepStatus === "process" && "text-foreground",
                    stepStatus === "wait" && "text-muted-foreground",
                    stepStatus === "error" && "text-destructive",
                  )}
                >
                  {item.title}
                </div>
                {item.subTitle && (
                  <div className="text-muted-foreground text-xs">{item.subTitle}</div>
                )}
                {description && (
                  <div className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
                    {description}
                  </div>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

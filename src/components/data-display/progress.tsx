import * as React from "react";

export type ProgressTone = "success" | "warning";

export type ProgressProps = {
  value: number;
  label?: string;
  tone?: ProgressTone;
};

export function Progress({ value, label, tone = "success" }: ProgressProps) {
  const boundedValue = Math.max(0, Math.min(100, value));
  const labelId = React.useId();

  return (
    <div
      className="ui-progress"
      data-variant={tone}
      role="progressbar"
      aria-valuenow={boundedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${boundedValue}%`}
      aria-labelledby={label ? labelId : undefined}
      aria-label={label ? undefined : "Progress"}
    >
      <div className="ui-progress-track">
        <div className="ui-progress-bar" style={{ width: `${boundedValue}%` }} />
      </div>
      {label ? (
        <div className="ui-progress-label" id={labelId}>
          {label}
        </div>
      ) : null}
    </div>
  );
}

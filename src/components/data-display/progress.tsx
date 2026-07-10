import * as React from "react";

export type ProgressTone = "success" | "warning" | "destructive";

export type ProgressProps = {
  value: number;
  label?: string;
  tone?: ProgressTone;
  /**
   * Allow `value` to exceed 100 and render an OVER-CAPACITY fill: the bar caps at 100% width but
   * gets a diagonal striped overlay + destructive tone, so an over-limit meter (e.g. 252% of a
   * booked weight) is unmistakably different from a full (100%) one. `aria-valuetext` reports the
   * real ratio. Off by default — `value` clamps to 100 as before.
   */
  over?: boolean;
};

export function Progress({ value, label, tone, over = false }: ProgressProps) {
  const isOver = over && value > 100;
  const boundedValue = Math.max(0, Math.min(100, value));
  // Over-capacity forces the destructive tone unless the caller pins one explicitly.
  const effectiveTone: ProgressTone = tone ?? (isOver ? "destructive" : "success");
  const labelId = React.useId();

  return (
    <div
      className="ui-progress"
      data-tone={effectiveTone}
      data-over={isOver ? "" : undefined}
      role="progressbar"
      aria-valuenow={boundedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${isOver ? Math.round(value) : boundedValue}%`}
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

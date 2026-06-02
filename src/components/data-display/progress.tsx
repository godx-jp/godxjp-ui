export type ProgressTone = "success" | "warning";

export type ProgressProps = {
  value: number;
  label?: string;
  tone?: ProgressTone;
};

export function Progress({ value, label, tone = "success" }: ProgressProps) {
  const boundedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className="ui-progress"
      data-variant={tone}
      role="progressbar"
      aria-valuenow={boundedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="ui-progress-track">
        <div className="ui-progress-bar" style={{ width: `${boundedValue}%` }} />
      </div>
      {label ? <div className="ui-progress-label">{label}</div> : null}
    </div>
  );
}

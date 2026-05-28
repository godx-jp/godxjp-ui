export type ProgressMeterTone = "success" | "warning";

export type ProgressMeterProps = {
  value: number;
  label?: string;
  tone?: ProgressMeterTone;
};

export function ProgressMeter({ value, label, tone = "success" }: ProgressMeterProps) {
  const boundedValue = Math.max(0, Math.min(100, value));

  return (
    <div className="ui-progress-meter" data-tone={tone}>
      <div className="ui-progress-track">
        <div className="ui-progress-bar" style={{ width: `${boundedValue}%` }} />
      </div>
      {label ? <div className="ui-progress-label">{label}</div> : null}
    </div>
  );
}

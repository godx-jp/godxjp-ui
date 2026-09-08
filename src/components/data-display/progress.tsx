import * as React from "react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";

export type ProgressTone = "success" | "warning" | "destructive";

/**
 * One slice of a BREAKDOWN bar — how much of the total this state holds, in the SAME unit as every
 * other slice (counts, bytes, yen). Never a percentage: the bar owns the ratio arithmetic, so the
 * caller never has to round three numbers that must still add up to 100.
 *
 * `label` is not decoration. Colour alone cannot carry the meaning of a slice (WCAG 1.4.1), and it
 * is the only thing a screen reader has to say about it, so it is required.
 */
export type ProgressSegment = {
  value: number;
  tone: ProgressTone;
  label: string;
};

type ProgressBase = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "role" | "children" | "aria-valuenow" | "aria-valuemin" | "aria-valuemax" | "aria-valuetext"
> & {
  /**
   * Visible caption under the bar; it also becomes the bar's accessible name. Omit it and the bar
   * falls back to the catalogue name — or to whatever `aria-label`/`aria-labelledby` the caller
   * passes, which is how a bar gets its name from a heading that is already on screen.
   */
  label?: string;
};

/** A METER: one ratio of one whole. */
type ProgressMeterProps = ProgressBase & {
  value: number;
  tone?: ProgressTone;
  /**
   * Allow `value` to exceed 100 and render an OVER-CAPACITY fill: the bar caps at 100% width but
   * gets a diagonal striped overlay + destructive tone, so an over-limit meter (e.g. 252% of a
   * booked weight) is unmistakably different from a full (100%) one. `aria-valuetext` reports the
   * real ratio.
   */
  over?: boolean;
  segments?: never;
};

/**
 * A BREAKDOWN: one whole split into its states.
 *
 * ## Why this is not a meter with three calls
 *
 * A meter answers "how far along?" and has ONE value, so `role="progressbar"` fits it exactly.
 * A breakdown answers "what is this total made of?" — 2 overdue · 3 due soon · 12 done. Stacking
 * three progressbars says the wrong thing three times over (three separate 0–100 measurements),
 * and no ARIA value pattern models a partition. It is a picture of data, so it names itself once
 * as `role="img"` and reads out every slice with its own label and amount.
 *
 * ## Why it is a taller bar than the meter
 *
 * A 0.5rem pill is legible when it carries one fill against one track. Three abutting fills at
 * that height read as a coloured hairline — the ratios, which are the entire point, stop being
 * comparable. So the breakdown takes its own block size and corner, both retunable
 * (`--progress-breakdown-*`).
 */
type ProgressBreakdownProps = ProgressBase & {
  segments: ProgressSegment[];
  value?: never;
  tone?: never;
  over?: never;
};

export type ProgressProps = ProgressMeterProps | ProgressBreakdownProps;

/**
 * The union collapsed for the body. It exists because intersecting the two public shapes resolves
 * `segments` to `never` (each side declares the other's fields `never`), so the component could
 * not read its own props. The union is what CALLERS see, and it is the one that matters: it is
 * what stops a caller passing `over` to a breakdown or forgetting `value` on a meter.
 */
type ProgressInternalProps = ProgressBase & {
  segments?: ProgressSegment[];
  value?: number;
  tone?: ProgressTone;
  over?: boolean;
};

export function Progress(props: ProgressProps) {
  const { t } = useTranslation();
  const labelId = React.useId();
  const {
    label,
    className,
    segments,
    value,
    tone,
    over = false,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...domProps
  } = props as ProgressInternalProps;

  // A caller-supplied name wins over anything generated here — that is how a bar borrows the
  // heading, row title or cell that already names it on screen instead of repeating it.
  const named = ariaLabel !== undefined || ariaLabelledBy !== undefined;
  const labelledBy = ariaLabelledBy ?? (label !== undefined ? labelId : undefined);

  const caption =
    label !== undefined ? (
      <div className="ui-progress-label" id={labelId}>
        {label}
      </div>
    ) : null;

  if (segments !== undefined) {
    // Negative amounts cannot be drawn on a partition; they are clamped rather than rejected so a
    // bad row degrades to an empty slice instead of taking the screen down.
    const amounts = segments.map((segment) => Math.max(0, segment.value));
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    const separator = t("dataDisplay.progress.breakdownSeparator");
    const spoken = segments
      .map((segment, index) => `${segment.label} ${amounts[index]}`)
      .join(separator);

    return (
      <div
        className={cn("ui-progress", className)}
        data-breakdown=""
        role="img"
        aria-labelledby={ariaLabelledBy}
        aria-label={
          ariaLabelledBy !== undefined
            ? undefined
            : ariaLabel !== undefined
              ? `${ariaLabel}${separator}${spoken}`
              : label !== undefined
                ? `${label}${separator}${spoken}`
                : spoken
        }
        {...domProps}
      >
        <div className="ui-progress-track">
          {segments.map((segment, index) => (
            <div
              key={`${segment.label}-${index}`}
              className="ui-progress-segment"
              data-tone={segment.tone}
              style={{ inlineSize: total === 0 ? "0%" : `${(amounts[index] / total) * 100}%` }}
            />
          ))}
        </div>
        {caption}
      </div>
    );
  }

  // `value` is required on the meter side of the union, so the fallback is unreachable from
  // TypeScript; it keeps a plain-JS caller with an empty bar instead of NaN aria values.
  const meterValue = value ?? 0;
  const isOver = over && meterValue > 100;
  const boundedValue = Math.max(0, Math.min(100, meterValue));
  // Over-capacity forces the destructive tone unless the caller pins one explicitly.
  const effectiveTone: ProgressTone = tone ?? (isOver ? "destructive" : "success");

  return (
    <div
      className={cn("ui-progress", className)}
      data-tone={effectiveTone}
      data-over={isOver ? "" : undefined}
      role="progressbar"
      aria-valuenow={boundedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${isOver ? Math.round(meterValue) : boundedValue}%`}
      aria-labelledby={labelledBy}
      aria-label={
        labelledBy !== undefined
          ? undefined
          : named
            ? ariaLabel
            : t("dataDisplay.progress.ariaLabel")
      }
      {...domProps}
    >
      <div className="ui-progress-track">
        <div className="ui-progress-bar" style={{ width: `${boundedValue}%` }} />
      </div>
      {caption}
    </div>
  );
}

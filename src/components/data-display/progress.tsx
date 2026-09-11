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
   * Bar thickness — `md` (default) or `sm`.
   *
   * `md` is the size each form was designed at, and it stays the default for the reason spelled
   * out on the breakdown below: three abutting fills need height before their ratios are
   * comparable. `sm` is for a bar that is not the subject of the screen but a column of one — an
   * in-table capacity bar next to a row of numbers, where a 22px partition outweighs the row it
   * annotates and sets the row height for the whole table.
   *
   * Both steps come from the same token pair (`--progress-*-block-size`,
   * `--progress-*-block-size-sm`), so a theme retunes the scale rather than one call site. Nothing
   * about the ARIA changes: `sm` is thickness, not meaning.
   */
  size?: "sm" | "md";
  /**
   * Visible caption under the bar; it also becomes the bar's accessible name. Omit it and the bar
   * falls back to the catalogue name — or to whatever `aria-label`/`aria-labelledby` the caller
   * passes, which is how a bar gets its name from a heading that is already on screen.
   */
  label?: string;
};

/**
 * Geometry of the METER — the same measurement, drawn two ways.
 *
 * `bar` is the default and what every existing call site gets. `ring` draws the identical ratio as
 * an arc, for a header with no room for a full-width bar: a phone app bar that has to show
 * "18 of 42 done" beside a title has one square of space, and a bar plus its caption needs two
 * stacked rows. Reach for it when the SPACE is square, not when the number is important — the two
 * shapes say exactly the same thing and carry the same ARIA.
 *
 * It is a meter shape only. A ring around a `segments` breakdown is a pie chart, which is
 * `PieChart donut` and belongs to the charts entry point; that one is a part-to-whole across
 * CATEGORIES with a legend and tooltips, and a screen reader should hear it as an image, not as a
 * progressbar.
 */
export type ProgressShape = "bar" | "ring";

/**
 * The SVG's own coordinate space, and the trick that keeps a circumference out of the component.
 *
 * `pathLength="100"` tells the renderer the circle measures 100 units whatever its real radius is,
 * so `stroke-dasharray: <value> 100` IS the percentage and nothing here ever computes 2πr. The
 * viewBox is a drawing grid, not a layout measurement: the painted size comes from
 * `--progress-ring-size` on the element, and this box just has to be big enough to hold the stroke
 * without clipping it.
 */
const RING_BOX = 40;
const RING_CENTRE = RING_BOX / 2;
const RING_RADIUS = 16;
/** Start the arc at 12 o'clock. An attribute, not a CSS transform, so no stylesheet can reorder it. */
const RING_ROTATION = `rotate(-90 ${RING_CENTRE} ${RING_CENTRE})`;

/** A METER: one ratio of one whole. */
type ProgressMeterProps = ProgressBase & {
  value: number;
  tone?: ProgressTone;
  /**
   * `bar` (default) or `ring` — the same measurement drawn as a full-width bar or as an arc.
   * `label` moves INSIDE the ring, which is the point of it: the readout and its proportion take
   * one square instead of two stacked rows.
   */
  shape?: ProgressShape;
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
  /** A ring around a partition is a pie chart — that is `PieChart donut`, not this. */
  shape?: never;
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
  shape?: ProgressShape;
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
    size,
    shape,
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
        data-size={size === "sm" ? "sm" : undefined}
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
      data-size={size === "sm" ? "sm" : undefined}
      // Quiet default (rule #44): `bar` emits nothing, so every existing call site keeps the box it
      // already had and the ring rules cannot reach it.
      data-shape={shape === "ring" ? "ring" : undefined}
      data-over={isOver && shape !== "ring" ? "" : undefined}
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
      {shape === "ring" ? (
        /*
         * The ARC is aria-hidden and the ring carries no text of its own for a screen reader: the
         * element above is already `role="progressbar"` with `aria-valuenow`/`aria-valuetext`, so
         * announcing the drawing as well would say the same number twice. `focusable="false"`
         * because IE-era SVG semantics still reach some AT through the tab order.
         */
        <div className="ui-progress-ring">
          <svg
            className="ui-progress-ring-svg"
            viewBox={`0 0 ${RING_BOX} ${RING_BOX}`}
            aria-hidden="true"
            focusable="false"
          >
            <circle
              className="ui-progress-ring-track"
              cx={RING_CENTRE}
              cy={RING_CENTRE}
              r={RING_RADIUS}
              pathLength={100}
            />
            <circle
              className="ui-progress-ring-indicator"
              cx={RING_CENTRE}
              cy={RING_CENTRE}
              r={RING_RADIUS}
              pathLength={100}
              transform={RING_ROTATION}
              // `pathLength="100"` above makes the path measure 100 units whatever its radius is,
              // so the dash length IS the percentage and no circumference is computed anywhere.
              strokeDasharray={`${boundedValue} 100`}
            />
          </svg>
          {label !== undefined ? (
            <div className="ui-progress-ring-label" id={labelId}>
              {label}
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="ui-progress-track">
            <div className="ui-progress-bar" style={{ width: `${boundedValue}%` }} />
          </div>
          {caption}
        </>
      )}
    </div>
  );
}

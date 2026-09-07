import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../../lib/utils";
import type { SliderProp, SliderTooltipProp } from "../../props/components/data-entry.prop";

export type { SliderProp, SliderProp as SliderProps } from "../../props/components/data-entry.prop";

/** Where a value sits on the rail, as a 0–1 fraction. `reverse` mirrors it. */
function fraction(value: number, min: number, max: number, reverse: boolean): number {
  if (max === min) return 0;
  const raw = (value - min) / (max - min);
  return reverse ? 1 - raw : raw;
}

/** Numeric mark keys survive `Object.keys` as strings — read them back as numbers, once. */
function markEntries(marks: SliderProp["marks"]): [number, React.ReactNode][] {
  if (!marks) return [];
  return Object.entries(marks)
    .map(([key, label]) => [Number(key), label] as [number, React.ReactNode])
    .filter(([at]) => Number.isFinite(at))
    .sort((a, b) => a[0] - b[0]);
}

/** Every `step` from `min` up to `max` — antd `dots`. */
function dotStops(min: number, max: number, step: number): number[] {
  if (!Number.isFinite(step) || step <= 0) return [];
  const stops: number[] = [];
  for (let at = min; at <= max; at += step) stops.push(at);
  return stops;
}

function tooltipContent(tooltip: SliderTooltipProp | undefined, value: number): React.ReactNode {
  if (!tooltip || tooltip === true) return value;
  if (tooltip.formatter === null) return null;
  return tooltip.formatter ? tooltip.formatter(value) : value;
}

/** Numeric range slider (Radix Slider). */
export const Slider = React.forwardRef<React.ComponentRef<typeof SliderPrimitive.Root>, SliderProp>(
  (
    {
      className,
      defaultValue,
      value,
      min = 0,
      max = 100,
      step = 1,
      range,
      marks,
      dots = false,
      included = true,
      reverse = false,
      tooltip = false,
      inverted,
      orientation = "horizontal",
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      ...props
    },
    ref,
  ) => {
    const values = React.useMemo(() => {
      const given = Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : null;
      // `range` is a DECLARATION where the array length is only a GUESS. Left to the guess alone,
      // a range whose value is still loading renders as a point and grows a second thumb later,
      // and a single-thumb slider handed a two-element array sprouts one it never wanted. Stating
      // it settles both; saying nothing keeps the historical inference, so no existing call site
      // changes shape.
      if (range === true) {
        if (given) return given.length >= 2 ? given.slice(0, 2) : [given[0] ?? min, max];
        return [min, max];
      }
      if (range === false) return given ? given.slice(0, 1) : [min];
      return given ?? [min, max];
    }, [defaultValue, max, min, range, value]);

    // The focusable element is each Thumb (role="slider") — the accessible name MUST live there, not
    // on the Root. For a multi-thumb range, suffix the index so each thumb is distinguishable.
    const thumbLabel = (index: number) =>
      ariaLabel != null && values.length > 1 ? `${ariaLabel} ${index + 1}` : ariaLabel;

    const ticks = markEntries(marks);
    const stops = dots ? dotStops(min, max, typeof step === "number" ? step : 1) : [];
    const vertical = orientation === "vertical";
    const showTooltip = tooltip !== false && tooltip != null;

    /** A mark / dot is positioned along the rail's own axis, so it follows `orientation`. */
    const offsetStyle = (at: number): React.CSSProperties =>
      ({
        [vertical ? "--slider-mark-offset-block" : "--slider-mark-offset-inline"]:
          `${fraction(at, min, max, reverse) * 100}%`,
      }) as React.CSSProperties;

    return (
      <SliderPrimitive.Root
        ref={ref}
        data-slot="slider"
        data-has-marks={ticks.length > 0 ? "true" : undefined}
        className={cn("ui-slider", className)}
        // Radix decides how many thumbs EXIST from its own value array, not from how many Thumb
        // children it is handed — so `range` with no value yet has to seed one, or the second
        // thumb is silently dropped. Only `range === true` seeds; saying nothing changes nothing.
        defaultValue={defaultValue ?? (range === true ? [min, max] : undefined)}
        min={min}
        max={max}
        step={step}
        value={value}
        orientation={orientation}
        // antd calls it `reverse`, Radix calls it `inverted` — one axis, so an explicit `inverted`
        // still wins and the two never disagree in the DOM.
        inverted={inverted ?? reverse}
        {...props}
      >
        <SliderPrimitive.Track data-slot="slider-track" className="ui-slider-track">
          {/* antd `included={false}` — the rail carries marks only and nothing is "up to here",
              so painting a filled span from the start would assert a magnitude that is not there. */}
          {included ? (
            <SliderPrimitive.Range data-slot="slider-range" className="ui-slider-range" />
          ) : null}
          {stops.map((at) => (
            <span
              key={`dot-${at}`}
              data-slot="slider-dot"
              data-active={
                included && at <= (values[values.length - 1] ?? min) ? "true" : undefined
              }
              className="ui-slider-dot"
              style={offsetStyle(at)}
              aria-hidden="true"
            />
          ))}
        </SliderPrimitive.Track>
        {values.map((thumbValue, index) => (
          <SliderPrimitive.Thumb
            key={index}
            data-slot="slider-thumb"
            className="ui-slider-thumb"
            aria-label={thumbLabel(index)}
            aria-labelledby={ariaLabelledby}
          >
            {/* The bubble is `aria-hidden`: the thumb already announces its value through
                `role="slider"` + `aria-valuenow`, and a duplicate would be read twice. */}
            {showTooltip ? (
              <span
                data-slot="slider-tooltip"
                data-open={tooltip !== true && tooltip.open ? "true" : undefined}
                className="ui-slider-tooltip"
                aria-hidden="true"
              >
                {tooltipContent(tooltip, thumbValue)}
              </span>
            ) : null}
          </SliderPrimitive.Thumb>
        ))}
        {ticks.length > 0 ? (
          <span data-slot="slider-marks" className="ui-slider-marks" aria-hidden="true">
            {ticks.map(([at, label]) => (
              <span
                key={`mark-${at}`}
                data-slot="slider-mark"
                className="ui-slider-mark"
                style={offsetStyle(at)}
              >
                {label}
              </span>
            ))}
          </span>
        ) : null}
      </SliderPrimitive.Root>
    );
  },
);
Slider.displayName = SliderPrimitive.Root.displayName;

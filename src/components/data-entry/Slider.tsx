import * as SliderPrimitive from "@radix-ui/react-slider"
import {
  forwardRef,
  useMemo,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react"
import { cn } from "../cn"

/**
 * Slider — Radix-backed range input. Single-handle by default;
 * `range` flips to dual-handle.
 *
 * Vocabulary (cardinal rule 23 §B):
 *   - `value` / `defaultValue` / `onValueChange` — Radix-canonical
 *     selection; scalar for single-handle, `[number, number]` for
 *     `range`.
 *   - `min` / `max` / `step` — HTML standards (not vocabulary).
 *   - `disabled`, `orientation` — shared axes.
 *   - `marks` — optional tick labels along the track.
 *
 * Visual contract: `.slider`, `.slider-track`, `.slider-range`,
 * `.slider-thumb` in shell.css. Vertical variant flips dimensions
 * via `data-orientation="vertical"`.
 */

export interface SliderMark {
  value: number
  label?: ReactNode
}

type SliderValue = number | [number, number]

export interface SliderProps
  extends Omit<
    ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    "value" | "defaultValue" | "onValueChange" | "orientation"
  > {
  value?: SliderValue
  defaultValue?: SliderValue
  onValueChange?: (value: SliderValue) => void
  min?: number
  max?: number
  step?: number
  /** Dual-handle when true; pass `[number, number]` for value. */
  range?: boolean
  disabled?: boolean
  orientation?: "horizontal" | "vertical"
  /** Optional tick marks rendered alongside the track. */
  marks?: SliderMark[]
}

function toArray(v: SliderValue | undefined): number[] | undefined {
  if (v === undefined) return undefined
  return Array.isArray(v) ? v : [v]
}

export const Slider = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(function Slider(
  {
    value,
    defaultValue,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    range = false,
    disabled,
    orientation = "horizontal",
    marks,
    className,
    ...rest
  },
  ref,
) {
  const radixValue = useMemo(() => toArray(value), [value])
  const radixDefault = useMemo(
    () => toArray(defaultValue) ?? (range ? [min, max] : [min]),
    [defaultValue, range, min, max],
  )

  const handleChange = (next: number[]) => {
    if (!onValueChange) return
    if (range) {
      onValueChange([next[0] ?? min, next[1] ?? max])
    } else {
      onValueChange(next[0] ?? min)
    }
  }

  const thumbCount = range ? 2 : 1
  const span = max - min || 1

  // Pass controlled OR uncontrolled, never both. Even passing
  // `value={undefined}` alongside `defaultValue={…}` trips React's
  // controlled/uncontrolled transition warning at the inner Primitive
  // input level.
  const valueProp =
    radixValue !== undefined ? { value: radixValue } : { defaultValue: radixDefault }

  return (
    <div className="slider-wrap" data-orientation={orientation}>
      <SliderPrimitive.Root
        ref={ref}
        className={cn("slider", className)}
        {...valueProp}
        onValueChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        orientation={orientation}
        data-orientation={orientation}
        {...rest}
      >
        <SliderPrimitive.Track className="slider-track">
          <SliderPrimitive.Range className="slider-range" />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbCount }).map((_, i) => (
          <SliderPrimitive.Thumb key={i} className="slider-thumb" />
        ))}
      </SliderPrimitive.Root>
      {marks && marks.length > 0 ? (
        <div className="slider-marks" data-orientation={orientation}>
          {marks.map((m) => {
            const pct = ((m.value - min) / span) * 100
            const style =
              orientation === "vertical"
                ? { bottom: `${pct}%` }
                : { left: `${pct}%` }
            return (
              <span key={m.value} className="slider-mark" style={style}>
                <span className="slider-mark-dot" aria-hidden />
                {m.label !== undefined ? (
                  <span className="slider-mark-label">{m.label}</span>
                ) : null}
              </span>
            )
          })}
        </div>
      ) : null}
    </div>
  )
})

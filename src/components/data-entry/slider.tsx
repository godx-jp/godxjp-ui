import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../../lib/utils";
import type { SliderProp } from "../../props/components/data-entry.prop";

export type { SliderProp, SliderProp as SliderProps } from "../../props/components/data-entry.prop";

/** Numeric range slider (Radix Slider). */
export const Slider = React.forwardRef<React.ComponentRef<typeof SliderPrimitive.Root>, SliderProp>(
  ({ className, defaultValue, value, min = 0, max = 100, ...props }, ref) => {
    const values = React.useMemo(
      () =>
        Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max],
      [defaultValue, max, min, value],
    );

    return (
      <SliderPrimitive.Root
        ref={ref}
        data-slot="slider"
        className={cn("ui-slider", className)}
        defaultValue={defaultValue}
        min={min}
        max={max}
        value={value}
        {...props}
      >
        <SliderPrimitive.Track data-slot="slider-track" className="ui-slider-track">
          <SliderPrimitive.Range data-slot="slider-range" className="ui-slider-range" />
        </SliderPrimitive.Track>
        {values.map((_, index) => (
          <SliderPrimitive.Thumb key={index} data-slot="slider-thumb" className="ui-slider-thumb" />
        ))}
      </SliderPrimitive.Root>
    );
  },
);
Slider.displayName = SliderPrimitive.Root.displayName;

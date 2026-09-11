import * as React from "react";
import {
  Label as AriaLabel,
  Slider as AriaSlider,
  SliderStateContext,
  SliderThumb as AriaSliderThumb,
  SliderTrack as AriaSliderTrack,
  useLocale,
} from "react-aria-components";
import { cn } from "../../lib/utils";
import type {
  SliderMarkProp,
  SliderMarksProp,
  SliderProp,
  SliderRangeConfigProp,
  SliderTooltipProp,
} from "../../props/components/data-entry.prop";

export type { SliderProp, SliderProp as SliderProps } from "../../props/components/data-entry.prop";

/*
 * NỀN: react-aria-components, không còn @radix-ui/react-slider — cùng nước đi đã làm với Switch,
 * Segmented, Radio. Hình dạng DOM đổi theo đúng cách đó:
 *
 *   Radix:  <span class="ui-slider"> … <span role="slider" class="ui-slider-thumb"> … </span>
 *   RAC:    <div role="group" class="ui-slider"> … <div class="ui-slider-thumb">
 *             <input type="range"> … </div>
 *
 * Tức là PHẦN TỬ NHẬN TIÊU ĐIỂM (`<input type="range">`, vai trò slider ngầm định) và PHẦN TỬ
 * ĐƯỢC TÔ (div thumb) không còn là một. Vòng tiêu điểm bám `data-focus-visible` mà RAC ghi lên
 * thumb, y như `.ui-switch`.
 *
 * RAC GIỮ: trạng thái có kiểm soát, nhãn và mô tả của từng thumb, `<input>` thật cho form và cho
 * thao tác của trình đọc màn hình (vuốt lên/xuống trên iOS đi qua `onChange` của input), tiêu
 * điểm, hover.
 *
 * THƯ VIỆN NÀY GIỮ HÌNH HỌC — con trỏ, phím, vị trí. Không phải vì thích tự làm: RAC không có
 * `reverse`/`inverted` (Radix có, antd có, và nó là API công khai của component này), không có
 * `minStepsBetweenThumbs`, không có `step={null}`, và `pageSize` của nó là (max − min)/10 chứ
 * không phải 10 bước như thời Radix (min 0, max 10, step 2: Radix nhảy 10, RAC nhảy 2). Mọi
 * đường nhập của RAC suy ra hướng từ `useLocale()` và không có chỗ nào để đảo; nên phím và con
 * trỏ được chặn ở pha CAPTURE trên track (trước khi tới handler của RAC ở pha bubble) và đi qua
 * MỘT hàm đặt giá trị, còn vị trí được vẽ bằng thuộc tính LOGIC trong control.css — RTL và
 * `reverse` là CSS, không phải một nhánh mã thứ hai.
 */

/** PageUp / PageDown / Shift+Arrow move this many steps — the Radix-era size, pinned by test. */
const PAGE_STEPS = 10;
/** Decimal places a grid division is rounded to before `floor`, as react-aria does. */
const GRID_PRECISION = 10;
/** Decimal places kept in a painted percentage — below a pixel on any rail. */
const PERCENT_PRECISION = 4;

type Axis = "horizontal" | "vertical";
type Direction = "ltr" | "rtl";
type Placement = "top" | "bottom" | "left" | "right";

const OPPOSITE: Record<Placement, Placement> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

function decimalPlaces(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const text = String(value);
  const exponent = /e-(\d+)$/.exec(text);
  if (exponent) return Number(exponent[1]);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

/** Round to the `step` grid anchored at `min` — the grid react-aria snaps its own input to. */
function snapToStep(value: number, min: number, max: number, step: number): number {
  const places = Math.max(decimalPlaces(step), decimalPlaces(min));
  const lastOnGrid = min + Math.floor(Number(((max - min) / step).toFixed(GRID_PRECISION))) * step;
  const snapped = Math.round((value - min) / step) * step + min;
  return Number(clamp(snapped, min, Math.max(min, lastOnGrid)).toFixed(places));
}

/** Where a value sits on the rail, as a 0–1 fraction from the start edge. `reverse` mirrors it. */
function fraction(value: number, min: number, max: number, reverse: boolean): number {
  if (max === min) return 0;
  const raw = (value - min) / (max - min);
  return reverse ? 1 - raw : raw;
}

function isMarkObject(
  mark: SliderMarkProp,
): mark is { label?: React.ReactNode; style?: React.CSSProperties } {
  return (
    typeof mark === "object" &&
    mark !== null &&
    !React.isValidElement(mark) &&
    !Array.isArray(mark) &&
    !(Symbol.iterator in mark)
  );
}

/** Numeric mark keys survive `Object.keys` as strings — read them back as numbers, once. */
function markEntries(marks: SliderMarksProp | undefined): [number, SliderMarkProp][] {
  if (!marks) return [];
  return Object.entries(marks)
    .map(([key, mark]) => [Number(key), mark] as [number, SliderMarkProp])
    .filter(([at]) => Number.isFinite(at))
    .sort((a, b) => a[0] - b[0]);
}

/** Every `step` from `min` up to `max` — antd `dots`. */
function dotStops(min: number, max: number, step: number): number[] {
  if (!Number.isFinite(step) || step <= 0) return [];
  const stops: number[] = [];
  for (let at = min; at <= max; at += step) stops.push(snapToStep(at, min, max, step));
  return stops;
}

/** `step={null}` — the only values a thumb may take: every mark inside the scale, `min`, `max`. */
function markStops(min: number, max: number, marks: [number, SliderMarkProp][]): number[] {
  const inside = marks.map(([at]) => at).filter((at) => at >= min && at <= max);
  return [...new Set([min, ...inside, max])].sort((a, b) => a - b);
}

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

/**
 * The `step` react-aria is handed in marks-only mode. It snaps every value it is given to its own
 * grid, so that grid must hold every mark: the greatest common divisor of their distances from
 * `min`, computed on integers so `0.1` and `0.3` agree.
 */
function gridThrough(stops: number[]): number {
  const places = Math.max(...stops.map(decimalPlaces));
  const scale = 10 ** places;
  const offsets = stops.map((at) => Math.round((at - stops[0]) * scale));
  const divisor = offsets.reduce((acc, offset) => greatestCommonDivisor(acc, Math.abs(offset)), 0);
  return divisor > 0 ? divisor / scale : 1;
}

function nearestStop(stops: number[], value: number): number {
  return stops.reduce((best, at) => (Math.abs(at - value) < Math.abs(best - value) ? at : best));
}

/** `count` stops past `from`, in `sign`'s direction — marks-only keyboard stepping. */
function stepThroughStops(stops: number[], from: number, sign: 1 | -1, count: number): number {
  const ahead =
    sign > 0 ? stops.filter((at) => at > from) : stops.filter((at) => at < from).reverse();
  if (ahead.length === 0) return from;
  return ahead[Math.min(count, ahead.length) - 1];
}

function toList(value: number | number[] | undefined): number[] | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? [...value] : [value];
}

function tooltipContent(tooltip: SliderTooltipProp | undefined, value: number): React.ReactNode {
  if (!tooltip || tooltip === true) return value;
  if (tooltip.formatter === null) return null;
  return tooltip.formatter ? tooltip.formatter(value) : value;
}

function sameList(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

type Mode = "nearest" | 1 | -1;

type SliderModel = {
  values: number[];
  min: number;
  max: number;
  axis: Axis;
  direction: Direction;
  reversed: boolean;
  /** Marks-only mode's allowed values, or `null` on a numeric step. */
  stops: number[] | null;
  step: number;
  gap: number;
  places: number;
  included: boolean;
  marks: [number, SliderMarkProp][];
  dots: boolean;
  tooltip: SliderTooltipProp;
  rootDisabled: boolean;
  thumbDisabled: (index: number) => boolean;
  editable: boolean;
  draggableTrack: boolean;
  minCount: number;
  maxCount: number;
  name?: string;
  form?: string;
  labelledBy?: string;
  isInvalid: boolean;
  isRequired: boolean;
  errorMessage?: string;
  update: (next: number[], commit: boolean) => void;
  latest: React.RefObject<number[]>;
};

/** Move one thumb to `proposed` (or `count` marks along), then hold it between its neighbours. */
function placeThumb(
  model: SliderModel,
  list: number[],
  index: number,
  proposed: number,
  mode: Mode,
  count = 1,
): number[] {
  const { min, max, stops, step, gap, places } = model;
  let target: number;
  if (stops) {
    target =
      mode === "nearest"
        ? nearestStop(stops, clamp(proposed, min, max))
        : stepThroughStops(stops, list[index], mode, count);
  } else {
    target = snapToStep(clamp(proposed, min, max), min, max, step);
  }
  const low = index > 0 ? list[index - 1] + gap : min;
  const high = index < list.length - 1 ? list[index + 1] - gap : max;
  if (low > high) return list;
  const held = Number(clamp(target, low, high).toFixed(places));
  return list.map((value, at) => (at === index ? held : value));
}

/** The whole span moves together — `draggableTrack` — keeping every distance, inside the scale. */
function shiftAll(model: SliderModel, start: number[], delta: number): number[] {
  const { min, max, step, places } = model;
  const lastOnGrid = snapToStep(max, min, max, step);
  const rounded = Math.round(delta / step) * step;
  const moved = clamp(rounded, min - start[0], lastOnGrid - start[start.length - 1]);
  return start.map((value) => Number((value + moved).toFixed(places)));
}

/** react-aria's own rule: the nearest thumb, and between two stacked ones the one that can move. */
function closestThumb(
  list: number[],
  point: number,
  disabledAt: (index: number) => boolean,
): number | null {
  let best: number | null = null;
  let bestDistance = Infinity;
  list.forEach((value, index) => {
    if (disabledAt(index)) return;
    const distance = Math.abs(value - point);
    if (distance < bestDistance || (distance === bestDistance && point > value)) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

/**
 * Which way an arrow moves the value. Horizontal follows the reading direction and `reverse`;
 * Up always increases unless a vertical scale is reversed — the Radix-era key map, pinned by test.
 */
function arrowSign(key: string, axis: Axis, direction: Direction, reversed: boolean): 1 | -1 {
  if (axis === "vertical") {
    if (key === "ArrowUp") return reversed ? -1 : 1;
    if (key === "ArrowDown") return reversed ? 1 : -1;
    return key === "ArrowRight" ? 1 : -1;
  }
  if (key === "ArrowUp") return 1;
  if (key === "ArrowDown") return -1;
  const rightIncreases = (direction === "ltr") !== reversed;
  return (key === "ArrowRight") === rightIncreases ? 1 : -1;
}

const ARROWS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);

/** A share of the rail as a CSS percentage. Rounded: `1 - 0.9` is 9.999999999999998, not 10. */
function percent(share: number): string {
  return `${Number((share * 100).toFixed(PERCENT_PRECISION))}%`;
}

function offsetStyle(model: SliderModel, value: number, name: string): React.CSSProperties {
  return {
    [name]: percent(fraction(value, model.min, model.max, model.reversed)),
  } as React.CSSProperties;
}

/**
 * antd `tooltip` — a bubble INSIDE the thumb, so it rides the thumb through a drag, a resize,
 * `reverse` and RTL with no positioning code. `autoAdjustOverflow` flips it to the opposite side
 * when the thumb's own rect leaves too little room on the asked-for side; the room is measured
 * against the bubble's size, which does not change with the side, so the choice cannot oscillate.
 */
function SliderTooltip({
  placement,
  adjust,
  open,
  direction,
  children,
}: {
  placement: Placement;
  adjust: boolean;
  open: boolean | undefined;
  direction: Direction;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [flipped, setFlipped] = React.useState(false);

  // Deliberately dependency-free: the room depends on where the THUMB is, which moves on every
  // value change and on any scroll of an ancestor, and neither is a prop this component can list.
  // `setFlipped` with the same answer is a no-op, and the answer is measured against the bubble's
  // own size — which does not change with the side — so it cannot oscillate.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useLayoutEffect(() => {
    const anchor = ref.current;
    const thumb = anchor?.parentElement;
    if (!anchor || !thumb || !adjust) {
      setFlipped(false);
      return;
    }
    const rect = thumb.getBoundingClientRect();
    const vertical = placement === "top" || placement === "bottom";
    const need = vertical ? anchor.offsetHeight : anchor.offsetWidth;
    const inlineStartRoom = direction === "rtl" ? window.innerWidth - rect.right : rect.left;
    const inlineEndRoom = direction === "rtl" ? rect.left : window.innerWidth - rect.right;
    const room: Record<Placement, number> = {
      top: rect.top,
      bottom: window.innerHeight - rect.bottom,
      left: inlineStartRoom,
      right: inlineEndRoom,
    };
    setFlipped(room[placement] < need && room[OPPOSITE[placement]] > room[placement]);
  });

  return (
    <span
      ref={ref}
      data-slot="slider-tooltip"
      data-placement={flipped ? OPPOSITE[placement] : placement}
      data-open={open === undefined ? undefined : String(open)}
      className="ui-slider-tooltip"
      // The thumb already announces its value through its range input (native `value`, plus the
      // `aria-valuetext` written above) — a bubble in the tree would be read twice.
      aria-hidden="true"
    >
      <span className="ui-slider-tooltip-content">{children}</span>
    </span>
  );
}

function SliderThumbView({
  model,
  index,
  value,
  inputRef,
}: {
  model: SliderModel;
  index: number;
  value: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { tooltip, values } = model;
  const multiple = values.length > 1;
  const indexId = React.useId();

  const content = tooltip === false ? null : tooltipContent(tooltip, value);
  const settings = typeof tooltip === "object" ? tooltip : undefined;
  const spoken =
    settings?.formatter && (typeof content === "string" || typeof content === "number")
      ? String(content)
      : undefined;

  // `formatter` is ALSO the value's spoken form. react-aria writes its own number-formatted
  // `aria-valuetext` onto the input on every value change; this runs after that commit.
  React.useLayoutEffect(() => {
    if (spoken !== undefined) inputRef.current?.setAttribute("aria-valuetext", spoken);
  }, [inputRef, spoken, value]);

  const labelledBy = [model.labelledBy, multiple ? indexId : undefined].filter(Boolean).join(" ");

  return (
    <AriaSliderThumb
      index={index}
      data-slot="slider-thumb"
      data-index={index}
      className="ui-slider-thumb"
      // react-aria positions the thumb with a physical `left`/`top` and a translate that only
      // centres it in LTR, and it knows nothing of `reverse`. Both are handed back to control.css,
      // which places the thumb from this one logical offset.
      style={{
        ...offsetStyle(model, value, "--slider-thumb-offset"),
        left: undefined,
        top: undefined,
        transform: undefined,
      }}
      isDisabled={model.thumbDisabled(index)}
      name={model.name ? (multiple ? `${model.name}[]` : model.name) : undefined}
      form={model.form}
      inputRef={inputRef}
      aria-labelledby={labelledBy || undefined}
      isInvalid={model.isInvalid || undefined}
      isRequired={model.isRequired || undefined}
      aria-errormessage={model.errorMessage}
    >
      {multiple ? (
        <span id={indexId} className="sr-only">
          {index + 1}
        </span>
      ) : null}
      {content !== null && content !== undefined ? (
        <SliderTooltip
          placement={settings?.placement ?? (model.axis === "vertical" ? "right" : "top")}
          adjust={settings?.autoAdjustOverflow ?? true}
          open={settings?.open}
          direction={model.direction}
        >
          {content}
        </SliderTooltip>
      ) : null}
    </AriaSliderThumb>
  );
}

function SliderBody({ model }: { model: SliderModel }) {
  const state = React.useContext(SliderStateContext);
  const railRef = React.useRef<HTMLSpanElement>(null);
  const pendingFocus = React.useRef<number | null>(null);
  const stopDrag = React.useRef<(() => void) | null>(null);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const { values, min, max, axis, direction, reversed, stops, step } = model;

  // One ref per thumb, stable for as long as the thumb count is: react-aria takes a RefObject.
  const thumbCount = values.length;
  const inputRefs = React.useMemo(
    () => Array.from({ length: thumbCount }, () => React.createRef<HTMLInputElement>()),
    [thumbCount],
  );

  // A thumb that was just added (`editable`) does not exist until this render commits, so focus
  // and react-aria's drag flag (which drives `data-dragging`, and with it the value bubble) are
  // applied here rather than in the handler that created it.
  React.useLayoutEffect(() => {
    if (pendingFocus.current !== null) {
      inputRefs[pendingFocus.current]?.current?.focus();
      pendingFocus.current = null;
    }
  });
  // `state` is a NEW object on every render (useSliderState builds one), so an effect that
  // depended on it would set dragging, re-render, and set it again — React stops that at 50
  // nested updates. The flag turns over only when the dragged thumb does; the setter it calls
  // reaches the same refs whichever render's object holds it.
  const stateRef = React.useRef(state);
  React.useLayoutEffect(() => {
    stateRef.current = state;
  });
  React.useLayoutEffect(() => {
    if (activeIndex === null) return;
    stateRef.current?.setThumbDragging(activeIndex, true);
    return () => stateRef.current?.setThumbDragging(activeIndex, false);
  }, [activeIndex]);
  React.useEffect(() => () => stopDrag.current?.(), []);

  function focusThumb(index: number) {
    pendingFocus.current = index;
    inputRefs[index]?.current?.focus();
  }

  function valueAtPoint(clientX: number, clientY: number): number {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect) return min;
    let share =
      axis === "vertical"
        ? rect.height > 0
          ? (rect.bottom - clientY) / rect.height
          : 0
        : rect.width > 0
          ? (clientX - rect.left) / rect.width
          : 0;
    if (axis === "horizontal" && direction === "rtl") share = 1 - share;
    if (reversed) share = 1 - share;
    return min + clamp(share, 0, 1) * (max - min);
  }

  function thumbIndexOf(target: EventTarget | null): number | null {
    const thumb = (target as Element | null)?.closest?.('[data-slot="slider-thumb"]');
    if (!thumb) return null;
    return Number(thumb.getAttribute("data-index"));
  }

  function onKeyDownCapture(event: React.KeyboardEvent) {
    const index = thumbIndexOf(event.target);
    if (index === null || model.rootDisabled || model.thumbDisabled(index)) return;
    const list = model.latest.current;
    const along = (sign: 1 | -1, count: number) =>
      stops
        ? placeThumb(model, list, index, list[index], sign, count)
        : placeThumb(model, list, index, list[index] + sign * step * count, "nearest");
    let next: number[];
    if (ARROWS.has(event.key)) {
      next = along(
        arrowSign(event.key, axis, direction, reversed),
        event.shiftKey ? PAGE_STEPS : 1,
      );
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      next = along(event.key === "PageUp" ? 1 : -1, PAGE_STEPS);
    } else if (event.key === "Home" || event.key === "End") {
      next = placeThumb(model, list, index, event.key === "Home" ? min : max, "nearest");
    } else if (
      (event.key === "Delete" || event.key === "Backspace") &&
      model.editable &&
      list.length > model.minCount
    ) {
      next = list.filter((_, at) => at !== index);
      if (next.length > 0) pendingFocus.current = Math.min(index, next.length - 1);
    } else {
      return;
    }
    // Before react-aria's own key handling (bubble phase, on the thumb) and before the native
    // range input's default step.
    event.preventDefault();
    event.stopPropagation();
    model.update(next, true);
  }

  function onPointerDownCapture(event: React.PointerEvent) {
    // react-aria's own track / thumb handlers never run: one path decides every pointer outcome.
    event.stopPropagation();
    if (model.rootDisabled) return;
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey) return;
    const list = model.latest.current;
    const target = event.target as Element;
    const at = valueAtPoint(event.clientX, event.clientY);
    let index: number | null = null;
    let grab = 0;
    let track: { at: number; values: number[] } | null = null;
    let next = list;

    const pressedThumb = thumbIndexOf(target);
    if (pressedThumb !== null) {
      if (model.thumbDisabled(pressedThumb)) return;
      index = pressedThumb;
      // Hold the thumb where it was grabbed: pressing off-centre must not make it jump.
      grab = at - list[pressedThumb];
    } else if (
      model.draggableTrack &&
      list.length > 1 &&
      target.closest?.('[data-slot="slider-range"]')
    ) {
      track = { at, values: list };
    } else {
      const mark = target.closest?.('[data-slot="slider-mark"]');
      const point = mark ? Number(mark.getAttribute("data-value")) : at;
      if (model.editable && list.length < model.maxCount) {
        const settled = placeThumb(model, [point], 0, point, "nearest")[0];
        const insertAt = list.findIndex((value) => value > settled);
        index = insertAt === -1 ? list.length : insertAt;
        next = [...list.slice(0, index), settled, ...list.slice(index)];
      } else {
        index = closestThumb(list, point, model.thumbDisabled);
        if (index === null) return;
        next = placeThumb(model, list, index, point, "nearest");
      }
    }

    event.preventDefault();
    const start = list;
    const pointerId = event.pointerId;
    if (next !== list) model.update(next, false);
    if (index !== null) {
      focusThumb(index);
      setActiveIndex(index);
    }

    const onMove = (move: PointerEvent) => {
      if (move.pointerId !== pointerId) return;
      const point = valueAtPoint(move.clientX, move.clientY);
      if (track) {
        model.update(shiftAll(model, track.values, point - track.at), false);
      } else if (index !== null) {
        model.update(
          placeThumb(model, model.latest.current, index, point - grab, "nearest"),
          false,
        );
      }
    };
    const finish = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      stopDrag.current = null;
      setActiveIndex(null);
    };
    const onUp = (up: PointerEvent) => {
      if (up.pointerId !== pointerId) return;
      finish();
      const final = model.latest.current;
      if (!sameList(final, start)) model.update(final, true);
    };
    stopDrag.current?.();
    stopDrag.current = finish;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  const first = values[0] ?? min;
  const last = values[values.length - 1] ?? min;
  const spanFrom = values.length > 1 ? first : min;
  const spanTo = values.length > 1 ? last : first;
  const startShare = fraction(spanFrom, min, max, reversed);
  const endShare = fraction(spanTo, min, max, reversed);
  const dots = !model.dots ? [] : stops ? stops : dotStops(min, max, step);
  const markOffset =
    axis === "vertical" ? "--slider-mark-offset-block" : "--slider-mark-offset-inline";

  return (
    <AriaSliderTrack
      data-slot="slider-control"
      className="ui-slider-control"
      onPointerDownCapture={onPointerDownCapture}
      // The compatibility events a pointer press is followed by — react-aria listens to both.
      onMouseDownCapture={(event) => event.stopPropagation()}
      onTouchStartCapture={(event) => event.stopPropagation()}
      // `SliderTrackProps` leaves keyboard events out of its TYPE, but SliderTrack spreads every
      // prop it is given onto its div — and this div holds every thumb's input, so it is the one
      // element whose capture phase runs before react-aria's key handlers on the thumb.
      {...({ onKeyDownCapture } as React.HTMLAttributes<HTMLDivElement>)}
    >
      <span ref={railRef} data-slot="slider-track" className="ui-slider-track">
        {/* antd `included={false}` — the rail carries marks only and nothing is "up to here",
            so painting a filled span from the start would assert a magnitude that is not there. */}
        {model.included && values.length > 0 ? (
          <span
            data-slot="slider-range"
            data-draggable={model.draggableTrack && values.length > 1 ? "true" : undefined}
            className="ui-slider-range"
            style={
              {
                "--slider-range-start": percent(Math.min(startShare, endShare)),
                "--slider-range-size": percent(Math.abs(endShare - startShare)),
              } as React.CSSProperties
            }
          />
        ) : null}
        {dots.map((at) => (
          <span
            key={`dot-${at}`}
            data-slot="slider-dot"
            data-active={
              model.included && at >= spanFrom && at <= spanTo && values.length > 0
                ? "true"
                : undefined
            }
            className="ui-slider-dot"
            style={offsetStyle(model, at, markOffset)}
            aria-hidden="true"
          />
        ))}
      </span>
      {values.map((value, index) => (
        <SliderThumbView
          key={index}
          model={model}
          index={index}
          value={value}
          inputRef={inputRefs[index]}
        />
      ))}
      {model.marks.length > 0 ? (
        <span data-slot="slider-marks" className="ui-slider-marks" aria-hidden="true">
          {model.marks.map(([at, mark]) => {
            const label = isMarkObject(mark) ? mark.label : mark;
            return (
              <span
                key={`mark-${at}`}
                data-slot="slider-mark"
                data-value={at}
                className="ui-slider-mark"
                style={offsetStyle(model, at, markOffset)}
              >
                <span
                  className="ui-slider-mark-label"
                  style={isMarkObject(mark) ? mark.style : undefined}
                >
                  {label}
                </span>
              </span>
            );
          })}
        </span>
      ) : null}
    </AriaSliderTrack>
  );
}

/** Numeric slider — react-aria-components underneath, antd 6 `Slider` API on top. */
export const Slider = React.forwardRef<HTMLDivElement, SliderProp>((props, ref) => {
  const {
    className,
    value,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    range,
    marks,
    dots = false,
    included = true,
    reverse = false,
    inverted,
    tooltip = false,
    disabled,
    orientation,
    vertical = false,
    dir,
    minStepsBetweenThumbs = 0,
    onValueChange,
    onValueCommit,
    onChange,
    onChangeComplete,
    name,
    form,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    "aria-invalid": ariaInvalid,
    "aria-required": ariaRequired,
    "aria-errormessage": ariaErrormessage,
    ...rest
  } = props;

  const locale = useLocale();
  const direction: Direction = dir ?? locale.direction;
  const axis: Axis = orientation ?? (vertical ? "vertical" : "horizontal");
  const reversed = inverted ?? reverse;
  const rangeConfig: SliderRangeConfigProp | undefined =
    typeof range === "object" && range !== null ? range : undefined;
  const rangeOn = range === true || rangeConfig !== undefined;
  const perThumbDisabled = Array.isArray(disabled) ? disabled : undefined;
  const rootDisabled = disabled === true;
  // antd: "When any rendered handle is disabled, editable mode will be disabled", and `editable`
  // "cannot be used with draggableTrack". A marks-only scale has no step to drag a span by.
  const editable = Boolean(rangeConfig?.editable) && !perThumbDisabled?.some(Boolean);
  const draggableTrack = Boolean(rangeConfig?.draggableTrack) && !editable && step !== null;

  const ticks = markEntries(marks);
  const stops = step === null ? markStops(min, max, ticks) : null;
  const gridStep = stops ? gridThrough(stops) : (step as number);
  const places = Math.max(decimalPlaces(gridStep), decimalPlaces(min));

  const settle = (list: number[]): number[] =>
    list
      .map((at) =>
        stops
          ? nearestStop(stops, clamp(at, min, max))
          : snapToStep(clamp(at, min, max), min, max, gridStep),
      )
      .sort((a, b) => a - b);

  // How many thumbs there are. `range` is a DECLARATION where the array length is only a guess:
  // stated, a range whose value is still loading spans [min, max] instead of rendering as a point,
  // and `range={false}` keeps one thumb even when handed an array. Unstated, the Radix-era
  // inference holds: one thumb per array entry, one at `min` when nothing is given.
  const resolve = (given: number[] | undefined): number[] => {
    if (rangeOn) {
      if (!given) return [min, max];
      if (editable || given.length >= 2) return settle(given);
      return settle([given[0] ?? min, max]);
    }
    if (range === false) return settle([given?.[0] ?? min]);
    return settle(given && given.length > 0 ? given : [min]);
  };

  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<number[]>(() => resolve(toList(defaultValue)));
  const values = isControlled ? resolve(toList(value)) : internal;

  const latest = React.useRef(values);
  React.useLayoutEffect(() => {
    latest.current = values;
  });

  const emit = rangeOn ? (list: number[]) => list : (list: number[]) => list[0];
  const update = (next: number[], commit: boolean) => {
    if (sameList(next, latest.current)) {
      if (!commit) return;
    } else {
      latest.current = next;
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
      (onChange as ((next: number | number[]) => void) | undefined)?.(emit(next));
    }
    if (commit) {
      onValueCommit?.(next);
      (onChangeComplete as ((next: number | number[]) => void) | undefined)?.(emit(next));
    }
  };

  // react-aria's own `onChange` is reached only by the native range input — a screen reader's
  // increment/decrement, or a form reset. It is routed through the same placement rules.
  const onAriaChange = (next: number | number[]) => {
    const list = latest.current;
    const proposed = Array.isArray(next) ? next : [next];
    const index = proposed.findIndex((at, position) => at !== list[position]);
    if (index === -1) return;
    const sign: 1 | -1 = proposed[index] > list[index] ? 1 : -1;
    const placed = placeThumb(model, list, index, proposed[index], stops ? sign : "nearest");
    if (!sameList(placed, list)) update(placed, true);
  };

  const isInvalid = ariaInvalid !== undefined && ariaInvalid !== false && ariaInvalid !== "false";
  const isRequired = ariaRequired === true || ariaRequired === "true";

  const model: SliderModel = {
    values,
    min,
    max,
    axis,
    direction,
    reversed,
    stops,
    step: gridStep,
    gap: stops ? 0 : minStepsBetweenThumbs * gridStep,
    places,
    included,
    marks: ticks,
    dots,
    tooltip,
    rootDisabled,
    thumbDisabled: (index) => rootDisabled || Boolean(perThumbDisabled?.[index]),
    editable,
    draggableTrack,
    minCount: rangeConfig?.minCount ?? 0,
    maxCount: rangeConfig?.maxCount ?? Infinity,
    name,
    form,
    labelledBy: ariaLabelledby,
    isInvalid,
    isRequired,
    errorMessage: ariaErrormessage,
    update,
    latest,
  };

  return (
    <AriaSlider
      {...(rest as Record<string, unknown>)}
      ref={ref}
      id={id}
      data-slot="slider"
      data-has-marks={ticks.length > 0 ? "true" : undefined}
      data-reverse={reversed ? "true" : undefined}
      // The geometry above is computed in this direction, and control.css draws it with logical
      // properties — so the element that CSS reads direction from must say the same thing. Unlike
      // Segmented (whose `dir` was pure noise once react-aria read the locale itself), the
      // slider's key map, pointer map and painted positions all hang off this one value.
      dir={direction}
      className={cn("ui-slider", className)}
      value={values}
      onChange={onAriaChange}
      minValue={min}
      maxValue={max}
      step={gridStep}
      orientation={axis}
      isDisabled={rootDisabled}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
    >
      {/* The name every thumb is read by. react-aria prefixes each thumb's `aria-labelledby` with
          this label's id, so it holds the `aria-label` text — or nothing, when an external
          `aria-labelledby` (a FormField's label) is the name and would otherwise be read twice. */}
      <AriaLabel className="sr-only">{ariaLabelledby ? null : ariaLabel}</AriaLabel>
      <SliderBody model={model} />
    </AriaSlider>
  );
});
Slider.displayName = "Slider";

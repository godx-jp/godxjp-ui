import * as React from "react";

/**
 * Category-axis sizing for the HORIZONTAL bar chart (gh#409 · 1).
 *
 * recharts reserves a fixed 60px for the category axis whatever the ticks say, so a Japanese
 * company name — 8–10 full-width glyphs, 100–125px — was painted OUTSIDE the chart box and the
 * SVG clip cut it from the START, removing exactly the identifying `株式会社` prefix. Latin text
 * degrades gracefully there; 全角 does not, and `docs/DESIGN-AUTHORITY.md` gives anything the user
 * READS to the Japanese standard.
 *
 * The mechanism: measure every tick in the real rendered typography, size the axis from the
 * WIDEST one, cap that at a token-owned fraction of the canvas so one long name can never eat
 * the bars, and truncate anything past the cap at its END — the start, which identifies the row,
 * always survives, and the full string stays reachable through the tick's `<title>` and the
 * figure's screen-reader list.
 *
 * The two knobs are component tokens (`src/tokens/components/chart.css`). They are read back in
 * px from real CSS properties on the probe element, because a custom property's computed value
 * keeps whatever unit its author wrote.
 */

/** Axis knobs resolved from the probe's computed style. `gap` is px, `maxFraction` unitless. */
export type CategoryAxisKnobs = {
  /** Space between the tick text and the plot area. */
  gap: number;
  /** Share of the canvas the category axis may take, 0..1. */
  maxFraction: number;
};

/** What the chart needs to draw the axis: its reserved width and the text of each tick. */
export type CategoryAxisMetrics = {
  /** `width` for recharts' `YAxis`, or `undefined` while nothing has been measured yet. */
  width: number | undefined;
  /** Tick text to paint — the original label, or one truncated at its END. */
  display: (label: string) => string;
};

/** Ellipsis appended to a label cut at the end. */
const ELLIPSIS = "…";

/**
 * Axis width from the measured tick widths: the widest tick, capped, plus the gap.
 * Pure — the browser measurement is injected, so the rule is testable without a layout engine.
 */
export function resolveCategoryAxisWidth(
  textWidths: readonly number[],
  available: number,
  { gap, maxFraction }: CategoryAxisKnobs,
): { width: number; textCap: number } {
  const textCap = Math.max(0, available * maxFraction - gap);
  const widest = textWidths.length > 0 ? Math.max(...textWidths) : 0;
  return { width: Math.ceil(Math.min(widest, textCap) + gap), textCap };
}

/**
 * Cut `label` at its END until it fits `maxWidth`, appending an ellipsis. The first glyph is
 * always kept: a tick that reads `…` identifies nothing, and a tick cut from the front is the
 * bug this exists to fix.
 */
export function truncateToWidth(
  label: string,
  maxWidth: number,
  measure: (text: string) => number,
): string {
  if (measure(label) <= maxWidth) return label;
  const glyphs = [...label];
  for (let keep = glyphs.length - 1; keep > 1; keep -= 1) {
    const candidate = glyphs.slice(0, keep).join("") + ELLIPSIS;
    if (measure(candidate) <= maxWidth) return candidate;
  }
  return `${glyphs[0] ?? ""}${ELLIPSIS}`;
}

/** Read the token-owned knobs off the probe, which maps them onto real CSS properties. */
function readKnobs(probe: HTMLElement): CategoryAxisKnobs {
  const style = getComputedStyle(probe);
  const gap = Number.parseFloat(style.marginInlineEnd);
  const maxFraction = Number.parseFloat(
    style.getPropertyValue("--chart-category-axis-max-fraction"),
  );
  return {
    gap: Number.isFinite(gap) ? gap : 0,
    maxFraction: Number.isFinite(maxFraction) ? maxFraction : 1,
  };
}

function sameTruncations(a: Map<string, string>, b: Map<string, string>): boolean {
  if (a.size !== b.size) return false;
  for (const [key, value] of a) {
    if (b.get(key) !== value) return false;
  }
  return true;
}

/**
 * Measure the category ticks in the live document and keep the axis sized to them.
 *
 * Re-runs when the canvas resizes and once `document.fonts` settles, because a CJK web face
 * arriving after first paint changes every one of these widths.
 */
export function useCategoryAxisMetrics(
  canvasRef: React.RefObject<HTMLDivElement | null>,
  probeRef: React.RefObject<HTMLSpanElement | null>,
  labels: readonly string[],
  enabled: boolean,
): CategoryAxisMetrics {
  const [measured, setMeasured] = React.useState<
    { width: number; truncations: Map<string, string> } | undefined
  >(undefined);
  // `labels` is a fresh array on every render of the caller; the JOINED text is the real input.
  const labelsRef = React.useRef(labels);
  labelsRef.current = labels;
  const key = labels.join("\u0000");

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const probe = probeRef.current;
    if (!enabled || !canvas || !probe) {
      setMeasured(undefined);
      return;
    }
    const ticks = labelsRef.current;

    const measure = (text: string): number => {
      probe.textContent = text;
      return probe.getBoundingClientRect().width;
    };

    const run = () => {
      const available = canvas.clientWidth;
      if (available <= 0) return;
      const knobs = readKnobs(probe);
      const widths = ticks.map(measure);
      const { width, textCap } = resolveCategoryAxisWidth(widths, available, knobs);
      const truncations = new Map<string, string>();
      ticks.forEach((label, index) => {
        if ((widths[index] ?? 0) > textCap) {
          truncations.set(label, truncateToWidth(label, textCap, measure));
        }
      });
      probe.textContent = "";
      setMeasured((previous) =>
        previous && previous.width === width && sameTruncations(previous.truncations, truncations)
          ? previous
          : { width, truncations },
      );
    };

    run();
    const observer = new ResizeObserver(run);
    observer.observe(canvas);
    let live = true;
    void document.fonts?.ready.then(() => {
      if (live) run();
    });
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [canvasRef, probeRef, enabled, key]);

  const truncations = measured?.truncations;
  const display = React.useCallback(
    (label: string) => truncations?.get(label) ?? label,
    [truncations],
  );
  return { width: measured?.width, display };
}

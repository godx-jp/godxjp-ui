import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Progress } from "../progress";

/**
 * `shape="ring"` — the SAME meter, drawn as an arc.
 *
 * The consumer case that asked for it: a phone app bar showing "18 of 42 done" beside a title. A
 * bar plus its caption is two stacked rows; a ring is one square. Nothing else about it differs —
 * same `value`, same `tone`, same `size`, and the same `role="progressbar"` with the same
 * `aria-valuenow`/`aria-valuetext`, because it is the same measurement.
 *
 * The arithmetic is the part worth pinning. `pathLength="100"` tells the renderer the circle
 * measures 100 units whatever its radius is, so `stroke-dasharray: <value> 100` IS the percentage
 * and no circumference is ever computed. Get that wrong and the arc is silently a fraction of what
 * it should be, with every ARIA value still correct — the loudest possible defect drawn by the
 * quietest possible bug.
 */
const layoutCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../styles/data-display-layout.css"),
  "utf8",
);

function ring(props: Parameters<typeof Progress>[0]) {
  const { container } = render(<Progress {...props} />);
  return container.querySelector(".ui-progress") as HTMLElement;
}

describe("Progress shape=ring", () => {
  it("keeps the meter's role and values — it is the same measurement", () => {
    ring({ shape: "ring", value: 43, "aria-label": "Audits done" });
    const bar = screen.getByRole("progressbar", { name: "Audits done" });
    expect(bar).toHaveAttribute("aria-valuenow", "43");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuetext", "43%");
  });

  /**
   * The dash length is the percentage because the path declares its own length as 100. Asserted
   * for the two ends and a middle, so an off-by-a-circumference cannot hide in one of them.
   */
  it.each([
    [0, "0 100"],
    [43, "43 100"],
    [100, "100 100"],
    // Clamped like the bar: out of range degrades to an empty or full arc, never to a NaN dash.
    [-5, "0 100"],
    [130, "100 100"],
  ])("draws value %i as stroke-dasharray %s over pathLength 100", (value, dasharray) => {
    const root = ring({ shape: "ring", value, "aria-label": "x" });
    const arc = root.querySelector(".ui-progress-ring-indicator") as SVGCircleElement;
    expect(arc).toHaveAttribute("pathLength", "100");
    // An SVG presentation ATTRIBUTE, not an inline style: React renders `strokeDasharray` on an
    // <circle> as `stroke-dasharray`, so reading `.style` here would pass vacuously on an empty
    // string for every case.
    expect(arc).toHaveAttribute("stroke-dasharray", dasharray);
  });

  /** The drawing says nothing to a screen reader: the element above already carries the number. */
  it("hides the arc from assistive technology", () => {
    const root = ring({ shape: "ring", value: 50, "aria-label": "x" });
    const svg = root.querySelector(".ui-progress-ring-svg") as SVGElement;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  /** `label` moves INSIDE the ring — that is the whole reason to reach for this shape. */
  it("puts the readout inside the ring and still names the meter with it", () => {
    const root = ring({ shape: "ring", value: 43, label: "18/42" });
    const readout = root.querySelector(".ui-progress-ring-label") as HTMLElement;
    expect(readout).not.toBeNull();
    expect(readout.textContent).toBe("18/42");
    expect(root.querySelector(".ui-progress-label")).toBeNull();
    expect(screen.getByRole("progressbar", { name: "18/42" })).toBe(root);
  });

  /** Quiet default (rule #44): a bar emits no attribute, so no ring rule can reach it. */
  it("leaves the bar untouched", () => {
    const bar = ring({ value: 43, label: "x" });
    expect(bar).not.toHaveAttribute("data-shape");
    expect(bar.querySelector(".ui-progress-bar")).not.toBeNull();
    expect(bar.querySelector(".ui-progress-ring")).toBeNull();

    const asRing = ring({ shape: "ring", value: 43, label: "x" });
    expect(asRing).toHaveAttribute("data-shape", "ring");
    expect(asRing.querySelector(".ui-progress-bar")).toBeNull();
  });

  /**
   * THE ARC IS THE SAME DATUM AS THE BAR, so it reads the same tier — nothing is written on it and
   * where it stops IS the number, which is what WCAG 2.2 SC 1.4.11 is about. A ring on the FILL
   * tier would repeat exactly the defect the bar was moved off: 1.60:1 warning on the light track.
   * jsdom paints nothing, so the tokens are read where they are written.
   */
  it("strokes the MARK tier, like the bar and the breakdown slices", () => {
    // The default reads the same component knob the bar does, so a service that retunes
    // `--progress-fill-background` once moves both shapes; the fallback behind it is the mark.
    expect(layoutCss).toContain(
      "stroke: var(--progress-fill-background, hsl(var(--mark-success)));",
    );
    expect(layoutCss).toContain("stroke: hsl(var(--mark-warning));");
    expect(layoutCss).toContain("stroke: hsl(var(--mark-destructive));");
    // And no ring rule may fall back to the FILL tier, which is the defect the bar was moved off.
    for (const fill of ["--success", "--warning", "--destructive"]) {
      expect(layoutCss).not.toContain(`stroke: hsl(var(${fill}));`);
    }
  });

  /**
   * The over-capacity HATCH is a bar drawing — diagonal stripes across a rectangle — and there is
   * no arc equivalent, so `over` does not stripe a ring. The destructive tone and the real ratio in
   * `aria-valuetext` still carry it, which is what a reader and a screen reader each need.
   */
  it("reports an over-capacity value without pretending to stripe an arc", () => {
    const root = ring({ shape: "ring", value: 132, over: true, "aria-label": "x" });
    expect(root).not.toHaveAttribute("data-over");
    expect(root).toHaveAttribute("data-tone", "destructive");
    expect(root).toHaveAttribute("aria-valuetext", "132%");
    const arc = root.querySelector(".ui-progress-ring-indicator") as SVGCircleElement;
    expect(arc).toHaveAttribute("stroke-dasharray", "100 100");
  });
});

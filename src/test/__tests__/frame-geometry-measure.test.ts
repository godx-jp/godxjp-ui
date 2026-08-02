import { afterEach, describe, expect, it } from "vitest";

// The frame-geometry reachability rule is pure decision logic (geometry in, a count out), so it is
// unit-tested here against a synthetic box model; scripts/frame-geometry.mjs only serialises this
// function into Chromium and feeds it real frames. Same split as visual-audit-rules.mjs.
// @ts-expect-error — plain .mjs script module, no types
import { measure } from "../../../scripts/frame-geometry-measure.mjs";

/**
 * Minimal box model: a node knows its absolute inline offset and width, and its client rect is
 * that offset shifted by every ancestor's `scrollLeft` — which is exactly the property `measure`
 * relies on when it scrolls a container to test reachability.
 */
class Box {
  x: number;
  width: number;
  overflowX: string;
  scrollWidth: number;
  clientWidth: number;
  parentElement: Box | null = null;
  children: Box[] = [];
  focusable = false;
  #scrollLeft = 0;

  /** Clamped exactly like a real scroll container — a container cannot scroll past its content. */
  get scrollLeft() {
    return this.#scrollLeft;
  }
  set scrollLeft(next: number) {
    this.#scrollLeft = Math.max(0, Math.min(next, this.scrollWidth - this.clientWidth));
  }

  constructor(opts: {
    x: number;
    width: number;
    overflowX?: string;
    scrollWidth?: number;
    clientWidth?: number;
  }) {
    this.x = opts.x;
    this.width = opts.width;
    this.overflowX = opts.overflowX ?? "visible";
    this.clientWidth = opts.clientWidth ?? opts.width;
    this.scrollWidth = opts.scrollWidth ?? this.clientWidth;
  }

  append(child: Box) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  getBoundingClientRect() {
    let dx = 0;
    for (let p: Box | null = this.parentElement; p; p = p.parentElement) dx += p.scrollLeft;
    const left = this.x - dx;
    return { left, right: left + this.width, top: 0, bottom: 24, width: this.width, height: 24 };
  }

  /** `measure` only ever asks the frame for its focusable descendants. */
  querySelectorAll() {
    const out: Box[] = [];
    const walk = (n: Box) => n.children.forEach((c) => (out.push(c), walk(c)));
    walk(this);
    return out.filter((b) => b.focusable);
  }
}

/** Frame is 300px wide with no document overflow — the shape of every failing case we found. */
function withFrame(build: (frame: Box) => void) {
  const frame = new Box({ x: 0, width: 300, overflowX: "auto" });
  build(frame);
  const g = globalThis as unknown as Record<string, unknown>;
  g.document = { querySelector: () => frame };
  g.getComputedStyle = (n: Box) => ({ overflowX: n.overflowX });
  return measure() as { overflowX: boolean; clipped: number };
}

afterEach(() => {
  const g = globalThis as unknown as Record<string, unknown>;
  delete g.document;
  delete g.getComputedStyle;
});

const focusable = (box: Box) => ((box.focusable = true), box);

describe("frame-geometry · clipped = UNREACHABLE, not merely out of frame", () => {
  it("counts a control that overflows the frame with no scroll container (real defect)", () => {
    // data-entry-rating @320: a rating button painted at 278→302 past a 300px frame, nothing to
    // scroll. This is the WCAG 2.1.1 / 2.4.7 case the gate exists for.
    const r = withFrame((frame) => {
      const row = frame.append(new Box({ x: 0, width: 300 }));
      focusable(row.append(new Box({ x: 278, width: 24 })));
    });
    expect(r.clipped).toBe(1);
  });

  it("does NOT count a control inside a scroll region that can bring it into view", () => {
    // layout-master-detail @320: the DataTable sort button sits at 464→505 inside
    // `.ui-data-table-scroll` (clientWidth 244 / scrollWidth 640) — one scroll away, and the
    // browser performs that scroll itself when the button takes focus.
    const r = withFrame((frame) => {
      const scroller = frame.append(
        new Box({ x: 0, width: 244, overflowX: "auto", clientWidth: 244, scrollWidth: 640 }),
      );
      focusable(scroller.append(new Box({ x: 464, width: 41 })));
    });
    expect(r.clipped).toBe(0);
  });

  it("does NOT count content wider than its own scroll viewport (a full table row)", () => {
    // A 640px focusable table row can never fit a 244px scroller; it is still reachable.
    const r = withFrame((frame) => {
      const scroller = frame.append(
        new Box({ x: 0, width: 244, overflowX: "auto", clientWidth: 244, scrollWidth: 640 }),
      );
      focusable(scroller.append(new Box({ x: 0, width: 640 })));
    });
    expect(r.clipped).toBe(0);
  });

  it("still counts a control clipped by an overflow:hidden container (no user can scroll it)", () => {
    const r = withFrame((frame) => {
      const clipper = frame.append(
        new Box({ x: 0, width: 244, overflowX: "hidden", clientWidth: 244, scrollWidth: 640 }),
      );
      focusable(clipper.append(new Box({ x: 464, width: 41 })));
    });
    expect(r.clipped).toBe(1);
  });

  it("still counts a control a scroll container cannot reach", () => {
    // The scroller has room, but the control is painted outside its scrollable content entirely
    // (e.g. an absolutely-positioned escape) — scrolling to the end never reveals it.
    const r = withFrame((frame) => {
      const scroller = frame.append(
        new Box({ x: 0, width: 244, overflowX: "auto", clientWidth: 244, scrollWidth: 260 }),
      );
      focusable(scroller.append(new Box({ x: 900, width: 41 })));
    });
    expect(r.clipped).toBe(1);
  });

  it("leaves scroll offsets untouched after probing", () => {
    let scroller!: Box;
    withFrame((frame) => {
      scroller = frame.append(
        new Box({ x: 0, width: 244, overflowX: "auto", clientWidth: 244, scrollWidth: 640 }),
      );
      focusable(scroller.append(new Box({ x: 464, width: 41 })));
    });
    expect(scroller.scrollLeft).toBe(0);
  });

  it("reports document overflow independently of the clipped count", () => {
    const g = globalThis as unknown as Record<string, unknown>;
    const frame = new Box({ x: 0, width: 300, overflowX: "auto", clientWidth: 300 });
    frame.scrollWidth = 420;
    g.document = { querySelector: () => frame };
    g.getComputedStyle = (n: Box) => ({ overflowX: n.overflowX });
    const r = measure() as { overflowX: boolean; clipped: number };
    expect(r.overflowX).toBe(true);
    expect(r.clipped).toBe(0);
  });
});

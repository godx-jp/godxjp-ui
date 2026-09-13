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
  ariaHidden = false;
  visibility = "visible";
  opacity = "1";
  position = "static";
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

  /** Only the `[aria-hidden="true"]` lookup `measure` performs is supported. */
  closest(selector: string): Box | null {
    if (selector !== '[aria-hidden="true"]') throw new Error(`unsupported selector ${selector}`);
    if (this.ariaHidden) return this;
    return this.parentElement ? this.parentElement.closest(selector) : null;
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
  g.getComputedStyle = (n: Box) => ({
    overflowX: n.overflowX,
    visibility: n.visibility,
    opacity: n.opacity,
    position: n.position,
  });
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

  it("does NOT count a hidden form mirror parked off the inline start", () => {
    // Radix's native <input> behind Checkbox/Radio/Switch: aria-hidden, tabindex -1, opacity 0,
    // translateX(-100%) — off-frame by construction, never seen or focused. The control the user
    // operates is the sibling button inside the frame. Counting it flagged every choice-control
    // form (data-entry-form-examples-*) as unreachable at all four narrow widths.
    const r = withFrame((frame) => {
      const field = frame.append(new Box({ x: 34, width: 16 }));
      focusable(field.append(new Box({ x: 34, width: 16 }))); // the visible radio button
      const mirror = focusable(field.append(new Box({ x: -16, width: 16 })));
      mirror.ariaHidden = true;
      mirror.opacity = "0";
    });
    expect(r.clipped).toBe(0);
  });

  it("does NOT count a control hidden inside an aria-hidden subtree", () => {
    const r = withFrame((frame) => {
      const hiddenRegion = frame.append(new Box({ x: 0, width: 300 }));
      hiddenRegion.ariaHidden = true;
      focusable(hiddenRegion.append(new Box({ x: 400, width: 41 })));
    });
    expect(r.clipped).toBe(0);
  });

  it("still counts a VISIBLE control that merely sits in a transformed wrapper", () => {
    // Guard against over-broad exclusion: opacity 1, not aria-hidden, unreachable → real defect.
    const r = withFrame((frame) => {
      focusable(frame.append(new Box({ x: 400, width: 41 })));
    });
    expect(r.clipped).toBe(1);
  });

  it("does NOT count a VIEWPORT-ANCHORED control that lands outside the frame", () => {
    // general-float-button: `.ui-float-button` is `position: fixed`, so the viewport is its
    // containing block, not the frame. Measured on /frame/general-float-button before this rule:
    // 3 clipped at 768px and at 1920px, and 0 at 320px — where the frame nearly fills the viewport
    // and the fixed box happens to fall inside it. The width-dependence is the tell: the control's
    // geometry never changed, only how far the frame was inset.
    //
    // FloatButton was ported in gh#558/gh#574, after the 2026-08-19 baseline was taken, so it
    // entered the sweep as 7 permanent "NEW regressions" and the browser lane was red on them
    // every night. A user can always reach a fixed control; it simply does not live in the frame.
    const r = withFrame((frame) => {
      const fixed = frame.append(new Box({ x: 708, width: 36 }));
      fixed.position = "fixed";
      focusable(fixed);
    });
    expect(r.clipped).toBe(0);
  });

  it("does NOT count a control nested inside a viewport-anchored group", () => {
    // `.ui-float-button-group` is the fixed box; the buttons inside it are `position: relative`
    // and inherit the group's containing block. Walking only the element itself would have missed
    // them and left the frame red for the same reason.
    const r = withFrame((frame) => {
      const group = frame.append(new Box({ x: 708, width: 36 }));
      group.position = "fixed";
      focusable(group.append(new Box({ x: 708, width: 36 })));
    });
    expect(r.clipped).toBe(0);
  });

  it("STILL counts an ordinary control at the same coordinates", () => {
    // The exemption must be about the containing block, not about being far to the right — or it
    // would silence the real gh#2.1.1 defect this gate exists for.
    const r = withFrame((frame) => {
      focusable(frame.append(new Box({ x: 708, width: 36 })));
    });
    expect(r.clipped).toBe(1);
  });

  it("reports document overflow independently of the clipped count", () => {
    const g = globalThis as unknown as Record<string, unknown>;
    const frame = new Box({ x: 0, width: 300, overflowX: "auto", clientWidth: 300 });
    frame.scrollWidth = 420;
    g.document = { querySelector: () => frame };
    g.getComputedStyle = (n: Box) => ({
      overflowX: n.overflowX,
      visibility: n.visibility,
      opacity: n.opacity,
    });
    const r = measure() as { overflowX: boolean; clipped: number };
    expect(r.overflowX).toBe(true);
    expect(r.clipped).toBe(0);
  });
});

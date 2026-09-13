/**
 * The in-page measurement `frame-geometry` serialises into Chromium (`page.evaluate(measure)`). It
 * lives in its own module for one reason: the reachability rule below is pure decision logic and
 * is unit-tested against a synthetic DOM in `src/test/__tests__/frame-geometry-measure.test.ts`
 * (the `visual-audit-rules.mjs` precedent) — importing `frame-geometry.mjs` itself would run the
 * whole sweep.
 */

/**
 * WHAT `clipped` MEANS — "a control the user cannot bring into the frame", not merely "a control
 * whose box currently sticks out of the frame". The two differ wherever a surface is DELIBERATELY
 * scrollable: a DataTable's `.ui-data-table-scroll` at 320px, a `FilterBar overflow="scroll"`
 * strip, a tabs list.
 */
export function measure() {
  const frame = document.querySelector(".demo-block-frame");
  if (!frame) return { overflowX: false, clipped: 0, scrollWidth: 0, clientWidth: 0 };
  const fr = frame.getBoundingClientRect();
  const overflowX = frame.scrollWidth > frame.clientWidth + 1;
  const USER_SCROLLABLE = /^(auto|scroll|overlay)$/;

  /** Inline-axis scroll containers between `el` and the frame that actually have scroll room. */
  const scrollChain = (el) => {
    const chain = [];
    for (let p = el.parentElement; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (USER_SCROLLABLE.test(cs.overflowX) && p.scrollWidth > p.clientWidth + 1) chain.push(p);
      if (p === frame) break;
    }
    return chain;
  };

  /** True when scrolling (only) those containers can bring `el` into the frame's inline box. */
  const reachableByScroll = (el) => {
    const chain = scrollChain(el);
    if (!chain.length) return false;
    const saved = chain.map((p) => [p, p.scrollLeft]);
    // Minimal per-container delta — the same "scroll the nearest edge in" the browser performs
    // when a control receives focus. `scrollLeft` is a physical offset in Chromium (negative-going
    // under `dir="rtl"`), so a physical delta is direction-agnostic.
    for (const p of chain) {
      const pr = p.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      let d = 0;
      if (er.right > pr.right) d = Math.min(er.right - pr.right, er.left - pr.left);
      else if (er.left < pr.left) d = Math.max(er.left - pr.left, er.right - pr.right);
      if (d) p.scrollLeft += d;
    }
    const er = el.getBoundingClientRect();
    const f2 = frame.getBoundingClientRect();
    const inside = er.right <= f2.right + 1 && er.left >= f2.left - 1;
    // Oversized content of its own scroll viewport (e.g. a 640px table row in a 244px scroller)
    // can never fit; it is reachable as long as it is actually on screen and scrollable.
    const viewport = chain[0].clientWidth;
    const oversized = er.width > viewport + 1 && er.left < f2.right - 1 && er.right > f2.left + 1;
    for (const [p, left] of saved) p.scrollLeft = left;
    return inside || oversized;
  };

  /**
   * A hidden form MIRROR is not a control. Radix renders the native input behind Checkbox / Radio
   * / Switch as `aria-hidden tabindex="-1"`, `opacity: 0; pointer-events: none`, parked off the
   * inline start with `translateX(-100%)` so the value still submits with the form.
   */
  const isControl = (el) => {
    if (el.closest('[aria-hidden="true"]')) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.opacity === "0") return false;
    // react-aria hides the same kind of form mirror a DIFFERENT way: `VisuallyHidden` clips the
    // box (`clip-path: inset(50%)` / `clip: rect(0,0,0,0)`) and leaves `aria-hidden` off, because
    // the input still has to be reachable for autofill and form submission. The Radix-shaped test
    // above never matched it, so after Slider and Select moved bases their hidden `<input>` and
    // `<select>` were counted as clipped CONTROLS — 27 findings across five frames, none of them
    // anything a user can see or reach.
    for (let e = el; e && e !== frame; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.clipPath === "inset(50%)" || /rect\(0px,? 0px,? 0px,? 0px\)/.test(s.clip)) return false;
    }
    return true;
  };

  /**
   * A VIEWPORT-ANCHORED control is not clipped BY THE FRAME, because the frame is not its
   * containing block. `position: fixed` resolves against the viewport, so a `FloatButton` — whose
   * entire purpose is to sit in a viewport corner, exactly as antd's does — lands outside the demo
   * frame's box at every width where the frame is inset from the viewport, and no amount of
   * scrolling the frame will move it. The rule "a control the user cannot bring into the frame"
   * does not describe it: the user can always reach it, it simply does not live in the frame.
   *
   * Measured on `/frame/general-float-button` before this: 3 clipped at 768px and at 1920px
   * (`.ui-float-button` / `.ui-float-button-group`, both `position: fixed`, plus the badge
   * absolutely positioned inside them), and 0 at 320px — where the frame nearly fills the viewport
   * and the fixed box happens to fall inside it. That width-dependence is the tell: the geometry
   * of the control never changed, only how much the frame was inset.
   *
   * FloatButton was ported in gh#558/gh#574, AFTER the 2026-08-19 baseline was generated, so it
   * entered the sweep as 7 permanent "NEW regressions" — one per width above 320 — and the browser
   * lane had been red on them every night since.
   */
  const viewportAnchored = (el) => {
    for (let e = el; e && e !== frame; e = e.parentElement) {
      if (getComputedStyle(e).position === "fixed") return true;
    }
    return false;
  };

  let clipped = 0;
  for (const el of frame.querySelectorAll(
    "a[href], button, [role=button], input:not([type=hidden]), select, textarea, [tabindex]:not([tabindex='-1'])",
  )) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (!isControl(el)) continue;
    if (viewportAnchored(el)) continue;
    if (r.right > fr.right + 1 || r.left < fr.left - 1) {
      if (!reachableByScroll(el)) clipped++;
    }
  }
  return { overflowX, clipped, scrollWidth: frame.scrollWidth, clientWidth: frame.clientWidth };
}

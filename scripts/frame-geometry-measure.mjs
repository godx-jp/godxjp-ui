/**
 * The in-page measurement `frame-geometry` serialises into Chromium (`page.evaluate(measure)`).
 *
 * It lives in its own module for one reason: the reachability rule below is pure decision logic
 * and is unit-tested against a synthetic DOM in `src/test/__tests__/frame-geometry-measure.test.ts`
 * (the `visual-audit-rules.mjs` precedent) — importing `frame-geometry.mjs` itself would run the
 * whole sweep. `measure` MUST therefore stay self-contained: Playwright serialises only the
 * function source, so it may not reference anything from this module's scope.
 */

/**
 * Measured inside the browser: overflow + clipped focusables within the rendered frame.
 *
 * WHAT `clipped` MEANS — "a control the user cannot bring into the frame", not merely "a control
 * whose box currently sticks out of the frame". The two differ wherever a surface is DELIBERATELY
 * scrollable: a DataTable's `.ui-data-table-scroll` at 320px, a `FilterBar overflow="scroll"`
 * strip, a tabs list. Their off-screen controls are reachable: measured in Chromium, focusing a
 * control that is entirely out of the scrollport scrolls it fully in (the DataTable sort button at
 * 320px — scrollLeft 0 → 344), and one that is only PARTLY out stays put with its focus ring on
 * screen, one gesture from the rest (Chromium's `CenterIfNeeded` focus alignment does not move a
 * partially visible target — reproduced on a synthetic scroller, so it is browser behaviour, not a
 * component defect). Counting either would flag a working design as an a11y defect and teach the
 * gate to be ignored.
 *
 * So a control sticking out is re-tested: we scroll ONLY the user-scrollable ancestors between it
 * and the frame (computed `overflow-*: auto|scroll|overlay` that actually overflows — never
 * `hidden`/`clip`, which no user can scroll), then re-measure. It counts as reachable when it is
 * then fully inside the frame, or when it is content WIDER than its own scroll viewport (a full
 * table row) whose leading edge is inside — the rest is one scroll gesture away. Everything else
 * still counts: no scroll container, a `hidden` clipper, or a control the scroll cannot reach is a
 * real WCAG 2.1.1 / 2.4.7 defect and must fail. Scroll offsets are restored after each probe.
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
   * inline start with `translateX(-100%)` so the value still submits with the form. It is never
   * seen, never focused, and the control the user actually operates is its sibling button — which
   * sits inside the frame. Counting the mirror reported an unreachable control on forms that have
   * none (every checkbox/radio/switch demo, at every width). Same for anything else hidden from
   * both the a11y tree and the eye.
   */
  const isControl = (el) => {
    if (el.closest('[aria-hidden="true"]')) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.opacity !== "0";
  };

  let clipped = 0;
  for (const el of frame.querySelectorAll(
    "a[href], button, [role=button], input:not([type=hidden]), select, textarea, [tabindex]:not([tabindex='-1'])",
  )) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (!isControl(el)) continue;
    if (r.right > fr.right + 1 || r.left < fr.left - 1) {
      if (!reachableByScroll(el)) clipped++;
    }
  }
  return { overflowX, clipped, scrollWidth: frame.scrollWidth, clientWidth: frame.clientWidth };
}

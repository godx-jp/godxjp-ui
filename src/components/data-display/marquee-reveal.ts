/**
 * Bring a focused item of a Marquee track back into view by SEEKING the lap, not by scrolling
 * (gh#983).
 *
 * The track travels by `transform` towards the inline start, so an item that has left the viewport
 * on that side sits in NEGATIVE overflow — which is not scrollable overflow. The browser's own
 * "scroll the focused element into view" therefore does nothing for it, and Tab through the track
 * landed on links that were partly or wholly invisible: measured 8 of 18 tab stops at 375px, one
 * at -149..-65 against a 75..1321 viewport at 1440px (WCAG 2.2 SC 2.4.11).
 *
 * The lap is seamless by construction, so any offset within it is a legitimate position: moving the
 * animation's `currentTime` moves the whole strip to where the item is visible, and resuming later
 * continues from there exactly as a pause would (G4).
 */

/** Inline-axis interval, in viewport pixels. */
export type MarqueeSpan = { start: number; end: number };

/**
 * The animation time at which the item sits fully inside the box, or `null` when it already does
 * (so tabbing across visible items never jolts the strip).
 *
 * It aims to CENTRE the item — clear of the `fade` mask at both edges — and settles for any fully
 * visible position when the centre is out of reach.
 *
 * It NEVER wraps into another lap. The copies look identical, but only the first holds the real,
 * focusable item; the clones are `inert`. Seeking by a whole lap therefore moves the focused item a
 * whole copy away while the strip looks unchanged — measured, the first attempt at this fix put
 * every item at exactly `centre − lap` (-139 against a 698 centre, lap 837) at 1440px. So the
 * answer stays inside the iteration the animation is in.
 *
 * `step` is how far the item moved when time advanced by a hundredth of a lap — measured rather
 * than derived, so `direction="end"` (a reversed animation) and the RTL keyframes need no case of their
 * own. A probe that crossed an iteration boundary shows a jump of nearly a whole copy the OTHER
 * way; `lap` (one copy, in px) is what tells the two apart. Only its SIGN is used. It is a hundredth
 * of a lap and not a millisecond because a slow track (99.6s a lap on the logo wall at 320px) moves
 * 0.008px in a millisecond, which measured as 0 — and a zero step meant no seek at all.
 */
export function marqueeRevealTime({
  item,
  box,
  time,
  duration,
  lap,
  step,
}: {
  item: MarqueeSpan;
  box: MarqueeSpan;
  time: number;
  duration: number;
  lap: number;
  step: number;
}): number | null {
  if (item.start >= box.start - 1 && item.end <= box.end + 1) return null;
  if (!(duration > 0) || !(lap > 0) || step === 0) return null;
  const sign = Math.abs(step) < lap / 2 ? Math.sign(step) : -Math.sign(step);
  const pxPerMs = (sign * lap) / duration;

  const local = ((time % duration) + duration) % duration;
  const iteration = time - local;
  // Displacements (px) that keep the item inside the box, and the one that centres it.
  const low = box.start - item.start;
  const high = box.end - item.end;
  const centre = (box.start + box.end) / 2 - (item.start + item.end) / 2;
  const at = (d: number) => local + d / pxPerMs;
  // The same limits as local times, ordered, and cut to this iteration.
  const [a, b] = [at(low), at(high)].sort((x, y) => x - y);
  const from = Math.max(0, low <= high ? a : at(centre));
  const to = Math.min(duration, low <= high ? b : at(centre));
  const clamp = (t: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, t));
  const chosen = from <= to ? clamp(at(centre), from, to) : clamp(at(centre), 0, duration);
  return iteration + chosen;
}

/** Wire it to the live DOM. A no-op where there is no running animation (reduced motion, jsdom). */
export function revealInMarquee(viewport: HTMLElement, track: HTMLElement, item: Element): void {
  const animation = track.getAnimations?.()[0];
  const copy = track.firstElementChild as HTMLElement | null;
  if (!animation || !copy) return;
  // Anything the browser scrolled on focus is undone first: the strip is positioned by time alone,
  // and a scrolled viewport would leave the end of the last clone showing blank space.
  viewport.scrollLeft = 0;
  const span = (): MarqueeSpan => {
    const r = item.getBoundingClientRect();
    return { start: r.left, end: r.right };
  };
  const box = viewport.getBoundingClientRect();
  const time = Number(animation.currentTime ?? 0);
  const duration = Number(animation.effect?.getComputedTiming().duration ?? 0);
  const before = span();
  animation.currentTime = time + duration / 100;
  const step = span().start - before.start;
  animation.currentTime = time;
  const next = marqueeRevealTime({
    item: before,
    box: { start: box.left, end: box.right },
    time,
    duration,
    lap: copy.offsetWidth,
    step,
  });
  if (next !== null) animation.currentTime = next;
}

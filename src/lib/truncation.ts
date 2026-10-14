/**
 * What is actually CUT inside a truncating box, shared by DataTable `ellipsis` cells (gh#1262,
 * gh#1269) and ListRow titles (gh#1298).
 *
 * Internal: reachable from no published subpath.
 */

/** Something that already takes focus — a box holding one needs no tab stop of its own. */
export const TRUNCATION_FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/**
 * The box itself when it overflows, else the first descendant that ends in an ellipsis
 * (`text-overflow: ellipsis`) and overflows — a `Text truncate` link beside a badge or an avatar
 * is cut while its container fits. `null` when nothing is cut.
 */
export function truncatedPart(box: HTMLElement): HTMLElement | null {
  if (box.scrollWidth - box.clientWidth > 1) return box;
  for (const el of box.querySelectorAll<HTMLElement>("*")) {
    if (el.scrollWidth - el.clientWidth > 1 && getComputedStyle(el).textOverflow === "ellipsis") {
      return el;
    }
  }
  return null;
}

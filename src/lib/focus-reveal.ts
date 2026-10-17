import type { FocusEvent } from "react";

/** Native Tab scrolling can leave a partially visible control clipped (Chromium).
 * Reveal keyboard targets that fit inside a scroll viewport, without moving oversized
 * rows, changing layout, or scrolling on pointer focus. */
export function revealKeyboardFocus(
  event: FocusEvent<HTMLElement>,
  viewport = event.currentTarget,
): void {
  const target = event.target;
  if (
    !(target instanceof HTMLElement) ||
    target === viewport ||
    !viewport.contains(target) ||
    !target.matches(":focus-visible")
  )
    return;
  const carrier =
    target.closest<HTMLElement>(".ui-tag-input,.ui-control-composite-field") ?? target;
  // A flush button can reach a scroll boundary with no spare pixels to reveal.
  // Contain only that padded carrier; never inset a text link or its descendants.
  const rect = carrier.getBoundingClientRect();
  const focus = getComputedStyle(carrier);
  const extent =
    focus.outlineStyle === "none"
      ? 0
      : Math.max(0, parseFloat(focus.outlineWidth) + parseFloat(focus.outlineOffset));
  const box = {
    left: rect.left - extent,
    right: rect.right + extent,
    top: rect.top - extent,
    bottom: rect.bottom + extent,
    width: rect.width + 2 * extent,
    height: rect.height + 2 * extent,
  };
  const frame = viewport.getBoundingClientRect();
  const left = frame.left + viewport.clientLeft;
  const top = frame.top + viewport.clientTop;
  const style = getComputedStyle(viewport);
  const outsideX =
    /auto|scroll/.test(style.overflowX) &&
    box.width <= viewport.clientWidth &&
    (box.left < left || box.right > left + viewport.clientWidth);
  const outsideY =
    /auto|scroll/.test(style.overflowY) &&
    box.height <= viewport.clientHeight &&
    (box.top < top || box.bottom > top + viewport.clientHeight);
  if (outsideX || outsideY)
    carrier.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "instant" });
  if (carrier.matches(".ui-button")) {
    const containAtEdge = () => {
      if (!carrier.matches(":focus-visible")) return;
      const r = carrier.getBoundingClientRect();
      const f = viewport.getBoundingClientRect();
      const x = f.left + viewport.clientLeft,
        y = f.top + viewport.clientTop;
      if (
        (/auto|scroll|hidden/.test(style.overflowX) &&
          (r.left - extent < x || r.right + extent > x + viewport.clientWidth)) ||
        (/auto|scroll|hidden/.test(style.overflowY) &&
          (r.top - extent < y || r.bottom + extent > y + viewport.clientHeight))
      )
        if (!carrier.hasAttribute("data-focus-contained")) {
          carrier.setAttribute("data-focus-contained", "");
          carrier.addEventListener("blur", () => carrier.removeAttribute("data-focus-contained"), {
            once: true,
          });
        }
    };
    containAtEdge();
    requestAnimationFrame(containAtEdge);
  }
}

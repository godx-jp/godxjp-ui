import * as React from "react";

/**
 * THE HIDDEN DISMISS BUTTON SPEAKS THE APP'S LANGUAGE (gh#1280).
 *
 * React Aria's `Popover` and `Modal` render a visually hidden `DismissButton` — a 1×1px
 * `<button tabindex="-1">` that lets a screen-reader user close the overlay. It names itself from
 * React Aria's own string table, which has no Vietnamese (or any locale outside its ~34): under
 * `vi` it fell back to the en-US "Dismiss", in the middle of an otherwise Vietnamese page. The
 * components render it internally with no label prop, and React Aria's global string override is
 * all-or-nothing per package, so the only seam is the DOM: every such button gets the library's
 * `common.dismiss`, in every locale, so the overlay vocabulary is ours in all of them. The `vi`
 * string is 「Bỏ qua」, not 「Đóng」: the overlay's visible close button already says 「Đóng」, and
 * two buttons with one name in one dialog is the duplicate-name defect, not a translation.
 *
 * Matched by shape, not by text (the English text is only what one locale falls back to):
 * `tabindex="-1"` plus the inline 1px box React Aria gives it. `react-aria` is pinned exactly in
 * package.json; the browser test in gh#1280 fails if a bump changes that shape.
 */
const CANDIDATE = 'button[tabindex="-1"]';

function isDismissButton(element: Element): element is HTMLButtonElement {
  return (
    element instanceof HTMLButtonElement &&
    element.matches(CANDIDATE) &&
    element.style.width === "1px" &&
    element.style.height === "1px"
  );
}

function relabel(root: Element, label: string): void {
  const candidates = root.matches(CANDIDATE)
    ? [root]
    : Array.from(root.querySelectorAll(CANDIDATE));
  for (const element of candidates) {
    if (isDismissButton(element) && element.getAttribute("aria-label") !== label) {
      element.setAttribute("aria-label", label);
    }
  }
}

/** Keep every React Aria dismiss button in the document named `label`; `null` does nothing. */
export function useOverlayDismissLabel(label: string | null): void {
  React.useEffect(() => {
    if (label === null || typeof MutationObserver === "undefined" || !document.body) return;
    relabel(document.body, label);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "attributes") {
          if (record.target instanceof Element) relabel(record.target, label);
          continue;
        }
        for (const node of record.addedNodes) {
          if (node instanceof Element) relabel(node, label);
        }
      }
    });
    // `attributes` too: React Aria re-renders its own label when the locale changes.
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-label"],
    });
    return () => observer.disconnect();
  }, [label]);
}

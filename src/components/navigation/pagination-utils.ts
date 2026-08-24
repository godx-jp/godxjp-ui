/** Inclusive integer range; empty when `end < start`. */
function range(start: number, end: number): number[] {
  return end < start ? [] : Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Build visible page numbers with ellipsis — Ant Design / MUI pagination style.
 *
 * The item count is CONSTANT wherever the current page sits. The earlier version
 * derived the window straight from `current ± siblingCount` and let it collapse
 * against the edges, so a 1,060-page list opened as `1 2 … 1060` — four controls
 * with a wide empty gap, and both a bad target size and a bad sense of scale
 * (reported 2026-08-24). Ant Design and MUI both solve this by CLAMPING the
 * window instead of shrinking it: near an edge the window slides inward so the
 * strip keeps its full width. Same list now opens as `1 2 3 4 5 … 1060`.
 *
 * Slots = `boundaryCount * 2` edges + `siblingCount * 2 + 1` around current + 2
 * ellipsis positions. With the defaults that is 7 controls.
 */
export function buildPageRange(
  current: number,
  totalPages: number,
  siblingCount = 1,
  boundaryCount = 1,
): (number | "ellipsis")[] {
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [1];

  const totalNumbers = boundaryCount * 2 + siblingCount * 2 + 3;
  if (totalPages <= totalNumbers) return range(1, totalPages);

  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(Math.max(totalPages - boundaryCount + 1, boundaryCount + 1), totalPages);

  // Clamp — not shrink. The lower bound keeps the window off the leading edge, the
  // upper bound keeps it off the trailing one, so its LENGTH never changes.
  const siblingsStart = Math.max(
    Math.min(current - siblingCount, totalPages - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : totalPages - 1,
  );

  return [
    ...startPages,
    // An ellipsis that would hide exactly ONE page is pointless — spell that page out
    // instead (Ant/MUI do the same), which is also what keeps the count constant.
    ...(siblingsStart > boundaryCount + 2
      ? (["ellipsis"] as (number | "ellipsis")[])
      : boundaryCount + 1 < totalPages - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < totalPages - boundaryCount - 1
      ? (["ellipsis"] as (number | "ellipsis")[])
      : totalPages - boundaryCount > boundaryCount
        ? [totalPages - boundaryCount]
        : []),
    ...endPages,
  ];
}

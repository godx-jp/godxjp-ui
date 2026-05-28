/** Build visible page numbers with ellipsis — Ant Design pagination style. */
export function buildPageRange(
  current: number,
  totalPages: number,
  siblingCount = 1,
): (number | "ellipsis")[] {
  if (totalPages <= 1) return totalPages === 1 ? [1] : [];

  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const left = Math.max(current - siblingCount, 1);
  const right = Math.min(current + siblingCount, totalPages);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < totalPages - 1;

  const range: (number | "ellipsis")[] = [];
  range.push(1);

  if (showLeftEllipsis) range.push("ellipsis");
  else for (let i = 2; i < left; i++) range.push(i);

  for (let i = left; i <= right; i++) {
    if (i !== 1 && i !== totalPages) range.push(i);
  }

  if (showRightEllipsis) range.push("ellipsis");
  else for (let i = right + 1; i < totalPages; i++) range.push(i);

  if (totalPages > 1) range.push(totalPages);

  return range;
}

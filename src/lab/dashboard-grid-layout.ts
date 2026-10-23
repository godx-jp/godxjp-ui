import type { DashboardGridItemProp } from "../props/components/dashboard-grid.prop";

const integer = (value: number, fallback: number) =>
  Number.isFinite(value) ? Math.trunc(value) : fallback;
export const gridColumns = (value: number) => Math.max(1, integer(value, 1));
const overlaps = (a: DashboardGridItemProp, b: DashboardGridItemProp) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** Active tile wins. Others push down in stable visual order, then compact upward without overlap. */
export function resolveDashboardLayout(
  layout: readonly DashboardGridItemProp[],
  columns: number,
  active?: string,
): DashboardGridItemProp[] {
  const count = gridColumns(columns);
  const normalized = layout.map((item) => {
    const w = Math.min(count, Math.max(1, integer(item.w, 1)));
    return {
      ...item,
      w,
      h: Math.max(1, integer(item.h, 1)),
      x: Math.max(0, Math.min(count - w, integer(item.x, 0))),
      y: Math.max(0, integer(item.y, 0)),
    };
  });
  const sorted = normalized.slice().sort((a, b) => a.y - b.y || a.x - b.x);
  const held = normalized.find((item) => item.id === active);
  const placed: DashboardGridItemProp[] = held ? [held] : [];
  for (const item of sorted) {
    if (item === held) continue;
    let collision;
    while ((collision = placed.find((other) => overlaps(item, other))))
      item.y = collision.y + collision.h;
    while (item.y > 0 && !placed.some((other) => overlaps({ ...item, y: item.y - 1 }, other)))
      item.y--;
    placed.push(item);
  }
  // The active tile compacts too, after preserving its requested position through collision resolution.
  if (held)
    while (
      held.y > 0 &&
      !placed.some((other) => other !== held && overlaps({ ...held, y: held.y - 1 }, other))
    )
      held.y--;
  return normalized;
}

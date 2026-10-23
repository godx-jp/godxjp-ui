import * as React from "react";

/** Roving mark focus. Geometry stays in recharts; data identity stays in the original array. */
export function useChartDatumSelection(points: { index: number; series: number }[]) {
  const active = React.useRef("");
  const recovery = React.useRef<(() => void) | null>(null);
  React.useEffect(() => () => recovery.current?.(), []);
  const key = (index: number, series: number) => `${series}:${index}`;
  const keys = points.map((p) => key(p.index, p.series));
  const current = keys.includes(active.current) ? active.current : keys[0];
  const activate = (node: SVGElement, select: () => void) => {
    const canvas = node.closest(".ui-chart-canvas");
    const identity = node.dataset.chartDatum;
    recovery.current?.();
    let focused = node;
    // Recharts re-registers series asynchronously when a dashboard re-renders. Preserve focus
    // across those replacements until the next user action; never steal a deliberate focus move.
    const stop = () => {
      observer.disconnect();
      document.removeEventListener("keydown", stop, true);
      document.removeEventListener("pointerdown", stop, true);
      document.removeEventListener("focusin", onFocusIn, true);
    };
    const onFocusIn = (event: FocusEvent) => {
      if (event.target !== focused) stop();
    };
    const observer = new MutationObserver(() => {
      if (focused.isConnected || !canvas?.isConnected || document.activeElement !== document.body)
        return;
      const replacement = Array.from(
        canvas.querySelectorAll<SVGElement>("[data-chart-datum]"),
      ).find((mark) => mark.dataset.chartDatum === identity);
      if (replacement) {
        focused = replacement;
        replacement.focus();
      }
    });
    recovery.current = stop;
    if (canvas) observer.observe(canvas, { childList: true, subtree: true });
    document.addEventListener("keydown", stop, true);
    document.addEventListener("pointerdown", stop, true);
    document.addEventListener("focusin", onFocusIn, true);
    select();
  };
  return (index: number, series: number, name: string, select: () => void) => ({
    role: "button",
    "aria-label": name,
    "data-chart-datum": key(index, series),
    className: "ui-chart-datum ui-focus-ring",
    tabIndex: current === key(index, series) ? 0 : -1,
    onFocus: (event: React.FocusEvent<SVGElement>) => {
      event.stopPropagation();
      active.current = key(index, series);
      // Keep focus changes out of recharts' render/registration loop.
      event.currentTarget
        .closest(".ui-chart-canvas")
        ?.querySelectorAll<SVGElement>("[data-chart-datum]")
        .forEach((node) => {
          node.tabIndex = node === event.currentTarget ? 0 : -1;
        });
    },
    onClick: (event: React.MouseEvent<SVGElement>) => {
      event.stopPropagation();
      event.currentTarget.focus();
      activate(event.currentTarget, select);
    },
    onKeyDown: (event: React.KeyboardEvent<SVGElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat) activate(event.currentTarget, select);
        return;
      }
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
      let target: (typeof points)[number] | undefined;
      const along =
        event.key === "ArrowRight"
          ? rtl
            ? -1
            : 1
          : event.key === "ArrowLeft"
            ? rtl
              ? 1
              : -1
            : 0;
      const across = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
      if (along) {
        const row = points.filter((p) => p.series === series);
        const at = row.findIndex((p) => p.index === index);
        target = row[Math.max(0, Math.min(row.length - 1, at + along))];
      } else if (across) {
        const column = points.filter((p) => p.index === index);
        const at = column.findIndex((p) => p.series === series);
        target = column[Math.max(0, Math.min(column.length - 1, at + across))];
      } else if (event.key === "Home" || event.key === "End") {
        const row =
          event.ctrlKey || event.metaKey ? points : points.filter((p) => p.series === series);
        target = event.key === "Home" ? row[0] : row.at(-1);
      } else return;
      event.preventDefault();
      event.stopPropagation();
      if (!target) return;
      const next = key(target.index, target.series);
      const canvas = event.currentTarget.closest(".ui-chart-canvas");
      const mark = Array.from(
        canvas?.querySelectorAll<SVGElement>("[data-chart-datum]") ?? [],
      ).find((node) => node.dataset.chartDatum === next);
      mark?.focus();
    },
  });
}

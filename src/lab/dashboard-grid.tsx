import * as React from "react";
import { GripVertical } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../components/data-display/card";
import { Button } from "../components/general/button";
import { useTranslation } from "../i18n/use-translation";
import { useMediaQuery } from "../lib/hooks";
import { cn } from "../lib/utils";
import type {
  DashboardGridItemProp,
  DashboardGridProp,
} from "../props/components/dashboard-grid.prop";
import { gridColumns, resolveDashboardLayout } from "./dashboard-grid-layout";
export type {
  DashboardGridItemProp,
  DashboardGridProp,
  DashboardGridProp as DashboardGridProps,
} from "../props/components/dashboard-grid.prop";

type Session = {
  id: string;
  base: DashboardGridItemProp[];
  next: DashboardGridItemProp[];
  pointer?: {
    id: number;
    x: number;
    y: number;
    stepX: number;
    stepY: number;
    rtl: boolean;
    resize: boolean;
  };
};

/** Optional BI layout editor. DOM reading order remains items order; x starts at inline-start. */
export const DashboardGrid = React.forwardRef<HTMLDivElement, DashboardGridProp>(
  function DashboardGrid(
    {
      items,
      layout,
      defaultLayout,
      onLayoutChange,
      columns = 12,
      rowHeight,
      editable = false,
      className,
      ...props
    },
    ref,
  ) {
    const { t, locale } = useTranslation();
    const sm = useMediaQuery("(min-width: 40rem)");
    const md = useMediaQuery("(min-width: 48rem)");
    const lg = useMediaQuery("(min-width: 64rem)");
    const xl = useMediaQuery("(min-width: 80rem)");
    const count = gridColumns(
      typeof columns === "number"
        ? columns
        : (xl && columns.xl) ||
            (lg && columns.lg) ||
            (md && columns.md) ||
            (sm && columns.sm) ||
            columns.base,
    );
    const [inner, setInner] = React.useState(defaultLayout ?? []);
    const source = layout ?? inner;
    const committed = resolveDashboardLayout(
      items.map(
        (item, index) =>
          source.find((entry) => entry.id === item.id) ?? {
            id: item.id,
            x: 0,
            y: index,
            w: 1,
            h: 1,
          },
      ),
      count,
    );
    const root = React.useRef<HTMLDivElement>(null);
    const session = React.useRef<Session | null>(null);
    const [preview, setPreview] = React.useState<DashboardGridItemProp[] | null>(null);
    const [announcement, announce] = React.useState("");
    const hint = React.useId();
    const format = new Intl.NumberFormat(locale);
    const speak = (
      action: "grabbed" | "moved" | "dropped" | "cancelled",
      entries: DashboardGridItemProp[],
      id: string,
    ) => {
      const item = entries.find((entry) => entry.id === id);
      if (!item) return;
      announce(
        t(`dashboardGrid.${action}`, {
          label: items.find((entry) => entry.id === id)?.label ?? id,
          x: format.format(item.x + 1),
          y: format.format(item.y + 1),
          w: format.format(item.w),
          h: format.format(item.h),
        }),
      );
    };
    const begin = (id: string) => {
      const next = committed.map((item) => ({ ...item }));
      session.current = { id, base: next, next };
      setPreview(next);
      speak("grabbed", next, id);
    };
    const finish = (cancel: boolean) => {
      const current = session.current;
      if (!current) return;
      session.current = null;
      setPreview(null);
      speak(cancel ? "cancelled" : "dropped", cancel ? current.base : current.next, current.id);
      if (!cancel && JSON.stringify(current.base) !== JSON.stringify(current.next)) {
        if (layout === undefined) setInner(current.next);
        onLayoutChange?.(current.next);
      }
    };
    const update = (dx: number, dy: number, resize: boolean, fromBase = false) => {
      const current = session.current;
      if (!current) return;
      current.next = resolveDashboardLayout(
        (fromBase ? current.base : current.next).map((item) =>
          item.id !== current.id
            ? item
            : resize
              ? { ...item, w: item.w + dx, h: item.h + dy }
              : { ...item, x: item.x + dx, y: item.y + dy },
        ),
        count,
        current.id,
      );
      setPreview(current.next);
      speak("moved", current.next, current.id);
    };
    // Parent updates, breakpoint changes and leaving edit mode cancel the transaction.
    React.useEffect(() => {
      session.current = null;
      setPreview(null);
    }, [layout, columns, count, editable, items]);
    const latest = React.useRef({ finish, update });
    latest.current = { finish, update };
    React.useEffect(() => {
      const move = (event: PointerEvent) => {
        const pointer = session.current?.pointer;
        if (!pointer || event.pointerId !== pointer.id) return;
        event.preventDefault();
        latest.current.update(
          Math.round((event.clientX - pointer.x) / pointer.stepX) * (pointer.rtl ? -1 : 1),
          Math.round((event.clientY - pointer.y) / pointer.stepY),
          pointer.resize,
          true,
        );
      };
      const end = (event: PointerEvent) => {
        if (session.current?.pointer?.id === event.pointerId)
          latest.current.finish(event.type === "pointercancel");
      };
      const escape = (event: KeyboardEvent) => {
        if (event.key === "Escape" && session.current) {
          event.preventDefault();
          latest.current.finish(true);
        }
      };
      window.addEventListener("pointermove", move, { passive: false });
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
      window.addEventListener("keydown", escape);
      return () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
        window.removeEventListener("keydown", escape);
      };
    }, []);
    const pointerDown =
      (id: string, resize: boolean) => (event: React.PointerEvent<HTMLButtonElement>) => {
        if (!editable || event.button !== 0 || session.current || !root.current) return;
        event.preventDefault();
        event.currentTarget.focus();
        const css = getComputedStyle(root.current);
        const gap = parseFloat(css.columnGap) || 0;
        begin(id);
        session.current!.pointer = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          stepX: (root.current.clientWidth + gap) / count,
          stepY: (parseFloat(css.gridAutoRows) || rowHeight || 80) + (parseFloat(css.rowGap) || 0),
          rtl: css.direction === "rtl",
          resize,
        };
      };
    const keyDown = (id: string) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!session.current) begin(id);
        else if (session.current.id === id) finish(false);
        return;
      }
      if (session.current?.id !== id || !event.key.startsWith("Arrow")) return;
      event.preventDefault();
      const rtl = root.current && getComputedStyle(root.current).direction === "rtl";
      update(
        (event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0) * (rtl ? -1 : 1),
        event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0,
        event.shiftKey,
      );
    };
    const shown = preview ?? committed;
    return (
      <div {...props} ref={ref} className={cn("ui-dashboard-grid", className)}>
        <div
          ref={root}
          className="ui-dashboard-grid-items"
          data-stacked={count === 1 || undefined}
          style={
            {
              "--dashboard-grid-columns": count,
              ...(rowHeight && Number.isFinite(rowHeight) && rowHeight > 0
                ? { "--dashboard-grid-row-height": `${rowHeight}px` }
                : {}),
            } as React.CSSProperties
          }
        >
          {items.map((item) => {
            const box =
              shown.find((entry) => entry.id === item.id) ??
              committed.find((entry) => entry.id === item.id)!;
            const held = session.current?.id === item.id;
            return (
              <section
                key={item.id}
                aria-label={item.label}
                className="ui-dashboard-grid-item"
                data-dashboard-id={item.id}
                data-x={box.x}
                data-y={box.y}
                data-w={box.w}
                data-h={box.h}
                data-editable={editable || undefined}
                data-held={held || undefined}
                style={{
                  gridColumn: `${box.x + 1} / span ${box.w}`,
                  gridRow: count === 1 ? "auto" : `${box.y + 1} / span ${box.h}`,
                }}
              >
                <Card className="ui-dashboard-grid-surface">
                  <CardHeader className="ui-dashboard-grid-header">
                    <CardTitle>{item.label}</CardTitle>
                  </CardHeader>
                  {editable && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="ui-dashboard-grid-move"
                      aria-label={t("dashboardGrid.move", { label: item.label })}
                      aria-describedby={hint}
                      aria-pressed={held}
                      onPointerDown={pointerDown(item.id, false)}
                      onKeyDown={keyDown(item.id)}
                      onBlur={() => {
                        if (!session.current?.pointer) finish(true);
                      }}
                    >
                      <GripVertical aria-hidden="true" />
                    </Button>
                  )}
                  <div className="ui-dashboard-grid-content">{item.content}</div>
                  {editable && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="ui-dashboard-grid-resize"
                      aria-label={t("dashboardGrid.resize", { label: item.label })}
                      aria-describedby={hint}
                      aria-pressed={held}
                      onPointerDown={pointerDown(item.id, true)}
                      onKeyDown={keyDown(item.id)}
                      onBlur={() => {
                        if (!session.current?.pointer) finish(true);
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                      >
                        <path d="M8 20 20 8M14 20 20 14" />
                      </svg>
                    </Button>
                  )}
                </Card>
              </section>
            );
          })}
        </div>
        <span id={hint} className="sr-only">
          {t("dashboardGrid.hint")}
        </span>
        <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </span>
      </div>
    );
  },
);

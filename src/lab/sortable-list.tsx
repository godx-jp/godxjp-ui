import * as React from "react";
import { GripVertical } from "lucide-react";

import { useTranslation } from "../i18n/use-translation";
import { cn } from "../lib/utils";
import type { SortableListItemProp, SortableListProp } from "../props/components/data-entry.prop";
import { Button } from "../components/general/button";

export type {
  SortableListItemProp,
  SortableListProp,
  SortableListProp as SortableListProps,
} from "../props/components/data-entry.prop";

/** Pixels the pointer must travel before a press on the handle becomes a drag, so a click stays a click. */
const DRAG_THRESHOLD = 4;

function move<T>(list: readonly T[], from: number, to: number): T[] {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}

/** The held order, reconciled with `items`: unknown keys drop out, new items join at the end. */
function reconcile(order: readonly string[], items: readonly SortableListItemProp[]): string[] {
  const known = new Set(items.map((item) => item.value));
  const kept = order.filter((key) => known.has(key));
  const seen = new Set(kept);
  return [...kept, ...items.map((item) => item.value).filter((key) => !seen.has(key))];
}

/**
 * SortableList (gh#1173) — reorder a flat list or a grid of tiles by pointer drag or by keyboard
 * on each item's grip: Space/Enter lifts, the arrows (and Home/End) move, Space/Enter drops, Esc
 * cancels and blur cancels. Every step is spoken through a polite live region ("2 / 3"). The order
 * is the value: `onValueChange` receives the item keys in their new order once, on drop.
 */
export const SortableList = React.forwardRef<HTMLDivElement, SortableListProp>(
  function SortableList(
    {
      items,
      value: valueProp,
      defaultValue,
      onValueChange,
      renderItem,
      layout = "list",
      disabled = false,
      "aria-label": ariaLabel,
      id,
      className,
    },
    ref,
  ) {
    const { t, locale } = useTranslation();
    const hintId = React.useId();
    const [inner, setInner] = React.useState<string[]>(
      () => defaultValue ?? items.map((item) => item.value),
    );
    const committed = reconcile(valueProp ?? inner, items);
    /** The order while an item is held: previewed live, committed only on drop. */
    const [preview, setPreview] = React.useState<string[] | null>(null);
    const [held, setHeld] = React.useState<{ key: string; via: "keyboard" | "pointer" } | null>(
      null,
    );
    const [announcement, setAnnouncement] = React.useState("");
    const order = preview ?? committed;
    const byKey = React.useMemo(() => new Map(items.map((item) => [item.value, item])), [items]);
    const listRef = React.useRef<HTMLUListElement>(null);
    const number = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);

    const position = (keys: readonly string[], key: string) => ({
      label: byKey.get(key)?.label ?? key,
      position: number.format(keys.indexOf(key) + 1),
      count: number.format(keys.length),
    });

    const commit = (keys: string[]) => {
      if (keys.join("\u0000") !== committed.join("\u0000")) {
        if (valueProp === undefined) setInner(keys);
        onValueChange?.(keys);
      }
    };

    const lift = (key: string, via: "keyboard" | "pointer") => {
      setHeld({ key, via });
      setPreview(committed);
      setAnnouncement(t("dataEntry.sortableList.lifted", position(committed, key)));
    };

    const drop = () => {
      if (!held || !preview) return;
      commit(preview);
      setAnnouncement(t("dataEntry.sortableList.dropped", position(preview, held.key)));
      setHeld(null);
      setPreview(null);
    };

    const cancel = () => {
      if (!held) return;
      setAnnouncement(t("dataEntry.sortableList.cancelled", position(committed, held.key)));
      setHeld(null);
      setPreview(null);
    };

    const moveTo = (key: string, target: number) => {
      setPreview((current) => {
        const keys = current ?? committed;
        const from = keys.indexOf(key);
        const to = Math.max(0, Math.min(keys.length - 1, target));
        if (from < 0 || from === to) return keys;
        const next = move(keys, from, to);
        setAnnouncement(t("dataEntry.sortableList.moved", position(next, key)));
        return next;
      });
    };

    const onKeyDown = (key: string) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (held?.key === key) drop();
        else if (!held) lift(key, "keyboard");
        return;
      }
      if (held?.key !== key) return;
      const index = order.indexOf(key);
      const step: Record<string, number> = {
        ArrowUp: -1,
        ArrowLeft: -1,
        ArrowDown: 1,
        ArrowRight: 1,
      };
      if (event.key in step) {
        event.preventDefault();
        moveTo(key, index + (step[event.key] ?? 0));
      } else if (event.key === "Home") {
        event.preventDefault();
        moveTo(key, 0);
      } else if (event.key === "End") {
        event.preventDefault();
        moveTo(key, order.length - 1);
      } else if (event.key === "Escape") {
        event.preventDefault();
        cancel();
      }
    };

    /** The index the pointer is over: the item whose box holds it, else the nearest centre. */
    const indexAt = (x: number, y: number) => {
      const nodes = Array.from(
        listRef.current?.querySelectorAll<HTMLElement>("[data-sortable-value]") ?? [],
      );
      let best = -1;
      let bestDistance = Number.POSITIVE_INFINITY;
      nodes.forEach((node, index) => {
        const box = node.getBoundingClientRect();
        if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
          best = index;
          bestDistance = -1;
          return;
        }
        if (bestDistance < 0) return;
        const distance = Math.hypot(x - (box.left + box.width / 2), y - (box.top + box.height / 2));
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      return best;
    };

    const press = React.useRef<{ key: string; x: number; y: number; dragging: boolean } | null>(
      null,
    );

    /* The press is followed on `window`, not through pointer capture: moving the grip's node (the
     * live re-order) releases capture in Chromium, and the rest of the drag would be lost. The
     * window handlers read this render's functions through a ref. */
    const latest = React.useRef({ lift, moveTo, drop, cancel, indexAt });
    latest.current = { lift, moveTo, drop, cancel, indexAt };

    const onPointerDown = (key: string) => (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0 || held) return;
      press.current = { key, x: event.clientX, y: event.clientY, dragging: false };
      const onMove = (move: PointerEvent) => {
        const current = press.current;
        if (!current) return;
        if (!current.dragging) {
          if (Math.hypot(move.clientX - current.x, move.clientY - current.y) < DRAG_THRESHOLD)
            return;
          current.dragging = true;
          latest.current.lift(current.key, "pointer");
        }
        const target = latest.current.indexAt(move.clientX, move.clientY);
        if (target >= 0) latest.current.moveTo(current.key, target);
      };
      const end = (cancelled: boolean) => () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
        window.removeEventListener("keydown", onKey);
        const current = press.current;
        press.current = null;
        if (!current?.dragging) return;
        if (cancelled) latest.current.cancel();
        else latest.current.drop();
      };
      const onUp = end(false);
      const onCancel = end(true);
      // Esc during a pointer drag cancels it, wherever focus is.
      const onKey = (key: KeyboardEvent) => {
        if (key.key === "Escape" && press.current?.dragging) end(true)();
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancel);
      window.addEventListener("keydown", onKey);
    };

    return (
      <div
        ref={ref}
        id={id}
        className={cn("ui-sortable-list", className)}
        data-layout={layout}
        data-disabled={disabled || undefined}
      >
        <ul ref={listRef} className="ui-sortable-list-items" aria-label={ariaLabel}>
          {order.map((key, index) => {
            const item = byKey.get(key);
            if (!item) return null;
            const dragging = held?.key === key;
            const itemDisabled = disabled || item.disabled;
            return (
              <li
                key={key}
                className="ui-sortable-list-item"
                data-sortable-value={key}
                data-dragging={dragging || undefined}
                data-disabled={itemDisabled || undefined}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="ui-sortable-list-handle"
                  disabled={itemDisabled}
                  aria-label={t("dataEntry.sortableList.handle", { label: item.label })}
                  aria-describedby={hintId}
                  aria-pressed={dragging}
                  onKeyDown={onKeyDown(key)}
                  onBlur={() => {
                    if (held?.key === key && held.via === "keyboard") cancel();
                  }}
                  onPointerDown={onPointerDown(key)}
                >
                  <GripVertical aria-hidden="true" />
                </Button>
                <div className="ui-sortable-list-content">
                  {renderItem ? renderItem(item, { index, dragging }) : item.label}
                </div>
              </li>
            );
          })}
        </ul>
        <span id={hintId} className="sr-only">
          {t("dataEntry.sortableList.hint")}
        </span>
        <span role="status" aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </div>
    );
  },
);

import * as React from "react";
import { GripVertical, X } from "lucide-react";

import { cn } from "../../lib/utils";
import { useTranslation } from "../../i18n/use-translation";
import type {
  DragAxisProp,
  DraggablePanelPositionProp,
  DraggablePanelProp,
} from "../../props/components/layout.prop";

export type {
  DraggablePanelProp,
  DraggablePanelProp as DraggablePanelProps,
  DraggablePanelPlacementProp,
  DraggablePanelPositionProp,
  DraggablePanelLabels,
  DragAxisProp,
  DragBoundsProp,
} from "../../props/components/layout.prop";

/*
 * DraggablePanel — a floating surface the PERSON USING IT can move (gh#560).
 *
 * ## Vì sao có nó, và nó lấy API từ đâu
 *
 * Một trợ lý nổi neo ở một góc màn hình che đúng thứ người ta đang hỏi: cột cuối của bảng, hàng
 * nút của thẻ chi tiết. `ResizablePanel` đổi kích thước các ô TRONG một bố cục; nó không dời một
 * phần tử nổi quanh khung nhìn. `Sheet` dán vào cạnh. `Popover` neo vào trigger. Không cái nào
 * dời được.
 *
 * antd KHÔNG có component này. Thứ antd có cho đúng bài này là demo "Draggable Modal": `Modal` +
 * khe `modalRender`, và phần kéo do **react-draggable** làm. Nên bề mặt prop ở đây là API của
 * react-draggable, port nguyên tên: `axis`, `bounds`, `position`, `defaultPosition`, `disabled`.
 * Ba chỗ lệch, mỗi chỗ một lý do:
 *
 *   • **`handle` (CSS selector) KHÔNG port.** Nó là cửa hậu vào DOM nội bộ — đúng lớp API mà
 *     docs/DESIGN-AUTHORITY.md từ chối cùng `components` / `prefixCls` của antd. Ở đây tay cầm là
 *     một bộ phận CÓ THẬT của component (thanh tiêu đề), nên không có gì để trỏ selector vào.
 *   • **`bounds` chỉ còn `"viewport"` / `"none"`.** react-draggable nhận thêm `'parent'`, một
 *     selector, và một object `{left, top, right, bottom}`. Selector lại là cửa hậu DOM; object
 *     thì dùng HƯỚNG VẬT LÝ (`left`/`right`), thứ `check:rtl` chặn vì nó không soi gương được cho
 *     locale RTL.
 *   • **`onDrag` / `onStop` thành `onPositionChange`.** Một trục, một cách viết
 *     (`check:prop-vocabulary`). Vị trí được BÁO cho consumer chứ không được thư viện nhớ hộ:
 *     nhớ ở đâu, theo phạm vi nào, là quyết định của consumer (không `localStorage` nào trong
 *     tệp này).
 *
 * **`labels?: { close?: string; move?: string }`.** Embedded consumers (script-injected widgets)
 * often cannot mount `AppProvider`: it writes `data-theme` / `data-density` / `data-brand` onto
 * `document.documentElement`, which for an embed is the host page's root. `labels` lets them supply
 * handle and close `aria-label` strings without a provider; each key wins over `t()` when set.
 * A scoped `AppProvider` that limits those attributes to its own subtree is the better long-term
 * fix (gh#606) but is not this component's job alone.
 *
 * **Không thêm dependency.** react-draggable không được cài; phần kéo dùng đúng khuôn pointer đã
 * có trong kho (`data-entry/slider.tsx`): nghe `pointermove`/`pointerup`/`pointercancel` ở mức
 * `window`, lọc theo `pointerId`, dọn listener khi unmount. `@react-aria/interactions` (nơi có
 * `useMove`) không phải dependency trực tiếp của gói này, và thêm nó vào chỉ để lấy một hàm là
 * đổi một phụ thuộc lấy 40 dòng.
 *
 * ## Tay cầm, không phải cả tấm
 *
 * Kéo từ bất cứ đâu làm chữ trong một tấm mà cả mục đích là chữ trở thành không bôi đen được. Nên
 * chỉ THANH TIÊU ĐỀ nhận `pointerdown`; thân tấm chọn chữ như thường.
 *
 * ## Bàn phím là bắt buộc, không phải thêm thắt
 *
 * Một thứ chỉ dời được bằng kéo chuột là thứ người dùng bàn phím KHÔNG dời được (WCAG 2.1.1). Nút
 * tay cầm nhận mũi tên: một bậc `--draggable-panel-step-offset`, Shift nhân lên bậc lớn. Cùng một
 * đường ghi vị trí, nên `onPositionChange` phát ra y như khi kéo.
 *
 * ## `position: fixed` nằm trong CSS, KHÔNG trong style nội tuyến
 *
 * Góc nghỉ là `data-placement` + thuộc tính logic (`inset-inline-*`), nên nó soi gương RTL. Thứ
 * duy nhất JS ghi vào `style` là HAI CON SỐ không đơn vị qua custom property; CSS nhân với `1px`
 * và dồn vào `translate`. `translate` là hệ toạ độ VẬT LÝ, y như delta của con trỏ, nên không có
 * phép lật dấu nào cho RTL — và `check:no-inline-magic-numbers` không có số nào để bắt.
 */

const AXIS_ALLOWS_X: Record<DragAxisProp, boolean> = {
  both: true,
  x: true,
  y: false,
  none: false,
};
const AXIS_ALLOWS_Y: Record<DragAxisProp, boolean> = {
  both: true,
  x: false,
  y: true,
  none: false,
};

/** Bậc nhích bàn phím đọc từ token, KHÔNG phải một literal trong TSX. */
function readStep(element: HTMLElement | null, name: string, fallback: number): number {
  if (!element || typeof window === "undefined" || typeof window.getComputedStyle !== "function") {
    return fallback;
  }
  const raw = window.getComputedStyle(element).getPropertyValue(name).trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Giữ tấm trong khung nhìn. Kẹp theo hộp THẬT của tấm, nên một tấm cao hơn khung nhìn vẫn kẹp về
 * mép trên thay vì bị ném đi mất.
 */
function clampToViewport(
  element: HTMLElement | null,
  next: DraggablePanelPositionProp,
  current: DraggablePanelPositionProp,
): DraggablePanelPositionProp {
  if (!element || typeof window === "undefined") return next;
  const rect = element.getBoundingClientRect();
  // Hộp ở vị trí NGHỈ = hộp hiện tại trừ đi độ dời đang áp dụng.
  const restLeft = rect.left - current.x;
  const restTop = rect.top - current.y;
  const maxLeft = window.innerWidth - rect.width;
  const maxTop = window.innerHeight - rect.height;
  const clamp = (value: number, min: number, max: number) =>
    max < min ? min : Math.min(Math.max(value, min), max);
  return {
    x: clamp(next.x, -restLeft, maxLeft - restLeft),
    y: clamp(next.y, -restTop, maxTop - restTop),
  };
}

const ORIGIN: DraggablePanelPositionProp = { x: 0, y: 0 };

export const DraggablePanel = React.forwardRef<HTMLElement, DraggablePanelProp>(
  (
    {
      title,
      children,
      extra,
      placement = "bottom-end",
      width = "md",
      axis = "both",
      bounds = "viewport",
      position,
      defaultPosition,
      onPositionChange,
      onClose,
      labels,
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const panelRef = React.useRef<HTMLElement | null>(null);
    const [uncontrolled, setUncontrolled] = React.useState(defaultPosition ?? ORIGIN);
    const [dragging, setDragging] = React.useState(false);
    const stopDrag = React.useRef<(() => void) | null>(null);
    const current = position ?? uncontrolled;

    // Con trỏ đọc vị trí đang áp dụng ở mỗi frame; ref giữ nó khỏi phải nằm trong deps của listener.
    const currentRef = React.useRef(current);
    currentRef.current = current;

    const commit = React.useCallback(
      (next: DraggablePanelPositionProp) => {
        const clamped =
          bounds === "viewport"
            ? clampToViewport(panelRef.current, next, currentRef.current)
            : next;
        if (clamped.x === currentRef.current.x && clamped.y === currentRef.current.y) return;
        if (position === undefined) setUncontrolled(clamped);
        onPositionChange?.(clamped);
      },
      [bounds, onPositionChange, position],
    );

    React.useEffect(() => () => stopDrag.current?.(), []);

    /*
     * Re-clamp when the viewport shrinks so a persisted offset cannot strand the panel (gh#608).
     * `window` `resize` matches `clampToViewport`, which reads `innerWidth`/`innerHeight` — not a
     * `ResizeObserver` on the panel, which would not fire when only the viewport changes. We do not
     * listen to `visualViewport` (mobile virtual keyboard): reclamp on keyboard show/hide would
     * jump a panel the user may still be reading; file a follow-up if embeds need that path.
     */
    React.useEffect(() => {
      if (bounds !== "viewport" || typeof window === "undefined") return;
      const onResize = () => {
        commit(currentRef.current);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, [bounds, commit]);

    const setPanel = React.useCallback(
      (node: HTMLElement | null) => {
        panelRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
      // Chuột trái / chạm / bút. Không cướp chuột phải và không cướp một cử chỉ có phím bổ trợ.
      if (disabled || axis === "none") return;
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey) return;
      event.preventDefault();

      const pointerId = event.pointerId;
      const origin = { x: event.clientX, y: event.clientY };
      const start = currentRef.current;

      const onMove = (move: PointerEvent) => {
        if (move.pointerId !== pointerId) return;
        commit({
          x: AXIS_ALLOWS_X[axis] ? start.x + (move.clientX - origin.x) : start.x,
          y: AXIS_ALLOWS_Y[axis] ? start.y + (move.clientY - origin.y) : start.y,
        });
      };
      const finish = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        stopDrag.current = null;
        setDragging(false);
      };
      const onUp = (up: PointerEvent) => {
        if (up.pointerId !== pointerId) return;
        finish();
      };

      stopDrag.current?.();
      stopDrag.current = finish;
      setDragging(true);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled || axis === "none") return;
      const horizontal = event.key === "ArrowLeft" || event.key === "ArrowRight";
      const vertical = event.key === "ArrowUp" || event.key === "ArrowDown";
      if (!horizontal && !vertical) return;
      if (horizontal && !AXIS_ALLOWS_X[axis]) return;
      if (vertical && !AXIS_ALLOWS_Y[axis]) return;
      event.preventDefault();

      const step = readStep(
        panelRef.current,
        event.shiftKey ? "--draggable-panel-step-offset-lg" : "--draggable-panel-step-offset",
        event.shiftKey ? 40 : 8,
      );
      const sign = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
      commit({
        x: horizontal ? currentRef.current.x + sign * step : currentRef.current.x,
        y: vertical ? currentRef.current.y + sign * step : currentRef.current.y,
      });
    };

    const movable = !disabled && axis !== "none";

    return (
      <section
        ref={setPanel}
        data-slot="draggable-panel"
        data-placement={placement}
        data-width={width}
        data-dragging={dragging ? "" : undefined}
        aria-label={typeof title === "string" ? title : undefined}
        className={cn("ui-draggable-panel", className)}
        style={
          {
            "--draggable-panel-offset-x": current.x,
            "--draggable-panel-offset-y": current.y,
          } as React.CSSProperties
        }
        {...props}
      >
        <div className="ui-draggable-panel-bar">
          <button
            type="button"
            data-slot="draggable-panel-handle"
            className="ui-draggable-panel-handle ui-focus-ring"
            aria-label={labels?.move ?? t("layout.draggablePanel.moveLabel")}
            aria-disabled={movable ? undefined : "true"}
            onPointerDown={handlePointerDown}
            onKeyDown={handleKeyDown}
          >
            <GripVertical className="ui-draggable-panel-handle-icon" aria-hidden="true" />
          </button>
          <span className="ui-draggable-panel-title">{title}</span>
          {extra != null && <div className="ui-draggable-panel-extra">{extra}</div>}
          {onClose != null && (
            <button
              type="button"
              data-slot="draggable-panel-close"
              className="ui-draggable-panel-close ui-focus-ring"
              aria-label={labels?.close ?? t("feedback.alert.dismiss")}
              onClick={onClose}
            >
              <X className="ui-draggable-panel-close-icon" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="ui-draggable-panel-body">{children}</div>
      </section>
    );
  },
);
DraggablePanel.displayName = "DraggablePanel";

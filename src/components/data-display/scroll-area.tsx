import * as React from "react";

import { cn } from "../../lib/utils";
import type { ScrollAreaProp } from "../../props/components/data-display.prop";

export type ScrollAreaProps = ScrollAreaProp &
  Omit<React.ComponentPropsWithoutRef<"div">, keyof ScrollAreaProp>;

/*
 * NỀN: cuộn NGUYÊN BẢN của trình duyệt, không còn @radix-ui/react-scroll-area.
 *
 * Ant Design không có ScrollArea — antd để trình duyệt cuộn, và đó chính là hình dạng ở đây: một
 * phần tử `overflow: auto` duy nhất, thanh cuộn vẽ bằng `scrollbar-width` / `scrollbar-color` /
 * `scrollbar-gutter` đọc từ token (styles/data-display-layout.css). Cái mất đi là một thanh cuộn
 * TỰ VẼ; cái được lại là thanh cuộn thật của nền tảng: cuộn quán tính, kéo bằng chuột giữa, bánh xe
 * ngang, con trỏ thô, và trình đọc màn hình nhận đúng một vùng cuộn.
 *
 * GỐC VÀ VIEWPORT NAY LÀ MỘT PHẦN TỬ. Với Radix chúng phải tách đôi (gốc `overflow: hidden`,
 * viewport `height: 100%` bên trong), và chỗ tách ấy làm hỏng đúng những chỗ gọi bằng chiều cao
 * TỐI ĐA: `.ui-cascader-list` / `.ui-tree-select-list` đặt `max-block-size` lên GỐC, còn viewport
 * đọc `height: 100%` — một phần trăm trên chiều cao không xác định thì hoá `auto`, nên ruột tràn ra
 * khỏi cái gốc đang `overflow: hidden` và bị CẮT thay vì cuộn. Một phần tử mang cả `max-block-size`
 * lẫn `overflow: auto` thì cuộn đúng, không cần luật nào bù.
 *
 * Hệ quả với API: `ref` và `viewportRef` nay trỏ vào CÙNG một nút — chính phần tử cuộn. `viewportRef`
 * được giữ vì hợp đồng (và vì ChatBubbleList đang dùng), không phải vì nó còn trỏ chỗ khác.
 */

/** The knob a service moves to retune "close enough to the bottom to keep following". */
const ANCHOR_OFFSET_TOKEN = "--scroll-area-anchor-offset";
/** Only reached when the stylesheet is absent (SSR string render, a test without tokens). */
const ANCHOR_OFFSET_FALLBACK_PX = 48;
const ROOT_FONT_SIZE_FALLBACK_PX = 16;

/** CSS length → px, for the units a distance knob is realistically written in. */
function cssLengthToPx(value: string, rootFontSize: number): number | undefined {
  const match = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(value.trim());
  if (match == null) return undefined;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return undefined;
  return match[2] === "rem" || match[2] === "em" ? amount * rootFontSize : amount;
}

/**
 * Resolve the anchor band once per mount. A `scroll` handler cannot ask CSS "am I within
 * --scroll-area-anchor-offset of the bottom?", so the token is read off the element — which keeps
 * it a real theme knob (including a `[data-tenant]` scope) instead of a literal in a comparison.
 */
function readAnchorOffset(element: HTMLElement): number {
  if (typeof window === "undefined" || typeof window.getComputedStyle !== "function") {
    return ANCHOR_OFFSET_FALLBACK_PX;
  }
  const rootFontSize =
    cssLengthToPx(
      window.getComputedStyle(element.ownerDocument.documentElement).fontSize || "",
      ROOT_FONT_SIZE_FALLBACK_PX,
    ) ?? ROOT_FONT_SIZE_FALLBACK_PX;
  const declared = window.getComputedStyle(element).getPropertyValue(ANCHOR_OFFSET_TOKEN);
  return cssLengthToPx(declared, rootFontSize) ?? ANCHOR_OFFSET_FALLBACK_PX;
}

/**
 * Find the element whose children are the ROWS. The children are wrapped in one content element
 * (that wrapper is what a ResizeObserver can watch grow), and consumers are told to wrap their own
 * content in a single element, so the rows typically sit two levels down: `viewport > content >
 * Flex > row…`.
 */
function resolveRowContainer(root: Element): Element {
  let container = root;
  while (container.children.length === 1 && container.firstElementChild) {
    container = container.firstElementChild;
  }
  return container;
}

/**
 * The child under the viewport's top edge, and how far above that edge it starts. This pair is the
 * reader's real position: "the message I am looking at, and where on screen it sits".
 */
function findAnchorChild(root: Element, scrollTop: number): HTMLElement | null {
  // Indexed straight into the live HTMLCollection: materialising an array first would put the
  // 5,000-element cost back on every scroll event that the binary search exists to remove.
  const children = resolveRowContainer(root).children;
  let low = 0;
  let high = children.length - 1;
  let found: HTMLElement | null = null;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const child = children[mid];
    if (!(child instanceof HTMLElement)) break;
    if (child.offsetTop + child.offsetHeight > scrollTop) {
      found = child;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return found;
}

/**
 * Scroll WITHOUT animating. `behavior: "instant"` beats a theme's `scroll-behavior: smooth`, so
 * anchoring can never animate the reader down the page (WCAG 2.3.3 / prefers-reduced-motion) and a
 * prepend correction can never be visible as a slide.
 */
function setScrollOffset(element: HTMLElement, top: number): void {
  if (typeof element.scrollTo === "function") element.scrollTo({ top, behavior: "instant" });
  else element.scrollTop = top;
}

/**
 * Bottom anchoring — the behaviour a live stream needs and the reason it belongs to whoever owns
 * the scrolling box rather than to every consumer's 60 re-derived lines. The rule is NOT "scroll
 * to the bottom when content arrives" — that is the bug.
 */
function useBottomAnchor(
  viewport: HTMLDivElement | null,
  enabled: boolean,
  offset: number | undefined,
  onAnchoredChange: ((anchored: boolean) => void) | undefined,
): void {
  const onAnchoredChangeRef = React.useRef(onAnchoredChange);
  React.useEffect(() => {
    onAnchoredChangeRef.current = onAnchoredChange;
  }, [onAnchoredChange]);

  React.useEffect(() => {
    if (!viewport || !enabled) return;

    // The children live in one content wrapper; that wrapper is what grows, and its children are
    // the rows we anchor to.
    const content = viewport.firstElementChild ?? viewport;
    const band = offset ?? readAnchorOffset(viewport);

    let anchored = true;
    let record: { node: HTMLElement; top: number } | null = null;

    const distanceFromBottom = () =>
      viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop;

    const setAnchored = (next: boolean) => {
      if (anchored === next) return;
      anchored = next;
      onAnchoredChangeRef.current?.(next);
    };

    const remember = () => {
      const node = findAnchorChild(content, viewport.scrollTop);
      record = node ? { node, top: node.offsetTop - viewport.scrollTop } : null;
    };

    const pinToBottom = () => {
      // Clamped: content shorter than the viewport gives a negative bottom, and anchoring an empty
      // or one-line stream must be a no-op rather than a scroll to a position that cannot exist.
      setScrollOffset(viewport, Math.max(0, viewport.scrollHeight - viewport.clientHeight));
    };

    const handleScroll = () => {
      // The ONLY place the pin is granted or revoked, and it is driven by the reader alone.
      setAnchored(distanceFromBottom() <= band);
      remember();
    };

    const handleContentChange = () => {
      if (anchored) {
        pinToBottom();
      } else if (record && viewport.contains(record.node)) {
        const target = Math.max(0, record.node.offsetTop - record.top);
        if (target !== viewport.scrollTop) setScrollOffset(viewport, target);
        // Compensating does not re-pin (the distance to the bottom is unchanged by a prepend), but
        // content REMOVED below can leave the reader at the bottom for real.
        setAnchored(distanceFromBottom() <= band);
      }
      remember();
    };

    // Mount pinned: opening a channel lands on the newest message, not on the oldest.
    pinToBottom();
    remember();

    viewport.addEventListener("scroll", handleScroll, { passive: true });

    const observers: Array<{ disconnect: () => void }> = [];
    if (typeof MutationObserver !== "undefined") {
      // text into an existing node.
      const mutationObserver = new MutationObserver(handleContentChange);
      mutationObserver.observe(content, { childList: true, subtree: true, characterData: true });
      observers.push(mutationObserver);
    }
    if (typeof ResizeObserver !== "undefined") {
      // Growth with no DOM mutation at all: an image that finishes loading, a row that rewraps
      // when the panel narrows, a composer pushing the viewport shorter.
      const resizeObserver = new ResizeObserver(handleContentChange);
      resizeObserver.observe(viewport);
      resizeObserver.observe(content);
      observers.push(resizeObserver);
    }

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      for (const observer of observers) observer.disconnect();
    };
  }, [viewport, enabled, offset]);
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      className,
      children,
      viewportRef,
      anchor = "none",
      anchorOffset,
      onAnchoredChange,
      orientation = "vertical",
      ...props
    },
    ref,
  ) => {
    // State, not a ref, so the anchoring effect re-runs the moment the element mounts.
    const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null);
    const attachViewport = React.useCallback(
      (node: HTMLDivElement | null) => {
        setViewport(node);
        for (const target of [ref, viewportRef]) {
          if (typeof target === "function") target(node);
          else if (target) (target as React.RefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref, viewportRef],
    );

    useBottomAnchor(viewport, anchor === "bottom", anchorOffset, onAnchoredChange);

    return (
      // `tabIndex={0}` keeps the scroll viewport keyboard-reachable so overflowing content can be
      // scrolled without a pointer (WCAG 2.1.1 / axe scrollable-region-focusable).
      //
      // NO `dir` IS STAMPED HERE, deliberately. Radix's Root called `useDirection(dir)`, which
      // falls back to the literal "ltr" and writes it onto the element — and a `dir` attribute is
      // not advisory: it resets the inline axis for the whole subtree, so every `margin-inline-*`,
      // `text-align: start` and `align-items: flex-end` inside resolved LTR on an RTL page
      // (measured in Chromium: a chat feed inside `dir="rtl"` kept its own bubbles on the wrong
      // side). A plain element inherits the page's direction, which is the correct answer and
      // needs no code. A caller may still pass `dir` explicitly; it rides through with the rest.
      <div
        ref={attachViewport}
        tabIndex={0}
        data-slot="scroll-area-viewport"
        data-anchor={anchor}
        data-orientation={orientation}
        className={cn("ui-scroll-area", className)}
        {...props}
      >
        <div data-slot="scroll-area-content" className="ui-scroll-area-content">
          {children}
        </div>
      </div>
    );
  },
);
ScrollArea.displayName = "ScrollArea";

/**
 * Deliberately NOT exported: a deprecated no-op must not grow the package's public type surface.
 * Nothing was exported for it before either — it used to be typed straight off Radix.
 */
type ScrollBarProps = {
  orientation?: "vertical" | "horizontal";
  className?: string;
};

/**
 * @deprecated Renders nothing. Native scrolling has no separate bar element to mount: the browser
 * draws the scrollbar for whichever axis overflows, and WHICH axes may overflow is
 * `<ScrollArea orientation="vertical | horizontal | both">`.
 *
 * Under Radix, mounting a `ScrollBar` was what ENABLED its axis (Radix read `scrollbarXEnabled` /
 * `scrollbarYEnabled` from these children and wrote the viewport's inline `overflowX`/`overflowY`
 * from them), so `<ScrollBar orientation="horizontal" />` was load-bearing rather than decorative.
 * It is kept as an inert export so existing call sites keep compiling; move the intent to
 * `orientation` — `<ScrollArea orientation="both">` is the replacement for a vertical area that
 * also mounted a horizontal bar.
 */
export function ScrollBar(_props: ScrollBarProps): null {
  return null;
}

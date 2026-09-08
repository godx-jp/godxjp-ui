import * as React from "react";

/**
 * Trả tiêu điểm về nơi nó đứng trước khi lớp phủ mở — ĐỒNG BỘ, ngay trong lượt đóng.
 *
 * Radix trả tiêu điểm lúc tháo thẻ và cho phép chặn qua `onCloseAutoFocus`.
 * `FocusScope restoreFocus` của react-aria cũng trả, nhưng trong một `requestAnimationFrame` SAU khi
 * tháo — nên trong đúng một khung hình, mọi thứ đọc `document.activeElement` ngay sau lệnh đóng
 * (test bàn phím, và trình đọc màn hình đang theo tiêu điểm) đều thấy `<body>`.
 *
 * Hook này lấp đúng khung hình đó. rAF của react-aria chạy sau, thấy tiêu điểm đã rời `<body>` nên
 * tự bỏ qua (`if (ownerDocument.activeElement === ownerDocument.body)`), nên không có hai lệnh focus
 * tranh nhau. Nếu lớp phủ còn treo để chạy hoạt ảnh thoát, `ariaHideOutside` vẫn đang giữ `inert`
 * quanh trigger và `focus()` ở đây thành vô hiệu — lúc ấy rAF kia mới là thứ trả tiêu điểm, y như
 * khi không có hook này.
 *
 * Nút cần trả về được ghi lại NGAY TRONG LƯỢT DỰNG mở ra, không phải trong một effect: effect của
 * con chạy trước effect của cha, nên đến lượt cha thì `FocusScope` của react-aria đã kéo tiêu điểm
 * vào trong tấm nội dung rồi.
 */
export function useOverlayCloseFocus(
  isOpen: boolean,
  onCloseAutoFocus?: (event: Event) => void,
): void {
  const nodeToRestore = React.useRef<HTMLElement | null>(null);
  const renderedOpen = React.useRef(false);
  const committedOpen = React.useRef(isOpen);

  if (isOpen !== renderedOpen.current) {
    renderedOpen.current = isOpen;
    if (isOpen && typeof document !== "undefined") {
      const active = document.activeElement;
      nodeToRestore.current = active === document.body ? null : (active as HTMLElement | null);
    }
  }

  React.useEffect(() => {
    if (committedOpen.current && !isOpen) {
      const event = new Event("closeAutoFocus", { cancelable: true });
      onCloseAutoFocus?.(event);
      const node = nodeToRestore.current;
      nodeToRestore.current = null;
      if (!event.defaultPrevented && node?.isConnected === true) {
        node.focus();
      }
    }
    committedOpen.current = isOpen;
  }, [isOpen, onCloseAutoFocus]);
}

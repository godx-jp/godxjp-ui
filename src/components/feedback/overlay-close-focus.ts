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
 *
 * `contentRef` là tuỳ chọn, và chỉ lớp phủ NON-MODAL mới cần truyền. Một lớp phủ modal (Dialog,
 * Sheet) đóng thì tiêu điểm chắc chắn đang ở trong nó hoặc đã rơi xuống `<body>`, nên trả về luôn
 * là đúng. Popover non-modal thì có thêm một đường đóng nữa: tiêu điểm ĐI RA — Tab sang phần tử kế
 * tiếp, hay bấm thẳng vào một ô nhập khác — và chính việc đi ra ấy đóng panel. Ở đường đó, kéo tiêu
 * điểm về trigger là CƯỚP tiêu điểm chứ không phải trả. Truyền `contentRef` để phân biệt: còn ở
 * trong tấm (hoặc đã rơi xuống `<body>`) thì trả, đã sang một phần tử khác còn sống thì để yên.
 *
 * Sự kiện `closeAutoFocus` vẫn phát ở MỌI đường đóng, kể cả khi không trả tiêu điểm: consumer dùng
 * nó để tự đưa tiêu điểm tới chỗ người dùng cần gõ tiếp, và việc đó không được phụ thuộc vào tiêu
 * điểm đang tình cờ ở đâu.
 */
export function useOverlayCloseFocus(
  isOpen: boolean,
  onCloseAutoFocus?: (event: Event) => void,
  contentRef?: React.RefObject<HTMLElement | null>,
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
      const active = document.activeElement;
      const focusMovedAway =
        contentRef != null &&
        active != null &&
        active !== document.body &&
        active.isConnected &&
        contentRef.current?.contains(active) !== true;
      if (!event.defaultPrevented && !focusMovedAway && node?.isConnected === true) {
        node.focus();
      }
    }
    committedOpen.current = isOpen;
  }, [isOpen, onCloseAutoFocus, contentRef]);
}

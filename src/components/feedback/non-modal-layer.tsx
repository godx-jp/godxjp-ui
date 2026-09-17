import * as React from "react";
import { createPortal } from "react-dom";
import { useExitAnimation } from "@react-aria/utils";
import { FocusScope } from "react-aria";

/*
 * Lớp NON-MODAL dùng chung cho `Dialog modal={false}` (gh#696) và `Sheet modal={false}` (gh#701).
 *
 * WAI-ARIA APG cho phép hộp thoại không-modal (Dialog (Modal) Pattern,
 * https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). RAC không có kiểu overlay đó:
 * `ModalOverlay` / `Modal` LUÔN khoá cuộn, `ariaHideOutside`, bẫy tiêu điểm và đóng khi bấm ra
 * ngoài. Nên nhánh non-modal KHÔNG đi qua `ModalOverlay`, mà là:
 *
 *     portal > FocusScope autoFocus restoreFocus > <RAC Dialog của bề mặt>
 *
 *   • không `ariaHideOutside` / `inert`, không khoá cuộn, không màn nền, bấm ra ngoài KHÔNG đóng;
 *   • `FocusScope` KHÔNG `contain`: mở thì tiêu điểm vào trong, Tab ra ngoài được;
 *   • Esc đóng khi tiêu điểm Ở TRONG bề mặt (bắt trên chính thẻ dialog — Esc gõ ở trang phía sau
 *     thuộc về trang phía sau);
 *   • `role="dialog"` + tên từ tiêu đề, KHÔNG có `aria-modal`.
 *
 * Hai bề mặt đã tự `position: fixed` + `--overlay-z-index`, nên vị trí giữ nguyên.
 */

/**
 * Trạng thái dựng của nhánh non-modal. `enabled=false` (nhánh modal) thì không làm gì: `contentRef`
 * không được gắn, và `ModalOverlay` tự lo hoạt ảnh thoát.
 */
export function useNonModalPortal(isOpen: boolean, enabled: boolean) {
  const contentRef = React.useRef<HTMLElement>(null);
  const isExiting = useExitAnimation(contentRef, enabled && isOpen);
  return { contentRef, isMounted: isOpen || isExiting };
}

/** `onKeyDown` cho thẻ dialog non-modal: Esc (tiêu điểm ở trong) đóng. */
export function closeOnEscape(close: () => void) {
  return (event: React.KeyboardEvent<HTMLElement>) => {
    // Popover / menu lồng bên trong tự `stopPropagation` Esc của chúng.
    if (event.key === "Escape" && !event.defaultPrevented && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  };
}

/** Portal + `FocusScope autoFocus restoreFocus` (không `contain`) quanh bề mặt non-modal. */
export function NonModalPortal({
  container,
  children,
}: {
  container: Element | undefined;
  children: React.ReactNode;
}) {
  if (typeof document === "undefined") {
    return null;
  }
  return createPortal(
    <FocusScope autoFocus restoreFocus>
      {children}
    </FocusScope>,
    container ?? document.body,
  );
}

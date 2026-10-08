import * as React from "react";

import { Slot } from "../../lib/slot";
import { cn } from "../../lib/utils";

/**
 * AspectRatio — hộp giữ tỉ lệ, dựng bằng thuộc tính CSS `aspect-ratio`.
 *
 * Radix dựng cái này bằng mẹo `padding-bottom` thời chưa có `aspect-ratio`: một
 * div bọc `position: relative; width: 100%; padding-bottom: (100/ratio)%`, rồi
 * div THẬT nằm trong nó ở `position: absolute; inset: 0`. Hai node, hai lớp
 * định vị, chỉ để nói một câu mà CSS ngày nay nói được bằng một khai báo.
 *
 * Nên node bọc biến mất và `.ui-aspect-ratio` giờ LÀ hộp tỉ lệ. Kiểm trước khi
 * đổi: không luật nào trong `src/styles/` bám vào `[data-radix-aspect-ratio-wrapper]`
 * hay vào việc `.ui-aspect-ratio` phải là con của một node khác — luật duy nhất
 * chạm tới nó là `.ui-aspect-ratio { overflow: clip; overflow-clip-margin }`
 * trong `layout.css`, và nó bám vào CHÍNH node này, node vẫn còn.
 *
 * `position: relative` được giữ lại dù không còn cần cho mẹo padding: node bọc
 * trước đây là containing block của mọi con `position: absolute` mà consumer
 * đặt vào (một overlay, một badge góc). Bỏ nó đi thì những con ấy lặng lẽ nhảy
 * ra neo vào tổ tiên định vị gần nhất ở ngoài.
 */
export const AspectRatio = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { asChild?: boolean; ratio?: number }
>(({ className, ratio = 16 / 9, style, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      data-slot="aspect-ratio"
      className={cn("ui-aspect-ratio", className)}
      // Sau `...style` chứ không trước: Radix cũng để consumer KHÔNG ghi đè được
      // phần định vị của hộp, vì một hộp tỉ lệ bị đổi `position`/`width` thì
      // thôi là hộp tỉ lệ.
      style={{ ...style, position: "relative", width: "100%", aspectRatio: `${ratio}` }}
      {...props}
    />
  );
});
AspectRatio.displayName = "AspectRatio";

"use client";

import { mergeProps } from "@react-aria/utils";
import * as React from "react";

/**
 * `Slot` — nền của `asChild`, và từ v20 là của CHÍNH kho này.
 *
 * ## Vì sao tự dựng
 *
 * `asChild` là API công khai của @godxjp/ui: 171 chỗ trong thư viện và mọi
 * consumer đều dùng. React Aria KHÔNG có mô hình đó — nó dùng prop `render`.
 * Nếu để nền quyết định API thì đợt đổi nền sẽ phá mọi consumer; nếu tự giữ
 * `Slot` thì đổi nền là chuyện nội bộ. Ba mươi dòng ở đây mua lấy điều đó.
 *
 * ## Ngữ nghĩa, và một chỗ KHÁC `mergeProps`
 *
 * Gộp prop đi qua `mergeProps` của React Aria — cùng luật mà chính các
 * component React Aria dùng bên trong, nên `Slot` cư xử nhất quán với phần còn
 * lại của hệ. Nó cho: `className` nối chuỗi, handler CHAIN (cha chạy rồi tới
 * con, không ghi đè), prop thường thì CON thắng.
 *
 * Nhưng `mergeProps` để `style` của con GHI ĐÈ HẲN style của cha — đo được:
 * cha `{color:'red'}` + con `{margin:1}` ra `{margin:1}`, mất màu. Slot của
 * Radix thì gộp nông hai object, và 171 call site đang dựa vào hành vi ấy. Nên
 * `style` được gộp riêng ở đây, sau `mergeProps`.
 *
 * ## Đúng MỘT con
 *
 * `asChild` nghĩa là "đừng dựng thẻ của mình, mượn thẻ của con". Hai con thì
 * không có thẻ nào để mượn, nên `Children.only` ném lỗi — sớm và rõ, thay vì
 * lặng lẽ dựng ra một cây DOM không ai định.
 */
export function Slot({
  children,
  ...slotProps
}: React.HTMLAttributes<HTMLElement> &
  React.RefAttributes<HTMLElement> & { children?: React.ReactNode }) {
  /*
   * `children` tuỳ chọn ở mức KIỂU nhưng bắt buộc lúc CHẠY.
   *
   * Nơi gọi thường spread cả gói prop của mình vào (`<Slot {...props} />`), mà
   * trong gói đó `children` là tuỳ chọn — bắt buộc ở kiểu sẽ làm mọi call site
   * đỏ dù chúng luôn có con thật. `Children.only` vẫn ném lỗi khi thiếu, nên
   * ràng buộc không mất, nó chỉ chuyển từ lúc biên dịch sang lúc chạy.
   *
   * `RefAttributes`: React 19 coi `ref` là prop thường, và `cloneElement` dưới
   * đây chuyển nó xuống con — đó chính là điều `asChild` hứa.
   */
  const child = React.Children.only(children) as React.ReactElement<
    React.HTMLAttributes<HTMLElement>
  >;

  const merged = mergeProps(
    slotProps,
    child.props as React.HTMLAttributes<HTMLElement>,
  ) as React.HTMLAttributes<HTMLElement>;

  const slotStyle = slotProps.style;
  const childStyle = child.props.style;

  return React.cloneElement(child, {
    ...merged,
    style:
      slotStyle === undefined && childStyle === undefined
        ? undefined
        : { ...slotStyle, ...childStyle },
  });
}

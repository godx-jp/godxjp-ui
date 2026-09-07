import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Flex } from "../flex";
import { flexGapClass } from "../../../lib/variants";

/*
 * Hai khoảng trống của thang `gap`, và cả hai đều đẩy người tiêu dùng vào chỗ
 * không có nước đi hợp lệ nào.
 *
 * 1. Thang gốc có MƯỜI bậc (--space-0..12 = 0·4·8·12·16·20·24·32·40·48px),
 *    nhưng lớp tên chỉ với tới năm. Gặp một thiết kế 20px thì: làm tròn xuống
 *    16 hay lên 24 đều lệch, mà viết `gap: 20px` thì `no-arbitrary-spacing`
 *    của ui-audit chặn. Đường duy nhất còn lại là mở issue rồi chờ.
 *
 * 2. `.ui-flex-gap-*` luôn đọc `--space-stack-*`, kể cả khi `direction="row"`
 *    — trong khi `--space-inline-md` (12px) đã tồn tại sẵn và đúng là giá trị
 *    một hàng ngang cần (gh#401).
 *
 * Bộ test này canh cả hai. Nó kiểm LỚP CSS chứ không kiểm pixel: jsdom không
 * phân giải biến CSS, nên khẳng định "20px" ở đây sẽ là khẳng định giả. Giá
 * trị thật do `layout.css` giữ, và `check:no-hardcoded-css-values` canh chỗ đó.
 */

describe("Flex gap — thang số", () => {
  it("mỗi bậc số ra một lớp riêng, ánh xạ thẳng vào --space-{n}", () => {
    const steps = [1, 2, 3, 4, 5, 6, 8, 10, 12] as const;

    for (const step of steps) {
      const { container } = render(<Flex gap={step}>x</Flex>);
      const el = container.querySelector(".ui-flex") as HTMLElement;

      expect(el.className).toContain(`ui-flex-gap-${step}`);
    }
  });

  it("bậc 5 (20px) gọi được — trước v20 thì không", () => {
    const { container } = render(<Flex gap={5}>x</Flex>);

    expect((container.querySelector(".ui-flex") as HTMLElement).className).toContain(
      "ui-flex-gap-5",
    );
  });

  it("`gap={0}` dùng lại đúng lớp của `gap='none'`, không đẻ ra bậc zero thứ hai", () => {
    expect(flexGapClass[0]).toBe(flexGapClass.none);
  });
});

describe("Flex gap — bậc tên biết trục (gh#401)", () => {
  /*
   * Bậc tên mang Ý ĐỊNH, không mang giá trị: cùng một `md`, hàng ngang chặt
   * hơn cột dọc. Lớp CSS thì giống nhau ở cả hai — thứ phân biệt là
   * `data-direction`, và `layout.css` đọc nó để chọn token trục.
   */
  it("hàng ngang mang data-direction=row để CSS chọn được --space-inline-*", () => {
    const { container } = render(
      <Flex direction="row" gap="md">
        x
      </Flex>,
    );
    const el = container.querySelector(".ui-flex") as HTMLElement;

    expect(el.dataset.direction).toBe("row");
    expect(el.className).toContain("ui-flex-gap-md");
  });

  it("cột dọc KHÔNG mang data-direction=row, nên giữ --space-stack-*", () => {
    const { container } = render(
      <Flex direction="col" gap="md">
        x
      </Flex>,
    );

    expect((container.querySelector(".ui-flex") as HTMLElement).dataset.direction).not.toBe("row");
  });
});

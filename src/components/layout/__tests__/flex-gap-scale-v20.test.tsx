import type * as React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Flex } from "../flex";
import { ResponsiveGrid } from "../responsive-grid";
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

describe("Flex gapRaw — cửa thoát hợp lệ", () => {
  it("đặt gap nội tuyến bằng pixel, cho giá trị ngoài mọi bậc", () => {
    const { container } = render(<Flex gapRaw={5}>x</Flex>);
    const el = container.querySelector(".ui-flex") as HTMLElement;

    expect(el.style.gap).toBe("5px");
  });

  it("để lại dấu vết ĐẾM ĐƯỢC trên DOM", () => {
    /*
     * Đây là cái giá của cửa thoát, và là lý do nó không biến thành cửa chính:
     * mỗi lần thoát đều grep được. Một kho đang trôi dần khỏi thang sẽ tự lộ ra
     * bằng con số, không phải bằng cảm giác của người review.
     */
    const { container } = render(<Flex gapRaw={5}>x</Flex>);

    expect((container.querySelector(".ui-flex") as HTMLElement).dataset.gapRaw).toBe("5");
  });

  it("thắng `gap`, và `gap` thôi phát lớp để hai bên không tranh độ đặc hiệu", () => {
    const { container } = render(
      <Flex gap="xl" gapRaw={5}>
        x
      </Flex>,
    );
    const el = container.querySelector(".ui-flex") as HTMLElement;

    expect(el.style.gap).toBe("5px");
    expect(el.className).not.toContain("ui-flex-gap-xl");
  });

  it("không dùng thì không để lại gì — thang vẫn là đường mặc định", () => {
    const { container } = render(<Flex gap="md">x</Flex>);
    const el = container.querySelector(".ui-flex") as HTMLElement;

    expect(el.dataset.gapRaw).toBeUndefined();
    expect(el.style.gap).toBe("");
    expect(el.className).toContain("ui-flex-gap-md");
  });

  it("giữ nguyên `style` mà nơi gọi truyền vào", () => {
    const { container } = render(
      <Flex gapRaw={5} style={{ padding: "8px" }}>
        x
      </Flex>,
    );
    const el = container.querySelector(".ui-flex") as HTMLElement;

    expect(el.style.padding).toBe("8px");
    expect(el.style.gap).toBe("5px");
  });
});

describe("ResponsiveGrid gap — cùng thang với Flex", () => {
  /*
   * `ResponsiveGrid` chọn gap bằng selector thuộc tính (`[data-gap="…"]`), khác
   * `Flex` vốn dùng lớp. Nên một bậc mới thêm cho Flex mà quên thêm cho nó sẽ
   * ra `data-gap="5"` không khớp luật nào: mất gap, không lỗi, không test đỏ.
   * Đó là lý do bậc số phải được canh ở CẢ HAI — một thang chỉ dày ở một
   * component thì không phải một thang.
   */
  it("phát data-gap cho cả bậc tên lẫn bậc số", () => {
    for (const gap of ["none", "xs", "sm", "md", "lg", "xl"] as const) {
      const { container } = render(<ResponsiveGrid gap={gap}>x</ResponsiveGrid>);
      expect((container.querySelector(".ui-responsive-grid") as HTMLElement).dataset.gap).toBe(gap);
    }

    for (const gap of [0, 1, 2, 3, 4, 5, 6, 8, 10, 12] as const) {
      const { container } = render(<ResponsiveGrid gap={gap}>x</ResponsiveGrid>);
      expect((container.querySelector(".ui-responsive-grid") as HTMLElement).dataset.gap).toBe(
        String(gap),
      );
    }
  });
});

describe("Flex pad — đệm trong, và lý do nó tồn tại", () => {
  /*
   * Chạy `ui-audit` trên consumer thật (godx-chat, 08/09/2026): 42 trong 51
   * lỗi là `no-utility-spacing`, và gần như tất cả xin cùng một thứ — padding.
   * `<Flex className="p-3">` không phải người viết cẩu thả; đó là nước đi duy
   * nhất còn lại khi primitive không có prop đệm (gh#408).
   *
   * Đo trên chính 51 lỗi ấy: cần cả BỐN CẠNH (`p-3`), THEO TRỤC (`px-4`/`py-1`)
   * và TỪNG CẠNH (16 dòng có `pt-*` khác `pb-*`). Nên `pad` nhận cả một bậc
   * lẫn một object — một prop chỉ nhận số sẽ không phủ nổi và ép người ta quay
   * lại class.
   */
  const padOf = (ui: React.ReactElement) => {
    const { container } = render(ui);

    return (container.querySelector(".ui-flex") as HTMLElement).style;
  };

  it("một bậc = cả bốn cạnh", () => {
    expect(padOf(<Flex pad={3}>x</Flex>).padding).toBe("var(--space-3)");
  });

  it("bậc TÊN đọc thang dọc — đệm bao quanh khối, không có trục viết để chặt hơn", () => {
    expect(padOf(<Flex pad="md">x</Flex>).padding).toBe("var(--space-stack-md)");
  });

  it("theo trục LOGIC, không phải trái/phải vật lý", () => {
    const s = padOf(<Flex pad={{ inline: 4, block: 1 }}>x</Flex>);

    expect(s.paddingInlineStart).toBe("var(--space-4)");
    expect(s.paddingInlineEnd).toBe("var(--space-4)");
    expect(s.paddingBlockStart).toBe("var(--space-1)");
    expect(s.paddingBlockEnd).toBe("var(--space-1)");
  });

  it("từng cạnh riêng — ca chiếm 16 dòng trong bản kiểm consumer", () => {
    const s = padOf(<Flex pad={{ blockStart: 3, blockEnd: 1 }}>x</Flex>);

    expect(s.paddingBlockStart).toBe("var(--space-3)");
    expect(s.paddingBlockEnd).toBe("var(--space-1)");
  });

  it("`padRaw` cho giá trị ngoài thang, và để lại dấu vết đếm được", () => {
    const { container } = render(<Flex padRaw={{ blockStart: 10 }}>x</Flex>);
    const el = container.querySelector(".ui-flex") as HTMLElement;

    expect(el.style.paddingBlockStart).toBe("10px");
    expect(el.dataset.padRaw).toBe("");
  });

  it("`padRaw` ghi đè `pad` ở TỪNG CẠNH, không phải cả cụm", () => {
    /*
     * Một thiết kế có thể cần đúng 10px ở trên trong khi ba cạnh còn lại vẫn
     * theo thang. Ghi đè cả cụm sẽ ép người dùng khai lại ba giá trị họ không
     * muốn đổi — và đó là lúc họ quay về `className`.
     */
    const s = padOf(
      <Flex pad={{ inline: 4, blockStart: 3 }} padRaw={{ blockStart: 10 }}>
        x
      </Flex>,
    );

    expect(s.paddingBlockStart).toBe("10px");
    expect(s.paddingInlineStart).toBe("var(--space-4)");
  });

  it("không dùng thì không phát style — thang vẫn là đường mặc định", () => {
    const { container } = render(<Flex gap="md">x</Flex>);
    const el = container.querySelector(".ui-flex") as HTMLElement;

    expect(el.getAttribute("style")).toBeNull();
    expect(el.dataset.padRaw).toBeUndefined();
  });
});

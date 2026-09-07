import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { render, within } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { cn } from "../../../lib/utils";
import type { SeparatorProp } from "../../../props/components/layout.prop";
import { Separator } from "../separator";

/*
 * Phép kiểm SO SÁNH, không phải phép kiểm tự khẳng định.
 *
 * `Separator` vừa đổi nền từ `@radix-ui/react-separator` sang `Separator` của
 * `react-aria-components`. Radix vẫn còn trong node_modules ở nhánh này, nên
 * cách kiểm đúng không phải là viết ra kỳ vọng của mình rồi kiểm nó — mà là
 * dựng cùng một cây bằng cả hai nền và đòi chúng ra giống nhau.
 *
 * `RadixSeparator` bên dưới LÀ bản `separator.tsx` trước khi chuyển, chép
 * nguyên văn. Nó là chứng cứ, đừng "dọn" nó.
 *
 * CHỖ KHÔNG SO ĐƯỢC NGUYÊN VĂN: thứ tự thuộc tính trong `outerHTML`. Radix
 * dựng `{data-orientation, ...role, ...domProps}` nên `role` nằm gần đầu;
 * bản RAC nhận props đã lọc qua `filterDOMProps` rồi mới ghép `role` nên thứ
 * tự khác. Thứ tự thuộc tính không mang ngữ nghĩa nào (CSS, ARIA và
 * querySelector đều không thấy nó), nên `sameElement` so TÊN THẺ, TOÀN BỘ cặp
 * thuộc tính/giá trị đã sắp xếp, và `innerHTML` — chặt hơn `outerHTML` ở chỗ
 * nó chỉ ra được đúng thuộc tính nào lệch.
 */

/** `src/components/ui/separator.tsx` @ Radix — bản trước khi chuyển, chép nguyên văn. */
const RadixSeparator = React.forwardRef<HTMLDivElement, SeparatorProp>(
  (
    {
      className,
      orientation = "horizontal",
      decorative,
      label,
      labelAlign = "center",
      tone = "default",
      ...props
    },
    ref,
  ) => {
    const hasLabel = typeof label === "string" && label.trim() !== "";
    const labelled = hasLabel && orientation === "horizontal";
    const isDecorative = decorative ?? !labelled;

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        data-slot="separator"
        data-orientation={orientation}
        data-tone={tone}
        data-labelled={labelled ? "" : undefined}
        data-label-align={labelled ? labelAlign : undefined}
        orientation={orientation}
        decorative={isDecorative}
        aria-label={labelled && !isDecorative ? label : undefined}
        className={cn("ui-separator", className)}
        {...props}
      >
        {labelled ? (
          <>
            <span className="ui-separator-rule" aria-hidden="true" />
            <span className="ui-separator-label" aria-hidden={isDecorative ? undefined : true}>
              {label}
            </span>
            <span className="ui-separator-rule" aria-hidden="true" />
          </>
        ) : null}
      </SeparatorPrimitive.Root>
    );
  },
);
RadixSeparator.displayName = "RadixSeparator";

function shape(container: HTMLElement) {
  const el = container.firstElementChild as HTMLElement;
  return {
    tag: el.localName,
    attrs: Object.fromEntries(
      [...el.attributes].map((a) => [a.name, a.value]).sort(([a], [b]) => a.localeCompare(b)),
    ),
    html: el.innerHTML,
  };
}

/** Dựng cùng một cây bằng cả hai nền và đòi chúng ra cùng một phần tử. */
function sameElement(props: SeparatorProp) {
  const mine = render(<Separator {...props} />);
  const radix = render(<RadixSeparator {...props} />);
  const [a, b] = [shape(mine.container), shape(radix.container)];
  expect(a).toEqual(b);
  return { mine, radix, shape: a };
}

describe("Separator — khớp từng điểm với @radix-ui/react-separator", () => {
  describe("không nhãn", () => {
    it("mặc định: ngang, decorative ngầm định", () => {
      const { shape } = sameElement({});
      expect(shape.tag).toBe("div");
      expect(shape.attrs).toMatchObject({
        "data-slot": "separator",
        "data-orientation": "horizontal",
        "data-tone": "default",
        role: "none",
        class: "ui-separator",
      });
      expect(shape.attrs).not.toHaveProperty("data-labelled");
      expect(shape.attrs).not.toHaveProperty("aria-label");
      expect(shape.html).toBe("");
    });

    it("dọc", () => {
      const { shape } = sameElement({ orientation: "vertical" });
      expect(shape.attrs["data-orientation"]).toBe("vertical");
      expect(shape.attrs.role).toBe("none");
      // `aria-orientation` bị cấm trên role="none" — RAC phát nó, bản này gỡ đi.
      expect(shape.attrs).not.toHaveProperty("aria-orientation");
    });

    it("decorative={false} ngang — role thật, aria-orientation ngầm định nên vắng", () => {
      const { shape, mine } = sameElement({ decorative: false });
      expect(shape.attrs.role).toBe("separator");
      expect(shape.attrs).not.toHaveProperty("aria-orientation");
      expect(within(mine.container).getByRole("separator")).toBeInTheDocument();
    });

    it("decorative={false} dọc — aria-orientation nói rõ", () => {
      const { shape } = sameElement({ orientation: "vertical", decorative: false });
      expect(shape.attrs.role).toBe("separator");
      expect(shape.attrs["aria-orientation"]).toBe("vertical");
    });

    it("decorative={true} tường minh trùng với mặc định", () => {
      const { shape } = sameElement({ decorative: true });
      expect(shape.attrs.role).toBe("none");
    });
  });

  describe("có nhãn", () => {
    it("lật decorative sang false và đặt tên cho dải phân cách đúng một lần", () => {
      const { shape, mine } = sameElement({ label: "新しいメッセージ" });
      expect(shape.attrs.role).toBe("separator");
      expect(shape.attrs["data-labelled"]).toBe("");
      expect(shape.attrs["data-label-align"]).toBe("center");
      expect(shape.attrs["aria-label"]).toBe("新しいメッセージ");

      const separator = within(mine.container).getByRole("separator", {
        name: "新しいメッセージ",
      });
      expect(separator).toHaveAccessibleName("新しいメッセージ");
      expect(separator.querySelectorAll(".ui-separator-rule")).toHaveLength(2);
      expect(separator.querySelector(".ui-separator-label")).toHaveAttribute("aria-hidden", "true");
    });

    it("decorative={true} tường minh: role=none, không tên, chữ để nguyên trong cây", () => {
      const { shape, mine } = sameElement({ label: "or", decorative: true });
      expect(shape.attrs.role).toBe("none");
      expect(shape.attrs).not.toHaveProperty("aria-label");
      expect(within(mine.container).queryByRole("separator")).toBeNull();
      expect(mine.container.querySelector(".ui-separator-label")).not.toHaveAttribute(
        "aria-hidden",
      );
    });

    it("labelAlign đi qua nguyên vẹn ở cả ba giá trị", () => {
      for (const labelAlign of ["start", "center", "end"] as const) {
        const { shape } = sameElement({ label: "22 Aug", labelAlign });
        expect(shape.attrs["data-label-align"]).toBe(labelAlign);
      }
    });

    it("nhãn toàn khoảng trắng bị coi như không có nhãn", () => {
      const { shape } = sameElement({ label: "   " });
      expect(shape.attrs).not.toHaveProperty("data-labelled");
      expect(shape.attrs.role).toBe("none");
    });

    it("nhãn trên rule DỌC bị bỏ, và cảnh báo ở bản dev", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { shape } = sameElement({ orientation: "vertical", label: "or" });
      expect(shape.attrs).not.toHaveProperty("data-labelled");
      expect(shape.attrs.role).toBe("none");
      expect(shape.html).toBe("");
      // Chỉ bản RAC cảnh báo — `RadixSeparator` ở trên chép phần thân, không chép khối dev-warn.
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("Separator"));
      warn.mockRestore();
    });
  });

  describe("tone", () => {
    for (const tone of [
      "default",
      "muted",
      "primary",
      "success",
      "warning",
      "destructive",
      "info",
    ] as const) {
      it(`tone="${tone}" nằm trên gốc, cả bản có nhãn lẫn không nhãn`, () => {
        expect(sameElement({ tone }).shape.attrs["data-tone"]).toBe(tone);
        expect(sameElement({ tone, label: "Tin nhắn mới" }).shape.attrs["data-tone"]).toBe(tone);
      });
    }
  });

  describe("hợp đồng props công khai", () => {
    it("className nối chuỗi, không ghi đè", () => {
      const { shape } = sameElement({ className: "stream-divider" });
      expect(shape.attrs.class).toBe("ui-separator stream-divider");
    });

    it("ref trỏ vào đúng gốc công khai", () => {
      const mine = React.createRef<HTMLDivElement>();
      const radix = React.createRef<HTMLDivElement>();
      const a = render(<Separator ref={mine} label="or" />);
      const b = render(<RadixSeparator ref={radix} label="or" />);
      expect(mine.current).toBe(a.container.querySelector('[data-slot="separator"]'));
      expect(radix.current).toBe(b.container.querySelector('[data-slot="separator"]'));
    });

    it("props của consumer ghi đè được data-slot (AuthDivider dựa vào đúng chỗ này)", () => {
      const { shape } = sameElement({ "data-slot": "auth-divider" } as SeparatorProp);
      expect(shape.attrs["data-slot"]).toBe("auth-divider");
    });

    it("giữ nguyên phần HTMLAttributes mà filterDOMProps của RAC vứt đi", () => {
      // `SeparatorProp` = `Omit<HTMLAttributes<HTMLDivElement>, "children">`, nhưng
      // `filterDOMProps` của RAC chỉ giữ `id`, `data-*`, bốn `aria-*` gắn nhãn và các
      // sự kiện toàn cục. `title`/`tabIndex`/`aria-describedby`… phải được trả lại.
      const { shape } = sameElement({
        id: "sep-1",
        title: "ngăn cách",
        tabIndex: -1,
        lang: "vi",
        style: { opacity: 0.5 },
      });
      expect(shape.attrs).toMatchObject({
        id: "sep-1",
        title: "ngăn cách",
        tabindex: "-1",
        lang: "vi",
        style: "opacity: 0.5;",
      });
    });

    it("onClick vẫn chạy", async () => {
      const onClick = vi.fn();
      const { container } = render(<Separator onClick={onClick} />);
      (container.firstElementChild as HTMLElement).click();
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});

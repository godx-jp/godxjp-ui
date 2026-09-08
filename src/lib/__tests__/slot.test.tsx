import { Slot as RadixSlot } from "@radix-ui/react-slot";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Slot } from "../slot";

/*
 * Phép kiểm SO SÁNH, không phải phép kiểm tự khẳng định.
 *
 * `Slot` mới thay `@radix-ui/react-slot`, và 171 chỗ `asChild` trong thư viện
 * cùng mọi consumer đang dựa vào hành vi CŨ. Nên cách kiểm đúng không phải là
 * viết ra kỳ vọng của mình rồi kiểm nó — mà là dựng cùng một cây bằng cả hai
 * Slot và đòi chúng ra giống nhau.
 *
 * Radix vẫn còn trong node_modules ở nhánh này, nên so được. Khi Radix bị gỡ
 * hẳn, bộ test này sẽ phải đổi sang khẳng định trực tiếp — và lúc đó nó đã làm
 * xong việc của nó.
 */

function markup(el: HTMLElement) {
  return (el.firstElementChild as HTMLElement).outerHTML;
}

describe("Slot — khớp từng điểm với @radix-ui/react-slot", () => {
  it("con thắng ở prop thường", () => {
    const mine = render(
      <Slot id="parent" title="cha">
        <button id="child">x</button>
      </Slot>,
    );
    const radix = render(
      <RadixSlot id="parent" title="cha">
        <button id="child">x</button>
      </RadixSlot>,
    );

    expect(markup(mine.container)).toBe(markup(radix.container));
  });

  it("className nối chuỗi, không ghi đè", () => {
    const mine = render(
      <Slot className="a">
        <button className="b">x</button>
      </Slot>,
    );
    const radix = render(
      <RadixSlot className="a">
        <button className="b">x</button>
      </RadixSlot>,
    );

    expect(markup(mine.container)).toBe(markup(radix.container));
    expect(markup(mine.container)).toContain("a b");
  });

  it("style GỘP NÔNG — chỗ `mergeProps` của React Aria khác Radix", () => {
    /*
     * `mergeProps` để style của con ghi đè hẳn style của cha: cha
     * {color:'red'} + con {margin:'1px'} ra {margin:'1px'}, mất màu. Đây là
     * điểm duy nhất `Slot` phải tự lo sau khi gọi mergeProps, và là lý do nó
     * có test riêng.
     */
    const mine = render(
      <Slot style={{ color: "red" }}>
        <button style={{ margin: "1px" }}>x</button>
      </Slot>,
    );
    const radix = render(
      <RadixSlot style={{ color: "red" }}>
        <button style={{ margin: "1px" }}>x</button>
      </RadixSlot>,
    );

    expect(markup(mine.container)).toBe(markup(radix.container));
    expect(markup(mine.container)).toContain("color: red");
    expect(markup(mine.container)).toContain("margin: 1px");
  });

  it("handler CHAIN — cả hai chạy, đúng thứ tự cha rồi con", () => {
    const order: string[] = [];
    const parent = vi.fn(() => order.push("cha"));
    const child = vi.fn(() => order.push("con"));

    const { container } = render(
      <Slot onClick={parent}>
        <button onClick={child}>x</button>
      </Slot>,
    );

    (container.firstElementChild as HTMLElement).click();

    expect(parent).toHaveBeenCalledTimes(1);
    expect(child).toHaveBeenCalledTimes(1);
    expect(order).toEqual(["cha", "con"]);
  });

  it("không có style ở cả hai thì KHÔNG phát thuộc tính style rỗng", () => {
    const mine = render(
      <Slot>
        <button>x</button>
      </Slot>,
    );
    const radix = render(
      <RadixSlot>
        <button>x</button>
      </RadixSlot>,
    );

    expect(markup(mine.container)).toBe(markup(radix.container));
    expect(markup(mine.container)).not.toContain("style");
  });

  it("hai con thì ném lỗi — `asChild` không có thẻ nào để mượn", () => {
    expect(() =>
      render(
        <Slot>
          <button>a</button>
          <button>b</button>
        </Slot>,
      ),
    ).toThrow();
  });
});

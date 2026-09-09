import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as React from "react";
import * as RadixLabel from "@radix-ui/react-label";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Label } from "../label";

/*
 * Phép kiểm SO SÁNH cho `Label`, và phép kiểm KHẲNG ĐỊNH TRỰC TIẾP cho `Checkbox`.
 *
 * Cả hai vừa đổi nền từ Radix sang react-aria-components. Radix VẪN còn trong
 * node_modules ở nhánh này, nên chỗ nào so được thì so.
 *
 *   • `Label` — RAC dựng đúng một `<label>`, không thêm thuộc tính nào. So được
 *     `outerHTML` từng ký tự, kể cả nhánh `asChild`.
 *
 *   • `Checkbox` — KHÔNG so được. Radix dựng `<button role="checkbox"
 *     aria-checked data-state>`; RAC dựng `<label>` bọc một `<input
 *     type="checkbox">` thật (cộng `data-rac`, `data-selected`,
 *     `data-react-aria-pressable`…). Hai cây DOM khác hẳn nhau, nên phần dưới
 *     khẳng định thẳng HÀNH VI: vai trò, tên khả truy cập, tri-state, bàn phím,
 *     và mấy cái móc CSS (`data-slot`, `.ui-checkbox`, `data-state`) mà 12k dòng
 *     CSS đang bám vào. Chỗ nào so được với Radix ở mức thuộc tính thì vẫn so.
 */

/*
 * Chuỗi class mà `Label` phát ra, viết ở đây dưới dạng HẰNG chứ không phải
 * literal trong JSX: prettier-plugin-tailwindcss sắp lại class trong thuộc tính
 * `className`, nên một literal đặt thẳng vào `<RadixLabel.Root className="…">`
 * sẽ bị sắp khác đi và phép so hoá ra so hai lần sắp xếp, không so hai nền.
 */
const LABEL_CLASS =
  "ui-label group-data-[disabled=true]:pointer-events-none " +
  "group-data-[disabled=true]:opacity-[var(--disabled-opacity)] font-medium " +
  "leading-[var(--control-label-line-height)] peer-disabled:cursor-not-allowed " +
  "peer-disabled:opacity-[var(--control-label-disabled-alpha)] extra";

function markup(el: HTMLElement) {
  return (el.firstElementChild as HTMLElement).outerHTML;
}

/*
 * `outerHTML` với thuộc tính đã SẮP XẾP.
 *
 * RAC dựng `<label>` đặt `className` vào object prop trước rồi mới spread phần
 * còn lại, nên React phát ra `class` → `for` → `data-slot`; Radix phát ra
 * `for` → `data-slot` → `class`. Nội dung y hệt, chỉ THỨ TỰ khác — và thứ tự
 * thuộc tính không có nghĩa gì trong HTML. So sau khi chuẩn hoá; test kế bên
 * ghim lại rằng khác biệt duy nhất đúng là thứ tự đó.
 */
function normalized(el: HTMLElement) {
  const node = el.firstElementChild as HTMLElement;
  const attributes = Array.from(node.attributes)
    .map((attribute) => `${attribute.name}=${JSON.stringify(attribute.value)}`)
    .sort();
  return `${node.tagName} ${attributes.join(" ")} >${node.innerHTML}<`;
}

describe("Label — khớp từng ký tự với @radix-ui/react-label", () => {
  it("nhãn thường: cùng thẻ, cùng class, cùng data-slot, cùng `for`", () => {
    const mine = render(
      <Label htmlFor="agree" className="extra">
        Đồng ý
      </Label>,
    );
    const radix = render(
      <RadixLabel.Root htmlFor="agree" data-slot="label" className={LABEL_CLASS}>
        Đồng ý
      </RadixLabel.Root>,
    );

    expect(normalized(mine.container)).toBe(normalized(radix.container));
    expect(markup(mine.container)).toContain('data-slot="label"');
    expect(markup(mine.container)).toContain("ui-label");
    // Khác biệt DUY NHẤT còn lại so với Radix là thứ tự thuộc tính; ghim nó lại
    // để lần sau có ai đó làm lệch nội dung thì test trên đỏ, không phải test này.
    expect(markup(mine.container)).not.toBe(markup(radix.container));
    expect(markup(mine.container).startsWith('<label class="ui-label')).toBe(true);
  });

  it("`asChild` vẫn mượn thẻ của con — API riêng của kho, không phải của Radix", () => {
    const mine = render(
      <Label asChild id="lbl" className="extra">
        <span>Tên</span>
      </Label>,
    );
    const radix = render(
      <RadixLabel.Root asChild id="lbl" data-slot="label" className={LABEL_CLASS}>
        <span>Tên</span>
      </RadixLabel.Root>,
    );

    expect(markup(mine.container)).toBe(markup(radix.container));
    expect(mine.container.firstElementChild?.tagName).toBe("SPAN");
  });

  it("nháy đúp KHÔNG bôi đen chữ — hành vi của Radix, RAC không có, nên chép tay", async () => {
    const user = userEvent.setup();
    const onMouseDown = vi.fn();
    render(
      <Label onMouseDown={onMouseDown} data-testid="lbl">
        Đồng ý
      </Label>,
    );
    const label = screen.getByTestId("lbl");

    await user.dblClick(label);

    // Lần nhấn thứ hai (detail > 1) bị chặn mặc định; handler của người gọi vẫn chạy đủ.
    expect(onMouseDown).toHaveBeenCalled();
    const second = onMouseDown.mock.calls
      .map((call) => call[0] as React.MouseEvent)
      .find((event) => event.detail > 1);
    expect(second?.defaultPrevented).toBe(true);
  });
});


describe("Label line box", () => {
  const controlTokens = readFileSync(
    resolve(process.cwd(), "src/tokens/components/control.css"),
    "utf8",
  );

  it("never sets a line-height of 1, because a label wraps", () => {
    /*
     * `--control-label-line-height: 1` was chosen for a single-line label beside a checkbox, where
     * a cap-height box aligns cleanly. It is wrong for every other case: measured on a hosted
     * sign-up consent label at 520px, 14px text with a 14px line box gave a 28px block of two
     * TOUCHING lines. Long copy, a narrow column and ja/vi wrapping all reach that routinely.
     *
     * The package had already paid for this literal once — see the note on
     * `--auth-shell-divider-label-line-height`, where a hardcoded `line-height: 1` rendered an
     * 11px row and sat the lower half of the canonical Login card 8px high (gh#263).
     */
    expect(controlTokens).not.toMatch(/--control-label-line-height:\s*1\s*;/);
    expect(controlTokens).toMatch(
      /--control-label-line-height:\s*var\(--line-height-normal\)/,
    );
  });

  it("keeps reading the token from the primitive, so a theme can still retune it", () => {
    // The Label carries `leading-[var(--control-label-line-height)]` as a UTILITY, which is the
    // only layer that can beat the components rules; if it stopped reading the token the fix above
    // would be silently unreachable from a service theme.
    const label = readFileSync(resolve(process.cwd(), "src/components/data-entry/label.tsx"), "utf8");
    expect(label).toContain("leading-[var(--control-label-line-height)]");
  });
});

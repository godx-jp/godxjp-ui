import * as React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as RadixTogglePrimitive from "@radix-ui/react-toggle";
import * as RadixToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { describe, expect, it, vi } from "vitest";

import { Toggle } from "../toggle";
import { ToggleGroup, ToggleGroupItem } from "../toggle-group";

/*
 * Phép kiểm SO SÁNH, không phải phép kiểm tự khẳng định.
 *
 * `Toggle` / `ToggleGroup` chuyển từ `@radix-ui/react-toggle(-group)` sang React Aria
 * `ToggleButton` / `ToggleButtonGroup`. Consumer thật đang dựa vào hành vi CŨ, nên cách kiểm đúng
 * là dựng cùng một cây bằng cả hai rồi đòi chúng ra giống nhau. Radix vẫn còn trong node_modules ở
 * nhánh này nên so được.
 *
 * SO ĐƯỢC ĐẾN ĐÂU. Hai nền không ra byte giống nhau — RAC thêm dấu vết của riêng nó và bỏ vài thứ
 * của Radix. `normalize` dưới đây gỡ ĐÚNG những thứ đó, từng cái một có lý do; mọi thuộc tính còn
 * lại (role, aria-*, data-slot, data-state, class, type…) phải trùng khít.
 */

/** Dấu vết chỉ RAC mới có — thêm vào, không thay thế thứ gì của Radix. */
const RAC_ONLY = new Set([
  "data-rac", // nhãn "phần tử này do RAC dựng"
  "data-react-aria-pressable", // móc của usePress
  "data-focused",
  "data-hovered",
  "data-focus-visible",
  "data-pressed", // trạng thái NHẤN GIỮ của RAC, không phải `pressed` của kho
  "data-selected", // bản sao RAC của data-state="on"
  "aria-orientation", // RAC nói rõ trục; Radix để ngầm
  "data-orientation",
]);

/** Dấu vết chỉ Radix mới có. */
const RADIX_ONLY = new Set([
  "data-radix-collection-item", // móc RovingFocusGroup
  "dir", // Radix luôn in dir="ltr"; RAC đọc hướng từ locale (I18nProvider)
]);

/*
 * `tabindex` khác hẳn NGHĨA giữa hai nền: Radix dùng roving tabindex (nhóm là một điểm dừng Tab,
 * item là -1), RAC để mọi item tự nhận Tab rồi chặn phím Tab để nhảy ra. Đó là khác biệt hành vi
 * có thật, được kiểm riêng bên dưới chứ không giấu trong phép so markup.
 * `style` bị bỏ vì Radix gắn `outline:none` cho gốc nhóm; đường truyền `style` được kiểm riêng.
 */
const BEHAVIOURAL_NOISE = new Set(["tabindex", "style"]);

function normalize(el: Element): string {
  const attributes = [...el.attributes]
    .filter(
      (attribute) =>
        !RAC_ONLY.has(attribute.name) &&
        !RADIX_ONLY.has(attribute.name) &&
        !BEHAVIOURAL_NOISE.has(attribute.name),
    )
    // Radix in `data-disabled=""`, RAC in `data-disabled="true"`. CSS bám vào SỰ CÓ MẶT
    // (`.ui-toggle[data-disabled]`), nên chỉ tên thuộc tính mới mang nghĩa.
    .map((attribute) =>
      attribute.name === "data-disabled" ? "data-disabled" : `${attribute.name}=${attribute.value}`,
    )
    .sort()
    .join(" ");
  const children = [...el.childNodes]
    .map((node) =>
      node.nodeType === Node.ELEMENT_NODE ? normalize(node as Element) : node.textContent,
    )
    .join("");
  return `<${el.localName} ${attributes}>${children}</${el.localName}>`;
}

function markup(container: HTMLElement) {
  return normalize(container.firstElementChild as Element);
}

describe("Toggle — khớp với @radix-ui/react-toggle sau khi gỡ dấu vết riêng của mỗi nền", () => {
  it("mặc định: cùng type/aria-pressed/data-state/class", () => {
    const mine = render(<Toggle aria-label="太字">B</Toggle>);
    const radix = render(
      <RadixTogglePrimitive.Root
        data-slot="toggle"
        aria-label="太字"
        className="ui-toggle ui-toggle-default ui-toggle-default-size"
      >
        B
      </RadixTogglePrimitive.Root>,
    );

    expect(markup(mine.container)).toBe(markup(radix.container));
    expect(markup(mine.container)).toContain("aria-pressed=false");
    expect(markup(mine.container)).toContain("data-slot=toggle data-state=off type=button");
  });

  it("pressed + disabled: cùng aria-pressed, data-state, data-disabled và disabled thật", () => {
    const mine = render(
      <Toggle aria-label="太字" pressed disabled>
        B
      </Toggle>,
    );
    const radix = render(
      <RadixTogglePrimitive.Root
        data-slot="toggle"
        aria-label="太字"
        pressed
        disabled
        className="ui-toggle ui-toggle-default ui-toggle-default-size"
      >
        B
      </RadixTogglePrimitive.Root>,
    );

    expect(markup(mine.container)).toBe(markup(radix.container));
    expect(markup(mine.container)).toContain("disabled=");
  });

  it("variant/size/className đi vào cùng một chuỗi class", () => {
    const mine = render(
      <Toggle variant="outline" size="lg" className="mine" aria-label="a">
        B
      </Toggle>,
    );
    const radix = render(
      <RadixTogglePrimitive.Root
        data-slot="toggle"
        aria-label="a"
        className="ui-toggle ui-toggle-outline ui-toggle-lg mine"
      >
        B
      </RadixTogglePrimitive.Root>,
    );

    expect(markup(mine.container)).toBe(markup(radix.container));
  });
});

describe("Toggle — hành vi (khẳng định trực tiếp, nơi markup không so được)", () => {
  it("không kiểm soát: click bật rồi tắt, aria-pressed và data-state đi cùng nhau", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Toggle aria-label="太字">B</Toggle>);
    const button = getByRole("button", { name: "太字" });

    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveAttribute("data-state", "off");

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute("data-state", "on");

    await user.click(button);
    expect(button).toHaveAttribute("data-state", "off");
  });

  it("defaultPressed gieo trạng thái đầu, onPressedChange nhận GIÁ TRỊ MỚI", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    const { getByRole } = render(
      <Toggle aria-label="太字" defaultPressed onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );
    const button = getByRole("button", { name: "太字" });
    expect(button).toHaveAttribute("data-state", "on");

    await user.click(button);
    expect(onPressedChange).toHaveBeenCalledWith(false);
  });

  it("kiểm soát mà không có handler thì ĐỨNG YÊN — giống hệt Radix", async () => {
    const user = userEvent.setup();
    const mine = render(
      <Toggle aria-label="a" pressed>
        B
      </Toggle>,
    );
    const radix = render(
      <RadixTogglePrimitive.Root aria-label="b" pressed>
        B
      </RadixTogglePrimitive.Root>,
    );

    await user.click(mine.getByRole("button", { name: "a" }));
    await user.click(radix.getByRole("button", { name: "b" }));

    expect(mine.getByRole("button", { name: "a" })).toHaveAttribute("aria-pressed", "true");
    expect(radix.getByRole("button", { name: "b" })).toHaveAttribute("aria-pressed", "true");
  });

  it("bàn phím: Space và Enter đều lật, disabled thì không lật và không nhận Tab", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    const { getByRole } = render(
      <>
        <Toggle aria-label="space">S</Toggle>
        <Toggle aria-label="dis" disabled onPressedChange={onPressedChange}>
          X
        </Toggle>
      </>,
    );
    const button = getByRole("button", { name: "space" });
    const disabledButton = getByRole("button", { name: "dis" });

    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{ }");
    expect(button).toHaveAttribute("aria-pressed", "true");
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-pressed", "false");

    expect(disabledButton).toBeDisabled();
    await user.tab();
    expect(disabledButton).not.toHaveFocus();
    await user.click(disabledButton);
    expect(onPressedChange).not.toHaveBeenCalled();
  });

  it("cụm đếm: pill aria-hidden, tên khả truy cập gộp số + đơn vị, Intl theo locale", () => {
    const { getByRole, container } = render(
      <Toggle count={1200} overflowCount={999} countLabel="件" aria-label="未読">
        <span aria-hidden="true">👍</span>
      </Toggle>,
    );
    const button = getByRole("button", { name: "未読, 999+ 件" });

    expect(container.querySelector('[data-slot="toggle-count"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(container.querySelector('[data-slot="toggle-count"]')).toHaveTextContent("999+");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("cụm đếm: showZero=false giấu pill, mặc định 1.000 theo Intl", () => {
    const zero = render(
      <Toggle count={0} showZero={false}>
        下書き
      </Toggle>,
    );
    expect(zero.container.querySelector('[data-slot="toggle-count"]')).toBeNull();

    const thousand = render(
      <Toggle count={1000} overflowCount={9999}>
        未読
      </Toggle>,
    );
    expect(thousand.container.querySelector('[data-slot="toggle-count"]')).toHaveTextContent(
      new Intl.NumberFormat("vi").format(1000),
    );
  });

  it("prop DOM mà filterDOMProps của RAC vứt đi đều được trả lại", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    const onFocus = vi.fn();
    const { getByRole } = render(
      <>
        <span id="hint">gợi ý</span>
        <Toggle
          aria-label="đủ prop"
          id="my-toggle"
          title="tiêu đề"
          tabIndex={3}
          aria-describedby="hint"
          data-testid="passthrough"
          style={{ color: "rgb(255, 0, 0)" }}
          type="submit"
          name="fmt"
          onKeyDown={onKeyDown}
          onFocus={onFocus}
        >
          B
        </Toggle>
      </>,
    );
    const button = getByRole("button", { name: "đủ prop" });

    expect(button).toHaveAttribute("id", "my-toggle");
    expect(button).toHaveAttribute("title", "tiêu đề");
    expect(button).toHaveAttribute("tabindex", "3");
    expect(button).toHaveAttribute("aria-describedby", "hint");
    expect(button).toHaveAttribute("data-testid", "passthrough");
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("name", "fmt");
    expect(button).toHaveStyle({ color: "rgb(255, 0, 0)" });

    button.focus();
    await user.keyboard("{Escape}");
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});

describe("ToggleGroup — type=single khớp với Radix", () => {
  function single(Group: typeof ToggleGroup, Item: typeof ToggleGroupItem) {
    return (
      <Group type="single" defaultValue="week" aria-label="表示">
        <Item value="day">日</Item>
        <Item value="week">週</Item>
      </Group>
    );
  }

  it("markup: radiogroup + radio + aria-checked + data-state, y như Radix", () => {
    const mine = render(single(ToggleGroup, ToggleGroupItem));
    const radix = render(
      <RadixToggleGroupPrimitive.Root
        type="single"
        defaultValue="week"
        aria-label="表示"
        data-slot="toggle-group"
        className="ui-toggle-group"
      >
        <RadixToggleGroupPrimitive.Item
          value="day"
          data-slot="toggle-group-item"
          className="ui-toggle ui-toggle-default ui-toggle-default-size"
        >
          日
        </RadixToggleGroupPrimitive.Item>
        <RadixToggleGroupPrimitive.Item
          value="week"
          data-slot="toggle-group-item"
          className="ui-toggle ui-toggle-default ui-toggle-default-size"
        >
          週
        </RadixToggleGroupPrimitive.Item>
      </RadixToggleGroupPrimitive.Root>,
    );

    expect(markup(mine.container)).toBe(markup(radix.container));
    expect(markup(mine.container)).toContain("role=radiogroup");
  });

  it("onValueChange nhận CHUỖI, và chuỗi rỗng khi bỏ chọn — cùng payload với Radix", async () => {
    const user = userEvent.setup();
    const mineSeen: string[] = [];
    const radixSeen: string[] = [];
    const mine = render(
      <ToggleGroup type="single" aria-label="表示" onValueChange={(v) => mineSeen.push(v)}>
        <ToggleGroupItem value="day">日</ToggleGroupItem>
        <ToggleGroupItem value="week">週</ToggleGroupItem>
      </ToggleGroup>,
    );
    const radix = render(
      <RadixToggleGroupPrimitive.Root
        type="single"
        aria-label="表示2"
        onValueChange={(v) => radixSeen.push(v)}
      >
        <RadixToggleGroupPrimitive.Item value="day">日2</RadixToggleGroupPrimitive.Item>
        <RadixToggleGroupPrimitive.Item value="week">週2</RadixToggleGroupPrimitive.Item>
      </RadixToggleGroupPrimitive.Root>,
    );

    await user.click(mine.getByRole("radio", { name: "週" }));
    await user.click(mine.getByRole("radio", { name: "日" }));
    await user.click(mine.getByRole("radio", { name: "日" }));

    await user.click(radix.getByRole("radio", { name: "週2" }));
    await user.click(radix.getByRole("radio", { name: "日2" }));
    await user.click(radix.getByRole("radio", { name: "日2" }));

    expect(mineSeen).toEqual(["week", "day", ""]);
    expect(mineSeen).toEqual(radixSeen);
    expect(mine.getByRole("radio", { name: "日" })).toHaveAttribute("data-state", "off");
  });

  it("controlled: value ngoài quyết định, data-state theo nó", () => {
    const { getByRole, rerender } = render(
      <ToggleGroup type="single" value="day" aria-label="表示">
        <ToggleGroupItem value="day">日</ToggleGroupItem>
        <ToggleGroupItem value="week">週</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(getByRole("radio", { name: "日" })).toHaveAttribute("aria-checked", "true");

    rerender(
      <ToggleGroup type="single" value="" aria-label="表示">
        <ToggleGroupItem value="day">日</ToggleGroupItem>
        <ToggleGroupItem value="week">週</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(getByRole("radio", { name: "日" })).toHaveAttribute("aria-checked", "false");
    expect(getByRole("radio", { name: "日" })).toHaveAttribute("data-state", "off");
  });

  it("disabled ở nhóm khoá mọi item; disabled ở item chỉ khoá item đó", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const wholeGroup = render(
      <ToggleGroup type="single" disabled aria-label="cả nhóm" onValueChange={onValueChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(wholeGroup.getByRole("radio", { name: "A" }));
    expect(wholeGroup.getByRole("radio", { name: "A" })).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();

    const oneItem = render(
      <ToggleGroup type="single" aria-label="một item" onValueChange={onValueChange}>
        <ToggleGroupItem value="a" disabled>
          A2
        </ToggleGroupItem>
        <ToggleGroupItem value="b">B2</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(oneItem.getByRole("radio", { name: "A2" }));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(oneItem.getByRole("radio", { name: "B2" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });
});

describe("ToggleGroup — type=multiple khớp với Radix", () => {
  it("markup: toolbar + aria-pressed trên từng item", () => {
    const mine = render(
      <ToggleGroup type="multiple" defaultValue={["bold"]} aria-label="書式">
        <ToggleGroupItem value="bold">B</ToggleGroupItem>
        <ToggleGroupItem value="italic">I</ToggleGroupItem>
      </ToggleGroup>,
    );
    const radix = render(
      <RadixToggleGroupPrimitive.Root
        type="multiple"
        defaultValue={["bold"]}
        aria-label="書式"
        data-slot="toggle-group"
        className="ui-toggle-group"
      >
        <RadixToggleGroupPrimitive.Item
          value="bold"
          data-slot="toggle-group-item"
          className="ui-toggle ui-toggle-default ui-toggle-default-size"
        >
          B
        </RadixToggleGroupPrimitive.Item>
        <RadixToggleGroupPrimitive.Item
          value="italic"
          data-slot="toggle-group-item"
          className="ui-toggle ui-toggle-default ui-toggle-default-size"
        >
          I
        </RadixToggleGroupPrimitive.Item>
      </RadixToggleGroupPrimitive.Root>,
    );

    expect(markup(mine.container)).toBe(markup(radix.container));
    expect(markup(mine.container)).toContain("role=toolbar");
  });

  it("onValueChange nhận MẢNG, thứ tự thêm/bớt giống Radix", async () => {
    const user = userEvent.setup();
    const mineSeen: string[][] = [];
    const radixSeen: string[][] = [];
    const mine = render(
      <ToggleGroup type="multiple" aria-label="書式" onValueChange={(v) => mineSeen.push(v)}>
        <ToggleGroupItem value="bold">B</ToggleGroupItem>
        <ToggleGroupItem value="italic">I</ToggleGroupItem>
      </ToggleGroup>,
    );
    const radix = render(
      <RadixToggleGroupPrimitive.Root
        type="multiple"
        aria-label="書式2"
        onValueChange={(v) => radixSeen.push(v)}
      >
        <RadixToggleGroupPrimitive.Item value="bold">B2</RadixToggleGroupPrimitive.Item>
        <RadixToggleGroupPrimitive.Item value="italic">I2</RadixToggleGroupPrimitive.Item>
      </RadixToggleGroupPrimitive.Root>,
    );

    for (const name of ["B", "I", "B"]) {
      await user.click(mine.getByRole("button", { name }));
    }
    for (const name of ["B2", "I2", "B2"]) {
      await user.click(radix.getByRole("button", { name }));
    }

    expect(mineSeen).toEqual([["bold"], ["bold", "italic"], ["italic"]]);
    expect(mineSeen).toEqual(radixSeen);
    expect(mine.getByRole("button", { name: "I" })).toHaveAttribute("data-state", "on");
  });
});

describe("ToggleGroupItem — vốn từ của kho được giữ nguyên", () => {
  it("variant/size từ nhóm xuống item, prop của item vẫn thắng", () => {
    const { container } = render(
      <ToggleGroup type="single" variant="outline" size="sm" aria-label="表示">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b" size="lg">
          B
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    const [inherited, explicitSize] = [
      ...container.querySelectorAll('[data-slot="toggle-group-item"]'),
    ];

    expect(inherited).toHaveClass("ui-toggle-outline", "ui-toggle-sm");
    expect(inherited).toHaveAttribute("data-size", "sm");
    expect(explicitSize).toHaveClass("ui-toggle-outline", "ui-toggle-lg");
    expect(explicitSize).toHaveAttribute("data-size", "lg");
  });

  it("cụm đếm trên item: pill + tên khả truy cập, `value` KHÔNG rò ra DOM", () => {
    const { getByRole, container } = render(
      <ToggleGroup type="multiple" aria-label="リアクション">
        <ToggleGroupItem value="up" aria-label="いいね" count={3} countLabel="件" id="item-up">
          👍
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    const item = getByRole("button", { name: "いいね, 3 件" });

    expect(container.querySelector('[data-slot="toggle-count"]')).toHaveTextContent("3");
    // `value` là KHOÁ chọn (RAC gọi là `id`), không phải thuộc tính DOM — Radix cũng vậy.
    expect(item).not.toHaveAttribute("value");
    // …và `id` do người dùng đặt vẫn là `id` của DOM.
    expect(item).toHaveAttribute("id", "item-up");
  });

  it("gốc nhóm cũng trả lại prop DOM mà RAC vứt", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    const { container } = render(
      <ToggleGroup type="single" aria-label="表示" id="grp" title="tiêu đề" onKeyDown={onKeyDown}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const root = container.querySelector('[data-slot="toggle-group"]')!;

    expect(root).toHaveAttribute("id", "grp");
    expect(root).toHaveAttribute("title", "tiêu đề");

    (root.querySelector("button") as HTMLElement).focus();
    await user.keyboard("{Escape}");
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});

describe("ToggleGroup — bàn phím: chỗ RAC KHÁC Radix, ghi lại chứ không giấu", () => {
  function items(container: HTMLElement) {
    return [...container.querySelectorAll("button")] as HTMLElement[];
  }

  it("mũi tên đi tới item kế — giống nhau; nhưng ở cuối hàng Radix VÒNG LẠI, RAC DỪNG", async () => {
    const user = userEvent.setup();
    const mine = render(
      <ToggleGroup type="multiple" aria-label="書式">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    const radix = render(
      <RadixToggleGroupPrimitive.Root type="multiple" aria-label="書式2">
        <RadixToggleGroupPrimitive.Item value="a">A2</RadixToggleGroupPrimitive.Item>
        <RadixToggleGroupPrimitive.Item value="b">B2</RadixToggleGroupPrimitive.Item>
      </RadixToggleGroupPrimitive.Root>,
    );

    const [mineFirst, mineLast] = items(mine.container);
    const [radixFirst, radixLast] = items(radix.container);

    mineFirst.focus();
    await user.keyboard("{ArrowRight}");
    expect(mineLast).toHaveFocus();
    radixFirst.focus();
    await user.keyboard("{ArrowRight}");
    expect(radixLast).toHaveFocus();

    // Ở item cuối: `loop` mặc định của Radix vòng về đầu; React Aria không có công tắc đó và dừng
    // lại. Đây là khác biệt hành vi PHẢI biết — `loop` của kho vì thế thành prop vô hiệu.
    await user.keyboard("{ArrowRight}");
    expect(radixFirst).toHaveFocus();
    mineLast.focus();
    await user.keyboard("{ArrowRight}");
    expect(mineLast).toHaveFocus();
  });

  it("điểm dừng Tab: Radix roving (item -1), RAC để mọi item tự nhận Tab", () => {
    const mine = render(
      <ToggleGroup type="multiple" aria-label="書式">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    const radix = render(
      <RadixToggleGroupPrimitive.Root type="multiple" aria-label="書式2">
        <RadixToggleGroupPrimitive.Item value="a">A2</RadixToggleGroupPrimitive.Item>
        <RadixToggleGroupPrimitive.Item value="b">B2</RadixToggleGroupPrimitive.Item>
      </RadixToggleGroupPrimitive.Root>,
    );

    expect(items(radix.container).map((item) => item.tabIndex)).toEqual([-1, -1]);
    expect(items(mine.container).map((item) => item.tabIndex)).toEqual([0, 0]);
  });
});

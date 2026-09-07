import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as RadixAccordion from "@radix-ui/react-accordion";
import * as RadixCollapsible from "@radix-ui/react-collapsible";
import { describe, expect, it, vi } from "vitest";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../data-display/collapsible";

/*
 * Phép kiểm SO SÁNH, không phải phép kiểm tự khẳng định.
 *
 * `Collapsible` và `Accordion` vừa đổi nền từ Radix sang `Disclosure` /
 * `DisclosureGroup` của react-aria-components. Radix VẪN CÒN trong node_modules
 * ở nhánh này, nên cách kiểm đúng là dựng cùng một cây bằng cả hai rồi đòi
 * chúng cư xử như nhau — chứ không phải viết ra kỳ vọng của mình rồi kiểm nó.
 *
 * Nhưng khác `Slot`, DOM của hai nền KHÔNG trùng khít, nên `outerHTML` so trực
 * tiếp là vô nghĩa. Ba loại lệch, cả ba đều là THÊM chứ không MẤT:
 *
 *   1. id — Radix sinh `radix-_r_N_`, RAC sinh `react-aria-_r_N_`. Và trigger
 *      của Collapsible ở Radix không có `id` nào cả, trong khi panel của RAC
 *      trỏ `aria-labelledby` về trigger nên trigger buộc phải có.
 *   2. RAC thêm `data-expanded` bên cạnh `data-state`, và cho panel của
 *      Collapsible một `role="group"` + `aria-labelledby` + `aria-hidden` mà
 *      Radix không phát.
 *   3. Cách ẩn: Radix đặt `hidden=""`, RAC đặt `hidden="until-found"`; biến CSS
 *      đo chiều cao cũng đổi tên (`--radix-collapsible-content-height` →
 *      `--disclosure-panel-height`). Không có dòng CSS nào trong `src/styles/`
 *      đọc biến cũ — đã kiểm — nên đây là đổi tên chứ không phải mất hoạt ảnh.
 *
 * Nên phép so được đặt ở đúng chỗ nó có nghĩa: TẬP MÓC `data-*` mà 12k dòng CSS
 * và consumer bám vào phải trùng từng phần tử, HÀNH VI phải trùng, và những chỗ
 * lệch thì được khẳng định thẳng ở mục "Chỗ không so được".
 */

const LABELS = ["A", "B", "C"] as const;

function stateHooks(container: HTMLElement) {
  return [...container.querySelectorAll("[data-state]")].map((el) =>
    [
      el.tagName.toLowerCase(),
      el.getAttribute("data-slot") ?? "-",
      el.getAttribute("data-state"),
      el.hasAttribute("data-disabled") ? "disabled" : "-",
      el.getAttribute("data-orientation") ?? "-",
    ].join("|"),
  );
}

/* ── Collapsible: cùng một cây, hai nền ─────────────────────────────────── */

function MineCollapsible(props: { defaultOpen?: boolean; disabled?: boolean }) {
  return (
    <Collapsible defaultOpen={props.defaultOpen} disabled={props.disabled}>
      <CollapsibleTrigger>Chi tiết</CollapsibleTrigger>
      <CollapsibleContent>Nội dung GX-001</CollapsibleContent>
    </Collapsible>
  );
}

function RadixCollapsibleTree(props: { defaultOpen?: boolean; disabled?: boolean }) {
  return (
    <RadixCollapsible.Root defaultOpen={props.defaultOpen} disabled={props.disabled}>
      <RadixCollapsible.CollapsibleTrigger>Chi tiết</RadixCollapsible.CollapsibleTrigger>
      <RadixCollapsible.CollapsibleContent>Nội dung GX-001</RadixCollapsible.CollapsibleContent>
    </RadixCollapsible.Root>
  );
}

/* ── Accordion: cùng một cây, hai nền ───────────────────────────────────── */

interface AccordionCase {
  type: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string;
  disabled?: string[];
  onValueChange?: (...args: never[]) => void;
}

function MineAccordion({
  type,
  collapsible,
  defaultValue,
  disabled = [],
  onValueChange,
}: AccordionCase) {
  const items = LABELS.map((label) => (
    <AccordionItem key={label} value={label} disabled={disabled.includes(label)}>
      <AccordionTrigger>{label}</AccordionTrigger>
      <AccordionContent>Nội dung {label}</AccordionContent>
    </AccordionItem>
  ));

  return type === "single" ? (
    <Accordion
      type="single"
      collapsible={collapsible}
      defaultValue={defaultValue}
      onValueChange={onValueChange as (value: string) => void}
    >
      {items}
    </Accordion>
  ) : (
    <Accordion
      type="multiple"
      defaultValue={defaultValue ? [defaultValue] : undefined}
      onValueChange={onValueChange as (value: string[]) => void}
    >
      {items}
    </Accordion>
  );
}

function RadixAccordionTree({
  type,
  collapsible,
  defaultValue,
  disabled = [],
  onValueChange,
}: AccordionCase) {
  const items = LABELS.map((label) => (
    <RadixAccordion.Item
      key={label}
      value={label}
      disabled={disabled.includes(label)}
      data-slot="accordion-item"
      className="ui-accordion-item"
    >
      <RadixAccordion.Header className="ui-accordion-header">
        <RadixAccordion.Trigger data-slot="accordion-trigger" className="ui-accordion-trigger">
          {label}
        </RadixAccordion.Trigger>
      </RadixAccordion.Header>
      <RadixAccordion.Content data-slot="accordion-content" className="ui-accordion-content">
        <div className="ui-accordion-content-inner">Nội dung {label}</div>
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  ));

  return type === "single" ? (
    <RadixAccordion.Root
      type="single"
      collapsible={collapsible}
      defaultValue={defaultValue}
      onValueChange={onValueChange as (value: string) => void}
    >
      {items}
    </RadixAccordion.Root>
  ) : (
    <RadixAccordion.Root
      type="multiple"
      defaultValue={defaultValue ? [defaultValue] : undefined}
      onValueChange={onValueChange as (value: string[]) => void}
    >
      {items}
    </RadixAccordion.Root>
  );
}

const BOTH = [
  ["godx-ui trên React Aria", MineAccordion, MineCollapsible] as const,
  ["@radix-ui (nền cũ)", RadixAccordionTree, RadixCollapsibleTree] as const,
];

/* ── 1. Móc `data-*` phải trùng từng phần tử ────────────────────────────── */

describe("móc `data-*` — khớp từng phần tử với Radix", () => {
  it("Collapsible đóng", () => {
    const mine = render(<MineCollapsible />);
    const radix = render(<RadixCollapsibleTree />);
    expect(stateHooks(mine.container)).toEqual(stateHooks(radix.container));
  });

  it("Collapsible mở + `disabled` — `data-state` và `data-disabled` phủ cùng những thẻ", () => {
    const mine = render(<MineCollapsible defaultOpen disabled />);
    const radix = render(<RadixCollapsibleTree defaultOpen disabled />);
    expect(stateHooks(mine.container)).toEqual(stateHooks(radix.container));
  });

  it("Accordion — item / header / trigger / content, kèm `data-orientation`", () => {
    const mine = render(
      <MineAccordion type="single" collapsible defaultValue="A" disabled={["B"]} />,
    );
    const radix = render(
      <RadixAccordionTree type="single" collapsible defaultValue="A" disabled={["B"]} />,
    );
    expect(stateHooks(mine.container)).toEqual(stateHooks(radix.container));
  });

  it("chevron vẫn xoay được: `.ui-accordion-trigger[data-state=open]` là selector thật trong src/styles", async () => {
    const user = userEvent.setup();
    const { container, getByRole } = render(<MineAccordion type="single" collapsible />);
    const trigger = getByRole("button", { name: "A" });

    expect(container.querySelector(".ui-accordion-trigger[data-state='closed']")).toBe(trigger);
    await user.click(trigger);
    expect(container.querySelector(".ui-accordion-trigger[data-state='open']")).toBe(trigger);
    expect(trigger.querySelector(".ui-accordion-chevron")).not.toBeNull();
  });
});

/* ── 2. Hành vi: cùng kịch bản, chạy trên cả hai nền ────────────────────── */

describe.each(BOTH)("hành vi — %s", (_label, AccordionTree, CollapsibleTree) => {
  it("Collapsible: chuột mở rồi đóng, và nội dung được THÁO khỏi DOM khi đóng", async () => {
    const user = userEvent.setup();
    const { getByRole, queryByText, getByText } = render(<CollapsibleTree />);
    const trigger = getByRole("button", { name: "Chi tiết" });

    expect(queryByText("Nội dung GX-001")).toBeNull();
    await user.click(trigger);
    expect(getByText("Nội dung GX-001")).toBeInTheDocument();
    await user.click(trigger);
    expect(queryByText("Nội dung GX-001")).toBeNull();
  });

  it("Collapsible: `disabled` chặn cả chuột lẫn bàn phím", async () => {
    const user = userEvent.setup();
    const { getByRole, queryByText } = render(<CollapsibleTree disabled />);
    const trigger = getByRole("button", { name: "Chi tiết" });

    await user.click(trigger);
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(queryByText("Nội dung GX-001")).toBeNull();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("Collapsible: Enter và Space đều đảo trạng thái", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<CollapsibleTree />);
    const trigger = getByRole("button", { name: "Chi tiết" });

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("Collapsible: `aria-controls` trỏ đúng panel khi mở, vắng mặt khi đóng", async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = render(<CollapsibleTree />);
    const trigger = getByRole("button", { name: "Chi tiết" });

    expect(trigger).not.toHaveAttribute("aria-controls");
    await user.click(trigger);

    const controls = trigger.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls as string)).toContainElement(
      getByText("Nội dung GX-001"),
    );
  });

  it('Accordion type="single": mở mục sau thì mục trước đóng lại', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<AccordionTree type="single" collapsible />);
    const a = getByRole("button", { name: "A" });
    const b = getByRole("button", { name: "B" });

    await user.click(a);
    expect(a).toHaveAttribute("aria-expanded", "true");
    await user.click(b);
    expect(a).toHaveAttribute("aria-expanded", "false");
    expect(b).toHaveAttribute("aria-expanded", "true");
  });

  it('Accordion type="single" + collapsible: bấm lại mục đang mở thì nó đóng', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<AccordionTree type="single" collapsible />);
    const a = getByRole("button", { name: "A" });

    await user.click(a);
    await user.click(a);
    expect(a).toHaveAttribute("aria-expanded", "false");
  });

  it('Accordion type="single" KHÔNG collapsible: mục đang mở không tự đóng được', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<AccordionTree type="single" defaultValue="A" />);
    const a = getByRole("button", { name: "A" });
    const b = getByRole("button", { name: "B" });

    await user.click(a);
    expect(a).toHaveAttribute("aria-expanded", "true");

    /* Chỉ một mục KHÁC mới đẩy được nó ra. */
    await user.click(b);
    expect(a).toHaveAttribute("aria-expanded", "false");
    expect(b).toHaveAttribute("aria-expanded", "true");
  });

  it('Accordion type="multiple": các mục mở độc lập', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<AccordionTree type="multiple" />);
    const a = getByRole("button", { name: "A" });
    const b = getByRole("button", { name: "B" });

    await user.click(a);
    await user.click(b);
    expect(a).toHaveAttribute("aria-expanded", "true");
    expect(b).toHaveAttribute("aria-expanded", "true");
  });

  it('Accordion: `onValueChange` trả string ở type="single"', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole } = render(
      <AccordionTree type="single" collapsible onValueChange={onValueChange} />,
    );

    await user.click(getByRole("button", { name: "A" }));
    expect(onValueChange).toHaveBeenCalledWith("A");
    await user.click(getByRole("button", { name: "A" }));
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it('Accordion: `onValueChange` trả string[] ở type="multiple"', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole } = render(<AccordionTree type="multiple" onValueChange={onValueChange} />);

    await user.click(getByRole("button", { name: "A" }));
    expect(onValueChange).toHaveBeenCalledWith(["A"]);
    await user.click(getByRole("button", { name: "B" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["A", "B"]);
  });

  it("Accordion: Enter và Space mở mục đang có tiêu điểm", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<AccordionTree type="single" collapsible />);
    const a = getByRole("button", { name: "A" });

    a.focus();
    await user.keyboard("{Enter}");
    expect(a).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(a).toHaveAttribute("aria-expanded", "false");
  });

  it("Accordion: mũi tên đi vòng qua các trigger và BỎ QUA mục disabled", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<AccordionTree type="single" collapsible disabled={["B"]} />);
    const a = getByRole("button", { name: "A" });
    const c = getByRole("button", { name: "C" });

    a.focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(c);

    /* Từ mục cuối, ArrowDown VÒNG về mục đầu — hành vi của Radix, đo được. */
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(a);

    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(c);

    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(a);

    await user.keyboard("{End}");
    expect(document.activeElement).toBe(c);
  });

  it("Accordion: mục disabled không mở được và trigger của nó bị khoá", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<AccordionTree type="single" collapsible disabled={["B"]} />);
    const b = getByRole("button", { name: "B" });

    expect(b).toBeDisabled();
    await user.click(b);
    expect(b).toHaveAttribute("aria-expanded", "false");
  });

  it("Accordion: panel là `region` được đặt tên bởi chính trigger của nó", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<AccordionTree type="single" collapsible />);
    const a = getByRole("button", { name: "A" });

    await user.click(a);
    const region = getByRole("region", { name: "A" });
    expect(region).toHaveAttribute("aria-labelledby", a.id);
    expect(a).toHaveAttribute("aria-controls", region.id);
  });
});

/* ── 3. Chỗ KHÔNG so được với Radix ─────────────────────────────────────── */

describe("chỗ không so được — khẳng định thẳng", () => {
  it("RAC THÊM `data-expanded` bên cạnh `data-state`; Radix chỉ có `data-state`", async () => {
    const user = userEvent.setup();
    const mine = render(<MineCollapsible />).container;
    const radix = render(<RadixCollapsibleTree />).container;

    await user.click(within(mine).getByRole("button", { name: "Chi tiết" }));
    await user.click(within(radix).getByRole("button", { name: "Chi tiết" }));

    const mineRoot = mine.firstElementChild as HTMLElement;
    const radixRoot = radix.firstElementChild as HTMLElement;

    expect(mineRoot).toHaveAttribute("data-state", "open");
    expect(mineRoot).toHaveAttribute("data-expanded", "true");
    expect(radixRoot).toHaveAttribute("data-state", "open");
    expect(radixRoot).not.toHaveAttribute("data-expanded");
  });

  it("panel của Collapsible được RAC gắn `role=group` + `aria-labelledby`; Radix để trần", () => {
    const mine = render(<MineCollapsible defaultOpen />).container;
    const radix = render(<RadixCollapsibleTree defaultOpen />).container;

    const minePanel = within(mine).getByText("Nội dung GX-001");
    expect(minePanel).toHaveAttribute("role", "group");
    expect(minePanel.getAttribute("aria-labelledby")).toBe(
      within(mine).getByRole("button", { name: "Chi tiết" }).id,
    );

    const radixPanel = within(radix).getByText("Nội dung GX-001");
    expect(radixPanel).not.toHaveAttribute("role");
    expect(radixPanel).not.toHaveAttribute("aria-labelledby");
  });

  it('khi đóng, RAC đặt `hidden="until-found"` thay cho `hidden=""` của Radix', () => {
    const mine = render(<MineCollapsible />).container;
    const radix = render(<RadixCollapsibleTree />).container;

    /* Thẻ panel LUÔN có mặt ở cả hai nền; chỉ con của nó bị tháo. */
    expect(mine.querySelectorAll("div")[1].getAttribute("hidden")).toBe("until-found");
    expect(radix.querySelectorAll("div")[1].getAttribute("hidden")).toBe("");
  });

  it("biến CSS đo chiều cao đổi tên: `--disclosure-panel-height` thay `--radix-collapsible-content-height`", () => {
    const mine = render(<MineCollapsible defaultOpen />).container;
    const panel = within(mine).getByText("Nội dung GX-001");

    /*
     * Không dòng CSS nào trong `src/styles/` đọc biến cũ (đã grep cả kho), nên
     * đây là đổi tên chứ không phải mất hoạt ảnh. Khẳng định ở đây để nếu ai đó
     * viết CSS bám vào biến mới thì có chỗ chỉ ra nó tồn tại.
     */
    expect(panel.style.getPropertyValue("--disclosure-panel-height")).toBe("auto");
  });

  it("`asChild` vẫn chuyển `data-state` xuống thẻ con — CSS của docs bám vào đúng chỗ này", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <button type="button" className="tuỳ-biến">
            Chi tiết
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>Nội dung GX-001</CollapsibleContent>
      </Collapsible>,
    );

    const trigger = getByRole("button", { name: "Chi tiết" });
    expect(trigger).toHaveClass("tuỳ-biến");
    expect(trigger).toHaveAttribute("data-state", "closed");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("data-state", "open");
  });
});

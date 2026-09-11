import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent, waitFor, within } from "@/test/render";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../select";
import {
  RadixSelect,
  RadixSelectContent,
  RadixSelectGroup,
  RadixSelectItem,
  RadixSelectLabel,
  RadixSelectSeparator,
  RadixSelectTrigger,
  RadixSelectValue,
} from "./radix-select.fixture";

/*
 * Phép kiểm SO SÁNH cho lần rời @radix-ui/react-select.
 *
 * Mọi ca dưới đây là một hình dạng ĐO ĐƯỢC ở consumer thật (godx-task 17 tệp, ql 5 tệp, 09/2026):
 *   <Select value onValueChange name defaultValue>  ·  <SelectTrigger id=…> được một
 *   <label htmlFor> / <FormField> trỏ tới  ·  <SelectValue placeholder>  ·  <SelectContent>  ·
 *   <SelectItem value>  ·  <SelectTrigger disabled> (members.tsx)  ·  <SelectValue>{…}</SelectValue>
 *   (pagination) — và ql/tests/Browser đếm `[role="combobox"]`.
 *
 * Mỗi ca chạy trên HAI nền: bản Radix chép nguyên văn (radix-select.fixture.tsx) và bản đang phát
 * hành. Tệp này được viết và chạy xanh TRƯỚC khi đổi nền — lúc đó cả hai đều là Radix — nên sau khi
 * đổi, một ca đỏ nghĩa là consumer ấy vỡ, không phải phép kiểm viết theo cách làm mới.
 */

type Parts = {
  Select: React.ComponentType<Record<string, unknown>>;
  SelectTrigger: React.ComponentType<Record<string, unknown>>;
  SelectValue: React.ComponentType<Record<string, unknown>>;
  SelectContent: React.ComponentType<Record<string, unknown>>;
  SelectItem: React.ComponentType<Record<string, unknown>>;
  SelectGroup: React.ComponentType<Record<string, unknown>>;
  SelectLabel: React.ComponentType<Record<string, unknown>>;
  SelectSeparator: React.ComponentType<Record<string, unknown>>;
};

const cast = (c: unknown) => c as React.ComponentType<Record<string, unknown>>;

const RADIX: Parts = {
  Select: cast(RadixSelect),
  SelectTrigger: cast(RadixSelectTrigger),
  SelectValue: cast(RadixSelectValue),
  SelectContent: cast(RadixSelectContent),
  SelectItem: cast(RadixSelectItem),
  SelectGroup: cast(RadixSelectGroup),
  SelectLabel: cast(RadixSelectLabel),
  SelectSeparator: cast(RadixSelectSeparator),
};

const CURRENT: Parts = {
  Select: cast(Select),
  SelectTrigger: cast(SelectTrigger),
  SelectValue: cast(SelectValue),
  SelectContent: cast(SelectContent),
  SelectItem: cast(SelectItem),
  SelectGroup: cast(SelectGroup),
  SelectLabel: cast(SelectLabel),
  SelectSeparator: cast(SelectSeparator),
};

const PHASES = [
  { value: "plan", label: "計画" },
  { value: "run", label: "実行" },
  { value: "done", label: "完了" },
];

function Items({ P }: { P: Parts }) {
  return (
    <>
      {PHASES.map((phase) => (
        <P.SelectItem key={phase.value} value={phase.value}>
          {phase.label}
        </P.SelectItem>
      ))}
    </>
  );
}

/** godx-task pages/tests/index.tsx — a `<label htmlFor>` naming `<SelectTrigger id>`, controlled. */
function LabelledControlled({
  P,
  onValueChange,
  initial = "plan",
}: {
  P: Parts;
  onValueChange?: (value: string) => void;
  initial?: string;
}) {
  const [phase, setPhase] = React.useState(initial);
  return (
    <>
      <label htmlFor="suite-phase">フェーズ</label>
      <P.Select
        value={phase}
        onValueChange={(value: string) => {
          setPhase(value);
          onValueChange?.(value);
        }}
      >
        <P.SelectTrigger id="suite-phase">
          <P.SelectValue />
        </P.SelectTrigger>
        <P.SelectContent>
          <Items P={P} />
        </P.SelectContent>
      </P.Select>
    </>
  );
}

/** godx-task pages/issues/index.tsx — uncontrolled `name` inside a native `<form>`. */
function NamedInForm({ P, defaultValue }: { P: Parts; defaultValue?: string }) {
  return (
    <form aria-label="batch">
      <label htmlFor="batch-status">状態</label>
      <P.Select name="status" defaultValue={defaultValue}>
        <P.SelectTrigger id="batch-status">
          <P.SelectValue placeholder="—" />
        </P.SelectTrigger>
        <P.SelectContent>
          <Items P={P} />
        </P.SelectContent>
      </P.Select>
    </form>
  );
}

const submitted = (name: string) =>
  new FormData(screen.getByRole("form", { name: "batch" }) as HTMLFormElement).getAll(name);

describe.each([
  ["Radix (before)", RADIX],
  ["current", CURRENT],
] as const)("Select consumer patterns — %s", (_, P) => {
  it("a <label htmlFor> names the trigger that carries the id", () => {
    renderWithUi(<LabelledControlled P={P} />);
    const trigger = screen.getByRole("combobox", { name: "フェーズ" });
    expect(trigger).toHaveAttribute("id", "suite-phase");
    expect(screen.getByLabelText("フェーズ")).toBe(trigger);
    // The value is what the trigger SHOWS, not part of its name.
    expect(trigger).toHaveTextContent("計画");
  });

  it("controlled: picking reports the value and the trigger follows the parent", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<LabelledControlled P={P} onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox", { name: "フェーズ" });

    await user.click(trigger);
    await user.click(await screen.findByRole("option", { name: "実行" }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("run");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent("実行");
    expect(trigger).toHaveAttribute("data-value", "run");
  });

  it("controlled without a state update: the trigger keeps showing the prop", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <P.Select value="plan" onValueChange={onValueChange}>
        <P.SelectTrigger aria-label="固定">
          <P.SelectValue />
        </P.SelectTrigger>
        <P.SelectContent>
          <Items P={P} />
        </P.SelectContent>
      </P.Select>,
    );
    const trigger = screen.getByRole("combobox", { name: "固定" });
    await user.click(trigger);
    await user.click(await screen.findByRole("option", { name: "完了" }));
    expect(onValueChange).toHaveBeenCalledWith("done");
    expect(trigger).toHaveTextContent("計画");
  });

  it("uncontrolled `name` submits the default, then the pick", async () => {
    const user = userEvent.setup();
    renderWithUi(<NamedInForm P={P} defaultValue="run" />);
    expect(submitted("status")).toEqual(["run"]);

    const trigger = screen.getByRole("combobox", { name: "状態" });
    expect(trigger).toHaveTextContent("実行");
    expect(trigger).toHaveAttribute("data-value", "run");

    await user.click(trigger);
    await user.click(await screen.findByRole("option", { name: "完了" }));
    expect(submitted("status")).toEqual(["done"]);
    expect(trigger).toHaveTextContent("完了");
    expect(trigger).toHaveAttribute("data-value", "done");
  });

  it('`defaultValue=""` shows the placeholder and submits an empty value', () => {
    renderWithUi(<NamedInForm P={P} defaultValue="" />);
    const trigger = screen.getByRole("combobox", { name: "状態" });
    expect(trigger).toHaveTextContent("—");
    expect(trigger).toHaveAttribute("data-placeholder");
    expect(trigger).not.toHaveAttribute("data-value");
    expect(submitted("status")).toEqual([""]);
  });

  it("no value at all: placeholder, and the field still submits exactly once", () => {
    renderWithUi(<NamedInForm P={P} />);
    const trigger = screen.getByRole("combobox", { name: "状態" });
    expect(trigger).toHaveTextContent("—");
    expect(trigger).toHaveAttribute("data-placeholder");
    expect(submitted("status")).toEqual([""]);
  });

  it("keyboard: ArrowDown opens, ArrowDown moves, Enter picks, focus returns to the trigger", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <P.Select onValueChange={onValueChange}>
        <P.SelectTrigger aria-label="鍵盤">
          <P.SelectValue placeholder="選択" />
        </P.SelectTrigger>
        <P.SelectContent>
          <Items P={P} />
        </P.SelectContent>
      </P.Select>,
    );
    const trigger = screen.getByRole("combobox", { name: "鍵盤" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("run");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("Escape closes without picking", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <P.Select defaultValue="plan" onValueChange={onValueChange}>
        <P.SelectTrigger aria-label="取消">
          <P.SelectValue />
        </P.SelectTrigger>
        <P.SelectContent>
          <Items P={P} />
        </P.SelectContent>
      </P.Select>,
    );
    const trigger = screen.getByRole("combobox", { name: "取消" });
    await user.click(trigger);
    await screen.findByRole("listbox");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveTextContent("計画");
    // Opened with the MOUSE, closed with Escape: focus still comes back to the trigger.
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("`disabled` on the TRIGGER (members.tsx) makes the control inert", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <>
        <label htmlFor="add-member">メンバー</label>
        <P.Select value="" onValueChange={() => undefined}>
          <P.SelectTrigger id="add-member" disabled>
            <P.SelectValue placeholder="候補なし" />
          </P.SelectTrigger>
          <P.SelectContent>
            <Items P={P} />
          </P.SelectContent>
        </P.Select>
      </>,
    );
    const trigger = screen.getByRole("combobox", { name: "メンバー" });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("`disabled` on the ROOT disables the trigger", () => {
    renderWithUi(
      <P.Select disabled defaultValue="plan">
        <P.SelectTrigger aria-label="無効">
          <P.SelectValue />
        </P.SelectTrigger>
        <P.SelectContent>
          <Items P={P} />
        </P.SelectContent>
      </P.Select>,
    );
    expect(screen.getByRole("combobox", { name: "無効" })).toBeDisabled();
  });

  it("root `required` blocks a native submit while empty (the trigger's aria-* comes from FormField)", () => {
    renderWithUi(
      <form aria-label="batch">
        <P.Select name="status" required>
          <P.SelectTrigger aria-label="必須">
            <P.SelectValue placeholder="—" />
          </P.SelectTrigger>
          <P.SelectContent>
            <Items P={P} />
          </P.SelectContent>
        </P.Select>
      </form>,
    );
    // Measured on the Radix base: the ROOT's `required` reaches the native <select> only, never
    // the trigger. `aria-required` on the trigger is FormField's job (select-field-a11y.test.tsx).
    expect(screen.getByRole("combobox", { name: "必須" })).not.toHaveAttribute("aria-required");
    expect((screen.getByRole("form", { name: "batch" }) as HTMLFormElement).checkValidity()).toBe(
      false,
    );
  });

  it("`<SelectValue>{children}</SelectValue>` (Pagination) shows the children, not the label", () => {
    renderWithUi(
      <P.Select value="run" onValueChange={() => undefined}>
        <P.SelectTrigger aria-label="件数">
          <P.SelectValue>20 件/ページ</P.SelectValue>
        </P.SelectTrigger>
        <P.SelectContent>
          <Items P={P} />
        </P.SelectContent>
      </P.Select>,
    );
    const trigger = screen.getByRole("combobox", { name: "件数" });
    expect(trigger).toHaveTextContent("20 件/ページ");
    expect(trigger).not.toHaveTextContent("実行");
  });

  it("groups, labels and separators reach the listbox as named groups", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <P.Select defaultValue="tokyo">
        <P.SelectTrigger aria-label="拠点">
          <P.SelectValue />
        </P.SelectTrigger>
        <P.SelectContent>
          <P.SelectGroup>
            <P.SelectLabel>日本</P.SelectLabel>
            <P.SelectItem value="tokyo">東京</P.SelectItem>
            <P.SelectItem value="osaka">大阪</P.SelectItem>
          </P.SelectGroup>
          <P.SelectSeparator />
          <P.SelectGroup>
            <P.SelectLabel>Việt Nam</P.SelectLabel>
            <P.SelectItem value="hcm">Hồ Chí Minh</P.SelectItem>
            <P.SelectItem value="hn" disabled>
              Hà Nội
            </P.SelectItem>
          </P.SelectGroup>
        </P.SelectContent>
      </P.Select>,
    );
    await user.click(screen.getByRole("combobox", { name: "拠点" }));
    const listbox = await screen.findByRole("listbox");
    const japan = within(listbox).getByRole("group", { name: "日本" });
    expect(within(japan).getAllByRole("option").map((o) => o.textContent)).toEqual([
      "東京",
      "大阪",
    ]);
    const vietnam = within(listbox).getByRole("group", { name: "Việt Nam" });
    expect(within(vietnam).getByRole("option", { name: "Hà Nội" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(within(listbox).getByRole("option", { name: "東京" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(listbox.querySelector('[data-slot="select-separator"]')).not.toBeNull();
  });

  it("ql GinoTraineeRegistrationTest: a hand-built pointer chain on the first option of the panel named by aria-controls picks it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <form>
        <label htmlFor="gender">性別</label>
        <P.Select name="gender" onValueChange={onValueChange}>
          <P.SelectTrigger id="gender">
            <P.SelectValue placeholder="—" />
          </P.SelectTrigger>
          <P.SelectContent>
            <Items P={P} />
          </P.SelectContent>
        </P.Select>
      </form>,
    );
    // `$page->click("#gender")`, then the script ql runs verbatim.
    await user.click(screen.getByRole("combobox", { name: "性別" }));
    await screen.findByRole("listbox");
    const trigger = document.getElementById("gender")!;
    const panelId = trigger.getAttribute("aria-controls");
    const panel = panelId === null ? null : document.getElementById(panelId);
    const item = (panel ?? document).querySelector('[role="option"], [data-slot="select-item"]')!;
    const PointerCtor = window.PointerEvent ?? window.MouseEvent;
    for (const type of ["pointerover", "pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
      item.dispatchEvent(new PointerCtor(type, { bubbles: true, cancelable: true }));
    }
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("plan"));
  });

  it("controlled `open` + `onOpenChange` on the root", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = renderWithUi(
      <P.Select open={false} onOpenChange={onOpenChange} defaultValue="plan">
        <P.SelectTrigger aria-label="開閉">
          <P.SelectValue />
        </P.SelectTrigger>
        <P.SelectContent>
          <Items P={P} />
        </P.SelectContent>
      </P.Select>,
    );
    await user.click(screen.getByRole("combobox", { name: "開閉" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    rerender(
      <P.Select open onOpenChange={onOpenChange} defaultValue="plan">
        <P.SelectTrigger aria-label="開閉">
          <P.SelectValue />
        </P.SelectTrigger>
        <P.SelectContent>
          <Items P={P} />
        </P.SelectContent>
      </P.Select>,
    );
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
  });
});

/**
 * The attributes on the trigger that CSS, automation and assistive tech read — rendered by both
 * bases side by side and required to match. Ids are deliberately excluded where the base
 * generates them; everything a consumer can observe by name is included.
 */
const TRIGGER_CONTRACT = [
  "role",
  "type",
  "id",
  "aria-expanded",
  "aria-required",
  "aria-invalid",
  "aria-label",
  "aria-describedby",
  "aria-errormessage",
  "aria-autocomplete",
  "disabled",
  "data-state",
  "data-placeholder",
  "data-slot",
  "data-size",
  "data-variant",
  "data-status",
  "data-width",
  "data-value",
  "data-field",
] as const;

function triggerContract(trigger: HTMLElement) {
  return Object.fromEntries(TRIGGER_CONTRACT.map((name) => [name, trigger.getAttribute(name)]));
}

function renderBoth(build: (P: Parts) => React.ReactElement, name: string) {
  const radix = renderWithUi(<div data-testid="radix">{build(RADIX)}</div>);
  const radixTrigger = within(radix.getByTestId("radix")).getByRole("combobox", { name });
  const radixContract = triggerContract(radixTrigger);
  const radixText = radixTrigger.textContent;
  radix.unmount();
  const current = renderWithUi(<div data-testid="current">{build(CURRENT)}</div>);
  const currentTrigger = within(current.getByTestId("current")).getByRole("combobox", { name });
  return {
    radix: { contract: radixContract, text: radixText },
    current: { contract: triggerContract(currentTrigger), text: currentTrigger.textContent },
  };
}

describe("Select — the trigger contract matches the Radix base attribute for attribute", () => {
  it.each([
    [
      "labelled by id, with a value",
      (P: Parts) => (
        <>
          <label htmlFor="cmp-a">比較</label>
          <P.Select defaultValue="run">
            <P.SelectTrigger id="cmp-a">
              <P.SelectValue />
            </P.SelectTrigger>
            <P.SelectContent>
              <Items P={P} />
            </P.SelectContent>
          </P.Select>
        </>
      ),
    ],
    [
      "placeholder, sm, auto width, error status",
      (P: Parts) => (
        <P.Select>
          <P.SelectTrigger aria-label="比較" size="sm" width="auto" status="error">
            <P.SelectValue placeholder="—" />
          </P.SelectTrigger>
          <P.SelectContent>
            <Items P={P} />
          </P.SelectContent>
        </P.Select>
      ),
    ],
    [
      "required + disabled + filled",
      (P: Parts) => (
        <P.Select required disabled defaultValue="plan">
          <P.SelectTrigger aria-label="比較" variant="filled">
            <P.SelectValue />
          </P.SelectTrigger>
          <P.SelectContent>
            <Items P={P} />
          </P.SelectContent>
        </P.Select>
      ),
    ],
  ])("%s", (_, build) => {
    const { radix, current } = renderBoth(build, "比較");
    // An id the CONSUMER passed must match exactly (case 1). With none, Radix emitted no id and
    // react-aria emits a generated one (`react-aria-…`) that nothing can reference by name — the
    // exclusion the note above promises, and nothing wider.
    if (radix.contract.id === null) {
      expect(current.contract.id ?? "react-aria-").toMatch(/^react-aria-/);
      delete (radix.contract as Record<string, unknown>).id;
      delete (current.contract as Record<string, unknown>).id;
    }
    expect(current.contract).toEqual(radix.contract);
    expect(current.text).toBe(radix.text);
  });
});

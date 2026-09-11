import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";

import { renderWithUi, screen, userEvent, within } from "@/test/render";
import { Select } from "../select";
import type { SearchSelectOptionProp } from "../../../props/components/data-entry.prop";

/*
 * antd `Select` parity, the shape-of-the-data half: `options` as nested groups, `fieldNames` over
 * a foreign payload, and the trigger/popup slots (`prefix`, `suffixIcon`, `placement`,
 * `popupRender`, `listHeight`, `onPopupScroll`, `labelRender`).
 *
 * Both branches of the one component are exercised: the plain listbox and — where the prop means
 * anything there — the searchable panel, because "one Select" is only true if a prop does the same
 * thing on both sides.
 */

const NESTED = [
  {
    label: "アジア",
    options: [
      { value: "jp", label: "日本" },
      { value: "vn", label: "ベトナム" },
    ],
  },
  {
    label: "ヨーロッパ",
    options: [{ value: "fr", label: "フランス" }],
  },
  { value: "other", label: "その他" },
];

/** A server payload in ITS OWN shape — the case `fieldNames` exists for. */
const FOREIGN = [
  {
    name: "営業本部",
    children: [
      { id: "11", name: "東京営業所" },
      { id: "12", name: "大阪営業所", locked: true },
    ],
  },
  { id: "20", name: "管理部" },
];

const asOptions = (rows: unknown) => rows as SearchSelectOptionProp[];

describe("antd `options` — nested groups", () => {
  it("renders a group heading per nested entry, plus the ungrouped rows", async () => {
    const user = userEvent.setup();
    renderWithUi(<Select aria-label="国" options={NESTED} placeholder="選択" />);
    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");

    const asia = within(listbox).getByRole("group", { name: "アジア" });
    expect(
      within(asia)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["日本", "ベトナム"]);
    expect(within(listbox).getByRole("group", { name: "ヨーロッパ" })).toBeInTheDocument();
    // An entry with no `options` key is a plain row, not a group.
    expect(within(listbox).getByRole("option", { name: "その他" })).toBeInTheDocument();
  });

  it("picks from a nested group and reports the flat value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select aria-label="国" options={NESTED} placeholder="選択" onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "ベトナム" }));
    expect(onValueChange).toHaveBeenCalledWith("vn", expect.objectContaining({ value: "vn" }));
  });
});

describe("antd `fieldNames`", () => {
  it("reads value, label, nested options and disabled off a foreign payload", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        aria-label="部署"
        placeholder="選択"
        options={asOptions(FOREIGN)}
        fieldNames={{ value: "id", label: "name", options: "children", disabled: "locked" }}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    const group = within(listbox).getByRole("group", { name: "営業本部" });
    expect(within(group).getByRole("option", { name: "東京営業所" })).toBeInTheDocument();
    expect(within(group).getByRole("option", { name: "大阪営業所" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(within(listbox).getByRole("option", { name: "管理部" })).toBeInTheDocument();
  });

  it("submits the mapped value, not the foreign key name", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <form aria-label="f">
        <Select
          aria-label="部署"
          name="department"
          placeholder="選択"
          options={asOptions(FOREIGN)}
          fieldNames={{ value: "id", label: "name", options: "children" }}
        />
      </form>,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "管理部" }));
    const form = screen.getByRole("form", { name: "f" }) as HTMLFormElement;
    expect(new FormData(form).get("department")).toBe("20");
  });

  it("works the same on the searchable branch", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        aria-label="部署"
        showSearch
        placeholder="選択"
        options={asOptions(FOREIGN)}
        fieldNames={{ value: "id", label: "name", options: "children" }}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("option", { name: /東京営業所/ })).toBeInTheDocument();
  });
});

const OPTIONS = [
  { value: "jpy", label: "日本円" },
  { value: "vnd", label: "ベトナムドン" },
];

describe("antd `prefix` / `suffixIcon`", () => {
  it("puts the prefix on the trigger and keeps the chevron", () => {
    renderWithUi(
      <Select aria-label="通貨" options={OPTIONS} defaultValue="jpy" prefix={<span>¥</span>} />,
    );
    const trigger = screen.getByRole("combobox");
    expect(within(trigger).getByText("¥")).toBeInTheDocument();
    expect(trigger.querySelector('[data-slot="select-prefix"]')).not.toBeNull();
    expect(trigger.querySelector('[data-slot="select-chevron"]')).not.toBeNull();
  });

  it("replaces the chevron with `suffixIcon`, and `null` removes the indicator entirely", () => {
    const { rerender } = renderWithUi(
      <Select
        aria-label="通貨"
        options={OPTIONS}
        defaultValue="jpy"
        suffixIcon={<span data-testid="own-icon">▾</span>}
      />,
    );
    let trigger = screen.getByRole("combobox");
    expect(within(trigger).getByTestId("own-icon")).toBeInTheDocument();
    expect(trigger.querySelector('[data-slot="select-chevron"]')).toBeNull();

    rerender(<Select aria-label="通貨" options={OPTIONS} defaultValue="jpy" suffixIcon={null} />);
    trigger = screen.getByRole("combobox");
    expect(trigger.querySelector('[data-slot="select-chevron"]')).toBeNull();
    expect(trigger.querySelector('[data-slot="select-suffix"]')).toBeNull();
  });

  it("carries both onto the searchable trigger too", () => {
    // `clearable={false}`: with a value selected the clear ✕ owns the affix seat, which is antd's
    // behaviour too (allowClear replaces the suffix icon while there is something to clear).
    renderWithUi(
      <Select
        aria-label="通貨"
        showSearch
        options={OPTIONS}
        defaultValue="jpy"
        clearable={false}
        prefix={<span>¥</span>}
        suffixIcon={<span data-testid="own-icon">▾</span>}
      />,
    );
    expect(screen.getByText("¥")).toBeInTheDocument();
    expect(screen.getByTestId("own-icon")).toBeInTheDocument();
  });
});

describe("antd `popupRender` / `listHeight` / `onPopupScroll`", () => {
  it("popupRender wraps the list and keeps every option in it", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        aria-label="通貨"
        options={OPTIONS}
        popupRender={(originNode) => (
          <div data-testid="wrapper">
            {originNode}
            <footer>新しい通貨を追加</footer>
          </div>
        )}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    const wrapper = await screen.findByTestId("wrapper");
    expect(within(wrapper).getByRole("listbox")).toBeInTheDocument();
    expect(within(wrapper).getByRole("option", { name: "日本円" })).toBeInTheDocument();
    expect(within(wrapper).getByText("新しい通貨を追加")).toBeInTheDocument();
  });

  it("listHeight overrides the height token on that popup only", async () => {
    const user = userEvent.setup();
    renderWithUi(<Select aria-label="通貨" options={OPTIONS} listHeight={240} />);
    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    const popup = document.querySelector<HTMLElement>('[data-slot="select-content"]');
    expect(popup?.style.getPropertyValue("--select-content-max-height")).toBe("240px");
  });

  it("onPopupScroll fires on the option list's own scroll", async () => {
    const user = userEvent.setup();
    const onPopupScroll = vi.fn();
    renderWithUi(<Select aria-label="通貨" options={OPTIONS} onPopupScroll={onPopupScroll} />);
    await user.click(screen.getByRole("combobox"));
    fireEvent.scroll(await screen.findByRole("listbox"));
    expect(onPopupScroll).toHaveBeenCalled();
  });

  it("onPopupScroll runs BESIDE the searchable panel's own infinite scroll, not instead of it", async () => {
    const user = userEvent.setup();
    const onPopupScroll = vi.fn();
    const loadOptions = vi.fn(async ({ page }: { query: string; page: number }) => ({
      options: page === 1 ? [OPTIONS[0]] : [OPTIONS[1]],
      hasMore: page === 1,
    }));
    renderWithUi(
      <Select aria-label="通貨" loadOptions={loadOptions} onPopupScroll={onPopupScroll} />,
    );
    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("option", { name: /日本円/ });
    const list = screen.getByRole("listbox");
    fireEvent.scroll(list);
    expect(onPopupScroll).toHaveBeenCalled();
  });
});

describe("antd `placement`", () => {
  it.each([
    ["bottomStart", "bottom"],
    ["bottomEnd", "bottom"],
    ["topStart", "top"],
    ["topEnd", "top"],
  ] as const)("%s opens on the %s side", async (placement, side) => {
    const user = userEvent.setup();
    renderWithUi(<Select aria-label="通貨" options={OPTIONS} placement={placement} />);
    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    const popup = document.querySelector<HTMLElement>('[data-slot="select-content"]');
    expect(popup?.getAttribute("data-side")).toBe(side);
  });
});

describe("antd `labelRender` on the plain listbox", () => {
  it("renders the custom label for an UNCONTROLLED pick, not just a controlled value", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        aria-label="通貨"
        options={OPTIONS}
        defaultValue="jpy"
        labelRender={({ value, label }) => (
          <span data-testid="own-label">
            {label}（{value}）
          </span>
        )}
      />,
    );
    expect(screen.getByTestId("own-label")).toHaveTextContent("日本円（jpy）");

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "ベトナムドン" }));
    expect(screen.getByTestId("own-label")).toHaveTextContent("ベトナムドン（vnd）");
  });

  it("falls back to the placeholder while nothing is selected", () => {
    renderWithUi(
      <Select
        aria-label="通貨"
        options={OPTIONS}
        placeholder="通貨を選択"
        labelRender={() => <span data-testid="own-label">x</span>}
      />,
    );
    expect(screen.queryByTestId("own-label")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("通貨を選択");
  });
});

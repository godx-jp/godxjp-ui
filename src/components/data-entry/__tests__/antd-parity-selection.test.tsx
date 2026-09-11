/**
 * antd 6.6.2 parity gates for the selection family — Select, SearchSelect (through Select's
 * `showSearch`), Cascader, TreeSelect and TagInput.
 *
 * Every case here asserts the BEHAVIOUR a consuming app is blocked without, not the presence of a
 * prop: a prop that is accepted and ignored is exactly the failure mode this file exists to catch.
 * Each `it` was mutation-tested by reverting its implementation and confirming it goes red.
 */
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import { renderWithUi, screen, userEvent, waitFor, within } from "@/test/render";

import { Select } from "../select";
import { Cascader } from "../cascader";
import { TreeSelect } from "../tree-select";
import { TagInput } from "../tag-input";

const OPTIONS = [
  { value: "jpy", label: "日本円" },
  { value: "vnd", label: "ドン" },
  { value: "usd", label: "米ドル" },
];

const TREE = [
  {
    value: "tokyo",
    label: "東京",
    children: [
      { value: "shibuya", label: "渋谷" },
      { value: "shinjuku", label: "新宿" },
    ],
  },
  { value: "osaka", label: "大阪", children: [{ value: "kita", label: "北区" }] },
];

describe("antd parity — surface: status / variant / size", () => {
  it("Select status='error' recolours AND announces, status='warning' recolours only", () => {
    const { rerender } = renderWithUi(
      <Select options={OPTIONS} placeholder="通貨" status="error" aria-label="通貨" />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("data-status", "error");
    // A colour-only error would fail WCAG 2.2 SC 1.4.1 — `error` must reach assistive tech too.
    expect(trigger).toHaveAttribute("aria-invalid", "true");

    rerender(<Select options={OPTIONS} placeholder="通貨" status="warning" aria-label="通貨" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("data-status", "warning");
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-invalid", "true");
  });

  it("a FormField-injected aria-invalid outranks status — the field's verdict wins", () => {
    renderWithUi(
      <Select
        options={OPTIONS}
        placeholder="通貨"
        aria-label="通貨"
        aria-invalid={false}
        status="error"
      />,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "false");
  });

  it.each([
    ["filled", "filled"],
    ["borderless", "borderless"],
  ] as const)("Select variant=%s reaches the DOM as data-variant", (variant, expected) => {
    renderWithUi(
      <Select options={OPTIONS} placeholder="通貨" aria-label="通貨" variant={variant} />,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("data-variant", expected);
  });

  it("variant='outlined' is the default and emits NO attribute — the DOM is unchanged", () => {
    renderWithUi(
      <Select options={OPTIONS} placeholder="通貨" aria-label="通貨" variant="outlined" />,
    );
    expect(screen.getByRole("combobox")).not.toHaveAttribute("data-variant");
  });

  it("the select-family trigger carries the surface class the matrix keys on", () => {
    renderWithUi(
      <Select options={OPTIONS} placeholder="通貨" aria-label="通貨" variant="filled" />,
    );
    // The other half of this contract — that the trigger no longer emits the `border-input` /
    // `bg-background` UTILITIES that would outrank every [data-variant] rule — is asserted on the
    // class constants themselves in src/lib/__tests__/control-styles.test.ts, where it belongs:
    // it is a statement about the stylesheet, not about what this component renders.
    expect(screen.getByRole("combobox").className).toContain("ui-control-surface");
  });

  it("Cascader / TreeSelect / TagInput take size, status and variant too", () => {
    renderWithUi(
      <>
        <Cascader options={TREE} aria-label="地域" size="sm" status="warning" variant="filled" />
        <TreeSelect treeData={TREE} aria-label="組織" size="lg" status="error" />
        <TagInput aria-label="タグ" size="xs" status="error" variant="borderless" />
      </>,
    );
    const [cascader, tree] = screen.getAllByRole("combobox");
    expect(cascader).toHaveAttribute("data-size", "sm");
    expect(cascader).toHaveAttribute("data-status", "warning");
    expect(cascader).toHaveAttribute("data-variant", "filled");
    expect(tree).toHaveAttribute("data-size", "lg");
    expect(tree).toHaveAttribute("aria-invalid", "true");

    const tagInput = document.querySelector('[data-slot="tag-input"]');
    expect(tagInput).toHaveAttribute("data-size", "xs");
    expect(tagInput).toHaveAttribute("data-variant", "borderless");
    expect(tagInput).toHaveAttribute("aria-invalid", "true");
  });

  it("size reaches the plain (no-search) Select trigger — it used to stop at SearchSelect", () => {
    renderWithUi(<Select options={OPTIONS} placeholder="通貨" aria-label="通貨" size="sm" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "sm");
  });

  // Every rung of `SizeProp`, exhaustively: `xs` in particular had a token
  // (`--control-height-xs`) that no rule read, so it silently rendered at `md`.
  it.each(["xs", "sm", "md", "lg"] as const)(
    "SelectTrigger accepts size=%s and publishes it",
    (size) => {
      renderWithUi(<Select options={OPTIONS} placeholder="通貨" aria-label="通貨" size={size} />);
      expect(screen.getByRole("combobox")).toHaveAttribute("data-size", size);
    },
  );

  it.each(["outlined", "filled", "borderless"] as const)(
    "SelectTrigger accepts variant=%s",
    (variant) => {
      renderWithUi(
        <Select options={OPTIONS} placeholder="通貨" aria-label="通貨" variant={variant} />,
      );
      const trigger = screen.getByRole("combobox");
      // `outlined` is the default and deliberately emits nothing — the DOM of every existing
      // call site has to stay byte-identical.
      if (variant === "outlined") expect(trigger).not.toHaveAttribute("data-variant");
      else expect(trigger).toHaveAttribute("data-variant", variant);
    },
  );

  it.each(["xs", "sm", "md", "lg"] as const)("TagInput accepts size=%s", (size) => {
    renderWithUi(<TagInput aria-label="タグ" size={size} />);
    const field = document.querySelector('[data-slot="tag-input"]');
    if (size === "md") expect(field).not.toHaveAttribute("data-size");
    else expect(field).toHaveAttribute("data-size", size);
  });

  it.each(["outlined", "filled", "borderless"] as const)(
    "TagInput accepts variant=%s",
    (variant) => {
      renderWithUi(<TagInput aria-label="タグ" variant={variant} />);
      const field = document.querySelector('[data-slot="tag-input"]');
      if (variant === "outlined") expect(field).not.toHaveAttribute("data-variant");
      else expect(field).toHaveAttribute("data-variant", variant);
    },
  );

  // Cascader and TreeSelect wear the same matrix, and it is worth walking every branch of it on
  // each of them: the three components reach the surface through three different triggers, so
  // "it works on Select" is not evidence that it works here.
  it.each(["xs", "sm", "md", "lg"] as const)("Cascader accepts size=%s", (size) => {
    renderWithUi(<Cascader options={TREE} aria-label="地域" size={size} />);
    const trigger = screen.getByRole("combobox");
    if (size === "md") expect(trigger).not.toHaveAttribute("data-size");
    else expect(trigger).toHaveAttribute("data-size", size);
  });

  it.each(["outlined", "filled", "borderless"] as const)(
    "Cascader accepts variant=%s",
    (variant) => {
      renderWithUi(<Cascader options={TREE} aria-label="地域" variant={variant} />);
      const trigger = screen.getByRole("combobox");
      if (variant === "outlined") expect(trigger).not.toHaveAttribute("data-variant");
      else expect(trigger).toHaveAttribute("data-variant", variant);
    },
  );

  it.each(["warning", "error"] as const)("Cascader accepts status=%s", (status) => {
    renderWithUi(<Cascader options={TREE} aria-label="地域" status={status} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("data-status", status);
    if (status === "error") expect(trigger).toHaveAttribute("aria-invalid", "true");
    else expect(trigger).not.toHaveAttribute("aria-invalid");
  });

  it.each(["xs", "sm", "md", "lg"] as const)("TreeSelect accepts size=%s", (size) => {
    renderWithUi(<TreeSelect treeData={TREE} aria-label="組織" size={size} />);
    const trigger = screen.getByRole("combobox");
    if (size === "md") expect(trigger).not.toHaveAttribute("data-size");
    else expect(trigger).toHaveAttribute("data-size", size);
  });

  it.each(["outlined", "filled", "borderless"] as const)(
    "TreeSelect accepts variant=%s",
    (variant) => {
      renderWithUi(<TreeSelect treeData={TREE} aria-label="組織" variant={variant} />);
      const trigger = screen.getByRole("combobox");
      if (variant === "outlined") expect(trigger).not.toHaveAttribute("data-variant");
      else expect(trigger).toHaveAttribute("data-variant", variant);
    },
  );

  it.each(["warning", "error"] as const)("TreeSelect accepts status=%s", (status) => {
    renderWithUi(<TreeSelect treeData={TREE} aria-label="組織" status={status} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("data-status", status);
    if (status === "error") expect(trigger).toHaveAttribute("aria-invalid", "true");
    else expect(trigger).not.toHaveAttribute("aria-invalid");
  });

  it.each(["warning", "error"] as const)("TagInput accepts status=%s", (status) => {
    renderWithUi(<TagInput aria-label="タグ" status={status} />);
    const field = document.querySelector('[data-slot="tag-input"]');
    expect(field).toHaveAttribute("data-status", status);
    // Only `error` is a claim assistive tech must hear; `warning` is advisory.
    if (status === "error") expect(field).toHaveAttribute("aria-invalid", "true");
    else expect(field).not.toHaveAttribute("aria-invalid");
  });
});

describe("antd parity — open / defaultOpen / onOpenChange", () => {
  it("a plain Select honours `open` (it used to render a permanently shut listbox)", () => {
    renderWithUi(<Select options={OPTIONS} placeholder="通貨" aria-label="通貨" open />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "日本円" })).toBeInTheDocument();
  });

  it("a plain Select reports open changes through onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(
      <Select options={OPTIONS} placeholder="通貨" aria-label="通貨" onOpenChange={onOpenChange} />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("Cascader opens from defaultOpen and reports onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(
      <Cascader options={TREE} aria-label="地域" defaultOpen onOpenChange={onOpenChange} />,
    );
    expect(screen.getByText("東京")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("a controlled Cascader stays open when the consumer says so", async () => {
    const user = userEvent.setup();
    renderWithUi(<Cascader options={TREE} aria-label="地域" open onOpenChange={() => {}} />);
    await user.keyboard("{Escape}");
    // `open` is the authority; nothing internal may close it behind the consumer's back.
    expect(screen.getByText("東京")).toBeInTheDocument();
  });

  it("TreeSelect opens from defaultOpen and reports onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(
      <TreeSelect treeData={TREE} aria-label="組織" defaultOpen onOpenChange={onOpenChange} />,
    );
    expect(screen.getByRole("tree")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("antd parity — loading", () => {
  it("Select loading swaps the affix for a spinner and reports aria-busy", () => {
    renderWithUi(<Select options={OPTIONS} placeholder="通貨" aria-label="通貨" loading />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-busy", "true");
    expect(document.querySelector('[data-slot="select-loading"]')).toBeInTheDocument();
  });

  it("Cascader and TreeSelect report loading the same way", () => {
    renderWithUi(
      <>
        <Cascader options={TREE} aria-label="地域" loading />
        <TreeSelect treeData={TREE} aria-label="組織" loading />
      </>,
    );
    for (const trigger of screen.getAllByRole("combobox")) {
      expect(trigger).toHaveAttribute("aria-busy", "true");
    }
    expect(document.querySelector('[data-slot="cascader-loading"]')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="tree-select-loading"]')).toBeInTheDocument();
  });

  it("a loading Select hides the clear ✕ — one affix, one meaning", () => {
    renderWithUi(
      <Select
        options={OPTIONS}
        value="jpy"
        onValueChange={() => {}}
        aria-label="通貨"
        data-testid="cur"
        loading
      />,
    );
    expect(screen.queryByTestId("cur-clear")).not.toBeInTheDocument();
  });
});

describe("antd parity — allowClear object form, onClear", () => {
  it("allowClear={{ label }} renames the clear control and onClear fires after it", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    renderWithUi(
      <Select
        options={OPTIONS}
        value="jpy"
        onValueChange={() => {}}
        aria-label="通貨"
        allowClear={{ label: "通貨をリセット" }}
        onClear={onClear}
      />,
    );
    const clear = screen.getByRole("button", { name: "通貨をリセット" });
    await user.click(clear);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("allowClear={false} beats clearable — the more specific statement wins", () => {
    renderWithUi(
      <Select
        options={OPTIONS}
        value="jpy"
        onValueChange={() => {}}
        aria-label="通貨"
        data-testid="cur"
        clearable
        allowClear={false}
      />,
    );
    expect(screen.queryByTestId("cur-clear")).not.toBeInTheDocument();
  });

  it("Cascader allowClear={{ label }} renames its clear control", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Cascader
        options={TREE}
        aria-label="地域"
        value={["tokyo", "shibuya"]}
        onValueChange={() => {}}
        allowClear={{ label: "地域をリセット" }}
      />,
    );
    expect(screen.getByRole("button", { name: "地域をリセット" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "地域をリセット" }));
  });

  it("TreeSelect allowClear={false} removes the clear control entirely", () => {
    renderWithUi(
      <TreeSelect
        treeData={TREE}
        aria-label="組織"
        value={["shibuya"]}
        onValueChange={() => {}}
        allowClear={false}
      />,
    );
    expect(screen.queryByRole("button", { name: /Xóa lựa chọn/ })).toBeNull();
  });
});

describe("antd parity — notFoundContent", () => {
  it("a searchable Select shows notFoundContent instead of the default empty text", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        options={OPTIONS}
        showSearch
        aria-label="通貨"
        notFoundContent={<span>該当する通貨はありません</span>}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    vi.useFakeTimers();
    try {
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "zzz" } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });
      expect(screen.getByText("該当する通貨はありません")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("a plain Select with no options keeps its popup operable when notFoundContent is given", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select options={[]} aria-label="通貨" notFoundContent={<span>拠点がありません</span>} />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).not.toBeDisabled();
    await user.click(trigger);
    expect(screen.getByText("拠点がありません")).toBeInTheDocument();
  });

  it("a plain Select with no options AND no notFoundContent stays inert (unchanged)", () => {
    renderWithUi(<Select options={[]} aria-label="通貨" />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("Cascader and TreeSelect swap their empty text for notFoundContent", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <>
        <Cascader
          options={TREE}
          aria-label="地域"
          showSearch
          notFoundContent={<span>地域なし</span>}
        />
        <TreeSelect
          treeData={[]}
          aria-label="組織"
          defaultOpen
          notFoundContent={<span>組織なし</span>}
        />
      </>,
    );
    expect(screen.getByText("組織なし")).toBeInTheDocument();
    await user.click(screen.getAllByRole("combobox")[0]);
    await user.type(screen.getByPlaceholderText(/Tìm kiếm/), "zzz");
    expect(await screen.findByText("地域なし")).toBeInTheDocument();
  });
});

describe("antd parity — filterOption / filterSort / optionRender / menuItemSelectedIcon", () => {
  it("filterSort orders what filterOption kept", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        options={OPTIONS}
        showSearch
        aria-label="通貨"
        data-testid="cur"
        filterSort={(a, b) => a.label.localeCompare(b.label, "ja")}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    const rows = await screen.findAllByRole("option");
    const labels = rows.map((row) => row.textContent);
    expect(labels).toEqual([...labels].sort((a, b) => String(a).localeCompare(String(b), "ja")));
    // …and the unsorted order is genuinely different, so the assertion above has teeth.
    expect(labels).not.toEqual(OPTIONS.map((option) => option.label));
  });

  it("filterSort never reorders the caller's own options array", async () => {
    const user = userEvent.setup();
    const options = [...OPTIONS];
    renderWithUi(
      <Select
        options={options}
        showSearch
        aria-label="通貨"
        filterSort={(a, b) => a.label.localeCompare(b.label, "ja")}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await screen.findAllByRole("option");
    expect(options).toEqual(OPTIONS);
  });

  it("optionRender receives antd's (option, { index }) and outranks renderOption", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        options={OPTIONS}
        aria-label="通貨"
        renderOption={(o) => <span>旧{o.label}</span>}
        optionRender={(o, info) => (
          <span>
            {info.index}:{o.label}
          </span>
        )}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByText("0:日本円")).toBeInTheDocument();
    expect(screen.getByText("2:米ドル")).toBeInTheDocument();
    expect(screen.queryByText("旧日本円")).not.toBeInTheDocument();
  });

  it("menuItemSelectedIcon marks the picked row only", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        options={OPTIONS}
        value="vnd"
        onValueChange={() => {}}
        aria-label="通貨"
        menuItemSelectedIcon={<span data-testid="picked">✔</span>}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.getAllByTestId("picked")).toHaveLength(1);
  });
});

describe("antd parity — showSearch behaviours: autoClearSearchValue", () => {
  it("the query is cleared after a pick by default", async () => {
    const user = userEvent.setup();
    renderWithUi(<Select options={OPTIONS} showSearch aria-label="通貨" data-testid="cur" />);
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox"), "ドン");
    await user.click(await screen.findByTestId("cur-option-vnd"));
    await user.click(screen.getByRole("combobox"));
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("");
  });

  it("autoClearSearchValue={false} keeps the query so the next open resumes the filter", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        options={OPTIONS}
        showSearch
        aria-label="通貨"
        data-testid="cur"
        autoClearSearchValue={false}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox"), "ドン");
    await user.click(await screen.findByTestId("cur-option-vnd"));
    await user.click(screen.getByRole("combobox"));
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("ドン");
  });
});

describe("antd parity — popupMatchSelectWidth", () => {
  it("false releases the trigger-width floor on the plain listbox", async () => {
    const user = userEvent.setup();
    renderWithUi(<Select options={OPTIONS} aria-label="通貨" popupMatchSelectWidth={false} />);
    await user.click(screen.getByRole("combobox"));
    const content = document.querySelector('[data-slot="select-content"]');
    expect(content).toHaveAttribute("data-popup-match", "content");
    const viewport = document.querySelector('[data-slot="select-viewport"]');
    // The floor is a UTILITY — releasing it means not emitting it at all (gh#366).
    expect(viewport?.className ?? "").not.toContain("--radix-select-trigger-width");
  });

  it("a number pins the popup through the token, not a class", async () => {
    const user = userEvent.setup();
    renderWithUi(<Select options={OPTIONS} aria-label="通貨" popupMatchSelectWidth={420} />);
    await user.click(screen.getByRole("combobox"));
    const content = document.querySelector('[data-slot="select-content"]') as HTMLElement;
    expect(content).toHaveAttribute("data-popup-match", "fixed");
    expect(content.style.getPropertyValue("--select-content-inline-size")).toBe("420px");
  });

  it("true (the default) keeps the trigger width as the floor", async () => {
    const user = userEvent.setup();
    renderWithUi(<Select options={OPTIONS} aria-label="通貨" />);
    await user.click(screen.getByRole("combobox"));
    const content = document.querySelector<HTMLElement>('[data-slot="select-content"]');
    expect(content).not.toHaveAttribute("data-popup-match");
    // The floor is `.ui-select-content:not([data-popup-match])` in control.css reading the
    // `--trigger-width` react-aria publishes on this element. jsdom lays nothing out, so what is
    // checkable here is that the variable the rule reads is really published; the width itself is
    // measured in the browser (docs frame data-entry-select).
    expect(content?.style.getPropertyValue("--trigger-width")).not.toBe("");
  });
});

describe("antd parity — Cascader: showCheckedStrategy, loadData, displayRender, optionRender", () => {
  it("SHOW_PARENT collapses a fully-checked branch into the branch itself", () => {
    renderWithUi(
      <Cascader
        options={TREE}
        aria-label="地域"
        multiple
        showCheckedStrategy="SHOW_PARENT"
        value={[
          ["tokyo", "shibuya"],
          ["tokyo", "shinjuku"],
        ]}
        onValueChange={() => {}}
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("東京");
    expect(trigger).not.toHaveTextContent("渋谷");
  });

  it("SHOW_CHILD (the default) keeps listing the leaves", () => {
    renderWithUi(
      <Cascader
        options={TREE}
        aria-label="地域"
        multiple
        value={[
          ["tokyo", "shibuya"],
          ["tokyo", "shinjuku"],
        ]}
        onValueChange={() => {}}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("渋谷");
  });

  it("a partially-checked branch is NOT collapsed under SHOW_PARENT", () => {
    renderWithUi(
      <Cascader
        options={TREE}
        aria-label="地域"
        multiple
        showCheckedStrategy="SHOW_PARENT"
        value={[["tokyo", "shibuya"]]}
        onValueChange={() => {}}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("渋谷");
  });

  it("loadData fires once per unresolved branch and the click only expands it", async () => {
    const user = userEvent.setup();
    const loadData = vi.fn();
    renderWithUi(
      <Cascader
        options={[{ value: "tokyo", label: "東京", isLeaf: false }]}
        aria-label="地域"
        loadData={loadData}
        onValueChange={() => {}}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /東京/ }));
    expect(loadData).toHaveBeenCalledTimes(1);
    expect(loadData.mock.calls[0][0].at(-1).value).toBe("tokyo");
    // An unresolved branch is not a value — the panel must stay open rather than commit it.
    await user.click(screen.getByRole("option", { name: /東京/ }));
    expect(loadData).toHaveBeenCalledTimes(1);
  });

  it("displayRender owns the trigger label", () => {
    renderWithUi(
      <Cascader
        options={TREE}
        aria-label="地域"
        value={["tokyo", "shibuya"]}
        onValueChange={() => {}}
        displayRender={(labels) => <span>{labels.join(" ▸ ")}</span>}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("東京 ▸ 渋谷");
  });

  it("optionRender owns the column row body", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Cascader
        options={TREE}
        aria-label="地域"
        optionRender={(node) => <span>【{String(node.label)}】</span>}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByText("【東京】")).toBeInTheDocument();
  });

  it("maxTagCount collapses the rest into a localized overflow node", () => {
    renderWithUi(
      <Cascader
        options={TREE}
        aria-label="地域"
        multiple
        maxTagCount={1}
        value={[
          ["tokyo", "shibuya"],
          ["tokyo", "shinjuku"],
          ["osaka", "kita"],
        ]}
        onValueChange={() => {}}
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("渋谷");
    expect(trigger).not.toHaveTextContent("北区");
    expect(within(trigger).getByText(/2/)).toBeInTheDocument();
  });

  it("maxTagPlaceholder receives the omitted values", () => {
    renderWithUi(
      <Cascader
        options={TREE}
        aria-label="地域"
        multiple
        maxTagCount={1}
        maxTagPlaceholder={(omitted) => <span>ほか{omitted.length}地域</span>}
        value={[
          ["tokyo", "shibuya"],
          ["tokyo", "shinjuku"],
          ["osaka", "kita"],
        ]}
        onValueChange={() => {}}
      />,
    );
    expect(screen.getByText("ほか2地域")).toBeInTheDocument();
  });
});

describe("antd parity — TreeSelect: loadData, treeTitleRender, maxTagCount", () => {
  it("loadData fires once for an unresolved branch and the expander is offered for it", async () => {
    const user = userEvent.setup();
    const loadData = vi.fn();
    renderWithUi(
      <TreeSelect
        treeData={[{ value: "tokyo", label: "東京", isLeaf: false }]}
        aria-label="組織"
        defaultOpen
        loadData={loadData}
      />,
    );
    const row = screen.getByRole("treeitem");
    expect(row).toHaveAttribute("aria-expanded", "false");
    await user.click(within(row).getByRole("button", { name: "Mở rộng" }));
    expect(loadData).toHaveBeenCalledTimes(1);
    expect(loadData.mock.calls[0][0].value).toBe("tokyo");
  });

  it("loadData is not called twice for the same branch", async () => {
    const user = userEvent.setup();
    const loadData = vi.fn();
    renderWithUi(
      <TreeSelect
        treeData={[{ value: "tokyo", label: "東京", isLeaf: false }]}
        aria-label="組織"
        defaultOpen
        loadData={loadData}
      />,
    );
    const toggle = within(screen.getByRole("treeitem")).getByRole("button", {
      name: "Mở rộng",
    });
    await user.click(toggle);
    await user.click(within(screen.getByRole("treeitem")).getByRole("button", { name: "Thu gọn" }));
    await user.click(within(screen.getByRole("treeitem")).getByRole("button", { name: "Mở rộng" }));
    expect(loadData).toHaveBeenCalledTimes(1);
  });

  it("treeTitleRender owns the node title", () => {
    renderWithUi(
      <TreeSelect
        treeData={TREE}
        aria-label="組織"
        defaultOpen
        treeTitleRender={(n) => <span>《{String(n.label)}》</span>}
      />,
    );
    expect(screen.getByText("《東京》")).toBeInTheDocument();
  });

  it("maxTagCount collapses the checked list in the trigger", () => {
    renderWithUi(
      <TreeSelect
        treeData={TREE}
        aria-label="組織"
        treeCheckable
        treeCheckStrictly
        maxTagCount={1}
        value={["shibuya", "shinjuku", "kita"]}
        onValueChange={() => {}}
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("渋谷");
    expect(trigger).not.toHaveTextContent("北区");
  });

  it("a controlled search query drives the tree and reports back", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    renderWithUi(
      <TreeSelect
        treeData={TREE}
        aria-label="組織"
        defaultOpen
        showSearch
        search="渋谷"
        onSearchChange={onSearchChange}
      />,
    );
    expect(screen.getByText("渋谷")).toBeInTheDocument();
    expect(screen.queryByText("北区")).not.toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/Tìm kiếm/), "x");
    expect(onSearchChange).toHaveBeenCalled();
  });
});

describe('antd parity — TagInput (antd `Select mode="tags"`)', () => {
  it("maxCount refuses a tag past the ceiling", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <TagInput
        aria-label="タグ"
        defaultValue={["a", "b"]}
        maxCount={2}
        onValueChange={onValueChange}
      />,
    );
    await user.type(screen.getByRole("textbox"), "c{Enter}");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.queryByText("c")).not.toBeInTheDocument();
  });

  it("maxTagCount collapses the chips and maxTagPlaceholder names the remainder", () => {
    renderWithUi(
      <TagInput
        aria-label="タグ"
        value={["a", "b", "c"]}
        onValueChange={() => {}}
        maxTagCount={1}
        maxTagPlaceholder={(omitted) => <span>ほか{omitted.length}件</span>}
      />,
    );
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.queryByText("c")).not.toBeInTheDocument();
    expect(screen.getByText("ほか2件")).toBeInTheDocument();
  });

  it("tagRender owns the chip body but keeps it removable", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <TagInput
        aria-label="タグ"
        value={["a", "b"]}
        onValueChange={onValueChange}
        tagRender={({ label, onClose }) => (
          <button type="button" onClick={onClose}>
            ✖{label}
          </button>
        )}
      />,
    );
    await user.click(screen.getByRole("button", { name: "✖a" }));
    expect(onValueChange).toHaveBeenCalledWith(["b"]);
  });

  it("tokenSeparators splits a pasted run into several tags", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TagInput aria-label="タグ" onValueChange={onValueChange} />);
    const field = screen.getByRole("textbox");
    await user.click(field);
    await user.paste("赤, 青, 緑");
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(["赤", "青", "緑"]));
  });

  it("a custom tokenSeparators list replaces the comma", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <TagInput aria-label="タグ" onValueChange={onValueChange} tokenSeparators={[";"]} />,
    );
    const field = screen.getByRole("textbox");
    await user.type(field, "a,b;");
    // The comma is now an ordinary character; only `;` commits.
    expect(onValueChange).toHaveBeenCalledWith(["a,b"]);
  });
});

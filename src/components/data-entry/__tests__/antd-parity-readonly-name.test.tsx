import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Cascader } from "../cascader";
import { TreeSelect } from "../tree-select";

/**
 * THE readOnly CONTRACT, stated once by Select and now honoured by the other two popover-driven
 * pickers: the value stays VISIBLE, the field keeps its TAB STOP, the value still SUBMITS, the
 * clear affordance is withdrawn, the panel refuses to open, and the trigger reports
 * `aria-readonly`. `disabled` is the other thing — it drops the field from both the tab order and
 * the form, which is not what "locked for this role" means.
 *
 * AND native submission: Cascader and TreeSelect had no `name` at all, so a server-rendered form
 * could post a Select but not either of them.
 */

const CASCADER_OPTIONS = [
  {
    value: "jp",
    label: "日本",
    children: [{ value: "13", label: "東京都", children: [{ value: "shibuya", label: "渋谷区" }] }],
  },
];

const TREE_DATA = [
  { value: "eng", label: "Engineering", children: [{ value: "fe", label: "Frontend" }] },
];

describe("Cascader — readOnly", () => {
  it("keeps the value visible, the tab stop, and aria-readonly", () => {
    renderWithUi(
      <Cascader options={CASCADER_OPTIONS} aria-label="地域" value={["jp", "13"]} readOnly />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-readonly", "true");
    expect(trigger).not.toBeDisabled();
    expect(trigger).toHaveTextContent("東京都");
  });

  it("refuses to open the panel", async () => {
    const user = userEvent.setup();
    renderWithUi(<Cascader options={CASCADER_OPTIONS} aria-label="地域" readOnly />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("withdraws the clear ✕ (it would mutate a value the field cannot change)", () => {
    renderWithUi(
      <Cascader options={CASCADER_OPTIONS} aria-label="地域" value={["jp", "13"]} readOnly />,
    );
    expect(screen.queryByRole("button", { name: "Xóa lựa chọn" })).not.toBeInTheDocument();
  });

  it("without readOnly the panel still opens (the guard is not a blanket lock)", async () => {
    const user = userEvent.setup();
    renderWithUi(<Cascader options={CASCADER_OPTIONS} aria-label="地域" />);
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findAllByRole("listbox")).not.toHaveLength(0);
  });
});

describe("Cascader — native submission", () => {
  it("posts the selected path joined with /", () => {
    const { container } = renderWithUi(
      <Cascader
        options={CASCADER_OPTIONS}
        aria-label="地域"
        name="region"
        value={["jp", "13", "shibuya"]}
      />,
    );
    expect(container.querySelector('input[type="hidden"][name="region"]')).toHaveValue(
      "jp/13/shibuya",
    );
  });

  it("multiple posts ONE field per path under the same name", () => {
    const { container } = renderWithUi(
      <Cascader
        options={CASCADER_OPTIONS}
        aria-label="地域"
        name="region"
        multiple
        value={[
          ["jp", "13"],
          ["jp", "13", "shibuya"],
        ]}
      />,
    );
    const values = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="region"]'),
    ).map((input) => input.value);
    expect(values).toEqual(["jp/13", "jp/13/shibuya"]);
  });

  it("an empty Cascader posts nothing at all (no stray empty field)", () => {
    const { container } = renderWithUi(
      <Cascader options={CASCADER_OPTIONS} aria-label="地域" name="region" />,
    );
    expect(container.querySelector('input[type="hidden"][name="region"]')).toBeNull();
  });

  it("a readOnly Cascader still submits — that is the whole point of not using disabled", () => {
    const { container } = renderWithUi(
      <Cascader
        options={CASCADER_OPTIONS}
        aria-label="地域"
        name="region"
        value={["jp", "13"]}
        readOnly
      />,
    );
    expect(container.querySelector('input[type="hidden"][name="region"]')).toHaveValue("jp/13");
  });
});

describe("TreeSelect — readOnly", () => {
  it("keeps the value visible, the tab stop, and aria-readonly", () => {
    renderWithUi(<TreeSelect treeData={TREE_DATA} aria-label="部署" value="fe" readOnly />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-readonly", "true");
    expect(trigger).not.toBeDisabled();
    expect(trigger).toHaveTextContent("Frontend");
  });

  it("refuses to open the tree and withdraws the clear ✕", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <TreeSelect
        treeData={TREE_DATA}
        aria-label="部署"
        value="fe"
        readOnly
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xóa lựa chọn" })).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("TreeSelect — native submission", () => {
  it("posts the single value", () => {
    const { container } = renderWithUi(
      <TreeSelect treeData={TREE_DATA} aria-label="部署" name="dept" value="fe" />,
    );
    expect(container.querySelector('input[type="hidden"][name="dept"]')).toHaveValue("fe");
  });

  it("multiple posts ONE field per checked value under the same name", () => {
    const { container } = renderWithUi(
      <TreeSelect
        treeData={TREE_DATA}
        aria-label="部署"
        name="dept"
        multiple
        treeCheckStrictly
        value={["eng", "fe"]}
      />,
    );
    const values = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="dept"]'),
    ).map((input) => input.value);
    expect(values).toEqual(["eng", "fe"]);
  });

  it("an empty TreeSelect posts nothing at all", () => {
    const { container } = renderWithUi(
      <TreeSelect treeData={TREE_DATA} aria-label="部署" name="dept" />,
    );
    expect(container.querySelector('input[type="hidden"][name="dept"]')).toBeNull();
  });
});

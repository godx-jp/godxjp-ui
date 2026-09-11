import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent, waitFor, within } from "@/test/render";
import { Select } from "../select";

/*
 * antd `Select` parity, the value half: `labelInValue` (the `{value,label}` dialect) and the
 * `showSearch` OBJECT form (`filterOption`, `optionFilterProp`, `filterSort`, `searchValue`,
 * `onSearch`, `autoClearSearchValue`).
 */

const OPTIONS = [
  { value: "jpy", label: "日本円", sublabel: "JPY" },
  { value: "vnd", label: "ベトナムドン", sublabel: "VND" },
  { value: "eur", label: "ユーロ", sublabel: "EUR" },
];

describe("antd `labelInValue` — single", () => {
  it("takes `{value,label}` in and hands `{value,label}` back", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="通貨"
        options={OPTIONS}
        labelInValue
        value={{ value: "jpy", label: "日本円" }}
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("日本円");

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "ユーロ" }));
    expect(onValueChange).toHaveBeenCalledWith(
      { value: "eur", label: "ユーロ" },
      expect.objectContaining({ value: "eur" }),
    );
  });

  it("renders a label the OPTION LIST does not carry — the async edit form", () => {
    // The record came back as {value,label}; the options page has not loaded. antd's whole reason
    // for the prop: show 東京本社, not "52".
    renderWithUi(
      <Select
        aria-label="拠点"
        options={[]}
        labelInValue
        notFoundContent="読み込み中"
        value={{ value: "52", label: "東京本社" }}
        onValueChange={() => undefined}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("東京本社");
  });

  it("uncontrolled `defaultValue` works in the same dialect", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="通貨"
        options={OPTIONS}
        labelInValue
        defaultValue={{ value: "vnd", label: "ベトナムドン" }}
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("ベトナムドン");
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "日本円" }));
    expect(onValueChange).toHaveBeenCalledWith(
      { value: "jpy", label: "日本円" },
      expect.objectContaining({ value: "jpy" }),
    );
  });

  it("clearing reports `undefined`, not an empty labelled value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="通貨"
        data-testid="cur"
        options={OPTIONS}
        labelInValue
        value={{ value: "jpy", label: "日本円" }}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByTestId("cur-clear"));
    expect(onValueChange).toHaveBeenCalledWith(undefined, undefined);
  });
});

describe("antd `labelInValue` — multiple", () => {
  it("takes an array of `{value,label}` and reports one back", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="通貨"
        mode="multiple"
        options={OPTIONS}
        labelInValue
        value={[{ value: "jpy", label: "日本円" }]}
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("日本円");

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /ユーロ/ }));
    expect(onValueChange).toHaveBeenCalledWith(
      [
        { value: "jpy", label: "日本円" },
        { value: "eur", label: "ユーロ" },
      ],
      expect.anything(),
    );
  });
});

describe("antd `showSearch` — the object form", () => {
  it("turns the search on by existing at all", async () => {
    const user = userEvent.setup();
    renderWithUi(<Select aria-label="通貨" options={OPTIONS} showSearch={{}} />);
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("textbox")).toBeInTheDocument();
  });

  it("`filterOption: false` keeps every row — the server already filtered", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select aria-label="通貨" options={OPTIONS} showSearch={{ filterOption: false }} />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox"), "zzz");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3));
  });

  it("`filterOption(input, option)` takes antd's argument order", async () => {
    const user = userEvent.setup();
    const filterOption = vi.fn(
      (input: string, option: { sublabel?: string }) =>
        option.sublabel?.toLowerCase() === input.toLowerCase(),
    );
    renderWithUi(<Select aria-label="通貨" options={OPTIONS} showSearch={{ filterOption }} />);
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox"), "vnd");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    expect(screen.getByRole("option", { name: /ベトナムドン/ })).toBeInTheDocument();
    expect(filterOption).toHaveBeenCalledWith("vnd", expect.objectContaining({ value: "jpy" }));
  });

  it("`optionFilterProp` narrows the default filter to one field", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select aria-label="通貨" options={OPTIONS} showSearch={{ optionFilterProp: "sublabel" }} />,
    );
    await user.click(screen.getByRole("combobox"));
    // "ユーロ" is a LABEL; with the filter pinned to `sublabel` it must not match.
    await user.type(screen.getByRole("textbox"), "ユーロ");
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: /ユーロ/ })).not.toBeInTheDocument(),
    );
    // …and the same query against the field it IS pinned to does match, so the case cannot pass
    // just because the filter broke.
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "EUR");
    expect(await screen.findByRole("option", { name: /ユーロ/ })).toBeInTheDocument();
  });

  it("`filterSort` orders what the filter kept", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        aria-label="通貨"
        options={OPTIONS}
        showSearch={{ filterSort: (a, b) => a.value.localeCompare(b.value) }}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await waitFor(() =>
      // by `value`: eur, jpy, vnd
      expect(screen.getAllByRole("option").map((o) => o.textContent?.slice(0, 3))).toEqual([
        "ユーロ",
        "日本円",
        "ベトナ",
      ]),
    );
  });

  it("`searchValue` + `onSearch` drive the box from outside", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    renderWithUi(
      <Select
        aria-label="通貨"
        options={OPTIONS}
        open
        showSearch={{ searchValue: "ユー", onSearch }}
      />,
    );
    const box = screen.getByRole("textbox");
    expect(box).toHaveValue("ユー");
    await user.type(box, "ロ");
    expect(onSearch).toHaveBeenCalled();
  });

  it("`autoClearSearchValue: false` keeps the query after a pick", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        aria-label="通貨"
        mode="multiple"
        options={OPTIONS}
        showSearch={{ autoClearSearchValue: false }}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox"), "ユ");
    const option = await screen.findByRole("option", { name: /ユーロ/ });
    await user.click(option);
    expect(screen.getByRole("textbox")).toHaveValue("ユ");
  });

  it("a picked row still reports through onValueChange with the object form on", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="通貨"
        options={OPTIONS}
        showSearch={{ optionFilterProp: "label" }}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByRole("option", { name: /日本円/ }));
    expect(onValueChange).toHaveBeenCalledWith("jpy", expect.objectContaining({ value: "jpy" }));
  });
});

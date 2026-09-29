import { describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { TagInput } from "../tag-input";
import { Select } from "../select";

/*
 * Select mode="tags" — the create row (gh#1052), case-folded matching (gh#1053) and the IME guard
 * on every commit path this control owns (gh#1054).
 */

const LABELS = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
];

const createRow = () => document.querySelector('[data-slot="select-create"]');

async function openAndType(text: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox"));
  await user.type(screen.getByRole("textbox"), text);
  return user;
}

describe("gh#1052 — an explicit create row", () => {
  it("says it creates, and commits the TEXT (not the row's wording)", async () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <Select aria-label="ラベル" mode="tags" options={LABELS} onValueChange={onValueChange} />,
    );
    const user = await openAndType("社内便");
    await waitFor(() => expect(createRow()).not.toBeNull());
    // The wording is the localised "Create “x”", never the bare text antd shows.
    expect(createRow()?.textContent).not.toBe("社内便");
    expect(createRow()).toHaveTextContent(/社内便/);
    await user.click(createRow()!.closest('[role="option"]') as HTMLElement);
    expect(onValueChange).toHaveBeenCalledWith(["社内便"], [{ value: "社内便", label: "社内便" }]);
  });

  it("`createLabel` replaces the wording", async () => {
    renderWithUi(
      <Select
        aria-label="ラベル"
        mode="tags"
        options={LABELS}
        createLabel={(text) => `新しいラベル: ${text}`}
      />,
    );
    await openAndType("社内便");
    expect(await screen.findByRole("option", { name: "新しいラベル: 社内便" })).toBeInTheDocument();
  });

  it("`onCreate` fires for invented text only — never for an option id", async () => {
    const onCreate = vi.fn();
    const onSelect = vi.fn();
    renderWithUi(
      <Select
        aria-label="ラベル"
        mode="tags"
        options={LABELS}
        onCreate={onCreate}
        onSelect={onSelect}
      />,
    );
    const user = await openAndType("社内便");
    await user.keyboard("{Enter}");
    expect(onCreate).toHaveBeenCalledExactlyOnceWith("社内便");

    await user.click(await screen.findByRole("option", { name: "Feature" }));
    expect(onSelect).toHaveBeenLastCalledWith(
      "feature",
      expect.objectContaining({ value: "feature" }),
    );
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("`onCreate` fires per unknown token of a separator run", async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    renderWithUi(
      <Select
        aria-label="ラベル"
        mode="tags"
        options={LABELS}
        tokenSeparators={[","]}
        onCreate={onCreate}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.paste("Feature,社内便,至急");
    expect(onCreate.mock.calls).toEqual([["社内便"], ["至急"]]);
  });

  it("`allowCreate={false}` hides the create row, and Enter creates nothing", async () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="ラベル"
        mode="tags"
        options={LABELS}
        allowCreate={false}
        onValueChange={onValueChange}
      />,
    );
    const user = await openAndType("社内便");
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /該当なし|No results|Không/ })).toBeInTheDocument(),
    );
    expect(createRow()).toBeNull();
    await user.keyboard("{Enter}");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("a predicate `allowCreate` decides per text, and a refused token is dropped", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(
      <Select
        aria-label="ラベル"
        mode="tags"
        options={LABELS}
        tokenSeparators={[","]}
        allowCreate={(text) => text.length <= 3}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox"), "長すぎるラベル");
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(createRow()).toBeNull();
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "至急");
    await waitFor(() => expect(createRow()).not.toBeNull());

    await user.clear(screen.getByRole("textbox"));
    await user.paste("至急,長すぎるラベル,");
    expect(onValueChange).toHaveBeenLastCalledWith(["至急"], expect.anything());
  });

  it("a tags Select with NO options still takes input (it is not disabled)", async () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <Select aria-label="ラベル" mode="tags" options={[]} onValueChange={onValueChange} />,
    );
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-disabled");
    const user = await openAndType("社内便");
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith(["社内便"], expect.anything());
  });
});

describe("gh#1053 — typed text matches options case-insensitively", () => {
  it('typing "bug" when "Bug" exists offers no duplicate, and Enter picks "Bug"', async () => {
    const onValueChange = vi.fn();
    const onCreate = vi.fn();
    renderWithUi(
      <Select
        aria-label="ラベル"
        mode="tags"
        options={LABELS}
        onValueChange={onValueChange}
        onCreate={onCreate}
      />,
    );
    const user = await openAndType("BUG");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    expect(createRow()).toBeNull();
    expect(screen.getByRole("option", { name: "Bug" })).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith(
      ["bug"],
      [expect.objectContaining({ value: "bug" })],
    );
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("a held free-text tag is not offered again in another case", async () => {
    renderWithUi(
      <Select aria-label="ラベル" mode="tags" options={LABELS} defaultValue={["社内便x"]} />,
    );
    await openAndType("社内便X");
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(createRow()).toBeNull();
  });

  it("a separator run matches case-folded too", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(
      <Select
        aria-label="ラベル"
        mode="tags"
        options={LABELS}
        tokenSeparators={[","]}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.paste("bug,FEATURE,");
    expect(onValueChange).toHaveBeenCalledWith(["bug", "feature"], expect.anything());
  });

  it("`caseSensitive` restores antd's exact comparison", async () => {
    renderWithUi(<Select aria-label="ラベル" mode="tags" options={LABELS} caseSensitive />);
    await openAndType("BUG");
    await waitFor(() => expect(createRow()).not.toBeNull());
    // …and the filter itself no longer folds: "BUG" does not find "Bug".
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: "Bug" })).not.toBeInTheDocument(),
    );
  });
});

describe("gh#1054 — an IME-composing Enter commits nothing", () => {
  const setup = async () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <Select aria-label="ラベル" mode="tags" options={LABELS} onValueChange={onValueChange} />,
    );
    await openAndType("とうきょう");
    await waitFor(() => expect(createRow()).not.toBeNull());
    return { onValueChange, box: screen.getByRole("textbox") };
  };

  it("`isComposing: true` → nothing created", async () => {
    const { onValueChange, box } = await setup();
    fireEvent.keyDown(box, { key: "Enter", isComposing: true });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("`keyCode: 229` → nothing created", async () => {
    const { onValueChange, box } = await setup();
    fireEvent.keyDown(box, { key: "Enter", keyCode: 229 });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("a plain Enter → created", async () => {
    const { onValueChange, box } = await setup();
    fireEvent.keyDown(box, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith(["とうきょう"], expect.anything());
  });

  it("a separator inside a composition is not split until the composition ends", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(
      <Select
        aria-label="ラベル"
        mode="tags"
        options={LABELS}
        tokenSeparators={[","]}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    const box = screen.getByRole("textbox");
    fireEvent.compositionStart(box);
    fireEvent.change(box, { target: { value: "とう,きょう" } });
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.compositionEnd(box);
    fireEvent.change(box, { target: { value: "東京," } });
    expect(onValueChange).toHaveBeenCalledWith(["東京"], expect.anything());
  });
});

describe("gh#1054 — TagInput", () => {
  it.each([
    ["isComposing: true", { isComposing: true }],
    ["keyCode: 229", { keyCode: 229 }],
  ])("a composing Enter (%s) adds no tag", (_, init) => {
    const onValueChange = vi.fn();
    renderWithUi(<TagInput aria-label="タグ" onValueChange={onValueChange} />);
    const box = screen.getByRole("textbox");
    fireEvent.change(box, { target: { value: "とうきょう" } });
    fireEvent.keyDown(box, { key: "Enter", ...init });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("a plain Enter adds the tag", () => {
    const onValueChange = vi.fn();
    renderWithUi(<TagInput aria-label="タグ" onValueChange={onValueChange} />);
    const box = screen.getByRole("textbox");
    fireEvent.change(box, { target: { value: "東京" } });
    fireEvent.keyDown(box, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith(["東京"]);
  });
});

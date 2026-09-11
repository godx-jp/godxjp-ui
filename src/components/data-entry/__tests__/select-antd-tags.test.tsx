import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { Select } from "../select";

/*
 * antd `mode="tags"`, `tokenSeparators` and `maxTagTextLength`.
 *
 * `tags` is the mode where what the user TYPED counts as a value. The split against `multiple` is
 * antd's: multiple only ever commits a row the list offers, tags also commits the text itself.
 */

const OPTIONS = [
  { value: "jpy", label: "日本円" },
  { value: "vnd", label: "ベトナムドン" },
  { value: "eur", label: "ユーロ" },
];

describe('antd `mode="tags"`', () => {
  it("offers what was typed as a row, and commits it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select aria-label="タグ" mode="tags" options={OPTIONS} onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox"), "社内便");

    const created = await screen.findByRole("option", { name: /社内便/ });
    await user.click(created);
    expect(onValueChange).toHaveBeenCalledWith(
      ["社内便"],
      [expect.objectContaining({ value: "社内便" })],
    );
  });

  it("keeps a committed free-text value listed, so it can be taken off again", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="タグ"
        mode="tags"
        options={OPTIONS}
        defaultValue={["社内便"]}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    const row = await screen.findByRole("option", { name: /社内便/ });
    expect(row).toHaveAttribute("aria-selected", "true");
    await user.click(row);
    expect(onValueChange).toHaveBeenCalledWith([], []);
  });

  it("`multiple` does NOT accept free text — only rows the list offers", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select aria-label="通貨" mode="multiple" options={OPTIONS} onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox"), "社内便");
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: /社内便/ })).not.toBeInTheDocument(),
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("antd `tokenSeparators`", () => {
  it("commits a whole pasted run as ONE change, matching rows by label", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="通貨"
        mode="multiple"
        options={OPTIONS}
        tokenSeparators={[","]}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.paste("日本円,ユーロ,");

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(["jpy", "eur"], expect.anything());
    // the box is spent once it produced values
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("in `tags` the unknown tokens become values of their own", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="タグ"
        mode="tags"
        options={OPTIONS}
        tokenSeparators={[",", "\n"]}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.paste("日本円,社内便\n持ち帰り");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(["jpy", "社内便", "持ち帰り"], expect.anything());
  });

  it("in `multiple` an unknown token is dropped, not invented", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="通貨"
        mode="multiple"
        options={OPTIONS}
        tokenSeparators={[","]}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.paste("日本円,社内便,");
    expect(onValueChange).toHaveBeenCalledWith(["jpy"], expect.anything());
  });

  it("`maxCount` still caps a pasted run", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="通貨"
        mode="multiple"
        options={OPTIONS}
        tokenSeparators={[","]}
        maxCount={2}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.paste("日本円,ユーロ,ベトナムドン,");
    expect(onValueChange).toHaveBeenCalledWith(["jpy", "eur"], expect.anything());
  });
});

describe("antd `maxTagTextLength`", () => {
  it("cuts the chip's TEXT and leaves the value whole", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="通貨"
        mode="multiple"
        options={OPTIONS}
        defaultValue={["vnd"]}
        maxTagTextLength={3}
        onValueChange={onValueChange}
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("ベトナ…");
    expect(trigger).not.toHaveTextContent("ベトナムドン");

    // The VALUE is untouched — only what the trigger shows was cut.
    await user.click(trigger);
    await user.click(await screen.findByRole("option", { name: /日本円/ }));
    expect(onValueChange).toHaveBeenCalledWith(["vnd", "jpy"], expect.anything());
  });
});

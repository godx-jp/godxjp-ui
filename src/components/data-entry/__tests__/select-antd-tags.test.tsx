import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent, waitFor, within } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";
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

/*
 * The chips on a multi-value trigger.
 *
 * They carry a REAL ✕ button, which is why the trigger is a `<div role="combobox">` and not a
 * `<button>`: a button inside a button is invalid HTML, and that — not taste — is why `tagRender`
 * used to be refused here. `combobox` is not a children-presentational role (ARIA 1.2), so a
 * button inside it is allowed, and every ✕ is its own tab stop.
 */
describe("multi-value chips: removable, and antd `tagRender`", () => {
  const removers = () =>
    screen.getByRole("combobox").querySelectorAll('[data-slot="search-select-value-remove"]');

  it("each chip carries a ✕ that takes just that value off", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="通貨"
        mode="multiple"
        options={OPTIONS}
        defaultValue={["jpy", "eur"]}
        onValueChange={onValueChange}
      />,
    );
    expect(removers()).toHaveLength(2);
    await user.click(removers()[0] as HTMLElement);
    expect(onValueChange).toHaveBeenCalledWith(
      ["eur"],
      [expect.objectContaining({ value: "eur" })],
    );
  });

  it("the ✕ does not open the panel", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select aria-label="通貨" mode="multiple" options={OPTIONS} defaultValue={["jpy"]} />,
    );
    await user.click(removers()[0] as HTMLElement);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("Backspace on the trigger drops the last chip", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="通貨"
        mode="multiple"
        options={OPTIONS}
        defaultValue={["jpy", "eur"]}
        onValueChange={onValueChange}
      />,
    );
    screen.getByRole("combobox").focus();
    await user.keyboard("{Backspace}");
    expect(onValueChange).toHaveBeenCalledWith(
      ["jpy"],
      [expect.objectContaining({ value: "jpy" })],
    );
  });

  it("`tagRender` replaces the chip, and its `onClose` is the same remover", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        aria-label="通貨"
        mode="multiple"
        options={OPTIONS}
        defaultValue={["jpy"]}
        onValueChange={onValueChange}
        tagRender={({ label, onClose }) => (
          <span data-testid="own-chip">
            {label}
            <button type="button" onClick={onClose}>
              取り消し
            </button>
          </span>
        )}
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(within(trigger).getByTestId("own-chip")).toHaveTextContent("日本円");
    // the built-in ✕ stands down — the custom chip owns removal now
    expect(removers()).toHaveLength(0);

    await user.click(within(trigger).getByRole("button", { name: "取り消し" }));
    expect(onValueChange).toHaveBeenCalledWith([], []);
  });

  it("`tagRender` leaves NO chip surface of its own behind the custom chip", () => {
    // Reported from the docs frame: the custom chip painted its own background INSIDE the
    // wrapper's `--secondary` one — a box in a box in the field. antd's tagRender replaces the
    // whole tag, so the wrapper must stop painting. (`ui-*` is the design system's own name, which
    // check:no-tailwind-class-assertions exists to let tests assert.)
    const { rerender } = renderWithUi(
      <Select aria-label="通貨" mode="multiple" options={OPTIONS} defaultValue={["jpy"]} />,
    );
    const wrapper = () =>
      screen.getByRole("combobox").querySelector('[data-slot="search-select-value"]');
    expect(wrapper()).toHaveClass("ui-search-select-value");

    rerender(
      <Select
        aria-label="通貨"
        mode="multiple"
        options={OPTIONS}
        defaultValue={["jpy"]}
        tagRender={({ label }) => <span data-testid="own-chip">{label}</span>}
      />,
    );
    expect(wrapper()).not.toHaveClass("ui-search-select-value");
    expect(wrapper()?.getAttribute("class")).toBeNull();
  });

  it("a disabled multi Select neither opens nor offers a remover", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        aria-label="通貨"
        mode="multiple"
        options={OPTIONS}
        defaultValue={["jpy"]}
        disabled
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-disabled", "true");
    expect(removers()).toHaveLength(0);
    await user.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens from the keyboard like the button trigger did", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select aria-label="通貨" mode="multiple" options={OPTIONS} defaultValue={["jpy"]} />,
    );
    screen.getByRole("combobox").focus();
    await user.keyboard("{ArrowDown}");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
  });

  it("has no axe violations with chips on the trigger", async () => {
    await expectNoA11yViolations(
      <Select
        aria-label="通貨"
        mode="multiple"
        options={OPTIONS}
        defaultValue={["jpy", "eur"]}
        maxTagCount={1}
      />,
    );
  });
});

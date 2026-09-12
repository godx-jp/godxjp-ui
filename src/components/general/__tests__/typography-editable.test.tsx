import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Text, Title } from "../typography";

/** antd `editable` — `EditConfig` in antd 6.6.3, rendered by `es/typography/Editable.js`. */
afterEach(() => {
  vi.restoreAllMocks();
});

describe("Text — editable", () => {
  it("replaces the text with a textarea carrying the current value", async () => {
    const user = userEvent.setup();
    const { container } = render(<Text editable>ログイン画面の余白</Text>);

    await user.click(screen.getByRole("button", { name: "Sửa" }));

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("ログイン画面の余白");
    // antd REPLACES the run while editing rather than overlaying it, so the rendered text
    // element is gone entirely — there is no second copy of the value in the accessibility tree.
    expect(container.querySelector('[data-slot="text"]')).toBeNull();
    expect(container.querySelector('[data-slot="typography-edit"]')).not.toBeNull();
  });

  it("confirms on Enter with the TRIMMED value, then fires onEnd", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onEnd = vi.fn();
    render(<Text editable={{ onChange, onEnd }}>件名</Text>);

    await user.click(screen.getByRole("button", { name: "Sửa" }));
    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "  新しい件名  ");
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("新しい件名");
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("abandons on Escape — onCancel fires and onChange does not", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCancel = vi.fn();
    render(<Text editable={{ onChange, onCancel }}>件名</Text>);

    await user.click(screen.getByRole("button", { name: "Sửa" }));
    await user.type(screen.getByRole("textbox"), "捨てられる");
    await user.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("confirms on blur, which antd treats as a save and NOT as an end", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onEnd = vi.fn();
    render(
      <>
        <Text editable={{ onChange, onEnd }}>件名</Text>
        <button type="button">ほかへ</button>
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Sửa" }));
    await user.click(screen.getByRole("button", { name: "ほかへ" }));

    expect(onChange).toHaveBeenCalledWith("件名");
    // antd fires `onEnd` only for the Enter path; a blur is a save, not the end of the interaction.
    expect(onEnd).not.toHaveBeenCalled();
  });

  it("returns focus to the edit button when the editor closes", async () => {
    // WCAG 2.4.3 — after a save the keyboard must not be stranded on <body>.
    const user = userEvent.setup();
    render(<Text editable>件名</Text>);
    const trigger = screen.getByRole("button", { name: "Sửa" });
    await user.click(trigger);
    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sửa" })).toHaveFocus();
    });
  });

  it("opens on the text itself when triggerType includes 'text'", async () => {
    const user = userEvent.setup();
    render(<Text editable={{ triggerType: ["text"] }}>件名</Text>);
    // antd renders NO icon in this mode — the text is the whole affordance.
    expect(screen.queryByRole("button", { name: "Sửa" })).toBeNull();
    await user.click(screen.getByText("件名"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("honours a controlled `editing`", async () => {
    const { rerender } = render(<Text editable={{ editing: true }}>件名</Text>);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    rerender(<Text editable={{ editing: false }}>件名</Text>);
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("fires onStart when editing opens", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<Text editable={{ onStart }}>件名</Text>);
    await user.click(screen.getByRole("button", { name: "Sửa" }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("passes maxLength to the field", async () => {
    const user = userEvent.setup();
    render(<Text editable={{ maxLength: 8 }}>件名</Text>);
    await user.click(screen.getByRole("button", { name: "Sửa" }));
    expect(screen.getByRole("textbox")).toHaveAttribute("maxlength", "8");
  });

  it("strips newlines — the editor is a one-line field that merely grows", async () => {
    const user = userEvent.setup();
    render(<Text editable={{ text: "一行" }}>一行</Text>);
    await user.click(screen.getByRole("button", { name: "Sửa" }));
    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "上{Shift>}{Enter}{/Shift}下");
    expect(textarea).toHaveValue("上下");
  });

  it("removes the corner hint when enterIcon is null, and renders a custom one otherwise", async () => {
    const user = userEvent.setup();
    const { container, unmount } = render(<Text editable={{ enterIcon: null }}>件名</Text>);
    await user.click(screen.getByRole("button", { name: "Sửa" }));
    expect(container.querySelector(".ui-typography-edit-confirm")).toBeNull();
    unmount();

    const user2 = userEvent.setup();
    render(<Text editable={{ enterIcon: <span>確定</span> }}>件名</Text>);
    await user2.click(screen.getByRole("button", { name: "Sửa" }));
    expect(screen.getByText("確定")).toBeInTheDocument();
  });

  it("works on a Title too — the behaviour is the shared block, not a Text special case", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Title level={3} editable={{ onChange }}>
        請求サマリー
      </Title>,
    );
    await user.click(screen.getByRole("button", { name: "Sửa" }));
    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "月次サマリー");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("月次サマリー");
  });
});

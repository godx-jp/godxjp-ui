import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, userEvent } from "@/test/render";

import { ChatComposer } from "../chat-composer";
import type { ChatComposerSubmitTypeProp } from "../chat-composer";

/**
 * ChatComposer behaviour — driven the way a person drives it (`@testing-library/user-event`), not
 * inferred from the JSX.
 *
 * The four defects these lock down have all shipped in real composers:
 *   1. a controlled `value` whose `onValueChange` is not wired back → the box FREEZES;
 *   2. `Enter` during an IME conversion sends a half-written line, so Japanese and Vietnamese
 *      input is impossible;
 *   3. a whitespace-only draft is sent as a "message";
 *   4. send and cancel rendered together while a response streams, so cancelling means aiming at
 *      the button that just moved.
 */

/** The canonical controlled call site: `value` + a synchronised `onValueChange`. */
function Controlled({
  onSubmit,
  submitType,
  initial = "",
}: {
  onSubmit?: (value: string) => void;
  submitType?: ChatComposerSubmitTypeProp;
  initial?: string;
}) {
  const [draft, setDraft] = React.useState(initial);
  return (
    <>
      <ChatComposer
        aria-label="メッセージ"
        value={draft}
        onValueChange={setDraft}
        onSubmit={onSubmit}
        submitType={submitType}
      />
      <span data-testid="mirror">{draft}</span>
    </>
  );
}

const field = () => screen.getByRole("textbox") as HTMLTextAreaElement;

describe("ChatComposer — controlled value", () => {
  it("round-trips a multi-character draft: every keystroke reaches the parent and comes back", async () => {
    const user = userEvent.setup();
    renderWithUi(<Controlled />);

    await user.type(field(), "こんにちは");

    // Both halves matter. A frozen box passes neither: the DOM value reverts and the mirror
    // (the parent's state) never moves past the first character.
    expect(field()).toHaveValue("こんにちは");
    expect(screen.getByTestId("mirror")).toHaveTextContent("こんにちは");
  });

  it("FREEZE PROBE — a controlled `value` with no `onValueChange` cannot be typed into", async () => {
    const user = userEvent.setup();
    // Deliberately the broken call site, so this test fails the day the component starts
    // maintaining its own text behind a controlled value (which would silently drop the parent).
    renderWithUi(<ChatComposer aria-label="メッセージ" value="held" />);

    await user.type(field(), "abc");

    expect(field()).toHaveValue("held");
  });

  it("uncontrolled `defaultValue` types freely and reports through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <ChatComposer aria-label="メッセージ" defaultValue="hi" onValueChange={onValueChange} />,
    );

    await user.type(field(), "!");

    expect(field()).toHaveValue("hi!");
    expect(onValueChange).toHaveBeenLastCalledWith("hi!");
  });
});

describe("ChatComposer — submitType", () => {
  it('submitType="enter": Enter sends, Shift+Enter breaks the line', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(<Controlled onSubmit={onSubmit} />);

    await user.type(field(), "hello");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(onSubmit).not.toHaveBeenCalled();
    // The newline is the OTHER modifier's job, and it must actually land in the draft.
    expect(field().value).toBe("hello\n");

    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("hello\n");
  });

  it('submitType="shiftEnter": the inverse — Shift+Enter sends, Enter breaks the line', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(<Controlled onSubmit={onSubmit} submitType="shiftEnter" />);

    await user.type(field(), "hello");
    await user.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(field().value).toBe("hello\n");

    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(onSubmit).toHaveBeenCalledWith("hello\n");
  });

  it("sending does not ALSO leave the newline behind", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(<Controlled onSubmit={onSubmit} />);

    await user.type(field(), "ok");
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledWith("ok");
    expect(field().value).toBe("ok");
  });
});

describe("ChatComposer — IME composition", () => {
  it("the Enter that CONFIRMS a conversion never sends", () => {
    const onSubmit = vi.fn();
    renderWithUi(<ChatComposer aria-label="メッセージ" onSubmit={onSubmit} />);
    const node = field();

    fireEvent.focus(node);
    fireEvent.compositionStart(node);
    fireEvent.change(node, { target: { value: "にほんご" } });
    // This is the keystroke that accepts the 日本語 candidate — it belongs to the IME.
    fireEvent.keyDown(node, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(node, { target: { value: "日本語" } });
    fireEvent.compositionEnd(node, { data: "日本語" });
    // Once the conversion is CONFIRMED, the next Enter is the user's own.
    fireEvent.keyDown(node, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("日本語");
  });

  it("`isComposing` alone is enough — a browser that reports it without our own events is honoured", () => {
    const onSubmit = vi.fn();
    renderWithUi(
      <ChatComposer aria-label="メッセージ" defaultValue="tiếng việt" onSubmit={onSubmit} />,
    );

    fireEvent.keyDown(field(), { key: "Enter", isComposing: true });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("ChatComposer — the trailing action", () => {
  it("an empty or whitespace-only draft neither enables send nor submits on Enter", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(<Controlled onSubmit={onSubmit} />);

    const send = screen.getByRole("button", { name: "Gửi tin nhắn" });
    // Disabled, yet still named: a greyed-out unnamed button tells a screen-reader user nothing.
    expect(send).toBeDisabled();

    await user.type(field(), "   ");
    expect(send).toBeDisabled();
    await user.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(field(), "x");
    expect(send).toBeEnabled();
  });

  it("clicking send emits the draft", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(<Controlled onSubmit={onSubmit} initial="ready" />);

    await user.click(screen.getByRole("button", { name: "Gửi tin nhắn" }));

    expect(onSubmit).toHaveBeenCalledWith("ready");
  });

  it("while `loading` the trailing action IS cancel — never both, and Enter no longer sends", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    renderWithUi(
      <ChatComposer
        aria-label="メッセージ"
        defaultValue="streaming"
        loading
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    );

    expect(screen.queryByRole("button", { name: "Gửi tin nhắn" })).toBeNull();
    const cancel = screen.getByRole("button", { name: "Dừng tạo câu trả lời" });

    await user.click(cancel);
    expect(onCancel).toHaveBeenCalledTimes(1);

    await user.type(field(), "{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("`disabled` and `readOnly` both refuse to send", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { rerender } = renderWithUi(
      <ChatComposer aria-label="メッセージ" defaultValue="text" disabled onSubmit={onSubmit} />,
    );
    expect(screen.getByRole("button", { name: "Gửi tin nhắn" })).toBeDisabled();

    rerender(
      <ChatComposer aria-label="メッセージ" defaultValue="text" readOnly onSubmit={onSubmit} />,
    );
    await user.type(field(), "{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Gửi tin nhắn" })).toBeDisabled();
  });
});

describe("ChatComposer — the field contract", () => {
  it("`ref`, `id` and `name` land on the <textarea>, which is the semantic focus target", () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    renderWithUi(<ChatComposer ref={ref} id="composer" name="body" aria-label="メッセージ" />);

    expect(ref.current).toBe(field());
    expect(field()).toHaveAttribute("id", "composer");
    expect(field()).toHaveAttribute("name", "body");
  });

  it("the FormField a11y contract is forwarded to the textarea and NOT duplicated on the frame", () => {
    renderWithUi(
      <ChatComposer
        aria-label="メッセージ"
        aria-describedby="helper-1"
        aria-errormessage="error-1"
        status="error"
        data-testid="composer"
      />,
    );

    expect(field()).toHaveAttribute("aria-describedby", "helper-1");
    expect(field()).toHaveAttribute("aria-errormessage", "error-1");
    // `status="error"` is not allowed to be a pure recolour (WCAG 1.4.1).
    expect(field()).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByTestId("composer")).not.toHaveAttribute("aria-label");
  });

  it("the header / prefix / footer / actions slots all render", () => {
    renderWithUi(
      <ChatComposer
        aria-label="メッセージ"
        header={<span>添付 1件</span>}
        prefix={<span>P</span>}
        footer={<span>Enter で送信</span>}
        actions={<span>A</span>}
      />,
    );

    expect(screen.getByText("添付 1件")).toBeInTheDocument();
    expect(screen.getByText("P")).toBeInTheDocument();
    expect(screen.getByText("Enter で送信")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});

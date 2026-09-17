import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

/**
 * `modEnter` reads the platform through `navigator`, so each test pins it. `userAgentData` is
 * cleared too: Chromium reports the platform there first, and jsdom may grow it one day.
 */
function mockPlatform(platform: string) {
  vi.spyOn(window.navigator, "platform", "get").mockReturnValue(platform);
  Object.defineProperty(window.navigator, "userAgentData", {
    value: undefined,
    configurable: true,
  });
}

describe('ChatComposer — submitType="modEnter"', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("off Apple platforms Ctrl+Enter sends; Enter and Shift+Enter break the line; ⌘+Enter does not send", async () => {
    mockPlatform("Win32");
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(<Controlled onSubmit={onSubmit} submitType="modEnter" />);

    await user.type(field(), "hello");
    await user.keyboard("{Enter}");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(field().value).toBe("hello\n\n");

    await user.keyboard("{Meta>}{Enter}{/Meta}");
    expect(onSubmit).not.toHaveBeenCalled();

    const beforeSend = field().value;
    await user.keyboard("{Control>}{Enter}{/Control}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(beforeSend);
    // Sending leaves no newline behind.
    expect(field().value).toBe(beforeSend);
  });

  it("on Apple platforms ⌘+Enter sends and Ctrl+Enter does not", async () => {
    mockPlatform("MacIntel");
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(<Controlled onSubmit={onSubmit} submitType="modEnter" initial="done" />);

    await user.click(field());
    await user.keyboard("{Control>}{Enter}{/Control}");
    expect(onSubmit).not.toHaveBeenCalled();

    await user.keyboard("{Meta>}{Enter}{/Meta}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("done");
  });

  it("`userAgentData.platform` wins over `navigator.platform` when the browser reports it", async () => {
    mockPlatform("Win32");
    Object.defineProperty(window.navigator, "userAgentData", {
      value: { platform: "macOS" },
      configurable: true,
    });
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(<Controlled onSubmit={onSubmit} submitType="modEnter" initial="x" />);

    await user.click(field());
    await user.keyboard("{Meta>}{Enter}{/Meta}");
    expect(onSubmit).toHaveBeenCalledWith("x");
  });

  it("an IME conversion swallows Enter and Ctrl+Enter alike", () => {
    mockPlatform("Win32");
    const onSubmit = vi.fn();
    renderWithUi(
      <ChatComposer aria-label="メッセージ" submitType="modEnter" onSubmit={onSubmit} />,
    );
    const node = field();

    fireEvent.compositionStart(node);
    fireEvent.change(node, { target: { value: "にほんご" } });
    fireEvent.keyDown(node, { key: "Enter" });
    fireEvent.keyDown(node, { key: "Enter", ctrlKey: true });
    fireEvent.keyDown(node, { key: "Enter", ctrlKey: true, isComposing: true });
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(node, { target: { value: "日本語" } });
    fireEvent.compositionEnd(node, { data: "日本語" });
    fireEvent.keyDown(node, { key: "Enter", ctrlKey: true, isComposing: true });
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(node, { key: "Enter", ctrlKey: true });
    expect(onSubmit).toHaveBeenCalledWith("日本語");
  });
});

describe("ChatComposer — allowEmptySubmit", () => {
  it('an empty draft is sendable: the button and Enter both call onSubmit("")', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(<ChatComposer aria-label="メッセージ" allowEmptySubmit onSubmit={onSubmit} />);

    const send = screen.getByRole("button", { name: "Gửi tin nhắn" });
    expect(send).toBeEnabled();
    await user.click(send);
    expect(onSubmit).toHaveBeenLastCalledWith("");

    await user.click(field());
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onSubmit).toHaveBeenLastCalledWith("");
  });

  it('a whitespace-only draft is sent as "" — whitespace is still not a message', async () => {
    mockPlatform("Win32");
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(
      <ChatComposer
        aria-label="メッセージ"
        defaultValue="   "
        submitType="modEnter"
        allowEmptySubmit
        onSubmit={onSubmit}
      />,
    );

    await user.click(field());
    await user.keyboard("{Control>}{Enter}{/Control}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("");
    vi.restoreAllMocks();
  });

  it("text is still sent as typed", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(
      <ChatComposer
        aria-label="メッセージ"
        allowEmptySubmit
        defaultValue="memo"
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Gửi tin nhắn" }));
    expect(onSubmit).toHaveBeenCalledWith("memo");
  });

  it("still blocked while `loading`, `disabled` or `readOnly`", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { rerender } = renderWithUi(
      <ChatComposer aria-label="メッセージ" allowEmptySubmit loading onSubmit={onSubmit} />,
    );
    expect(screen.queryByRole("button", { name: "Gửi tin nhắn" })).toBeNull();
    await user.type(field(), "{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();

    rerender(
      <ChatComposer aria-label="メッセージ" allowEmptySubmit disabled onSubmit={onSubmit} />,
    );
    expect(screen.getByRole("button", { name: "Gửi tin nhắn" })).toBeDisabled();
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();

    rerender(
      <ChatComposer aria-label="メッセージ" allowEmptySubmit readOnly onSubmit={onSubmit} />,
    );
    expect(screen.getByRole("button", { name: "Gửi tin nhắn" })).toBeDisabled();
    await user.type(field(), "{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
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

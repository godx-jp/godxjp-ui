import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, fireEvent, act } from "@/test/render";

import { Textarea } from "../textarea";

/**
 * `autoGrow` sizes the box in CSS from a hidden replica of the text (the replicated-content grid),
 * so jsdom — which computes no layout — can still prove the whole contract: the replica is the
 * single input to the geometry, and the component never writes `style.height` or `scrollTop`.
 */
function wrapperOf(field: HTMLElement): HTMLElement {
  const wrapper = field.parentElement;
  if (!wrapper) throw new Error("autoGrow textarea has no wrapper");
  return wrapper;
}

describe("Textarea — autoGrow", () => {
  it("is inert by default: no wrapper, no replica, geometry untouched", () => {
    renderWithUi(<Textarea aria-label="memo" defaultValue="one" />);
    const field = screen.getByLabelText("memo");
    expect(field.parentElement?.getAttribute("data-slot")).not.toBe("textarea-affix-wrapper");
    expect(field.closest(".ui-textarea-autogrow")).toBeNull();
  });

  it("seeds the replica from the initial value, so the first paint is already the right height", () => {
    renderWithUi(<Textarea aria-label="memo" autoGrow defaultValue={"a\nb\nc"} />);
    const wrapper = wrapperOf(screen.getByLabelText("memo"));
    expect(wrapper).toHaveClass("ui-textarea-autogrow");
    expect(wrapper.getAttribute("data-autogrow-value")).toBe("a\nb\nc");
  });

  it("tracks typing in an uncontrolled field", async () => {
    const user = userEvent.setup();
    renderWithUi(<Textarea aria-label="memo" autoGrow />);
    const field = screen.getByLabelText("memo");
    await user.type(field, "line{Enter}two");
    expect(wrapperOf(field).getAttribute("data-autogrow-value")).toBe("line\ntwo");
  });

  it("tracks a paste of many lines in one event", async () => {
    const user = userEvent.setup();
    renderWithUi(<Textarea aria-label="memo" autoGrow />);
    const field = screen.getByLabelText("memo");
    const pasted = Array.from({ length: 20 }, (_, i) => `row ${i + 1}`).join("\n");
    await user.click(field);
    await user.paste(pasted);
    expect(wrapperOf(field).getAttribute("data-autogrow-value")).toBe(pasted);
  });

  it("resizes on a programmatic controlled change, not only on typing", () => {
    function Controlled() {
      const [value, setValue] = React.useState("draft");
      return (
        <>
          <Textarea
            aria-label="memo"
            autoGrow
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button type="button" onClick={() => setValue("restored\ndraft\nfrom\nserver")}>
            restore
          </button>
        </>
      );
    }
    renderWithUi(<Controlled />);
    const field = screen.getByLabelText("memo");
    expect(wrapperOf(field).getAttribute("data-autogrow-value")).toBe("draft");

    fireEvent.click(screen.getByRole("button", { name: "restore" }));
    expect(wrapperOf(field).getAttribute("data-autogrow-value")).toBe(
      "restored\ndraft\nfrom\nserver",
    );
  });

  it("collapses back to the floor when a controlled value is reset to empty after submit", () => {
    function Composer() {
      const [value, setValue] = React.useState("a\nb\nc\nd");
      return (
        <>
          <Textarea
            aria-label="composer"
            autoGrow
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button type="button" onClick={() => setValue("")}>
            send
          </button>
        </>
      );
    }
    renderWithUi(<Composer />);
    const field = screen.getByLabelText("composer");
    fireEvent.click(screen.getByRole("button", { name: "send" }));
    expect(wrapperOf(field).getAttribute("data-autogrow-value")).toBe("");
  });

  it("re-measures after form.reset() restores an uncontrolled value", async () => {
    renderWithUi(
      <form>
        <Textarea aria-label="memo" autoGrow defaultValue="start" />
      </form>,
    );
    const field = screen.getByLabelText("memo") as HTMLTextAreaElement;
    await userEvent.setup().type(field, "\nmore\nlines");
    expect(wrapperOf(field).getAttribute("data-autogrow-value")).toBe("start\nmore\nlines");

    await act(async () => {
      field.form?.reset();
      await Promise.resolve();
    });
    expect(wrapperOf(field).getAttribute("data-autogrow-value")).toBe("start");
  });

  it("holds the replica still through an IME composition and syncs once at the end", () => {
    renderWithUi(<Textarea aria-label="memo" autoGrow />);
    const field = screen.getByLabelText("memo") as HTMLTextAreaElement;

    fireEvent.compositionStart(field);
    fireEvent.change(field, { target: { value: "にほ" } });
    fireEvent.change(field, { target: { value: "にほんご" } });
    // Nothing moved while the candidate window was open — no jitter, no dismissed IME.
    expect(wrapperOf(field).getAttribute("data-autogrow-value")).toBe("");

    fireEvent.compositionEnd(field, { target: { value: "日本語" } });
    expect(wrapperOf(field).getAttribute("data-autogrow-value")).toBe("日本語");
  });

  it("clears the replica when allowClear's ✕ empties the field", async () => {
    const user = userEvent.setup();
    renderWithUi(<Textarea aria-label="memo" autoGrow allowClear defaultValue={"a\nb"} />);
    const field = screen.getByLabelText("memo");
    await user.click(screen.getByRole("button", { name: "Xóa" }));
    expect(field).toHaveValue("");
    expect(wrapperOf(field).getAttribute("data-autogrow-value")).toBe("");
  });

  it("never writes style.height and never moves the scroll position while typing", async () => {
    const user = userEvent.setup();
    renderWithUi(<Textarea aria-label="memo" autoGrow defaultValue={"x\n".repeat(40)} />);
    const field = screen.getByLabelText("memo") as HTMLTextAreaElement;

    field.scrollTop = 120;
    field.setSelectionRange(10, 10);
    await user.type(field, "mid");

    expect(field.style.height).toBe("");
    expect(field.getAttribute("style")).toBeNull();
    expect(field.scrollTop).toBe(120);
  });

  it("bounds the box in rows: minRows / maxRows become the row knobs", () => {
    renderWithUi(<Textarea aria-label="memo" autoGrow minRows={2} maxRows={6} />);
    const wrapper = wrapperOf(screen.getByLabelText("memo"));
    expect(wrapper.style.getPropertyValue("--textarea-autogrow-min-height-rows")).toBe("2");
    expect(wrapper.style.getPropertyValue("--textarea-autogrow-max-height-rows")).toBe("6");
  });

  it("falls back to the theme defaults when neither bound is passed", () => {
    renderWithUi(<Textarea aria-label="memo" autoGrow />);
    const wrapper = wrapperOf(screen.getByLabelText("memo"));
    expect(wrapper.style.getPropertyValue("--textarea-autogrow-min-height-rows")).toBe("");
    expect(wrapper.style.getPropertyValue("--textarea-autogrow-max-height-rows")).toBe("");
  });

  it("treats maxRows={0} as no ceiling", () => {
    renderWithUi(<Textarea aria-label="memo" autoGrow maxRows={0} />);
    const wrapper = wrapperOf(screen.getByLabelText("memo"));
    expect(wrapper.style.getPropertyValue("--textarea-autogrow-max-height-rows")).toBe("infinity");
  });

  it("uses `rows` as the floor and drops the attribute to its minimum", () => {
    renderWithUi(<Textarea aria-label="memo" autoGrow rows={3} />);
    const field = screen.getByLabelText("memo") as HTMLTextAreaElement;
    expect(field.rows).toBe(1);
    expect(wrapperOf(field).style.getPropertyValue("--textarea-autogrow-min-height-rows")).toBe(
      "3",
    );
  });

  it("scopes the ghost box maths to the ghost variant", () => {
    renderWithUi(<Textarea aria-label="memo" autoGrow variant="ghost" />);
    expect(wrapperOf(screen.getByLabelText("memo"))).toHaveClass("ui-textarea-autogrow--ghost");
  });

  it("keeps user composition and change handlers, and the caller's own style", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCompositionEnd = vi.fn();
    renderWithUi(
      <Textarea
        aria-label="memo"
        autoGrow
        onChange={onChange}
        onCompositionEnd={onCompositionEnd}
        style={{ opacity: 0.5 }}
      />,
    );
    const field = screen.getByLabelText("memo");
    await user.type(field, "hi");
    fireEvent.compositionEnd(field);

    expect(onChange).toHaveBeenCalled();
    expect(onCompositionEnd).toHaveBeenCalledTimes(1);
    expect(field).toHaveStyle({ opacity: "0.5" });
  });

  it("keeps the FormField a11y wiring the wrapper now sits around", () => {
    renderWithUi(
      <Textarea
        aria-label="memo"
        autoGrow
        aria-describedby="memo-help"
        aria-invalid="true"
        readOnly
        defaultValue="frozen"
      />,
    );
    const field = screen.getByLabelText("memo");
    expect(field).toHaveAttribute("aria-describedby", "memo-help");
    expect(field).toHaveAttribute("aria-invalid", "true");
    // A read-only box still sizes to its content.
    expect(wrapperOf(field).getAttribute("data-autogrow-value")).toBe("frozen");
  });
});

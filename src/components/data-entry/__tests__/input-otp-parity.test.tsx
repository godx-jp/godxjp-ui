if (!document.elementFromPoint) document.elementFromPoint = () => null;
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "../input-otp";

function Slots({ count = 4 }: { count?: number }) {
  return (
    <InputOTPGroup>
      {Array.from({ length: count }, (_, index) => (
        <InputOTPSlot key={index} index={index} />
      ))}
    </InputOTPGroup>
  );
}

const field = () => screen.getByRole("textbox");
const slots = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-slot="input-otp-slot"]'));

describe("InputOTP — controlled vocabulary", () => {
  it("onValueChange receives the bare code", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <InputOTP maxLength={4} aria-label="Code" onValueChange={onValueChange}>
        <Slots />
      </InputOTP>,
    );
    await user.type(field(), "12");
    expect(onValueChange).toHaveBeenLastCalledWith("12");
  });

  it("fires once when the SAME handler is passed as both onChange and onValueChange", async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    renderWithUi(
      <InputOTP maxLength={4} aria-label="Code" onChange={handler} onValueChange={handler}>
        <Slots />
      </InputOTP>,
    );
    await user.type(field(), "7");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("defaultValue drives an uncontrolled field that still accepts typing", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <InputOTP maxLength={4} aria-label="Code" defaultValue="12">
        <Slots />
      </InputOTP>,
    );
    expect(field()).toHaveValue("12");
    await user.type(field(), "34");
    expect(field()).toHaveValue("1234");
    expect(slots(container).map((s) => s.textContent)).toEqual(["1", "2", "3", "4"]);
  });

  it("a controlled value the parent refuses to update never changes", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <InputOTP maxLength={4} aria-label="Code" value="99" onValueChange={() => {}}>
        <Slots />
      </InputOTP>,
    );
    await user.type(field(), "1");
    expect(field()).toHaveValue("99");
  });
});

describe("InputOTP — mask (antd Input.OTP mask)", () => {
  it("mask paints • while the value keeps the real code", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <InputOTP maxLength={4} aria-label="Code" mask>
        <Slots />
      </InputOTP>,
    );
    await user.type(field(), "42");
    expect(field()).toHaveValue("42");
    expect(slots(container).map((s) => s.textContent)).toEqual(["•", "•", "", ""]);
  });

  it("a string mask supplies its own glyph and only filled slots are masked", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <InputOTP maxLength={4} aria-label="Code" mask="*">
        <Slots />
      </InputOTP>,
    );
    await user.type(field(), "4");
    const painted = slots(container);
    expect(painted[0]).toHaveTextContent("*");
    expect(painted[0]).toHaveAttribute("data-masked", "");
    // An EMPTY slot must not grow a glyph — the mask is paint, not a placeholder.
    expect(painted[1]).toHaveTextContent("");
    expect(painted[1]).not.toHaveAttribute("data-masked");
  });

  it("no mask renders the real characters (unchanged default)", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <InputOTP maxLength={4} aria-label="Code">
        <Slots />
      </InputOTP>,
    );
    await user.type(field(), "42");
    expect(slots(container).map((s) => s.textContent)).toEqual(["4", "2", "", ""]);
  });
});

describe("InputOTP — formatter (antd Input.OTP formatter)", () => {
  it("normalises typed characters", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <InputOTP
        maxLength={4}
        aria-label="Code"
        formatter={(value) => value.toUpperCase()}
        onValueChange={onValueChange}
      >
        <Slots />
      </InputOTP>,
    );
    await user.type(field(), "ab");
    expect(field()).toHaveValue("AB");
    expect(onValueChange).toHaveBeenLastCalledWith("AB");
  });

  it("normalises PASTED text too, not only keystrokes", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <InputOTP maxLength={4} aria-label="Code" formatter={(value) => value.toUpperCase()}>
        <Slots />
      </InputOTP>,
    );
    await user.click(field());
    await user.paste("abcd");
    expect(field()).toHaveValue("ABCD");
  });

  it("holds for a CONTROLLED field: the parent is handed the formatted value", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [code, setCode] = useState("");
      return (
        <InputOTP
          maxLength={4}
          aria-label="Code"
          value={code}
          onValueChange={setCode}
          formatter={(value) => value.replace(/[^0-9]/g, "")}
        >
          <Slots />
        </InputOTP>
      );
    }
    renderWithUi(<Harness />);
    await user.type(field(), "1a2");
    expect(field()).toHaveValue("12");
  });
});

describe("InputOTP — disabled / readOnly", () => {
  it("readOnly keeps the tab stop and the value but refuses typing", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <InputOTP maxLength={4} aria-label="Code" defaultValue="12" readOnly>
        <Slots />
      </InputOTP>,
    );
    const input = field();
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveAttribute("aria-readonly", "true");
    // The contract's point: readOnly is NOT disabled — the field is still reachable by keyboard.
    expect(input).not.toBeDisabled();
    await user.tab();
    expect(input).toHaveFocus();

    await user.type(input, "34");
    expect(input).toHaveValue("12");
  });

  it("readOnly also refuses a paste routed through pasteTransformer", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <InputOTP
        maxLength={4}
        aria-label="Code"
        defaultValue="12"
        readOnly
        pasteTransformer={(pasted) => pasted}
        onValueChange={onValueChange}
      >
        <Slots />
      </InputOTP>,
    );
    await user.click(field());
    await user.paste("9999");
    expect(field()).toHaveValue("12");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disabled removes the field from the tab order", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <InputOTP maxLength={4} aria-label="Code" defaultValue="12" disabled>
        <Slots />
      </InputOTP>,
    );
    expect(field()).toBeDisabled();
    await user.tab();
    expect(field()).not.toHaveFocus();
  });
});

describe("InputOTP — control surface (size / status / variant)", () => {
  it("emits the shared control-surface attributes", () => {
    renderWithUi(
      <InputOTP maxLength={4} aria-label="Code" size="sm" status="warning" variant="filled">
        <Slots />
      </InputOTP>,
    );
    const input = field();
    expect(input).toHaveAttribute("data-size", "sm");
    expect(input).toHaveAttribute("data-status", "warning");
    expect(input).toHaveAttribute("data-variant", "filled");
  });

  it("status='error' folds into aria-invalid so it is not colour-only", () => {
    renderWithUi(
      <InputOTP maxLength={4} aria-label="Code" status="error">
        <Slots />
      </InputOTP>,
    );
    expect(field()).toHaveAttribute("aria-invalid", "true");
  });

  it("an aria-invalid arriving from FormField outranks status", () => {
    renderWithUi(
      <InputOTP maxLength={4} aria-label="Code" status="warning" aria-invalid={false}>
        <Slots />
      </InputOTP>,
    );
    expect(field()).toHaveAttribute("aria-invalid", "false");
  });

  it("the defaults emit NO surface attribute — an existing field is byte-identical", () => {
    renderWithUi(
      <InputOTP maxLength={4} aria-label="Code" size="md" variant="outlined">
        <Slots />
      </InputOTP>,
    );
    const input = field();
    expect(input).not.toHaveAttribute("data-size");
    expect(input).not.toHaveAttribute("data-variant");
    expect(input).not.toHaveAttribute("data-status");
  });
});

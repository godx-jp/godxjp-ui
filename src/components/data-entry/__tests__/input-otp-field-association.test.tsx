import * as React from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { FormField } from "../form-field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../input-otp";

/**
 * WHAT A LABEL POINTING AT AN InputOTP HAS TO REACH (gh#477).
 *
 * The report was that `id` is accepted by the type and never rendered, leaving every
 * `FormField` label pointing at nothing. Half of that is not so — `id` has always been forwarded
 * to the real `<input>` (`...props` reaches `OTPInput`, which spreads its rest onto the input),
 * and `#code` resolves in jsdom and in Chromium alike. The DANGLING LABEL was real, and it came
 * from the other side of the pair: `FormField` injected the child's own `id` into the clone but
 * looked up ITS OWN id in the label's click handler, so the two disagreed the moment a control
 * brought an id of its own — clicking the visible label focused nothing at all.
 *
 * These tests pin both halves, plus the part of the type surface that was genuinely a lie: a
 * prop the field accepts must arrive in the DOM.
 */
/**
 * Spreads EVERY prop through: `FormField` clones its direct child, so a wrapper that forwarded
 * only `id` would drop the `aria-labelledby` the field injects and the test would be measuring
 * its own harness rather than the component.
 */
type CodeProps = Omit<React.ComponentProps<typeof InputOTP>, "maxLength" | "children"> & {
  maxLength?: number;
};

function Code({ maxLength = 6, ...props }: CodeProps) {
  return (
    <InputOTP maxLength={maxLength} {...props}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
      </InputOTPGroup>
    </InputOTP>
  );
}

/**
 * Focusing the field arms an `input-otp` timer that asks the document what sits at the field's
 * corner (its password-manager badge detection). jsdom has no hit testing and no such method, so
 * that timer threw `document.elementFromPoint is not a function` AFTER a passing test had
 * finished — an unhandled error, a red run, and nothing in the failing test to point at.
 *
 * SCOPED TO THIS FILE ON PURPOSE. Answering `null` globally was tried and is wrong: axe-core uses
 * `elementFromPoint` for its own visibility checks, and a document that answers "nothing is there"
 * makes it report perfectly visible controls as obscured — measured, 6 axe assertions across 4
 * unrelated files went red. Here, no axe runs, and the method is removed again afterwards.
 */
const hadElementFromPoint = "elementFromPoint" in document;
beforeAll(() => {
  if (!hadElementFromPoint) {
    document.elementFromPoint = (() => null) as typeof document.elementFromPoint;
  }
});
afterAll(() => {
  if (!hadElementFromPoint) {
    delete (document as Partial<Document>).elementFromPoint;
  }
});

describe("InputOTP · label association", () => {
  it("forwards `id` to the real input", () => {
    renderWithUi(<Code id="code" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("id", "code");
    expect(document.querySelector("#code")).toBe(input);
  });

  it("is named and focused by a FormField label when it carries its own id", async () => {
    const user = userEvent.setup();
    // The reported shape: the field has no `id` of its own, the control brought one.
    renderWithUi(
      <FormField label="確認コード">
        <Code id="code" />
      </FormField>,
    );
    const input = screen.getByLabelText("確認コード");
    expect(input).toHaveAttribute("id", "code");
    await user.click(screen.getByText("確認コード"));
    expect(input).toHaveFocus();
  });

  it("is named and focused when the field and the control agree on the id", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <FormField id="code" label="確認コード">
        <Code id="code" />
      </FormField>,
    );
    await user.click(screen.getByText("確認コード"));
    expect(screen.getByLabelText("確認コード")).toHaveFocus();
  });

  it("lands every DOM prop it still accepts on the input", () => {
    renderWithUi(
      <InputOTP
        maxLength={4}
        id="pin"
        name="pin"
        title="PIN"
        dir="ltr"
        autoComplete="one-time-code"
        data-analytics="pin-field"
        aria-describedby="pin-hint"
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const input = screen.getByRole("textbox");
    for (const [attribute, value] of [
      ["id", "pin"],
      ["name", "pin"],
      ["title", "PIN"],
      ["dir", "ltr"],
      ["autocomplete", "one-time-code"],
      ["data-analytics", "pin-field"],
      ["aria-describedby", "pin-hint"],
    ] as const) {
      expect(input, `${attribute} never reached the DOM`).toHaveAttribute(attribute, value);
    }
  });

  it("no longer accepts `style`, which the field cannot honour", () => {
    renderWithUi(
      <InputOTP
        maxLength={4}
        // @ts-expect-error `input-otp` writes the input's style itself and replaces anything
        // passed in (measured: the value stayed `color: transparent`), so the type stopped
        // promising it. If this directive ever goes unused, the prop became real — forward it.
        style={{ color: "red" }}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>,
    );
    expect(screen.getByRole("textbox").style.color).not.toBe("red");
  });
});

import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Field } from "../field";
import { Switch } from "../switch";
import { Checkbox } from "../checkbox";

/*
 * gh#812 — `Field` is the inline row for a boolean control, and it was missing the two slots
 * `FormField` has: a place to put a help affordance, and a place to put a validation message.
 *
 * The addon half was not merely missing, it was a TRAP: `label` renders inside a real
 * `<label htmlFor>`, so a help button passed through it toggles the control when pressed. That
 * last assertion is the actual reported bug — 8 of 155 fields in one consumer shipped with no
 * help affordance because of it.
 */
describe("Field labelAddon (gh#812)", () => {
  it("does NOT toggle the control when the addon is clicked", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const onHelp = vi.fn();
    renderWithUi(
      <Field
        id="withholding"
        label="源泉徴収の自動計算"
        labelAddon={
          <button type="button" onClick={onHelp}>
            ヘルプ
          </button>
        }
      >
        <Switch id="withholding" onCheckedChange={onCheckedChange} />
      </Field>,
    );

    const toggle = screen.getByRole("switch", { name: "源泉徴収の自動計算" });
    expect(toggle).not.toBeChecked();

    await user.click(screen.getByRole("button", { name: "ヘルプ" }));

    expect(onHelp).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(toggle).not.toBeChecked();
  });

  it("keeps the addon OUTSIDE the <label> element", () => {
    const { container } = renderWithUi(
      <Field
        id="addon-outside"
        label="自動仕訳"
        labelAddon={
          <button type="button" data-testid="addon">
            ヘルプ
          </button>
        }
      >
        <Switch id="addon-outside" />
      </Field>,
    );

    const label = container.querySelector("label.ui-choice-label");
    expect(label).not.toBeNull();
    expect(label?.contains(screen.getByTestId("addon"))).toBe(false);
    // and it is still in the label ROW, beside the label rather than under it
    expect(screen.getByTestId("addon").closest(".ui-choice-label-row")).not.toBeNull();
  });

  it("still toggles when the label text itself is clicked", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Field id="label-click" label="メール通知" labelAddon={<span>ベータ</span>}>
        <Switch id="label-click" />
      </Field>,
    );

    await user.click(screen.getByText("メール通知"));
    expect(screen.getByRole("switch", { name: "メール通知" })).toBeChecked();
  });

  it("renders no label row when there is no addon", () => {
    const { container } = renderWithUi(
      <Field id="plain" label="メール通知">
        <Switch id="plain" />
      </Field>,
    );
    expect(container.querySelector(".ui-choice-label-row")).toBeNull();
  });
});

describe("Field error (gh#812)", () => {
  it("announces the message and marks the control invalid", () => {
    renderWithUi(
      <Field
        id="archive"
        label="電子帳簿保存に対応する"
        error="保存先のストレージが未設定のため有効にできません。"
      >
        <Switch id="archive" />
      </Field>,
    );

    const message = screen.getByRole("alert");
    expect(message).toHaveTextContent("保存先のストレージが未設定のため有効にできません。");
    expect(message).toHaveAttribute("id", "archive-error");

    // react-aria's Switch paints a <label> and focuses a hidden <input role="switch">; the
    // validation contract has to land on that input, not on the painted wrapper.
    const toggle = screen.getByRole("switch", { name: "電子帳簿保存に対応する" });
    expect(toggle).toHaveAttribute("aria-invalid", "true");
    // `aria-errormessage` is dropped by react-aria's own input, so the id ALSO rides
    // aria-describedby — otherwise the message reaches nothing at all.
    expect(toggle.getAttribute("aria-describedby")?.split(/\s+/)).toContain("archive-error");
  });

  it("composes with description instead of replacing it", () => {
    renderWithUi(
      <Field
        id="both"
        label="電子帳簿保存に対応する"
        description="保存先を設定すると有効にできます"
        error="保存先のストレージが未設定です。"
      >
        <Switch id="both" />
      </Field>,
    );

    expect(screen.getByText("保存先を設定すると有効にできます")).toBeInTheDocument();
    expect(screen.getByText("保存先のストレージが未設定です。")).toBeInTheDocument();

    const describedBy =
      screen
        .getByRole("switch", { name: "電子帳簿保存に対応する" })
        .getAttribute("aria-describedby") ?? "";
    expect(describedBy.split(/\s+/)).toEqual(
      expect.arrayContaining(["both-description", "both-error"]),
    );
  });

  it("wires a Checkbox the same way", () => {
    renderWithUi(
      <Field id="consent" label="利用規約に同意する" error="同意が必要です">
        <Checkbox id="consent" />
      </Field>,
    );

    const box = screen.getByRole("checkbox", { name: "利用規約に同意する" });
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box.getAttribute("aria-describedby")?.split(/\s+/)).toContain("consent-error");
  });

  it("leaves a control that set its own aria-invalid alone", () => {
    renderWithUi(
      <Field id="own" label="電子帳簿保存に対応する">
        <Switch id="own" aria-invalid />
      </Field>,
    );
    expect(screen.getByRole("switch", { name: "電子帳簿保存に対応する" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("adds no aria plumbing when there is neither description nor error", () => {
    renderWithUi(
      <Field id="bare" label="メール通知">
        <Switch id="bare" />
      </Field>,
    );
    const toggle = screen.getByRole("switch", { name: "メール通知" });
    expect(toggle).not.toHaveAttribute("aria-describedby");
    expect(toggle).not.toHaveAttribute("aria-invalid");
  });
});

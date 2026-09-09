if (!document.elementFromPoint) document.elementFromPoint = () => null;
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "../input-otp";
import { PasswordInput } from "../password-input";
import { Transfer } from "../transfer";

/**
 * PasswordInput: the eye toggle used to be unconditional, uncontrollable, and a SIBLING of the
 * field — outside Input's own affix wrapper. Two consequences, both pinned below:
 *   1. A password that must never be revealed (kiosk, shared screen, a JP enterprise security
 *      policy) could not be expressed at all.
 *   2. A `suffix` / `trailingIcon` / `allowClear` passed through put a SECOND control in the same
 *      trailing corner, defeating from outside the "one trailing action" rule Input enforces
 *      internally (antd-parity-input-affix.test.tsx:45).
 */
describe("PasswordInput — visibilityToggle", () => {
  it("visibilityToggle={false} removes the eye AND forces the field masked", () => {
    const { container } = renderWithUi(
      <PasswordInput aria-label="パスワード" visibilityToggle={false} defaultValue="secret" />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.querySelector("input")).toHaveAttribute("type", "password");
  });

  it("the object form is a controlled triad: `visible` wins, onVisibleChange still reports", async () => {
    const user = userEvent.setup();
    const onVisibleChange = vi.fn();
    const { container } = renderWithUi(
      <PasswordInput
        aria-label="パスワード"
        visibilityToggle={{ visible: false, onVisibleChange }}
      />,
    );
    await user.click(screen.getByRole("button"));
    expect(onVisibleChange).toHaveBeenCalledWith(true);
    // The parent ignored it, so the field must not reveal itself behind its back.
    expect(container.querySelector("input")).toHaveAttribute("type", "password");
  });

  it("the object form with `visible` set renders the revealed state", () => {
    const { container } = renderWithUi(
      <PasswordInput aria-label="パスワード" visibilityToggle={{ visible: true }} />,
    );
    expect(container.querySelector("input")).toHaveAttribute("type", "text");
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("iconRender replaces the glyph and is told the current visibility", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <PasswordInput
        aria-label="パスワード"
        iconRender={(visible) => <span data-testid="eye">{visible ? "ON" : "OFF"}</span>}
      />,
    );
    expect(screen.getByTestId("eye")).toHaveTextContent("OFF");
    await user.click(screen.getByRole("button"));
    expect(screen.getByTestId("eye")).toHaveTextContent("ON");
  });

  it("a disabled field disables its toggle too — revealing an uneditable secret is still a reveal", () => {
    renderWithUi(<PasswordInput aria-label="パスワード" disabled defaultValue="secret" />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("PasswordInput — ONE trailing action", () => {
  it("a passed-through `suffix` does not add a second control to the trailing corner", () => {
    const { container } = renderWithUi(
      // The warning is the documented contract; silence it so the assertion is the signal.
      <PasswordInput aria-label="パスワード" suffix={<span data-testid="suffix">円</span>} />,
    );
    expect(screen.queryByTestId("suffix")).not.toBeInTheDocument();
    // Exactly one trailing control: the toggle.
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });

  it("a passed-through `allowClear` cannot produce a second ✕ beside the eye", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <PasswordInput aria-label="パスワード" allowClear defaultValue="secret" />,
    );
    await user.click(container.querySelector("input")!);
    expect(container.querySelectorAll("button")).toHaveLength(1);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed");
  });

  it("visibilityToggle={false} hands the trailing slot BACK to the consumer", () => {
    renderWithUi(
      <PasswordInput
        aria-label="パスワード"
        visibilityToggle={false}
        suffix={<span data-testid="suffix">円</span>}
      />,
    );
    expect(screen.getByTestId("suffix")).toBeInTheDocument();
  });

  it("leadingIcon still flows through — the leading slot was never contested", () => {
    renderWithUi(
      <PasswordInput aria-label="パスワード" leadingIcon={<span data-testid="lock">lock</span>} />,
    );
    expect(screen.getByTestId("lock")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});

/**
 * InputOTP `mask` — PAINT only. A mask that ate the value would be a bug, not a privacy feature:
 * the code must still submit, still reach `onChange`, and still be the input's accessible value.
 */
describe("InputOTP — mask", () => {
  function renderOtp(props: Omit<React.ComponentProps<typeof InputOTP>, "maxLength">) {
    return renderWithUi(
      <InputOTP maxLength={3} aria-label="コード" {...props}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
      </InputOTP>,
    );
  }

  it("paints filled slots as • while the value is untouched", () => {
    const { container } = renderOtp({ mask: true, value: "12", onChange: () => {} });
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]');
    expect(slots[0]).toHaveTextContent("•");
    expect(slots[1]).toHaveTextContent("•");
    expect(slots[0]).toHaveAttribute("data-masked");
    // The real code is still in the field.
    expect(container.querySelector("input")).toHaveValue("12");
  });

  it("an empty slot is not masked (there is nothing to hide)", () => {
    const { container } = renderOtp({ mask: true, value: "1", onChange: () => {} });
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]');
    expect(slots[1]).not.toHaveAttribute("data-masked");
    expect(slots[1]).toHaveTextContent("");
  });

  it("a string mask uses that character", () => {
    const { container } = renderOtp({ mask: "*", value: "12", onChange: () => {} });
    expect(container.querySelectorAll('[data-slot="input-otp-slot"]')[0]).toHaveTextContent("*");
  });

  it("without `mask` the digits are visible, exactly as before", () => {
    const { container } = renderOtp({ value: "12", onChange: () => {} });
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]');
    expect(slots[0]).toHaveTextContent("1");
    expect(slots[0]).not.toHaveAttribute("data-masked");
  });

  it("status=error reports aria-invalid, which is what the container already paints", () => {
    const { container } = renderOtp({ status: "error", value: "", onChange: () => {} });
    expect(container.querySelector("input")).toHaveAttribute("aria-invalid", "true");
  });
});

/**
 * Transfer had a bespoke non-triad shape: `targetKeys` was REQUIRED, so a shuttle without a
 * handler was frozen. `defaultTargetKeys` completes the triad; `render` / `filterOption` /
 * `showSelectAll` are the antd knobs that were missing.
 */
const ITEMS = [
  { key: "a", title: "Alpha", description: "first" },
  { key: "b", title: "Beta", description: "second" },
];

describe("Transfer — uncontrolled + antd knobs", () => {
  it("runs uncontrolled from defaultTargetKeys and still reports through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Transfer dataSource={ITEMS} defaultTargetKeys={[]} onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("checkbox", { name: /Alpha/ }));
    await user.click(screen.getByRole("button", { name: "Chuyển sang đích" }));

    expect(onValueChange).toHaveBeenCalledWith(["a"], "right", ["a"]);
    // Uncontrolled means the move actually STICKS with no wiring at all.
    expect(screen.getByRole("button", { name: "Chuyển sang đích" })).toBeDisabled();
  });

  it("showSelectAll={false} withdraws the per-pane select-all checkbox", () => {
    renderWithUi(<Transfer dataSource={ITEMS} defaultTargetKeys={[]} showSelectAll={false} />);
    expect(screen.queryByRole("checkbox", { name: /Chọn tất cả/i })).not.toBeInTheDocument();
    // The row checkboxes are untouched.
    expect(screen.getByRole("checkbox", { name: /Alpha/ })).toBeInTheDocument();
  });

  it("render replaces the row body but keeps the checkbox association", () => {
    renderWithUi(
      <Transfer
        dataSource={ITEMS}
        defaultTargetKeys={[]}
        render={(item) => <span>{`#${item.key} ${item.title}`}</span>}
      />,
    );
    // The custom body IS the accessible name — the label association survived.
    expect(screen.getByRole("checkbox", { name: "#a Alpha" })).toBeInTheDocument();
  });

  it("filterOption owns the search decision, case included", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Transfer
        dataSource={ITEMS}
        defaultTargetKeys={[]}
        showSearch
        // Case-SENSITIVE on purpose: an employee number or SKU match often must be.
        filterOption={(query, item) => String(item.title).includes(query)}
      />,
    );
    const [sourceSearch] = screen.getAllByRole("searchbox");
    await user.type(sourceSearch, "alpha");
    // The default matcher would have found it; this one must not.
    expect(screen.queryByRole("checkbox", { name: /Alpha/ })).not.toBeInTheDocument();

    await user.clear(sourceSearch);
    await user.type(sourceSearch, "Alpha");
    expect(screen.getByRole("checkbox", { name: /Alpha/ })).toBeInTheDocument();
  });

  it("a CONTROLLED targetKeys still wins over the internal state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Transfer dataSource={ITEMS} targetKeys={[]} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("checkbox", { name: /Alpha/ }));
    await user.click(screen.getByRole("button", { name: "Chuyển sang đích" }));

    expect(onValueChange).toHaveBeenCalledWith(["a"], "right", ["a"]);
    // The parent ignored it — Alpha must still be in the SOURCE pane.
    const [sourcePane] = document.querySelectorAll(".ui-transfer-pane");
    expect(within(sourcePane as HTMLElement).getByText("Alpha")).toBeInTheDocument();
  });
});

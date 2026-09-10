import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Textarea } from "../textarea";

/**
 * `autoGrow` sizes the box from a CSS mirror (`data-autogrow-value`, replayed through
 * `content: attr(...)`). While the box is EMPTY the thing actually painted inside that content
 * box is the PLACEHOLDER — so a mirror of `""` leaves a one-row box and a placeholder that needs
 * two rows is clipped, with no way to read the rest of it.
 *
 * The mirror therefore replicates the placeholder while empty, and the value as soon as there is
 * one (once a value exists the placeholder is not painted at all, and holding the box open at the
 * placeholder's height would be wrong).
 */
describe("Textarea autoGrow — placeholder is part of the resting height", () => {
  const wrapper = () => document.querySelector('[data-slot="textarea-affix-wrapper"]');

  it("mirrors the placeholder while the box is empty", () => {
    render(<Textarea autoGrow placeholder={"Nhập tin nhắn của bạn\nrồi nhấn Enter để gửi"} />);
    expect(wrapper()).toHaveAttribute(
      "data-autogrow-value",
      "Nhập tin nhắn của bạn\nrồi nhấn Enter để gửi",
    );
  });

  it("switches to the value as soon as the user types, and back when cleared", async () => {
    const user = userEvent.setup();
    render(<Textarea autoGrow placeholder="Nhập tin nhắn" />);
    const field = screen.getByRole("textbox");

    await user.type(field, "xin chào");
    expect(wrapper()).toHaveAttribute("data-autogrow-value", "xin chào");

    await user.clear(field);
    expect(wrapper()).toHaveAttribute("data-autogrow-value", "Nhập tin nhắn");
  });

  it("mirrors a controlled value over the placeholder", () => {
    render(<Textarea autoGrow placeholder="Nhập tin nhắn" value="đã có nội dung" readOnly />);
    expect(wrapper()).toHaveAttribute("data-autogrow-value", "đã có nội dung");
  });

  it("falls back to an empty mirror when there is no placeholder", () => {
    render(<Textarea autoGrow />);
    expect(wrapper()).toHaveAttribute("data-autogrow-value", "");
  });

  it("does not mirror anything when autoGrow is off", () => {
    render(<Textarea placeholder="Nhập tin nhắn" allowClear />);
    expect(wrapper()).not.toHaveAttribute("data-autogrow-value");
  });
});

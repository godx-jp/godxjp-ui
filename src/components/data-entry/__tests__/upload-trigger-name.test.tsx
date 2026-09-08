import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Paperclip } from "lucide-react";

import { Upload } from "../upload";

/**
 * `variant="button"`: the accessible name of the control the user actually operates.
 *
 * The composite renders two things a screen reader can reach — the visually hidden
 * `<input type="file">` and the visible trigger `<button>`. A consumer passing `aria-label` is
 * naming the widget, and the widget they see and click is the button. Sending that name to the
 * hidden input instead left a 28×28 icon trigger announced as a bare "button".
 *
 * The name lands on the trigger ONLY, never on both: two focusable nodes carrying the same string
 * makes a screen reader read it twice for one action.
 */
describe("Upload button trigger name", () => {
  it("gives the visible trigger the aria-label the consumer passed", () => {
    render(
      <Upload
        variant="button"
        triggerVariant="ghost"
        triggerSize="icon-sm"
        aria-label="Attach a file"
      />,
    );

    // The question a keyboard / screen-reader user is asking: can I find the thing I press?
    const trigger = screen.getByRole("button", { name: "Attach a file" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("data-slot", "button");
  });

  it("does not repeat that name on the hidden file input", () => {
    const { container } = render(
      <Upload variant="button" triggerSize="icon-sm" aria-label="Attach a file" />,
    );

    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    // The input keeps its own intrinsic name, so the two nodes read as two distinct things
    // rather than announcing "Attach a file" twice.
    expect(input).toHaveAttribute("aria-label", "Chọn tệp");
  });

  it("still names an icon trigger whose children render no text", () => {
    render(
      <Upload variant="button" triggerSize="icon-sm">
        <Paperclip />
      </Upload>,
    );

    // No string to fall back on and no consumer label: the catalogue's action label names it.
    expect(screen.getByRole("button", { name: "Chọn file" })).toBeInTheDocument();
  });

  it("gives a full-size trigger the consumer's name too", () => {
    render(<Upload variant="button" aria-label="Attach a file" />);

    expect(screen.getByRole("button", { name: "Attach a file" }).tagName).toBe("BUTTON");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Upload } from "../upload";

/**
 * `variant="button"` trigger sizing.
 *
 * The trigger was always a full-size labelled Button. A consumer putting it in
 * a toolbar beside other icon buttons got a 147×32 labelled control where a
 * 32×32 square belonged, and had no way to say so — the component owns its own
 * trigger, so there was nothing to reach.
 */
describe("Upload button trigger", () => {
  it("keeps its label at a text size", () => {
    render(<Upload variant="button" triggerSize="sm">Attach file</Upload>);

    expect(screen.getByRole("button", { name: "Attach file" })).toHaveTextContent(
      "Attach file",
    );
  });

  it("drops the label at an icon size and keeps the accessible name", () => {
    render(<Upload variant="button" triggerSize="icon-sm">Attach file</Upload>);

    const trigger = screen.getByRole("button", { name: "Attach file" });

    // The name survives for a screen reader; the text does not take up space.
    expect(trigger).toHaveTextContent("");
    expect(trigger).toHaveAttribute("aria-label", "Attach file");
  });

  it("still labels the trigger when no size is given", () => {
    // The default has to stay what every existing caller already renders.
    render(<Upload variant="button">Attach file</Upload>);

    expect(screen.getByRole("button", { name: "Attach file" })).toHaveTextContent(
      "Attach file",
    );
  });
});

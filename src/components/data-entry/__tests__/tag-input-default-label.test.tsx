import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { TagInput } from "../tag-input";

describe("TagInput — default accessible name", () => {
  it("falls back to the localized input label when no aria-label is given (the t() branch)", () => {
    // Every other test passes aria-label (the `ariaLabel ?? …` left side); omitting it
    // exercises the right side — the default `t("ui.tagInput.inputLabel")` label.
    renderWithUi(<TagInput />);
    const field = screen.getByRole("textbox");
    const label = field.getAttribute("aria-label") ?? "";
    expect(label.length).toBeGreaterThan(0);
  });
});

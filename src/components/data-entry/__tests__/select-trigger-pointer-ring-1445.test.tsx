/**
 * gh#1445 — after a MOUSE pick, a Select trigger kept a thick focus ring.
 *
 * The popup returns focus to the trigger programmatically, and Chromium then matches
 * `:focus-visible` even though the user never touched the keyboard. A react-aria trigger now rings
 * (outline, halo and --input rebind) on react-aria's keyboard-only `data-focus-visible`. The open
 * ring of gh#101 is kept; the trigger also reports how it was opened (`data-open-modality`), the hook
 * a composite that owns the ring itself (an inset search bar) uses.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { renderWithUi, screen, userEvent } from "@/test/render";
import { describe, expect, it } from "vitest";

import { Select } from "../select";

const css = readFileSync(join(process.cwd(), "src/styles/focus-ring.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

const options = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "EN" },
];

describe("Select trigger ring is keyboard-only (gh#1445)", () => {
  it("records how the popup was opened: pointer vs keyboard", async () => {
    renderWithUi(
      <Select aria-label="言語" value="ja" options={options} onValueChange={() => {}} />,
    );
    const trigger = screen.getByRole("combobox", { name: "言語" });
    expect(trigger).not.toHaveAttribute("data-open-modality");

    const user = userEvent.setup();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("data-state", "open");
    expect(trigger).toHaveAttribute("data-open-modality", "pointer");
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("data-state", "closed");
    expect(trigger).not.toHaveAttribute("data-open-modality");

    await user.keyboard("{ArrowDown}");
    expect(trigger).toHaveAttribute("data-state", "open");
    expect(trigger).toHaveAttribute("data-open-modality", "keyboard");
  });

  it("keys every ring rule of a react-aria trigger on data-focus-visible, not :focus-visible", () => {
    for (const list of css.matchAll(/:is\(([\s\S]*?)\):focus-visible/g)) {
      expect(list[1]).not.toMatch(/\.ui-control-trigger\s*[,)]/);
    }
    // outline, halo, --input rebind
    expect(css.split(".ui-control-trigger[data-rac][data-focus-visible]").length - 1).toBe(3);
    expect(css.split(".ui-control-trigger:not([data-rac]):focus-visible").length - 1).toBe(3);
  });
});

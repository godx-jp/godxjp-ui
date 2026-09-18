import * as React from "react";
import { describe, expect, it } from "vitest";
import { FilePlus2, Plus } from "lucide-react";

import { renderWithUi } from "@/test/render";
import { Upload } from "../upload";

/**
 * `Upload.triggerIcon` (gh#734).
 *
 * `variant="button"` hard-coded the lucide upload arrow, and `triggerVariant` only moves emphasis,
 * so a "create new" action that HAPPENS to be an upload could not carry a plus — it had to announce
 * itself as an upload in a row of create buttons.
 *
 * MEASURED in Chromium (dev preview :6194, /isolate/data-entry-upload) at 1440:
 *
 *   triggerIcon         svg class                             box            aria-hidden   button
 *   (default)           lucide lucide-upload …                16.00 x 16.00  true          32.00
 *   Plus                lucide lucide-plus …                  16.00 x 16.00  true          32.00
 *   FilePlus2 (icon-sm) lucide lucide-file-plus-corner …      16.00 x 16.00  true          28.00
 *
 * 16px IS `--upload-row-icon-size`, i.e. the documented size the built-in glyph already drew at:
 * the library keeps the class, the label spacing and the `aria-hidden`, so swapping the glyph
 * cannot move the trigger's metrics or reach the accessible name.
 */
describe("Upload triggerIcon (gh#734)", () => {
  const glyph = (ui: React.ReactElement) =>
    renderWithUi(ui).container.querySelector(".ui-upload-trigger-icon")!;

  it("draws the upload arrow when nothing is asked for", () => {
    expect(glyph(<Upload variant="button" />).getAttribute("class")).toContain("lucide-upload");
  });

  it("renders the glyph COMPONENT it is handed", () => {
    expect(glyph(<Upload variant="button" triggerIcon={Plus} />).getAttribute("class")).toContain(
      "lucide-plus",
    );
  });

  it("keeps the documented size class and the label spacing hook on the swapped glyph", () => {
    const icon = glyph(
      <Upload variant="button" triggerIcon={Plus}>
        資料を追加
      </Upload>,
    );
    // `.ui-upload-trigger-icon` is what binds the box to --upload-row-icon-size.
    expect(icon).toHaveClass("ui-upload-trigger-icon");
    // Present while the trigger shows a label — it is the inline-end margin's only hook.
    expect(icon).toHaveAttribute("data-with-label", "");
  });

  it("drops the label spacing on an icon-only trigger, exactly as the default glyph does", () => {
    const icon = glyph(
      <Upload variant="button" triggerIcon={FilePlus2} triggerSize="icon-sm" aria-label="添付" />,
    );
    expect(icon).not.toHaveAttribute("data-with-label");
  });

  it("stays out of the accessible name — the glyph is decoration, the label is the name", () => {
    const { container, getByRole } = renderWithUi(
      <Upload variant="button" triggerIcon={Plus}>
        資料を追加
      </Upload>,
    );
    expect(container.querySelector(".ui-upload-trigger-icon")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(getByRole("button", { name: "資料を追加" })).toBeInTheDocument();
  });

  it("composes with triggerVariant/triggerSize without touching either", () => {
    const { container } = renderWithUi(
      <Upload variant="button" triggerIcon={Plus} triggerVariant="ghost" triggerSize="icon-sm" />,
    );
    const trigger = container.querySelector('button[type="button"]')!;
    expect(trigger).toHaveAttribute("data-variant", "ghost");
    expect(trigger).toHaveAttribute("data-size", "icon-sm");
    expect(container.querySelector(".ui-upload-trigger-icon")?.getAttribute("class")).toContain(
      "lucide-plus",
    );
  });
});

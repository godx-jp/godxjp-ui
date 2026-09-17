import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Upload } from "../upload";
import type { UploadFileItem } from "../upload-types";

/**
 * The DOM half of gh#733 — every row action lives in ONE group.
 *
 * As loose siblings of the name block, the actions were laid out past the end edge of a narrow row
 * and off the frame, one by one (320px: download +24px, remove +70px — `scripts/frame-geometry.mjs`).
 * The fix is `flex-wrap` on the row plus this group, so they drop UNDER the name together instead
 * of leaving the frame. The width behaviour itself is asserted from CSS in
 * `src/styles/__tests__/upload-row-narrow-actions.test.ts`; what this file holds is the structure
 * that rule needs — an action outside the group is an action that can still be pushed out alone.
 */

const item = (partial: Partial<UploadFileItem> & { name: string }): UploadFileItem => ({
  uid: partial.name,
  size: 1024,
  status: "done",
  ...partial,
});

const row = (name: string) => screen.getByText(name).closest(".ui-upload-row") as HTMLElement;

describe("Upload file row — the actions are one wrappable group", () => {
  it("holds preview, download and remove, and holds them in that group alone", () => {
    renderWithUi(
      <Upload
        variant="dropzone"
        listType="picture"
        value={[item({ name: "screenshot.png", mimeType: "image/png", previewUrl: "data:," })]}
        onValueChange={() => {}}
        onDownload={() => {}}
      />,
    );
    const fileRow = row("screenshot.png");
    const actions = fileRow.querySelector(".ui-upload-row-actions")!;
    const buttons = [...fileRow.querySelectorAll("button")];
    expect(buttons.length).toBe(3);
    for (const button of buttons) expect(button.closest(".ui-upload-row-actions")).toBe(actions);
    // …and the group is the row's LAST item, after the leading box and the name block.
    expect(fileRow.lastElementChild).toBe(actions);
    expect(fileRow.children).toHaveLength(3);
  });

  it("keeps the leading box and the name block OUT of the group — they hold the row's line", () => {
    renderWithUi(
      <Upload
        variant="dropzone"
        listType="picture"
        value={[item({ name: "result.json", mimeType: "application/json" })]}
        onValueChange={() => {}}
      />,
    );
    const fileRow = row("result.json");
    expect(fileRow.querySelector(".ui-upload-list-glyph")?.parentElement).toBe(fileRow);
    expect(fileRow.querySelector(".ui-upload-row-main")?.parentElement).toBe(fileRow);
  });

  it("leaves the group empty — and so collapsed — when a row carries no action at all", () => {
    renderWithUi(
      <Upload
        variant="dropzone"
        removable={false}
        value={[item({ name: "run.txt", mimeType: "text/plain" })]}
        onValueChange={() => {}}
      />,
    );
    const fileRow = row("run.txt");
    expect(fileRow.querySelectorAll("button")).toHaveLength(0);
    expect(fileRow.querySelector(".ui-upload-row-actions")!.childElementCount).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Attachments } from "../attachments";
import type { AttachmentsItemProp } from "../attachments";

/**
 * THE DOM HALF OF gh#855 — the raw `<input type="file">` and the card that never said which file.
 *
 * Two defects this holds, both measured on `/isolate/data-entry-attachments` at 28.10.0:
 *
 *   1. The file input was PAINTED — nine of them, 265x24, `display: inline-block`, no `sr-only`.
 *      It is the `ファイル選択 / 選択されていません` in the screenshot the issue was filed from.
 *      The fix must hide it WITHOUT `display: none`, or the keyboard path and the accessible name
 *      go with it — which would be a regression, not a fix.
 *   2. `item.name` appeared nowhere a sighted user could read it. The card drew a glyph and a byte
 *      count; the only place the file name existed was the remove button's accessible name. A
 *      tray of five attachments was five identical chips.
 *
 * Layout belongs to `src/styles/__tests__/attachments-stylesheet-855.test.ts` and to the frame
 * sweep — jsdom lays nothing out, so nothing here can assert a box.
 */
const items: AttachmentsItemProp[] = [
  { uid: "1", name: "請求書_2026-03.pdf", size: 182_400, status: "done" },
  { uid: "2", name: "契約書_原本.pdf", size: 2_400_000, status: "error" },
];

describe("Attachments — the file picker is hidden but reachable, and the card names the file", () => {
  it("never paints the raw file input, and does not reach for `display: none` to do it", () => {
    renderWithUi(<Attachments items={[]} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    expect(input).not.toBeNull();
    // `sr-only` — Upload's mechanism, reused rather than re-derived (gh#855).
    expect(input.classList.contains("sr-only")).toBe(true);
    // The slot class survives so a consumer selector keeps working.
    expect(input.classList.contains("ui-attachments-input")).toBe(true);
    expect(input.hasAttribute("hidden")).toBe(false);
    expect(input.getAttribute("style") ?? "").not.toMatch(/display:\s*none/);
  });

  it("keeps the picker's accessible name and its tab stop", () => {
    renderWithUi(<Attachments items={[]} />);
    const input = screen.getByLabelText("Chọn tệp đính kèm");

    expect(input).toHaveAttribute("type", "file");
    // No `tabindex="-1"`, no `aria-hidden`: a keyboard user must still be able to reach it.
    expect(input).not.toHaveAttribute("tabindex");
    expect(input).not.toHaveAttribute("aria-hidden");
  });

  it("shows the file name, split so the extension can never be the part that truncates", () => {
    renderWithUi(<Attachments items={items} />);

    const card = document.querySelector(".ui-attachments-card") as HTMLElement;
    expect(card.querySelector(".ui-attachments-card-name-prefix")?.textContent).toBe(
      "請求書_2026-03",
    );
    expect(card.querySelector(".ui-attachments-card-name-suffix")?.textContent).toBe(".pdf");
    expect(card.querySelector(".ui-attachments-card-name")).toHaveAttribute(
      "title",
      "請求書_2026-03.pdf",
    );
  });

  it("carries the status on the card so failure is a border AND a sentence, not a tint alone", () => {
    renderWithUi(<Attachments items={items} />);
    const cards = [...document.querySelectorAll(".ui-attachments-card")];

    expect(cards.map((c) => c.getAttribute("data-status"))).toEqual(["done", "error"]);
    // WCAG 1.4.1: the failed card states the failure in words.
    expect(cards[1].querySelector(".ui-attachments-card-meta")?.textContent).toBe(
      "Tải lên thất bại",
    );
    // And the settled card still reports its size.
    expect(cards[0].querySelector(".ui-attachments-card-meta")?.textContent).toBeTruthy();
  });

  it("renders a determinate progress rail while an item is uploading", () => {
    renderWithUi(
      <Attachments
        items={[
          { uid: "3", name: "会議録画.mp4", size: 78_300_000, status: "uploading", percent: 42 },
        ]}
      />,
    );

    expect(document.querySelector(".ui-attachments-card-progress")).not.toBeNull();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "42");
  });

  it("always renders the drop layer — it used to be gated on a ref that is null when it is read", () => {
    renderWithUi(<Attachments items={items} />);
    const layer = document.querySelector(".ui-attachments-drop-layer");

    expect(layer).not.toBeNull();
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveAttribute("data-scope", "control");
  });
});

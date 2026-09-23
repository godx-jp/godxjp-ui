import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";

import { Button } from "../../general/button";
import { DialogClose, DialogContent, DialogFooter, DialogHeader, DialogRoot } from "../dialog";

/**
 * A FOOTER CANCEL WRAPPED IN `DialogClose` WAS PINNED TO THE DIALOG'S CORNER (gh#900).
 *
 * Reported as "modal cái nút bị sao đây ... bị lệch này!!" with a screenshot of a キャンセル button
 * carrying a stray ✕ at its top-right corner.
 *
 * `DialogClose` is the GENERIC close trigger, and `<DialogClose asChild><Button>Cancel</Button>
 * </DialogClose>` in a footer is the documented pattern — this component supports `asChild` for
 * exactly that. But `dialog-layout.css` keyed the CORNER ✕'s styling on `[data-slot="dialog-close"]`,
 * which every trigger carries. So the Cancel button was made `position: absolute` and pinned to the
 * top-right, on top of the real ✕.
 *
 * Measured in Chromium, dialog content at y=307 h=285, footer at y=527:
 *
 *                       before                    after
 *     corner ✕     x=906 y=324 w=53 h=32     x=943 y=324 w=16 h=16   absolute, top-right
 *     footer Cancel x=906 y=324 w=53 h=32    x=841 y=544 w=53 h=32   static, in the footer
 *
 * Before, the two had the IDENTICAL rect — the Cancel button had become the corner button's
 * position and swallowed it. After, they do not overlap at all.
 *
 * `.ui-sheet-close` had always keyed on a marker class instead, and sheet.tsx's comment claimed
 * "Matches DialogClose, which already carries the marker class". That was not true; Dialog never
 * carried one. It does now, and the comment says so.
 *
 * jsdom lays nothing out, so the pixel numbers are the browser's. What this holds is the contract:
 * the corner ✕ carries the marker, a consumer's trigger does not, and the shipped rule keys on the
 * marker rather than on the slot they share.
 */
const css = readFileSync(resolve(process.cwd(), "src/styles/dialog-layout.css"), "utf8");

describe("DialogClose is a trigger, not the corner ✕ (gh#900)", () => {
  it("does not put the corner marker on a consumer's trigger", () => {
    renderWithUi(
      <DialogRoot open>
        <DialogContent>
          <DialogHeader title="編集" />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>,
    );
    const footer = document.querySelector('[data-slot="dialog-footer"]')!;
    const cancel = footer.querySelector('[data-slot="dialog-close"]')!;
    expect(cancel, "the footer trigger renders").not.toBeNull();
    expect(cancel.textContent).toContain("キャンセル");
    // THE defect: the corner marker on a footer button is what pinned it to the corner.
    expect(cancel.classList.contains("ui-dialog-close")).toBe(false);
  });

  it("keeps the corner ✕ and the footer trigger as two different nodes", () => {
    renderWithUi(
      <DialogRoot open>
        <DialogContent>
          <DialogHeader title="編集" />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>,
    );
    const content = document.querySelector('[data-slot="dialog-content"]')!;
    const corner = content.querySelector(".ui-dialog-close");
    const cancel = document.querySelector('[data-slot="dialog-footer"] [data-slot="dialog-close"]');
    expect(corner).not.toBeNull();
    expect(cancel).not.toBeNull();
    expect(corner).not.toBe(cancel);
  });

  it("pins on the MARKER, never on the slot every trigger carries", () => {
    const pin = css.match(/\.ui-dialog-close \{([\s\S]*?)\n\s{2}\}/)?.[1];
    expect(pin, "the corner-pinning rule must key on .ui-dialog-close").toBeDefined();
    expect(pin).toMatch(/position:\s*absolute/);
    // The regression in one line: this selector must not carry the pin again.
    expect(css).not.toMatch(/\[data-slot="dialog-close"\]\s*\{[^}]*position:\s*absolute/);
  });

  it("uses the logical inset, matching `.ui-sheet-close` — they are the same control", () => {
    const pin = css.match(/\.ui-dialog-close \{([\s\S]*?)\n\s{2}\}/)![1];
    expect(pin).toMatch(/inset-block-start:\s*var\(--dialog-close-space-offset\)/);
    expect(pin).not.toMatch(/(?:^|[\s;{])top\s*:/m);
  });

  it("scopes the 24px hit area to the corner marks too", () => {
    // gh#806's floor, which a footer Cancel neither needs nor wants centred on it.
    expect(css).toMatch(/:is\(\.ui-dialog-close, \.ui-sheet-close\)::after/);
  });
});

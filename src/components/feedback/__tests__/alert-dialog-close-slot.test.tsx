import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { ruleSelector } from "@/test/css-selector";

import {
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  DialogContent,
  DialogHeader,
  DialogRoot,
} from "../dialog";

/**
 * The AlertDialog ✕ must be the SAME slot as the Dialog ✕.
 *
 * dialog-layout.css pins the corner ✕ with `.ui-dialog-close { position: absolute; … }`.
 * AlertDialogContent rendered its ✕ as a bare `<button>` inside `AlertDialogPrimitive.Cancel
 * asChild` with nothing the rule could select, so the glyph rendered INLINE, in flow, instead of
 * pinned to the corner. It is opt-in there (`showCloseButton` defaults to false), which is why it
 * went unnoticed.
 *
 * THE RULE MOVED FROM THE SLOT TO A MARKER CLASS (gh#900) and this file follows it, which makes
 * the assertion stricter rather than looser. `data-slot="dialog-close"` is on every close TRIGGER
 * — including the Cancel button a consumer wraps in `<DialogClose asChild>` — so keying the pin on
 * it dragged that footer button to the dialog's corner. The slot is still asserted below, because
 * both ✕ marks should carry it; what is now asserted SEPARATELY is the marker, because that is the
 * part the pin depends on.
 *
 * Asserted against the selector EXTRACTED from the shipped stylesheet — never a retyped copy and
 * never the Tailwind utility that happens to paint it.
 */
const here = dirname(fileURLToPath(import.meta.url));
const dialogCss = readFileSync(join(here, "../../../styles/dialog-layout.css"), "utf8");

/** The corner-pinning rule itself — anchored on the declaration that makes the slot load-bearing. */
const pinnedCloseSelector = ruleSelector(
  dialogCss,
  /\.ui-dialog-close \{\s*\n\s*position: absolute;/,
);

describe("AlertDialogContent close button", () => {
  it("carries the dialog-close slot, so the corner-pinning rule selects it", () => {
    renderWithUi(
      <AlertDialogRoot open onOpenChange={() => {}}>
        <AlertDialogPortal>
          <AlertDialogOverlay />
          <AlertDialogContent showCloseButton>
            <AlertDialogHeader title="削除しますか？" subtitle="この操作は元に戻せません" />
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialogRoot>,
    );

    // Radix portals into document.body.
    const content = document.querySelector('[data-slot="dialog-content"]')!;
    const close = content.querySelector('[data-slot="dialog-close"]');

    expect(close, "the opt-in ✕ renders with the shared dialog-close slot").not.toBeNull();
    // The pin only lands if the rendered node actually matches the shipped selector.
    expect(close!.matches(pinnedCloseSelector)).toBe(true);
    // And the thing the pin keys on is the MARKER, not the slot — a footer Cancel carries the
    // slot too and must NOT be pinned (gh#900).
    expect(close!.classList.contains("ui-dialog-close")).toBe(true);
  });

  it("is the same slot the Dialog ✕ uses — one rule pins both", () => {
    renderWithUi(
      <>
        <DialogRoot open>
          <DialogContent>
            <DialogHeader title="編集" />
          </DialogContent>
        </DialogRoot>
        <AlertDialogRoot open onOpenChange={() => {}}>
          <AlertDialogPortal>
            <AlertDialogOverlay />
            <AlertDialogContent showCloseButton>
              <AlertDialogHeader title="削除しますか？" />
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialogRoot>
      </>,
    );

    const closes = document.querySelectorAll(pinnedCloseSelector);
    expect(closes, "both overlays contribute exactly one pinned ✕").toHaveLength(2);
    // Same accessible affordance on both, not merely the same attribute.
    for (const node of closes) {
      expect(node.tagName).toBe("BUTTON");
      expect(node.getAttribute("type")).toBe("button");
    }
  });

  it("does not render the ✕ when the alert-dialog does not opt in", () => {
    renderWithUi(
      <AlertDialogRoot open onOpenChange={() => {}}>
        <AlertDialogPortal>
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader title="削除しますか？" />
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialogRoot>,
    );

    const content = document.querySelector('[data-slot="dialog-content"]')!;
    expect(content.querySelector('[data-slot="dialog-close"]')).toBeNull();
  });
});

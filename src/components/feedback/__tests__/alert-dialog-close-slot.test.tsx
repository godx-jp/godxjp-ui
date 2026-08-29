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
 * dialog-layout.css pins the close button with `[data-slot="dialog-close"] { position: absolute;
 * inset-inline-end: …; top: …; opacity: … }`. AlertDialogContent rendered its ✕ as a bare
 * `<button>` inside `AlertDialogPrimitive.Cancel asChild` with no slot attribute, so the rule
 * never reached it and the glyph rendered INLINE, in flow, instead of pinned to the corner. It is
 * opt-in there (`showCloseButton` defaults to false), which is why it went unnoticed.
 *
 * Asserted against the selector EXTRACTED from the shipped stylesheet — never a retyped copy and
 * never the Tailwind utility that happens to paint it.
 */
const here = dirname(fileURLToPath(import.meta.url));
const dialogCss = readFileSync(join(here, "../../../styles/dialog-layout.css"), "utf8");

/** The corner-pinning rule itself — anchored on the declaration that makes the slot load-bearing. */
const pinnedCloseSelector = ruleSelector(
  dialogCss,
  /\[data-slot="dialog-close"\] \{\s*\n\s*position: absolute;/,
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

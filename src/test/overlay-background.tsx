import * as React from "react";
import { expect } from "vitest";

import { AppShell } from "../components/layout/app-shell";

/**
 * Test scaffolding for the `aria-hidden-focus` class of overlay bug (godxjp-ui#352).
 *
 * The violation NEEDS an app around the overlay. Radix hides the background from assistive tech
 * by stamping `aria-hidden="true"` on every sibling between the portalled content and `<body>`;
 * axe only complains when one of those siblings still holds something TABBABLE. Mount an overlay
 * on its own — which is what every existing `*.a11y.test.tsx` does — and there is no background
 * to hide, so the condition can never form and the test is green by construction.
 *
 * `OverlayBackground` therefore renders the real shell a consumer ships (`AppShell` → `.app-root`,
 * carrying `<main tabIndex={0}>`, a sidebar and topbar) with links and buttons in it, and puts the
 * overlay under test inside it.
 */
export function OverlayBackground({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      responsiveNavigation="docked"
      sidebar={<a href="#dashboard">Bảng điều khiển</a>}
      topbarRight={
        <button type="button" onClick={() => undefined}>
          Tài khoản
        </button>
      }
    >
      <a href="#report">Báo cáo</a>
      <button type="button" onClick={() => undefined}>
        Nút nền
      </button>
      {children}
    </AppShell>
  );
}

/** Tabbable candidates, mirroring what axe's `focusable-not-tabbable` check counts. */
const TABBABLE =
  'a[href], area[href], button, input, select, textarea, iframe, object, embed, details, audio[controls], video[controls], [contenteditable="true"], [tabindex]:not([tabindex^="-"])';

/**
 * axe's own escape hatch (`focusable-modal-open` → `commons.dom.isModalOpen`): a hidden-but-
 * focusable background is NOT reported while a modal is on screen. axe recognises a modal either
 * from the `dialog, [role=dialog], [aria-modal=true]` selector, or from a positioned element
 * covering ≥75% of the viewport — which in this design system is an overlay/scrim element. jsdom
 * has no layout, so the second branch is approximated by the scrim's presence.
 */
function axeModalExemptionApplies(): boolean {
  const definiteModal = document.querySelector('dialog, [role="dialog"], [aria-modal="true"]');
  const scrim = document.querySelector('[data-slot$="-overlay"]');
  return definiteModal != null || scrim != null;
}

/**
 * Assert the invariant behind axe's `aria-hidden-focus` rule for whatever overlay is currently
 * open: a background element Radix has hidden from assistive tech must not still be reachable by
 * Tab. Either it is `inert` (see `components/general/inert-background.ts`), or the overlay is one
 * axe already exempts as a modal.
 *
 * Deliberately structural rather than a `vitest-axe` run: axe in jsdom cannot see this class at
 * all. Every node has a zero-sized rect there, so its visibility filter empties the tabbable set
 * and `aria-hidden-focus` never fires — verified against a Select open over a real background.
 * The rule's CONDITION, however, is pure DOM, and that is what is checked here.
 */
export function expectHiddenBackgroundNotTabbable(): void {
  const exempt = axeModalExemptionApplies();
  const offenders = [...document.querySelectorAll('[aria-hidden="true"][data-aria-hidden]')]
    .filter((el) => el.querySelector(TABBABLE) != null)
    .filter((el) => !el.hasAttribute("inert"))
    .map((el) => el.tagName.toLowerCase() + (el.className ? `.${String(el.className)}` : ""));

  expect(
    exempt ? [] : offenders,
    "aria-hidden background still holds tabbable content and is not inert (axe: aria-hidden-focus)",
  ).toEqual([]);
}

/** How many background elements the open overlay hid from assistive tech. 0 = nothing to guard. */
export function hiddenBackgroundCount(): number {
  return document.querySelectorAll('[aria-hidden="true"][data-aria-hidden]').length;
}

import * as React from "react";
import { expect } from "vitest";

import { AppShell } from "../components/layout/app-shell";

/**
 * Test scaffolding for the `aria-hidden-focus` class of overlay bug.
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
 * Background elements the OPEN overlay has taken out of play — hidden from assistive tech,
 * made non-interactive, or both — and which still hold something tabbable.
 *
 * TWO MECHANISMS, ONE QUESTION. Radix hides through the `aria-hidden` package: `aria-hidden="true"`
 * plus its own `data-aria-hidden` marker, and this library mirrors `inert` on top of that marker
 * (`components/general/inert-background.ts`). react-aria-components calls
 * `ariaHideOutside(…, { shouldUseInert: true })`, which writes NEITHER of those two attributes: it
 * sets the `inert` PROPERTY where the platform has one, and falls back to a bare
 * `aria-hidden="true"` (no marker) where it does not. jsdom is the fallback case —
 * `'inert' in HTMLElement.prototype` is `false` there, which is what RAC branches on — while every
 * browser this library supports has had `inert` since 2022/2023 and takes the first branch.
 *
 * So the probe asks about the RESULT rather than about which attribute produced it. The tabbable
 * filter is axe's own condition, and it is also what separates a real background from a decorative
 * `aria-hidden` icon.
 */
function neutralisedBackground(): Element[] {
  return [...document.querySelectorAll('[inert], [aria-hidden="true"]')].filter(
    (el) => el.querySelector(TABBABLE) != null,
  );
}

/**
 * Assert the invariant behind axe's `aria-hidden-focus` rule for whatever overlay is currently
 * open: a background element the overlay has hidden from assistive tech must not still be reachable
 * by Tab. Either it is `inert`, or the overlay is one axe already exempts as a modal.
 *
 * Deliberately structural rather than a `vitest-axe` run: axe in jsdom cannot see this class at
 * all. Every node has a zero-sized rect there, so its visibility filter empties the tabbable set
 * and `aria-hidden-focus` never fires — verified against a Select open over a real background.
 * The rule's CONDITION, however, is pure DOM, and that is what is checked here.
 */
export function expectHiddenBackgroundNotTabbable(): void {
  const exempt = axeModalExemptionApplies();
  const offenders = neutralisedBackground()
    .filter((el) => !el.hasAttribute("inert"))
    .map((el) => el.tagName.toLowerCase() + (el.className ? `.${String(el.className)}` : ""));

  expect(
    exempt ? [] : offenders,
    "aria-hidden background still holds tabbable content and is not inert (axe: aria-hidden-focus)",
  ).toEqual([]);
}

/** How many background elements the open overlay took out of play. 0 = nothing to guard. */
export function hiddenBackgroundCount(): number {
  return neutralisedBackground().length;
}

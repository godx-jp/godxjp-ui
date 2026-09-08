import type * as React from "react";
import { expect } from "vitest";
import { axe } from "vitest-axe";
import { renderWithUi } from "./render";

/**
 * Render a component with the standard app providers (AppProvider + Router), run axe-core over the
 * rendered DOM, and assert there are no violations.
 *
 * IT AUDITS `document.body`, NOT THE RENDER CONTAINER, and that is the whole point. Every overlay
 * in this library — Popover, Dialog, Sheet, DropdownMenu, Tooltip, the OrgSwitcher and AppLauncher
 * panels — renders through a PORTAL, into `document.body`, outside the container Testing Library
 * hands back. Auditing the container therefore audited an empty box for exactly the surfaces most
 * likely to be wrong. Measured across 313 calls in 144 files, a dozen of which say "open popover",
 * "open dialog", "open menu" in their own names: they were asserting nothing.
 *
 * `region` IS DISABLED, and only `region`. It asks whether all page content sits inside a landmark
 * — a question about a PAGE, which a unit test does not render: a fragment mounted into a bare
 * body fails it by construction, no matter how correct the component is. Switching the scope
 * without this turned 213 tests red, every one of them on that rule alone. Page scope is not lost:
 * `check:frame-axe` runs axe over the real documentation frames, which ARE whole pages, and that
 * is where `region` is both meaningful and enforced.
 *
 * Use in `*.a11y.test.tsx` to guard composites against accessibility regressions — missing labels,
 * invalid ARIA, contrast metadata.
 */
export async function expectNoA11yViolations(ui: React.ReactElement): Promise<void> {
  renderWithUi(ui);
  const results = await axe(document.body, { rules: { region: { enabled: false } } });
  expect(results).toHaveNoViolations();
}

import type * as React from "react";
import { expect } from "vitest";
import { axe } from "vitest-axe";
import { renderWithUi } from "./render";

/**
 * Render a component with the standard app providers (AppProvider + Router),
 * run axe-core against the rendered DOM, and assert there are no a11y violations.
 *
 * Use in `*.a11y.test.tsx` files to guard composites against accessibility
 * regressions (missing labels, invalid ARIA, contrast metadata, etc.).
 */
export async function expectNoA11yViolations(ui: React.ReactElement): Promise<void> {
  const { container } = renderWithUi(ui);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

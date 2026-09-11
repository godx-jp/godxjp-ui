import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Badge } from "../badge";

/**
 * A chip carrying a person's own colour is still a label somebody has to read.
 *
 * The wash exists FOR this: a solid chip has to choose a foreground, and no
 * choice clears WCAG 1.4.3 against every colour a picker can produce. Washed,
 * the label sits on the surface's own foreground, so the ratio stops depending
 * on the colour — which is what makes the two ends of the range below safe.
 */
describe("Badge color a11y", () => {
  it("says WHICH status in text, never by colour alone (1.4.1)", () => {
    render(
      <Badge shape="pill" color="#4488c5">
        処理中
      </Badge>,
    );

    // The label is the value. A chip whose only content is the colour would be
    // unreadable to a screen reader and to anyone who cannot tell the two
    // project colours apart.
    expect(screen.getByText("処理中")).toBeInTheDocument();
  });
});

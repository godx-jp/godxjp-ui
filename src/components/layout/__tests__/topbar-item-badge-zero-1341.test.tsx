/**
 * gh#1341 — a count of zero is "nothing to see": the number `0` draws no pill, so a call site
 * passes its count as it is. The string `"0"` is content the caller chose and still renders.
 */
import { Bell } from "lucide-react";
import { describe, expect, it } from "vitest";

import { TopbarItem } from "../topbar-item";
import { renderWithUi } from "@/test/render";

const badgeOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="topbar-item-badge"]');

describe("TopbarItem badge at zero (gh#1341)", () => {
  it("renders no pill for the number 0", () => {
    const { container } = renderWithUi(
      <TopbarItem aria-label="Notifications" badge={0} icon={<Bell aria-hidden="true" />} />,
    );
    expect(badgeOf(container)).toBeNull();
    // The cell stays an ordinary cell: no positioning context for a pill that is not there.
    expect(container.textContent).toBe("");
  });

  it("renders no pill for 0 under asChild either", () => {
    const { container } = renderWithUi(
      <TopbarItem asChild badge={0}>
        <a href="/notifications" aria-label="Notifications">
          <Bell />
        </a>
      </TopbarItem>,
    );
    expect(badgeOf(container)).toBeNull();
  });

  it('still renders the string "0" — the explicit opt-in for a visible zero', () => {
    const { container } = renderWithUi(
      <TopbarItem aria-label="Notifications" badge="0" icon={<Bell aria-hidden="true" />} />,
    );
    expect(badgeOf(container)).toHaveTextContent("0");
  });

  it("still renders a positive count", () => {
    const { container } = renderWithUi(
      <TopbarItem aria-label="Notifications" badge={1} icon={<Bell aria-hidden="true" />} />,
    );
    expect(badgeOf(container)).toHaveTextContent("1");
  });
});

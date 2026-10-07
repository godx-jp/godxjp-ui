/**
 * gh#1171 — `<TopbarItem asChild badge>` dropped the count, so a notification bell that is a LINK
 * (the common case) could carry its unread count only in an `aria-label`.
 */
import { Bell } from "lucide-react";
import { describe, expect, it } from "vitest";

import { TopbarItem } from "../topbar-item";
import { renderWithUi, screen } from "@/test/render";

const badgeOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="topbar-item-badge"]');

describe("TopbarItem asChild + badge (gh#1171)", () => {
  it("draws the pill inside the link, which stays the one rendered cell", () => {
    const { container } = renderWithUi(
      <TopbarItem asChild badge={3}>
        <a href="/notifications">Notifications</a>
      </TopbarItem>,
    );
    const link = screen.getByRole("link");
    expect(container.querySelectorAll(".ui-topbar-item")).toHaveLength(1);
    expect(link).toHaveClass("ui-topbar-item");
    expect(badgeOf(container)?.parentElement).toBe(link);
    expect(badgeOf(container)).toHaveTextContent("3");
  });

  it("joins the link's accessible name exactly as it joins the button's", () => {
    renderWithUi(
      <>
        <TopbarItem badge={3}>Notifications</TopbarItem>
        <TopbarItem asChild badge={3}>
          <a href="/notifications">Notifications</a>
        </TopbarItem>
      </>,
    );
    const button = screen.getByRole("button");
    const link = screen.getByRole("link");
    expect(link).toHaveAccessibleName(button.textContent ?? "");
    expect(link).toHaveAccessibleName(/3/);
  });

  it("keeps the order icon · label · badge and the destructive tone", () => {
    const { container } = renderWithUi(
      <TopbarItem asChild badge="99+" badgeTone="destructive" icon={<Bell />}>
        <a href="/notifications" aria-label="99+ unread notifications">
          Notifications
        </a>
      </TopbarItem>,
    );
    const link = container.querySelector("a")!;
    const slots = [...link.children].map((el) => el.getAttribute("data-slot"));
    expect(slots).toEqual(["topbar-item-icon", "topbar-item-badge"]);
    expect(link.textContent).toBe("Notifications99+");
    expect(badgeOf(container)).toHaveAttribute("data-tone", "destructive");
  });

  it("an empty badge still renders nothing, as on the button", () => {
    const { container } = renderWithUi(
      <TopbarItem asChild badge="">
        <a href="/notifications">Notifications</a>
      </TopbarItem>,
    );
    expect(badgeOf(container)).toBeNull();
  });
});

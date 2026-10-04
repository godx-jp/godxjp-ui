import { describe, expect, it } from "vitest";

import { AppShell } from "../app-shell";
import { Sidebar } from "../sidebar";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

/*
 * gh#1133, from the pages app's collection navigation: the drawer trigger's name could not say
 * what the drawer holds, and any button inside the drawer that did not announce itself as a
 * disclosure — a collection tree's expand toggle — dismissed the whole drawer.
 */
describe("AppShell drawer (gh#1133)", () => {
  it("shows mobileNavTriggerLabel as visible text, and it becomes the trigger's name", () => {
    renderWithUi(
      <AppShell sidebar={<nav>n</nav>} mobileNavTriggerLabel="Pages">
        <p>body</p>
      </AppShell>,
    );
    const trigger = screen.getByRole("button", { name: "Pages" });
    expect(trigger).toHaveTextContent("Pages");
    // The visible text IS the name — a leftover aria-label would override it (WCAG 2.5.3).
    expect(trigger).not.toHaveAttribute("aria-label");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("keeps the localized glyph-only name when no label is passed", () => {
    renderWithUi(
      <AppShell sidebar={<nav>n</nav>}>
        <p>body</p>
      </AppShell>,
    );
    const trigger = document.querySelector(".app-mobile-nav-trigger")!;
    expect(trigger).toHaveAttribute("aria-label");
    expect(trigger.textContent).toBe("");
  });

  it("stays open for a plain button that does not navigate (a tree's expand toggle)", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <AppShell
        sidebar={
          <div>
            {/* ui-audit-disable-next-line no-raw-button — stands in for a consumer tree toggle. */}
            <button type="button" aria-label="Expand Guides">
              ▸
            </button>
            <a href="/guides">Guides</a>
          </div>
        }
      >
        <p>body</p>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: /menu/i }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Expand Guides" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Guides" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("still closes on a Sidebar row that navigates through onSelect (a button, not a link)", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <AppShell
        sidebar={
          <Sidebar
            activeId="home"
            onSelect={() => undefined}
            sections={[
              {
                items: [
                  { id: "home", label: "Home" },
                  { id: "reports", label: "Reports" },
                ],
              },
            ]}
          />
        }
      >
        <p>body</p>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: /menu/i }));
    const drawer = await screen.findByRole("dialog");
    const row = [...drawer.querySelectorAll<HTMLElement>(".sb-nav-item")].find(
      (el) => el.textContent === "Reports",
    )!;
    expect(row.tagName).toBe("BUTTON");

    await user.click(row);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

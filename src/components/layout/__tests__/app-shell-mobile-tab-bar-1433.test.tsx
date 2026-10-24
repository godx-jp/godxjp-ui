import { useState } from "react";
import { expect, it, vi } from "vitest";
import { AppShell } from "../app-shell";
import { Button } from "../../general/button";
import { renderWithUi, screen, userEvent } from "../../../test/render";
vi.mock("../../../lib/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../lib/hooks")>()),
  useMediaQuery: () => true,
}));
it("native keyboard activation updates the consumer's current destination", async () => {
  function Example() {
    const [value, setValue] = useState("home");
    return (
      <AppShell
        mobileTabBarLabel="Destinations"
        mobileTabBar={["home", "work"].map((id) => (
          <Button
            key={id}
            variant="ghost"
            aria-current={value === id ? "page" : undefined}
            onClick={() => setValue(id)}
          >
            {id}
          </Button>
        ))}
      >
        Content
      </AppShell>
    );
  }
  const user = userEvent.setup();
  renderWithUi(<Example />);
  const nav = screen.getByRole("navigation", { name: "Destinations" });
  expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent("home");
  screen.getByRole("button", { name: "home" }).focus();
  await user.tab();
  expect(screen.getByRole("button", { name: "work" })).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent("work");
  await user.keyboard(" ");
  expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent("work");
});

import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { AppLauncher } from "../app-launcher";

/**
 * WHERE THE PANEL OPENS IS A CONTRACT, NOT A DETAIL.
 *
 * `appearance` says the trigger is not in a bar; it does not say which way is out. A rail pinned to
 * the top edge is not a bar and still opens downward, and chrome that can be re-docked knows its own
 * orientation while this component cannot. So the default is DERIVED from `appearance` and the
 * caller may state it outright — which makes `side` and `align` two real axes, each with a literal
 * union that has to be exercised rather than asserted about.
 *
 * `PopoverContent` re-emits both as `data-side` / `data-align`, so each branch is observable
 * without measuring a rendered rectangle in jsdom, which would prove nothing anyway.
 */
const labels = { trigger: "Acme apps", title: "Switch app", empty: "No apps", loading: "Loading" };
const apps = [{ id: "console", name: "Console", href: "/console" }] as const;

const panel = () => screen.getByRole("dialog", { name: "Switch app" });

describe("AppLauncher placement", () => {
  it("a bar cell drops the grid below the trigger and aligns it to the bar end", () => {
    renderWithUi(<AppLauncher apps={apps} labels={labels} responsive="popover" open />);
    expect(panel()).toHaveAttribute("data-side", "bottom");
    expect(panel()).toHaveAttribute("data-align", "end");
  });

  it("a rail opens BESIDE itself, aligned to the trigger start", () => {
    // A rail is vertical, so its panel goes beside it — dropping it downward would lay the grid
    // over the host application's own sidebar.
    renderWithUi(
      <AppLauncher apps={apps} labels={labels} appearance="icon" responsive="popover" open />,
    );
    expect(panel()).toHaveAttribute("data-side", "right");
    expect(panel()).toHaveAttribute("data-align", "start");
  });

  it.each(["left", "right", "top", "bottom"] as const)(
    'side="%s" overrides the appearance-derived default',
    (side) => {
      renderWithUi(
        <AppLauncher apps={apps} labels={labels} side={side} responsive="popover" open />,
      );
      expect(panel()).toHaveAttribute("data-side", side);
    },
  );

  it.each(["center", "start", "end"] as const)(
    'align="%s" overrides the appearance-derived default',
    (align) => {
      renderWithUi(
        <AppLauncher apps={apps} labels={labels} align={align} responsive="popover" open />,
      );
      expect(panel()).toHaveAttribute("data-align", align);
    },
  );

  it("a stated side survives appearance changing under it", () => {
    // The two axes are independent: re-docking the launcher must not silently move a placement the
    // consumer chose explicitly.
    const { unmount } = renderWithUi(
      <AppLauncher
        apps={apps}
        labels={labels}
        appearance="icon"
        side="top"
        responsive="popover"
        open
      />,
    );
    expect(panel()).toHaveAttribute("data-side", "top");
    unmount();

    renderWithUi(
      <AppLauncher
        apps={apps}
        labels={labels}
        appearance="bar"
        side="top"
        responsive="popover"
        open
      />,
    );
    expect(panel()).toHaveAttribute("data-side", "top");
  });
});

import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { AppLauncher } from "../app-launcher";

/**
 * The launcher is no longer bar-only: the Dock puts it in a nav RAIL, where a `TopbarItem` has no
 * band height to stretch to and its full-bleed hover reads as a broken cell. Same split, same
 * words, as `AppSettingToggle`'s `appearance`.
 */

const labels = { trigger: "アプリ", title: "アプリ", empty: "なし", loading: "読み込み中" };
const apps = [{ id: "console", name: "コンソール", href: "/" }];

describe("AppLauncher appearance", () => {
  it('defaults to the bar cell, so every shipped topbar is unchanged', () => {
    renderWithUi(<AppLauncher apps={apps} labels={labels} />);
    const trigger = screen.getByRole("button", { name: "アプリ" });
    expect(trigger).toHaveClass("ui-topbar-item");
    expect(trigger).toHaveClass("ui-app-launcher-trigger");
  });

  it('renders a square ghost control for chrome that is not a bar', () => {
    renderWithUi(<AppLauncher apps={apps} labels={labels} appearance="icon" />);
    const trigger = screen.getByRole("button", { name: "アプリ" });
    expect(trigger).toHaveClass("ui-button");
    expect(trigger.className).not.toMatch(/\bui-topbar-item\b/);
    expect(trigger).toHaveClass("ui-app-launcher-trigger");
  });

  it("keeps the consumer's own hooks on the trigger in both boxes (data attrs, id)", () => {
    // A control an end-to-end test cannot address is one consumers replace with a hand-rolled
    // menu they CAN address — the regression this component's own comment records.
    const { unmount } = renderWithUi(
      <AppLauncher apps={apps} labels={labels} id="launcher" data-test="launcher" />,
    );
    expect(screen.getByRole("button", { name: "アプリ" })).toHaveAttribute("data-test", "launcher");
    unmount();

    renderWithUi(
      <AppLauncher apps={apps} labels={labels} appearance="icon" id="launcher" data-test="launcher" />,
    );
    expect(screen.getByRole("button", { name: "アプリ" })).toHaveAttribute("data-test", "launcher");
  });
});

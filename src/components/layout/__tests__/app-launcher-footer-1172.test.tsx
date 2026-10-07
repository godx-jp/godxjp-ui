/**
 * gh#1172 — AppLauncher `footer`: the secondary-link row under the grid ("Request access", "All
 * apps") that Google Workspace / Okta / My Apps draw, instead of a fake one-tile group.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { renderWithUi, screen, userEvent } from "@/test/render";
import { AppLauncher } from "../app-launcher";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");

const apps = [
  { id: "console", name: "Console", href: "/console" },
  { id: "billing", name: "Billing", href: "/billing" },
] as const;

const labels = {
  trigger: "Acme apps",
  title: "Switch app",
  empty: "No apps available",
  loading: "Loading apps",
  retry: "Retry",
  externalHint: "(opens in a new tab)",
};

const footer = (
  <>
    <a href="/my-access">Request access</a>
    <a href="/apps">All apps</a>
  </>
);

const footerOf = (root: ParentNode = document) =>
  root.querySelector('[data-slot="app-launcher-footer"]');

describe("AppLauncher footer (gh#1172)", () => {
  it("renders no footer node when the prop is absent", async () => {
    renderWithUi(<AppLauncher apps={apps} labels={labels} responsive="popover" open />);
    await screen.findByRole("link", { name: "Console" });
    expect(footerOf()).toBeNull();
  });

  it("puts the links under the grid, outside the scrolling panel, in the same surface", async () => {
    renderWithUi(
      <AppLauncher apps={apps} labels={labels} responsive="popover" open footer={footer} />,
    );
    const dialog = await screen.findByRole("dialog", { name: "Switch app" });
    const row = footerOf(dialog);
    expect(row).not.toBeNull();
    const panel = dialog.querySelector(".ui-app-launcher-panel")!;
    // A sibling AFTER the panel — never inside the scroll box, never a tile in the grid.
    expect(panel.contains(row)).toBe(false);
    expect(panel.compareDocumentPosition(row!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(row!.closest("li")).toBeNull();
    expect(screen.getByRole("link", { name: "Request access" })).toHaveAttribute(
      "href",
      "/my-access",
    );
  });

  it("follows the tiles in focus order", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <AppLauncher apps={apps} labels={labels} responsive="popover" open footer={footer} />,
    );
    await screen.findByRole("link", { name: "Console" });
    const order = ["Console", "Billing", "Request access", "All apps"];
    screen.getByRole("link", { name: "Console" }).focus();
    for (const name of order.slice(1)) {
      await user.tab();
      expect(screen.getByRole("link", { name })).toHaveFocus();
    }
  });

  it("stays available in the empty, loading and error states", async () => {
    const { rerender } = renderWithUi(
      <AppLauncher apps={[]} labels={labels} responsive="popover" open footer={footer} />,
    );
    await screen.findByText("No apps available");
    expect(screen.getByRole("link", { name: "Request access" })).toBeInTheDocument();

    rerender(
      <AppLauncher apps={apps} labels={labels} responsive="popover" open loading footer={footer} />,
    );
    expect(screen.getByRole("link", { name: "Request access" })).toBeInTheDocument();

    rerender(
      <AppLauncher
        apps={apps}
        labels={labels}
        responsive="popover"
        open
        error="Could not load"
        footer={footer}
      />,
    );
    expect(screen.getByRole("link", { name: "Request access" })).toBeInTheDocument();
  });

  it("draws the row from tokens, on logical axes", () => {
    const css = read("../../../styles/shell-layout.css");
    const rule = /\.ui-app-launcher-footer \{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(rule).toMatch(/gap:\s*var\(--app-launcher-footer-gap\)/);
    expect(rule).toMatch(/border-block-start:/);
    expect(rule).toMatch(/font-size:\s*var\(--app-launcher-footer-font-size\)/);
    expect(rule).not.toMatch(/\b(?:top|bottom|left|right)\b|margin-top|padding-top/);
    const tokens = read("../../../tokens/components/shell.css");
    for (const token of [
      "--app-launcher-footer-space-block",
      "--app-launcher-footer-gap",
      "--app-launcher-footer-font-size",
    ]) {
      expect(tokens).toContain(`${token}:`);
    }
  });
});

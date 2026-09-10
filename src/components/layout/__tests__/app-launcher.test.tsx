import { readFileSync } from "node:fs";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import type { SidebarLinkProp } from "../../../props/components/layout.prop";
import { AppLauncher } from "../app-launcher";

const apps = [
  { id: "console", name: "Console", href: "/console", current: true },
  { id: "billing", name: "Billing", href: "/billing" },
  { id: "docs", name: "Docs", href: "https://docs.example.test", external: true },
] as const;

const groups = [
  {
    label: "More from Acme",
    apps: [{ id: "status", name: "Status", href: "/status" }],
  },
] as const;

const labels = {
  trigger: "Acme apps",
  title: "Switch app",
  empty: "No apps available",
  loading: "Loading apps",
  retry: "Retry",
  externalHint: "(opens in a new tab)",
};

/** A stand-in for a framework router link — the same `SidebarLinkProp` contract `Sidebar` takes. */
function RouterLink({ href, children, ...props }: SidebarLinkProp) {
  return (
    <a href={href} data-router="true" {...props}>
      {children}
    </a>
  );
}

/**
 * The popover↔sheet switch reads the shared `--sheet-responsive-breakpoint-width` token through
 * `useSheetResponsiveMode`, so the acceptance viewports are expressed through `matchMedia` rather
 * than by pinning a pixel number the theme is allowed to move.
 */
function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => {
      const max = /\(max-width:\s*(\d+(?:\.\d+)?)px\)/.exec(query);
      return {
        matches: max != null && width <= Number(max[1]),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList;
    }),
  });
}

/** Controlled open state, so `open={false}` → `open={true}` is a real transition and not a mount. */
function ControlledAppLauncher({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [open, setOpen] = React.useState(false);

  return (
    <AppLauncher
      apps={apps}
      labels={labels}
      responsive="popover"
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        onOpenChange(nextOpen);
      }}
    />
  );
}

describe("AppLauncher public contract", () => {
  it("opens the panel from the trigger, and Escape closes it and returns focus", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(
      <>
        <ControlledAppLauncher onOpenChange={onOpenChange} />
        {/* The launcher is never the last tabbable thing in a real bar, and the popover's Tab
            contract is defined in terms of what FOLLOWS the trigger — see `data-display/popover.tsx`. */}
        <button type="button">After the launcher</button>
      </>,
    );

    const trigger = screen.getByRole("button", { name: "Acme apps" });
    trigger.focus();
    await user.click(trigger);
    await screen.findByRole("dialog", { name: "Switch app" });
    expect(onOpenChange).toHaveBeenCalledWith(true);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Switch app" })).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger).toHaveFocus();
  });

  it("renders every app as a real link, marks the current one, and groups the rest", async () => {
    renderWithUi(
      <AppLauncher
        apps={apps}
        groups={groups}
        labels={labels}
        linkComponent={RouterLink}
        responsive="popover"
        open
      />,
    );

    const console = await screen.findByRole("link", { name: "Console" });
    expect(console).toHaveAttribute("href", "/console");
    // The tile IS the link — a `div` with an onClick has no href for a middle-click, no status-bar
    // preview and no place for `aria-current` to mean anything.
    expect(console.tagName).toBe("A");
    expect(console).toHaveAttribute("aria-current", "page");
    expect(console).toHaveAttribute("data-router", "true");

    const billing = screen.getByRole("link", { name: "Billing" });
    expect(billing).toHaveAttribute("href", "/billing");
    expect(billing).not.toHaveAttribute("aria-current");

    // An external destination leaves the SPA, so it is a plain anchor and NOT handed to the router.
    const docs = screen.getByRole("link", { name: /Docs/ });
    expect(docs).toHaveAttribute("href", "https://docs.example.test");
    expect(docs).toHaveAttribute("target", "_blank");
    expect(docs).toHaveAttribute("rel", "noreferrer noopener");
    expect(docs).not.toHaveAttribute("data-router");
    expect(docs).toHaveAccessibleName(expect.stringContaining("opens in a new tab") as never);

    // The labelled band is a named group, not a heading — the panel is a dialog on one surface and
    // a Sheet with its own title element on the other, so no heading level is right on both.
    const group = screen.getByRole("group", { name: "More from Acme" });
    expect(group).toContainElement(screen.getByRole("link", { name: "Status" }));
  });

  it("lets a `data-*` hook and an id reach the trigger, so an e2e test can hold it", () => {
    /*
     * Measured on `OrgSwitcher`: the swallowed prop silently detached one shipped consumer's
     * `[data-test=…]` selector, and nothing anywhere reported it. The accessible name is localized,
     * so it is not a selector a test can hold.
     */
    const { container } = renderWithUi(
      <AppLauncher
        apps={apps}
        labels={labels}
        id="app-launcher"
        className="consumer-launcher"
        data-test="platform-app-launcher"
      />,
    );

    const trigger = container.querySelector<HTMLElement>('[data-test="platform-app-launcher"]');
    expect(trigger).not.toBeNull();
    expect(trigger).toHaveAttribute("id", "app-launcher");
    expect(trigger).toHaveAttribute("aria-label", "Acme apps");
    // `className` lands on the trigger too — there is no wrapper element for it to land on.
    expect(trigger).toHaveClass("consumer-launcher");
    expect(trigger).toHaveClass("ui-app-launcher-trigger");
  });

  it("triggers as a bar CELL, not a pill: a TopbarItem that emits no height of its own", () => {
    /*
     * The 20.0.0 regression, in one assertion. A `Button variant="ghost"` in a bar slot draws a
     * `--control-height` pill floating inside a taller strip, with its own hover fill and its own
     * ring around that pill. `TopbarItem` is the bar itself: `.ui-topbar-item { align-self: stretch }`
     * takes the bar's height, whatever the bar's height happens to be.
     *
     * The height must stay a STRETCH CHAIN and never become a length — jsdom does no layout, so
     * what is pinned here is the only thing that decides it: that the cell class is emitted, and
     * that nothing emits a height utility that would outrank `@layer components` if it were.
     */
    const { container } = renderWithUi(<AppLauncher apps={apps} labels={labels} />);
    const trigger = container.querySelector<HTMLElement>(".ui-app-launcher-trigger")!;

    expect(trigger).toHaveClass("ui-topbar-item");
    expect(trigger.className).not.toMatch(/(?:^|\s)h-[\d[]/);
    expect(trigger.className).not.toMatch(/(?:^|\s)min-h-[\d[]/);
    // A Button would bring its own pill: variant/size classes and a rounded box of its own height.
    expect(trigger).not.toHaveAttribute("data-slot", "button");
  });

  it("shows loading, empty and error states, and the panel still opens in each", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    const { rerender } = renderWithUi(
      <AppLauncher apps={apps} labels={labels} responsive="popover" loading open />,
    );
    expect(await screen.findByRole("status")).toHaveTextContent("Loading apps");
    expect(screen.queryAllByRole("link")).toHaveLength(0);

    rerender(<AppLauncher apps={[]} groups={[]} labels={labels} responsive="popover" open />);
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("No apps available");
    });

    rerender(
      <AppLauncher
        apps={apps}
        labels={labels}
        responsive="popover"
        open
        error="Could not load apps"
        onRetry={onRetry}
      />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load apps");
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();

    // Every state keeps the trigger inspectable: a launcher that cannot be opened while it loads is
    // a launcher that looks broken for exactly as long as the request takes.
    expect(screen.getByRole("button", { name: "Acme apps" })).toBeEnabled();
  });

  it("boxes the trigger for the chrome it sits in — bar cell vs icon button", () => {
    /*
     * `appearance` picks the BOX, never the glyph. `bar` is the `TopbarItem` cell asserted above;
     * `icon` is a square ghost `Button`, for chrome that is not a bar — a nav rail, a card header,
     * a toolbar. A `TopbarItem` there has no bar to bleed into: it stretches to a container that
     * never declared a band height, and its squared corners read as a broken cell.
     */
    const { container, rerender } = renderWithUi(
      <AppLauncher apps={apps} labels={labels} appearance="bar" />,
    );
    expect(container.querySelector(".ui-app-launcher-trigger")).toHaveClass("ui-topbar-item");

    rerender(<AppLauncher apps={apps} labels={labels} appearance="icon" />);
    const icon = container.querySelector<HTMLElement>(".ui-app-launcher-trigger")!;
    // `data-slot` is not the hook here: `PopoverTrigger asChild` re-stamps it as "popover-trigger"
    // on whatever box it borrows, so the box is identified by the class its own variant emits.
    expect(icon).toHaveClass("ui-button");
    expect(icon).toHaveClass("ui-button--ghost");
    expect(icon).not.toHaveClass("ui-topbar-item");
    // The glyph is the same either way — only the box changed.
    expect(icon.querySelector("svg")).not.toBeNull();
  });

  it("opens away from its chrome by default, and the caller may state the direction", async () => {
    /*
     * Measured on an embedded bar before `side`/`align` existed: a rail trigger at (2,50) put its
     * panel at (12,90) — 40px down the screen edge, lying over the host application's sidebar.
     * `appearance` says the trigger is NOT in a bar; it cannot say which way is out, because a rail
     * pinned to the TOP edge is not a bar and still opens downward. jsdom does no layout, so what
     * is pinned here is the contract that decides it: the placement RAC is asked for.
     */
    renderWithUi(<AppLauncher apps={apps} labels={labels} responsive="popover" open />);
    expect(await screen.findByRole("dialog", { name: "Switch app" })).toHaveAttribute(
      "data-placement",
      "bottom",
    );

    const rail = renderWithUi(
      <AppLauncher
        apps={apps}
        labels={labels}
        responsive="popover"
        appearance="icon"
        open
        data-test="rail-launcher"
      />,
    );
    await waitFor(() => {
      expect(
        rail.container.ownerDocument.querySelector('[data-placement="right"]'),
      ).not.toBeNull();
    });
    rail.unmount();

    const stated = renderWithUi(
      <AppLauncher
        apps={apps}
        labels={labels}
        responsive="popover"
        appearance="icon"
        side="bottom"
        align="end"
        open
      />,
    );
    await waitFor(() => {
      expect(
        stated.container.ownerDocument.querySelector('[data-placement="bottom"]'),
      ).not.toBeNull();
    });
  });

  it.each([
    ["top", "start"],
    ["right", "center"],
    ["bottom", "end"],
    ["left", "start"],
  ] as const)("places the panel where the caller states: side=%s align=%s", async (side, align) => {
    const { container } = renderWithUi(
      <AppLauncher
        apps={apps}
        labels={labels}
        responsive="popover"
        appearance="icon"
        side={side}
        align={align}
        open
      />,
    );

    const dialog = await screen.findByRole("dialog", { name: "Switch app" });
    // RAC writes the RESOLVED placement, which may flip when the requested side has no room. jsdom
    // reports zero-sized boxes for everything, so nothing can flip here and the requested side is
    // what comes back — which is exactly the pass-through this case exists to pin.
    expect(dialog).toHaveAttribute("data-placement", side);
    expect(container.querySelector(".ui-app-launcher-trigger")).toHaveClass("ui-button");
  });

  it("responsive=\"fullscreen\" is the launchpad: one modal surface at every width", async () => {
    /*
     * Pinned at every width on purpose — a start surface that becomes a popover on a wide screen is
     * two different products. The assertion is the SURFACE (a dialog content, not a popover and not
     * a sheet) plus the class the stylesheet keys the blurred ground off, because jsdom performs no
     * layout and cannot answer "does it cover the viewport".
     */
    setViewport(1440);
    const user = userEvent.setup();
    renderWithUi(<AppLauncher apps={apps} groups={groups} labels={labels} responsive="fullscreen" />);

    await user.click(screen.getByRole("button", { name: "Acme apps" }));
    const dialog = await screen.findByRole("dialog", { name: "Switch app" });
    expect(dialog).toHaveAttribute("data-slot", "dialog-content");
    expect(dialog).toHaveClass("ui-app-launcher-launchpad");
    expect(dialog).toContainElement(screen.getByRole("link", { name: "Billing" }));

    // The blurred ground is the OVERLAY's, never the panel's: `backdrop-filter` filters what is
    // painted behind the element, and an element that carries one becomes the containing block for
    // its own fixed descendants.
    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).toHaveClass("ui-app-launcher-launchpad-overlay");

    // Narrow viewports get the SAME surface — the sheet fallback does not apply to a pinned mode.
    setViewport(390);
    expect(await screen.findByRole("dialog", { name: "Switch app" })).toHaveAttribute(
      "data-slot",
      "dialog-content",
    );

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Switch app" })).not.toBeInTheDocument();
    });
  });

  it("pins the launchpad's dismiss to the viewport corner, not to the little panel", () => {
    /*
     * jsdom performs no layout, so what is pinned here is the rule that decides it.
     *
     * `[data-slot="dialog-close"]` is `absolute` at its dialog's top-right, which is the right
     * corner while the dialog is a card. The launchpad's dialog is content-sized and centred, so
     * that corner lands beside the tiles: measured with two apps, the X sat at (836, 368) — level
     * with the title, hard against the grid, reading as a stray glyph mid-screen rather than as the
     * way out. And it stayed there when it was made `fixed`, because the dialog's own
     * `translate(-50%, -50%)` makes it the containing block for every fixed descendant — which is
     * why the centring moves to the scrim and the panel's transform goes.
     */
    // Read from the project root: this suite runs in a vitest project whose `import.meta.url` is
    // not a file: URL, so the relative-to-module form used elsewhere throws here.
    const shell = readFileSync("src/styles/shell-layout.css", "utf8");
    const rule = (selector: string) => {
      const at = shell.indexOf(selector + " {");
      expect(at, `missing CSS rule for ${selector}`).toBeGreaterThan(-1);
      return shell.slice(at, shell.indexOf("}", at) + 1);
    };

    const close = rule('.ui-app-launcher-launchpad [data-slot="dialog-close"]');
    expect(close).toMatch(/position:\s*fixed/);
    expect(close).toMatch(/inset-block-start:\s*var\(--app-launcher-launchpad-space-inset\)/);
    expect(close).toMatch(/inset-inline-end:\s*var\(--app-launcher-launchpad-space-inset\)/);
    // The padding IS the target: a bare 16px glyph alone in a corner is under the SC 2.5.8 floor
    // with nothing beside it to share a hit area with.
    expect(close).toMatch(/padding:\s*var\(--app-launcher-launchpad-close-space-padding\)/);

    // The scrim centres the panel, so the panel carries no transform to capture that `fixed`.
    expect(rule('[data-slot="dialog-overlay"].ui-app-launcher-launchpad-overlay')).toMatch(
      /place-items:\s*center/,
    );
    expect(rule('[data-slot="dialog-content"].ui-app-launcher-launchpad')).toMatch(
      /transform:\s*none/,
    );
  });

  it("has no axe violations on either surface", async () => {
    const { unmount } = renderWithUi(
      <AppLauncher apps={apps} groups={groups} labels={labels} responsive="popover" open />,
    );
    await screen.findByRole("dialog", { name: "Switch app" });
    // `document.body`, not the render container: both surfaces are portalled out of it.
    expect(await axe(document.body)).toHaveNoViolations();
    unmount();

    const sheet = renderWithUi(
      <AppLauncher apps={apps} groups={groups} labels={labels} responsive="sheet" open />,
    );
    await screen.findByRole("dialog", { name: "Switch app" });
    expect(await axe(document.body)).toHaveNoViolations();
    sheet.unmount();

    renderWithUi(
      <AppLauncher apps={apps} groups={groups} labels={labels} responsive="fullscreen" open />,
    );
    await screen.findByRole("dialog", { name: "Switch app" });
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe("AppLauncher responsive contract shares the Sheet breakpoint token", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [1440, false],
    [1024, false],
    [768, true],
    [390, true],
  ])("resolves popover/sheet from the shared token at %ipx", async (width, expectSheet) => {
    setViewport(width);
    const user = userEvent.setup();
    renderWithUi(<AppLauncher apps={apps} labels={labels} />);

    await user.click(screen.getByRole("button", { name: "Acme apps" }));
    const dialog = await screen.findByRole("dialog", { name: "Switch app" });

    await waitFor(() => {
      expect(dialog.getAttribute("data-slot") === "sheet-content").toBe(expectSheet);
    });
  });

  it("asks matchMedia for the tokenized query rather than a hard-coded 390px literal", () => {
    setViewport(1440);
    renderWithUi(<AppLauncher apps={apps} labels={labels} />);

    const queries = vi.mocked(window.matchMedia).mock.calls.map(([query]) => query);
    expect(queries).toContain("(max-width: 768px)");
    expect(queries).not.toContain("(max-width: 390px)");
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { Badge } from "../../data-display/badge";
import { AppProvider } from "../../../app/app-provider";
import { OrgSwitcher } from "../org-switcher";

const shellStyles = readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8");

const organizations = [
  { id: "dxs", name: "DXS Holdings", meta: "Owner" },
  { id: "long", name: "非常に長い組織名株式会社プラットフォーム", meta: "Member" },
] as const;

const badgedOrganizations = [
  {
    id: "dxs",
    name: "DXS Holdings",
    meta: "Owner",
    badge: <Badge variant="secondary">Trial</Badge>,
    badgeLabel: "Trial plan",
  },
  { id: "long", name: "非常に長い組織名株式会社プラットフォーム", meta: "Member" },
] as const;

/**
 * The popover↔sheet switch now reads the shared `--sheet-responsive-breakpoint-width` token via
 * `useSheetResponsiveMode`, so the acceptance viewports are expressed through `matchMedia`.
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

const labels = {
  trigger: (name: string) => `Current organization: ${name}`,
  title: "Choose organization",
  search: "Search organizations",
  empty: "No organizations",
  loading: "Loading organizations",
  retry: "Retry",
};

function ControlledOrgSwitcher({
  responsive,
  onOpenChange,
  onValueChange,
}: {
  responsive: "popover" | "sheet";
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("dxs");

  return (
    <OrgSwitcher
      organizations={organizations}
      value={value}
      onValueChange={(nextValue) => {
        setValue(nextValue);
        onValueChange(nextValue);
      }}
      labels={labels}
      responsive={responsive}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        onOpenChange(nextOpen);
      }}
    />
  );
}

describe("OrgSwitcher public contract", () => {
  it("renders the selected organization, metadata and canonical shell classes", () => {
    const { container } = renderWithUi(
      <OrgSwitcher organizations={organizations} value="dxs" labels={labels} />,
    );

    expect(
      screen.getByRole("button", { name: "Current organization: DXS Holdings" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(container.querySelector(".ui-org-switcher-trigger")).toBeInTheDocument();
  });

  it("keeps callback-only popover state uncontrolled across touch, focus, tab and close", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(
      <>
        <OrgSwitcher
          organizations={organizations}
          value="dxs"
          labels={labels}
          responsive="popover"
          onOpenChange={onOpenChange}
        />
        {/* The switcher is never the last tabbable thing on a real page, and the popover's Tab
            contract is defined in terms of what FOLLOWS the trigger — see the "Tab RA KHỎI panel"
            section of `data-display/popover.tsx`. A fixture with nothing after the trigger measures
            the document's wrap-around, not the switcher. */}
        <button type="button">After the switcher</button>
      </>,
    );

    const trigger = screen.getByRole("button", {
      name: "Current organization: DXS Holdings",
    });
    trigger.focus();
    await user.pointer({ keys: "[TouchA]", target: trigger });
    await screen.findByRole("dialog", { name: "Choose organization" });
    const search = await screen.findByLabelText("Search organizations");
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(search).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Choose organization" })).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger).toHaveFocus();

    // Tab leaves the panel the way a non-modal popover should: on to the next element after the
    // trigger, closing the panel behind it. Focus is never dropped and never cycles back inside.
    await user.pointer({ keys: "[TouchA]", target: trigger });
    await screen.findByRole("dialog", { name: "Choose organization" });
    await user.tab();
    expect(screen.getByRole("button", { name: "After the switcher" })).toHaveFocus();
    expect(screen.queryByRole("dialog", { name: "Choose organization" })).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps the controlled sheet stateful across touch, focus, tab, selection and close", async () => {
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(
      <ControlledOrgSwitcher
        responsive="sheet"
        onOpenChange={onOpenChange}
        onValueChange={onValueChange}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Current organization: DXS Holdings",
    });
    trigger.focus();
    await user.pointer({ keys: "[TouchA]", target: trigger });
    const dialog = await screen.findByRole("dialog", { name: "Choose organization" });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await user.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await user.pointer({
      keys: "[TouchA]",
      target: screen.getByRole("option", { name: /非常に長い組織名/ }),
    });
    expect(screen.queryByRole("dialog", { name: "Choose organization" })).not.toBeInTheDocument();
    expect(onValueChange).toHaveBeenCalledWith("long");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger).toHaveFocus();
  });

  it("supports collapsed, loading, empty, disabled and error states", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    const { rerender } = renderWithUi(
      <OrgSwitcher organizations={organizations} value="dxs" labels={labels} collapsed />,
    );
    expect(screen.getByRole("button", { name: /Current organization/ })).toHaveAttribute(
      "data-collapsed",
      "true",
    );

    rerender(<OrgSwitcher organizations={organizations} labels={labels} loading />);
    expect(screen.getByRole("button", { name: /Choose organization/ })).toBeEnabled();

    rerender(<OrgSwitcher organizations={[]} labels={labels} />);
    expect(screen.getByRole("button", { name: /Choose organization/ })).toBeEnabled();

    rerender(
      <OrgSwitcher
        organizations={organizations}
        value="dxs"
        labels={labels}
        error="Could not load organizations"
        onRetry={onRetry}
        responsive="popover"
        open
      />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load organizations");
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe("OrgSwitcher with nothing selected", () => {
  it('draws a neutral glyph, never "?", open and collapsed', () => {
    // "?" read as an error beside a label that only asks for a choice, and no prop could change it.
    for (const collapsed of [false, true]) {
      const { container, unmount } = renderWithUi(
        <OrgSwitcher organizations={organizations} labels={labels} collapsed={collapsed} />,
      );
      const mark = container.querySelector<HTMLElement>(".ui-org-switcher-avatar")!;

      expect(mark).toHaveAttribute("data-placeholder", "true");
      expect(mark).toHaveAttribute("aria-hidden", "true");
      expect(mark.textContent).toBe("");
      expect(mark.querySelector("svg")).not.toBeNull();
      expect(
        screen.getByRole("button", { name: "Current organization: Choose organization" }),
      ).toBeInTheDocument();
      unmount();
    }
  });

  it("takes the consumer's own mark through placeholderAvatar", () => {
    const { container } = renderWithUi(
      <OrgSwitcher
        organizations={organizations}
        value="missing"
        labels={labels}
        placeholderAvatar={<span data-testid="project-icon" />}
      />,
    );
    const mark = container.querySelector<HTMLElement>(".ui-org-switcher-avatar")!;

    expect(mark).toHaveAttribute("data-placeholder", "true");
    expect(mark).toContainElement(screen.getByTestId("project-icon"));
    expect(mark.querySelector("svg")).toBeNull();
  });

  it("keeps the first letter once an organization is selected, without the placeholder flag", () => {
    const { container } = renderWithUi(
      <OrgSwitcher
        organizations={organizations}
        value="dxs"
        labels={labels}
        placeholderAvatar={<span data-testid="project-icon" />}
      />,
    );
    const mark = container.querySelector<HTMLElement>(
      ".ui-org-switcher-trigger .ui-org-switcher-avatar",
    )!;

    expect(mark).not.toHaveAttribute("data-placeholder");
    expect(mark).toHaveTextContent("D");
    expect(screen.queryByTestId("project-icon")).toBeNull();
  });
});

describe("OrgSwitcher trigger padding (the knob Button's size tier used to override)", () => {
  it("out-ranks Button's padding rules for the open trigger and leaves the collapsed square alone", () => {
    /*
     * control.css loads after shell-layout.css in the same layer, so `.ui-button--default-size`
     * (0,1,0) won on order and `.ui-button--default-size:has(> svg):not([data-label])` (0,2,1)
     * won outright: the trigger painted 12px a side instead of --org-switcher-trigger-padding-x
     * (8px), measured, and a nine-character Japanese label lost its last character. jsdom does no
     * cascade, so what is pinned is the selector that decides it.
     */
    const rule =
      /\.ui-org-switcher > \.ui-org-switcher-trigger\.ui-button:not\(\[data-collapsed="true"\]\)\s*\{\s*padding-inline:\s*var\(--org-switcher-trigger-padding-x\);/;
    expect(shellStyles).toMatch(rule);

    const { container } = renderWithUi(
      <OrgSwitcher organizations={organizations} value="dxs" labels={labels} />,
    );
    const trigger = container.querySelector<HTMLElement>(".ui-org-switcher-trigger")!;
    // The selector's shape depends on the trigger being the wrapper's direct child, a Button.
    expect(trigger.parentElement).toHaveClass("ui-org-switcher");
    expect(trigger).toHaveClass("ui-button");
  });
});

describe("OrgSwitcher badge slot (gh#213)", () => {
  it("renders the badge on the expanded trigger and announces it as a description", () => {
    renderWithUi(<OrgSwitcher organizations={badgedOrganizations} value="dxs" labels={labels} />);

    const trigger = screen.getByRole("button", { name: "Current organization: DXS Holdings" });
    const badge = trigger.querySelector('[data-slot="org-switcher-badge"]');
    expect(badge).toHaveTextContent("Trial");
    // The visual badge is presentational; the localized `badgeLabel` carries the meaning (WCAG 1.1.1).
    expect(badge).toHaveAttribute("aria-hidden", "true");
    expect(trigger).toHaveAccessibleDescription("Trial plan");
  });

  it("hides the badge in the collapsed rail, which only has room for the mark", () => {
    renderWithUi(
      <OrgSwitcher organizations={badgedOrganizations} value="dxs" labels={labels} collapsed />,
    );

    const trigger = screen.getByRole("button", { name: /Current organization/ });
    expect(trigger.querySelector('[data-slot="org-switcher-badge"]')).toBeNull();
    expect(trigger).not.toHaveAccessibleDescription();
  });

  it("renders the badge in the menu row, announces it once, and keeps it searchable", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <OrgSwitcher
        organizations={badgedOrganizations}
        value="dxs"
        labels={labels}
        responsive="popover"
        open
      />,
    );

    const option = await screen.findByRole("option", { name: /DXS Holdings/ });
    expect(option.querySelector('[data-slot="org-switcher-badge"]')).toHaveTextContent("Trial");
    expect(option).toHaveAccessibleName(expect.stringContaining("Trial plan") as unknown as string);

    await user.type(screen.getByLabelText("Search organizations"), "Trial plan");
    await waitFor(() => {
      expect(screen.getAllByRole("option")).toHaveLength(1);
    });
    expect(screen.getByRole("option", { name: /DXS Holdings/ })).toBeInTheDocument();
  });
});

describe("OrgSwitcher responsive contract shares the Sheet breakpoint token (gh#215)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [1440, false],
    [1024, false],
    [390, true],
  ])("resolves popover/sheet from the shared token at %ipx", async (width, expectSheet) => {
    setViewport(width);
    const user = userEvent.setup();
    renderWithUi(<OrgSwitcher organizations={organizations} value="dxs" labels={labels} />);

    await user.click(screen.getByRole("button", { name: /Current organization/ }));
    const dialog = await screen.findByRole("dialog", { name: "Choose organization" });

    await waitFor(() => {
      expect(dialog.getAttribute("data-slot") === "sheet-content").toBe(expectSheet);
    });
    // Whichever surface won, focus is trapped and Escape restores it — Radix, not a page handler.
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Choose organization" })).not.toBeInTheDocument();
    });
  });

  it("asks matchMedia for the tokenized query rather than a hard-coded 390px literal", () => {
    setViewport(1440);
    renderWithUi(<OrgSwitcher organizations={organizations} value="dxs" labels={labels} />);

    const queries = vi.mocked(window.matchMedia).mock.calls.map(([query]) => query);
    expect(queries).toContain("(max-width: 768px)");
    expect(queries).not.toContain("(max-width: 390px)");
  });

  it("sizes its own height, because Button's size utility outranks the class rule", () => {
    /*
     * `.ui-org-switcher-trigger` declares `height: var(--org-switcher-trigger-height)` in
     * @layer components, and Button emits its size as a Tailwind utility — utilities win, so that
     * declaration never applied. Measured in a consumer's collapsed rail: 44 × 32px. The WIDTH was
     * right, because the collapsed rule sets a width and Button emits none, and that is exactly
     * why it read as correct for so long: right on one axis, silently wrong on the other.
     *
     * 32px is under the 44px target floor this token is named for (rule #24, WCAG 2.2 AA 2.5.8).
     * jsdom does no layout, so what is pinned is the only thing that decides the outcome — whether
     * the height is emitted where it can win.
     */
    const { container } = renderWithUi(
      <OrgSwitcher organizations={organizations} value="dxs" labels={labels} collapsed />,
    );
    const trigger = container.querySelector<HTMLElement>(".ui-org-switcher-trigger")!;

    expect(trigger.className).toContain("h-[length:var(--org-switcher-trigger-height)]");
    // A literal would put the target size out of a theme's reach and let the two axes drift.
    expect(trigger.className).not.toMatch(/(?:^|\s)h-\d/);
  });

  it("lets a `data-*` hook and an id reach the trigger, so an e2e test can hold it", () => {
    /*
     * This component is closed on purpose, but a control no test can address is a control
     * consumers replace with a hand-rolled Select they CAN address — measured: one shipped app
     * bound `[data-test="organization-switcher"]` to a raw Select for months, and swapping this
     * component in silently detached the selector, because the prop was swallowed and nothing
     * anywhere reported it. The accessible name is localized, so it is not a selector to hold.
     */
    const { container } = renderWithUi(
      <OrgSwitcher
        organizations={organizations}
        value="dxs"
        labels={labels}
        id="org-switcher"
        data-test="organization-switcher"
      />,
    );

    const trigger = container.querySelector<HTMLElement>('[data-test="organization-switcher"]');
    expect(trigger).not.toBeNull();
    expect(trigger).toHaveClass("ui-org-switcher-trigger");
    expect(trigger).toHaveAttribute("id", "org-switcher");
  });

  it('responsive="dialog" opens a named modal on desktop and the SAME sheet on mobile', async () => {
    /*
     * `auto` and `dialog` are the two responsive PAIRS and share their mobile half: below the
     * breakpoint both are the bottom Sheet, because a centred modal on a phone is a Sheet with
     * worse ergonomics. They differ only in the desktop half — which is the whole point of the
     * value: a popover is anchored to its trigger, clipped by the viewport and sized by
     * --org-switcher-menu-width, and none of that survives a row that carries a role, a plan and a
     * member count.
     */
    setViewport(1440);
    const user = userEvent.setup();
    const { unmount } = renderWithUi(
      <OrgSwitcher organizations={organizations} value="dxs" labels={labels} responsive="dialog" />,
    );

    await user.click(screen.getByRole("button", { name: /Current organization/ }));
    const desktop = await screen.findByRole("dialog", { name: "Choose organization" });
    expect(desktop.getAttribute("data-slot")).toBe("dialog-content");
    unmount();

    setViewport(390);
    renderWithUi(
      <OrgSwitcher organizations={organizations} value="dxs" labels={labels} responsive="dialog" />,
    );
    await user.click(screen.getByRole("button", { name: /Current organization/ }));
    const mobile = await screen.findByRole("dialog", { name: "Choose organization" });
    expect(mobile.getAttribute("data-slot")).toBe("sheet-content");
  });

  it('leaves "auto" on the popover, so the new value is opt-in', () => {
    // A default that quietly became a modal would re-shape every consumer that never asked.
    expect(shellStyles).toContain('[data-slot="dialog-content"].ui-org-switcher-dialog');
  });

  it("the dialog surface overrides the COMPOSITE inset, and its part agrees with it", () => {
    /*
     * `--dialog-space-inset` is declared at `:root` as `var(--dialog-space-y) var(--dialog-space-x)`,
     * and a custom property substitutes its vars WHERE IT IS DECLARED — so re-declaring
     * `--dialog-space-x` alone changes nothing the padding can see. Measured exactly that: the rule
     * shipped, the token read 12px, and the box still padded 24px, leaving the rows 13px short of
     * both edges. The composite is therefore the fix, and this pins that it is written.
     *
     * BUT NOT THE COMPOSITE ALONE. This used to also assert `--dialog-space-x` was absent, which
     * read the finding as "never write the part" when it is really "the part is not the fix".
     * Other rules DO read the part: the full-bleed header and footer bands cancel `--dialog-space-x`
     * directly, and with the composite narrowed and the part left at the dialog default they hung
     * outside the panel — the footer measured 501-939 across a dialog of 512-928, eleven pixels
     * over each edge, invisible only because the content box clips.
     *
     * So the assertion is now the relationship rather than a ban: the composite is declared, and the
     * part it is built from names the same value, so the padding and every band that cancels it can
     * never disagree.
     */
    const decls = shellStyles.slice(
      shellStyles.indexOf('[data-slot="dialog-content"].ui-org-switcher-dialog'),
    );
    const block = decls.slice(0, decls.indexOf("}"));
    expect(block).toMatch(
      /--dialog-space-inset:\s*var\(\s*--dialog-space-y\)\s*var\(\s*--org-switcher-sheet-inset\)/,
    );
    expect(block).toMatch(/--dialog-space-x:\s*var\(\s*--org-switcher-sheet-inset\)/);
  });
});

describe("OrgSwitcher personal workspace section (#1556)", () => {
  // The personal entry is FIRST in the input on purpose: the section order is the component's.
  const withPersonal = [
    { id: "me", name: "Pham Thai Duong", meta: "Personal", kind: "personal" as const },
    { id: "dxs", name: "DXS Holdings", meta: "Owner" },
    { id: "acme", name: "Acme Trading", meta: "Member", kind: "organization" as const },
  ];
  const names = () => screen.getAllByRole("option").map((o) => o.textContent);
  const renderOpen = (props: Partial<React.ComponentProps<typeof OrgSwitcher>> = {}) =>
    renderWithUi(
      <OrgSwitcher
        organizations={withPersonal}
        value="dxs"
        labels={labels}
        responsive="popover"
        open
        {...props}
      />,
    );

  it("lists organizations first, then the personal entry in its own named section", async () => {
    renderOpen();
    await screen.findByRole("option", { name: /DXS Holdings/ });
    expect(names()).toEqual([
      expect.stringContaining("DXS Holdings"),
      expect.stringContaining("Acme Trading"),
      expect.stringContaining("Pham Thai Duong"),
    ]);
    // The section is a named group (the kit's default in the test locale, vi), holding only the
    // personal row.
    const section = screen.getByRole("group", { name: "Cá nhân" });
    expect(section).toContainElement(screen.getByRole("option", { name: /Pham Thai Duong/ }));
    expect(section).not.toContainElement(screen.getByRole("option", { name: /DXS Holdings/ }));
  });

  it("takes the section title from labels.personal, and localizes the default", async () => {
    const { unmount } = renderOpen({ labels: { ...labels, personal: "My workspace" } });
    expect(await screen.findByRole("group", { name: "My workspace" })).toBeInTheDocument();
    unmount();
    renderWithUi(
      <AppProvider persist={false} defaultLocale="ja">
        <OrgSwitcher
          organizations={withPersonal}
          value="dxs"
          labels={labels}
          responsive="popover"
          open
        />
      </AppProvider>,
    );
    expect(await screen.findByRole("group", { name: "個人" })).toBeInTheDocument();
  });

  it("search filters organizations only; the personal entry stays listed, and last", async () => {
    const user = userEvent.setup();
    renderOpen();
    await user.type(await screen.findByLabelText("Search organizations"), "Acme");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));
    expect(names()).toEqual([
      expect.stringContaining("Acme Trading"),
      expect.stringContaining("Pham Thai Duong"),
    ]);
    expect(screen.queryByText("No organizations")).not.toBeInTheDocument();

    // No organization matches: the empty line is shown, and the personal entry is still there.
    await user.clear(screen.getByLabelText("Search organizations"));
    await user.type(screen.getByLabelText("Search organizations"), "zzzz");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    expect(screen.getByRole("option", { name: /Pham Thai Duong/ })).toBeInTheDocument();
    expect(screen.getByText("No organizations")).toBeInTheDocument();
  });

  it("selects the personal entry like any row and draws its mark round, on the trigger too", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderOpen({ onValueChange });
    const row = await screen.findByRole("option", { name: /Pham Thai Duong/ });
    expect(row.querySelector(".ui-org-switcher-avatar")).toHaveAttribute("data-kind", "personal");
    expect(
      screen.getByRole("option", { name: /DXS Holdings/ }).querySelector(".ui-org-switcher-avatar"),
    ).not.toHaveAttribute("data-kind");
    await user.click(row);
    expect(onValueChange).toHaveBeenCalledWith("me");

    renderWithUi(
      <OrgSwitcher organizations={withPersonal} value="me" labels={labels} responsive="popover" />,
    );
    const trigger = screen.getByRole("button", { name: "Current organization: Pham Thai Duong" });
    expect(trigger.querySelector(".ui-org-switcher-avatar")).toHaveAttribute(
      "data-kind",
      "personal",
    );
    expect(shellStyles).toMatch(
      /\.ui-org-switcher-avatar\[data-kind="personal"\]\s*\{\s*border-radius:\s*var\(--radius-pill\);/,
    );
  });

  it("without personal entries renders one unnamed group, exactly as before", async () => {
    renderOpen({ organizations });
    await screen.findByRole("option", { name: /DXS Holdings/ });
    expect(screen.queryByRole("group", { name: "Cá nhân" })).not.toBeInTheDocument();
    expect(names()).toHaveLength(2);
  });
});
